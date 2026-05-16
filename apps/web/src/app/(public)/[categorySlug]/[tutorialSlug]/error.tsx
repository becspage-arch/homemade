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
    // Extract category + tutorial from the URL so Sentry can group / filter
    // by content shape. Path is `/[categorySlug]/[tutorialSlug]` — we
    // tolerate other shapes silently for robustness.
    const parts = pathname?.split('/').filter(Boolean) ?? []
    const categorySlug = parts[0] ?? null
    const tutorialSlug = parts[1] ?? null

    Sentry.captureException(error, {
      tags: {
        route: 'tutorial-page',
        scope: 'error-boundary',
        categorySlug,
        tutorialSlug,
        digest: error.digest ?? null,
      },
      contexts: {
        tutorial: {
          path: pathname,
          categorySlug,
          tutorialSlug,
          digest: error.digest ?? null,
        },
      },
    })
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
        {error.digest && (
          <p className="public-error-boundary-digest">
            Reference <code>{error.digest}</code>
          </p>
        )}
      </div>
    </section>
  )
}
