import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma, UserRole } from '@homemade/db'
import { captureServerEvent, flushPostHog, identifyServerUser } from '@/lib/posthog'
import { isoWeek } from '@/lib/cohort'
import { deriveDeviceClass } from '@/lib/acquisition'
import { hashEmailForAnalytics } from '@/lib/email-hash'
import {
  SIGNUP_ALLOWLIST_ENABLED,
  findAllowlistEntry,
  markAllowlistUsed,
  rejectNonAllowlistedSignup,
} from '@/lib/signup-allowlist'

/**
 * Clerk webhook receiver. Keeps the Prisma `User` row in sync when Clerk's
 * profile state changes (email update, name update, account deletion).
 *
 * JIT provisioning in `lib/get-current-user.ts` handles signups on first
 * sign-in already, so this webhook is purely for *propagating later changes*
 * — it's safe to deploy without configuring an endpoint in Clerk's dashboard.
 *
 * To wire up:
 *   1. In Clerk dashboard → Webhooks → Add endpoint
 *      URL: https://homemade.education/api/webhooks/clerk
 *      Subscribe to: user.created, user.updated, user.deleted
 *   2. Copy the signing secret from that endpoint
 *   3. Update the AWS Secrets Manager secret `homemade/clerk-webhook-secret`
 *      with the signing secret
 *   4. Redeploy CDK so the task pulls the new secret
 */

const ADMIN_EMAILS = new Set(['rebecca@homemade.education'])

function deriveRole(email: string): UserRole {
  return ADMIN_EMAILS.has(email.toLowerCase()) ? UserRole.ADMIN : UserRole.MEMBER
}

interface ClerkEmail {
  email_address: string
}

interface ClerkUserPayload {
  id: string
  email_addresses?: ClerkEmail[]
  first_name?: string | null
  last_name?: string | null
}

interface ClerkEvent {
  type: string
  data: ClerkUserPayload
}

function extractPrimaryEmail(data: ClerkUserPayload): string | null {
  const first = data.email_addresses?.[0]?.email_address
  return first?.toLowerCase() ?? null
}

function combineName(data: ClerkUserPayload): string | null {
  return [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || null
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!secret) {
    return Response.json({ error: 'webhook not configured' }, { status: 503 })
  }

  const hdrs = await headers()
  const svixId = hdrs.get('svix-id')
  const svixTimestamp = hdrs.get('svix-timestamp')
  const svixSignature = hdrs.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'missing svix headers' }, { status: 400 })
  }

  const body = await req.text()

  let evt: ClerkEvent
  try {
    const wh = new Webhook(secret)
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkEvent
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('clerk webhook signature verification failed', err)
    return Response.json({ error: 'bad signature' }, { status: 401 })
  }

  try {
    switch (evt.type) {
      case 'user.created':
      case 'user.updated': {
        const email = extractPrimaryEmail(evt.data)
        if (!email) {
          // No primary email — nothing meaningful to upsert.
          return Response.json({ ok: true, skipped: 'no primary email' })
        }

        // Pre-launch signup allowlist gate. Only applies to user.created —
        // updates to existing users (email change, name change) are allowed
        // through regardless.
        if (evt.type === 'user.created' && SIGNUP_ALLOWLIST_ENABLED) {
          const allowlisted = await findAllowlistEntry(email)
          if (!allowlisted) {
            await rejectNonAllowlistedSignup({
              clerkUserId: evt.data.id,
              email,
              via: 'webhook',
              eventId: svixId,
            })
            // Return 200 so Clerk doesn't retry — the event was handled, just
            // not in the way the signed-up user expected.
            return Response.json({ ok: true, rejected: 'not_allowlisted' })
          }
        }

        const name = combineName(evt.data)
        const country = hdrs.get('cf-ipcountry') ?? null
        const deviceClass = deriveDeviceClass(hdrs.get('user-agent'))
        const cohortWeek = isoWeek(new Date())
        const upserted = await prisma.user.upsert({
          where: { clerkId: evt.data.id },
          create: {
            clerkId: evt.data.id,
            email,
            name,
            role: deriveRole(email),
            // Acquisition data is filled in by the client tracker on next
            // page load via `persistAcquisitionIfMissing`. Cohort + first-
            // touch headers we know now.
            signupCohortWeek: cohortWeek,
            country,
            deviceClass,
          },
          update: {
            email,
            name,
            // Don't overwrite role on update — admin role might have been
            // promoted from inside the app. Only re-derive on user.created
            // (handled by upsert.create).
          },
        })
        if (evt.type === 'user.created') {
          if (SIGNUP_ALLOWLIST_ENABLED) {
            await markAllowlistUsed(email)
          }
          await identifyServerUser({
            distinctId: evt.data.id,
            properties: {
              email: hashEmailForAnalytics(email),
              name: name ?? undefined,
              userId: upserted.id,
              displayHandle: upserted.displayHandle ?? undefined,
              role: upserted.role,
              isCreator: upserted.isCreator,
              creatorVerified: Boolean(upserted.creatorVerifiedAt),
              isPatternTester: upserted.isPatternTester,
              isSuspended: upserted.isSuspended,
              beginnerMode: upserted.beginnerMode,
              signupCohortWeek: upserted.signupCohortWeek,
              country: upserted.country,
              deviceClass: upserted.deviceClass,
              acquisitionChannel: upserted.acquisitionChannel,
              utmSource: upserted.utmSource,
              utmMedium: upserted.utmMedium,
              utmCampaign: upserted.utmCampaign,
              utmContent: upserted.utmContent,
              utmTerm: upserted.utmTerm,
            },
          })
          await captureServerEvent({
            event: 'signup_completed',
            distinctId: evt.data.id,
            properties: {
              role: upserted.role,
              cohortWeek: upserted.signupCohortWeek,
              country: upserted.country,
              deviceClass: upserted.deviceClass,
            },
          })
          await flushPostHog()
        }
        return Response.json({ ok: true, type: evt.type })
      }
      case 'user.deleted': {
        await prisma.user.deleteMany({ where: { clerkId: evt.data.id } })
        return Response.json({ ok: true, type: evt.type })
      }
      default:
        return Response.json({ ok: true, ignored: evt.type })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('clerk webhook handler error', { type: evt.type, err })
    return Response.json({ error: 'handler failed' }, { status: 500 })
  }
}
