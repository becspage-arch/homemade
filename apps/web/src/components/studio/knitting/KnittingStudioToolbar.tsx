'use client'

/**
 * KnittingStudioToolbar — top bar of the active-project surface.
 *
 *   [project name + designer]  [view toggle]  [Sub]  [Print]  [Tutorial]  [Close]
 *
 * View toggle: Written, Chart, Schematic. Chart greys out if no chart
 * data; Schematic hides if no schematicMediaId AND no sizesGraded.
 *
 * Yarn substitution surfaces as a tab so the calc is one click away
 * during a project (knitters often pull this up mid-project).
 */

import { ScrollText, Grid3x3, Ruler, BookOpen, Printer, X, Calculator } from 'lucide-react'

interface Props {
  patternName: string
  designerName: string | null
  viewMode: 'written' | 'chart' | 'schematic'
  onViewModeChange: (mode: 'written' | 'chart' | 'schematic') => void
  chartAvailable: boolean
  schematicAvailable: boolean
  substitutionOpen: boolean
  onToggleSubstitution: () => void
  tutorialHref: string | null
  printHref: string | null
  onClose: () => void
}

export function KnittingStudioToolbar({
  patternName,
  designerName,
  viewMode,
  onViewModeChange,
  chartAvailable,
  schematicAvailable,
  substitutionOpen,
  onToggleSubstitution,
  tutorialHref,
  printHref,
  onClose,
}: Props) {
  return (
    <header className="knitting-studio-toolbar">
      <div className="knitting-studio-toolbar-title">
        <div className="knitting-studio-toolbar-name">{patternName}</div>
        {designerName && (
          <div className="knitting-studio-toolbar-designer">by {designerName}</div>
        )}
      </div>

      <div className="knitting-studio-toolbar-modes" role="tablist" aria-label="View mode">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'written'}
          className={`knitting-studio-toolbar-mode${viewMode === 'written' ? ' is-active' : ''}`}
          onClick={() => onViewModeChange('written')}
        >
          <ScrollText size={16} strokeWidth={1.5} />
          <span>Written</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'chart'}
          className={`knitting-studio-toolbar-mode${viewMode === 'chart' ? ' is-active' : ''}`}
          onClick={() => onViewModeChange('chart')}
          disabled={!chartAvailable}
          title={chartAvailable ? 'Chart view' : 'No chart for this pattern'}
        >
          <Grid3x3 size={16} strokeWidth={1.5} />
          <span>Chart</span>
        </button>
        {schematicAvailable && (
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'schematic'}
            className={`knitting-studio-toolbar-mode${viewMode === 'schematic' ? ' is-active' : ''}`}
            onClick={() => onViewModeChange('schematic')}
          >
            <Ruler size={16} strokeWidth={1.5} />
            <span>Schematic</span>
          </button>
        )}
      </div>

      <div className="knitting-studio-toolbar-prefs">
        <button
          type="button"
          className={`knitting-studio-toolbar-action${substitutionOpen ? ' is-active' : ''}`}
          aria-pressed={substitutionOpen}
          onClick={onToggleSubstitution}
          title="Yarn substitution calculator"
        >
          <Calculator size={16} strokeWidth={1.5} />
          <span>Sub</span>
        </button>

        {tutorialHref && (
          <a
            href={tutorialHref}
            target="_blank"
            rel="noopener noreferrer"
            className="knitting-studio-toolbar-action"
            title="Open the full tutorial in a new tab"
          >
            <BookOpen size={16} strokeWidth={1.5} />
            <span>Tutorial</span>
          </a>
        )}

        {printHref && (
          <a
            href={printHref}
            target="_blank"
            rel="noopener noreferrer"
            className="knitting-studio-toolbar-action"
            title="Open the print-friendly pattern"
          >
            <Printer size={16} strokeWidth={1.5} />
            <span>Print</span>
          </a>
        )}

        <button
          type="button"
          className="knitting-studio-toolbar-close"
          onClick={onClose}
          aria-label="Close project"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
