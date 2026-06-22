'use client'

import { useState, useTransition } from 'react'
import { createPortalSession } from '@/lib/stripe/checkout-actions'

/**
 * "Manage subscription" — opens the Stripe Customer Portal where the member
 * updates their card, changes plan, or cancels (self-serve, as easy as signup).
 * The portal session is created server-side for the linked Stripe customer.
 */
export function ManageSubscriptionButton() {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onClick() {
    setError(null)
    start(async () => {
      const res = await createPortalSession()
      if (res.ok) {
        window.location.assign(res.url)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        className="me-button"
        onClick={onClick}
        disabled={pending}
      >
        {pending ? 'Opening…' : 'Manage subscription'}
      </button>
      {error && (
        <p
          style={{
            color: 'var(--color-burnt-sienna)',
            fontSize: 13,
            marginTop: 8,
          }}
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  )
}
