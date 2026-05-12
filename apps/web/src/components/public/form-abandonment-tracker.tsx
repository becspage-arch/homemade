'use client'

import { useEffect, useRef } from 'react'
import { captureClientEvent } from '@/lib/client-analytics'

/**
 * Fires `form_abandoned` on `pagehide` if the user interacted with the form
 * (focused or typed in any field) but never submitted it. Drop into any
 * multi-step or high-friction form that's worth measuring drop-off on:
 * creator application, sign-up wrappers, deletion confirmation, etc.
 *
 * Usage:
 *   <FormAbandonmentTracker formId="creator-application">
 *     <form ...>...</form>
 *   </FormAbandonmentTracker>
 *
 * Submit handlers should call `markFormSubmitted` (via context-less ref) or
 * the wrapper detects a submit on the contained form. The wrapper listens
 * to `submit` events that bubble through it; if your form uses a server
 * action that navigates away with `redirect()`, the submit event still
 * fires first so this is safe.
 */
export function FormAbandonmentTracker({
  formId,
  children,
}: {
  formId: string
  children: React.ReactNode
}) {
  const interacted = useRef(false)
  const submitted = useRef(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    function markInteracted() {
      interacted.current = true
    }
    function markSubmitted() {
      submitted.current = true
    }
    function onPageHide() {
      if (interacted.current && !submitted.current) {
        captureClientEvent('form_abandoned', { formId })
      }
    }

    root.addEventListener('focusin', markInteracted, { capture: true })
    root.addEventListener('input', markInteracted, { capture: true })
    root.addEventListener('submit', markSubmitted, { capture: true })
    window.addEventListener('pagehide', onPageHide)
    return () => {
      root.removeEventListener('focusin', markInteracted, { capture: true })
      root.removeEventListener('input', markInteracted, { capture: true })
      root.removeEventListener('submit', markSubmitted, { capture: true })
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [formId])

  return <div ref={rootRef}>{children}</div>
}
