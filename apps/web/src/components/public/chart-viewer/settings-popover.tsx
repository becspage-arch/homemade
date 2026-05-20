'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_PREFS,
  type ChartViewerPrefs,
} from './use-viewer-prefs'

interface SettingsPopoverProps {
  prefs: Required<ChartViewerPrefs>
  onChange: (patch: ChartViewerPrefs) => void
}

const COLOR_PRESETS: { label: string; value: string }[] = [
  { label: 'Charcoal (default)', value: '#302a24' },
  { label: 'Slate', value: '#3d4a52' },
  { label: 'Dusty blue', value: '#4a6577' },
  { label: 'Plum', value: '#553344' },
  { label: 'Olive', value: '#525d3a' },
  { label: 'Soft red', value: '#7d3a3a' },
  { label: 'Black', value: '#000000' },
]

/**
 * Toolbar settings popover. Exposes the chart-viewer's Tier-A
 * customisations: grid colour, grid weight, centre-line visibility.
 *
 * The settings persist via /api/me/preferences/chart-viewer and apply
 * to every chart the user views. Reset button restores the built-in
 * defaults.
 */
export function SettingsPopover({ prefs, onChange }: SettingsPopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent): void {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <div className="chart-settings" ref={ref}>
      <button
        type="button"
        className="chart-viewer-shell__button"
        aria-expanded={open}
        aria-label="Chart settings"
        title="Chart settings"
        onClick={() => setOpen((o) => !o)}
      >
        ⚙
      </button>
      {open ? (
        <div className="chart-settings__panel" role="dialog" aria-label="Chart settings">
          <div className="chart-settings__row">
            <label className="chart-settings__label">Grid colour</label>
            <div className="chart-settings__color-grid">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={[
                    'chart-settings__swatch',
                    prefs.gridColor === preset.value ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ background: preset.value }}
                  aria-label={preset.label}
                  title={preset.label}
                  aria-pressed={prefs.gridColor === preset.value}
                  onClick={() => onChange({ gridColor: preset.value })}
                />
              ))}
            </div>
          </div>

          <div className="chart-settings__row">
            <label
              className="chart-settings__label"
              htmlFor="chart-grid-weight"
            >
              Grid weight ({prefs.gridWeightScale.toFixed(1)}×)
            </label>
            <input
              id="chart-grid-weight"
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={prefs.gridWeightScale}
              onChange={(e) =>
                onChange({ gridWeightScale: Number(e.target.value) })
              }
            />
          </div>

          <div className="chart-settings__row">
            <label className="chart-settings__checkbox">
              <input
                type="checkbox"
                checked={prefs.showCentreLines}
                onChange={(e) =>
                  onChange({ showCentreLines: e.target.checked })
                }
              />
              <span>Show centre lines</span>
            </label>
          </div>

          <div className="chart-settings__actions">
            <button
              type="button"
              className="chart-viewer-shell__button"
              onClick={() => onChange(DEFAULT_PREFS)}
            >
              Reset
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
