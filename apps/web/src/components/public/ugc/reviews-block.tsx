'use client'

import { useState, useTransition } from 'react'
import {
  submitReview,
  toggleReviewHelpful,
} from '@/lib/ugc-actions'
import { ReportModal } from './report-modal'

interface ReviewRow {
  id: string
  rating: number
  title: string | null
  body: string
  helpfulCount: number
  createdAt: string
  authorHandle: string
  isMine: boolean
  helpful: boolean
}

interface Props {
  tutorialId: string
  signedIn: boolean
  canReview: boolean
  alreadyReviewed: boolean
  /** Summary stats — average rating and per-bucket counts. */
  avg: number | null
  total: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  reviews: ReviewRow[]
}

export function ReviewsBlock(props: Props) {
  const [composerOpen, setComposerOpen] = useState(false)
  const [reportFor, setReportFor] = useState<string | null>(null)

  return (
    <section className="ugc-section" id="reviews">
      <span className="ugc-section-eyebrow">Made by the community</span>
      <h2 className="ugc-section-title">Reviews</h2>

      {props.total > 0 ? (
        <ReviewSummary
          avg={props.avg}
          total={props.total}
          distribution={props.distribution}
        />
      ) : (
        <p className="ugc-section-description">
          Nobody’s reviewed this one yet. Be the first once you’ve made it.
        </p>
      )}

      <ReviewCta
        signedIn={props.signedIn}
        canReview={props.canReview}
        alreadyReviewed={props.alreadyReviewed}
        onCompose={() => setComposerOpen(true)}
        open={composerOpen}
        tutorialId={props.tutorialId}
        onClose={() => setComposerOpen(false)}
      />

      <div>
        {props.reviews.map((r) => (
          <ReviewRowView
            key={r.id}
            review={r}
            onReport={(id) => setReportFor(id)}
            signedIn={props.signedIn}
          />
        ))}
      </div>

      {reportFor && (
        <ReportModal
          targetType="REVIEW"
          targetId={reportFor}
          onClose={() => setReportFor(null)}
        />
      )}
    </section>
  )
}

function ReviewSummary({
  avg,
  total,
  distribution,
}: {
  avg: number | null
  total: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}) {
  return (
    <div className="ugc-summary">
      <div>
        <div className="ugc-summary-avg">
          {avg !== null ? avg.toFixed(1) : '—'}
          <small>{total} review{total === 1 ? '' : 's'}</small>
        </div>
      </div>
      <div className="ugc-summary-bars">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars as 1 | 2 | 3 | 4 | 5] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={stars} className="ugc-summary-bar-row">
              <span>{stars}★</span>
              <span className="ugc-summary-bar-track">
                <span
                  className="ugc-summary-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span style={{ textAlign: 'right' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReviewCta({
  signedIn,
  canReview,
  alreadyReviewed,
  onCompose,
  open,
  onClose,
  tutorialId,
}: {
  signedIn: boolean
  canReview: boolean
  alreadyReviewed: boolean
  onCompose: () => void
  open: boolean
  onClose: () => void
  tutorialId: string
}) {
  if (!signedIn) {
    return (
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
        Sign in to leave a review once you’ve made this.
      </p>
    )
  }
  if (alreadyReviewed) {
    return (
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
        You’ve already reviewed this one.
      </p>
    )
  }
  if (!canReview) {
    return (
      <button className="ugc-cta" disabled aria-disabled="true">
        Write a review once you’ve made this
      </button>
    )
  }
  return (
    <>
      {!open && (
        <button className="ugc-cta" onClick={onCompose} type="button">
          Write a review
        </button>
      )}
      {open && <ReviewComposer tutorialId={tutorialId} onDone={onClose} />}
    </>
  )
}

function ReviewComposer({
  tutorialId,
  onDone,
}: {
  tutorialId: string
  onDone: () => void
}) {
  const [pending, start] = useTransition()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await submitReview({
        tutorialId,
        rating,
        title: title || null,
        body,
      })
      if (!res.ok) setError(res.error)
      else setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="ugc-form">
        <p className="ugc-success">
          Thanks — your review is in the moderation queue and will appear once approved.
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
      <label>Rating</label>
      <div className="ugc-rating-input">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            className={s <= rating ? 'active' : ''}
            aria-label={`${s} star${s === 1 ? '' : 's'}`}
            onClick={() => setRating(s)}
          >
            ★
          </button>
        ))}
      </div>

      <label>Title (optional)</label>
      <input
        type="text"
        maxLength={120}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={pending}
      />

      <label>Your review</label>
      <textarea
        rows={5}
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
          {pending ? '...' : 'Submit for review'}
        </button>
      </div>
    </div>
  )
}

function ReviewRowView({
  review,
  onReport,
  signedIn,
}: {
  review: ReviewRow
  onReport: (id: string) => void
  signedIn: boolean
}) {
  const [helpful, setHelpful] = useState(review.helpful)
  const [count, setCount] = useState(review.helpfulCount)
  const [pending, start] = useTransition()

  const toggle = () => {
    if (!signedIn) return
    start(async () => {
      const res = await toggleReviewHelpful(review.id)
      if (res.ok) {
        setHelpful(res.helpful ?? false)
        setCount(res.helpfulCount ?? count)
      }
    })
  }

  return (
    <div className="ugc-review">
      <div className="ugc-review-stars" aria-label={`${review.rating} stars`}>
        {'★'.repeat(review.rating)}
        <span style={{ color: 'var(--color-linen-grey)' }}>{'★'.repeat(5 - review.rating)}</span>
      </div>
      {review.title && <h3>{review.title}</h3>}
      <p className="ugc-review-body">{review.body}</p>
      <div className="ugc-review-meta">
        <span>{review.authorHandle}</span>
        <span>· {review.createdAt}</span>
      </div>
      <div className="ugc-review-actions">
        <button
          className={helpful ? 'active' : ''}
          onClick={toggle}
          disabled={pending || !signedIn || review.isMine}
          aria-pressed={helpful}
        >
          {helpful ? '✓ ' : ''}Helpful ({count})
        </button>
        {!review.isMine && signedIn && (
          <button onClick={() => onReport(review.id)}>Report</button>
        )}
      </div>
    </div>
  )
}
