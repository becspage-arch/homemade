'use client'

/**
 * MaterialsCalculator - works out fabric length needed and lists the
 * notions checklist. Reads the pattern's fabricRequirementsCm map (size
 * → array of {widthCm, lengthCmNoNap, lengthCmWithNap}).
 *
 * The user selects a fabric width and toggles "with nap" / "without
 * nap". The output renders in cm and inches (1 inch = 2.54 cm). The
 * notions list is checkable so the user can tick off what they have.
 *
 * Calm shape: a friendly placeholder if the pattern doesn't have
 * requirements yet, no procedural fallback.
 */

import { useMemo, useState } from 'react'
import type { SewingPatternData } from './types'

interface MaterialsCalculatorProps {
  pattern: SewingPatternData
  selectedSize: string
  measurementPreference?: 'cm' | 'inches' | null
}

const DEFAULT_FABRIC_WIDTH = 140

export function MaterialsCalculator({
  pattern,
  selectedSize,
  measurementPreference,
}: MaterialsCalculatorProps) {
  const reqs = useMemo(
    () => pattern.fabricRequirements[selectedSize] ?? [],
    [pattern.fabricRequirements, selectedSize],
  )
  const widths = useMemo(() => {
    const set = new Set(reqs.map((r) => r.widthCm))
    if (set.size === 0) set.add(DEFAULT_FABRIC_WIDTH)
    return Array.from(set).sort((a, b) => a - b)
  }, [reqs])
  const [width, setWidth] = useState<number>(widths[0] ?? DEFAULT_FABRIC_WIDTH)
  const [withNap, setWithNap] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const fabricLength = useMemo(() => {
    const match = reqs.find((r) => r.widthCm === width)
    if (!match) return null
    return withNap ? match.lengthCmWithNap : match.lengthCmNoNap
  }, [reqs, width, withNap])

  const usingInches = measurementPreference === 'inches'

  return (
    <div className="sew-panel-section">
      <h3 className="sew-panel-heading">Fabric and notions</h3>

      <div className="sew-panel-row">
        <label className="sew-panel-label" htmlFor="fabric-width">
          Fabric width
        </label>
        <select
          id="fabric-width"
          className="sew-panel-select"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        >
          {widths.map((w) => (
            <option key={w} value={w}>
              {w} cm ({Math.round(cmToInches(w))} in)
            </option>
          ))}
        </select>
      </div>

      <div className="sew-panel-toggle-row">
        <input
          type="checkbox"
          id="with-nap"
          checked={withNap}
          onChange={(e) => setWithNap(e.target.checked)}
        />
        <label htmlFor="with-nap">
          With nap (extra length for directional fabric)
        </label>
      </div>

      <div className="sew-panel-row">
        <span className="sew-panel-label">Fabric length needed</span>
        {fabricLength === null ? (
          <span style={{ color: 'var(--studio-ink-soft)' }}>
            Pattern doesn&apos;t include fabric requirements for this size and width yet.
          </span>
        ) : (
          <span className="sew-panel-output">
            {usingInches
              ? `${formatInches(cmToInches(fabricLength))} in`
              : `${fabricLength} cm`}
            <span style={{ color: 'var(--studio-ink-soft)', marginLeft: 8, fontSize: '0.85rem' }}>
              {usingInches
                ? `(${fabricLength} cm)`
                : `(${formatInches(cmToInches(fabricLength))} in)`}
            </span>
          </span>
        )}
      </div>

      {pattern.recommendedNotions.length > 0 && (
        <>
          <div className="sew-panel-label" style={{ marginTop: '0.8rem' }}>
            Notions
          </div>
          <ul className="sew-panel-notion-list">
            {pattern.recommendedNotions.map((n, idx) => (
              <li key={idx}>
                <input
                  type="checkbox"
                  className="notion-checkbox"
                  checked={Boolean(checked[idx])}
                  onChange={(e) =>
                    setChecked((c) => ({ ...c, [idx]: e.target.checked }))
                  }
                  aria-label={`I have ${n.name}`}
                />
                <div>
                  <div className="sew-panel-notion-name">
                    {n.name}
                    {n.quantity > 1 && (
                      <span style={{ color: 'var(--studio-ink-soft)' }}>
                        {' '}
                        × {n.quantity}
                      </span>
                    )}
                  </div>
                  {n.spec && <div className="sew-panel-notion-spec">{n.spec}</div>}
                  {n.notes && <div className="sew-panel-notion-spec">{n.notes}</div>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function cmToInches(cm: number): number {
  return cm / 2.54
}

function formatInches(inches: number): string {
  // Render to nearest 1/8 inch.
  const eighths = Math.round(inches * 8)
  const whole = Math.floor(eighths / 8)
  const remainder = eighths % 8
  if (remainder === 0) return String(whole)
  const fraction = simplifyFraction(remainder, 8)
  return whole === 0 ? `${fraction.n}/${fraction.d}` : `${whole} ${fraction.n}/${fraction.d}`
}

function simplifyFraction(n: number, d: number): { n: number; d: number } {
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
