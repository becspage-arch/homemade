/**
 * BUILD ONE SAMPLER.
 *
 * Art, then threads, then words, then a validated chart with the wording recipe
 * beside it. One function so the catalogue build, the proof sheets and any
 * later rebuild all produce the same chart from the same design.
 */

import type { PatternData } from '@homemade/db'
import { artColours, clipArt } from './art'
import {
  assembleChart,
  buildPalette,
  setSamplerText,
  type SamplerBlockSpec,
  type SamplerChartMeta,
} from './chart'
import { SAMPLER_KINDS } from './kinds'
import type { SamplerDesign } from './design'

export interface BuiltSampler {
  design: SamplerDesign
  data: PatternData
  meta: SamplerChartMeta
}

/**
 * Chart a design.
 *
 * `values` defaults to the kind's sample wording, which is what the catalogue
 * copies are charted with: a real plausible name and date, so what a customer
 * sees on the shelf is the piece they would actually stitch rather than a row
 * of "Your name here".
 */
/**
 * Resolve a design's art and its lettering slots without setting any words.
 * The layout diagnostic uses it; so does `buildSampler`, so the two can never
 * disagree about where a slot is.
 */
export async function buildSamplerBlocks(
  design: SamplerDesign,
): Promise<{ art: ReturnType<typeof clipArt>; blocks: SamplerBlockSpec[]; palette: ReturnType<typeof buildPalette> }> {
  const art = clipArt(await design.art(), design.width, design.height)
  const inks: string[] = [design.ink, ...(design.ink2 ? [design.ink2] : [])]
  const palette = buildPalette(artColours(art), inks)
  const inkSymbol = (slot: 'ink' | 'ink2'): string => {
    const hex = slot === 'ink2' ? (design.ink2 ?? design.ink) : design.ink
    const symbol = palette.symbolFor.get(hex)
    if (!symbol) throw new Error(`sampler build: no symbol for lettering colour ${hex}`)
    return symbol
  }
  const declared =
    typeof design.blocks === 'function'
      ? design.blocks({ art, width: design.width, height: design.height })
      : design.blocks
  const blocks: SamplerBlockSpec[] = declared.map((b) => ({
    region: b.region,
    align: b.align,
    vAlign: b.vAlign,
    lineGap: b.lineGap,
    inkSymbol: inkSymbol(b.ink),
    lines: b.lines,
  }))
  return { art, blocks, palette }
}

export async function buildSampler(
  design: SamplerDesign,
  values?: Record<string, string>,
  locale = 'en-GB',
): Promise<BuiltSampler> {
  const words = values ?? SAMPLER_KINDS[design.kind].sample
  const { art, blocks, palette } = await buildSamplerBlocks(design)

  const text = await setSamplerText(blocks, design.kind, words, locale)
  const data = assembleChart(art, text, palette, {
    width: design.width,
    height: design.height,
  })

  const meta: SamplerChartMeta = {
    version: 1,
    kind: design.kind,
    designSlug: design.slug,
    blocks,
    values: words,
  }
  return { design, data, meta }
}
