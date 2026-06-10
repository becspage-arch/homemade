'use client'

/**
 * StudioTopNavSlot  -  chooses which Studio the current /studio/* route
 * belongs to and renders the shared StudioTopNav with that context.
 *
 * Returns null on print routes and any /studio/* path that doesn't
 * resolve to a known Studio category (the layout still wraps the body,
 * so a missing nav doesn't break layout  -  the surface just runs
 * edge-to-edge as it did before).
 */

import { usePathname } from 'next/navigation'
import { studioCategoryFromPath } from '@/lib/studio/category-config'
import { StudioTopNav } from './StudioTopNav'

interface StudioTopNavSlotProps {
  signedIn: boolean
  userName: string | null
}

export function StudioTopNavSlot({ signedIn, userName }: StudioTopNavSlotProps) {
  const pathname = usePathname() ?? ''
  if (pathname.endsWith('/print') || pathname.includes('/print/')) return null
  const config = studioCategoryFromPath(pathname)
  if (!config) return null
  return <StudioTopNav category={config.slug} signedIn={signedIn} userName={userName} />
}
