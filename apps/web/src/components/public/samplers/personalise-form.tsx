'use client'

/**
 * The fields, the live preview, and "Stitch it".
 *
 * The preview is the design with no words on it, served as one picture, with
 * the new lettering drawn over it as squares in the same grid the chart uses.
 * So every keystroke costs a small list of cell positions rather than a fresh
 * render, and the preview keeps up with the typing.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { captureClientEvent } from '@/lib/client-analytics'
import { SAMPLER_KINDS, type SamplerKind } from '@/lib/studio/generation/samplers/kinds'

interface PreviewBlock {
  rgb: string
  cells: Array<[number, number]>
}

export function PersonaliseForm({
  patternId,
  patternName,
  kind,
  initialValues,
  previewBaseUrl,
  gridWidth,
  gridHeight,
  isPremium,
  patternPath,
}: {
  patternId: string
  patternName: string
  kind: SamplerKind
  initialValues: Record<string, string>
  previewBaseUrl: string | null
  gridWidth: number
  gridHeight: number
  isPremium: boolean
  patternPath: string
}) {
  const router = useRouter()
  const spec = SAMPLER_KINDS[kind]
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...initialValues }))
  const [blocks, setBlocks] = useState<PreviewBlock[] | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const requestId = useRef(0)

  const missing = useMemo(
    () => spec.fields.filter((f) => !f.optional && !(values[f.key] ?? '').trim()).map((f) => f.label),
    [spec.fields, values],
  )

  const load = useCallback(
    async (next: Record<string, string>) => {
      const id = ++requestId.current
      setPreviewing(true)
      try {
        const res = await fetch('/api/studio/samplers/preview', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ patternId, values: next }),
        })
        if (id !== requestId.current) return
        const json = (await res.json()) as { blocks?: PreviewBlock[]; error?: string }
        if (!res.ok) {
          setMessage(json.error ?? 'That did not work. Try again in a moment.')
          return
        }
        setMessage(null)
        setBlocks(json.blocks ?? [])
      } catch {
        if (id === requestId.current) setMessage('That did not work. Try again in a moment.')
      } finally {
        if (id === requestId.current) setPreviewing(false)
      }
    },
    [patternId],
  )

  // Debounced: one request per pause in the typing, not one per key.
  useEffect(() => {
    const t = setTimeout(() => void load(values), 400)
    return () => clearTimeout(t)
  }, [values, load])

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }))

  const stitchIt = async () => {
    captureClientEvent('feature_used', { feature: 'sampler_personalise', productArea: 'cross_stitch' })
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/studio/samplers/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ patternId, values }),
      })
      const json = (await res.json()) as { id?: string; error?: string }
      if (res.status === 401) {
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`${patternPath}#make-it-yours`)}`
        return
      }
      if (!res.ok || !json.id) {
        setMessage(json.error ?? 'That did not save. Try again in a moment.')
        return
      }
      router.push(`/studio/cross-stitch?patternId=${json.id}`)
    } catch {
      setMessage('That did not save. Try again in a moment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sampler-personalise-body">
      <div className="sampler-personalise-preview">
        <div
          className="sampler-preview-frame"
          style={{ aspectRatio: `${gridWidth} / ${gridHeight}` }}
        >
          {previewBaseUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewBaseUrl} alt={`${patternName} without the lettering`} loading="lazy" />
          ) : (
            <div className="sampler-preview-missing" />
          )}
          {blocks && (
            <svg
              className="sampler-preview-letters"
              viewBox={`0 0 ${gridWidth} ${gridHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {blocks.map((b, i) => (
                <g key={i} fill={b.rgb}>
                  {b.cells.map(([x, y]) => (
                    <rect key={`${x},${y}`} x={x} y={y} width={1.02} height={1.02} />
                  ))}
                </g>
              ))}
            </svg>
          )}
          {previewing && (
            <span className="sampler-preview-busy">
              <Loader2 size={14} aria-hidden="true" /> Setting the words
            </span>
          )}
        </div>
        <p className="sampler-preview-caption">
          {gridWidth} × {gridHeight} cells. The picture is the chart, so this is what you stitch.
        </p>
      </div>

      <div className="sampler-personalise-fields">
        {spec.fields.map((field) => (
          <label key={field.key} className="sampler-field">
            <span className="sampler-field-label">
              {field.label}
              {field.hint && <span className="sampler-field-hint">{field.hint}</span>}
            </span>
            <input
              type={field.type === 'date' ? 'date' : 'text'}
              value={values[field.key] ?? ''}
              maxLength={field.maxLength}
              onChange={(e) => set(field.key, e.target.value)}
              autoComplete="off"
            />
          </label>
        ))}

        {message && <p className="sampler-personalise-message">{message}</p>}

        {isPremium ? (
          <button
            type="button"
            className="sampler-personalise-cta"
            onClick={stitchIt}
            disabled={saving || missing.length > 0}
          >
            {saving ? 'Saving…' : 'Stitch it'}
          </button>
        ) : (
          <p className="sampler-personalise-locked">Keeping your own copy is part of Premium.</p>
        )}

        {missing.length > 0 && isPremium && (
          <p className="sampler-personalise-message">Still to fill in: {missing.join(', ')}.</p>
        )}
      </div>
    </div>
  )
}
