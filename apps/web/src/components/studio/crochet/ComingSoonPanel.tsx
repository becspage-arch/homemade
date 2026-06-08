'use client'

/**
 * Placeholder for the three create-your-own surfaces (amigurumi designer,
 * photo-to-tapestry, AI-assisted custom) that land in build steps 14, 15,
 * and 16. Calm copy, single back action.
 */

interface ComingSoonPanelProps {
  title: string
  body: string
  onCancel: () => void
}

export function ComingSoonPanel({ title, body, onCancel }: ComingSoonPanelProps) {
  return (
    <section className="crochet-studio-coming-soon">
      <div className="crochet-studio-coming-soon-card">
        <h1 className="crochet-studio-coming-soon-title">{title}</h1>
        <p className="crochet-studio-coming-soon-body">{body}</p>
        <button type="button" className="crochet-studio-coming-soon-back" onClick={onCancel}>
          Back to Studio
        </button>
      </div>
    </section>
  )
}
