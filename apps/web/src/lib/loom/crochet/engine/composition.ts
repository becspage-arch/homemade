/**
 * The COMPOSITION layer — build 2 Part B of the crochet pattern engine.
 *
 * A real amigurumi is several crocheted pieces made separately and joined: a ball
 * body, a smaller ball head, little ball/tube limbs. Each piece is genuinely
 * stitched by the LOCKED round/sphere builders (buildSphere) — this layer does
 * NOT touch that geometry. It only:
 *   1. builds + relaxes + AUDITS each part on its own (every part is real
 *      topology; a broken part fails the gate exactly like a single stitch does);
 *   2. places each relaxed part into ONE composed 3D world by a simple
 *      declarative layout (rest on the ground / stack on another part), and
 *   3. hands the composed strokes to the render as ONE staged finished object.
 *
 * Assembling already-real pieces is honest (it mirrors how amigurumi are made) —
 * no faking, no new interlock topology, no rework of the locked round builders.
 */

import { buildSphere } from './shaping'
import { relaxProgram, geometryHash } from './programScene'
import { auditProblems } from './auditChecks'
import { pliedFilaments, smooth, type V3 } from '../yarnLoop'
import { YARN_WEIGHT_RADIUS_MM, type YarnWeight } from './program'
import type { StitchId } from './dictionary'
import type { BuiltContinuous } from './yarnPath'

/** Where a part sits in the composed object. Parts are laid out in list order, so
 *  a part may only reference an EARLIER part.
 *
 *  - `ground` rests it on the table (its lowest point at z = 0), optionally offset.
 *  - `{ on: name, overlap }` STACKS it centred on top of a named part, overlapping
 *    by `overlap` mm (amigurumi body/head nestle into each other).
 *  - `{ on: name, dir }` ATTACHES it as a protruding limb: the part is rotated so
 *    its long (pole-to-pole) axis points along `dir`, then seated onto the parent's
 *    surface in that direction so it STANDS PROUD as a 3-D form (ears, arms, legs,
 *    a muzzle). Only its base pole sinks into the parent (`seat` mm); the rest of
 *    the piece stands off the body. This is how a real amigurumi limb is sewn on —
 *    at an angle, standing out — not a ball half-buried on the crown. */
export type PartPlacement =
  | { on: 'ground'; offset?: { x?: number; y?: number } }
  | { on: string; overlap?: number; offset?: { x?: number; y?: number; z?: number } }
  | {
      on: string
      /** Outward direction the limb points (world axes; need not be unit). The
       *  part's long axis (built pole-to-pole = local +z) is rotated onto it. */
      dir: { x: number; y: number; z: number }
      /** How far the base pole sinks into the parent surface (mm, default 4). A
       *  small seat = a clean join; the rest of the limb stands proud. */
      seat?: number
    }

export interface AmigurumiPart {
  name: string
  /** The working stitch (a locked stitch — sc for amigurumi). */
  stitch: StitchId
  /** Sphere pattern counts (a closed stuffed ball): 6,12,18…widest…12,6. */
  rounds: number[]
  /** This part's yarn colour (hex). */
  colourHex: string
  /** Where it goes in the composed object. */
  place: PartPlacement
  /** Uniform scale on the built geometry (default 1). Sizing normally comes from
   *  the round counts; scale is a fine trim only. */
  scale?: number
}

export interface CompositionProgram {
  name: string
  parts: AmigurumiPart[]
  /** Render yarn weight → yr. Compositions render at their program weight (the
   *  layout is computed from each part's built size, so it stays consistent). */
  yarnWeight?: YarnWeight
  /** Camera tilt (deg) for the staged hero. Defaults to a 3/4 amigurumi view. */
  tiltDeg?: number
  // Catalogue / pattern metadata (optional).
  gaugeText?: string
  finishedSizeMm?: { width: number; height: number }
  hookMm?: number
  notes?: string
}

/** Resolve the render yarn radius (mm) for a composition. */
export function compositionYarnRadiusMm(p: CompositionProgram, override?: number): number {
  if (override != null) return override
  return YARN_WEIGHT_RADIUS_MM[p.yarnWeight ?? 'worsted']
}

interface PlacedPart {
  part: AmigurumiPart
  /** The relaxed, TRANSFORMED strand centre-line control points (world mm). */
  ctrl: V3[]
  /** World bounding box after placement (for stacking + framing). */
  bounds: { minx: number; maxx: number; miny: number; maxy: number; minz: number; maxz: number }
}

export interface CompiledComposition {
  placed: PlacedPart[]
  yr: number
  /** Empty = every part is genuinely stitched. Non-empty = a part failed the
   *  audit gate (prefixed with the part name); do NOT render. */
  problems: string[]
  geometryHash: string
}

/** Rotation (as a 3×3, row-major) mapping the +z axis onto unit vector `u` —
 *  Rodrigues' formula. Used to aim a limb's long (pole-to-pole) axis along its
 *  outward attach direction so it stands proud instead of lying on the body. */
function rotZTo(u: V3): number[][] {
  const c = u.z // (0,0,1)·u
  if (c > 0.999999) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  if (c < -0.999999) return [[1, 0, 0], [0, -1, 0], [0, 0, -1]] // 180° about x
  // axis v = (0,0,1) × u = (-u.y, u.x, 0); K = [v]×; R = I + K + K²/(1+c).
  const vx = -u.y, vy = u.x // vz = 0
  const s2 = 1 / (1 + c)
  // K
  const k = [[0, 0, vy], [0, 0, -vx], [-vy, vx, 0]]
  // K²  (with vz = 0)
  const kk = [
    [-vy * vy, vx * vy, 0],
    [vx * vy, -vx * vx, 0],
    [0, 0, -(vx * vx + vy * vy)],
  ]
  const R: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) R[i]![j] = (i === j ? 1 : 0) + k[i]![j]! + kk[i]![j]! * s2
  return R
}

function applyRot(R: number[][], v: V3): V3 {
  return {
    x: R[0]![0]! * v.x + R[0]![1]! * v.y + R[0]![2]! * v.z,
    y: R[1]![0]! * v.x + R[1]![1]! * v.y + R[1]![2]! * v.z,
    z: R[2]![0]! * v.x + R[2]![1]! * v.y + R[2]![2]! * v.z,
  }
}

function bbox(pts: V3[]): PlacedPart['bounds'] {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const p of pts) {
    if (p.x < minx) minx = p.x
    if (p.x > maxx) maxx = p.x
    if (p.y < miny) miny = p.y
    if (p.y > maxy) maxy = p.y
    if (p.z < minz) minz = p.z
    if (p.z > maxz) maxz = p.z
  }
  return { minx, maxx, miny, maxy, minz, maxz }
}

/**
 * Build → relax → AUDIT → place every part into one composed world. Each part is
 * a real crocheted ball from the locked builder; placement is a pure rigid
 * transform of its settled geometry.
 */
export function compileComposition(p: CompositionProgram, yrOverride?: number): CompiledComposition {
  const yr = compositionYarnRadiusMm(p, yrOverride)
  const placed: PlacedPart[] = []
  const problems: string[] = []
  const byName = new Map<string, PlacedPart>()
  const allNodes: V3[] = []

  for (const part of p.parts) {
    // 1. Build + relax the real ball (locked geometry, untouched).
    const built: BuiltContinuous = buildSphere(part.stitch, 0, yr, part.rounds)
    relaxProgram(built, yr)
    // 2. Per-part audit gate — the part must be genuinely stitched.
    const partProblems = auditProblems({ built, recipe: undefined as never }, part.name, 0, yr)
    for (const pr of partProblems) problems.push(`${part.name}: ${pr}`)

    // 3. Local geometry + its centre (the ball's own centroid = bbox centre).
    const nodes = built.model.nodes
    const local: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))
    const lb = bbox(local)
    const cx = (lb.minx + lb.maxx) / 2
    const cy = (lb.miny + lb.maxy) / 2
    const cz = (lb.minz + lb.maxz) / 2
    const scale = part.scale ?? 1
    const halfH = ((lb.maxz - lb.minz) / 2) * scale
    const c: V3 = { x: cx, y: cy, z: cz }

    // 4. Placement → a rigid transform  world = T + scale · R · (local − centre).
    //    R is identity for ground/overlap; a real rotation for a protruding limb.
    let R: number[][] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    let T: V3 = { x: 0, y: 0, z: 0 }
    if (part.place.on === 'ground') {
      T = { x: part.place.offset?.x ?? 0, y: part.place.offset?.y ?? 0, z: halfH } // lowest point at z = 0
    } else if ('dir' in part.place) {
      // Protruding limb: aim the part's long axis (local +z) along `dir`, seat its
      // base pole (local min-z) just into the parent surface, and let the rest
      // stand proud. (Both poles carry a small worked-ring hole; pointing the
      // magic-ring pole outward and leaning the limb slightly back keeps the hole
      // reading as a neat closed ear-tip to the camera rather than an open barrel.)
      const base = byName.get(part.place.on)
      if (!base) throw new Error(`${p.name}: limb '${part.name}' attaches to unknown/later part '${part.place.on}'`)
      const d = part.place.dir
      const dlen = Math.hypot(d.x, d.y, d.z) || 1
      const u: V3 = { x: d.x / dlen, y: d.y / dlen, z: d.z / dlen }
      R = rotZTo(u)
      const pc: V3 = {
        x: (base.bounds.minx + base.bounds.maxx) / 2,
        y: (base.bounds.miny + base.bounds.maxy) / 2,
        z: (base.bounds.minz + base.bounds.maxz) / 2,
      }
      // Parent half-extent along u (ellipsoid approx) = where the surface is.
      const parentR =
        0.5 * (Math.abs(u.x) * (base.bounds.maxx - base.bounds.minx) +
               Math.abs(u.y) * (base.bounds.maxy - base.bounds.miny) +
               Math.abs(u.z) * (base.bounds.maxz - base.bounds.minz))
      const seat = part.place.seat ?? 4
      // Base pole (local min-z) offset from centroid = (0,0, lb.minz − cz) → after
      // R it is (lb.minz − cz)·u (negative, pointing back toward the parent). Solve
      // T so the base pole lands seat mm inside the surface point pc + u·parentR.
      const baseAlong = scale * (lb.minz - cz) // < 0
      const along = parentR - seat - baseAlong // push centroid out so the limb stands proud
      T = { x: pc.x + u.x * along, y: pc.y + u.y * along, z: pc.z + u.z * along }
    } else {
      const base = byName.get(part.place.on)
      if (!base) throw new Error(`${p.name}: part '${part.name}' stacks on unknown/later part '${part.place.on}'`)
      const overlap = part.place.overlap ?? 0
      T = {
        x: (base.bounds.minx + base.bounds.maxx) / 2 + (part.place.offset?.x ?? 0),
        y: (base.bounds.miny + base.bounds.maxy) / 2 + (part.place.offset?.y ?? 0),
        // Its bottom sits at (base top − overlap), plus optional z nudge.
        z: base.bounds.maxz - overlap + halfH + (part.place.offset?.z ?? 0),
      }
    }

    // 5. Apply the transform to the settled centre-line into the composed world.
    const ctrl = local.map((v) => {
      const r = applyRot(R, { x: scale * (v.x - c.x), y: scale * (v.y - c.y), z: scale * (v.z - c.z) })
      return { x: T.x + r.x, y: T.y + r.y, z: T.z + r.z }
    })
    const worldBounds = bbox(ctrl)
    const pp: PlacedPart = { part, ctrl, bounds: worldBounds }
    placed.push(pp)
    byName.set(part.name, pp)
    allNodes.push(...ctrl)
  }

  const ghash = geometryHash({ model: { nodes: allNodes as never } } as never)
  return { placed, yr, problems, geometryHash: ghash }
}

export interface BlenderScene {
  fabric: { widthMm: number; heightMm: number; hex: string }
  strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[]
  view: { bgHex: string; marginFactor: number; tiltDeg: number; resY: number; openFabric?: boolean }
}

/**
 * The staged Blender scene for a composed amigurumi — every part as its own
 * plied-yarn curve in its own colour, one continuous ball each, assembled into
 * one 3D object. Rendered with the backing plane dropped (a 3D object sits on the
 * table, it is not flat fabric) and a 3/4 camera tilt so the stack reads as the
 * finished toy a customer recognises.
 */
export function compositionScene(p: CompositionProgram, compiled: CompiledComposition, twist = 0.08): BlenderScene {
  const yr = compiled.yr
  const strokes: BlenderScene['strokes'] = compiled.placed.map((pp) => {
    const center = smooth(pp.ctrl, 4)
    const { radiusMm, filaments } = pliedFilaments(center, yr * 0.62, 3, twist)
    return { hex: pp.part.colourHex, sheen: 0.85, radiusMm, filaments }
  })
  // Full composed extent (for the fabric hint; the script frames from the strokes).
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const pp of compiled.placed) {
    minx = Math.min(minx, pp.bounds.minx); maxx = Math.max(maxx, pp.bounds.maxx)
    miny = Math.min(miny, pp.bounds.miny); maxy = Math.max(maxy, pp.bounds.maxy)
  }
  return {
    fabric: { widthMm: maxx - minx + 30, heightMm: maxy - miny + 30, hex: p.parts[0]?.colourHex ?? '#c98a5e' },
    strokes,
    // A generous margin frames the FULL stacked silhouette (the tilted camera
    // frames off the horizontal footprint, so a tall body+head stack needs room
    // at the top). openFabric drops the flat backing plane — this is a 3D object.
    view: { bgHex: '#efece6', marginFactor: 0.45, tiltDeg: p.tiltDeg ?? 22, resY: 1200, openFabric: true },
  }
}
