'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  prisma,
  Difficulty,
  Season,
  SourceType,
  TutorialStatus,
  type Prisma,
} from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { isValidSlug, slugify } from '@/lib/slug'
import { syncTutorialById, removeTutorialById } from '@/lib/search-sync'

// ────────────────────────────────────────────────────────────────────────────
// Shape parsing & validation
// ────────────────────────────────────────────────────────────────────────────

interface TutorialMetadataInput {
  title: string
  slug: string
  subtitle: string | null
  excerpt: string | null
  categoryId: string
  subCategoryId: string | null
  tagIds: string[]
  difficulty: Difficulty
  season: Season | null
  sourceType: SourceType
  sourceNotes: string | null
  timeMinutes: number | null
  heroMediaId: string | null
}

interface TutorialFullInput extends TutorialMetadataInput {
  body: Prisma.InputJsonValue
}

const EMPTY_DOC: Prisma.InputJsonValue = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

function pickEnum<T extends string>(
  raw: string,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback
}

function pickEnumOrNull<T extends string>(
  raw: string,
  allowed: readonly T[],
): T | null {
  if (!raw) return null
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null
}

const DIFFICULTIES: readonly Difficulty[] = [
  Difficulty.BEGINNER,
  Difficulty.INTERMEDIATE,
  Difficulty.ADVANCED,
]

const SEASONS: readonly Season[] = [
  Season.SPRING,
  Season.SUMMER,
  Season.AUTUMN,
  Season.WINTER,
  Season.YEAR_ROUND,
]

const SOURCE_TYPES: readonly SourceType[] = [
  SourceType.TESTED,
  SourceType.CLASSIC,
  SourceType.SYNTHESISED,
  SourceType.PUBLIC_DOMAIN,
  SourceType.CREATOR,
]

function parseTagIds(formData: FormData): string[] {
  // FormData.getAll preserves checkbox semantics
  return formData.getAll('tagIds').map(String).filter(Boolean)
}

function parseBody(raw: string | null): Prisma.InputJsonValue {
  if (!raw) return EMPTY_DOC
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Prisma.InputJsonValue
    return EMPTY_DOC
  } catch {
    throw new Error('Tutorial body is not valid JSON. Refresh and try again.')
  }
}

function parseMetadata(formData: FormData): TutorialMetadataInput {
  const title = String(formData.get('title') ?? '').trim()
  let slug = String(formData.get('slug') ?? '').trim()
  if (!slug && title) slug = slugify(title)

  const subtitle = String(formData.get('subtitle') ?? '').trim() || null
  const excerpt = String(formData.get('excerpt') ?? '').trim() || null
  const categoryId = String(formData.get('categoryId') ?? '').trim()
  const subCategoryRaw = String(formData.get('subCategoryId') ?? '').trim()
  const subCategoryId = subCategoryRaw || null
  const heroRaw = String(formData.get('heroMediaId') ?? '').trim()
  const heroMediaId = heroRaw || null
  const sourceNotes = String(formData.get('sourceNotes') ?? '').trim() || null
  const timeRaw = String(formData.get('timeMinutes') ?? '').trim()
  const timeMinutes = timeRaw === '' ? null : Number.parseInt(timeRaw, 10)

  return {
    title,
    slug,
    subtitle,
    excerpt,
    categoryId,
    subCategoryId,
    tagIds: parseTagIds(formData),
    difficulty: pickEnum(
      String(formData.get('difficulty') ?? ''),
      DIFFICULTIES,
      Difficulty.BEGINNER,
    ),
    season: pickEnumOrNull(String(formData.get('season') ?? ''), SEASONS),
    sourceType: pickEnum(
      String(formData.get('sourceType') ?? ''),
      SOURCE_TYPES,
      SourceType.SYNTHESISED,
    ),
    sourceNotes,
    timeMinutes:
      timeMinutes !== null && Number.isFinite(timeMinutes) && timeMinutes >= 0
        ? timeMinutes
        : null,
    heroMediaId,
  }
}

function parseFull(formData: FormData): TutorialFullInput {
  const meta = parseMetadata(formData)
  const body = parseBody(String(formData.get('body') ?? ''))
  return { ...meta, body }
}

function validateMetadata(input: TutorialMetadataInput): string | null {
  if (!input.title) return 'Title is required.'
  if (!input.slug) return 'Slug is required.'
  if (!isValidSlug(input.slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only.'
  }
  if (!input.categoryId) return 'Category is required.'
  return null
}

async function requireAdminActor() {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) throw new Error('Not authorised.')
  return user
}

async function assertCategoryExists(id: string): Promise<void> {
  const c = await prisma.category.findUnique({ where: { id } })
  if (!c) throw new Error('Selected category not found.')
}

async function assertSubCategoryFitsCategory(
  subCategoryId: string | null,
  categoryId: string,
): Promise<void> {
  if (!subCategoryId) return
  const sc = await prisma.subCategory.findUnique({ where: { id: subCategoryId } })
  if (!sc) throw new Error('Selected sub-category not found.')
  if (sc.categoryId !== categoryId) {
    throw new Error('Sub-category does not belong to the selected category.')
  }
}

async function assertHeroMediaExists(id: string | null): Promise<void> {
  if (!id) return
  const m = await prisma.media.findUnique({ where: { id } })
  if (!m) throw new Error('Selected hero media not found.')
}

// ────────────────────────────────────────────────────────────────────────────
// Status lifecycle
// ────────────────────────────────────────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<TutorialStatus, readonly TutorialStatus[]> = {
  [TutorialStatus.DRAFT]: [TutorialStatus.SCHEDULED, TutorialStatus.PUBLISHED, TutorialStatus.PENDING_MODERATION],
  [TutorialStatus.IN_REVIEW]: [TutorialStatus.DRAFT, TutorialStatus.PUBLISHED],
  [TutorialStatus.PENDING_MODERATION]: [TutorialStatus.DRAFT, TutorialStatus.PUBLISHED],
  [TutorialStatus.SCHEDULED]: [TutorialStatus.DRAFT, TutorialStatus.PUBLISHED],
  [TutorialStatus.PUBLISHED]: [TutorialStatus.ARCHIVED],
  [TutorialStatus.ARCHIVED]: [TutorialStatus.DRAFT],
}

function isAllowedTransition(from: TutorialStatus, to: TutorialStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

// ────────────────────────────────────────────────────────────────────────────
// Version snapshot helper
// ────────────────────────────────────────────────────────────────────────────

async function snapshotVersion(
  tutorialId: string,
  actorId: string,
  changeNote?: string,
): Promise<void> {
  const current = await prisma.tutorial.findUnique({ where: { id: tutorialId } })
  if (!current) return
  await prisma.tutorialVersion.create({
    data: {
      tutorialId: current.id,
      title: current.title,
      subtitle: current.subtitle,
      excerpt: current.excerpt,
      body: current.body as Prisma.InputJsonValue,
      status: current.status,
      authorId: actorId,
      changeNote: changeNote ?? null,
    },
  })
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD actions
// ────────────────────────────────────────────────────────────────────────────

export async function createTutorial(formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parseFull(formData)
  const err = validateMetadata(input)
  if (err) throw new Error(err)

  const slugTaken = await prisma.tutorial.findUnique({ where: { slug: input.slug } })
  if (slugTaken) throw new Error(`A tutorial with slug "${input.slug}" already exists.`)

  await assertCategoryExists(input.categoryId)
  await assertSubCategoryFitsCategory(input.subCategoryId, input.categoryId)
  await assertHeroMediaExists(input.heroMediaId)

  const created = await prisma.tutorial.create({
    data: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      tags: { connect: input.tagIds.map((id) => ({ id })) },
      difficulty: input.difficulty,
      season: input.season,
      sourceType: input.sourceType,
      sourceNotes: input.sourceNotes,
      timeMinutes: input.timeMinutes,
      heroMediaId: input.heroMediaId,
      body: input.body,
      status: TutorialStatus.DRAFT,
      authorId: actor.id,
    },
  })

  // First-save snapshot
  await prisma.tutorialVersion.create({
    data: {
      tutorialId: created.id,
      title: created.title,
      subtitle: created.subtitle,
      excerpt: created.excerpt,
      body: created.body as Prisma.InputJsonValue,
      status: created.status,
      authorId: actor.id,
      changeNote: 'Created',
    },
  })

  await audit({
    actorId: actor.id,
    action: 'tutorial.create',
    resource: `Tutorial:${created.id}`,
    metadata: { slug: created.slug, title: created.title },
  })

  await syncTutorialById(created.id)

  revalidatePath('/admin/tutorials')
  redirect(`/admin/tutorials/${created.id}`)
}

export async function updateTutorial(id: string, formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parseFull(formData)
  const err = validateMetadata(input)
  if (err) throw new Error(err)

  const existing = await prisma.tutorial.findUnique({
    where: { id },
    include: { tags: { select: { id: true } } },
  })
  if (!existing) throw new Error('Tutorial not found.')

  if (input.slug !== existing.slug) {
    const taken = await prisma.tutorial.findUnique({ where: { slug: input.slug } })
    if (taken) throw new Error(`A tutorial with slug "${input.slug}" already exists.`)
  }

  await assertCategoryExists(input.categoryId)
  await assertSubCategoryFitsCategory(input.subCategoryId, input.categoryId)
  await assertHeroMediaExists(input.heroMediaId)

  await snapshotVersion(id, actor.id, 'Edit')

  const updated = await prisma.tutorial.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      tags: { set: input.tagIds.map((tid) => ({ id: tid })) },
      difficulty: input.difficulty,
      season: input.season,
      sourceType: input.sourceType,
      sourceNotes: input.sourceNotes,
      timeMinutes: input.timeMinutes,
      heroMediaId: input.heroMediaId,
      body: input.body,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'tutorial.update',
    resource: `Tutorial:${updated.id}`,
    metadata: {
      slug: updated.slug,
      title: updated.title,
    },
  })

  await syncTutorialById(updated.id)

  revalidatePath('/admin/tutorials')
  revalidatePath(`/admin/tutorials/${id}`)
  redirect(`/admin/tutorials/${id}`)
}

export async function transitionTutorialStatus(
  id: string,
  formData: FormData,
): Promise<void> {
  const actor = await requireAdminActor()
  const targetRaw = String(formData.get('target') ?? '')
  const target = pickEnumOrNull(targetRaw, [
    TutorialStatus.DRAFT,
    TutorialStatus.SCHEDULED,
    TutorialStatus.PUBLISHED,
    TutorialStatus.ARCHIVED,
  ])
  if (!target) throw new Error('Invalid target status.')

  const scheduledRaw = String(formData.get('scheduledFor') ?? '').trim()

  const existing = await prisma.tutorial.findUnique({ where: { id } })
  if (!existing) throw new Error('Tutorial not found.')

  if (!isAllowedTransition(existing.status, target)) {
    throw new Error(
      `Cannot move a tutorial from ${existing.status.toLowerCase()} to ${target.toLowerCase()}.`,
    )
  }

  const data: Prisma.TutorialUpdateInput = { status: target }

  if (target === TutorialStatus.SCHEDULED) {
    if (!scheduledRaw) throw new Error('Pick a publish date for the scheduled status.')
    const when = new Date(scheduledRaw)
    if (Number.isNaN(when.getTime())) throw new Error('Publish date is not a valid date.')
    data.scheduledFor = when
  }

  if (target === TutorialStatus.PUBLISHED) {
    data.publishedAt = existing.publishedAt ?? new Date()
    data.scheduledFor = null
  }

  if (target === TutorialStatus.DRAFT) {
    data.scheduledFor = null
  }

  // Snapshot before changing status so version history shows the prior state
  await snapshotVersion(id, actor.id, `Status → ${target}`)

  await prisma.tutorial.update({ where: { id }, data })

  await audit({
    actorId: actor.id,
    action: 'tutorial.transition',
    resource: `Tutorial:${id}`,
    metadata: { from: existing.status, to: target },
  })

  await syncTutorialById(id)

  revalidatePath('/admin/tutorials')
  revalidatePath(`/admin/tutorials/${id}`)
}

export async function restoreTutorialVersion(versionId: string): Promise<void> {
  const actor = await requireAdminActor()

  const version = await prisma.tutorialVersion.findUnique({ where: { id: versionId } })
  if (!version) throw new Error('Version not found.')

  // Snapshot the current state before overwriting
  await snapshotVersion(version.tutorialId, actor.id, `Pre-restore of ${versionId}`)

  await prisma.tutorial.update({
    where: { id: version.tutorialId },
    data: {
      title: version.title,
      subtitle: version.subtitle,
      excerpt: version.excerpt,
      body: version.body as Prisma.InputJsonValue,
      // Don't bring back the version's status — restoring content shouldn't
      // republish or unpublish; the admin can do that separately.
    },
  })

  await audit({
    actorId: actor.id,
    action: 'tutorial.restore',
    resource: `Tutorial:${version.tutorialId}`,
    metadata: { restoredVersionId: versionId },
  })

  await syncTutorialById(version.tutorialId)

  revalidatePath('/admin/tutorials')
  revalidatePath(`/admin/tutorials/${version.tutorialId}`)
  revalidatePath(`/admin/tutorials/${version.tutorialId}/versions`)
  redirect(`/admin/tutorials/${version.tutorialId}`)
}

/**
 * Walk a TipTap document and strip every `subTutorialCard` block whose
 * `attrs.tutorialId` matches `targetId`. Returns the cleaned tree and the
 * number of nodes removed. Used by `deleteTutorial` to scrub dangling
 * cross-references before the row goes away.
 */
function stripSubTutorialRefs(
  node: unknown,
  targetId: string,
): { node: unknown; stripped: number } {
  if (node === null || typeof node !== 'object') return { node, stripped: 0 }

  if (Array.isArray(node)) {
    let stripped = 0
    const out: unknown[] = []
    for (const child of node) {
      if (
        child &&
        typeof child === 'object' &&
        (child as { type?: unknown }).type === 'subTutorialCard' &&
        (child as { attrs?: { tutorialId?: unknown } }).attrs?.tutorialId === targetId
      ) {
        stripped++
        continue
      }
      const r = stripSubTutorialRefs(child, targetId)
      stripped += r.stripped
      out.push(r.node)
    }
    return { node: out, stripped }
  }

  const obj = node as Record<string, unknown>
  const out: Record<string, unknown> = { ...obj }
  let stripped = 0
  for (const key of Object.keys(obj)) {
    const r = stripSubTutorialRefs(obj[key], targetId)
    stripped += r.stripped
    out[key] = r.node
  }
  return { node: out, stripped }
}

export async function deleteTutorial(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.tutorial.findUnique({ where: { id } })
  if (!existing) throw new Error('Tutorial not found.')

  // Find every other tutorial whose body still references this one via a
  // `subTutorialCard` block. Walk the JSON in JS — at expected catalogue
  // scale this is cheap, and a JSON walk handles arbitrary nesting that a
  // top-level @> containment query would miss.
  const referrers = await prisma.tutorial.findMany({
    where: { id: { not: id } },
    select: { id: true, body: true },
  })
  const affected: Array<{ id: string; newBody: Prisma.InputJsonValue; stripped: number }> = []
  for (const r of referrers) {
    const result = stripSubTutorialRefs(r.body, id)
    if (result.stripped > 0) {
      affected.push({
        id: r.id,
        newBody: result.node as Prisma.InputJsonValue,
        stripped: result.stripped,
      })
    }
  }

  // Snapshot every affected referrer first, then patch its body, then delete
  // the source tutorial — all in one transaction so a mid-flight failure
  // doesn't leave half the catalogue stripped while the source still exists
  // (or vice versa).
  await prisma.$transaction(async (tx) => {
    for (const a of affected) {
      const cur = await tx.tutorial.findUnique({ where: { id: a.id } })
      if (!cur) continue
      await tx.tutorialVersion.create({
        data: {
          tutorialId: cur.id,
          title: cur.title,
          subtitle: cur.subtitle,
          excerpt: cur.excerpt,
          body: cur.body as Prisma.InputJsonValue,
          status: cur.status,
          authorId: actor.id,
          changeNote: `Pre-strip of ${a.stripped} subTutorialCard ref(s) to deleted tutorial ${existing.slug}`,
        },
      })
      await tx.tutorial.update({ where: { id: a.id }, data: { body: a.newBody } })
    }

    // Hard delete; versions cascade per schema.
    await tx.tutorial.delete({ where: { id } })
  })

  // Audit-log the strip-and-snapshot per affected referrer separately from
  // the delete, so version history shows the edit was driven by this delete.
  for (const a of affected) {
    await audit({
      actorId: actor.id,
      action: 'tutorial.subref_stripped',
      resource: `Tutorial:${a.id}`,
      metadata: {
        deletedTutorialId: id,
        deletedTutorialSlug: existing.slug,
        strippedCount: a.stripped,
      },
    })
    await syncTutorialById(a.id)
  }

  await audit({
    actorId: actor.id,
    action: 'tutorial.delete',
    resource: `Tutorial:${id}`,
    metadata: {
      slug: existing.slug,
      title: existing.title,
      strippedFromTutorials: affected.map((a) => a.id),
    },
  })

  await removeTutorialById(id)

  revalidatePath('/admin/tutorials')
  redirect('/admin/tutorials')
}
