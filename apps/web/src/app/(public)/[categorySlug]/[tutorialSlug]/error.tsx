'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { captureClientEvent } from '@/lib/client-analytics'

interface TutorialErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TutorialError({ error, reset }: TutorialErrorProps) {
  const pathname = usePathname()

  useEffect(() => {
    Sentry.captureException(error)
    captureClientEvent('error_boundary_triggered', {
      path: pathname,
      scope: 'tutorial',
      errorName: error.name,
      errorMessage: error.message.slice(0, 120),
      digest: error.digest ?? null,
    })
  }, [error, pathname])

  return (
    <section className="public-error-boundary public-error-boundary-tutorial">
      <div className="public-error-boundary-card">
        <h1>This tutorial didn&apos;t load.</h1>
        <p>
          Something went wrong while we were preparing this page. Try again,
          or pick another tutorial from the menu.
        </p>
        <div className="public-error-boundary-actions">
          <button type="button" className="public-error-boundary-button" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </section>
  )
}
