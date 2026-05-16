import 'server-only'
import { prisma, type NotificationType } from '@homemade/db'
import { dispatchApnsPush, isApnsConfigured } from './apns-dispatch'

/**
 * Notification category keys. Mirrors the per-category toggles in
 * /me/settings. Mapping from each NotificationType to its category lives in
 * `CATEGORY_FOR_TYPE`; types not listed there are treated as transactional
 * (always sent if push is enabled, ignoring category opt-outs).
 */
export const PUSH_CATEGORIES = [
  'project_schedule',
  'moderation_outcome',
  'creator_application',
  'weekly_digest',
] as const
export type PushCategory = (typeof PUSH_CATEGORIES)[number]

const CATEGORY_FOR_TYPE: Partial<Record<NotificationType, PushCategory>> = {
  REVIEW_PUBLISHED: 'moderation_outcome',
  REVIEW_HIDDEN: 'moderation_outcome',
  REVIEW_REMOVED: 'moderation_outcome',
  PHOTO_APPROVED: 'moderation_outcome',
  PHOTO_REJECTED: 'moderation_outcome',
  QUESTION_PUBLISHED: 'moderation_outcome',
  QUESTION_HIDDEN: 'moderation_outcome',
  ANSWER_PUBLISHED: 'moderation_outcome',
  ANSWER_HIDDEN: 'moderation_outcome',
  ERRATA_ADDRESSED: 'moderation_outcome',
  ERRATA_DISMISSED: 'moderation_outcome',
  CREATOR_APPLICATION_APPROVED: 'creator_application',
  CREATOR_APPLICATION_REJECTED: 'creator_application',
  CREATOR_TUTORIAL_PUBLISHED: 'creator_application',
  CREATOR_TUTORIAL_REJECTED: 'creator_application',
  CREATOR_TUTORIAL_SUBMITTED: 'creator_application',
  PATTERN_TEST_APPLICATION_ACCEPTED: 'creator_application',
  PATTERN_TEST_APPLICATION_REJECTED: 'creator_application',
  PATTERN_TEST_FEEDBACK_RECEIVED: 'creator_application',
}

export interface PushPayload {
  title: string
  body: string
  href?: string | null
  category?: PushCategory
}

/**
 * Dispatch a push to every active PushSubscription belonging to a user, then
 * record `pushed = true, pushedAt = now` on the matching Notification rows.
 *
 * iOS: real APNs HTTP/2 dispatch via `apns-dispatch.ts`. Gated on the
 * presence of APNS_AUTH_KEY / APNS_KEY_ID / APNS_TEAM_ID env vars (which
 * arrive via the ECS task definition's Secrets Manager mount). When the
 * env vars aren't set yet, falls through to structured logging so the
 * pipeline still exercises end-to-end during the lead-up to credentials.
 *
 * Android (FCM) + Web Push are still logging stubs — they need their own
 * Rebecca-side provisioning before they can light up.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  opts: { notificationId?: string } = {},
): Promise<{ delivered: number; skipped: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushNotificationsEnabled: true },
  })
  if (!user || !user.pushNotificationsEnabled) {
    return { delivered: 0, skipped: 0 }
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId, revokedAt: null },
  })

  let delivered = 0
  let skipped = 0
  for (const sub of subs) {
    if (
      payload.category &&
      sub.enabledCategories.length > 0 &&
      !sub.enabledCategories.includes(payload.category)
    ) {
      skipped++
      continue
    }
    const ok = await dispatch(sub, payload)
    if (ok) {
      delivered++
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastActiveAt: new Date() },
      })
    } else {
      // Soft-revoke on persistent failure so we stop retrying a dead token.
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { revokedAt: new Date() },
      })
    }
  }

  if (opts.notificationId && delivered > 0) {
    await prisma.notification.update({
      where: { id: opts.notificationId },
      data: { pushed: true, pushedAt: new Date() },
    })
  }

  return { delivered, skipped }
}

/**
 * Wraps the existing `notify()` write so callers can fire-and-forget a
 * notification AND a push in a single call. The category is inferred from
 * NotificationType; pass `category: null` to suppress the push.
 */
export async function notifyWithPush(input: {
  userId: string
  type: NotificationType
  body: string
  href?: string | null
  pushTitle?: string
  category?: PushCategory | null
}): Promise<void> {
  try {
    const created = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        body: input.body,
        href: input.href ?? null,
      },
      select: { id: true },
    })

    const category =
      input.category === null
        ? undefined
        : (input.category ?? CATEGORY_FOR_TYPE[input.type])

    if (category !== undefined) {
      await sendPushToUser(
        input.userId,
        {
          title: input.pushTitle ?? 'homemade',
          body: input.body,
          href: input.href ?? null,
          category,
        },
        { notificationId: created.id },
      )
    }
  } catch (err) {
    console.error('notifyWithPush failed', { input, err })
  }
}

async function dispatch(
  sub: {
    platform: 'IOS' | 'ANDROID' | 'WEB'
    deviceToken: string
  },
  payload: PushPayload,
): Promise<boolean> {
  if (sub.platform === 'IOS' && isApnsConfigured()) {
    const res = await dispatchApnsPush(sub.deviceToken, {
      title: payload.title,
      body: payload.body,
      href: payload.href,
    })
    if (res.status && res.status >= 200 && res.status < 300) {
      return true
    }
    // 410 = device token no longer valid; treat as a failure so the caller
    // soft-revokes the row. Everything else also returns false but the
    // structured log makes triage trivial.
    console.warn('[push] apns dispatch failed', {
      platform: sub.platform,
      tokenPrefix: sub.deviceToken.slice(0, 8),
      status: res.status,
      reason: res.reason,
    })
    return res.status === 410 ? false : false
  }
  // Android (FCM) + Web Push + un-configured iOS: structured log the
  // intended dispatch and return true so the Notification row gets stamped
  // pushed=true. Real wiring drops in here once Rebecca has provisioned
  // the relevant credentials.
  console.info('[push] dispatch (stub)', {
    platform: sub.platform,
    tokenPrefix: sub.deviceToken.slice(0, 8),
    title: payload.title,
    body: payload.body,
  })
  return true
}

export function categoryForType(
  type: NotificationType,
): PushCategory | undefined {
  return CATEGORY_FOR_TYPE[type]
}
