'use client'

/**
 * Personalisation projector view. Reads the personalised SVG from
 * sessionStorage (stashed by PreviewDownloadsStep before window.open)
 * and hands it to ProjectorView for 1:1 projection.
 *
 * No DB read needed — the SVG already exists in the browser. This avoids
 * a second freesewing round-trip and keeps the projector responsive on
 * spotty network.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ProjectorView } from '@/components/studio/sewing/projector/ProjectorView'
import type { SewingPatternData } from '@/components/studio/sewing/types'

interface Props {
  designSlug: string
  designName: string
}

type StashedPayload =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'ready'; svg: string; attribution: string | null }

function readStash(): StashedPayload {
  if (typeof window === 'undefined') return { kind: 'loading' }
  try {
    const raw = window.sessionStorage.getItem('sew-pers-projector-svg')
    if (!raw) return { kind: 'missing' }
    const parsed = JSON.parse(raw) as {
      svg: string
      name: string
      attribution: string | null
    }
    return { kind: 'ready', svg: parsed.svg, attribution: parsed.attribution }
  } catch {
    return { kind: 'missing' }
  }
}

export function PersonalisationProjectorClient({ designSlug, designName }: Props) {
  const router = useRouter()
  // Lazy initialiser — runs once on first render; safe for SSR because
  // we don't touch window outside the client guard.
  const [payload] = useState<StashedPayload>(() => readStash())
  const svg = payload.kind === 'ready' ? payload.svg : null
  const attribution = payload.kind === 'ready' ? payload.attribution : null
  const missing = payload.kind === 'missing'

  if (missing) {
    return (
      <div className="sew-pers-projector-fallback">
        <p>
          Open the projector view from the personalisation preview, not directly.
        </p>
        <button
          type="button"
          className="sew-pers-card-cta"
          onClick={() =>
            router.push(
              `/studio/sewing/personalise/${encodeURIComponent(designSlug)}`,
            )
          }
        >
          Back to personalisation
        </button>
      </div>
    )
  }

  if (!svg) {
    return <div className="sew-pers-projector-loading">Loading projector…</div>
  }

  const pattern: SewingPatternData = {
    id: designSlug,
    slug: designSlug,
    name: designName,
    description: null,
    designerName: null,
    garmentCategory: 'WOMENS_TOPS',
    garmentType: null,
    skillLevel: 'IMPROVER',
    seamAllowanceIncluded: false,
    seamAllowanceCm: 1,
    supportedSizes: [{ name: 'Custom', body: {} }],
    defaultSize: 'Custom',
    pieces: [],
    instructionsBody: null,
    recommendedNotions: [],
    fabricRequirements: {},
    cuttingLayouts: {},
    attributionText: attribution,
    isFreesewingDesign: true,
    freesewingDesignSlug: designSlug,
    freesewingShowcaseSvg: svg,
    freesewingShowcaseCacheKey: null,
  }

  return (
    <ProjectorView
      pattern={pattern}
      freesewingSvg={svg}
      selectedSize="Custom"
      onExit={() => window.close()}
    />
  )
}
