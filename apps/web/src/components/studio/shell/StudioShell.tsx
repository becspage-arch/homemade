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

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PatternData } from '@homemade/db/pattern'
import { ChartViewport } from '../chart/ChartViewport'
import { useChartStore } from '../chart/chart-store'
import { StudioToolbar } from './StudioToolbar'
import { StudioStatusBar } from './StudioStatusBar'
import { PalettePanel } from './PalettePanel'
import { FlossKeyPanel } from './FlossKeyPanel'
import { ToolDock } from './ToolDock'
import { StudioEmptyState } from './StudioEmptyState'
import { NewBlankPanel } from './NewBlankPanel'
import { PhotoToChartPanel } from './PhotoToChartPanel'
import { MyPatternsGrid } from './MyPatternsGrid'
import { useStudioAutosave } from './use-studio-autosave'
import { BrandSwapDialog } from './BrandSwapDialog'
import { UpgradeBlock } from '@/components/premium/UpgradeBlock'
import { getStudioGateCopy } from '@/lib/studio/premium-gates'
import {
  StudioRecentlyAddedRail,
  type RailCard,
} from '../StudioLandingRails'

export type StudioStartMode = 'empty' | 'pattern' | 'new-blank' | 'new-photo'

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
  signedIn: boolean
  isPremium: boolean
  userEmail: string | null
  userName: string | null
  pattern: { id: string; name: string; data: PatternData; ownerUserId: string | null } | null
  stitchedKeys: string[]
  myPatterns: MyPatternListItem[]
  recentlyAdded?: RecentlyAddedListItem[]
}

export function StudioShell({
  startMode,
  signedIn,
  isPremium,
  userEmail,
  userName,
  pattern,
  stitchedKeys,
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

  // Pull stable action refs via selectors. `const store = useChartStore()`
  // would subscribe this component to every store change and put a new
  // state-object reference into any effect dep array — that turned this
  // effect into an infinite loop because setMode triggers a state change,
  // which gave the effect a new `store` reference, which re-fired it.
  const setMode = useChartStore((s) => s.setMode)
  const setIsolate = useChartStore((s) => s.setIsolate)
  const setCurrentSymbol = useChartStore((s) => s.setCurrentSymbol)
  useEffect(() => {
    if (pattern) setMode(pattern.ownerUserId ? 'edit' : 'view')
  }, [pattern, setMode])

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
    if (startMode === 'new-photo') {
      // Photo-to-chart is create-your-own — premium. Non-premium signed-in
      // Makers see the calm upgrade block in place of the panel.
      if (!isPremium) {
        const copy = getStudioGateCopy('PHOTO_TO_CHART')
        return (
          <div className="studio-empty-surface">
            <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>
              <UpgradeBlock message={copy.message} rationale={copy.rationale} />
            </div>
          </div>
        )
      }
      return (
        <PhotoToChartPanel
          signedIn={signedIn}
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
          onStartFromPhoto={() => router.replace('/studio/cross-stitch?new=photo', { scroll: false })}
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
