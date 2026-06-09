'use client'

import { LibraryBig, Grid3x3, Pencil } from 'lucide-react'
import {
  COUNTED_DISCIPLINES,
  SURFACE_DISCIPLINES,
  DISCIPLINE_LABELS,
  DISCIPLINE_DESCRIPTIONS,
  type NeedleworkDiscipline,
} from './types'

interface NeedleworkEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onSelectDiscipline: (d: NeedleworkDiscipline) => void
}

export function NeedleworkEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onSelectDiscipline,
}: NeedleworkEmptyStateProps) {
  return (
    <section className="needlework-studio-empty">
      <div className="needlework-studio-empty-hero">
        <p className="needlework-studio-empty-overline">Needlework Studio</p>
        <h1 className="needlework-studio-empty-heading">
          {signedIn
            ? `Welcome back${userName ? `, ${userName.split(' ')[0]}` : ''}.`
            : 'Thread a needle.'}
        </h1>
        <p className="needlework-studio-empty-lede">
          {signedIn
            ? 'Open a project below, browse the library, or pick a discipline to start.'
            : 'Follow patterns stitch by stitch. Track counted work on the grid or annotate a surface design. Save your place, add notes, print a clean PDF.'}
        </p>
      </div>

      <button
        type="button"
        className="needlework-studio-library-cta"
        onClick={onBrowseLibrary}
        style={{ marginBottom: '2rem' }}
      >
        <LibraryBig size={22} strokeWidth={1.4} style={{ flexShrink: 0, color: 'var(--colour-text-muted)' }} />
        <div className="needlework-studio-library-cta-body">
          <div className="needlework-studio-library-cta-title">Browse the library</div>
          <div className="needlework-studio-library-cta-sub">
            Blackwork, hardanger, sashiko, embroidery, goldwork and more
          </div>
        </div>
      </button>

      <p className="needlework-studio-discipline-heading">
        <Grid3x3 size={12} strokeWidth={2} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
        Counted thread
      </p>
      <div className="needlework-studio-empty-actions" style={{ marginBottom: '1.5rem' }}>
        {COUNTED_DISCIPLINES.map((d) => (
          <button
            key={d}
            type="button"
            className="needlework-studio-empty-card"
            onClick={() => onSelectDiscipline(d)}
          >
            <span className="needlework-studio-empty-card-tag counted">Counted</span>
            <div className="needlework-studio-empty-card-title">{DISCIPLINE_LABELS[d]}</div>
            <div className="needlework-studio-empty-card-sub">{DISCIPLINE_DESCRIPTIONS[d]}</div>
          </button>
        ))}
      </div>

      <p className="needlework-studio-discipline-heading">
        <Pencil size={12} strokeWidth={2} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
        Surface embroidery
      </p>
      <div className="needlework-studio-empty-actions">
        {SURFACE_DISCIPLINES.map((d) => (
          <button
            key={d}
            type="button"
            className="needlework-studio-empty-card"
            onClick={() => onSelectDiscipline(d)}
          >
            <span className="needlework-studio-empty-card-tag surface">Surface</span>
            <div className="needlework-studio-empty-card-title">{DISCIPLINE_LABELS[d]}</div>
            <div className="needlework-studio-empty-card-sub">{DISCIPLINE_DESCRIPTIONS[d]}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
