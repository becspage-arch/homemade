import 'server-only'
import { prisma, type NotificationType } from '@homemade/db'

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
 * Wire-level dispatch (APNs HTTP/2 for iOS, FCM for Android, Web Push for
 * the WEB platform) is intentionally not implemented here — that needs a
 * signed APNs auth key + an FCM service account JSON in Secrets Manager,
 * which Rebecca still has to provision. Until then this function logs the
 * intended dispatch + records pushed=true so the surrounding flow is
 * exercised in production traffic; the actual native delivery flips on
 * once `pushDispatcher` is non-null.
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
  // Real APNs / FCM / Web Push wiring is intentionally deferred — see the
  // function-level comment on sendPushToUser. For now we structure-log the
  // dispatch so production traffic exercises the pipeline and a real
  // dispatcher can be dropped in by replacing this function body.
  console.info('[push] dispatch', {
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
