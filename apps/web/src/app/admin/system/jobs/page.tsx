import { ReindexButton } from './reindex-button'
import { AnalyticsRollupButton } from './analytics-rollup-button'

const INNGEST_DASHBOARD_URL = 'https://app.inngest.com/env/production/functions'

export default function AdminJobsPage() {
  return (
    <div className="admin-placeholder">
      <h1>Background jobs</h1>
      <p>
        Inngest runs the scheduled jobs and event-triggered functions for
        Homemade. Use the dashboard for run history, retries, and failure
        inspection.
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Registered functions</h2>
        <ul style={{ marginTop: 12, lineHeight: 1.8 }}>
          <li>
            <strong>scheduled-publish-tutorial</strong> — runs every 5 minutes.
            Flips tutorials in <em>scheduled</em> status to <em>published</em>{' '}
            once their publish time passes.
          </li>
          <li>
            <strong>typesense-reindex</strong> — event triggered. Wipes and
            rebuilds the three Typesense collections from Prisma.
          </li>
          <li>
            <strong>moderation-outcome-notify</strong> — event triggered. Audit
            sink for every moderation outcome; future home of email / push
            delivery.
          </li>
          <li>
            <strong>hard-delete-scheduled-accounts</strong> — daily 03:00 UTC.
            Scrubs accounts whose 30-day deletion grace period has elapsed.
          </li>
          <li>
            <strong>editorial-picks-refresh</strong> — Sunday 22:00 UTC.
            Recomputes the next four weeks of homepage editorial picks.
          </li>
          <li>
            <strong>analytics-rollup-nightly</strong> — daily 02:00 UTC.
            Rolls yesterday&apos;s events into the daily + cohort summary
            tables that <code>/admin/analytics</code> reads from.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Trigger reindex</h2>
        <p style={{ marginBottom: 12 }}>
          Use this after a bulk content change if the live search starts
          drifting from Prisma.
        </p>
        <ReindexButton />
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Analytics rollup backfill</h2>
        <p style={{ marginBottom: 12 }}>
          Re-run the daily + cohort rollup for a date range. Use after a
          cron failure or to populate any historical days that pre-date the
          self-hosted analytics rollout.
        </p>
        <AnalyticsRollupButton />
      </section>

      <section style={{ marginTop: 32 }}>
        <a
          href={INNGEST_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-link"
        >
          Open Inngest dashboard →
        </a>
      </section>
    </div>
  )
}
