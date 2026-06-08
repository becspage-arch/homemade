'use client'

/**
 * NewBlankPanel — the blank-canvas flow. Asks for dimensions, fabric
 * count, and a starting palette, then POSTs to /api/studio/patterns.
 * On success the parent redirects to the freshly-created Studio.
 */

import { useState } from 'react'

interface NewBlankPanelProps {
  signedIn: boolean
  onCreated: (newId: string) => void
  onCancel: () => void
}

const STARTING_PALETTES: Array<{ key: string; label: string; rgb: string; brand: 'DMC'; code: string; symbol: string; name: string }> = [
  { key: 'noir', label: 'Black', rgb: '#000000', brand: 'DMC', code: '310', symbol: 'A', name: 'Black' },
  { key: 'parchment', label: 'Soft cream', rgb: '#f5ebd8', brand: 'DMC', code: '746', symbol: 'B', name: 'Off white' },
  { key: 'sage', label: 'Soft sage', rgb: '#8a9778', brand: 'DMC', code: '522', symbol: 'C', name: 'Sage green' },
  { key: 'terracotta', label: 'Terracotta', rgb: '#c4856b', brand: 'DMC', code: '356', symbol: 'D', name: 'Terracotta' },
]

export function NewBlankPanel({ signedIn, onCreated, onCancel }: NewBlankPanelProps) {
  const [width, setWidth] = useState(60)
  const [height, setHeight] = useState(80)
  const [fabricCount, setFabricCount] = useState(14)
  const [name, setName] = useState('Untitled pattern')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finishedW = (width / fabricCount) * 2.54
  const finishedH = (height / fabricCount) * 2.54

  const create = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/studio/patterns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          source: 'blank',
          width,
          height,
          fabricCount,
          palette: STARTING_PALETTES.map((p) => ({
            symbol: p.symbol,
            brand: p.brand,
            code: p.code,
            name: p.name,
            rgb: p.rgb,
            strandsFullCross: 2,
            strandsBackstitch: 1,
          })),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unable to create pattern' }))
        throw new Error(body.error ?? 'Unable to create pattern')
      }
      const body = await res.json()
      onCreated(body.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create pattern')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="studio-dialog">
      <div className="studio-dialog-card">
        <header className="studio-dialog-header">
          <h2>Start a blank pattern</h2>
          <p className="subtle">Pick dimensions and a starting palette. You can change anything later.</p>
        </header>

        {!signedIn && (
          <div className="studio-dialog-notice">
            You will be asked to sign in before your pattern is saved.
          </div>
        )}

        <div className="studio-dialog-field">
          <label htmlFor="np-name">Name</label>
          <input id="np-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="studio-dialog-grid">
          <div className="studio-dialog-field">
            <label htmlFor="np-w">Width (cells)</label>
            <input id="np-w" type="number" min={4} max={400} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </div>
          <div className="studio-dialog-field">
            <label htmlFor="np-h">Height (cells)</label>
            <input id="np-h" type="number" min={4} max={400} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </div>
          <div className="studio-dialog-field">
            <label htmlFor="np-f">Fabric count</label>
            <select id="np-f" value={fabricCount} onChange={(e) => setFabricCount(Number(e.target.value))}>
              {[11, 14, 16, 18, 22, 25, 28].map((c) => (
                <option key={c} value={c}>{c}-count Aida</option>
              ))}
            </select>
          </div>
        </div>

        <p className="studio-dialog-finished subtle">
          Finished size: {finishedW.toFixed(1)} × {finishedH.toFixed(1)} cm
        </p>

        <div className="studio-dialog-actions">
          <button type="button" className="studio-button ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="studio-button primary" onClick={create} disabled={creating}>
            {creating ? 'Creating…' : 'Create pattern'}
          </button>
        </div>

        {error && <div className="studio-dialog-error">{error}</div>}
      </div>
    </section>
  )
}
