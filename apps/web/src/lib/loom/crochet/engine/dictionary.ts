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
}

/**
 * Everything needed to build, verify, and render one standard swatch. Keys are
 * the pipeline's swatch names: every StitchId plus the pattern aliases
 * ('postrib' = alternating fp/bp ribbing, 'basketweave' = fp/bp blocks,
 * 'bobbles' = bobbles dotted on an sc ground).
 */
export type SwatchArg =
  | StitchId | 'postrib' | 'basketweave' | 'bobbles'

export interface SwatchRecipe {
  /** The dictionary stitch driving gauge + row height for this swatch. */
  stitch: StitchId
  /** Worked rows in the standard swatch (0 = the foundation chain alone). */
  rows: number
  /** Stitches per row for the standard audit/render swatch. */
  auditW: number
  /** Per-cell override for mixed-stitch swatches (ribbing, basketweave, dotted bobbles). */
  pattern?: (j: number, c: number) => StitchId
  /** Chain relaxes with its own profile (soft squash + table floor). */
  relaxProfile: 'worked' | 'chain'
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
    status: 'reverify', // render done 2026-07-03, reference comparison pending
  },
  scflo: {
    stitch: 'scflo', rows: 8, auditW: 16, relaxProfile: 'worked', tiltDeg: 0, twist: 0.05,
    referenceUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0091200px-500x375.jpg',
    status: 'reverify',
  },
  fpdc: {
    stitch: 'fpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : 'fpdc'), // row 0 establishes posts to wrap
    referenceUrl: 'https://moralefiber.blog/wp-content/uploads/2017/10/fringepost9-1.jpg',
    status: 'reverify',
  },
  bpdc: {
    stitch: 'bpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : 'bpdc'),
    referenceUrl: 'https://moralefiber.blog/wp-content/uploads/2017/10/fringepost9-1.jpg',
    status: 'reverify',
  },
  postrib: {
    stitch: 'fpdc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => (j === 0 ? 'dc' : c % 2 === 0 ? 'fpdc' : 'bpdc'), // raised rib / recessed valley
    // plain 1x1 fpdc/bpdc rib, flat lay, columns packed tight — a much cleaner
    // match than the old fringepost9 colourwork-cable photo (moralefiber.blog)
    referenceUrl: 'https://doradoes.co.uk/wp-content/uploads/2021/04/double-front-post-back-post-dc-rib-1024x1024.jpg',
    status: 'reverify',
  },
  basketweave: {
    stitch: 'dc', rows: 8, auditW: 12, relaxProfile: 'worked', tiltDeg: 40, twist: 0.05,
    pattern: (j, c) => {
      if (j === 0) return 'dc' // establish posts to wrap
      const block = Math.floor(c / 3)
      const rb = Math.floor((j - 1) / 2)
      return (block + rb) % 2 === 0 ? 'fpdc' : 'bpdc' // 3-wide blocks, swap every 2 rows
    },
    referenceUrl: '', // deferred to combos — find one before presenting
    status: 'wip',
  },
  bobble: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.1,
    // bumps on a polka-dot grid over plain sc, offset row to row
    pattern: (j, c) => (j > 0 && j % 2 === 1 && (c + (Math.floor(j / 2) % 2) * 2) % 4 === 0 ? 'bobble' : 'sc'),
    referenceUrl: '', // WIP — find a real bobble swatch photo before presenting
    status: 'wip',
  },
  bobbles: {
    stitch: 'sc', rows: 8, auditW: 14, relaxProfile: 'worked', tiltDeg: 24, twist: 0.1,
    pattern: (j, c) => (j > 0 && j % 2 === 1 && (c + (Math.floor(j / 2) % 2) * 2) % 4 === 0 ? 'bobble' : 'sc'),
    referenceUrl: '',
    status: 'wip',
  },
}
