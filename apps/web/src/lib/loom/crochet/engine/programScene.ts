/**
 * Program → relaxed geometry → Blender scene — the PURE core shared by the
 * program render pipeline (scripts/loom-pattern.ts) and the render-on-publish
 * path. No Node process spawning lives here (that's the script's job); this is
 * just: compile the program, relax it with the right profile, run the numeric
 * audit gate, and shape the deterministic Blender scene JSON + a geometry hash.
 *
 * Everything downstream (the Blender base render, the fidelity-gated photoreal
 * finish, persisting the hero) composes these pure pieces, so a stored pattern
 * can render its OWN exact hero.
 */

import { compileProgram, programYarnRadiusMm, type CrochetProgram } from './program'
import { relax } from './relax'
import { auditProblems } from './auditChecks'
import { STITCHES, type StitchId } from './dictionary'
import { pliedFilaments, smooth, type V3 } from '../yarnLoop'
import type { BuiltContinuous } from './yarnPath'

const DEFAULT_COLOUR = '#c98a5e' // warm terracotta stand-in (pale wool washes white — STITCH_ENGINE §11)

/** Relax a compiled program in place, choosing the profile from its fabric frame
 *  — identical to scripts/loom-program.ts + engine/buildSwatch, kept in sync. */
export function relaxProgram(built: BuiltContinuous, yr: number): void {
  const surface = built.frame === 'surface'
  const polar = built.frame === 'polar'
  relax(built.model, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06,
    layoutMode: surface ? 'surface' : polar ? 'radial' : 'y',
    ...(surface ? { floorZ: 0 } : polar ? { floorZ: -yr * 1.3 } : {}),
    iterations: surface ? 560 : polar ? 360 : 320,
  })
}

export interface CompiledProgram {
  built: BuiltContinuous
  /** The yarn radius (mm) it was built at — the resolved yarn weight. */
  yr: number
  /** Empty = the geometry is genuinely stitched. Non-empty = the audit gate
   *  found broken interlocks; do NOT render (fix the program/construction). */
  problems: string[]
}

/** Compile → relax → audit a program. `yrOverride` wins over the program's yarn
 *  weight (for rendering the same program at fine / worsted / bulky). */
export function compileRelaxAudit(p: CrochetProgram, yrOverride?: number): CompiledProgram {
  const yr = programYarnRadiusMm(p, yrOverride)
  const built = compileProgram(p, yr)
  relaxProgram(built, yr)
  const problems = auditProblems({ built, recipe: undefined as never }, p.name, 0, yr)
  return { built, yr, problems }
}

/** Does any cell of the program use a tall / post stitch? Drives the hero camera
 *  tilt (a flat top-down shot hides post relief). */
function maxHeightFactor(p: CrochetProgram): number {
  const ids: StitchId[] = []
  if (p.form === 'grid') for (const r of p.grid ?? []) ids.push(...r.stitches)
  else if (p.stitch) ids.push(p.stitch)
  return ids.reduce((m, id) => Math.max(m, STITCHES[id]?.heightFactor ?? 1), 1)
}

/** The hero camera tilt (deg) for a program's fabric. Flat plain fabric shoots
 *  top-down; tall posts / post-texture / spheres tilt to show relief. */
export function programTiltDeg(p: CrochetProgram): number {
  if (p.form === 'sphere') return 24
  if (p.form === 'disc') return 0
  const hf = maxHeightFactor(p)
  const post = p.form === 'grid' && (p.grid ?? []).some((r) => r.stitches.some((s) => s === 'fpdc' || s === 'bpdc'))
  if (post) return 34
  if (hf >= 3) return 16 // dc / tr posts
  return 0
}

export interface BlenderScene {
  fabric: { widthMm: number; heightMm: number; hex: string }
  strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[]
  view: { bgHex: string; marginFactor: number; tiltDeg: number; resY: number; openFabric?: boolean }
}

/** Smoothing subdivisions per control segment — MUST match the smooth() call. */
const PER_SEG = 4

/**
 * Resolve a per-ROW yarn colour for a program that expresses colourwork, or null
 * for a single-colour piece (the prior behaviour). Grid patterns carry the stripe
 * key on each GridRow; shaped-flat patterns carry it in `rowColours`. A row with
 * no key (or an unpalette'd key) falls back to the base colour.
 */
function rowColourResolver(p: CrochetProgram): ((row: number) => string) | null {
  const base = p.colourHex ?? DEFAULT_COLOUR
  const pal = p.palette
  if (p.form === 'grid' && p.grid && pal && p.grid.some((r) => r.colourKey)) {
    return (row) => {
      const key = p.grid![row]?.colourKey
      return (key ? pal[key] : undefined) ?? base
    }
  }
  if (p.form === 'flat' && p.rowColours && pal && p.rowColours.some(Boolean)) {
    return (row) => {
      const key = p.rowColours![row]
      return (key ? pal[key] : undefined) ?? base
    }
  }
  return null
}

/**
 * Split one continuous plied yarn into per-colour STROKES. The strand is smoothed
 * + plied ONCE (so the twist runs unbroken across the whole piece), then each
 * ply polyline is cut into maximal same-colour runs — one Blender curve per
 * colour, exactly the multi-material path build_yarn already groups by hex. A
 * 2-sample overlap at every colour boundary means the fat tubes meet with no gap
 * (a real colour change happens at the selvedge, where these boundaries land).
 */
function colourStrokes(
  center: V3[],
  filaments: number[][][],
  radiusMm: number,
  colourAt: (centerIdx: number) => string,
): { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[] {
  const N = center.length
  const centreHex: string[] = new Array(N)
  for (let k = 0; k < N; k++) centreHex[k] = colourAt(k)

  // Runs over the shared index space, first-appearance order preserved.
  const runs: { hex: string; a: number; b: number }[] = []
  let a = 0
  for (let k = 1; k <= N; k++) {
    if (k === N || centreHex[k] !== centreHex[a]) {
      runs.push({ hex: centreHex[a]!, a, b: k - 1 })
      a = k
    }
  }

  const byHex = new Map<string, number[][][]>()
  const order: string[] = []
  for (const run of runs) {
    const lo = Math.max(0, run.a - 2)
    const hi = Math.min(N - 1, run.b + 2)
    if (!byHex.has(run.hex)) { byHex.set(run.hex, []); order.push(run.hex) }
    const bucket = byHex.get(run.hex)!
    for (const ply of filaments) bucket.push(ply.slice(lo, hi + 1))
  }
  return order.map((hex) => ({ hex, sheen: 0.85, radiusMm, filaments: byHex.get(hex)! }))
}

/**
 * Build the deterministic Blender scene for a relaxed program — the exact
 * pattern as one continuous plied yarn. Multi-colour when the program expresses
 * colourwork (per-row stripe keys): the single strand is split into per-colour
 * curves so distinct yarn colours show in one piece. `twist` gives the
 * plied-wool fibre.
 */
export function programScene(p: CrochetProgram, built: BuiltContinuous, yr: number, twist = 0.08): BlenderScene {
  const hex = p.colourHex ?? DEFAULT_COLOUR
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, PER_SEG)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, twist)

  const resolver = rowColourResolver(p)
  const nodeRow = built.nodeRow
  let strokes: BlenderScene['strokes']
  if (resolver && nodeRow) {
    // Map a smoothed-centre index → its control point → its strand node → row →
    // colour. Anchor rows (-1, the foundation) take the first worked row's colour
    // so the cast-on edge matches the bottom stripe.
    const colourAt = (centerIdx: number): string => {
      const ci = Math.min(Math.floor(centerIdx / PER_SEG), ctrl.length - 1)
      const row = nodeRow[built.strandPath[ci]!] ?? -1
      return resolver(row < 0 ? 0 : row)
    }
    strokes = colourStrokes(center, filaments, radiusMm, colourAt)
  } else {
    strokes = [{ hex, sheen: 0.85, radiusMm, filaments }]
  }
  return {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes,
    // A clean, soft off-white ground — the finished-object HERO bar (real yarn
    // colour on a clean white background). Warm near-white, not clinical pure
    // white, so it reads as a styled product shot and doesn't blow out under AgX.
    view: { bgHex: '#efece6', marginFactor: 0.12, tiltDeg: programTiltDeg(p), resY: 1200 },
  }
}

/**
 * A cheap, stable hash of the SETTLED geometry (node positions, quantised to
 * 0.01 mm) — the render cache key. If a re-publish compiles + relaxes to the
 * same hash, the persisted hero is still exact and re-rendering can be skipped.
 * Deterministic (relaxation is Gauss-Seidel with no randomness), so the same
 * program at the same weight always hashes the same.
 */
export function geometryHash(built: BuiltContinuous): string {
  let h = 2166136261 >>> 0 // FNV-1a
  const mix = (v: number): void => {
    const q = Math.round(v * 100) | 0
    h ^= q & 0xff
    h = Math.imul(h, 16777619) >>> 0
    h ^= (q >>> 8) & 0xff
    h = Math.imul(h, 16777619) >>> 0
    h ^= (q >>> 16) & 0xff
    h = Math.imul(h, 16777619) >>> 0
  }
  for (const n of built.model.nodes) {
    mix(n.x)
    mix(n.y)
    mix(n.z)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
