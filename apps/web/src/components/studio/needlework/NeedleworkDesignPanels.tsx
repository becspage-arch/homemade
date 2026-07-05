'use client'

/**
 * NeedleworkDesignPanels — the create-your-own panels for NEEDLEWORK.
 *
 * The needlework twins of the cross-stitch `IdeaToPatternPanel` +
 * `PhotoToChartPanel`: the same surface, the same flow, the same premium
 * create-your-own shell (`CreateYourOwnPanel`) — only the converter + render
 * differ. They reuse the shared studio-p2c styles and the craft-agnostic
 * /api/studio/idea-to-image route (Flux), and post the approved image to
 * /api/studio/needlework/create, which runs the surface-embroidery engine and
 * saves the customer's OWN needlework pattern.
 *
 *   Describe an idea → Flux illustration → approve/regenerate → your pattern.
 *   Upload a photo   → your pattern.
 *
 * The image is the customer's acceptance gate (idea flow); we never reject their
 * request. The finished-piece photoreal hero renders afterwards on Fargate and
 * attaches to the pattern, so "Turn into a pattern" returns as soon as the
 * stitchable document is saved and opens it in their needlework Studio.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Sparkles, X, Loader2, RefreshCw, UploadCloud } from 'lucide-react'
import { captureClientEvent } from '@/lib/client-analytics'
import '../shell/studio-shell.css'

interface PanelProps {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
  /** The combined "Design your own" surface supplies the idea/photo toggle +
   *  close header; standalone use falls back to the default title row. */
  header?: ReactNode
}

interface NeedleworkSettings {
  widthMm: number
  frame: 'round' | 'rect' | 'none'
  detail: boolean
  fullScene: boolean
}

const DEFAULT_SETTINGS: NeedleworkSettings = {
  widthMm: 200,
  frame: 'round',
  detail: true,
  fullScene: false,
}

const SIZE_OPTIONS = [
  { value: 150, label: 'Small — quick hoop (about 15 cm)' },
  { value: 200, label: 'Medium (about 20 cm)' },
  { value: 250, label: 'Large — statement piece (about 25 cm)' },
  { value: 300, label: 'Extra large — showpiece (about 30 cm)' },
]

/** Post the approved image to the needlework converter; returns the new
 *  pattern's id. Shared by both panels so idea + photo take ONE convert path. */
async function createNeedleworkPattern(
  image: Blob,
  name: string,
  s: NeedleworkSettings,
): Promise<string> {
  const form = new FormData()
  form.set('image', image, 'design.png')
  form.set('name', name)
  form.set('widthMm', String(s.widthMm))
  form.set('frame', s.frame)
  form.set('detail', s.detail ? '1' : '0')
  form.set('fullScene', s.fullScene ? '1' : '0')
  const res = await fetch('/api/studio/needlework/create', { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Could not build your pattern' }))
    throw new Error(body.error ?? 'Could not build your pattern')
  }
  const body = await res.json()
  return body.id as string
}

function NeedleworkSettingsControls({
  settings,
  onChange,
  busy,
  showScene,
}: {
  settings: NeedleworkSettings
  onChange: (patch: Partial<NeedleworkSettings>) => void
  busy: boolean
  showScene: boolean
}) {
  return (
    <>
      <div className="studio-dialog-grid">
        <div className="studio-dialog-field">
          <label>Size</label>
          <select
            value={settings.widthMm}
            onChange={(e) => onChange({ widthMm: Number(e.target.value) })}
            disabled={busy}
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="studio-dialog-field">
          <label>Frame</label>
          <select
            value={settings.frame}
            onChange={(e) => onChange({ frame: e.target.value as NeedleworkSettings['frame'] })}
            disabled={busy}
          >
            <option value="round">Round hoop</option>
            <option value="rect">Rectangle</option>
            <option value="none">No frame</option>
          </select>
        </div>
      </div>

      <label className="studio-p2c-checkbox">
        <input
          type="checkbox"
          checked={settings.detail}
          onChange={(e) => onChange({ detail: e.target.checked })}
          disabled={busy}
        />
        <span>
          More detailed stitching
          <span className="studio-p2c-checkbox-hint">
            Denser long-and-short — best for faces and finely detailed subjects.
          </span>
        </span>
      </label>

      {showScene && (
        <label className="studio-p2c-checkbox">
          <input
            type="checkbox"
            checked={settings.fullScene}
            onChange={(e) => onChange({ fullScene: e.target.checked })}
            disabled={busy}
          />
          <span>
            Full scene
            <span className="studio-p2c-checkbox-hint">
              Stitch the whole picture edge to edge. Leave off for a single subject on bare linen.
            </span>
          </span>
        </label>
      )}
    </>
  )
}

// ── Describe an idea → your own needlework pattern ────────────────────────────
export function NeedleworkIdeaPanel({ signedIn, onSaved, onCancel, header }: PanelProps) {
  const [brief, setBrief] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [settings, setSettings] = useState<NeedleworkSettings>(DEFAULT_SETTINGS)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatingPattern, setGeneratingPattern] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    captureClientEvent('feature_used', { feature: 'idea_to_pattern', productArea: 'needlework' })
  }, [])

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
        body: JSON.stringify({ brief: subject, detailed: settings.detail }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Could not generate an image' }))
        throw new Error(body.error ?? 'Could not generate an image')
      }
      const body = await res.json()
      setImage(body.image as string)
      captureClientEvent('idea_image_generated', { craft: 'needlework', detailed: settings.detail })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate an image')
    } finally {
      setGeneratingImage(false)
    }
  }, [brief, settings.detail])

  const generatePattern = useCallback(async () => {
    if (!image) return
    setGeneratingPattern(true)
    setError(null)
    try {
      const blob = await (await fetch(image)).blob()
      const id = await createNeedleworkPattern(blob, nameFromBrief(brief), settings)
      captureClientEvent('idea_pattern_created', { craft: 'needlework' })
      onSaved(id)
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
              Describe an idea on the right and we&apos;ll draw it. When you love the picture, turn
              it into your own thread-painting pattern.
            </p>
          </div>
        )}
        {busy && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>{generatingPattern ? 'Building your pattern…' : 'Drawing your idea…'}</p>
            <p className="studio-p2c-thinking-sub">
              {generatingPattern
                ? 'Laying the stitch field, mapping floss codes, drawing the template.'
                : 'This takes a few seconds.'}
            </p>
          </div>
        )}
      </div>

      <div className="studio-p2c-controls">
        {header ?? <DefaultHeader title="Describe an idea" onCancel={onCancel} />}

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
            placeholder="A robin on a berried twig, soft naturalistic thread painting"
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
            Name the subject and, if you like, a style (naturalistic, folk-art, whimsical, botanical).
          </p>
        </div>

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
            <NeedleworkSettingsControls
              settings={settings}
              onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
              busy={busy}
              showScene={false}
            />
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

// ── Upload a photo → your own needlework pattern ──────────────────────────────
export function NeedleworkPhotoPanel({ signedIn, onSaved, onCancel, header }: PanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [name, setName] = useState('Untitled design')
  const [settings, setSettings] = useState<NeedleworkSettings>(DEFAULT_SETTINGS)
  const [generatingPattern, setGeneratingPattern] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    captureClientEvent('feature_used', { feature: 'photo_to_pattern', productArea: 'needlework' })
  }, [])

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const onFileChosen = (f: File | null) => {
    if (!f) return
    setFile(f)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
    setName(prettifyName(f.name))
  }

  const generatePattern = useCallback(async () => {
    if (!file) return
    setGeneratingPattern(true)
    setError(null)
    try {
      const id = await createNeedleworkPattern(file, name, settings)
      captureClientEvent('photo_pattern_created', { craft: 'needlework' })
      onSaved(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build your pattern')
      setGeneratingPattern(false)
    }
  }, [file, name, settings, onSaved])

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Source"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
          />
        ) : (
          <div className="studio-p2c-preview-canvas">
            <p style={{ color: 'var(--studio-ink-mute)', textAlign: 'center' }}>
              Drop a photo on the right to begin
            </p>
          </div>
        )}
        {generatingPattern && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Building your pattern…</p>
            <p className="studio-p2c-thinking-sub">
              Laying the stitch field, mapping floss codes, drawing the template.
            </p>
          </div>
        )}
      </div>

      <div className="studio-p2c-controls">
        {header ?? <DefaultHeader title="Upload a photo" onCancel={onCancel} />}

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

            <NeedleworkSettingsControls
              settings={settings}
              onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
              busy={generatingPattern}
              showScene
            />

            <div className="studio-dialog-actions">
              <button
                type="button"
                className="studio-button ghost"
                onClick={onCancel}
                disabled={generatingPattern}
              >
                Cancel
              </button>
              <button
                type="button"
                className="studio-button primary"
                onClick={generatePattern}
                disabled={generatingPattern}
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

function DefaultHeader({ title, onCancel }: { title: string; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ fontFamily: 'var(--studio-font-display)', fontWeight: 500, fontSize: 22, margin: 0 }}>
        {title}
      </h2>
      <button type="button" className="studio-icon-button" onClick={onCancel} aria-label="Close">
        <X size={18} strokeWidth={1.6} />
      </button>
    </div>
  )
}

function nameFromBrief(brief: string): string {
  const cleaned = brief.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Untitled idea pattern'
  const first = cleaned.length > 60 ? cleaned.slice(0, 57).trimEnd() + '…' : cleaned
  return first.charAt(0).toUpperCase() + first.slice(1)
}

function prettifyName(filename: string): string {
  return (
    filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Untitled design'
  )
}
