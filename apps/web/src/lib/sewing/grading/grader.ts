// SPDX-License-Identifier: MIT
// Central freesewing wrapper. Every caller in the Studio, API routes, and
// content authoring scripts goes through `draftPattern`. Nothing else
// imports @freesewing/* directly. Engine swap is a one-file change here.

import { createHash } from 'node:crypto'

import type { MeasurementsPayload } from '../measurements'
import {
  getDesignConfig,
  loadDesignConstructor,
} from './design-registry'
import { homemadeToFreesewing } from './measurement-translation'
import { getDrafterFooterCredit } from './attribution'
import type {
  CalibrationMode,
  DrafterOptions,
  DrafterOutput,
  DrafterPartMeta,
} from './types'

// Version of @freesewing/core pinned in apps/web/package.json. Goes
// into the cache key so a freesewing upgrade invalidates every prior
// render. Update this constant whenever the pinned package version is
// bumped (see apps/web/package.json — pinned exact, no caret).
const FREESEWING_VERSION = '4.9.0'

interface FreesewingPatternInstance {
  use: (plugin: unknown) => FreesewingPatternInstance
  draft: () => FreesewingPatternInstance
  render: () => string
  parts?: Record<string, unknown>[]
  store?: { logs?: { error?: unknown[]; warning?: unknown[] } }
}

type FreesewingDesignCtor = new (
  ...sets: Array<Record<string, unknown>>
) => FreesewingPatternInstance

export interface DraftPatternParams {
  designSlug: string
  measurements: MeasurementsPayload
  options?: DrafterOptions
  calibrationMode?: CalibrationMode
}

/**
 * Render a freesewing design with the given measurements + options.
 *
 * Steps:
 *  1. Translate Homemade keys to freesewing keys.
 *  2. Lazy-load the design constructor.
 *  3. Construct the Pattern with settings keyed for the calibration mode
 *     (paperless=true for PROJECTOR, default page layout otherwise).
 *  4. Attach the standard plugin bundle.
 *  5. Draft + render, returning the SVG plus metadata.
 *  6. Compute the cache key from the canonical inputs.
 *
 * Throws on unknown slug. Returns null for `partList` entries the design
 * does not emit; the verifier handles that gracefully.
 */
export async function draftPattern(
  params: DraftPatternParams,
): Promise<DrafterOutput> {
  const config = getDesignConfig(params.designSlug)
  if (!config) throw new Error(`Unknown freesewing design slug: ${params.designSlug}`)

  const mode: CalibrationMode = params.calibrationMode ?? 'BROWSE'

  const translation = homemadeToFreesewing(params.measurements, {
    genderFamily: config.genderFamily,
    requiredMeasurements: config.requiredMeasurements,
    optionalMeasurements: config.optionalMeasurements,
  })

  const Ctor = (await loadDesignConstructor(params.designSlug)) as FreesewingDesignCtor

  const settings: Record<string, unknown> = {
    measurements: translation.measurements,
    units: 'metric',
    margin: 2,
    complete: true,
    expand: true,
    options: params.options?.designOptions ?? {},
  }

  if (typeof params.options?.seamAllowanceCm === 'number') {
    settings.sa = params.options.seamAllowanceCm * 10
  }
  if (typeof params.options?.locale === 'string') {
    settings.locale = params.options.locale
  }

  if (mode === 'PROJECTOR') {
    settings.paperless = true
  }

  const pattern = new Ctor(settings)
  // @freesewing/core 4.x auto-applies @freesewing/core-plugins; the
  // legacy @freesewing/plugin-bundle (2.x) is held in package.json
  // for future macro plugins but is not engaged here.

  let svg = ''
  try {
    pattern.draft()
    svg = pattern.render()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`freesewing draft failed for ${params.designSlug}: ${message}`)
  }

  const cacheKey = computeCacheKey({
    designSlug: params.designSlug,
    measurements: translation.measurements,
    options: params.options?.designOptions ?? {},
    calibrationMode: mode,
    freesewingVersion: FREESEWING_VERSION,
  })

  const partList = collectPartList(pattern)
  const attribution = getDrafterFooterCredit(params.designSlug, mode)

  return {
    svg,
    partList,
    cacheKey,
    attribution,
    freesewingVersion: FREESEWING_VERSION,
    calibrationMode: mode,
  }
}

interface CacheKeyInputs {
  designSlug: string
  measurements: Record<string, number>
  options: Record<string, number | string | boolean>
  calibrationMode: CalibrationMode
  freesewingVersion: string
}

/**
 * Deterministic SHA-256 over a canonical JSON encoding of the inputs.
 *
 * Sort keys before serialising so { chest: 925, waist: 720 } and
 * { waist: 720, chest: 925 } produce the same hash. Numbers go through
 * Number.toFixed(4) so floating-point drift on the same logical input
 * doesn't break cache hits.
 */
export function computeCacheKey(inputs: CacheKeyInputs): string {
  const canonical = {
    d: inputs.designSlug,
    m: sortedObject(inputs.measurements, (v) => Number(v).toFixed(4)),
    o: sortedObject(inputs.options, (v) =>
      typeof v === 'number' ? Number(v).toFixed(4) : String(v),
    ),
    c: inputs.calibrationMode,
    v: inputs.freesewingVersion,
  }
  const json = JSON.stringify(canonical)
  return createHash('sha256').update(json).digest('hex')
}

function sortedObject<T>(
  obj: Record<string, T>,
  encode: (v: T) => string,
): Record<string, string> {
  const sortedKeys = Object.keys(obj).sort()
  const out: Record<string, string> = {}
  for (const k of sortedKeys) {
    out[k] = encode(obj[k]!)
  }
  return out
}

function collectPartList(pattern: FreesewingPatternInstance): DrafterPartMeta[] {
  const out: DrafterPartMeta[] = []
  // freesewing 4.x stores drafted parts per settings-set under
  // pattern.parts. Each entry is a record of part name → Part instance
  // with a `topLeft` and `bottomRight` Point once drafted.
  const parts = pattern.parts
  if (!Array.isArray(parts)) return out
  for (const set of parts) {
    if (!set || typeof set !== 'object') continue
    for (const [name, part] of Object.entries(set)) {
      const p = part as {
        topLeft?: { x?: number; y?: number }
        bottomRight?: { x?: number; y?: number }
      } | null
      if (!p?.topLeft || !p.bottomRight) continue
      const w = Number(p.bottomRight.x) - Number(p.topLeft.x)
      const h = Number(p.bottomRight.y) - Number(p.topLeft.y)
      if (!Number.isFinite(w) || !Number.isFinite(h)) continue
      out.push({ name, widthMm: w, heightMm: h })
    }
  }
  return out
}

export { FREESEWING_VERSION }
