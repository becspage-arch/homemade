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
import Link from 'next/link'
import { Undo2, Redo2, MoreHorizontal, Check, Loader2, Grid2X2, X as XIcon, Type, Sparkles } from 'lucide-react'
import { useChartStore, type RenderStyle } from '../chart/chart-store'

interface StudioToolbarProps {
  patternId: string
  patternName: string
  signedIn: boolean
  isPremium: boolean
  userEmail: string | null
  userName: string | null
  canEdit: boolean
  onOpenBrandSwap: () => void
}

export function StudioToolbar({
  patternId,
  patternName,
  signedIn,
  isPremium,
  userEmail,
  userName,
  canEdit,
  onOpenBrandSwap,
}: StudioToolbarProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(patternName)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Per-slice selectors — keep the toolbar from re-rendering on every
  // store tick (every cell paint, every pan / zoom).
  const dirty = useChartStore((s) => s.dirty)
  const canUndo = useChartStore((s) => s.history.length > 0)
  const canRedo = useChartStore((s) => s.future.length > 0)
  const undoAction = useChartStore((s) => s.undo)
  const redoAction = useChartStore((s) => s.redo)

  useEffect(() => {
    if (!dirty) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveState('saving')
  }, [dirty])

  useEffect(() => {
    if (saveState !== 'saving' || dirty) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveState('saved')
    const t = setTimeout(() => setSaveState('idle'), 1800)
    return () => clearTimeout(t)
  }, [dirty, saveState])

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
        <Link href="/cross-stitch" className="studio-toolbar-home" aria-label="Back to cross-stitch">
          <span className="studio-toolbar-home-mark">⌂</span>
        </Link>
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
        <RenderStyleToggle />
        {canEdit && (
          <div className="studio-toolbar-history">
            <button
              type="button"
              className="studio-icon-button"
              onClick={() => undoAction()}
              disabled={!canUndo}
              title="Undo (Cmd+Z)"
            >
              <Undo2 size={18} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="studio-icon-button"
              onClick={() => redoAction()}
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
              isPremium={isPremium}
              onClose={() => setOverflowOpen(false)}
              onOpenBrandSwap={() => {
                setOverflowOpen(false)
                onOpenBrandSwap()
              }}
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

/**
 * Render-style segmented control. Three options that map to how each
 * cell draws: colour-block (rect fill, the working-chart default),
 * x-stitch (X-shape, the finished-piece preview), symbol-only
 * (monochrome, the printed-magazine style).
 */
function RenderStyleToggle() {
  const renderStyle = useChartStore((s) => s.renderStyle)
  const setRenderStyle = useChartStore((s) => s.setRenderStyle)

  const options: Array<{ value: RenderStyle; label: string; icon: typeof Grid2X2 }> = [
    { value: 'colour-block', label: 'Colour blocks', icon: Grid2X2 },
    { value: 'x-stitch', label: 'X stitches (preview)', icon: XIcon },
    { value: 'symbol-only', label: 'Symbols only', icon: Type },
  ]

  return (
    <div className="studio-render-style" role="radiogroup" aria-label="Chart render style">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={renderStyle === value}
          className={[
            'studio-render-style-button',
            renderStyle === value ? 'is-active' : '',
          ].join(' ')}
          onClick={() => setRenderStyle(value)}
          title={label}
        >
          <Icon size={15} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  )
}

function OverflowMenu({
  patternId,
  canEdit,
  isPremium,
  onClose,
  onOpenBrandSwap,
}: {
  patternId: string
  canEdit: boolean
  isPremium: boolean
  onClose: () => void
  onOpenBrandSwap: () => void
}) {
  return (
    <div className="studio-popover" onMouseLeave={onClose}>
      {/* Printing / downloading is premium across every category. Non-premium
          Makers get a calm link to upgrade in place of the export action; the
          PDF + floss-list routes enforce the same server-side. */}
      {isPremium ? (
        <a className="studio-popover-item" href={`/api/studio/patterns/${patternId}/pdf?paper=a4`} target="_blank">
          Export as PDF
        </a>
      ) : (
        <Link className="studio-popover-item is-premium" href="/premium">
          <Sparkles size={13} strokeWidth={1.8} aria-hidden="true" /> Export as PDF · Premium
        </Link>
      )}
      {isPremium ? (
        <a className="studio-popover-item" href={`/api/studio/patterns/${patternId}/floss-list`} target="_blank">
          Download floss list
        </a>
      ) : (
        <Link className="studio-popover-item is-premium" href="/premium">
          <Sparkles size={13} strokeWidth={1.8} aria-hidden="true" /> Download floss list · Premium
        </Link>
      )}
      <button type="button" className="studio-popover-item" onClick={onOpenBrandSwap}>
        Switch floss brand
      </button>
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
      <Link className="studio-popover-item" href="/me/settings">
        Settings
      </Link>
      <Link className="studio-popover-item" href="/me">
        Your account
      </Link>
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
