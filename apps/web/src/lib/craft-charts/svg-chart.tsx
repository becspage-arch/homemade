/**
 * Server-rendered SVG chart for crochet + knitting + future needlework
 * tutorials. Consumes a generic `ChartDefinition` (from `types.ts`) and
 * walks the symbol library in `chart-symbols.ts` to draw each cell.
 *
 * The component is stateless and renders to plain SVG markup — no client
 * hooks, no canvas, no runtime layout work. Charts are deterministic given
 * the same definition, so the renderer is safe to call from Server
 * Components and is friendly to SSG / RSC caching.
 *
 * The chart definition is stored on `Tutorial.chartDefinition` (JSONB).
 * The body's TipTap `craftChart` block resolves it on the read side; the
 * authoring brief writes the definition directly into the tutorial input.
 *
 * Two layouts:
 *
 *   - `round`: in-the-round work — granny square, hexagon, doily. Each
 *     round is drawn on a circle of increasing radius. Stitches are
 *     spaced evenly around the ring.
 *
 *   - `flat`: row-by-row work — dishcloth, scarf, blanket panel. Drawn
 *     as a rectangular grid. Right-side rows read right-to-left; the
 *     renderer mirrors stitches automatically so the author writes
 *     stitches in working order regardless.
 */

import type { ReactNode } from 'react'

import { getChartSymbol, legendForSymbols } from './chart-symbols'
import type {
  ChartDefinition,
  ChartStitch,
  Craft,
} from './types'

/**
 * Pixel size of one chart cell. Symbols are designed in a 24×24 unit box
 * (see `chart-symbols.ts`); we scale by `CELL_SCALE` for the final SVG.
 */
const CELL_SIZE = 28
const CELL_SCALE = CELL_SIZE / 24
const STROKE = 'rgb(48, 42, 36)'

interface CraftChartProps {
  definition: ChartDefinition

  /** Optional class hook for the wrapper `<figure>`. */
  className?: string
}

export function CraftChart({
  definition,
  className,
}: CraftChartProps): ReactNode {
  const { craft, layout, title, caption } = definition
  const usedSymbolKeys = collectUsedSymbolKeys(definition)
  const legend = legendForSymbols(craft, usedSymbolKeys)

  const body =
    layout === 'round' ? (
      <RoundChart definition={definition} />
    ) : (
      <FlatChart definition={definition} />
    )

  return (
    <figure
      className={['craft-chart', className].filter(Boolean).join(' ')}
      style={{ color: STROKE }}
    >
      {title ? <figcaption className="craft-chart__title">{title}</figcaption> : null}
      <div className="craft-chart__svg-wrap">{body}</div>
      {legend.length > 0 ? (
        <ul className="craft-chart__legend" aria-label="Chart key">
          {legend.map((sym) => (
            <li key={sym.key} className="craft-chart__legend-item">
              <ChartGlyph craft={craft} symbol={sym.key} />
              <span className="craft-chart__legend-label">{sym.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {caption ? <p className="craft-chart__caption">{caption}</p> : null}
    </figure>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Round chart — center-out, one ring per round, even angular spacing.
// ───────────────────────────────────────────────────────────────────────

function RoundChart({ definition }: { definition: ChartDefinition }): ReactNode {
  const rounds = definition.rounds ?? []
  if (rounds.length === 0) return <EmptyChart message="No rounds defined." />

  const expanded = rounds.map((r) => ({
    roundNumber: r.roundNumber,
    label: r.label ?? `Rnd ${r.roundNumber}`,
    stitches: expandStitches(r.stitches),
  }))

  // Inner ring radius scales with the number of stitches in the first
  // round. Outer rings step out by CELL_SIZE per round.
  const firstRound = expanded[0]
  const firstCount = Math.max(1, firstRound?.stitches.length ?? 1)
  const innerRadius = Math.max(CELL_SIZE * 0.9, (firstCount * CELL_SIZE) / (2 * Math.PI))
  const radii = expanded.map((_, i) => innerRadius + i * CELL_SIZE)
  const outerRadius = (radii[radii.length - 1] ?? innerRadius) + CELL_SIZE
  const size = Math.ceil(outerRadius * 2 + CELL_SIZE * 2)
  const center = size / 2

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      role="img"
      aria-label={definition.title ?? 'Chart'}
      style={{ maxWidth: `${size}px` }}
    >
      {expanded.map((round, ringIndex) => {
        const radius = radii[ringIndex] ?? innerRadius
        const count = round.stitches.length
        if (count === 0) return null
        return (
          <g key={round.roundNumber}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={STROKE}
              strokeOpacity={0.15}
              strokeWidth={1}
            />
            <text
              x={center + radius + 4}
              y={center}
              fontSize={10}
              fontFamily="ui-monospace, monospace"
              fill={STROKE}
              fillOpacity={0.6}
              dominantBaseline="middle"
            >
              {round.label}
            </text>
            {round.stitches.map((st, i) => {
              const angle = -Math.PI / 2 + (2 * Math.PI * i) / count
              const x = center + radius * Math.cos(angle)
              const y = center + radius * Math.sin(angle)
              return (
                <CellGlyph
                  key={`${round.roundNumber}-${i}`}
                  craft={definition.craft}
                  stitch={st}
                  x={x}
                  y={y}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Flat chart — rectangular grid, row 1 at the bottom, right-side reads
// right-to-left.
// ───────────────────────────────────────────────────────────────────────

function FlatChart({ definition }: { definition: ChartDefinition }): ReactNode {
  const rows = definition.rows ?? []
  if (rows.length === 0) return <EmptyChart message="No rows defined." />

  const expanded = rows.map((r) => ({
    rowNumber: r.rowNumber,
    rightSide: r.rightSide !== false,
    label: r.label ?? `Row ${r.rowNumber}${r.rightSide === false ? ' WS' : ''}`,
    stitches: expandStitches(r.stitches),
  }))
  const width = Math.max(...expanded.map((r) => r.stitches.length))
  const height = expanded.length

  const paddingLeft = 36 // for row labels
  const paddingRight = 8
  const paddingY = 8
  const svgWidth = paddingLeft + width * CELL_SIZE + paddingRight
  const svgHeight = paddingY * 2 + height * CELL_SIZE

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width="100%"
      role="img"
      aria-label={definition.title ?? 'Chart'}
      style={{ maxWidth: `${svgWidth}px` }}
    >
      {/* Grid lines */}
      <g stroke={STROKE} strokeOpacity={0.18} strokeWidth={1}>
        {Array.from({ length: width + 1 }).map((_, c) => (
          <line
            key={`v${c}`}
            x1={paddingLeft + c * CELL_SIZE}
            y1={paddingY}
            x2={paddingLeft + c * CELL_SIZE}
            y2={paddingY + height * CELL_SIZE}
          />
        ))}
        {Array.from({ length: height + 1 }).map((_, r) => (
          <line
            key={`h${r}`}
            x1={paddingLeft}
            y1={paddingY + r * CELL_SIZE}
            x2={paddingLeft + width * CELL_SIZE}
            y2={paddingY + r * CELL_SIZE}
          />
        ))}
      </g>

      {/* Row contents */}
      {expanded.map((row, ri) => {
        // Row index 0 is the top of the array → bottom row in display order
        // (knitting + crochet convention reads row 1 from the bottom).
        const displayRow = height - 1 - ri
        const rowY = paddingY + displayRow * CELL_SIZE + CELL_SIZE / 2

        return (
          <g key={row.rowNumber}>
            <text
              x={paddingLeft - 6}
              y={rowY}
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              textAnchor="end"
              dominantBaseline="middle"
              fill={STROKE}
              fillOpacity={0.7}
            >
              {row.label}
            </text>
            {row.stitches.map((st, sIndex) => {
              // Right-side rows render right-to-left in working order:
              // working stitch 0 sits in the rightmost column.
              const col = row.rightSide
                ? width - 1 - sIndex
                : sIndex
              const x = paddingLeft + col * CELL_SIZE + CELL_SIZE / 2
              return (
                <CellGlyph
                  key={`${row.rowNumber}-${sIndex}`}
                  craft={definition.craft}
                  stitch={st}
                  x={x}
                  y={rowY}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Cell glyph — resolves the symbol and stamps it at (x, y).
// ───────────────────────────────────────────────────────────────────────

function CellGlyph({
  craft,
  stitch,
  x,
  y,
}: {
  craft: Craft
  stitch: ChartStitch
  x: number
  y: number
}): ReactNode {
  const sym = getChartSymbol(craft, stitch.symbol)
  if (!sym) {
    return (
      <text
        x={x}
        y={y}
        fontSize={10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={STROKE}
        fillOpacity={0.6}
      >
        {stitch.label ?? '?'}
      </text>
    )
  }
  return (
    <g
      transform={`translate(${x} ${y}) scale(${CELL_SCALE})`}
      dangerouslySetInnerHTML={{ __html: sym.svg }}
    />
  )
}

function ChartGlyph({ craft, symbol }: { craft: Craft; symbol: string }): ReactNode {
  const sym = getChartSymbol(craft, symbol)
  if (!sym) return null
  return (
    <svg width={20} height={20} viewBox="-12 -12 24 24" aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: sym.svg }} />
    </svg>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────

function expandStitches(stitches: ReadonlyArray<ChartStitch>): ChartStitch[] {
  const out: ChartStitch[] = []
  for (const st of stitches) {
    const count = Math.max(1, Math.floor(st.count ?? 1))
    for (let i = 0; i < count; i++) {
      out.push({ symbol: st.symbol, label: st.label, colourKey: st.colourKey })
    }
  }
  return out
}

function collectUsedSymbolKeys(definition: ChartDefinition): string[] {
  const keys: string[] = []
  const walk = (stitches: ReadonlyArray<ChartStitch> | undefined): void => {
    for (const st of stitches ?? []) {
      keys.push(st.symbol)
    }
  }
  for (const r of definition.rounds ?? []) walk(r.stitches)
  for (const r of definition.rows ?? []) walk(r.stitches)
  return keys
}

function EmptyChart({ message }: { message: string }): ReactNode {
  return (
    <svg viewBox="0 0 200 80" width="100%" role="img" aria-label={message}>
      <text
        x="100"
        y="44"
        textAnchor="middle"
        fontSize="12"
        fill={STROKE}
        fillOpacity={0.6}
      >
        {message}
      </text>
    </svg>
  )
}
