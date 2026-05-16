import Link from 'next/link'
import { prisma } from '@homemade/db'
import { daysAgo } from '@/lib/analytics-queries'
import { KpiCard, ChartCard } from '@/components/admin/analytics/chart-card'
import { CHART_COLORS } from '@/components/admin/analytics/chart-theme'

export const dynamic = 'force-dynamic'

const STANDARD = new Intl.NumberFormat('en-GB')

export default async function ContentLeaderboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const days = params.range === '30d' ? 30 : params.range === '90d' ? 90 : 7
  const since = daysAgo(days - 1)

  // Pull tutorial_viewed events in the window, group by tutorialId in the
  // payload. Then look up the tutorial details for the top rows.
  const viewEvents = await prisma.analyticsEvent.findMany({
    where: {
      event: 'tutorial_viewed',
      createdAt: { gte: since },
    },
    select: { properties: true, clerkUserId: true },
    take: 50000, // sanity cap — small enough to scan but enough for any pre-launch sample
  })

  const perTutorial = new Map<
    string,
    { views: number; viewers: Set<string> }
  >()
  for (const e of viewEvents) {
    const props = (e.properties ?? {}) as Record<string, unknown>
    const id =
      typeof props.tutorialId === 'string'
        ? props.tutorialId
        : typeof props.id === 'string'
          ? props.id
          : null
    if (!id) continue
    let row = perTutorial.get(id)
    if (!row) {
      row = { views: 0, viewers: new Set() }
      perTutorial.set(id, row)
    }
    row.views++
    if (e.clerkUserId) row.viewers.add(e.clerkUserId)
  }

  const topIds = Array.from(perTutorial.entries())
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 50)
    .map(([id]) => id)

  const tutorials = topIds.length > 0
    ? await prisma.tutorial.findMany({
        where: { id: { in: topIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          subCategory: {
            select: {
              slug: true,
              name: true,
              category: { select: { slug: true, name: true } },
            },
          },
        },
      })
    : []

  const tutorialById = new Map(tutorials.map((t) => [t.id, t]))

  // Bookmarks + projects per tutorial in window — used to derive conversion rates.
  const [bookmarkEvents, projectStartEvents] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        event: 'tutorial_bookmarked',
        createdAt: { gte: since },
      },
      select: { properties: true },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        event: 'first_project_started',
        createdAt: { gte: since },
      },
      select: { properties: true },
    }),
  ])

  const bookmarksPerTutorial = countByPropId(bookmarkEvents, 'tutorialId')
  const startsPerTutorial = countByPropId(projectStartEvents, 'tutorialId')

  // Headline KPI cards.
  const mostViewed = topIds[0]
    ? `${tutorialById.get(topIds[0])?.title ?? 'Unknown'} (${STANDARD.format(perTutorial.get(topIds[0])!.views)})`
    : '—'
  const totalViews = Array.from(perTutorial.values()).reduce(
    (s, t) => s + t.views,
    0,
  )

  return (
    <>
      <RangePicker active={days === 7 ? '7d' : days === 30 ? '30d' : '90d'} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <KpiCard label={`Total views (${days}d)`} value={STANDARD.format(totalViews)} />
        <KpiCard label="Most viewed" value={mostViewed} />
        <KpiCard label="Tutorials viewed" value={STANDARD.format(perTutorial.size)} />
        <KpiCard label="Bookmarks fired" value={STANDARD.format(bookmarkEvents.length)} />
      </div>

      <ChartCard
        title={`Top 50 tutorials by views — last ${days} days`}
        description="Bookmarks and projects-started are joined on tutorialId from the matching events fired in the same window."
        fullBleed
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-lora)',
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  color: CHART_COLORS.muted,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '8px 12px' }}>Tutorial</th>
                <th style={{ padding: '8px 12px' }}>Category</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Views</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Viewers</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Bookmark rate</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Project start rate</th>
              </tr>
            </thead>
            <tbody>
              {topIds.map((id) => {
                const t = tutorialById.get(id)
                const stat = perTutorial.get(id)!
                const bm = bookmarksPerTutorial.get(id) ?? 0
                const ps = startsPerTutorial.get(id) ?? 0
                const bmRate = stat.views > 0 ? (bm / stat.views) * 100 : 0
                const psRate = stat.views > 0 ? (ps / stat.views) * 100 : 0
                const href = t?.subCategory?.category?.slug && t?.slug
                  ? `/${t.subCategory.category.slug}/${t.slug}`
                  : null
                return (
                  <tr key={id} style={{ borderTop: `0.5px solid ${CHART_COLORS.grid}` }}>
                    <td style={{ padding: '10px 12px', color: CHART_COLORS.text }}>
                      {href ? (
                        <Link href={href} style={{ color: 'inherit' }}>
                          {t?.title ?? id}
                        </Link>
                      ) : (
                        t?.title ?? id
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: CHART_COLORS.muted, fontSize: 12 }}>
                      {t?.subCategory?.category?.name ?? '—'}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono, ui-monospace)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {STANDARD.format(stat.views)}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: CHART_COLORS.muted,
                      }}
                    >
                      {STANDARD.format(stat.viewers.size)}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {bmRate.toFixed(1)}%
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {psRate.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  )
}

function countByPropId(
  events: Array<{ properties: unknown }>,
  key: string,
): Map<string, number> {
  const out = new Map<string, number>()
  for (const e of events) {
    const props = (e.properties ?? {}) as Record<string, unknown>
    const v = props[key]
    if (typeof v !== 'string') continue
    out.set(v, (out.get(v) ?? 0) + 1)
  }
  return out
}

function RangePicker({ active }: { active: '7d' | '30d' | '90d' }) {
  const opts = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
  ] as const
  return (
    <nav style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {opts.map((o) => {
        const isActive = o.key === active
        return (
          <Link
            key={o.key}
            href={`/admin/analytics/content?range=${o.key}`}
            style={{
              padding: '6px 12px',
              fontFamily: 'var(--font-lora)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: isActive ? 'var(--color-sage)' : 'transparent',
              color: isActive ? 'var(--color-linen-cream)' : 'var(--color-warm-taupe)',
              border: '0.5px solid var(--color-sage)',
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            {o.label}
          </Link>
        )
      })}
    </nav>
  )
}
