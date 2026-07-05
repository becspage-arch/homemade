'use client'

/**
 * IdeaToPatternPanel — describe-an-idea → your own cross-stitch pattern.
 *
 * The premium create-your-own flow that starts from words, not a photo:
 *
 *   1. The customer types an idea. We generate an original illustration
 *      (Flux, server-side) and show it.
 *   2. The image IS the acceptance gate. They approve it, or Regenerate for a
 *      fresh take, or reword the idea — as many times as they like. We never
 *      reject their request; the only floor is a clean, complete image.
 *   3. On "Turn into a pattern" we run the SAME rigorous converter the photo
 *      flow and the catalogue routine use (via /api/studio/photo-to-chart),
 *      save it as the customer's own pattern, and open it in their Studio.
 *
 * The convert + save reuses the existing photo-to-chart route and the owned-
 * pattern POST, so the idea flow shares one convert path with the photo flow
 * rather than forking a second one.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Sparkles, X, Loader2, RefreshCw } from 'lucide-react'
import type { PatternData } from '@homemade/db/pattern'
import { captureClientEvent } from '@/lib/client-analytics'

interface IdeaToPatternPanelProps {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
  /** When embedded in the combined "Design your own" surface, the parent
   *  supplies the header (the idea/photo toggle + close) so the panel doesn't
   *  render its own title row. Standalone use falls back to the default. */
  header?: ReactNode
}

interface Settings {
  size: number
  colours: number
  fabricCount: number
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  detailed: boolean
}

const DEFAULT_SETTINGS: Settings = {
  size: 140,
  colours: 24,
  fabricCount: 14,
  brand: 'DMC',
  detailed: false,
}

const SIZE_OPTIONS = [
  { value: 100, label: 'Small — quick stitch (100 cells)' },
  { value: 140, label: 'Medium (140 cells)' },
  { value: 180, label: 'Large — statement piece (180 cells)' },
  { value: 220, label: 'Extra large — showpiece (220 cells)' },
]

export function IdeaToPatternPanel({ signedIn, onSaved, onCancel, header }: IdeaToPatternPanelProps) {
  const [brief, setBrief] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatingPattern, setGeneratingPattern] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    captureClientEvent('feature_used', { feature: 'idea_to_pattern', productArea: 'cross_stitch' })
  }, [])

  const finishedW = (settings.size / settings.fabricCount) * 2.54

  const generateImage = useCallback(async () => {
    const subject = brief.trim()
    if (subject.length < 3) {
      setError('Describe your idea in a few words first.')
      return
    }
    setGeneratingImage(true)
    setError(null)
    try {
      const res = await fetch('/api/studio/idea-to-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brief: subject, detailed: settings.detailed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Could not generate an image' }))
        throw new Error(body.error ?? 'Could not generate an image')
      }
      const body = await res.json()
      setImage(body.image as string)
      captureClientEvent('idea_image_generated', { craft: 'cross_stitch', detailed: settings.detailed })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate an image')
    } finally {
      setGeneratingImage(false)
    }
  }, [brief, settings.detailed])

  // Approve → convert with the rigorous converter (shared photo-to-chart route)
  // → save as the customer's own pattern → open it in the Studio.
  const generatePattern = useCallback(async () => {
    if (!image) return
    setGeneratingPattern(true)
    setError(null)
    try {
      const blob = await (await fetch(image)).blob()
      const form = new FormData()
      form.set('image', blob, 'idea.png')
      form.set('width', String(settings.size))
      form.set('height', String(settings.size))
      form.set('colours', String(settings.colours))
      form.set('fabricCount', String(settings.fabricCount))
      form.set('brand', settings.brand)
      form.set('confettiMin', 'medium')
      form.set('backgroundRemoval', '0')
      const convertRes = await fetch('/api/studio/photo-to-chart', { method: 'POST', body: form })
      if (!convertRes.ok) {
        const body = await convertRes.json().catch(() => ({ error: 'Could not build the chart' }))
        throw new Error(body.error ?? 'Could not build the chart')
      }
      const { pattern } = (await convertRes.json()) as { pattern: PatternData }

      const saveRes = await fetch('/api/studio/patterns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source: 'prebuilt', name: nameFromBrief(brief), data: pattern }),
      })
      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => ({ error: 'Could not save your pattern' }))
        throw new Error(body.error ?? 'Could not save your pattern')
      }
      const saved = await saveRes.json()
      captureClientEvent('idea_pattern_created', { craft: 'cross_stitch' })
      onSaved(saved.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build your pattern')
      setGeneratingPattern(false)
    }
  }, [image, settings, brief, onSaved])

  const busy = generatingImage || generatingPattern

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Your generated design"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
          />
        ) : (
          <div className="studio-p2c-preview-canvas">
            <p style={{ color: 'var(--studio-ink-mute)', textAlign: 'center', maxWidth: 320 }}>
              Describe an idea on the right and we&apos;ll draw it. When you love the picture, turn it
              into your own stitchable chart.
            </p>
          </div>
        )}
        {busy && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>{generatingPattern ? 'Building your chart…' : 'Drawing your idea…'}</p>
            <p className="studio-p2c-thinking-sub">
              {generatingPattern
                ? 'Sampling colours, mapping floss codes, smoothing detail.'
                : 'This takes a few seconds.'}
            </p>
          </div>
        )}
      </div>

      <div className="studio-p2c-controls">
        {header ?? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--studio-font-display)', fontWeight: 500, fontSize: 22, margin: 0 }}>
              Describe an idea
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

        <div className="studio-dialog-field">
          <label>Your idea</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="A sleepy fox curled under autumn leaves, folk-art style"
            style={{
              width: '100%',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: 14,
              padding: 8,
              borderRadius: 6,
              border: '1px solid var(--studio-border, #d9cfc0)',
            }}
          />
          <p className="studio-p2c-checkbox-hint" style={{ marginTop: 4 }}>
            Name the subject and, if you like, a style (folk-art, kawaii, vintage, watercolour, minimalist).
          </p>
        </div>

        <label className="studio-p2c-checkbox">
          <input
            type="checkbox"
            checked={settings.detailed}
            onChange={(e) => setSettings((s) => ({ ...s, detailed: e.target.checked }))}
            disabled={busy}
          />
          <span>
            More detailed art
            <span className="studio-p2c-checkbox-hint">
              Uses the richer showpiece engine — slower, best for large, intricate designs.
            </span>
          </span>
        </label>

        {!image ? (
          <div className="studio-dialog-actions">
            <button type="button" className="studio-button ghost" onClick={onCancel}>Cancel</button>
            <button
              type="button"
              className="studio-button primary"
              onClick={generateImage}
              disabled={busy || brief.trim().length < 3}
            >
              {generatingImage ? 'Drawing…' : 'Generate image'}
            </button>
          </div>
        ) : (
          <>
            <div className="studio-dialog-grid">
              <div className="studio-dialog-field">
                <label>Size</label>
                <select
                  value={settings.size}
                  onChange={(e) => setSettings((s) => ({ ...s, size: Number(e.target.value) }))}
                  disabled={busy}
                >
                  {SIZE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="studio-dialog-field">
                <label>Fabric</label>
                <select
                  value={settings.fabricCount}
                  onChange={(e) => setSettings((s) => ({ ...s, fabricCount: Number(e.target.value) }))}
                  disabled={busy}
                >
                  {[11, 14, 16, 18, 22, 25, 28].map((c) => (
                    <option key={c} value={c}>{c}-count</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="studio-dialog-finished subtle">
              Finished size: about {finishedW.toFixed(1)} × {finishedW.toFixed(1)} cm
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
                onChange={(e) => setSettings((s) => ({ ...s, colours: Number(e.target.value) }))}
                disabled={busy}
              />
            </div>

            <div className="studio-dialog-field">
              <label>Brand</label>
              <select
                value={settings.brand}
                onChange={(e) => setSettings((s) => ({ ...s, brand: e.target.value as Settings['brand'] }))}
                disabled={busy}
              >
                <option value="DMC">DMC</option>
                <option value="ANCHOR">Anchor</option>
                <option value="MADEIRA">Madeira</option>
              </select>
            </div>

            <div className="studio-dialog-actions">
              <button type="button" className="studio-button ghost" onClick={onCancel} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="studio-button ghost"
                onClick={generateImage}
                disabled={busy}
                title="Draw a fresh version of this idea"
              >
                <RefreshCw size={15} strokeWidth={1.7} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Regenerate
              </button>
              <button
                type="button"
                className="studio-button primary"
                onClick={generatePattern}
                disabled={busy}
              >
                <Sparkles size={15} strokeWidth={1.7} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                {generatingPattern ? 'Building…' : 'Turn into a pattern'}
              </button>
            </div>
          </>
        )}

        {error && <div className="studio-dialog-error">{error}</div>}
      </div>
    </section>
  )
}

function nameFromBrief(brief: string): string {
  const cleaned = brief.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Untitled idea pattern'
  const first = cleaned.length > 60 ? cleaned.slice(0, 57).trimEnd() + '…' : cleaned
  return first.charAt(0).toUpperCase() + first.slice(1)
}
