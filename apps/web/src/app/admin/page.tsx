import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { getDashboardData } from '@/lib/admin-dashboard-data'

import './dashboard.css'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [user, data] = await Promise.all([currentUser(), getDashboardData()])

  const firstName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress?.split('@')[0] ??
    'there'

  const allCaughtUp = data.inbox.length === 0

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1>Good morning, {firstName}.</h1>
          <p className="admin-dashboard-subtitle">
            Library overview, moderation queue, and pipeline state.
          </p>
        </div>
        <span className="admin-dashboard-stamp">
          updated {new Date(data.generatedAt).toLocaleTimeString('en-GB')}
        </span>
      </header>

      <section className="admin-attention" aria-labelledby="attention-heading">
        <h2 id="attention-heading">Needs attention</h2>
        {allCaughtUp ? (
          <p className="admin-attention-empty">All caught up.</p>
        ) : (
          <ul className="admin-attention-list">
            {data.inbox.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="admin-attention-row">
                  <span className="admin-attention-count">{item.count}</span>
                  <span className="admin-attention-label">{item.label}</span>
                  <span className="admin-attention-cta">open →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-kpi-grid" aria-label="Key metrics">
        {data.kpis.map((card) => (
          <KpiCardView key={card.key} card={card} />
        ))}
      </section>

      <section className="admin-pipeline" aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading">Category pipeline</h2>
        <p className="admin-pipeline-hint">
          Published / target per category. Bulk content batches refill the
          queue; categories flip to publicly visible at 10 published.
        </p>
        <div className="admin-pipeline-table-wrap">
          <table className="admin-pipeline-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Published</th>
                <th>Draft</th>
                <th>Target</th>
                <th>Fill %</th>
                <th>Last batch</th>
                <th>Public</th>
              </tr>
            </thead>
            <tbody>
              {data.pipeline.map((row) => (
                <PipelineRow key={row.slug} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function PipelineRow({
  row,
}: {
  row: import('@/lib/admin-dashboard-data').CategoryPipelineRow
}) {
  const isEmpty = row.published === 0 && row.draft === 0
  const hasTarget = row.target != null && row.target > 0
  const lastBatch = row.lastPublishedAt
    ? new Date(row.lastPublishedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      })
    : '—'
  return (
    <tr className={isEmpty ? 'admin-pipeline-row-empty' : undefined}>
      <td>
        <Link
          href={`/admin/tutorials?category=${row.slug}`}
          className="admin-pipeline-link"
        >
          {row.name}
        </Link>
        {isEmpty && (
          <span className="admin-pipeline-row-tag" aria-label="Not started">
            Not started
          </span>
        )}
      </td>
      <td>{row.published.toLocaleString('en-GB')}</td>
      <td>{row.draft.toLocaleString('en-GB')}</td>
      <td>
        {hasTarget ? (
          row.target!.toLocaleString('en-GB')
        ) : (
          <span className="admin-pipeline-no-target">no target</span>
        )}
      </td>
      <td>
        {hasTarget ? (
          <>
            <span className="admin-pipeline-bar" aria-hidden="true">
              <span
                className="admin-pipeline-bar-fill"
                style={{ width: `${row.fillPercent ?? 0}%` }}
              />
            </span>
            <span className="admin-pipeline-bar-label">{row.fillPercent ?? 0}%</span>
          </>
        ) : (
          <span className="admin-pipeline-no-target">—</span>
        )}
      </td>
      <td className="admin-pipeline-cell-soft">{lastBatch}</td>
      <td>
        <span
          className={
            row.isPublicVisible
              ? 'admin-pipeline-visibility admin-pipeline-visibility-on'
              : 'admin-pipeline-visibility admin-pipeline-visibility-off'
          }
          title={
            row.isPublicVisible
              ? 'Visible in public nav and browse'
              : 'Hidden from public nav until 10 published'
          }
        >
          {row.isPublicVisible ? 'Live' : 'Private'}
        </span>
      </td>
    </tr>
  )
}

function KpiCardView({
  card,
}: {
  card: import('@/lib/admin-dashboard-data').KpiCard
}) {
  const deltaSign = card.delta7d == null ? '' : card.delta7d > 0 ? '+' : ''
  return (
    <Link href={card.href} className="admin-kpi-card">
      <span className="admin-kpi-label">{card.label}</span>
      <span className="admin-kpi-value">
        {card.key === 'hero-coverage' ? `${card.value}%` : card.value.toLocaleString('en-GB')}
      </span>
      {card.delta7d != null && (
        <span
          className={`admin-kpi-delta ${
            card.delta7d > 0
              ? 'admin-kpi-delta-up'
              : card.delta7d < 0
                ? 'admin-kpi-delta-down'
                : ''
          }`}
        >
          {deltaSign}
          {card.delta7d.toLocaleString('en-GB')} this week
        </span>
      )}
      {card.sparkline.length > 0 && <Sparkline values={card.sparkline} />}
    </Link>
  )
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null
  const max = Math.max(1, ...values)
  const width = 96
  const height = 28
  const step = width / Math.max(1, values.length - 1)
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`)
    .join(' ')
  return (
    <svg
      className="admin-kpi-spark"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-sage)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
