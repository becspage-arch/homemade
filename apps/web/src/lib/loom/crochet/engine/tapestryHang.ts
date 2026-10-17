/**
 * HANG A TAPESTRY PANEL ON A DOWEL — the `wall` staging for a flat panel.
 *
 * A finished tapestry wall hanging is sold hanging: the top edge whipstitched
 * round a wooden dowel, a cord tied to the dowel ends, and tassels along the
 * bottom edge. The reopen proof (crochet-tapestry-proof/verdict.md, 9 Oct 2026)
 * failed partly because the panel lay flat on a white ground with no hanging
 * hardware at all. This stands the SAME stitched panel upright on the
 * renderer's `wall` stage (motifs r9) and dresses it.
 *
 * THE PANEL IS NEVER TOUCHED. Its strokes are the programScene strokes (the
 * relaxed, audited strand, cut per colour), only turned upright: a rigid
 * rotation, so every stitch and every chart colour is exactly where it was.
 * What is added is the finishing a maker does after the last row, as render
 * props outside the geometry hash:
 *   - the dowel: a straight wooden rod (the renderer's `branch` prop with
 *     `wood`), above the top edge with an overhang each side;
 *   - the whipstitch: one continuous strand wrapping the dowel and passing
 *     through the top edge every `whipEvery` stitches;
 *   - the cord: a plied yarn tied round both dowel ends, rising to a peak;
 *   - the tassels: folded bundles of cut yarn, a wrap band under the head, a
 *     loop through the bottom edge.
 * The yarn notions are real plied strands (the same `pliedFilaments` as the
 * fabric), not drawn shapes; none of them is in the chart, and none of them
 * changes it.
 *
 * Coordinates: the input strokes are engine mm (x across, y up the rows, z the
 * relief). The output is the hung scene the wall stage expects (motifScene's
 * `hang` convention): x across, y toward the camera (the relief), z up. The
 * picture keeps the orientation the flat-lay hero shows: engine -y is up.
 */

import { pliedFilaments, smooth, type V3 } from '../yarnLoop'

export interface HangOptions {
  /** Tassels along the bottom edge (default: one every ~40 mm, at least 3). 0 = none. */
  tassels?: number
  /** Yarn colours; default to the panel's top-row and bottom-row colours. */
  cordHex?: string
  whipHex?: string
  tasselHex?: string
  /** Dowel wood (light, dark grain). */
  dowelHex?: [string, string]
  /** Tassel length below its head (mm). Default 0.4 x the panel height, 40-90. */
  tasselLengthMm?: number
  /** Whipstitch through every n-th stitch (default 2). */
  whipEvery?: number
  /** Stitch pitch across (mm), for the whipstitch spacing. */
  stitchPitchMm?: number
  /** Lowest point above the sideboard (mm). */
  liftMm?: number
  twist?: number
  resY?: number
}

export interface HungStroke {
  hex: string
  sheen: number
  radiusMm: number
  filaments: number[][][]
}

export interface HungScene {
  strokes: HungStroke[]
  props: { branch: number[][]; hex: string; wood?: [string, string] }[]
  /** The panel's own size (mm) and the whole hung content's height (mm). */
  panel: { width: number; height: number }
  contentHeightMm: number
  view: Record<string, unknown>
}

/** Deterministic 0..1 noise from two numbers. */
function h01(a: number, b: number): number {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** A plied yarn stroke along a centreline (scene mm). */
function yarnStroke(center: V3[], yr: number, hex: string, twist: number): HungStroke {
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.85, 3, twist)
  return { hex, sheen: 0.85, radiusMm, filaments }
}

export function hangTapestry(
  panelStrokes: HungStroke[],
  yr: number,
  colours: { top: string; bottom: string },
  o: HangOptions = {},
): HungScene {
  const twist = o.twist ?? 0.08
  // Panel bounds in engine mm.
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const s of panelStrokes) {
    for (const f of s.filaments) {
      for (const p of f) {
        if (p[0]! < minx) minx = p[0]!
        if (p[0]! > maxx) maxx = p[0]!
        if (p[1]! < miny) miny = p[1]!
        if (p[1]! > maxy) maxy = p[1]!
        if (p[2]! < minz) minz = p[2]!
        if (p[2]! > maxz) maxz = p[2]!
      }
    }
  }
  const W = maxx - minx
  const Hp = maxy - miny
  const cx = (minx + maxx) / 2
  const cy = (miny + maxy) / 2
  const cz = (minz + maxz) / 2
  // Engine → hung scene: x across, relief toward the camera, engine -y up. A
  // rotation about x (det +1), so nothing is mirrored.
  const up = (p: number[]): number[] => [p[0]! - cx, p[2]! - cz, cy - p[1]!]
  const strokes: HungStroke[] = panelStrokes.map((s) => ({ ...s, filaments: s.filaments.map((f) => f.map(up)) }))

  const top = Hp / 2
  const bottom = -Hp / 2
  const half = W / 2
  const thick = Math.max(maxz - minz, 2 * yr)

  // ── The dowel, just above the top edge. ──
  const dowelR = Math.max(4, Math.min(9, W * 0.028))
  const overhang = Math.max(18, W * 0.12)
  const dz = top + dowelR + yr * 1.2
  const dowel: number[][] = []
  for (let k = 0; k <= 8; k++) {
    const x = -half - overhang + ((W + 2 * overhang) * k) / 8
    dowel.push([x, 0, dz, dowelR])
  }
  const props: HungScene['props'] = [
    { branch: dowel, hex: o.dowelHex?.[0] ?? '#d9bf96', wood: o.dowelHex ?? ['#d9bf96', '#b8956a'] },
  ]

  // ── The whipstitch: one strand, a turn round the dowel and through the top
  // row every `whipEvery` stitches, left to right. Each turn's cross-section is
  // a teardrop: round the dowel (radius dowelR + yr), down to a point just
  // inside the top row.
  const pitch = o.stitchPitchMm ?? 2.7 * yr
  const every = Math.max(1, Math.round(o.whipEvery ?? 2))
  const turnW = pitch * every
  const turns = Math.max(2, Math.floor((W - pitch) / turnW))
  const rho = dowelR + yr * 0.9
  const zIn = top - yr * 1.6 // through the top row, a stitch down from the edge
  const whip: V3[] = []
  const x0 = -((turns - 1) * turnW) / 2
  const STEPS = 20
  for (let t = 0; t < turns; t++) {
    for (let k = 0; k < STEPS; k++) {
      const u = k / STEPS // 0 → 1 round one turn: out the front, over the dowel, down the back
      const x = x0 + (t + u) * turnW
      let y: number
      let z: number
      if (u < 0.2) {
        const w = u / 0.2
        y = rho * w
        z = zIn + (dz - zIn) * w
      } else if (u < 0.8) {
        const b = (Math.PI * (u - 0.2)) / 0.6 // 0 = front, π/2 = over the top, π = back
        y = rho * Math.cos(b)
        z = dz + rho * Math.sin(b)
      } else {
        const w = (1 - u) / 0.2
        y = -rho * w
        z = zIn + (dz - zIn) * w
      }
      whip.push({ x, y, z })
    }
  }
  whip.push({ x: x0 + turns * turnW, y: 0, z: zIn })
  const whipHex = o.whipHex ?? colours.top
  strokes.push(yarnStroke(smooth(whip, 2), yr, whipHex, twist))

  // ── The cord: tied round each dowel end with two wraps, rising to a peak. ──
  const cordHex = o.cordHex ?? colours.top
  const tieX = half + overhang * 0.55
  const peak = dz + Math.max(40, W * 0.32)
  const wrap = (xc: number, dir: number): V3[] => {
    const pts: V3[] = []
    for (let k = 0; k <= 24; k++) {
      const b = (Math.PI * 4 * k) / 24
      pts.push({ x: xc + dir * yr * 1.1 * (k / 24), y: -(dowelR + yr * 0.8) * Math.cos(b), z: dz + (dowelR + yr * 0.8) * Math.sin(b) })
    }
    return pts
  }
  const cord: V3[] = [...wrap(-tieX - yr, 1)]
  const N = 30
  for (let k = 1; k < N; k++) {
    const t = k / N
    const x = -tieX + 2 * tieX * t
    // two straight-ish legs meeting at a hidden nail, a touch of sag in each
    const leg = t < 0.5 ? t / 0.5 : (1 - t) / 0.5
    const z = dz + dowelR + (peak - dz - dowelR) * leg - Math.sin(Math.PI * leg) * 2.5
    cord.push({ x, y: yr * 0.3, z })
  }
  cord.push(...wrap(tieX + yr, -1).reverse())
  strokes.push(yarnStroke(smooth(cord, 2), yr * 1.15, cordHex, twist))

  // ── The tassels. ──
  const nT = o.tassels ?? Math.max(3, Math.round(W / 40))
  const tasselHex = o.tasselHex ?? colours.bottom
  const L = o.tasselLengthMm ?? Math.min(90, Math.max(40, Hp * 0.4))
  const headR = yr * 2.6
  let lowest = bottom
  for (let i = 0; i < nT; i++) {
    const tx = nT === 1 ? 0 : -half + pitch * 1.5 + ((W - pitch * 3) * i) / (nT - 1)
    const neckTop = bottom - yr * 3.2 // the tassel's head hangs a little under the edge
    // The hanging loop: up through the bottom row and back down to the head.
    const loop: V3[] = []
    for (let k = 0; k <= 16; k++) {
      const b = (Math.PI * 2 * k) / 16
      loop.push({ x: tx + Math.sin(b) * yr * 0.6, y: Math.sin(b) * (thick / 2 + yr * 0.5), z: neckTop + (bottom + yr * 1.4 - neckTop) * (0.5 - 0.5 * Math.cos(b)) })
    }
    strokes.push(yarnStroke(smooth(loop, 2), yr, tasselHex, twist))
    // The bundle: strands folded over the loop, a round head, pinched at the
    // wrap, then hanging straight with a little spread and a trimmed end.
    const nS = 14
    const wrapZ = neckTop - headR * 1.6
    for (let s = 0; s < nS; s++) {
      const ang = (Math.PI * 2 * s) / nS + h01(i, s) * 0.4
      const cs = Math.cos(ang)
      const sn = Math.sin(ang)
      const spread = headR * (0.85 + 0.35 * h01(s, i + 7))
      const end = wrapZ - L * (0.96 + 0.06 * h01(i + 3, s))
      const sway = (h01(i * 3 + 1, s) - 0.5) * yr * 1.5
      const pts: V3[] = [
        { x: tx, y: 0, z: neckTop + yr * 0.4 },
        { x: tx + cs * headR * 0.7, y: sn * headR * 0.7, z: neckTop - headR * 0.35 },
        { x: tx + cs * headR, y: sn * headR, z: neckTop - headR * 0.95 },
        { x: tx + cs * headR * 0.62, y: sn * headR * 0.62, z: wrapZ },
        { x: tx + cs * spread * 0.8 + sway * 0.3, y: sn * spread * 0.8, z: wrapZ - L * 0.3 },
        { x: tx + cs * spread + sway, y: sn * spread, z: wrapZ - L * 0.7 },
        { x: tx + cs * spread * 1.08 + sway * 1.3, y: sn * spread * 1.08, z: end },
      ]
      strokes.push(yarnStroke(smooth(pts, 6), yr, tasselHex, twist))
      if (end < lowest) lowest = end
    }
    // The wrap band: four turns round the neck.
    const band: V3[] = []
    for (let k = 0; k <= 64; k++) {
      const b = (Math.PI * 8 * k) / 64
      band.push({ x: tx + Math.cos(b) * (headR * 0.62 + yr), y: Math.sin(b) * (headR * 0.62 + yr), z: wrapZ + yr * 1.6 - (yr * 3.2 * k) / 64 })
    }
    strokes.push(yarnStroke(band, yr, tasselHex, twist))
  }

  const contentTop = peak + yr * 2
  const contentH = contentTop - lowest
  const lift = o.liftMm ?? 45
  // The renderer floats the lowest yarn `lift` above the sideboard; aim at the
  // middle of the hung content.
  const aimHeightFrac = (lift + contentH / 2) / (lift + contentH)
  // Frame it: the renderer's visible field is ~0.94 x span x stageZoom, span =
  // the width plus its margins (marginFactor 0.1). Fit the taller of the
  // content height and the dowel's full width, with room.
  const span = (W + 2 * overhang) * 1.2
  const stageZoom = Math.max(1.05 * (W + 2 * overhang), 1.08 * contentH) / (0.94 * span)
  return {
    strokes,
    props,
    panel: { width: W, height: Hp },
    contentHeightMm: contentH,
    view: {
      bgHex: '#efece6',
      marginFactor: 0.1,
      tiltDeg: 86,
      resY: o.resY ?? 1200,
      openFabric: true,
      yawDeg: 0,
      aimHeightFrac,
      lightRig: 'product',
      groundScale: 40,
      stage: 'wall',
      stageTiltDeg: 86,
      stageZoom,
      liftMm: lift,
      stageHeightMm: Hp,
      stageFstop: 0.4,
    },
  }
}
