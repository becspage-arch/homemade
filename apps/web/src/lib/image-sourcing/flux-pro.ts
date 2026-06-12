/**
 * Flux 1.1 Pro (via fal.ai) — high-fidelity product photography generator.
 * Used by sewing S-8b for bag / home / accessory hero product shots where
 * Schnell's 4-step inference is too aggregate for clean studio output.
 *
 * Cost reference: ~£0.032 / call at the default 1024-px output. The
 * S-8b worker caps retries per pattern at 5 and tracks total spend
 * against a £5 catalogue ceiling.
 *
 * Re-uses the FluxBillingError class from `./flux-schnell` so callers can
 * halt cleanly when the fal.ai balance is exhausted.
 *
 * Env: FAL_KEY (required). When unset the function throws so the worker
 * fails fast at run start rather than silently no-op-ing.
 */

import { FluxBillingError } from './flux-schnell'

const API = 'https://fal.run/fal-ai/flux-pro/v1.1'

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

export interface FluxProResult {
  url: string
  width: number
  height: number
  seed: number | null
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

export interface FluxProOptions {
  /** Width / height in pixels. Defaults to 1024 x 1280 (4:5 portrait). */
  width?: number
  height?: number
}

/**
 * Generate a single image with Flux 1.1 Pro. Throws FluxBillingError on
 * fal.ai 403 + billing-shaped body so the catalogue worker can halt and
 * report rather than burn through every remaining slug. Throws a normal
 * Error on other non-2xx responses; the caller decides whether to retry.
 */
export async function generateWithFluxPro(
  prompt: string,
  opts: FluxProOptions = {},
): Promise<FluxProResult> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY not set — Flux Pro cannot run')
  const width = opts.width ?? 1024
  const height = opts.height ?? 1280

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
        prompt,
        image_size: { width, height },
        num_images: 1,
        safety_tolerance: '2',
        output_format: 'png',
        enable_safety_checker: true,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      if (res.status === 403 && looksLikeBillingError(body)) {
        throw new FluxBillingError(body)
      }
      throw new Error(`Flux Pro HTTP ${res.status}: ${body.slice(0, 240)}`)
    }
    const data = (await res.json()) as FalResponse
    const img = data.images?.[0]
    if (!img?.url) throw new Error('Flux Pro returned no image')
    return { url: img.url, width: img.width, height: img.height, seed: data.seed ?? null }
  } finally {
    clearTimeout(timer)
  }
}

export { FluxBillingError }
