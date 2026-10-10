/**
 * ASSEMBLY AND HANGING (audit round 11, the pieces the spiral trees need):
 * corkscrew trees with a crocheted star topper, a chain hanging cord looped
 * over a branch, and a gold bead at the base, staged three to a branch like
 * bar-spiral-trees.png.
 *
 * Every yarn part is its own genuinely stitched, relaxed and audited piece:
 *  - the tree: spiralTree.ts (one strand, audited in its helicoid frames);
 *  - the star: the motifs lane's star (getMotif('star'), motifs/star.ts);
 *  - the cord: a genuine chain (the kit's pull-through chain, MotifStrand),
 *    worked along the loop it hangs in, ends sewn to the star's top point.
 * The beads and the branch are notions / set props (ellipsoids, a bark curve),
 * not yarn. Placing a finished piece on the branch is a RIGID pose applied
 * after relax and audit, exactly like the motifs' and compositions' poses; no
 * piece is bent.
 */

import { buildSpiralTree, TREE_BLOCKS, type BuiltSpiral } from './spiralTree'
import { YARN_WEIGHT_RADIUS_MM, type YarnWeight } from './program'
import { MotifStrand } from './motifs/kit'
import { pieceOf, posedPoints, UK } from './motifs/common'
import { getMotif } from './motifs/index'
import type { MotifPiece, V3 } from './motifs/types'
import { colourStrokes } from './programScene'
import { pliedFilaments, smooth } from '../yarnLoop'
import type { HeroStage } from '../../render/blenderScene'

export const SPIRAL_COLOURS = { green: '#2c5634', cream: '#ece2cc', gold: '#b38c3c' }

export interface HangingOptions {
  /** Tree colours left to right (default green, cream, green: the bar). */
  trees?: string[]
  yarnWeight?: YarnWeight
  /** The star's yarn (the small motifs star is ~37 mm at fine; see the job log). */
  starWeight?: YarnWeight
  gold?: string
  /** Cord length from the star tip to the branch (mm). */
  cordMm?: number
}

interface Prop {
  centre?: [number, number, number]
  axes?: [number, number, number][]
  hex: string
  metal?: boolean
  gloss?: number
  branch?: [number, number, number, number][]
}

export interface Hanging {
  pieces: (MotifPiece & { yr: number })[]
  props: Prop[]
  trees: BuiltSpiral[]
  words: string[]
  problems: string[]
  /** World z of the lowest bead's bottom and the branch top (mm). */
  lowZ: number
}

const STAR_TIP_UP = Math.PI / 2

/** The star's tip direction (radians) — the node furthest from its centre. */
function starTipAngle(p: MotifPiece): { th: number; R: number } {
  // Five-fold circular mean of the outer nodes: the direction of a tip.
  let R = 0
  for (const n of p.built.model.nodes) R = Math.max(R, Math.hypot(n.x, n.y))
  let sx = 0, sy = 0
  for (const n of p.built.model.nodes) {
    const r = Math.hypot(n.x, n.y)
    if (r < 0.55 * R) continue
    const a = Math.atan2(n.y, n.x) * 5
    sx += Math.cos(a); sy += Math.sin(a)
  }
  const ax = Math.atan2(sy, sx) / 5
  // The chained points lean (each tip's sl st closes over the turning chain),
  // so a point's visual axis lies between its body's axis and its tip node.
  let tipTh = ax, best = 0
  for (const n of p.built.model.nodes) {
    const r = Math.hypot(n.x, n.y)
    let d = Math.atan2(n.y, n.x) - ax
    d = Math.atan2(Math.sin(d), Math.cos(d))
    if (Math.abs(d) < Math.PI / 5 && r > best) { best = r; tipTh = ax + d }
  }
  return { th: (ax + tipTh) / 2, R }
}

/** A chain cord worked along its hanging loop: up from the star tip, over
 *  the branch, back down to the tip (cord-local x across, y up). */
function buildCord(yr: number, colour: string, lenMm: number, wrapR: number): { piece: MotifPiece; chains: number; topY: number } {
  const m = new MotifStrand(yr, colour)
  const legX = wrapR * 0.95
  const topY = lenMm
  const path: { x: number; y: number }[] = []
  path.push({ x: -0.6 * yr, y: 0 })
  path.push({ x: -legX, y: topY })
  for (let k = 1; k <= 12; k++) {
    const a = Math.PI - (k / 12) * Math.PI
    path.push({ x: Math.cos(a) * legX, y: topY + Math.sin(a) * wrapR })
  }
  path.push({ x: 0.6 * yr, y: 0 })
  let L = 0
  for (let i = 1; i < path.length; i++) L += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y)
  const pitch = 2.6 * yr
  const n = Math.max(4, Math.floor(L / pitch) - 1)
  const u = { x: path[1]!.x - path[0]!.x, y: path[1]!.y - path[0]!.y }
  const ul = Math.hypot(u.x, u.y)
  m.slipKnot(path[0]!, { x: u.x / ul, y: u.y / ul })
  m.chain(n, path)
  const end = m.cursor
  m.fastenOff({ x: -end.x, y: -end.y - 1 })
  const built = m.finish(legX * 2 + 4 * yr, topY + wrapR)
  return { piece: pieceOf('cord', m, built), chains: n, topY }
}

export function buildHanging(o: HangingOptions = {}): Hanging {
  const weight = o.yarnWeight ?? 'dk'
  const yr = YARN_WEIGHT_RADIUS_MM[weight]
  const gold = o.gold ?? SPIRAL_COLOURS.gold
  const cols = o.trees ?? [SPIRAL_COLOURS.green, SPIRAL_COLOURS.cream, SPIRAL_COLOURS.green]
  // One tree per colour (built once per distinct colour).
  const byColour = new Map<string, BuiltSpiral>()
  for (const c of cols) if (!byColour.has(c)) byColour.set(c, buildSpiralTree({ yr, blocks: TREE_BLOCKS, droopDeg: 22, colour: c }))
  const trees = cols.map((c) => byColour.get(c)!)
  const t0 = trees[0]!
  const W = t0.maxRadiusMm * 2
  const gap = W * 0.38
  const X = cols.map((_, i) => (i - (cols.length - 1) / 2) * (W + gap))

  // The star.
  const starW = o.starWeight ?? 'fine'
  const star = getMotif('star').build({ yarnWeight: starW, size: 'small', colours: { main: gold } })
  const starPiece = star.pieces[0]!
  const syr = YARN_WEIGHT_RADIUS_MM[starW]
  const tip = starTipAngle(starPiece)
  const rot = STAR_TIP_UP - tip.th
  // Star centre to the tip of its lower-most points sits ~0.8 R below centre.
  const starDrop = tip.R * 0.78

  // Branch height above each tree's top: the cord.
  const cordMm = o.cordMm ?? W * 0.85
  const branchR = W * 0.16
  const wrapR = branchR + yr * 1.1
  const cord = buildCord(yr, gold, cordMm, wrapR)

  const pieces: (MotifPiece & { yr: number })[] = []
  const props: Prop[] = []
  const words: string[] = []
  const problems: string[] = []
  const spin = [0.3, 2.2, 4.4]
  // The branch: a gently rising, slightly crooked bough.
  const slope = 0.05
  const branchZ = (x: number): number => slope * x + Math.sin(x / (W * 1.7)) * W * 0.04
  const treeTop = (x: number): number => branchZ(x) - wrapR - cordMm - tip.R - starDrop
  let lowZ = Infinity
  cols.forEach((col, i) => {
    const t = trees[i]!
    const x0 = X[i]!
    const zTop = treeTop(x0)
    const cs = Math.cos(spin[i]!), sn = Math.sin(spin[i]!)
    // The tree, hung by its axis: top at zTop.
    pieces.push({
      name: `tree-${i}`, built: t.built, colourOf: t.colourOf, problems: t.problems, yr,
      pose: (p) => ({ x: x0 + p.x * cs - p.y * sn, y: p.x * sn + p.y * cs, z: zTop + (p.z - t.topZ) }),
    })
    // The star, standing upright facing the camera (engine +y), its lower
    // points straddling the tree's top.
    const sc = Math.cos(rot), ss = Math.sin(rot)
    const zStar = zTop + starDrop * 0.9
    pieces.push({
      ...starPiece, name: `star-${i}`, yr: syr,
      pose: (p) => {
        const qx = p.x * sc - p.y * ss
        const qy = p.x * ss + p.y * sc
        return { x: x0 + qx, y: p.z + t.maxRadiusMm * 0.15, z: zStar + qy }
      },
    })
    // The cord, from the star's top tip up over the branch.
    const zTip = zStar + tip.R
    pieces.push({
      ...cord.piece, name: `cord-${i}`, yr,
      pose: (p) => ({ x: x0 + p.x, y: p.z + t.maxRadiusMm * 0.15, z: zTip + p.y }),
    })
    // Beads on the tail at the base: a small spacer, then a round gold bead.
    const zb = zTop - t.heightMm
    const r1 = yr * 1.6, r2 = yr * 3.0
    props.push({ centre: [x0, 0, zb - r1 * 0.6], axes: [[r1, 0, 0], [0, r1, 0], [0, 0, r1 * 0.8]], hex: '#c9a250', metal: true })
    props.push({ centre: [x0, 0, zb - r1 * 1.4 - r2], axes: [[r2, 0, 0], [0, r2, 0], [0, 0, r2]], hex: '#c9a250', metal: true })
    lowZ = Math.min(lowZ, zb - r1 * 1.4 - 2 * r2)
    problems.push(...t.problems.map((s) => `tree-${i}: ${s}`))
  })
  problems.push(...starPiece.problems.map((s) => `star: ${s}`), ...cord.piece.problems.map((s) => `cord: ${s}`))
  // The branch prop, across the frame and past it.
  const xs = X[0]! - W * 2.2, xe = X[X.length - 1]! + W * 2.2
  const bpts: [number, number, number, number][] = []
  for (let k = 0; k <= 10; k++) {
    const x = xs + ((xe - xs) * k) / 10
    bpts.push([x, Math.sin(k * 1.7) * branchR * 0.25, branchZ(x), branchR * (1.08 - 0.16 * (k / 10)) * (1 + 0.06 * Math.sin(k * 2.3))])
  }
  props.push({ branch: bpts, hex: '#6c5a4a' })

  words.push(
    ...t0.words.map((w) => (w.startsWith('Ch ') ? `Tree (make 3, 2 in green and 1 in cream): ${w}` : w)),
    `Star (make 3, in gold): ${star.words.join(' ')}`,
    `Hanging cord (make 3, in gold): ch ${cord.chains + 1}, fasten off. Sew both ends to the top point of a star to make a loop.`,
    `Making up: sew the bottom points of each star over the top of its tree. Thread the tail at the base through a small gold bead and an 8 mm gold bead, knot and trim. Hang from a branch by the loop.`,
  )
  void UK
  return { pieces, props, trees, words, problems, lowZ }
}

/** The hanging → the Blender scene loom_render_crochet.py renders. */
export function hangingScene(h: Hanging, o: { stage?: HeroStage; resY?: number; liftMm?: number; stageZoom?: number; yawDeg?: number; tiltDeg?: number } = {}) {
  const PER_SEG = 4
  const strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][] }[] = []
  let minZ = Infinity
  for (const piece of h.pieces) {
    const ctrl: V3[] = posedPoints(piece)
    for (const p of ctrl) minZ = Math.min(minZ, p.z)
    const center = smooth(ctrl, PER_SEG)
    const { radiusMm, filaments } = pliedFilaments(center, piece.yr * 0.85, 3, 0.06)
    const path = piece.built.strandPath
    const colourAt = (k: number): string => piece.colourOf(path[Math.min(Math.floor(k / PER_SEG), path.length - 1)]!)
    for (const s of colourStrokes(center, filaments, radiusMm, colourAt)) {
      const same = strokes.find((t) => t.hex === s.hex && t.radiusMm === s.radiusMm)
      if (same) same.filaments.push(...s.filaments)
      else strokes.push(s)
    }
  }
  // The renderer floats the lowest YARN to the table; the beads hang below
  // the trees, so the lift is measured from the yarn's lowest point.
  const beadBelow = minZ - h.lowZ
  return {
    fabric: { widthMm: 100, heightMm: 100, hex: strokes[0]?.hex ?? '#ffffff' },
    strokes,
    props: h.props,
    fibre: 'fine-cotton',
    view: {
      bgHex: '#efece6',
      marginFactor: 0.12,
      tiltDeg: o.tiltDeg ?? 80,
      resY: o.resY ?? 1200,
      openFabric: true,
      yawDeg: o.yawDeg ?? 0,
      aimHeightFrac: 0.55,
      lightRig: 'product' as const,
      groundScale: 40,
      stage: o.stage ?? ('christmas' as HeroStage),
      stageTiltDeg: o.tiltDeg ?? 80,
      stageZoom: o.stageZoom ?? 1.0,
      liftMm: beadBelow + (o.liftMm ?? 25),
    },
  }
}
