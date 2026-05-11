import type { ReactNode } from 'react'

interface PullQuoteProps {
  quote: string
  attribution: string
}

export function PullQuote({ quote, attribution }: PullQuoteProps): ReactNode {
  if (!quote?.trim()) return null
  return (
    <blockquote className="pull-quote">
      {quote}
      {attribution?.trim() && (
        <cite className="pull-quote-attribution">{attribution}</cite>
      )}
    </blockquote>
  )
}
