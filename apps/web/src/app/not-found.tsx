import type { Metadata } from 'next'
import Link from 'next/link'
import { notFoundMetadata } from '@/lib/seo/metadata-helpers'

/**
 * Branded 404. Next.js sets HTTP 404 automatically whenever this page is
 * rendered via `notFound()` from a route segment. We override metadata to
 * be explicit (noindex) and to shape the title for the rare case where the
 * 404 is shared.
 */
export const metadata: Metadata = notFoundMetadata()

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth: 600,
        margin: '64px auto',
        padding: '0 24px',
        fontFamily: 'var(--font-lora), Georgia, serif',
        color: 'var(--color-charcoal, #2b2b2b)',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-warm-taupe, #8a7d68)',
          marginBottom: 6,
        }}
      >
        404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: 36,
          fontWeight: 400,
          margin: '0 0 18px',
        }}
      >
        That page isn&apos;t here.
      </h1>
      <p style={{ lineHeight: 1.65 }}>
        The URL you opened either moved, isn&apos;t published yet, or never
        existed. Most things on Homemade live in one of three places.
      </p>
      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <Link href="/">The homepage</Link> — start here.
        </li>
        <li>
          <Link href="/search">Search</Link> — find a tutorial by name.
        </li>
        <li>
          <Link href="/makers">Makers</Link> — browse the people writing here.
        </li>
      </ul>
    </main>
  )
}
