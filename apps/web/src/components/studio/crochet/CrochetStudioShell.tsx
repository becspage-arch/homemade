'use client'

/**
 * CrochetStudioShell — the client-side top surface for /studio/crochet.
 *
 * URL-driven state. Three top-level surfaces:
 *
 *   empty                       — sign-in hero + "Your projects" grid
 *   pattern                     — active-project surface (Written / Chart / Schematic)
 *   new-amigurumi-designer      — premium create-your-own (stub for step 14)
 *   new-photo-to-tapestry       — premium create-your-own (stub for step 16)
 *   new-ai-assisted             — premium create-your-own (stub for step 15)
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
import { ComingSoonPanel } from './ComingSoonPanel'
import type {
  CrochetPatternData,
  CrochetProjectProgressData,
  MyCrochetProjectListItem,
} from './types'
import './crochet-studio.css'

export type CrochetStudioStartMode =
  | 'empty'
  | 'pattern'
  | 'new-amigurumi-designer'
  | 'new-photo-to-tapestry'
  | 'new-ai-assisted'

interface CrochetStudioShellProps {
  startMode: CrochetStudioStartMode
  signedIn: boolean
  userEmail: string | null
  userName: string | null
  userTerminologyPreference: string | null
  userLeftHanded: boolean
  pattern: CrochetPatternData | null
  progress: CrochetProjectProgressData | null
  myProjects: MyCrochetProjectListItem[]
}

export function CrochetStudioShell({
  startMode,
  signedIn,
  userName,
  userTerminologyPreference,
  userLeftHanded,
  pattern,
  progress,
  myProjects,
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

  // ───── Coming-soon premium creators (steps 14–16 stubs) ─────
  if (startMode === 'new-amigurumi-designer') {
    return (
      <ComingSoonPanel
        title="Amigurumi shape designer"
        body="Pick a body shape, set the size, and the Studio generates a row-by-row pattern. Premium feature, coming in a later build step."
        onCancel={cancelToEmpty}
      />
    )
  }
  if (startMode === 'new-photo-to-tapestry') {
    return (
      <ComingSoonPanel
        title="Photo to tapestry grid"
        body="Drop in a photo and the Studio turns it into a tapestry-crochet chart with a colour-grid written pattern. Premium feature, coming in a later build step."
        onCancel={cancelToEmpty}
      />
    )
  }
  if (startMode === 'new-ai-assisted') {
    return (
      <ComingSoonPanel
        title="Custom pattern, designed for you"
        body="Describe what you want to make and we draft a pattern that fits your measurements, your yarn, and your project. Premium feature, coming in a later build step."
        onCancel={cancelToEmpty}
      />
    )
  }

  // ───── Empty state ─────
  if (startMode === 'empty' || !pattern) {
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
        {signedIn && myProjects.length > 0 && (
          <MyCrochetProjectsGrid projects={myProjects} onOpen={openProject} />
        )}
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
}: {
  pattern: CrochetPatternData
  progress: CrochetProjectProgressData | null
  userTerminologyPreference: string | null
  userLeftHanded: boolean
  notesOpen: boolean
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

      <CrochetActiveProject
        pattern={pattern}
        initialProgress={progress}
        viewMode={viewMode}
        terminology={terminology}
        leftHanded={leftHanded}
        notesOpen={notesOpen}
      />
    </div>
  )
}
