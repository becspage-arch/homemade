'use client'

/**
 * CreditCardCalibration - the on-screen calibration path. Displays a
 * 53.98mm × 85.60mm card outline and asks the user to hold an actual
 * credit card up to the screen. A slider scales the outline until it
 * matches; the scale factor is persisted in localStorage per device so
 * the rest of the Studio renders at true scale.
 *
 * localStorage key: `sewing-studio:card-scale` → number (1.0 = default,
 * 0.5-1.5 sensible range). Browse-only mode reads this on mount.
 *
 * Calibration path #2 from the locked sewing decisions.
 */

import { useState } from 'react'

const STORAGE_KEY = 'sewing-studio:card-scale'
const DEFAULT_SCALE = 1
const MIN_SCALE = 0.5
const MAX_SCALE = 1.5

interface CreditCardCalibrationProps {
  onConfirm?: (scale: number) => void
}

export function CreditCardCalibration({ onConfirm }: CreditCardCalibrationProps) {
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_SCALE
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return DEFAULT_SCALE
      const n = Number(raw)
      if (Number.isFinite(n) && n >= MIN_SCALE && n <= MAX_SCALE) return n
    } catch {
      // ignore
    }
    return DEFAULT_SCALE
  })
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(scale))
    } catch {
      // ignore
    }
    setSavedAt(Date.now())
    onConfirm?.(scale)
  }

  return (
    <div className="sew-card-calibration">
      <p className="sew-card-calibration-prompt">
        Hold an actual credit card up to the screen. Does this card outline match
        your card? If not, drag the slider until the outline is the right size,
        then save the calibration.
      </p>

      <div className="sew-card-calibration-card-area">
        <div
          className="sew-card-calibration-card"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          85.60 × 53.98 mm
        </div>
      </div>

      <div className="sew-card-calibration-controls">
        <input
          type="range"
          className="sew-card-calibration-slider"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={0.005}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          aria-label="Calibration scale"
        />
        <div className="sew-card-calibration-readout">
          Scale: {scale.toFixed(3)} × default
        </div>
        <button
          type="button"
          className="sew-card-calibration-confirm"
          onClick={confirm}
        >
          Save calibration
        </button>
        {savedAt && (
          <div
            className="sew-card-calibration-readout"
            style={{ color: 'var(--sew-accent-strong)' }}
          >
            Saved. The Studio will use this scale on this device.
          </div>
        )}
      </div>
    </div>
  )
}
