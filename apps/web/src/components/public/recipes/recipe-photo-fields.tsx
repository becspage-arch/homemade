'use client'

import { useRef, useState } from 'react'

export interface RecipePhoto {
  mediaId: string
  previewUrl: string
}

async function uploadPhoto(file: File): Promise<RecipePhoto> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/me/recipe-media/upload', { method: 'POST', body: form })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? 'That photo could not be uploaded.')
  }
  const data = (await res.json()) as { id: string; r2Key: string }
  return { mediaId: data.id, previewUrl: URL.createObjectURL(file) }
}

interface HeroProps {
  hero: RecipePhoto | null
  onChange: (hero: RecipePhoto | null) => void
}

export function RecipeHeroField({ hero, onChange }: HeroProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined): Promise<void> {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onChange(await uploadPhoto(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="recipe-photo-hero">
      {hero ? (
        <div className="recipe-photo-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.previewUrl} alt="Your recipe" />
          <button type="button" className="me-button danger" onClick={() => onChange(null)}>
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="recipe-photo-drop"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Uploading…' : 'Add a cover photo'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && <p className="me-feedback error">{error}</p>}
    </div>
  )
}

interface GalleryProps {
  photos: RecipePhoto[]
  onChange: (photos: RecipePhoto[]) => void
}

const MAX_GALLERY = 6

export function RecipeGalleryField({ photos, onChange }: GalleryProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return
    const room = MAX_GALLERY - photos.length
    if (room <= 0) {
      setError('That is the most photos you can add.')
      return
    }
    setBusy(true)
    setError(null)
    const next = [...photos]
    try {
      for (const file of Array.from(files).slice(0, room)) {
        next.push(await uploadPhoto(file))
      }
      onChange(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
      onChange(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="recipe-photo-gallery">
      <div className="recipe-photo-grid">
        {photos.map((p, i) => (
          <div key={p.mediaId} className="recipe-photo-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.previewUrl} alt={`Recipe photo ${i + 1}`} />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_GALLERY && (
          <button
            type="button"
            className="recipe-photo-add"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? '…' : '+'}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="me-field-hint">Up to six photos. Your photos stay exactly as you upload them.</p>
      {error && <p className="me-feedback error">{error}</p>}
    </div>
  )
}
