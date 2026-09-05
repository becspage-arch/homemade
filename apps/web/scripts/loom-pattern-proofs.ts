/**
 * Flat crochet PROOF PATTERNS — real, complete flat patterns expressed as loom
 * programs, spanning a complexity range (feedback_pattern_complexity_range),
 * every stitch one of the twelve LOCKED stitches so they render at bar today.
 *
 * These are Homemade-original designs (not transcriptions of any external
 * pattern) — simple textured pieces whose whole point is to prove the program →
 * geometry → chart → self-heroing pipeline end-to-end. Run them through
 * scripts/loom-pattern.ts.
 */

import type { CrochetProgram, GridRow } from '../src/lib/loom/crochet/engine/program'
import type { StitchId } from '../src/lib/loom/crochet/engine/dictionary'

const row = (stitches: StitchId[]): GridRow => ({ stitches })
const fill = (n: number, id: StitchId): StitchId[] => Array(n).fill(id) as StitchId[]

// ── A · SIMPLE — Two-Stitch Stripe Dishcloth ──────────────────────────────────
// A plain square worked in alternating bands of double crochet (US sc) and half
// treble (US hdc): the simplest "mixed stitch types" case — the stitch changes
// row to row, so the fabric reads as subtle horizontal ridges. Locked sc + hdc.
// It also carries two-row CONTRAST colour stripes (the classic striped dishcloth
// look) — the test case for per-stitch colour flowing through to the render.
// SIZE CONSISTENCY (STITCH_ENGINE.md §8e-3, re-derived §8f 2026-09-05): the
// counts here are whatever it takes to settle at the declared size, so they move
// whenever a driving stitch's real gauge does. They were 53 x 50 against the
// pre-§8f sc cell (3.8 mm per stitch — about HALF a real worsted sc). With sc
// re-cut to its published gauge (5.67 mm per stitch, 5.04 mm per sc row; the
// hdc rows keep the legacy 4.72 mm until hdc has the same pass) a true 20x20cm
// dishcloth is 35 cols x 42 rows. 21 colour bands (odd count) keeps the classic
// first-and-last-band-match look while alternating evenly.
const STRIPE_W = 35
const STRIPE_ROWS = 42
function stripeDishcloth(): CrochetProgram {
  const grid: GridRow[] = []
  for (let j = 0; j < STRIPE_ROWS; j++) {
    // Two-row colour bands: change yarn at the selvedge every 2 rows.
    const colourKey = Math.floor(j / 2) % 2 === 0 ? 'coral' : 'teal'
    grid.push({ stitches: fill(STRIPE_W, j % 2 === 0 ? 'sc' : 'hdc'), colourKey })
  }
  return {
    name: 'stripe-dishcloth',
    form: 'grid',
    gridWidth: STRIPE_W,
    grid,
    yarnWeight: 'worsted',
    colourHex: '#c65b3c',
    palette: { coral: '#c65b3c', teal: '#2f7f8c' },
    gaugeText: '17.5 sts (alternating dc/htr) x 21 rows = 10 cm (UK terms) in worsted',
    finishedSizeMm: { width: 200, height: 200 },
    hookMm: 5,
    notes: 'A quick everyday dishcloth in two contrasting colours, changed every two rows. Alternating dc and htr bands add a gentle ridged texture.',
  }
}

// ── B · MEDIUM — 1×1 Post-Rib Headband ────────────────────────────────────────
// A stretchy headband in 1×1 front/back post rib: the FIRST row is plain treble
// (UK) to establish posts to wrap; every row after alternates front-post and
// back-post treble across the row → raised vertical ribs. This is the headline
// "mixed stitch types PER ROW" proof (the locked `postrib` look), packed tight
// with the rib gauge so the ribs touch.
// A LONG, THIN strip (many stitches around, few rows of band width) so that when
// the short ends seam into a loop the ribs run round the circumference and there
// is a real central hole — a headband ring, not a squat coiled disc.
const RIB_W = 52
function postRibHeadband(): CrochetProgram {
  const grid: GridRow[] = []
  grid.push(row(fill(RIB_W, 'dc'))) // establish posts to wrap
  for (let j = 1; j < 4; j++) {
    grid.push(row(Array.from({ length: RIB_W }, (_, c) => (c % 2 === 0 ? 'fpdc' : 'bpdc')) as StitchId[]))
  }
  return {
    name: 'post-rib-headband',
    form: 'grid',
    gridWidth: RIB_W,
    grid,
    gaugeYr: 1.5, // pack the fp/bp columns tight (the locked postrib value) so ribs touch
    yarnWeight: 'aran',
    colourHex: '#7c9a6d', // sage
    // SIZE CONSISTENCY (§8e-3): the declared size here is metadata-only fixed to
    // match what this geometry actually settles to at this gaugeYr/weight
    // (measured ~191x47mm) — the row/stitch counts (the geometry, hence the
    // geometryHash) are UNCHANGED; only the label was honest-checked. The prior
    // 480x90mm declaration assumed a real-world post-rib gauge this engine's mm
    // scale doesn't produce (a library-wide scale characteristic, not specific
    // to this proof — see the same gap on texture-sampler-panel /
    // flat-texture-panel / cottage-tapestry, left alone as out of scope here).
    gaugeText: '18 sts x 4 rows = 12 cm in aran (post rib, this engine\'s scale); join short ends to fit',
    finishedSizeMm: { width: 190, height: 48 },
    hookMm: 5.5,
    notes: 'Worked flat as a strip, then the short ends are seamed into a loop. The 1×1 post rib makes it stretchy and reversible.',
  }
}

// ── C · DETAILED — Texture Sampler Scarf Panel ────────────────────────────────
// A wider sampler that stacks bands of every locked flat family: dc (US sc), htr,
// tr, a back-loop-only ridge band, then a front/back post-rib band (with its own
// establishing tr row), closing back into dc. Mixed stitch types BOTH within and
// between rows across six stitch types — the detailed end of the range.
const SAMPLER_W = 16
function textureSamplerPanel(): CrochetProgram {
  const grid: GridRow[] = []
  const band = (n: number, id: StitchId) => { for (let k = 0; k < n; k++) grid.push(row(fill(SAMPLER_W, id))) }

  band(2, 'sc') // plain dc (UK) ground
  band(2, 'hdc') // half-treble band
  band(2, 'dc') // treble band (taller, more open)
  band(2, 'scblo') // back-loop-only ridge band
  grid.push(row(fill(SAMPLER_W, 'dc'))) // establish posts for the rib band
  for (let k = 0; k < 3; k++) grid.push(row(Array.from({ length: SAMPLER_W }, (_, c) => (c % 2 === 0 ? 'fpdc' : 'bpdc')) as StitchId[]))
  band(2, 'sc') // plain ground to close

  return {
    name: 'texture-sampler-panel',
    form: 'grid',
    gridWidth: SAMPLER_W,
    grid,
    // Pack the columns to 1.6yr (the tightest audit-clean value — 1.5 fails the
    // interlock gate). The panel mixes plain bands (fine at the default) with a
    // front/back POST-RIB band, and posts only touch into solid ribs when packed
    // (the locked `postrib` swatch + the headband proof use 1.5 for exactly this);
    // at the default 1.8 the post band read as an open ladder. 1.6 packs the ribs
    // (post-band max window 0.88yr -> 0.54yr) and makes the plain bands fully solid.
    gaugeYr: 1.6,
    yarnWeight: 'worsted',
    colourHex: '#b0743c', // caramel
    gaugeText: '16 sts x 14 rows = 12 cm in worsted',
    finishedSizeMm: { width: 200, height: 300 },
    hookMm: 5,
    notes: 'A stitch-sampler panel — repeat it end to end for a scarf, or use one panel as a mug rug. Bands: dc, htr, tr, a blo ridge, a post rib, then dc.',
  }
}

// ── 0 · DEAD SIMPLE — Solid Single-Crochet Coaster ────────────────────────────
// The humblest possible piece: a small solid square worked in one colour, every
// stitch a plain double crochet (UK) / single crochet (US). A few rows, no
// texture, no colour change — proves the plainest end of the range renders as a
// clean, dense, real crocheted coaster.
// SIZE CONSISTENCY (§8e-3, re-derived §8f 2026-09-05): 26 x 30 settled to
// ~98x99mm against the pre-§8f sc cell, whose stitch was 3.78mm wide — about
// half a real worsted sc. With sc re-cut to its published gauge (5.67mm per
// stitch, 5.04mm per row) a true 10x10cm coaster is 18 cols x 20 rows, which is
// also what a crocheter would actually get from the gauge line below.
const COASTER_W = 18
const COASTER_ROWS = 20
function simpleCoaster(): CrochetProgram {
  const grid: GridRow[] = []
  for (let j = 0; j < COASTER_ROWS; j++) grid.push(row(fill(COASTER_W, 'sc')))
  return {
    name: 'simple-coaster',
    form: 'grid',
    gridWidth: COASTER_W,
    grid,
    yarnWeight: 'worsted',
    colourHex: '#3f8f9c', // teal
    gaugeText: '18 dc x 20 rows = 10 cm (UK terms) in worsted',
    finishedSizeMm: { width: 100, height: 100 },
    hookMm: 5,
    notes: 'A plain solid coaster in one colour — a first project. Worked flat in rows of double crochet (UK).',
  }
}

// ── C2 · FLAT TEXTURE — Flat-Friendly Stitch-Sampler Panel ────────────────────
// A texture sampler built ONLY from stitches that read well on a FLAT panel:
// dc (US sc), htr, tr, and back-/front-loop-only ridge bands. NO post stitches —
// those read open on a flat panel at a tilt (they belong on a worn/looped form,
// which the headband covers). Every band is a locked stitch, so the whole panel
// renders at bar. Mixed stitch types BETWEEN rows across five stitch families.
const FTEX_W = 16
function flatTexturePanel(): CrochetProgram {
  const grid: GridRow[] = []
  const band = (n: number, id: StitchId) => { for (let k = 0; k < n; k++) grid.push(row(fill(FTEX_W, id))) }
  band(3, 'sc') // plain dc (UK) ground
  band(2, 'hdc') // half-treble band (third-loop ridge)
  band(2, 'dc') // treble band (taller, gentle relief)
  band(2, 'scblo') // back-loop-only ridge band (raised horizontal line)
  band(2, 'scflo') // front-loop-only ridge band
  band(2, 'hdc') // half-treble band again
  band(3, 'sc') // plain ground to close
  return {
    name: 'flat-texture-panel',
    form: 'grid',
    gridWidth: FTEX_W,
    grid,
    yarnWeight: 'worsted',
    colourHex: '#b0743c', // caramel
    gaugeText: '16 sts x 16 rows = 12 cm in worsted',
    finishedSizeMm: { width: 200, height: 260 },
    hookMm: 5,
    notes: 'A flat stitch-sampler — repeat end to end for a scarf, or use one panel as a mug rug. Bands: dc, htr, tr, a back-loop ridge, a front-loop ridge, htr, then dc.',
  }
}

// ── SHOWPIECE — Cottage Garden Tapestry Panel ─────────────────────────────────
// The stretch: a MULTI-COLOUR tapestry-crochet PICTURE. Every stitch is a plain
// sc (how tapestry crochet is worked), but the colour changes CELL BY CELL to
// draw a real scene — sky, sun, a tree, a cottage with a roof, chimney, door and
// windows, a grass strip with flowers. This is the "many colours" case: the
// palette below carries FIFTEEN distinct yarns, resolved per (row, column) by the
// engine's per-cell colour map (nodeCol). Homemade-original design.
const TAP_W = 24
const TAP_H = 24
const TAP_PALETTE: Record<string, string> = {
  sky: '#bcd6e8',
  sun: '#f4c95d',
  roof: '#b5533a',
  eave: '#8f3f2c',
  wall: '#ece0c6',
  wallsh: '#d6c39c',
  door: '#6f4a2f',
  window: '#8fb8d6',
  grass: '#6f9e4c',
  grassd: '#4f7d36',
  pink: '#e58aa8',
  purple: '#9b6fb0',
  tree: '#3f7a44',
  trunk: '#7a5230',
  chimney: '#7a4a3a',
}
/** Paint the cottage-scene motif as motif[y][x], y=0 at the TOP. Later fills win. */
function cottageMotif(): string[][] {
  const W = TAP_W, H = TAP_H
  const m: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('sky'))
  const set = (x: number, y: number, key: string) => { if (x >= 0 && x < W && y >= 0 && y < H) m[y]![x] = key }
  const grassTop = 17
  // Grass strip (bottom), with a darker scattered texture.
  for (let y = grassTop; y < H; y++) for (let x = 0; x < W; x++) set(x, y, (x + y) % 3 === 0 ? 'grassd' : 'grass')
  // Sun, top-right (filled disc).
  const sunX = 19, sunY = 3, sunR = 2.6
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.hypot(x - sunX, y - sunY) <= sunR) set(x, y, 'sun')
  // Tree: a round foliage blob + a short trunk, on the left, rooted in the grass.
  const tX = 4, tY = 8, tR = 3.4
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.hypot(x - tX, y - tY) <= tR) set(x, y, 'tree')
  for (let y = 11; y < grassTop + 1; y++) { set(tX, y, 'trunk'); set(tX + 1, y, 'trunk') }
  // Cottage. Walls: a rectangle. Roof: a triangle over it. Then window/door/chimney.
  const wallL = 10, wallR = 18, wallTop = 10, wallBot = grassTop - 1 // 10..16
  for (let y = wallTop; y <= wallBot; y++) for (let x = wallL; x <= wallR; x++) set(x, y, 'wall')
  // Roof: rows 6..9, widening downward from the apex to just past the walls.
  const roofBot = wallTop - 1 // 9
  const roofTop = 6
  const apexX = (wallL + wallR) / 2
  for (let y = roofTop; y <= roofBot; y++) {
    const half = 1 + (y - roofTop) * ((wallR - wallL) / 2 + 1) / (roofBot - roofTop)
    for (let x = 0; x < W; x++) if (Math.abs(x - apexX) <= half) set(x, y, y === roofBot ? 'eave' : 'roof')
  }
  // Chimney on the right slope.
  for (let y = 4; y <= 7; y++) { set(16, y, 'chimney'); set(17, y, 'chimney') }
  // Windows (two) with a shadow sill, and a door.
  for (const wx of [11, 15]) for (let y = 11; y <= 12; y++) for (let x = wx; x <= wx + 1; x++) set(x, y, 'window')
  for (let y = 13; y <= wallBot; y++) for (let x = 13; x <= 14; x++) set(x, y, 'door')
  // A row of wall-shadow just under the eave for depth.
  for (let x = wallL; x <= wallR; x++) if (m[wallTop]![x] === 'wall') set(x, wallTop, 'wallsh')
  // Flowers dotted in the grass (pink/purple heads with a sun-yellow centre feel).
  const flowers: [number, number, string][] = [
    [2, 20, 'pink'], [7, 21, 'purple'], [9, 19, 'pink'], [12, 22, 'purple'],
    [20, 20, 'pink'], [22, 21, 'purple'], [16, 21, 'pink'],
  ]
  for (const [x, y, key] of flowers) { set(x, y, key); set(x, y - 1, 'sun') }
  return m
}
function cottageTapestry(): CrochetProgram {
  const motif = cottageMotif()
  const grid: GridRow[] = []
  // The render places program row 0 at the TOP of the image (the stripe-dishcloth
  // convention), so program row j maps straight to motif y=j — the scene reads
  // upright (sky + sun on top, grass + flowers along the bottom).
  for (let j = 0; j < TAP_H; j++) {
    grid.push({ stitches: fill(TAP_W, 'sc'), cellColours: motif[j]!.slice() })
  }
  return {
    name: 'cottage-tapestry',
    form: 'grid',
    gridWidth: TAP_W,
    grid,
    yarnWeight: 'worsted',
    colourHex: '#bcd6e8',
    palette: TAP_PALETTE,
    gaugeText: '24 dc x 24 rows = 17 cm in worsted (tapestry crochet, carry unused colours)',
    finishedSizeMm: { width: 170, height: 170 },
    hookMm: 4,
    notes: 'A tapestry-crochet picture panel — a cottage garden scene. Worked flat in single crochet, changing colour stitch by stitch and carrying the unused yarns inside the stitches. A wall hanging or cushion front.',
  }
}

export const PATTERN_PROOFS: Record<string, CrochetProgram> = {
  'simple-coaster': simpleCoaster(),
  'stripe-dishcloth': stripeDishcloth(),
  'texture-sampler-panel': textureSamplerPanel(),
  'flat-texture-panel': flatTexturePanel(),
  'post-rib-headband': postRibHeadband(),
  'cottage-tapestry': cottageTapestry(),
}
