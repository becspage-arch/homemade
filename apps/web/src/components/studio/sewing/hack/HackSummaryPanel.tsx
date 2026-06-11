'use client'

/**
 * Right-panel summary for the hack composer. Shows the current option
 * set in human-readable form, a reset link, the save-as-hack flow, and
 * the four calibration-path download buttons.
 *
 * Save: signed-in users POST /api/studio/sewing/hack with the current
 * options + measurements snapshot. Anonymous users see a sign-in CTA.
 *
 * Downloads reuse the same pdf-lib pipeline as S-5d's
 * PreviewDownloadsStep. Browse + projector both use the live preview SVG.
 */

import { useCallback, useState } from 'react'
import Link from 'next/link'

import type { MeasurementField } from '@/lib/sewing/measurements'
import { captureClientEvent } from '@/lib/client-analytics'
import type { HackComposerDesign } from './types'

interface Props {
  design: HackComposerDesign
  options: Record<string, number | string | boolean>
  measurements: Partial<Record<MeasurementField, number | null>>
  measurementsPreference: 'cm' | 'inches'
  previewSvg: string | null
  previewAttribution: string | null
  signedIn: boolean
  onReset: () => void
}

type SaveStatus =
  | { tag: 'idle' }
  | { tag: 'saving' }
  | { tag: 'saved'; hackId: string }
  | { tag: 'error'; message: string }

type PaperSize = 'A4' | 'LETTER' | 'A3' | 'LEGAL' | 'A0'

export function HackSummaryPanel({
  design,
  options,
  measurements,
  measurementsPreference,
  previewSvg,
  previewAttribution,
  signedIn,
  onReset,
}: Props) {
  const [name, setName] = useState<string>(`Hack of ${design.name}`)
  const [save, setSave] = useState<SaveStatus>({ tag: 'idle' })
  const [paper, setPaper] = useState<PaperSize>('A4')
  const [downloading, setDownloading] = useState<'tiled' | 'a0' | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const onSave = useCallback(async () => {
    if (!signedIn) {
      captureClientEvent('sewing_signin_cta_clicked', {
        source: 'hack_save',
      })
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(
        `/studio/sewing/hack/${design.slug}`,
      )}`
      return
    }
    setSave({ tag: 'saving' })
    try {
      const res = await fetch('/api/studio/sewing/hack', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          designSlug: design.slug,
          name,
          hackOptions: options,
          measurements,
          measurementsPreference,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setSave({
          tag: 'error',
          message: body.error ?? 'Could not save the hack.',
        })
        return
      }
      setSave({ tag: 'saved', hackId: body.id })
      captureClientEvent('sewing_hack_saved', {
        designSlug: design.slug,
        hack_id: body.id,
        operations_applied: Object.keys(options).length,
      })
    } catch (err) {
      setSave({
        tag: 'error',
        message: err instanceof Error ? err.message : 'Save failed.',
      })
    }
  }, [
    design.slug,
    name,
    options,
    measurements,
    measurementsPreference,
    signedIn,
  ])

  const downloadPdf = useCallback(
    async (mode: 'tiled' | 'a0') => {
      if (!previewSvg) return
      setDownloading(mode)
      setDownloadError(null)
      try {
        const { buildSewingPatternPdf } = await import(
          '@/lib/sewing/printing/build-pdf'
        )
        const bytes = await buildSewingPatternPdf({
          pattern: {
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
            attributionText: previewAttribution,
            isFreesewingDesign: true,
            freesewingDesignSlug: design.slug,
            freesewingShowcaseSvg: previewSvg,
            freesewingShowcaseCacheKey: null,
          },
          paper: mode === 'a0' ? 'A0' : paper,
        })
        const blob = new Blob([bytes as unknown as BlobPart], {
          type: 'application/pdf',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${design.slug}-hack-${(mode === 'a0' ? 'A0' : paper).toLowerCase()}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        captureClientEvent('sewing_download_print', {
          designSlug: design.slug,
          paper_size: mode === 'a0' ? 'A0' : paper,
          layered: false,
        })
      } catch (err) {
        setDownloadError(
          err instanceof Error ? err.message : 'Could not download the PDF.',
        )
      } finally {
        setDownloading(null)
      }
    },
    [design, paper, previewAttribution, previewSvg],
  )

  const openProjector = useCallback(() => {
    if (!previewSvg) return
    sessionStorage.setItem(
      'sew-pers-projector-svg',
      JSON.stringify({
        svg: previewSvg,
        name: `${design.name} (hack)`,
        attribution: previewAttribution,
      }),
    )
    captureClientEvent('sewing_download_projector', {
      designSlug: design.slug,
    })
    window.open(
      `/studio/sewing/personalise/${encodeURIComponent(design.slug)}/projector`,
      '_blank',
      'noopener',
    )
  }, [design.name, design.slug, previewAttribution, previewSvg])

  return (
    <div className="sew-hack-summary-inner">
      <h2 className="sew-hack-summary-heading">Your hack</h2>
      <ul className="sew-hack-summary-list">
        {Object.entries(design.options).map(([key, meta]) => {
          const value = options[key]
          return (
            <li key={key} className="sew-hack-summary-item">
              <span className="sew-hack-summary-key">{meta.label}</span>
              <span className="sew-hack-summary-value">
                {formatSummaryValue(value, meta.type)}
              </span>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="sew-hack-summary-reset"
        onClick={onReset}
      >
        Reset to defaults
      </button>

      <div className="sew-hack-save-block">
        <label htmlFor="hack-name" className="sew-hack-save-label">
          Name this hack
        </label>
        <input
          id="hack-name"
          type="text"
          className="sew-hack-save-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
        />
        <button
          type="button"
          disabled={save.tag === 'saving' || save.tag === 'saved'}
          className="sew-pers-card-cta primary"
          onClick={onSave}
        >
          {save.tag === 'saving' && 'Saving…'}
          {save.tag === 'saved' && 'Saved'}
          {(save.tag === 'idle' || save.tag === 'error') &&
            (signedIn ? 'Save this hack' : 'Sign in to save')}
        </button>
        {save.tag === 'error' ? (
          <p className="sew-hack-save-error">{save.message}</p>
        ) : null}
        {save.tag === 'saved' ? (
          <p className="sew-hack-save-success">
            Saved.{' '}
            <Link href="/me/sewing-hacks">See all your hacks</Link>
          </p>
        ) : null}
      </div>

      <div className="sew-hack-downloads">
        <h3 className="sew-hack-downloads-heading">Get your pattern</h3>

        <label htmlFor="hack-paper" className="sew-hack-download-label">
          Paper size
        </label>
        <select
          id="hack-paper"
          value={paper}
          onChange={(e) => setPaper(e.target.value as PaperSize)}
        >
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="LETTER">Letter (216 × 279 mm)</option>
          <option value="A3">A3 (297 × 420 mm)</option>
          <option value="LEGAL">Legal (216 × 356 mm)</option>
        </select>

        <button
          type="button"
          disabled={!previewSvg || downloading !== null}
          className="sew-pers-card-cta"
          onClick={() => downloadPdf('tiled')}
        >
          {downloading === 'tiled' ? 'Building…' : 'Print at home'}
        </button>

        <button
          type="button"
          disabled={!previewSvg}
          className="sew-pers-card-cta"
          onClick={openProjector}
        >
          Send to projector
        </button>

        <button
          type="button"
          disabled={!previewSvg || downloading !== null}
          className="sew-pers-card-cta"
          onClick={() => downloadPdf('a0')}
        >
          {downloading === 'a0' ? 'Building…' : 'Save as PDF'}
        </button>

        <p className="sew-hack-downloads-note">
          The viewer to the left is the view-on-screen mode. Use the 1:1
          toggle and your credit-card calibration to read at true size.
        </p>

        {downloadError ? (
          <p className="sew-hack-save-error">{downloadError}</p>
        ) : null}
      </div>
    </div>
  )
}

function formatSummaryValue(
  value: number | string | boolean | undefined,
  type: 'pct' | 'mm' | 'bool' | 'enum',
): string {
  if (value === undefined) return '—'
  if (type === 'pct' && typeof value === 'number') {
    return `${(value * 100).toFixed(1)}%`
  }
  if (type === 'mm' && typeof value === 'number') return `${value} mm`
  if (type === 'bool') return value ? 'on' : 'off'
  return String(value)
}
