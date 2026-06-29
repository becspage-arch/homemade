/**
 * Shared element builders — the small set of functions that turn local geometry
 * into bound StitchedElements (the loom contract). Every motif (botanical or
 * animal) composes these so a shape always becomes the same kind of clean,
 * render-ready element: a satin fill, a shaded long-and-short fill, a lazy-daisy
 * loop, a worked line, a French knot, a woven wheel, a straight stitch.
 *
 * Authoring happens in tidy LOCAL coordinates; each builder takes a Placement and
 * maps the geometry onto the canvas, so motifs read cleanly and place identically.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import { shadedFill, frenchKnot } from '../engine/author'
import { type Pt, type Placement, placePt, placePts } from './geometry'
import { dmc } from '../engine/author'

export const THREAD = { type: 'stranded-cotton', weight: '6-strand' }

/** A flat satin-filled shape (petal, spot, body panel) in one DMC colour. */
export function satin(localPoly: Pt[], pl: Placement, hex: string, dirDeg?: number): StitchedElement {
  return {
    stitchType: 'embroidery-satin',
    colourHex: dmc(hex),
    thread: THREAD,
    directionDeg: dirDeg ?? null,
    geometry: { kind: 'path', points: placePts(localPoly, pl) },
  }
}

/** A shaded long-and-short (needle-painting) fill fading from `localShadeFrom`
 *  outward through `ramp` (dark→light). */
export function shaded(
  localPoly: Pt[],
  pl: Placement,
  ramp: string[],
  localShadeFrom: Pt,
): StitchedElement {
  return shadedFill(placePts(localPoly, pl), ramp, { shadeFrom: placePt(localShadeFrom, pl) })
}

/** A lazy-daisy petal/leaf loop from local `base` to local `tip`. */
export function chainPetal(localBase: Pt, localTip: Pt, pl: Placement, hex: string): StitchedElement {
  return {
    stitchType: 'embroidery-detached-chain',
    colourHex: dmc(hex),
    thread: THREAD,
    directionDeg: null,
    geometry: { kind: 'path', points: [placePt(localBase, pl), placePt(localTip, pl)] },
  }
}

/** A single straight stitch (grass blade, ray, spine) from local `a` to `b`. */
export function straight(localA: Pt, localB: Pt, pl: Placement, hex: string): StitchedElement {
  return {
    stitchType: 'embroidery-straight',
    colourHex: dmc(hex),
    thread: THREAD,
    directionDeg: null,
    geometry: { kind: 'path', points: [placePt(localA, pl), placePt(localB, pl)] },
  }
}

/** A worked line (stem stitch by default; fern/back when slug given). */
export function line(localPts: Pt[], pl: Placement, hex: string, slug?: string): StitchedElement {
  return {
    stitchType: slug ?? 'embroidery-stem',
    colourHex: dmc(hex),
    thread: THREAD,
    directionDeg: null,
    geometry: { kind: 'path', points: placePts(localPts, pl) },
  }
}

/** A French knot at a local point. */
export function knot(localAt: Pt, pl: Placement, hex: string): StitchedElement {
  return frenchKnot(placePt(localAt, pl), dmc(hex), THREAD)
}

/** A woven-wheel rose/button at a local centre with local radius. */
export function wheel(localCentre: Pt, localRadius: number, pl: Placement, hex: string): StitchedElement {
  return {
    stitchType: 'embroidery-woven-wheel',
    colourHex: dmc(hex),
    thread: THREAD,
    directionDeg: null,
    geometry: { kind: 'disc', at: placePt(localCentre, pl), radiusMm: localRadius * pl.scale },
  }
}
