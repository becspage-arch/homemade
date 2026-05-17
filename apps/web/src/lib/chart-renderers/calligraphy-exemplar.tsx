/**
 * Server-rendered calligraphy-exemplar SVG. Consumes a
 * `CalligraphyExemplarDefinition` from `./types.ts` and draws:
 *
 *   - The optional letterform outline behind the strokes (lightly filled
 *     so the reader sees the finished letter together with the stroke
 *     order).
 *   - The guide-lines for the named alphabet (ascender, cap-height,
 *     x-height, baseline, descender), drawn only when listed in the
 *     definition's `guideLines`.
 *   - Each stroke of the ductus, in order, with a numbered marker at the
 *     stroke start and an arrowhead at the stroke end (or midpoint).
 *   - A small nib-angle label inside the exemplar.
 *
 * The component is stateless and renders to plain SVG markup — no client
 * hooks, no canvas, no runtime layout work. Drawing is deterministic given
 * the same definition, so the renderer is safe to call from Server
 * Components.
 *
 * Coordinate system: definitions are written in a 100×100 unit box (the
 * canonical letter cell). The renderer scales to its rendered width and
 * adds padding for guide-line labels and the nib-angle chip.
 */

import type { ReactNode } from 'react'

import type {
  CalligraphyExemplarDefinition,
  CalligraphyGuideLine,
  CalligraphyStroke,
} from './types'

const STROKE = 'rgb(48, 42, 36)'
const INK = 'rgb(48, 42, 36)'
const GUIDE = 'rgba(48, 42, 36, 0.18)'
const GUIDE_LABEL = 'rgba(48, 42, 36, 0.55)'
const OUTLINE_FILL = 'rgba(48, 42, 36, 0.10)'

/** Padding around the 100-unit letter cell (label + breathing room). */
const PADDING_LEFT = 64
const PADDING_RIGHT = 32
const PADDING_TOP = 16
const PADDING_BOTTOM = 24
const VIEW_WIDTH = 100 + PADDING_LEFT + PADDING_RIGHT
const VIEW_HEIGHT = 100 + PADDING_TOP + PADDING_BOTTOM

/** Where each guide-line sits in the 0–100 cell (top = 0, bottom = 100).
 *  These are conventional values per the Foundational + Italic literature:
 *  ascender at the top, descender at the bottom, x-height defining the
 *  body, cap-height defining capitals. */
const GUIDE_Y: Record<CalligraphyGuideLine, number> = {
  ascender: 8,
  'cap-height': 22,
  'x-height': 40,
  baseline: 78,
  descender: 92,
}

const GUIDE_LABEL_TEXT: Record<CalligraphyGuideLine, string> = {
  ascender: 'ascender',
  'cap-height': 'cap',
  'x-height': 'x-height',
  baseline: 'baseline',
  descender: 'descender',
}

interface CalligraphyExemplarProps {
  definition: CalligraphyExemplarDefinition

  /** Optional class hook for the wrapper `<figure>`. */
  className?: string
}

export function CalligraphyExemplar({
  definition,
  className,
}: CalligraphyExemplarProps): ReactNode {
  const { alphabet, letter, guideLines, ductus, outline, nibAngle } = definition

  const ariaLabel = `${alphabet} ${letter} — stroke order exemplar`

  return (
    <figure
      className={['calligraphy-exemplar', className].filter(Boolean).join(' ')}
      style={{ color: INK }}
    >
      <div className="calligraphy-exemplar__svg-wrap">
        <svg
          viewBox={`${-PADDING_LEFT} ${-PADDING_TOP} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width="100%"
          role="img"
          aria-label={ariaLabel}
          style={{ maxWidth: '320px' }}
        >
          <GuideLines lines={guideLines} />
          {outline ? (
            <path d={outline} fill={OUTLINE_FILL} stroke="none" />
          ) : null}
          <Ductus strokes={ductus} />
          <NibAngleLabel angle={nibAngle} />
        </svg>
      </div>
      <figcaption className="calligraphy-exemplar__caption">
        <span className="calligraphy-exemplar__letter">{letter}</span>
        <span className="calligraphy-exemplar__alphabet">
          {alphabetLabel(alphabet)}
        </span>
      </figcaption>
    </figure>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Guide-lines — horizontal rules across the 0–100 cell.
// ───────────────────────────────────────────────────────────────────────

function GuideLines({ lines }: { lines: CalligraphyGuideLine[] }): ReactNode {
  if (lines.length === 0) return null
  return (
    <g aria-hidden="true">
      {lines.map((g) => {
        const y = GUIDE_Y[g]
        const isStrong = g === 'baseline' || g === 'x-height'
        return (
          <g key={g}>
            <line
              x1={0}
              y1={y}
              x2={100}
              y2={y}
              stroke={GUIDE}
              strokeWidth={isStrong ? 0.6 : 0.4}
              strokeDasharray={isStrong ? '0' : '2 2'}
            />
            <text
              x={-4}
              y={y}
              fontSize={6}
              textAnchor="end"
              dominantBaseline="middle"
              fontFamily="ui-monospace, monospace"
              fill={GUIDE_LABEL}
            >
              {GUIDE_LABEL_TEXT[g]}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Ductus — numbered, arrow-tipped strokes drawn in order.
// ───────────────────────────────────────────────────────────────────────

function Ductus({ strokes }: { strokes: CalligraphyStroke[] }): ReactNode {
  return (
    <g>
      <defs>
        <marker
          id="cal-arrow"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={4}
          markerHeight={4}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={INK} />
        </marker>
      </defs>
      {strokes.map((s) => {
        const arrowAt = s.arrowAt ?? 'end'
        const start = parsePathStart(s.path)
        return (
          <g key={s.stroke}>
            <path
              d={s.path}
              fill="none"
              stroke={STROKE}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={arrowAt === 'end' ? 'url(#cal-arrow)' : undefined}
              markerMid={arrowAt === 'middle' ? 'url(#cal-arrow)' : undefined}
            />
            {start ? (
              <g>
                <circle cx={start.x} cy={start.y} r={4} fill="#fbf7f1" stroke={STROKE} strokeWidth={0.6} />
                <text
                  x={start.x}
                  y={start.y}
                  fontSize={5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="ui-monospace, monospace"
                  fill={INK}
                >
                  {s.stroke}
                </text>
              </g>
            ) : null}
          </g>
        )
      })}
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Nib-angle label — small chip in the top-right corner of the cell.
// ───────────────────────────────────────────────────────────────────────

function NibAngleLabel({ angle }: { angle: number }): ReactNode {
  // Round the angle to the nearest integer for the chip — the renderer
  // honours the exact angle in the diagram, but the chip reads cleaner
  // as a whole number.
  const display = `${Math.round(angle)}°`
  const cx = 100 - 6
  const cy = 6
  return (
    <g aria-hidden="true">
      <rect
        x={cx - 16}
        y={cy - 5}
        width={20}
        height={10}
        rx={2}
        fill="#fbf7f1"
        stroke={GUIDE}
        strokeWidth={0.4}
      />
      <text
        x={cx - 6}
        y={cy}
        fontSize={6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-monospace, monospace"
        fill={GUIDE_LABEL}
      >
        {display}
      </text>
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────

/** Pull the first point out of an SVG path string so the numbered
 *  marker can sit at the start of the stroke. Only handles the `M x y`
 *  form (the only form authors are expected to start strokes with). */
function parsePathStart(path: string): { x: number; y: number } | null {
  const match = path
    .trim()
    .match(/^[Mm]\s*(-?[0-9.]+)[\s,]+(-?[0-9.]+)/)
  if (!match) return null
  const x = Number(match[1])
  const y = Number(match[2])
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y }
}

function alphabetLabel(alphabet: CalligraphyExemplarDefinition['alphabet']): string {
  switch (alphabet) {
    case 'foundational-lower':
      return 'Foundational, lower case'
    case 'roman-capital':
      return 'Roman capitals'
    case 'italic-lower':
      return 'Italic, lower case'
    default:
      return alphabet
  }
}
