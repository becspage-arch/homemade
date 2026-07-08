/**
 * StitchGlyph — renders a single chart symbol from the craft symbol
 * library as a small standalone SVG. Isomorphic (pure, no data access),
 * so it works in both server and client trees.
 *
 * Returns null when the craft + key pair has no drawn glyph; callers show
 * their own "worked per pattern" fallback in that case.
 */

import type { ReactNode } from 'react'
import { getChartSymbol } from '@/lib/craft-charts/chart-symbols'
import type { Craft } from '@/lib/craft-charts/types'

interface Props {
  craft: Craft
  symbol: string | null | undefined
  size?: number
  className?: string
}

export function StitchGlyph({ craft, symbol, size = 28, className }: Props): ReactNode {
  if (!symbol) return null
  const sym = getChartSymbol(craft, symbol)
  if (!sym) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      role="img"
      aria-hidden="true"
      className={className}
      style={{ color: 'currentColor' }}
      dangerouslySetInnerHTML={{ __html: sym.svg }}
    />
  )
}
