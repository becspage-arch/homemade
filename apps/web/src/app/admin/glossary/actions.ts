'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { syncGlossaryById, removeGlossaryById } from '@/lib/search-sync'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function parse(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim()
  const term = String(formData.get('term') ?? '').trim()
  const definition = String(formData.get('definition') ?? '').trim()
  const categoryId = String(formData.get('categoryId') ?? '').trim() || null
  return { slug, term, definition, categoryId }
}

function validate(input: { slug: string; term: string; definition: string }): string | null {
  if (!input.slug) return 'Slug is required.'
  if (!SLUG_PATTERN.test(input.slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only.'
  }
  if (!input.term) return 'Term is required.'
  if (!input.definition) return 'Definition is required.'
  return null
}

async function requireAdminActor() {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) throw new Error('Not authorised.')
  return user
}

async function assertCategoryExists(id: string | null): Promise<void> {
  if (!id) return
  const cat = await prisma.category.findUnique({ where: { id } })
  if (!cat) throw new Error('Selected category not found.')
}

export async function createGlossaryTerm(formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parse(formData)
  const err = validate(input)
  if (err) throw new Error(err)

  const existing = await prisma.glossaryTerm.findUnique({ where: { slug: input.slug } })
  if (existing) throw new Error(`A glossary term with slug "${input.slug}" already exists.`)

  await assertCategoryExists(input.categoryId)

  const created = await prisma.glossaryTerm.create({
    data: {
      slug: input.slug,
      term: input.term,
      definition: input.definition,
      categoryId: input.categoryId,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'glossary.create',
    resource: `GlossaryTerm:${created.id}`,
    metadata: { slug: created.slug, term: created.term },
  })

  await syncGlossaryById(created.id)

  revalidatePath('/admin/glossary')
  redirect('/admin/glossary')
}

export async function updateGlossaryTerm(id: string, formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parse(formData)
  const err = validate(input)
  if (err) throw new Error(err)

  const existing = await prisma.glossaryTerm.findUnique({ where: { id } })
  if (!existing) throw new Error('Glossary term not found.')

  if (input.slug !== existing.slug) {
    const taken = await prisma.glossaryTerm.findUnique({ where: { slug: input.slug } })
    if (taken) throw new Error(`A glossary term with slug "${input.slug}" already exists.`)
  }

  await assertCategoryExists(input.categoryId)

  const updated = await prisma.glossaryTerm.update({
    where: { id },
    data: {
      slug: input.slug,
      term: input.term,
      definition: input.definition,
      categoryId: input.categoryId,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'glossary.update',
    resource: `GlossaryTerm:${updated.id}`,
    metadata: {
      before: { slug: existing.slug, term: existing.term, categoryId: existing.categoryId },
      after: { slug: updated.slug, term: updated.term, categoryId: updated.categoryId },
    },
  })

  await syncGlossaryById(updated.id)

  revalidatePath('/admin/glossary')
  redirect('/admin/glossary')
}

export async function deleteGlossaryTerm(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.glossaryTerm.findUnique({ where: { id } })
  if (!existing) throw new Error('Glossary term not found.')

  await prisma.glossaryTerm.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'glossary.delete',
    resource: `GlossaryTerm:${existing.id}`,
    metadata: { slug: existing.slug, term: existing.term },
  })

  await removeGlossaryById(id)

  revalidatePath('/admin/glossary')
}
