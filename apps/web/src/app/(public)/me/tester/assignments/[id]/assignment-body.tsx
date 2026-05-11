'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  startTestAssignment,
  withdrawTestAssignment,
  submitTestFeedback,
} from '@/lib/creator-actions'

type TestAssignmentStatus =
  | 'APPLIED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'WITHDRAWN'
  | 'REJECTED'

interface Props {
  assignmentId: string
  status: TestAssignmentStatus
  estimatedMinutes: number | null
  existingFeedback: Record<string, unknown> | null
}

interface ScoreField {
  score: number
  comment: string
}

function asScoreField(raw: unknown): ScoreField {
  if (raw && typeof raw === 'object') {
    const obj = raw as { score?: unknown; comment?: unknown }
    return {
      score:
        typeof obj.score === 'number' && obj.score >= 1 && obj.score <= 5
          ? obj.score
          : 3,
      comment: typeof obj.comment === 'string' ? obj.comment : '',
    }
  }
  return { score: 3, comment: '' }
}

export function AssignmentBody({
  assignmentId,
  status,
  estimatedMinutes,
  existingFeedback,
}: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [patternClarity, setPatternClarity] = useState<ScoreField>(
    asScoreField(existingFeedback?.patternClarity),
  )
  const [instructionClarity, setInstructionClarity] = useState<ScoreField>(
    asScoreField(existingFeedback?.instructionClarity),
  )
  const [photoAccuracy, setPhotoAccuracy] = useState<ScoreField>(
    asScoreField(existingFeedback?.photoAccuracy),
  )
  const [suppliesAccuracy, setSuppliesAccuracy] = useState<ScoreField>(
    asScoreField(existingFeedback?.suppliesAccuracy),
  )
  const [timeTaken, setTimeTaken] = useState<string>(
    typeof existingFeedback?.timeTakenMinutes === 'number'
      ? String(existingFeedback.timeTakenMinutes)
      : '',
  )
  const [whatWorked, setWhatWorked] = useState<string>(
    typeof existingFeedback?.whatWorked === 'string' ? existingFeedback.whatWorked : '',
  )
  const [whatDidnt, setWhatDidnt] = useState<string>(
    typeof existingFeedback?.whatDidnt === 'string' ? existingFeedback.whatDidnt : '',
  )

  function start_() {
    setError(null)
    start(async () => {
      const res = await startTestAssignment({ assignmentId })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function withdraw() {
    if (!confirm('Withdraw from this pattern test?')) return
    setError(null)
    start(async () => {
      const res = await withdrawTestAssignment({ assignmentId })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const timeNum = timeTaken === '' ? null : Number.parseInt(timeTaken, 10)
      const res = await submitTestFeedback({
        assignmentId,
        feedback: {
          patternClarityScore: patternClarity.score,
          patternClarityComment: patternClarity.comment,
          instructionClarityScore: instructionClarity.score,
          instructionClarityComment: instructionClarity.comment,
          photoAccuracyScore: photoAccuracy.score,
          photoAccuracyComment: photoAccuracy.comment,
          suppliesAccuracyScore: suppliesAccuracy.score,
          suppliesAccuracyComment: suppliesAccuracy.comment,
          timeTakenMinutes:
            timeNum !== null && Number.isFinite(timeNum) && timeNum >= 0 ? timeNum : null,
          estimatedTimeMinutes: estimatedMinutes,
          whatWorked,
          whatDidnt,
        },
      })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  if (
    status === 'APPLIED' ||
    status === 'REJECTED' ||
    status === 'WITHDRAWN'
  ) {
    return (
      <section>
        <span className="me-section-label">Status</span>
        <h2 className="me-section-title">
          {status === 'APPLIED' && 'Waiting on the creator'}
          {status === 'REJECTED' && 'Not this round'}
          {status === 'WITHDRAWN' && 'Withdrawn'}
        </h2>
        <p className="me-empty">
          {status === 'APPLIED' &&
            'Your application is under review. You’ll get a notification when there’s news.'}
          {status === 'REJECTED' &&
            'The creator didn’t take your application this time. Plenty more tests to apply to.'}
          {status === 'WITHDRAWN' && 'You withdrew from this test.'}
        </p>
        {error && <p className="me-feedback error">{error}</p>}
      </section>
    )
  }

  if (status === 'COMPLETED') {
    return (
      <section>
        <span className="me-section-label">Submitted</span>
        <h2 className="me-section-title">Thanks for your feedback</h2>
        <p className="me-empty">
          Your notes have been sent to the creator. You can review what you wrote below.
        </p>
        <FeedbackReadOnly
          patternClarity={patternClarity}
          instructionClarity={instructionClarity}
          photoAccuracy={photoAccuracy}
          suppliesAccuracy={suppliesAccuracy}
          timeTaken={timeTaken}
          whatWorked={whatWorked}
          whatDidnt={whatDidnt}
        />
      </section>
    )
  }

  return (
    <>
      <section>
        <span className="me-section-label">Status</span>
        <h2 className="me-section-title">
          {status === 'ACCEPTED' ? 'Ready when you are' : 'Making it now'}
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {status === 'ACCEPTED' && (
            <button type="button" className="me-button" disabled={pending} onClick={start_}>
              Start the test
            </button>
          )}
          <button type="button" className="me-button danger" disabled={pending} onClick={withdraw}>
            Withdraw
          </button>
        </div>
      </section>

      <section>
        <span className="me-section-label">Feedback form</span>
        <h2 className="me-section-title">When you’re done, fill this in</h2>
        <p className="me-section-description">
          Each score is 1 (didn’t work) to 5 (worked beautifully).
        </p>
        <form className="me-form" onSubmit={submit} style={{ maxWidth: 720 }}>
          <ScoreRow label="Pattern clarity" value={patternClarity} onChange={setPatternClarity} disabled={pending} />
          <ScoreRow
            label="Instruction clarity"
            value={instructionClarity}
            onChange={setInstructionClarity}
            disabled={pending}
          />
          <ScoreRow label="Photo accuracy" value={photoAccuracy} onChange={setPhotoAccuracy} disabled={pending} />
          <ScoreRow
            label="Supplies list accuracy"
            value={suppliesAccuracy}
            onChange={setSuppliesAccuracy}
            disabled={pending}
          />

          <div className="me-field">
            <label htmlFor="timeTaken">Time taken (minutes)</label>
            <input
              id="timeTaken"
              type="number"
              min={0}
              value={timeTaken}
              onChange={(e) => setTimeTaken(e.target.value)}
              disabled={pending}
            />
            <span className="me-field-hint">
              {estimatedMinutes != null
                ? `The tutorial estimates ${estimatedMinutes} min.`
                : 'No estimate set on this tutorial.'}
            </span>
          </div>

          <div className="me-field">
            <label htmlFor="whatWorked">What worked</label>
            <textarea
              id="whatWorked"
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              rows={4}
              disabled={pending}
            />
          </div>

          <div className="me-field">
            <label htmlFor="whatDidnt">What didn’t</label>
            <textarea
              id="whatDidnt"
              value={whatDidnt}
              onChange={(e) => setWhatDidnt(e.target.value)}
              rows={4}
              disabled={pending}
            />
          </div>

          {error && <p className="me-feedback error">{error}</p>}

          <div>
            <button type="submit" className="me-button" disabled={pending}>
              {pending ? 'Submitting…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

function ScoreRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: ScoreField
  onChange: (next: ScoreField) => void
  disabled?: boolean
}) {
  return (
    <div className="me-field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...value, score: n })}
            className={value.score === n ? 'me-button' : 'me-button secondary'}
            style={{ padding: '6px 14px', fontSize: 14 }}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="A short note (optional)"
        value={value.comment}
        onChange={(e) => onChange({ ...value, comment: e.target.value })}
        disabled={disabled}
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 14,
          padding: '8px 10px',
          border: '0.5px solid var(--color-linen-grey)',
          borderRadius: 3,
          background: 'var(--color-cream)',
          marginTop: 8,
        }}
      />
    </div>
  )
}

function FeedbackReadOnly(props: {
  patternClarity: ScoreField
  instructionClarity: ScoreField
  photoAccuracy: ScoreField
  suppliesAccuracy: ScoreField
  timeTaken: string
  whatWorked: string
  whatDidnt: string
}) {
  return (
    <div style={{ fontFamily: 'var(--font-lora)', marginTop: 14, lineHeight: 1.7 }}>
      <Row label="Pattern clarity" value={props.patternClarity} />
      <Row label="Instruction clarity" value={props.instructionClarity} />
      <Row label="Photo accuracy" value={props.photoAccuracy} />
      <Row label="Supplies accuracy" value={props.suppliesAccuracy} />
      {props.timeTaken && (
        <p>
          <strong>Time taken:</strong> {props.timeTaken} min
        </p>
      )}
      {props.whatWorked && (
        <p>
          <strong>What worked:</strong> {props.whatWorked}
        </p>
      )}
      {props.whatDidnt && (
        <p>
          <strong>What didn’t:</strong> {props.whatDidnt}
        </p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: ScoreField }) {
  return (
    <p>
      <strong>{label}:</strong> {value.score}/5{value.comment ? ` — ${value.comment}` : ''}
    </p>
  )
}
