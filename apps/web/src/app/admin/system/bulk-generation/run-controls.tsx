'use client'

import { useState, useTransition } from 'react'
import { triggerBulkBatch, setBulkAutopilot, setBulkSourceMode, setBulkGateMode, setPhotoGateMode, type BulkCraft } from './actions'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora)',
  fontSize: 13,
  width: 56,
  padding: '6px 8px',
  border: '0.5px solid var(--color-warm-taupe)',
  borderRadius: 3,
  background: 'var(--color-cream)',
  color: 'var(--color-espresso)',
}

/**
 * One "Run a batch" control for a craft — a count + a branded button that fires
 * a server-side batch (via the triggerBulkBatch server action → Inngest). Used
 * on each craft card of the bulk-generation page.
 */
export function RunBatchControl({
  craft,
  defaultCount,
  disabled,
  disabledReason,
}: {
  craft: BulkCraft
  defaultCount: number
  disabled?: boolean
  disabledReason?: string
}) {
  const [count, setCount] = useState(defaultCount)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
        Batch size
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={inputStyle}
          disabled={pending || disabled}
        />
      </label>
      <button
        type="button"
        className="admin-btn"
        disabled={pending || disabled}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const result = await triggerBulkBatch(craft, count)
            setMessage(result.ok ? `Batch of ${result.queued} queued — watch the Inngest dashboard for progress.` : result.error)
          })
        }}
      >
        {pending ? 'Queuing…' : 'Run a batch'}
      </button>
      {(message || (disabled && disabledReason)) && (
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
          {message ?? disabledReason}
        </span>
      )}
    </div>
  )
}

/**
 * On/off switch for a craft's unattended autopilot cron. DB-backed via the
 * setBulkAutopilot server action — takes effect immediately, no redeploy.
 */
export function AutopilotToggle({
  craft,
  enabled,
  disabled,
  disabledReason,
}: {
  craft: BulkCraft
  enabled: boolean
  disabled?: boolean
  disabledReason?: string
}) {
  const [on, setOn] = useState(enabled)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: on ? 'var(--color-sage)' : 'var(--color-warm-taupe)' }}>
        Autopilot {on ? 'on' : 'paused'}
      </span>
      <button
        type="button"
        className={on ? 'admin-btn secondary' : 'admin-btn'}
        disabled={pending || disabled}
        onClick={() => {
          setError(null)
          const next = !on
          startTransition(async () => {
            const result = await setBulkAutopilot(craft, next)
            if (result.ok) setOn(result.enabled)
            else setError(result.error)
          })
        }}
      >
        {pending ? 'Saving…' : on ? 'Turn off' : 'Turn on'}
      </button>
      {(error || (disabled && disabledReason)) && (
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
          {error ?? disabledReason}
        </span>
      )}
    </div>
  )
}

/**
 * The source-model switch for cross-stitch: schnell everywhere (today's
 * behaviour) or Flux 1.1 Pro in every size lane. The dense showpiece lane is
 * always Pro either way — this is about the small and mid lanes, which is where
 * the yield is lost.
 *
 * Pro is roughly ten times the price per image and keeps roughly five times as
 * many attempts, so the cost per GEM is similar and the catalogue actually
 * grows. DB-backed: it applies to the next idea, no deploy.
 */
export function SourceModeToggle({ mode, locked }: { mode: string; locked?: string }) {
  const [current, setCurrent] = useState(mode)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const proAll = current === 'pro-all'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: proAll ? 'var(--color-sage)' : 'var(--color-warm-taupe)' }}>
        Draw with Flux Pro for every size — {proAll ? 'on' : 'off'}
      </span>
      <button
        type="button"
        className={proAll ? 'admin-btn secondary' : 'admin-btn'}
        disabled={pending || Boolean(locked)}
        onClick={() => {
          setError(null)
          const next = proAll ? 'schnell' : 'pro-all'
          startTransition(async () => {
            const result = await setBulkSourceMode(next)
            if (result.ok) setCurrent(result.mode)
            else setError(result.error)
          })
        }}
      >
        {pending ? 'Saving…' : proAll ? 'Back to schnell' : 'Use Flux Pro'}
      </button>
      {(error || locked) && (
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
          {error ?? locked}
        </span>
      )}
    </div>
  )
}

/**
 * WHO JUDGES the cross-stitch candidates. Sits beside the autopilot switch
 * because the two decide together what a firing costs.
 *
 * In "Judged in Claude sessions (no API)" the cron path spends nothing but Fal:
 * the planner samples the curated pool, the vision gate is never called, and
 * every idea is parked UNLISTED for a scheduled Claude session to keep, reject
 * or re-roll. "Judged by the API gate" is the earlier behaviour, a per-candidate
 * Anthropic call that publishes the gems itself. DB-backed: it applies to the
 * next firing, no deploy.
 */
export function GateModeToggle({ mode, locked }: { mode: string; locked?: string }) {
  const [current, setCurrent] = useState(mode)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const sessions = current !== 'api'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: sessions ? 'var(--color-sage)' : 'var(--color-warm-taupe)' }}>
        {sessions ? 'Judged in Claude sessions (no API)' : 'Judged by the API gate'}
      </span>
      <button
        type="button"
        className={sessions ? 'admin-btn secondary' : 'admin-btn'}
        disabled={pending || Boolean(locked)}
        onClick={() => {
          setError(null)
          const next = sessions ? 'api' : 'candidates'
          startTransition(async () => {
            const result = await setBulkGateMode(next)
            if (result.ok) setCurrent(result.mode)
            else setError(result.error)
          })
        }}
      >
        {pending ? 'Saving…' : sessions ? 'Use the API gate' : 'Judge in sessions'}
      </button>
      {(error || locked) && (
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
          {error ?? locked}
        </span>
      )}
    </div>
  )
}

/**
 * WHO JUDGES a member's finished-project photo. 'api' decides on upload, so the
 * member sees an answer straight away; 'routine' leaves it pending behind
 * "Checking your photo" for the scheduled session to judge.
 */
export function PhotoGateModeToggle({ mode, locked }: { mode: string; locked?: string }) {
  const [current, setCurrent] = useState(mode)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const onUpload = current !== 'routine'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: onUpload ? 'var(--color-sage)' : 'var(--color-warm-taupe)' }}>
        Maker photos — {onUpload ? 'checked on upload (API)' : 'checked by the routine'}
      </span>
      <button
        type="button"
        className={onUpload ? 'admin-btn secondary' : 'admin-btn'}
        disabled={pending || Boolean(locked)}
        onClick={() => {
          setError(null)
          const next = onUpload ? 'routine' : 'api'
          startTransition(async () => {
            const result = await setPhotoGateMode(next)
            if (result.ok) setCurrent(result.mode)
            else setError(result.error)
          })
        }}
      >
        {pending ? 'Saving…' : onUpload ? 'Leave them for the routine' : 'Check on upload'}
      </button>
      {(error || locked) && (
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
          {error ?? locked}
        </span>
      )}
    </div>
  )
}
