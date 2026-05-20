/**
 * Image-sourcing orchestrator.
 *
 * Given a tutorial title + category + a few ingredient hints, walks a per-category
 * priority list of free sources, picks the first acceptable result, and falls
 * through to Flux Schnell when nothing matches. Returns null when both free
 * search and AI generation fail — the caller (upload-tutorial / audit script)
 * then falls back to the procedural card.
 *
 * Priority lists are taken from `docs/free-image-research.md`. Cooking
 * Middle-Eastern / preserves / specialty paths skip Wikimedia (low hit rate);
 * Mindset somatic paths skip free sources entirely and go straight to AI.
 *
 * Verification: callers may pass a `verify` callback. When provided, every
 * candidate (free or AI) is run through verification; on rejection the
 * orchestrator advances to the next source, and on rejection of the Flux
 * fallback returns `failed` so the caller falls back to the procedural card.
 * Without a callback the orchestrator returns the first quality-passing
 * candidate (legacy behaviour) and stamps `verificationStatus = UNVERIFIED`
 * so a later sweep can fill it in.
 */

import { searchUnsplash } from './unsplash'
import { searchPexels } from './pexels'
import { searchWikimedia } from './wikimedia'
import { searchPixabay } from './pixabay'
import { generateWithFluxSchnell } from './flux-schnell'
import type { VerifyImageFn } from './verify'
import {
  MAX_RATIO,
  MIN_HEIGHT,
  MIN_RATIO,
  MIN_WIDTH,
  type ImageSearchResult,
  type ImageSource,
  type SourceHeroInput,
  type SourceHeroResult,
  type SourceRejection,
} from './types'

type FreeSourceFn = (q: string, opts?: { limit?: number }) => Promise<ImageSearchResult[]>

const FREE_SOURCES: Record<Extract<ImageSource, 'unsplash' | 'pexels' | 'wikimedia' | 'pixabay'>, FreeSourceFn> = {
  unsplash: searchUnsplash,
  pexels: searchPexels,
  wikimedia: searchWikimedia,
  pixabay: searchPixabay,
}

const COOKING_SPECIALTY = new Set([
  'middle-eastern',
  'north-african',
  'preserves',
  'air-fryer',
  'slow-cooker',
  'anglo-indian',
  'caribbean',
])

const MINDSET_SOMATIC = new Set(['tapping', 'embodiment', 'ritual', 'spell', 'energy-statement'])

function priorityFor(input: SourceHeroInput): { freeOrder: ImageSource[]; skipFreeForAi: boolean } {
  const category = input.category
  const sub = (input.subCategory ?? '').toLowerCase()
  if (category === 'mindset') {
    if (MINDSET_SOMATIC.has(sub)) return { freeOrder: [], skipFreeForAi: true }
    return { freeOrder: ['unsplash', 'pexels'], skipFreeForAi: false }
  }
  if (category === 'cooking') {
    if (COOKING_SPECIALTY.has(sub)) {
      return { freeOrder: ['unsplash', 'pexels', 'pixabay'], skipFreeForAi: false }
    }
    return { freeOrder: ['unsplash', 'pexels', 'wikimedia', 'pixabay'], skipFreeForAi: false }
  }
  if (input.category === 'baking') {
    return { freeOrder: ['unsplash', 'pexels', 'wikimedia', 'pixabay'], skipFreeForAi: false }
  }
  if (input.category === 'animals-smallholding') {
    // Pexels first — livestock photography on Pexels is consistently
    // strong (hens, hives, lambs in pasture). Wikimedia second because
    // there's deep public-domain agricultural and vintage-husbandry
    // material there (USDA plates, RHS-era illustrations). Pixabay
    // and Unsplash as the tail catch-all before Flux fallback.
    return { freeOrder: ['pexels', 'wikimedia', 'unsplash', 'pixabay'], skipFreeForAi: false }
  }
  if (input.category === 'sustainability') {
    // Sustainability content leans on technical diagrams (insulation
    // cross-sections, solar wiring) more than lifestyle photography.
    // Wikimedia carries the canonical Building Regs / energy diagrams.
    // Unsplash + Pexels supply the practical-skills photography for
    // composting / draughtproofing / water work. Pixabay is the
    // pragmatic last-free fallback before Flux.
    return { freeOrder: ['unsplash', 'pexels', 'wikimedia', 'pixabay'], skipFreeForAi: false }
  }
  if (input.category === 'natural-home') {
    // Pexels-first: hand-poured soap, candles, balm tins, and amber-bottle
    // styling are over-represented on Pexels relative to Unsplash. Wikimedia
    // earns a slot for the botanical-ingredient hero variant (a calendula
    // flower close-up doing the work for a calendula balm). Pixabay catches
    // commodity beeswax / lye / pipette product shots that the lifestyle
    // libraries skip.
    return { freeOrder: ['pexels', 'unsplash', 'wikimedia', 'pixabay'], skipFreeForAi: false }
  }
  if (input.category === 'home-repair') {
    // Pexels first — modern workshop and trade photography reads cleaner
    // for hands-on process shots than Unsplash's lifestyle bias. Wikimedia
    // covers vintage plumbing / joinery manuals (good when the technique
    // is unchanged; rejected when the era's fittings differ from modern
    // kit — verified in the orchestrator's verify callback).
    return { freeOrder: ['pexels', 'unsplash', 'wikimedia', 'pixabay'], skipFreeForAi: false }
  }
  if (
    input.category === 'needlework' ||
    input.category === 'knitting' ||
    input.category === 'crochet' ||
    input.category === 'sewing' ||
    input.category === 'fibre-arts' ||
    input.category === 'wood-natural-craft' ||
    input.category === 'paper-word' ||
    input.category === 'pottery-ceramics'
  ) {
    // Craft-instruction categories: Wikimedia FIRST. Niche technique queries
    // ("treble crochet", "long-tail cast on", "magic ring") frequently get
    // nonsensical Unsplash matches because lifestyle sources rank lifestyle
    // photos, not technique reference. Wikimedia has dedicated tutorial-shot
    // categories (Crochet Treble step 1-7, Knit Texture Ballband Dishcloth,
    // historical samplers), PD historical engravings (Therese de Dillmont
    // 1886, Caulfeild & Saward 1882, Weldon's 1880s), and museum-licensed
    // antique pieces. Photo sources catch when Wikimedia misses.
    return { freeOrder: ['wikimedia', 'pexels', 'unsplash', 'pixabay'], skipFreeForAi: false }
  }
  // Garden / herbal-medicine / bushcraft and anything else: same as cooking generic.
  return { freeOrder: ['unsplash', 'pexels', 'wikimedia', 'pixabay'], skipFreeForAi: false }
}

function buildQuery(input: SourceHeroInput): string {
  // The title gets noisy fast on free image sources. Strip parenthetical and
  // descriptors after a comma so "Chocolate sourdough, scored cross-hatch"
  // becomes "Chocolate sourdough".
  const title = input.title.replace(/\s*[(,]\s*.*$/, '').trim()
  const hint = input.ingredients?.[0] ? ` ${input.ingredients[0]}` : ''
  return `${title}${hint}`.trim()
}

function passesQuality(r: ImageSearchResult): boolean {
  if (!r.url) return false
  if (r.width < MIN_WIDTH) return false
  if (r.height < MIN_HEIGHT) return false
  const ratio = r.width / r.height
  if (ratio < MIN_RATIO || ratio > MAX_RATIO) return false
  return true
}

export interface SourceHeroOptions {
  /** Sources to skip — used to retry after a rejection. */
  excludeSources?: ImageSource[]
  /** Optional verification callback. When provided, each candidate is verified
   *  and the orchestrator advances on rejection. Without it, the first
   *  quality-passing candidate is returned with verificationStatus UNVERIFIED. */
  verify?: VerifyImageFn
}

export async function sourceHeroImage(
  input: SourceHeroInput,
  options: SourceHeroOptions = {},
): Promise<SourceHeroResult> {
  const { freeOrder, skipFreeForAi } = priorityFor(input)
  const query = buildQuery(input)
  const exclude = new Set<ImageSource>(options.excludeSources ?? [])
  const triedSources: ImageSource[] = []
  const rejections: SourceRejection[] = []

  if (!skipFreeForAi) {
    for (const source of freeOrder) {
      if (exclude.has(source)) continue
      triedSources.push(source)
      const fn = FREE_SOURCES[source as keyof typeof FREE_SOURCES]
      if (!fn) continue
      const results = await fn(query, { limit: 3 })
      for (const r of results) {
        if (!passesQuality(r)) continue
        if (options.verify) {
          const verdict = await runVerify(options.verify, r, input)
          if (verdict.verdict === 'rejected') {
            rejections.push({ source, reason: verdict.reason })
            continue
          }
          return {
            image: r,
            outcome: 'free',
            triedSources,
            rejections,
            verificationStatus: 'VERIFIED',
          }
        }
        return {
          image: r,
          outcome: 'free',
          triedSources,
          rejections,
          verificationStatus: 'UNVERIFIED',
        }
      }
    }
  }

  if (!exclude.has('flux-schnell')) {
    triedSources.push('flux-schnell')
    const ai = await generateWithFluxSchnell(input)
    if (ai) {
      if (options.verify) {
        const verdict = await runVerify(options.verify, ai, input)
        if (verdict.verdict === 'rejected') {
          rejections.push({ source: 'flux-schnell', reason: verdict.reason })
          return {
            image: null,
            outcome: 'failed',
            triedSources,
            rejections,
            verificationStatus: 'REJECTED_USED_PROCEDURAL',
          }
        }
        return {
          image: ai,
          outcome: 'ai-generated',
          triedSources,
          rejections,
          verificationStatus: 'VERIFIED',
        }
      }
      return {
        image: ai,
        outcome: 'ai-generated',
        triedSources,
        rejections,
        verificationStatus: 'UNVERIFIED',
      }
    }
  }

  return {
    image: null,
    outcome: 'failed',
    triedSources,
    rejections,
    verificationStatus: 'REJECTED_USED_PROCEDURAL',
  }
}

async function runVerify(
  verify: VerifyImageFn,
  image: ImageSearchResult,
  input: SourceHeroInput,
): Promise<{ verdict: 'verified' | 'rejected'; reason: string }> {
  try {
    return await verify({
      imageUrl: image.url,
      imageSource: image.source,
      tutorialTitle: input.title,
      keyIngredients: input.ingredients?.slice(0, 5) ?? [],
      cuisine: input.subCategory ?? null,
      mealType: null,
      category: input.category,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { verdict: 'rejected', reason: `verify-threw: ${message}` }
  }
}

export type { SourceHeroInput, SourceHeroResult, ImageSearchResult, SourceRejection } from './types'
