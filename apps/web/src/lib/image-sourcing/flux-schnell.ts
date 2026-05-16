/**
 * Flux Schnell (via fal.ai) — AI hero generation when free sources can't find
 * an editorial-grade match. Per `docs/free-image-research.md`, cost projects
 * to ~£52 at 25k tutorials.
 *
 * The image-generation budget is the documented exception to `feedback_no_api_spend.md`'s
 * text-API ban — we still don't make per-recipe text API calls, but a one-shot
 * pre-launch image fill is on-table.
 *
 * Env: FAL_KEY (optional). When unset the function returns null and the
 * orchestrator falls back to the procedural card.
 */

import type { ImageSearchResult, SourceHeroInput } from './types'
import { computeRequiresAttribution } from './types'

const API = 'https://fal.run/fal-ai/flux/schnell'

interface FalImage {
  url: string
  width: number
  height: number
  content_type?: string
}

interface FalResponse {
  images?: FalImage[]
}

function buildPrompt(input: SourceHeroInput): string {
  const isMindset = input.category === 'mindset'
  if (isMindset) {
    return (
      'Quiet contemplative still life. ' +
      `${input.title} concept. Cream and sage palette. ` +
      'Single candle, open notebook, or hands in soft light as appropriate. ' +
      'No faces. Magazine-quality editorial photography. ' +
      'Natural soft light, linen textures, slow-living atmosphere.'
    )
  }
  const ingredientHint =
    input.ingredients && input.ingredients.length
      ? ` Key ingredients: ${input.ingredients.slice(0, 3).join(', ')}.`
      : ''
  return (
    'Editorial slow-living food photography. ' +
    `${input.title}.${ingredientHint} ` +
    'Warm natural light. Cream and sage palette. ' +
    'Linen and parchment textures. Composed on a wooden surface. ' +
    'No people. Shot from above or three-quarter angle as appropriate. ' +
    'Magazine-quality.'
  )
}

export async function generateWithFluxSchnell(input: SourceHeroInput): Promise<ImageSearchResult | null> {
  const key = process.env.FAL_KEY
  if (!key) return null

  const prompt = buildPrompt(input)

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as FalResponse
    const img = data.images?.[0]
    if (!img?.url) return null
    return {
      url: img.url,
      pageUrl: img.url,
      source: 'flux-schnell',
      creatorName: null,
      licenceCode: 'PROPRIETARY',
      licenceUrl: null,
      requiresAttribution: computeRequiresAttribution('PROPRIETARY'),
      width: img.width ?? 1280,
      height: img.height ?? 720,
      upstreamId: null,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
