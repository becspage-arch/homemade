'use client'

/**
 * KnittingYarnSubstitution — yarn substitution calculator. The maker
 * inputs the pattern's yarn weight + total yardage and the substitute
 * yarn's weight + skein yardage. The calculator emits:
 *
 *   - a weight-match verdict (same, off-by-1 — caution, off-by-more
 *     — strong warning)
 *   - the number of skeins of the substitute needed to match the
 *     pattern's total yardage, plus a 10% buffer
 *
 * Yardage maths is straightforward; the value here is making the
 * weight-mismatch reasoning explicit so the maker doesn't end up
 * three sleeves into a sweater short on yarn.
 *
 * v1 lives in the active-project surface; future per-grade scaling
 * (premium) reads the same inputs but recomputes against the maker's
 * graded size.
 */

import { useState } from 'react'

interface YarnWeight {
  slug: string
  canonicalName: string
  standardCategory: number
}

interface Props {
  yarnWeights: YarnWeight[]
  patternYarnCategory?: number | null
  patternTotalYardage?: number | null
}

export function KnittingYarnSubstitution({
  yarnWeights,
  patternYarnCategory,
  patternTotalYardage,
}: Props) {
  const [patternCat, setPatternCat] = useState<string>(
    patternYarnCategory != null ? String(patternYarnCategory) : '',
  )
  const [patternYardage, setPatternYardage] = useState<string>(
    patternTotalYardage != null ? String(patternTotalYardage) : '',
  )
  const [substituteCat, setSubstituteCat] = useState<string>('')
  const [skeinYardage, setSkeinYardage] = useState<string>('')

  const result = computeResult({
    patternCat: Number(patternCat),
    patternYardage: Number(patternYardage),
    substituteCat: Number(substituteCat),
    skeinYardage: Number(skeinYardage),
  })

  return (
    <section className="knitting-substitution">
      <h2 className="knitting-substitution-heading">Yarn substitution</h2>
      <p className="knitting-substitution-lede">
        Compare your yarn to the pattern&apos;s and the calculator tells you how many
        skeins to buy plus whether the weight match is close enough to swatch.
      </p>

      <div className="knitting-substitution-grid">
        <label className="knitting-substitution-field">
          <span>Pattern yarn weight</span>
          <select value={patternCat} onChange={(e) => setPatternCat(e.target.value)}>
            <option value="">—</option>
            {yarnWeights.map((w) => (
              <option key={w.slug} value={w.standardCategory}>
                {w.canonicalName}
              </option>
            ))}
          </select>
        </label>

        <label className="knitting-substitution-field">
          <span>Total yardage for pattern</span>
          <input
            type="number"
            min="0"
            step="50"
            value={patternYardage}
            onChange={(e) => setPatternYardage(e.target.value)}
            placeholder="1100"
          />
        </label>

        <label className="knitting-substitution-field">
          <span>Substitute yarn weight</span>
          <select value={substituteCat} onChange={(e) => setSubstituteCat(e.target.value)}>
            <option value="">—</option>
            {yarnWeights.map((w) => (
              <option key={w.slug} value={w.standardCategory}>
                {w.canonicalName}
              </option>
            ))}
          </select>
        </label>

        <label className="knitting-substitution-field">
          <span>Yardage per skein</span>
          <input
            type="number"
            min="0"
            step="10"
            value={skeinYardage}
            onChange={(e) => setSkeinYardage(e.target.value)}
            placeholder="225"
          />
        </label>
      </div>

      {result && (
        <div
          className={`knitting-substitution-result${
            result.severity === 'warn' ? ' is-warning' : ''
          }`}
        >
          <div>{result.message}</div>
          {result.skeinsNeeded != null && (
            <p className="knitting-substitution-result-line">
              {result.skeinsNeeded} skeins ({result.totalNeededYardage} yd, 10% buffer included)
            </p>
          )}
        </div>
      )}
    </section>
  )
}

interface ResultInput {
  patternCat: number
  patternYardage: number
  substituteCat: number
  skeinYardage: number
}

interface Result {
  message: string
  severity: 'ok' | 'warn'
  skeinsNeeded: number | null
  totalNeededYardage: number | null
}

function computeResult(input: ResultInput): Result | null {
  if (!Number.isFinite(input.patternCat) || !Number.isFinite(input.patternYardage)) {
    return null
  }
  if (input.patternYardage <= 0) return null

  const totalNeededYardage = Math.ceil(input.patternYardage * 1.1)

  let weightMessage: string
  let severity: 'ok' | 'warn' = 'ok'

  if (Number.isFinite(input.substituteCat)) {
    const diff = Math.abs(input.substituteCat - input.patternCat)
    if (diff === 0) {
      weightMessage = 'Same weight as the pattern. Swatch and you should be set.'
    } else if (diff === 1) {
      weightMessage =
        'One category off. Likely fine with a swatch, but expect a slightly different drape.'
      severity = 'warn'
    } else {
      weightMessage = `${diff} categories off. Likely too different — your finished piece may not look or fit like the sample. Swatch first; adjust needles or pattern size if needed.`
      severity = 'warn'
    }
  } else {
    weightMessage = "Pick your substitute weight to see whether it's compatible."
  }

  let skeinsNeeded: number | null = null
  if (Number.isFinite(input.skeinYardage) && input.skeinYardage > 0) {
    skeinsNeeded = Math.ceil(totalNeededYardage / input.skeinYardage)
  }

  return {
    message: weightMessage,
    severity,
    skeinsNeeded,
    totalNeededYardage,
  }
}
