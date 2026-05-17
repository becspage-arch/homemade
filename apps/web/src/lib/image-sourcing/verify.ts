/**
 * Image verification — match a sourced candidate against its tutorial.
 *
 * No paid AI API. The verdict comes from a worker session (Claude Code)
 * inspecting the image via its built-in multimodal Read tool. This module
 * provides the contract + helpers; the actual judgement is implemented by
 * the caller's `VerifyImageFn` callback.
 *
 * Two callback shapes are useful in practice:
 *
 *  - Authoring path: the authoring worker passes a callback that downloads
 *    bytes, opens them inline with the worker's image tool, evaluates the
 *    match, and returns a verdict synchronously.
 *
 *  - Sweep path: the retroactive sweep runs `verify-media-batch.ts` to
 *    write requests to a manifest, the worker fills in verdicts offline,
 *    then `apply-media-verdicts.ts` applies them. The orchestrator's
 *    `verify` hook is not used in that flow — the sweep operates on
 *    already-attached Media rows.
 */

import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import type { ImageSearchResult, ImageSource } from './types'

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REJECTED_USED_PROCEDURAL'

export type Verdict = 'verified' | 'rejected'

export interface VerifyImageInput {
  imageUrl: string
  /** The candidate's upstream source — useful for tracing rejections. The
   *  callback path inside the orchestrator passes a known ImageSource; the
   *  sweep path may pass a stored string that originated as one. Either way
   *  this is only used as a label in the prompt hints. */
  imageSource: ImageSource | string
  tutorialTitle: string
  /** Up to 5 ingredient names; null for non-recipe content. */
  keyIngredients: string[]
  /** Cuisine slug (e.g. italian, british). Null when not a recipe. */
  cuisine: string | null
  /** Meal type slug (e.g. dinner, dessert). Null when not applicable. */
  mealType: string | null
  /** Top-level category — cooking / baking / mindset etc. */
  category: string
}

export interface VerifyImageResult {
  verdict: Verdict
  reason: string
}

export type VerifyImageFn = (input: VerifyImageInput) => Promise<VerifyImageResult>

/**
 * Build a deterministic cache key for an image URL so the same candidate
 * downloads once across runs of the sweep.
 */
export function cacheKeyFor(url: string): string {
  return createHash('sha1').update(url).digest('hex').slice(0, 16)
}

/**
 * Download an image to a local cache path. Returns the absolute path.
 * Wikimedia requires a descriptive User-Agent on every request — other
 * hosts ignore it but always sending it costs nothing.
 */
export async function downloadToCache(
  url: string,
  cacheDir: string,
  cacheKey?: string,
): Promise<{ localPath: string; bytes: number; contentType: string | null }> {
  const key = cacheKey ?? cacheKeyFor(url)
  const ext = pickExtension(url)
  const localPath = join(cacheDir, `${key}.${ext}`)
  await mkdir(dirname(localPath), { recursive: true })
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
      Accept: 'image/*,*/*;q=0.8',
    },
  })
  if (!res.ok) {
    throw new Error(`download failed (${res.status}) for ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(localPath, buf)
  return {
    localPath,
    bytes: buf.length,
    contentType: res.headers.get('content-type'),
  }
}

function pickExtension(url: string): string {
  const m = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)(\?|$)/)
  if (!m) return 'jpg'
  const e = m[1]
  return e === 'jpeg' ? 'jpg' : e!
}

/**
 * Build the structured prompt hints a worker session uses to decide whether
 * a candidate image is a plausible match. Returned as a single string the
 * sweep script can drop into the manifest; the worker reads it alongside
 * the image to anchor its judgement.
 */
export function buildVerificationPromptHints(input: VerifyImageInput): string {
  const lines: string[] = []
  lines.push(`Tutorial: ${input.tutorialTitle}`)
  lines.push(`Category: ${input.category}`)
  if (input.cuisine) lines.push(`Cuisine: ${input.cuisine}`)
  if (input.mealType) lines.push(`Meal type: ${input.mealType}`)
  if (input.keyIngredients.length) {
    lines.push(`Key ingredients: ${input.keyIngredients.slice(0, 5).join(', ')}`)
  }
  lines.push(`Candidate source: ${input.imageSource}`)
  lines.push('')
  lines.push('Verify the candidate is a plausible match. Accept if:')
  lines.push('  - the image shows the correct dish category')
  lines.push('  - key ingredients are visible or consistent with the title')
  lines.push('  - the cuisine is consistent (no Thai curry for a British roast)')
  lines.push('  - the format is editorial / styled (not a vertical phone snap)')
  lines.push('Reject if:')
  lines.push('  - wrong dish, wrong cuisine, obviously off-brand or off-format')
  lines.push('  - mismatched primary ingredient (tomato salad for carbonara)')
  return lines.join('\n')
}

/**
 * The set of source priorities the orchestrator can re-enter when a
 * candidate is rejected. Mirrors the priority lists in orchestrator.ts.
 */
export function deriveVerificationStatus(
  image: ImageSearchResult | null,
  outcome: 'free' | 'ai-generated' | 'failed',
  verified: boolean,
): VerificationStatus {
  if (outcome === 'failed' || !image) return 'REJECTED_USED_PROCEDURAL'
  return verified ? 'VERIFIED' : 'UNVERIFIED'
}
