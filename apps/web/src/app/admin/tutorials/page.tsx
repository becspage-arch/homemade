import Link from 'next/link'
import {
  prisma,
  Difficulty,
  Season,
  TutorialStatus,
  TutorialType,
  UserRole,
} from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import {
  parseFilters,
  buildWhere,
  buildOrderBy,
  serialiseFilters,
  SORT_OPTIONS,
  PAGE_SIZE_OPTIONS,
  HERO_OPTIONS,
} from './filters'
import {
  CUISINE_LABEL,
  CUISINES,
  DIETARY_FLAGS,
  DIETARY_LABEL,
  MEAL_TYPE_LABEL,
  MEAL_TYPES,
  MOOD_FLAGS,
  MOOD_LABEL,
} from './ingredient-constants'
import { mediaUrl } from '@/lib/media'
import { ContentFilterForm } from '@/components/admin/tutorials/content-filter-form'
import {
  ContentListClient,
  type ContentRow,
  type SavedFilterChip,
} from '@/components/admin/tutorials/content-list-client'

import './tutorials-list.css'

export const dynamic = 'force-dynamic'

type SearchParamsShape = Record<string, string | string[] | undefined>

export default async function TutorialsContentListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>
}) {
  const user = await getCurrentDbUser()
  if (!user) return null

  const params = await searchParams
  const filters = parseFilters(params)
  const where = buildWhere(filters, { id: user.id, role: user.role })
  const orderBy = buildOrderBy(filters)
  const skip = (filters.page - 1) * filters.pageSize

  const [rows, total, categoryRows, creatorRows, savedFilters] = await Promise.all([
    prisma.tutorial.findMany({
      where,
      orderBy,
      skip,
      take: filters.pageSize,
      include: {
        category: { select: { name: true, slug: true } },
        hero: {
          select: { cloudflareId: true, r2Key: true },
        },
        creator: { select: { displayHandle: true, name: true } },
      },
    }),
    prisma.tutorial.count({ where }),
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true },
    }),
    hasRoleAtLeast(user, UserRole.EDITOR)
      ? prisma.user.findMany({
          where: { isCreator: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, email: true, displayHandle: true },
        })
      : Promise.resolve([]),
    prisma.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
  ])

  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize))

  const contentRows: ContentRow[] = rows.map((r) => {
    const heroUrl = mediaUrl(r.hero ?? null, 'thumbnail')
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      categoryName: r.category?.name ?? null,
      categorySlug: r.category?.slug ?? null,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      updatedAt: r.updatedAt.toISOString(),
      heroUrl,
      type: r.type,
      creatorHandle: r.creator?.displayHandle ?? r.creator?.name ?? null,
    }
  })

  const savedFilterChips: SavedFilterChip[] = savedFilters
    .map((sf) => {
      const raw = sf.filterQuery as { search?: string } | null
      return {
        id: sf.id,
        name: sf.name,
        search: raw?.search ?? '',
      }
    })
    .filter((sf) => sf.search)

  const authorOptions = [
    { value: 'any', label: 'Anyone' },
    { value: 'homemade', label: 'Homemade' },
    ...creatorRows.map((c) => ({
      value: c.id,
      label: c.displayHandle ?? c.name ?? c.email,
    })),
  ]

  const currentSearchString = serialiseFilters(filters)

  const canBulk = hasRoleAtLeast(user, UserRole.EDITOR)
  const canDelete = hasRoleAtLeast(user, UserRole.ADMIN)

  return (
    <div className="content-list-page">
      <header className="content-list-header">
        <div>
          <h1>Content</h1>
          <p className="content-list-subtitle">
            {user.role === UserRole.CREATOR
              ? 'Your tutorials only — submit for review when ready.'
              : 'Every tutorial in the library — recipes, techniques, articles, practices.'}
          </p>
        </div>
        <Link href="/admin/tutorials/new" className="content-list-new">
          + new tutorial
        </Link>
      </header>

      <ContentFilterForm
        q={filters.q}
        statuses={filters.statuses}
        types={filters.types}
        categorySlugs={filters.categorySlugs}
        cuisines={filters.cuisines}
        mealTypes={filters.mealTypes}
        moods={filters.moods}
        dietaries={filters.dietaries}
        difficulties={filters.difficulties}
        seasons={filters.seasons}
        hero={filters.hero}
        author={filters.author}
        sort={filters.sort}
        view={filters.view}
        pageSize={filters.pageSize}
        statusOptions={Object.values(TutorialStatus).map((s) => ({
          value: s,
          label: s.toLowerCase().replace('_', ' '),
        }))}
        typeOptions={Object.values(TutorialType).map((t) => ({
          value: t,
          label: t.toLowerCase(),
        }))}
        categoryOptions={categoryRows}
        cuisineOptions={CUISINES.map((c) => ({ value: c, label: CUISINE_LABEL[c] }))}
        mealTypeOptions={MEAL_TYPES.map((m) => ({ value: m, label: MEAL_TYPE_LABEL[m] }))}
        moodOptions={MOOD_FLAGS.map((m) => ({ value: m, label: MOOD_LABEL[m] }))}
        dietaryOptions={DIETARY_FLAGS.map((d) => ({ value: d, label: DIETARY_LABEL[d] }))}
        difficultyOptions={Object.values(Difficulty).map((d) => ({
          value: d,
          label: d.toLowerCase(),
        }))}
        seasonOptions={Object.values(Season).map((s) => ({
          value: s,
          label: s.toLowerCase().replace('_', ' '),
        }))}
        heroOptions={HERO_OPTIONS.map((h) => ({ value: h.value, label: h.label }))}
        authorOptions={authorOptions}
        sortOptions={SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
        canFilterAuthor={hasRoleAtLeast(user, UserRole.EDITOR)}
      />

      <p className="content-list-summary">
        {total === 0
          ? 'No tutorials match the current filter.'
          : `Showing ${skip + 1}–${Math.min(skip + contentRows.length, total)} of ${total.toLocaleString('en-GB')}`}
      </p>

      <ContentListClient
        rows={contentRows}
        savedFilters={savedFilterChips}
        currentSearchString={currentSearchString}
        totalMatching={total}
        canBulk={canBulk}
        canDelete={canDelete}
        view={filters.view}
      />

      {pageCount > 1 && <Pagination pageCount={pageCount} filters={filters} />}
    </div>
  )
}

function Pagination({
  pageCount,
  filters,
}: {
  pageCount: number
  filters: ReturnType<typeof parseFilters>
}) {
  const cap = Math.min(pageCount, 30)
  return (
    <nav className="content-pagination" aria-label="Content pages">
      {Array.from({ length: cap }).map((_, i) => {
        const p = i + 1
        const search = serialiseFilters({ ...filters, page: p })
        return (
          <Link
            key={p}
            href={`/admin/tutorials${search}`}
            className={`content-pagination-page${p === filters.page ? ' active' : ''}`}
          >
            {p}
          </Link>
        )
      })}
      {pageCount > cap && (
        <span className="content-pagination-ellipsis">… {pageCount} pages</span>
      )}
    </nav>
  )
}
