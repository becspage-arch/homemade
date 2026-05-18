import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, TutorialStatus, PipelineStatus } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { AcknowledgeButton } from './acknowledge-button'
import { PauseToggle } from './pause-toggle'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ stream?: string; offset?: string; showAck?: string }>
}

type StreamName = 'queue' | 'global'

const STREAMS: ReadonlyArray<{ name: StreamName; label: string; description: string }> = [
  {
    name: 'queue',
    label: 'Queue',
    description: 'Pauses the queue cron preflight. No new batch will start.',
  },
  {
    name: 'global',
    label: 'Global',
    description: 'Kills everything that checks the global stream — including the queue.',
  },
]

const PAGE_SIZE = 50

// Queue cron fires at minute 0 of every hour UTC: 0 * * * *
function nextQueueFireUtc(): Date {
  const now = new Date()
  const next = new Date(now)
  next.setUTCMinutes(0, 0, 0)
  next.setUTCHours(next.getUTCHours() + 1)
  return next
}

function relativeTime(when: Date): string {
  const diff = Date.now() - when.getTime()
  if (diff < 0) {
    const future = -diff
    const h = Math.round(future / 3_600_000)
    if (h < 1) return 'in <1h'
    if (h < 24) return `in ${h}h`
    return `in ${Math.round(h / 24)}d`
  }
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatTimestamp(d: Date): string {
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

const PIPELINE_STATUS_COLOUR: Record<PipelineStatus, string> = {
  NOT_READY: 'var(--color-warm-taupe)',
  READY: 'var(--color-sage)',
  PAUSED: 'var(--color-burnt-sienna)',
  COMPLETE: 'var(--color-espresso)',
}

const PIPELINE_STATUS_LABEL: Record<PipelineStatus, string> = {
  NOT_READY: 'Not ready',
  READY: 'Ready',
  PAUSED: 'Paused',
  COMPLETE: 'Complete',
}

export default async function AdminAutopilotPage({ searchParams }: PageProps) {
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  const params = await searchParams
  const streamFilter =
    params.stream && STREAMS.some((s) => s.name === params.stream)
      ? (params.stream as StreamName)
      : null
  const offset = Math.max(0, parseInt(params.offset ?? '0', 10) || 0)
  const showAck = params.showAck === '1'

  const where: Record<string, unknown> = {}
  if (streamFilter) where.stream = streamFilter
  if (!showAck) where.acknowledgedAt = null

  const [
    categoriesRaw,
    pauseStates,
    lastHaltByStream,
    signals,
    total,
  ] = await Promise.all([
    prisma.category.findMany({
      orderBy: [
        { lastAutopilotRunAt: 'asc' },
        { launchOrder: 'asc' },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        pipelineStatus: true,
        targetTutorialCount: true,
        lastAutopilotRunAt: true,
        launchOrder: true,
      },
    }),
    prisma.autopilotPauseState.findMany(),
    prisma.autopilotHaltSignal.groupBy({
      by: ['stream'],
      _max: { createdAt: true },
    }),
    prisma.autopilotHaltSignal.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: offset,
      take: PAGE_SIZE,
    }),
    prisma.autopilotHaltSignal.count({ where }),
  ])

  // Published counts per category (one query for all slugs)
  const publishedCountRows = await prisma.tutorial.groupBy({
    by: ['categoryId'],
    where: { status: TutorialStatus.PUBLISHED },
    _count: { _all: true },
  })
  const publishedByCategoryId = new Map(
    publishedCountRows.map((r) => [r.categoryId, r._count._all]),
  )

  // Image verification coverage
  const verificationGroups = await prisma.media.groupBy({
    by: ['verificationStatus'],
    where: { tutorialsHero: { some: { status: TutorialStatus.PUBLISHED } } },
    _count: { _all: true },
  })
  const verificationCounts: {
    VERIFIED: number
    UNVERIFIED: number
    REJECTED: number
    REJECTED_USED_PROCEDURAL: number
  } = { VERIFIED: 0, UNVERIFIED: 0, REJECTED: 0, REJECTED_USED_PROCEDURAL: 0 }
  for (const g of verificationGroups) {
    verificationCounts[g.verificationStatus] = g._count._all
  }
  const verificationTotal =
    verificationCounts.VERIFIED +
    verificationCounts.UNVERIFIED +
    verificationCounts.REJECTED +
    verificationCounts.REJECTED_USED_PROCEDURAL
  const verificationCoverage =
    verificationTotal > 0
      ? Math.round((verificationCounts.VERIFIED / verificationTotal) * 100)
      : 0

  const pauseByStream = new Map(pauseStates.map((p) => [p.streamName, p]))
  const lastHaltDateByStream = new Map<string, Date | null>()
  for (const g of lastHaltByStream) {
    lastHaltDateByStream.set(g.stream, g._max.createdAt ?? null)
  }

  const acknowledgerIds = Array.from(
    new Set(
      signals
        .map((s) => s.acknowledgedById)
        .filter((id): id is string => Boolean(id)),
    ),
  )
  const acknowledgers =
    acknowledgerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: acknowledgerIds } },
          select: { id: true, email: true },
        })
      : []
  const acknowledgerById = new Map(acknowledgers.map((u) => [u.id, u]))

  // Derive "last queue fire" from the max lastAutopilotRunAt across all categories
  const lastQueueFire = categoriesRaw.reduce<Date | null>((acc, c) => {
    if (!c.lastAutopilotRunAt) return acc
    if (!acc) return c.lastAutopilotRunAt
    return c.lastAutopilotRunAt > acc ? c.lastAutopilotRunAt : acc
  }, null)

  const nextQueueFire = nextQueueFireUtc()

  // Find first READY-not-COMPLETE category (same ordering as the cron uses)
  const nextUpIdx = categoriesRaw.findIndex(
    (c) =>
      c.pipelineStatus === PipelineStatus.READY,
  )

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Autopilot</h1>
          <p>
            Single-queue content autopilot — fires every hour, picks the least-recently-fired
            READY category, and runs a bulk batch. Use the pause toggles to stop the queue
            without disabling the scheduled task.
          </p>
        </div>
      </div>

      {/* ── Queue cron metadata ───────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 22,
            margin: '0 0 12px',
            color: 'var(--color-espresso)',
          }}
        >
          Queue cron
        </h2>

        <article
          className="admin-kpi-card"
          style={{
            padding: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 18,
            fontFamily: 'var(--font-lora)',
            fontSize: 13,
            color: 'var(--color-espresso)',
          }}
        >
          {[
            { label: 'Schedule', value: 'Every hour', sub: '0 * * * * UTC' },
            {
              label: 'Last fire',
              value: lastQueueFire ? relativeTime(lastQueueFire) : '—',
              sub: lastQueueFire ? formatTimestamp(lastQueueFire) : null,
            },
            {
              label: 'Next fire',
              value: relativeTime(nextQueueFire),
              sub: formatTimestamp(nextQueueFire),
            },
          ].map((cell) => (
            <div key={cell.label}>
              <div
                style={{
                  fontFamily: 'var(--font-lora)',
                  fontSize: 11,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--color-warm-taupe)',
                  marginBottom: 4,
                }}
              >
                {cell.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.2,
                }}
              >
                {cell.value}
              </div>
              {cell.sub && (
                <div style={{ fontSize: 11, color: 'var(--color-warm-taupe)', marginTop: 2 }}>
                  {cell.sub}
                </div>
              )}
            </div>
          ))}
        </article>
      </section>

      {/* ── Pause toggles ────────────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 22,
            margin: '0 0 12px',
            color: 'var(--color-espresso)',
          }}
        >
          Pause controls
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 14,
          }}
        >
          {STREAMS.map((stream) => {
            const pauseState = pauseByStream.get(stream.name) ?? null
            const isPaused = Boolean(pauseState?.pausedAt)

            return (
              <article key={stream.name} className="admin-kpi-card" style={{ padding: 18 }}>
                <header
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-fraunces)',
                      fontWeight: 400,
                      fontSize: 22,
                      margin: 0,
                      color: 'var(--color-espresso)',
                    }}
                  >
                    {stream.label}
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-lora)',
                      fontSize: 10,
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: isPaused
                        ? 'var(--color-burnt-sienna)'
                        : 'var(--color-warm-taupe)',
                    }}
                  >
                    {isPaused ? 'Paused' : 'Active'}
                  </span>
                </header>

                <p
                  style={{
                    fontFamily: 'var(--font-lora)',
                    fontSize: 12,
                    color: 'var(--color-warm-taupe)',
                    margin: '0 0 12px',
                  }}
                >
                  {stream.description}
                </p>

                {isPaused && pauseState?.reason && (
                  <p
                    style={{
                      fontFamily: 'var(--font-lora)',
                      fontSize: 12,
                      fontStyle: 'italic',
                      color: 'var(--color-espresso)',
                      margin: '0 0 10px',
                    }}
                  >
                    Reason: {pauseState.reason}
                  </p>
                )}

                <div
                  style={{
                    borderTop: '0.5px solid var(--color-linen-grey)',
                    paddingTop: 12,
                  }}
                >
                  <PauseToggle streamName={stream.name} paused={isPaused} />
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Per-category round-robin panel ───────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 22,
            margin: '0 0 12px',
            color: 'var(--color-espresso)',
          }}
        >
          Category round-robin
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 12,
            color: 'var(--color-warm-taupe)',
            margin: '0 0 12px',
          }}
        >
          Ordered by last fired (oldest first) — the same ordering the queue cron uses.
          The first READY row is next up.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 24 }} />
                <th>Category</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 180 }}>Published / target</th>
                <th style={{ width: 140 }}>Last fired</th>
              </tr>
            </thead>
            <tbody>
              {categoriesRaw.map((cat, i) => {
                const published = publishedByCategoryId.get(cat.id) ?? 0
                const target = cat.targetTutorialCount
                const pct =
                  target && target > 0 ? Math.min(100, Math.round((published / target) * 100)) : 0
                const isNextUp = i === nextUpIdx
                const statusColour = PIPELINE_STATUS_COLOUR[cat.pipelineStatus]

                return (
                  <tr key={cat.id}>
                    <td style={{ textAlign: 'center', fontSize: 14 }}>
                      {isNextUp && (
                        <span
                          title="Next up in rotation"
                          style={{ color: 'var(--color-sage)' }}
                        >
                          ↑
                        </span>
                      )}
                    </td>
                    <td>
                      <div
                        style={{
                          fontFamily: 'var(--font-fraunces)',
                          fontSize: 15,
                          fontWeight: 400,
                          color: 'var(--color-espresso)',
                        }}
                      >
                        {cat.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-lora)',
                          fontSize: 11,
                          color: 'var(--color-warm-taupe)',
                        }}
                      >
                        {cat.slug}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-lora)',
                          fontSize: 11,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: statusColour,
                        }}
                      >
                        {PIPELINE_STATUS_LABEL[cat.pipelineStatus]}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          fontFamily: 'var(--font-lora)',
                          fontSize: 13,
                          color: 'var(--color-espresso)',
                          marginBottom: 4,
                        }}
                      >
                        {published.toLocaleString()}
                        {target != null && (
                          <span style={{ color: 'var(--color-warm-taupe)' }}>
                            {' '}/ {target.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {target != null && target > 0 && (
                        <div
                          style={{
                            height: 4,
                            background: 'var(--color-linen-grey)',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background:
                                cat.pipelineStatus === PipelineStatus.COMPLETE
                                  ? 'var(--color-espresso)'
                                  : 'var(--color-sage)',
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--font-lora)',
                        fontSize: 12,
                        color: 'var(--color-warm-taupe)',
                      }}
                    >
                      {cat.lastAutopilotRunAt ? (
                        <>
                          <div>{relativeTime(cat.lastAutopilotRunAt)}</div>
                          <div style={{ fontSize: 11 }}>
                            {formatTimestamp(cat.lastAutopilotRunAt)}
                          </div>
                        </>
                      ) : (
                        'never'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Image verification ───────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: 0, color: 'var(--color-espresso)' }}>
            Image verification
          </h2>
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
            Hero coverage on PUBLISHED tutorials —{' '}
            <strong style={{ color: 'var(--color-espresso)' }}>{verificationCoverage}%</strong>{' '}
            verified
          </span>
        </header>

        <article
          className="admin-kpi-card"
          style={{
            padding: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 18,
            fontFamily: 'var(--font-lora)',
            fontSize: 13,
            color: 'var(--color-espresso)',
          }}
        >
          {[
            { label: 'Verified', value: verificationCounts.VERIFIED },
            { label: 'Unverified', value: verificationCounts.UNVERIFIED },
            { label: 'Rejected', value: verificationCounts.REJECTED },
            { label: 'Used procedural', value: verificationCounts.REJECTED_USED_PROCEDURAL },
          ].map((cell) => (
            <div key={cell.label}>
              <div
                style={{
                  fontFamily: 'var(--font-lora)',
                  fontSize: 11,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--color-warm-taupe)',
                  marginBottom: 4,
                }}
              >
                {cell.label}
              </div>
              <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 28, fontWeight: 400 }}>
                {cell.value}
              </div>
            </div>
          ))}
        </article>
        <p
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 12,
            color: 'var(--color-warm-taupe)',
            marginTop: 8,
          }}
        >
          Rejected rows need manual review or a fresh sweep pass.{' '}
          Run <code>verify-media-batch.ts</code> + <code>apply-media-verdicts.ts</code> to
          clear the unverified backlog.
        </p>
      </section>

      {/* ── Halt signals ─────────────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 22, margin: 0, color: 'var(--color-espresso)' }}>
            Halt signals
          </h2>
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
            {total} {showAck ? 'total' : 'unacknowledged'}
          </span>
        </header>

        <div className="admin-filter-row" style={{ marginBottom: 12 }}>
          <Link
            href={buildHref({ stream: null, showAck })}
            className={`admin-filter-chip ${streamFilter == null ? 'active' : ''}`}
          >
            All streams
          </Link>
          {STREAMS.map((s) => (
            <Link
              key={s.name}
              href={buildHref({ stream: s.name, showAck })}
              className={`admin-filter-chip ${streamFilter === s.name ? 'active' : ''}`}
            >
              {s.label}
            </Link>
          ))}
          <span style={{ marginLeft: 'auto' }}>
            <Link
              href={buildHref({ stream: streamFilter, showAck: !showAck })}
              className="admin-filter-chip"
            >
              {showAck ? 'Hide acknowledged' : 'Show acknowledged'}
            </Link>
          </span>
        </div>

        {signals.length === 0 ? (
          <p
            className="admin-card"
            style={{ padding: 18, fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
          >
            No halt signals match.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Created</th>
                <th style={{ width: 90 }}>Stream</th>
                <th style={{ width: 220 }}>Reason</th>
                <th>Detail</th>
                <th style={{ width: 110 }}>Notified</th>
                <th style={{ width: 160 }}>Acknowledged</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => {
                const acknowledger = s.acknowledgedById ? acknowledgerById.get(s.acknowledgedById) : null
                return (
                  <tr key={s.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                      {formatTimestamp(s.createdAt)}
                    </td>
                    <td>
                      <code style={{ fontSize: 12, color: 'var(--color-sage)' }}>
                        {s.stream}
                      </code>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, color: 'var(--color-espresso)' }}>
                        {s.reason}
                      </code>
                    </td>
                    <td>
                      {s.detail ? (
                        <details>
                          <summary
                            style={{
                              fontSize: 12,
                              color: 'var(--color-warm-taupe)',
                              cursor: 'pointer',
                            }}
                          >
                            {s.detail.length > 120
                              ? `${s.detail.slice(0, 120)}…`
                              : s.detail}
                          </summary>
                          <pre
                            style={{
                              whiteSpace: 'pre-wrap',
                              fontSize: 11,
                              marginTop: 6,
                              color: 'var(--color-warm-taupe)',
                            }}
                          >
                            {s.detail}
                          </pre>
                        </details>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-warm-taupe)' }}>
                      {s.notifiedAt ? formatTimestamp(s.notifiedAt) : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {s.acknowledgedAt ? (
                        <span style={{ color: 'var(--color-warm-taupe)' }}>
                          {relativeTime(s.acknowledgedAt)}
                          {acknowledger && ` (${acknowledger.email})`}
                        </span>
                      ) : (
                        <AcknowledgeButton signalId={s.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {total > offset + signals.length && (
          <div style={{ marginTop: 12 }}>
            <Link
              href={buildHref({
                stream: streamFilter,
                showAck,
                offset: offset + PAGE_SIZE,
              })}
              className="admin-btn"
              style={{ display: 'inline-block' }}
            >
              Show next {PAGE_SIZE}
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function buildHref({
  stream,
  showAck,
  offset,
}: {
  stream: StreamName | null
  showAck: boolean
  offset?: number
}): string {
  const sp = new URLSearchParams()
  if (stream) sp.set('stream', stream)
  if (showAck) sp.set('showAck', '1')
  if (offset && offset > 0) sp.set('offset', String(offset))
  const qs = sp.toString()
  return qs ? `/admin/system/autopilot?${qs}` : '/admin/system/autopilot'
}
