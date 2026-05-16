'use client'

import { useEffect, useState, useTransition } from 'react'
import { submitUgcPhoto } from '@/lib/ugc-actions'
import {
  captureNativePhoto,
  compressImage,
  isNativeCameraAvailable,
} from '@/lib/native-camera'
import { ReportModal } from './report-modal'

export interface UgcPhotoView {
  id: string
  thumbUrl: string | null
  fullUrl: string | null
  caption: string | null
  authorHandle: string
  createdAt: string
  alt: string
}

interface Props {
  tutorialId: string
  signedIn: boolean
  canUpload: boolean
  photos: UgcPhotoView[]
}

interface UploadResponse {
  key: string
  publicUrl: string
  error?: string
}

function probeImage(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/ugc/photo-upload')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadResponse)
        } catch {
          reject(new Error('Server returned non-JSON.'))
        }
        return
      }
      let message = `Upload failed (${xhr.status})`
      try {
        const body = JSON.parse(xhr.responseText)
        if (body?.error) message = body.error
      } catch {
        // ignore parse error
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Network error.'))
    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}

export function PhotosBlock(props: Props) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [reportFor, setReportFor] = useState<string | null>(null)

  return (
    <section className="ugc-section" id="photos">
      <span className="ugc-section-eyebrow">Made by readers</span>
      <h2 className="ugc-section-title">Photos</h2>
      <p className="ugc-section-description">
        How this tutorial turned out for other people.
      </p>

      {props.signedIn && !props.canUpload && (
        <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
          Start making this tutorial to share a photo.
        </p>
      )}
      {props.signedIn && props.canUpload && !uploadOpen && (
        <button className="ugc-cta" type="button" onClick={() => setUploadOpen(true)}>
          Share yours
        </button>
      )}
      {uploadOpen && (
        <UploadForm
          tutorialId={props.tutorialId}
          onDone={() => setUploadOpen(false)}
        />
      )}

      {props.photos.length === 0 ? (
        <p style={{ marginTop: 16, fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
          No reader photos yet.
        </p>
      ) : (
        <div className="ugc-photo-grid" style={{ marginTop: 16 }}>
          {props.photos.map((p) => (
            <div
              key={p.id}
              className="ugc-photo-tile"
              style={p.thumbUrl ? { backgroundImage: `url(${p.thumbUrl})` } : undefined}
              role="img"
              aria-label={p.alt}
            >
              {p.caption && <span className="ugc-photo-tile-caption">{p.caption}</span>}
              {props.signedIn && (
                <button
                  className="report"
                  onClick={() => setReportFor(p.id)}
                  aria-label="Report photo"
                >
                  Report
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {reportFor && (
        <ReportModal
          targetType="PHOTO"
          targetId={reportFor}
          onClose={() => setReportFor(null)}
        />
      )}
    </section>
  )
}

function UploadForm({
  tutorialId,
  onDone,
}: {
  tutorialId: string
  onDone: () => void
}) {
  const [pending, start] = useTransition()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<'pending' | 'rejected' | null>(null)
  const [nativeReady, setNativeReady] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() =>
      setNativeReady(isNativeCameraAvailable()),
    )
    return () => window.cancelAnimationFrame(id)
  }, [])

  const onPickNative = async () => {
    setError(null)
    const captured = await captureNativePhoto()
    if (!captured) {
      setError('Camera capture cancelled or unavailable.')
      return
    }
    setFile(captured)
  }

  const onPickWeb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    if (!picked) {
      setFile(null)
      return
    }
    try {
      const compressed = await compressImage(picked)
      setFile(compressed)
    } catch {
      // Compression failed (e.g. unsupported format) — fall back to raw.
      setFile(picked)
    }
  }

  const submit = async () => {
    if (!file) {
      setError('Choose a photo first.')
      return
    }
    setError(null)
    setProgress(0)

    const probe = await probeImage(file)

    let uploaded: UploadResponse
    try {
      uploaded = await uploadWithProgress(file, setProgress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
      return
    }

    start(async () => {
      const res = await submitUgcPhoto({
        tutorialId,
        r2Key: uploaded.key,
        caption: caption || null,
        filename: file.name,
        mimeType: file.type || null,
        width: probe?.width ?? null,
        height: probe?.height ?? null,
        bytes: file.size,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSubmitted(res.status === 'REJECTED' ? 'rejected' : 'pending')
    })
  }

  if (submitted === 'rejected') {
    return (
      <div className="ugc-form">
        <p className="ugc-error">
          That image was automatically flagged and not accepted. If this is a mistake,
          email rebecca@homemade.education with a description.
        </p>
        <button className="ugc-cta secondary" onClick={onDone} type="button">
          Close
        </button>
      </div>
    )
  }
  if (submitted === 'pending') {
    return (
      <div className="ugc-form">
        <p className="ugc-success">
          Thanks — your photo is in the moderation queue and will appear once approved.
        </p>
        <button className="ugc-cta secondary" onClick={onDone} type="button">
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="ugc-form">
      <label>Photo</label>
      {nativeReady ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="ugc-cta"
            onClick={onPickNative}
            disabled={pending || progress !== null}
          >
            {file ? 'Retake' : 'Open camera'}
          </button>
          {file && (
            <span
              style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 13,
                color: 'var(--color-warm-taupe)',
              }}
            >
              Photo ready ({Math.round(file.size / 1024)} KB)
            </span>
          )}
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPickWeb}
          disabled={pending || progress !== null}
        />
      )}
      <label>Caption (optional)</label>
      <input
        type="text"
        maxLength={280}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={pending}
      />
      {progress !== null && (
        <div style={{ height: 4, background: 'var(--color-linen-grey)', borderRadius: 2 }}>
          <div
            style={{
              height: '100%',
              background: 'var(--color-sage)',
              width: `${progress}%`,
              transition: 'width 0.2s',
              borderRadius: 2,
            }}
          />
        </div>
      )}
      {error && <p className="ugc-error">{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="ugc-cta secondary" onClick={onDone} disabled={pending} type="button">
          Cancel
        </button>
        <button
          className="ugc-cta"
          onClick={submit}
          disabled={pending || !file}
          type="button"
        >
          {pending ? '...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
