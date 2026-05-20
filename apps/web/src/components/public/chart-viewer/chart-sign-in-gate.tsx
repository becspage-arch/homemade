import Link from 'next/link'

interface ChartSignInGateProps {
  /** Title shown on the gate. Defaults to a craft-neutral message. */
  title?: string
  /** Optional craft-specific subtitle. */
  subtitle?: string
}

/**
 * Anonymous-user gate that replaces a chart renderer when the reader is
 * not signed in. The chart viewer requires auth at all tiers; this is the
 * surface anonymous visitors see in its place.
 *
 * Renders a sign-in CTA pointing at /sign-in with `redirect` set to the
 * current URL so the user lands back on the same tutorial. The page
 * already runs through Clerk middleware so the link resolves to the
 * configured sign-in route.
 *
 * Server component — no client interactivity needed.
 */
export function ChartSignInGate({
  title = 'Sign in to view the chart',
  subtitle,
}: ChartSignInGateProps) {
  return (
    <div className="chart-sign-in-gate">
      <div className="chart-sign-in-gate__icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="56" height="56">
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <path
            d="M14 14 L50 50 M50 14 L14 50"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <circle cx="32" cy="32" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M32 27 L32 32 L36 34"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="chart-sign-in-gate__title">{title}</h3>
      {subtitle ? <p className="chart-sign-in-gate__subtitle">{subtitle}</p> : null}
      <p className="chart-sign-in-gate__body">
        Homemade charts are interactive — zoom, pan, mark off stitches, and
        save your place across devices. Sign in to start using the chart.
      </p>
      <div className="chart-sign-in-gate__actions">
        <Link href="/sign-in" className="chart-sign-in-gate__cta">
          Sign in
        </Link>
        <Link href="/sign-up" className="chart-sign-in-gate__cta-secondary">
          Create a free account
        </Link>
      </div>
    </div>
  )
}
