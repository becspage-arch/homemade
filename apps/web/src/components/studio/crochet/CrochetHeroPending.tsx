'use client'

/**
 * The waiting note on a design whose finished-piece photo is still rendering.
 *
 * The pattern is complete and workable the moment it is saved: the chart, the
 * rounds, the yarn key are all there. The photo of the real thing takes minutes,
 * so it arrives on its own. This polls quietly until it lands, then refreshes the
 * page so the photo appears without the maker doing anything.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  patternId: string
}

const POLL_MS = 20000

export function CrochetHeroPending({ patternId }: Props) {
  const router = useRouter()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const res = await fetch(`/api/studio/crochet/patterns/${patternId}/hero-status`)
        if (!res.ok) return
        const body = await res.json()
        if (cancelled) return
        if (body.heroUrl) {
          setGone(true)
          router.refresh()
        }
      } catch {
        // A missed poll is nothing to report; the next one will do.
      }
    }
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [patternId, router])

  if (gone) return null

  return (
    <div className="crochet-studio-hero-pending" role="status" aria-live="polite">
      <span className="crochet-studio-hero-pending-dot" aria-hidden />
      Your photo of the finished piece is on its way. Everything else is ready to work from now.
    </div>
  )
}
