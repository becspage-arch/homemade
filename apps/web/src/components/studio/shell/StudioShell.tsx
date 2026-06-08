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

export type StudioStartMode = 'empty' | 'pattern' | 'new-blank' | 'new-photo'

export interface MyPatternListItem {
  id: string
  name: string
  updatedAt: string
  widthCells: number
  heightCells: number
  colourCount: number
}

interface StudioShellProps {
  startMode: StudioStartMode
  signedIn: boolean
  userEmail: string | null
  userName: string | null
  pattern: { id: string; name: string; data: PatternData; ownerUserId: string | null } | null
  stitchedKeys: string[]
  myPatterns: MyPatternListItem[]
}

export function StudioShell({
  startMode,
  signedIn,
  userEmail,
  userName,
  pattern,
  stitchedKeys,
  myPatterns,
}: StudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [paletteOpen, setPaletteOpen] = useState(true)
  const [flossKeyOpen, setFlossKeyOpen] = useState(true)
  const [mobilePanel, setMobilePanel] = useState<'none' | 'palette' | 'flosskey'>('none')

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
      return (
        <PhotoToChartPanel
          signedIn={signedIn}
          onSaved={(newId) => router.replace(`/studio/cross-stitch?patternId=${newId}`, { scroll: false })}
          onCancel={() => router.replace('/studio/cross-stitch', { scroll: false })}
        />
      )
    }
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
        userEmail={userEmail}
        userName={userName}
        canEdit={pattern.ownerUserId !== null}
      />

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
