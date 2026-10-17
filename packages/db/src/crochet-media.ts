/**
 * Which image stands for a crochet pattern, in one place.
 *
 * The preference the category grid already uses (`pattern-layout.tsx`, from
 * the schema note on `CrochetPattern.loomProgram`): the loom hero IS the exact
 * pattern, so it wins; then the finished-piece hero; then the saved chart
 * thumbnail. The search document and the go-live check use the same order, so
 * a search card and a grid card can never show different pictures.
 *
 * Pure: no Prisma, no network.
 */

export interface CrochetMediaRef {
  cloudflareId: string | null
  r2Key: string | null
}

export interface CrochetMediaSources {
  loomHero?: CrochetMediaRef | null
  hero?: CrochetMediaRef | null
  thumbnail?: CrochetMediaRef | null
}

function usable(m: CrochetMediaRef | null | undefined): m is CrochetMediaRef {
  return !!m && (!!m.r2Key || !!m.cloudflareId)
}

/** The image that stands for the pattern, or null when it has none. */
export function crochetHeroMedia(p: CrochetMediaSources): CrochetMediaRef | null {
  for (const m of [p.loomHero, p.hero, p.thumbnail]) if (usable(m)) return m
  return null
}
