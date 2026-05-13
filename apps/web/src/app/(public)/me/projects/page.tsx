import Link from 'next/link'
import { prisma, UserProjectStatus } from '@homemade/db'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string }>
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

const FILTERS: { value: string; label: string; status: UserProjectStatus | null }[] = [
  { value: 'all', label: 'All', status: null },
  { value: 'in-progress', label: 'In progress', status: UserProjectStatus.IN_PROGRESS },
  { value: 'completed', label: 'Completed', status: UserProjectStatus.COMPLETED },
  { value: 'abandoned', label: 'Abandoned', status: UserProjectStatus.ABANDONED },
]

export default async function MeProjectsPage({ searchParams }: PageProps) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const { status: statusParam } = await searchParams
  const filter: (typeof FILTERS)[number] =
    FILTERS.find((f) => f.value === statusParam) ?? FILTERS[0]!

  const projects = await prisma.userProject.findMany({
    where: {
      userId: user.id,
      ...(filter.status ? { status: filter.status } : {}),
    },
    orderBy: [{ lastViewedAt: 'desc' }, { startedAt: 'desc' }],
    include: {
      tutorial: {
        select: {
          slug: true,
          title: true,
          excerpt: true,
          category: { select: { slug: true, name: true } },
        },
      },
    },
  })

  return (
    <section>
      <span className="me-section-label">Projects</span>
      <h2 className="me-section-title">What you&apos;re making</h2>

      <nav className="me-filters" aria-label="Filter projects by status">
        {FILTERS.map((f) => {
          const href =
            f.value === 'all' ? '/me/projects' : `/me/projects?status=${f.value}`
          const isActive = filter.value === f.value
          return (
            <Link
              key={f.value}
              href={href}
              className={`me-filter${isActive ? ' active' : ''}`}
            >
              {f.label}
            </Link>
          )
        })}
      </nav>

      {projects.length === 0 ? (
        <p className="me-empty">
          {filter.status
            ? `No ${filter.label.toLowerCase()} projects.`
            : 'Nothing here yet. The "Start making" button on any tutorial begins a project.'}
        </p>
      ) : (
        <div className="me-grid">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/me/projects/${p.id}`}
              className="me-project-card"
            >
              <span className="me-project-eyebrow">
                {p.tutorial.category.name}
              </span>
              <span className="me-project-title">{p.tutorial.title}</span>
              <span className="me-project-meta">
                <span
                  className={`me-status-pill ${STATUS_PILL_CLASS[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
                {p.status === UserProjectStatus.IN_PROGRESS && (
                  <span>{p.readingProgressPercent}% through</span>
                )}
                <span>started {formatShortDate(p.startedAt)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
