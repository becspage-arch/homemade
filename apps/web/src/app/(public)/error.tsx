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

export default function PublicError({ error, reset }: PublicErrorProps) {
  const pathname = usePathname()

  useEffect(() => {
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
