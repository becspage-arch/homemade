'use client'

/**
 * PersonaliseFlow - three-step shell for /studio/sewing/personalise/[slug].
 *
 *   Step 1: Confirm measurements (read UserSewingMeasurements, edit inline)
 *   Step 2: Pick design options (debounced live preview)
 *   Step 3: Personalised preview + 4 calibration paths + save to projects
 *
 * Anonymous users see a sign-in CTA at step 1 instead of the editor —
 * personalising means using the user's saved measurements, which is a
 * signed-in (free) feature per the locked sign-in carrots.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { FreesewingPatternViewer } from '@/components/studio/sewing/FreesewingPatternViewer'
import type { MeasurementField } from '@/lib/sewing/measurements'
import { captureClientEvent } from '@/lib/client-analytics'
import type {
  SewingDesignSummary,
  SavedMeasurements,
} from './types'
import { homemadeFieldsFor } from '@/lib/sewing/grading/measurement-translation'
import { MeasurementsConfirmStep } from './MeasurementsConfirmStep'
import { DesignOptionsStep } from './DesignOptionsStep'
import { PreviewDownloadsStep } from './PreviewDownloadsStep'

interface PersonaliseFlowProps {
  design: SewingDesignSummary
  saved: SavedMeasurements
  preference: 'cm' | 'inches'
  signedIn: boolean
  showcaseSvg: string | null
  showcaseAttribution: string | null
}

export type StepIndex = 1 | 2 | 3

export function PersonaliseFlow({
  design,
  saved,
  preference: initialPreference,
  signedIn,
  showcaseSvg,
  showcaseAttribution,
}: PersonaliseFlowProps) {
  const [step, setStep] = useState<StepIndex>(1)
  const [preference, setPreference] = useState<'cm' | 'inches'>(initialPreference)
  const [measurements, setMeasurements] = useState<
    Partial<Record<MeasurementField, number | null>>
  >(() => ({ ...saved.fields }))
  const [designOptions, setDesignOptions] = useState<
    Record<string, number | string | boolean>
  >(() => initialOptionsFor(design))

  const requiredHomemadeFields = useMemo(
    () => homemadeFieldsFor(design.requiredMeasurements),
    [design.requiredMeasurements],
  )

  const optionalHomemadeFields = useMemo(() => {
    const required = new Set(requiredHomemadeFields)
    return homemadeFieldsFor(design.optionalMeasurements).filter(
      (f) => !required.has(f),
    )
  }, [design.optionalMeasurements, requiredHomemadeFields])

  const missingRequired = useMemo(
    () =>
      requiredHomemadeFields.filter((f) => {
        const v = measurements[f]
        return typeof v !== 'number' || !Number.isFinite(v)
      }),
    [requiredHomemadeFields, measurements],
  )

  const canAdvanceToStep2 = signedIn && missingRequired.length === 0

  const onContinueFromStep1 = useCallback(() => {
    if (!canAdvanceToStep2) return
    setStep(2)
  }, [canAdvanceToStep2])

  const onContinueFromStep2 = useCallback(() => setStep(3), [])

  const backTo = useCallback((target: StepIndex) => setStep(target), [])

  return (
    <div className="sew-pers-surface">
      <header className="sew-pers-header">
        <nav className="sew-pers-crumbs" aria-label="Breadcrumb">
          <Link href="/studio/sewing">Sewing Studio</Link>
          <span aria-hidden>›</span>
          <Link href="/studio/sewing/personalise">Personalise</Link>
          <span aria-hidden>›</span>
          <span>{design.name}</span>
        </nav>
        <h1 className="sew-pers-heading">Personalise {design.name}</h1>
      </header>

      <StepIndicator step={step} signedIn={signedIn} />

      {step === 1 && (
        <>
          {!signedIn ? (
            <SignInGateBlock
              showcaseSvg={showcaseSvg}
              attribution={showcaseAttribution}
              designName={design.name}
            />
          ) : (
            <MeasurementsConfirmStep
              measurements={measurements}
              preference={preference}
              requiredFields={requiredHomemadeFields}
              optionalFields={optionalHomemadeFields}
              missingRequired={missingRequired}
              setMeasurements={setMeasurements}
              setPreference={setPreference}
              onContinue={onContinueFromStep1}
              canContinue={canAdvanceToStep2}
            />
          )}
        </>
      )}

      {step === 2 && signedIn && (
        <DesignOptionsStep
          design={design}
          measurements={measurements}
          options={designOptions}
          setOptions={setDesignOptions}
          onBack={() => backTo(1)}
          onContinue={onContinueFromStep2}
        />
      )}

      {step === 3 && signedIn && (
        <PreviewDownloadsStep
          design={design}
          measurements={measurements}
          measurementsPreference={preference}
          designOptions={designOptions}
          signedIn={signedIn}
          onBack={() => backTo(2)}
        />
      )}
    </div>
  )
}

function StepIndicator({
  step,
  signedIn,
}: {
  step: StepIndex
  signedIn: boolean
}) {
  const steps = [
    { i: 1 as const, label: signedIn ? 'Confirm measurements' : 'Sign in' },
    { i: 2 as const, label: 'Choose your options' },
    { i: 3 as const, label: 'Your personalised pattern' },
  ]
  return (
    <ol className="sew-pers-steps" aria-label="Progress">
      {steps.map((s) => (
        <li
          key={s.i}
          className={`sew-pers-step ${step === s.i ? 'active' : ''} ${step > s.i ? 'done' : ''}`}
          aria-current={step === s.i ? 'step' : undefined}
        >
          <span className="sew-pers-step-num">{s.i}</span>
          <span className="sew-pers-step-label">{s.label}</span>
        </li>
      ))}
    </ol>
  )
}

function SignInGateBlock({
  showcaseSvg,
  attribution,
  designName,
}: {
  showcaseSvg: string | null
  attribution: string | null
  designName: string
}) {
  useEffect(() => {
    captureClientEvent('sewing_signin_cta_shown', {
      source: 'step_1_measurements',
    })
  }, [])
  const onClickSignIn = useCallback(() => {
    captureClientEvent('sewing_signin_cta_clicked', {
      source: 'step_1_measurements',
    })
  }, [])
  return (
    <div className="sew-pers-signin-gate">
      <div className="sew-pers-signin-copy">
        <h2>Sign in to use your measurements. It&rsquo;s free.</h2>
        <p>
          Personalising means drafting this design to your saved bust, waist,
          and hip measurements. Saved measurements and cross-device progress
          come with a free Homemade account.
        </p>
        <div className="sew-pers-signin-actions">
          <Link
            className="sew-pers-card-cta primary"
            href={`/sign-in?redirect_url=/studio/sewing/personalise/${encodeURIComponent(designName.toLowerCase())}`}
            onClick={onClickSignIn}
          >
            Sign in
          </Link>
          <Link
            className="sew-pers-card-cta"
            href="/studio/sewing/personalise"
          >
            Browse other designs
          </Link>
        </div>
        <p className="sew-pers-signin-muted">
          You can browse this design at standard sizing on the picker without
          signing in.
        </p>
      </div>
      {showcaseSvg ? (
        <div className="sew-pers-signin-preview">
          <FreesewingPatternViewer
            svg={showcaseSvg}
            patternName={`${designName} (standard sizing)`}
            attribution={attribution}
          />
        </div>
      ) : null}
    </div>
  )
}

function initialOptionsFor(
  design: SewingDesignSummary,
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

