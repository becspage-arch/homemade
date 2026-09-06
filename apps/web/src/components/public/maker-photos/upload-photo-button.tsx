'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import type { PatternType } from '@homemade/db'
import { submitMakerPhoto } from '@/lib/maker-photo-actions'
import {
  captureNativePhoto,
  compressImage,
  isNativeCameraAvailable,
} from '@/lib/native-camera'

import './maker-photos.css'

/**
 * "Upload photo". The one upload control on the site: pattern pages, tutorial
 * and recipe pages, the finish moment, and the tester feedback form all use
 * this. The label never changes.
 */

export interface UploadPhotoButtonProps {
  /** Exactly one of the two. */
  tutorialId?: string | null
  patternId?: string | null
  patternType?: PatternType | null
  /** Set on the tester feedback form. */
  testAssignmentId?: string | null
  signedIn: boolean
  /** Where sign-in should bring them back to. */
  returnTo?: string | null
  variant?: 'primary' | 'secondary'
}

interface UploadResponse {
  key: string
  publicUrl: string
  error?: string
}

const TERMS_LABEL =
  'I made this and took the photo. Nobody else is in it unless they have agreed. I am happy for Homemade to show it on the site and in Homemade’s own promotion, with my handle. I can take it down at any time from My photos.'

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
          reject(new Error('The server sent something we could not read.'))
        }
        return
      }
      let message = `The upload failed (${xhr.status}).`
      try {
        const body = JSON.parse(xhr.responseText)
        if (body?.error) message = body.error
      } catch {
        // keep the status message
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('The connection dropped. Try again.'))
    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}

export function UploadPhotoButton(props: UploadPhotoButtonProps) {
  const [open, setOpen] = useState(false)

  if (!props.signedIn) {
    return (
      <Link
        className={`maker-photo-upload-button ${props.variant === 'secondary' ? 'secondary' : ''}`}
        href={props.returnTo ? `/sign-in?redirect_url=${encodeURIComponent(props.returnTo)}` : '/sign-in'}
      >
        Upload photo
      </Link>
    )
  }

  return (
    <div className="maker-photo-upload">
      {!open && (
        <button
          type="button"
          className={`maker-photo-upload-button ${props.variant === 'secondary' ? 'secondary' : ''}`}
          onClick={() => setOpen(true)}
        >
          Upload photo
        </button>
      )}
      {open && <UploadForm {...props} onDone={() => setOpen(false)} />}
    </div>
  )
}

type Outcome =
  | { kind: 'approved' }
  | { kind: 'rejected'; reasons: string[] }
  | { kind: 'pending' }

function UploadForm(props: UploadPhotoButtonProps & { onDone: () => void }) {
  const [pending, start] = useTransition()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [nativeReady, setNativeReady] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setNativeReady(isNativeCameraAvailable()))
    return () => window.cancelAnimationFrame(id)
  }, [])

  async function pickNative() {
    setError(null)
    const captured = await captureNativePhoto()
    if (!captured) {
      setError('The camera did not open. Choose a photo instead.')
      return
    }
    setFile(captured)
  }

  async function pickWeb(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    if (!picked) {
      setFile(null)
      return
    }
    try {
      setFile(await compressImage(picked))
    } catch {
      setFile(picked)
    }
  }

  async function submit() {
    if (!file) {
      setError('Choose a photo first.')
      return
    }
    if (!agreed) {
      setError('Tick the box before uploading.')
      return
    }
    setError(null)
    setProgress(0)

    const probe = await probeImage(file)

    let uploaded: UploadResponse
    try {
      uploaded = await uploadWithProgress(file, setProgress)
    } catch (err) {
      setProgress(null)
      setError(err instanceof Error ? err.message : 'The upload failed.')
      return
    }

    start(async () => {
      const res = await submitMakerPhoto({
        tutorialId: props.tutorialId ?? null,
        patternId: props.patternId ?? null,
        patternType: props.patternType ?? null,
        testAssignmentId: props.testAssignmentId ?? null,
        r2Key: uploaded.key,
        caption: caption || null,
        filename: file.name,
        mimeType: file.type || null,
        width: probe?.width ?? null,
        height: probe?.height ?? null,
        bytes: file.size,
        agreed: true,
      })
      setProgress(null)
      if (!res.ok) {
        setError(res.error)
        return
      }
      if (res.status === 'APPROVED') setOutcome({ kind: 'approved' })
      else if (res.status === 'REJECTED') setOutcome({ kind: 'rejected', reasons: res.reasons })
      else setOutcome({ kind: 'pending' })
    })
  }

  if (outcome) {
    return (
      <div className="maker-photo-form">
        {outcome.kind === 'approved' && (
          <p className="maker-photo-note">Your photo is on the page. Thank you.</p>
        )}
        {outcome.kind === 'pending' && (
          <p className="maker-photo-note">
            Checking your photo. It appears here once the check finishes.
          </p>
        )}
        {outcome.kind === 'rejected' && (
          <>
            <p className="maker-photo-error">
              {outcome.reasons.length > 0
                ? outcome.reasons.join(' ')
                : 'This photo was not accepted.'}
            </p>
            <p className="maker-photo-note">
              If you think that is wrong, go to <Link href="/me/photos">My photos</Link> and
              ask us to look again.
            </p>
          </>
        )}
        <div className="maker-photo-actions">
          <button
            type="button"
            className="maker-photo-upload-button secondary"
            onClick={props.onDone}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="maker-photo-form">
      <label htmlFor="maker-photo-file">Photo</label>
      {nativeReady ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="maker-photo-upload-button"
            onClick={pickNative}
            disabled={pending || progress !== null}
          >
            {file ? 'Retake' : 'Open camera'}
          </button>
          {file && <span className="maker-photo-note">Photo ready.</span>}
        </div>
      ) : (
        <input
          id="maker-photo-file"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pickWeb}
          disabled={pending || progress !== null}
        />
      )}

      <label htmlFor="maker-photo-caption">Caption (optional)</label>
      <input
        id="maker-photo-caption"
        type="text"
        maxLength={280}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={pending}
      />

      <label className="maker-photo-terms">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={pending}
        />
        <span>{TERMS_LABEL}</span>
      </label>
      <p className="maker-photo-note">
        <Link href="/legal/photos">Your photos on Homemade</Link>
      </p>

      {progress !== null && (
        <div className="maker-photo-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="maker-photo-error">{error}</p>}

      <div className="maker-photo-actions">
        <button
          type="button"
          className="maker-photo-upload-button secondary"
          onClick={props.onDone}
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="maker-photo-upload-button"
          onClick={submit}
          disabled={pending || !file || !agreed}
        >
          {pending ? 'Uploading…' : 'Upload photo'}
        </button>
      </div>
    </div>
  )
}
