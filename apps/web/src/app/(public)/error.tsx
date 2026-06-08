'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { captureClientEvent } from '@/lib/client-analytics'

interface PublicErrorProps {
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

export default function PublicError({ error, reset }: PublicErrorProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Stale chunk from a previous deploy — force a full reload so the
    // browser re-fetches HTML with current chunk references. Skip Sentry to
    // keep the signal clean: this isn't a real bug.
    if (isChunkLoadError(error)) {
      try {
        if (!sessionStorage.getItem(CHUNK_RELOAD_GUARD)) {
          sessionStorage.setItem(CHUNK_RELOAD_GUARD, '1')
          window.location.reload()
          return
        }
      } catch {
        window.location.reload()
        return
      }
    }

    Sentry.captureException(error)
    captureClientEvent('error_boundary_triggered', {
      path: pathname,
      errorName: error.name,
      errorMessage: error.message.slice(0, 120),
      digest: error.digest ?? null,
    })
  }, [error, pathname])

  return (
    <section className="public-error-boundary">
      <div className="public-error-boundary-card">
        <h1>Something went wrong on our end.</h1>
        <p>
          We&apos;ve been told, and we&apos;ll have a look. While we sort it out, you
          can head back to the homepage or try again.
        </p>
        <div className="public-error-boundary-actions">
          <button type="button" className="public-error-boundary-button" onClick={reset}>
            Try again
          </button>
          <Link className="public-error-boundary-link" href="/">
            Back to homepage
          </Link>
        </div>
      </div>
    </section>
  )
}
