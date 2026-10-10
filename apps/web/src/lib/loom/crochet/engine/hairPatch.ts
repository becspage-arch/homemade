/**
 * HAIR — the loop-stitch FRINGE PATCH sewn onto an amigurumi head (§8j).
 *
 * How a maker builds it (and so how it is built here): a small separate circle,
 * worked in rounds from a magic ring exactly like the top of a head, with the
 * loop-stitch rounds worked with the INSIDE of the circle facing you, so every
 * loop stands out on the outside. The circle is then sewn to the crown of the
 * head, its worked face against the head, and the loops fall over the forehead
 * and round the face — the Highland cow's curly fringe.
 *
 * Built with the round builder (`buildRounds`, the same magic ring and +6
 * spiral the flat circle uses) with the loop stitch in its later rounds;
 * relaxed and AUDITED on its own like every crocheted part, with gravity on the
 * loose loops (pointing wherever world-down is for that spot on the head) and
 * the head itself as a one-sided surface the loops cannot pass into. It is then
 * conformed onto the settled head the way a sewn-on patch takes the shape of
 * what it is sewn to: each point keeps its distance from the patch centre along
 * the surface and its height off the head.
 */

import { buildRounds } from './shaping'
import { relax } from './relax'
import { auditProblems } from './auditChecks'
import type { BuiltContinuous } from './yarnPath'
import type { LoopShape, StitchId } from './dictionary'
import type { V3 } from '../yarnLoop'

export const HAIR_STYLE_IDS = ['none', 'fringe', 'curly-fringe'] as const
export type HairStyle = (typeof HAIR_STYLE_IDS)[number]

export const HAIR_STYLES: Array<{ id: HairStyle; label: string; blurb: string }> = [
  { id: 'none', label: 'None', blurb: 'No hair.' },
  { id: 'fringe', label: 'Loop fringe', blurb: 'A sewn-on circle of loop stitch on the crown: soft open loops over the forehead.' },
  { id: 'curly-fringe', label: 'Curly fringe', blurb: 'The same circle with every loop twisted before the stitch is closed, so it springs into a curl: the Highland cow fringe.' },
]

export interface HairPatch {
  name: string
  /** The part it is sewn to (listed before the hair is placed). */
  on: string
  /** Direction from the host's centre to the patch centre (world, need not be unit). */
  dir: { x: number; y: number; z: number }
  /** The loop stitch worked in the loop rounds. */
  stitch: Extract<StitchId, 'loopst' | 'loopcurl'>
  /** Stitches per round, from the magic ring: 6, 12, 18 … (+6 each round). */
  rounds: number[]
  /** Rounds from this index on are loop-stitch rounds (0-based; round 1 is
   *  always dc into the ring — loops need a round below to clamp in). */
  firstLoopRound: number
  /** Overrides of the dictionary loop shape for this patch. */
  loop?: Partial<LoopShape>
  colourHex: string
}

export interface PlacedHair {
  name: string
  hex: string
  /** The relaxed, conformed strand centre-line (world mm). */
  ctrl: V3[]
  built: BuiltContinuous
}

/** Gravity on the loose loops, per relax iteration, in yarn radii. */
export const HAIR_GRAVITY = 0.008

const unit = (d: { x: number; y: number; z: number }): V3 => {
  const l = Math.hypot(d.x, d.y, d.z) || 1
  return { x: d.x / l, y: d.y / l, z: d.z / l }
}
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z

/** The patch's frame on the host: u = outward at the patch centre, w = −u
 *  (the patch's worked face, +z locally, lies against the head), e1/e2 across. */
function patchFrame(dir: { x: number; y: number; z: number }): { u: V3; e1: V3; e2: V3; w: V3 } {
  const u = unit(dir)
  const w = { x: -u.x, y: -u.y, z: -u.z }
  let e1 = cross({ x: 0, y: 0, z: 1 }, u)
  if (Math.hypot(e1.x, e1.y, e1.z) < 1e-6) e1 = { x: 1, y: 0, z: 0 }
  e1 = unit(e1)
  const e2 = cross(w, e1) // right-handed (e1, e2, w): the local build frame
  return { u, e1, e2, w }
}

/** Build + relax one patch in its own frame (worked face +z, loops −z). */
export function buildHairPatch(h: HairPatch, yr: number): BuiltContinuous {
  const built = buildRounds('sc', h.rounds, yr, undefined, {
    roundStitch: (k) => (k >= h.firstLoopRound ? h.stitch : 'sc'),
    loop: h.loop,
  })
  const { e1, e2, w } = patchFrame(h.dir)
  const g = yr * HAIR_GRAVITY
  // World down in the patch frame: toward the head (+z) on a crown patch, and
  // down the face along it — so the front loops fall over the forehead.
  const down: V3 = { x: 0, y: 0, z: -1 }
  const gravity = { x: dot(down, e1) * g, y: dot(down, e2) * g, z: dot(down, w) * g }
  // The HEAD as a one-sided surface for the loose loops: the patch's worked
  // face is sewn against it, so no loop may pass beyond that face.
  const m = built.model
  let face = -Infinity
  m.nodes.forEach((n, i) => {
    if (!m.loose?.[i] && n.z > face) face = n.z
  })
  m.zBand = m.nodes.map((n, i) => (m.loose?.[i] ? { hi: face } : m.zBand?.[i] ?? null))
  relax(m, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06,
    layoutMode: 'radial',
    gravity,
    iterations: 420,
  })
  return built
}

/** The audit gate for a patch (in its own flat polar frame, before conforming). */
export function hairPatchProblems(h: HairPatch, built: BuiltContinuous, yr: number): string[] {
  return auditProblems({ built, recipe: undefined as never }, h.name, 0, yr).map((p) => `${h.name}: ${p}`)
}

/** The host bits the conforming needs: its settled bounds (an ellipsoid fit). */
export interface HairHost {
  bounds: { minx: number; maxx: number; miny: number; maxy: number; minz: number; maxz: number }
}

function ellipsoidRadius(b: HairHost['bounds'], u: V3): number {
  const ax = (b.maxx - b.minx) / 2
  const ay = (b.maxy - b.miny) / 2
  const az = (b.maxz - b.minz) / 2
  const q = (u.x / ax) ** 2 + (u.y / ay) ** 2 + (u.z / az) ** 2
  return 1 / Math.sqrt(Math.max(q, 1e-12))
}

/**
 * Conform a relaxed patch onto its host: every node keeps its distance from
 * the patch centre ALONG the head surface and its height off the worked face.
 */
export function conformHairPatch(h: HairPatch, built: BuiltContinuous, host: HairHost, yr: number): V3[] {
  const { u, e1, e2 } = patchFrame(h.dir)
  const b = host.bounds
  const C: V3 = { x: (b.minx + b.maxx) / 2, y: (b.miny + b.maxy) / 2, z: (b.minz + b.maxz) / 2 }
  const R0 = ellipsoidRadius(b, u)
  const m = built.model
  let face = -Infinity
  m.nodes.forEach((n, i) => {
    if (!m.loose?.[i] && n.z > face) face = n.z
  })
  // The worked face's centre-line rests one yarn diameter off the head's.
  const clear = yr * 1.6
  return built.strandPath.map((ni) => {
    const n = m.nodes[ni]!
    const rho = Math.hypot(n.x, n.y)
    const th = rho / R0
    const t = rho > 1e-9 ? unit({ x: e1.x * n.x + e2.x * n.y, y: e1.y * n.x + e2.y * n.y, z: e1.z * n.x + e2.z * n.y }) : e1
    const d = unit({
      x: u.x * Math.cos(th) + t.x * Math.sin(th),
      y: u.y * Math.cos(th) + t.y * Math.sin(th),
      z: u.z * Math.cos(th) + t.z * Math.sin(th),
    })
    const r = ellipsoidRadius(b, d) + clear + (face - n.z)
    return { x: C.x + d.x * r, y: C.y + d.y * r, z: C.z + d.z * r }
  })
}

/** Build, audit and place every hair patch. */
export function placeHair(
  patches: HairPatch[],
  hosts: Map<string, HairHost>,
  yr: number,
): { placed: PlacedHair[]; problems: string[] } {
  const placed: PlacedHair[] = []
  const problems: string[] = []
  for (const h of patches) {
    const host = hosts.get(h.on)
    if (!host) throw new Error(`hair '${h.name}' is sewn to unknown part '${h.on}'`)
    const built = buildHairPatch(h, yr)
    problems.push(...hairPatchProblems(h, built, yr))
    placed.push({ name: h.name, hex: h.colourHex, ctrl: conformHairPatch(h, built, host, yr), built })
  }
  return { placed, problems }
}

/** UK-terms written instructions for the patch, from the same counts. */
export function writeHairInstructions(h: HairPatch, hostLabel = 'head'): string[] {
  const lines: string[] = []
  const twisted = h.stitch === 'loopcurl'
  lines.push(
    `${h.name.charAt(0).toUpperCase() + h.name.slice(1)} (a separate circle, sewn on). ` +
      'Loop stitch (lp st): insert hook in next st, wrap the yarn from front to back round your forefinger held behind the work, ' +
      'catch the yarn behind your finger and pull it through the st (2 loops on hook), yrh and pull through both loops, then slip your finger out. ' +
      (twisted ? 'For a curly loop, twist the loop round 3 times before you finish the stitch. ' : '') +
      'The loop forms on the side facing away from you. Work every round with the same side facing you: ' +
      `that side is sewn against the ${hostLabel}, and the loops stand out on the other.`,
  )
  h.rounds.forEach((count, k) => {
    const lp = k >= h.firstLoopRound
    if (k === 0) {
      lines.push(`Round 1: ${count} dc into a magic ring. (${count})`)
      return
    }
    const per = h.rounds[k - 1]! / 6
    const body = per === 1 ? (lp ? '2 lp st in each st' : '2 dc in each st') : lp ? `*${per - 1} lp st, 2 lp st in next st* 6 times` : `*${per - 1} dc, 2 dc in next st* 6 times`
    lines.push(
      `Round ${k + 1}: ${body}. (${count})`,
    )
  })
  lines.push(
    `Fasten off, leaving a long tail. Sew the circle to the top of the ${hostLabel}, loops outward, with its edge just above the eyes, ` +
      'then fluff the loops forward with your fingers so they fall over the forehead.',
  )
  return lines
}

/**
 * The preset patch for a style: a three-round circle (6, 12, 18) with loop
 * stitch in rounds 2 and 3, sewn to the crown just above the face. `dir` is
 * where on the head (from its centre) the circle's centre goes.
 */
export function hairPatchesFor(
  style: HairStyle | undefined,
  on: string,
  colourHex: string,
  dir: { x: number; y: number; z: number },
): HairPatch[] {
  if (!style || style === 'none') return []
  const curly = style === 'curly-fringe'
  return [
    {
      name: 'fringe',
      on,
      dir,
      stitch: curly ? 'loopcurl' : 'loopst',
      rounds: [6, 12, 18],
      firstLoopRound: 1,
      // A toy's fringe is worked over one finger close to the work: shorter
      // loops than a swatch's, pulled outward toward the circle's edge.
      loop: curly ? { lengthYr: 5.5, droopDeg: -25 } : { lengthYr: 4.5, droopDeg: -25 },
      colourHex,
    },
  ]
}
