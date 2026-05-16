import type { ReactNode } from 'react'
import Link from 'next/link'

/**
 * Shared chrome for every page under /admin/analytics — title row, sub-tab
 * navigation, and the page body. Tabs are plain anchors (no client state
 * needed); active tab is picked up via aria-current in each page.
 */

const TABS = [
  { href: '/admin/analytics', label: 'Overview' },
  { href: '/admin/analytics/cohorts', label: 'Cohorts' },
  { href: '/admin/analytics/activation', label: 'Activation' },
  { href: '/admin/analytics/content', label: 'Content' },
  { href: '/admin/analytics/search', label: 'Search' },
  { href: '/admin/analytics/acquisition', label: 'Acquisition' },
  { href: '/admin/analytics/creator', label: 'Creator' },
  { href: '/admin/analytics/system', label: 'System' },
]

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '8px 0 48px' }}>
      <header style={{ marginBottom: 8 }}>
        <h1
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontWeight: 400,
            fontSize: 38,
            color: 'var(--color-espresso)',
            margin: 0,
            letterSpacing: '0.01em',
          }}
        >
          Analytics
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-lora)',
            color: 'var(--color-warm-taupe)',
            margin: '4px 0 0',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Self-hosted. Events dual-fire to our own database alongside PostHog; these
          dashboards read the nightly rollups.
        </p>
      </header>

      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          margin: '20px 0 28px',
          borderBottom: '0.5px solid var(--color-linen-grey)',
        }}
      >
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '8px 14px',
              fontFamily: 'var(--font-lora)',
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-warm-taupe)',
              textDecoration: 'none',
              borderBottom: '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
