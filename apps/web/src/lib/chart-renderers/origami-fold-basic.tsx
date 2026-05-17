/**
 * Server-rendered origami fold diagram — v1 capability.
 *
 * Consumes an `OrigamiFoldDefinition` from `./types.ts` and draws each
 * step as a 2D top-down view of a square paper with the fold lines and
 * direction arrows for that step.
 *
 * v1 supports:
 *   - Mountain folds, drawn as dash-dot lines.
 *   - Valley folds, drawn as dashed lines.
 *   - Straight arrows perpendicular to the fold line.
 *   - Curved arrows that rotate a flap around the fold line.
 *   - Step numbering, optional per-step captions.
 *   - Vertically stacked diagrams, one per step.
 *
 * v1 does NOT support: inside reverse, outside reverse, petal fold,
 * squash fold, sink, swivel, 3D collapse. Those require the advanced
 * Yoshizawa-Randlett renderer that is on the deferred-work list. Each
 * origami tutorial declares the maximum complexity it uses; the
 * authoring prompt rejects briefs whose folds exceed v1 capability.
 *
 * The component is stateless and renders to plain SVG markup — no
 * client hooks, no canvas, no runtime layout work. Drawing is
 * deterministic given the same definition, so the renderer is safe to
 * call from Server Components.
 */

import type { ReactNode } from 'react'

import type {
  OrigamiFold,
  OrigamiFoldDefinition,
  OrigamiStep,
} from './types'

const STROKE = 'rgb(48, 42, 36)'
const PAPER_OUTLINE = 'rgba(48, 42, 36, 0.55)'
const PAPER_FILL = '#fdf8ef'

/** Side of the 100×100 unit per-step box. */
const STEP_SIZE = 200
const STEP_PADDING_X = 24
const STEP_PADDING_TOP = 28
const STEP_PADDING_BOTTOM = 12
const CAPTION_LINE_HEIGHT = 12
const CAPTION_AREA = 36
const STEP_GAP = 24

interface OrigamiFoldBasicProps {
  definition: OrigamiFoldDefinition

  /** Optional class hook for the wrapper `<figure>`. */
  className?: string
}

export function OrigamiFoldBasic({
  definition,
  className,
}: OrigamiFoldBasicProps): ReactNode {
  const { title, stepCount, steps } = definition

  const stepHeight =
    STEP_PADDING_TOP + STEP_SIZE + STEP_PADDING_BOTTOM + CAPTION_AREA
  const totalHeight = steps.length * stepHeight + Math.max(0, steps.length - 1) * STEP_GAP
  const totalWidth = STEP_SIZE + STEP_PADDING_X * 2

  return (
    <figure
      className={['origami-fold', className].filter(Boolean).join(' ')}
      style={{ color: STROKE }}
    >
      {title ? <figcaption className="origami-fold__title">{title}</figcaption> : null}
      <div className="origami-fold__svg-wrap">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          width="100%"
          role="img"
          aria-label={title ?? 'Origami fold diagram'}
          style={{ maxWidth: `${totalWidth}px` }}
        >
          <defs>
            <marker
              id="orig-arrow"
              viewBox="0 0 10 10"
              refX={9}
              refY={5}
              markerWidth={4}
              markerHeight={4}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={STROKE} />
            </marker>
          </defs>
          {steps.map((step, i) => {
            const yOffset = i * (stepHeight + STEP_GAP)
            return (
              <g key={step.stepNumber} transform={`translate(${STEP_PADDING_X} ${yOffset})`}>
                <StepDiagram
                  step={step}
                  stepCount={stepCount}
                />
              </g>
            )
          })}
        </svg>
      </div>
      <p className="origami-fold__legend" aria-hidden="true">
        <span><LegendMountain /> mountain fold</span>
        <span><LegendValley /> valley fold</span>
      </p>
    </figure>
  )
}

// ───────────────────────────────────────────────────────────────────────
// One step — header, paper outline, fold lines, arrows, caption.
// ───────────────────────────────────────────────────────────────────────

function StepDiagram({
  step,
  stepCount,
}: {
  step: OrigamiStep
  stepCount: number
}): ReactNode {
  const cellX = (STEP_SIZE - 100) / 2
  return (
    <g>
      <text
        x={0}
        y={16}
        fontSize={12}
        fontFamily="ui-monospace, monospace"
        fill={STROKE}
      >
        Step {step.stepNumber} of {stepCount}
      </text>
      <g transform={`translate(${cellX} ${STEP_PADDING_TOP}) scale(${STEP_SIZE / 100 - 0.005})`}>
        <PaperOutline outline={step.outline} />
        {step.folds.map((fold, i) => (
          <FoldLine key={i} fold={fold} />
        ))}
      </g>
      {step.caption ? (
        <Caption
          text={step.caption}
          width={STEP_SIZE}
          y={STEP_PADDING_TOP + STEP_SIZE + STEP_PADDING_BOTTOM}
        />
      ) : null}
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Paper outline — default to the unit square unless overridden.
// ───────────────────────────────────────────────────────────────────────

function PaperOutline({ outline }: { outline?: string }): ReactNode {
  if (outline) {
    return <path d={outline} fill={PAPER_FILL} stroke={PAPER_OUTLINE} strokeWidth={0.8} />
  }
  return (
    <rect x={0} y={0} width={100} height={100} fill={PAPER_FILL} stroke={PAPER_OUTLINE} strokeWidth={0.8} />
  )
}

// ───────────────────────────────────────────────────────────────────────
// Fold line — mountain (dash-dot) or valley (dashed), plus arrow.
// ───────────────────────────────────────────────────────────────────────

function FoldLine({ fold }: { fold: OrigamiFold }): ReactNode {
  const [fx, fy] = fold.from
  const [tx, ty] = fold.to
  const dash = fold.kind === 'mountain' ? '3 1.5 0.6 1.5' : '3 2'
  return (
    <g>
      <line
        x1={fx}
        y1={fy}
        x2={tx}
        y2={ty}
        stroke={STROKE}
        strokeWidth={1}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <FoldArrow fold={fold} />
    </g>
  )
}

function FoldArrow({ fold }: { fold: OrigamiFold }): ReactNode {
  const arrow = fold.arrow ?? 'straight'
  if (arrow === 'none') return null

  const [fx, fy] = fold.from
  const [tx, ty] = fold.to
  const mx = (fx + tx) / 2
  const my = (fy + ty) / 2

  const dx = tx - fx
  const dy = ty - fy
  const length = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / length // normal x
  const ny = dx / length  // normal y
  const side = fold.arrowSide === 'left' ? -1 : 1

  if (arrow === 'straight') {
    const armLength = Math.min(18, length / 2)
    const ax = mx + nx * side * armLength
    const ay = my + ny * side * armLength
    return (
      <line
        x1={ax}
        y1={ay}
        x2={mx + nx * side * 2}
        y2={my + ny * side * 2}
        stroke={STROKE}
        strokeWidth={0.9}
        strokeLinecap="round"
        markerEnd="url(#orig-arrow)"
      />
    )
  }

  // Curved arrow — half-circle in the plane perpendicular to the fold,
  // rotated `side` from the fold line. Drawn as an SVG arc that starts
  // and ends on opposite sides of the midpoint, sweeping `side` units
  // away from the line. Authors use this to indicate a flap rotating
  // 180° around the fold line.
  const radius = Math.min(20, length / 3)
  const startX = mx + nx * side * radius
  const startY = my + ny * side * radius
  // The arc lands back on the line slightly past the midpoint so the
  // arrow tip points back across the fold.
  const tangentScale = 0.85
  const endX = mx + (dx / length) * radius * tangentScale * (side === 1 ? 1 : -1)
  const endY = my + (dy / length) * radius * tangentScale * (side === 1 ? 1 : -1)
  const sweep = side === 1 ? 1 : 0
  const arc = `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${endY}`
  return (
    <path
      d={arc}
      fill="none"
      stroke={STROKE}
      strokeWidth={0.9}
      strokeLinecap="round"
      markerEnd="url(#orig-arrow)"
    />
  )
}

// ───────────────────────────────────────────────────────────────────────
// Caption — soft-wrapped at a target column width.
// ───────────────────────────────────────────────────────────────────────

function Caption({
  text,
  width,
  y,
}: {
  text: string
  width: number
  y: number
}): ReactNode {
  const lines = wrap(text, Math.floor(width / 4.5))
  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={y + (i + 1) * CAPTION_LINE_HEIGHT}
          fontSize={10}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill={STROKE}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (!current) {
      current = word
      continue
    }
    if (current.length + 1 + word.length <= maxChars) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  // Soft cap at two lines — anything longer should be split across steps.
  return lines.slice(0, 2)
}

// ───────────────────────────────────────────────────────────────────────
// Legend chip glyphs — tiny mountain + valley fold samples.
// ───────────────────────────────────────────────────────────────────────

function LegendMountain(): ReactNode {
  return (
    <svg width={24} height={6} viewBox="0 0 24 6" aria-hidden="true">
      <line x1={1} y1={3} x2={23} y2={3} stroke={STROKE} strokeWidth={1} strokeDasharray="3 1.5 0.6 1.5" strokeLinecap="round" />
    </svg>
  )
}

function LegendValley(): ReactNode {
  return (
    <svg width={24} height={6} viewBox="0 0 24 6" aria-hidden="true">
      <line x1={1} y1={3} x2={23} y2={3} stroke={STROKE} strokeWidth={1} strokeDasharray="3 2" strokeLinecap="round" />
    </svg>
  )
}

