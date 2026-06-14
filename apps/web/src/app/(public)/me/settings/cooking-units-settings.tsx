'use client'

import { useState, useTransition } from 'react'

type Oven = 'FAN_C' | 'CONVENTIONAL_C' | 'FAHRENHEIT' | 'GAS_MARK'
type Weight = 'METRIC' | 'IMPERIAL'
type Volume = 'METRIC' | 'IMPERIAL_UK' | 'IMPERIAL_US'

interface CookingUnitsSettingsProps {
  initialOven: Oven | null
  initialWeight: Weight | null
  initialVolume: Volume | null
}

const DEFAULT = '__default__'

const OVEN_OPTIONS: Array<{ value: Oven; label: string }> = [
  { value: 'FAN_C', label: 'Fan °C' },
  { value: 'CONVENTIONAL_C', label: 'Conventional °C' },
  { value: 'FAHRENHEIT', label: 'Fahrenheit' },
  { value: 'GAS_MARK', label: 'Gas mark' },
]
const WEIGHT_OPTIONS: Array<{ value: Weight; label: string }> = [
  { value: 'METRIC', label: 'Grams' },
  { value: 'IMPERIAL', label: 'Ounces / pounds' },
]
const VOLUME_OPTIONS: Array<{ value: Volume; label: string }> = [
  { value: 'METRIC', label: 'Millilitres' },
  { value: 'IMPERIAL_UK', label: 'UK cups' },
  { value: 'IMPERIAL_US', label: 'US cups' },
]

/**
 * Settings for how recipe amounts and oven temperatures display. Canonical
 * storage stays conventional °C + grams + ml; these only switch the rendered
 * unit. "My region's default" clears the field back to the locale guess.
 */
export function CookingUnitsSettings({
  initialOven,
  initialWeight,
  initialVolume,
}: CookingUnitsSettingsProps) {
  const [oven, setOven] = useState<Oven | null>(initialOven)
  const [weight, setWeight] = useState<Weight | null>(initialWeight)
  const [volume, setVolume] = useState<Volume | null>(initialVolume)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [, startSave] = useTransition()

  function save(patch: Record<string, string | null>) {
    setStatus('saving')
    startSave(async () => {
      try {
        const res = await fetch('/api/me/preferences/cooking-units', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        setStatus(res.ok ? 'saved' : 'error')
      } catch {
        setStatus('error')
      }
    })
  }

  return (
    <div className="me-form" style={{ marginTop: 8 }}>
      <UnitField
        id="cooking-oven"
        label="Oven temperature"
        value={oven ?? DEFAULT}
        options={OVEN_OPTIONS}
        onChange={(v) => {
          const next = v === DEFAULT ? null : (v as Oven)
          setOven(next)
          save({ ovenPreference: next })
        }}
      />
      <UnitField
        id="cooking-weight"
        label="Weights"
        value={weight ?? DEFAULT}
        options={WEIGHT_OPTIONS}
        onChange={(v) => {
          const next = v === DEFAULT ? null : (v as Weight)
          setWeight(next)
          save({ weightPreference: next })
        }}
      />
      <UnitField
        id="cooking-volume"
        label="Volumes"
        value={volume ?? DEFAULT}
        options={VOLUME_OPTIONS}
        onChange={(v) => {
          const next = v === DEFAULT ? null : (v as Volume)
          setVolume(next)
          save({ volumePreference: next })
        }}
      />
      <p className="me-feedback">
        {status === 'saving' && 'saving…'}
        {status === 'saved' && 'saved.'}
        {status === 'error' && <span className="error">could not save, try again.</span>}
      </p>
    </div>
  )
}

function UnitField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div className="me-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value={DEFAULT}>My region&apos;s default</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
