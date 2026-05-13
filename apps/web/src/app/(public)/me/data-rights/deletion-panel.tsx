'use client'

import { useState, useTransition } from 'react'
import {
  cancelAccountDeletion,
  scheduleAccountDeletion,
} from '@/lib/data-rights-actions'

interface DeletionPanelProps {
  scheduled: { id: string; scheduledFor: string; requestedAt: string } | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function daysLeft(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export function DeletionPanel({ scheduled }: DeletionPanelProps) {
  const [pending, start] = useTransition()
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schedule = () => {
    setError(null)
    start(async () => {
      const res = await scheduleAccountDeletion(reason)
      if (!res.ok) setError(res.error)
      setConfirming(false)
    })
  }

  const cancel = () => {
    setError(null)
    start(async () => {
      const res = await cancelAccountDeletion()
      if (!res.ok) setError(res.error)
    })
  }

  if (scheduled) {
    return (
      <section>
        <span className="me-section-label">Section 2</span>
        <h2 className="me-section-title">Account deletion scheduled</h2>
        <div className="me-data-warning">
          <p>
            Your account is scheduled to be deleted on{' '}
            <strong>{formatDate(scheduled.scheduledFor)}</strong> —{' '}
            {daysLeft(scheduled.scheduledFor)} days from now. The account
            is suspended while the grace period runs. After deletion your
            tutorials, reviews, photos, questions, answers, and project
            notes will be removed. Audit-log entries are kept with your
            identifying email replaced by a placeholder.
          </p>
          <p>You can change your mind any time before that date.</p>
          <button
            type="button"
            className="me-button"
            onClick={cancel}
            disabled={pending}
          >
            {pending ? 'Cancelling…' : 'Cancel deletion'}
          </button>
          {error && <p className="me-feedback error">{error}</p>}
        </div>
      </section>
    )
  }

  return (
    <section>
      <span className="me-section-label">Section 2</span>
      <h2 className="me-section-title">Delete my account</h2>
      <p className="me-section-description">
        Schedules your account for deletion in 30 days. During those 30 days
        the account is suspended (you can&apos;t sign in or post), but you can
        cancel and bring it back. After 30 days your account and personal
        data are permanently removed.
      </p>
      <p className="me-section-description">
        We keep a record of admin and editorial actions you took — for
        audit purposes — with your identifying email replaced by a
        placeholder. Reviews, photos, questions, answers, project notes,
        bookmarks and projects are removed entirely.
      </p>

      {!confirming ? (
        <button
          type="button"
          className="me-button danger"
          onClick={() => setConfirming(true)}
        >
          Start account deletion
        </button>
      ) : (
        <div className="me-confirm-block">
          <label className="me-field">
            <span>Why are you leaving? (Optional)</span>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Anything you want us to know."
              disabled={pending}
            />
          </label>
          <p className="me-section-description">
            We&apos;ll schedule deletion for 30 days from now. The account will
            be suspended in the meantime, and you can cancel any time
            before that date.
          </p>
          <div className="me-button-row">
            <button
              type="button"
              className="me-button danger"
              onClick={schedule}
              disabled={pending}
            >
              {pending ? 'Scheduling…' : 'Confirm — schedule deletion'}
            </button>
            <button
              type="button"
              className="me-button secondary"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Keep my account
            </button>
          </div>
          {error && <p className="me-feedback error">{error}</p>}
        </div>
      )}
    </section>
  )
}
