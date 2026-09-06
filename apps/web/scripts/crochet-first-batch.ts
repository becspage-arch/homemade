/**
 * THE FIRST CROCHET BATCH — six patterns spanning the range, for judging.
 *
 * Rebecca does not judge a pattern from a chart or from structured data. She
 * judges it from a photograph of the made thing, and pattern volume is never
 * built before that photograph exists ([[feedback_render_before_volume]]). So
 * before the autopilot is ever switched on, one small set is authored, rendered
 * through the loom, and LOOKED AT.
 *
 * These six are that set, and they are deliberately a RANGE
 * ([[feedback_pattern_complexity_range]]): the plainest possible beginner
 * square, a two-colour striped cloth, a piece worked in the round, a stuffed
 * figure, a textured panel, and a many-colour pictorial showpiece. A set that
 * lands on one complexity level tells you nothing about the other four.
 *
 * They are held here as briefs plus DESIGNS rather than as finished programs,
 * because that is exactly what the autopilot's two model calls produce: the
 * planner writes the brief, the designer writes the design, and
 * `crochet-design.ts` expands the design into the stitch program
 * deterministically. Running this set therefore exercises the same expansion,
 * the same audit gate, the same render, the same completeness gate and the same
 * publisher as a cron batch. Only the two model calls are supplied by hand.
 *
 * Run them with `scripts/bulk-crochet-batch.ts --seed`.
 */

import type { CrochetBrief } from '../src/lib/studio/generation/bulk/crochet-planner'
import type { CrochetDesign } from '../src/lib/studio/generation/bulk/crochet-design'
import { subjectKey } from '../src/lib/studio/generation/bulk/subject-key'

export interface SeedEntry {
  brief: CrochetBrief
  /** Absent for the tapestry lane, which builds its grid from an illustration. */
  design?: CrochetDesign
}

function brief(
  input: Omit<CrochetBrief, 'subjectKey' | 'source' | 'plannerMode' | 'dressed'>,
): CrochetBrief {
  return {
    ...input,
    subjectKey: subjectKey(input.subject),
    source: 'model',
    plannerMode: 'constrained',
    dressed: true,
  }
}

export const CROCHET_FIRST_BATCH: SeedEntry[] = [
  // ── 1 · the plainest end ───────────────────────────────────────────────────
  {
    brief: brief({
      slug: 'crochet-sage-solid-coaster',
      name: 'Sage solid coaster',
      subject:
        'A plain solid coaster in soft sage, worked flat in even rows of double crochet, dense enough to sit a hot mug on',
      shelf: 'coaster',
      shelfName: 'Coasters & Placemats',
      treatment: 'grid-plain',
      brief: {
        craft: 'crochet',
        territory: 'modern-botanicals',
        look: 'soft-modern',
        itemType: 'coaster',
        palette: 'scandi-calm',
        size: 'small',
        difficulty: 'beginner',
        concept: 'A plain solid coaster in soft sage.',
      },
    }),
    design: {
      treatment: 'grid-plain',
      cols: 18,
      rows: 20,
      palette: { sage: '#9caf94' },
      baseColourKey: 'sage',
    },
  },

  // ── 2 · flat colourwork ────────────────────────────────────────────────────
  {
    brief: brief({
      slug: 'crochet-rust-and-oat-striped-cloth',
      name: 'Rust and oat striped cloth',
      subject:
        'An everyday kitchen cloth in two-row bands of rust and oatmeal, the stitch changing between double crochet and half treble so the stripes sit in gentle ridges',
      shelf: 'dishcloth',
      shelfName: 'Dishcloths & Washcloths',
      treatment: 'grid-stripe',
      brief: {
        craft: 'crochet',
        territory: 'cottagecore-mushroom',
        look: 'boho-folk',
        itemType: 'dishcloth',
        palette: 'boho-earth',
        size: 'medium',
        difficulty: 'beginner',
        concept: 'A two-colour ridged kitchen cloth in rust and oatmeal.',
      },
    }),
    design: {
      treatment: 'grid-stripe',
      cols: 35,
      // Fifteen two-row bands, alternating colour AND stitch, so the cloth reads
      // as ridged stripes rather than flat ones. An odd number of bands means
      // the first and last match, which is the classic striped-cloth look.
      bands: Array.from({ length: 15 }, (_, i) => ({
        rows: 2,
        stitch: (i % 2 === 0 ? 'sc' : 'hdc') as 'sc' | 'hdc',
        colourKey: i % 2 === 0 ? 'rust' : 'oat',
      })),
      palette: { rust: '#a8542f', oat: '#efe2c8' },
      baseColourKey: 'rust',
    },
  },

  // ── 3 · worked in the round ────────────────────────────────────────────────
  {
    brief: brief({
      slug: 'crochet-mustard-spiral-motif',
      name: 'Mustard spiral motif',
      subject:
        'A round motif worked in a spiral from a magic ring in warm mustard, to join into a blanket or stitch on to a bag',
      shelf: 'motif-granny-square',
      shelfName: 'Motifs & Granny Squares',
      treatment: 'disc',
      brief: {
        craft: 'crochet',
        territory: 'modern-botanicals',
        look: 'boho-folk',
        itemType: 'motif-granny-square',
        palette: 'boho-earth',
        size: 'small',
        difficulty: 'intermediate',
        concept: 'A warm mustard round motif worked in a spiral.',
      },
    }),
    design: {
      treatment: 'disc',
      rounds: 10,
      palette: { mustard: '#cf9a4a' },
      baseColourKey: 'mustard',
    },
  },

  // ── 4 · a stuffed figure, from the audited presets ─────────────────────────
  {
    brief: brief({
      slug: 'crochet-little-toffee-bear',
      name: 'Little toffee bear',
      subject:
        'A small sitting bear in toffee brown with a cream muzzle and cream paw pads, a stitched nose and small safety eyes',
      shelf: 'amigurumi',
      shelfName: 'Amigurumi',
      treatment: 'amigurumi',
      brief: {
        craft: 'crochet',
        territory: 'kawaii-animals-pets',
        look: 'storybook-whimsical',
        itemType: 'amigurumi',
        palette: 'foxglove-autumn',
        size: 'small',
        difficulty: 'intermediate',
        concept: 'A small sitting toffee bear with a cream muzzle and paw pads.',
      },
    }),
    design: {
      treatment: 'amigurumi',
      amigurumi: {
        base: 'bear',
        size: 'M',
        mainHex: '#9a6c40',
        contrastHex: '#efe2c8',
        // Real safety eyes are about a tenth of the head's width; anything
        // larger renders as a glass marble (STITCH_ENGINE.md §8e-2 round 2).
        eyeMm: 6,
        nose: true,
        paws: true,
      },
    },
  },

  // ── 5 · texture ────────────────────────────────────────────────────────────
  {
    brief: brief({
      slug: 'crochet-duck-egg-ridge-potholder',
      name: 'Duck egg ridge potholder',
      subject:
        'A thick square potholder in duck egg blue, worked in bands of double crochet, half treble and treble with a raised back-loop ridge across the middle',
      shelf: 'potholder',
      shelfName: 'Potholders & Trivets',
      treatment: 'grid-texture',
      brief: {
        craft: 'crochet',
        territory: 'coastal-seaside',
        look: 'soft-modern',
        itemType: 'potholder',
        palette: 'coastal-breeze',
        size: 'medium',
        difficulty: 'advanced',
        concept: 'A thick banded potholder in duck egg blue with a raised ridge.',
      },
    }),
    design: {
      treatment: 'grid-texture',
      cols: 30,
      // Twenty-five rows, chosen so the settled panel comes out roughly square:
      // a treble row is more than twice the height of a double crochet row.
      bands: [
        { rows: 6, stitch: 'sc' },
        { rows: 3, stitch: 'hdc' },
        { rows: 2, stitch: 'dc' },
        { rows: 4, stitch: 'scblo' },
        { rows: 2, stitch: 'dc' },
        { rows: 3, stitch: 'hdc' },
        { rows: 5, stitch: 'sc' },
      ],
      palette: { 'duck-egg': '#a8ccc9' },
      baseColourKey: 'duck-egg',
    },
  },

  // ── 6 · the many-colour showpiece ─────────────────────────────────────────
  {
    brief: brief({
      slug: 'crochet-cottage-lane-panel',
      name: 'Cottage lane panel',
      subject:
        'A tapestry crochet picture panel showing a stone cottage at the end of a lane, hollyhocks against its wall, a tree in leaf and a wide summer sky',
      shelf: 'wall-hanging',
      shelfName: 'Wall Hangings & Art',
      treatment: 'grid-tapestry',
      brief: {
        craft: 'crochet',
        territory: 'painterly-landscapes',
        look: 'cottagecore-botanical',
        itemType: 'wall-hanging',
        palette: 'wildflower-meadow',
        size: 'showpiece',
        difficulty: 'showpiece',
        concept: 'A tapestry crochet cottage lane in high summer.',
      },
    }),
  },
]
