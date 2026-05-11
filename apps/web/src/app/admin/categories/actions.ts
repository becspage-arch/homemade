'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, UserRole } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function parseFormData(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const orderRaw = String(formData.get('order') ?? '0').trim()
  const order = Number.isFinite(Number(orderRaw)) ? parseInt(orderRaw, 10) : 0

  return { slug, name, description, order }
}

function validate(input: { slug: string; name: string }): string | null {
  if (!input.slug) return 'Slug is required.'
  if (!SLUG_PATTERN.test(input.slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only (e.g. "growing-tomatoes").'
  }
  if (!input.name) return 'Name is required.'
  return null
}

async function requireAdminActor() {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) {
    throw new Error('Not authorised.')
  }
  return user
}

export async function createCategory(formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parseFormData(formData)

  const error = validate(input)
  if (error) throw new Error(error)

  const existing = await prisma.category.findUnique({ where: { slug: input.slug } })
  if (existing) throw new Error(`A category with slug "${input.slug}" already exists.`)

  const category = await prisma.category.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      order: input.order,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'category.create',
    resource: `Category:${category.id}`,
    metadata: { slug: category.slug, name: category.name },
  })

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parseFormData(formData)

  const error = validate(input)
  if (error) throw new Error(error)

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw new Error('Category not found.')

  // If slug changed, make sure the new one isn't taken
  if (input.slug !== existing.slug) {
    const slugTaken = await prisma.category.findUnique({ where: { slug: input.slug } })
    if (slugTaken) throw new Error(`A category with slug "${input.slug}" already exists.`)
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      order: input.order,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'category.update',
    resource: `Category:${updated.id}`,
    metadata: {
      before: { slug: existing.slug, name: existing.name, order: existing.order },
      after: { slug: updated.slug, name: updated.name, order: updated.order },
    },
  })

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { tutorials: true, subCategories: true } } },
  })
  if (!existing) throw new Error('Category not found.')

  if (existing._count.tutorials > 0) {
    throw new Error(
      `Cannot delete "${existing.name}" — it still has ${existing._count.tutorials} tutorial(s). Move or delete those first.`,
    )
  }
  if (existing._count.subCategories > 0) {
    throw new Error(
      `Cannot delete "${existing.name}" — it still has ${existing._count.subCategories} sub-categor${existing._count.subCategories === 1 ? 'y' : 'ies'}. Delete those first.`,
    )
  }

  await prisma.category.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'category.delete',
    resource: `Category:${existing.id}`,
    metadata: { slug: existing.slug, name: existing.name },
  })

  revalidatePath('/admin/categories')
}
