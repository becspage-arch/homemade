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
import { audit } from './audit'
import { getCurrentDbUser } from './get-current-user'
import { isValidSlug, slugify } from './slug'
import { syncTutorialById, removeTutorialById } from './search-sync'

type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string }

interface CreatorTutorialInput {
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
  body: Prisma.InputJsonValue
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

const EMPTY_DOC: Prisma.InputJsonValue = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

function pickEnum<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback
}

function pickEnumOrNull<T extends string>(raw: string, allowed: readonly T[]): T | null {
  if (!raw) return null
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null
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

function parseInput(formData: FormData): CreatorTutorialInput {
  const title = String(formData.get('title') ?? '').trim()
  let slug = String(formData.get('slug') ?? '').trim()
  if (!slug && title) slug = slugify(title)

  const timeRaw = String(formData.get('timeMinutes') ?? '').trim()
  const timeMinutes = timeRaw === '' ? null : Number.parseInt(timeRaw, 10)

  return {
    title,
    slug,
    subtitle: String(formData.get('subtitle') ?? '').trim() || null,
    excerpt: String(formData.get('excerpt') ?? '').trim() || null,
    categoryId: String(formData.get('categoryId') ?? '').trim(),
    subCategoryId: String(formData.get('subCategoryId') ?? '').trim() || null,
    tagIds: formData.getAll('tagIds').map(String).filter(Boolean),
    difficulty: pickEnum(String(formData.get('difficulty') ?? ''), DIFFICULTIES, Difficulty.BEGINNER),
    season: pickEnumOrNull(String(formData.get('season') ?? ''), SEASONS),
    sourceType: pickEnum(
      String(formData.get('sourceType') ?? ''),
      SOURCE_TYPES,
      SourceType.CREATOR,
    ),
    sourceNotes: String(formData.get('sourceNotes') ?? '').trim() || null,
    timeMinutes:
      timeMinutes !== null && Number.isFinite(timeMinutes) && timeMinutes >= 0
        ? timeMinutes
        : null,
    heroMediaId: String(formData.get('heroMediaId') ?? '').trim() || null,
    body: parseBody(String(formData.get('body') ?? '')),
  }
}

async function requireCreatorActor() {
  const user = await getCurrentDbUser()
  if (!user) throw new Error('Sign in.')
  if (!user.isCreator) throw new Error('Creator-only.')
  if (user.isSuspended) throw new Error('Suspended accounts can’t edit.')
  return user
}

function validateInput(input: CreatorTutorialInput): string | null {
  if (!input.title) return 'Title is required.'
  if (!input.slug) return 'Slug is required.'
  if (!isValidSlug(input.slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens only.'
  }
  if (!input.categoryId) return 'Category is required.'
  return null
}

async function assertCategory(id: string) {
  const c = await prisma.category.findUnique({ where: { id } })
  if (!c) throw new Error('Selected category not found.')
}

async function assertSubCategory(subCategoryId: string | null, categoryId: string) {
  if (!subCategoryId) return
  const sc = await prisma.subCategory.findUnique({ where: { id: subCategoryId } })
  if (!sc) throw new Error('Selected sub-category not found.')
  if (sc.categoryId !== categoryId) {
    throw new Error('Sub-category does not belong to the selected category.')
  }
}

async function assertHeroMedia(id: string | null) {
  if (!id) return
  const m = await prisma.media.findUnique({ where: { id } })
  if (!m) throw new Error('Selected hero media not found.')
}

async function snapshotVersion(tutorialId: string, actorId: string, note?: string) {
  const t = await prisma.tutorial.findUnique({ where: { id: tutorialId } })
  if (!t) return
  await prisma.tutorialVersion.create({
    data: {
      tutorialId: t.id,
      title: t.title,
      subtitle: t.subtitle,
      excerpt: t.excerpt,
      body: t.body as Prisma.InputJsonValue,
      status: t.status,
      authorId: actorId,
      changeNote: note ?? null,
    },
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Create / update / delete — creator-only
// ────────────────────────────────────────────────────────────────────────────

export async function createCreatorTutorial(formData: FormData): Promise<void> {
  const actor = await requireCreatorActor()
  const input = parseInput(formData)
  const err = validateInput(input)
  if (err) throw new Error(err)

  const taken = await prisma.tutorial.findUnique({ where: { slug: input.slug } })
  if (taken) throw new Error(`A tutorial with slug "${input.slug}" already exists.`)

  await assertCategory(input.categoryId)
  await assertSubCategory(input.subCategoryId, input.categoryId)
  await assertHeroMedia(input.heroMediaId)

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
      sourceType: SourceType.CREATOR,
      sourceNotes: input.sourceNotes,
      timeMinutes: input.timeMinutes,
      heroMediaId: input.heroMediaId,
      body: input.body,
      status: TutorialStatus.DRAFT,
      authorId: actor.id,
      creatorId: actor.id,
    },
  })

  await prisma.tutorialVersion.create({
    data: {
      tutorialId: created.id,
      title: created.title,
      subtitle: created.subtitle,
      excerpt: created.excerpt,
      body: created.body as Prisma.InputJsonValue,
      status: created.status,
      authorId: actor.id,
      changeNote: 'Created by creator',
    },
  })

  await audit({
    actorId: actor.id,
    action: 'tutorial.create',
    resource: `Tutorial:${created.id}`,
    metadata: { slug: created.slug, byCreator: true },
  })

  revalidatePath('/me/creator/tutorials')
  redirect(`/me/creator/tutorials/${created.id}`)
}

export async function updateCreatorTutorial(id: string, formData: FormData): Promise<void> {
  const actor = await requireCreatorActor()
  const input = parseInput(formData)
  const err = validateInput(input)
  if (err) throw new Error(err)

  const existing = await prisma.tutorial.findUnique({
    where: { id },
    include: { tags: { select: { id: true } } },
  })
  if (!existing) throw new Error('Tutorial not found.')
  if (existing.creatorId !== actor.id) throw new Error('Not your tutorial.')

  if (input.slug !== existing.slug) {
    const taken = await prisma.tutorial.findUnique({ where: { slug: input.slug } })
    if (taken) throw new Error(`A tutorial with slug "${input.slug}" already exists.`)
  }

  await assertCategory(input.categoryId)
  await assertSubCategory(input.subCategoryId, input.categoryId)
  await assertHeroMedia(input.heroMediaId)

  await snapshotVersion(id, actor.id, 'Creator edit')

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
      sourceType: SourceType.CREATOR,
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
    metadata: { byCreator: true },
  })

  if (updated.status === TutorialStatus.PUBLISHED) {
    await syncTutorialById(updated.id)
  }

  revalidatePath('/me/creator/tutorials')
  revalidatePath(`/me/creator/tutorials/${id}`)
  redirect(`/me/creator/tutorials/${id}`)
}

export async function deleteCreatorTutorial(id: string): Promise<void> {
  const actor = await requireCreatorActor()
  const existing = await prisma.tutorial.findUnique({ where: { id } })
  if (!existing) throw new Error('Tutorial not found.')
  if (existing.creatorId !== actor.id) throw new Error('Not your tutorial.')
  if (existing.status === TutorialStatus.PUBLISHED) {
    throw new Error('Published tutorials can’t be deleted from the creator surface — ask the team.')
  }

  await prisma.tutorial.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'tutorial.delete',
    resource: `Tutorial:${id}`,
    metadata: { byCreator: true },
  })

  await removeTutorialById(id)

  revalidatePath('/me/creator/tutorials')
  redirect('/me/creator/tutorials')
}
