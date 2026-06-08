import { prisma, TutorialStatus } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { HomeRail } from '@/components/public/home-rail'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { SubCategoryChips } from '@/components/public/sub-category-chips'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

interface FixLayoutCategory {
  id: string
  slug: string
  name: string
  description: string | null
  subCategories: { id: string; slug: string; name: string }[]
}

interface FixLayoutProps {
  category: FixLayoutCategory
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
} as const

const COMMON_PROBLEMS = [
  { label: 'Leaky tap', q: 'leaky tap' },
  { label: 'Squeaky floorboard', q: 'squeaky floor' },
  { label: 'Tripped fuse', q: 'tripped fuse' },
  { label: 'Sticking door', q: 'sticking door' },
  { label: 'Damp patch', q: 'damp' },
  { label: 'Wobbly chair', q: 'wobbly chair' },
  { label: 'Cracked tile', q: 'cracked tile' },
  { label: 'Blocked drain', q: 'blocked drain' },
]

export async function FixLayout({
  category,
  searchParams,
  currentUserId,
}: FixLayoutProps) {
  const subSlug = searchParams.sub ?? null
  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null

  const [quickFixes, perSubResults] = await Promise.all([
    prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        timeMinutes: { lte: 30 },
      },
      orderBy: [{ publishedAt: 'desc' }],
      take: 8,
      select: CARD_SELECT,
    }),
    Promise.all(
      category.subCategories.map((sub) =>
        prisma.tutorial.findMany({
          where: {
            categoryId: category.id,
            subCategoryId: sub.id,
            status: TutorialStatus.PUBLISHED,
          },
          orderBy: [
            { bookmarks: { _count: 'desc' } },
            { publishedAt: 'desc' },
          ],
          take: 8,
          select: CARD_SELECT,
        }),
      ),
    ),
  ])

  const unfilteredRails = category.subCategories
    .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
    .filter((r) => r.tutorials.length > 0)

  const allIds = new Set<string>()
  for (const t of quickFixes as TutorialCardLike[]) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  const readerState = currentUserId
    ? await loadReaderState(currentUserId, Array.from(allIds))
    : emptyReaderState()

  return (
    <div className="fix-landing">
      <header className="fix-landing-header">
        <p className="fix-landing-eyebrow">{category.name}</p>
        <h1 className="fix-landing-title">What needs fixing?</h1>
        <CategoryScopedSearch
          categorySlug={category.slug}
          placeholder="Tell us what's wrong — e.g. 'leaky tap'"
          suggestions={COMMON_PROBLEMS}
        />
        <p className="fix-landing-stop">
          If it&apos;s gas, structural, or you smell smoke — stop. Call a
          professional.
        </p>
      </header>

      {category.subCategories.length > 0 && (
        <div className="category-chip-rows">
          <SubCategoryChips
            categorySlug={category.slug}
            subCategories={category.subCategories.map((s) => ({
              slug: s.slug,
              name: s.name,
            }))}
            activeSlug={activeSubSlug}
          />
        </div>
      )}

      {quickFixes.length > 0 && (
        <HomeRail
          heading="Quick fixes"
          subheading="Under 30 minutes, basic tools."
        >
          {(quickFixes as TutorialCardLike[]).map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {unfilteredRails.map(({ sub, tutorials }) => (
        <CategorySubRail
          key={sub.id}
          categorySlug={category.slug}
          subCategorySlug={sub.slug}
          heading={sub.name}
          tutorials={tutorials}
          readerState={readerState}
        />
      ))}

      <aside className="fix-landing-pro">
        <h3>Call a pro when:</h3>
        <ul>
          <li>You smell gas, ever.</li>
          <li>Electrical work behind the consumer unit.</li>
          <li>Anything structural — load-bearing walls, joists, roof timbers.</li>
          <li>Asbestos in older homes — get it tested before you cut.</li>
          <li>Anything where a mistake could leave you without water, power, or heat overnight.</li>
        </ul>
      </aside>
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
