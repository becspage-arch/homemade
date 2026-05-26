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

/**
 * Per-sub-category scene anchors for mindset content. The 2026-05-25
 * audit found the previous generic mindset prompt collapsed every title
 * to the same "candle + notebook + linen" template, scoring as
 * WRONG/PARTIAL because the photograph didn't depict the named practice.
 * Each scene below ties Flux to a recognisable visual identity for that
 * practice type so viewers can tell at a glance what category a hero
 * belongs to.
 */
function buildMindsetPrompt(input: SourceHeroInput): string {
  const sub = (input.subCategory ?? '').toLowerCase()
  const base =
    'Magazine-quality editorial photography. ' +
    'Warm natural light. Cream and sage palette. ' +
    'Linen and wool textures. No faces visible.'
  const title = input.title

  switch (sub) {
    case 'tapping':
      // EFT tapping — fingertips on collarbone or karate-chop point.
      // Must show the technique, not just a meditative scene.
      return (
        `${base} ` +
        'Close-up of a hand with fingertips lightly touching the collarbone (an EFT acupressure tapping point), viewed from chest down. ' +
        'Soft shoulder, neutral linen top, side window light. ' +
        `Practice: ${title}.`
      )

    case 'meditation':
      return (
        `${base} ` +
        'A figure seated cross-legged on a wool cushion, palms resting on knees, side view, eyes closed. ' +
        'Quiet room, side window light. ' +
        `Practice: ${title}.`
      )

    case 'embodiment':
      return (
        `${base} ` +
        'Hands resting open on the lap, viewed from above. One hand placed gently over the heart. ' +
        'Soft window light on neutral linen. ' +
        `Practice: ${title}.`
      )

    case 'ritual':
      return (
        `${base} ` +
        'A small home altar on a wooden surface: a single lit candle, a sprig of dried herbs, a small ceramic bowl, a folded card on warm parchment. ' +
        'Soft side light, contemplative. ' +
        `Ritual: ${title}.`
      )

    case 'spell':
      return (
        `${base} ` +
        'A folk-craft still life: scattered dried herbs, a small bowl of sea salt, a folded paper intention on a wooden surface, a single lit candle. ' +
        `Spell: ${title}.`
      )

    case 'affirmation':
    case 'energy-statement':
      return (
        `${base} ` +
        'A handwritten card resting on a warm wooden surface, side window light at golden hour, a ceramic mug and a small sprig of greenery nearby. ' +
        'Slow-living tableau, no books or candles. ' +
        `Theme of the card: ${title}.`
      )

    case 'journal-prompt':
      return (
        `${base} ` +
        'An open journal mid-write on a wooden desk, fountain pen resting across the page, real handwriting visible on cream paper, mug of tea in the background. ' +
        'Side window light. ' +
        `Journal prompt: ${title}.`
      )

    case 'visualisation':
      return (
        `${base} ` +
        'A figure seen from behind walking through a softly-lit interior doorway into a calm room, no face visible. ' +
        'Linen curtain, wooden floor, slow-living atmosphere. ' +
        `Scene visualised: ${title}.`
      )

    case 'activity':
      return (
        `${base} ` +
        'A purposeful desk scene: notebook open, pen poised, a small focal object related to the practice (a phone, an envelope, a coin, a printed page). ' +
        'Side window light. ' +
        `Activity: ${title}.`
      )

    case 'reading':
      return (
        `${base} ` +
        'A stack of well-thumbed reference books on a wooden table with a single bookmark in the top volume, warm reading-lamp light, a notepad and pencil to the side. ' +
        'Editorial study scene. ' +
        `Subject of the reading: ${title}.`
      )

    default:
      // Fallback for any mindset sub-category not enumerated above.
      // Deliberately distinct from the old default template so the
      // image still varies per title.
      return (
        `${base} ` +
        'A quiet practice space — a single meaningful object in soft window light: a stone, a cup, a folded letter, or a sprig of dried herbs. ' +
        `Subject: ${title}.`
      )
  }
}

function buildPrompt(input: SourceHeroInput): string {
  if (input.category === 'mindset') return buildMindsetPrompt(input)

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

/**
 * Thrown when fal.ai returns 403 with "Exhausted balance" or "User is
 * locked". Distinct from generic null-return failures so callers can
 * halt the whole run rather than spend hours retrying every entry.
 *
 * Detected once on 2026-05-25 mid-rescue: the rescue had used the last
 * of the balance, then every subsequent call returned 403. Callers
 * (rescue / apply / fixup-hero-fill) catch this and write a clear
 * docs/_flux-billing-halt.md so Rebecca knows to top up.
 */
export class FluxBillingError extends Error {
  readonly status: number
  readonly body: string
  constructor(body: string) {
    super(`fal.ai billing error: ${body.slice(0, 200)}`)
    this.name = 'FluxBillingError'
    this.status = 403
    this.body = body
  }
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

async function fluxAttempt(
  key: string,
  prompt: string,
): Promise<{ ok: true; img: FalImage } | { ok: false; status: number; reason: string }> {
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
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      // 403 + balance-style body → throw so the caller halts the whole run
      // rather than burn through every remaining entry with the same error.
      if (res.status === 403 && looksLikeBillingError(body)) {
        throw new FluxBillingError(body)
      }
      return { ok: false, status: res.status, reason: `http ${res.status}: ${body.slice(0, 120)}` }
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

export async function generateWithFluxSchnell(input: SourceHeroInput): Promise<ImageSearchResult | null> {
  const key = process.env.FAL_KEY
  if (!key) return null

  const prompt = buildPrompt(input)

  // Retry with exponential backoff on transient failures. Bulk runs hit
  // fal.ai rate limits in bursts; a single retry recovers ~all of them.
  // 4xx (auth, validation, content safety) is permanent — no retry.
  const backoffs = [0, 2_000, 5_000, 12_000]
  let lastReason = ''
  for (let i = 0; i < backoffs.length; i++) {
    if (backoffs[i]! > 0) await sleep(backoffs[i]!)
    const r = await fluxAttempt(key, prompt)
    if (r.ok) {
      const img = r.img
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
    }
    lastReason = r.reason
    // 4xx is permanent (auth, validation, safety filter). Don't retry.
    if (r.status >= 400 && r.status < 500) break
  }
  if (process.env.FAL_DEBUG === '1') {
    console.warn(`[flux-schnell] failed after retries: ${lastReason}`)
  }
  return null
}
