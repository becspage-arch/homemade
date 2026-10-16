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

import { buildSpiralTree, TREE_BLOCKS, TREE_DROOP_DEG, TREE_EDGE_ROWS, type BuiltSpiral } from './spiralTree'
import { YARN_WEIGHT_RADIUS_MM, type YarnWeight } from './program'
import { MotifStrand } from './motifs/kit'
import { pieceOf, posedPoints, UK } from './motifs/common'
import { getMotif } from './motifs/index'
import type { MotifPiece, V3 } from './motifs/types'
import { colourStrokes } from './programScene'
import { pliedFilaments, smooth } from '../yarnLoop'
import type { HeroStage } from '../../render/blenderScene'

// r3: the bar's green is a deep forest green and its gold an antique metallic
// gold; #2c5634 / #b38c3c rendered sage and mustard beside it.
export const SPIRAL_COLOURS = { green: '#1c3a26', cream: '#ece2cc', gold: '#b08a3a' }
/** The bar's star and cord are a metallic gold thread: strokes[].metallic
 *  (renderer, additive) blends the yarn material toward a brushed metal. */
export const GOLD_METALLIC = 0.7

/** The star size the trees wear: STAR_SIZES.topper in motifs/star.ts. */
export const STAR_TOPPER_SIZE = 'topper' as const

export interface HangingOptions {
  /** Tree colours left to right (default green, cream, green: the bar). */
  trees?: string[]
  yarnWeight?: YarnWeight
  /** The star's yarn (the topper star is ~36 mm at lace; see the job log). */
  starWeight?: YarnWeight
  /** The hanging cord's yarn: the bar's cord is a fine flat chain, thinner than the tree yarn. */
  cordWeight?: YarnWeight
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
  for (const c of cols) if (!byColour.has(c)) byColour.set(c, buildSpiralTree({ yr, blocks: TREE_BLOCKS, droopDeg: TREE_DROOP_DEG, colour: c, edgeRows: TREE_EDGE_ROWS }))
  const trees = cols.map((c) => byColour.get(c)!)
  const t0 = trees[0]!
  const W = t0.maxRadiusMm * 2
  const gap = W * 0.38
  const X = cols.map((_, i) => (i - (cols.length - 1) / 2) * (W + gap))

  // The star.
  const starW = o.starWeight ?? 'lace' // pass 2: the solid 3-round topper is ~36 mm at lace ≈ 0.52 W (bar 0.53)
  const star = getMotif('star').build({ yarnWeight: starW, size: STAR_TOPPER_SIZE, colours: { main: gold } })
  const starPiece = star.pieces[0]!
  const syr = YARN_WEIGHT_RADIUS_MM[starW]
  const tip = starTipAngle(starPiece)
  const rot = STAR_TIP_UP - tip.th
  // Star centre to the tip of its lower-most points sits ~0.8 R below centre.
  const starDrop = tip.R * 0.78

  // Branch height above each tree's top: the cord. A short gold loop above
  // the star, about the star's own height (Rebecca, pass 2; the pass-1 loop at
  // 0.45 of the tree's height read long), in a finer gold thread.
  const cordMm = o.cordMm ?? tip.R * 2
  const branchR = W * 0.14
  const cyr = YARN_WEIGHT_RADIUS_MM[o.cordWeight ?? 'fine']
  const wrapR = branchR + cyr * 1.1
  const cord = buildCord(cyr, gold, cordMm, wrapR)

  const pieces: (MotifPiece & { yr: number })[] = []
  const props: Prop[] = []
  const words: string[] = []
  const problems: string[] = []
  const spin = [0.3, 2.2, 4.4]
  // The branch: a gently rising, slightly crooked bough.
  const slope = 0.05
  const branchZ = (x: number): number => slope * x + Math.sin(x / (W * 1.7)) * W * 0.04
  const treeTop = (x: number): number => branchZ(x) - wrapR - cordMm - tip.R - starDrop * 0.45
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
    // The star sits ON the tree's tip: its two lower points straddle the top
    // turn (the centre sits 0.45 of a point's drop above the tip).
    const zStar = zTop + starDrop * 0.45
    pieces.push({
      ...starPiece, name: `star-${i}`, yr: syr,
      pose: (p) => {
        const qx = p.x * sc - p.y * ss
        const qy = p.x * ss + p.y * sc
        return { x: x0 + qx, y: p.z + t.maxRadiusMm * 0.07, z: zStar + qy } // r5: the star stood 0.15 R in front of the top; now its lower points straddle it
      },
    })
    // The cord, from the star's top tip up over the branch.
    const zTip = zStar + tip.R
    pieces.push({
      ...cord.piece, name: `cord-${i}`, yr: cyr,
      pose: (p) => ({ x: x0 + p.x, y: p.z + t.maxRadiusMm * 0.15, z: zTip + p.y }),
    })
    // Beads on the tail where the ribbon ENDS at the base (the fasten-off tail
    // comes out of the last stitch, not the axis): a small spacer, then a
    // round gold bead (the bar's: ≈ 0.12 of the tree width, touching the tree).
    const be = t.baseEnd
    const bx = x0 + be.x * cs - be.y * sn, by = be.x * sn + be.y * cs
    const zb = zTop + (be.z - t.topZ)
    const r1 = W * 0.03, r2 = W * 0.062
    props.push({ centre: [bx, by, zb - yr - r1 * 0.6], axes: [[r1, 0, 0], [0, r1, 0], [0, 0, r1 * 0.8]], hex: '#c9a250', metal: true })
    props.push({ centre: [bx, by, zb - yr - r1 * 1.5 - r2], axes: [[r2, 0, 0], [0, r2, 0], [0, 0, r2]], hex: '#c9a250', metal: true })
    lowZ = Math.min(lowZ, zb - yr - r1 * 1.5 - 2 * r2)
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
    `Making up: sew the bottom points of each star over the top of its tree. Thread the tail at the base through a small gold spacer bead and a 7 mm gold bead, knot and trim. Hang from a branch by the loop.`,
  )
  void UK
  return { pieces, props, trees, words, problems, lowZ }
}

/** The hanging → the Blender scene loom_render_crochet.py renders. */
export function hangingScene(h: Hanging, o: { stage?: HeroStage; resY?: number; liftMm?: number; stageZoom?: number; yawDeg?: number; tiltDeg?: number } = {}) {
  const PER_SEG = 4
  const strokes: { hex: string; sheen: number; radiusMm: number; filaments: number[][][]; metallic?: number }[] = []
  let minZ = Infinity
  for (const piece of h.pieces) {
    const ctrl: V3[] = posedPoints(piece)
    for (const p of ctrl) minZ = Math.min(minZ, p.z)
    const center = smooth(ctrl, PER_SEG)
    const { radiusMm, filaments } = pliedFilaments(center, piece.yr * 0.85, 3, 0.06)
    const path = piece.built.strandPath
    const colourAt = (k: number): string => piece.colourOf(path[Math.min(Math.floor(k / PER_SEG), path.length - 1)]!)
    // ONE STROKE PER PIECE (Fable round 1): the renderer's fine-cotton look
    // re-plies each stroke from the mean of its filaments, so a stroke must hold
    // exactly one plied set. Merging the three trees' plies into one stroke
    // (equal lengths!) averaged them into a centreline between the trees with a
    // 90 mm spread: giant tubes that took hours to render. build_yarn groups
    // strokes by colour and radius itself, so this costs nothing.
    const metallic = piece.name.startsWith('star') || piece.name.startsWith('cord') ? GOLD_METALLIC : undefined
    strokes.push(...colourStrokes(center, filaments, radiusMm, colourAt).map((st) => (metallic ? { ...st, metallic } : st)))
  }
  const treeH = h.trees[0]!.heightMm
  // The renderer floats the lowest YARN to the table; the beads hang below
  // the trees, so the lift is measured from the yarn's lowest point.
  const beadBelow = minZ - h.lowZ
  return {
    fabric: { widthMm: 100, heightMm: 100, hex: strokes[0]?.hex ?? '#ffffff' },
    strokes,
    props: h.props,
    // r3: the bar's yarn is a crisp cotton cord with every stitch defined; the
    // fine-cotton re-ply read as fuzzy bobbles at this yarn weight.
    fibre: 'cotton',
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
      // r4: the stage's f/0.14 blurred the branch and the outer trees; the
      // bar keeps the branch and all three trees sharp over a soft room.
      stageFstop: 0.4,
      liftMm: beadBelow + (o.liftMm ?? 25),
      // The stage sizes its props (berries, pine, lights) from the content's
      // height, which for a hung set includes the cord and the lift: size them
      // from one tree instead (renderer key, additive).
      stageHeightMm: treeH,
    },
  }
}
