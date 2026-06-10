'use client'

import { useRouter } from 'next/navigation'

import { ProjectorView } from '@/components/studio/sewing/projector/ProjectorView'
import type { SewingPatternData } from '@/components/studio/sewing/types'
import '@/components/studio/sewing/sewing-studio.css'

export function SewingProjectorShell({
  pattern,
  selectedSize,
}: {
  pattern: SewingPatternData
  selectedSize: string
}) {
  const router = useRouter()
  return (
    <ProjectorView
      pattern={pattern}
      selectedSize={selectedSize}
      onExit={() => router.push(`/studio/sewing/${encodeURIComponent(pattern.slug)}`)}
    />
  )
}
