import Link from 'next/link'
import { listMakerOfTheMonthEntries } from '@/lib/maker-of-the-month'
import { MakerOfTheMonthForm } from './form'
import { ClearPickButton } from './clear-pick-button'

export const dynamic = 'force-dynamic'

export default async function MakerOfTheMonthAdminPage() {
  const entries = await listMakerOfTheMonthEntries({ limit: 24 })

  const now = new Date()
  const activeRow = entries.find(
    (e) => e.monthStart <= now && e.monthEnd >= now,
  )

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Maker of the Month</h1>
          <p>
            Pick one Maker to feature on the homepage + with a badge on their
            public profile. The pick is editorial — no community voting.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Current pick</div>
        {activeRow ? (
          <>
            <h2 className="admin-card-title">
              {activeRow.user.name ?? activeRow.user.displayHandle}{' '}
              <small style={{ color: 'var(--color-warm-taupe)' }}>
                @{activeRow.user.displayHandle}
              </small>
            </h2>
            <p className="admin-card-body">
              <strong>Reason:</strong> {activeRow.featuredReason}
            </p>
            <p className="admin-card-meta">
              <span>
                {formatMonth(activeRow.monthStart)} ·{' '}
                {activeRow.monthStart.toLocaleDateString('en-GB')} —{' '}
                {activeRow.monthEnd.toLocaleDateString('en-GB')}
              </span>
              {activeRow.user.displayHandle && (
                <Link
                  href={`/m/${activeRow.user.displayHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-sage)',
                    marginLeft: 12,
                  }}
                >
                  · open profile ↗
                </Link>
              )}
            </p>
            <div style={{ marginTop: 12 }}>
              <ClearPickButton id={activeRow.id} />
            </div>
          </>
        ) : (
          <p
            className="admin-card-body"
            style={{
              fontStyle: 'italic',
              color: 'var(--color-warm-taupe)',
            }}
          >
            No Maker picked for {formatMonth(now)} yet.
          </p>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Set the current pick</div>
        <MakerOfTheMonthForm />
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Past picks</div>
        {entries.length === 0 ? (
          <p
            className="admin-card-body"
            style={{
              fontStyle: 'italic',
              color: 'var(--color-warm-taupe)',
            }}
          >
            No picks logged.
          </p>
        ) : (
          <table style={{ width: '100%', fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>Month</th>
                <th>Maker</th>
                <th>Reason</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const active = e.monthStart <= now && e.monthEnd >= now
                return (
                  <tr key={e.id}>
                    <td style={{ padding: '6px 0' }}>
                      {formatMonth(e.monthStart)}
                      {active && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 11,
                            color: 'var(--color-sage)',
                          }}
                        >
                          ● live
                        </span>
                      )}
                    </td>
                    <td>
                      {e.user.displayHandle ? (
                        <Link
                          href={`/m/${e.user.displayHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {e.user.name ?? e.user.displayHandle}
                        </Link>
                      ) : (
                        <em>(account deleted)</em>
                      )}
                    </td>
                    <td>{e.featuredReason}</td>
                    <td>
                      <ClearPickButton id={e.id} small />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function formatMonth(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
