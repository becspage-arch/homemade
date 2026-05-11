const SENTRY_ORG_SLUG = process.env.SENTRY_ORG_SLUG ?? null
const SENTRY_PROJECT_SLUG = process.env.SENTRY_PROJECT_SLUG ?? null

export default function AdminErrorsPage() {
  const dashboardUrl =
    SENTRY_ORG_SLUG && SENTRY_PROJECT_SLUG
      ? `https://sentry.io/organizations/${SENTRY_ORG_SLUG}/projects/${SENTRY_PROJECT_SLUG}/?statsPeriod=7d`
      : null

  return (
    <div className="admin-placeholder">
      <h1>Error log</h1>
      <p>
        Errors caught by the browser, server, and edge runtimes are reported to
        Sentry. Open the dashboard for the full timeline, alert rules, and
        Slack / email integrations.
      </p>
      {dashboardUrl ? (
        <p style={{ marginTop: 24 }}>
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-link"
          >
            Open Sentry dashboard →
          </a>
        </p>
      ) : (
        <p style={{ marginTop: 24, fontStyle: 'italic' }}>
          Sentry isn’t configured in this environment yet.
        </p>
      )}
    </div>
  )
}
