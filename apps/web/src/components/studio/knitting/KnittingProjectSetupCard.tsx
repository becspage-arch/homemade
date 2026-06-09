'use client'

/**
 * KnittingProjectSetupCard — first-open prompt asking what the maker
 * is using. Captures yarn, needles (mm), in-the-round method, cast-on
 * method, and an optional swatch gauge.
 *
 * Mirrors the crochet equivalent's UX shape so users moving between
 * the Studios feel at home. Skips wired the same way: skip leaves
 * projectSetup null and re-prompts on next open.
 */

import { useState } from 'react'
import { Check, X } from 'lucide-react'

import type {
  CastOnMethod,
  InTheRoundMethod,
  ProjectSetup,
} from './types'

interface YarnWeight {
  slug: string
  canonicalName: string
  standardCategory: number
}

interface Props {
  patternName: string
  suggestedYarnWeight: string | null
  suggestedNeedleMm: number | null
  patternGaugeText: string | null
  patternConstruction: 'FLAT' | 'IN_THE_ROUND' | null
  patternCastOn: CastOnMethod | null
  initial: ProjectSetup | null
  yarnWeights: YarnWeight[]
  onSave: (setup: ProjectSetup) => void
  onSkip: () => void
}

const CAST_ON_OPTIONS: Array<{ value: CastOnMethod; label: string }> = [
  { value: 'LONG_TAIL', label: 'Long-tail' },
  { value: 'CABLE', label: 'Cable cast-on' },
  { value: 'GERMAN_TWISTED', label: 'German twisted' },
  { value: 'PROVISIONAL', label: 'Provisional' },
  { value: 'ITALIAN_TUBULAR', label: 'Italian tubular' },
  { value: 'OLD_NORWEGIAN', label: 'Old Norwegian' },
  { value: 'BACKWARD_LOOP', label: 'Backward loop' },
  { value: 'JUDYS_MAGIC', label: "Judy's magic" },
  { value: 'KNITTED_ON', label: 'Knitted on' },
  { value: 'CROCHET_PROVISIONAL', label: 'Crochet provisional' },
]

const ROUND_METHOD_OPTIONS: Array<{ value: InTheRoundMethod; label: string }> = [
  { value: 'MAGIC_LOOP', label: 'Magic loop' },
  { value: 'TWO_CIRCULARS', label: 'Two circulars' },
  { value: 'DPN', label: 'DPNs' },
  { value: 'SHORT_CIRCULAR', label: 'Short circular' },
  { value: 'STRAIGHT_FLAT', label: 'Worked flat then seamed' },
]

export function KnittingProjectSetupCard({
  patternName,
  suggestedYarnWeight,
  suggestedNeedleMm,
  patternGaugeText,
  patternConstruction,
  patternCastOn,
  initial,
  yarnWeights,
  onSave,
  onSkip,
}: Props) {
  const [yarnLabel, setYarnLabel] = useState(initial?.yarn?.label ?? '')
  const [yarnWeightSlug, setYarnWeightSlug] = useState(initial?.yarn?.weightSlug ?? '')
  const [colourName, setColourName] = useState(initial?.yarn?.colourName ?? '')
  const [colourHex, setColourHex] = useState(initial?.yarn?.colourHex ?? '')
  const [skeins, setSkeins] = useState<string>(
    initial?.yarn?.skeins?.toString() ?? '',
  )
  const [needleMm, setNeedleMm] = useState<string>(
    initial?.needles?.mmSize?.toString() ?? (suggestedNeedleMm ? String(suggestedNeedleMm) : ''),
  )
  const [needleBrand, setNeedleBrand] = useState(initial?.needles?.brand ?? '')
  const [roundMethod, setRoundMethod] = useState<InTheRoundMethod | ''>(
    (initial?.needles?.inTheRoundMethod as InTheRoundMethod) ?? '',
  )
  const [castOn, setCastOn] = useState<CastOnMethod | ''>(
    initial?.castOn ?? patternCastOn ?? '',
  )
  const [swatchStitches, setSwatchStitches] = useState<string>(
    initial?.swatch?.stitchesPer10cm?.toString() ?? '',
  )
  const [swatchRows, setSwatchRows] = useState<string>(
    initial?.swatch?.rowsPer10cm?.toString() ?? '',
  )
  const [blocked, setBlocked] = useState(initial?.swatch?.blocked ?? false)
  const [showSwatch, setShowSwatch] = useState(Boolean(initial?.swatch))

  const isInTheRound = patternConstruction === 'IN_THE_ROUND'

  const save = () => {
    const setup: ProjectSetup = {}
    if (yarnLabel.trim()) {
      const skeinNum = Number(skeins)
      setup.yarn = {
        label: yarnLabel.trim(),
        weightSlug: yarnWeightSlug || undefined,
        colourName: colourName.trim() || undefined,
        colourHex: colourHex.trim() || undefined,
        skeins: Number.isFinite(skeinNum) && skeinNum > 0 ? skeinNum : undefined,
      }
    }
    const needleValue = Number(needleMm)
    if (Number.isFinite(needleValue) && needleValue > 0) {
      setup.needles = {
        mmSize: needleValue,
        brand: needleBrand.trim() || undefined,
        inTheRoundMethod: roundMethod || undefined,
      }
    }
    if (castOn) setup.castOn = castOn
    if (showSwatch) {
      const sts = Number(swatchStitches)
      const rows = Number(swatchRows)
      if (Number.isFinite(sts) || Number.isFinite(rows)) {
        setup.swatch = {
          stitchesPer10cm: Number.isFinite(sts) && sts > 0 ? sts : undefined,
          rowsPer10cm: Number.isFinite(rows) && rows > 0 ? rows : undefined,
          blocked,
        }
      }
    }
    onSave(setup)
  }

  return (
    <section className="knitting-studio-project-setup">
      <div className="knitting-studio-project-setup-card">
        <button
          type="button"
          className="knitting-studio-project-setup-close"
          onClick={onSkip}
          aria-label="Skip project setup"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <h2 className="knitting-studio-project-setup-heading">Tell me what you&apos;re using.</h2>
        <p className="knitting-studio-project-setup-lede">
          Future-you will thank present-you. {patternName} calls for a{' '}
          {suggestedYarnWeight ?? 'worsted'} yarn on{' '}
          {suggestedNeedleMm ? `${suggestedNeedleMm} mm` : '4 mm'} needles.
        </p>

        <div className="knitting-studio-project-setup-grid">
          <label className="knitting-studio-project-setup-field">
            <span>Yarn name</span>
            <input
              type="text"
              value={yarnLabel}
              onChange={(e) => setYarnLabel(e.target.value)}
              placeholder="Drops Karisma"
            />
          </label>

          <label className="knitting-studio-project-setup-field">
            <span>Yarn weight</span>
            <select
              value={yarnWeightSlug}
              onChange={(e) => setYarnWeightSlug(e.target.value)}
            >
              <option value="">—</option>
              {yarnWeights.map((w) => (
                <option key={w.slug} value={w.slug}>
                  {w.canonicalName}
                </option>
              ))}
            </select>
          </label>

          <label className="knitting-studio-project-setup-field">
            <span>Colour name</span>
            <input
              type="text"
              value={colourName}
              onChange={(e) => setColourName(e.target.value)}
              placeholder="Heather"
            />
          </label>

          <label className="knitting-studio-project-setup-field colour">
            <span>Colour pick</span>
            <input
              type="color"
              value={colourHex || '#6b8a9b'}
              onChange={(e) => setColourHex(e.target.value)}
            />
          </label>

          <label className="knitting-studio-project-setup-field">
            <span>Skeins</span>
            <input
              type="number"
              min="1"
              max="40"
              value={skeins}
              onChange={(e) => setSkeins(e.target.value)}
              placeholder="5"
            />
          </label>

          <label className="knitting-studio-project-setup-field">
            <span>Needle size (mm)</span>
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="25"
              value={needleMm}
              onChange={(e) => setNeedleMm(e.target.value)}
              placeholder="4"
            />
          </label>

          <label className="knitting-studio-project-setup-field">
            <span>Needle brand (optional)</span>
            <input
              type="text"
              value={needleBrand}
              onChange={(e) => setNeedleBrand(e.target.value)}
              placeholder="Knit Pro Symfonie"
            />
          </label>

          {isInTheRound && (
            <label className="knitting-studio-project-setup-field">
              <span>Working in the round</span>
              <select
                value={roundMethod}
                onChange={(e) => setRoundMethod(e.target.value as InTheRoundMethod)}
              >
                <option value="">—</option>
                {ROUND_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="knitting-studio-project-setup-field">
            <span>Cast-on method</span>
            <select
              value={castOn}
              onChange={(e) => setCastOn(e.target.value as CastOnMethod)}
            >
              <option value="">—</option>
              {CAST_ON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="knitting-studio-project-setup-swatch">
          <label className="knitting-studio-project-setup-swatch-toggle">
            <input
              type="checkbox"
              checked={showSwatch}
              onChange={(e) => setShowSwatch(e.target.checked)}
            />
            <span>I&apos;ve worked a swatch and want to log my gauge</span>
          </label>

          {showSwatch && (
            <div className="knitting-studio-project-setup-grid">
              <label className="knitting-studio-project-setup-field">
                <span>Stitches per 10 cm</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="60"
                  value={swatchStitches}
                  onChange={(e) => setSwatchStitches(e.target.value)}
                  placeholder="22"
                />
              </label>
              <label className="knitting-studio-project-setup-field">
                <span>Rows per 10 cm</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="60"
                  value={swatchRows}
                  onChange={(e) => setSwatchRows(e.target.value)}
                  placeholder="30"
                />
              </label>
              <label className="knitting-studio-project-setup-field full">
                <input
                  type="checkbox"
                  checked={blocked}
                  onChange={(e) => setBlocked(e.target.checked)}
                />
                <span style={{ marginLeft: '0.4rem' }}>Measured after blocking</span>
              </label>
              {patternGaugeText && (
                <p className="knitting-studio-project-setup-pattern-gauge">
                  <strong>Pattern says:</strong> {patternGaugeText}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="knitting-studio-project-setup-actions">
          <button
            type="button"
            className="knitting-studio-project-setup-primary"
            onClick={save}
            disabled={!yarnLabel.trim() && !needleMm}
          >
            <Check size={16} strokeWidth={1.8} />
            <span>Save and start knitting</span>
          </button>
          <button
            type="button"
            className="knitting-studio-project-setup-secondary"
            onClick={onSkip}
          >
            Skip for now
          </button>
        </div>
      </div>
    </section>
  )
}
