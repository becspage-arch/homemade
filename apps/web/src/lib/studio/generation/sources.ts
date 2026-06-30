import sharp from 'sharp'
import { generateWithFluxPro } from '@/lib/image-sourcing/flux-pro'

/**
 * Source acquisition for cross-stitch generation. Each helper returns the
 * raw image bytes plus a licence record so the QC licence gate can verify
 * provenance before publish. Naive keyword search is unreliable (returns
 * off-subject results) — callers MUST pass the result through the Claude
 * vision gate, which rejects wrong / muddy subjects.
 */

export interface SourcedImage {
  buffer: Buffer
  /** Human-readable credit line. */
  credit: string
  /** Licence code for the licence gate. */
  licence: 'CC0' | 'PD' | 'CC-BY' | 'HOMEMADE-AI' | 'HOMEMADE-ORIGINAL'
  /** Source title (for vision-gate logging + dedupe). */
  title: string
}

const DOC_NOISE = /djvu|\.pdf|\.tif|volume|biography|\btext\b|letter|\bpage\b|mural/i

/** The Met Open Access — ~406k CC0 works, public API, no key. Prefers
 *  prints / paintings for clean subjects. */
export async function metImage(query: string, opts: { classification?: RegExp } = {}): Promise<SourcedImage> {
  const cls = opts.classification ?? /Print|Painting|Drawing|Woodblock|Poster/i
  const search = await (await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(query)}`,
  )).json()
  for (const id of (search.objectIDs ?? []).slice(0, 60) as number[]) {
    try {
      const o = await (await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)).json()
      const url = o.primaryImageSmall || o.primaryImage
      if (!url || !cls.test(o.classification ?? '')) continue
      const buffer = Buffer.from(await (await fetch(url)).arrayBuffer())
      await sharp(buffer).metadata()
      return {
        buffer,
        credit: `${o.title || 'Untitled'}${o.artistDisplayName ? ', ' + o.artistDisplayName : ''} — The Met (CC0)`,
        licence: 'CC0',
        title: o.title || 'Untitled',
      }
    } catch {
      // next candidate
    }
  }
  throw new Error(`metImage: no usable image for "${query}"`)
}

/** Wikimedia Commons search (PD plates, WPA posters, fine-art masters).
 *  `titleMust` biases to on-subject files; skips document scans. */
export async function commonsImage(query: string, opts: { titleMust?: RegExp } = {}): Promise<SourcedImage> {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|mime&iiurlwidth=1200&format=json&origin=*`
  const s = await (await fetch(api)).json()
  const pages = s?.query?.pages ? Object.values<Record<string, unknown>>(s.query.pages) : []
  for (const p of pages) {
    const ii = (p as { imageinfo?: { thumburl?: string; mime?: string }[] }).imageinfo?.[0]
    const title = String((p as { title?: string }).title ?? '')
    if (!ii?.thumburl || (ii.mime && !/jpeg|png/.test(ii.mime)) || DOC_NOISE.test(title)) continue
    if (opts.titleMust && !opts.titleMust.test(title)) continue
    try {
      const buffer = Buffer.from(await (await fetch(ii.thumburl)).arrayBuffer())
      await sharp(buffer).metadata()
      return { buffer, credit: `${title.replace(/^File:/, '')} — Wikimedia Commons (PD)`, licence: 'PD', title }
    } catch {
      // next
    }
  }
  throw new Error(`commonsImage: no usable image for "${query}"`)
}

/** Twemoji flat icon (CC-BY 4.0) flattened onto white — for simple cute
 *  motifs (drinks, objects) that convert cleanly. */
export async function twemoji(hex: string, label: string): Promise<SourcedImage> {
  const svg = Buffer.from(await (await fetch(`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${hex}.svg`)).arrayBuffer())
  const buffer = await sharp(svg, { density: 400 })
    .resize(700, 700, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer()
  return { buffer, credit: `${label} — Twemoji (CC-BY 4.0)`, licence: 'CC-BY', title: label }
}

/**
 * Tier E — fal.ai Flux Schnell text-to-image. Generates the original
 * illustration for the modern/character/seasonal half (anthropomorphic
 * characters in costumes with props, paint-by-numbers style). Output is
 * Homemade-owned. Prompts MUST be hyper-specific and end with the negative
 * "no text" guard; Flux still sneaks gibberish text in occasionally, which
 * the vision gate rejects. Returns null-safe via throw so the caller can
 * record a Tier-E failure rather than publish a blank.
 */
const TIER_E_STYLE = 'detailed whimsical digital illustration, rich saturated colours, bold clean colour regions, paint-by-numbers art style, polished and characterful'
const TIER_E_NEG = 'no text, no words, no letters, no watermark, no signature'

export async function fluxIllustration(
  subject: string,
  opts: { imageSize?: 'square_hd' | 'portrait_4_3' | 'landscape_4_3' } = {},
): Promise<SourcedImage> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('fluxIllustration: FAL_KEY not set')
  const prompt = `${subject}, ${TIER_E_STYLE}, ${TIER_E_NEG}`
  const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: opts.imageSize ?? 'portrait_4_3', num_inference_steps: 4, num_images: 1, enable_safety_checker: true }),
  })
  if (!res.ok) throw new Error(`fluxIllustration: fal ${res.status}: ${(await res.text().catch(() => '')).slice(0, 160)}`)
  const data = (await res.json()) as { images?: { url: string }[] }
  const url = data.images?.[0]?.url
  if (!url) throw new Error('fluxIllustration: no image returned')
  const buffer = Buffer.from(await (await fetch(url)).arrayBuffer())
  return { buffer, credit: 'Homemade-original (AI-assisted illustration)', licence: 'HOMEMADE-AI', title: subject.slice(0, 80) }
}

// Flux 1.1 Pro showpiece style — used for the DENSE 100+ colour tier only. Pro's
// cleaner inference (vs schnell's 4-step aggregate) carries far more genuinely
// distinct tonal gradations, which is what lets the full-DMC converter resolve
// 100+ real stands instead of plateauing ~88. NOT flat paint-by-numbers: the
// dense tier wants rich layered colour, and Pro + the full-range converter render
// that crisply (gated full-size). Negative still guards against gibberish text.
const PRO_SHOWPIECE_STYLE =
  'masterful highly detailed storybook illustration, intricate fine detail throughout, a rich and wide colour palette with subtle shading and depth, luminous characterful and full of little details'

/**
 * Flux 1.1 Pro illustration for the dense showpiece tier. `subject` is the full
 * brief prompt (already carries the showpiece style + composition). Pass pixel
 * dims preserving the chart aspect so detail isn't squashed. ~£0.032/call —
 * reserved for the few big showpieces under the hero carve-out.
 */
export async function fluxIllustrationPro(
  subject: string,
  opts: { width?: number; height?: number } = {},
): Promise<SourcedImage> {
  const prompt = `${subject}, ${PRO_SHOWPIECE_STYLE}, ${TIER_E_NEG}`
  const { url } = await generateWithFluxPro(prompt, { width: opts.width, height: opts.height })
  const buffer = Buffer.from(await (await fetch(url)).arrayBuffer())
  return { buffer, credit: 'Homemade-original (AI-assisted illustration, Flux 1.1 Pro)', licence: 'HOMEMADE-AI', title: subject.slice(0, 80) }
}
