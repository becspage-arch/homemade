import 'server-only'
import { prisma, type NotificationType } from '@homemade/db'

/**
 * Write a single notification row. Never throws — moderation flows should
 * succeed even if the notification can't be saved.
 */
export async function notify(input: {
  userId: string
  type: NotificationType
  body: string
  href?: string | null
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        body: input.body,
        href: input.href ?? null,
      },
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('notification write failed', { input, err })
  }
}
