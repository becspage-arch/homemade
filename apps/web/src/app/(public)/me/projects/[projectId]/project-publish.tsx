'use client'

import { useState, useTransition } from 'react'
import { publishUserProject } from '@/lib/user-state-actions'

interface WhatIUsedRow {
  name: string
  note?: string | null
}

interface ProjectPublishProps {
  projectId: string
  initialIsPublic: boolean
  initialPublicNote: string | null
  initialWhatIUsed: WhatIUsedRow[]
  initialHeroPhotoId: string | null
  ownerHandle: string | null
  photos: Array<{ id: string; thumbUrl: string | null; caption: string | null }>
}

/**
 * Combined publish + Made it metadata editor for /me/projects/[id]. Three
 * controls in one form so the Maker isn't shuffling between three save
 * buttons:
 *   - the public toggle (sets isPublic + publishedAt)
 *   - the publicNote (separate from private notes)
 *   - the What I used list (free-text supply lines for now)
 *   - the hero photo override (only shown when the Maker has approved
 *     UGCPhotos on this project's tutorial)
 *
 * Saves as one server-action call so a single round-trip covers the whole
 * Made it entry.
 */
export function ProjectPublish({
  projectId,
  initialIsPublic,
  initialPublicNote,
  initialWhatIUsed,
  initialHeroPhotoId,
  ownerHandle,
  photos,
}: ProjectPublishProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [publicNote, setPublicNote] = useState(initialPublicNote ?? '')
  const [items, setItems] = useState<WhatIUsedRow[]>(
    initialWhatIUsed.length > 0
      ? initialWhatIUsed
      : [{ name: '', note: '' }],
  )
  const [heroPhotoId, setHeroPhotoId] = useState<string | null>(
    initialHeroPhotoId,
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)
  const [, start] = useTransition()

  function updateItem(idx: number, patch: Partial<WhatIUsedRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItems((prev) => [...prev, { name: '', note: '' }])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus('saving')
    const trimmed = items
      .map((it) => ({
        name: it.name.trim(),
        note: (it.note ?? '').trim() || null,
      }))
      .filter((it) => it.name.length > 0)
    start(async () => {
      const res = await publishUserProject({
        projectId,
        isPublic,
        publicNote: publicNote.trim() || null,
        whatIUsed: trimmed,
        heroPhotoId,
      })
      if (res.ok) {
        setStatus('saved')
      } else {
        setStatus('error')
        setError(res.error)
      }
    })
  }

  return (
    <form className="me-form" onSubmit={save} style={{ marginTop: 24 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 8,
          border: '0.5px solid var(--color-warm-taupe)',
          background: isPublic ? 'rgba(107, 138, 100, 0.06)' : 'transparent',
        }}
      >
        <label className="me-toggle">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span>
            <strong>Publish to my Maker profile</strong>
          </span>
        </label>
        <p
          className="me-section-description"
          style={{ margin: '6px 0 0', fontSize: 13 }}
        >
          {isPublic ? (
            <>
              <strong>Public</strong> — anyone with the link can see this on
              your Maker profile
              {ownerHandle && (
                <>
                  {' '}
                  at <code>/m/{ownerHandle}</code>
                </>
              )}
              .
            </>
          ) : (
            <>
              <strong>Private</strong> — only you see this.
            </>
          )}
        </p>
      </div>

      <div className="me-field">
        <label htmlFor="publicNote">A note about this make (public)</label>
        <textarea
          id="publicNote"
          value={publicNote}
          onChange={(e) => setPublicNote(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Anything you want visitors to know about how this went. Optional."
        />
        <span className="me-field-hint">
          Separate from your private notes above. Shows on{' '}
          {ownerHandle ? (
            <code>
              /m/{ownerHandle}/made/{projectId}
            </code>
          ) : (
            'your Made it page'
          )}{' '}
          when you publish.
        </span>
      </div>

      <div className="me-field">
        <label>What I used</label>
        <span
          className="me-field-hint"
          style={{ display: 'block', marginBottom: 8 }}
        >
          Free text for now — list the ingredients, tools, or materials you
          actually used. The marketplace links land later.
        </span>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <input
              type="text"
              value={it.name}
              onChange={(e) => updateItem(idx, { name: e.target.value })}
              placeholder="Name (e.g. Maldon sea salt)"
              maxLength={120}
            />
            <input
              type="text"
              value={it.note ?? ''}
              onChange={(e) => updateItem(idx, { note: e.target.value })}
              placeholder="Note (e.g. swapped for kosher salt)"
              maxLength={300}
            />
            <button
              type="button"
              className="me-button secondary"
              onClick={() => removeItem(idx)}
              style={{ padding: '4px 10px', fontSize: 12 }}
              aria-label="Remove supply line"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="me-button secondary"
          onClick={addItem}
          style={{ marginTop: 4 }}
        >
          + Add another
        </button>
      </div>

      {photos.length > 0 && (
        <div className="me-field">
          <label>Hero photo on your public Made it page</label>
          <span
            className="me-field-hint"
            style={{ display: 'block', marginBottom: 8 }}
          >
            Pick which of your photos shows as the hero. Defaults to the most
            recent.
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 8,
            }}
          >
            <label
              style={{
                cursor: 'pointer',
                border:
                  heroPhotoId === null
                    ? '2px solid var(--color-sage)'
                    : '0.5px solid var(--color-warm-taupe)',
                borderRadius: 6,
                padding: 6,
                textAlign: 'center',
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                aspectRatio: '1',
              }}
            >
              <input
                type="radio"
                name="heroPhoto"
                checked={heroPhotoId === null}
                onChange={() => setHeroPhotoId(null)}
                style={{ display: 'none' }}
              />
              <span>Auto</span>
              <small style={{ color: 'var(--color-warm-taupe)' }}>most recent</small>
            </label>
            {photos.map((p) => (
              <label
                key={p.id}
                style={{
                  cursor: 'pointer',
                  border:
                    heroPhotoId === p.id
                      ? '2px solid var(--color-sage)'
                      : '0.5px solid var(--color-warm-taupe)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  aspectRatio: '1',
                  background: 'var(--color-warm-cream)',
                }}
              >
                <input
                  type="radio"
                  name="heroPhoto"
                  checked={heroPhotoId === p.id}
                  onChange={() => setHeroPhotoId(p.id)}
                  style={{ display: 'none' }}
                />
                {p.thumbUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbUrl}
                    alt={p.caption ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <button type="submit" className="me-button">
          Save Made it
        </button>
      </div>

      {status === 'saving' && <p className="me-feedback">saving…</p>}
      {status === 'saved' && <p className="me-feedback">saved.</p>}
      {status === 'error' && error && (
        <p className="me-feedback error">{error}</p>
      )}
    </form>
  )
}
