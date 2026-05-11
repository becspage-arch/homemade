import type { ReactNode } from 'react'

type Tone = 'info' | 'tip' | 'warning'

const TONE_LABEL: Record<Tone, string> = {
  info: 'a note',
  tip: 'a tip',
  warning: 'take care',
}

const BEGINNER_TONE_LABEL: Record<Tone, string> = {
  info: 'for beginners — a note',
  tip: 'for beginners — a tip',
  warning: 'for beginners — take care',
}

interface InfoPanelProps {
  tone: string
  title: string
  body: string
  beginnerMode?: boolean
}

export function InfoPanel({
  tone,
  title,
  body,
  beginnerMode = false,
}: InfoPanelProps): ReactNode {
  const safeTone: Tone =
    tone === 'info' || tone === 'tip' || tone === 'warning' ? tone : 'tip'
  if (!title && !body) return null
  const label = beginnerMode
    ? BEGINNER_TONE_LABEL[safeTone]
    : TONE_LABEL[safeTone]
  return (
    <aside
      className={`info-panel info-panel-${safeTone}${
        beginnerMode ? ' info-panel-beginner' : ''
      }`}
      role={safeTone === 'warning' ? 'note' : undefined}
    >
      <span className="info-panel-label">{label}</span>
      {title && <h3 className="info-panel-title">{title}</h3>}
      {body && <p className="info-panel-body">{body}</p>}
    </aside>
  )
}
