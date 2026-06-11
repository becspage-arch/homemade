'use client'

/**
 * Left-panel option controls for the hack composer. Mirrors the S-5d
 * personalisation OptionControl shapes (pct slider, mm slider, bool
 * toggle, enum dropdown) so the visual + slider paths produce identical
 * freesewing requests.
 */

import type { SewingDesignOptionMeta } from '@/lib/sewing/grading/types'
import type { HackComposerDesign } from './types'

interface Props {
  design: HackComposerDesign
  options: Record<string, number | string | boolean>
  onChange: (key: string, value: number | string | boolean) => void
}

export function HackOptionsPanel({ design, options, onChange }: Props) {
  if (Object.keys(design.options).length === 0) {
    return (
      <p className="sew-hack-tools-empty">
        This design has no options to hack yet.
      </p>
    )
  }
  return (
    <div className="sew-hack-tools-list">
      {Object.entries(design.options).map(([name, meta]) => (
        <OptionControl
          key={name}
          name={name}
          meta={meta}
          value={options[name]}
          onChange={(v) => onChange(name, v)}
        />
      ))}
    </div>
  )
}

interface OptionControlProps {
  name: string
  meta: SewingDesignOptionMeta
  value: number | string | boolean | undefined
  onChange: (v: number | string | boolean) => void
}

function OptionControl({ name, meta, value, onChange }: OptionControlProps) {
  if (meta.type === 'pct') {
    const numericValue = typeof value === 'number' ? value : meta.default / 100
    const displayPct = Math.round(numericValue * 1000) / 10
    return (
      <div className="sew-hack-option">
        <label className="sew-hack-option-label" htmlFor={`hack-opt-${name}`}>
          {meta.label}
          <span className="sew-hack-option-readout">{displayPct}%</span>
        </label>
        {meta.description ? (
          <p className="sew-hack-option-description">{meta.description}</p>
        ) : null}
        <input
          id={`hack-opt-${name}`}
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
      <div className="sew-hack-option">
        <label className="sew-hack-option-label" htmlFor={`hack-opt-${name}`}>
          {meta.label}
          <span className="sew-hack-option-readout">{numericValue} mm</span>
        </label>
        {meta.description ? (
          <p className="sew-hack-option-description">{meta.description}</p>
        ) : null}
        <input
          id={`hack-opt-${name}`}
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
      <div className="sew-hack-option">
        <label className="sew-hack-option-label sew-hack-option-toggle">
          <input
            type="checkbox"
            checked={boolValue}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{meta.label}</span>
        </label>
        {meta.description ? (
          <p className="sew-hack-option-description">{meta.description}</p>
        ) : null}
      </div>
    )
  }
  // enum
  const strValue = typeof value === 'string' ? value : meta.default
  return (
    <div className="sew-hack-option">
      <label className="sew-hack-option-label" htmlFor={`hack-opt-${name}`}>
        {meta.label}
      </label>
      {meta.description ? (
        <p className="sew-hack-option-description">{meta.description}</p>
      ) : null}
      <select
        id={`hack-opt-${name}`}
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
