/**
 * THE FOLDED FLAT PIECE (fold-ear pass, 2026-10-26): the soft folded ear the
 * cutest amigurumi wear, built the way designers make it, for ANY animal.
 * Rebecca on the cow (26 Oct): our cupped ears read as "little cups", the
 * bar's are "all cutesy and folded".
 *
 * The maker works a FLAT piece, one layer, never stuffed:
 *   - 'round'   a circle in rounds from a magic ring, +6 a round (a cow,
 *               bear or mouse ear);
 *   - 'oval'    an oval in rows (a softer, taller round ear);
 *   - 'pointed' a triangle in rows, a wide base to a point (a cat or fox ear);
 *   - 'lop'     a long piece in rows: narrower at the head, long straight
 *               rows, a rounded tip (a lop ear that tapers to the head);
 *   - 'petal'   a leaf / petal in rows: a narrow base, widening, then to a
 *               point (a petal, a leaf, a deer ear).
 * Every row piece is worked TIP FIRST (the chain is the tip, each row
 * increases or decreases one stitch at each end, the last row is the base),
 * so the base the sewing step pinches is a row of live stitch tops.
 * Then the SEWING STEP every one of these patterns ends with: the base is
 * folded with the front of the ear inside the fold, two stitches of the base
 * edge an equal count either side of its middle are brought together and
 * sewn through with a couple of small stitches (a round: `pinch` sets which
 * two; a row piece: its base row's own two corners), and the ear is sewn on
 * by that pinched base.
 * The pinch is what makes it cup softly forward and curl; above it the ear
 * keeps a gentle cup (`cup`) and its tip turns forward (`curl`).
 *
 * Construction honesty: the flat piece is the engine's own audited round or
 * shaped-row builder (shaping.ts `buildRounds` / `buildShaped`: one strand,
 * every hook recorded), relaxed and audited flat. The fold is relax.ts
 * `mould`: two plates a yarn's thickness apart, curved across the piece into
 * arcs whose curvature brings the two sewn stitches together at the base and
 * eases to the soft cup above — external one-sided contact like the press and
 * the table, never a pin and never a join between stitches; and relax.ts
 * `sew`, a one-sided tether between the two sewn stitches that only ever
 * shortens (the sewing yarn pulled up), kept out of the fabric's own
 * constraints so the audit still sees no spring. A row piece's plates press
 * its FACES (`mould.depth`: each stitch's own depth in the blocked flat
 * piece, so a pressed edge keeps its hooks under their crowns), and its arcs
 * change along its length only as fast as the fabric can follow without
 * being pulled apart between its rows (`ROW_DEVELOP`). The settled piece is then
 * AUDITED again: every interlock measured against its crown in the fabric's own local
 * frame (the fold developed flat, each crown's neighbourhood best-fitted),
 * no yarn stretched, no yarn through yarn (self-intersection), the two sewn
 * stitches within a sewing stitch of each other, and its shape (width,
 * length, fold depth, curl) inside the ranges this module declares.
 *
 * Nothing imports this unless a preset's opt-in switch is on.
 */

import { buildRounds, buildShaped } from './shaping'
import { relax } from './relax'
import { relaxProgram } from './programScene'
import { auditProblems } from './auditChecks'
import { STITCHES, rowPitchYr, type ShapeOp } from './dictionary'
import { writeInstructions } from './program'
import type { AmigurumiPart, PartPlacement } from './composition'
import type { BuiltContinuous } from './yarnPath'
import { gRounds, gStep } from './gauge'

export type FoldedShape = 'round' | 'oval' | 'pointed' | 'lop' | 'petal'

export interface FoldedPieceOptions {
  shape: FoldedShape
  /** SIZE: stitches at the widest. A round: its last round (a multiple of 6,
   *  12-60). Rows: the widest row (even; the shaping is one stitch each end). */
  width: number
  /** Rows: how many rows long (default: the shape's own proportion). Ignored
   *  for a round. */
  length?: number
  /** THE PINCH: which two stitches of the base edge are sewn together. A
   *  round, 0..1: the last-round stitches round(pinch · width / 6) either side
   *  of the bottom-centre stitch (1 = a sixth of the circle either side).
   *  Rows: 1 = the base row's own two corners (its first and last stitches),
   *  the way a row-worked ear is finished; nothing between is offered, since
   *  stitches further in would leave the corners to pleat outward past the
   *  sewing, which this fold does not model (refused, not approximated).
   *  0 = no pinch (the ear is sewn on flat by its base). */
  pinch: number
  /** The soft CUP kept above the pinch, 0..1: how far the ear's width curls
   *  forward at the top, as a fraction of a half-turn (default 0.25). */
  cup?: number
  /** The CURL, 0..1: how far the ear's tip turns forward (default 0.3; 1 =
   *  the tip about 27 degrees forward of the base). */
  curl?: number
}

/** The same piece at a finer gauge (gauge.ts): g x the stitches across (a
 *  round in sixes, rows in twos) and g x the rows, in a yarn g x finer, so it
 *  keeps its size in mm. Shape fractions are kept. The identity at g = 1. */
export function gFolded(o: FoldedPieceOptions, g: number): FoldedPieceOptions {
  if (g === 1) return o
  if (o.shape === 'round') return { ...o, width: Math.min(60, gStep(o.width, g, 6, 12)) }
  return { ...o, width: Math.min(40, gStep(o.width, g, 2, 6)), ...(o.length != null ? { length: Math.min(80, gRounds(o.length, g)) } : {}) }
}

// ─── The counts ─────────────────────────────────────────────────────────────

const SHAPES: Record<Exclude<FoldedShape, 'round'>, {
  /** Half-width at t (0 = base, 1 = tip) as a fraction of the widest. */
  outline: (t: number) => number
  /** Default rows per widest stitch. */
  aspect: number
  /** How many stitches a row may lose (both ends together): 2 = one each end,
   *  4 = two each end (a blunt round top). */
  maxDec: number
  /** The smallest row. */
  minRow: number
}> = {
  // An ellipse cut at 0.7 of its width by the base chain.
  oval: { outline: (t) => Math.sqrt(Math.max(0, 1 - ((t - 0.4) / 0.62) ** 2)), aspect: 1.0, maxDec: 4, minRow: 4 },
  // A triangle from a full-width base, slightly bowed sides.
  pointed: { outline: (t) => Math.max(0, 1 - t) ** 0.85, aspect: 1.0, maxDec: 2, minRow: 2 },
  // Narrower at the head, full width by a third, a rounded tip.
  lop: {
    outline: (t) => (t < 0.3 ? 0.62 + 0.38 * Math.sin((t / 0.3) * (Math.PI / 2)) : t < 0.8 ? 1 : Math.sqrt(Math.max(0, 1 - ((t - 0.8) / 0.215) ** 2))),
    aspect: 3.0, maxDec: 4, minRow: 4,
  },
  // A narrow stem end, widest a little below the middle, to a point.
  petal: { outline: (t) => (t < 0.42 ? 0.3 + 0.7 * Math.sin((t / 0.42) * (Math.PI / 2)) : Math.max(0, 1 - (t - 0.42) / 0.58) ** 0.8), aspect: 1.4, maxDec: 2, minRow: 2 },
}

function validate(o: FoldedPieceOptions): void {
  if (o.pinch < 0 || o.pinch > 1) throw new Error(`folded piece: pinch is 0..1 (got ${o.pinch})`)
  if ((o.cup ?? 0.25) < 0 || (o.cup ?? 0.25) > 1) throw new Error(`folded piece: cup is 0..1 (got ${o.cup})`)
  if ((o.curl ?? 0.3) < 0 || (o.curl ?? 0.3) > 1) throw new Error(`folded piece: curl is 0..1 (got ${o.curl})`)
  if (o.shape === 'round') {
    if (o.width % 6 !== 0 || o.width < 12 || o.width > 60) throw new Error(`folded piece: a round's width is a multiple of 6, 12-60 (got ${o.width})`)
  } else {
    if (o.width % 2 !== 0 || o.width < 6 || o.width > 40) throw new Error(`folded piece: a row piece's width is even, 6-40 (got ${o.width})`)
    if (o.length != null && (!Number.isInteger(o.length) || o.length < 3 || o.length > 80)) throw new Error(`folded piece: length is 3-80 rows (got ${o.length})`)
    if (o.pinch !== 0 && o.pinch !== 1) throw new Error(`folded piece: a row piece is pinched at its base corners (pinch 1) or not at all (0) (got ${o.pinch})`)
  }
}

/** A round piece's rounds (magic ring first). */
export function foldedRounds(o: FoldedPieceOptions): number[] {
  validate(o)
  if (o.shape !== 'round') throw new Error('folded piece: only a round piece is worked in rounds')
  const out: number[] = []
  for (let n = 6; n <= o.width; n += 6) out.push(n)
  return out
}

/** A row piece's outline in stitch counts, BASE to TIP: [the base row, …,
 *  the tip]. Each count differs from the next by an even number, shaped
 *  equally at both ends. The piece is WORKED TIP FIRST (`foldedRowPlans`):
 *  the chain at the tip, the last row along the base, so the base edge the
 *  sewing step pinches is a finished row of stitches, not a chain. */
export function foldedRowCounts(o: FoldedPieceOptions): number[] {
  validate(o)
  if (o.shape === 'round') throw new Error('folded piece: a round piece has no rows')
  const S = SHAPES[o.shape]
  const rows = o.length ?? Math.max(4, Math.round(o.width * S.aspect * (STITCHES.sc.gaugeYr / rowPitchYr('sc'))))
  const even = (v: number): number => Math.max(S.minRow, 2 * Math.round(v / 2))
  const target = (t: number): number => even(o.width * S.outline(t))
  // Base to tip, each row toward its target: at most +2 a row (one each end),
  // at most -maxDec.
  const out: number[] = [target(0)]
  for (let r = 1; r <= rows; r++) {
    const prev = out[r - 1]!
    const want = target(r / rows)
    out.push(Math.max(S.minRow, Math.min(prev + 2, Math.max(prev - S.maxDec, want))))
  }
  return out
}

/** One row's shaping ops in work order, from `below` stitches to `count`. */
function rowOps(below: number, count: number): ShapeOp[] {
  const d = count - below
  const run = (n: number, op: ShapeOp): ShapeOp[] => Array.from({ length: n }, () => op)
  if (d === 0) return run(below, 'st')
  const e = Math.abs(d) / 2
  if (d > 0) return [...run(e, 'inc'), ...run(below - 2 * e, 'st'), ...run(e, 'inc')]
  if (below < 4 * e) throw new Error(`folded piece: a row of ${below} cannot lose ${-d}`)
  return [...run(e, 'dec'), ...run(below - 4 * e, 'st'), ...run(e, 'dec')]
}

/** The shaped rows (shaping.ts `buildShaped`'s plans), worked tip first:
 *  the chain is the tip's count, the last row the base's. */
export function foldedRowPlans(o: FoldedPieceOptions): { foundation: number; rows: ShapeOp[][] } {
  const work = foldedRowCounts(o).slice().reverse()
  const rows: ShapeOp[][] = []
  for (let r = 1; r < work.length; r++) rows.push(rowOps(work[r - 1]!, work[r]!))
  return { foundation: work[0]!, rows }
}

/** The two base-edge stitches the sewing step joins, 1-based along the edge:
 *  rows: along the last row (the base); a round: the count either side of
 *  the bottom-centre stitch of the last round. Null = no pinch. */
export function foldedPinchStitches(o: FoldedPieceOptions): { a: number; b: number } | { either: number } | null {
  if (o.pinch <= 0) return null
  if (o.shape === 'round') return { either: Math.max(1, Math.round((o.pinch * o.width) / 6)) }
  return { a: 1, b: foldedRowCounts(o)[0]! }
}

// ─── The words ──────────────────────────────────────────────────────────────

const SHAPE_NAME: Record<FoldedShape, string> = { round: 'circle', oval: 'oval', pointed: 'triangle', lop: 'long ear', petal: 'petal' }

/** The piece's words: every round or row with its count, the fasten-off, and
 *  the fold-and-pinch sewing step. */
export function foldedWords(o: FoldedPieceOptions, what = 'ear'): string[] {
  validate(o)
  const pin = foldedPinchStitches(o)
  if (o.shape === 'round') {
    const rounds = foldedRounds(o)
    const lines = writeInstructions({ name: what, stitch: 'sc', form: 'disc', rounds }).slice(0, -1)
    const n = rounds[rounds.length - 1]!
    return [
      ...lines,
      'Work in a continuous spiral without joining; mark the first stitch of each round.',
      `Sl st in the next st and fasten off leaving a long tail for sewing. Do not stuff: the ${what} is a flat ${SHAPE_NAME.round} of one layer (${n} sts round the edge).`,
      pin && 'either' in pin
        ? `Fold and pinch: hold the circle with the right side facing you and mark the stitch at the bottom of the last round. Fold the bottom of the circle toward you, so the right side is inside the fold, and bring together the stitch ${pin.either} sts to the left of the marker and the stitch ${pin.either} sts to the right of it. Sew through both with 2 small stitches and pull snug: the base pinches into a little pleat and the ${what} cups softly forward.`
        : `Sew the ${what} on flat by the bottom of the circle.`,
      pin ? `Sew the ${what} on by the pinched base, the hollow facing forward, and let the top fall open.` : '',
    ].filter((l) => l)
  }
  const { foundation, rows } = foldedRowPlans(o)
  const lines = writeInstructions({ name: what, stitch: 'sc', form: 'flat', foundation, rows }).slice(0, -1)
  const base = foldedRowCounts(o)[0]!
  return [
    `Worked from the tip down to the base, in rows.`,
    ...lines,
    `Fasten off leaving a long tail for sewing. Do not stuff: the ${what} is a flat ${SHAPE_NAME[o.shape]} of one layer, ${foundation === 2 ? 'pointed at the tip' : `${foundation} sts across the tip`} and ${base} sts along the last row, which is its base.`,
    pin
      ? `Fold and pinch: with the right side facing you, fold the last row in half toward you, so the right side is inside the fold, and bring its first and last stitches together. Sew through both with 2 small stitches and pull snug: the base pinches and the ${what} cups softly forward.`
      : `Sew the ${what} on flat by its last row.`,
    pin ? `Sew the ${what} on by the pinched base, the hollow facing forward.` : '',
  ].filter((l) => l)
}

// ─── Building, folding, auditing ────────────────────────────────────────────

interface FlatPiece {
  built: BuiltContinuous
  /** The two sewn nodes (on the base edge), or null without a pinch. */
  sewn: [number, number] | null
}

/** The flat piece, built and relaxed flat, in its own frame: across x, base
 *  at low y, the right side +z (a round piece: rotated so the bottom-centre
 *  stitch of the last round is at the bottom). */
export function buildFlat(o: FoldedPieceOptions, yr: number): FlatPiece {
  if (o.shape === 'round') {
    const rounds = foldedRounds(o)
    const built = buildRounds('sc', rounds, yr)
    relaxProgram(built, yr)
    const nodes = built.model.nodes
    // The last round's nodes: the outer band of the settled disc.
    let R = 0
    for (const n of nodes) R = Math.max(R, Math.hypot(n.x, n.y))
    const rim = nodes.map((n, i) => ({ i, r: Math.hypot(n.x, n.y), th: Math.atan2(n.y, n.x) })).filter((q) => q.r > R - 2.4 * yr)
    const pin = foldedPinchStitches(o)
    let sewn: [number, number] | null = null
    if (pin && 'either' in pin) {
      // The bottom-centre stitch is -90° (the disc is round, so any stitch may
      // be the marker; -90° is where this one sits). Its neighbours `either`
      // stitches away are ± either · 2π / n round the edge.
      const dth = (pin.either * 2 * Math.PI) / o.width
      const near = (th: number): number => {
        let best = rim[0]!, bd = Infinity
        for (const q of rim) {
          let d = Math.abs(q.th - th)
          d = Math.min(d, 2 * Math.PI - d)
          const score = d * R + (R - q.r) * 0.5
          if (score < bd) { bd = score; best = q }
        }
        return best.i
      }
      sewn = [near(-Math.PI / 2 - dth), near(-Math.PI / 2 + dth)]
    }
    return { built, sewn }
  }
  const { foundation, rows } = foldedRowPlans(o)
  const built = buildShaped('sc', rows, foundation, yr)
  relaxProgram(built, yr)
  // Worked tip first, up +y: turn it half round (x, y → -x, -y), so the base
  // (the last row) is at the bottom, centred across.
  const nodes = built.model.nodes
  for (const n of nodes) { n.x = -n.x; n.y = -n.y }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity
  for (const n of nodes) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y) }
  for (const n of nodes) n.x -= (x0 + x1) / 2
  const pin = foldedPinchStitches(o)
  let sewn: [number, number] | null = null
  if (pin && 'a' in pin) {
    // The base row's stitches lie along the bottom edge in order; the sewn
    // ones are found where their count puts them across it (the row's own
    // even spacing), on the edge itself.
    const F = foldedRowCounts(o)[0]!
    const band = nodes.map((n, i) => ({ n, i })).filter((q) => q.n.y <= y0 + 2.2 * yr)
    let bx0 = Infinity, bx1 = -Infinity
    for (const q of band) { bx0 = Math.min(bx0, q.n.x); bx1 = Math.max(bx1, q.n.x) }
    const at = (k: number): number => {
      const x = bx0 + ((k - 0.5) / F) * (bx1 - bx0)
      let best = band[0]!.i, bd = Infinity
      for (const q of band) {
        const d = Math.abs(q.n.x - x) + (q.n.y - y0) * 0.3
        if (d < bd) { bd = d; best = q.i }
      }
      return best
    }
    sewn = [at(pin.a), at(pin.b)]
  }
  return { built, sewn }
}

export interface FoldMould { k: number[]; m: number[]; half: number; y0: number; y1: number; holdK?: number; depth?: number[] }

const MOULD_SAMPLES = 24
/** The sewing stitch's span: the two sewn stitches' centres end this many
 *  yarn radii apart (two yarns side by side, a strand of sewing yarn between). */
const SEW_GAP_YR = 2.6
/** The fold's settings, measured (fold-ear pass): the plates' half gap (a
 *  single layer's thickness and its relief), the blocked hold round the arc
 *  and up the piece, the wrap's cap (none: the sewn stitches' own turn), and
 *  how much of the length the pinch eases into the cup over. */
const FOLD_HALF_YR = 1.6
const FOLD_HOLD_K = 0.05
const FOLD_LAYOUT_K = 0.01
const FOLD_GUIDE = 2.2 * Math.PI
const FOLD_EASE = 0.7
/** A row piece's fold (fold-ear rows pass, 26 Oct): its plates sit at each
 *  stitch's own depth (mould.depth) with a yarn's play either side, the same
 *  blocked holds as its flat relax, and its arcs never stretch the fabric
 *  between one row and the next by more than ROW_DEVELOP (measured on the
 *  mould; the settled fabric is held to the audit's strain gate). */
const FOLD_HALF_YR_ROWS = 1.0
const FOLD_HOLD_K_ROWS = 0.02
const FOLD_LAYOUT_K_ROWS = 0.06
const ROW_DEVELOP = 0.25

/** The fold mould for a settled flat piece: per height, the arc's curvature
 *  from the piece's own width there — at the sewn stitches' height the width
 *  wraps a whole turn less a yarn (so they meet), easing to `cup` of a
 *  half-turn at the top; the middle line bows forward for the curl. */
export function foldMould(o: FoldedPieceOptions, flat: FlatPiece, yr: number): FoldMould {
  const nodes = flat.built.model.nodes
  let y0 = Infinity, y1 = -Infinity
  for (const n of nodes) { y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y) }
  const L = y1 - y0
  // The flat width at each sample height.
  const width: number[] = []
  for (let s = 0; s < MOULD_SAMPLES; s++) {
    const y = y0 + (L * s) / (MOULD_SAMPLES - 1)
    const band = Math.max(yr * 1.5, L / MOULD_SAMPLES)
    let a = Infinity, b = -Infinity
    for (const n of nodes) if (Math.abs(n.y - y) <= band) { a = Math.min(a, n.x); b = Math.max(b, n.x) }
    width.push(b > a ? b - a : yr * 4)
  }
  const cupA = (o.cup ?? 0.25) * Math.PI
  const sew = flat.sewn
  // At the sewn stitches' height the arc's curvature closes the fabric
  // between them into a whole turn but for the sewing stitch's span (they
  // meet); below it (the pleat under a round's pinch) the same curvature;
  // above it the wrap of the whole width eases to the soft cup.
  let tp = 0
  let kp = 0
  if (sew) {
    const pa = nodes[sew[0]]!, pb = nodes[sew[1]]!
    tp = Math.min(0.9, Math.max(0, ((pa.y + pb.y) / 2 - y0) / L))
    const chord = Math.abs(pb.x - pa.x)
    kp = (2 * Math.PI) / (chord + SEW_GAP_YR * yr)
  }
  const sp = Math.round(tp * (MOULD_SAMPLES - 1))
  const Ap = Math.min(FOLD_GUIDE, kp * width[sp]!)
  const k: number[] = []
  const m: number[] = []
  const c = 0.25 * (o.curl ?? 0.3)
  for (let s = 0; s < MOULD_SAMPLES; s++) {
    const t = s / (MOULD_SAMPLES - 1)
    const w = Math.max(width[s]!, yr * 4)
    if (!sew) k.push(cupA / w)
    else if (s <= sp) k.push(kp)
    else {
      const u = Math.min(1, (t - tp) / FOLD_EASE)
      const A = cupA + (Ap - cupA) * 0.5 * (1 + Math.cos(Math.PI * u))
      k.push(Math.min(kp, A / w))
    }
    // A row piece's tip chain stays where it was worked: the arcs ease flat
    // over the last tenth toward it.
    if (o.shape !== 'round' && t > 0.9) k[s] = k[s]! * Math.max(0, (1 - t) / 0.1)
    // The middle line bows forward (the same curl either way); a row piece
    // keeps its tip chain where it was worked (the anchor stays put), so its
    // bow is measured from the tip, level there.
    m.push(o.shape === 'round' ? c * L * t * t : c * L * (1 - t) * (1 - t))
  }
  // A row piece's arcs change along its length no faster than the fabric can
  // follow: wherever the curvature changes with height, the stitches far
  // round the arc (the side edges) are carried further between one height
  // and the next than the middle is, so the fabric there is pulled apart row
  // from row (a sheet bent that way no longer develops flat) and the edge
  // stitches are dragged off their crowns. Each height's arc is limited to
  // the curvature that keeps that row-to-row stretch under ROW_DEVELOP, from
  // the base up (the pinch holds) and then from the tip down (its chain is
  // where it was worked, flat).
  if (o.shape !== 'round') {
    const ys = k.map((_, s) => y0 + (L * s) / (MOULD_SAMPLES - 1))
    const at = (q: number, kk: number, mm: number, y: number): P3 => (kk < 1e-9 ? { x: q, y, z: mm } : { x: Math.sin(kk * q) / kk, y, z: mm + (1 - Math.cos(kk * q)) / kk })
    const stretch = (a: number, b: number, ka: number, kb: number): number => {
      const hw = Math.min(width[a]!, width[b]!) / 2
      const dy = Math.abs(ys[b]! - ys[a]!)
      let worst = 0
      for (const f of [0.25, 0.5, 0.75, 1]) {
        const pa = at(hw * f, ka, m[a]!, ys[a]!), pb = at(hw * f, kb, m[b]!, ys[b]!)
        worst = Math.max(worst, Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z) / dy - 1)
      }
      return worst
    }
    const limit = (from: number, to: number): void => {
      if (stretch(from, to, k[from]!, k[to]!) <= ROW_DEVELOP) return
      let lo = 0, hi = 1
      for (let it = 0; it < 40; it++) {
        const mid = (lo + hi) / 2
        if (stretch(from, to, k[from]!, k[from]! + (k[to]! - k[from]!) * mid) <= ROW_DEVELOP) lo = mid
        else hi = mid
      }
      k[to] = k[from]! + (k[to]! - k[from]!) * lo
    }
    const target = k.slice()
    for (let s = 1; s < k.length; s++) limit(s - 1, s)
    // The tip's fade is kept (its chain is not moved), and eases down from it.
    for (let s = 0; s < k.length; s++) if (s / (MOULD_SAMPLES - 1) > 0.9) k[s] = Math.min(k[s]!, target[s]!)
    for (let s = k.length - 2; s >= 0; s--) limit(s + 1, s)
  }
  return { k, m, half: yr * (o.shape === 'round' ? FOLD_HALF_YR : FOLD_HALF_YR_ROWS), y0, y1, holdK: o.shape === 'round' ? FOLD_HOLD_K : FOLD_HOLD_K_ROWS }
}

type P3 = { x: number; y: number; z: number }

/** Where a node sits in the mould's DEVELOPED frame: its arc length round
 *  its height's arc (taken on the side of `hintX`, its flat across-position:
 *  past half a turn the two edges meet at the front), the same height, and
 *  its offset in from the mould surface. Exact across the piece; along it,
 *  where the curvature changes with height, the audit's local turn takes up
 *  the rest. */
export function developFold(M: FoldMould, p: P3, hintX: number): P3 {
  const span = M.y1 - M.y0 || 1
  const t = Math.min(1, Math.max(0, (p.y - M.y0) / span))
  const at = (arr: number[]): number => {
    const u = t * (arr.length - 1)
    const i = Math.min(arr.length - 2, Math.floor(u))
    return arr[i]! + (arr[i + 1]! - arr[i]!) * (u - i)
  }
  const k = at(M.k)
  const m = at(M.m)
  if (k < 1e-6) return { x: p.x, y: p.y, z: p.z - m }
  const rho = 1 / k
  const dz = p.z - (m + rho)
  let ph = Math.atan2(p.x, -dz)
  const ph0 = hintX / rho
  while (ph - ph0 > Math.PI) ph -= 2 * Math.PI
  while (ph - ph0 < -Math.PI) ph += 2 * Math.PI
  return { x: rho * ph, y: p.y, z: rho - Math.hypot(p.x, dz) }
}


/** The best rotation taking the centred points `a` onto `b` (Horn's
 *  quaternion method), as a function. */
function bestRotation(a: P3[], b: P3[]): (p: P3) => P3 {
  let Sxx = 0, Sxy = 0, Sxz = 0, Syx = 0, Syy = 0, Syz = 0, Szx = 0, Szy = 0, Szz = 0
  for (let i = 0; i < a.length; i++) {
    const p = a[i]!, q = b[i]!
    Sxx += p.x * q.x; Sxy += p.x * q.y; Sxz += p.x * q.z
    Syx += p.y * q.x; Syy += p.y * q.y; Syz += p.y * q.z
    Szx += p.z * q.x; Szy += p.z * q.y; Szz += p.z * q.z
  }
  const N = [
    [Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx],
    [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz],
    [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy],
    [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz],
  ]
  // The largest eigenvector by power iteration on N + cI (c bounds |λ|).
  let c = 0
  for (const r of N) c = Math.max(c, r.reduce((s, v) => s + Math.abs(v), 0))
  let q = [1, 0, 0, 0]
  for (let it = 0; it < 80; it++) {
    const n = N.map((r, i) => r.reduce((s, v, j) => s + v * q[j]!, 0) + c * q[i]!)
    const l = Math.hypot(...n) || 1
    q = n.map((v) => v / l)
  }
  const [w, x, y, z] = q as [number, number, number, number]
  return (p) => ({
    x: (w * w + x * x - y * y - z * z) * p.x + 2 * (x * y - w * z) * p.y + 2 * (x * z + w * y) * p.z,
    y: 2 * (x * y + w * z) * p.x + (w * w - x * x + y * y - z * z) * p.y + 2 * (y * z - w * x) * p.z,
    z: 2 * (x * z - w * y) * p.x + 2 * (y * z + w * x) * p.y + (w * w - x * x - y * y + z * z) * p.z,
  })
}

/** How far the fold moved each interlock: every recorded hook's offset from
 *  the crown it hooks, in the flat piece, turned by the best rotation of the
 *  fabric round that crown (within `rad` mm) onto the folded piece, against
 *  the folded offset. A fold that bends the fabric moves nothing locally; one
 *  that drags a hook off its crown shows here. Returns the largest shift and
 *  how many exceed `limit` (mm). */
export function foldLinkShift(flat: P3[], folded: P3[], links: { hook: number; below: number }[], rad: number, limit: number): { max: number; over: number; worst: number; local: P3[] } {
  // `local`: the flat piece with every hook put where the FOLDED piece holds
  // it against its crown (the folded offset turned back into the flat frame)
  // — the folded interlocks, seen in the frame the audit measures.
  const local = flat.map((p) => ({ ...p }))
  const cell = rad
  const grid = new Map<string, number[]>()
  const key = (p: P3): string => `${Math.floor(p.x / cell)},${Math.floor(p.y / cell)},${Math.floor(p.z / cell)}`
  flat.forEach((p, i) => { const k = key(p); const g = grid.get(k); if (g) g.push(i); else grid.set(k, [i]) })
  let max = 0, over = 0, worst = -1
  links.forEach((l, li) => {
    const b0 = flat[l.below]!
    const cx = Math.floor(b0.x / cell), cy = Math.floor(b0.y / cell), cz = Math.floor(b0.z / cell)
    const near: number[] = []
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++)
      for (const j of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        const p = flat[j]!
        if (Math.hypot(p.x - b0.x, p.y - b0.y, p.z - b0.z) <= rad) near.push(j)
      }
    if (near.length < 4) return
    const ca = near.reduce((s, j) => ({ x: s.x + flat[j]!.x / near.length, y: s.y + flat[j]!.y / near.length, z: s.z + flat[j]!.z / near.length }), { x: 0, y: 0, z: 0 })
    const cb = near.reduce((s, j) => ({ x: s.x + folded[j]!.x / near.length, y: s.y + folded[j]!.y / near.length, z: s.z + folded[j]!.z / near.length }), { x: 0, y: 0, z: 0 })
    const A = near.map((j) => ({ x: flat[j]!.x - ca.x, y: flat[j]!.y - ca.y, z: flat[j]!.z - ca.z }))
    const B = near.map((j) => ({ x: folded[j]!.x - cb.x, y: folded[j]!.y - cb.y, z: folded[j]!.z - cb.z }))
    const R = bestRotation(A, B)
    const Rinv = bestRotation(B, A)
    const h0 = flat[l.hook]!, h1 = folded[l.hook]!, b1 = folded[l.below]!
    const back = Rinv({ x: h1.x - b1.x, y: h1.y - b1.y, z: h1.z - b1.z })
    local[l.hook] = { x: b0.x + back.x, y: b0.y + back.y, z: b0.z + back.z }
    const r = R({ x: h0.x - b0.x, y: h0.y - b0.y, z: h0.z - b0.z })
    const d = Math.hypot(r.x - (h1.x - b1.x), r.y - (h1.y - b1.y), r.z - (h1.z - b1.z))
    if (d > max) { max = d; worst = li }
    if (d > limit) over++
  })
  return { max, over, worst, local }
}

export interface FoldedMetrics {
  /** Settled extents in the piece's frame (mm): across, base to tip, front-back. */
  widthMm: number
  lengthMm: number
  depthMm: number
  /** The flat piece's width and length before the fold (mm). */
  flatWidthMm: number
  flatLengthMm: number
  /** How deep the fold holds just above the pinch: the edges' forward reach
   *  over the middle line, mm, over the lower third. */
  foldDepthMm: number
  /** The same over the top third: the soft cup the ear keeps. */
  cupDepthMm: number
  /** How far the tip turns forward of the base's line (degrees). */
  curlDeg: number
  /** The two sewn stitches' distance (mm); 0 without a pinch. */
  sewGapMm: number
  /** The most the fold moved any hook against its crown, in the fabric's own
   *  local frame (yarn radii). */
  foldShiftYr?: number
}

export interface FoldedBuild {
  built: BuiltContinuous
  problems: string[]
  metrics: FoldedMetrics
  mould: FoldMould | null
  sewn: [number, number] | null
}

/** The yarn-through-yarn count: unbonded node pairs well off the strand from
 *  each other that sit closer than `d` (mm). */
function closePairs(built: BuiltContinuous, d: number): number {
  const nodes = built.model.nodes
  const cell = d
  const map = new Map<string, number[]>()
  const key = (x: number, y: number, z: number): string => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  nodes.forEach((n, i) => { const k = key(n.x, n.y, n.z); const a = map.get(k); if (a) a.push(i); else map.set(k, [i]) })
  const bonded = new Set<string>()
  for (const c of [...built.model.dist, ...built.model.bend]) bonded.add(c.a < c.b ? `${c.a}:${c.b}` : `${c.b}:${c.a}`)
  let count = 0
  nodes.forEach((n, i) => {
    const cx = Math.floor(n.x / cell), cy = Math.floor(n.y / cell), cz = Math.floor(n.z / cell)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of map.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        if (j <= i + 9) continue
        if (bonded.has(`${i}:${j}`)) continue
        const m = nodes[j]!
        if (Math.hypot(m.x - n.x, m.y - n.y, m.z - n.z) < d) count++
      }
    }
  })
  return count
}

function maxStrain(built: BuiltContinuous): number {
  const nodes = built.model.nodes
  let s = 0
  for (const c of built.model.dist) {
    const a = nodes[c.a]!, b = nodes[c.b]!
    s = Math.max(s, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) / c.rest - 1)
  }
  return s
}

/** The declared shape ranges, per shape, as fractions (the tests and the
 *  audit hold every settled piece to them). Width and length are the folded
 *  piece's over the flat piece's; fold depth and cup depth are over the
 *  folded width; curl in degrees. */
export const FOLDED_RANGES: Record<FoldedShape, { width: [number, number]; length: [number, number]; fold: [number, number]; cup: [number, number]; curlDeg: [number, number] }> = {
  round: { width: [0.45, 1.03], length: [0.8, 1.05], fold: [0.1, 1.2], cup: [0.0, 0.6], curlDeg: [-5, 40] },
  oval: { width: [0.45, 1.03], length: [0.8, 1.05], fold: [0.1, 1.2], cup: [0.0, 0.6], curlDeg: [-5, 40] },
  pointed: { width: [0.45, 1.03], length: [0.8, 1.05], fold: [0.1, 1.2], cup: [0.0, 0.8], curlDeg: [-5, 40] },
  lop: { width: [0.4, 1.03], length: [0.85, 1.05], fold: [0.1, 1.4], cup: [0.0, 0.6], curlDeg: [-5, 40] },
  petal: { width: [0.4, 1.03], length: [0.8, 1.05], fold: [0.1, 1.4], cup: [0.0, 0.8], curlDeg: [-5, 40] },
}

/** Measure a settled folded piece in its own frame (across x, base low y,
 *  front +z). */
export function foldedMetrics(built: BuiltContinuous, flat: { w: number; l: number }, sewn: [number, number] | null): FoldedMetrics {
  const nodes = built.model.nodes.slice(built.anchorPins ?? 0)
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity
  for (const n of nodes) {
    x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); z0 = Math.min(z0, n.z); z1 = Math.max(z1, n.z)
  }
  const L = y1 - y0
  const W = x1 - x0
  // Per band: the middle line's z (the rearmost nodes near x = 0) and the
  // edges' forward reach.
  const depthIn = (a: number, b: number): number => {
    const band = nodes.filter((n) => { const t = (n.y - y0) / L; return t >= a && t <= b })
    if (!band.length) return 0
    let bx0 = Infinity, bx1 = -Infinity
    for (const n of band) { bx0 = Math.min(bx0, n.x); bx1 = Math.max(bx1, n.x) }
    const cx = (bx0 + bx1) / 2
    const mid = band.filter((n) => Math.abs(n.x - cx) < Math.max(1.5, (bx1 - bx0) * 0.08))
    const midZ = mid.length ? Math.min(...mid.map((n) => n.z)) : 0
    return Math.max(...band.map((n) => n.z)) - midZ
  }
  // The middle line's direction at the base and the tip (y-z plane).
  const midAt = (a: number, b: number): { y: number; z: number } => {
    const band = nodes.filter((n) => { const t = (n.y - y0) / L; return t >= a && t <= b && Math.abs(n.x) < Math.max(1.5, W * 0.06) })
    if (!band.length) return { y: y0 + L * (a + b) / 2, z: 0 }
    return { y: band.reduce((s, n) => s + n.y, 0) / band.length, z: band.reduce((s, n) => s + n.z, 0) / band.length }
  }
  const p0 = midAt(0.1, 0.2), p1 = midAt(0.4, 0.5), p2 = midAt(0.75, 0.85)
  const a0 = Math.atan2(p1.z - p0.z, p1.y - p0.y), a1 = Math.atan2(p2.z - p1.z, p2.y - p1.y)
  const all = built.model.nodes
  return {
    widthMm: W,
    lengthMm: L,
    depthMm: z1 - z0,
    flatWidthMm: flat.w,
    flatLengthMm: flat.l,
    foldDepthMm: depthIn(0.05, 0.35),
    cupDepthMm: depthIn(0.7, 0.95),
    curlDeg: ((a1 - a0) * 180) / Math.PI,
    sewGapMm: sewn ? Math.hypot(all[sewn[0]]!.x - all[sewn[1]]!.x, all[sewn[0]]!.y - all[sewn[1]]!.y, all[sewn[0]]!.z - all[sewn[1]]!.z) : 0,
  }
}

/** Build the flat piece, fold and pinch it, and audit it. In the piece's own
 *  frame (across x, base at low y, front +z). */
export function buildFolded(o: FoldedPieceOptions, yr: number, iterations = 520): FoldedBuild {
  validate(o)
  const flat = buildFlat(o, yr)
  const { built } = flat
  const problems: string[] = []
  const audit = (b: BuiltContinuous): string[] => auditProblems({ built: b, recipe: undefined as never }, 'folded piece', 0, yr)
  const flatProblems = audit(built)
  problems.push(...flatProblems.map((p) => `flat: ${p}`))
  const nodes = built.model.nodes
  let fx0 = Infinity, fx1 = -Infinity, fy0 = Infinity, fy1 = -Infinity
  for (const n of nodes) { fx0 = Math.min(fx0, n.x); fx1 = Math.max(fx1, n.x); fy0 = Math.min(fy0, n.y); fy1 = Math.max(fy1, n.y) }
  const flatSize = { w: fx1 - fx0, l: fy1 - fy0 }
  const closeFlat = closePairs(built, yr * 0.7)
  const flatPos = nodes.map((n) => ({ x: n.x, y: n.y, z: n.z }))
  const strainFlat = maxStrain(built)
  let mould: FoldMould | null = null
  let foldShiftYr = 0
  if (o.pinch > 0 || (o.cup ?? 0.25) > 0 || (o.curl ?? 0.3) > 0) {
    mould = foldMould(o, flat, yr)
    // A row piece's plates press its faces (relax.ts mould.depth): each
    // stitch keeps its depth through the settled flat piece's thickness, so
    // the free side edges, which the bend presses outward onto a plate, keep
    // every hook under its crown instead of being squashed flat there.
    if (o.shape !== 'round') {
      const zMean = flatPos.reduce((a, p) => a + p.z, 0) / flatPos.length
      mould = { ...mould, depth: flatPos.map((p) => p.z - zMean) }
    }
    // The fold is worked on the finished piece: the anchor is no longer held
    // (the maker holds the ear, not the ring), and the flat piece's crown
    // canopy (a flat-plane device) gives way to the mould's plates.
    // A round's magic ring sits in the middle of the piece, where the fold
    // runs: it is let go for the fold (the maker holds the ear, not the
    // ring). A row piece's tip chain stays where it was worked.
    const pins = nodes.map((n) => n.w)
    if (o.shape === 'round') for (const n of nodes) n.w = 1
    const zBand = built.model.zBand
    built.model.zBand = undefined
    relax(built.model, {
      collMinDist: yr * 1.25, collK: 0.28, collAdjacency: 9,
      planeZ: 0, planeK: 0, layoutK: o.shape === 'round' ? FOLD_LAYOUT_K : FOLD_LAYOUT_K_ROWS, layoutMode: 'y',
      mould, iterations,
      ...(flat.sewn ? { sew: [{ a: flat.sewn[0], b: flat.sewn[1], max: SEW_GAP_YR * yr }] } : {}),
    })
    nodes.forEach((n, i) => { n.w = pins[i]! })
    built.model.zBand = zBand
    // Interlocks: the flat piece passed the full audit; the folded piece is
    // audited again by the same audit, with every hook seen against its crown
    // in the fabric's own local frame: the fold developed flat round the
    // mould's arcs, then the folded offset turned back by the best rotation
    // of the fabric round that crown.
    const dev = nodes.map((n, i) => developFold(mould!, n, flatPos[i]!.x))
    const shift = foldLinkShift(flatPos, dev, built.links, 4 * yr, yr)
    foldShiftYr = shift.max / yr
    const localBuilt: BuiltContinuous = { ...built, model: { ...built.model, nodes: shift.local.map((p, i) => ({ ...p, w: nodes[i]!.w })) } }
    problems.push(...audit(localBuilt).map((p) => `folded: ${p}`))
    const strain = maxStrain(built)
    if (strain > Math.max(0.2, strainFlat + 0.08)) problems.push(`folded: the yarn stretched ${(strain * 100).toFixed(0)}% (flat ${(strainFlat * 100).toFixed(0)}%)`)
    const close = closePairs(built, yr * 0.7)
    if (close > closeFlat + Math.max(4, closeFlat * 0.25)) problems.push(`folded: ${close} yarn-through-yarn pairs (flat ${closeFlat}) — the fold passes through itself`)
  }
  const metrics = foldedMetrics(built, flatSize, flat.sewn)
  if (flat.sewn && metrics.sewGapMm > 5 * yr) problems.push(`folded: the sewn stitches are ${(metrics.sewGapMm / yr).toFixed(1)} yarn radii apart (a sewing stitch spans 5)`)
  const R = FOLDED_RANGES[o.shape]
  const inR = (v: number, r: [number, number]): boolean => v >= r[0] && v <= r[1]
  const W = metrics.widthMm
  if (!inR(W / flatSize.w, R.width)) problems.push(`shape: folded width ${(W / flatSize.w).toFixed(2)} of flat outside ${R.width.join('-')}`)
  if (!inR(metrics.lengthMm / flatSize.l, R.length)) problems.push(`shape: folded length ${(metrics.lengthMm / flatSize.l).toFixed(2)} of flat outside ${R.length.join('-')}`)
  if (o.pinch > 0 && !inR(metrics.foldDepthMm / W, R.fold)) problems.push(`shape: fold depth ${(metrics.foldDepthMm / W).toFixed(2)} of width outside ${R.fold.join('-')}`)
  if (!inR(metrics.cupDepthMm / W, R.cup)) problems.push(`shape: cup depth ${(metrics.cupDepthMm / W).toFixed(2)} of width outside ${R.cup.join('-')}`)
  if (!inR(metrics.curlDeg, R.curlDeg)) problems.push(`shape: curl ${metrics.curlDeg.toFixed(0)}° outside ${R.curlDeg.join('-')}`)
  return { built, problems, metrics: { ...metrics, foldShiftYr }, mould, sewn: flat.sewn }
}

/** One folded piece as a composition part. Its local frame on the toy: the
 *  front (the hollow) +x, across +y, base to tip +z (the base, the min-z end,
 *  is the seated end, as a pressed lop ear's). `_yr` is the yarn radius
 *  (mm) the preset sized the counts at, informational: the build takes the
 *  composition's. */
export function foldedPart(
  o: FoldedPieceOptions,
  base: { name: string; colourHex: string; place: PartPlacement; sewNote?: string; bend?: AmigurumiPart['bend'] },
  _yr: number,
): AmigurumiPart {
  validate(o)
  const counts = o.shape === 'round' ? foldedRounds(o) : foldedRowCounts(o).slice().reverse().slice(1)
  return {
    name: base.name,
    stitch: 'sc',
    rounds: counts,
    colourHex: base.colourHex,
    words: foldedWords(o),
    ...(base.sewNote ? { sewNote: base.sewNote } : {}),
    ...(base.bend ? { bend: base.bend } : {}),
    place: base.place,
    custom: {
      build: (y: number) => {
        const f = buildFolded(o, y)
        return {
          built: f.built,
          problems: f.problems,
          // A rigid turn into the toy's frame (front +x, across +y, tip +z).
          pose: (p) => ({ x: p.z, y: p.x, z: p.y }),
        }
      },
    },
  }
}
