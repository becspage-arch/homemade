import type { ReactNode } from 'react'

interface TutorialInfoStripProps {
  /** Total time in minutes (recipes) or technique time. */
  timeMinutes: number | null
  difficulty: string
  /** Recipe-only — number of servings (renders the ServingsCell). */
  servingsCell?: ReactNode
  /** Recipe-only — dietary chips inline. */
  dietaryFlags?: string[]
  /** Pottery equipment label. */
  equipmentLabel?: string | null
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const DIETARY_GLYPH: Record<string, string> = {
  vegetarian: 'Vg',
  vegan: 'V',
  glutenFree: 'GF',
  dairyFree: 'DF',
  nutFree: 'NF',
  pescatarian: 'P',
  halal: 'H',
  kosher: 'K',
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

/**
 * Compact icon + label strip below the hero. Replaces the dense
 * definition list. Just the essentials a Maker scans for: time,
 * difficulty, servings (recipes), dietary chips. Cuisine / meal type
 * / season / published date all live in the "About this recipe"
 * collapsible at the bottom.
 */
export function TutorialInfoStrip({
  timeMinutes,
  difficulty,
  servingsCell,
  dietaryFlags = [],
  equipmentLabel,
}: TutorialInfoStripProps) {
  const dietary = dietaryFlags.filter((flag) => DIETARY_GLYPH[flag])
  const difficultyLabel = DIFFICULTY_LABEL[difficulty] ?? difficulty.toLowerCase()

  return (
    <div className="tutorial-info-strip">
      {timeMinutes !== null && timeMinutes > 0 && (
        <span className="tutorial-info-item">
          <ClockIcon />
          <span>{formatTime(timeMinutes)}</span>
        </span>
      )}
      <span className="tutorial-info-item">
        <DifficultyIcon />
        <span>{difficultyLabel}</span>
      </span>
      {servingsCell && (
        <span className="tutorial-info-item">
          <ServingsIcon />
          {servingsCell}
        </span>
      )}
      {equipmentLabel && (
        <span className="tutorial-info-item">
          <ToolIcon />
          <span>{equipmentLabel}</span>
        </span>
      )}
      {dietary.length > 0 && (
        <span className="tutorial-info-dietary">
          {dietary.map((flag) => (
            <span key={flag} className="tutorial-info-dietary-chip">
              {DIETARY_GLYPH[flag]}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6.4" />
      <path d="M8 4.4v3.8l2.4 1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DifficultyIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 12h3V8H2zM6.5 12h3V5h-3zM11 12h3V2.5h-3z" strokeLinejoin="round" />
    </svg>
  )
}

function ServingsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="6.4" r="2.6" />
      <path d="M2.4 13.6c0-2.5 2.5-4.3 5.6-4.3s5.6 1.8 5.6 4.3" strokeLinecap="round" />
    </svg>
  )
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 12.8l5-5M11 6.5L13.5 4l-1.2-1.2L9.8 5.3M3 13l-1.2 1.2M9.5 6.2l-2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
