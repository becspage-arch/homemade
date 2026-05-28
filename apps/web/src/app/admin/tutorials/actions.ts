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
  UserRole,
  maybeFlipCategoryVisibility,
  maybeFlipCategoryPipelineComplete,
  type Prisma,
} from '@homemade/db'
import { getCurrentDbUser, isAdmin, hasRoleAtLeast } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { isValidSlug, slugify } from '@/lib/slug'
import { syncTutorialById, removeTutorialById } from '@/lib/search-sync'
import { syncRecipeIngredientsFromBody } from '@/lib/recipe-ingredients-sync'
import { notifyTechniquePublished } from '@/lib/technique-sweep-events'
import {
  DIETARY_FLAGS,
  MEAL_TYPES,
  MOOD_FLAGS,
  CUISINES,
} from './ingredient-constants'

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

  // Phase 8 Step 2 — recipe metadata
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
  /**
   * Free-form search aliases for the reverse-sweep
   * (phase_technique_linking_002). Comma-separated in the admin form;
   * empty by default. Ignored on non-TECHNIQUE rows at runtime.
   */
  aliases: string[]
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

const TUTORIAL_TYPES: readonly TutorialType[] = [
  TutorialType.RECIPE,
  TutorialType.TECHNIQUE,
]

function parseInt0OrNull(formData: FormData, key: string): number | null {
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

  const type = pickEnum(
    String(formData.get('type') ?? ''),
    TUTORIAL_TYPES,
    TutorialType.TECHNIQUE,
  )

  const yieldDescription =
    String(formData.get('yieldDescription') ?? '').trim() || null
  const freezeNotes = String(formData.get('freezeNotes') ?? '').trim() || null
  const batchNotes = String(formData.get('batchNotes') ?? '').trim() || null
  const makeAheadNotes =
    String(formData.get('makeAheadNotes') ?? '').trim() || null
  const cuisineRaw = String(formData.get('cuisine') ?? '').trim()
  const cuisine =
    cuisineRaw && (CUISINES as readonly string[]).includes(cuisineRaw)
      ? cuisineRaw
      : null
  const mealRaw = String(formData.get('mealType') ?? '').trim()
  const mealType = mealRaw && (MEAL_TYPES as readonly string[]).includes(mealRaw) ? mealRaw : null
  const temperatureNote =
    String(formData.get('temperatureNote') ?? '').trim() || null
  const leftoverRaw = String(formData.get('leftoverTutorialId') ?? '').trim()
  const leftoverTutorialId = leftoverRaw || null

  // Aliases — admin form posts a single comma-separated string. Split,
  // trim, drop empties, dedupe.
  const aliasesRaw = String(formData.get('aliases') ?? '')
  const aliasesSet = new Set<string>()
  for (const part of aliasesRaw.split(',')) {
    const trimmed = part.trim()
    if (trimmed) aliasesSet.add(trimmed)
  }
  const aliases = Array.from(aliasesSet)

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
    timeMinutes: parseInt0OrNull(formData, 'timeMinutes'),
    heroMediaId,

    type,
    servings: parseInt0OrNull(formData, 'servings'),
    yieldDescription,
    prepMinutes: parseInt0OrNull(formData, 'prepMinutes'),
    cookMinutes: parseInt0OrNull(formData, 'cookMinutes'),
    restingMinutes: parseInt0OrNull(formData, 'restingMinutes'),
    chillingMinutes: parseInt0OrNull(formData, 'chillingMinutes'),
    scalable: parseBool(formData, 'scalable'),
    freezable: parseBool(formData, 'freezable'),
    freezeNotes,
    batchable: parseBool(formData, 'batchable'),
    batchNotes,
    makeAheadNotes,
    dietaryFlags: parseStringArrayAllowed(formData, 'dietaryFlags', DIETARY_FLAGS),
    cuisine,
    mealType,
    mood: parseStringArrayAllowed(formData, 'mood', MOOD_FLAGS),
    temperatureCelsius: parseInt0OrNull(formData, 'temperatureCelsius'),
    temperatureNote,
    foundational: parseBool(formData, 'foundational'),
    leftoverTutorialId,
    aliases,
  }
}

function computeTotalMinutes(input: TutorialMetadataInput): number | null {
  const parts = [
    input.prepMinutes,
    input.cookMinutes,
    input.restingMinutes,
    input.chillingMinutes,
  ].filter((v): v is number => v !== null)
  if (parts.length === 0) return input.timeMinutes
  return parts.reduce((sum, n) => sum + n, 0)
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

/**
 * Editor-tier actor for actions a CREATOR can also perform on their own rows
 * (edit, save, submit for review). Caller must subsequently check creator
 * ownership on the affected row when role === CREATOR.
 */
async function requireContentActor() {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.CREATOR)) {
    throw new Error('Not authorised.')
  }
  return user
}

async function assertRowAccessible(
  tutorialId: string,
  user: { id: string; role: UserRole },
): Promise<void> {
  if (hasRoleAtLeast(user, UserRole.EDITOR)) return
  // CREATOR — only their own rows
  const row = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    select: { creatorId: true },
  })
  if (!row || row.creatorId !== user.id) {
    throw new Error('Not authorised for this tutorial.')
  }
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
  const actor = await requireContentActor()
  const input = parseFull(formData)
  const err = validateMetadata(input)
  if (err) throw new Error(err)

  const slugTaken = await prisma.tutorial.findUnique({ where: { slug: input.slug } })
  if (slugTaken) throw new Error(`A tutorial with slug "${input.slug}" already exists.`)

  await assertCategoryExists(input.categoryId)
  await assertSubCategoryFitsCategory(input.subCategoryId, input.categoryId)
  await assertHeroMediaExists(input.heroMediaId)

  const totalMinutes = computeTotalMinutes(input)

  // CREATOR-authored rows attach a creatorId so the byline + RBAC scoping work.
  const isCreator = actor.role === UserRole.CREATOR
  const creatorId = isCreator ? actor.id : null

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
      creatorId,

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
      aliases: input.aliases,
    },
  })

  await syncRecipeIngredientsFromBody(created.id, input.body)

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
  const actor = await requireContentActor()
  await assertRowAccessible(id, actor)
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
      sourceType: input.sourceType,
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
      aliases: input.aliases,
    },
  })

  await syncRecipeIngredientsFromBody(updated.id, input.body)

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

  // Reverse-sweep (phase_technique_linking_002). A PUBLISHED TECHNIQUE
  // whose title / slug / aliases just widened should re-fire the sweep
  // so existing recipes pick up newly-matching language. We skip when
  // the matcher fields didn't change, so a typo fix to the body doesn't
  // burn an Inngest run.
  if (
    updated.type === TutorialType.TECHNIQUE &&
    updated.status === TutorialStatus.PUBLISHED
  ) {
    const matcherChanged =
      updated.title !== existing.title ||
      updated.slug !== existing.slug ||
      !arraysEqual(updated.aliases, existing.aliases)
    if (matcherChanged) {
      await notifyTechniquePublished(updated.id)
    }
  }

  revalidatePath('/admin/tutorials')
  revalidatePath(`/admin/tutorials/${id}`)
  redirect(`/admin/tutorials/${id}`)
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((v, i) => v === sortedB[i])
}

/**
 * Walk a TipTap body and sum the items in every `ingredientsList` block.
 * Used by the publish-gate to refuse publishing a RECIPE with empty
 * ingredients. Mirrors `countIngredientsListItems` in the upload-tutorial
 * script so the rule fires identically from both upload paths.
 */
function countIngredientsListItemsInBody(body: unknown): number {
  if (!body || typeof body !== 'object') return 0
  let count = 0
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const n = node as { type?: string; attrs?: { items?: unknown }; content?: unknown[] }
    if (n.type === 'ingredientsList') {
      const items = Array.isArray(n.attrs?.items) ? n.attrs.items : []
      count += items.length
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child)
    }
  }
  walk(body)
  return count
}

export async function transitionTutorialStatus(
  id: string,
  formData: FormData,
): Promise<void> {
  const actor = await requireContentActor()
  await assertRowAccessible(id, actor)
  const targetRaw = String(formData.get('target') ?? '')
  const target = pickEnumOrNull(targetRaw, [
    TutorialStatus.DRAFT,
    TutorialStatus.SCHEDULED,
    TutorialStatus.PUBLISHED,
    TutorialStatus.ARCHIVED,
    TutorialStatus.PENDING_MODERATION,
  ])
  if (!target) throw new Error('Invalid target status.')

  // CREATOR can only submit drafts for review. Publish / schedule / archive
  // are editor-and-above-only.
  if (actor.role === UserRole.CREATOR) {
    if (target !== TutorialStatus.PENDING_MODERATION && target !== TutorialStatus.DRAFT) {
      throw new Error('Creators can only submit drafts for review.')
    }
  }

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
    // Publish-gate: a RECIPE going live must carry at least one populated
    // ingredientsList block. Mirrors the same check in the upload-tutorial
    // script (see packages/db/scripts/upload-tutorial-types.ts). Blocks the
    // regression that shipped ~390 baking recipes with empty ingredients
    // in the 2026-05-14 → 2026-05-20 batch.
    if (existing.type === TutorialType.RECIPE) {
      const itemCount = countIngredientsListItemsInBody(existing.body)
      if (itemCount === 0) {
        throw new Error(
          'Cannot publish this recipe — the body has no ingredientsList items. ' +
            'Add the structured ingredients block in the editor before publishing, ' +
            'or change the tutorial type to TECHNIQUE if it isn\'t a recipe.',
        )
      }
    }
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

  if (target === TutorialStatus.PUBLISHED) {
    await maybeFlipCategoryVisibility(prisma, existing.categoryId)
    await maybeFlipCategoryPipelineComplete(prisma, existing.categoryId)
    // Reverse-sweep (phase_technique_linking_002). A TECHNIQUE that
    // just went live should re-annotate every same-Category recipe
    // whose body already mentions it.
    if (existing.type === TutorialType.TECHNIQUE) {
      await notifyTechniquePublished(id)
    }
  }

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
