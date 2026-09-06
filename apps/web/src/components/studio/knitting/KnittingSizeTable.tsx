'use client'

/**
 * KnittingSizeTable — the grader as the product, inside the Studio.
 *
 * Every standard size is worked out in full and free to read on screen: the
 * finished measurements, the stitch counts at each working point, the row
 * counts, the yarn needed, and the ordered steps for whichever size the maker
 * picks. Change the gauge or the ease and the whole table is rewritten.
 *
 * Under it sits "Fit it to me": the maker's own measurements and their swatch
 * gauge, which regrade the pattern to their body. That one output is premium,
 * so the panel always takes the measurements and the gate only lands on the
 * worked custom size that comes back. Nothing here renders unless the pattern
 * row itself is gradable — the server decides that before the component is
 * ever mounted.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { UpgradeBlock } from '@/components/premium/UpgradeBlock'
import { getStudioGateCopy } from '@/lib/studio/premium-gates'
import { EASE_PRESETS, type EasePreset } from '@/lib/knitting/grading/ease-presets'
import type { GradedPattern } from '@/lib/knitting/grading/types'
import type { KnittingGradableSpec } from '@/lib/knitting/grading/pattern-spec'
import type { SockGradedPattern } from '@/lib/knitting/sock/types'

interface Props {
  patternSlug: string
  spec: KnittingGradableSpec
  signedIn: boolean
  /** Resolved on the server with `hasPremium(user)`. The Studio route group
   *  has no PremiumProvider above it, so the answer travels as a prop. */
  isPremium: boolean
}

interface GradeResponse {
  craft: 'GARMENT' | 'SOCK'
  sizes: Array<GradedPattern | SockGradedPattern>
  custom: GradedPattern | SockGradedPattern | null
  verification: { ok: boolean; issues: string[] }
}

type BodyMeasurementKey =
  | 'bust' | 'waist' | 'hip' | 'backLengthToWaist' | 'bodyLength'
  | 'shoulderWidth' | 'armLength' | 'upperArm' | 'neck' | 'wrist'

type FootMeasurementKey =
  | 'footLengthCm' | 'footCircumferenceCm' | 'ankleCircumferenceCm' | 'calfCircumferenceCm'

const BODY_FIELDS: Array<{ key: BodyMeasurementKey; label: string; hint: string }> = [
  { key: 'bust', label: 'Bust or chest', hint: 'Around the fullest part' },
  { key: 'waist', label: 'Waist', hint: 'Around the natural waist' },
  { key: 'hip', label: 'Hip', hint: 'Around the fullest part' },
  { key: 'backLengthToWaist', label: 'Back neck to waist', hint: 'Centre back, neck bone down' },
  { key: 'bodyLength', label: 'Back neck to hem', hint: 'How long you want it' },
  { key: 'shoulderWidth', label: 'Shoulder to shoulder', hint: 'Across the back' },
  { key: 'armLength', label: 'Arm length', hint: 'Shoulder point to wrist' },
  { key: 'upperArm', label: 'Upper arm', hint: 'Around the widest part' },
  { key: 'neck', label: 'Neck', hint: 'Around the base of the neck' },
  { key: 'wrist', label: 'Wrist', hint: 'Around the wrist bone' },
]

const FOOT_FIELDS: Array<{ key: FootMeasurementKey; label: string; hint: string }> = [
  { key: 'footLengthCm', label: 'Foot length', hint: 'Heel to longest toe, foot flat' },
  { key: 'footCircumferenceCm', label: 'Foot circumference', hint: 'Around the ball of the foot' },
  { key: 'ankleCircumferenceCm', label: 'Ankle', hint: 'Just above the heel' },
  { key: 'calfCircumferenceCm', label: 'Calf', hint: 'Around the widest part' },
]

const GARMENT_ROWS: Array<{ label: string; read: (s: GradedPattern) => string }> = [
  { label: 'Finished bust (cm)', read: (s) => fmt(s.finishedMeasurements.bust) },
  { label: 'Finished length (cm)', read: (s) => fmt(s.finishedMeasurements.body) },
  { label: 'Sleeve length (cm)', read: (s) => fmt(s.finishedMeasurements.sleeve) },
  { label: 'Upper arm (cm)', read: (s) => fmt(s.finishedMeasurements.upperArm) },
  { label: 'Neck (cm)', read: (s) => fmt(s.finishedMeasurements.neck) },
  { label: 'Yoke depth (cm)', read: (s) => fmt(s.yokeDepth) },
  { label: 'Armhole depth (cm)', read: (s) => fmt(s.armholeDepth) },
  { label: 'Cast on at neck or hem', read: (s) => String(s.neckStitchCount) },
  { label: 'Hem stitches', read: (s) => String(s.hemStitchCount) },
  { label: 'Bust stitches', read: (s) => String(s.bustStitchCount) },
  { label: 'Underarm stitches', read: (s) => String(s.underarmStitchCount) },
  { label: 'Sleeve at bicep', read: (s) => String(s.sleeveBicepStitchCount) },
  { label: 'Sleeve at cuff', read: (s) => String(s.sleeveCuffStitchCount) },
  { label: 'Body rows', read: (s) => String(s.bodyLengthRows) },
  { label: 'Sleeve rows', read: (s) => String(s.sleeveLengthRows) },
  { label: 'Yoke rows', read: (s) => String(s.yokeDepthRows) },
  { label: 'Yarn (g)', read: (s) => String(s.yarnRequiredGrams) },
  { label: 'Yarn (yards)', read: (s) => String(s.yarnRequiredYards) },
]

const SOCK_ROWS: Array<{ label: string; read: (s: SockGradedPattern) => string }> = [
  { label: 'Foot length (cm)', read: (s) => fmt(s.finishedMeasurements.footLengthCm) },
  { label: 'Foot circumference (cm)', read: (s) => fmt(s.finishedMeasurements.footCircumferenceCm) },
  { label: 'Leg length (cm)', read: (s) => fmt(s.finishedMeasurements.legLengthCm) },
  { label: 'Cast on', read: (s) => String(s.startingStitchCount) },
  { label: 'Leg stitches', read: (s) => String(s.legStitchCount) },
  { label: 'After heel turn', read: (s) => String(s.heelTurnStitchCount) },
  { label: 'Gusset peak', read: (s) => String(s.gussetPeakStitchCount) },
  { label: 'Foot stitches', read: (s) => String(s.footStitchCount) },
  { label: 'Toe stitches', read: (s) => String(s.toeStitchCount) },
  { label: 'Cuff rib rows', read: (s) => String(s.cuffRibRows) },
  { label: 'Leg rows', read: (s) => String(s.legRows) },
  { label: 'Heel flap rows', read: (s) => String(s.heelFlapRows) },
  { label: 'Foot rows', read: (s) => String(s.footRows) },
  { label: 'Toe rows', read: (s) => String(s.toeRows) },
  { label: 'Yarn (g)', read: (s) => String(s.yarnRequiredGrams) },
  { label: 'Yarn (yards)', read: (s) => String(s.yarnRequiredYards) },
]

export function KnittingSizeTable({ patternSlug, spec, signedIn, isPremium }: Props) {
  const gateCopy = getStudioGateCopy('KNITTING_CUSTOM_FIT')

  const [stitchGauge, setStitchGauge] = useState(String(spec.gauge.stitchesPer10cm))
  const [rowGauge, setRowGauge] = useState(String(spec.gauge.rowsPer10cm))
  const [easePreset, setEasePreset] = useState<EasePreset>(
    spec.kind === 'GARMENT' ? spec.easePreset : 'ZERO',
  )

  // One outcome per request, tagged with the request it answers. Deriving
  // `loading` / `result` / `error` from it keeps the effect free of the
  // synchronous setState that causes cascading renders.
  const [outcome, setOutcome] = useState<{
    key: string
    data: GradeResponse | null
    error: string | null
  } | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [customFitting, setCustomFitting] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [custom, setCustom] = useState<GradedPattern | SockGradedPattern | null>(null)

  const gauge = useMemo(() => {
    const sts = Number(stitchGauge)
    const rows = Number(rowGauge)
    if (!(sts > 0) || !(rows > 0)) return null
    return { stitchesPer10cm: sts, rowsPer10cm: rows }
  }, [stitchGauge, rowGauge])

  const requestKey = gauge
    ? `${gauge.stitchesPer10cm}|${gauge.rowsPer10cm}|${easePreset}`
    : null

  // ── Standard sizes: free, and refetched whenever gauge or ease moves ─────
  useEffect(() => {
    if (!gauge || !requestKey) return
    let cancelled = false
    fetch('/api/studio/knitting/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: patternSlug,
        gauge,
        ...(spec.kind === 'GARMENT' ? { easePreset } : {}),
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as GradeResponse & { error?: string }
        if (cancelled) return
        if (!res.ok) {
          setOutcome({
            key: requestKey,
            data: null,
            error: data.error ?? 'The sizes could not be worked out just now.',
          })
          return
        }
        setOutcome({ key: requestKey, data, error: null })
        setSelectedSize((current) => {
          if (current && data.sizes.some((s) => String(s.size) === current)) return current
          // Open on the middle of the run, which is the size most people read
          // first, rather than the smallest.
          const middle = data.sizes[Math.floor(data.sizes.length / 2)]
          return middle ? String(middle.size) : null
        })
      })
      .catch(() => {
        if (cancelled) return
        setOutcome({
          key: requestKey,
          data: null,
          error: 'The sizes could not be worked out just now.',
        })
      })
    return () => {
      cancelled = true
    }
  }, [patternSlug, gauge, requestKey, easePreset, spec.kind])

  const answered = outcome?.key === requestKey ? outcome : null
  const result = answered?.data ?? null
  const error = answered?.error ?? null
  const loading = requestKey !== null && answered === null

  // ── The maker's own size: premium ────────────────────────────────────────
  const fitToMe = useCallback(async () => {
    if (!gauge) {
      setCustomError('Fill in your swatch gauge first.')
      return
    }
    const fields = spec.kind === 'GARMENT' ? BODY_FIELDS : FOOT_FIELDS
    const measured: Record<string, number> = {}
    for (const field of fields) {
      const value = Number(measurements[field.key])
      if (!(value > 0)) {
        setCustomError(`Fill in ${field.label.toLowerCase()} before fitting.`)
        return
      }
      measured[field.key] = value
    }

    setCustomFitting(true)
    setCustomError(null)
    setShowGate(false)
    try {
      const res = await fetch('/api/studio/knitting/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: patternSlug,
          gauge,
          ...(spec.kind === 'GARMENT' ? { easePreset } : {}),
          customMeasurements: measured,
        }),
      })
      const data = (await res.json()) as GradeResponse & { error?: string }
      if (res.status === 402) {
        setShowGate(true)
        setCustom(null)
        return
      }
      if (res.status === 401) {
        setCustomError('Sign in to fit a pattern to your own measurements.')
        setCustom(null)
        return
      }
      if (!res.ok) {
        setCustomError(data.error ?? 'That could not be fitted just now.')
        setCustom(null)
        return
      }
      setCustom(data.custom)
    } catch {
      setCustomError('That could not be fitted just now.')
    } finally {
      setCustomFitting(false)
    }
  }, [gauge, measurements, patternSlug, easePreset, spec.kind])

  const sizes = result?.sizes ?? []
  const chosen = sizes.find((s) => String(s.size) === selectedSize) ?? sizes[0] ?? null
  const rows = spec.kind === 'GARMENT' ? GARMENT_ROWS : SOCK_ROWS

  return (
    <section className="knitting-size-table">
      <header className="knitting-size-table-header">
        <h2 className="knitting-size-table-heading">Every size, worked out</h2>
        <p className="knitting-size-table-lede">
          {spec.kind === 'GARMENT'
            ? 'Change the gauge or the ease and the whole pattern is rewritten. Every standard size here is free to work from on screen.'
            : 'Change the gauge and the whole pattern is rewritten. Every standard foot size here is free to work from on screen.'}
        </p>
      </header>

      <div className="knitting-size-table-controls">
        <label className="knitting-size-table-field">
          <span>Stitches per 10 cm</span>
          <input
            type="number"
            min={1}
            step="0.5"
            value={stitchGauge}
            onChange={(e) => setStitchGauge(e.target.value)}
          />
        </label>
        <label className="knitting-size-table-field">
          <span>Rows per 10 cm</span>
          <input
            type="number"
            min={1}
            step="0.5"
            value={rowGauge}
            onChange={(e) => setRowGauge(e.target.value)}
          />
        </label>
        {spec.kind === 'GARMENT' && (
          <label className="knitting-size-table-field">
            <span>Ease</span>
            <select
              value={easePreset}
              onChange={(e) => setEasePreset(e.target.value as EasePreset)}
            >
              {(Object.keys(EASE_PRESETS) as EasePreset[]).map((preset) => (
                <option key={preset} value={preset}>
                  {EASE_PRESETS[preset].label} ({formatSigned(EASE_PRESETS[preset].amountCm)} cm)
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && <p className="knitting-size-table-error">{error}</p>}
      {loading && !result && <p className="knitting-size-table-status">Working the sizes out…</p>}

      {sizes.length > 0 && (
        <div className="knitting-size-table-scroll">
          <table className="knitting-size-table-grid">
            <thead>
              <tr>
                <th scope="col">Size</th>
                {sizes.map((s) => (
                  <th key={String(s.size)} scope="col">
                    <button
                      type="button"
                      className={`knitting-size-table-size${
                        String(s.size) === String(chosen?.size) ? ' is-selected' : ''
                      }`}
                      onClick={() => setSelectedSize(String(s.size))}
                    >
                      {sizeLabel(String(s.size))}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {sizes.map((s) => (
                    <td key={String(s.size)}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {row.read(s as any)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chosen && (
        <div className="knitting-size-table-steps">
          <h3>How size {sizeLabel(String(chosen.size))} is worked</h3>
          <ol>
            {chosen.assemblyInstructions.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {'assemblyInstructions' in chosen &&
            'seams' in chosen.assemblyInstructions &&
            chosen.assemblyInstructions.seams.length > 0 && (
              <p className="knitting-size-table-seams">
                Seams to sew: {chosen.assemblyInstructions.seams.join(', ')}.
              </p>
            )}
        </div>
      )}

      {/* ── Fit it to me ─────────────────────────────────────────────────── */}
      <div className="knitting-size-table-fit">
        <h3>Fit it to me</h3>
        <p className="knitting-size-table-fit-lede">
          Measure yourself and swatch, and the pattern is worked again to your
          numbers rather than a standard size. Your measurements are yours; the
          worked custom size is part of premium.
        </p>

        <div className="knitting-size-table-fit-fields">
          {(spec.kind === 'GARMENT' ? BODY_FIELDS : FOOT_FIELDS).map((field) => (
            <label key={field.key} className="knitting-size-table-field">
              <span>{field.label} (cm)</span>
              <input
                type="number"
                min={1}
                step="0.5"
                value={measurements[field.key] ?? ''}
                placeholder={field.hint}
                onChange={(e) =>
                  setMeasurements((m) => ({ ...m, [field.key]: e.target.value }))
                }
              />
              <small>{field.hint}</small>
            </label>
          ))}
        </div>

        <button
          type="button"
          className="knitting-size-table-fit-button"
          onClick={fitToMe}
          disabled={customFitting}
        >
          {customFitting ? 'Fitting…' : 'Fit it to me'}
        </button>

        {customError && <p className="knitting-size-table-error">{customError}</p>}

        {!signedIn && !customError && (
          <p className="knitting-size-table-status">
            Sign in to fit a pattern to your own measurements.
          </p>
        )}

        {(showGate || (!isPremium && signedIn)) && (
          <UpgradeBlock
            message={gateCopy.message}
            rationale={gateCopy.rationale}
            gate="KNITTING_CUSTOM_FIT"
            productArea="studio-knitting"
          />
        )}

        {custom && (
          <div className="knitting-size-table-custom">
            <h4>Your size</h4>
            <dl>
              {rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <dd>{row.read(custom as any)}</dd>
                </div>
              ))}
            </dl>
            <ol>
              {custom.assemblyInstructions.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function formatSigned(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}

/** Chart size codes carry their audience as a prefix. Read them out. */
function sizeLabel(size: string): string {
  if (size === 'CUSTOM') return 'Yours'
  if (size.startsWith('M-')) return `Men's ${size.slice(2)}`
  if (size.startsWith('K-')) return `Age ${size.slice(2)}`
  if (size.startsWith('B-')) return `Baby ${size.slice(2)}`
  if (size.startsWith('W_') || size.startsWith('M_')) {
    const uk = size.split('_')[1]
    const audience = size.startsWith('W_') ? 'Women' : 'Men'
    return uk ? `${audience} UK ${uk.replace('UK', '')}` : size
  }
  return size
}
