'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createPatternTest,
  updatePatternTest,
} from '@/lib/creator-actions'

interface Tutorial {
  id: string
  title: string
}

interface Props {
  tutorials: Tutorial[]
  defaults: {
    tutorialId: string
    title: string
    briefForTesters: string
    maxTesters: number
    recruitingClosesAt: string
  }
  /** Set for edit mode. */
  patternTestId?: string
}

export function PatternTestForm({ tutorials, defaults, patternTestId }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [tutorialId, setTutorialId] = useState(defaults.tutorialId || tutorials[0]?.id || '')
  const [title, setTitle] = useState(defaults.title)
  const [briefForTesters, setBriefForTesters] = useState(defaults.briefForTesters)
  const [maxTesters, setMaxTesters] = useState(defaults.maxTesters)
  const [recruitingClosesAt, setRecruitingClosesAt] = useState(defaults.recruitingClosesAt)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const closesAt = recruitingClosesAt
        ? new Date(recruitingClosesAt + 'T23:59:59Z')
        : null
      const payload = {
        tutorialId,
        title,
        briefForTesters,
        maxTesters: Number(maxTesters),
        recruitingClosesAt: closesAt,
      }

      const res = patternTestId
        ? await updatePatternTest({ patternTestId, ...payload })
        : await createPatternTest(payload)

      if (res.ok) {
        const idFromCreate =
          'data' in res && res.data && typeof res.data === 'object' && 'id' in res.data
            ? String((res.data as { id: string }).id)
            : null
        const id = patternTestId ?? idFromCreate
        if (id) router.push(`/me/creator/patterns/${id}`)
        else router.push('/me/creator/patterns')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form className="me-form" onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      <div className="me-field">
        <label htmlFor="tutorialId">Tutorial</label>
        <select
          id="tutorialId"
          value={tutorialId}
          onChange={(e) => setTutorialId(e.target.value)}
          disabled={pending || Boolean(patternTestId)}
          style={{
            fontFamily: 'var(--font-lora)',
            padding: '10px 12px',
            border: '0.5px solid var(--color-linen-grey)',
            borderRadius: 3,
            background: 'var(--color-cream)',
          }}
        >
          {tutorials.length === 0 ? (
            <option value="">— you don’t have any tutorials yet —</option>
          ) : (
            tutorials.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))
          )}
        </select>
        {patternTestId && (
          <span className="me-field-hint">
            The tutorial can’t be changed once the test exists.
          </span>
        )}
      </div>

      <div className="me-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What testers see on the public board"
          disabled={pending}
        />
      </div>

      <div className="me-field">
        <label htmlFor="briefForTesters">Brief for testers</label>
        <textarea
          id="briefForTesters"
          value={briefForTesters}
          onChange={(e) => setBriefForTesters(e.target.value)}
          rows={6}
          placeholder="What they’ll make, time commitment, what feedback you’re looking for."
          disabled={pending}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="me-field">
          <label htmlFor="maxTesters">Max testers</label>
          <input
            id="maxTesters"
            type="number"
            min={1}
            max={50}
            value={maxTesters}
            onChange={(e) => setMaxTesters(Number(e.target.value))}
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="recruitingClosesAt">Recruiting closes</label>
          <input
            id="recruitingClosesAt"
            type="date"
            value={recruitingClosesAt}
            onChange={(e) => setRecruitingClosesAt(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      {error && <p className="me-feedback error">{error}</p>}

      <div>
        <button type="submit" className="me-button" disabled={pending || !tutorialId}>
          {pending ? 'Saving…' : patternTestId ? 'Save changes' : 'Create pattern test'}
        </button>
      </div>
    </form>
  )
}
