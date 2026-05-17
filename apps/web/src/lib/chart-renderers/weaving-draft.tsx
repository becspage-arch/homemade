/**
 * Server-rendered weaving draft — the standard four-block layout.
 *
 * Reads a `WeavingDraftDefinition` from `./types.ts` and lays out the
 * canonical weaving-publication shape:
 *
 *   ┌──────────────────────┬─────────────┐
 *   │     Threading        │   Tie-up    │
 *   │  warp × shafts       │ shafts ×    │
 *   │                      │  treadles   │
 *   ├──────────────────────┼─────────────┤
 *   │                      │ Treadling   │
 *   │      Drawdown        │ treadles ×  │
 *   │  (computed pattern)  │   picks     │
 *   │                      │             │
 *   └──────────────────────┴─────────────┘
 *
 * The drawdown grid is computed at server-render time from threading
 * + tie-up + treadling — authors don't write it.
 *
 * The renderer is stateless and outputs plain SVG markup — no client
 * hooks, no canvas, no runtime layout work. Definitions are
 * deterministic, so RSC / SSG-safe.
 *
 * The `loomType` field on the definition switches the column-header
 * labels: "shaft" for floor looms, "card" for tablet weaving,
 * "slot/hole" labelled "shaft" for rigid-heddle, "pick-up" for inkle,
 * "weft-pass" for frame and tapestry. The geometry is identical for
 * all loom types — plain weave on a frame loom is a 2-shaft straight
 * draw, and the renderer draws it the same way as a four-shaft
 * straight draw.
 *
 * Tablet weaving (card weaving) uses the same draft shape — each
 * "shaft" maps to one card and each "treadle" maps to one card
 * rotation; the renderer just relabels the headers.
 */

import type { ReactNode } from 'react'

import type { WeavingDraftDefinition, WeavingLoomType } from './types'

const CELL_SIZE = 18
const PADDING = 12
const HEADER_LABEL_GAP = 16
const STROKE = 'rgb(48, 42, 36)'
const FILL_ON = 'rgb(48, 42, 36)'
const FILL_OFF = '#fdf8ef'
const GRID_STROKE = 'rgba(48, 42, 36, 0.35)'
const LABEL_STROKE_OPACITY = 0.7

interface WeavingDraftProps {
  definition: WeavingDraftDefinition
  /** Optional class hook for the wrapper `<figure>`. */
  className?: string
}

export function WeavingDraft({
  definition,
  className,
}: WeavingDraftProps): ReactNode {
  const validation = validate(definition)
  if (!validation.ok) {
    return (
      <figure className={['weaving-draft', className].filter(Boolean).join(' ')}>
        <p className="weaving-draft__error">Draft cannot be rendered: {validation.message}</p>
      </figure>
    )
  }

  const { threading, tieUp, treadling } = definition
  const shaftCount = tieUp[0]?.length ?? 0
  const treadleCount = tieUp.length
  const warpCount = threading.length
  const pickCount = treadling.length

  const drawdown = computeDrawdown(threading, tieUp, treadling)

  // The drawdown is the largest grid; everything else aligns to it.
  // Total width: threading grid (warpCount cells) + gap + tie-up
  //              (treadleCount cells)
  // Total height: threading grid header (shaftCount cells) + gap +
  //               treadling grid header (pickCount cells)
  const threadingWidth = warpCount * CELL_SIZE
  const tieUpWidth = treadleCount * CELL_SIZE
  const threadingHeight = shaftCount * CELL_SIZE
  const treadlingHeight = pickCount * CELL_SIZE

  const labelGap = HEADER_LABEL_GAP

  const totalWidth = PADDING + labelGap + threadingWidth + 8 + tieUpWidth + PADDING
  const totalHeight =
    PADDING + 24 + threadingHeight + 8 + treadlingHeight + 24 + PADDING

  const threadingX = PADDING + labelGap
  const threadingY = PADDING + 24
  const tieUpX = threadingX + threadingWidth + 8
  const tieUpY = threadingY
  const treadlingX = tieUpX
  const treadlingY = threadingY + threadingHeight + 8
  const drawdownX = threadingX
  const drawdownY = treadlingY

  const headers = headerLabels(definition.loomType)

  return (
    <figure
      className={['weaving-draft', className].filter(Boolean).join(' ')}
      style={{ color: STROKE }}
    >
      {definition.title ? (
        <figcaption className="weaving-draft__title">{definition.title}</figcaption>
      ) : null}
      <div className="weaving-draft__svg-wrap">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          width="100%"
          role="img"
          aria-label={definition.title ?? 'Weaving draft'}
          style={{ maxWidth: `${totalWidth}px` }}
        >
          {/* Threading grid (top-left) — one row per shaft, one column
              per warp thread. Filled cell means that warp passes through
              that shaft. */}
          <BlockLabel
            text={`Threading (${headers.shaft} ↕, warp →)`}
            x={threadingX}
            y={threadingY - 8}
          />
          <Grid
            x={threadingX}
            y={threadingY}
            cols={warpCount}
            rows={shaftCount}
            cellAt={(col, row) => threading[col] === row + 1}
            rowLabel={(row) => `${headers.shaftShort}${row + 1}`}
            rowLabelAt="left"
          />

          {/* Tie-up grid (top-right) — one row per shaft, one column per
              treadle. Filled cell means that treadle lifts that shaft. */}
          <BlockLabel
            text={`Tie-up (${headers.treadle} →)`}
            x={tieUpX}
            y={tieUpY - 8}
          />
          <Grid
            x={tieUpX}
            y={tieUpY}
            cols={treadleCount}
            rows={shaftCount}
            cellAt={(col, row) => tieUp[col]?.[row] === 1}
          />

          {/* Treadling grid (middle-right) — one row per pick, one
              column per treadle. Filled cell means that treadle was used
              on that pick. */}
          <Grid
            x={treadlingX}
            y={treadlingY}
            cols={treadleCount}
            rows={pickCount}
            cellAt={(col, row) => treadling[row] === col + 1}
          />
          <BlockLabel
            text={`Treadling (${headers.pick} ↕)`}
            x={treadlingX}
            y={treadlingY + treadlingHeight + 16}
          />

          {/* Drawdown grid (bottom-left) — the pattern of warp-up
              (filled) and weft-up (open) cells the cloth actually
              shows. Computed from the three grids above. */}
          <Grid
            x={drawdownX}
            y={drawdownY}
            cols={warpCount}
            rows={pickCount}
            cellAt={(col, row) => drawdown[row]?.[col] === 1}
            rowLabel={(row) => `${row + 1}`}
            rowLabelAt="left"
          />
          <BlockLabel
            text="Drawdown (computed pattern)"
            x={drawdownX}
            y={drawdownY + treadlingHeight + 16}
          />
        </svg>
      </div>
      {definition.caption ? (
        <p className="weaving-draft__caption">{definition.caption}</p>
      ) : null}
    </figure>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Drawdown computation — for each pick, walk the threading and decide
// whether each warp thread is lifted by the active treadle's shaft.
// ───────────────────────────────────────────────────────────────────────

function computeDrawdown(
  threading: number[],
  tieUp: Array<Array<0 | 1>>,
  treadling: number[],
): Array<Array<0 | 1>> {
  return treadling.map((treadleIndex) => {
    const treadleRow = tieUp[treadleIndex - 1] ?? []
    return threading.map((shaftIndex) => {
      const lifted = treadleRow[shaftIndex - 1] === 1
      return (lifted ? 1 : 0) as 0 | 1
    })
  })
}

// ───────────────────────────────────────────────────────────────────────
// Grid block — renders one rectangular block of cells, filled/empty.
// ───────────────────────────────────────────────────────────────────────

interface GridProps {
  x: number
  y: number
  cols: number
  rows: number
  cellAt: (col: number, row: number) => boolean
  rowLabel?: (row: number) => string
  rowLabelAt?: 'left' | 'right'
}

function Grid({
  x,
  y,
  cols,
  rows,
  cellAt,
  rowLabel,
  rowLabelAt = 'left',
}: GridProps): ReactNode {
  const width = cols * CELL_SIZE
  const height = rows * CELL_SIZE

  const cells: ReactNode[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = x + col * CELL_SIZE
      const cy = y + row * CELL_SIZE
      const on = cellAt(col, row)
      cells.push(
        <rect
          key={`${col}-${row}`}
          x={cx}
          y={cy}
          width={CELL_SIZE}
          height={CELL_SIZE}
          fill={on ? FILL_ON : FILL_OFF}
          stroke={GRID_STROKE}
          strokeWidth={0.6}
        />,
      )
    }
  }

  const labels: ReactNode[] = []
  if (rowLabel) {
    for (let row = 0; row < rows; row++) {
      const cy = y + row * CELL_SIZE + CELL_SIZE / 2
      const labelX = rowLabelAt === 'left' ? x - 4 : x + width + 4
      const anchor = rowLabelAt === 'left' ? 'end' : 'start'
      labels.push(
        <text
          key={`label-${row}`}
          x={labelX}
          y={cy}
          fontSize={9}
          fontFamily="ui-monospace, monospace"
          textAnchor={anchor}
          dominantBaseline="middle"
          fill={STROKE}
          fillOpacity={LABEL_STROKE_OPACITY}
        >
          {rowLabel(row)}
        </text>,
      )
    }
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.1}
      />
      {cells}
      {labels}
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Block label — small uppercase header above / below a grid block.
// ───────────────────────────────────────────────────────────────────────

function BlockLabel({
  text,
  x,
  y,
}: {
  text: string
  x: number
  y: number
}): ReactNode {
  return (
    <text
      x={x}
      y={y}
      fontSize={10}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      fill={STROKE}
      fillOpacity={LABEL_STROKE_OPACITY}
    >
      {text}
    </text>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Header labels — drive per-loom-type column / row vocabulary.
// ───────────────────────────────────────────────────────────────────────

interface HeaderLabels {
  /** Long-form label for the shaft / card / pick-up dimension. */
  shaft: string
  /** Short label used inside the threading row-label column. */
  shaftShort: string
  /** Long-form label for the treadle / card-rotation dimension. */
  treadle: string
  /** Long-form label for the pick / row dimension. */
  pick: string
}

function headerLabels(loomType: WeavingLoomType): HeaderLabels {
  switch (loomType) {
    case 'card':
      return { shaft: 'cards', shaftShort: 'C', treadle: 'rotation', pick: 'picks' }
    case 'rigid-heddle':
      return {
        shaft: 'slot/hole',
        shaftShort: 'S',
        treadle: 'shed',
        pick: 'picks',
      }
    case 'inkle':
      return {
        shaft: 'pick-up',
        shaftShort: 'P',
        treadle: 'shed',
        pick: 'picks',
      }
    case 'frame':
    case 'tapestry':
      return {
        shaft: 'shed',
        shaftShort: 'S',
        treadle: 'weft-pass',
        pick: 'picks',
      }
    case 'four-shaft':
    default:
      return { shaft: 'shafts', shaftShort: 'S', treadle: 'treadle', pick: 'picks' }
  }
}

// ───────────────────────────────────────────────────────────────────────
// Validation — surface a friendly message rather than crashing on bad
// input. Anchor-batch authoring will hit this fast; bulk-pipeline will
// be vetted at upload-time by the same checks.
// ───────────────────────────────────────────────────────────────────────

function validate(definition: WeavingDraftDefinition):
  | { ok: true }
  | { ok: false; message: string } {
  const { threading, tieUp, treadling } = definition
  if (!Array.isArray(threading) || threading.length === 0) {
    return { ok: false, message: 'threading is empty' }
  }
  if (!Array.isArray(tieUp) || tieUp.length === 0) {
    return { ok: false, message: 'tie-up is empty' }
  }
  if (!Array.isArray(treadling) || treadling.length === 0) {
    return { ok: false, message: 'treadling is empty' }
  }
  const shaftCount = tieUp[0]?.length ?? 0
  if (shaftCount === 0) {
    return { ok: false, message: 'tie-up has zero shafts' }
  }
  for (const row of tieUp) {
    if (!Array.isArray(row) || row.length !== shaftCount) {
      return { ok: false, message: 'tie-up rows have inconsistent length' }
    }
    for (const cell of row) {
      if (cell !== 0 && cell !== 1) {
        return { ok: false, message: 'tie-up cells must be 0 or 1' }
      }
    }
  }
  for (const shaft of threading) {
    if (!Number.isInteger(shaft) || shaft < 1 || shaft > shaftCount) {
      return {
        ok: false,
        message: `threading references shaft ${shaft} (outside 1..${shaftCount})`,
      }
    }
  }
  const treadleCount = tieUp.length
  for (const treadle of treadling) {
    if (!Number.isInteger(treadle) || treadle < 1 || treadle > treadleCount) {
      return {
        ok: false,
        message: `treadling references treadle ${treadle} (outside 1..${treadleCount})`,
      }
    }
  }
  return { ok: true }
}
