/**
 * The motif-element library — the unit of beauty. Each motif is an ORIGINAL
 * embroidery element (a toadstool, a daisy, a fern, a berry sprig…) authored as
 * clean vector geometry in tidy local coordinates, then PLACED on the canvas at a
 * centre / scale / rotation. Each returns a list of bound StitchedElements
 * (geometry + controlled stitch slug + DMC-snapped colour + optional shade ramp)
 * — exactly the loom render contract. Compose several into an original design.
 *
 * Why authored vectors, not traced linework: clean shapes are beautiful by
 * construction — no squiggles, no floating fragments, no stitches stranded in the
 * whitespace (the failure modes of reverse-engineering a raster picture). The
 * semantic, creative choices (which element, where, in what palette) are the
 * design; the helpers below make each element render-perfect.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import { dmcRamp } from '../engine/author'
import { type Pt, type Placement, cap, column, ellipse, leaf, arc, quad, ring, placePt } from './geometry'
import type { MeadowPalette } from './palette'
import { satin, shaded, chainPetal, straight, line, knot, wheel } from './elements'

// ── the motifs ──────────────────────────────────────────────────────────────

/**
 * A spotted toadstool — the hero. Local origin = the centre of the cap's base
 * line; cap domes up (−y), stem drops down (+y). Cap shaded red (bright crown,
 * deep rim), cream shaded stem, ivory satin spots on top.
 */
export function toadstool(
  pl: Placement,
  P: MeadowPalette,
  opts: { stemLen?: number; capW?: number } = {},
): StitchedElement[] {
  const capW = opts.capW ?? 1
  const capH = capW * 0.66
  const stemLen = opts.stemLen ?? 1.55
  const capRamp = dmcRamp(P.capRamp[0], P.capRamp[2], 5)
  const stemRamp = dmcRamp(P.stemRamp[0], P.stemRamp[1], 4)

  const stemPoly = column([0, 0.02], [0, stemLen], capW * 0.3, capW * 0.4)
  const capPoly = cap(0, 0, capW, capH)

  const els: StitchedElement[] = [
    // stem behind the cap (rounded tube: dark left → light right)
    shaded(stemPoly, pl, stemRamp, [-capW * 0.9, stemLen * 0.5]),
    // a soft gill shadow tucked under the cap
    satin(
      [
        [-capW * 0.78, 0.02],
        [capW * 0.78, 0.02],
        [capW * 0.5, capH * 0.34],
        [-capW * 0.5, capH * 0.34],
      ],
      pl,
      P.stemRamp[0],
    ),
    // the cap (bright crown above, deep red rim below)
    shaded(capPoly, pl, capRamp, [0, capH * 0.55]),
    // a fine deep-red line along the cap's lower rim — internal definition (A)
    line(quad([capW * 0.72, 0.0], [0, capH * 0.24], [-capW * 0.72, 0.0], 10), pl, '#6e1810', 'embroidery-back'),
  ]

  // ivory spots scattered over the cap
  const spots: Array<[number, number, number]> = [
    [-0.46, -0.34, 0.17],
    [0.12, -0.5, 0.2],
    [0.52, -0.26, 0.15],
    [-0.08, -0.18, 0.13],
    [0.34, -0.06, 0.12],
    [-0.66, -0.06, 0.1],
  ]
  for (const [sx, sy, r] of spots) {
    els.push(satin(ellipse(sx * capW, sy * capH * 1.4, r * capW, r * capW * 0.78, 0, 20), pl, P.capSpot))
  }
  return els
}

/**
 * A daisy: white lazy-daisy petals radiating from a raised gold centre. Local
 * origin = flower centre, "up" = −y.
 */
export function daisy(pl: Placement, P: MeadowPalette, opts: { petals?: number; r?: number } = {}): StitchedElement[] {
  const n = opts.petals ?? 13
  const r = opts.r ?? 1
  const els: StitchedElement[] = []
  const tips = ring([0, 0], r, n, -90)
  for (const tip of tips) {
    const base: Pt = [tip[0] * 0.26, tip[1] * 0.26]
    els.push(chainPetal(base, tip, pl, P.daisyPetal))
  }
  // raised pollen button + a freckle of knots
  els.push(wheel([0, 0], r * 0.24, pl, P.daisyCentre))
  for (const k of ring([0, 0], r * 0.18, 6, 0)) els.push(knot(k, pl, P.daisyCentre))
  return els
}

/**
 * A small five-petal forget-me-not: soft satin petals round a butter-yellow knot.
 * Local origin = flower centre.
 */
export function forgetMeNot(pl: Placement, P: MeadowPalette, opts: { r?: number } = {}): StitchedElement[] {
  const r = opts.r ?? 0.5
  const els: StitchedElement[] = []
  for (const c of ring([0, 0], r * 0.62, 5, -90)) {
    els.push(satin(ellipse(c[0], c[1], r * 0.42, r * 0.34, (Math.atan2(c[1], c[0]) * 180) / Math.PI, 18), pl, P.bluePetal))
  }
  els.push(knot([0, 0], pl, P.blueCentre))
  return els
}

/** A cluster of forget-me-nots (3–5 little blooms) around a point. */
export function forgetMeNotCluster(pl: Placement, P: MeadowPalette): StitchedElement[] {
  const spots: Array<[number, number, number]> = [
    [0, 0, 0.55],
    [0.62, 0.18, 0.42],
    [-0.5, 0.28, 0.4],
    [0.2, 0.7, 0.36],
  ]
  const out: StitchedElement[] = []
  for (const [dx, dy, r] of spots) {
    out.push(...forgetMeNot({ ...pl, centre: placePt([dx, dy], pl) }, P, { r }))
  }
  return out
}

/**
 * A dusky-pink woven rose with a couple of leaves. Local origin = rose centre.
 */
export function rose(pl: Placement, P: MeadowPalette, opts: { r?: number } = {}): StitchedElement[] {
  const r = opts.r ?? 0.7
  const els: StitchedElement[] = [
    chainPetal([-r * 0.6, r * 0.7], [-r * 1.5, r * 1.5], pl, P.roseLeaf),
    chainPetal([r * 0.6, r * 0.7], [r * 1.5, r * 1.4], pl, P.roseLeaf),
    wheel([0, 0], r, pl, P.rose),
  ]
  return els
}

/**
 * A lavender sprig: a curving stem with a column of French knots, deepening from
 * light tip to deeper base. Local origin = stem foot; sprig rises (−y).
 */
export function lavender(pl: Placement, P: MeadowPalette, opts: { h?: number; lean?: number } = {}): StitchedElement[] {
  const h = opts.h ?? 2
  const lean = opts.lean ?? 0.18
  const foot: Pt = [0, 0]
  const tip: Pt = [lean * h, -h]
  const stem = arc(foot, [lean * h * 0.3, -h * 0.5], tip, 14)
  const els: StitchedElement[] = [line(stem, pl, P.sage)]
  const [deep, light] = P.lavenderRamp
  const buds = 9
  for (let i = 0; i < buds; i++) {
    const t = 0.32 + (i / (buds - 1)) * 0.66
    // point along the stem arc
    const sp: Pt = [lean * h * (t * t), -h * t]
    const side = i % 2 === 0 ? 1 : -1
    const off = (1 - t) * h * 0.07 + h * 0.03
    const col = i / (buds - 1) > 0.5 ? light : deep
    els.push(knot([sp[0] + side * off, sp[1]], pl, col))
  }
  els.push(knot(tip, pl, light))
  return els
}

/**
 * A berry sprig: a short stem, a few almond leaves, and a cluster of deep-berry
 * French knots at the tip. Local origin = stem foot; rises (−y).
 */
export function berrySprig(pl: Placement, P: MeadowPalette, opts: { h?: number } = {}): StitchedElement[] {
  const h = opts.h ?? 1.4
  const foot: Pt = [0, 0]
  const tip: Pt = [0, -h]
  const els: StitchedElement[] = [line(arc(foot, [h * 0.12, -h * 0.5], tip, 12), pl, P.moss)]
  // two leaves low on the stem
  els.push(satin(leaf([0, -h * 0.32], [-h * 0.5, -h * 0.5], h * 0.12), pl, P.sage))
  els.push(satin(leaf([0, -h * 0.46], [h * 0.5, -h * 0.62], h * 0.12), pl, P.sage))
  // berry cluster at the tip
  const cl: Pt[] = [
    [0, -h],
    [-h * 0.12, -h * 0.9],
    [h * 0.13, -h * 0.92],
    [-h * 0.02, -h * 1.1],
    [h * 0.06, -h * 0.78],
  ]
  for (const c of cl) els.push(knot(c, pl, P.berry))
  return els
}

/** A fern frond worked in fern stitch, curving up from its foot. */
export function fern(pl: Placement, P: MeadowPalette, opts: { h?: number; lean?: number } = {}): StitchedElement[] {
  const h = opts.h ?? 1.8
  const lean = opts.lean ?? 0.25
  const spine = arc([0, 0], [lean * h * 0.4, -h * 0.5], [lean * h, -h], 16)
  return [line(spine, pl, P.fern, 'embroidery-fern')]
}

/**
 * A leaf spray: a short green stem with a few almond leaves — quiet filler that
 * knits the bouquet together. Local origin = foot; rises (−y).
 */
export function leafSpray(pl: Placement, P: MeadowPalette, opts: { h?: number; leaves?: number } = {}): StitchedElement[] {
  const h = opts.h ?? 1.5
  const n = opts.leaves ?? 4
  const tip: Pt = [0, -h]
  const els: StitchedElement[] = [line(arc([0, 0], [h * 0.1, -h * 0.5], tip, 12), pl, P.moss)]
  for (let i = 0; i < n; i++) {
    const t = 0.25 + (i / n) * 0.6
    const base: Pt = [0, -h * t]
    const side = i % 2 === 0 ? 1 : -1
    const lt: Pt = [side * h * 0.42, -h * t - h * 0.16]
    const greens = [P.sage, P.fern, P.moss]
    els.push(satin(leaf(base, lt, h * 0.1), pl, greens[i % greens.length]!))
  }
  return els
}

/** A bold leafy branch — a curving stem hung with substantial satin leaves in
 *  mixed greens. Reads with real mass (unlike a thin fern), for framing foliage. */
export function leafyBranch(
  pl: Placement,
  P: MeadowPalette,
  opts: { h?: number; leaves?: number; curl?: number } = {},
): StitchedElement[] {
  const h = opts.h ?? 2.4
  const n = opts.leaves ?? 6
  const curl = opts.curl ?? 0.3
  const stemPts = arc([0, 0], [curl * h * 0.35, -h * 0.5], [curl * h, -h], 18)
  const els: StitchedElement[] = [line(stemPts, pl, P.moss)]
  const greens = [P.sage, P.fern, P.moss]
  for (let i = 0; i < n; i++) {
    const t = 0.16 + (i / n) * 0.8
    const idx = Math.min(stemPts.length - 2, Math.floor(t * (stemPts.length - 1)))
    const a = stemPts[idx]!
    const b = stemPts[idx + 1]!
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const dl = Math.hypot(dx, dy) || 1
    const side = i % 2 === 0 ? 1 : -1
    const llen = h * 0.5 * (1 - t * 0.4)
    const lt: Pt = [a[0] + (side * -dy) / dl * llen + (dx / dl) * llen * 0.5, a[1] + (side * dx) / dl * llen + (dy / dl) * llen * 0.5]
    els.push(satin(leaf(a, lt, llen * 0.36), pl, greens[i % greens.length]!))
    // central vein — internal definition (A), in a darker green, never an outline
    els.push(line([a, lt], pl, '#374619', 'embroidery-back'))
  }
  return els
}

/** A grass tuft: a fan of straight-stitch blades from a base point. */
export function grassTuft(pl: Placement, P: MeadowPalette, opts: { blades?: number; h?: number } = {}): StitchedElement[] {
  const n = opts.blades ?? 5
  const h = opts.h ?? 1
  const els: StitchedElement[] = []
  const greens = [P.moss, P.sage, P.fern]
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const ang = (-0.55 + t * 1.1) // fan spread (radians from vertical)
    const tip: Pt = [Math.sin(ang) * h * 0.7, -Math.cos(ang) * h * (0.7 + 0.5 * (1 - Math.abs(t - 0.5) * 2))]
    els.push(straight([0, 0], tip, pl, greens[i % greens.length]!))
  }
  return els
}

/** A fallen autumn leaf — a satin almond leaf with a worked vein, in a warm
 *  colour. Place it (rotated) resting on the woodland floor for colour + density. */
export function autumnLeaf(pl: Placement, colour: string, opts: { len?: number } = {}): StitchedElement[] {
  const len = opts.len ?? 1
  const base: Pt = [0, 0]
  const tip: Pt = [0, -len]
  return [
    satin(leaf(base, tip, len * 0.34), pl, colour),
    line([base, [0, -len * 0.92]], pl, '#6e4420', 'embroidery-back'),
  ]
}

/** A tiny bud on a short stem — a buttercup or pink accent. */
export function bud(pl: Placement, P: MeadowPalette, opts: { h?: number; colour?: string } = {}): StitchedElement[] {
  const h = opts.h ?? 0.9
  const colour = opts.colour ?? P.buttercup
  const tip: Pt = [0, -h]
  return [
    line(arc([0, 0], [h * 0.1, -h * 0.5], tip, 10), pl, P.sage),
    satin(ellipse(0, -h, h * 0.22, h * 0.3, 0, 18), pl, colour),
    knot([0, -h - h * 0.12], pl, P.daisyCentre),
  ]
}
