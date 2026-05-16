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
          Live count of published + draft tutorials per category. Bulk content
          batches refill the queue.
        </p>
        <div className="admin-pipeline-table-wrap">
          <table className="admin-pipeline-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Published</th>
                <th>Draft</th>
                <th>Total</th>
                <th>Fill %</th>
              </tr>
            </thead>
            <tbody>
              {data.pipeline.map((row) => {
                const fill = row.total > 0
                  ? Math.round((row.published / row.total) * 100)
                  : 0
                return (
                  <tr key={row.slug}>
                    <td>
                      <Link
                        href={`/admin/tutorials?category=${row.slug}`}
                        className="admin-pipeline-link"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td>{row.published.toLocaleString('en-GB')}</td>
                    <td>{row.draft.toLocaleString('en-GB')}</td>
                    <td>{row.total.toLocaleString('en-GB')}</td>
                    <td>
                      <span className="admin-pipeline-bar" aria-hidden="true">
                        <span
                          className="admin-pipeline-bar-fill"
                          style={{ width: `${fill}%` }}
                        />
                      </span>
                      <span className="admin-pipeline-bar-label">{fill}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
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
