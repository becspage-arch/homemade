import Link from 'next/link'
import { prisma, UserProjectStatus } from '@homemade/db'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    status?: string
    sort?: string
    category?: string
  }>
}

const STATUS_PILL_CLASS: Record<UserProjectStatus, string> = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
}

const STATUS_LABEL: Record<UserProjectStatus, string> = {
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
}

type StatusFilter = 'all' | 'in-progress' | 'completed' | 'saved' | 'abandoned'

interface StatusFilterDef {
  value: StatusFilter
  label: string
}

const STATUS_FILTERS: StatusFilterDef[] = [
  { value: 'all', label: 'All' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'saved', label: 'Saved' },
  { value: 'abandoned', label: 'Abandoned' },
]

type SortOption = 'recent' | 'alphabetical' | 'progress'

interface SortDef {
  value: SortOption
  label: string
}

const SORT_OPTIONS: SortDef[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'alphabetical', label: 'A–Z' },
  { value: 'progress', label: 'Progress' },
]

interface ProjectItem {
  kind: 'project'
  id: string
  status: UserProjectStatus
  startedAt: Date
  completedAt: Date | null
  lastViewedAt: Date
  readingProgressPercent: number
  tutorial: {
    slug: string
    title: string
    excerpt: string | null
    category: { slug: string; name: string; id: string }
  }
}

interface SavedItem {
  kind: 'saved'
  id: string
  createdAt: Date
  tutorial: {
    slug: string
    title: string
    excerpt: string | null
    category: { slug: string; name: string; id: string }
  }
}

type ListItem = ProjectItem | SavedItem

export default async function MeProjectsPage({ searchParams }: PageProps) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const { status: statusParam, sort: sortParam, category: categoryParam } =
    await searchParams

  const statusFilter: StatusFilter =
    (STATUS_FILTERS.find((f) => f.value === statusParam)?.value as
      | StatusFilter
      | undefined) ?? 'all'
  const sort: SortOption =
    (SORT_OPTIONS.find((s) => s.value === sortParam)?.value as
      | SortOption
      | undefined) ?? 'recent'
  const categorySlug = categoryParam && categoryParam !== 'all' ? categoryParam : null

  // Decide which queries we actually need. "Saved" filter doesn't need
  // UserProjects; specific-status filters don't need Bookmarks. "All" needs
  // both. Promise.all keeps it a single round-trip.
  const wantsProjects = statusFilter !== 'saved'
  const wantsBookmarks = statusFilter === 'all' || statusFilter === 'saved'

  const projectStatusWhere: { status?: UserProjectStatus } = {}
  if (statusFilter === 'in-progress') projectStatusWhere.status = UserProjectStatus.IN_PROGRESS
  if (statusFilter === 'completed') projectStatusWhere.status = UserProjectStatus.COMPLETED
  if (statusFilter === 'abandoned') projectStatusWhere.status = UserProjectStatus.ABANDONED

  const [projects, savedBookmarks, categories] = await Promise.all([
    wantsProjects
      ? prisma.userProject.findMany({
          where: {
            userId: user.id,
            ...projectStatusWhere,
            ...(categorySlug
              ? { tutorial: { category: { slug: categorySlug } } }
              : {}),
          },
          include: {
            tutorial: {
              select: {
                slug: true,
                title: true,
                excerpt: true,
                category: { select: { id: true, slug: true, name: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
    wantsBookmarks
      ? prisma.bookmark.findMany({
          where: {
            userId: user.id,
            tutorial: {
              projects: { none: { userId: user.id } },
              ...(categorySlug ? { category: { slug: categorySlug } } : {}),
            },
          },
          include: {
            tutorial: {
              select: {
                slug: true,
                title: true,
                excerpt: true,
                category: { select: { id: true, slug: true, name: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true },
    }),
  ])

  const projectItems: ProjectItem[] = projects.map((p) => ({
    kind: 'project',
    id: p.id,
    status: p.status,
    startedAt: p.startedAt,
    completedAt: p.completedAt,
    lastViewedAt: p.lastViewedAt,
    readingProgressPercent: p.readingProgressPercent,
    tutorial: p.tutorial,
  }))

  const savedItems: SavedItem[] = savedBookmarks.map((b) => ({
    kind: 'saved',
    id: b.id,
    createdAt: b.createdAt,
    tutorial: b.tutorial,
  }))

  const items: ListItem[] = [...projectItems, ...savedItems]
  items.sort(itemSorter(sort))

  const buildHref = (next: {
    status?: StatusFilter
    sort?: SortOption
    category?: string | null
  }): string => {
    const params = new URLSearchParams()
    const s = next.status ?? statusFilter
    const so = next.sort ?? sort
    const c = next.category === undefined ? categorySlug : next.category
    if (s !== 'all') params.set('status', s)
    if (so !== 'recent') params.set('sort', so)
    if (c) params.set('category', c)
    const qs = params.toString()
    return qs ? `/me/projects?${qs}` : '/me/projects'
  }

  return (
    <section>
      <span className="me-section-label">Projects</span>
      <h2 className="me-section-title">What you&apos;re making</h2>

      <nav className="me-filters" aria-label="Filter projects by status">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.value
          return (
            <Link
              key={f.value}
              href={buildHref({ status: f.value })}
              className={`me-filter${isActive ? ' active' : ''}`}
            >
              {f.label}
            </Link>
          )
        })}
      </nav>

      <div className="me-projects-controls">
        <div className="me-projects-control-group">
          <span className="me-projects-control-label">Sort</span>
          <div className="me-projects-control-options">
            {SORT_OPTIONS.map((s) => {
              const isActive = sort === s.value
              return (
                <Link
                  key={s.value}
                  href={buildHref({ sort: s.value })}
                  className={`me-filter${isActive ? ' active' : ''}`}
                >
                  {s.label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="me-projects-control-group">
          <span className="me-projects-control-label">Category</span>
          <div className="me-projects-control-options">
            <Link
              href={buildHref({ category: null })}
              className={`me-filter${categorySlug === null ? ' active' : ''}`}
            >
              All
            </Link>
            {categories.map((c) => {
              const isActive = categorySlug === c.slug
              return (
                <Link
                  key={c.slug}
                  href={buildHref({ category: c.slug })}
                  className={`me-filter${isActive ? ' active' : ''}`}
                >
                  {c.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="me-empty">{emptyCopy(statusFilter, categorySlug)}</p>
      ) : (
        <div className="me-grid">
          {items.map((item) =>
            item.kind === 'project' ? (
              <Link
                key={`p-${item.id}`}
                href={`/me/projects/${item.id}`}
                className="me-project-card"
              >
                <span className="me-project-eyebrow">
                  {item.tutorial.category.name}
                </span>
                <span className="me-project-title">{item.tutorial.title}</span>
                {item.status === UserProjectStatus.IN_PROGRESS && (
                  <span className="me-progress-bar" aria-hidden="true">
                    <span
                      className="me-progress-bar-fill"
                      style={{ width: `${item.readingProgressPercent}%` }}
                    />
                  </span>
                )}
                <span className="me-project-meta">
                  <span className={`me-status-pill ${STATUS_PILL_CLASS[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                  {item.status === UserProjectStatus.IN_PROGRESS && (
                    <span>{item.readingProgressPercent}% through</span>
                  )}
                  {item.status === UserProjectStatus.COMPLETED && item.completedAt && (
                    <span>· {formatShortDate(item.completedAt)}</span>
                  )}
                  {item.status !== UserProjectStatus.COMPLETED && (
                    <span>· started {formatShortDate(item.startedAt)}</span>
                  )}
                </span>
              </Link>
            ) : (
              <Link
                key={`b-${item.id}`}
                href={`/${item.tutorial.category.slug}/${item.tutorial.slug}`}
                className="me-project-card"
              >
                <span className="me-project-eyebrow">
                  {item.tutorial.category.name}
                </span>
                <span className="me-project-title">{item.tutorial.title}</span>
                <span className="me-project-meta">
                  <span className="me-status-pill">Saved</span>
                  <span>· {formatShortDate(item.createdAt)}</span>
                </span>
              </Link>
            ),
          )}
        </div>
      )}
    </section>
  )
}

function itemSorter(sort: SortOption): (a: ListItem, b: ListItem) => number {
  return (a, b) => {
    if (sort === 'alphabetical') {
      return a.tutorial.title.localeCompare(b.tutorial.title)
    }
    if (sort === 'progress') {
      // Projects with progress first, then saved (no progress), then by progress
      // descending. IN_PROGRESS with higher % beats lower; COMPLETED counts as
      // 100%; ABANDONED as the project's snapshot %.
      const aScore = a.kind === 'project' ? progressScore(a) : -1
      const bScore = b.kind === 'project' ? progressScore(b) : -1
      if (aScore !== bScore) return bScore - aScore
      return recencyTime(b) - recencyTime(a)
    }
    return recencyTime(b) - recencyTime(a)
  }
}

function progressScore(p: ProjectItem): number {
  if (p.status === UserProjectStatus.COMPLETED) return 100
  return p.readingProgressPercent
}

function recencyTime(item: ListItem): number {
  if (item.kind === 'project') return item.lastViewedAt.getTime()
  return item.createdAt.getTime()
}

function emptyCopy(filter: StatusFilter, category: string | null): string {
  const cat = category ? ' in this category' : ''
  switch (filter) {
    case 'in-progress':
      return `No projects in progress${cat}.`
    case 'completed':
      return `No completed projects${cat}.`
    case 'saved':
      return `Nothing saved-but-not-started${cat}.`
    case 'abandoned':
      return `No abandoned projects${cat}.`
    default:
      return `Nothing here yet${cat}. Save tutorials with the bookmark icon, or hit "Start making" on any tutorial to begin a project.`
  }
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
