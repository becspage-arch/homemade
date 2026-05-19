'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  setMakerProfilePublic,
  updateMakerHeader,
} from '@/lib/user-state-actions'

interface MakerProfileSettingsProps {
  initialIsPublic: boolean
  initialHeaderMediaId: string | null
  handle: string | null
}

/**
 * Public-profile toggle, header-image picker, and "Preview as public" link.
 * The header image picker is a Media-id paste field for now — a proper
 * uploader lives on the follow-up queue (Session A scope) so end-users
 * don't need to know what a Media id is. Power users (Rebecca) can drop one
 * here today.
 */
export function MakerProfileSettings({
  initialIsPublic,
  initialHeaderMediaId,
  handle,
}: MakerProfileSettingsProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [headerMediaId, setHeaderMediaId] = useState(initialHeaderMediaId ?? '')
  const [publicStatus, setPublicStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [publicError, setPublicError] = useState<string | null>(null)
  const [headerStatus, setHeaderStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [, startPublic] = useTransition()
  const [, startHeader] = useTransition()

  function togglePublic(next: boolean) {
    setPublicError(null)
    setPublicStatus('saving')
    setIsPublic(next)
    startPublic(async () => {
      const res = await setMakerProfilePublic(next)
      if (res.ok) {
        setPublicStatus('saved')
      } else {
        setPublicStatus('error')
        setPublicError(res.error)
        setIsPublic(!next)
      }
    })
  }

  function saveHeader(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setHeaderError(null)
    setHeaderStatus('saving')
    const id = headerMediaId.trim() || null
    startHeader(async () => {
      const res = await updateMakerHeader({ mediaId: id })
      if (res.ok) {
        setHeaderStatus('saved')
      } else {
        setHeaderStatus('error')
        setHeaderError(res.error)
      }
    })
  }

  const canPreview = isPublic && Boolean(handle)

  return (
    <div className="me-form" style={{ marginTop: 8 }}>
      <label className="me-toggle">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => togglePublic(e.target.checked)}
          disabled={!handle}
        />
        <span>Make my Maker profile public</span>
      </label>
      {!handle && (
        <p className="me-feedback">
          Pick a handle above first — your profile URL needs one.
        </p>
      )}
      <p className="me-feedback">
        {publicStatus === 'saving' && 'saving…'}
        {publicStatus === 'saved' && 'saved.'}
        {publicStatus === 'error' && publicError && (
          <span className="error">{publicError}</span>
        )}
      </p>

      {canPreview && handle && (
        <p style={{ marginTop: 8 }}>
          <Link href={`/m/${handle}`} className="me-nav-link">
            Preview my public profile →
          </Link>
        </p>
      )}

      <form className="me-form" onSubmit={saveHeader} style={{ marginTop: 24 }}>
        <div className="me-field">
          <label htmlFor="maker-header-media">Header image (optional)</label>
          <input
            id="maker-header-media"
            type="text"
            value={headerMediaId}
            onChange={(e) => setHeaderMediaId(e.target.value)}
            placeholder="Media id (e.g. cmXXXXXX…) — leave blank for none"
            autoComplete="off"
          />
          <span className="me-field-hint">
            A cover image at the top of your public profile. Paste a Media id
            here for now — a proper picker lands in a future update.
          </span>
        </div>
        <div>
          <button type="submit" className="me-button">
            Save header
          </button>
        </div>
        {headerStatus === 'saving' && <p className="me-feedback">saving…</p>}
        {headerStatus === 'saved' && <p className="me-feedback">saved.</p>}
        {headerStatus === 'error' && headerError && (
          <p className="me-feedback error">{headerError}</p>
        )}
      </form>
    </div>
  )
}
