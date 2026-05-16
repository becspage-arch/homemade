import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = false

export const metadata = {
  title: 'Offline · homemade',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: '64px auto',
        padding: '0 24px',
        fontFamily: 'var(--font-lora)',
        color: 'var(--color-espresso)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-fraunces)',
          fontWeight: 500,
          fontSize: 32,
          margin: '0 0 14px',
          color: 'var(--color-sage)',
        }}
      >
        You&apos;re offline
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6 }}>
        This page isn&apos;t saved for offline reading. Recipes you bookmark are
        kept locally so they work without a connection — open one from your
        saved list, or come back when you&apos;re online.
      </p>
      <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link
          href="/me/bookmarks"
          style={{
            background: 'var(--color-sage)',
            color: 'var(--color-cream)',
            padding: '10px 18px',
            borderRadius: 999,
            textDecoration: 'none',
            fontFamily: 'var(--font-fraunces)',
            letterSpacing: '0.04em',
          }}
        >
          Open saved
        </Link>
        <Link
          href="/"
          style={{
            border: '0.5px solid var(--color-linen-grey)',
            color: 'var(--color-sage)',
            padding: '10px 18px',
            borderRadius: 999,
            textDecoration: 'none',
            fontFamily: 'var(--font-fraunces)',
            letterSpacing: '0.04em',
          }}
        >
          Try home
        </Link>
      </div>
    </div>
  )
}
