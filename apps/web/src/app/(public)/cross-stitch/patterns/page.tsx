import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = false

export const metadata = {
  title: 'Cross-stitch patterns · homemade',
  description:
    'The Homemade cross-stitch pattern library is on its way. In the meantime, browse cross-stitch tutorials.',
  robots: { index: false, follow: true },
}

export default function CrossStitchPatternsPlaceholderPage() {
  return (
    <div
      style={{
        maxWidth: 640,
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
        Cross-stitch patterns
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.65 }}>
        Pattern library and the cross-stitch Studio launch soon. In the
        meantime, browse cross-stitch tutorials.
      </p>
      <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link
          href="/cross-stitch"
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
          Browse cross-stitch tutorials
        </Link>
      </div>
    </div>
  )
}
