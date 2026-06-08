'use client'

/**
 * CrochetProjectSetupCard — first-open prompt asking what the maker
 * is using on this project. Captures yarn, hook, and (optional)
 * swatch gauge.
 *
 * Surfaces above the active project surface ONCE per project — when
 * progress.projectSetup is null and no rows are marked yet. The maker
 * can skip it from the close button; skipping leaves projectSetup
 * null and the card re-prompts the next time the project opens (a
 * teacher would re-ask).
 *
 * Once saved, the active surface re-renders with the project setup
 * visible in the footer ("Working in {yarn} on a {hook} hook").
 */

import { useState } from 'react'
import { Check, X } from 'lucide-react'

import type { ProjectSetup } from './types'

interface Props {
  patternName: string
  suggestedYarnWeight: string | null
  suggestedHookMm: number | null
  patternGaugeText: string | null
  initial: ProjectSetup | null
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  onSave: (setup: ProjectSetup) => void
  onSkip: () => void
}

export function CrochetProjectSetupCard({
  patternName,
  suggestedYarnWeight,
  suggestedHookMm,
  patternGaugeText,
  initial,
  yarnWeights,
  onSave,
  onSkip,
}: Props) {
  const [yarnLabel, setYarnLabel] = useState(initial?.yarn?.label ?? '')
  const [yarnWeightSlug, setYarnWeightSlug] = useState(initial?.yarn?.weightSlug ?? '')
  const [colourName, setColourName] = useState(initial?.yarn?.colourName ?? '')
  const [colourHex, setColourHex] = useState(initial?.yarn?.colourHex ?? '')
  const [hookMm, setHookMm] = useState<string>(
    initial?.hook?.mmSize?.toString() ?? (suggestedHookMm ? String(suggestedHookMm) : ''),
  )
  const [hookBrand, setHookBrand] = useState(initial?.hook?.brand ?? '')
  const [swatchStitches, setSwatchStitches] = useState<string>(
    initial?.swatch?.stitchesPer10cm?.toString() ?? '',
  )
  const [swatchRows, setSwatchRows] = useState<string>(
    initial?.swatch?.rowsPer10cm?.toString() ?? '',
  )
  const [blocked, setBlocked] = useState(initial?.swatch?.blocked ?? false)
  const [showSwatch, setShowSwatch] = useState(Boolean(initial?.swatch))

  const save = () => {
    const setup: ProjectSetup = {}
    if (yarnLabel.trim()) {
      setup.yarn = {
        label: yarnLabel.trim(),
        weightSlug: yarnWeightSlug || undefined,
        colourName: colourName.trim() || undefined,
        colourHex: colourHex.trim() || undefined,
      }
    }
    const hookValue = Number(hookMm)
    if (Number.isFinite(hookValue) && hookValue > 0) {
      setup.hook = {
        mmSize: hookValue,
        brand: hookBrand.trim() || undefined,
      }
    }
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
    <section className="crochet-studio-project-setup">
      <div className="crochet-studio-project-setup-card">
        <button
          type="button"
          className="crochet-studio-project-setup-close"
          onClick={onSkip}
          aria-label="Skip project setup"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <h2 className="crochet-studio-project-setup-heading">Tell me what you&apos;re using.</h2>
        <p className="crochet-studio-project-setup-lede">
          Future-you will thank present-you for jotting this down. {patternName} calls for a{' '}
          {suggestedYarnWeight ?? 'DK'} yarn on a {suggestedHookMm ? `${suggestedHookMm} mm` : '4 mm'}{' '}
          hook.
        </p>

        <div className="crochet-studio-project-setup-grid">
          <label className="crochet-studio-project-setup-field">
            <span>Yarn name</span>
            <input
              type="text"
              value={yarnLabel}
              onChange={(e) => setYarnLabel(e.target.value)}
              placeholder="Stylecraft Special DK"
            />
          </label>

          <label className="crochet-studio-project-setup-field">
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

          <label className="crochet-studio-project-setup-field">
            <span>Colour name</span>
            <input
              type="text"
              value={colourName}
              onChange={(e) => setColourName(e.target.value)}
              placeholder="Sage"
            />
          </label>

          <label className="crochet-studio-project-setup-field crochet-studio-project-setup-colour">
            <span>Colour pick</span>
            <input
              type="color"
              value={colourHex || '#9CAF88'}
              onChange={(e) => setColourHex(e.target.value)}
            />
          </label>

          <label className="crochet-studio-project-setup-field">
            <span>Hook size (mm)</span>
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="25"
              value={hookMm}
              onChange={(e) => setHookMm(e.target.value)}
              placeholder="4"
            />
          </label>

          <label className="crochet-studio-project-setup-field">
            <span>Hook brand (optional)</span>
            <input
              type="text"
              value={hookBrand}
              onChange={(e) => setHookBrand(e.target.value)}
              placeholder="Tulip Etimo"
            />
          </label>
        </div>

        <div className="crochet-studio-project-setup-swatch">
          <label className="crochet-studio-project-setup-swatch-toggle">
            <input
              type="checkbox"
              checked={showSwatch}
              onChange={(e) => setShowSwatch(e.target.checked)}
            />
            <span>I&apos;ve worked a swatch and want to log my gauge</span>
          </label>

          {showSwatch && (
            <div className="crochet-studio-project-setup-grid">
              <label className="crochet-studio-project-setup-field">
                <span>Stitches per 10 cm</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="60"
                  value={swatchStitches}
                  onChange={(e) => setSwatchStitches(e.target.value)}
                  placeholder="18"
                />
              </label>
              <label className="crochet-studio-project-setup-field">
                <span>Rows per 10 cm</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="60"
                  value={swatchRows}
                  onChange={(e) => setSwatchRows(e.target.value)}
                  placeholder="10"
                />
              </label>
              <label className="crochet-studio-project-setup-field full crochet-studio-project-setup-blocked">
                <input
                  type="checkbox"
                  checked={blocked}
                  onChange={(e) => setBlocked(e.target.checked)}
                />
                <span>Measured after blocking</span>
              </label>
              {patternGaugeText && (
                <p className="crochet-studio-project-setup-pattern-gauge">
                  <strong>Pattern says:</strong> {patternGaugeText}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="crochet-studio-project-setup-actions">
          <button
            type="button"
            className="crochet-studio-project-setup-primary"
            onClick={save}
            disabled={!yarnLabel.trim() && !hookMm}
          >
            <Check size={16} strokeWidth={1.8} />
            <span>Save and start crocheting</span>
          </button>
          <button
            type="button"
            className="crochet-studio-project-setup-secondary"
            onClick={onSkip}
          >
            Skip for now
          </button>
        </div>
      </div>
    </section>
  )
}
