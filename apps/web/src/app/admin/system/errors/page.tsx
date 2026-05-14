const SENTRY_ORG_SLUG = process.env.SENTRY_ORG_SLUG ?? null
const SENTRY_PROJECT_SLUG = process.env.SENTRY_PROJECT_SLUG ?? null
const SENTRY_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)

export default function AdminErrorsPage() {
  const dashboardUrl =
    SENTRY_ORG_SLUG && SENTRY_PROJECT_SLUG
      ? `https://sentry.io/organizations/${SENTRY_ORG_SLUG}/projects/${SENTRY_PROJECT_SLUG}/?statsPeriod=7d`
      : null

  return (
    <div className="admin-placeholder">
      <h1>Error log</h1>

      {SENTRY_CONFIGURED ? (
        <p>
          Sentry is live. Browser, server, and edge runtime errors all report
          into the project, with PII scrubbed (cookies, request bodies, IPs,
          emails dropped). Source maps upload from CI on every deploy.
        </p>
      ) : (
        <p>
          Sentry isn’t configured in this environment yet.{' '}
          <code>NEXT_PUBLIC_SENTRY_DSN</code> is unset.
        </p>
      )}

      <p>
        Many issues are caught before they reach Sentry: each push to{' '}
        <code>main</code> blocks on the GitHub Actions deploy and a{' '}
        <code>/healthz</code> smoke check (see <code>CLAUDE.md</code> — deploy
        verification). Sentry catches what the smoke check misses: runtime
        errors on specific routes, browser-only failures, and slow regressions.
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
          Set <code>SENTRY_ORG_SLUG</code> and <code>SENTRY_PROJECT_SLUG</code>{' '}
          to link out directly.
        </p>
      )}
    </div>
  )
}
