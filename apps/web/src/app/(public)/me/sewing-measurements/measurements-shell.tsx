'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_FIELDS, ADVANCED_FIELDS, type MeasurementField } from '@/lib/sewing/measurements'
import type { Measurements } from './page'

interface FieldSpec {
  field: MeasurementField
  label: string
  howToMeasure: string
}

const DEFAULT_SPECS: FieldSpec[] = [
  {
    field: 'bustChestCm',
    label: 'Bust or chest',
    howToMeasure: 'Run the tape around the fullest part of your bust or chest, keeping it level under the arms.',
  },
  {
    field: 'waistCm',
    label: 'Waist',
    howToMeasure: 'Find the natural crease when you bend sideways. Measure around that line, not pulled tight.',
  },
  {
    field: 'hipCm',
    label: 'Hip',
    howToMeasure: 'Measure around the fullest part of your hips and seat, usually about 20 cm below the waist.',
  },
  {
    field: 'bodyHeightCm',
    label: 'Body height',
    howToMeasure: 'Stand against a wall with bare feet. Measure from the floor to the top of your head.',
  },
  {
    field: 'inseamCm',
    label: 'Inseam',
    howToMeasure: 'Measure from the crotch seam down the inside of the leg to the floor.',
  },
]

const ADVANCED_SPECS: FieldSpec[] = [
  {
    field: 'bustPointCm',
    label: 'Bust point to bust point',
    howToMeasure: 'Measure the straight distance between the apex of one bust and the other.',
  },
  {
    field: 'backWaistLengthCm',
    label: 'Back waist length',
    howToMeasure: 'Measure from the bony bump at the base of your neck down to the natural waist.',
  },
  {
    field: 'frontWaistLengthCm',
    label: 'Front waist length',
    howToMeasure: 'Measure from the top of your shoulder, over the bust apex, to the natural waist.',
  },
  {
    field: 'shoulderWidthCm',
    label: 'Shoulder width',
    howToMeasure: 'Measure across the back from the outer point of one shoulder to the other.',
  },
  {
    field: 'armLengthCm',
    label: 'Arm length',
    howToMeasure: 'Bend the elbow slightly. Measure from the outer shoulder, over the elbow, to the wrist bone.',
  },
  {
    field: 'wristCircumferenceCm',
    label: 'Wrist',
    howToMeasure: 'Measure around the wrist bone with the tape sitting flat against the skin.',
  },
  {
    field: 'thighCircumferenceCm',
    label: 'Thigh',
    howToMeasure: 'Measure around the fullest part of the thigh, just below the crotch.',
  },
  {
    field: 'calfCircumferenceCm',
    label: 'Calf',
    howToMeasure: 'Measure around the fullest part of the calf, mid-way between knee and ankle.',
  },
  {
    field: 'ankleCircumferenceCm',
    label: 'Ankle',
    howToMeasure: 'Measure around the ankle just above the ankle bone.',
  },
  {
    field: 'neckCircumferenceCm',
    label: 'Neck',
    howToMeasure: 'Measure around the base of the neck where a shirt collar would sit.',
  },
]

const CM_PER_INCH = 2.54

function formatInches(cm: number | null | undefined): string {
  if (cm == null || !Number.isFinite(cm)) return ''
  const inches = cm / CM_PER_INCH
  return `${Math.round(inches * 10) / 10}"`
}

interface Props {
  initial: Measurements
  preference: 'cm' | 'inches'
  lastUpdatedAt: string | null
}

export function MeasurementsShell({ initial, preference: initialPref, lastUpdatedAt: initialUpdatedAt }: Props) {
  const [values, setValues] = useState<Measurements>(initial)
  const [preference, setPreference] = useState<'cm' | 'inches'>(initialPref)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(() =>
    ADVANCED_FIELDS.some((f) => initial[f] != null),
  )
  const [openHelp, setOpenHelp] = useState<MeasurementField | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(initialUpdatedAt)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current)
  }, [])

  const savedAgo = useMemo(() => {
    if (!lastUpdatedAt) return null
    return `Saved ${new Date(lastUpdatedAt).toLocaleString()}`
  }, [lastUpdatedAt])

  async function persist(patch: Record<string, unknown>) {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/me/sewing-measurements', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('save failed')
      const data = await res.json()
      if (data?.measurements?.lastUpdatedAt) {
        setLastUpdatedAt(data.measurements.lastUpdatedAt)
      } else {
        setLastUpdatedAt(new Date().toISOString())
      }
      setSaveStatus('saved')
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
    }
  }

  function handleBlur(field: MeasurementField, raw: string) {
    const trimmed = raw.trim()
    let cm: number | null = null
    if (trimmed !== '') {
      const num = Number(trimmed)
      if (Number.isFinite(num) && num > 0) {
        cm = preference === 'inches' ? num * CM_PER_INCH : num
        cm = Math.round(cm * 100) / 100
      }
    }
    setValues((prev) => ({ ...prev, [field]: cm }))
    void persist({ [field]: cm })
  }

  function handlePreferenceChange(next: 'cm' | 'inches') {
    setPreference(next)
    void persist({ measurementPreference: next })
  }

  function handleNotesBlur(text: string) {
    const trimmed = text.trim()
    setValues((prev) => ({ ...prev, notes: trimmed || null }))
    void persist({ notes: trimmed || null })
  }

  function renderField(spec: FieldSpec) {
    const cmValue = values[spec.field]
    const displayValue =
      cmValue == null
        ? ''
        : preference === 'inches'
          ? String(Math.round((cmValue / CM_PER_INCH) * 100) / 100)
          : String(cmValue)
    const partner =
      cmValue == null
        ? ''
        : preference === 'inches'
          ? `${cmValue} cm`
          : formatInches(cmValue)
    const isOpen = openHelp === spec.field

    return (
      <div className="sm-field" key={spec.field}>
        <div className="sm-field-row">
          <label className="sm-field-label" htmlFor={`sm-${spec.field}`}>
            {spec.label}
          </label>
          <button
            type="button"
            className="sm-howto-toggle"
            onClick={() => setOpenHelp(isOpen ? null : spec.field)}
            aria-expanded={isOpen}
          >
            How to measure
          </button>
        </div>
        <div className="sm-field-inputs">
          <div className="sm-field-input-wrap">
            <input
              id={`sm-${spec.field}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max={preference === 'inches' ? '120' : '300'}
              defaultValue={displayValue}
              onBlur={(e) => handleBlur(spec.field, e.target.value)}
            />
            <span className="sm-field-unit">{preference === 'inches' ? 'in' : 'cm'}</span>
          </div>
          {partner && <span className="sm-field-partner">{partner}</span>}
        </div>
        {isOpen && (
          <p className="sm-howto-body">{spec.howToMeasure}</p>
        )}
      </div>
    )
  }

  return (
    <div className="sm-page">
      <header className="sm-header">
        <p className="sm-overline">Sewing</p>
        <h1 className="sm-heading">Your sewing measurements</h1>
        <p className="sm-lede">
          Saved measurements help us auto-fill the right size when you start a sewing project. Update
          these whenever your shape changes.
        </p>
      </header>

      <div className="sm-toolbar">
        <div className="sm-pref">
          <span className="sm-pref-label">Show in</span>
          <div className="sm-pref-toggle" role="group" aria-label="Measurement unit">
            <button
              type="button"
              className={preference === 'cm' ? 'active' : ''}
              onClick={() => handlePreferenceChange('cm')}
            >
              cm
            </button>
            <button
              type="button"
              className={preference === 'inches' ? 'active' : ''}
              onClick={() => handlePreferenceChange('inches')}
            >
              inches
            </button>
          </div>
        </div>
        <div className="sm-save-indicator" aria-live="polite">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && (savedAgo ?? 'Saved')}
          {saveStatus === 'error' && 'Could not save. Try again.'}
          {saveStatus === 'idle' && savedAgo && <span className="sm-save-muted">{savedAgo}</span>}
        </div>
      </div>

      <section className="sm-section">
        <h2 className="sm-section-heading">The basics</h2>
        <p className="sm-section-sub">
          Five measurements cover most patterns. Fill in what you know; leave the rest blank.
        </p>
        <div className="sm-fields">
          {DEFAULT_SPECS.map(renderField)}
        </div>
      </section>

      <div className="sm-advanced-toggle">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? 'Hide advanced measurements' : 'Show advanced measurements'}
        </button>
      </div>

      {showAdvanced && (
        <section className="sm-section">
          <h2 className="sm-section-heading">Advanced</h2>
          <p className="sm-section-sub">
            For fitted patterns. Most projects only need a few of these.
          </p>
          <div className="sm-fields">
            {ADVANCED_SPECS.map(renderField)}
          </div>
        </section>
      )}

      <section className="sm-section">
        <h2 className="sm-section-heading">Notes</h2>
        <textarea
          className="sm-notes"
          rows={4}
          defaultValue={values.notes ?? ''}
          placeholder="Anything else worth remembering, like recent changes, long torso, narrow shoulders."
          onBlur={(e) => handleNotesBlur(e.target.value)}
        />
      </section>
    </div>
  )
}

// Re-export to keep tree-shaking happy. Used by /me/sewing-plans/[id].
export { ALL_FIELDS }
