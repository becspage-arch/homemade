'use client'

/**
 * NeedleworkStudioShell — the client-side top surface for /studio/needlework.
 *
 * URL-driven state. Two top-level surfaces:
 *
 *   empty   — discipline picker + "Your projects" grid
 *   pattern — active-project surface (Counted / Surface view)
 *
 * The discipline picker is the empty state. The user picks a discipline to
 * browse the library; the library sends them back with ?needleworkPatternId.
 */

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { NeedleworkEmptyState } from './NeedleworkEmptyState'
import { MyNeedleworkProjectsGrid } from './MyNeedleworkProjectsGrid'
import { NeedleworkStudioToolbar } from './NeedleworkStudioToolbar'
import { NeedleworkActiveProject } from './NeedleworkActiveProject'
import {
  NeedleworkCreateYourOwnPanel,
  type NeedleworkDesignMode,
} from './NeedleworkCreateYourOwnPanel'
import type {
  NeedleworkPatternData,
  NeedleworkProjectProgressData,
  MyNeedleworkProjectListItem,
  NeedleworkDiscipline,
} from './types'
import {
  StudioRecentlyAddedRail,
  type RailCard,
} from '../StudioLandingRails'
import './needlework-studio.css'

export interface RecentlyAddedNeedleworkItem {
  id: string
  slug: string | null
  name: string
  thumbnailUrl: string | null
}

export type NeedleworkStudioStartMode = 'empty' | 'pattern' | 'new-design'

interface NeedleworkStudioShellProps {
  startMode: NeedleworkStudioStartMode
  signedIn: boolean
  isPremium: boolean
  userEmail: string | null
  userName: string | null
  pattern: NeedleworkPatternData | null
  progress: NeedleworkProjectProgressData | null
  myProjects: MyNeedleworkProjectListItem[]
  recentlyAdded?: RecentlyAddedNeedleworkItem[]
  /** Which tab the "Design your own" surface opens on. */
  designMode?: NeedleworkDesignMode
}

export function NeedleworkStudioShell({
  startMode,
  signedIn,
  isPremium,
  userName,
  pattern,
  progress,
  myProjects,
  recentlyAdded = [],
  designMode,
}: NeedleworkStudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notesOpen, setNotesOpen] = useState(false)

  const openDesignYourOwn = useCallback(
    (m: NeedleworkDesignMode) => {
      router.push(`/studio/needlework?create=${m}`)
    },
    [router],
  )

  const openProject = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('needleworkPatternId', id)
      router.push(`/studio/needlework?${params.toString()}`)
    },
    [router, searchParams],
  )

  const browseLibrary = useCallback(
    (discipline?: NeedleworkDiscipline) => {
      if (discipline) {
        const subSlugMap: Record<NeedleworkDiscipline, string> = {
          BLACKWORK: 'blackwork',
          HARDANGER: 'hardanger',
          NEEDLEPOINT: 'needlepoint',
          SASHIKO: 'sashiko',
          SURFACE_EMBROIDERY: 'surface-embroidery',
          CREWEL: 'surface-embroidery',
          GOLDWORK: 'goldwork',
          RIBBON: 'ribbon-embroidery',
          STUMPWORK: 'stumpwork',
          CANDLEWICKING: 'candlewicking',
        }
        const sub = subSlugMap[discipline]
        router.push(`/needlework?sub=${sub}`)
      } else {
        router.push('/needlework')
      }
    },
    [router],
  )

  const cancelToEmpty = useCallback(() => {
    router.replace('/studio/needlework', { scroll: false })
  }, [router])

  // ── Design your own (create-your-own) ───────────────────────────────────────
  if (startMode === 'new-design') {
    return (
      <div className="needlework-studio-surface needlework-studio-empty-surface">
        <NeedleworkCreateYourOwnPanel
          signedIn={signedIn}
          isPremium={isPremium}
          initialMode={designMode ?? 'idea'}
          onSaved={(newId) =>
            router.replace(`/studio/needlework?needleworkPatternId=${newId}`, { scroll: false })
          }
          onCancel={cancelToEmpty}
        />
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (startMode === 'empty' || !pattern) {
    const recentlyAddedRailItems: RailCard[] = recentlyAdded.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnailUrl: p.thumbnailUrl,
      href: p.slug
        ? `/needlework/${p.slug}`
        : `/studio/needlework?needleworkPatternId=${p.id}`,
    }))
    return (
      <div className="needlework-studio-surface needlework-studio-empty-surface">
        <NeedleworkEmptyState
          signedIn={signedIn}
          userName={userName}
          onBrowseLibrary={() => browseLibrary()}
          onSelectDiscipline={(d) => browseLibrary(d)}
          onDesignYourOwn={() => openDesignYourOwn('idea')}
        />
        {signedIn && myProjects.length > 0 && (
          <MyNeedleworkProjectsGrid projects={myProjects} onOpen={openProject} />
        )}
        <StudioRecentlyAddedRail category="needlework" items={recentlyAddedRailItems} />
      </div>
    )
  }

  // ── Active project ─────────────────────────────────────────────────────────
  const tutorialHref =
    pattern.sourceTutorialSlug && pattern.sourceTutorialCategorySlug
      ? `/${pattern.sourceTutorialCategorySlug}/${pattern.sourceTutorialSlug}`
      : null

  return (
    <div className="needlework-studio-surface needlework-studio-active-surface">
      <NeedleworkStudioToolbar
        patternName={pattern.name}
        discipline={pattern.discipline}
        designerName={pattern.designerName}
        notesOpen={notesOpen}
        onToggleNotes={() => setNotesOpen((v) => !v)}
        tutorialHref={tutorialHref}
        onClose={cancelToEmpty}
      />
      <NeedleworkActiveProject
        pattern={pattern}
        initialProgress={progress}
        notesOpen={notesOpen}
        onClose={cancelToEmpty}
      />
    </div>
  )
}
