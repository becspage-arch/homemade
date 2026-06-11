'use client'

/**
 * Step 1 - confirm measurements. Pulls the locked field copy from the
 * shared /me/sewing-measurements editor so the help text reads the same
 * everywhere, and writes through PATCH /api/me/sewing-measurements so
 * the saved profile updates as the user fills in fields.
 *
 * Required fields (per the design's freesewing key list translated back
 * to Homemade fields) are flagged inline and gate the Continue button.
 * Optional fields sit under an "Advanced measurements" disclosure.
 */

import { useCallback, useMemo, useState } from 'react'

import type { MeasurementField } from '@/lib/sewing/measurements'

const CM_PER_INCH = 2.54

interface FieldSpec {
  field: MeasurementField
  label: string
  howToMeasure: string
}

const FIELD_LABEL: Record<MeasurementField, FieldSpec> = {
  bustChestCm: {
    field: 'bustChestCm',
    label: 'Bust or chest',
    howToMeasure:
      'Run the tape around the fullest part of your bust or chest, keeping it level under the arms.',
  },
  waistCm: {
    field: 'waistCm',
    label: 'Waist',
    howToMeasure:
      'Find the natural crease when you bend sideways. Measure around that line, not pulled tight.',
  },
  hipCm: {
    field: 'hipCm',
    label: 'Hip',
    howToMeasure:
      'Measure around the fullest part of your hips and seat, usually about 20 cm below the waist.',
  },
  bodyHeightCm: {
    field: 'bodyHeightCm',
    label: 'Body height',
    howToMeasure: 'Stand against a wall with bare feet. Measure from the floor to the top of your head.',
  },
  inseamCm: {
    field: 'inseamCm',
    label: 'Inseam',
    howToMeasure: 'Measure from the crotch seam down the inside of the leg to the floor.',
  },
  bustPointCm: {
    field: 'bustPointCm',
    label: 'Bust point to bust point',
    howToMeasure: 'Measure the straight distance between the apex of one bust and the other.',
  },
  backWaistLengthCm: {
    field: 'backWaistLengthCm',
    label: 'Back waist length',
    howToMeasure: 'From the bony bump at the base of your neck down to the natural waist.',
  },
  frontWaistLengthCm: {
    field: 'frontWaistLengthCm',
    label: 'Front waist length',
    howToMeasure: 'From the top of your shoulder, over the bust apex, to the natural waist.',
  },
  shoulderWidthCm: {
    field: 'shoulderWidthCm',
    label: 'Shoulder width',
    howToMeasure: 'Measure across the back from the outer point of one shoulder to the other.',
  },
  armLengthCm: {
    field: 'armLengthCm',
    label: 'Arm length',
    howToMeasure: 'Bend the elbow slightly. Measure from the outer shoulder, over the elbow, to the wrist bone.',
  },
  wristCircumferenceCm: {
    field: 'wristCircumferenceCm',
    label: 'Wrist',
    howToMeasure: 'Measure around the wrist bone with the tape sitting flat against the skin.',
  },
  thighCircumferenceCm: {
    field: 'thighCircumferenceCm',
    label: 'Thigh',
    howToMeasure: 'Measure around the fullest part of the thigh, just below the crotch.',
  },
  calfCircumferenceCm: {
    field: 'calfCircumferenceCm',
    label: 'Calf',
    howToMeasure: 'Measure around the fullest part of the calf, mid-way between knee and ankle.',
  },
  ankleCircumferenceCm: {
    field: 'ankleCircumferenceCm',
    label: 'Ankle',
    howToMeasure: 'Measure around the ankle just above the ankle bone.',
  },
  neckCircumferenceCm: {
    field: 'neckCircumferenceCm',
    label: 'Neck',
    howToMeasure: 'Measure around the base of the neck where a shirt collar would sit.',
  },
}

interface Props {
  measurements: Partial<Record<MeasurementField, number | null>>
  preference: 'cm' | 'inches'
  requiredFields: MeasurementField[]
  optionalFields: MeasurementField[]
  missingRequired: MeasurementField[]
  setMeasurements: (
    updater: (
      prev: Partial<Record<MeasurementField, number | null>>,
    ) => Partial<Record<MeasurementField, number | null>>,
  ) => void
  setPreference: (pref: 'cm' | 'inches') => void
  onContinue: () => void
  canContinue: boolean
}

export function MeasurementsConfirmStep({
  measurements,
  preference,
  requiredFields,
  optionalFields,
  missingRequired,
  setMeasurements,
  setPreference,
  onContinue,
  canContinue,
}: Props) {
  const [showOptional, setShowOptional] = useState<boolean>(
    () => optionalFields.length > 0 && optionalFields.some((f) => measurements[f] != null),
  )
  const [openHelp, setOpenHelp] = useState<MeasurementField | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const missingSet = useMemo(() => new Set(missingRequired), [missingRequired])

  const persistField = useCallback(
    async (field: MeasurementField, cm: number | null) => {
      setSaveStatus('saving')
      try {
        const res = await fetch('/api/me/sewing-measurements', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ [field]: cm }),
        })
        if (!res.ok) throw new Error('save failed')
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 1500)
      } catch {
        setSaveStatus('error')
      }
    },
    [],
  )

  const persistPreference = useCallback(async (next: 'cm' | 'inches') => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/me/sewing-measurements', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ measurementPreference: next }),
      })
      if (!res.ok) throw new Error('save failed')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    } catch {
      setSaveStatus('error')
    }
  }, [])

  const handleBlur = useCallback(
    (field: MeasurementField, raw: string) => {
      const trimmed = raw.trim()
      let cm: number | null = null
      if (trimmed !== '') {
        const num = Number(trimmed)
        if (Number.isFinite(num) && num > 0) {
          cm = preference === 'inches' ? num * CM_PER_INCH : num
          cm = Math.round(cm * 100) / 100
        }
      }
      setMeasurements((prev) => ({ ...prev, [field]: cm }))
      void persistField(field, cm)
    },
    [preference, persistField, setMeasurements],
  )

  const handlePreferenceChange = useCallback(
    (next: 'cm' | 'inches') => {
      setPreference(next)
      void persistPreference(next)
    },
    [persistPreference, setPreference],
  )

  function renderField(field: MeasurementField, isRequired: boolean) {
    const spec = FIELD_LABEL[field]
    const cmValue = measurements[field]
    const displayValue =
      cmValue == null
        ? ''
        : preference === 'inches'
          ? String(Math.round((cmValue / CM_PER_INCH) * 100) / 100)
          : String(cmValue)
    const isOpen = openHelp === field
    const missing = isRequired && missingSet.has(field)
    return (
      <div
        className={`sew-pers-field ${missing ? 'is-missing' : ''}`}
        key={field}
      >
        <div className="sew-pers-field-row">
          <label className="sew-pers-field-label" htmlFor={`sew-pers-${field}`}>
            {spec.label}
            {isRequired && <span className="sew-pers-field-required"> required</span>}
          </label>
          <button
            type="button"
            className="sew-pers-howto-toggle"
            onClick={() => setOpenHelp(isOpen ? null : field)}
            aria-expanded={isOpen}
          >
            How to measure
          </button>
        </div>
        <div className="sew-pers-field-input-row">
          <input
            id={`sew-pers-${field}`}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max={preference === 'inches' ? '120' : '300'}
            defaultValue={displayValue}
            onBlur={(e) => handleBlur(field, e.target.value)}
          />
          <span className="sew-pers-field-unit">
            {preference === 'inches' ? 'in' : 'cm'}
          </span>
        </div>
        {isOpen && <p className="sew-pers-howto-body">{spec.howToMeasure}</p>}
      </div>
    )
  }

  return (
    <section className="sew-pers-step-body">
      <h2 className="sew-pers-step-heading">Confirm your measurements</h2>
      <p className="sew-pers-step-sub">
        We save these to your profile so you only enter them once. Edit any
        field to update it across the site.
      </p>

      <div className="sew-pers-toolbar">
        <div className="sew-pers-pref">
          <span className="sew-pers-pref-label">Show in</span>
          <div className="sew-pers-pref-toggle" role="group" aria-label="Measurement unit">
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
        <div className="sew-pers-save" aria-live="polite">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Could not save. Try again.'}
        </div>
      </div>

      <div className="sew-pers-fields">
        {requiredFields.map((f) => renderField(f, true))}
      </div>

      {optionalFields.length > 0 && (
        <>
          <button
            type="button"
            className="sew-pers-advanced-toggle"
            onClick={() => setShowOptional((v) => !v)}
            aria-expanded={showOptional}
          >
            {showOptional
              ? 'Hide advanced measurements'
              : 'Advanced measurements (optional)'}
          </button>
          {showOptional && (
            <div className="sew-pers-fields">
              {optionalFields.map((f) => renderField(f, false))}
            </div>
          )}
        </>
      )}

      {missingRequired.length > 0 && (
        <div className="sew-pers-required-notice">
          Fill in every required measurement to continue.
        </div>
      )}

      <div className="sew-pers-step-actions">
        <button
          type="button"
          className="sew-pers-card-cta primary"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Save and continue
        </button>
      </div>
    </section>
  )
}
