'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  moderateQuestion,
  moderateAnswer,
  adminPostAnswer,
} from '@/lib/moderation-actions'

interface AnswerRow {
  id: string
  body: string
  isAuthorAnswer: boolean
  status: string
  createdAt: Date
  user: { name: string | null; email: string; displayHandle: string | null }
}

interface QuestionRow {
  id: string
  body: string
  status: string
  upvoteCount: number
  createdAt: Date
  user: { name: string | null; email: string; displayHandle: string | null }
  tutorial: {
    title: string
    slug: string
    category: { slug: string; name: string }
  }
  answers: AnswerRow[]
}

function handleOf(u: { name: string | null; email: string; displayHandle: string | null }) {
  return u.displayHandle ?? u.name ?? u.email
}

export function QuestionModerationCard({ question }: { question: QuestionRow }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [answerDraft, setAnswerDraft] = useState('')

  const onModerate = (action: 'APPROVE' | 'HIDE' | 'REMOVE') => {
    setError(null)
    start(async () => {
      const res = await moderateQuestion({ questionId: question.id, action })
      if (!res.ok) setError(res.error)
    })
  }
  const onAnswer = () => {
    if (!answerDraft.trim()) return
    setError(null)
    start(async () => {
      const res = await adminPostAnswer({ questionId: question.id, body: answerDraft })
      if (!res.ok) setError(res.error)
      else setAnswerDraft('')
    })
  }

  const isPending = question.status === 'PENDING_MODERATION'
  const isPublished = question.status === 'PUBLISHED'

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow">
        <Link
          href={`/${question.tutorial.category.slug}/${question.tutorial.slug}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {question.tutorial.category.name} / {question.tutorial.title}
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
        <h2 className="admin-card-title">Q.</h2>
        <p className="admin-card-body" style={{ flex: 1 }}>
          {question.body}
        </p>
        <span className={`admin-pill ${question.status.toLowerCase().replace('_moderation', '')}`}>
          {question.status.replace('_', ' ').toLowerCase()}
        </span>
      </div>

      <div className="admin-card-meta">
        <span>By {handleOf(question.user)}</span>
        <span>· {question.createdAt.toLocaleDateString('en-GB')}</span>
        <span>· {question.upvoteCount} upvotes</span>
      </div>

      <div className="admin-card-actions">
        {!isPublished && (
          <button className="admin-btn" disabled={pending} onClick={() => onModerate('APPROVE')}>
            Publish
          </button>
        )}
        {(isPending || isPublished) && (
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => onModerate('HIDE')}
          >
            Hide
          </button>
        )}
        <button
          className="admin-btn danger"
          disabled={pending}
          onClick={() => onModerate('REMOVE')}
        >
          Remove
        </button>
      </div>

      {question.answers.length > 0 && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 12,
            borderTop: '0.5px solid var(--color-linen-grey)',
          }}
        >
          {question.answers.map((a) => (
            <AnswerRow key={a.id} answer={a} />
          ))}
        </div>
      )}

      {isPublished && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '0.5px solid var(--color-linen-grey)',
          }}
        >
          <div className="admin-card-eyebrow" style={{ marginBottom: 6 }}>
            Reply as Homemade
          </div>
          <textarea
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            rows={3}
            placeholder="Write a direct answer — publishes immediately with the Homemade badge."
            style={{
              width: '100%',
              fontFamily: 'var(--font-lora)',
              fontSize: 14,
              padding: 10,
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
              background: 'var(--color-soft-parchment)',
            }}
          />
          <div style={{ marginTop: 8 }}>
            <button className="admin-btn" disabled={pending || !answerDraft.trim()} onClick={onAnswer}>
              Post answer
            </button>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}

function AnswerRow({ answer }: { answer: AnswerRow }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onModerate = (action: 'APPROVE' | 'HIDE') => {
    setError(null)
    start(async () => {
      const res = await moderateAnswer({ answerId: answer.id, action })
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <div style={{ paddingTop: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 16,
            color: 'var(--color-warm-taupe)',
          }}
        >
          A.
        </span>
        <p className="admin-card-body" style={{ flex: 1, fontSize: 14 }}>
          {answer.body}
        </p>
        <span className={`admin-pill ${answer.status.toLowerCase().replace('_moderation', '')}`}>
          {answer.status.replace('_', ' ').toLowerCase()}
        </span>
      </div>
      <div className="admin-card-meta" style={{ marginTop: 4 }}>
        <span>By {handleOf(answer.user)}</span>
        {answer.isAuthorAnswer && (
          <span style={{ color: 'var(--color-sage)' }}>· from Homemade</span>
        )}
        <span>· {answer.createdAt.toLocaleDateString('en-GB')}</span>
      </div>
      <div className="admin-card-actions" style={{ marginTop: 6 }}>
        {answer.status !== 'PUBLISHED' && (
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => onModerate('APPROVE')}
          >
            Publish
          </button>
        )}
        {answer.status === 'PUBLISHED' && (
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => onModerate('HIDE')}
          >
            Hide
          </button>
        )}
      </div>
      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 6, fontSize: 12 }}>{error}</p>
      )}
    </div>
  )
}
