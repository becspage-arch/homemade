'use client'

import { useState, useRef, useTransition } from 'react'
import { USER_SUBMISSION_ENABLED } from '@/lib/config'

interface Props {
  patternId: string
  patternType: 'CROSS_STITCH' | 'CROCHET_CHART'
}

/**
 * User photo submission panel. Renders null when USER_SUBMISSION_ENABLED is
 * false. When enabled, shows a file input + caption form that posts to
 * /api/user-pattern-photos.
 */
export function UserPhotoSubmissionPanel({ patternId, patternType }: Props) {
  if (!USER_SUBMISSION_ENABLED) return null

  return <SubmissionForm patternId={patternId} patternType={patternType} />
}

function SubmissionForm({ patternId, patternType }: Props) {
  const [pending, start] = useTransition()
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Please choose a photo.')
      return
    }

    const formData = new FormData()
    formData.set('patternId', patternId)
    formData.set('patternType', patternType)
    formData.set('caption', caption)
    formData.set('file', file)

    start(async () => {
      const res = await fetch('/api/user-pattern-photos', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  if (success) {
    return (
      <div className="my-6 rounded-lg border border-sage-200 bg-cream-50 px-6 py-5">
        <p className="font-lora text-sm text-stone-600">
          Photo submitted. It will appear on this page once reviewed.
        </p>
      </div>
    )
  }

  return (
    <div className="my-6 rounded-lg border border-sage-200 bg-cream-50 px-6 py-5">
      <p className="mb-4 font-lora text-sm font-semibold text-stone-700">
        Share a photo of your finished piece
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          disabled={pending}
          className="font-lora text-sm text-stone-600"
        />
        <textarea
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={pending}
          rows={2}
          maxLength={400}
          className="rounded border border-stone-200 bg-white px-3 py-2 font-lora text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded bg-sage-600 px-4 py-2 font-lora text-sm text-white hover:bg-sage-700 disabled:opacity-50"
        >
          {pending ? 'Submitting...' : 'Submit photo'}
        </button>
        {error && <p className="font-lora text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
