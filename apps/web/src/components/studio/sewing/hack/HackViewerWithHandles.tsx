'use client'

/**
 * Pattern viewer wrapped with overlaid drag handles. Each handle binds
 * to a freesewing option from the registry's `hackHandles` list and is
 * positioned at a structural region of the pattern:
 *
 *   bodyHem    → bottom edge
 *   sleeveCuff → outer-right edge
 *   neckline   → top edge (with neckline picker overlay)
 *   pocket     → centre
 *   waistline  → middle
 *   hem        → lower-third
 *
 * The exact coordinates depend on which freesewing parts the design
 * draws. For the visual handles we anchor them to the wrapping container,
 * not to specific SVG paths — the user sees a graphical chip at the right
 * region and drags it to change the option value. The pattern viewer
 * itself stays the source of truth for what's rendered.
 *
 * Neckline + pocket handles open click overlays instead of drag tracks:
 * neckline opens a variant picker, pocket toggles on/off.
 */

import { useCallback, useRef, useState } from 'react'

import type { SewingHackHandle } from '@/lib/sewing/grading/types'
import { FreesewingPatternViewer } from '@/components/studio/sewing/FreesewingPatternViewer'
import type { HackComposerDesign } from './types'

interface Props {
  design: HackComposerDesign
  svg: string
  attribution: string | null
  options: Record<string, number | string | boolean>
  loading: boolean
  onHandleChange: (
    handle: SewingHackHandle,
    value: number | string | boolean,
  ) => void
}

export function HackViewerWithHandles({
  design,
  svg,
  attribution,
  options,
  loading,
  onHandleChange,
}: Props) {
  return (
    <div className="sew-hack-viewer-wrap">
      <FreesewingPatternViewer
        svg={svg}
        patternName={design.name}
        attribution={attribution}
      />
      {loading ? (
        <div className="sew-hack-viewer-loading-overlay" aria-hidden>
          Updating…
        </div>
      ) : null}
      <div className="sew-hack-handles" aria-label="Drag handles">
        {design.hackHandles.map((handle) => (
          <HackHandleChip
            key={`${handle.optionKey}:${handle.attachTo}`}
            handle={handle}
            design={design}
            options={options}
            onChange={onHandleChange}
          />
        ))}
      </div>
    </div>
  )
}

interface ChipProps {
  handle: SewingHackHandle
  design: HackComposerDesign
  options: Record<string, number | string | boolean>
  onChange: (
    handle: SewingHackHandle,
    value: number | string | boolean,
  ) => void
}

const ATTACHMENT_POSITION: Record<
  SewingHackHandle['attachTo'],
  { top: string; left: string }
> = {
  bodyHem: { top: '88%', left: '50%' },
  sleeveCuff: { top: '50%', left: '92%' },
  neckline: { top: '8%', left: '50%' },
  pocket: { top: '55%', left: '38%' },
  waistline: { top: '40%', left: '50%' },
  hem: { top: '72%', left: '50%' },
}

function HackHandleChip({ handle, design, options, onChange }: ChipProps) {
  const meta = design.options[handle.optionKey]
  const currentValue = options[handle.optionKey]
  const isNeckline = handle.attachTo === 'neckline' && meta?.type === 'enum'
  const isPocketToggle = handle.attachTo === 'pocket' && meta?.type === 'bool'

  const [open, setOpen] = useState(false)

  const pos = ATTACHMENT_POSITION[handle.attachTo]

  if (isNeckline && meta && meta.type === 'enum') {
    return (
      <div
        className="sew-hack-handle-anchor"
        style={{ top: pos.top, left: pos.left }}
      >
        <button
          type="button"
          className="sew-hack-handle-chip"
          aria-label={`Change ${handle.label}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sew-hack-handle-icon" aria-hidden>
            ⌃
          </span>
          {handle.label}
        </button>
        {open ? (
          <div className="sew-hack-handle-picker" role="menu">
            {meta.values.map((v) => (
              <button
                key={v.value}
                type="button"
                className={`sew-hack-handle-picker-item ${
                  currentValue === v.value ? 'active' : ''
                }`}
                onClick={() => {
                  onChange(handle, v.value)
                  setOpen(false)
                }}
                role="menuitem"
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (isPocketToggle && meta && meta.type === 'bool') {
    const on = typeof currentValue === 'boolean' ? currentValue : meta.default
    return (
      <div
        className="sew-hack-handle-anchor"
        style={{ top: pos.top, left: pos.left }}
      >
        <button
          type="button"
          className={`sew-hack-handle-chip ${on ? 'on' : 'off'}`}
          aria-label={`Toggle ${handle.label}`}
          onClick={() => onChange(handle, !on)}
        >
          <span className="sew-hack-handle-icon" aria-hidden>
            {on ? '●' : '○'}
          </span>
          {handle.label}: {on ? 'on' : 'off'}
        </button>
      </div>
    )
  }

  // Default: a draggable chip with a small drag track. Drag changes the
  // underlying option value within the handle's range.
  return (
    <DragHandleChip
      handle={handle}
      pos={pos}
      currentValue={currentValue}
      onChange={(v) => onChange(handle, v)}
    />
  )
}

interface DragChipProps {
  handle: SewingHackHandle
  pos: { top: string; left: string }
  currentValue: number | string | boolean | undefined
  onChange: (value: number) => void
}

function DragHandleChip({
  handle,
  pos,
  currentValue,
  onChange,
}: DragChipProps) {
  const startRef = useRef<{
    pointerY: number
    pointerX: number
    startValue: number
  } | null>(null)

  const numericValue = useMemoFractionToPercent(currentValue, handle)

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      startRef.current = {
        pointerY: e.clientY,
        pointerX: e.clientX,
        startValue: numericValue,
      }
    },
    [numericValue],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!startRef.current) return
      const delta =
        handle.axis === 'vertical'
          ? e.clientY - startRef.current.pointerY
          : e.clientX - startRef.current.pointerX
      // 4 px = one step. Vertical-down increases length; horizontal-right
      // increases width.
      const stepDelta = Math.round(delta / 4) * handle.range.step
      const sign = handle.axis === 'vertical' ? 1 : 1
      const next = clamp(
        startRef.current.startValue + sign * stepDelta,
        handle.range.min,
        handle.range.max,
      )
      const wrapperValue =
        handle.range.unit === 'pct'
          ? Number((next / 100).toFixed(4))
          : Number(next.toFixed(2))
      onChange(wrapperValue)
    },
    [handle, onChange],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore release errors when capture was never set
      }
      startRef.current = null
    },
    [],
  )

  return (
    <div
      className="sew-hack-handle-anchor"
      style={{ top: pos.top, left: pos.left }}
    >
      <button
        type="button"
        className={`sew-hack-handle-chip drag axis-${handle.axis}`}
        aria-label={`Drag to change ${handle.label}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="sew-hack-handle-icon" aria-hidden>
          {handle.axis === 'vertical' ? '⇕' : '⇔'}
        </span>
        {handle.label}: {formatValue(numericValue, handle)}
      </button>
    </div>
  )
}

function useMemoFractionToPercent(
  value: number | string | boolean | undefined,
  handle: SewingHackHandle,
): number {
  if (typeof value !== 'number') {
    // Default at midpoint of range, since we don't have a sensible value.
    return (handle.range.min + handle.range.max) / 2
  }
  if (handle.range.unit === 'pct') {
    // Wrapper stores percentages as fractions (0.04 = 4%). The drag
    // surface works in percent.
    return Math.round(value * 1000) / 10
  }
  return value
}

function formatValue(value: number, handle: SewingHackHandle): string {
  if (handle.range.unit === 'pct') return `${value.toFixed(1)}%`
  if (handle.range.unit === 'mm') return `${value.toFixed(0)} mm`
  return `${value.toFixed(1)} cm`
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
