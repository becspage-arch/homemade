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
import type {
  NeedleworkPatternData,
  NeedleworkProjectProgressData,
  MyNeedleworkProjectListItem,
  NeedleworkDiscipline,
} from './types'
import './needlework-studio.css'

export type NeedleworkStudioStartMode = 'empty' | 'pattern'

interface NeedleworkStudioShellProps {
  startMode: NeedleworkStudioStartMode
  signedIn: boolean
  userEmail: string | null
  userName: string | null
  pattern: NeedleworkPatternData | null
  progress: NeedleworkProjectProgressData | null
  myProjects: MyNeedleworkProjectListItem[]
}

export function NeedleworkStudioShell({
  startMode,
  signedIn,
  userName,
  pattern,
  progress,
  myProjects,
}: NeedleworkStudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notesOpen, setNotesOpen] = useState(false)

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

  // ── Empty state ────────────────────────────────────────────────────────────
  if (startMode === 'empty' || !pattern) {
    return (
      <div className="needlework-studio-surface needlework-studio-empty-surface">
        <NeedleworkEmptyState
          signedIn={signedIn}
          userName={userName}
          onBrowseLibrary={() => browseLibrary()}
          onSelectDiscipline={(d) => browseLibrary(d)}
        />
        {signedIn && myProjects.length > 0 && (
          <MyNeedleworkProjectsGrid projects={myProjects} onOpen={openProject} />
        )}
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
