import { headers } from 'next/headers'
import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
import { loadInSeasonForCategory } from '@/lib/in-season-for-category'
import { HomeRail } from '@/components/public/home-rail'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

interface PlantLayoutCategory {
  id: string
  slug: string
  name: string
  description: string | null
  subCategories: { id: string; slug: string; name: string }[]
}

interface PlantLayoutProps {
  category: PlantLayoutCategory
  searchParams: Record<string, string | undefined>
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
  plantingMonths: true,
  harvestMonths: true,
  regionsApplicable: true,
  containerFriendly: true,
  indoorFriendly: true,
  mood: true,
  season: true,
  cuisine: true,
  mealType: true,
  categoryId: true,
} as const

const MONTHS = [
  { v: 'january', short: 'Jan' },
  { v: 'february', short: 'Feb' },
  { v: 'march', short: 'Mar' },
  { v: 'april', short: 'Apr' },
  { v: 'may', short: 'May' },
  { v: 'june', short: 'Jun' },
  { v: 'july', short: 'Jul' },
  { v: 'august', short: 'Aug' },
  { v: 'september', short: 'Sep' },
  { v: 'october', short: 'Oct' },
  { v: 'november', short: 'Nov' },
  { v: 'december', short: 'Dec' },
]

const REGIONS = [
  { v: 'UK', label: 'UK' },
  { v: 'EU', label: 'EU' },
  { v: 'US_NORTH', label: 'US (North)' },
  { v: 'US_SOUTH', label: 'US (South)' },
  { v: 'AU_NZ', label: 'AU / NZ' },
  { v: 'ZA', label: 'South Africa' },
]

const VERB_ORDER = ['sow', 'plant', 'harvest'] as const
type Verb = (typeof VERB_ORDER)[number]

function currentMonth(): string {
  return MONTHS[new Date().getMonth()]!.v
}

async function inferRegion(): Promise<string> {
  try {
    const h = await headers()
    const cc = (h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country') ?? '').toUpperCase()
    if (cc === 'GB') return 'UK'
    if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'AT', 'PT', 'IE'].includes(cc)) return 'EU'
    if (cc === 'US') return 'US_NORTH'
    if (cc === 'AU' || cc === 'NZ') return 'AU_NZ'
    if (cc === 'ZA') return 'ZA'
  } catch {
    // fall through
  }
  return 'UK'
}

function buildHref(
  base: string,
  current: Record<string, string | undefined>,
  setKey: string,
  newValue: string | null,
): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(current)) {
    if (v !== undefined && k !== setKey) params.set(k, v)
  }
  if (newValue) params.set(setKey, newValue)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export async function PlantLayout({
  category,
  searchParams,
  currentUserId,
}: PlantLayoutProps) {
  const inferredRegion = await inferRegion()
  const month = searchParams.month ?? currentMonth()
  const region = searchParams.region ?? inferredRegion
  const verbRaw = (searchParams.verb ?? 'sow') as Verb
  const verb: Verb = VERB_ORDER.includes(verbRaw) ? verbRaw : 'sow'
  const sub = searchParams.sub ?? null
  const containerOnly = searchParams.container === '1'
  const indoorOnly = searchParams.indoor === '1'

  const base = `/${category.slug}`

  const verbField =
    verb === 'sow' || verb === 'plant' ? 'plantingMonths' : 'harvestMonths'

  const where: Record<string, unknown> = {
    categoryId: category.id,
    status: TutorialStatus.PUBLISHED,
    [verbField]: { has: month },
  }
  if (region) where.regionsApplicable = { has: region }
  if (sub) {
    const matched = category.subCategories.find((s) => s.slug === sub)
    if (matched) where.subCategoryId = matched.id
  }
  if (containerOnly) where.containerFriendly = true
  if (indoorOnly) where.indoorFriendly = true

  const [matches, anchors] = await Promise.all([
    prisma.tutorial.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }],
      take: 48,
      select: CARD_SELECT,
    }),
    loadInSeasonForCategory({
      categoryId: category.id,
      now: new Date(),
      countryCode: null,
      limit: 8,
    }),
  ])

  const allIds = new Set<string>()
  for (const t of matches as TutorialCardLike[]) allIds.add(t.id)
  for (const t of anchors as TutorialCardLike[]) allIds.add(t.id)
  const readerState = currentUserId
    ? await loadReaderState(currentUserId, Array.from(allIds))
    : emptyReaderState()

  const monthLabel = MONTHS.find((m) => m.v === month)?.short ?? month
  const regionLabel = REGIONS.find((r) => r.v === region)?.label ?? region

  return (
    <div className="plant-landing">
      <header className="plant-landing-header">
        <p className="plant-landing-eyebrow">{category.name}</p>
        <h1 className="plant-landing-title">
          What can I{' '}
          <Link
            href={buildHref(
              base,
              searchParams,
              'verb',
              verb === 'sow' ? 'plant' : verb === 'plant' ? 'harvest' : 'sow',
            )}
            className="plant-landing-verb"
          >
            {verb}
          </Link>{' '}
          in {monthLabel}, in the {regionLabel}?
        </h1>
        <p className="plant-landing-lede">
          Tap the verb to cycle through sow, plant, and harvest. Change the month or region below.
        </p>

        <nav className="plant-month-strip" aria-label="Month">
          {MONTHS.map((m) => {
            const isActive = m.v === month
            return (
              <Link
                key={m.v}
                href={buildHref(base, searchParams, 'month', isActive ? null : m.v)}
                className={`plant-month-chip${isActive ? ' is-active' : ''}`}
              >
                {m.short}
              </Link>
            )
          })}
        </nav>

        <div className="plant-secondary-row">
          <div className="plant-region-picker" aria-label="Region">
            {REGIONS.map((r) => {
              const isActive = r.v === region
              return (
                <Link
                  key={r.v}
                  href={buildHref(base, searchParams, 'region', isActive ? null : r.v)}
                  className={`plant-region-chip${isActive ? ' is-active' : ''}`}
                >
                  {r.label}
                </Link>
              )
            })}
          </div>
          <div className="plant-toggles">
            <Link
              href={buildHref(base, searchParams, 'container', containerOnly ? null : '1')}
              className={`plant-toggle${containerOnly ? ' is-active' : ''}`}
            >
              Container friendly
            </Link>
            <Link
              href={buildHref(base, searchParams, 'indoor', indoorOnly ? null : '1')}
              className={`plant-toggle${indoorOnly ? ' is-active' : ''}`}
            >
              Indoor friendly
            </Link>
          </div>
        </div>
      </header>

      <CategoryScopedSearch
        categorySlug={category.slug}
        placeholder="Plant name, variety or pest"
        suggestions={[
          { label: 'Tomatoes', q: 'tomato' },
          { label: 'Courgettes', q: 'courgette' },
          { label: 'Microgreens', q: 'microgreen' },
          { label: 'Permaculture', q: 'permaculture' },
        ]}
      />

      <section className="plant-results">
        {matches.length === 0 ? (
          <p className="category-empty">
            Nothing in our library to {verb} in {monthLabel} in the {regionLabel} yet. We
            are filling the garden library now; come back soon.
          </p>
        ) : (
          <div className="plant-results-grid">
            {(matches as TutorialCardLike[]).map((t) => (
              <HomeCard
                key={t.id}
                tutorial={t}
                state={readerStateFor(readerState, t.id)}
              />
            ))}
          </div>
        )}
      </section>

      {anchors.length > 0 && (
        <HomeRail heading={`In season right now in ${category.name.toLowerCase()}`}>
          {(anchors as TutorialCardLike[]).map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(readerState, t.id)}
            />
          ))}
        </HomeRail>
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
}
