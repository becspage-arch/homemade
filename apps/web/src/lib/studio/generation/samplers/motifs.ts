/**
 * ILLUSTRATED MOTIFS — the parts of a sampler that are pictures.
 *
 * A wreath of roses, a stork, a little house, a pair of rings, a boat. These
 * are drawn by the same Flux schnell path the rest of the catalogue uses
 * (`generation/sources.ts`), converted by the same converter
 * (`generation/convert.ts`), and put on bare linen by the same rule the bulk
 * pipeline uses (`bulk/bare-fabric.ts`). Nothing new, and no second pipeline.
 *
 * Two things make them cheap. The art is generated ONCE per motif, cached on
 * disk beside the build, and every sampler that uses that motif reads the same
 * cells; and a personalised copy reuses the published chart rather than
 * regenerating anything at all. So a hundred people putting a hundred names on
 * the same wreath costs what one wreath cost.
 *
 * The words are never in the art. Flux cannot spell, and the motif prompts all
 * carry the existing negative guard against it.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { imageToChart } from '../convert'
import { fluxIllustration } from '../sources'
import { bareFabricVerdict, clearBackground, isNearWhite } from '../bulk/bare-fabric'
import { despeckle, newArt, paint, type Art } from './art'

export interface MotifSpec {
  id: string
  /** The subject handed to the illustrator. No words, ever. */
  prompt: string
  /** Longest side of the converted motif, in cells. */
  cells: number
  /** Colour count asked of the converter. */
  colours: number
  imageSize?: 'square_hd' | 'portrait_4_3' | 'landscape_4_3'
  /** Source saturation before quantising. The catalogue's vivid-colour fix. */
  saturation?: number
  /**
   * Islands smaller than this are litter and are cleared. Set it to 1 on a
   * motif whose design genuinely contains tiny detached marks (a scatter of
   * stars, a trail of blossom); everything else is better without them.
   */
  despeckle?: number
  /**
   * A RING. Its middle is enclosed by the design, so the bare-fabric rule
   * cannot reach it: that rule clears white it can walk to from the edge, and
   * the inside of a wreath is walled in by roses. Left alone the piece ships
   * with several thousand white stitches in the hole where the name goes.
   * With this set, every near-white cell in the motif is treated as ground.
   * Only for motifs whose white really is empty space: a white rabbit is not.
   */
  hollow?: boolean
}

/**
 * The motif library. Each entry is one picture that several samplers draw on.
 *
 * Prompts name a WHITE GROUND and a clear shape, because that is what the
 * converter turns into crisp cells and what the bare-fabric rule needs in order
 * to leave the linen showing. Painterly full-bleed art mushes; this is the
 * lesson the whole cross-stitch catalogue is built on.
 */
export const MOTIFS = {
  'rose-wreath': {
    id: 'rose-wreath',
    prompt:
      'a circular wreath of garden roses, peonies and green leaves with a large clear empty centre, soft dusky pink cream and sage, bright cheerful cross-stitch illustration, bold clean colour regions, crisp clear elements evenly arranged around the ring, clean white background',
    cells: 150,
    colours: 22,
    imageSize: 'square_hd',
    saturation: 1.35,
    hollow: true,
  },
  'meadow-wreath': {
    id: 'meadow-wreath',
    prompt:
      'a circular wreath of wildflowers, cornflowers, daisies and grasses with a large clear empty centre, delicate elegant botanical illustration, sophisticated muted-yet-rich palette, fine clear detail, airy negative space, clean white background',
    cells: 150,
    colours: 26,
    imageSize: 'square_hd',
    saturation: 1.14,
    hollow: true,
  },
  'eucalyptus-arch': {
    id: 'eucalyptus-arch',
    prompt:
      'an arch of eucalyptus and olive branches curving over an empty space, sage green and soft grey-green leaves, elegant botanical illustration, fine clear detail, airy, clean white background',
    cells: 160,
    colours: 14,
    imageSize: 'landscape_4_3',
    saturation: 1.18,
    hollow: true,
  },
  stork: {
    id: 'stork',
    prompt:
      'a plump friendly white stork standing upright in profile on two long orange legs, holding a soft blue cloth bundle by a knot in its beak, one clear head with one eye and one long orange beak, adorable storybook character, bold clear outline, bright saturated palette, clean white background',
    cells: 90,
    colours: 16,
    imageSize: 'portrait_4_3',
    saturation: 1.42,
  },
  'nursery-animals': {
    id: 'nursery-animals',
    prompt:
      'a row of three sweet baby animals sitting side by side, a bunny, a bear cub and a little fox, adorable storybook nursery characters, soft pastel palette with clear bold outlines, lots of personality, clean white background',
    cells: 170,
    colours: 20,
    imageSize: 'landscape_4_3',
    saturation: 1.3,
  },
  'moon-cloud': {
    id: 'moon-cloud',
    prompt:
      'a sleeping crescent moon resting on a soft cloud with three small stars, adorable storybook nursery character, gentle pastel blues and cream with a warm gold moon, bold clear outline, clean white background',
    cells: 110,
    colours: 14,
    imageSize: 'square_hd',
    saturation: 1.3,
    // Hanging stars and their threads are the design, not litter.
    despeckle: 4,
  },
  cottage: {
    id: 'cottage',
    prompt:
      'a small English country cottage with a tiled roof, a red front door, climbing roses either side and a garden path, bright cheerful modern illustration, bold saturated multicolour palette, crisp clean shapes, high contrast, clean white background, blank signboards',
    cells: 130,
    colours: 24,
    imageSize: 'square_hd',
    saturation: 1.4,
  },
  'front-door': {
    id: 'front-door',
    prompt:
      'a smart painted front door with a brass knocker, a stone step and two potted bay trees either side, bright cheerful modern illustration, bold saturated colour, crisp clean shapes, clean white background, blank door number plate',
    cells: 120,
    colours: 18,
    imageSize: 'portrait_4_3',
    saturation: 1.35,
  },
  'ring-posy': {
    id: 'ring-posy',
    prompt:
      'two interlocking gold wedding rings resting on a small posy of white and blush roses with green leaves, bright clean illustration, bold clear colour regions, crisp detail, clean white background',
    cells: 110,
    colours: 18,
    imageSize: 'square_hd',
    saturation: 1.28,
  },
  'sail-boat': {
    id: 'sail-boat',
    prompt:
      'a little sailing boat with cream sails on gentle blue waves with two seagulls above, bright cheerful coastal illustration, bold saturated blues and warm sand, crisp clean shapes, clean white background',
    cells: 130,
    colours: 16,
    imageSize: 'landscape_4_3',
    saturation: 1.4,
    // The gulls are small and detached, and they make the picture.
    despeckle: 4,
  },
  'botanical-band': {
    id: 'botanical-band',
    prompt:
      'a long horizontal band of pressed wildflowers and ferns lying side by side, lavender, yarrow, cornflower and fern fronds, delicate elegant botanical illustration, sophisticated muted-yet-rich palette, fine clear detail, clean white background',
    cells: 190,
    colours: 24,
    imageSize: 'landscape_4_3',
    saturation: 1.14,
  },
  'swallow-pair': {
    id: 'swallow-pair',
    prompt:
      'two swallows in flight facing each other with a small trail of blossom between them, clean elegant illustration, deep blue and warm blossom pink, bold clear shapes, clean white background',
    cells: 120,
    colours: 12,
    imageSize: 'landscape_4_3',
    saturation: 1.3,
    // The blossom trail between the two birds is a scatter of small pieces.
    despeckle: 3,
  },
} as const satisfies Record<string, MotifSpec>

export type MotifId = keyof typeof MOTIFS

// ───────────────────────────── the cache ─────────────────────────────

/**
 * Where generated motif art is kept between runs. Under the session scratchpad
 * by default, which is gitignored: the art that matters ends up in the
 * published charts, and this is only here so a rebuild does not pay Flux twice.
 */
export function motifCacheDir(): string {
  return process.env.SAMPLER_MOTIF_DIR ?? join(process.cwd(), 'scratchpad', 'sampler-motifs')
}

function cachePath(id: string, variant: number): string {
  return join(motifCacheDir(), `${id}-v${variant}.png`)
}

/**
 * The picture for one motif variant: off disk if it is there, from Flux if it
 * is not. `variant` exists so a handful can be generated and looked at side by
 * side before one is chosen; the chosen index is written into the design.
 */
export async function motifImage(spec: MotifSpec, variant = 1): Promise<Buffer> {
  const path = cachePath(spec.id, variant)
  if (existsSync(path)) return readFileSync(path)
  const src = await fluxIllustration(spec.prompt, { imageSize: spec.imageSize ?? 'square_hd' })
  mkdirSync(motifCacheDir(), { recursive: true })
  writeFileSync(path, src.buffer)
  return src.buffer
}

/** True when this variant is already on disk, so a build spends nothing. */
export function motifIsCached(spec: MotifSpec, variant = 1): boolean {
  return existsSync(cachePath(spec.id, variant))
}

// ───────────────────────────── conversion ─────────────────────────────

export interface MotifArt {
  art: Art
  width: number
  height: number
  colours: string[]
  /** Cells cleared as litter. Printed by the motif sheet so it can be judged. */
  despeckled: number
}

/**
 * Convert a motif picture into cells on bare linen.
 *
 * The bare-fabric rule decides whether the white round the outside is the
 * ground or part of the picture, exactly as it does for every other pattern in
 * the catalogue, so a motif never ships as two thirds white-on-white stitching.
 *
 * `overrides` re-converts the SAME cached picture at a different size or colour
 * count, which costs nothing and is how two samplers can use one wreath at two
 * scales without either being a copy of the other.
 */
export async function motifArt(
  spec: MotifSpec,
  variant = 1,
  overrides: { cells?: number; colours?: number } = {},
): Promise<MotifArt> {
  const png = await motifImage(spec, variant)
  const chart = await imageToChart(png, {
    longestCells: overrides.cells ?? spec.cells,
    colours: overrides.colours ?? spec.colours,
    confettiMin: 'medium',
    preprocess: { saturation: spec.saturation ?? 1.3 },
  })
  const verdict = bareFabricVerdict(chart)
  const cleared = verdict.convert ? clearBackground(chart).data : chart

  const white = new Set(
    spec.hollow ? cleared.palette.filter((p) => isNearWhite(p)).map((p) => p.symbol) : [],
  )
  const rgbFor = new Map(cleared.palette.map((p) => [p.symbol, p.rgb.toLowerCase()]))
  const art = newArt()
  for (const c of cleared.grid.cells) {
    if (white.has(c.s)) continue
    const rgb = rgbFor.get(c.s)
    if (rgb) paint(art, c.x, c.y, rgb)
  }
  const despeckled = despeckle(art, spec.despeckle ?? 8)
  const colours: string[] = []
  for (const c of art.values()) if (!colours.includes(c)) colours.push(c)
  return { art, width: cleared.grid.width, height: cleared.grid.height, colours, despeckled }
}
