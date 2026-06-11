'use client'

/**
 * Step 3 - personalised preview + 4 calibration paths + save to projects.
 *
 *  Print at home : tiled PDF download via /api/.../nested-pdf (single
 *                  size or nested with the design's standard sizes)
 *  Send to       : opens the projector view in a new browser surface
 *  projector
 *  View on screen: stays on this card, displays the personalised SVG
 *  Save as PDF   : single-sheet A0 download
 *
 *  Save to my projects: POST /api/.../save-project promotes the
 *                       SewingPatternPersonalisation row into a
 *                       SewingPatternProject.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { FreesewingPatternViewer } from '@/components/studio/sewing/FreesewingPatternViewer'
import type { MeasurementField } from '@/lib/sewing/measurements'
import type { SewingDesignSummary } from './types'

interface Props {
  design: SewingDesignSummary
  measurements: Partial<Record<MeasurementField, number | null>>
  measurementsPreference: 'cm' | 'inches'
  designOptions: Record<string, number | string | boolean>
  onBack: () => void
}

type DraftStatus =
  | { tag: 'idle' }
  | { tag: 'drafting' }
  | { tag: 'ready'; id: string; svg: string; attribution: string | null }
  | { tag: 'failed'; message: string }

type SaveStatus =
  | { tag: 'idle' }
  | { tag: 'saving' }
  | { tag: 'saved'; projectId: string }
  | { tag: 'error'; message: string }

type PaperSize = 'A4' | 'LETTER' | 'A3' | 'LEGAL' | 'A0'

export function PreviewDownloadsStep({
  design,
  measurements,
  measurementsPreference,
  designOptions,
  onBack,
}: Props) {
  const [draft, setDraft] = useState<DraftStatus>({ tag: 'drafting' })
  const [save, setSave] = useState<SaveStatus>({ tag: 'idle' })
  const [paper, setPaper] = useState<PaperSize>('A4')
  const [nested, setNested] = useState<boolean>(false)
  const [downloading, setDownloading] = useState<'tiled' | 'a0' | 'nested' | null>(
    null,
  )
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const startedRef = useRef(false)

  // Kick off the personalisation draft once on mount. The API returns
  // SUCCESS synchronously; we still hold the row id for the download
  // endpoints + save-to-projects.
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    ;(async () => {
      try {
        const res = await fetch('/api/studio/sewing/personalisation', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            designSlug: design.slug,
            measurements,
            designOptions,
            measurementsPreference,
          }),
        })
        const body = await res.json()
        if (!res.ok || body.status !== 'SUCCESS') {
          setDraft({
            tag: 'failed',
            message:
              body.errorMessage ?? 'Personalisation failed. Try changing an option.',
          })
          return
        }
        setDraft({
          tag: 'ready',
          id: body.id,
          svg: body.svg,
          attribution: body.attribution ?? null,
        })
      } catch (err) {
        setDraft({
          tag: 'failed',
          message: err instanceof Error ? err.message : 'Personalisation failed.',
        })
      }
    })()
  }, [design.slug, measurements, designOptions, measurementsPreference])

  const onSaveToProjects = useCallback(async () => {
    if (draft.tag !== 'ready') return
    setSave({ tag: 'saving' })
    try {
      const res = await fetch(
        `/api/studio/sewing/personalisation/${encodeURIComponent(draft.id)}/save-project`,
        { method: 'POST' },
      )
      const body = await res.json()
      if (!res.ok) {
        setSave({
          tag: 'error',
          message: body.error ?? 'Could not save to projects.',
        })
        return
      }
      setSave({ tag: 'saved', projectId: body.projectId })
    } catch (err) {
      setSave({
        tag: 'error',
        message: err instanceof Error ? err.message : 'Save failed.',
      })
    }
  }, [draft])

  const tiledPdfDownload = useCallback(
    async (mode: 'tiled' | 'a0' | 'nested') => {
      if (draft.tag !== 'ready') return
      setDownloading(mode)
      setDownloadError(null)
      try {
        if (mode === 'nested') {
          // Multi-size nested PDF via the personalisation endpoint.
          const res = await fetch(
            `/api/studio/sewing/personalisation/${encodeURIComponent(draft.id)}/nested-pdf`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({}),
            },
          )
          if (!res.ok) {
            setDownloadError('Could not build the nested PDF.')
            return
          }
          const blob = await res.blob()
          downloadBlob(blob, `${design.slug}-nested.pdf`)
        } else {
          // For tiled and A0, build the PDF in the browser via the
          // existing pdf-lib pipeline. The SewingPatternData shape is
          // freesewing-aware so we can reuse buildSewingPatternPdf
          // directly with the rendered SVG.
          const { buildSewingPatternPdf } = await import(
            '@/lib/sewing/printing/build-pdf'
          )
          const bytes = await buildSewingPatternPdf({
            pattern: makePatternData(design, draft.svg, draft.attribution),
            paper: mode === 'a0' ? 'A0' : paper,
          })
          const blob = new Blob([bytes as unknown as BlobPart], {
            type: 'application/pdf',
          })
          downloadBlob(
            blob,
            `${design.slug}-${(mode === 'a0' ? 'A0' : paper).toLowerCase()}.pdf`,
          )
        }
      } catch (err) {
        setDownloadError(
          err instanceof Error ? err.message : 'Could not download the PDF.',
        )
      } finally {
        setDownloading(null)
      }
    },
    [draft, design, paper],
  )

  const openProjector = useCallback(() => {
    if (draft.tag !== 'ready') return
    // Project the personalised SVG via a dedicated full-screen surface.
    // Stash the SVG + design slug on sessionStorage so the projector
    // route can pull it without a draft round-trip.
    sessionStorage.setItem(
      'sew-pers-projector-svg',
      JSON.stringify({
        svg: draft.svg,
        name: design.name,
        attribution: draft.attribution,
      }),
    )
    window.open(
      `/studio/sewing/personalise/${encodeURIComponent(design.slug)}/projector`,
      '_blank',
      'noopener',
    )
  }, [draft, design])

  const isReady = draft.tag === 'ready'

  return (
    <section className="sew-pers-step-body sew-pers-step-preview">
      <h2 className="sew-pers-step-heading">Your personalised pattern</h2>
      <p className="sew-pers-step-sub">
        Drafted to your measurements. Download for print or projector, or save
        to your projects to come back later.
      </p>

      <div className="sew-pers-preview-layout">
        <aside className="sew-pers-downloads">
          <h3 className="sew-pers-downloads-heading">Get your pattern</h3>

          <details className="sew-pers-download-card">
            <summary>
              <strong>Print at home (tiled)</strong>
              <span>A4 / Letter / A3 / Legal across multiple sheets.</span>
            </summary>
            <div className="sew-pers-download-card-body">
              <label
                htmlFor="sew-pers-paper"
                className="sew-pers-download-label"
              >
                Paper size
              </label>
              <select
                id="sew-pers-paper"
                value={paper}
                onChange={(e) => setPaper(e.target.value as PaperSize)}
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="LETTER">Letter (216 × 279 mm)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="LEGAL">Legal (216 × 356 mm)</option>
              </select>
              <label className="sew-pers-download-checkbox">
                <input
                  type="checkbox"
                  checked={nested}
                  onChange={(e) => setNested(e.target.checked)}
                />
                <span>Layered PDF (advanced) — nest your size with adjacent CYC sizes</span>
              </label>
              <button
                type="button"
                disabled={!isReady || downloading !== null}
                className="sew-pers-card-cta"
                onClick={() => tiledPdfDownload(nested ? 'nested' : 'tiled')}
              >
                {downloading === 'tiled' || downloading === 'nested'
                  ? 'Building…'
                  : 'Download tiled PDF'}
              </button>
              <p className="sew-pers-download-note">
                Print at 100% scale. Do not select &ldquo;Fit to page&rdquo;.
                Page 1 carries a 5 cm test square so you can check your printer.
              </p>
            </div>
          </details>

          <details className="sew-pers-download-card">
            <summary>
              <strong>Send to projector</strong>
              <span>Calibrated grid for ceiling or floor projectors.</span>
            </summary>
            <div className="sew-pers-download-card-body">
              <button
                type="button"
                disabled={!isReady}
                className="sew-pers-card-cta"
                onClick={openProjector}
              >
                Open projector view
              </button>
              <p className="sew-pers-download-note">
                Opens a full-screen surface with a 100 mm calibration grid.
              </p>
            </div>
          </details>

          <details className="sew-pers-download-card">
            <summary>
              <strong>View on screen</strong>
              <span>Browse-only mode at relative scale.</span>
            </summary>
            <div className="sew-pers-download-card-body">
              <p className="sew-pers-download-note">
                The pattern preview to the right is the on-screen view. Use
                the 1:1 toggle and your credit card calibration to read it
                at true size.
              </p>
            </div>
          </details>

          <details className="sew-pers-download-card">
            <summary>
              <strong>Save as PDF (single sheet A0)</strong>
              <span>One large sheet for plotters or copy-shop printing.</span>
            </summary>
            <div className="sew-pers-download-card-body">
              <button
                type="button"
                disabled={!isReady || downloading !== null}
                className="sew-pers-card-cta"
                onClick={() => tiledPdfDownload('a0')}
              >
                {downloading === 'a0' ? 'Building…' : 'Download A0 PDF'}
              </button>
            </div>
          </details>

          {downloadError && (
            <div className="sew-pers-download-error">{downloadError}</div>
          )}

          <div className="sew-pers-save-block">
            <button
              type="button"
              disabled={!isReady || save.tag === 'saving' || save.tag === 'saved'}
              className="sew-pers-card-cta primary"
              onClick={onSaveToProjects}
            >
              {save.tag === 'saving' && 'Saving…'}
              {save.tag === 'saved' && 'Saved to your projects'}
              {save.tag === 'idle' && 'Save to my projects'}
              {save.tag === 'error' && 'Try again'}
            </button>
            {save.tag === 'error' && (
              <p className="sew-pers-save-error">{save.message}</p>
            )}
            {save.tag === 'saved' && (
              <p className="sew-pers-save-success">Pattern saved to your projects.</p>
            )}
          </div>
        </aside>

        <div className="sew-pers-preview-canvas">
          {draft.tag === 'drafting' && (
            <div className="sew-pers-preview-loading">
              Drafting your pattern…
            </div>
          )}
          {draft.tag === 'failed' && (
            <div className="sew-pers-preview-error">{draft.message}</div>
          )}
          {draft.tag === 'ready' && (
            <FreesewingPatternViewer
              svg={draft.svg}
              patternName={design.name}
              attribution={draft.attribution}
            />
          )}
        </div>
      </div>

      <div className="sew-pers-step-actions">
        <button type="button" className="sew-pers-card-cta" onClick={onBack}>
          Back to options
        </button>
      </div>
    </section>
  )
}

// Build a minimal SewingPatternData shape the build-pdf pipeline can
// consume. The freesewing path only reads `isFreesewingDesign`,
// `freesewingShowcaseSvg`, name, slug, and attribution — leave the rest
// at empty defaults.
function makePatternData(
  design: SewingDesignSummary,
  svg: string,
  attribution: string | null,
) {
  return {
    id: design.slug,
    slug: design.slug,
    name: design.name,
    description: design.description,
    designerName: null,
    garmentCategory: 'WOMENS_TOPS',
    garmentType: null,
    skillLevel: design.skillLevel,
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
    freesewingDesignSlug: design.slug,
    freesewingShowcaseSvg: svg,
    freesewingShowcaseCacheKey: null,
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

