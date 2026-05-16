import { prisma, CreatorApplicationStatus } from '@homemade/db'
import { daysAgo } from '@/lib/analytics-queries'
import { KpiCard, ChartCard } from '@/components/admin/analytics/chart-card'
import { CHART_COLORS } from '@/components/admin/analytics/chart-theme'

export const dynamic = 'force-dynamic'

const STANDARD = new Intl.NumberFormat('en-GB')

export default async function CreatorAnalyticsPage() {
  const since7 = daysAgo(6)
  const since30 = daysAgo(29)
  const since90 = daysAgo(89)
  const thirtyDaysAgo = daysAgo(29)

  const [appsLast7, appsLast30, appsLast90, allDecided, activeCreators, perCreator] =
    await Promise.all([
      prisma.creatorProfile.count({ where: { appliedAt: { gte: since7 } } }),
      prisma.creatorProfile.groupBy({
        by: ['applicationStatus'],
        where: { appliedAt: { gte: since30 } },
        _count: { _all: true },
      }),
      prisma.creatorProfile.count({ where: { appliedAt: { gte: since90 } } }),
      prisma.creatorProfile.findMany({
        where: { decidedAt: { not: null } },
        select: { appliedAt: true, decidedAt: true },
        take: 500,
      }),
      prisma.user.findMany({
        where: {
          isCreator: true,
          tutorialsCreated: {
            some: { publishedAt: { gte: thirtyDaysAgo, not: null } },
          },
        },
        select: { id: true },
      }),
      prisma.user.findMany({
        where: { isCreator: true },
        select: {
          id: true,
          displayHandle: true,
          name: true,
          tutorialsCreated: {
            select: { id: true, title: true, publishedAt: true },
          },
        },
        take: 200,
      }),
    ])

  const approved = appsLast30.find((s) => s.applicationStatus === CreatorApplicationStatus.APPROVED)?._count._all ?? 0
  const rejected = appsLast30.find((s) => s.applicationStatus === CreatorApplicationStatus.REJECTED)?._count._all ?? 0

  // Application-to-approval timing.
  const timings = allDecided
    .filter((r) => r.decidedAt)
    .map((r) => r.decidedAt!.getTime() - r.appliedAt.getTime())
    .sort((a, b) => a - b)
  const avgMs = timings.length > 0 ? timings.reduce((s, t) => s + t, 0) / timings.length : 0
  const p50Ms = timings.length > 0 ? timings[Math.floor(timings.length / 2)] ?? 0 : 0
  const p90Ms = timings.length > 0 ? timings[Math.floor(timings.length * 0.9)] ?? 0 : 0

  // Per-creator performance — total views per creator from analytics events.
  const tutorialOwnerById = new Map<string, { creatorId: string; title: string }>()
  for (const u of perCreator) {
    for (const t of u.tutorialsCreated) {
      tutorialOwnerById.set(t.id, { creatorId: u.id, title: t.title })
    }
  }
  const tutorialIds = Array.from(tutorialOwnerById.keys())
  const viewEvents = tutorialIds.length > 0
    ? await prisma.analyticsEvent.findMany({
        where: { event: 'tutorial_viewed', createdAt: { gte: since30 } },
        select: { properties: true },
        take: 50000,
      })
    : []

  const viewsByTutorial = new Map<string, number>()
  for (const e of viewEvents) {
    const props = (e.properties ?? {}) as Record<string, unknown>
    const id = typeof props.tutorialId === 'string' ? props.tutorialId : null
    if (!id) continue
    viewsByTutorial.set(id, (viewsByTutorial.get(id) ?? 0) + 1)
  }
  const perCreatorRows = perCreator
    .map((u) => {
      const titles = u.tutorialsCreated.filter((t) => t.publishedAt)
      const totalViews = titles.reduce((s, t) => s + (viewsByTutorial.get(t.id) ?? 0), 0)
      const lastPublished = titles
        .map((t) => t.publishedAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0]
      return {
        id: u.id,
        name: u.name ?? u.displayHandle ?? u.id.slice(0, 8),
        titleCount: titles.length,
        totalViews,
        avgViews: titles.length > 0 ? totalViews / titles.length : 0,
        lastPublished,
      }
    })
    .filter((r) => r.titleCount > 0)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 50)

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <KpiCard label="Applications (7d)" value={STANDARD.format(appsLast7)} />
        <KpiCard label="Applications (90d)" value={STANDARD.format(appsLast90)} />
        <KpiCard
          label="Approved / rejected (30d)"
          value={`${approved} / ${rejected}`}
        />
        <KpiCard label="Active creators (30d)" value={STANDARD.format(activeCreators.length)} />
      </div>

      <ChartCard
        title="Application → decision time"
        description="Time between application submitted and an approve/reject decision being recorded."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            fontFamily: 'var(--font-lora)',
          }}
        >
          {[
            { label: 'avg', ms: avgMs },
            { label: 'p50', ms: p50Ms },
            { label: 'p90', ms: p90Ms },
          ].map((m) => (
            <div key={m.label}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: CHART_COLORS.muted,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontWeight: 400,
                  fontSize: 28,
                  color: CHART_COLORS.text,
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 4,
                }}
              >
                {formatDuration(m.ms)}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard
        title="Per-creator performance — last 30 days"
        description="Top 50 creators by views accumulated across their published tutorials in the window."
        fullBleed
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-lora)', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: CHART_COLORS.muted, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px' }}>Creator</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Titles</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total views</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Avg / title</th>
                <th style={{ padding: '8px 12px' }}>Last published</th>
              </tr>
            </thead>
            <tbody>
              {perCreatorRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 16, color: CHART_COLORS.muted }}>
                    No published creator content in the last 30 days.
                  </td>
                </tr>
              ) : (
                perCreatorRows.map((r) => (
                  <tr key={r.id} style={{ borderTop: `0.5px solid ${CHART_COLORS.grid}` }}>
                    <td style={{ padding: '10px 12px' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.titleCount}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{STANDARD.format(r.totalViews)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{STANDARD.format(Math.round(r.avgViews))}</td>
                    <td style={{ padding: '10px 12px', color: CHART_COLORS.muted, fontSize: 12 }}>
                      {r.lastPublished?.toISOString().slice(0, 10) ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  )
}

function formatDuration(ms: number): string {
  if (ms === 0) return '—'
  const hours = ms / (1000 * 60 * 60)
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`
  if (hours < 48) return `${hours.toFixed(1)}h`
  const days = hours / 24
  return `${days.toFixed(1)}d`
}
