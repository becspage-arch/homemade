'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

async function requireAdminActor() {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) throw new Error('Not authorised.')
  return user
}

export async function createTag(formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const slug = String(formData.get('slug') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()

  if (!slug) throw new Error('Slug is required.')
  if (!SLUG_PATTERN.test(slug)) throw new Error('Slug must be lowercase letters, numbers, hyphens.')
  if (!name) throw new Error('Name is required.')

  const existing = await prisma.tag.findUnique({ where: { slug } })
  if (existing) throw new Error(`A tag with slug "${slug}" already exists.`)

  const tag = await prisma.tag.create({ data: { slug, name } })

  await audit({
    actorId: actor.id,
    action: 'tag.create',
    resource: `Tag:${tag.id}`,
    metadata: { slug: tag.slug, name: tag.name },
  })

  revalidatePath('/admin/tags')
}

export async function updateTag(id: string, formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const slug = String(formData.get('slug') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()

  if (!slug) throw new Error('Slug is required.')
  if (!SLUG_PATTERN.test(slug)) throw new Error('Slug must be lowercase letters, numbers, hyphens.')
  if (!name) throw new Error('Name is required.')

  const existing = await prisma.tag.findUnique({ where: { id } })
  if (!existing) throw new Error('Tag not found.')

  if (slug !== existing.slug) {
    const taken = await prisma.tag.findUnique({ where: { slug } })
    if (taken) throw new Error(`A tag with slug "${slug}" already exists.`)
  }

  const updated = await prisma.tag.update({ where: { id }, data: { slug, name } })

  await audit({
    actorId: actor.id,
    action: 'tag.update',
    resource: `Tag:${updated.id}`,
    metadata: {
      before: { slug: existing.slug, name: existing.name },
      after: { slug: updated.slug, name: updated.name },
    },
  })

  revalidatePath('/admin/tags')
}

export async function deleteTag(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.tag.findUnique({
    where: { id },
    include: { _count: { select: { tutorials: true } } },
  })
  if (!existing) throw new Error('Tag not found.')

  // Tags can be safely detached from tutorials (it's a many-to-many),
  // so we don't block delete based on usage. Disconnect first, then delete.
  await prisma.tag.update({
    where: { id },
    data: { tutorials: { set: [] } },
  })
  await prisma.tag.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'tag.delete',
    resource: `Tag:${existing.id}`,
    metadata: { slug: existing.slug, name: existing.name, hadTutorials: existing._count.tutorials },
  })

  revalidatePath('/admin/tags')
}
