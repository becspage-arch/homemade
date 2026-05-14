const POSTHOG_INGEST_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

// Ingestion host is `eu.i.posthog.com` / `us.i.posthog.com`; the dashboard
// for each region drops the `.i.`.
const POSTHOG_DASHBOARD_BASE = POSTHOG_INGEST_HOST.replace('//eu.i.', '//eu.').replace(
  '//us.i.',
  '//us.',
)

const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID ?? null

const dashboardUrl = POSTHOG_PROJECT_ID
  ? `${POSTHOG_DASHBOARD_BASE}/project/${POSTHOG_PROJECT_ID}`
  : POSTHOG_DASHBOARD_BASE

const POSTHOG_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)

interface Dashboard {
  title: string
  description: string
}

const DASHBOARDS: Dashboard[] = [
  {
    title: 'D1 / D7 / D30 retention by cohort week',
    description:
      'Retention insight on $pageview or signin_completed, broken down by signupCohortWeek.',
  },
  {
    title: 'Activation funnel conversion',
    description: 'Funnel on the activation funnel, broken down by acquisitionChannel.',
  },
  {
    title: 'Tutorial performance leaderboard',
    description:
      'Table on tutorial_viewed with derived bookmark / completion / review rates.',
  },
  {
    title: 'Search zero-results report',
    description: 'Trend on search_query with zeroResult: true. Content-gap signal.',
  },
  {
    title: 'Creator funnel',
    description: 'Funnel from application start through first publish.',
  },
  {
    title: 'Pattern test fill rate',
    description: 'Accepted assignments vs max_testers per pattern test.',
  },
  {
    title: 'Cookie consent acceptance breakdown',
    description: 'Pie of accept-all vs necessary-only vs customised.',
  },
  {
    title: 'Error boundary trigger trend',
    description: 'Time series on error_boundary_triggered grouped by path.',
  },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="admin-placeholder">
      <h1>Analytics</h1>

      {POSTHOG_CONFIGURED ? (
        <p>
          PostHog is live. Around fifty events flow across acquisition, activation,
          engagement, content, search, creator program, pattern testing, project
          lifecycle, cookie consent, account lifecycle, and friction. The full
          catalogue lives in <code>docs/analytics-taxonomy.md</code>.
        </p>
      ) : (
        <p>
          PostHog isn’t configured in this environment yet.{' '}
          <code>NEXT_PUBLIC_POSTHOG_KEY</code> is unset.
        </p>
      )}

      <p style={{ marginTop: 24 }}>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-link"
        >
          Open PostHog dashboard →
        </a>
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Dashboards to build in PostHog</h2>
        <p style={{ marginBottom: 12 }}>
          Events flow, but dashboards have to be built manually in the PostHog
          UI. The pre-launch checklist tracks this. Build order isn’t strict;
          retention and the activation funnel are the most useful first.
        </p>
        <ol style={{ marginTop: 12, lineHeight: 1.7, paddingLeft: 20 }}>
          {DASHBOARDS.map((d) => (
            <li key={d.title} style={{ marginBottom: 8 }}>
              <strong>{d.title}</strong> — {d.description}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
