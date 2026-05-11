import type { ReactNode } from 'react'
import type { GlossaryRef } from '../types'

interface GlossaryTooltipProps {
  termId: string
  glossary: GlossaryRef[]
  children: ReactNode
  /** When true, the definition expands inline rather than living in a tooltip. */
  beginnerMode?: boolean
}

export function GlossaryTooltip({
  termId,
  glossary,
  children,
  beginnerMode = false,
}: GlossaryTooltipProps): ReactNode {
  const term = glossary.find((g) => g.id === termId)
  if (!term) return <>{children}</>

  const popoverId = `term-${term.id}`

  if (beginnerMode) {
    return (
      <span className="term term-beginner">
        <span className="term-inline">{children}</span>
        <span className="term-beginner-def">{term.definition}</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      className="term"
      aria-describedby={popoverId}
      tabIndex={0}
    >
      {children}
      <span className="term-popup" id={popoverId} role="tooltip">
        <span className="term-name">{term.term}</span>
        <span className="term-def">{term.definition}</span>
      </span>
    </button>
  )
}
