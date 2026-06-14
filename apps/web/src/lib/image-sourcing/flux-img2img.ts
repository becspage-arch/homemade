/**
 * Flux dev image-to-image (via fal.ai) — the "anchored hero" generator.
 *
 * Feeds an ACCURATE in-house render (the finished-piece chart render laid
 * into a shape-aware object base) in as the structural anchor, and repaints
 * it photorealistic. Because the render constrains composition, colour and
 * motif, the photo stays on-pattern instead of inventing a scene from
 * scratch (the failure mode of pure text-to-image hero generation).
 *
 * Default strength 0.72 — Rebecca's calibration pick: photographic while
 * staying visibly faithful to the rendered structure. Higher strengths
 * (0.85+) look softer/"premium" but drift the stitch motif and start to
 * guess. Lower (<0.6) barely changes the illustrated look.
 *
 * The output is ALWAYS gated downstream: the orchestrating worker session
 * judges the photo against the render (right object? motif preserved? no
 * artefacts?) before it is committed. On a fail or a Fal billing halt the
 * caller falls back to the faithful render as the hero — never a guess.
 *
 * Env: FAL_KEY (required). Reuses FluxBillingError so callers can halt a
 * bulk run cleanly when the balance is exhausted.
 */

import { FluxBillingError } from './flux-schnell'

const API = 'https://fal.run/fal-ai/flux/dev/image-to-image'

interface FalImage {
  url: string
  width: number
  height: number
}

interface FalResponse {
  images?: FalImage[]
}

export interface Img2ImgResult {
  url: string
  width: number
  height: number
}

export interface Img2ImgOptions {
  /** 0..1. How far to repaint from the anchor. Default 0.72. */
  strength?: number
  /** Inference steps. Default 40. */
  steps?: number
  /** Guidance scale. Default 3.5. */
  guidance?: number
}

function looksLikeBillingError(body: string): boolean {
  const lower = body.toLowerCase()
  return (
    lower.includes('exhausted balance') ||
    lower.includes('user is locked') ||
    lower.includes('top up your balance') ||
    lower.includes('insufficient balance') ||
    lower.includes('balance too low')
  )
}

/**
 * Repaint an anchor image photorealistic with Flux dev img2img.
 *
 * @param imageUrl  A public URL or a `data:image/png;base64,...` data URI of
 *                  the anchor render.
 * @param prompt    The photographic description (craft, item, palette, scene).
 * @throws FluxBillingError on a 403 + balance-shaped body so bulk callers halt.
 * @throws Error on other non-2xx; the caller decides whether to retry or fall
 *         back to the render.
 */
export async function generateWithFluxImg2Img(
  imageUrl: string,
  prompt: string,
  opts: Img2ImgOptions = {},
): Promise<Img2ImgResult> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY not set — Flux img2img cannot run')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 120_000)
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt,
        strength: opts.strength ?? 0.72,
        num_inference_steps: opts.steps ?? 40,
        guidance_scale: opts.guidance ?? 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'png',
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      if (res.status === 403 && looksLikeBillingError(body)) {
        throw new FluxBillingError(body)
      }
      throw new Error(`Flux img2img HTTP ${res.status}: ${body.slice(0, 240)}`)
    }
    const data = (await res.json()) as FalResponse
    const img = data.images?.[0]
    if (!img?.url) throw new Error('Flux img2img returned no image')
    return { url: img.url, width: img.width, height: img.height }
  } finally {
    clearTimeout(timer)
  }
}

export { FluxBillingError }
