import 'server-only'
import { prisma, parsePatternData, Visibility, type PatternData } from '@homemade/db'
import { isSamplerChartMeta, type SamplerChartMeta } from './chart'

/**
 * Read a published sampler and its lettering recipe.
 *
 * Only a PUBLIC house pattern qualifies. A member's own copy is already
 * personalised and is edited in the Studio; an un-judged candidate is not a
 * catalogue piece at all. Returns null for anything else, so the routes that
 * call this can answer "not found" without a second visibility check.
 */
export interface LoadedSampler {
  id: string
  name: string
  data: PatternData
  meta: SamplerChartMeta
  /** Picture of the design with no words on it, for the live preview. */
  previewBaseUrl: string | null
}

export async function loadSampler(patternId: string): Promise<LoadedSampler | null> {
  const row = await prisma.pattern.findUnique({
    where: { id: patternId },
    select: {
      id: true,
      name: true,
      data: true,
      generationMeta: true,
      ownerUserId: true,
      visibility: true,
      type: true,
    },
  })
  if (!row || row.type !== 'CROSS_STITCH') return null
  if (row.ownerUserId !== null || row.visibility !== Visibility.PUBLIC) return null

  const gen =
    row.generationMeta && typeof row.generationMeta === 'object' && !Array.isArray(row.generationMeta)
      ? (row.generationMeta as Record<string, unknown>)
      : null
  const sampler = gen?.sampler
  if (!isSamplerChartMeta(sampler)) return null

  let data: PatternData
  try {
    data = parsePatternData(row.data)
  } catch {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    data,
    meta: sampler,
    previewBaseUrl: samplerPreviewBase(row.generationMeta),
  }
}

/** Does this pattern carry a lettering recipe? Used by the pattern page. */
export function samplerMetaOf(generationMeta: unknown): SamplerChartMeta | null {
  const gen =
    generationMeta && typeof generationMeta === 'object' && !Array.isArray(generationMeta)
      ? (generationMeta as Record<string, unknown>)
      : null
  const sampler = gen?.sampler
  return isSamplerChartMeta(sampler) ? sampler : null
}

/** The preview base image URL, when the row has one. */
export function samplerPreviewBase(generationMeta: unknown): string | null {
  const gen =
    generationMeta && typeof generationMeta === 'object' && !Array.isArray(generationMeta)
      ? (generationMeta as Record<string, unknown>)
      : null
  const sampler = gen?.sampler as { previewBaseUrl?: unknown } | undefined
  return typeof sampler?.previewBaseUrl === 'string' ? sampler.previewBaseUrl : null
}
