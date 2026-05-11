'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, MediaStatus, MediaType, type User } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { deleteImage } from '@/lib/cloudflare-images'

async function requireAdminActor(): Promise<User> {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) {
    throw new Error('Not authorised.')
  }
  return user
}

interface RegisterUploadInput {
  cloudflareId: string
  status: 'READY' | 'FAILED'
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  bytes?: number | null
  alt?: string | null
}

/**
 * Called from the upload page after the browser has finished POSTing the file
 * directly to Cloudflare. Creates the Prisma row with READY or FAILED status.
 */
export async function registerUpload(input: RegisterUploadInput): Promise<{ id: string }> {
  const actor = await requireAdminActor()

  if (!input.cloudflareId) throw new Error('cloudflareId is required.')
  if (input.status !== 'READY' && input.status !== 'FAILED') {
    throw new Error('status must be READY or FAILED.')
  }

  const media = await prisma.media.create({
    data: {
      cloudflareId: input.cloudflareId,
      type: MediaType.PHOTO,
      status: input.status === 'READY' ? MediaStatus.READY : MediaStatus.FAILED,
      filename: input.filename ?? null,
      mimeType: input.mimeType ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      bytes: input.bytes ?? null,
      alt: input.alt ?? null,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'media.create',
    resource: `Media:${media.id}`,
    metadata: {
      cloudflareId: media.cloudflareId,
      filename: media.filename,
      status: media.status,
    },
  })

  revalidatePath('/admin/media')
  return { id: media.id }
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

  // Remove from Cloudflare first. If that fails we abort and keep the DB row,
  // so the admin can retry. We swallow "image not found" because a row whose
  // CF asset was already deleted should still be removable from the DB.
  if (existing.cloudflareId) {
    try {
      await deleteImage(existing.cloudflareId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!/not\s*found/i.test(message)) {
        throw new Error(`Cloudflare delete failed: ${message}`)
      }
    }
  }

  await prisma.media.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'media.delete',
    resource: `Media:${existing.id}`,
    metadata: {
      cloudflareId: existing.cloudflareId,
      filename: existing.filename,
    },
  })

  revalidatePath('/admin/media')
  redirect('/admin/media')
}
