'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  prisma,
  Difficulty,
  Season,
  SourceType,
  TutorialStatus,
  TutorialType,
  type Prisma,
} from '@homemade/db'
import { audit } from './audit'
import { getCurrentDbUser } from './get-current-user'
import { isValidSlug, slugify } from './slug'
import { syncTutorialById, removeTutorialById } from './search-sync'
import { captureServerEvent } from './posthog'
import { syncRecipeIngredientsFromBody } from './recipe-ingredients-sync'

const TUTORIAL_TYPES: readonly TutorialType[] = [
  TutorialType.RECIPE,
  TutorialType.TECHNIQUE,
]
const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert',
  'drink',
  'side',
] as const
const DIETARY_FLAGS = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'dairyFree',
  'halal',
  'kosher',
  'nutFree',
  'pescatarian',
] as const
const MOOD_FLAGS = [
  'comfortFood',
  'weeknight',
  'party',
  'kidFriendly',
  'freezerFriendly',
  'healthy',
  'showstopper',
  'lightAndFresh',
] as const

function parseIntOrNull(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? '').trim()
  if (raw === '') return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function parseBool(formData: FormData, key: string): boolean {
  const raw = String(formData.get(key) ?? '').toLowerCase()
  return raw === 'true' || raw === 'on' || raw === '1'
}

function parseStringArrayAllowed(
  formData: FormData,
  key: string,
  allowed: readonly string[],
): string[] {
  return formData
    .getAll(key)
    .map((v) => String(v).trim())
    .filter((v) => allowed.includes(v))
}

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

  type: TutorialType
  servings: number | null
  yieldDescription: string | null
  prepMinutes: number | null
  cookMinutes: number | null
  restingMinutes: number | null
  chillingMinutes: number | null
  scalable: boolean
  freezable: boolean
  freezeNotes: string | null
  batchable: boolean
  batchNotes: string | null
  makeAheadNotes: string | null
  dietaryFlags: string[]
  cuisine: string | null
  mealType: string | null
  mood: string[]
  temperatureCelsius: number | null
  temperatureNote: string | null
  foundational: boolean
  leftoverTutorialId: string | null
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

  const mealRaw = String(formData.get('mealType') ?? '').trim()
  const mealType =
    mealRaw && (MEAL_TYPES as readonly string[]).includes(mealRaw) ? mealRaw : null

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
    timeMinutes: parseIntOrNull(formData, 'timeMinutes'),
    heroMediaId: String(formData.get('heroMediaId') ?? '').trim() || null,
    body: parseBody(String(formData.get('body') ?? '')),

    type: pickEnum(
      String(formData.get('type') ?? ''),
      TUTORIAL_TYPES,
      TutorialType.TECHNIQUE,
    ),
    servings: parseIntOrNull(formData, 'servings'),
    yieldDescription:
      String(formData.get('yieldDescription') ?? '').trim() || null,
    prepMinutes: parseIntOrNull(formData, 'prepMinutes'),
    cookMinutes: parseIntOrNull(formData, 'cookMinutes'),
    restingMinutes: parseIntOrNull(formData, 'restingMinutes'),
    chillingMinutes: parseIntOrNull(formData, 'chillingMinutes'),
    scalable: parseBool(formData, 'scalable'),
    freezable: parseBool(formData, 'freezable'),
    freezeNotes: String(formData.get('freezeNotes') ?? '').trim() || null,
    batchable: parseBool(formData, 'batchable'),
    batchNotes: String(formData.get('batchNotes') ?? '').trim() || null,
    makeAheadNotes: String(formData.get('makeAheadNotes') ?? '').trim() || null,
    dietaryFlags: parseStringArrayAllowed(formData, 'dietaryFlags', DIETARY_FLAGS),
    cuisine: String(formData.get('cuisine') ?? '').trim() || null,
    mealType,
    mood: parseStringArrayAllowed(formData, 'mood', MOOD_FLAGS),
    temperatureCelsius: parseIntOrNull(formData, 'temperatureCelsius'),
    temperatureNote:
      String(formData.get('temperatureNote') ?? '').trim() || null,
    foundational: parseBool(formData, 'foundational'),
    leftoverTutorialId:
      String(formData.get('leftoverTutorialId') ?? '').trim() || null,
  }
}

function computeTotalMinutes(input: CreatorTutorialInput): number | null {
  const parts = [
    input.prepMinutes,
    input.cookMinutes,
    input.restingMinutes,
    input.chillingMinutes,
  ].filter((v): v is number => v !== null)
  if (parts.length === 0) return input.timeMinutes
  return parts.reduce((sum, n) => sum + n, 0)
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

  const totalMinutes = computeTotalMinutes(input)

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

      type: input.type,
      servings: input.servings,
      yieldDescription: input.yieldDescription,
      prepMinutes: input.prepMinutes,
      cookMinutes: input.cookMinutes,
      restingMinutes: input.restingMinutes,
      chillingMinutes: input.chillingMinutes,
      totalMinutes,
      scalable: input.scalable,
      freezable: input.freezable,
      freezeNotes: input.freezeNotes,
      batchable: input.batchable,
      batchNotes: input.batchNotes,
      makeAheadNotes: input.makeAheadNotes,
      dietaryFlags: input.dietaryFlags,
      cuisine: input.cuisine,
      mealType: input.mealType,
      mood: input.mood,
      temperatureCelsius: input.temperatureCelsius,
      temperatureNote: input.temperatureNote,
      foundational: input.foundational,
      leftoverTutorialId: input.leftoverTutorialId,
    },
  })

  await syncRecipeIngredientsFromBody(created.id, input.body)

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

  await captureServerEvent({
    event: 'creator_tutorial_drafted',
    distinctId: actor.clerkId,
    properties: { tutorialId: created.id },
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

  const totalMinutes = computeTotalMinutes(input)

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

      type: input.type,
      servings: input.servings,
      yieldDescription: input.yieldDescription,
      prepMinutes: input.prepMinutes,
      cookMinutes: input.cookMinutes,
      restingMinutes: input.restingMinutes,
      chillingMinutes: input.chillingMinutes,
      totalMinutes,
      scalable: input.scalable,
      freezable: input.freezable,
      freezeNotes: input.freezeNotes,
      batchable: input.batchable,
      batchNotes: input.batchNotes,
      makeAheadNotes: input.makeAheadNotes,
      dietaryFlags: input.dietaryFlags,
      cuisine: input.cuisine,
      mealType: input.mealType,
      mood: input.mood,
      temperatureCelsius: input.temperatureCelsius,
      temperatureNote: input.temperatureNote,
      foundational: input.foundational,
      leftoverTutorialId: input.leftoverTutorialId,
    },
  })

  await syncRecipeIngredientsFromBody(updated.id, input.body)

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
