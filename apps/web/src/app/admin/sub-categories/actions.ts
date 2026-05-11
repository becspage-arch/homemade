'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function parse(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const categoryId = String(formData.get('categoryId') ?? '').trim()
  const orderRaw = String(formData.get('order') ?? '0').trim()
  const order = Number.isFinite(Number(orderRaw)) ? parseInt(orderRaw, 10) : 0
  return { slug, name, description, categoryId, order }
}

function validate(input: { slug: string; name: string; categoryId: string }): string | null {
  if (!input.categoryId) return 'Parent category is required.'
  if (!input.slug) return 'Slug is required.'
  if (!SLUG_PATTERN.test(input.slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only.'
  }
  if (!input.name) return 'Name is required.'
  return null
}

async function requireAdminActor() {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) throw new Error('Not authorised.')
  return user
}

async function assertCategoryExists(id: string): Promise<void> {
  const cat = await prisma.category.findUnique({ where: { id } })
  if (!cat) throw new Error('Selected parent category not found.')
}

export async function createSubCategory(formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parse(formData)
  const err = validate(input)
  if (err) throw new Error(err)

  await assertCategoryExists(input.categoryId)

  const existing = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: input.categoryId, slug: input.slug } },
  })
  if (existing) {
    throw new Error(`A sub-category with slug "${input.slug}" already exists in that category.`)
  }

  const created = await prisma.subCategory.create({ data: input })

  await audit({
    actorId: actor.id,
    action: 'sub-category.create',
    resource: `SubCategory:${created.id}`,
    metadata: { slug: created.slug, name: created.name, categoryId: created.categoryId },
  })

  revalidatePath('/admin/sub-categories')
  redirect('/admin/sub-categories')
}

export async function updateSubCategory(id: string, formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parse(formData)
  const err = validate(input)
  if (err) throw new Error(err)

  const existing = await prisma.subCategory.findUnique({ where: { id } })
  if (!existing) throw new Error('Sub-category not found.')

  await assertCategoryExists(input.categoryId)

  if (input.slug !== existing.slug || input.categoryId !== existing.categoryId) {
    const taken = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: input.categoryId, slug: input.slug } },
    })
    if (taken && taken.id !== id) {
      throw new Error(`A sub-category with slug "${input.slug}" already exists in that category.`)
    }
  }

  const updated = await prisma.subCategory.update({ where: { id }, data: input })

  await audit({
    actorId: actor.id,
    action: 'sub-category.update',
    resource: `SubCategory:${updated.id}`,
    metadata: {
      before: { slug: existing.slug, name: existing.name, categoryId: existing.categoryId },
      after: { slug: updated.slug, name: updated.name, categoryId: updated.categoryId },
    },
  })

  revalidatePath('/admin/sub-categories')
  redirect('/admin/sub-categories')
}

export async function deleteSubCategory(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.subCategory.findUnique({
    where: { id },
    include: { _count: { select: { tutorials: true } } },
  })
  if (!existing) throw new Error('Sub-category not found.')

  if (existing._count.tutorials > 0) {
    throw new Error(
      `Cannot delete "${existing.name}" — it still has ${existing._count.tutorials} tutorial(s).`,
    )
  }

  await prisma.subCategory.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'sub-category.delete',
    resource: `SubCategory:${existing.id}`,
    metadata: { slug: existing.slug, name: existing.name },
  })

  revalidatePath('/admin/sub-categories')
}
