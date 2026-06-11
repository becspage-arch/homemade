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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { ProjectorView } from '@/components/studio/sewing/projector/ProjectorView'
import type { SewingPatternData } from '@/components/studio/sewing/types'

interface Props {
  designSlug: string
  designName: string
}

export function PersonalisationProjectorClient({ designSlug, designName }: Props) {
  const router = useRouter()
  const [svg, setSvg] = useState<string | null>(null)
  const [attribution, setAttribution] = useState<string | null>(null)
  const [missing, setMissing] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sew-pers-projector-svg')
      if (!raw) {
        setMissing(true)
        return
      }
      const parsed = JSON.parse(raw) as {
        svg: string
        name: string
        attribution: string | null
      }
      setSvg(parsed.svg)
      setAttribution(parsed.attribution)
    } catch {
      setMissing(true)
    }
  }, [])

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
