'use client'

import { X, StickyNote, ExternalLink, Printer } from 'lucide-react'
import { DISCIPLINE_LABELS, type NeedleworkDiscipline } from './types'

interface NeedleworkStudioToolbarProps {
  patternName: string
  discipline: NeedleworkDiscipline
  designerName: string | null
  notesOpen: boolean
  onToggleNotes: () => void
  tutorialHref: string | null
  onClose: () => void
}

export function NeedleworkStudioToolbar({
  patternName,
  discipline,
  designerName,
  notesOpen,
  onToggleNotes,
  tutorialHref,
  onClose,
}: NeedleworkStudioToolbarProps) {
  return (
    <div className="needlework-studio-toolbar">
      <button
        type="button"
        className="needlework-studio-toolbar-btn"
        onClick={onClose}
        aria-label="Close pattern"
        title="Close"
      >
        <X size={18} strokeWidth={1.5} />
      </button>

      <div className="needlework-studio-toolbar-title">
        {patternName}
        {designerName && (
          <span style={{ fontWeight: 400, color: 'var(--colour-text-muted)', marginLeft: '0.375rem' }}>
            by {designerName}
          </span>
        )}
      </div>

      <span className="needlework-studio-toolbar-discipline">
        {DISCIPLINE_LABELS[discipline]}
      </span>

      <button
        type="button"
        className={`needlework-studio-toolbar-btn${notesOpen ? ' active' : ''}`}
        onClick={onToggleNotes}
        aria-label="Toggle notes"
        title="Notes"
      >
        <StickyNote size={18} strokeWidth={1.5} />
      </button>

      {tutorialHref && (
        <a
          href={tutorialHref}
          className="needlework-studio-toolbar-btn"
          aria-label="Open tutorial"
          title="Tutorial"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ExternalLink size={18} strokeWidth={1.5} />
        </a>
      )}
    </div>
  )
}
