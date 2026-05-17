/**
 * Server-rendered macramé knot diagram.
 *
 * Reads a `MacrameKnotDefinition` from `./types.ts` and draws the named
 * knot as a cord-path diagram. Each cord is numbered + colour-coded;
 * over-and-under crossings are drawn with a small white "break" in the
 * under-cord at the crossing point so the topology reads cleanly.
 *
 * The renderer covers the ten fundamental knots the fibre-arts
 * pipeline teaches:
 *
 *   square / alternating-square           (2 working over 2 filler)
 *   half-hitch-left / half-hitch-right    (1 over 1)
 *   double-half-hitch-left / -right       (1 over 1, doubled)
 *   larks-head                            (1 doubled around a holding cord)
 *   gathering                             (wrapping knot, ≥ 2 cords)
 *   overhand                              (1 cord around itself)
 *   figure-8                              (1 cord around itself, S-shape)
 *
 * `showSteps` toggles between a single final-state diagram and a
 * compact multi-step build-up. The single-state view is what PATTERN
 * bodies use after the knot is taught; the multi-step view is what the
 * TECHNIQUE entry for a knot uses the first time it's introduced.
 *
 * The component is stateless and outputs plain SVG markup — no client
 * hooks, no canvas, no runtime layout work. Definitions are
 * deterministic, so RSC / SSG-safe.
 */

import type { ReactNode } from 'react'

import type { MacrameKnotDefinition, MacrameKnotType } from './types'

const STROKE = 'rgb(48, 42, 36)'
const BG = '#fdf8ef'
const CORD_LEFT = '#b85c2a' // sienna — working cord 1 (and filler L in 4-cord knots)
const CORD_RIGHT = '#3f6b78' // teal — working cord 2 (and filler R in 4-cord knots)
const CORD_FILLER = 'rgba(48, 42, 36, 0.55)' // muted — filler cords
const CORD_WIDTH = 3.5
const STEP_WIDTH = 160
const STEP_HEIGHT = 200
const STEP_GAP = 24
const PADDING = 16

interface MacrameKnotProps {
  definition: MacrameKnotDefinition
  /** Optional class hook for the wrapper `<figure>`. */
  className?: string
}

export function MacrameKnot({
  definition,
  className,
}: MacrameKnotProps): ReactNode {
  const knotType = definition.knotType
  const showSteps = definition.showSteps === true
  const cordCount = resolveCordCount(definition)

  const steps = stepsFor(knotType, cordCount, showSteps)

  const totalWidth = PADDING * 2 + steps.length * STEP_WIDTH + (steps.length - 1) * STEP_GAP
  const totalHeight = PADDING * 2 + STEP_HEIGHT + (showSteps ? 24 : 0)

  return (
    <figure
      className={['macrame-knot', className].filter(Boolean).join(' ')}
      style={{ color: STROKE }}
    >
      <div className="macrame-knot__svg-wrap">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          width="100%"
          role="img"
          aria-label={ariaLabel(knotType)}
          style={{ maxWidth: `${totalWidth}px` }}
        >
          <defs>
            <marker
              id="macrame-arrow"
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
            const x = PADDING + i * (STEP_WIDTH + STEP_GAP)
            return (
              <g key={i} transform={`translate(${x} ${PADDING})`}>
                {showSteps && steps.length > 1 ? (
                  <text
                    x={STEP_WIDTH / 2}
                    y={STEP_HEIGHT + 16}
                    fontSize={11}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    textAnchor="middle"
                    fill={STROKE}
                    fillOpacity={0.7}
                  >
                    Step {i + 1}
                  </text>
                ) : null}
                {step}
              </g>
            )
          })}
        </svg>
      </div>
      {definition.caption ? (
        <p className="macrame-knot__caption">{definition.caption}</p>
      ) : null}
    </figure>
  )
}

function ariaLabel(knotType: MacrameKnotType): string {
  switch (knotType) {
    case 'square':
      return 'Square knot — diagram'
    case 'alternating-square':
      return 'Alternating square knot — diagram'
    case 'half-hitch-left':
      return 'Half-hitch (left) — diagram'
    case 'half-hitch-right':
      return 'Half-hitch (right) — diagram'
    case 'double-half-hitch-left':
      return 'Double half-hitch (left) — diagram'
    case 'double-half-hitch-right':
      return 'Double half-hitch (right) — diagram'
    case 'larks-head':
      return "Lark's head knot — diagram"
    case 'gathering':
      return 'Gathering (wrapping) knot — diagram'
    case 'overhand':
      return 'Overhand knot — diagram'
    case 'figure-8':
      return 'Figure-8 knot — diagram'
    default:
      return 'Macramé knot — diagram'
  }
}

function resolveCordCount(definition: MacrameKnotDefinition): 2 | 4 {
  if (definition.cordCount === 2 || definition.cordCount === 4) {
    return definition.cordCount
  }
  // Knot-canonical defaults. Square / alternating-square family is
  // four cords; everything else is two.
  switch (definition.knotType) {
    case 'square':
    case 'alternating-square':
      return 4
    default:
      return 2
  }
}

// ───────────────────────────────────────────────────────────────────────
// Step generation — return one or more SVG fragments, each drawn into a
// 160×200 unit box. The renderer translates each step to its own x
// position.
// ───────────────────────────────────────────────────────────────────────

function stepsFor(
  knotType: MacrameKnotType,
  cordCount: 2 | 4,
  showSteps: boolean,
): ReactNode[] {
  switch (knotType) {
    case 'square':
      return showSteps ? squareKnotSteps() : [squareKnotFinal()]
    case 'alternating-square':
      return [alternatingSquareFinal()]
    case 'half-hitch-left':
      return showSteps ? halfHitchSteps('left') : [halfHitchFinal('left')]
    case 'half-hitch-right':
      return showSteps ? halfHitchSteps('right') : [halfHitchFinal('right')]
    case 'double-half-hitch-left':
      return showSteps ? doubleHalfHitchSteps('left') : [doubleHalfHitchFinal('left')]
    case 'double-half-hitch-right':
      return showSteps ? doubleHalfHitchSteps('right') : [doubleHalfHitchFinal('right')]
    case 'larks-head':
      return showSteps ? larksHeadSteps() : [larksHeadFinal()]
    case 'gathering':
      return [gatheringFinal()]
    case 'overhand':
      return [overhandFinal()]
    case 'figure-8':
      return [figureEightFinal()]
    default:
      // Defensive — render the four cords hanging straight so the
      // body still shows something meaningful when a future knot
      // slug arrives unknown.
      return [fallbackCords(cordCount)]
  }
}

// ───────────────────────────────────────────────────────────────────────
// Square knot — two working cords (left + right) around two filler
// cords (the inner pair). Working cords cross over the fillers and
// hook into each other. The "right over, left under" half is followed
// by "left over, right under" to make the knot sit square.
// ───────────────────────────────────────────────────────────────────────

function squareKnotFinal(): ReactNode {
  // Four vertical cords at x = 30, 60, 100, 130. Working cords are
  // outermost (sienna left, teal right); fillers are inner (muted).
  return (
    <g>
      <CordBackground />
      {/* Fillers — straight down through the knot. */}
      <line x1={60} y1={20} x2={60} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <line x1={100} y1={20} x2={100} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />

      {/* Right working cord (teal) — arches left over fillers, behind
          left cord at the bottom. */}
      <path
        d="M 130 20 C 130 60, 30 70, 30 110 C 30 140, 130 150, 130 180"
        fill="none"
        stroke={CORD_RIGHT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />

      {/* Left working cord (sienna) — arches right over fillers, on
          top of teal at top crossing, behind teal at bottom. */}
      <path
        d="M 30 20 C 30 60, 130 70, 130 110"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <CrossingBreak x={80} y={50} />
      <path
        d="M 130 110 C 130 140, 30 150, 30 180"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <CrossingBreak x={80} y={150} />

      <CordLabel x={30} y={14} text="1" />
      <CordLabel x={60} y={14} text="F" />
      <CordLabel x={100} y={14} text="F" />
      <CordLabel x={130} y={14} text="2" />
    </g>
  )
}

function squareKnotSteps(): ReactNode[] {
  return [
    // Step 1 — half knot: right over fillers, left under.
    (
      <g key="square-1">
        <CordBackground />
        <line x1={60} y1={20} x2={60} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
        <line x1={100} y1={20} x2={100} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
        {/* Right cord crosses LEFT over the fillers. */}
        <path
          d="M 130 20 C 130 60, 30 80, 30 180"
          fill="none"
          stroke={CORD_RIGHT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
          markerEnd="url(#macrame-arrow)"
        />
        <CrossingBreak x={80} y={60} />
        <path
          d="M 30 20 C 30 60, 130 80, 130 180"
          fill="none"
          stroke={CORD_LEFT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
        <CordLabel x={30} y={14} text="1" />
        <CordLabel x={130} y={14} text="2" />
      </g>
    ),
    // Step 2 — completed half knot at the top, then mirror: left over,
    // right under, to balance the square.
    (
      <g key="square-2">
        <CordBackground />
        <line x1={60} y1={20} x2={60} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
        <line x1={100} y1={20} x2={100} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
        <path
          d="M 130 20 C 130 60, 30 70, 30 110 C 30 140, 130 150, 130 180"
          fill="none"
          stroke={CORD_RIGHT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
        <path
          d="M 30 20 C 30 60, 130 70, 130 110 C 130 140, 30 150, 30 180"
          fill="none"
          stroke={CORD_LEFT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
          markerEnd="url(#macrame-arrow)"
        />
        <CrossingBreak x={80} y={50} />
        <CrossingBreak x={80} y={150} />
        <CordLabel x={30} y={14} text="1" />
        <CordLabel x={130} y={14} text="2" />
      </g>
    ),
  ]
}

function alternatingSquareFinal(): ReactNode {
  // Two square knots offset — top row uses cords 1+2 / 3+4 (with their
  // own fillers), second row uses cords 2+3 with cords 1, 4 dropping
  // through. A simple two-row depiction is enough to convey the
  // pattern.
  return (
    <g>
      <CordBackground />
      {/* Four working cords running straight; only the knots are
          drawn explicitly. */}
      <line x1={30} y1={20} x2={30} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <line x1={60} y1={20} x2={60} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <line x1={100} y1={20} x2={100} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <line x1={130} y1={20} x2={130} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      {/* Two knots on row 1 — drawn as small filled lozenges. */}
      <KnotMark x={45} y={50} stroke={CORD_LEFT} />
      <KnotMark x={115} y={50} stroke={CORD_RIGHT} />
      {/* One knot on row 2 — offset to the centre. */}
      <KnotMark x={80} y={120} stroke={CORD_LEFT} />
      <CordLabel x={30} y={14} text="1" />
      <CordLabel x={60} y={14} text="2" />
      <CordLabel x={100} y={14} text="3" />
      <CordLabel x={130} y={14} text="4" />
    </g>
  )
}

function KnotMark({ x, y, stroke }: { x: number; y: number; stroke: string }): ReactNode {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M -15 0 C -10 -10, 10 -10, 15 0 C 10 10, -10 10, -15 0 Z"
        fill={BG}
        stroke={stroke}
        strokeWidth={CORD_WIDTH}
        strokeLinejoin="round"
      />
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Half-hitch — one working cord (left or right) makes a single hitch
// around a holding cord.
// ───────────────────────────────────────────────────────────────────────

function halfHitchFinal(direction: 'left' | 'right'): ReactNode {
  // Holding cord vertical at centre; working cord enters from `direction`
  // side, loops over and under, exits down.
  const workingStartX = direction === 'left' ? 30 : 130
  const workingExitX = direction === 'left' ? 60 : 100
  const stroke = direction === 'left' ? CORD_LEFT : CORD_RIGHT
  return (
    <g>
      <CordBackground />
      <line x1={80} y1={20} x2={80} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <path
        d={`M ${workingStartX} 20 C ${workingStartX} 60, ${workingExitX} 80, 80 90 C ${workingExitX === 60 ? 100 : 60} 100, ${workingStartX === 30 ? 60 : 100} 130, ${workingExitX} 180`}
        fill="none"
        stroke={stroke}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <CrossingBreak x={80} y={95} />
      <CordLabel x={workingStartX} y={14} text="W" />
      <CordLabel x={80} y={14} text="H" />
    </g>
  )
}

function halfHitchSteps(direction: 'left' | 'right'): ReactNode[] {
  return [
    // Step 1 — bring working cord behind the holding cord.
    (
      <g key="half-hitch-1">
        <CordBackground />
        <line x1={80} y1={20} x2={80} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
        <path
          d={direction === 'left'
            ? 'M 30 20 C 30 60, 80 70, 110 90'
            : 'M 130 20 C 130 60, 80 70, 50 90'
          }
          fill="none"
          stroke={direction === 'left' ? CORD_LEFT : CORD_RIGHT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
          markerEnd="url(#macrame-arrow)"
        />
        <CrossingBreak x={80} y={75} />
      </g>
    ),
    // Step 2 — loop back over and exit downward.
    halfHitchFinal(direction),
  ]
}

// ───────────────────────────────────────────────────────────────────────
// Double half-hitch — half-hitch performed twice on the same holding
// cord, producing a clear two-bump diagonal.
// ───────────────────────────────────────────────────────────────────────

function doubleHalfHitchFinal(direction: 'left' | 'right'): ReactNode {
  const stroke = direction === 'left' ? CORD_LEFT : CORD_RIGHT
  const workingStartX = direction === 'left' ? 30 : 130
  const sweep1Path = direction === 'left'
    ? 'M 30 20 C 30 50, 100 60, 60 75 C 30 85, 100 95, 60 110'
    : 'M 130 20 C 130 50, 60 60, 100 75 C 130 85, 60 95, 100 110'
  const sweep2Path = direction === 'left'
    ? 'M 60 110 C 30 120, 100 130, 60 145 C 30 155, 100 165, 60 180'
    : 'M 100 110 C 130 120, 60 130, 100 145 C 130 155, 60 165, 100 180'

  return (
    <g>
      <CordBackground />
      <line x1={80} y1={20} x2={80} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <path d={sweep1Path} fill="none" stroke={stroke} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <path d={sweep2Path} fill="none" stroke={stroke} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <CrossingBreak x={80} y={70} />
      <CrossingBreak x={80} y={100} />
      <CrossingBreak x={80} y={130} />
      <CrossingBreak x={80} y={160} />
      <CordLabel x={workingStartX} y={14} text="W" />
      <CordLabel x={80} y={14} text="H" />
    </g>
  )
}

function doubleHalfHitchSteps(direction: 'left' | 'right'): ReactNode[] {
  return [halfHitchFinal(direction), doubleHalfHitchFinal(direction)]
}

// ───────────────────────────────────────────────────────────────────────
// Lark's head — one doubled cord wrapped around a holding cord. The
// canonical mount knot for hanging cords on a dowel.
// ───────────────────────────────────────────────────────────────────────

function larksHeadFinal(): ReactNode {
  return (
    <g>
      <CordBackground />
      {/* Horizontal holding cord (dowel). */}
      <line x1={10} y1={60} x2={150} y2={60} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH + 1} strokeLinecap="round" />
      {/* Loop down the front, wrap behind, and exit through the loop. */}
      <path
        d="M 60 30 C 60 50, 60 65, 80 65 C 100 65, 100 50, 100 30"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <path
        d="M 60 65 C 60 100, 60 140, 60 180"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <path
        d="M 100 65 C 100 100, 100 140, 100 180"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <CordLabel x={80} y={14} text="loop" />
      <CordLabel x={140} y={54} text="dowel" />
    </g>
  )
}

function larksHeadSteps(): ReactNode[] {
  return [
    // Step 1 — folded cord, loop in front of dowel.
    (
      <g key="larks-head-1">
        <CordBackground />
        <line x1={10} y1={60} x2={150} y2={60} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH + 1} strokeLinecap="round" />
        <path
          d="M 60 20 C 60 50, 60 110, 60 180"
          fill="none"
          stroke={CORD_LEFT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
        <path
          d="M 100 20 C 100 50, 100 110, 100 180"
          fill="none"
          stroke={CORD_LEFT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
        <path
          d="M 60 20 C 60 30, 100 30, 100 20"
          fill="none"
          stroke={CORD_LEFT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
      </g>
    ),
    // Step 2 — final tied state.
    larksHeadFinal(),
  ]
}

// ───────────────────────────────────────────────────────────────────────
// Gathering (wrapping) knot — one cord wound tightly around a bundle
// of others. Used to bind the top of a plant hanger.
// ───────────────────────────────────────────────────────────────────────

function gatheringFinal(): ReactNode {
  return (
    <g>
      <CordBackground />
      {/* Three vertical bundle cords. */}
      <line x1={60} y1={20} x2={60} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <line x1={80} y1={20} x2={80} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      <line x1={100} y1={20} x2={100} y2={180} stroke={CORD_FILLER} strokeWidth={CORD_WIDTH} strokeLinecap="round" />
      {/* Wrapping cord spiralling around the bundle from y=70 to y=130. */}
      {[70, 84, 98, 112, 126].map((y, i) => (
        <path
          key={i}
          d={`M 50 ${y} Q 80 ${y - 6}, 110 ${y}`}
          fill="none"
          stroke={CORD_LEFT}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
      ))}
      <CordLabel x={80} y={14} text="bundle" />
      <CordLabel x={40} y={70} text="wrap" />
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Overhand — single cord doubled over and pulled through. The simplest
// terminating knot.
// ───────────────────────────────────────────────────────────────────────

function overhandFinal(): ReactNode {
  return (
    <g>
      <CordBackground />
      <path
        d="M 80 20 L 80 70 C 80 90, 50 90, 50 110 C 50 130, 110 130, 110 110 C 110 90, 80 90, 80 110 L 80 180"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <CrossingBreak x={80} y={95} />
      <CordLabel x={80} y={14} text="cord" />
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Figure-8 — a stop knot with an S-shaped path. Holds the cord from
// running through a hole.
// ───────────────────────────────────────────────────────────────────────

function figureEightFinal(): ReactNode {
  return (
    <g>
      <CordBackground />
      <path
        d="M 80 20 L 80 60 C 80 80, 50 80, 50 100 C 50 120, 110 110, 110 130 C 110 150, 80 150, 80 130 L 80 180"
        fill="none"
        stroke={CORD_LEFT}
        strokeWidth={CORD_WIDTH}
        strokeLinecap="round"
      />
      <CrossingBreak x={62} y={95} />
      <CrossingBreak x={92} y={130} />
      <CordLabel x={80} y={14} text="cord" />
    </g>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Shared primitives — background, cord-label text, crossing break.
// ───────────────────────────────────────────────────────────────────────

function CordBackground(): ReactNode {
  return (
    <rect
      x={0}
      y={0}
      width={STEP_WIDTH}
      height={STEP_HEIGHT}
      fill={BG}
      stroke="rgba(48, 42, 36, 0.18)"
      strokeWidth={0.8}
      rx={4}
    />
  )
}

/**
 * Small label drawn beside a cord end. Used to mark "1" / "2" / "F"
 * (filler) / "W" (working) / "H" (holding) so the diagram reads
 * without the body prose having to repeat the cord positions.
 */
function CordLabel({ x, y, text }: { x: number; y: number; text: string }): ReactNode {
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      textAnchor="middle"
      fill={STROKE}
      fillOpacity={0.75}
    >
      {text}
    </text>
  )
}

/**
 * "Crossing break" — a small background-coloured stroke that interrupts
 * the under-cord at a crossing point so the over/under topology reads.
 * The renderer paints this on top of the under-cord; the over-cord's
 * stroke then continues past it without being interrupted.
 */
function CrossingBreak({ x, y }: { x: number; y: number }): ReactNode {
  return (
    <circle cx={x} cy={y} r={CORD_WIDTH * 1.4} fill={BG} stroke="none" />
  )
}

/**
 * Fallback used when an unknown knotType arrives — render the cords
 * hanging straight so the body still surfaces something meaningful.
 */
function fallbackCords(cordCount: 2 | 4): ReactNode {
  const xs = cordCount === 2 ? [60, 100] : [30, 60, 100, 130]
  return (
    <g>
      <CordBackground />
      {xs.map((x) => (
        <line
          key={x}
          x1={x}
          y1={20}
          x2={x}
          y2={180}
          stroke={CORD_FILLER}
          strokeWidth={CORD_WIDTH}
          strokeLinecap="round"
        />
      ))}
      <text
        x={STEP_WIDTH / 2}
        y={STEP_HEIGHT / 2}
        fontSize={10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={STROKE}
        fillOpacity={0.6}
      >
        Knot diagram unavailable
      </text>
    </g>
  )
}
