import type { PatternData } from '@homemade/db'
import { imageToChart } from './convert'
import { fluxIllustration } from './sources'
import {
  buildIllustration, buildBotanical, buildRetro, buildCelestial,
  buildSampler, buildTypo, buildMixed, buildMinimal, type Cap,
} from './quote-engine'

/**
 * The pattern-generation spec interface — the shape the autopilot (and the
 * JSON-driven worker runner) calls. One discriminated union covers every
 * generation tier; `buildFromSpec` dispatches to the right engine and returns
 * validated PatternData ready to QC + save into the REVIEW state.
 *
 * Tiers:
 *   scene        — Tier E full-coverage illustration (animals, seasonal,
 *                  cocktails, cosy, landscapes, monochrome). No caption.
 *   illustration — AI subject + a crisp caption band (funny/character).
 *   botanical    — AI floral frame/wreath/corners + crisp centred quote.
 *   retro / celestial / sampler / typo / mixed / minimal — flat procedural
 *                  graphic styles.
 *
 * Text is NEVER drawn by the AI (Flux can't spell) — captions are always a
 * crisp overlay snapped to the palette. See project_cross_stitch_pipeline.
 */
export type Spec =
  | { slug: string; name: string; tier: 'scene'; prompt: string; colours?: number; cells?: number; square?: boolean }
  | { slug: string; name: string; tier: 'illustration'; prompt: string; colours: number; cells: number; cap: Cap[]; capPos: 'top' | 'bottom'; ink: string }
  | { slug: string; name: string; tier: 'botanical'; prompt: string; colours: number; cells: number; lines: string[]; font: string; size: number; ink: string }
  | { slug: string; name: string; tier: 'retro'; lines: string[]; font: string }
  | { slug: string; name: string; tier: 'celestial'; lines: string[]; font: string; seed: number }
  | { slug: string; name: string; tier: 'sampler'; lines: string[] }
  | { slug: string; name: string; tier: 'typo'; scriptWord: string; scriptFont: string; blockWords: string; blockFont: string; ink: string }
  | { slug: string; name: string; tier: 'mixed'; words: { t: string; font: string; size: number; fill: string; y: number; style?: string }[] }
  | { slug: string; name: string; tier: 'minimal'; lines: string[]; font: string }

async function buildScene(s: Extract<Spec, { tier: 'scene' }>): Promise<PatternData> {
  const src = await fluxIllustration(s.prompt, { imageSize: s.square ? 'square_hd' : 'portrait_4_3' })
  return imageToChart(src.buffer, { longestCells: s.cells ?? 160, colours: s.colours ?? 28, preprocess: { saturation: 1.12 } })
}

/** Dispatch a spec to its generation engine. Returns validated PatternData. */
export function buildFromSpec(spec: Spec): Promise<PatternData> {
  switch (spec.tier) {
    case 'scene': return buildScene(spec)
    case 'illustration': return buildIllustration(spec)
    case 'botanical': return buildBotanical(spec)
    case 'retro': return buildRetro(spec)
    case 'celestial': return buildCelestial(spec)
    case 'sampler': return buildSampler(spec)
    case 'typo': return buildTypo(spec)
    case 'mixed': return buildMixed(spec)
    case 'minimal': return buildMinimal(spec)
  }
}

/** AI tiers are Homemade-original AI-assisted; everything else is procedural. */
export function specLicence(spec: Spec): { licence: 'HOMEMADE-AI' | 'HOMEMADE-ORIGINAL'; credit: string } {
  return spec.tier === 'scene' || spec.tier === 'illustration' || spec.tier === 'botanical'
    ? { licence: 'HOMEMADE-AI', credit: 'Homemade-original (AI-assisted illustration)' }
    : { licence: 'HOMEMADE-ORIGINAL', credit: 'Homemade-original (procedural)' }
}
