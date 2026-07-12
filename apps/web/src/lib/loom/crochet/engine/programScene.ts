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
  view: { bgHex: string; marginFactor: number; tiltDeg: number; resY: number }
}

/**
 * Build the deterministic Blender scene for a relaxed program — the exact
 * pattern as one continuous plied yarn. Single colour for now (stripe /
 * colourwork rendering is the pattern engine's next build; the program + schema
 * already carry the colour data). `twist` gives the plied-wool fibre.
 */
export function programScene(p: CrochetProgram, built: BuiltContinuous, yr: number, twist = 0.08): BlenderScene {
  const hex = p.colourHex ?? DEFAULT_COLOUR
  const nodes = built.model.nodes
  const ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
  const center = smooth(ctrl, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, twist)
  return {
    fabric: { widthMm: built.widthMm + 30, heightMm: built.heightMm + 30, hex },
    strokes: [{ hex, sheen: 0.85, radiusMm, filaments }],
    view: { bgHex: '#6f5440', marginFactor: 0.12, tiltDeg: programTiltDeg(p), resY: 1200 },
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
