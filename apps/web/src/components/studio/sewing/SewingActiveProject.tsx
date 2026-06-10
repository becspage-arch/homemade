'use client'

/**
 * SewingActiveProject - pattern-loaded surface. Left side: pattern
 * viewer. Right side: tabbed panel switching between Instructions,
 * Materials, Cutting layout, Calibration, and Downloads.
 *
 * The shell hands in the pattern data plus any existing project
 * progress. For signed-in users the step-toggle wire goes through the
 * shared use-autosave hook to PATCH the project API. For signed-out
 * users step ticks live in component state only.
 */

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { useAutosave } from '@/lib/studio/use-autosave'
import { CreditCardCalibration } from './CreditCardCalibration'
import { CuttingLayoutViewer } from './CuttingLayoutViewer'
import { FreesewingPatternViewer } from './FreesewingPatternViewer'
import { MaterialsCalculator } from './MaterialsCalculator'
import { SewingInstructionsPanel } from './SewingInstructionsPanel'
import { SewingPatternViewer } from './SewingPatternViewer'
import type { SewingPatternData, SewingProjectProgressData } from './types'

interface SewingActiveProjectProps {
  pattern: SewingPatternData
  progress: SewingProjectProgressData | null
  signedIn: boolean
  measurementPreference?: 'cm' | 'inches' | null
  onClose: () => void
}

type PanelTab = 'instructions' | 'fabric' | 'layout' | 'calibration' | 'downloads'

export function SewingActiveProject({
  pattern,
  progress,
  signedIn,
  measurementPreference,
  onClose,
}: SewingActiveProjectProps) {
  const [selectedSize, setSelectedSize] = useState<string>(
    progress?.selectedSize ?? pattern.defaultSize,
  )
  const [stepsProgress, setStepsProgress] = useState<
    Record<string, { completedAt: string; notes?: string | null }>
  >(progress?.stepsProgress ?? {})
  const [tab, setTab] = useState<PanelTab>('instructions')

  const autosave = useAutosave<{
    selectedSize: string | null
    stepsProgress: Record<string, { completedAt: string; notes?: string | null }>
  }>({
    url: `/api/studio/sewing/progress/${pattern.id}`,
    enabled: signedIn,
  })

  useEffect(() => {
    autosave.setPendingState({ selectedSize, stepsProgress })
    autosave.scheduleSave()
  }, [autosave, selectedSize, stepsProgress])

  const toggleStep = useCallback((stepIndex: number) => {
    setStepsProgress((prev) => {
      const key = String(stepIndex)
      if (prev[key]) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: { completedAt: new Date(0).toISOString() } }
    })
  }, [])

  const printHref = `/studio/sewing/${encodeURIComponent(pattern.slug)}/print`
  const projectorHref = `/studio/sewing/${encodeURIComponent(pattern.slug)}/projector?size=${encodeURIComponent(selectedSize)}`
  const instructionsPrintHref = `/studio/sewing/${encodeURIComponent(pattern.slug)}/instructions/print`

  return (
    <>
      <div className="sewing-studio-toolbar">
        <div>
          <span className="sewing-studio-toolbar-title">{pattern.name}</span>
          {pattern.designerName && (
            <span className="sewing-studio-toolbar-designer">
              by {pattern.designerName}
            </span>
          )}
        </div>
        <div className="sewing-studio-toolbar-actions">
          <label className="sew-panel-label" style={{ margin: 0 }} htmlFor="size-pick">
            Size
          </label>
          <select
            id="size-pick"
            className="sew-panel-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            style={{ padding: '0.3rem 0.5rem' }}
          >
            {pattern.supportedSizes.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <Link href={printHref} className="sewing-studio-toolbar-button">
            Print
          </Link>
          <Link href={projectorHref} className="sewing-studio-toolbar-button">
            Projector
          </Link>
          <button
            type="button"
            className="sewing-studio-toolbar-button subtle"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <div className="sewing-studio-active">
        <div className="sewing-studio-viewer-panel">
          {pattern.isFreesewingDesign && pattern.freesewingShowcaseSvg ? (
            <FreesewingPatternViewer
              svg={pattern.freesewingShowcaseSvg}
              patternName={pattern.name}
              attribution={pattern.attributionText}
            />
          ) : (
            <SewingPatternViewer pattern={pattern} selectedSize={selectedSize} />
          )}
        </div>

        <div className="sewing-studio-side-panel">
          <div className="sew-panel-tabs" role="tablist">
            <button
              type="button"
              className={`sew-panel-tab ${tab === 'instructions' ? 'active' : ''}`}
              onClick={() => setTab('instructions')}
            >
              Instructions
            </button>
            <button
              type="button"
              className={`sew-panel-tab ${tab === 'fabric' ? 'active' : ''}`}
              onClick={() => setTab('fabric')}
            >
              Fabric
            </button>
            <button
              type="button"
              className={`sew-panel-tab ${tab === 'layout' ? 'active' : ''}`}
              onClick={() => setTab('layout')}
            >
              Cutting
            </button>
            <button
              type="button"
              className={`sew-panel-tab ${tab === 'calibration' ? 'active' : ''}`}
              onClick={() => setTab('calibration')}
            >
              Calibrate
            </button>
            <button
              type="button"
              className={`sew-panel-tab ${tab === 'downloads' ? 'active' : ''}`}
              onClick={() => setTab('downloads')}
            >
              Print
            </button>
          </div>

          {tab === 'instructions' && (
            <SewingInstructionsPanel
              body={pattern.instructionsBody}
              stepsProgress={stepsProgress}
              onToggleStep={toggleStep}
              showActions={true}
            />
          )}
          {tab === 'fabric' && (
            <MaterialsCalculator
              pattern={pattern}
              selectedSize={selectedSize}
              measurementPreference={measurementPreference}
            />
          )}
          {tab === 'layout' && (
            <CuttingLayoutViewer pattern={pattern} selectedSize={selectedSize} />
          )}
          {tab === 'calibration' && <CreditCardCalibration />}
          {tab === 'downloads' && (
            <div className="sew-panel-section">
              <h3 className="sew-panel-heading">Print and project</h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>
                Pick how you want to work with the pattern.
              </p>
              <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>
                  <Link href={printHref} className="sewing-studio-toolbar-button">
                    Tiled print
                  </Link>
                  {' - A4 or Letter pages with a test square and registration marks.'}
                </li>
                <li>
                  <Link href={projectorHref} className="sewing-studio-toolbar-button">
                    Projector view
                  </Link>
                  {' - fullscreen 1:1 render for a fabric projector.'}
                </li>
                <li>
                  <Link href={instructionsPrintHref} className="sewing-studio-toolbar-button">
                    Print instructions
                  </Link>
                  {' - instructions only, no pattern pieces.'}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
