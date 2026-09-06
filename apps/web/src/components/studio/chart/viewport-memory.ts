'use client'

/**
 * Per-project chart view memory.
 *
 * Where a Maker had the chart panned and zoomed to is a property of the
 * screen they were looking at, not of the project: the same pattern wants a
 * very different view on a phone and on a desktop. So it lives in
 * localStorage on the device rather than travelling with progress, and a
 * device that has never opened the pattern gets the sensible first view
 * instead of somebody else's.
 *
 * Every read and write is wrapped: private windows and blocked site data
 * both throw on access, and a chart that will not remember its last view is
 * a far smaller problem than a chart that will not open.
 */

import type { Viewport } from './render-helpers'

const KEY_PREFIX = 'homemade-studio-view:'

export function readStoredViewport(patternId: string): Viewport | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + patternId)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const { panX, panY, scale } = parsed as Record<string, unknown>
    if (
      typeof panX !== 'number' ||
      typeof panY !== 'number' ||
      typeof scale !== 'number' ||
      !Number.isFinite(panX) ||
      !Number.isFinite(panY) ||
      !Number.isFinite(scale) ||
      scale <= 0
    ) {
      return null
    }
    return { panX, panY, scale }
  } catch {
    return null
  }
}

export function writeStoredViewport(patternId: string, viewport: Viewport): void {
  try {
    window.localStorage.setItem(
      KEY_PREFIX + patternId,
      JSON.stringify({
        panX: Math.round(viewport.panX * 100) / 100,
        panY: Math.round(viewport.panY * 100) / 100,
        scale: Math.round(viewport.scale * 10000) / 10000,
      }),
    )
  } catch {
    // No storage available. The view simply starts fresh next time.
  }
}
