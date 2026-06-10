'use client'

/**
 * KnittingSchematicView — garment-pattern schematic surface.
 *
 * Two paths:
 *   1. Parametric (K-4.3): when the pattern carries a `projectShape`
 *      + `sizesGraded`, the SchematicRenderer draws a labelled outline
 *      from the chosen size. Letter-keyed measurements appear in the
 *      table below the drawing — industry-standard convention.
 *   2. Legacy Media image: when only `schematicMediaId` is present
 *      (older patterns, hand-drawn schematics), display the uploaded
 *      image with a size chip strip + measurement list.
 *   3. Placeholder: neither — polite message, Studio still works via
 *      the written + chart views.
 *
 * Measurements live in cm canonical per the units memory; render-time
 * user-preference conversion is the K-4 follow-on.
 */

import { useMemo, useState } from 'react'

import {
  SchematicRenderer,
  type ShawlStyle,
  type SizeRow as SchematicSizeRow,
} from '@/components/knitting/SchematicRenderer'
import type { KnittingProjectShape, NeedleBySection } from './types'

interface SizeRow {
  name: string
  bust?: number
  waist?: number
  hip?: number
  length?: number
  sleeveLength?: number
  shoulderWidth?: number
}

interface Props {
  schematicMediaId: string | null
  sizesGraded: SizeRow[] | null
  gradedSize: string | null
  finishedSizeText: string | null
  projectShape?: KnittingProjectShape | null
  needleBySection?: NeedleBySection[] | null
  shawlStyle?: ShawlStyle
  onSizeChange?: (sizeName: string) => void
}

export function KnittingSchematicView({
  schematicMediaId,
  sizesGraded,
  gradedSize,
  finishedSizeText,
  projectShape = null,
  needleBySection = null,
  shawlStyle,
  onSizeChange,
}: Props) {
  const sizes = useMemo(() => sizesGraded ?? [], [sizesGraded])
  const [activeSize, setActiveSize] = useState<string>(
    gradedSize ?? sizes[0]?.name ?? '',
  )

  const activeRow = sizes.find((s) => s.name === activeSize) ?? null

  const handleSizeChange = (name: string) => {
    setActiveSize(name)
    onSizeChange?.(name)
  }

  // Prefer parametric whenever the pattern carries a projectShape.
  // Falls back to the Media image path when only the upload exists.
  const useParametric = Boolean(projectShape) && (sizes.length > 0 || Boolean(finishedSizeText))

  return (
    <section className="knitting-schematic-view">
      <h2 className="knitting-schematic-view-heading">Schematic</h2>

      {useParametric ? (
        <SchematicRenderer
          pattern={{
            sizesGraded: sizes as SchematicSizeRow[],
            needleBySection,
            finishedSizeText,
            projectShape,
          }}
          shawlStyle={shawlStyle}
          chosenSize={activeSize || undefined}
        />
      ) : schematicMediaId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="knitting-schematic-view-image"
          src={`/api/media/${schematicMediaId}/file`}
          alt="Schematic diagram"
        />
      ) : (
        <div className="knitting-schematic-view-image">
          No schematic diagram on this pattern yet.
        </div>
      )}

      {sizes.length > 0 && (
        <div className="knitting-schematic-view-sizes" role="tablist" aria-label="Size">
          {sizes.map((s) => (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={s.name === activeSize}
              className={`knitting-schematic-view-size-chip${
                s.name === activeSize ? ' is-active' : ''
              }`}
              onClick={() => handleSizeChange(s.name)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {!useParametric && activeRow && (
        <ul className="knitting-schematic-view-measurements">
          {(['bust', 'waist', 'hip', 'length', 'sleeveLength', 'shoulderWidth'] as const).map(
            (key) => {
              const value = activeRow[key]
              if (value === undefined) return null
              return (
                <li key={key}>
                  <span className="knitting-schematic-view-measurement-label">
                    {labelFor(key)}
                  </span>
                  <span className="knitting-schematic-view-measurement-value">{value} cm</span>
                </li>
              )
            },
          )}
        </ul>
      )}

      {sizes.length === 0 && finishedSizeText && (
        <p style={{ fontSize: '0.9rem', color: 'var(--studio-ink-soft)', margin: 0 }}>
          Finished size: {finishedSizeText}
        </p>
      )}
    </section>
  )
}

function labelFor(key: string): string {
  switch (key) {
    case 'bust':
      return 'Bust'
    case 'waist':
      return 'Waist'
    case 'hip':
      return 'Hip'
    case 'length':
      return 'Length'
    case 'sleeveLength':
      return 'Sleeve'
    case 'shoulderWidth':
      return 'Shoulder'
    default:
      return key
  }
}
