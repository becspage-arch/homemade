import Link from 'next/link'
import { prisma, TutorialStatus, type Difficulty } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { CategoryHero } from '@/components/public/category-hero'
import { SubCategoryChips } from '@/components/public/sub-category-chips'
import { CategoryFilterChips } from '@/components/public/category-filter-chips'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
import { FoundationsPath } from '@/components/public/category/foundations-path'
import { loadRecentlyMade } from '@/lib/recently-made'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

interface SkillLayoutCategory {
  id: string
  slug: string
  name: string
  description: string | null
  subCategories: { id: string; slug: string; name: string }[]
}

interface SkillLayoutProps {
  category: SkillLayoutCategory
  searchParams: {
    sub?: string
    difficulty?: string
    equipment?: string
  }
  currentUserId: string | null
}

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  difficulty: true,
  totalMinutes: true,
  timeMinutes: true,
  dietaryFlags: true,
  category: { select: { slug: true, name: true } },
  hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
  publishedAt: true,
  subCategoryId: true,
  requiresKiln: true,
  requiresWheel: true,
} as const

const SEARCH_SUGGESTIONS: Record<string, { label: string; q: string }[]> = {
  'fibre-arts': [
    { label: 'Wet felting', q: 'wet felt' },
    { label: 'Drop spindle', q: 'drop spindle' },
    { label: 'Rigid heddle', q: 'rigid heddle' },
    { label: 'Natural dye', q: 'natural dye' },
    { label: 'Macramé', q: 'macrame' },
  ],
  'wood-natural-craft': [
    { label: 'Spoon carving', q: 'spoon' },
    { label: 'Green wood', q: 'green wood' },
    { label: 'Willow basket', q: 'willow' },
    { label: 'Pyrography', q: 'pyrography' },
    { label: 'Whittling', q: 'whittling' },
  ],
  'paper-word': [
    { label: 'Bookbinding', q: 'bookbinding' },
    { label: 'Calligraphy', q: 'calligraphy' },
    { label: 'Marbling', q: 'marbling' },
    { label: 'Zines', q: 'zine' },
    { label: 'Origami', q: 'origami' },
  ],
  'pottery-ceramics': [
    { label: 'Hand-building', q: 'hand building' },
    { label: 'No-equipment', q: 'no kiln no wheel' },
    { label: 'Surface decoration', q: 'surface' },
    { label: 'Throwing', q: 'throwing wheel' },
    { label: 'Glazing', q: 'glaze' },
  ],
}

function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (!raw) return null
  const upper = raw.toUpperCase()
  if (upper === 'BEGINNER' || upper === 'INTERMEDIATE' || upper === 'ADVANCED') {
    return upper as Difficulty
  }
  return null
}

type EquipmentFilter = 'none' | 'no-kiln' | 'no-wheel' | null

function parseEquipment(raw: string | undefined): EquipmentFilter {
  if (raw === 'none' || raw === 'no-kiln' || raw === 'no-wheel') return raw
  return null
}

export async function SkillLayout({
  category,
  searchParams,
  currentUserId,
}: SkillLayoutProps) {
  const difficulty = parseDifficulty(searchParams.difficulty)
  const equipment = parseEquipment(searchParams.equipment)
  const subSlug = searchParams.sub ?? null

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null
  const isFiltered = Boolean(difficulty) || Boolean(equipment) || Boolean(activeSubSlug)
  const showEquipmentFilters = category.slug === 'pottery-ceramics'

  const equipmentWhere =
    equipment === 'none'
      ? { requiresKiln: false, requiresWheel: false }
      : equipment === 'no-kiln'
        ? { requiresKiln: false }
        : equipment === 'no-wheel'
          ? { requiresWheel: false }
          : {}

  const preserveQuery: Record<string, string> = {}
  if (difficulty) preserveQuery.difficulty = difficulty.toLowerCase()
  if (equipment) preserveQuery.equipment = equipment

  const [recentlyMade, foundations] = await Promise.all([
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
    prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        foundational: true,
      },
      orderBy: [{ publishedAt: 'asc' }],
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        difficulty: true,
        category: { select: { slug: true, name: true } },
        hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      },
    }),
  ])

  let unfilteredRails: { sub: { id: string; slug: string; name: string }; tutorials: TutorialCardLike[] }[] = []
  let filteredTutorials: TutorialCardLike[] = []

  if (isFiltered) {
    const tutorials = await prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        ...(difficulty ? { difficulty } : {}),
        ...(activeSubSlug && subCategory ? { subCategoryId: subCategory.id } : {}),
        ...equipmentWhere,
      },
      orderBy: [{ publishedAt: 'desc' }],
      select: CARD_SELECT,
    })
    filteredTutorials = tutorials as TutorialCardLike[]
  } else {
    const perSubResults = await Promise.all(
      category.subCategories.map((sub) =>
        prisma.tutorial.findMany({
          where: {
            categoryId: category.id,
            subCategoryId: sub.id,
            status: TutorialStatus.PUBLISHED,
          },
          orderBy: [
            { bookmarks: { _count: 'desc' } },
            { projects: { _count: 'desc' } },
            { publishedAt: 'desc' },
          ],
          take: 8,
          select: CARD_SELECT,
        }),
      ),
    )
    unfilteredRails = category.subCategories
      .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
      .filter((r) => r.tutorials.length > 0)
  }

  const allIds = new Set<string>()
  for (const t of filteredTutorials) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  const readerState = currentUserId
    ? await loadReaderState(currentUserId, Array.from(allIds))
    : emptyReaderState()

  const suggestions = SEARCH_SUGGESTIONS[category.slug]
  const foundationsSubCat = category.subCategories.find((s) => s.slug === 'foundations')

  return (
    <div className="category-page">
      <CategoryHero category={category} />

      <CategoryScopedSearch
        categorySlug={category.slug}
        placeholder={`Project, technique or tool — try "${suggestions?.[0]?.q ?? 'beginner'}"`}
        suggestions={suggestions}
      />

      {foundations.length > 0 && (
        <FoundationsPath
          heading="Start here"
          subheading={`Foundation skills for ${category.name.toLowerCase()}.`}
          steps={foundations.map((f) => ({
            id: f.id,
            slug: f.slug,
            title: f.title,
            excerpt: f.excerpt,
            difficulty: f.difficulty,
            category: f.category,
            hero: f.hero,
          }))}
          seeAllHref={
            foundationsSubCat ? `/${category.slug}?sub=${foundationsSubCat.slug}` : null
          }
        />
      )}

      {showEquipmentFilters && (
        <PotteryEquipmentPicker
          categorySlug={category.slug}
          active={equipment}
          preserveQuery={
            activeSubSlug ? { ...preserveQuery, sub: activeSubSlug } : preserveQuery
          }
        />
      )}

      {category.subCategories.length > 0 && (
        <div className="category-chip-rows">
          <SubCategoryChips
            categorySlug={category.slug}
            subCategories={category.subCategories.map((s) => ({
              slug: s.slug,
              name: s.name,
            }))}
            activeSlug={activeSubSlug}
            preserveQuery={preserveQuery}
          />
          <CategoryFilterChips
            categorySlug={category.slug}
            showEquipment={false}
            activeDifficulty={difficulty}
            activeEquipment={null}
            preserveQuery={
              activeSubSlug ? { ...preserveQuery, sub: activeSubSlug } : preserveQuery
            }
          />
        </div>
      )}

      {recentlyMade.length > 0 && !isFiltered && (
        <RecentlyMadeRail
          heading={`Recent makes in ${category.name.toLowerCase()}`}
          tiles={recentlyMade}
        />
      )}

      {!isFiltered &&
        unfilteredRails.map(({ sub, tutorials }) => (
          <CategorySubRail
            key={sub.id}
            categorySlug={category.slug}
            subCategorySlug={sub.slug}
            heading={sub.name}
            tutorials={tutorials}
            readerState={readerState}
          />
        ))}

      {isFiltered && (
        <section className="category-filtered-section">
          {filteredTutorials.length === 0 ? (
            <p className="category-empty">
              Nothing in {category.name.toLowerCase()} matches that filter yet.
            </p>
          ) : (
            <div className="category-filtered-grid">
              {filteredTutorials.map((t) => (
                <HomeCard
                  key={t.id}
                  tutorial={t}
                  state={readerStateFor(readerState, t.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

interface TutorialCardLike {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes: number | null
  timeMinutes: number | null
  dietaryFlags: string[]
  category: { slug: string; name: string }
  hero: { cloudflareId: string | null; r2Key: string | null; alt: string | null } | null
  subCategoryId?: string | null
  requiresKiln?: boolean
  requiresWheel?: boolean
}

interface PotteryEquipmentPickerProps {
  categorySlug: string
  active: EquipmentFilter
  preserveQuery: Record<string, string>
}

const POTTERY_SETUPS: { value: EquipmentFilter; label: string; sub: string }[] = [
  { value: 'none', label: 'No equipment', sub: 'Hand-built, air-dry or oven-bake' },
  { value: 'no-wheel', label: 'No wheel', sub: 'Kiln access, hand-built shapes' },
  { value: 'no-kiln', label: 'No kiln', sub: 'Wheel access, plus alternative firing' },
  { value: null, label: 'Full setup', sub: 'Wheel plus kiln' },
]

function PotteryEquipmentPicker({
  categorySlug,
  active,
  preserveQuery,
}: PotteryEquipmentPickerProps) {
  function hrefFor(value: EquipmentFilter): string {
    const params = new URLSearchParams(preserveQuery)
    params.delete('equipment')
    if (value) params.set('equipment', value)
    const qs = params.toString()
    return qs ? `/${categorySlug}?${qs}` : `/${categorySlug}`
  }

  return (
    <section className="pottery-setup-picker" aria-label="Pottery setup">
      <h2 className="pottery-setup-picker-heading">
        What is your pottery setup?
      </h2>
      <p className="pottery-setup-picker-lede">
        We will show you what you can make with what you have access to.
      </p>
      <ul className="pottery-setup-picker-grid">
        {POTTERY_SETUPS.map((s) => {
          const isActive = active === s.value
          return (
            <li key={s.value ?? 'full'}>
              <Link
                href={hrefFor(s.value)}
                className={`pottery-setup-card${isActive ? ' is-active' : ''}`}
              >
                <span className="pottery-setup-card-label">{s.label}</span>
                <span className="pottery-setup-card-sub">{s.sub}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
