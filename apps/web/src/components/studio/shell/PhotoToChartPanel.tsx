'use client'

/**
 * PhotoToChartPanel — the photo-to-chart conversion surface.
 *
 * Two-panel layout: image + live chart preview on the left, controls on
 * the right. Every slider movement debounces a 300ms POST to
 * /api/studio/photo-to-chart and updates the preview in place. The
 * "save" button persists the current preview as a new owned pattern via
 * /api/studio/patterns.
 *
 * Magic-moment goal: watching the colour-count slider drop from 50 to
 * 12 should make the chart visibly consolidate in real time. We render
 * the live preview through the same ChartViewport everywhere else uses,
 * so the user is looking at the actual output, not an approximation.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import type { PatternData } from '@homemade/db/pattern'
import { ChartViewport } from '../chart/ChartViewport'

interface PhotoToChartPanelProps {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
}

interface Settings {
  width: number
  height: number
  colours: number
  fabricCount: number
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  confettiMin: 'low' | 'medium' | 'high'
  backgroundRemoval: boolean
}

const DEBOUNCE_MS = 300
const DEFAULTS: Settings = {
  width: 80,
  height: 100,
  colours: 18,
  fabricCount: 14,
  brand: 'DMC',
  confettiMin: 'medium',
  backgroundRemoval: false,
}

export function PhotoToChartPanel({ signedIn, onSaved, onCancel }: PhotoToChartPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pattern, setPattern] = useState<PatternData | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('Untitled photo pattern')
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inflight = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const finishedW = (settings.width / settings.fabricCount) * 2.54
  const finishedH = (settings.height / settings.fabricCount) * 2.54

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const generate = useCallback(async () => {
    if (!file) return
    setGenerating(true)
    setError(null)
    inflight.current?.abort()
    const controller = new AbortController()
    inflight.current = controller
    try {
      const form = new FormData()
      form.set('image', file)
      form.set('width', String(settings.width))
      form.set('height', String(settings.height))
      form.set('colours', String(settings.colours))
      form.set('fabricCount', String(settings.fabricCount))
      form.set('brand', settings.brand)
      form.set('confettiMin', settings.confettiMin)
      form.set('backgroundRemoval', settings.backgroundRemoval ? '1' : '0')
      const res = await fetch('/api/studio/photo-to-chart', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to generate chart' }))
        throw new Error(body.error ?? 'Failed to generate chart')
      }
      const body = await res.json()
      setPattern(body.pattern as PatternData)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setGenerating(false)
    }
  }, [file, settings])

  useEffect(() => {
    if (!file) {
      setPattern(null)
      return
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => generate(), DEBOUNCE_MS)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [file, settings, generate])

  const onFileChosen = (f: File | null) => {
    if (!f) return
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
    setName(prettifyName(f.name))
  }

  const save = async () => {
    if (!pattern) return
    setSaving(true)
    try {
      const res = await fetch('/api/studio/patterns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source: 'prebuilt', name, data: pattern }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to save' }))
        throw new Error(body.error ?? 'Failed to save')
      }
      const body = await res.json()
      onSaved(body.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview">
        {pattern ? (
          <div className="studio-p2c-preview-canvas">
            <ChartViewport pattern={pattern} mode="view" />
          </div>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Source" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div className="studio-p2c-preview-canvas">
            <p style={{ color: 'var(--studio-ink-mute)', textAlign: 'center' }}>
              Drop a photo on the right to begin
            </p>
          </div>
        )}
      </div>

      <div className="studio-p2c-controls">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--studio-font-display)', fontWeight: 500, fontSize: 22, margin: 0 }}>
            Photo to chart
          </h2>
          <button type="button" className="studio-icon-button" onClick={onCancel} aria-label="Close">
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        {!signedIn && (
          <div className="studio-dialog-notice">
            You will be asked to sign in before your pattern is saved.
          </div>
        )}

        {!file ? (
          <label
            className="studio-p2c-dropzone"
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) onFileChosen(f)
            }}
            style={dragOver ? { borderColor: 'var(--studio-accent)', background: '#fffaf0' } : undefined}
          >
            <UploadCloud size={32} strokeWidth={1.4} style={{ color: 'var(--studio-accent)' }} />
            <p style={{ marginTop: 12, marginBottom: 4, fontSize: 16, color: 'var(--studio-ink)' }}>
              Drop a photo, or click to browse
            </p>
            <p style={{ fontSize: 12, color: 'var(--studio-ink-mute)' }}>JPG, PNG, WEBP up to 20MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>
        ) : (
          <>
            <div className="studio-dialog-field">
              <label>Pattern name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="studio-dialog-grid">
              <div className="studio-dialog-field">
                <label>Width</label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={settings.width}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                />
              </div>
              <div className="studio-dialog-field">
                <label>Height</label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={settings.height}
                  onChange={(e) => update({ height: Number(e.target.value) })}
                />
              </div>
              <div className="studio-dialog-field">
                <label>Fabric</label>
                <select
                  value={settings.fabricCount}
                  onChange={(e) => update({ fabricCount: Number(e.target.value) })}
                >
                  {[11, 14, 16, 18, 22, 25, 28].map((c) => (
                    <option key={c} value={c}>{c}-count</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="studio-dialog-finished subtle">
              Finished size: {finishedW.toFixed(1)} × {finishedH.toFixed(1)} cm
            </p>

            <div className="studio-p2c-slider">
              <div className="studio-p2c-slider-label">
                <span>Colour count</span><span>{settings.colours}</span>
              </div>
              <input
                type="range"
                min={6}
                max={60}
                value={settings.colours}
                onChange={(e) => update({ colours: Number(e.target.value) })}
              />
            </div>

            <div className="studio-dialog-field">
              <label>Brand</label>
              <select
                value={settings.brand}
                onChange={(e) => update({ brand: e.target.value as 'DMC' | 'ANCHOR' | 'MADEIRA' })}
              >
                <option value="DMC">DMC</option>
                <option value="ANCHOR">Anchor</option>
                <option value="MADEIRA">Madeira</option>
              </select>
            </div>

            <div className="studio-dialog-field">
              <label>Detail consolidation</label>
              <select
                value={settings.confettiMin}
                onChange={(e) => update({ confettiMin: e.target.value as Settings['confettiMin'] })}
              >
                <option value="low">Low (keep all detail)</option>
                <option value="medium">Medium</option>
                <option value="high">High (smooth out single-cell colours)</option>
              </select>
            </div>

            <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 14, color: 'var(--studio-ink-soft)' }}>
              <input
                type="checkbox"
                checked={settings.backgroundRemoval}
                onChange={(e) => update({ backgroundRemoval: e.target.checked })}
              />
              Bump saturation and remove flat backgrounds
            </label>

            <div className="studio-dialog-actions">
              <button type="button" className="studio-button ghost" onClick={onCancel}>Cancel</button>
              <button type="button" className="studio-button primary" onClick={save} disabled={saving || !pattern}>
                {saving ? 'Saving…' : generating ? 'Generating…' : 'Save to my patterns'}
              </button>
            </div>

            {error && <div className="studio-dialog-error">{error}</div>}
          </>
        )}
      </div>
    </section>
  )
}

function prettifyName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled photo pattern'
}
