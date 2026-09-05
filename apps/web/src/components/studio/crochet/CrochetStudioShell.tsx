'use client'

/**
 * CrochetStudioShell — the client-side top surface for /studio/crochet.
 *
 * URL-driven state. Three top-level surfaces:
 *
 *   empty                       — sign-in hero + "Your projects" + "Your designs"
 *   pattern                     — active-project surface (Written / Chart / Schematic)
 *   new-photo-to-tapestry       — create-your-own, opened on "From a photo"
 *   new-amigurumi-designer      — create-your-own, opened on the amigurumi designer
 *   new-ai-assisted             — create-your-own, opened on "Describe an idea"
 *
 * The three create modes are one surface with three tabs, the way cross-stitch's
 * "Design your own" is one surface with two. Premium members get the working
 * tools; a free member sees the same surface behind the premium popup.
 *
 * Below the surface the shell never unmounts on panel toggles. State
 * lives in URL params + a small handful of view-state hooks; the
 * autosave hook reconciles the row counter / notes / preferences to
 * the server.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { CrochetEmptyState } from './CrochetEmptyState'
import { MyCrochetProjectsGrid } from './MyCrochetProjectsGrid'
import { CrochetActiveProject } from './CrochetActiveProject'
import { CrochetStudioToolbar } from './CrochetStudioToolbar'
import { CrochetCreateYourOwnPanel, type CrochetDesignMode } from './CrochetCreateYourOwnPanel'
import { CrochetHeroPending } from './CrochetHeroPending'
import { MyCrochetPatternsGrid, type MyCrochetPatternListItem } from './MyCrochetPatternsGrid'
import type {
  CrochetPatternData,
  CrochetProjectProgressData,
  MyCrochetProjectListItem,
} from './types'
import {
  StudioRecentlyAddedRail,
  type RailCard,
} from '../StudioLandingRails'
import './crochet-studio.css'

export interface RecentlyAddedCrochetItem {
  id: string
  slug: string | null
  name: string
  thumbnailUrl: string | null
}

export type CrochetStudioStartMode =
  | 'empty'
  | 'pattern'
  | 'new-amigurumi-designer'
  | 'new-photo-to-tapestry'
  | 'new-ai-assisted'

interface CrochetStudioShellProps {
  startMode: CrochetStudioStartMode
  signedIn: boolean
  isPremium: boolean
  userEmail: string | null
  userName: string | null
  userTerminologyPreference: string | null
  userLeftHanded: boolean
  pattern: CrochetPatternData | null
  progress: CrochetProjectProgressData | null
  myProjects: MyCrochetProjectListItem[]
  myDesigns: MyCrochetPatternListItem[]
  /** The open pattern is the maker's own and its finished-piece photo is still
   *  rendering, so the Studio shows the waiting note. */
  heroPending: boolean
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  recentlyAdded?: RecentlyAddedCrochetItem[]
}

export function CrochetStudioShell({
  startMode,
  signedIn,
  isPremium,
  userName,
  userTerminologyPreference,
  userLeftHanded,
  pattern,
  progress,
  myProjects,
  myDesigns,
  heroPending,
  yarnWeights,
  recentlyAdded = [],
}: CrochetStudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // The Studio surface state is small enough to live in plain useState
  // hooks. The autosave + URL navigation handle the rest.
  const [notesOpen, setNotesOpen] = useState(false)

  useEffect(() => {
    // Persist the URL-based pattern id to localStorage so a refresh on
    // /studio/crochet (no params) can suggest "resume where you left off".
    if (pattern) {
      try {
        window.localStorage.setItem('crochet-studio:last-pattern', pattern.id)
      } catch {
        // ignore
      }
    }
  }, [pattern])

  const openProject = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('crochetPatternId', id)
      router.push(`/studio/crochet?${params.toString()}`)
    },
    [router, searchParams],
  )

  const browseLibrary = useCallback(() => {
    router.push('/crochet/patterns')
  }, [router])

  const cancelToEmpty = useCallback(() => {
    router.replace('/studio/crochet', { scroll: false })
  }, [router])

  // ───── Create your own: one surface, three ways in ─────
  if (
    startMode === 'new-amigurumi-designer' ||
    startMode === 'new-photo-to-tapestry' ||
    startMode === 'new-ai-assisted'
  ) {
    const initialMode: CrochetDesignMode =
      startMode === 'new-amigurumi-designer'
        ? 'designer'
        : startMode === 'new-ai-assisted'
          ? 'idea'
          : 'photo'
    return (
      <CrochetCreateYourOwnPanel
        signedIn={signedIn}
        isPremium={isPremium}
        initialMode={initialMode}
        onSaved={openProject}
        onCancel={cancelToEmpty}
      />
    )
  }

  // ───── Empty state ─────
  if (startMode === 'empty' || !pattern) {
    const recentlyAddedRailItems: RailCard[] = recentlyAdded.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnailUrl: p.thumbnailUrl,
      href: p.slug
        ? `/crochet/patterns/${p.slug}`
        : `/studio/crochet?crochetPatternId=${p.id}`,
    }))
    return (
      <div className="crochet-studio-surface crochet-studio-empty-surface">
        <CrochetEmptyState
          signedIn={signedIn}
          userName={userName}
          onBrowseLibrary={browseLibrary}
          onOpenAmigurumiDesigner={() =>
            router.replace('/studio/crochet?new=amigurumi-designer', { scroll: false })
          }
          onOpenPhotoToTapestry={() =>
            router.replace('/studio/crochet?new=photo-to-tapestry', { scroll: false })
          }
          onOpenAiAssisted={() =>
            router.replace('/studio/crochet?new=ai-assisted', { scroll: false })
          }
        />
        {signedIn && myDesigns.length > 0 && (
          <MyCrochetPatternsGrid patterns={myDesigns} onOpen={openProject} />
        )}
        {signedIn && myProjects.length > 0 && (
          <MyCrochetProjectsGrid projects={myProjects} onOpen={openProject} />
        )}
        <StudioRecentlyAddedRail category="crochet" items={recentlyAddedRailItems} />
      </div>
    )
  }

  // ───── Active project ─────
  return (
    <ActiveProjectSurface
      pattern={pattern}
      progress={progress}
      userTerminologyPreference={userTerminologyPreference}
      userLeftHanded={userLeftHanded}
      notesOpen={notesOpen}
      onToggleNotes={() => setNotesOpen((v) => !v)}
      onClose={cancelToEmpty}
      yarnWeights={yarnWeights}
      heroPending={heroPending}
    />
  )
}

/**
 * Active-project body. Split out so the view-state hooks (mode toggle,
 * terminology toggle, etc.) live alongside the surface they drive
 * rather than the top-level shell which mostly just routes.
 */
function ActiveProjectSurface({
  pattern,
  progress,
  userTerminologyPreference,
  userLeftHanded,
  notesOpen,
  onToggleNotes,
  onClose,
  yarnWeights,
  heroPending,
}: {
  pattern: CrochetPatternData
  progress: CrochetProjectProgressData | null
  userTerminologyPreference: string | null
  userLeftHanded: boolean
  notesOpen: boolean
  yarnWeights: Array<{ slug: string; canonicalName: string; standardCategory: number }>
  heroPending: boolean
  onToggleNotes: () => void
  onClose: () => void
}) {
  const initialView = useMemo<'written' | 'chart' | 'schematic'>(() => {
    if (progress?.preferredView) return progress.preferredView
    if (pattern.format === 'CHART_ONLY') return 'chart'
    if (pattern.shapeCategory === 'GARMENT' && pattern.schematicMediaId) return 'schematic'
    return 'written'
  }, [progress, pattern])

  const initialTerminology = useMemo<'uk' | 'us'>(() => {
    if (progress?.terminologyOverride === 'uk' || progress?.terminologyOverride === 'us') {
      return progress.terminologyOverride
    }
    if (userTerminologyPreference === 'uk' || userTerminologyPreference === 'us') {
      return userTerminologyPreference
    }
    return pattern.terminologyConvention === 'us' ? 'us' : 'uk'
  }, [progress, userTerminologyPreference, pattern])

  const initialLeftHanded = useMemo<boolean>(() => {
    if (progress?.leftHandedOverride !== null && progress?.leftHandedOverride !== undefined) {
      return progress.leftHandedOverride
    }
    return userLeftHanded
  }, [progress, userLeftHanded])

  const [viewMode, setViewMode] = useState<'written' | 'chart' | 'schematic'>(initialView)
  const [terminology, setTerminology] = useState<'uk' | 'us'>(initialTerminology)
  const [leftHanded, setLeftHanded] = useState<boolean>(initialLeftHanded)

  const tutorialHref =
    pattern.sourceTutorialSlug && pattern.sourceTutorialCategorySlug
      ? `/${pattern.sourceTutorialCategorySlug}/${pattern.sourceTutorialSlug}`
      : null

  const printHref = pattern.slug
    ? `/studio/crochet/${encodeURIComponent(pattern.slug)}/print?terminology=${terminology}`
    : null

  return (
    <div className="crochet-studio-surface crochet-studio-active-surface">
      <CrochetStudioToolbar
        patternName={pattern.name}
        designerName={pattern.designerName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        chartAvailable={Boolean(pattern.chartData)}
        schematicAvailable={Boolean(pattern.schematicMediaId)}
        terminology={terminology}
        onTerminologyChange={setTerminology}
        leftHanded={leftHanded}
        onLeftHandedToggle={() => setLeftHanded((v) => !v)}
        notesOpen={notesOpen}
        onToggleNotes={onToggleNotes}
        tutorialHref={tutorialHref}
        printHref={printHref}
        onClose={onClose}
      />

      {heroPending && <CrochetHeroPending patternId={pattern.id} />}

      <CrochetActiveProject
        pattern={pattern}
        initialProgress={progress}
        viewMode={viewMode}
        terminology={terminology}
        leftHanded={leftHanded}
        notesOpen={notesOpen}
        yarnWeights={yarnWeights}
        onClose={onClose}
      />
    </div>
  )
}
