'use client'

/**
 * BrandSwapDialog — the floss-brand switch modal.
 *
 * Open via the toolbar overflow menu's "Switch floss brand" item.
 * Shows the source palette beside the proposed target palette,
 * highlights any closest-match swaps (no published equivalent),
 * and lets the user override a per-colour pick before committing.
 *
 * Commit POSTs to /api/studio/patterns/[id]/brand-swap. The server
 * silently forks library patterns into the user's account so the
 * swap doesn't mutate the shared row.
 *
 * Brand-swap stays free in v1 per the locked premium philosophy.
 * (premium-gated in Phase X — config flag only, no refactor.)
 */

import { useMemo, useState } from 'react'
import type { PatternData } from '@homemade/db/pattern'
import { X, ArrowRight, AlertTriangle, Check } from 'lucide-react'
import { swapBrand, pickBrandTable } from '@/lib/floss/nearest-floss'
import type { FlossEntry } from '@/lib/floss/dmc-table'

type Brand = 'DMC' | 'ANCHOR' | 'MADEIRA'

interface BrandSwapDialogProps {
  patternId: string
  pattern: PatternData
  onClose: () => void
  onSwapped: (result: { id: string; forked: boolean }) => void
}

const BRAND_LABELS: Record<Brand, string> = {
  DMC: 'DMC',
  ANCHOR: 'Anchor',
  MADEIRA: 'Madeira',
}

export function BrandSwapDialog({ patternId, pattern, onClose, onSwapped }: BrandSwapDialogProps) {
  const sourceBrand: Brand = (pattern.palette[0]?.brand as Brand) ?? 'DMC'
  const [toBrand, setToBrand] = useState<Brand>(sourceBrand === 'DMC' ? 'ANCHOR' : 'DMC')
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const proposal = useMemo(() => {
    const base = swapBrand(pattern.palette as unknown as FlossEntry[], toBrand)
    if (Object.keys(overrides).length === 0) return base
    const targetTable = pickBrandTable(toBrand)
    return base.map((row) => {
      const override = overrides[row.source.code]
      if (!override) return row
      const entry = targetTable.find((e) => e.code === override)
      if (!entry) return row
      return { ...row, target: entry, closestMatch: true, distance: 0 }
    })
  }, [pattern.palette, toBrand, overrides])

  const exactCount = proposal.filter((r) => !r.closestMatch).length
  const closestCount = proposal.length - exactCount

  const handleConfirm = async () => {
    setSubmitting(true)
    setError(null)

    const newPalette = pattern.palette.map((entry, i) => {
      const swapped = proposal[i]?.target
      if (!swapped) return entry
      return {
        ...entry,
        brand: toBrand,
        code: swapped.code,
        name: swapped.name,
        rgb: swapped.rgb,
      }
    })
    const newData: PatternData = { ...pattern, palette: newPalette }

    try {
      const res = await fetch(`/api/studio/patterns/${patternId}/brand-swap`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ toBrand, data: newData }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        setError(body.error ?? 'Swap failed')
        setSubmitting(false)
        return
      }
      const out = (await res.json()) as { id: string; forked: boolean }
      onSwapped(out)
    } catch (err) {
      setError(String(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="studio-modal-backdrop" onClick={onClose}>
      <div className="studio-modal studio-brand-swap-modal" onClick={(e) => e.stopPropagation()}>
        <header className="studio-modal-header">
          <h2>Switch floss brand</h2>
          <button type="button" className="studio-icon-button" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        <div className="studio-brand-swap-controls">
          <div className="studio-brand-swap-from">
            <span className="studio-brand-swap-label">From</span>
            <span className="studio-brand-swap-brand">{BRAND_LABELS[sourceBrand]}</span>
          </div>
          <ArrowRight size={16} strokeWidth={1.6} />
          <div className="studio-brand-swap-to">
            <span className="studio-brand-swap-label">To</span>
            <div className="studio-brand-swap-tabs" role="radiogroup" aria-label="Target brand">
              {(['DMC', 'ANCHOR', 'MADEIRA'] as Brand[])
                .filter((b) => b !== sourceBrand)
                .map((b) => (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={toBrand === b}
                    className={[
                      'studio-brand-swap-tab',
                      toBrand === b ? 'is-active' : '',
                    ].join(' ')}
                    onClick={() => { setToBrand(b); setOverrides({}) }}
                  >
                    {BRAND_LABELS[b]}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <p className="studio-brand-swap-summary">
          {exactCount} of {proposal.length} colours have exact equivalents in{' '}
          {BRAND_LABELS[toBrand]}.{' '}
          {closestCount > 0 && (
            <>
              {closestCount} are closest match. Preview the swap below.
            </>
          )}
        </p>

        <ul className="studio-brand-swap-list">
          {proposal.map((row, i) => (
            <li key={`${row.source.code}-${i}`} className="studio-brand-swap-row">
              <span className="studio-brand-swap-swatch" style={{ background: row.source.rgb }} />
              <span className="studio-brand-swap-source">
                <span className="studio-brand-swap-code">{row.source.brand} {row.source.code}</span>
                <span className="studio-brand-swap-name">{row.source.name}</span>
              </span>
              <ArrowRight size={14} strokeWidth={1.6} className="studio-brand-swap-arrow" />
              <span className="studio-brand-swap-swatch" style={{ background: row.target.rgb }} />
              <span className="studio-brand-swap-target">
                <span className="studio-brand-swap-code">
                  {BRAND_LABELS[toBrand]} {row.target.code}
                </span>
                <span className="studio-brand-swap-name">{row.target.name}</span>
              </span>
              {row.closestMatch ? (
                <span
                  className="studio-brand-swap-flag is-warning"
                  title={`Closest match. CIELAB ΔE ${row.distance.toFixed(1)}`}
                >
                  <AlertTriangle size={13} strokeWidth={1.8} />
                  closest
                </span>
              ) : (
                <span className="studio-brand-swap-flag is-ok">
                  <Check size={13} strokeWidth={1.8} />
                  exact
                </span>
              )}
              <OverrideMenu
                row={row}
                toBrand={toBrand}
                onPick={(code) => setOverrides((p) => ({ ...p, [row.source.code]: code }))}
                isOverridden={Boolean(overrides[row.source.code])}
              />
            </li>
          ))}
        </ul>

        {error && <div className="studio-brand-swap-error">{error}</div>}

        <footer className="studio-modal-footer">
          <button type="button" className="studio-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="studio-button-primary"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Swapping…' : `Switch to ${BRAND_LABELS[toBrand]}`}
          </button>
        </footer>
      </div>
    </div>
  )
}

interface OverrideMenuProps {
  row: { source: FlossEntry; target: FlossEntry; closestMatch: boolean }
  toBrand: Brand
  onPick: (code: string) => void
  isOverridden: boolean
}

/**
 * The per-colour override menu. Shows the 8 nearest candidates in the
 * target brand (by perceptual distance from the source colour) so the
 * user can swap the auto-pick for a closer or more familiar code.
 */
function OverrideMenu({ row, toBrand, onPick, isOverridden }: OverrideMenuProps) {
  const [open, setOpen] = useState(false)
  const candidates = useMemo(() => {
    const table = pickBrandTable(toBrand)
    const [r, g, b] = hexToRgb(row.source.rgb)
    return table
      .map((entry) => {
        const [er, eg, eb] = hexToRgb(entry.rgb)
        const dr = er - r
        const dg = eg - g
        const db = eb - b
        return { entry, d: Math.sqrt(dr * dr + dg * dg + db * db) }
      })
      .sort((a, b) => a.d - b.d)
      .slice(0, 8)
  }, [row.source.rgb, toBrand])

  return (
    <div className="studio-brand-swap-override-wrap">
      <button
        type="button"
        className={[
          'studio-brand-swap-override-button',
          isOverridden ? 'is-active' : '',
        ].join(' ')}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        title="Pick a different code"
      >
        {isOverridden ? 'overridden' : 'change'}
      </button>
      {open && (
        <div className="studio-popover studio-brand-swap-override-menu" onMouseLeave={() => setOpen(false)}>
          {candidates.map((c) => (
            <button
              key={c.entry.code}
              type="button"
              className={[
                'studio-popover-item studio-brand-swap-override-pick',
                c.entry.code === row.target.code ? 'is-current' : '',
              ].join(' ')}
              onClick={() => { onPick(c.entry.code); setOpen(false) }}
            >
              <span className="studio-brand-swap-swatch" style={{ background: c.entry.rgb }} />
              <span>{c.entry.code}</span>
              <span className="subtle">{c.entry.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}
