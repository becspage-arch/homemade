import Link from 'next/link'

// Deliberately NOT force-static: the parent (public) layout is force-dynamic
// because it calls Clerk's currentUser() on every request (see its comment).
// This page previously forced static rendering, which made Next prerender it
// outside the normal per-request path — no clerkMiddleware context, so
// currentUser() threw "auth() was called but Clerk can't detect usage of
// clerkMiddleware()" on every render (HOMEMADE-WEB-1, 6000+ events). The
// error was already caught and downgraded to a warning in
// getCurrentDbUser(), so it was pure log noise, not visitor-facing — but
// still worth cutting. This page is cheap enough that per-request rendering
// costs nothing meaningful.

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
