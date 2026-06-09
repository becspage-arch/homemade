'use client'

/**
 * KnittingSchematicView — garment-pattern schematic surface. Shows
 * the pre-rendered schematic image (Media.schematicMediaId) with a
 * size-selector chip strip that swaps the measurements panel. The
 * schematic image itself does not change per size in v1 — only the
 * displayed measurements do.
 *
 * v1: out of scope to generate schematics from scratch. v1 displays
 * the existing Media if set; otherwise renders a polite placeholder
 * (the Studio still works, the maker uses the written view).
 *
 * The renderer reads measurements in cm canonical per the units
 * memory; the user-preference toggle would convert at display time
 * once the per-user preference is wired (K-4 follow-on).
 */

import { useMemo, useState } from 'react'

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
}

export function KnittingSchematicView({
  schematicMediaId,
  sizesGraded,
  gradedSize,
  finishedSizeText,
}: Props) {
  const sizes = useMemo(() => sizesGraded ?? [], [sizesGraded])
  const [activeSize, setActiveSize] = useState<string>(
    gradedSize ?? sizes[0]?.name ?? '',
  )

  const activeRow = sizes.find((s) => s.name === activeSize) ?? null

  return (
    <section className="knitting-schematic-view">
      <h2 className="knitting-schematic-view-heading">Schematic</h2>

      {schematicMediaId ? (
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
              onClick={() => setActiveSize(s.name)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {activeRow && (
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
