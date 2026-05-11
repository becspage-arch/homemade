'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, type User } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { r2Delete } from '@/lib/r2'

async function requireAdminActor(): Promise<User> {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) {
    throw new Error('Not authorised.')
  }
  return user
}

export async function updateMedia(id: string, formData: FormData): Promise<void> {
  const actor = await requireAdminActor()

  const alt = (String(formData.get('alt') ?? '').trim() || null) as string | null
  const caption = (String(formData.get('caption') ?? '').trim() || null) as string | null
  const attribution = (String(formData.get('attribution') ?? '').trim() || null) as
    | string
    | null

  const existing = await prisma.media.findUnique({ where: { id } })
  if (!existing) throw new Error('Media not found.')

  const updated = await prisma.media.update({
    where: { id },
    data: { alt, caption, attribution },
  })

  await audit({
    actorId: actor.id,
    action: 'media.update',
    resource: `Media:${updated.id}`,
    metadata: {
      before: {
        alt: existing.alt,
        caption: existing.caption,
        attribution: existing.attribution,
      },
      after: { alt: updated.alt, caption: updated.caption, attribution: updated.attribution },
    },
  })

  revalidatePath('/admin/media')
  revalidatePath(`/admin/media/${id}`)
  redirect('/admin/media')
}

export async function deleteMedia(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.media.findUnique({
    where: { id },
    include: { _count: { select: { tutorialsHero: true } } },
  })
  if (!existing) throw new Error('Media not found.')

  if (existing._count.tutorialsHero > 0) {
    throw new Error(
      `Cannot delete this image — it's used as the hero on ${existing._count.tutorialsHero} tutorial${existing._count.tutorialsHero === 1 ? '' : 's'}. Swap the hero on those first.`,
    )
  }

  // Remove from R2 first. If that fails we abort and keep the DB row so the
  // admin can retry. The R2 delete is best-effort — a 404 / "no such key"
  // should not stop the row from being cleaned up.
  if (existing.r2Key) {
    try {
      await r2Delete(existing.r2Key)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!/not\s*found|nosuchkey/i.test(message)) {
        throw new Error(`R2 delete failed: ${message}`)
      }
    }
  }
  // Legacy Cloudflare Images rows: we no longer call the Images API on delete
  // (that subscription is gone). Just drop the row; the asset on CF Images is
  // either already gone or will sit unused until manual cleanup.

  await prisma.media.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'media.delete',
    resource: `Media:${existing.id}`,
    metadata: {
      r2Key: existing.r2Key,
      cloudflareId: existing.cloudflareId,
      filename: existing.filename,
    },
  })

  revalidatePath('/admin/media')
  redirect('/admin/media')
}
