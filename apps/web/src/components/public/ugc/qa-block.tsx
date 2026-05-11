'use client'

import { useState, useTransition } from 'react'
import {
  submitQuestion,
  submitAnswer,
  toggleQuestionUpvote,
} from '@/lib/ugc-actions'
import { ReportModal } from './report-modal'

interface AnswerRow {
  id: string
  body: string
  authorHandle: string
  isAuthorAnswer: boolean
  createdAt: string
  isMine: boolean
}

interface QuestionRow {
  id: string
  body: string
  upvoteCount: number
  upvoted: boolean
  authorHandle: string
  createdAt: string
  answers: AnswerRow[]
  isMine: boolean
}

interface Props {
  tutorialId: string
  signedIn: boolean
  questions: QuestionRow[]
}

export function QaBlock(props: Props) {
  const [composerOpen, setComposerOpen] = useState(false)
  const [report, setReport] = useState<
    | { type: 'QUESTION' | 'ANSWER'; id: string }
    | null
  >(null)

  return (
    <section className="ugc-section" id="qa">
      <span className="ugc-section-eyebrow">Questions and answers</span>
      <h2 className="ugc-section-title">Q&amp;A</h2>
      <p className="ugc-section-description">
        Ask anything — recipe substitutions, technique queries, why-mine-didn’t-work.
        Editors and other readers chime in.
      </p>

      {props.signedIn && !composerOpen && (
        <button className="ugc-cta" onClick={() => setComposerOpen(true)} type="button">
          Ask a question
        </button>
      )}
      {!props.signedIn && (
        <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
          Sign in to ask a question.
        </p>
      )}
      {composerOpen && (
        <QuestionComposer
          tutorialId={props.tutorialId}
          onDone={() => setComposerOpen(false)}
        />
      )}

      <div style={{ marginTop: 16 }}>
        {props.questions.map((q) => (
          <QuestionRowView
            key={q.id}
            question={q}
            signedIn={props.signedIn}
            onReport={(t, id) => setReport({ type: t, id })}
          />
        ))}
      </div>

      {report && (
        <ReportModal
          targetType={report.type}
          targetId={report.id}
          onClose={() => setReport(null)}
        />
      )}
    </section>
  )
}

function QuestionComposer({
  tutorialId,
  onDone,
}: {
  tutorialId: string
  onDone: () => void
}) {
  const [pending, start] = useTransition()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await submitQuestion({ tutorialId, body })
      if (!res.ok) setError(res.error)
      else setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="ugc-form">
        <p className="ugc-success">
          Thanks — your question is in the moderation queue and will appear once approved.
        </p>
        <div>
          <button className="ugc-cta secondary" onClick={onDone} type="button">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ugc-form">
      <label>Your question</label>
      <textarea
        rows={3}
        maxLength={1000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={pending}
      />
      {error && <p className="ugc-error">{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="ugc-cta secondary" onClick={onDone} disabled={pending} type="button">
          Cancel
        </button>
        <button className="ugc-cta" onClick={submit} disabled={pending} type="button">
          {pending ? '...' : 'Ask'}
        </button>
      </div>
    </div>
  )
}

function QuestionRowView({
  question,
  signedIn,
  onReport,
}: {
  question: QuestionRow
  signedIn: boolean
  onReport: (type: 'QUESTION' | 'ANSWER', id: string) => void
}) {
  const [upvoted, setUpvoted] = useState(question.upvoted)
  const [count, setCount] = useState(question.upvoteCount)
  const [answerOpen, setAnswerOpen] = useState(false)
  const [pending, start] = useTransition()

  const upvote = () => {
    if (!signedIn) return
    start(async () => {
      const res = await toggleQuestionUpvote(question.id)
      if (res.ok) {
        setUpvoted(res.upvoted ?? false)
        setCount(res.upvoteCount ?? count)
      }
    })
  }

  return (
    <div className="ugc-question">
      <p className="ugc-question-body">{question.body}</p>
      <div className="ugc-question-meta">
        <span>{question.authorHandle}</span>
        <span>· {question.createdAt}</span>
        <button
          onClick={upvote}
          disabled={pending || !signedIn || question.isMine}
          className={upvoted ? 'active' : ''}
          aria-pressed={upvoted}
        >
          ▲ {count}
        </button>
        {signedIn && (
          <button onClick={() => setAnswerOpen((v) => !v)}>
            {answerOpen ? 'Cancel' : 'Answer'}
          </button>
        )}
        {!question.isMine && signedIn && (
          <button onClick={() => onReport('QUESTION', question.id)}>Report</button>
        )}
      </div>
      {answerOpen && (
        <AnswerComposer
          questionId={question.id}
          onDone={() => setAnswerOpen(false)}
        />
      )}
      {question.answers.length > 0 && (
        <div className="ugc-answers">
          {question.answers.map((a) => (
            <div key={a.id} className={`ugc-answer ${a.isAuthorAnswer ? 'author' : ''}`}>
              <p style={{ margin: 0 }}>{a.body}</p>
              <div className="ugc-question-meta">
                <span>{a.authorHandle}</span>
                {a.isAuthorAnswer && <span className="ugc-author-badge">from Homemade</span>}
                <span>· {a.createdAt}</span>
                {!a.isMine && signedIn && (
                  <button onClick={() => onReport('ANSWER', a.id)}>Report</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnswerComposer({
  questionId,
  onDone,
}: {
  questionId: string
  onDone: () => void
}) {
  const [pending, start] = useTransition()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await submitAnswer({ questionId, body })
      if (!res.ok) setError(res.error)
      else setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="ugc-form">
        <p className="ugc-success">Thanks — your answer will appear once approved.</p>
        <div>
          <button className="ugc-cta secondary" onClick={onDone} type="button">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ugc-form">
      <label>Your answer</label>
      <textarea
        rows={3}
        maxLength={5000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={pending}
      />
      {error && <p className="ugc-error">{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="ugc-cta secondary" onClick={onDone} disabled={pending} type="button">
          Cancel
        </button>
        <button className="ugc-cta" onClick={submit} disabled={pending} type="button">
          {pending ? '...' : 'Post answer'}
        </button>
      </div>
    </div>
  )
}
