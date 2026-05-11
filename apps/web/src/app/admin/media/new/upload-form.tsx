'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ImageProbe {
  width: number
  height: number
}

function probeImage(file: File): Promise<ImageProbe | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const probe = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(probe)
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
  alt: string,
  probe: ImageProbe | null,
  onProgress: (pct: number) => void,
): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/media/upload')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText)
          resolve({ id: body.id })
        } catch (err) {
          reject(new Error(`Server returned non-JSON: ${xhr.responseText.slice(0, 200)}`))
        }
        return
      }
      let message = `Upload failed (${xhr.status})`
      try {
        const body = JSON.parse(xhr.responseText)
        if (body?.error) message = body.error
      } catch {
        message = `${message}: ${xhr.responseText.slice(0, 200)}`
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Network error during upload.'))

    const form = new FormData()
    form.append('file', file)
    if (alt) form.append('alt', alt)
    if (probe) {
      form.append('width', String(probe.width))
      form.append('height', String(probe.height))
    }
    xhr.send(form)
  })
}

export function UploadForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Choose a file first.')
      return
    }
    setError(null)
    setStatus('uploading')
    setProgress(0)

    const probe = await probeImage(file)

    try {
      await uploadWithProgress(file, alt, probe, setProgress)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload failed.')
      return
    }

    router.push('/admin/media')
    router.refresh()
  }

  const busy = status === 'uploading'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <label className="block">
        <span
          className="block text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
        >
          Image file <span className="ml-2 text-[var(--color-burnt-sienna)]">*</span>
        </span>
        <span
          className="mb-2 mt-1 block text-xs text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
        >
          JPEG, PNG, WebP, or GIF. Stored on Cloudflare R2; delivered through
          Image Transformations at request time.
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          required
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        />
      </label>

      <label className="block">
        <span
          className="block text-xs uppercase text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
        >
          Alt text
        </span>
        <span
          className="mb-2 mt-1 block text-xs text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
        >
          What the image shows. Used by screen readers and as a fallback when the image fails to
          load.
        </span>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          disabled={busy}
          className="w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem' }}
        />
      </label>

      {progress !== null && (
        <div className="space-y-2">
          <div
            className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            {status === 'uploading' && progress < 100 ? `uploading ${progress}%` : null}
            {status === 'uploading' && progress === 100 ? 'saving…' : null}
            {status === 'error' ? 'upload failed' : null}
          </div>
          <div className="h-1 w-full bg-[var(--color-linen-grey)]">
            <div
              className="h-full bg-[var(--color-sage)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p
          className="text-sm text-[var(--color-burnt-sienna)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {error}
        </p>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={busy || !file}
          className="bg-[var(--color-sage)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {busy ? 'uploading…' : 'upload'}
        </button>
      </div>
    </form>
  )
}
