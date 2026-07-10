/**
 * Stitch dictionary — each stitch defined ONCE by its parameters, not its picture.
 * THE single source of truth: topology params (STITCHES), and the full per-swatch
 * recipe (SWATCH_RECIPES: gauge, rows, view, audit size, reference photo, lock
 * status). The render driver, the audit, and the one-command pipeline all consume
 * this table, so they can never drift apart — and adding a stitch is one entry
 * here + its yarn-path excursion, nothing else.
 *
 * For the crochet basics the defining topology difference is HEIGHT — how many
 * times the yarn is wrapped / how tall the post is. `heightFactor` scales a
 * stitch's loop height off the base (sc) row height; the relaxer resolves the
 * actual shape from there. `gaugeYr` is column spacing in yarn radii — set per
 * stitch from its REAL reference photo (audit 2026-07-02/03): sc/hdc pack dense,
 * dc's posts lean together, treble opens into channels.
 */

export type StitchId =
  | 'ch' | 'slst' | 'sc' | 'hdc' | 'dc' | 'tr' | 'dtr'
  | 'scblo' | 'scflo' | 'fpdc' | 'bpdc' | 'bobble'
  | 'k'

/**
 * One shaping instruction, in crochet-pattern terms, applied to the row's stitch:
 *   'st'  = one plain stitch into the next below-crown   (consumes 1, makes 1)
 *   'inc' = TWO full stitches into the next below-crown  (consumes 1, makes 2)
 *   'dec' = st2tog: one stitch drawn over the next TWO below-crowns (consumes 2, makes 1)
 * A row is a ShapeOp[] in WORK order; its consumption must exactly match the row
 * below (the builder throws otherwise — a mis-counted pattern is a bug, not fabric).
 */
export type ShapeOp = 'st' | 'inc' | 'dec'

export interface StitchDef {
  id: StitchId
  /** Post height as a multiple of the base (sc) row height. */
  heightFactor: number
  /** Column spacing (gauge) in yarn radii — calibrated against the reference photo. */
  gaugeYr: number
  /** How many top loops the stitch leaves (its "head"). Always 2 for these. */
  topLoops: number
}

export const STITCHES: Record<StitchId, StitchDef> = {
  ch: { id: 'ch', heightFactor: 0.5, gaugeYr: 2.2, topLoops: 2 }, // chain gauge = its pull-through pitch (yarnPath ch branch)
  slst: { id: 'slst', heightFactor: 0.8, gaugeYr: 1.9, topLoops: 2 }, // shortest worked stitch — flat + tight, but a row is still ≈1 yarn thick (can't pack thinner)
  sc: { id: 'sc', heightFactor: 1.0, gaugeYr: 1.8, topLoops: 2 }, // packs DENSE — the reference's gaps are pinpricks, not holes
  hdc: { id: 'hdc', heightFactor: 1.45, gaugeYr: 2.0, topLoops: 2 }, // dense like sc — notches, not holes
  dc: { id: 'dc', heightFactor: 3.2, gaugeYr: 2.3, topLoops: 2 }, // open, but posts lean on each other — slits not gaps
  tr: { id: 'tr', heightFactor: 4.2, gaugeYr: 2.45, topLoops: 2 }, // taller = airier: open channels between posts
  dtr: { id: 'dtr', heightFactor: 5.4, gaugeYr: 2.45, topLoops: 2 }, // double treble — taller again
  // sc worked into back-loop-only / front-loop-only: same height as sc; the loop
  // left unworked floats as a horizontal ridge (handled in yarnPath by loopMode).
  scblo: { id: 'scblo', heightFactor: 1.0, gaugeYr: 1.8, topLoops: 2 },
  scflo: { id: 'scflo', heightFactor: 1.0, gaugeYr: 1.8, topLoops: 2 },
  // front/back post dc: dc-height, but worked AROUND the post below (yarnPath rings
  // the stem). fp pops proud, bp recedes — the basis of post ribbing + basketweave.
  fpdc: { id: 'fpdc', heightFactor: 3.0, gaugeYr: 1.9, topLoops: 2 }, // post stitches pack DENSE — ribs touch into solid fabric
  bpdc: { id: 'bpdc', heightFactor: 3.0, gaugeYr: 1.9, topLoops: 2 },
  // bobble: several partial dc in one stitch gathered to one top → a raised bump.
  // Usually dotted on an sc background, so it borrows the row's height and just
  // bulges forward; this factor only applies to an all-bobble row.
  bobble: { id: 'bobble', heightFactor: 1.4, gaugeYr: 2.3, topLoops: 2 },
  // KNIT (new craft, same engine — own path builder in knitPath.ts). Stockinette
  // stitches are a touch wider than tall: ~5 sts + ~7 rows per inch in worsted.
  k: { id: 'k', heightFactor: 1.1, gaugeYr: 2.6, topLoops: 2 },
}

/**
 * Everything needed to build, verify, and render one standard swatch. Keys are
 * the pipeline's swatch names: every StitchId plus the pattern aliases
 * ('postrib' = alternating fp/bp ribbing, 'basketweave' = fp/bp blocks,
 * 'bobbles' = bobbles dotted on an sc ground).
 */
export type SwatchArg =
  | StitchId | 'postrib' | 'basketweave' | 'bobbles'
  | 'scinc' | 'scdec' | 'hdcinc' | 'hdcdec' | 'dcinc' | 'dcdec'
  | 'mrdisc' | 'stockinette' | 'garter' | 'knitrib'

export interface SwatchRecipe {
  /** The dictionary stitch driving gauge + row height for this swatch. */
  stitch: StitchId
  /** Worked rows in the standard swatch (0 = the foundation chain alone). */
  rows: number
  /** Stitches per row for the standard audit/render swatch. */
  auditW: number
  /** Per-cell override for mixed-stitch swatches (ribbing, basketweave, dotted bobbles). */
  pattern?: (j: number, c: number) => StitchId
  /**
   * Which path builder makes this swatch. Default = the flat grid builder
   * (buildContinuous). 'shaped' = variable-width rows (increases/decreases,
   * needs shapeRows). 'round' = worked in the round off a magic ring (needs
   * roundCounts). 'knit' = the knit path builder (loops through loops).
   */
  builder?: 'shaped' | 'round' | 'knit'
  /** builder 'shaped': the per-row shaping ops, work order, off auditW foundation stitches. */
  shapeRows?: ShapeOp[][]
  /** builder 'round': stitches per round of the spiral (each round +6 = flat disc). */
  roundCounts?: number[]
  /** builder 'knit': true = garter (worked face alternates per course); false/absent = stockinette. */
  knitFlip?: boolean
  /**
   * builder 'knit': the pull-side pattern. 'stockinette' (every loop one face),
   * 'garter' (face flips per course), 'rib' (per-column face → 1×1 rib). Takes
   * precedence over knitFlip; absent falls back to knitFlip ? garter : stockinette.
   */
  knitFace?: 'stockinette' | 'garter' | 'rib'
  /** Chain relaxes with its own profile (soft squash + table floor); rounds hold their radius. */
  relaxProfile: 'worked' | 'chain' | 'round'
  /** Hero camera tilt (0 = flat top-down; 16 = tall posts; 40 = side-on for relief). */
  tiltDeg: number
  /** Render ply twist (0.1 = rustic wool; 0.05 = calmer, for clean columns). */
  twist: number
  /**
   * The real swatch photo this stitch is CALIBRATED against (download to
   * .loom-scratch for comparison only — an internal fixture, never shipped).
   */
  referenceUrl: string
  /**
   * locked   = Rebecca signed off ours vs the reference.
   * reverify = locked once, but the Phase-1b reference re-comparison is unfinished.
   * wip      = construction not signed off — do not present as done.
   */
  status: 'locked' | 'reverify' | 'wip'
  lockedOn?: string
  /**
   * Work every row from the same face (no turn) so a loop-only stitch's unworked
   * loops all pile on the front and the ridge shows on EVERY row — how a stitch
   * dictionary showcases blo/flo. Real crochet (blo ribbing is worked this way in
   * the round). Only affects blo/flo; plain stitches ignore it.
   */
  noTurn?: boolean
  /**
   * Column-spacing (gauge) override in yarn radii for THIS swatch only, leaving the
   * driving stitch's shared dictionary gauge untouched. Used by postrib to pack its
   * alternating fp/bp columns tighter than a plain all-fpdc swatch without moving
   * the locked fpdc/bpdc gauge.
   */
  gaugeYr?: number
}

export const SWATCH_RECIPES: Record<SwatchArg, SwatchRecipe> = {
  ch: {
    stitch: 'ch', rows: 0, auditW: 16, relaxProfile: 'chain', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2020/04/ET_HowToChain_05B.jpg',
    status: 'locked', lockedOn: '2026-07-02',
  },
  slst: {
    stitch: 'slst', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://www.lavisch.com/site/wp-content/uploads/2015/09/Slip-Stitch-Crochet_3-600x600.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  sc: {
    stitch: 'sc', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2020/07/EYE_SC.jpg',
    status: 'locked', lockedOn: '2026-07-02',
  },
  hdc: {
    stitch: 'hdc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2021/01/ET_HDC_24.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  dc: {
    stitch: 'dc', rows: 8, auditW: 11, relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://eyeloveknots.com/wp-content/uploads/2020/04/ET_DC_25.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  tr: {
    stitch: 'tr', rows: 8, auditW: 10, relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://sarahmaker.com/wp-content/uploads/2023/01/sarahmakertreble-crochet-stitch-15-819x1024.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  dtr: {
    stitch: 'dtr', rows: 8, auditW: 9, relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://theloopholefox.com/wp-content/uploads/2022/09/Double-Treble-Crochet-US-Stitch.jpg',
    status: 'locked', lockedOn: '2026-07-03',
  },
  scblo: {
    stitch: 'scblo', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.05, // calmer twist so the ridge line isn't lost in ply noise
    referenceUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0101200px-500x375.jpg',
    status: 'locked', lockedOn: '2026-07-07', // faithful flat-turned: ridge shows every OTHER row (odd rows' ridge is correctly on the hidden back face). Rebecca signed off consistent-with-locked-sc.
  },
  scflo: {
    stitch: 'scflo', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0091200px-500x375.jpg',
    status: 'locked', lockedOn: '2026-07-07',
  },
  fpdc: {
    stitch: 'fpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : 'fpdc'), // row 0 establishes posts to wrap
    // clean single-stitch reference (raised front posts standing proud), replacing
    // the old fringepost9 colourwork-cable photo (acrochetedsimplicity.com)
    referenceUrl: 'https://www.acrochetedsimplicity.com/wp-content/uploads/2017/01/fpdc-7-1024x683.jpg',
    status: 'locked', lockedOn: '2026-07-07', // raised front posts read correctly vs single-stitch ref
  },
  bpdc: {
    stitch: 'bpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : 'bpdc'),
    // back posts recede → front shows horizontal step-bars, not raised posts (theloopholefox.com)
    referenceUrl: 'https://theloopholefox.com/wp-content/uploads/2022/09/Back-Post-Double-Crochet-12.jpg',
    status: 'locked', lockedOn: '2026-07-07', // recessed posts / horizontal-bar front read correctly
  },
  postrib: {
    stitch: 'fpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : c % 2 === 0 ? 'fpdc' : 'bpdc'), // raised rib / recessed valley
    gaugeYr: 1.5, // pack the alternating fp/bp columns tighter (fpdc's 1.9 left daylight between ribs); real rib columns touch
    // plain 1x1 fpdc/bpdc rib, flat lay, columns packed tight — a much cleaner
    // match than the old fringepost9 colourwork-cable photo (moralefiber.blog)
    referenceUrl: 'https://doradoes.co.uk/wp-content/uploads/2021/04/double-front-post-back-post-dc-rib-1024x1024.jpg',
    status: 'locked', lockedOn: '2026-07-07', // gauge 1.9->1.5 closed the rib gaps; now reads as distinct packed vertical ribs matching the reference
  },
  basketweave: {
    stitch: 'dc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => {
      if (j === 0) return 'dc' // establish posts to wrap
      const block = Math.floor(c / 3)
      const rb = Math.floor((j - 1) / 2)
      return (block + rb) % 2 === 0 ? 'fpdc' : 'bpdc' // 3-wide blocks, swap every 2 rows
    },
    referenceUrl: 'https://daisyfarmcrafts.com/wp-content/uploads/2017/04/IMG_0708.jpg', // daisyfarmcrafts — cream basketweave swatch
    status: 'wip',
  },
  bobble: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.1,
    // Bumps on a staggered polka-dot grid over plain sc. Edge columns stay PLAIN
    // (real bobble/popcorn patterns keep the selvedge plain — a big cluster hard
    // against the pinned edge, with no turning-chain slack for j>0 in the grid
    // builder, strangles its base hook; the audit caught exactly that at c0).
    pattern: (j, c) => bobbleDot(j, c),
    referenceUrl: '', // WIP — find a real bobble swatch photo before presenting
    status: 'wip',
  },
  bobbles: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.1,
    pattern: (j, c) => bobbleDot(j, c),
    referenceUrl: '',
    status: 'wip',
  },
  // ---- SHAPING (sc family) ----
  // Growing trapezoid: inc at both ends of every row (8 → 20 over 6 rows).
  scinc: {
    stitch: 'sc', rows: 6, auditW: 8, builder: 'shaped',
    shapeRows: growPlan(8, 6),
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://sarahmaker.com/wp-content/uploads/2022/03/single-crochet-increase-2-819x1024.jpg',
    status: 'wip',
  },
  // Shrinking trapezoid: sc2tog at both ends of every row (16 → 6 over 5 rows).
  scdec: {
    stitch: 'sc', rows: 5, auditW: 16, builder: 'shaped',
    shapeRows: shrinkPlan(16, 5),
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://christacodesign.com/wp-content/uploads/2021/03/Single-crochet-two-together-edges-2-1024x768.jpg',
    status: 'wip',
  },
  // hdc/dc shaping — the SAME shaped builder (emitDecrease + the inc path are
  // stitch-generic; only the driving stitch's height/gauge change). Taller posts,
  // so fewer rows keep the swatch a sensible size. References are single-stitch
  // increase/decrease swatches for that stitch.
  hdcinc: {
    stitch: 'hdc', rows: 5, auditW: 8, builder: 'shaped',
    shapeRows: growPlan(8, 5),
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://cdn.shopify.com/s/files/1/0620/7180/0037/files/image-81-1024x576_2021-01.png', // crochetmelovely — finished hdc increase
    status: 'wip',
  },
  hdcdec: {
    stitch: 'hdc', rows: 5, auditW: 16, builder: 'shaped',
    shapeRows: shrinkPlan(16, 5),
    relaxProfile: 'worked', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://christacodesign.com/wp-content/uploads/2021/04/half-double-crochet-together-tutorial-2-720x720.jpg', // christacodesign — hdc2tog swatch
    status: 'wip',
  },
  dcinc: {
    stitch: 'dc', rows: 4, auditW: 8, builder: 'shaped',
    shapeRows: growPlan(8, 4),
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: '', // find a real dc-increase swatch photo before presenting (lazy-loaded on the sites checked)
    status: 'wip',
  },
  dcdec: {
    stitch: 'dc', rows: 4, auditW: 14, builder: 'shaped',
    shapeRows: shrinkPlan(14, 4),
    relaxProfile: 'worked', tiltDeg: 16, twist: 0.1,
    referenceUrl: 'https://christacodesign.com/wp-content/uploads/2017/09/2017-09-19_13-22-04_606-1024x768.jpg', // christacodesign — dc2tog swatch
    status: 'wip',
  },
  // Flat amigurumi circle: magic ring, 6 sc, +6 per round in a continuous spiral.
  mrdisc: {
    stitch: 'sc', rows: 6, auditW: 16, builder: 'round',
    roundCounts: [6, 12, 18, 24, 30, 36],
    relaxProfile: 'round', tiltDeg: 0, twist: 0.1,
    referenceUrl: 'https://sarahmaker.com/wp-content/uploads/2022/03/crochet-circle-7-819x1024.jpg',
    status: 'wip',
  },
  // ---- KNIT (new craft, knit path builder) ----
  k: {
    stitch: 'k', rows: 9, auditW: 12, builder: 'knit', relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/03/stockinette-stitch-right-side-1024x684.jpg',
    status: 'wip',
  },
  stockinette: {
    stitch: 'k', rows: 9, auditW: 12, builder: 'knit', relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/03/stockinette-stitch-right-side-1024x684.jpg',
    status: 'wip',
  },
  garter: {
    stitch: 'k', rows: 10, auditW: 12, builder: 'knit', knitFlip: true, relaxProfile: 'worked', tiltDeg: 24, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2021/04/close-up-of-a-swatch-in-garter-stitch-1024x684.jpg',
    status: 'wip',
  },
  // 1×1 rib: alternating knit/purl columns → vertical ribs. Per-column pull side
  // (even cols +z, odd −z), constant up each column. tiltDeg for the raised ribs.
  knitrib: {
    stitch: 'k', rows: 10, auditW: 12, builder: 'knit', knitFace: 'rib', relaxProfile: 'worked', tiltDeg: 24, twist: 0.05,
    referenceUrl: 'https://nimble-needles.com/wp-content/uploads/2020/04/rib-stitch-swatch-close-up-1024x684.jpg',
    status: 'wip',
  },
}

/**
 * Bobble placement: staggered dots on the odd worked rows, confined to the
 * INTERIOR columns (2..W-2) so no cluster lands on the pinned selvedge — a real
 * bobble pattern keeps its edges plain. Rows stagger by 2 columns for the
 * classic offset polka-dot field.
 */
function bobbleDot(j: number, c: number): StitchId {
  if (j === 0 || j % 2 === 0) return 'sc'
  const off = (Math.floor(j / 2) % 2) * 2 // 0 or 2 — stagger row to row
  return c >= 2 && c <= 12 && (c - 2 - off) % 4 === 0 ? 'bobble' : 'sc'
}

/** inc at both ends of every row: w0 → w0 + 2·rows. */
function growPlan(w0: number, rows: number): ShapeOp[][] {
  return Array.from({ length: rows }, (_, j) => {
    const below = w0 + 2 * j
    return ['inc', ...(Array(below - 2).fill('st') as ShapeOp[]), 'inc'] as ShapeOp[]
  })
}

/** sc2tog at both ends of every row: w0 → w0 − 2·rows. */
function shrinkPlan(w0: number, rows: number): ShapeOp[][] {
  return Array.from({ length: rows }, (_, j) => {
    const below = w0 - 2 * j
    return ['dec', ...(Array(below - 4).fill('st') as ShapeOp[]), 'dec'] as ShapeOp[]
  })
}
