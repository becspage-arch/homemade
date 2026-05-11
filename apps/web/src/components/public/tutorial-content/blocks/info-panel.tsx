import type { ReactNode } from 'react'

type Tone = 'info' | 'tip' | 'warning'

const TONE_LABEL: Record<Tone, string> = {
  info: 'a note',
  tip: 'a tip',
  warning: 'take care',
}

interface InfoPanelProps {
  tone: string
  title: string
  body: string
}

export function InfoPanel({ tone, title, body }: InfoPanelProps): ReactNode {
  const safeTone: Tone =
    tone === 'info' || tone === 'tip' || tone === 'warning' ? tone : 'tip'
  if (!title && !body) return null
  return (
    <aside
      className={`info-panel info-panel-${safeTone}`}
      role={safeTone === 'warning' ? 'note' : undefined}
    >
      <span className="info-panel-label">{TONE_LABEL[safeTone]}</span>
      {title && <h3 className="info-panel-title">{title}</h3>}
      {body && <p className="info-panel-body">{body}</p>}
    </aside>
  )
}
