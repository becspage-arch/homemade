/**
 * The original DESIGNS — each a subject-led, grounded, original composition built
 * from the motif library and run through the identical method (METHOD.md). A
 * Design is pure data + a build() that returns placed elements in a 0..100 design
 * space; composeDesign fits it into the hoop. Add a design here; the driver and
 * the (future) bulk seeder iterate the registry.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import { shadedFill, dmcRamp } from '../engine/author'
import { type Placement, type Pt, quad, cubic, leaf as leafShape } from './geometry'
import { satin, line } from './elements'
import { composePattern } from './compose'
import type { NeedleworkSurfacePattern } from '../pattern'
import { TOADSTOOL_HOLLOW as B, WOODLAND_FOX_PALETTE as FX, GARDEN_BUNNY_PALETTE as BU, NIGHT_PALETTE as NT, SUNFLOWER_PALETTE as SF } from './palette'
import {
  toadstool, fern, leafyBranch, grassTuft, berrySprig, autumnLeaf, forgetMeNot, daisy, bud, lavender,
} from './library'
import { fox, bee, bunny } from './animals'
import { crescentMoon, mushroomCottage, sunflower, tree, sun, bird, jug } from './scenes'

export interface Design {
  slug: string
  name: string
  description: string
  /** false keeps warm subjects vivid (fox/sunflower); true tames reds/pinks. */
  tameWarm: boolean
  widthMm: number
  fabricHex: string
  build: () => StitchedElement[]
}

/** Place a motif at (x,y) in the 0..100 design space. */
export function at(x: number, y: number, scale: number, rotDeg = 0, mirror = false): Placement {
  return { centre: [x, y], scale, rotDeg, mirror }
}

const LEAF_COLOURS = ['#c9711f', '#d99a2a', '#a83b22', '#b9852a', '#9c5a1e']

/** A low shaded green knoll with an undulating grassy top — the forest/garden
 *  floor; grass tufts + linen carry it to the hoop (never a discrete oval). */
export function groundKnoll(green: [string, string, string] = B.moundRamp): StitchedElement[] {
  const back = dmcRamp(green[0], green[1], 3)
  const front = dmcRamp(green[0], green[2], 4)
  const knoll = (y0: number, amp: number, half: number): Pt[] => [
    ...quad([50 - half, y0 + 2], [50 - half * 0.5, y0 - amp], [50, y0 - amp * 0.4], 10),
    ...quad([50, y0 - amp * 0.4], [50 + half * 0.5, y0 - amp], [50 + half, y0 + 2], 10),
    ...quad([50 + half, y0 + 2], [50 + half * 0.5, y0 + amp + 6], [50, y0 + amp + 7], 10),
    ...quad([50, y0 + amp + 7], [50 - half * 0.5, y0 + amp + 6], [50 - half, y0 + 2], 10),
  ]
  return [
    shadedFill(knoll(67, 4, 42), back, { shadeFrom: [50, 80] }),
    shadedFill(knoll(66, 3.5, 33), front, { shadeFrom: [50, 78] }),
  ]
}

const push = (els: StitchedElement[]) => (xs: StitchedElement[]): void => {
  for (const e of xs) els.push(e)
}

/** A bare stem/stalk in DESIGN coordinates (0..100) — for joining blooms to a jug
 *  etc. without nesting a motif placement. */
function stalk(pts: Pt[], hex = '#4f6a28'): StitchedElement {
  return { stitchType: 'embroidery-stem', colourHex: hex, thread: { type: 'stranded-cotton', weight: '6-strand' }, directionDeg: null, geometry: { kind: 'path', points: pts } }
}

/** A dashed flight path (short straight dashes along an S-curve). */
function flightPath(pl: Placement): StitchedElement[] {
  const curve = cubic([-0.85, 0.5], [-0.3, -0.7], [0.3, 0.6], [0.85, -0.5], 28)
  const out: StitchedElement[] = []
  for (let i = 0; i + 1 < curve.length; i += 2) out.push(line([curve[i]!, curve[i + 1]!], pl, '#9a8f7e', 'embroidery-straight'))
  return out
}

/** A full-width rolling hill with a curved top (a horizon band); sides/bottom run
 *  past the design so the hoop crops them. */
function hill(y0: number, ramp: string[], shadeY: number): StitchedElement {
  const poly: Pt[] = [
    [-6, y0 + 3],
    ...quad([-6, y0 + 3], [24, y0 - 5], [50, y0 - 1.5], 10),
    ...quad([50, y0 - 1.5], [76, y0 - 5.5], [106, y0 + 3], 10),
    [106, 112],
    [-6, 112],
  ]
  return shadedFill(poly, ramp, { shadeFrom: [50, shadeY] })
}

/** A winding path widening from a door down to the foreground. */
function pathway(): StitchedElement {
  const poly: Pt[] = [
    [47, 60], [53, 60],
    ...quad([53, 60], [60, 76], [66, 95], 8),
    [38, 95],
    ...quad([38, 95], [40, 76], [47, 60], 8),
  ]
  return shadedFill(poly, dmcRamp('#cbb487', '#e3d3ad', 3), { shadeFrom: [50, 95] })
}

/** A flat surface band the still-life sits on (a tabletop). */
function tabletop(y0: number): StitchedElement {
  return shadedFill([[-6, y0], [106, y0], [106, 112], [-6, 112]], dmcRamp('#b89b6e', '#d4bd92', 3), { shadeFrom: [50, 110] })
}

// ── 1. Foxglen — a cute woodland fox (SIGNED OFF) ───────────────────────────
function buildFoxglen(): StitchedElement[] {
  const els: StitchedElement[] = []
  const add = push(els)
  add(leafyBranch(at(14, 67, 8.5, 0), B, { h: 2.9, leaves: 8, curl: 0.42 }))
  add(leafyBranch(at(86, 67, 8.5, 0, true), B, { h: 2.9, leaves: 8, curl: 0.42 }))
  add(leafyBranch(at(22, 66, 6.5, 0), B, { h: 2.3, leaves: 6, curl: 0.3 }))
  add(leafyBranch(at(78, 66, 6.5, 0, true), B, { h: 2.3, leaves: 6, curl: 0.3 }))
  add(fern(at(9, 67, 7, 30), B, { lean: -0.5, h: 2.4 }))
  add(fern(at(91, 67, 7, -30, true), B, { lean: -0.5, h: 2.4 }))
  add(groundKnoll())
  add(toadstool(at(17, 60, 8.5), B, { capW: 1.0, stemLen: 1.05 }))
  add(toadstool(at(9, 64, 5), B, { capW: 0.92, stemLen: 0.95 }))
  add(toadstool(at(26, 64, 4.6), B, { capW: 0.9, stemLen: 0.9 }))
  add(toadstool(at(83, 59, 9), B, { capW: 1.0, stemLen: 1.05 }))
  add(toadstool(at(91, 64, 4.8), B, { capW: 0.92, stemLen: 0.95 }))
  add(toadstool(at(74, 64, 4.4), B, { capW: 0.9, stemLen: 0.9 }))
  add(fox(at(50, 46, 15.5), FX))
  add(daisy(at(13, 62, 3.6), B, { petals: 12, r: 1 }))
  add(daisy(at(87, 62, 3.6, 0, true), B, { petals: 12, r: 1 }))
  add(berrySprig(at(24, 62, 3.4), B, { h: 1.4 }))
  add(berrySprig(at(76, 62, 3.4, 0, true), B, { h: 1.4 }))
  add(forgetMeNot(at(30, 65, 3), B, { r: 0.55 }))
  add(forgetMeNot(at(70, 65, 3), B, { r: 0.55 }))
  add(bud(at(20, 66, 2.8, 16), B, { colour: B.buttercup }))
  add(bud(at(80, 66, 2.8, -16), B, { colour: B.bud }))
  const leaves: Array<[number, number, number, number]> = [[12, 67, 3.2, 54], [88, 67, 3.2, -54], [33, 68, 2.8, 30], [67, 68, 2.8, -30]]
  for (const [x, y, s, r] of leaves) add(autumnLeaf(at(x, y, s, r), LEAF_COLOURS[(x + y) % LEAF_COLOURS.length]!))
  for (let i = 0; i < 12; i++) {
    const x = 12 + i * 6.6
    if (x > 36 && x < 64) continue
    add(grassTuft(at(x, 67.8 + (i % 2) * 0.8, 2.4 + (i % 2)), B, { blades: 5, h: 0.66 }))
  }
  add(grassTuft(at(45, 67.8, 2), B, { blades: 4, h: 0.46 }))
  add(grassTuft(at(55, 67.8, 2), B, { blades: 4, h: 0.46 }))
  add(forgetMeNot(at(40, 68.5, 2.6), B, { r: 0.5 }))
  add(forgetMeNot(at(60, 68.5, 2.6), B, { r: 0.5 }))
  return els
}

// ── 2. Little Forager — bees over a scatter of wildflower sprigs (airy, open) ──
function buildBee(): StitchedElement[] {
  const els: StitchedElement[] = []
  const add = push(els)
  // wildflower SPRIGS rising from the lower edge (each carries its own stem, so
  // they're anchored, not floating) at varied heights — no ground band
  add(lavender(at(30, 68, 6.6), B, { h: 2.5, lean: -0.12 }))
  add(lavender(at(63, 68, 5.8), B, { h: 2.1, lean: 0.14 }))
  add(berrySprig(at(40, 68, 5), B, { h: 1.8 }))
  add(bud(at(52, 68, 4.8, 5), B, { colour: B.buttercup }))
  add(bud(at(71, 68, 4.4, -8), B, { colour: B.bud }))
  add(daisy(at(34, 60, 4.4), B, { petals: 12, r: 1 }))
  add(daisy(at(66, 62, 3.9), B, { petals: 12, r: 1 }))
  add(forgetMeNot(at(46, 63, 3.2), B, { r: 0.6 }))
  add(forgetMeNot(at(58, 64, 3, 0, true), B, { r: 0.6 }))
  // two bees looping over the flowers, joined by a dashed flight path
  add(flightPath(at(50, 38, 30)))
  add(bee(at(36, 32, 11)))
  add(bee(at(67, 45, 8.5)))
  return els
}

// ── 3. Garden Bunny — a single bold character on clean linen ────────────────
function buildBunny(): StitchedElement[] {
  const els: StitchedElement[] = []
  const add = push(els)
  const greenB = { ...B, moss: BU.leafDark, sage: BU.leafMid, fern: BU.leafLight }
  // the bunny large and central — a clean "portrait", not a busy scene; its feet
  // sit ON the grass baseline below (not floating above it)
  add(bunny(at(50, 43, 17.5)))
  // a low grass baseline at the feet (grounds the bunny; no mound)
  for (let i = 0; i < 13; i++) {
    const x = 14 + i * 6
    add(grassTuft(at(x, 67 + (i % 2) * 0.5, 2.4 + (i % 2)), greenB, { blades: 5, h: 0.62 }))
  }
  // two carrots lying on the grass + a couple of little flowers
  add(carrot(at(27, 65.5, 5.4, 72)))
  add(carrot(at(73, 65.5, 5, -72)))
  add(daisy(at(38, 66, 3), B, { petals: 11, r: 1 }))
  add(forgetMeNot(at(62, 67, 2.8, 0, true), B, { r: 0.55 }))
  return els
}

// carrot motif lives with the bunny scene (simple object)
function carrot(pl: Placement, n = 3): StitchedElement[] {
  const out: StitchedElement[] = []
  // orange root (a downward triangle) + green leafy top
  out.push(satin([[-0.32, 0], [0.32, 0], [0.06, 1.5], [-0.06, 1.5]], pl, BU.carrot))
  for (let i = 0; i < 3; i++) out.push(line([[(-0.2 + i * 0.2), 0.25], [(-0.16 + i * 0.2), 0.95]], pl, BU.carrotDark, 'embroidery-back'))
  for (let i = 0; i < n; i++) {
    const a = -0.5 + (i / (n - 1)) * 1.0
    out.push(satin(leafShape([0, -0.04], [Math.sin(a) * 0.7, -0.9 - 0.2 * (1 - Math.abs(a))], 0.12), pl, BU.leafMid))
  }
  return out
}

// ── 4. Moonlit — a sleepy crescent moon + stars (celestial) ─────────────────
function buildMoon(): StitchedElement[] {
  const els: StitchedElement[] = []
  const add = push(els)
  add(crescentMoon(at(50, 46, 20)))
  // scattered stars + tiny sparkles framing it (rooted to nothing is fine here —
  // a night sky; they're a deliberate constellation, evenly composed, not floating filler)
  const stars: Array<[number, number, number]> = [
    [22, 28, 3.4], [78, 30, 3.0], [30, 60, 2.6], [70, 62, 2.8], [18, 48, 2.2],
    [82, 50, 2.4], [38, 22, 2.2], [62, 20, 2.4], [50, 72, 2.6], [26, 72, 2.0], [74, 74, 2.0],
  ]
  for (const [x, y, s] of stars) add(star(at(x, y, s)))
  for (const [x, y] of [[44, 34], [58, 66], [34, 44], [66, 40], [50, 18]] as Array<[number, number]>) {
    add([{ stitchType: 'embroidery-french-knot', colourHex: NT.star, thread: null, directionDeg: null, geometry: { kind: 'point', at: at(x, y, 1).centre } }])
  }
  return els
}

function star(pl: Placement): StitchedElement[] {
  // a five-point star (satin), pale gold
  const pts: Pt[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 1 : 0.42
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  return [satin(pts, pl, NT.star)]
}

// ── 5. Toadstool Cottage — a little landscape with a horizon ────────────────
function buildCottage(): StitchedElement[] {
  const els: StitchedElement[] = []
  const add = push(els)
  // sky: a sun + a couple of distant birds (on the open-linen "sky")
  add(sun(at(80, 19, 6)))
  add(bird(at(26, 22, 4)))
  add(bird(at(38, 26, 3.2)))
  // rolling hills — a back hill (lighter, the horizon) + a front hill
  add([hill(50, dmcRamp('#7d9a52', '#9bb46c', 3), 72)])
  add([hill(62, dmcRamp('#43611f', '#6b8a36', 4), 86)])
  // a winding path up to the door
  add([pathway()])
  // trees framing the scene on the hills
  add(tree(at(19, 49, 7)))
  add(tree(at(83, 51, 6)))
  // the cottage sitting on the front hill
  add(mushroomCottage(at(50, 44, 14)))
  // a scatter of little flowers on the hill
  add(daisy(at(30, 60, 2.8), B, { petals: 11, r: 1 }))
  add(daisy(at(72, 61, 2.6), B, { petals: 11, r: 1 }))
  add(forgetMeNot(at(38, 63, 2.6), B, { r: 0.55 }))
  add(forgetMeNot(at(64, 63, 2.6), B, { r: 0.55 }))
  add(toadstool(at(24, 60, 3.6), B, { capW: 0.9, stemLen: 0.9 }))
  return els
}

// ── 6. Sunny — sunflowers in a jug (still-life) ─────────────────────────────
function buildSunflower(): StitchedElement[] {
  const els: StitchedElement[] = []
  const add = push(els)
  // the tabletop the jug sits on, then the jug
  add([tabletop(78)])
  // stems rising from the jug mouth to each bloom (drawn before the blooms)
  add([stalk([[50, 53], [49, 45], [50, 38]], SF.leafDark)])
  add([stalk([[50, 54], [44, 49], [38, 44]], SF.leafDark)])
  add([stalk([[50, 54], [56, 49], [62, 44]], SF.leafDark)])
  // a couple of leaves on the stems
  add([{ stitchType: 'embroidery-satin', colourHex: SF.leafMid, thread: null, directionDeg: null, geometry: { kind: 'path', points: leafShape([46, 50], [36, 52], 2.4) } }])
  add([{ stitchType: 'embroidery-satin', colourHex: SF.leafMid, thread: null, directionDeg: null, geometry: { kind: 'path', points: leafShape([56, 50], [66, 52], 2.4) } }])
  add(jug(at(50, 64, 15)))
  // three sunflower blooms — the central one smiles, the side ones plain
  add(sunflower(at(38, 43, 6.4, 0, false), { headOnly: true, face: false }))
  add(sunflower(at(62, 43, 6.4, 0, true), { headOnly: true, face: false }))
  add(sunflower(at(50, 34, 8.2), { headOnly: true, face: true }))
  return els
}

export const DESIGNS: Design[] = [
  { slug: 'foxglen', name: 'Foxglen', tameWarm: false, widthMm: 200, fabricHex: B.linen, build: buildFoxglen,
    description: 'A little fox sitting on the woodland floor among spotted toadstools, ferns, fallen leaves and wildflowers.' },
  { slug: 'bee', name: 'Little Forager', tameWarm: true, widthMm: 190, fabricHex: B.linen, build: buildBee,
    description: 'A plump honeybee in flight among daisies and forget-me-nots on a summer afternoon.' },
  { slug: 'bunny', name: 'Garden Bunny', tameWarm: true, widthMm: 195, fabricHex: B.linen, build: buildBunny,
    description: 'A soft little rabbit sitting in the vegetable patch among carrots, daisies and grass.' },
  { slug: 'moon', name: 'Goodnight Moon', tameWarm: true, widthMm: 185, fabricHex: NT.linen, build: buildMoon,
    description: 'A sleepy crescent moon among a scatter of golden stars on a deep night sky.' },
  { slug: 'cottage', name: 'Toadstool Cottage', tameWarm: true, widthMm: 195, fabricHex: B.linen, build: buildCottage,
    description: 'A little fairy cottage built into a red toadstool, tucked into a flowery woodland clearing.' },
  { slug: 'sunflower', name: 'Sunny', tameWarm: false, widthMm: 190, fabricHex: B.linen, build: buildSunflower,
    description: 'A tall, cheerful sunflower with a smiling face rising from a grassy border.' },
]

export function composeDesign(d: Design): NeedleworkSurfacePattern {
  return composePattern(d.build(), {
    targetWidthMm: d.widthMm,
    fabricSpec: { material: 'linen', colourHex: d.fabricHex, count: 28 },
    defaultThread: { type: 'stranded-cotton', weight: '6-strand' },
    frameType: 'HOOP',
  })
}
