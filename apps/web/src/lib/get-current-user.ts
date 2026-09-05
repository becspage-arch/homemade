import 'server-only'
import { cache } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { prisma, Prisma, UserRole, type User } from '@homemade/db'
import {
  SIGNUP_ALLOWLIST_ENABLED,
  findAllowlistEntry,
  markAllowlistUsed,
  rejectNonAllowlistedSignup,
} from './signup-allowlist'
import { computeSignupRisk } from './signup-risk'
import { getClientIp, getClientUserAgent } from './client-ip'
import { checkRateLimit } from './ratelimit'

/** Update `lastSeenAt` at most once per hour per user, fire-and-forget. */
const LAST_SEEN_THROTTLE_MS = 60 * 60 * 1000

function touchLastSeen(userId: string, lastSeenAt: Date | null): void {
  const now = Date.now()
  if (lastSeenAt && now - lastSeenAt.getTime() < LAST_SEEN_THROTTLE_MS) return
  void prisma.user
    .update({ where: { id: userId }, data: { lastSeenAt: new Date(now) } })
    .catch(() => undefined)
}

/**
 * Pre-launch admin allowlist. Any email here gets ADMIN role on first sign-in.
 * Anyone else lands as MEMBER. Eventually replaced with admin-controlled role
 * assignment from the dashboard.
 */
const ADMIN_EMAILS = new Set(['rebecca@homemade.education'])

function deriveRoleFromEmail(email: string): UserRole {
  return ADMIN_EMAILS.has(email.toLowerCase()) ? UserRole.ADMIN : UserRole.MEMBER
}

/**
 * Returns the Prisma `User` row for the currently signed-in Clerk user,
 * creating it on first access (just-in-time provisioning).
 *
 * We could mirror users via a Clerk webhook instead, but JIT means the app
 * works whether or not a webhook is wired and the User row is always at most
 * one Clerk call old.
 *
 * Wrapped in React `cache()` so multiple calls within the same request
 * resolve to a single Clerk + Prisma lookup. Tutorial pages call this from
 * `SiteHeader`, `generateMetadata`, and the page render — that used to be
 * three round-trips per render.
 */
export const getCurrentDbUser = cache(async (): Promise<User | null> => {
  // Clerk's `currentUser()` throws when it can't detect clerkMiddleware on
  // the request — e.g. an RSC sub-request that skipped the matcher, or a bot
  // probe hitting a path the matcher excluded. Treat that as "no user" rather
  // than 500-ing the whole render. Still report to Sentry as a breadcrumb so
  // genuine regressions stay visible.
  let clerkUser: Awaited<ReturnType<typeof currentUser>>
  try {
    clerkUser = await currentUser()
  } catch (err) {
    Sentry.captureException(err, { level: 'warning', tags: { source: 'getCurrentDbUser' } })
    return null
  }
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return null

  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (existing) {
    touchLastSeen(existing.id, existing.lastSeenAt)
    return existing
  }

  // Pre-launch signup allowlist gate (belt-and-braces with the Clerk webhook).
  // If the webhook lagged or was never delivered, the first authenticated
  // request still gets gated here before we create the Prisma User row.
  if (SIGNUP_ALLOWLIST_ENABLED) {
    const allowlisted = await findAllowlistEntry(email)
    if (!allowlisted) {
      await rejectNonAllowlistedSignup({
        clerkUserId: clerkUser.id,
        email,
        via: 'jit',
      })
      return null
    }
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || null
  const emailLower = email.toLowerCase()

  // Signup spam signal (flag-only — never blocks the create below). This is a
  // genuine end-user request, so the IP/UA here are the real signer's, unlike
  // the Clerk webhook which fires server-to-server from Clerk's own infra.
  const risk = computeSignupRisk({ email: emailLower, name })
  const [clientIp, clientUserAgent] = await Promise.all([getClientIp(), getClientUserAgent()])
  let riskScore = risk.riskScore
  const riskReasons = [...risk.riskReasons]
  if (clientIp) {
    const burst = await checkRateLimit('signup', clientIp)
    if (!burst.allowed) {
      riskScore += 2
      riskReasons.push('signup-rate-burst')
    }
  }

  // JIT provisioning. Loading a single page fires several concurrent server
  // requests (main document + RSC prefetches); React `cache()` only dedupes
  // *within* one request, so two concurrent requests can both pass the
  // `findUnique(clerkId)` miss above and both attempt the create — the loser
  // hits the unique constraint. A row can also already exist under a *different*
  // clerkId (a Dev→Prod Clerk key switch at go-live left rows tied to old dev
  // Clerk IDs). Both surface as Prisma P2002; recover instead of 500-ing.
  try {
    const created = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: emailLower,
        name,
        role: deriveRoleFromEmail(email),
        emailDomain: risk.emailDomain,
        signupRiskScore: riskScore,
        signupRiskReasons: riskReasons,
        signupIp: clientIp,
        signupUserAgent: clientUserAgent,
        lastSeenAt: new Date(),
      },
    })
    // Only stamp the allowlist on a genuine first-time create — never on a
    // recovered/re-linked row below.
    if (SIGNUP_ALLOWLIST_ENABLED) {
      await markAllowlistUsed(email)
    }
    return created
  } catch (err) {
    if (
      !(err instanceof Prisma.PrismaClientKnownRequestError) ||
      err.code !== 'P2002'
    ) {
      throw err
    }

    // Concurrent-create race: the winning request already inserted the row for
    // this clerkId. Return it.
    const byClerkId = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    })
    if (byClerkId) return byClerkId

    // Stale-clerkId orphan: a row exists under this email but a different
    // clerkId (Dev→Prod migration). This request is authenticated by Clerk for
    // exactly this verified email, so re-link the row to the current clerkId.
    const byEmail = await prisma.user.findUnique({ where: { email: emailLower } })
    if (byEmail) {
      Sentry.captureMessage('Re-linked stale clerkId on existing user row', {
        level: 'info',
        tags: { source: 'getCurrentDbUser' },
        extra: { userId: byEmail.id },
      })
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: clerkUser.id },
      })
    }

    // P2002 on neither clerkId nor email — an unexpected constraint. Don't
    // swallow it.
    throw err
  }
})

export function isAdmin(user: { role: UserRole } | null | undefined): boolean {
  return user?.role === UserRole.ADMIN
}

/**
 * EDITOR or ADMIN — anyone who can moderate content. Used by /admin route
 * gates that should be open to editors but not regular members.
 */
export function isEditorOrAbove(user: { role: UserRole } | null | undefined): boolean {
  return user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR
}

const RANK: Record<UserRole, number> = {
  ANONYMOUS: 0,
  MEMBER: 1,
  TESTER: 2,
  CREATOR: 3,
  EDITOR: 4,
  ADMIN: 5,
}

export function hasRoleAtLeast(
  user: { role: UserRole } | null | undefined,
  minimum: UserRole,
): boolean {
  if (!user) return false
  return RANK[user.role] >= RANK[minimum]
}

/**
 * Throwing variant for server actions. Returns the user (typed as User), or
 * throws if the caller doesn't meet the minimum role. ADMIN is the default
 * minimum — explicit EDITOR opens moderation actions to editors too.
 */
export async function requireAdminRole(opts: {
  minimum: 'ADMIN' | 'EDITOR'
} = { minimum: 'ADMIN' }): Promise<User> {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Not authorised.')
  const min = opts.minimum === 'EDITOR' ? UserRole.EDITOR : UserRole.ADMIN
  if (!hasRoleAtLeast(user, min)) {
    throw new Error('Not authorised.')
  }
  return user
}
