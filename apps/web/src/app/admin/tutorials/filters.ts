import {
  Difficulty,
  Season,
  TutorialStatus,
  TutorialType,
  HeroStrategy,
  UserRole,
  type Prisma,
} from '@homemade/db'
import {
  CUISINES,
  DIETARY_FLAGS,
  MEAL_TYPES,
  MOOD_FLAGS,
} from './ingredient-constants'

export const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Updated (newest)' },
  { value: 'updated_asc', label: 'Updated (oldest)' },
  { value: 'published_desc', label: 'Published (newest)' },
  { value: 'published_asc', label: 'Published (oldest)' },
  { value: 'title_asc', label: 'Title A→Z' },
  { value: 'title_desc', label: 'Title Z→A' },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export const HERO_OPTIONS = [
  { value: 'any', label: 'Any hero' },
  { value: 'real', label: 'Real photo' },
  { value: 'procedural', label: 'Procedural card' },
  { value: 'plate', label: 'Public-domain plate' },
  { value: 'none', label: 'No hero' },
] as const

export type HeroFilter = (typeof HERO_OPTIONS)[number]['value']

export const VIEW_OPTIONS = ['table', 'grid'] as const
export type ContentView = (typeof VIEW_OPTIONS)[number]

export interface ContentFilters {
  q: string
  statuses: TutorialStatus[]
  types: TutorialType[]
  categorySlugs: string[]
  subCategorySlugs: string[]
  cuisines: string[]
  mealTypes: string[]
  moods: string[]
  dietaries: string[]
  difficulties: Difficulty[]
  seasons: Season[]
  hero: HeroFilter
  author: string // 'any' | 'homemade' | <creator userId>
  sort: SortValue
  view: ContentView
  page: number
  pageSize: PageSize
}

const ALL_STATUS = Object.values(TutorialStatus) as TutorialStatus[]
const ALL_TYPE = Object.values(TutorialType) as TutorialType[]
const ALL_DIFFICULTY = Object.values(Difficulty) as Difficulty[]
const ALL_SEASON = Object.values(Season) as Season[]

function getAll(params: URLSearchParams | Record<string, string | string[] | undefined>, key: string): string[] {
  if (params instanceof URLSearchParams) {
    return params.getAll(key).flatMap((v) => v.split(',')).filter(Boolean)
  }
  const raw = params[key]
  if (Array.isArray(raw)) return raw.flatMap((v) => v.split(',')).filter(Boolean)
  if (typeof raw === 'string') return raw.split(',').filter(Boolean)
  return []
}

function getOne(params: URLSearchParams | Record<string, string | string[] | undefined>, key: string): string {
  if (params instanceof URLSearchParams) return params.get(key) ?? ''
  const raw = params[key]
  if (Array.isArray(raw)) return raw[0] ?? ''
  return typeof raw === 'string' ? raw : ''
}

function pickAllowed<T extends string>(values: string[], allowed: readonly T[]): T[] {
  const set = new Set(allowed as readonly string[])
  return values.filter((v) => set.has(v)) as T[]
}

export function parseFilters(
  raw: URLSearchParams | Record<string, string | string[] | undefined>,
): ContentFilters {
  const sortRaw = getOne(raw, 'sort')
  const sort = (SORT_OPTIONS.find((s) => s.value === sortRaw)?.value ?? 'updated_desc') as SortValue

  const viewRaw = getOne(raw, 'view')
  const view = (VIEW_OPTIONS.includes(viewRaw as ContentView) ? viewRaw : 'table') as ContentView

  const heroRaw = getOne(raw, 'hero')
  const hero = (HERO_OPTIONS.find((h) => h.value === heroRaw)?.value ?? 'any') as HeroFilter

  const pageSizeRaw = Number.parseInt(getOne(raw, 'pageSize'), 10)
  const pageSize = (PAGE_SIZE_OPTIONS.includes(pageSizeRaw as PageSize)
    ? pageSizeRaw
    : 50) as PageSize

  const pageRaw = Number.parseInt(getOne(raw, 'page'), 10)
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1

  const authorRaw = getOne(raw, 'author').trim()
  const author = authorRaw || 'any'

  return {
    q: getOne(raw, 'q').trim(),
    statuses: pickAllowed(getAll(raw, 'status'), ALL_STATUS),
    types: pickAllowed(getAll(raw, 'type'), ALL_TYPE),
    categorySlugs: getAll(raw, 'category'),
    subCategorySlugs: getAll(raw, 'subCategory'),
    cuisines: pickAllowed(getAll(raw, 'cuisine'), CUISINES),
    mealTypes: pickAllowed(getAll(raw, 'mealType'), MEAL_TYPES),
    moods: pickAllowed(getAll(raw, 'mood'), MOOD_FLAGS),
    dietaries: pickAllowed(getAll(raw, 'dietary'), DIETARY_FLAGS),
    difficulties: pickAllowed(getAll(raw, 'difficulty'), ALL_DIFFICULTY),
    seasons: pickAllowed(getAll(raw, 'season'), ALL_SEASON),
    hero,
    author,
    sort,
    view,
    page,
    pageSize,
  }
}

export function buildWhere(
  f: ContentFilters,
  viewer: { id: string; role: UserRole },
): Prisma.TutorialWhereInput {
  const where: Prisma.TutorialWhereInput = {}

  // RBAC scoping: CREATOR sees own. EDITOR / ADMIN see all.
  if (viewer.role === UserRole.CREATOR) {
    where.creatorId = viewer.id
  }

  if (f.q) {
    const q = f.q
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
      { subtitle: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (f.statuses.length > 0) where.status = { in: f.statuses }
  if (f.types.length > 0) where.type = { in: f.types }
  if (f.categorySlugs.length > 0) where.category = { slug: { in: f.categorySlugs } }
  if (f.subCategorySlugs.length > 0)
    where.subCategory = { slug: { in: f.subCategorySlugs } }
  if (f.cuisines.length > 0) where.cuisine = { in: f.cuisines }
  if (f.mealTypes.length > 0) where.mealType = { in: f.mealTypes }
  if (f.moods.length > 0) where.mood = { hasSome: f.moods }
  if (f.dietaries.length > 0) where.dietaryFlags = { hasEvery: f.dietaries }
  if (f.difficulties.length > 0) where.difficulty = { in: f.difficulties }
  if (f.seasons.length > 0) where.season = { in: f.seasons }
  if (f.hero === 'real') where.heroImageStrategy = HeroStrategy.REAL_PHOTO
  else if (f.hero === 'procedural') where.heroImageStrategy = HeroStrategy.PROCEDURAL_CARD
  else if (f.hero === 'plate') where.heroImageStrategy = HeroStrategy.PUBLIC_DOMAIN_PLATE
  else if (f.hero === 'none') where.heroMediaId = null

  // Author filter is ignored for CREATOR — they only see their own anyway.
  if (viewer.role !== UserRole.CREATOR) {
    if (f.author === 'homemade') where.creatorId = null
    else if (f.author !== 'any') where.creatorId = f.author
  }

  return where
}

export function buildOrderBy(f: ContentFilters): Prisma.TutorialOrderByWithRelationInput {
  switch (f.sort) {
    case 'updated_asc':
      return { updatedAt: 'asc' }
    case 'published_desc':
      return { publishedAt: { sort: 'desc', nulls: 'last' } }
    case 'published_asc':
      return { publishedAt: { sort: 'asc', nulls: 'last' } }
    case 'title_asc':
      return { title: 'asc' }
    case 'title_desc':
      return { title: 'desc' }
    case 'updated_desc':
    default:
      return { updatedAt: 'desc' }
  }
}

/**
 * Serialise filters back to a URL search string. Stable key order so links
 * are diffable.
 */
export function serialiseFilters(f: Partial<ContentFilters>): string {
  const sp = new URLSearchParams()
  if (f.q) sp.set('q', f.q)
  for (const s of f.statuses ?? []) sp.append('status', s)
  for (const t of f.types ?? []) sp.append('type', t)
  for (const c of f.categorySlugs ?? []) sp.append('category', c)
  for (const sc of f.subCategorySlugs ?? []) sp.append('subCategory', sc)
  for (const c of f.cuisines ?? []) sp.append('cuisine', c)
  for (const m of f.mealTypes ?? []) sp.append('mealType', m)
  for (const m of f.moods ?? []) sp.append('mood', m)
  for (const d of f.dietaries ?? []) sp.append('dietary', d)
  for (const d of f.difficulties ?? []) sp.append('difficulty', d)
  for (const s of f.seasons ?? []) sp.append('season', s)
  if (f.hero && f.hero !== 'any') sp.set('hero', f.hero)
  if (f.author && f.author !== 'any') sp.set('author', f.author)
  if (f.sort && f.sort !== 'updated_desc') sp.set('sort', f.sort)
  if (f.view && f.view !== 'table') sp.set('view', f.view)
  if (f.page && f.page !== 1) sp.set('page', String(f.page))
  if (f.pageSize && f.pageSize !== 50) sp.set('pageSize', String(f.pageSize))
  const out = sp.toString()
  return out ? `?${out}` : ''
}
