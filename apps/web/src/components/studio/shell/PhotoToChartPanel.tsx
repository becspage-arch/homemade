'use client'

/**
 * PhotoToChartPanel — the photo-to-chart conversion surface.
 *
 * Three-step flow:
 *
 *   1. Drop a photo. The source image renders on the left so the user
 *      can see what they're working with.
 *   2. Pick dimensions, fabric, brand, colour count, etc. on the right.
 *      Default: width/height locked to the source photo's aspect ratio
 *      so a portrait subject doesn't get squashed. The user can untick
 *      "Lock to photo aspect" if they want to deliberately crop.
 *   3. Click "Create pattern". A thinking overlay shows on the preview
 *      area while the server runs the sharp + image-q + nearest-floss
 *      pipeline. When done, the chart preview replaces the source
 *      image and the action buttons flip to "Save to my patterns" +
 *      "Revise". Any setting change after the first generate dirties
 *      the preview and the action returns to "Re-generate" + "Save"
 *      (the user gets to see "this preview is stale" via the dirty
 *      indicator without having to lose their last result).
 *
 * The Studio chart viewport stops being a mark-stitched surface in this
 * panel (interactive={false}) — clicking and dragging just pans the
 * preview, which is what a user trying to inspect a generated chart
 * actually wants.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import type { PatternData } from '@homemade/db/pattern'
import { ChartViewport } from '../chart/ChartViewport'

interface PhotoToChartPanelProps {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
  /** When embedded in the combined "Design your own" surface, the parent
   *  supplies the header (the idea/photo toggle + close) so the panel doesn't
   *  render its own title row. Standalone use falls back to the default. */
  header?: ReactNode
}

interface Settings {
  width: number
  height: number
  colours: number
  fabricCount: number
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  confettiMin: 'low' | 'medium' | 'high'
  backgroundRemoval: boolean
  lockAspect: boolean
}

const DEFAULT_SETTINGS: Settings = {
  width: 80,
  height: 100,
  colours: 18,
  fabricCount: 14,
  brand: 'DMC',
  confettiMin: 'medium',
  backgroundRemoval: false,
  lockAspect: true,
}

export function PhotoToChartPanel({ signedIn, onSaved, onCancel, header }: PhotoToChartPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoAspect, setPhotoAspect] = useState<number | null>(null)
  const [pattern, setPattern] = useState<PatternData | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [previewIsStale, setPreviewIsStale] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('Untitled photo pattern')
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  // Centre crosshairs default OFF in the conversion preview. They're
  // visual noise obscuring the user's photo. The user can flip them on
  // to check chart centring against the photo's subject; the toggle
  // persists for the session but doesn't affect the saved pattern's
  // preference when the user opens it in the stitching Studio.
  const [showCentreGuides, setShowCentreGuides] = useState(false)
  const inflight = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const finishedW = (settings.width / settings.fabricCount) * 2.54
  const finishedH = (settings.height / settings.fabricCount) * 2.54

  // Tidy up the preview blob URL when the panel unmounts or the photo
  // changes.
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
      setPreviewIsStale(false)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setGenerating(false)
    }
  }, [file, settings])

  // When the source photo changes, throw away any earlier preview and
  // measure the new image's aspect ratio so the dimension lock can
  // mirror it.
  const onFileChosen = (f: File | null) => {
    if (!f) return
    setFile(f)
    setPattern(null)
    setPreviewIsStale(false)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
    setName(prettifyName(f.name))
    // Probe the image to learn its aspect; default the target height to
    // match so a portrait stays portrait and a landscape stays landscape.
    const img = new Image()
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight
      setPhotoAspect(aspect)
      setSettings((s) => ({
        ...s,
        height: Math.max(20, Math.min(300, Math.round(s.width / aspect))),
      }))
    }
    img.src = url
  }

  // Apply a settings patch. When lockAspect is on, mirror width/height
  // through the photo's aspect ratio. Mark the preview stale unless the
  // change was the lock toggle itself.
  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      if (next.lockAspect && photoAspect) {
        if (patch.width !== undefined && patch.height === undefined) {
          next.height = Math.max(20, Math.min(300, Math.round(patch.width / photoAspect)))
        } else if (patch.height !== undefined && patch.width === undefined) {
          next.width = Math.max(20, Math.min(300, Math.round(patch.height * photoAspect)))
        } else if (patch.lockAspect === true && patch.width === undefined && patch.height === undefined) {
          // The user just turned the lock back on — snap height to the
          // photo aspect from the current width.
          next.height = Math.max(20, Math.min(300, Math.round(next.width / photoAspect)))
        }
      }
      // Any meaningful setting change marks the preview as stale once
      // we already have one. The lock toggle itself doesn't.
      if (pattern && !('lockAspect' in patch && Object.keys(patch).length === 1)) {
        setPreviewIsStale(true)
      }
      return next
    })
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

  const showChart = pattern && !previewIsStale
  const primaryLabel = !pattern
    ? 'Create pattern'
    : previewIsStale
    ? 'Re-generate'
    : 'Save to my patterns'

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview">
        {showChart ? (
          <div className="studio-p2c-preview-canvas">
            <ChartViewport
              pattern={pattern}
              mode="view"
              interactive={false}
              centreCrosshairsOverride={showCentreGuides}
            />
          </div>
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Source" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div className="studio-p2c-preview-canvas">
            <p style={{ color: 'var(--studio-ink-mute)', textAlign: 'center' }}>
              Drop a photo on the right to begin
            </p>
          </div>
        )}
        {generating && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Building your chart…</p>
            <p className="studio-p2c-thinking-sub">Sampling colours, mapping floss codes, smoothing detail.</p>
          </div>
        )}
        {pattern && previewIsStale && !generating && (
          <div className="studio-p2c-stale">Preview is stale. Re-generate to see your new settings.</div>
        )}
      </div>

      <div className="studio-p2c-controls">
        {header ?? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--studio-font-display)', fontWeight: 500, fontSize: 22, margin: 0 }}>
              Photo to chart
            </h2>
            <button type="button" className="studio-icon-button" onClick={onCancel} aria-label="Close">
              <X size={18} strokeWidth={1.6} />
            </button>
          </div>
        )}

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
                  disabled={settings.lockAspect && photoAspect !== null}
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

            <label className="studio-p2c-checkbox">
              <input
                type="checkbox"
                checked={settings.lockAspect}
                onChange={(e) => update({ lockAspect: e.target.checked })}
              />
              <span>
                Lock to photo aspect
                <span className="studio-p2c-checkbox-hint">
                  {settings.lockAspect
                    ? 'Changing width keeps the photo from being squashed.'
                    : 'Untick to crop the photo to the dimensions above.'}
                </span>
              </span>
            </label>

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

            <label className="studio-p2c-checkbox">
              <input
                type="checkbox"
                checked={settings.backgroundRemoval}
                onChange={(e) => update({ backgroundRemoval: e.target.checked })}
              />
              <span>Bump saturation and remove flat backgrounds</span>
            </label>

            <label className="studio-p2c-checkbox">
              <input
                type="checkbox"
                checked={showCentreGuides}
                onChange={(e) => setShowCentreGuides(e.target.checked)}
              />
              <span>
                Show centre guides
                <span className="studio-p2c-checkbox-hint">
                  The horizontal and vertical lines through the centre of the chart.
                  Useful for checking your subject is centred; off by default so the
                  preview stays clean.
                </span>
              </span>
            </label>

            <div className="studio-dialog-actions">
              <button type="button" className="studio-button ghost" onClick={onCancel}>Cancel</button>
              {pattern && !previewIsStale ? (
                <>
                  <button type="button" className="studio-button ghost" onClick={() => setPreviewIsStale(true)}>
                    Try different settings
                  </button>
                  <button type="button" className="studio-button primary" onClick={save} disabled={saving}>
                    {saving ? 'Saving…' : primaryLabel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="studio-button primary"
                  onClick={generate}
                  disabled={generating}
                >
                  {generating ? 'Generating…' : primaryLabel}
                </button>
              )}
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
