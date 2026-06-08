'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const CHUNK_RELOAD_GUARD = 'homemade-chunk-reload-attempted'

function isChunkLoadError(error: Error): boolean {
  if (error.name === 'ChunkLoadError') return true
  const msg = error.message ?? ''
  return (
    /Loading chunk [^ ]+ failed/i.test(msg) ||
    /Failed to (?:load|fetch) (?:dynamically imported )?(?:module|chunk)/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  )
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      // A chunk hash from a previous deploy 404'd. The fix is to force-load
      // fresh HTML so the new chunk references resolve. Guard against an
      // infinite reload loop in the edge case where the new build is also
      // broken — if we already reloaded once this session, fall through to
      // the visible fallback instead.
      try {
        const already = sessionStorage.getItem(CHUNK_RELOAD_GUARD)
        if (!already) {
          sessionStorage.setItem(CHUNK_RELOAD_GUARD, '1')
          window.location.reload()
          return
        }
      } catch {
        // sessionStorage can throw in private modes / sandboxed iframes;
        // still attempt a reload, accepting the small loop risk.
        window.location.reload()
        return
      }
    }

    Sentry.captureException(error, {
      tags: { scope: 'global-error-boundary', digest: error.digest ?? null },
    })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#2b2b2b',
          background: '#faf6f1',
        }}
      >
        <main
          style={{
            maxWidth: 600,
            margin: '64px auto',
            padding: '0 24px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8a7d68',
              marginBottom: 6,
            }}
          >
            Something went wrong
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 400, margin: '0 0 18px' }}>
            This page didn&apos;t load.
          </h1>
          <p style={{ lineHeight: 1.65 }}>
            Try reloading. If it keeps happening, head to the homepage and try
            again from there.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(CHUNK_RELOAD_GUARD)
                } catch {
                  // ignore
                }
                reset()
              }}
              style={{
                padding: '10px 18px',
                background: '#2b2b2b',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Reload
            </button>
            {/* Plain anchor on purpose — global-error fires when client JS
                is broken, so next/link's client-side navigation can't be
                trusted to work. A full document load is what we want. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '10px 18px',
                border: '1px solid #2b2b2b',
                borderRadius: 4,
                color: '#2b2b2b',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Back to homepage
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 12, color: '#8a7d68' }}>
              Reference <code>{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
