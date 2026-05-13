import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { prisma, UserRole } from '@homemade/db'
import { audit } from './audit'
import { captureServerEvent, flushPostHog } from './posthog'
import { extractEmailDomain, hashEmailForAnalytics } from './email-hash'

/**
 * Master switch for the pre-launch signup allowlist gate.
 *
 * While true, every Clerk signup whose primary email isn't in the
 * `SignupAllowlist` Prisma table is deleted via the Clerk Backend API as soon
 * as we see it (either from the `user.created` webhook or from the JIT
 * provisioning path in `getCurrentDbUser`). Belt-and-braces alongside the
 * Clerk dashboard "Restrictions → Allowlist" feature (see
 * `docs/clerk-restrictions-setup.md`).
 *
 * Launch-day flip: set to `false`, redeploy, and any email can sign up again.
 * Tracked in `project_pre_launch_checklist.md` under "Signup allowlist removal".
 */
export const SIGNUP_ALLOWLIST_ENABLED = true

export type RejectionVia = 'webhook' | 'jit'

interface AllowlistRow {
  id: string
  email: string
}

/**
 * Look up an allowlist entry by email (case-insensitive). Returns `null` if
 * the email isn't on the list. Cheap unique lookup — safe to call in hot
 * signup paths.
 */
export async function findAllowlistEntry(
  email: string,
): Promise<AllowlistRow | null> {
  return prisma.signupAllowlist.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true },
  })
}

/**
 * Stamp `lastUsedAt = now` on an allowlist row. Fire-and-forget — never
 * blocks the signup path.
 */
export async function markAllowlistUsed(email: string): Promise<void> {
  try {
    await prisma.signupAllowlist.update({
      where: { email: email.toLowerCase() },
      data: { lastUsedAt: new Date() },
    })
  } catch (err) {
    Sentry.captureException(err, {
      level: 'warning',
      tags: { source: 'signup-allowlist.markUsed' },
    })
  }
}

/**
 * Resolve a System-actor User id for audit log entries written by automatic
 * server paths that have no admin actor (webhook + JIT rejection). We pick
 * the oldest ADMIN — in practice Rebecca's account, seeded into the database
 * from day one. If somehow no admin exists yet, returns `null` and the
 * caller falls back to console + Sentry-only logging.
 */
async function findSystemActorId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  return admin?.id ?? null
}

interface RejectInput {
  clerkUserId: string
  email: string
  via: RejectionVia
  /** Clerk event id (svix-id), webhook path only. */
  eventId?: string
}

/**
 * Reject a non-allowlisted signup. Steps:
 *
 * 1. Delete the Clerk user via the Backend API so the freshly-created Clerk
 *    session is torn down. The user sees their next request bounce to
 *    sign-in with no account.
 * 2. Delete the Prisma User row if one was somehow mirrored already. The
 *    caller normally checks the allowlist *before* the upsert, so this is a
 *    no-op in the common path — but the JIT path used to create the row
 *    speculatively, and a webhook race could land a row before the check.
 * 3. Write an `auth.signup_rejected` audit log entry (attributed to the
 *    first ADMIN as the system actor; metadata flags it as system-driven).
 * 4. Fire PostHog `signup_rejected_not_allowlisted`.
 *
 * Errors at any step are reported to Sentry but never thrown — the caller
 * must always be able to return a clean response to Clerk.
 */
export async function rejectNonAllowlistedSignup(input: RejectInput): Promise<void> {
  const emailLower = input.email.toLowerCase()
  const domain = extractEmailDomain(emailLower)
  const hashedEmail = hashEmailForAnalytics(emailLower)

  // 1. Delete the Clerk user.
  try {
    const cc = await clerkClient()
    await cc.users.deleteUser(input.clerkUserId)
  } catch (err) {
    Sentry.captureException(err, {
      level: 'error',
      tags: { source: 'signup-allowlist.clerkDelete', via: input.via },
      extra: { clerkUserId: input.clerkUserId, hashedEmail, domain },
    })
  }

  // 2. Roll back any Prisma mirror row.
  try {
    await prisma.user.deleteMany({ where: { clerkId: input.clerkUserId } })
  } catch (err) {
    Sentry.captureException(err, {
      level: 'error',
      tags: { source: 'signup-allowlist.prismaDelete', via: input.via },
      extra: { clerkUserId: input.clerkUserId, hashedEmail },
    })
  }

  // 3. Audit log.
  const actorId = await findSystemActorId()
  if (actorId) {
    await audit({
      actorId,
      action: 'auth.signup_rejected',
      resource: `Clerk:${input.clerkUserId}`,
      metadata: {
        reason: 'SIGNUP_NOT_ALLOWLISTED',
        via: input.via,
        attemptedEmail: emailLower,
        attemptedDomain: domain,
        eventId: input.eventId ?? null,
        system: true,
      },
    })
  } else {
    // No admin exists yet — extremely unlikely (the seed migration inserts
    // rebecca@homemade.education's allowlist row, but the User row is only
    // created on first sign-in). Drop a console + Sentry breadcrumb instead
    // of losing the rejection trail entirely.
    Sentry.captureMessage('signup rejected but no ADMIN to attribute audit log', {
      level: 'warning',
      tags: { source: 'signup-allowlist.audit', via: input.via },
      extra: { clerkUserId: input.clerkUserId, hashedEmail, domain },
    })
  }

  // 4. Analytics. distinctId is the Clerk id even though the user is gone —
  // that stitches the rejection event onto the same anon profile that fired
  // the prior acquisition events.
  try {
    await captureServerEvent({
      event: 'signup_rejected_not_allowlisted',
      distinctId: input.clerkUserId,
      properties: {
        via: input.via,
        attemptedEmail: hashedEmail,
        attemptedDomain: domain,
      },
    })
    await flushPostHog()
  } catch (err) {
    Sentry.captureException(err, {
      level: 'warning',
      tags: { source: 'signup-allowlist.analytics', via: input.via },
    })
  }
}
