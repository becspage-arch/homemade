'use client'

/**
 * SewingStudioShell - client-side top surface for /studio/sewing.
 *
 * Empty state: hero + start cards + (signed-in) projects grid.
 * Pattern state: full Studio with the active project surface.
 *
 * Mirrors the Knitting / Crochet shell pattern. URL-driven: a slug
 * loaded by the server page hands the pattern in here.
 */

import { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { SewingActiveProject } from './SewingActiveProject'
import { SewingEmptyState } from './SewingEmptyState'
import { MySewingProjectsGrid } from './MySewingProjectsGrid'
import type {
  MySewingProjectListItem,
  SewingPatternData,
  SewingProjectProgressData,
} from './types'
import './sewing-studio.css'

export type SewingStudioStartMode = 'empty' | 'pattern'

interface SewingStudioShellProps {
  startMode: SewingStudioStartMode
  signedIn: boolean
  userName: string | null
  pattern: SewingPatternData | null
  progress: SewingProjectProgressData | null
  myProjects: MySewingProjectListItem[]
  measurementPreference?: 'cm' | 'inches' | null
}

export function SewingStudioShell({
  startMode,
  signedIn,
  userName,
  pattern,
  progress,
  myProjects,
  measurementPreference,
}: SewingStudioShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pattern) {
      try {
        window.localStorage.setItem('sewing-studio:last-pattern', pattern.slug)
      } catch {
        // ignore
      }
    }
  }, [pattern])

  const openSlug = useCallback(
    (slug: string) => {
      router.push(`/studio/sewing/${encodeURIComponent(slug)}`)
    },
    [router],
  )

  const browseLibrary = useCallback(() => {
    router.push('/sewing/patterns')
  }, [router])

  const cancelToEmpty = useCallback(() => {
    router.replace('/studio/sewing', { scroll: false })
  }, [router])

  const startFromUrl = useCallback(() => {
    const url = window.prompt('Paste a sewing pattern URL or slug')
    if (!url) return
    const slug = url.trim().split('/').pop() ?? url.trim()
    if (!slug) return
    router.push(`/studio/sewing/${encodeURIComponent(slug)}`)
  }, [router])

  const openDemo = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('demo', '1')
    router.push(`/studio/sewing?${params.toString()}`)
  }, [router, searchParams])

  if (startMode === 'empty' || !pattern) {
    return (
      <div className="sewing-studio-surface sewing-studio-empty-surface">
        <SewingEmptyState
          signedIn={signedIn}
          userName={userName}
          onBrowseLibrary={browseLibrary}
          onStartFromUrl={startFromUrl}
          onStartNewProject={browseLibrary}
          onOpenDemo={openDemo}
        />
        {signedIn && myProjects.length > 0 && (
          <MySewingProjectsGrid projects={myProjects} onOpen={openSlug} />
        )}
      </div>
    )
  }

  return (
    <div className="sewing-studio-surface">
      <SewingActiveProject
        pattern={pattern}
        progress={progress}
        signedIn={signedIn}
        measurementPreference={measurementPreference}
        onClose={cancelToEmpty}
      />
    </div>
  )
}
