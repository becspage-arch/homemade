import 'server-only'
import { prisma, type NotificationType } from '@homemade/db'
import { categoryForType, sendPushToUser } from './push-notifications'

/**
 * Write a single notification row + dispatch a push when the user has push
 * enabled and the type maps to a known push category. Never throws —
 * moderation flows should succeed even if either side fails.
 */
export async function notify(input: {
  userId: string
  type: NotificationType
  body: string
  href?: string | null
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
    const category = categoryForType(input.type)
    if (category) {
      // Fire-and-forget so the moderation action returns quickly. Push
      // failures already log themselves and soft-revoke dead tokens.
      void sendPushToUser(
        input.userId,
        {
          title: 'homemade',
          body: input.body,
          href: input.href ?? null,
          category,
        },
        { notificationId: created.id },
      )
    }
  } catch (err) {
    console.error('notification write failed', { input, err })
  }
}
