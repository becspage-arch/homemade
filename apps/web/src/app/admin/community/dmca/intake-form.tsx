'use client'

import { useState, useTransition } from 'react'
import { createDmcaRequest } from '@/lib/admin-data-rights-actions'

export function DmcaIntakeForm() {
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const [claimantName, setClaimantName] = useState('')
  const [claimantEmail, setClaimantEmail] = useState('')
  const [claimantAddress, setClaimantAddress] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [contentDescription, setContentDescription] = useState('')
  const [sworn, setSworn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = () => {
    setError(null)
    setSuccess(false)
    start(async () => {
      const res = await createDmcaRequest({
        claimantName,
        claimantEmail,
        claimantAddress: claimantAddress || undefined,
        contentUrl,
        contentDescription,
        swornStatementAccepted: sworn,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSuccess(true)
      setClaimantName('')
      setClaimantEmail('')
      setClaimantAddress('')
      setContentUrl('')
      setContentDescription('')
      setSworn(false)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <div className="admin-notice">
        <button
          type="button"
          className="admin-btn"
          onClick={() => setOpen(true)}
        >
          Log a new DMCA notice
        </button>
        {success && (
          <span style={{ marginLeft: 16, color: 'var(--color-forest)' }}>
            Logged.
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="admin-card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0 }}>New DMCA notice</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        <input
          type="text"
          placeholder="Claimant name"
          value={claimantName}
          onChange={(e) => setClaimantName(e.target.value)}
          disabled={pending}
        />
        <input
          type="email"
          placeholder="Claimant email"
          value={claimantEmail}
          onChange={(e) => setClaimantEmail(e.target.value)}
          disabled={pending}
        />
        <input
          type="text"
          placeholder="Claimant postal address (optional)"
          value={claimantAddress}
          onChange={(e) => setClaimantAddress(e.target.value)}
          disabled={pending}
        />
        <input
          type="url"
          placeholder="URL or location of infringing content"
          value={contentUrl}
          onChange={(e) => setContentUrl(e.target.value)}
          disabled={pending}
        />
        <textarea
          placeholder="Description of the copyrighted work and how it is being infringed"
          rows={4}
          value={contentDescription}
          onChange={(e) => setContentDescription(e.target.value)}
          disabled={pending}
        />
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
          <input
            type="checkbox"
            checked={sworn}
            onChange={(e) => setSworn(e.target.checked)}
            disabled={pending}
            style={{ marginTop: 4 }}
          />
          <span>
            The claimant provided a sworn statement of good-faith belief AND
            an accurate-information statement (under penalty of perjury) AND
            is authorised to act on behalf of the rights-holder.
          </span>
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="admin-btn"
            onClick={submit}
            disabled={pending || !sworn}
          >
            {pending ? '…' : 'Log notice'}
          </button>
          <button
            type="button"
            className="admin-btn secondary"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </button>
        </div>
        {error && (
          <p style={{ color: 'var(--color-burnt-sienna)', fontSize: 13 }}>{error}</p>
        )}
      </div>
    </div>
  )
}
