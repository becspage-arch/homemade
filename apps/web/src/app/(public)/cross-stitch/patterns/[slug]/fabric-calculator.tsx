'use client'

import { useState } from 'react'

/**
 * Finished size and fabric-to-cut, for whichever fabric the stitcher actually
 * owns rather than only the count the pattern was designed around.
 *
 * Every option is expressed as stitches per inch, which is the only number
 * the arithmetic needs: Aida works one stitch per block, so the count IS the
 * stitches per inch, while evenweave and linen are normally worked over two
 * threads, so a 28-count evenweave gives 14 stitches per inch.
 *
 * Centimetres are canonical (the design is metric) and inches are derived,
 * so the two never disagree by a rounding step.
 */
interface FabricOption {
  /** URL/select value — the fabric count as printed on the bolt. */
  count: number
  label: string
  /** Stitches per inch once the fabric is worked as intended. */
  perInch: number
}

const FABRIC_OPTIONS: FabricOption[] = [
  { count: 11, label: '11-count Aida', perInch: 11 },
  { count: 14, label: '14-count Aida', perInch: 14 },
  { count: 16, label: '16-count Aida', perInch: 16 },
  { count: 18, label: '18-count Aida', perInch: 18 },
  { count: 22, label: '22-count Hardanger', perInch: 22 },
  { count: 28, label: '28-count evenweave, over 2', perInch: 14 },
]

/** Spare fabric on each side, in cm: enough for a hoop and for framing. */
const MARGIN_CM = 7.5

const CM_PER_INCH = 2.54

interface FabricCalculatorProps {
  widthCells: number
  heightCells: number
  /** The count the pattern is designed around. Selected on first render. */
  suggestedCount: number
}

export function FabricCalculator({
  widthCells,
  heightCells,
  suggestedCount,
}: FabricCalculatorProps) {
  // Default to the suggested count, falling back to 14-count Aida when the
  // pattern names a count that isn't one of the six on offer.
  const initial =
    FABRIC_OPTIONS.find((o) => o.count === suggestedCount) ??
    FABRIC_OPTIONS.find((o) => o.count === 14)!
  const [count, setCount] = useState(initial.count)
  const option = FABRIC_OPTIONS.find((o) => o.count === count) ?? initial

  const finishedW = (widthCells / option.perInch) * CM_PER_INCH
  const finishedH = (heightCells / option.perInch) * CM_PER_INCH
  const cutW = finishedW + MARGIN_CM * 2
  const cutH = finishedH + MARGIN_CM * 2

  return (
    <section className="pattern-detail-fabric" aria-label="Fabric calculator">
      <div className="pattern-detail-fabric-head">
        <h2>On your fabric</h2>
        <label className="pattern-detail-fabric-select">
          <span>Fabric</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            aria-label="Fabric count"
          >
            {FABRIC_OPTIONS.map((o) => (
              <option key={o.count} value={o.count}>
                {o.label}
                {o.count === suggestedCount ? ' · suggested' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="pattern-detail-fabric-figures">
        <div>
          <dt>Finished size</dt>
          <dd>
            {fmtCm(finishedW)} × {fmtCm(finishedH)} cm
            <span>{fmtIn(finishedW)} × {fmtIn(finishedH)} in</span>
          </dd>
        </div>
        <div>
          <dt>Fabric to cut</dt>
          <dd>
            {fmtCm(cutW)} × {fmtCm(cutH)} cm
            <span>{fmtIn(cutW)} × {fmtIn(cutH)} in</span>
          </dd>
        </div>
      </dl>

      <p className="pattern-detail-fabric-note">
        Cutting size leaves {MARGIN_CM} cm spare on every side, which is room for a hoop
        and for framing. {option.perInch} stitches to the inch on {option.label.toLowerCase()}.
      </p>
    </section>
  )
}

function fmtCm(cm: number): string {
  return cm.toFixed(1)
}

function fmtIn(cm: number): string {
  return (cm / CM_PER_INCH).toFixed(1)
}
