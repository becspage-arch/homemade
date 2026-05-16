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
 */

import { searchUnsplash } from './unsplash'
import { searchPexels } from './pexels'
import { searchWikimedia } from './wikimedia'
import { searchPixabay } from './pixabay'
import { generateWithFluxSchnell } from './flux-schnell'
import {
  MAX_RATIO,
  MIN_HEIGHT,
  MIN_RATIO,
  MIN_WIDTH,
  type ImageSearchResult,
  type ImageSource,
  type SourceHeroInput,
  type SourceHeroResult,
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
  if (category === 'baking') {
    return { freeOrder: ['unsplash', 'pexels', 'wikimedia', 'pixabay'], skipFreeForAi: false }
  }
  // Garden / herbal-medicine and anything else: same as cooking generic.
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

export async function sourceHeroImage(input: SourceHeroInput): Promise<SourceHeroResult> {
  const { freeOrder, skipFreeForAi } = priorityFor(input)
  const query = buildQuery(input)
  const triedSources: ImageSource[] = []

  if (!skipFreeForAi) {
    for (const source of freeOrder) {
      triedSources.push(source)
      const fn = FREE_SOURCES[source as keyof typeof FREE_SOURCES]
      if (!fn) continue
      const results = await fn(query, { limit: 3 })
      for (const r of results) {
        if (passesQuality(r)) {
          return { image: r, outcome: 'free', triedSources }
        }
      }
    }
  }

  triedSources.push('flux-schnell')
  const ai = await generateWithFluxSchnell(input)
  if (ai) {
    return { image: ai, outcome: 'ai-generated', triedSources }
  }

  return { image: null, outcome: 'failed', triedSources }
}

export type { SourceHeroInput, SourceHeroResult, ImageSearchResult } from './types'
