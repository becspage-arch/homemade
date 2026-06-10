'use client'

/**
 * SchematicRenderer (K-4.3) — parametric SVG schematic surface for
 * graded knitting patterns. Reads sizesGraded + projectShape and draws
 * a labelled outline with measurement arrows keyed to a letter table,
 * the industry convention working designers use.
 *
 * NOT a stitch / fabric renderer. NOT a marketing graphic. Outline +
 * labels only. Scope boundary protects against the procedural-stitch
 * temptation that's failed previous attempts.
 *
 * Coordinate system: 1 SVG unit = 1 cm. ViewBox is computed per template
 * from the geometry extent + padding for arrow labels.
 *
 * Architecture: template functions return pure geometry data (no JSX);
 * SchematicSvg composes React elements from that data. Keeps the
 * templates testable without a React render loop.
 */

import * as React from 'react'
import type { ReactElement } from 'react'

// ─── Schema types (mirrored locally so the component doesn't import
//     from @prisma/client; the consumer hands us validated data). ───

export type KnittingProjectShape =
  | 'SCARF'
  | 'HAT'
  | 'SHAWL'
  | 'BLANKET'
  | 'MITT_GLOVE'
  | 'SOCK'
  | 'SWEATER'
  | 'CARDIGAN'
  | 'VEST'
  | 'OTHER'

export type ShawlStyle =
  | 'TRIANGLE_TOP_DOWN'
  | 'TRIANGLE_BOTTOM_UP'
  | 'SEMICIRCLE'
  | 'HALF_PI'
  | 'ASYMMETRIC'
  | 'FAROESE'
  | 'SQUARE'
  | 'RECTANGULAR_STOLE'

export interface SizeRow {
  name: string
  bust?: number
  waist?: number
  hip?: number
  length?: number
  sleeveLength?: number
  shoulderWidth?: number
  /** Extra arbitrary measurements (yokeDepth, neckCircumference, ...). */
  [extra: string]: number | string | undefined
}

export interface NeedleBySectionEntry {
  section: string
  needleMm: number
}

interface SchematicPattern {
  sizesGraded: SizeRow[] | null
  needleBySection: NeedleBySectionEntry[] | null
  finishedSizeText: string | null
  projectShape: KnittingProjectShape | null
}

export interface SchematicRendererProps {
  pattern: SchematicPattern
  /** Optional shawl-style discriminator. Carried in pattern metadata
   *  JSON, not as a schema enum (K-4.3 scope). */
  shawlStyle?: ShawlStyle
  /** Name of the size to render. Defaults to the smallest graded size,
   *  or "default" for non-graded patterns. */
  chosenSize?: string
  /** Strip colour for print and constrain to A4-friendly dimensions. */
  printFriendly?: boolean
  /** Optional className applied to the wrapper element. */
  className?: string
}

// ─── Geometry data shapes (pure — no React) ─────────────────────────

export type OutlinePrimitive =
  | {
      kind: 'rect'
      x: number
      y: number
      width: number
      height: number
      style?: 'solid' | 'dashed'
    }
  | { kind: 'path'; d: string; style?: 'solid' | 'dashed' }
  | {
      kind: 'line'
      x1: number
      y1: number
      x2: number
      y2: number
      style?: 'solid' | 'thin'
    }

export interface MeasurementLabel {
  letter: string
  label: string
  valueCm: number | null
  /** Position the letter appears at in the drawing (cm coords). */
  letterAt: { x: number; y: number }
  /** Optional arrow geometry — when provided the renderer draws a
   *  measurement arrow between the two points. */
  arrow?: { from: { x: number; y: number }; to: { x: number; y: number } }
}

export interface Geometry {
  /** ViewBox: [minX, minY, width, height] in cm units. */
  viewBox: [number, number, number, number]
  /** SVG body — paths, lines, rects for the outline. */
  outline: OutlinePrimitive[]
  /** Measurement annotations rendered as arrows + letter labels. */
  measurements: MeasurementLabel[]
  /** Stub flag — true for K-5 placeholders and deferred shapes. */
  stub?: boolean
  /** Optional stub message rendered in place of the outline. */
  stubMessage?: string
}

// ─── Public entry ────────────────────────────────────────────────────

export function SchematicRenderer({
  pattern,
  shawlStyle,
  chosenSize,
  printFriendly = false,
  className,
}: SchematicRendererProps): ReactElement {
  const sizes = pattern.sizesGraded ?? []
  const activeSize: SizeRow =
    sizes.find((s) => s.name === chosenSize) ??
    sizes[0] ??
    parseFinishedSizeText(pattern.finishedSizeText) ?? { name: 'default' }

  const shape = pattern.projectShape ?? inferShape(pattern.finishedSizeText)
  const template = resolveTemplate(shape, shawlStyle)
  const geometry = template(activeSize)

  return (
    <div
      className={`schematic-renderer${printFriendly ? ' is-print' : ''}${
        className ? ' ' + className : ''
      }`}
      data-shape={shape ?? 'unknown'}
    >
      <SchematicSvg geometry={geometry} printFriendly={printFriendly} />
      {geometry.measurements.length > 0 && (
        <MeasurementTable
          measurements={geometry.measurements}
          sizeName={activeSize.name}
        />
      )}
      {pattern.needleBySection && pattern.needleBySection.length > 0 && (
        <NeedleAnnotation entries={pattern.needleBySection} />
      )}
    </div>
  )
}

// ─── Template dispatch ───────────────────────────────────────────────

type Template = (size: SizeRow) => Geometry

function resolveTemplate(
  shape: KnittingProjectShape | null,
  shawlStyle: ShawlStyle | undefined,
): Template {
  switch (shape) {
    case 'SCARF':
      return scarfTemplate
    case 'BLANKET':
      return blanketTemplate
    case 'HAT':
      return hatTemplate
    case 'MITT_GLOVE':
      return mittTemplate
    case 'SHAWL':
      return resolveShawlTemplate(shawlStyle)
    case 'SWEATER':
    case 'CARDIGAN':
    case 'VEST':
      return k5StubTemplate(shape)
    case 'SOCK':
      return deferredTemplate('Socks — geometry coming in K-5.')
    case 'OTHER':
    case null:
    default:
      return deferredTemplate('Schematic not available for this shape.')
  }
}

function resolveShawlTemplate(style: ShawlStyle | undefined): Template {
  switch (style) {
    case 'TRIANGLE_TOP_DOWN':
    case 'TRIANGLE_BOTTOM_UP':
      return triangleShawlTemplate(style)
    case 'SEMICIRCLE':
    case 'HALF_PI':
      return semicircleShawlTemplate
    case 'ASYMMETRIC':
      return asymmetricShawlTemplate
    case 'FAROESE':
      return faroeseShawlTemplate
    case 'SQUARE':
      return squareShawlTemplate
    case 'RECTANGULAR_STOLE':
      return rectangularStoleTemplate
    case undefined:
    default:
      return triangleShawlTemplate('TRIANGLE_TOP_DOWN')
  }
}

// ─── Rectangle (scarf + blanket + stole) ────────────────────────────

function rectangleTemplate(opts: {
  widthKey: string
  lengthKey: string
  widthLabel: string
  lengthLabel: string
  defaultWidth: number
  defaultLength: number
}): Template {
  return (size) => {
    const width = (size[opts.widthKey] as number | undefined) ?? opts.defaultWidth
    const length =
      (size[opts.lengthKey] as number | undefined) ?? opts.defaultLength

    const pad = 14
    const vb: [number, number, number, number] = [
      -pad,
      -pad,
      width + pad * 2,
      length + pad * 2,
    ]

    const outline: OutlinePrimitive[] = [
      { kind: 'rect', x: 0, y: 0, width, height: length },
    ]

    const measurements: MeasurementLabel[] = [
      {
        letter: 'A',
        label: opts.widthLabel,
        valueCm: width,
        letterAt: { x: width / 2, y: -pad / 2 },
        arrow: {
          from: { x: 0, y: -pad / 2 },
          to: { x: width, y: -pad / 2 },
        },
      },
      {
        letter: 'B',
        label: opts.lengthLabel,
        valueCm: length,
        letterAt: { x: -pad / 2, y: length / 2 },
        arrow: {
          from: { x: -pad / 2, y: 0 },
          to: { x: -pad / 2, y: length },
        },
      },
    ]

    return { viewBox: vb, outline, measurements }
  }
}

const scarfTemplate: Template = rectangleTemplate({
  widthKey: 'bust',
  lengthKey: 'length',
  widthLabel: 'Width',
  lengthLabel: 'Length',
  defaultWidth: 20,
  defaultLength: 180,
})

const blanketTemplate: Template = rectangleTemplate({
  widthKey: 'bust',
  lengthKey: 'length',
  widthLabel: 'Width',
  lengthLabel: 'Length',
  defaultWidth: 100,
  defaultLength: 120,
})

const rectangularStoleTemplate: Template = rectangleTemplate({
  widthKey: 'bust',
  lengthKey: 'length',
  widthLabel: 'Width',
  lengthLabel: 'Length',
  defaultWidth: 60,
  defaultLength: 180,
})

const squareShawlTemplate: Template = (size) => {
  const side =
    (size.bust as number | undefined) ??
    (size.length as number | undefined) ??
    100
  return rectangleTemplate({
    widthKey: 'bust',
    lengthKey: 'length',
    widthLabel: 'Side',
    lengthLabel: 'Side',
    defaultWidth: side,
    defaultLength: side,
  })({ ...size, bust: side, length: side })
}

// ─── Hat (side-view silhouette) ─────────────────────────────────────

const hatTemplate: Template = (size) => {
  // Hat is rendered as a side-view silhouette: a flat brim on the
  // bottom that flares slightly into a domed crown. Circumference is
  // labelled across the brim (it's the working circumference, doubled
  // for a flat layout); brim depth + crown depth on the side.
  const circumference =
    (size.bust as number | undefined) ?? (size.hip as number | undefined) ?? 56
  const brimDepth = (size.waist as number | undefined) ?? 5
  const totalDepth = (size.length as number | undefined) ?? 22

  // Lay the hat flat: width = half-circumference (the side seam line).
  const halfCirc = circumference / 2
  const pad = 18

  const vb: [number, number, number, number] = [
    -pad,
    -pad,
    halfCirc + pad * 2,
    totalDepth + pad * 2,
  ]

  const brimY = totalDepth
  const crownY = totalDepth - brimDepth
  const peakY = 0

  // Outline: a rectangle for the brim, then a dome arc for the crown.
  const path = [
    `M 0 ${brimY}`,
    `L 0 ${crownY}`,
    `Q 0 ${peakY} ${halfCirc / 2} ${peakY}`,
    `Q ${halfCirc} ${peakY} ${halfCirc} ${crownY}`,
    `L ${halfCirc} ${brimY}`,
    `Z`,
  ].join(' ')

  const outline: OutlinePrimitive[] = [
    { kind: 'path', d: path },
    {
      kind: 'line',
      x1: 0,
      y1: crownY,
      x2: halfCirc,
      y2: crownY,
      style: 'thin',
    },
  ]

  const measurements: MeasurementLabel[] = [
    {
      letter: 'A',
      label: 'Circumference (head)',
      valueCm: circumference,
      letterAt: { x: halfCirc / 2, y: brimY + pad / 2 },
      arrow: {
        from: { x: 0, y: brimY + pad / 2 },
        to: { x: halfCirc, y: brimY + pad / 2 },
      },
    },
    {
      letter: 'B',
      label: 'Brim depth',
      valueCm: brimDepth,
      letterAt: { x: halfCirc + pad / 2, y: brimY - brimDepth / 2 },
      arrow: {
        from: { x: halfCirc + pad / 2, y: crownY },
        to: { x: halfCirc + pad / 2, y: brimY },
      },
    },
    {
      letter: 'C',
      label: 'Total depth',
      valueCm: totalDepth,
      letterAt: { x: -pad / 2, y: totalDepth / 2 },
      arrow: {
        from: { x: -pad / 2, y: 0 },
        to: { x: -pad / 2, y: brimY },
      },
    },
  ]

  return { viewBox: vb, outline, measurements }
}

// ─── Mitt / glove ───────────────────────────────────────────────────

const mittTemplate: Template = (size) => {
  // Mitten silhouette: cuff at the bottom, hand body, thumb gusset on
  // the left, rounded fingertip.
  const cuffCircumference =
    (size.waist as number | undefined) ?? (size.bust as number | undefined) ?? 18
  const cuffLength = (size.sleeveLength as number | undefined) ?? 6
  const handLength = (size.length as number | undefined) ?? 18
  const handWidth = cuffCircumference / 2 + 1
  const thumbLength = handLength * 0.35

  const pad = 16
  const vb: [number, number, number, number] = [
    -pad - 4,
    -pad,
    handWidth + pad * 2 + 4,
    cuffLength + handLength + pad * 2,
  ]

  const cuffY = cuffLength + handLength
  const handTopY = handLength * 0.05
  const tipY = 0
  const thumbBaseY = cuffLength + handLength * 0.55
  const thumbTipY = thumbBaseY - thumbLength
  const thumbX = -4
  const thumbBaseX = 0

  const path = [
    `M 0 ${cuffY}`,
    `L 0 ${thumbBaseY}`,
    `Q ${thumbX} ${thumbBaseY} ${thumbX} ${(thumbBaseY + thumbTipY) / 2}`,
    `Q ${thumbX} ${thumbTipY - 2} 0 ${thumbTipY}`,
    `L ${thumbBaseX} ${thumbTipY + thumbLength * 0.3}`,
    `L 0 ${handTopY * 4}`,
    `Q 0 ${tipY} ${handWidth / 2} ${tipY}`,
    `Q ${handWidth} ${tipY} ${handWidth} ${handTopY * 4}`,
    `L ${handWidth} ${cuffY}`,
    `Z`,
  ].join(' ')

  const outline: OutlinePrimitive[] = [
    { kind: 'path', d: path },
    {
      kind: 'line',
      x1: 0,
      y1: cuffLength,
      x2: handWidth,
      y2: cuffLength,
      style: 'thin',
    },
  ]

  const measurements: MeasurementLabel[] = [
    {
      letter: 'A',
      label: 'Cuff circumference',
      valueCm: cuffCircumference,
      letterAt: { x: handWidth / 2, y: cuffY + pad / 2 },
      arrow: {
        from: { x: 0, y: cuffY + pad / 2 },
        to: { x: handWidth, y: cuffY + pad / 2 },
      },
    },
    {
      letter: 'B',
      label: 'Cuff length',
      valueCm: cuffLength,
      letterAt: { x: handWidth + pad / 2, y: cuffY - cuffLength / 2 },
      arrow: {
        from: { x: handWidth + pad / 2, y: cuffLength },
        to: { x: handWidth + pad / 2, y: cuffY },
      },
    },
    {
      letter: 'C',
      label: 'Hand length',
      valueCm: handLength,
      letterAt: { x: handWidth + pad / 2, y: cuffLength / 2 },
      arrow: {
        from: { x: handWidth + pad / 2, y: 0 },
        to: { x: handWidth + pad / 2, y: cuffLength },
      },
    },
    {
      letter: 'D',
      label: 'Thumb length',
      valueCm: thumbLength,
      letterAt: { x: thumbX - pad / 2, y: (thumbBaseY + thumbTipY) / 2 },
      arrow: {
        from: { x: thumbX - pad / 2, y: thumbTipY },
        to: { x: thumbX - pad / 2, y: thumbBaseY },
      },
    },
  ]

  return { viewBox: vb, outline, measurements }
}

// ─── Shawls ─────────────────────────────────────────────────────────

function triangleShawlTemplate(style: 'TRIANGLE_TOP_DOWN' | 'TRIANGLE_BOTTOM_UP'): Template {
  return (size) => {
    const wingspan = (size.bust as number | undefined) ?? 180
    const centreDepth = (size.length as number | undefined) ?? 80
    const pad = 16

    const flipY = style === 'TRIANGLE_BOTTOM_UP'
    const apexY = flipY ? 0 : centreDepth
    const topY = flipY ? centreDepth : 0

    const vb: [number, number, number, number] = [
      -pad,
      -pad,
      wingspan + pad * 2,
      centreDepth + pad * 2,
    ]

    const path = [
      `M 0 ${topY}`,
      `L ${wingspan} ${topY}`,
      `L ${wingspan / 2} ${apexY}`,
      `Z`,
    ].join(' ')

    const outline: OutlinePrimitive[] = [{ kind: 'path', d: path }]

    const measurements: MeasurementLabel[] = [
      {
        letter: 'A',
        label: 'Wingspan',
        valueCm: wingspan,
        letterAt: { x: wingspan / 2, y: topY + (flipY ? pad / 2 : -pad / 2) },
        arrow: {
          from: { x: 0, y: topY + (flipY ? pad / 2 : -pad / 2) },
          to: { x: wingspan, y: topY + (flipY ? pad / 2 : -pad / 2) },
        },
      },
      {
        letter: 'B',
        label: 'Centre depth',
        valueCm: centreDepth,
        letterAt: { x: wingspan / 2 + 6, y: centreDepth / 2 },
        arrow: {
          from: { x: wingspan / 2, y: topY },
          to: { x: wingspan / 2, y: apexY },
        },
      },
    ]

    return { viewBox: vb, outline, measurements }
  }
}

const semicircleShawlTemplate: Template = (size) => {
  const diameter = (size.bust as number | undefined) ?? 180
  const depth = (size.length as number | undefined) ?? diameter / 2
  const r = diameter / 2
  const pad = 16

  const vb: [number, number, number, number] = [
    -pad,
    -pad,
    diameter + pad * 2,
    depth + pad * 2,
  ]

  // Semicircle / half-pi approximation as an elliptical arc with rx =
  // half-diameter, ry = depth.
  const path = [
    `M 0 0`,
    `L ${diameter} 0`,
    `A ${r} ${depth} 0 0 1 0 0`,
    `Z`,
  ].join(' ')

  const outline: OutlinePrimitive[] = [{ kind: 'path', d: path }]

  const measurements: MeasurementLabel[] = [
    {
      letter: 'A',
      label: 'Diameter (top)',
      valueCm: diameter,
      letterAt: { x: r, y: -pad / 2 },
      arrow: { from: { x: 0, y: -pad / 2 }, to: { x: diameter, y: -pad / 2 } },
    },
    {
      letter: 'B',
      label: 'Centre depth',
      valueCm: depth,
      letterAt: { x: r + 6, y: depth / 2 },
      arrow: { from: { x: r, y: 0 }, to: { x: r, y: depth } },
    },
  ]

  return { viewBox: vb, outline, measurements }
}

const asymmetricShawlTemplate: Template = (size) => {
  // Scalene triangle: long edge along the top, short side on the
  // right, hypotenuse running diagonally.
  const longEdge = (size.bust as number | undefined) ?? 200
  const shortSide = (size.length as number | undefined) ?? 80
  const pad = 16

  const vb: [number, number, number, number] = [
    -pad,
    -pad,
    longEdge + pad * 2,
    shortSide + pad * 2,
  ]

  const path = [
    `M 0 0`,
    `L ${longEdge} 0`,
    `L ${longEdge} ${shortSide}`,
    `Z`,
  ].join(' ')

  const outline: OutlinePrimitive[] = [{ kind: 'path', d: path }]

  const measurements: MeasurementLabel[] = [
    {
      letter: 'A',
      label: 'Top edge',
      valueCm: longEdge,
      letterAt: { x: longEdge / 2, y: -pad / 2 },
      arrow: { from: { x: 0, y: -pad / 2 }, to: { x: longEdge, y: -pad / 2 } },
    },
    {
      letter: 'B',
      label: 'Right edge',
      valueCm: shortSide,
      letterAt: { x: longEdge + pad / 2, y: shortSide / 2 },
      arrow: {
        from: { x: longEdge + pad / 2, y: 0 },
        to: { x: longEdge + pad / 2, y: shortSide },
      },
    },
  ]

  return { viewBox: vb, outline, measurements }
}

const faroeseShawlTemplate: Template = (size) => {
  // Stylised triangle with a centre panel — drawn as the asymmetric
  // top edge + apex with a vertical centre line splitting it.
  const wingspan = (size.bust as number | undefined) ?? 180
  const centreDepth = (size.length as number | undefined) ?? 90
  const centrePanelWidth = wingspan * 0.18
  const pad = 16

  const vb: [number, number, number, number] = [
    -pad,
    -pad,
    wingspan + pad * 2,
    centreDepth + pad * 2,
  ]

  const apexLeftX = wingspan / 2 - centrePanelWidth / 4
  const apexRightX = wingspan / 2 + centrePanelWidth / 4

  const path = [
    `M 0 0`,
    `L ${wingspan} 0`,
    `L ${apexRightX} ${centreDepth}`,
    `L ${apexLeftX} ${centreDepth}`,
    `Z`,
  ].join(' ')

  const outline: OutlinePrimitive[] = [
    { kind: 'path', d: path },
    {
      kind: 'line',
      x1: wingspan / 2 - centrePanelWidth / 2,
      y1: 0,
      x2: apexLeftX,
      y2: centreDepth,
      style: 'thin',
    },
    {
      kind: 'line',
      x1: wingspan / 2 + centrePanelWidth / 2,
      y1: 0,
      x2: apexRightX,
      y2: centreDepth,
      style: 'thin',
    },
  ]

  const measurements: MeasurementLabel[] = [
    {
      letter: 'A',
      label: 'Wingspan',
      valueCm: wingspan,
      letterAt: { x: wingspan / 2, y: -pad / 2 },
      arrow: { from: { x: 0, y: -pad / 2 }, to: { x: wingspan, y: -pad / 2 } },
    },
    {
      letter: 'B',
      label: 'Centre depth',
      valueCm: centreDepth,
      letterAt: { x: wingspan / 2 + 6, y: centreDepth / 2 },
      arrow: {
        from: { x: wingspan / 2, y: 0 },
        to: { x: wingspan / 2, y: centreDepth },
      },
    },
    {
      letter: 'C',
      label: 'Centre panel',
      valueCm: centrePanelWidth,
      letterAt: { x: wingspan / 2, y: -pad / 4 },
    },
  ]

  return { viewBox: vb, outline, measurements }
}

// ─── K-5 placeholder + deferred ─────────────────────────────────────

function k5StubTemplate(shape: 'SWEATER' | 'CARDIGAN' | 'VEST'): Template {
  return (size) => {
    const bust = (size.bust as number | undefined) ?? 96
    const length = (size.length as number | undefined) ?? 60
    const pad = 14
    return {
      viewBox: [-pad, -pad, bust + pad * 2, length + pad * 2],
      outline: [
        {
          kind: 'rect',
          x: 0,
          y: 0,
          width: bust,
          height: length,
          style: 'dashed',
        },
      ],
      measurements: [],
      stub: true,
      stubMessage: `${humanShape(shape)} schematic geometry lands in K-5.`,
    }
  }
}

function deferredTemplate(message: string): Template {
  return () => ({
    viewBox: [-20, -20, 200, 80],
    outline: [
      { kind: 'rect', x: 0, y: 0, width: 160, height: 40, style: 'dashed' },
    ],
    measurements: [],
    stub: true,
    stubMessage: message,
  })
}

function humanShape(shape: KnittingProjectShape): string {
  switch (shape) {
    case 'SWEATER':
      return 'Sweater'
    case 'CARDIGAN':
      return 'Cardigan'
    case 'VEST':
      return 'Vest'
    default:
      return shape
  }
}

// ─── SVG composition ────────────────────────────────────────────────

function SchematicSvg({
  geometry,
  printFriendly,
}: {
  geometry: Geometry
  printFriendly: boolean
}): ReactElement {
  const [minX, minY, w, h] = geometry.viewBox
  return (
    <svg
      className="schematic-renderer-svg"
      viewBox={`${minX} ${minY} ${w} ${h}`}
      role="img"
      aria-label="Pattern schematic"
      preserveAspectRatio="xMidYMid meet"
      style={printFriendly ? { maxWidth: '180mm' } : undefined}
    >
      <defs>
        <marker
          id="schematic-arrow-end"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>

      <g className="schematic-outline-group">
        {geometry.outline.map((prim, i) => renderPrimitive(prim, i))}
      </g>

      <g className="schematic-arrows">
        {geometry.measurements.map((m) =>
          m.arrow ? (
            <line
              key={`arrow-${m.letter}`}
              x1={m.arrow.from.x}
              y1={m.arrow.from.y}
              x2={m.arrow.to.x}
              y2={m.arrow.to.y}
              className="schematic-arrow"
              markerStart="url(#schematic-arrow-end)"
              markerEnd="url(#schematic-arrow-end)"
            />
          ) : null,
        )}
      </g>

      <g className="schematic-letters">
        {geometry.measurements.map((m) => (
          <g key={`letter-${m.letter}`} transform={`translate(${m.letterAt.x} ${m.letterAt.y})`}>
            <circle r={3.4} className="schematic-letter-bg" />
            <text className="schematic-letter" textAnchor="middle" dominantBaseline="central">
              {m.letter}
            </text>
          </g>
        ))}
      </g>

      {geometry.stubMessage && (
        <text
          className="schematic-stub-label"
          x={(geometry.viewBox[0] ?? 0) + geometry.viewBox[2] / 2}
          y={(geometry.viewBox[1] ?? 0) + geometry.viewBox[3] / 2}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {geometry.stubMessage}
        </text>
      )}
    </svg>
  )
}

function renderPrimitive(prim: OutlinePrimitive, i: number): ReactElement {
  switch (prim.kind) {
    case 'rect':
      return (
        <rect
          key={i}
          x={prim.x}
          y={prim.y}
          width={prim.width}
          height={prim.height}
          className={
            prim.style === 'dashed' ? 'schematic-outline-dashed' : 'schematic-outline'
          }
        />
      )
    case 'path':
      return (
        <path
          key={i}
          d={prim.d}
          className={
            prim.style === 'dashed' ? 'schematic-outline-dashed' : 'schematic-outline'
          }
        />
      )
    case 'line':
      return (
        <line
          key={i}
          x1={prim.x1}
          y1={prim.y1}
          x2={prim.x2}
          y2={prim.y2}
          className={
            prim.style === 'thin' ? 'schematic-outline-thin' : 'schematic-outline'
          }
        />
      )
  }
}

function MeasurementTable({
  measurements,
  sizeName,
}: {
  measurements: MeasurementLabel[]
  sizeName: string
}): ReactElement {
  return (
    <table className="schematic-renderer-table">
      <caption className="schematic-renderer-table-caption">
        Measurements — size {sizeName}
      </caption>
      <thead>
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Measurement</th>
          <th scope="col">Size {sizeName}</th>
        </tr>
      </thead>
      <tbody>
        {measurements.map((m) => (
          <tr key={m.letter}>
            <td className="schematic-renderer-table-letter">{m.letter}</td>
            <td>{m.label}</td>
            <td className="schematic-renderer-table-value">
              {m.valueCm !== null ? `${m.valueCm} cm` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function NeedleAnnotation({
  entries,
}: {
  entries: NeedleBySectionEntry[]
}): ReactElement {
  return (
    <p className="schematic-renderer-needles">
      <span className="schematic-renderer-needles-label">Needles:</span>{' '}
      {entries
        .map((e) => `${e.section} ${e.needleMm.toFixed(2).replace(/0$/, '0')} mm`)
        .join(' · ')}
    </p>
  )
}

// ─── Test helper ────────────────────────────────────────────────────

/**
 * Structural summary used by snapshot tests — strips React from the
 * Geometry shape so the templates can be exercised without rendering.
 */
export interface SchematicSummary {
  viewBox: [number, number, number, number]
  measurements: Array<{ letter: string; label: string; valueCm: number | null }>
  stub: boolean
  stubMessage: string | null
  shape: KnittingProjectShape | null
  sizeName: string
  outline: OutlinePrimitive[]
}

export function computeSchematicSummary(
  pattern: SchematicPattern,
  shawlStyle: ShawlStyle | undefined,
  chosenSize?: string,
): SchematicSummary {
  const sizes = pattern.sizesGraded ?? []
  const activeSize: SizeRow =
    sizes.find((s) => s.name === chosenSize) ??
    sizes[0] ??
    parseFinishedSizeText(pattern.finishedSizeText) ?? { name: 'default' }
  const shape = pattern.projectShape ?? inferShape(pattern.finishedSizeText)
  const template = resolveTemplate(shape, shawlStyle)
  const geometry = template(activeSize)
  return {
    viewBox: geometry.viewBox,
    measurements: geometry.measurements.map((m) => ({
      letter: m.letter,
      label: m.label,
      valueCm: m.valueCm,
    })),
    stub: Boolean(geometry.stub),
    stubMessage: geometry.stubMessage ?? null,
    shape,
    sizeName: activeSize.name,
    outline: geometry.outline,
  }
}

// ─── finishedSizeText fallback parser ───────────────────────────────

/**
 * Best-effort parse of strings like "20 x 180 cm", "32 by 40 in",
 * "60 cm x 1.8 m" into a SizeRow. Returns null if the string can't be
 * interpreted. Inches are converted to cm at 2.54.
 */
export function parseFinishedSizeText(text: string | null): SizeRow | null {
  if (!text) return null
  const trimmed = text.trim().toLowerCase()
  const re = /(\d+(?:\.\d+)?)\s*(cm|m|in|inch|inches|")?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(cm|m|in|inch|inches|")?/i
  const match = trimmed.match(re)
  if (!match) return null
  const aRaw = parseFloat(match[1] ?? '')
  const bRaw = parseFloat(match[3] ?? '')
  const aUnit = match[2]
  const bUnit = match[4] ?? aUnit
  if (Number.isNaN(aRaw) || Number.isNaN(bRaw)) return null
  const a = toCm(aRaw, aUnit ?? bUnit ?? 'cm')
  const b = toCm(bRaw, bUnit ?? 'cm')
  return { name: 'default', bust: a, length: b }
}

function toCm(value: number, unit: string | undefined): number {
  switch ((unit ?? 'cm').toLowerCase()) {
    case 'm':
      return Math.round(value * 100)
    case 'in':
    case 'inch':
    case 'inches':
    case '"':
      return Math.round(value * 2.54)
    case 'cm':
    default:
      return Math.round(value)
  }
}

function inferShape(text: string | null): KnittingProjectShape | null {
  if (!text) return null
  const t = text.toLowerCase()
  if (t.includes('scarf')) return 'SCARF'
  if (t.includes('blanket') || t.includes('throw')) return 'BLANKET'
  if (t.includes('hat') || t.includes('beanie')) return 'HAT'
  if (t.includes('mitten') || t.includes('mitt') || t.includes('glove')) return 'MITT_GLOVE'
  if (t.includes('shawl')) return 'SHAWL'
  return null
}

// Keep the React import as a value reference for the classic JSX transform.
void React
