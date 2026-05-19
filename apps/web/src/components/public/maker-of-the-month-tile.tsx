import Link from 'next/link'
import { mediaUrl } from '@/lib/media'
import type { MakerOfTheMonthTile as Tile } from '@/lib/maker-of-the-month'

interface MakerOfTheMonthTileProps {
  motm: Tile
}

/**
 * Homepage editorial tile for the active Maker of the Month. Renders only
 * when a pick is live (the parent already filters). Tile is full-width,
 * sits below the rails and above the "browse all categories" grid.
 */
export function MakerOfTheMonthTile({ motm }: MakerOfTheMonthTileProps) {
  const cover = motm.user.makerHeaderImage
    ? mediaUrl(motm.user.makerHeaderImage, 'public')
    : null
  const monthLabel = motm.monthStart.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
  const name = motm.user.name ?? motm.user.displayHandle ?? 'A Maker'
  const handle = motm.user.displayHandle

  return (
    <section
      style={{
        margin: '24px 0',
        padding: '20px 24px',
        borderRadius: 12,
        background: 'var(--color-warm-cream, #f6efe6)',
        border: '0.5px solid var(--color-warm-taupe, #b3a48d)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-sage, #6b8a64)',
        }}
      >
        ★ Maker of the Month — {monthLabel}
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cover ? '180px 1fr' : '1fr',
          gap: 20,
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        {cover && (
          <div
            style={{
              aspectRatio: '4 / 3',
              overflow: 'hidden',
              borderRadius: 8,
              background: 'var(--color-cream, #fffcf5)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-lora, Lora, serif)',
              fontSize: 24,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {name}
          </h2>
          {motm.user.bio && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                marginTop: 8,
                maxWidth: '60ch',
              }}
            >
              {motm.user.bio}
            </p>
          )}
          {handle && (
            <p style={{ marginTop: 12 }}>
              <Link
                href={`/m/${handle}`}
                style={{
                  color: 'var(--color-sage, #6b8a64)',
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                Open their Maker profile →
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
