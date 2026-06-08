'use client'

/**
 * StudioToolbar — the thin chrome bar across the top of the loaded
 * Studio. Holds the pattern title (click to rename), the autosave
 * indicator (no manual Save button — autosave is the contract), the
 * undo / redo pair, and a discreet avatar that opens a settings popover.
 *
 * Designed to disappear into the canvas: warm taupe text on a softened
 * cream surface, no harsh borders, ~52px tall on desktop and 48px on
 * mobile. The chart underneath bleeds to the toolbar's edge so the
 * pattern reads as the page, not "an element inside a wrapper."
 */

import { useEffect, useState } from 'react'
import { Undo2, Redo2, MoreHorizontal, Check, Loader2 } from 'lucide-react'
import { useChartStore } from '../chart/chart-store'

interface StudioToolbarProps {
  patternId: string
  patternName: string
  signedIn: boolean
  userEmail: string | null
  userName: string | null
  canEdit: boolean
}

export function StudioToolbar({
  patternId,
  patternName,
  signedIn,
  userEmail,
  userName,
  canEdit,
}: StudioToolbarProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(patternName)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const store = useChartStore()
  const canUndo = store.history.length > 0
  const canRedo = store.future.length > 0

  useEffect(() => {
    if (store.dirty) {
      setSaveState('saving')
    } else if (saveState === 'saving') {
      setSaveState('saved')
      const t = setTimeout(() => setSaveState('idle'), 1800)
      return () => clearTimeout(t)
    }
  }, [store.dirty, saveState])

  const commitTitle = async () => {
    const next = titleValue.trim()
    if (!next || next === patternName) {
      setTitleValue(patternName)
      setEditingTitle(false)
      return
    }
    setSaveState('saving')
    await fetch(`/api/studio/patterns/${patternId}/rename`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: next }),
    }).catch(() => undefined)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1800)
    setEditingTitle(false)
  }

  return (
    <header className="studio-toolbar">
      <div className="studio-toolbar-left">
        <a href="/cross-stitch" className="studio-toolbar-home" aria-label="Back to cross-stitch">
          <span className="studio-toolbar-home-mark">⌂</span>
        </a>
        {editingTitle ? (
          <input
            type="text"
            className="studio-title-input"
            value={titleValue}
            autoFocus
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') {
                setTitleValue(patternName)
                setEditingTitle(false)
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="studio-title-button"
            onClick={() => canEdit && setEditingTitle(true)}
            disabled={!canEdit}
            title={canEdit ? 'Rename' : ''}
          >
            {patternName}
          </button>
        )}
        <SaveIndicator state={saveState} signedIn={signedIn} />
      </div>

      <div className="studio-toolbar-right">
        {canEdit && (
          <div className="studio-toolbar-history">
            <button
              type="button"
              className="studio-icon-button"
              onClick={() => store.undo()}
              disabled={!canUndo}
              title="Undo (Cmd+Z)"
            >
              <Undo2 size={18} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="studio-icon-button"
              onClick={() => store.redo()}
              disabled={!canRedo}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 size={18} strokeWidth={1.6} />
            </button>
          </div>
        )}

        <div className="studio-toolbar-overflow-wrap">
          <button
            type="button"
            className="studio-icon-button"
            onClick={() => setOverflowOpen((v) => !v)}
            aria-haspopup="menu"
            title="More"
          >
            <MoreHorizontal size={18} strokeWidth={1.6} />
          </button>
          {overflowOpen && (
            <OverflowMenu
              patternId={patternId}
              canEdit={canEdit}
              onClose={() => setOverflowOpen(false)}
            />
          )}
        </div>

        <div className="studio-toolbar-avatar-wrap">
          <button
            type="button"
            className="studio-avatar-button"
            onClick={() => setAvatarOpen((v) => !v)}
            aria-haspopup="menu"
          >
            {initialsFor(userName, userEmail) ?? 'You'}
          </button>
          {avatarOpen && (
            <AvatarMenu
              userEmail={userEmail}
              userName={userName}
              onClose={() => setAvatarOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  )
}

function SaveIndicator({ state, signedIn }: { state: 'idle' | 'saving' | 'saved'; signedIn: boolean }) {
  if (!signedIn) {
    return <span className="studio-save-indicator subtle">Sign in to save</span>
  }
  if (state === 'saving') {
    return (
      <span className="studio-save-indicator">
        <Loader2 size={13} className="studio-save-spin" /> Saving…
      </span>
    )
  }
  if (state === 'saved') {
    return (
      <span className="studio-save-indicator">
        <Check size={13} /> All changes saved
      </span>
    )
  }
  return <span className="studio-save-indicator subtle">Saved</span>
}

function OverflowMenu({
  patternId,
  canEdit,
  onClose,
}: {
  patternId: string
  canEdit: boolean
  onClose: () => void
}) {
  return (
    <div className="studio-popover" onMouseLeave={onClose}>
      <a className="studio-popover-item" href={`/api/studio/patterns/${patternId}/pdf?paper=a4`} target="_blank">
        Export as PDF
      </a>
      <a className="studio-popover-item" href={`/api/studio/patterns/${patternId}/floss-list`} target="_blank">
        Download floss list
      </a>
      {canEdit && (
        <button
          type="button"
          className="studio-popover-item"
          onClick={async () => {
            await fetch(`/api/studio/patterns/${patternId}/duplicate`, { method: 'POST' })
            onClose()
          }}
        >
          Duplicate
        </button>
      )}
      {canEdit && (
        <button
          type="button"
          className="studio-popover-item danger"
          onClick={async () => {
            if (!confirm('Delete this pattern? Your progress will be lost.')) return
            await fetch(`/api/studio/patterns/${patternId}`, { method: 'DELETE' })
            window.location.href = '/studio/cross-stitch'
          }}
        >
          Delete
        </button>
      )}
    </div>
  )
}

function AvatarMenu({
  userEmail,
  userName,
  onClose,
}: {
  userEmail: string | null
  userName: string | null
  onClose: () => void
}) {
  return (
    <div className="studio-popover studio-popover-avatar" onMouseLeave={onClose}>
      <div className="studio-popover-account">
        <div className="studio-popover-account-name">{userName ?? 'Maker'}</div>
        {userEmail && <div className="studio-popover-account-email">{userEmail}</div>}
      </div>
      <a className="studio-popover-item" href="/me/settings">
        Settings
      </a>
      <a className="studio-popover-item" href="/me">
        Your account
      </a>
      <form action="/sign-out" method="post" className="studio-popover-item-form">
        <button className="studio-popover-item" type="submit">
          Sign out
        </button>
      </form>
    </div>
  )
}

function initialsFor(name: string | null, email: string | null): string | null {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return (parts[0]?.charAt(0) ?? '').toUpperCase()
    return ((parts[0]?.charAt(0) ?? '') + (parts[parts.length - 1]?.charAt(0) ?? '')).toUpperCase()
  }
  if (email) return email.charAt(0).toUpperCase()
  return null
}
