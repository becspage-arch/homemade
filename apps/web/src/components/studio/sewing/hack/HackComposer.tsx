'use client'

/**
 * Visual hack composer — three-panel surface for /studio/sewing/hack/[slug].
 *
 * Left panel — Tools / option sliders, one per design option.
 * Centre — pattern viewer with overlaid drag handles. Each handle binds
 *   to a freesewing option per the registry's hackHandles list. Dragging
 *   updates the option; the viewer re-renders via debounced /api/studio/sewing/draft.
 * Right panel — current option summary + reset + save-as-hack + downloads.
 *
 * Anonymous users can browse + tinker. Saving requires sign-in (per the
 * locked sign-in carrots — saved data needs an account).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

import type { MeasurementField } from '@/lib/sewing/measurements'
import type { SewingHackHandle } from '@/lib/sewing/grading/types'
import { homemadeFieldsFor } from '@/lib/sewing/grading/measurement-translation'
import { captureClientEvent } from '@/lib/client-analytics'
import { FreesewingPatternViewer } from '@/components/studio/sewing/FreesewingPatternViewer'
import type { HackComposerDesign, MeasurementsMap } from './types'
import { HackOptionsPanel } from './HackOptionsPanel'
import { HackViewerWithHandles } from './HackViewerWithHandles'
import { HackSummaryPanel } from './HackSummaryPanel'

interface Props {
  design: HackComposerDesign
  savedFields: MeasurementsMap
  preference: 'cm' | 'inches'
  signedIn: boolean
  showcaseSvg: string | null
  showcaseAttribution: string | null
}

const PREVIEW_DEBOUNCE_MS = 300

export function HackComposer({
  design,
  savedFields,
  preference,
  signedIn,
  showcaseSvg,
  showcaseAttribution,
}: Props) {
  const requiredHomemadeFields = useMemo(
    () => homemadeFieldsFor(design.requiredMeasurements),
    [design.requiredMeasurements],
  )

  const measurements = useMemo<MeasurementsMap>(
    () => fillDefaultsForMissing(savedFields, requiredHomemadeFields),
    [savedFields, requiredHomemadeFields],
  )

  const [options, setOptions] = useState<
    Record<string, number | string | boolean>
  >(() => defaultOptionsFor(design))
  const [previewSvg, setPreviewSvg] = useState<string | null>(showcaseSvg)
  const [previewAttribution, setPreviewAttribution] = useState<string | null>(
    showcaseAttribution,
  )
  const [previewLoading, setPreviewLoading] = useState<boolean>(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const requestSeqRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedFromSavedRef = useRef(false)

  useEffect(() => {
    if (loadedFromSavedRef.current) return
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const hackId = url.searchParams.get('hack')
    if (!hackId || !signedIn) return
    loadedFromSavedRef.current = true
    ;(async () => {
      try {
        const res = await fetch(`/api/studio/sewing/hack/${encodeURIComponent(hackId)}`)
        if (!res.ok) return
        const data = (await res.json()) as {
          hackOptions: Record<string, number | string | boolean>
        }
        if (data.hackOptions && typeof data.hackOptions === 'object') {
          setOptions(data.hackOptions)
          captureClientEvent('sewing_hack_loaded_from_saved', {
            hack_id: hackId,
          })
        }
      } catch {
        // load failure is non-fatal — composer keeps default options
      }
    })()
  }, [signedIn])

  const runPreview = useCallback(async () => {
    if (!signedIn) {
      // Anonymous users see the showcase SVG and a sign-in CTA on save.
      // We skip the draft round trip to avoid the 401 from the route.
      return
    }
    setPreviewLoading(true)
    setPreviewError(null)
    const seq = ++requestSeqRef.current
    try {
      const res = await fetch('/api/studio/sewing/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          designSlug: design.slug,
          measurements,
          options: { designOptions: options },
          calibrationMode: 'BROWSE',
        }),
      })
      if (seq !== requestSeqRef.current) return
      if (!res.ok) {
        setPreviewError('Preview failed. Try changing a value.')
        return
      }
      const data = (await res.json()) as {
        svg: string
        attribution: string | null
      }
      setPreviewSvg(data.svg)
      setPreviewAttribution(data.attribution)
    } catch {
      if (seq === requestSeqRef.current) setPreviewError('Preview failed.')
    } finally {
      if (seq === requestSeqRef.current) setPreviewLoading(false)
    }
  }, [design.slug, measurements, options, signedIn])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void runPreview()
    }, PREVIEW_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [runPreview])

  const applyOptionChange = useCallback(
    (
      handle: SewingHackHandle | null,
      optionKey: string,
      value: number | string | boolean,
    ) => {
      setOptions((prev) => ({ ...prev, [optionKey]: value }))
      captureClientEvent('sewing_hack_operation_applied', {
        designSlug: design.slug,
        operation: handle ? handleOperationName(handle) : 'option_slider',
        option_key: optionKey,
        option_value: typeof value === 'number' ? value : String(value),
      })
    },
    [design.slug],
  )

  const handleReset = useCallback(() => {
    setOptions(defaultOptionsFor(design))
    captureClientEvent('sewing_hack_operation_applied', {
      designSlug: design.slug,
      operation: 'reset_to_defaults',
      option_key: '*',
      option_value: 'defaults',
    })
  }, [design])

  return (
    <div className="sew-pers-surface sew-hack-surface">
      <header className="sew-pers-header">
        <nav className="sew-pers-crumbs" aria-label="Breadcrumb">
          <Link href="/studio/sewing">Sewing Studio</Link>
          <span aria-hidden>›</span>
          <Link href="/studio/sewing/hack">Hack a pattern</Link>
          <span aria-hidden>›</span>
          <span>{design.name}</span>
        </nav>
        <h1 className="sew-pers-heading">Hack {design.name}</h1>
        <p className="sew-pers-lede">
          Drag a handle on the pattern or use the sliders on the left. The
          preview updates as you go.
        </p>
      </header>

      <div className="sew-hack-layout">
        <aside className="sew-hack-tools" aria-label="Hack operations">
          <h2 className="sew-hack-tools-heading">Operations</h2>
          <HackOptionsPanel
            design={design}
            options={options}
            onChange={(key, value) => applyOptionChange(null, key, value)}
          />
        </aside>

        <div className="sew-hack-canvas">
          {previewSvg ? (
            <HackViewerWithHandles
              design={design}
              svg={previewSvg}
              attribution={previewAttribution}
              options={options}
              loading={previewLoading}
              onHandleChange={(handle, value) =>
                applyOptionChange(handle, handle.optionKey, value)
              }
            />
          ) : (
            <div className="sew-hack-canvas-empty">
              {previewLoading ? 'Drafting your preview…' : 'No preview yet.'}
            </div>
          )}
          {previewError ? (
            <div className="sew-hack-canvas-error">{previewError}</div>
          ) : null}
        </div>

        <aside className="sew-hack-summary" aria-label="Hack summary">
          <HackSummaryPanel
            design={design}
            options={options}
            measurements={measurements}
            measurementsPreference={preference}
            previewSvg={previewSvg}
            previewAttribution={previewAttribution}
            signedIn={signedIn}
            onReset={handleReset}
          />
        </aside>
      </div>
    </div>
  )
}

function defaultOptionsFor(
  design: HackComposerDesign,
): Record<string, number | string | boolean> {
  const out: Record<string, number | string | boolean> = {}
  for (const [name, meta] of Object.entries(design.options)) {
    if (meta.type === 'pct') {
      out[name] = Number((meta.default / 100).toFixed(4))
    } else if (meta.type === 'mm') {
      out[name] = meta.default
    } else if (meta.type === 'bool') {
      out[name] = meta.default
    } else {
      out[name] = meta.default
    }
  }
  return out
}

function fillDefaultsForMissing(
  saved: MeasurementsMap,
  requiredFields: MeasurementField[],
): MeasurementsMap {
  // Anonymous users see the composer at standard sizing until they sign
  // in to draft against their own profile. Standard-sizing defaults come
  // from freesewing's CYC chart at draft time — we send the saved fields
  // as-is and let the wrapper translate missing keys to its defaults.
  const out: MeasurementsMap = { ...saved }
  for (const f of requiredFields) {
    if (out[f] === null || out[f] === undefined) {
      out[f] = null
    }
  }
  return out
}

function handleOperationName(handle: SewingHackHandle): string {
  switch (handle.attachTo) {
    case 'bodyHem':
      return handle.axis === 'vertical' ? 'lengthen_body' : 'adjust_body_ease'
    case 'sleeveCuff':
      return handle.axis === 'vertical'
        ? 'lengthen_sleeve'
        : 'adjust_sleeve_ease'
    case 'neckline':
      return 'change_neckline'
    case 'pocket':
      return 'toggle_pocket'
    case 'waistline':
      return 'adjust_waist'
    case 'hem':
      return 'adjust_hem'
    default:
      return 'unknown_operation'
  }
}

// Re-export so non-default callers can keep the FreesewingPatternViewer
// import path consistent with the other components in this directory.
export { FreesewingPatternViewer }
