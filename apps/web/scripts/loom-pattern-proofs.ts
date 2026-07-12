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
const STRIPE_W = 14
function stripeDishcloth(): CrochetProgram {
  const grid: GridRow[] = []
  for (let j = 0; j < 12; j++) {
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
    gaugeText: '14 dc x 12 rows = 10 cm (UK terms) in worsted',
    finishedSizeMm: { width: 250, height: 250 },
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
    gaugeText: '18 sts x 8 rows = 12 cm in aran; join short ends to fit',
    finishedSizeMm: { width: 480, height: 90 },
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
    yarnWeight: 'worsted',
    colourHex: '#b0743c', // caramel
    gaugeText: '16 sts x 14 rows = 12 cm in worsted',
    finishedSizeMm: { width: 200, height: 300 },
    hookMm: 5,
    notes: 'A stitch-sampler panel — repeat it end to end for a scarf, or use one panel as a mug rug. Bands: dc, htr, tr, a blo ridge, a post rib, then dc.',
  }
}

export const PATTERN_PROOFS: Record<string, CrochetProgram> = {
  'stripe-dishcloth': stripeDishcloth(),
  'post-rib-headband': postRibHeadband(),
  'texture-sampler-panel': textureSamplerPanel(),
}
