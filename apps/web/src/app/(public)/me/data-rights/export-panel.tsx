'use client'

import { useState, useTransition } from 'react'
import { requestDataExport } from '@/lib/data-rights-actions'
import { captureClientEvent } from '@/lib/client-analytics'

interface ExportHistoryItem {
  id: string
  status: string
  createdAt: string
  completedAt: string | null
  expiresAt: string | null
  error: string | null
}

interface ReadyExport {
  id: string
  fileUrl: string | null
  bytes: number | null
  completedAt: string | null
  expiresAt: string | null
}

interface ExportPanelProps {
  latestReady: ReadyExport | null
  history: ExportHistoryItem[]
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB')
}

export function ExportPanel({ latestReady, history }: ExportPanelProps) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const run = () => {
    setError(null)
    start(async () => {
      const res = await requestDataExport()
      if (!res.ok) setError(res.error)
      setConfirming(false)
    })
  }

  return (
    <section>
      <span className="me-section-label">Section 1</span>
      <h2 className="me-section-title">Export my data</h2>
      <p className="me-section-description">
        Generates a JSON bundle of everything Homemade holds about you:
        account information, projects, bookmarks, reviews, photos, questions,
        answers, errata, your notification history, and any audit-log
        entries you authored. Photographs are included by URL, so download
        them from those links while the export is fresh.
      </p>
      <p className="me-section-description">
        Each export is available for 7 days from the moment it's ready.
      </p>

      {latestReady?.fileUrl ? (
        <div className="me-data-ready">
          <p>
            <strong>Your most recent export is ready.</strong>
          </p>
          <p>
            Created {formatDate(latestReady.completedAt)} ·{' '}
            {formatBytes(latestReady.bytes)} · expires{' '}
            {formatDate(latestReady.expiresAt)}
          </p>
          <a
            className="me-button"
            href={latestReady.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              captureClientEvent('account_data_export_downloaded', {
                requestId: latestReady.id,
                bytes: latestReady.bytes,
                generatedAt: latestReady.completedAt,
              })
            }}
          >
            Download bundle
          </a>
        </div>
      ) : null}

      {confirming ? (
        <div className="me-confirm-block">
          <p>
            Generate a new export now? This may take a few seconds and the
            result will replace your most recent bundle.
          </p>
          <div className="me-button-row">
            <button
              type="button"
              className="me-button"
              onClick={run}
              disabled={pending}
            >
              {pending ? 'Preparing…' : 'Yes, generate'}
            </button>
            <button
              type="button"
              className="me-button secondary"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="me-button"
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          {latestReady ? 'Generate a fresh export' : 'Generate my export'}
        </button>
      )}

      {error && <p className="me-feedback error">{error}</p>}

      {history.length > 0 && (
        <details className="me-data-history">
          <summary>Past exports ({history.length})</summary>
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <span className="me-status-pill">
                  {h.status.toLowerCase()}
                </span>
                <span>Created {formatDate(h.createdAt)}</span>
                {h.expiresAt && <span>Expired {formatDate(h.expiresAt)}</span>}
                {h.error && <span className="me-feedback error">— {h.error}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
