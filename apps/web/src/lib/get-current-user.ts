import 'server-only'
import { currentUser } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { prisma, UserRole, type User } from '@homemade/db'
import {
  SIGNUP_ALLOWLIST_ENABLED,
  findAllowlistEntry,
  markAllowlistUsed,
  rejectNonAllowlistedSignup,
} from './signup-allowlist'

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
 */
export async function getCurrentDbUser(): Promise<User | null> {
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
  if (existing) return existing

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

  const created = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: email.toLowerCase(),
      name,
      role: deriveRoleFromEmail(email),
    },
  })

  if (SIGNUP_ALLOWLIST_ENABLED) {
    await markAllowlistUsed(email)
  }

  return created
}

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
