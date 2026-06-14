import type { ReactNode } from 'react'

interface TutorialInfoStripProps {
  /** Total time in minutes (recipes) or technique time. */
  timeMinutes: number | null
  difficulty: string
  /**
   * Oven temperature, pre-formatted for the reader's preference (e.g.
   * "180°C fan", "Gas 4"). Null hides the pill.
   */
  temperatureLabel?: string | null
  /** Recipe-only — number of servings (renders the ServingsCell). */
  servingsCell?: ReactNode
  /** Recipe-only — dietary chips inline. */
  dietaryFlags?: string[]
  /** Pottery equipment label. */
  equipmentLabel?: string | null
  /**
   * Garden container badge. Prefers the master species' precise litres
   * (`Species.minimumContainerLitres`) when set; falls back to the
   * coarse `Tutorial.containerFriendly` boolean otherwise. Pass null to
   * hide the badge (non-garden tutorials).
   */
  containerLabel?: string | null
  /**
   * Garden indoor / windowsill badge. Prefers
   * `Species.minimumDailyDirectSunHours` when set, falls back to
   * the coarse `Tutorial.indoorFriendly` boolean. Pass null to hide.
   */
  indoorLabel?: string | null
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
  temperatureLabel,
  servingsCell,
  dietaryFlags = [],
  equipmentLabel,
  containerLabel,
  indoorLabel,
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
      {temperatureLabel && (
        <span className="tutorial-info-item">
          <ThermometerIcon />
          <span>{temperatureLabel}</span>
        </span>
      )}
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
      {containerLabel && (
        <span className="tutorial-info-item" data-testid="container-badge">
          <ContainerIcon />
          <span>{containerLabel}</span>
        </span>
      )}
      {indoorLabel && (
        <span className="tutorial-info-item" data-testid="indoor-badge">
          <SunIcon />
          <span>{indoorLabel}</span>
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

/**
 * Compose the container badge label from the precise species value
 * (preferred) plus the coarse tutorial-level boolean fallback. Returns
 * null when nothing useful can be said.
 */
export function composeContainerLabel(input: {
  minimumContainerLitres: number | null | undefined
  containerFriendly: boolean | null | undefined
}): string | null {
  if (typeof input.minimumContainerLitres === 'number' && input.minimumContainerLitres > 0) {
    return `Container: ${input.minimumContainerLitres} L minimum`
  }
  if (input.containerFriendly === true) return 'Container: yes'
  if (input.containerFriendly === false) return 'Container: no'
  return null
}

/**
 * Compose the indoor / windowsill badge from the precise species sun-
 * hours value, falling back to the coarse boolean.
 */
export function composeIndoorLabel(input: {
  minimumDailyDirectSunHours: number | null | undefined
  indoorFriendly: boolean | null | undefined
}): string | null {
  if (typeof input.minimumDailyDirectSunHours === 'number' && input.minimumDailyDirectSunHours > 0) {
    return `Indoor: ${input.minimumDailyDirectSunHours} hours of direct sun`
  }
  if (input.indoorFriendly === true) return 'Indoor: yes'
  if (input.indoorFriendly === false) return 'Indoor: no'
  return null
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

function ThermometerIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M9.5 9V3.2a1.5 1.5 0 0 0-3 0V9a2.6 2.6 0 1 0 3 0z" strokeLinejoin="round" />
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

function ContainerIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 5h10l-1 8.4a1 1 0 0 1-1 .8H5a1 1 0 0 1-1-.8L3 5z" strokeLinejoin="round" />
      <path d="M5 5V3.5h6V5" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="3.2" />
      <path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.6 3.6l1.2 1.2M11.2 11.2l1.2 1.2M3.6 12.4l1.2-1.2M11.2 4.8l1.2-1.2" strokeLinecap="round" />
    </svg>
  )
}
