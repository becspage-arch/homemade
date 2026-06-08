'use client'

/**
 * CrochetStudioToolbar — top bar of the active-project surface.
 *
 *   [project name + designer]  [view toggle]  [UK/US]  [Notes]  [LH]  [Print]  [Close]
 *
 * Mode toggle hides options the pattern doesn't carry (no chart → chart
 * tab greyed out; no schematic → schematic tab hidden). UK/US toggle
 * flips the abbreviation legend live. LH mirrors the chart horizontally
 * (charts only; written rows are direction-agnostic in v1).
 */

import { ScrollText, Grid3x3, Ruler, BookOpen, X, StickyNote, Hand } from 'lucide-react'

interface Props {
  patternName: string
  designerName: string | null
  viewMode: 'written' | 'chart' | 'schematic'
  onViewModeChange: (mode: 'written' | 'chart' | 'schematic') => void
  chartAvailable: boolean
  schematicAvailable: boolean
  terminology: 'uk' | 'us'
  onTerminologyChange: (mode: 'uk' | 'us') => void
  leftHanded: boolean
  onLeftHandedToggle: () => void
  notesOpen: boolean
  onToggleNotes: () => void
  tutorialHref: string | null
  onClose: () => void
}

export function CrochetStudioToolbar({
  patternName,
  designerName,
  viewMode,
  onViewModeChange,
  chartAvailable,
  schematicAvailable,
  terminology,
  onTerminologyChange,
  leftHanded,
  onLeftHandedToggle,
  notesOpen,
  onToggleNotes,
  tutorialHref,
  onClose,
}: Props) {
  return (
    <header className="crochet-studio-toolbar">
      <div className="crochet-studio-toolbar-title">
        <div className="crochet-studio-toolbar-name">{patternName}</div>
        {designerName && (
          <div className="crochet-studio-toolbar-designer">by {designerName}</div>
        )}
      </div>

      <div className="crochet-studio-toolbar-modes" role="tablist" aria-label="View mode">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'written'}
          className={`crochet-studio-toolbar-mode${viewMode === 'written' ? ' is-active' : ''}`}
          onClick={() => onViewModeChange('written')}
        >
          <ScrollText size={16} strokeWidth={1.5} />
          <span>Written</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'chart'}
          className={`crochet-studio-toolbar-mode${viewMode === 'chart' ? ' is-active' : ''}`}
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
            className={`crochet-studio-toolbar-mode${viewMode === 'schematic' ? ' is-active' : ''}`}
            onClick={() => onViewModeChange('schematic')}
          >
            <Ruler size={16} strokeWidth={1.5} />
            <span>Schematic</span>
          </button>
        )}
      </div>

      <div className="crochet-studio-toolbar-prefs">
        <div className="crochet-studio-toolbar-terminology" role="group" aria-label="Terminology">
          <button
            type="button"
            className={`crochet-studio-toolbar-terminology-button${terminology === 'uk' ? ' is-active' : ''}`}
            aria-pressed={terminology === 'uk'}
            onClick={() => onTerminologyChange('uk')}
          >
            UK
          </button>
          <button
            type="button"
            className={`crochet-studio-toolbar-terminology-button${terminology === 'us' ? ' is-active' : ''}`}
            aria-pressed={terminology === 'us'}
            onClick={() => onTerminologyChange('us')}
          >
            US
          </button>
        </div>

        <button
          type="button"
          className={`crochet-studio-toolbar-action${leftHanded ? ' is-active' : ''}`}
          aria-pressed={leftHanded}
          onClick={onLeftHandedToggle}
          title="Mirror the chart for left-handed work"
        >
          <Hand size={16} strokeWidth={1.5} />
          <span>LH</span>
        </button>

        <button
          type="button"
          className={`crochet-studio-toolbar-action${notesOpen ? ' is-active' : ''}`}
          aria-pressed={notesOpen}
          onClick={onToggleNotes}
          title="Project notes"
        >
          <StickyNote size={16} strokeWidth={1.5} />
          <span>Notes</span>
        </button>

        {tutorialHref && (
          <a
            href={tutorialHref}
            target="_blank"
            rel="noopener noreferrer"
            className="crochet-studio-toolbar-action"
            title="Open the full tutorial in a new tab"
          >
            <BookOpen size={16} strokeWidth={1.5} />
            <span>Tutorial</span>
          </a>
        )}

        <button
          type="button"
          className="crochet-studio-toolbar-close"
          onClick={onClose}
          aria-label="Close project"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
