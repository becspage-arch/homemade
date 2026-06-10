'use client'

/**
 * KnittingStudioShell — client-side top surface for /studio/knitting.
 * URL-driven state.
 *
 *   empty               — sign-in hero + "Your projects" grid
 *   pattern             — active-project surface (Written / Chart /
 *                         Schematic + counters)
 *
 * Library patterns silently fork on first edit (same pattern as
 * cross-stitch / crochet); v1 ships without the fork path because
 * pattern library is read-only progress, not edit.
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { KnittingEmptyState } from './KnittingEmptyState'
import { MyKnittingProjectsGrid } from './MyKnittingProjectsGrid'
import { KnittingActiveProject } from './KnittingActiveProject'
import { KnittingStudioToolbar } from './KnittingStudioToolbar'
import type {
  KnittingPatternData,
  KnittingProjectProgressData,
  MyKnittingProjectListItem,
  ViewMode,
} from './types'
import {
  StudioRecentlyAddedRail,
  type RailCard,
} from '../StudioLandingRails'
import './knitting-studio.css'

export interface RecentlyAddedKnittingItem {
  id: string
  slug: string | null
  name: string
  thumbnailUrl: string | null
}

export type KnittingStudioStartMode = 'empty' | 'pattern'

interface KnittingStudioShellProps {
  startMode: KnittingStudioStartMode
  signedIn: boolean
  userEmail: string | null
  userName: string | null
  pattern: KnittingPatternData | null
  progress: KnittingProjectProgressData | null
  myProjects: MyKnittingProjectListItem[]
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  recentlyAdded?: RecentlyAddedKnittingItem[]
}

export function KnittingStudioShell({
  startMode,
  signedIn,
  userName,
  pattern,
  progress,
  myProjects,
  yarnWeights,
  recentlyAdded = [],
}: KnittingStudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [substitutionOpen, setSubstitutionOpen] = useState(false)

  useEffect(() => {
    if (pattern) {
      try {
        window.localStorage.setItem('knitting-studio:last-pattern', pattern.id)
      } catch {
        // ignore
      }
    }
  }, [pattern])

  const openProject = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('knittingPatternId', id)
      router.push(`/studio/knitting?${params.toString()}`)
    },
    [router, searchParams],
  )

  const browseLibrary = useCallback(() => {
    router.push('/knitting/patterns')
  }, [router])

  const cancelToEmpty = useCallback(() => {
    router.replace('/studio/knitting', { scroll: false })
  }, [router])

  const startFromUrl = useCallback(() => {
    const url = window.prompt('Paste a knitting pattern URL or slug')
    if (!url) return
    const slug = url.trim().split('/').pop() ?? url.trim()
    if (!slug) return
    const params = new URLSearchParams()
    params.set('knittingPatternSlug', slug)
    router.push(`/studio/knitting?${params.toString()}`)
  }, [router])

  // ───── Empty state ─────
  if (startMode === 'empty' || !pattern) {
    const recentlyAddedRailItems: RailCard[] = recentlyAdded.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnailUrl: p.thumbnailUrl,
      href: p.slug
        ? `/knitting/patterns/${p.slug}`
        : `/studio/knitting?knittingPatternId=${p.id}`,
    }))
    return (
      <div className="knitting-studio-surface knitting-studio-empty-surface">
        <KnittingEmptyState
          signedIn={signedIn}
          userName={userName}
          onBrowseLibrary={browseLibrary}
          onStartFromUrl={startFromUrl}
          onStartNewProject={browseLibrary}
        />
        {signedIn && myProjects.length > 0 && (
          <MyKnittingProjectsGrid projects={myProjects} onOpen={openProject} />
        )}
        <StudioRecentlyAddedRail category="knitting" items={recentlyAddedRailItems} />
      </div>
    )
  }

  return (
    <ActiveProjectSurface
      pattern={pattern}
      progress={progress}
      signedIn={signedIn}
      yarnWeights={yarnWeights}
      substitutionOpen={substitutionOpen}
      onToggleSubstitution={() => setSubstitutionOpen((v) => !v)}
      onClose={cancelToEmpty}
    />
  )
}

function ActiveProjectSurface({
  pattern,
  progress,
  signedIn,
  yarnWeights,
  substitutionOpen,
  onToggleSubstitution,
  onClose,
}: {
  pattern: KnittingPatternData
  progress: KnittingProjectProgressData | null
  signedIn: boolean
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  substitutionOpen: boolean
  onToggleSubstitution: () => void
  onClose: () => void
}) {
  const initialView: ViewMode = progress?.preferredView ?? (
    pattern.chartData
      ? 'chart'
      : pattern.shapeCategory === 'GARMENT' && pattern.schematicMediaId
      ? 'schematic'
      : 'written'
  )
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)

  const tutorialHref =
    pattern.sourceTutorialSlug && pattern.sourceTutorialCategorySlug
      ? `/${pattern.sourceTutorialCategorySlug}/${pattern.sourceTutorialSlug}`
      : null

  const printHref = pattern.slug
    ? `/studio/knitting/${encodeURIComponent(pattern.slug)}/print`
    : null

  return (
    <div className="knitting-studio-surface">
      <KnittingStudioToolbar
        patternName={pattern.name}
        designerName={pattern.designerName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        chartAvailable={Boolean(pattern.chartData)}
        schematicAvailable={Boolean(
          pattern.schematicMediaId || (pattern.sizesGraded && pattern.sizesGraded.length > 0),
        )}
        substitutionOpen={substitutionOpen}
        onToggleSubstitution={onToggleSubstitution}
        tutorialHref={tutorialHref}
        printHref={printHref}
        onClose={onClose}
      />

      <KnittingActiveProject
        pattern={pattern}
        initialProgress={progress}
        viewMode={viewMode}
        substitutionOpen={substitutionOpen}
        yarnWeights={yarnWeights}
        signedIn={signedIn}
        onClose={onClose}
      />
    </div>
  )
}
