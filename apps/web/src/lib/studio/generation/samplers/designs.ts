/**
 * THE SAMPLER CATALOGUE.
 *
 * Several finished pieces for each of the five occasions, each a different
 * look: a wreath of roses, a folk border in red and blue, a plain piece of
 * type, a row of nursery animals, a band of pressed flowers, a boat on blue
 * water, a small hoop you could finish in an evening, a big band sampler you
 * could not.
 *
 * The range is the point, and it is a property of the SET rather than of any
 * one piece: small next to large, four threads next to thirty, pastel next to
 * saturated, drawn next to counted. A shelf of eight rose wreaths would fail
 * even if every wreath were lovely.
 *
 * Every one of these is charted with a real name and a real date on it, so what
 * a customer sees on the shelf is the piece they would stitch. Changing the
 * name is what the personalise section on the pattern page does.
 *
 * The `variant` beside each motif is the picture chosen by looking at the whole
 * set of attempts full size (`scripts/xs-samplers-motifs.ts` draws the sheet).
 * Nothing here was picked by a score.
 */

import {
  clearBoxAround,
  clearRegion,
  drawBorder,
  drawRect,
  drawRule,
  motifAt,
  motifRow,
  newArt,
  stamp,
  blit,
  type Art,
} from './art'
import { MOTIFS, motifArt, type MotifId } from './motifs'
import type { DesignBlock, SamplerDesign } from './design'
import type { SamplerRegion } from './chart'

// ───────────────────────────── threads ─────────────────────────────

/** Lettering threads. None of these is ever used by the art. */
const INK = {
  bark: '#5b4239',
  slate: '#35414f',
  indigo: '#25364c',
  plum: '#5e3a49',
  forest: '#31492f',
  claret: '#8a2b32',
  charcoal: '#3c3c3c',
  navyDeep: '#1c2f47',
} as const

const ROSE = { petal: '#c8778c', blush: '#e6b5bf', leaf: '#8ba576' } as const
const FOLK = { red: '#a5342f', blue: '#33507e', gold: '#c9922e', green: '#4d7349' } as const
const NURSERY = { sky: '#a9c8dd', peach: '#f0bda8' } as const
const COAST = { sea: '#4f8fab', sand: '#dcc59f' } as const
const BOTANY = { fern: '#77906a', moss: '#4a6342' } as const
const JEWEL = { crimson: '#af2a3d', teal: '#1f6b6b', mustard: '#d69b25', violet: '#6b4c86' } as const
const QUIET = { stone: '#9aa4ad', sage: '#93a68d' } as const

// ───────────────────────────── layout helpers ─────────────────────────────

const region = (x: number, y: number, w: number, h: number): SamplerRegion => ({ x, y, w, h })

/** A block of words, with the defaults most designs want. */
function block(
  r: SamplerRegion,
  lines: DesignBlock['lines'],
  opts: Partial<Omit<DesignBlock, 'region' | 'lines'>> = {},
): DesignBlock {
  return {
    region: r,
    align: opts.align ?? 'centre',
    vAlign: opts.vAlign ?? 'middle',
    lineGap: opts.lineGap ?? 3,
    ink: opts.ink ?? 'ink',
    lines,
  }
}

/** Place a converted motif so its middle lands on (cx, cy). */
async function placeMotif(
  art: Art,
  id: MotifId,
  variant: number,
  cx: number,
  cy: number,
  opts: { cells?: number; colours?: number } = {},
): Promise<{ width: number; height: number }> {
  const m = await motifArt(MOTIFS[id], variant, opts)
  blit(art, m.art, Math.round(cx - m.width / 2), Math.round(cy - m.height / 2))
  return { width: m.width, height: m.height }
}

/** Clear the linen behind a slot, with a little air round the words. */
function clearSlot(art: Art, r: SamplerRegion, margin = 2): void {
  clearRegion(art, { x: r.x - margin, y: r.y - margin, w: r.w + margin * 2, h: r.h + margin * 2 })
}

/**
 * The opening in a ring of art, measured rather than assumed.
 *
 * The hole in a wreath is wherever the illustrator left it, and it moves by ten
 * cells between one attempt and the next. `clearBoxAround` walks outwards from
 * the middle of the ring until it meets a leaf, so the name is set in the space
 * that is actually there.
 */
function wreathHole(
  ctx: { art: Art; width: number; height: number },
  seedY: number,
): SamplerRegion {
  const box = clearBoxAround(ctx.art, ctx.width, ctx.height, ctx.width / 2, seedY, { margin: 2 })
  if (box.w >= 30 && box.h >= 14) return box
  // A ring the illustrator closed over leaves nothing to measure. Fall back to
  // a band across the middle so the failure surfaces on the words, where it can
  // be read, rather than as a slot of zero width.
  return region(
    Math.round(ctx.width * 0.3),
    Math.round(seedY - ctx.height * 0.05),
    Math.round(ctx.width * 0.4),
    Math.round(ctx.height * 0.1),
  )
}

/** A row of small crosses, the plainest band a counted sampler carries. */
function crossRow(art: Art, left: number, right: number, y: number, colour: string, step = 6): void {
  for (let x = left; x <= right - 2; x += step) {
    stamp(art, x, y, ['A.A', '.A.', 'A.A'], { A: colour })
  }
}

// ───────────────────────────── birth ─────────────────────────────

const birthRoseWreath: SamplerDesign = {
  slug: 'sampler-birth-rose-wreath',
  kind: 'birth',
  name: 'Rose wreath birth sampler',
  description: 'A ring of garden roses and leaves round a name, with the date, weight and length beneath.',
  look: 'floral wreath',
  width: 190,
  height: 216,
  ink: INK.plum,
  motifs: [{ id: 'rose-wreath', variant: 1 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'rose-wreath', 1, 95, 88, { cells: 190, colours: 46 })
    drawRule(art, 62, 128, 176, ROSE.leaf, 1)
    return art
  },
  blocks: (ctx) => [
    block(wreathHole(ctx, 86), [{ template: '{name}', face: 'sampler', size: 20 }]),
    block(region(20, 184, 150, 28), [
      { template: 'Born {date}', face: 'sampler', size: 9 },
      { join: { keys: ['weight', 'length'], separator: ' · ' }, face: 'sampler', size: 8 },
    ]),
  ],
}

const birthNurseryFriends: SamplerDesign = {
  slug: 'sampler-birth-nursery-friends',
  kind: 'birth',
  name: 'Nursery friends birth sampler',
  description: 'A bunny, a bear cub and a fox under a name and date, inside a scalloped border.',
  look: 'nursery motifs',
  width: 176,
  height: 190,
  ink: INK.slate,
  motifs: [{ id: 'nursery-animals', variant: 1 }],
  async art() {
    const art = newArt()
    drawBorder(art, 176, 190, {
      tile: 'scallop',
      inset: 3,
      sides: 'all',
      colourA: NURSERY.sky,
      colourB: NURSERY.peach,
    })
    await placeMotif(art, 'nursery-animals', 1, 88, 128, { cells: 120, colours: 20 })
    clearSlot(art, region(26, 20, 124, 58), 3)
    return art
  },
  blocks: [
    block(region(26, 20, 124, 26), [{ template: '{name}', face: 'hand', size: 16 }]),
    block(region(26, 52, 124, 26), [
      { template: 'Born {date}', face: 'modern', size: 8, tracking: 0.4 },
      { join: { keys: ['weight', 'length'], separator: ' · ' }, face: 'modern', size: 7, tracking: 0.4 },
    ]),
  ],
}

const birthStork: SamplerDesign = {
  slug: 'sampler-birth-stork',
  kind: 'birth',
  name: 'Stork birth sampler',
  description: 'A stork with a bundle between two hearts, over a name, the date and the weight.',
  look: 'illustrated scene',
  width: 130,
  height: 192,
  ink: INK.claret,
  motifs: [{ id: 'stork', variant: 5 }],
  async art() {
    const art = newArt()
    drawRect(art, 4, 4, 125, 187, FOLK.blue)
    drawRect(art, 6, 6, 123, 185, FOLK.blue)
    await placeMotif(art, 'stork', 5, 65, 66, { cells: 104, colours: 16 })
    motifAt(art, 'heart', 22, 70, { A: FOLK.red }, 2)
    motifAt(art, 'heart', 108, 70, { A: FOLK.red }, 2)
    drawRule(art, 28, 101, 126, FOLK.green, 1)
    clearSlot(art, region(16, 132, 98, 46), 3)
    return art
  },
  blocks: [
    block(region(18, 132, 94, 16), [{ template: '{name}', face: 'sampler', size: 11 }]),
    block(region(16, 152, 98, 26), [
      { template: 'Born {date}', face: 'sampler', size: 7 },
      { join: { keys: ['weight', 'length'], separator: ' · ' }, face: 'sampler', size: 6.5 },
    ]),
  ],
}

const birthMoon: SamplerDesign = {
  slug: 'sampler-birth-moon',
  kind: 'birth',
  name: 'Sleeping moon birth sampler',
  description: 'A gold moon on a cloud with hanging stars, a name and the date below.',
  look: 'nursery motifs',
  width: 120,
  height: 162,
  ink: INK.indigo,
  motifs: [{ id: 'moon-cloud', variant: 4 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'moon-cloud', 4, 60, 54, { cells: 98, colours: 14 })
    drawRule(art, 26, 93, 112, NURSERY.sky, 1)
    clearSlot(art, region(12, 118, 96, 38), 2)
    return art
  },
  blocks: [
    block(region(12, 118, 96, 38), [
      { template: '{name}', face: 'hand', size: 12 },
      { template: '{date}', face: 'modern', size: 6, tracking: 0.4 },
    ], { lineGap: 3 }),
  ],
}

const birthFolkBand: SamplerDesign = {
  slug: 'sampler-birth-folk-band',
  kind: 'birth',
  name: 'Folk band birth sampler',
  description: 'Red and blue counted bands round a name, the date, the weight and the length.',
  look: 'folk border',
  width: 132,
  height: 152,
  ink: INK.bark,
  async art() {
    const art = newArt()
    drawBorder(art, 132, 152, {
      tile: 'diamond',
      inset: 3,
      sides: 'all',
      colourA: FOLK.red,
      colourB: FOLK.blue,
    })
    crossRow(art, 26, 106, 44, FOLK.gold)
    crossRow(art, 26, 106, 112, FOLK.gold)
    motifRow(art, { motif: 'flower', count: 3, left: 34, right: 98, top: 120, colours: { A: FOLK.red, B: FOLK.gold }, scale: 2 })
    return art
  },
  blocks: [
    block(region(13, 54, 106, 20), [{ template: '{name}', face: 'sampler', size: 12 }]),
    block(region(13, 78, 106, 28), [
      { template: 'Born {date}', face: 'sampler', size: 7.5 },
      { join: { keys: ['weight', 'length'], separator: ' · ' }, face: 'sampler', size: 7 },
    ]),
  ],
}

const birthLittleHoop: SamplerDesign = {
  slug: 'sampler-birth-little-hoop',
  kind: 'birth',
  name: 'Little hoop birth sampler',
  description: 'A small four-thread piece: a heart border, a name and the year.',
  look: 'small hoop',
  width: 84,
  height: 70,
  ink: INK.plum,
  async art() {
    const art = newArt()
    drawRect(art, 3, 3, 80, 66, ROSE.petal)
    motifAt(art, 'heart', 12, 12, { A: ROSE.blush }, 2)
    motifAt(art, 'heart', 71, 12, { A: ROSE.blush }, 2)
    motifAt(art, 'heart', 12, 57, { A: ROSE.blush }, 2)
    motifAt(art, 'heart', 71, 57, { A: ROSE.blush }, 2)
    drawRule(art, 24, 60, 46, ROSE.leaf, 1)
    return art
  },
  blocks: [
    block(region(10, 20, 64, 20), [{ template: '{name}', face: 'sampler', size: 8 }]),
    block(region(14, 50, 56, 10), [{ template: '{dateYear}', face: 'sampler', size: 6, tracking: 1 }]),
  ],
}

const birthPlainLetters: SamplerDesign = {
  slug: 'sampler-birth-plain-letters',
  kind: 'birth',
  name: 'Plain letters birth sampler',
  description: 'Plain type on bare linen: a name, the date underneath, weight and length in small capitals.',
  look: 'modern minimal',
  width: 176,
  height: 100,
  ink: INK.charcoal,
  ink2: INK.slate,
  async art() {
    const art = newArt()
    drawRule(art, 62, 113, 52, QUIET.sage, 1)
    motifAt(art, 'sprig', 46, 52, { A: QUIET.sage, B: ROSE.petal }, 2)
    motifAt(art, 'sprig', 130, 52, { A: QUIET.sage, B: ROSE.petal }, 2)
    return art
  },
  blocks: [
    block(region(14, 18, 148, 26), [{ template: '{name}', face: 'modern-bold', size: 15, tracking: 0.6 }]),
    block(
      region(18, 58, 140, 26),
      [
        { template: '{date}', face: 'modern', size: 8, tracking: 0.6 },
        { join: { keys: ['weight', 'length'], separator: '  ·  ' }, face: 'modern', size: 6.5, upper: true, tracking: 1 },
      ],
      { ink: 'ink2', lineGap: 6 },
    ),
  ],
}

// ───────────────────────────── wedding ─────────────────────────────

const weddingRingPosy: SamplerDesign = {
  slug: 'sampler-wedding-ring-posy',
  kind: 'wedding',
  name: 'Rings and posy wedding sampler',
  description: 'Two rings on a posy of roses, with both names, the date and the place.',
  look: 'illustrated scene',
  width: 140,
  height: 190,
  ink: INK.plum,
  motifs: [{ id: 'ring-posy', variant: 3 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'ring-posy', 3, 70, 66, { cells: 120, colours: 18 })
    drawRule(art, 36, 104, 120, ROSE.leaf, 1)
    motifAt(art, 'sprig', 15, 70, { A: ROSE.leaf, B: ROSE.petal }, 2)
    motifAt(art, 'sprig', 125, 70, { A: ROSE.leaf, B: ROSE.petal }, 2)
    clearSlot(art, region(14, 126, 112, 58), 3)
    return art
  },
  blocks: [
    block(region(14, 126, 112, 30), [{ template: '{nameOne} and {nameTwo}', face: 'hand', size: 13 }]),
    block(region(18, 160, 104, 26), [
      { template: '{date}', face: 'sampler', size: 7 },
      { template: '[{place}]', face: 'sampler', size: 6.5 },
    ]),
  ],
}

const weddingEucalyptusArch: SamplerDesign = {
  slug: 'sampler-wedding-eucalyptus-arch',
  kind: 'wedding',
  name: 'Eucalyptus arch wedding sampler',
  description: 'An arch of eucalyptus over two names, the date and the place, in sage and grey-green.',
  look: 'botanical band',
  width: 168,
  height: 174,
  ink: INK.forest,
  motifs: [{ id: 'eucalyptus-arch', variant: 1 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'eucalyptus-arch', 1, 84, 62, { cells: 168, colours: 14 })
    drawRule(art, 58, 110, 152, QUIET.sage, 1)
    clearSlot(art, region(24, 62, 120, 84), 3)
    return art
  },
  blocks: [
    block(region(24, 62, 120, 38), [{ template: '{nameOne} and {nameTwo}', face: 'script', size: 18 }]),
    block(region(24, 106, 120, 38), [
      { template: '{date}', face: 'modern', size: 8, tracking: 0.5 },
      { template: '[{place}]', face: 'modern', size: 7, tracking: 0.5 },
    ]),
  ],
}

const weddingSwallows: SamplerDesign = {
  slug: 'sampler-wedding-swallows',
  kind: 'wedding',
  name: 'Two swallows wedding sampler',
  description: 'A pair of swallows over a vine border, with two names, the date and the place.',
  look: 'illustrated scene',
  width: 152,
  height: 146,
  ink: INK.navyDeep,
  motifs: [{ id: 'swallow-pair', variant: 1 }],
  async art() {
    const art = newArt()
    drawBorder(art, 152, 146, {
      tile: 'vine',
      inset: 3,
      sides: 'top-bottom',
      colourA: BOTANY.fern,
      colourB: BOTANY.moss,
    })
    await placeMotif(art, 'swallow-pair', 1, 76, 52, { cells: 122, colours: 12 })
    clearSlot(art, region(18, 78, 116, 50), 3)
    return art
  },
  blocks: [
    block(region(18, 78, 116, 18), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 12 }]),
    block(region(24, 102, 104, 26), [
      { template: '{date}', face: 'sampler', size: 7 },
      { template: '[{place}]', face: 'sampler', size: 6.5 },
    ]),
  ],
}

const weddingFolkKnot: SamplerDesign = {
  slug: 'sampler-wedding-folk-knot',
  kind: 'wedding',
  name: 'Folk knot wedding sampler',
  description: 'A counted meander border in crimson and teal, with two names, the date and the place.',
  look: 'folk border',
  width: 152,
  height: 156,
  ink: INK.bark,
  async art() {
    const art = newArt()
    drawBorder(art, 152, 156, {
      tile: 'key',
      inset: 3,
      sides: 'all',
      colourA: JEWEL.crimson,
      colourB: JEWEL.teal,
    })
    motifAt(art, 'rings', 76, 40, { A: JEWEL.mustard }, 2)
    motifRow(art, { motif: 'heart', count: 3, left: 50, right: 102, top: 116, colours: { A: JEWEL.crimson }, scale: 2 })
    return art
  },
  blocks: [
    block(region(14, 56, 124, 18), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 11 }]),
    block(region(14, 78, 124, 28), [
      { template: '{date}', face: 'sampler', size: 7.5 },
      { template: '[{place}]', face: 'sampler', size: 7 },
    ]),
  ],
}

const weddingPlainLetters: SamplerDesign = {
  slug: 'sampler-wedding-plain-letters',
  kind: 'wedding',
  name: 'Plain letters wedding sampler',
  description: 'Two names in capitals over a hairline rule, with the date and the place beneath.',
  look: 'modern minimal',
  width: 152,
  height: 96,
  ink: INK.indigo,
  ink2: INK.bark,
  async art() {
    const art = newArt()
    drawRule(art, 40, 111, 46, JEWEL.crimson, 1)
    drawRule(art, 40, 111, 50, JEWEL.crimson, 1)
    return art
  },
  blocks: [
    block(region(14, 12, 124, 28), [
      { template: '{nameOne}', face: 'modern-bold', size: 11, tracking: 1.2, upper: true },
      { template: '{nameTwo}', face: 'modern-bold', size: 11, tracking: 1.2, upper: true },
    ], { lineGap: 4 }),
    block(
      region(18, 56, 116, 28),
      [
        { template: '{date}', face: 'modern', size: 8, tracking: 0.6 },
        { template: '[{place}]', face: 'modern', size: 6.5, tracking: 0.8, upper: true },
      ],
      { ink: 'ink2', lineGap: 5 },
    ),
  ],
}

const weddingWildflowerHoop: SamplerDesign = {
  slug: 'sampler-wedding-wildflower-hoop',
  kind: 'wedding',
  name: 'Wildflower hoop wedding sampler',
  description: 'A ring of cornflowers and daisies round two names, with the date and the place beneath.',
  look: 'floral wreath',
  width: 190,
  height: 226,
  ink: INK.plum,
  motifs: [{ id: 'meadow-wreath', variant: 3 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'meadow-wreath', 3, 95, 96, { cells: 190, colours: 52 })
    drawRule(art, 62, 128, 194, QUIET.sage, 1)
    return art
  },
  blocks: (ctx) => [
    block(wreathHole(ctx, 96), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 20 }]),
    block(region(20, 200, 150, 24), [
      { template: '{date}', face: 'sampler', size: 9 },
      { template: '[{place}]', face: 'sampler', size: 8 },
    ]),
  ],
}

const weddingLittleHoop: SamplerDesign = {
  slug: 'sampler-wedding-little-hoop',
  kind: 'wedding',
  name: 'Little hoop wedding sampler',
  description: 'A small piece for a card or a hoop: two names, a heart border, and the year.',
  look: 'small hoop',
  width: 96,
  height: 64,
  ink: INK.claret,
  async art() {
    const art = newArt()
    drawBorder(art, 96, 64, { tile: 'heart', inset: 2, sides: 'top-bottom', colourA: ROSE.petal, colourB: ROSE.leaf })
    return art
  },
  blocks: [
    block(region(10, 20, 76, 26), [
      { template: '{nameOne} and {nameTwo}', face: 'sampler', size: 8 },
      { template: '{dateYear}', face: 'sampler', size: 6, tracking: 1 },
    ], { lineGap: 4 }),
  ],
}

// ───────────────────────────── new home ─────────────────────────────

const homeCottage: SamplerDesign = {
  slug: 'sampler-new-home-cottage',
  kind: 'new-home',
  name: 'Cottage new home sampler',
  description: 'A country cottage with roses at the door, above the address and the date.',
  look: 'illustrated scene',
  width: 148,
  height: 178,
  ink: INK.forest,
  motifs: [{ id: 'cottage', variant: 1 }],
  async art() {
    const art = newArt()
    drawRect(art, 4, 4, 143, 173, BOTANY.moss)
    await placeMotif(art, 'cottage', 1, 74, 66, { cells: 128, colours: 24 })
    drawRule(art, 38, 110, 118, BOTANY.fern, 1)
    clearSlot(art, region(16, 126, 116, 46), 3)
    return art
  },
  blocks: [
    block(region(16, 126, 116, 16), [{ template: '{home}', face: 'sampler', size: 11 }]),
    block(region(18, 146, 112, 26), [
      { template: '[{names}]', face: 'sampler', size: 7 },
      { template: '[{date}]', face: 'sampler', size: 6.5 },
    ]),
  ],
}

const homeFrontDoor: SamplerDesign = {
  slug: 'sampler-new-home-front-door',
  kind: 'new-home',
  name: 'Front door new home sampler',
  description: 'A painted front door with two bay trees, the address underneath and the date below that.',
  look: 'illustrated scene',
  width: 124,
  height: 204,
  ink: INK.navyDeep,
  motifs: [{ id: 'front-door', variant: 1 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'front-door', 1, 62, 64, { cells: 118, colours: 18 })
    drawRule(art, 30, 94, 122, COAST.sea, 1)
    clearSlot(art, region(12, 130, 100, 70), 3)
    return art
  },
  blocks: [
    block(region(12, 130, 100, 26), [{ template: '{home}', face: 'modern-bold', size: 9, tracking: 0.4 }]),
    block(region(12, 160, 100, 38), [
      { template: '[{names}]', face: 'modern', size: 6.5, tracking: 0.4 },
      { template: '[{date}]', face: 'modern', size: 6.5, tracking: 0.4 },
    ]),
  ],
}

const homeFolkKeys: SamplerDesign = {
  slug: 'sampler-new-home-folk-keys',
  kind: 'new-home',
  name: 'Folk keys new home sampler',
  description: 'A counted border in teal and mustard, a row of little houses, the address and the date.',
  look: 'folk border',
  width: 148,
  height: 152,
  ink: INK.bark,
  async art() {
    const art = newArt()
    drawBorder(art, 148, 152, {
      tile: 'cross',
      inset: 3,
      sides: 'all',
      colourA: JEWEL.teal,
      colourB: JEWEL.mustard,
    })
    motifRow(art, {
      motif: 'house',
      count: 3,
      left: 34, right: 114, top: 110,
      colours: { A: JEWEL.crimson, B: FOLK.gold, C: BOTANY.moss, D: JEWEL.teal },
      scale: 2,
    })
    motifAt(art, 'key', 74, 32, { A: FOLK.gold }, 2)
    return art
  },
  blocks: [
    block(region(24, 48, 100, 16), [{ template: '{home}', face: 'sampler', size: 10 }]),
    block(region(24, 68, 100, 36), [
      { template: '[{names}]', face: 'sampler', size: 7 },
      { template: '[{date}]', face: 'sampler', size: 6.5 },
    ]),
  ],
}

const homePlainLetters: SamplerDesign = {
  slug: 'sampler-new-home-plain-letters',
  kind: 'new-home',
  name: 'Plain letters new home sampler',
  description: 'The address set large in plain capitals, with the date in small type under a rule.',
  look: 'modern minimal',
  width: 168,
  height: 122,
  ink: INK.forest,
  ink2: INK.navyDeep,
  async art() {
    const art = newArt()
    motifAt(art, 'key', 84, 18, { A: JEWEL.teal }, 3)
    drawRule(art, 58, 110, 68, JEWEL.teal, 1)
    return art
  },
  blocks: [
    block(region(12, 34, 144, 28), [{ template: '{home}', face: 'modern-bold', size: 12, tracking: 0.8 }]),
    block(
      region(16, 76, 136, 38),
      [
        { template: '[{names}]', face: 'modern', size: 7, tracking: 0.8, upper: true },
        { template: '[{date}]', face: 'modern', size: 7, tracking: 0.5 },
      ],
      { ink: 'ink2', lineGap: 5 },
    ),
  ],
}

const homeBotanicalBand: SamplerDesign = {
  slug: 'sampler-new-home-botanical-band',
  kind: 'new-home',
  name: 'Pressed flowers new home sampler',
  description: 'A band of pressed wildflowers and ferns over the address, the names and the date.',
  look: 'botanical band',
  width: 190,
  height: 158,
  ink: INK.forest,
  motifs: [{ id: 'botanical-band', variant: 2 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'botanical-band', 2, 95, 48, { cells: 190, colours: 46 })
    drawRule(art, 62, 128, 96, BOTANY.fern, 1)
    clearSlot(art, region(28, 104, 134, 46), 3)
    return art
  },
  blocks: [
    block(region(28, 104, 134, 16), [{ template: '{home}', face: 'sampler', size: 12 }]),
    block(region(32, 124, 126, 26), [
      { template: '[{names}]', face: 'sampler', size: 7 },
      { template: '[{date}]', face: 'sampler', size: 6.5 },
    ]),
  ],
}

const homeLittleHoop: SamplerDesign = {
  slug: 'sampler-new-home-little-hoop',
  kind: 'new-home',
  name: 'Little hoop new home sampler',
  description: 'A small piece with one house, the address and the year, in four threads.',
  look: 'small hoop',
  width: 92,
  height: 86,
  ink: INK.bark,
  async art() {
    const art = newArt()
    drawRect(art, 3, 3, 88, 82, FOLK.blue)
    motifAt(art, 'house', 46, 26, { A: FOLK.red, B: FOLK.gold, C: FOLK.green, D: FOLK.blue }, 2)
    drawRule(art, 22, 70, 62, FOLK.green, 1)
    return art
  },
  blocks: [
    block(region(10, 44, 72, 14), [{ template: '{home}', face: 'sampler', size: 7 }]),
    block(region(12, 66, 68, 12), [{ template: '[{dateYear}]', face: 'sampler', size: 6, tracking: 1 }]),
  ],
}

// ───────────────────────────── name and date ─────────────────────────────

const namePlainLetters: SamplerDesign = {
  slug: 'sampler-name-plain-letters',
  kind: 'name-and-date',
  name: 'Plain letters name sampler',
  description: 'A name set large in plain capitals, the date under a hairline rule, and a short line below.',
  look: 'modern minimal',
  width: 160,
  height: 108,
  ink: INK.plum,
  ink2: INK.charcoal,
  async art() {
    const art = newArt()
    drawRule(art, 56, 105, 50, ROSE.petal, 1)
    motifAt(art, 'leaf', 38, 50, { A: ROSE.leaf, B: BOTANY.moss }, 2)
    motifAt(art, 'leaf', 122, 50, { A: ROSE.leaf, B: BOTANY.moss }, 2)
    return art
  },
  blocks: [
    block(region(12, 14, 136, 28), [{ template: '{name}', face: 'modern-bold', size: 15, tracking: 0.8 }]),
    block(
      region(16, 56, 128, 40),
      [
        { template: '{date}', face: 'modern', size: 8, tracking: 0.5 },
        { template: '[{line}]', face: 'modern', size: 6.5, tracking: 0.8, upper: true },
      ],
      { ink: 'ink2', lineGap: 5 },
    ),
  ],
}

const nameScriptRule: SamplerDesign = {
  slug: 'sampler-name-script-rule',
  kind: 'name-and-date',
  name: 'Script name sampler',
  description: 'A name in flowing script over a fine blue rule, with the date and a short line in small capitals.',
  look: 'modern minimal',
  width: 176,
  height: 116,
  ink: INK.navyDeep,
  ink2: INK.slate,
  async art() {
    const art = newArt()
    drawRule(art, 44, 132, 58, COAST.sea, 1)
    motifAt(art, 'star', 26, 58, { A: COAST.sea }, 2)
    motifAt(art, 'star', 150, 58, { A: COAST.sea }, 2)
    return art
  },
  blocks: [
    block(region(14, 10, 148, 38), [{ template: '{name}', face: 'script', size: 24 }]),
    block(
      region(18, 66, 140, 40),
      [
        { template: '{date}', face: 'sampler', size: 8 },
        { template: '[{line}]', face: 'sampler', size: 7, upper: true, tracking: 0.8 },
      ],
      { ink: 'ink2', lineGap: 4 },
    ),
  ],
}

const nameTraditionalBand: SamplerDesign = {
  slug: 'sampler-name-traditional-band',
  kind: 'name-and-date',
  name: 'Traditional band name sampler',
  description: 'A full band sampler: counted borders, an alphabet row, a name, the date and a short line.',
  look: 'traditional band sampler',
  width: 160,
  height: 206,
  ink: INK.bark,
  ink2: INK.claret,
  async art() {
    const art = newArt()
    drawBorder(art, 160, 206, {
      tile: 'zigzag',
      inset: 3,
      sides: 'all',
      colourA: FOLK.red,
      colourB: FOLK.blue,
    })
    crossRow(art, 28, 132, 66, FOLK.gold)
    crossRow(art, 28, 132, 142, FOLK.gold)
    motifRow(art, { motif: 'flower', count: 4, left: 30, right: 130, top: 152, colours: { A: FOLK.red, B: FOLK.gold }, scale: 2 })
    motifRow(art, { motif: 'acorn', count: 4, left: 34, right: 126, top: 174, colours: { A: FOLK.gold, B: BOTANY.moss }, scale: 2 })
    return art
  },
  blocks: [
    block(region(22, 42, 116, 16), [
      { template: 'A B C D E F G H I J', face: 'sampler', size: 8, tracking: 0.6, wrap: false },
    ], { ink: 'ink2' }),
    block(region(20, 82, 120, 20), [{ template: '{name}', face: 'sampler', size: 14 }]),
    block(region(24, 108, 112, 26), [
      { template: '{date}', face: 'sampler', size: 7.5 },
      { template: '[{line}]', face: 'sampler', size: 7 },
    ]),
  ],
}

const nameWildflowerWreath: SamplerDesign = {
  slug: 'sampler-name-wildflower-wreath',
  kind: 'name-and-date',
  name: 'Wildflower name sampler',
  description: 'A meadow wreath round a name, with the date and a short line beneath, in muted colours.',
  look: 'floral wreath',
  width: 172,
  height: 204,
  ink: INK.forest,
  motifs: [{ id: 'meadow-wreath', variant: 4 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'meadow-wreath', 4, 86, 88, { cells: 172, colours: 44 })
    drawRule(art, 56, 116, 176, BOTANY.fern, 1)
    return art
  },
  blocks: (ctx) => [
    block(wreathHole(ctx, 88), [{ template: '{name}', face: 'sampler', size: 20 }]),
    block(region(16, 180, 140, 22), [
      { template: '{date}', face: 'sampler', size: 8 },
      { template: '[{line}]', face: 'sampler', size: 7 },
    ]),
  ],
}

const nameFolkSquare: SamplerDesign = {
  slug: 'sampler-name-folk-square',
  kind: 'name-and-date',
  name: 'Folk square name sampler',
  description: 'A counted diamond border in violet and mustard, with a name, the date and a short line.',
  look: 'folk border',
  width: 128,
  height: 140,
  ink: INK.charcoal,
  async art() {
    const art = newArt()
    drawBorder(art, 128, 140, {
      tile: 'diamond',
      inset: 3,
      sides: 'all',
      colourA: JEWEL.violet,
      colourB: JEWEL.mustard,
    })
    motifRow(art, { motif: 'star', count: 3, left: 42, right: 86, top: 106, colours: { A: JEWEL.teal }, scale: 2 })
    return art
  },
  blocks: [
    block(region(14, 42, 100, 18), [{ template: '{name}', face: 'sampler', size: 11 }]),
    block(region(14, 64, 100, 36), [
      { template: '{date}', face: 'sampler', size: 7.5 },
      { template: '[{line}]', face: 'sampler', size: 7 },
    ]),
  ],
}

const nameLittleHoop: SamplerDesign = {
  slug: 'sampler-name-little-hoop',
  kind: 'name-and-date',
  name: 'Little hoop name sampler',
  description: 'A name and a year between two rules, in three threads, small enough for a card.',
  look: 'small hoop',
  width: 108,
  height: 56,
  ink: INK.slate,
  async art() {
    const art = newArt()
    drawRule(art, 6, 101, 5, QUIET.sage, 2)
    drawRule(art, 6, 101, 48, QUIET.sage, 2)
    motifAt(art, 'leaf', 13, 27, { A: QUIET.sage, B: BOTANY.moss }, 2)
    motifAt(art, 'leaf', 95, 27, { A: QUIET.sage, B: BOTANY.moss }, 2)
    return art
  },
  blocks: [
    block(region(24, 12, 52, 30), [
      { template: '{name}', face: 'sampler', size: 7 },
      { template: '{dateYear}', face: 'sampler', size: 6, tracking: 0.8 },
    ], { lineGap: 3 }),
  ],
}

const nameCoastal: SamplerDesign = {
  slug: 'sampler-name-coastal',
  kind: 'name-and-date',
  name: 'Sailing boat name sampler',
  description: 'A little boat on blue water with two gulls, a name, the date and a short line.',
  look: 'coastal',
  width: 152,
  height: 176,
  ink: INK.navyDeep,
  motifs: [{ id: 'sail-boat', variant: 2 }],
  async art() {
    const art = newArt()
    drawBorder(art, 152, 176, {
      tile: 'scallop',
      inset: 3,
      sides: 'top-bottom',
      colourA: COAST.sea,
      colourB: COAST.sand,
    })
    await placeMotif(art, 'sail-boat', 2, 76, 58, { cells: 124, colours: 16 })
    drawRule(art, 44, 107, 100, COAST.sea, 1)
    clearSlot(art, region(20, 106, 112, 58), 3)
    return art
  },
  blocks: [
    block(region(20, 106, 112, 16), [{ template: '{name}', face: 'modern-bold', size: 11, tracking: 0.5 }]),
    block(region(22, 126, 108, 38), [
      { template: '{date}', face: 'modern', size: 7, tracking: 0.5 },
      { template: '[{line}]', face: 'modern', size: 6.5, tracking: 0.5 },
    ]),
  ],
}

// ───────────────────────────── anniversary ─────────────────────────────

const anniversaryRoseWreath: SamplerDesign = {
  slug: 'sampler-anniversary-rose-wreath',
  kind: 'anniversary',
  name: 'Rose wreath anniversary sampler',
  description: 'A ring of roses round two names, with the years and the date they married beneath.',
  look: 'floral wreath',
  width: 190,
  height: 240,
  ink: INK.claret,
  motifs: [{ id: 'rose-wreath', variant: 4 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'rose-wreath', 4, 95, 92, { cells: 190, colours: 42 })
    // The ring on this one closes over a small centre, so it carries a heart
    // rather than a name squeezed down to nothing, and the words go beneath.
    motifAt(art, 'heart', 95, 92, { A: JEWEL.crimson }, 3)
    drawRule(art, 56, 134, 186, ROSE.leaf, 1)
    return art
  },
  blocks: [
    block(region(16, 188, 158, 18), [{ template: '{nameOne} and {nameTwo}', face: 'hand', size: 13 }]),
    block(region(18, 210, 154, 22), [
      { template: '[{years}]', face: 'sampler', size: 9 },
      { template: '{date}', face: 'sampler', size: 8 },
    ]),
  ],
}

const anniversaryFolkGold: SamplerDesign = {
  slug: 'sampler-anniversary-folk-gold',
  kind: 'anniversary',
  name: 'Folk gold anniversary sampler',
  description: 'A counted heart border in gold and crimson, a pair of rings, two names, the years and the date.',
  look: 'folk border',
  width: 152,
  height: 152,
  ink: INK.bark,
  async art() {
    const art = newArt()
    drawBorder(art, 152, 152, {
      tile: 'heart',
      inset: 3,
      sides: 'all',
      colourA: JEWEL.crimson,
      colourB: FOLK.gold,
    })
    motifAt(art, 'rings', 76, 40, { A: FOLK.gold }, 2)
    motifRow(art, { motif: 'flower', count: 3, left: 52, right: 100, top: 114, colours: { A: JEWEL.crimson, B: FOLK.gold }, scale: 2 })
    return art
  },
  blocks: [
    block(region(14, 56, 124, 18), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 11 }]),
    block(region(14, 78, 124, 28), [
      { template: '[{years}]', face: 'sampler', size: 8 },
      { template: '{date}', face: 'sampler', size: 7 },
    ]),
  ],
}

const anniversaryPlainLetters: SamplerDesign = {
  slug: 'sampler-anniversary-plain-letters',
  kind: 'anniversary',
  name: 'Plain letters anniversary sampler',
  description: 'Two names in capitals, the number of years between two rules, and the date beneath.',
  look: 'modern minimal',
  width: 152,
  height: 124,
  ink: INK.bark,
  ink2: INK.navyDeep,
  async art() {
    const art = newArt()
    drawRule(art, 40, 111, 56, FOLK.gold, 1)
    drawRule(art, 40, 111, 90, FOLK.gold, 1)
    motifAt(art, 'heart', 22, 73, { A: JEWEL.crimson }, 2)
    motifAt(art, 'heart', 130, 73, { A: JEWEL.crimson }, 2)
    return art
  },
  blocks: [
    block(region(12, 14, 128, 32), [
      { template: '{nameOne}', face: 'modern-bold', size: 11, tracking: 1.2, upper: true },
      { template: '{nameTwo}', face: 'modern-bold', size: 11, tracking: 1.2, upper: true },
    ], { lineGap: 4 }),
    block(region(28, 60, 96, 26), [{ template: '[{years}]', face: 'modern', size: 7, tracking: 1, upper: true }]),
    block(region(18, 96, 116, 16), [{ template: '{date}', face: 'modern', size: 7, tracking: 0.5 }], { ink: 'ink2' }),
  ],
}

const anniversarySwallows: SamplerDesign = {
  slug: 'sampler-anniversary-swallows',
  kind: 'anniversary',
  name: 'Swallows anniversary sampler',
  description: 'Two swallows over a star border, with both names, the years and the date.',
  look: 'illustrated scene',
  width: 146,
  height: 154,
  ink: INK.navyDeep,
  motifs: [{ id: 'swallow-pair', variant: 3 }],
  async art() {
    const art = newArt()
    drawBorder(art, 146, 154, {
      tile: 'star',
      inset: 3,
      sides: 'top-bottom',
      colourA: COAST.sea,
      colourB: COAST.sand,
    })
    await placeMotif(art, 'swallow-pair', 3, 73, 50, { cells: 118, colours: 12 })
    clearSlot(art, region(18, 76, 110, 60), 3)
    return art
  },
  blocks: [
    block(region(18, 76, 110, 30), [{ template: '{nameOne} and {nameTwo}', face: 'hand', size: 13 }]),
    block(region(20, 110, 106, 26), [
      { template: '[{years}]', face: 'modern', size: 7, tracking: 0.5 },
      { template: '{date}', face: 'modern', size: 6.5, tracking: 0.5 },
    ]),
  ],
}

const anniversaryBotanicalBand: SamplerDesign = {
  slug: 'sampler-anniversary-botanical-band',
  kind: 'anniversary',
  name: 'Pressed flowers anniversary sampler',
  description: 'A band of pressed wildflowers over two names, the years and the date.',
  look: 'botanical band',
  width: 176,
  height: 148,
  ink: INK.plum,
  motifs: [{ id: 'botanical-band', variant: 4 }],
  async art() {
    const art = newArt()
    await placeMotif(art, 'botanical-band', 4, 88, 44, { cells: 176, colours: 38 })
    drawRule(art, 58, 118, 88, BOTANY.fern, 1)
    clearSlot(art, region(22, 94, 132, 48), 3)
    return art
  },
  blocks: [
    block(region(22, 94, 132, 16), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 11 }]),
    block(region(24, 114, 128, 28), [
      { template: '[{years}]', face: 'sampler', size: 7 },
      { template: '{date}', face: 'sampler', size: 6.5 },
    ]),
  ],
}

const anniversaryLittleHoop: SamplerDesign = {
  slug: 'sampler-anniversary-little-hoop',
  kind: 'anniversary',
  name: 'Little hoop anniversary sampler',
  description: 'A small piece: two names, a heart, and the year, in four threads.',
  look: 'small hoop',
  width: 100,
  height: 80,
  ink: INK.claret,
  async art() {
    const art = newArt()
    drawRect(art, 3, 3, 96, 76, FOLK.gold)
    motifAt(art, 'heart', 50, 18, { A: JEWEL.crimson }, 2)
    drawRule(art, 18, 81, 62, ROSE.leaf, 1)
    return art
  },
  blocks: [
    block(region(9, 34, 82, 22), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 7 }]),
    block(region(12, 66, 76, 10), [{ template: '{dateYear}', face: 'sampler', size: 6, tracking: 1 }]),
  ],
}

const anniversaryCottageGarden: SamplerDesign = {
  slug: 'sampler-anniversary-cottage-garden',
  kind: 'anniversary',
  name: 'Rose border cottage anniversary sampler',
  description: 'A cottage inside a rose vine border, with two names, the years and the date underneath.',
  look: 'illustrated scene',
  width: 156,
  height: 182,
  ink: INK.forest,
  motifs: [{ id: 'cottage', variant: 3 }],
  async art() {
    const art = newArt()
    drawBorder(art, 156, 182, {
      tile: 'vine',
      inset: 3,
      sides: 'all',
      colourA: ROSE.leaf,
      colourB: ROSE.petal,
    })
    await placeMotif(art, 'cottage', 3, 78, 68, { cells: 120, colours: 22 })
    clearSlot(art, region(20, 116, 116, 46), 3)
    return art
  },
  blocks: [
    block(region(20, 116, 116, 16), [{ template: '{nameOne} and {nameTwo}', face: 'sampler', size: 10 }]),
    block(region(22, 136, 112, 26), [
      { template: '[{years}]', face: 'sampler', size: 7 },
      { template: '{date}', face: 'sampler', size: 6.5 },
    ]),
  ],
}

// ───────────────────────────── the set ─────────────────────────────

export const SAMPLER_DESIGNS: SamplerDesign[] = [
  // birth
  birthRoseWreath,
  birthNurseryFriends,
  birthStork,
  birthMoon,
  birthFolkBand,
  birthLittleHoop,
  birthPlainLetters,
  // wedding
  weddingRingPosy,
  weddingEucalyptusArch,
  weddingSwallows,
  weddingFolkKnot,
  weddingPlainLetters,
  weddingWildflowerHoop,
  weddingLittleHoop,
  // new home
  homeCottage,
  homeFrontDoor,
  homeFolkKeys,
  homePlainLetters,
  homeBotanicalBand,
  homeLittleHoop,
  // name and date
  namePlainLetters,
  nameScriptRule,
  nameTraditionalBand,
  nameWildflowerWreath,
  nameFolkSquare,
  nameLittleHoop,
  nameCoastal,
  // anniversary
  anniversaryRoseWreath,
  anniversaryFolkGold,
  anniversaryPlainLetters,
  anniversarySwallows,
  anniversaryBotanicalBand,
  anniversaryLittleHoop,
  anniversaryCottageGarden,
]

export function designBySlug(slug: string): SamplerDesign | undefined {
  return SAMPLER_DESIGNS.find((d) => d.slug === slug)
}

/** Every motif picture the catalogue draws on, once each. */
export function motifsUsed(): Array<{ id: string; variant: number }> {
  const seen = new Map<string, { id: string; variant: number }>()
  for (const d of SAMPLER_DESIGNS) {
    for (const m of d.motifs ?? []) seen.set(`${m.id}-${m.variant}`, m)
  }
  return [...seen.values()]
}
