/**
 * FLUX.1-dev image-to-image (via fal.ai) — preserves structure of an
 * input image while changing surface texture. Used by Pipeline B of the
 * crochet image worker to convert a synthetic chart render into a
 * photoreal hero photo. The input image is the truth (geometrically
 * correct); a low strength (0.3-0.5) keeps the structure intact while
 * letting the model add yarn texture, lighting, fabric drape.
 *
 * Cost: ~£0.02 per image at flux/dev. The synthetic-source-as-control
 * approach is what keeps the output usable: pure text-to-image at the
 * same cost gives plausible-looking yarn that doesn't match the chart.
 *
 * Shares the FluxBillingError machinery from flux-schnell so the same
 * halt + notify pipeline catches Fal balance issues across both
 * endpoints.
 *
 * Env: FAL_KEY (required). When unset the function returns null.
 */

import type { ImageSearchResult } from './types'
import { computeRequiresAttribution } from './types'
import { FluxBillingError } from './flux-schnell'

const API = 'https://fal.run/fal-ai/flux/dev/image-to-image'

interface FalImage {
  url: string
  width: number
  height: number
  content_type?: string
}

interface FalResponse {
  images?: FalImage[]
  seed?: number
}

export interface FluxImg2ImgInput {
  /** Publicly fetchable URL of the control image (the synthetic chart
   *  render uploaded to R2). Fal pulls it; we don't post bytes. */
  imageUrl: string
  /** Text guidance — what the photoreal output should look like. */
  prompt: string
  /** Optional negative prompt. */
  negativePrompt?: string
  /** Denoising strength (0-1). Lower = more structure preserved from
   *  the input image; higher = more model creativity. The crochet
   *  pipeline uses 0.4 by default; the verification-gate retry path
   *  drops to 0.3. */
  strength?: number
  /** Number of inference steps. Flux dev default is 28; lower trades
   *  quality for cost. */
  numInferenceSteps?: number
  /** Guidance scale. Flux dev default is 3.5. */
  guidanceScale?: number
  /** Output image size. Defaults to "square_hd" (1024x1024) which is
   *  the right shape for motif heroes. Garment heroes can pass
   *  "portrait_4_3". */
  imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'
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

async function falAttempt(
  key: string,
  input: FluxImg2ImgInput,
): Promise<{ ok: true; img: FalImage } | { ok: false; status: number; reason: string }> {
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
        image_url: input.imageUrl,
        prompt: input.prompt,
        ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
        strength: input.strength ?? 0.4,
        num_inference_steps: input.numInferenceSteps ?? 28,
        guidance_scale: input.guidanceScale ?? 3.5,
        image_size: input.imageSize ?? 'square_hd',
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      if (res.status === 403 && looksLikeBillingError(body)) {
        throw new FluxBillingError(body)
      }
      return { ok: false, status: res.status, reason: `http ${res.status}: ${body.slice(0, 200)}` }
    }
    const data = (await res.json()) as FalResponse
    const img = data.images?.[0]
    if (!img?.url) return { ok: false, status: 200, reason: 'no image in response' }
    return { ok: true, img }
  } catch (err) {
    if (err instanceof FluxBillingError) throw err
    const reason = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 0, reason }
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Returns null if FAL_KEY is unset (lets the caller fall back without
 * crashing). Throws FluxBillingError when Fal returns 403 with a
 * balance-style body so the bulk caller halts the whole run rather
 * than churn through every remaining pattern.
 */
export async function generateWithFluxImg2Img(
  input: FluxImg2ImgInput,
): Promise<ImageSearchResult | null> {
  const key = process.env.FAL_KEY
  if (!key) return null

  const backoffs = [0, 2_000, 5_000, 12_000]
  let lastReason = ''
  for (let i = 0; i < backoffs.length; i++) {
    if (backoffs[i]! > 0) await sleep(backoffs[i]!)
    const r = await falAttempt(key, input)
    if (r.ok) {
      const img = r.img
      return {
        url: img.url,
        pageUrl: img.url,
        source: 'flux-dev-img2img',
        creatorName: null,
        licenceCode: 'PROPRIETARY',
        licenceUrl: null,
        requiresAttribution: computeRequiresAttribution('PROPRIETARY'),
        width: img.width ?? 1024,
        height: img.height ?? 1024,
        upstreamId: null,
      }
    }
    lastReason = r.reason
    if (r.status >= 400 && r.status < 500) break
  }
  if (process.env.FAL_DEBUG === '1') {
    console.warn(`[flux-img2img] failed after retries: ${lastReason}`)
  }
  return null
}

export { FluxBillingError }
