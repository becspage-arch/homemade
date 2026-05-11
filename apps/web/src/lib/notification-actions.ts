'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from './get-current-user'

export async function markNotificationsRead(): Promise<{ ok: true }> {
  const user = await getCurrentDbUser()
  if (!user) return { ok: true }

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  })

  revalidatePath('/me/notifications')
  revalidatePath('/me')
  return { ok: true }
}
