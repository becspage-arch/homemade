'use client'

import { useCookingMode } from './cooking-mode-shell'

/**
 * Toggle pill that sits in the tutorial actions bar. The actual reader is
 * mounted by `CookingModeShell`, which owns the on/off state.
 */
export function CookingModeToggle() {
  const { enabled, setEnabled } = useCookingMode()
  return (
    <button
      type="button"
      className={`cooking-mode-toggle${enabled ? ' on' : ''}`}
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 9h14M5 14h14M7 5h10l-1.2 14H8.2L7 5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {enabled ? 'Cooking mode on' : 'Cooking mode'}
    </button>
  )
}
