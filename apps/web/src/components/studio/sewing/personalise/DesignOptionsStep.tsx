'use client'

/**
 * Step 2 - pick design options. Reads the design's options metadata from
 * the registry and renders the right control per option type:
 *
 *   pct  -> slider (stored as 0..1, displayed as %)
 *   mm   -> slider (stored and displayed as mm)
 *   bool -> toggle
 *   enum -> dropdown
 *
 * Live preview: every change debounces (300 ms) into POST /api/studio/sewing/draft
 * with the current measurements + options, and renders the returned SVG
 * inline. Cache hits are sub-100 ms; misses run the freesewing engine.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import type { MeasurementField } from '@/lib/sewing/measurements'
import type { SewingDesignSummary } from './types'
import { FreesewingPatternViewer } from '@/components/studio/sewing/FreesewingPatternViewer'
import { captureClientEvent } from '@/lib/client-analytics'

interface Props {
  design: SewingDesignSummary
  measurements: Partial<Record<MeasurementField, number | null>>
  options: Record<string, number | string | boolean>
  setOptions: (
    updater: (
      prev: Record<string, number | string | boolean>,
    ) => Record<string, number | string | boolean>,
  ) => void
  onBack: () => void
  onContinue: () => void
}

const PREVIEW_DEBOUNCE_MS = 300

export function DesignOptionsStep({
  design,
  measurements,
  options,
  setOptions,
  onBack,
  onContinue,
}: Props) {
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [previewAttribution, setPreviewAttribution] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const requestSeqRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runPreview = useCallback(async () => {
    setLoading(true)
    setError(null)
    const seq = ++requestSeqRef.current
    try {
      const res = await fetch('/api/studio/sewing/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          designSlug: design.slug,
          measurements,
          options: { designOptions: options },
          calibrationMode: 'BROWSE',
        }),
      })
      if (seq !== requestSeqRef.current) return
      if (!res.ok) {
        setError('Preview failed. Try changing an option.')
        return
      }
      const data = (await res.json()) as {
        svg: string
        attribution: string | null
      }
      setPreviewSvg(data.svg)
      setPreviewAttribution(data.attribution)
    } catch {
      if (seq === requestSeqRef.current) setError('Preview failed.')
    } finally {
      if (seq === requestSeqRef.current) setLoading(false)
    }
  }, [design.slug, measurements, options])

  // Debounced preview on options / measurements change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void runPreview()
    }, PREVIEW_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [runPreview])

  const handleReset = useCallback(() => {
    const defaults: Record<string, number | string | boolean> = {}
    for (const [name, meta] of Object.entries(design.options)) {
      if (meta.type === 'pct') {
        defaults[name] = Number((meta.default / 100).toFixed(4))
      } else if (meta.type === 'mm') {
        defaults[name] = meta.default
      } else if (meta.type === 'bool') {
        defaults[name] = meta.default
      } else {
        defaults[name] = meta.default
      }
    }
    setOptions(() => defaults)
  }, [design.options, setOptions])

  if (Object.keys(design.options).length === 0) {
    return (
      <section className="sew-pers-step-body">
        <h2 className="sew-pers-step-heading">Choose your options</h2>
        <p className="sew-pers-step-sub">
          This design has no options to adjust. Continue to the preview.
        </p>
        <div className="sew-pers-step-actions">
          <button
            type="button"
            className="sew-pers-card-cta"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="sew-pers-card-cta primary"
            onClick={onContinue}
          >
            Continue to preview
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="sew-pers-step-body sew-pers-step-options">
      <h2 className="sew-pers-step-heading">Choose your options</h2>
      <p className="sew-pers-step-sub">
        Adjust how the design fits. The preview updates as you change values.
      </p>

      <div className="sew-pers-options-layout">
        <div className="sew-pers-options-controls">
          {Object.entries(design.options).map(([name, meta]) => (
            <OptionControl
              key={name}
              name={name}
              meta={meta}
              value={options[name]}
              onChange={(v) => {
                captureClientEvent('sewing_options_changed', {
                  designSlug: design.slug,
                  option_name: name,
                  option_value: typeof v === 'number' ? v : String(v),
                })
                setOptions((prev) => ({ ...prev, [name]: v }))
              }}
            />
          ))}
          <button
            type="button"
            className="sew-pers-options-reset"
            onClick={handleReset}
          >
            Reset to defaults
          </button>
        </div>

        <div className="sew-pers-options-preview">
          {loading && !previewSvg && (
            <div className="sew-pers-options-preview-loading">Drafting…</div>
          )}
          {error && (
            <div className="sew-pers-options-preview-error">{error}</div>
          )}
          {previewSvg && (
            <FreesewingPatternViewer
              svg={previewSvg}
              patternName={design.name}
              attribution={previewAttribution}
            />
          )}
        </div>
      </div>

      <div className="sew-pers-step-actions">
        <button type="button" className="sew-pers-card-cta" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="sew-pers-card-cta primary"
          onClick={onContinue}
        >
          Continue to preview
        </button>
      </div>
    </section>
  )
}

interface OptionControlProps {
  name: string
  meta: SewingDesignSummary['options'][string]
  value: number | string | boolean | undefined
  onChange: (v: number | string | boolean) => void
}

function OptionControl({ name, meta, value, onChange }: OptionControlProps) {
  if (meta.type === 'pct') {
    const numericValue =
      typeof value === 'number' ? value : meta.default / 100
    const displayPct = Math.round(numericValue * 1000) / 10
    return (
      <div className="sew-pers-option">
        <label className="sew-pers-option-label" htmlFor={`opt-${name}`}>
          {meta.label}
          <span className="sew-pers-option-readout">{displayPct}%</span>
        </label>
        {meta.description && (
          <p className="sew-pers-option-description">{meta.description}</p>
        )}
        <input
          id={`opt-${name}`}
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step ?? 0.5}
          value={Math.round(numericValue * 1000) / 10}
          onChange={(e) =>
            onChange(Math.round((Number(e.target.value) / 100) * 10000) / 10000)
          }
        />
      </div>
    )
  }
  if (meta.type === 'mm') {
    const numericValue = typeof value === 'number' ? value : meta.default
    return (
      <div className="sew-pers-option">
        <label className="sew-pers-option-label" htmlFor={`opt-${name}`}>
          {meta.label}
          <span className="sew-pers-option-readout">{numericValue} mm</span>
        </label>
        {meta.description && (
          <p className="sew-pers-option-description">{meta.description}</p>
        )}
        <input
          id={`opt-${name}`}
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step ?? 1}
          value={numericValue}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    )
  }
  if (meta.type === 'bool') {
    const boolValue = typeof value === 'boolean' ? value : meta.default
    return (
      <div className="sew-pers-option">
        <label className="sew-pers-option-label sew-pers-option-toggle">
          <input
            type="checkbox"
            checked={boolValue}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{meta.label}</span>
        </label>
        {meta.description && (
          <p className="sew-pers-option-description">{meta.description}</p>
        )}
      </div>
    )
  }
  // enum
  const strValue = typeof value === 'string' ? value : meta.default
  return (
    <div className="sew-pers-option">
      <label className="sew-pers-option-label" htmlFor={`opt-${name}`}>
        {meta.label}
      </label>
      {meta.description && (
        <p className="sew-pers-option-description">{meta.description}</p>
      )}
      <select
        id={`opt-${name}`}
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {meta.values.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  )
}
