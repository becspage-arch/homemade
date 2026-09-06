'use client'

/**
 * StudioShell — the top-level client surface for /studio/cross-stitch.
 *
 * Owns the route's state machine (empty / pattern-loaded / new-blank /
 * new-from-photo) and wires the chart viewport, overlay drawers,
 * toolbar, and persistence in one place. Below the surface there's no
 * routing — only the URL query changes, the shell never unmounts. That
 * keeps the chart viewport state alive when the user opens / closes the
 * palette, switches tools, or starts a new pattern.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PatternData } from '@homemade/db/pattern'
import { ChartViewport } from '../chart/ChartViewport'
import { useChartStore } from '../chart/chart-store'
import { StudioToolbar } from './StudioToolbar'
import { StudioStatusBar } from './StudioStatusBar'
import { PalettePanel } from './PalettePanel'
import { FlossKeyPanel } from './FlossKeyPanel'
import { ParkingBar } from './ParkingBar'
import { ToolDock } from './ToolDock'
import { StudioEmptyState } from './StudioEmptyState'
import { NewBlankPanel } from './NewBlankPanel'
import { CreateYourOwnPanel, type DesignMode } from './CreateYourOwnPanel'
import { MyPatternsGrid } from './MyPatternsGrid'
import { useStudioAutosave } from './use-studio-autosave'
import { BrandSwapDialog } from './BrandSwapDialog'
import { getLocalParking } from './local-progress'
import { parseParkingDirection } from '@/lib/studio/parking'
import { captureClientEvent } from '@/lib/client-analytics'
import {
  StudioRecentlyAddedRail,
  type RailCard,
} from '../StudioLandingRails'

export type StudioStartMode = 'empty' | 'pattern' | 'new-blank' | 'new-design'

export interface MyPatternListItem {
  id: string
  name: string
  updatedAt: string
  widthCells: number
  heightCells: number
  colourCount: number
}

export interface RecentlyAddedListItem {
  id: string
  slug: string | null
  name: string
  thumbnailUrl: string | null
}

interface StudioShellProps {
  startMode: StudioStartMode
  /** Which tab the combined "Design your own" surface opens on. */
  designMode?: DesignMode
  signedIn: boolean
  isPremium: boolean
  userEmail: string | null
  userName: string | null
  pattern: { id: string; name: string; data: PatternData; ownerUserId: string | null } | null
  stitchedKeys: string[]
  /** Stored parking preferences for this Maker on this pattern. Null when
   *  the server has none, in which case the local store is consulted. */
  parking?: { enabled: boolean; direction: string; line: number } | null
  myPatterns: MyPatternListItem[]
  recentlyAdded?: RecentlyAddedListItem[]
}

export function StudioShell({
  startMode,
  designMode,
  signedIn,
  isPremium,
  userEmail,
  userName,
  pattern,
  stitchedKeys,
  parking = null,
  myPatterns,
  recentlyAdded = [],
}: StudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [paletteOpen, setPaletteOpen] = useState(true)
  const [flossKeyOpen, setFlossKeyOpen] = useState(true)
  const [mobilePanel, setMobilePanel] = useState<'none' | 'palette' | 'flosskey'>('none')
  const [brandSwapOpen, setBrandSwapOpen] = useState(false)

  const initialStitched = useMemo(() => new Set(stitchedKeys), [stitchedKeys])

  // Feature-adoption signal — one per Studio open. `feature_used` powers the
  // cross-product reach metric; `studio_opened` carries the craft + entry mode.
  useEffect(() => {
    captureClientEvent('studio_opened', { craft: 'cross_stitch', mode: startMode })
    captureClientEvent('feature_used', { feature: 'studio', productArea: 'cross_stitch' })
  }, [startMode])

  // Pull stable action refs via selectors. `const store = useChartStore()`
  // would subscribe this component to every store change and put a new
  // state-object reference into any effect dep array — that turned this
  // effect into an infinite loop because setMode triggers a state change,
  // which gave the effect a new `store` reference, which re-fired it.
  const setMode = useChartStore((s) => s.setMode)
  const setIsolate = useChartStore((s) => s.setIsolate)
  const setCurrentSymbol = useChartStore((s) => s.setCurrentSymbol)
  const hydrateParking = useChartStore((s) => s.hydrateParking)
  useEffect(() => {
    if (pattern) setMode(pattern.ownerUserId ? 'edit' : 'view')
  }, [pattern, setMode])

  // Restore parking preferences once the pattern is in the store, so the
  // index builds against the right grid. Signed-in Makers get the server
  // row; everyone else gets whatever IndexedDB holds, which is where their
  // progress lives too.
  const patternId = pattern?.id ?? null
  // Hydrate once per pattern. A parent re-render hands down a fresh
  // `parking` object every time, and re-applying it would rewind the line
  // the Maker is on and drop preference changes that have not saved yet.
  const hydratedFor = useRef<string | null>(null)
  useEffect(() => {
    if (!patternId || hydratedFor.current === patternId) return
    hydratedFor.current = patternId
    if (parking) {
      hydrateParking({
        enabled: parking.enabled,
        direction: parseParkingDirection(parking.direction),
        line: parking.line,
      })
      return
    }
    let cancelled = false
    getLocalParking(patternId)
      .then((prefs) => {
        if (cancelled || !prefs) return
        hydrateParking(prefs)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [patternId, parking, hydrateParking])

  // Autosave hook — debounced save to server when the user is logged in and
  // owns the pattern. Library patterns silently fork on first edit.
  useStudioAutosave({
    patternId: pattern?.id ?? null,
    ownerUserId: pattern?.ownerUserId ?? null,
    signedIn,
    onForked: (newId) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('patternId', newId)
      router.replace(`/studio/cross-stitch?${params.toString()}`, { scroll: false })
    },
  })

  // ───── empty state — no pattern loaded
  if (startMode === 'empty' || !pattern) {
    if (startMode === 'new-blank') {
      return (
        <NewBlankPanel
          signedIn={signedIn}
          onCreated={(newId) => router.replace(`/studio/cross-stitch?patternId=${newId}`, { scroll: false })}
          onCancel={() => router.replace('/studio/cross-stitch', { scroll: false })}
        />
      )
    }
    if (startMode === 'new-design') {
      // The combined "Design your own" surface (describe an idea + upload a
      // photo). Create-your-own is premium; the panel itself shows the premium
      // popup to non-premium Makers and the working tools to premium + admins.
      return (
        <CreateYourOwnPanel
          signedIn={signedIn}
          isPremium={isPremium}
          initialMode={designMode ?? 'idea'}
          onSaved={(newId) => router.replace(`/studio/cross-stitch?patternId=${newId}`, { scroll: false })}
          onCancel={() => router.replace('/studio/cross-stitch', { scroll: false })}
        />
      )
    }
    const recentlyAddedRailItems: RailCard[] = recentlyAdded.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnailUrl: p.thumbnailUrl,
      href: p.slug
        ? `/cross-stitch/patterns/${p.slug}`
        : `/studio/cross-stitch?patternId=${p.id}`,
    }))
    return (
      <div className="studio-empty-surface">
        <StudioEmptyState
          signedIn={signedIn}
          userName={userName}
          onBrowseLibrary={() => router.push('/cross-stitch/patterns')}
          onStartBlank={() => router.replace('/studio/cross-stitch?new=blank', { scroll: false })}
          onStartDesign={() => router.replace('/studio/cross-stitch?new=design', { scroll: false })}
        />
        {signedIn && myPatterns.length > 0 && (
          <MyPatternsGrid
            patterns={myPatterns}
            onOpen={(id) => router.push(`/studio/cross-stitch?patternId=${id}`)}
          />
        )}
        <StudioRecentlyAddedRail
          category="cross-stitch"
          items={recentlyAddedRailItems}
        />
      </div>
    )
  }

  // ───── pattern loaded — the full Studio
  return (
    <div className="studio-layout">
      <StudioToolbar
        patternId={pattern.id}
        patternName={pattern.name}
        signedIn={signedIn}
        isPremium={isPremium}
        userEmail={userEmail}
        userName={userName}
        canEdit={pattern.ownerUserId !== null}
        onOpenBrandSwap={() => setBrandSwapOpen(true)}
      />

      {brandSwapOpen && (
        <BrandSwapDialog
          patternId={pattern.id}
          pattern={pattern.data}
          onClose={() => setBrandSwapOpen(false)}
          onSwapped={(result) => {
            setBrandSwapOpen(false)
            // Library pattern silently forked into a new owned row.
            // Library pattern silently forked into a new owned row. Swap the
            // URL's patternId so the next render loads the user's fork; the
            // shell re-mounts with the swapped palette already persisted.
            if (result.forked) {
              const params = new URLSearchParams(searchParams.toString())
              params.set('patternId', result.id)
              router.replace(`/studio/cross-stitch?${params.toString()}`, { scroll: false })
            } else {
              router.refresh()
            }
          }}
        />
      )}

      <main className="studio-canvas">
        <ChartViewport
          pattern={pattern.data}
          patternId={pattern.id}
          mode={pattern.ownerUserId ? 'edit' : 'view'}
          initialStitched={initialStitched}
          onRequestIsolate={(s) => setIsolate(s)}
          onPickColour={(s) => setCurrentSymbol(s)}
        />

        {/* Floating palette drawer — left edge, Procreate-style. */}
        <PalettePanel
          pattern={pattern.data}
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onOpen={() => setPaletteOpen(true)}
          mobileOpen={mobilePanel === 'palette'}
          onMobileClose={() => setMobilePanel('none')}
        />

        {/* Floating floss-key drawer — right edge. */}
        <FlossKeyPanel
          pattern={pattern.data}
          open={flossKeyOpen}
          onClose={() => setFlossKeyOpen(false)}
          onOpen={() => setFlossKeyOpen(true)}
          mobileOpen={mobilePanel === 'flosskey'}
          onMobileClose={() => setMobilePanel('none')}
        />

        {/* Parking controls — floats at the top of the canvas when parking
            is on, and renders nothing when it is off. Available on library
            patterns too: parking is a way of working a chart, not an edit. */}
        <ParkingBar pattern={pattern.data} />

        {/* Edit-mode floating tool dock — bottom-centre on desktop. */}
        {pattern.ownerUserId && <ToolDock />}
      </main>

      <StudioStatusBar
        pattern={pattern.data}
        onOpenPalette={() => setMobilePanel('palette')}
        onOpenFlossKey={() => setMobilePanel('flosskey')}
      />
    </div>
  )
}
