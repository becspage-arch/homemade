'use client'

/**
 * CrochetSchematicView — labelled measurement diagram for garments.
 * v1 surface is a stub: we don't have any graded garment patterns
 * authored yet, so the most this view does is show the gauge text,
 * the finished-size text, and (if present) the sizes table.
 *
 * When the garment content batch lands (step 10), this view gets the
 * full schematic image with overlaid measurements and a custom-grading
 * entry point.
 */

interface Props {
  schematicMediaId: string | null
  sizesGraded: unknown
  gradedSize: string | null
  finishedSizeText: string | null
}

interface SizeRow {
  name: string
  bust?: number
  waist?: number
  hip?: number
  length?: number
  sleeveLength?: number
  shoulderWidth?: number
}

export function CrochetSchematicView({
  schematicMediaId,
  sizesGraded,
  gradedSize,
  finishedSizeText,
}: Props) {
  const sizes = parseSizes(sizesGraded)
  const hasSchematic = Boolean(schematicMediaId)
  const hasSizes = sizes.length > 0

  if (!hasSchematic && !hasSizes && !finishedSizeText) {
    return (
      <div className="crochet-studio-schematic-empty">
        <p>
          This pattern does not carry a schematic or sizing table. Switch to the Written view or
          the Chart.
        </p>
      </div>
    )
  }

  return (
    <div className="crochet-studio-schematic">
      {hasSchematic && schematicMediaId && (
        <div className="crochet-studio-schematic-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/media/${schematicMediaId}`} alt="Pattern schematic" />
        </div>
      )}

      {finishedSizeText && (
        <p className="crochet-studio-schematic-finished">
          <strong>Finished size.</strong> {finishedSizeText}
        </p>
      )}

      {hasSizes && (
        <table className="crochet-studio-schematic-sizes">
          <thead>
            <tr>
              <th>Size</th>
              <th>Bust</th>
              <th>Waist</th>
              <th>Hip</th>
              <th>Length</th>
              <th>Sleeve</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size.name} className={size.name === gradedSize ? 'is-selected' : undefined}>
                <th scope="row">{size.name}</th>
                <td>{size.bust ? `${size.bust} cm` : '—'}</td>
                <td>{size.waist ? `${size.waist} cm` : '—'}</td>
                <td>{size.hip ? `${size.hip} cm` : '—'}</td>
                <td>{size.length ? `${size.length} cm` : '—'}</td>
                <td>{size.sleeveLength ? `${size.sleeveLength} cm` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function parseSizes(raw: unknown): SizeRow[] {
  if (!Array.isArray(raw)) return []
  const out: SizeRow[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const name = typeof row.name === 'string' ? row.name : null
    if (!name) continue
    out.push({
      name,
      bust: typeof row.bust === 'number' ? row.bust : undefined,
      waist: typeof row.waist === 'number' ? row.waist : undefined,
      hip: typeof row.hip === 'number' ? row.hip : undefined,
      length: typeof row.length === 'number' ? row.length : undefined,
      sleeveLength: typeof row.sleeveLength === 'number' ? row.sleeveLength : undefined,
      shoulderWidth: typeof row.shoulderWidth === 'number' ? row.shoulderWidth : undefined,
    })
  }
  return out
}
