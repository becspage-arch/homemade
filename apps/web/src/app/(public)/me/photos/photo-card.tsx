'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { removeMakerPhoto, requestPhotoAppeal } from '@/lib/maker-photo-actions'

export interface MyPhotoView {
  id: string
  url: string | null
  caption: string | null
  status: 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
  appealRequested: boolean
  itemTitle: string
  itemHref: string | null
}

const STATUS_LABEL: Record<MyPhotoView['status'], string> = {
  PENDING_MODERATION: 'Checking your photo',
  APPROVED: 'On the site',
  REJECTED: 'Not accepted',
}

/**
 * One photo on My photos. Removal is instant and final; an appeal can be asked
 * for once and puts the photo in front of a person.
 */
export function MyPhotoCard({ photo }: { photo: MyPhotoView }) {
  const [pending, start] = useTransition()
  const [gone, setGone] = useState(false)
  const [appealed, setAppealed] = useState(photo.appealRequested)
  const [error, setError] = useState<string | null>(null)

  if (gone) return null

  function remove() {
    if (!confirm('Take this photo off the site? This cannot be undone.')) return
    setError(null)
    start(async () => {
      const res = await removeMakerPhoto({ photoId: photo.id })
      if (res.ok) setGone(true)
      else setError(res.error)
    })
  }

  function appeal() {
    setError(null)
    start(async () => {
      const res = await requestPhotoAppeal({ photoId: photo.id })
      if (res.ok) setAppealed(true)
      else setError(res.error)
    })
  }

  return (
    <div
      style={{
        background: 'var(--color-cream)',
        border: '0.5px solid var(--color-linen-grey)',
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily: 'var(--font-lora)',
      }}
    >
      <div
        style={{
          aspectRatio: '4 / 3',
          backgroundColor: 'var(--color-soft-parchment)',
          backgroundImage: photo.url ? `url(${photo.url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div style={{ padding: 12 }}>
        {photo.itemHref ? (
          <Link
            href={photo.itemHref}
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 16,
              color: 'var(--color-espresso)',
              textDecoration: 'none',
            }}
          >
            {photo.itemTitle}
          </Link>
        ) : (
          <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16 }}>
            {photo.itemTitle}
          </span>
        )}

        {photo.caption && (
          <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
            {photo.caption}
          </p>
        )}

        <div style={{ marginTop: 6 }}>
          <span className="me-status-pill">{STATUS_LABEL[photo.status]}</span>
        </div>

        {photo.status === 'REJECTED' && photo.rejectionReason && (
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-burnt-sienna)' }}>
            {photo.rejectionReason}
          </p>
        )}

        {error && (
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-burnt-sienna)' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          {photo.status === 'REJECTED' &&
            (appealed ? (
              <span style={{ fontSize: 13, color: 'var(--color-warm-taupe)' }}>
                We are looking at this again.
              </span>
            ) : (
              <button
                type="button"
                className="me-button secondary"
                disabled={pending}
                onClick={appeal}
              >
                Ask us to look again
              </button>
            ))}
          <button
            type="button"
            className="me-button danger"
            disabled={pending}
            onClick={remove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
