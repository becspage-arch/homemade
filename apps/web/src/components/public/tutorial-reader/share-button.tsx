'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { captureClientEvent } from '@/lib/client-analytics'

type ShareDestination =
  | 'native'
  | 'copy_link'
  | 'twitter'
  | 'pinterest'
  | 'facebook'
  | 'email'

interface ShareButtonProps {
  tutorialId: string
  tutorialSlug: string
  categorySlug: string
  title: string
  excerpt: string | null
  heroUrl: string | null
}

function fire(
  destination: ShareDestination,
  props: { tutorialId: string; tutorialSlug: string; categorySlug: string },
): void {
  captureClientEvent('tutorial_shared', {
    tutorialId: props.tutorialId,
    tutorialSlug: props.tutorialSlug,
    categorySlug: props.categorySlug,
    destination,
  })
}

// Feature-detect navigator.share without an effect: useSyncExternalStore lets
// us return `false` during SSR and the real value on first client render.
const subscribeNativeShare = (): (() => void) => () => {}
const getNativeShareSnapshot = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function'
const getNativeShareServerSnapshot = (): boolean => false

/**
 * Share affordance for tutorial pages. On devices that expose
 * `navigator.share` we present a single Share button that opens the OS
 * sheet (and fires `destination: 'native'`); otherwise we open a small
 * popover with discrete destinations. Either path fires `tutorial_shared`
 * with a `destination` property so dashboards can break down where reads
 * are coming from.
 */
export function ShareButton({
  tutorialId,
  tutorialSlug,
  categorySlug,
  title,
  excerpt,
  heroUrl,
}: ShareButtonProps) {
  const hasNativeShare = useSyncExternalStore(
    subscribeNativeShare,
    getNativeShareSnapshot,
    getNativeShareServerSnapshot,
  )
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const props = { tutorialId, tutorialSlug, categorySlug }

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${categorySlug}/${tutorialSlug}`
      : `https://homemade.education/${categorySlug}/${tutorialSlug}`

  async function onNativeShare(): Promise<void> {
    fire('native', props)
    try {
      await navigator.share({
        title,
        text: excerpt ?? title,
        url,
      })
    } catch {
      // user cancelled, or the browser rejected — analytics already fired
    }
  }

  async function onCopyLink(): Promise<void> {
    fire('copy_link', props)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard rejected; fall through silently
    }
  }

  function onTwitter(): void {
    fire('twitter', props)
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  function onPinterest(): void {
    fire('pinterest', props)
    const intent = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}${heroUrl ? `&media=${encodeURIComponent(heroUrl)}` : ''}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  function onFacebook(): void {
    fire('facebook', props)
    const intent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  function onEmail(): void {
    fire('email', props)
    const body = `${excerpt ?? title}\n\n${url}`
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
  }

  if (hasNativeShare) {
    return (
      <button
        type="button"
        className="reader-action subtle share"
        onClick={onNativeShare}
        aria-label="Share this tutorial"
      >
        <ShareGlyph />
        <span>Share</span>
      </button>
    )
  }

  return (
    <div className="share-wrap" ref={wrapRef}>
      <button
        type="button"
        className="reader-action subtle share"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share this tutorial"
      >
        <ShareGlyph />
        <span>Share</span>
      </button>
      {open && (
        <div role="menu" className="share-menu">
          <button type="button" role="menuitem" className="share-menu-item" onClick={onCopyLink}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" role="menuitem" className="share-menu-item" onClick={onTwitter}>
            Twitter / X
          </button>
          <button type="button" role="menuitem" className="share-menu-item" onClick={onPinterest}>
            Pinterest
          </button>
          <button type="button" role="menuitem" className="share-menu-item" onClick={onFacebook}>
            Facebook
          </button>
          <button type="button" role="menuitem" className="share-menu-item" onClick={onEmail}>
            Email
          </button>
        </div>
      )}
    </div>
  )
}

function ShareGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M11.5 5.5a2 2 0 100-2 2 2 0 000 2zm-7 4a2 2 0 100-2 2 2 0 000 2zm7 4a2 2 0 100-2 2 2 0 000 2zM6.2 7.7l4.1-2.4M6.2 8.3l4.1 2.4"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
