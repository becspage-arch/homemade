/**
 * WHAT THE LOOM CAN BUILD TODAY — the single list the crochet autopilot plans
 * against.
 *
 * The hero of a crochet pattern is the loom's render of the pattern's own
 * stored program ([[feedback_hero_must_be_exact_pattern]]), so the autopilot may
 * only commission a design the engine can actually build, settle and render. A
 * brief for a crocheted cardigan is not a hard brief, it is an IMPOSSIBLE one:
 * the stitch engine has no garment shaping, so the pattern could never carry a
 * truthful hero and would never publish. Rather than let the planner discover
 * that a candidate at a time, the buildable set is declared here, once, and the
 * planner draws only from it.
 *
 * The catalogue's ambition lives elsewhere — `CROCHET_SHELVES` in
 * `../categories.ts` carries a target for all sixty-seven item types, including
 * the ones the engine cannot reach yet. Those simply have no generation lane;
 * they sit at their target waiting. As the engine grows (tubes for hats, lace
 * for doilies, shaping for garments) a shelf moves into this file and starts
 * filling. Nothing else has to change.
 *
 * Sizes below are in STITCHES, because that is what the engine builds in, and
 * they are derived from the settled cell the proofs measured (STITCH_ENGINE.md
 * §8f): at worsted, plain double crochet (UK) settles about 5.67 mm a stitch
 * and 5.04 mm a row; half treble 6.62 × 7.85; treble 7.14 × 13.21; the 1×1 post
 * rib at aran packs to 5.52 mm a column and 15.10 mm a row. So a true 10 cm
 * coaster is 18 × 20 and a true 45 cm headband strip is 82 columns. The
 * declared finished size is never guessed from these — the publisher measures
 * the RELAXED geometry and declares that — but the envelopes keep a brief in
 * the range where the settled size will be a real object.
 */

import type { Staging } from '@/lib/loom/crochet/engine/program'

/**
 * The treatments the engine builds. Each maps onto one `CrochetProgram.form`
 * (or the composition layer), plus the design choice that makes it interesting.
 */
export type CrochetTreatment =
  /** One stitch, one colour, worked flat. The plainest end of the range. */
  | 'grid-plain'
  /** Flat rows in colour bands — a striped dishcloth, a banded coaster. */
  | 'grid-stripe'
  /** Flat bands of DIFFERENT stitches: dc, htr, tr, back- and front-loop ridges. */
  | 'grid-texture'
  /** A 1×1 front/back post rib strip, staged flat as a finished band. */
  | 'grid-postrib'
  /** Tapestry crochet: the colour changes stitch by stitch to draw a picture. */
  | 'grid-tapestry'
  /** A flat circle worked in the round off a magic ring. */
  | 'disc'
  /** One stuffed ball worked in a continuous spiral. */
  | 'sphere'
  /** Several audited balls and tapered tubes, sewn into a figure. */
  | 'amigurumi'

/** The forms that come out of the grid builder (mixed stitches per row). */
export const GRID_TREATMENTS: CrochetTreatment[] = [
  'grid-plain',
  'grid-stripe',
  'grid-texture',
  'grid-postrib',
  'grid-tapestry',
]

export interface FormEnvelope {
  treatment: CrochetTreatment
  /** Stitches across, [min, max]. Grid + disc treatments only. */
  cols?: [number, number]
  /** Rows up, [min, max]. Grid treatments only. */
  rows?: [number, number]
  /** Rounds worked, [min, max]. Disc only. */
  rounds?: [number, number]
  /** How the finished object is staged for its hero. */
  staging: Staging
  /** The yarn weight this treatment is built at. */
  yarnWeight: 'dk' | 'worsted' | 'aran'
  /** A one-line description of the object, for the planner prompt. */
  note: string
  /**
   * Set (to the reason, in plain words) to take this envelope out of the
   * autopilot's hands for now. A paused envelope is still BUILDABLE — the
   * backlog keeps counting its ideas, `shelfIsBuildable` still says yes and a
   * hand-run proof can still build it — but the `context` stage hands out no
   * quota for it, and a shelf whose every envelope is paused gets no briefs at
   * all. Unpausing is deleting the line, once the reason is resolved.
   */
  paused?: string
}

/**
 * COMPILE BUDGET. Relaxation runs over every stitch and is single threaded; the
 * proofs measured roughly 11 ms a stitch on a four-core box, and the web task
 * runs at half a vCPU, so budget about double that. 1,600 stitches lands near
 * 35 seconds, which fits inside one Inngest step with room under the gateway's
 * ~100 s ceiling. It is also, at the settled sc cell, a 23 × 20 cm panel — a
 * genuine showpiece rather than a swatch.
 *
 * This is the ceiling for a CRON batch, where several ideas compile in the same
 * window. A one-off manual run of a single big piece can be given more with
 * BULK_CROCHET_MAX_CELLS.
 */
export const BULK_CROCHET_MAX_CELLS = Number(process.env.BULK_CROCHET_MAX_CELLS) || 1600

/**
 * THE CLI BUDGET — for the routine's `crochet-autopilot.ts expand`, and only
 * there. A cloud session waits for its own Fargate render, so it is not bound
 * by the in-step ceiling above; what bounds it is the render. Timed 9 October
 * 2026 on the probe task (`homemade-loom-render-probe`, 4 vCPU / 8 GB, the
 * production crochet script at 150 samples, resY 1100) for a grid-tapestry
 * panel, plus the local settle on the 4-vCPU cloud VM:
 *
 *   cells        settle (VM)   scene JSON   Blender on Fargate (two runs)
 *   40 x 40         24 s          18 MB       246 s, 248 s
 *   60 x 60         66 s          41 MB       444 s, 241 s
 *   80 x 80        154 s          72 MB       267 s, 446 s
 *   100 x 100      320 s         113 MB      killed at 260 s (out of memory, exit 137)
 *
 * Blender time is NOT driven by the stitch count in this range — it is
 * bimodal (~4 or ~7.5 minutes) by whichever Fargate host the task lands on —
 * so the real limits are the 8 GB task (100 x 100 never renders) and the
 * settle, which the render stage runs again before uploading. Worst case for
 * one render-stage candidate (settle + 35 s provisioning + 7.5 min Blender +
 * ~1 min Fal finish) is about 10 minutes at 60 x 60 and 11.5 at 80 x 80, with
 * the out-of-memory wall one step above. 3,600 cells keeps a render under
 * about twelve minutes with room to spare. The Inngest budget
 * (`BULK_CROCHET_MAX_CELLS`) and the Studio's (`TAPESTRY_MAX_CELLS`) are
 * unchanged.
 */
export const CLI_CROCHET_MAX_CELLS = 3600

/**
 * The buildable shelves, and what each may be built as.
 *
 * A shelf listed here gets a generation lane; a shelf absent from here does
 * not, however far behind its target it is. That is the whole safety property:
 * the planner cannot commission a form the loom would refuse to render.
 */
export const CROCHET_FORMS: Record<string, FormEnvelope[]> = {
  coaster: [
    {
      treatment: 'grid-plain',
      cols: [16, 20],
      rows: [18, 24],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A square coaster about 10 cm across, worked flat in one colour.',
    },
    {
      treatment: 'grid-stripe',
      cols: [16, 22],
      rows: [18, 26],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A square coaster about 10 cm across in colour bands.',
    },
    {
      treatment: 'disc',
      rounds: [7, 10],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A round coaster worked in a spiral from a magic ring, 9 to 13 cm across.',
    },
  ],
  dishcloth: [
    {
      treatment: 'grid-stripe',
      cols: [30, 38],
      rows: [26, 34],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'An everyday cloth about 20 cm square, worked in two-row colour bands.',
    },
    {
      treatment: 'grid-texture',
      // Fewer rows than a plain piece of the same size: a treble row is more
      // than twice the height of a double crochet row, so a banded cloth
      // reaches the same 20 cm in fewer of them.
      cols: [30, 38],
      rows: [20, 36],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A textured cloth about 20 cm square, worked in bands of different stitches.',
    },
    {
      treatment: 'grid-plain',
      cols: [30, 38],
      rows: [32, 42],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A plain cloth about 20 cm square in one colour.',
    },
  ],
  potholder: [
    {
      treatment: 'grid-texture',
      cols: [28, 34],
      rows: [22, 38],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A thick square potholder about 17 cm across, worked in stitch bands.',
    },
    {
      treatment: 'grid-stripe',
      cols: [28, 34],
      rows: [30, 38],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A square potholder about 17 cm across in colour bands.',
    },
  ],
  'motif-granny-square': [
    {
      treatment: 'grid-texture',
      cols: [22, 30],
      rows: [18, 34],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A square motif 13 to 17 cm across, worked in stitch bands, to join into a blanket.',
    },
    {
      treatment: 'grid-stripe',
      cols: [22, 30],
      rows: [24, 34],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A square motif 13 to 17 cm across in concentric colour bands.',
    },
    {
      treatment: 'disc',
      rounds: [8, 12],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A round motif worked from a magic ring, to join or applique.',
    },
  ],
  bookmark: [
    {
      treatment: 'grid-plain',
      cols: [8, 12],
      rows: [34, 46],
      staging: 'flatband',
      yarnWeight: 'dk',
      note: 'A narrow bookmark strip about 5 cm wide and 20 cm long.',
    },
    {
      treatment: 'grid-stripe',
      cols: [8, 12],
      rows: [34, 46],
      staging: 'flatband',
      yarnWeight: 'dk',
      note: 'A narrow striped bookmark strip about 5 cm wide and 20 cm long.',
    },
  ],
  headband: [
    {
      treatment: 'grid-postrib',
      cols: [76, 88],
      rows: [5, 7],
      staging: 'flatband',
      yarnWeight: 'aran',
      note: 'An adult ear-warmer band, a long 1x1 post-rib strip seamed into a loop.',
    },
  ],
  'wall-hanging': [
    {
      treatment: 'grid-tapestry',
      // The lane picks the size from the motif itself (`motifGridSide`, from
      // 24 a side up) and the panel's shape from the motif's aspect
      // (`tapestryGridForMotif`, which may take one axis down to 20), so a bold
      // simple motif stays near the low end. The
      // top of the range is only reachable under the CLI budget below — the
      // in-step budget still caps an Inngest build at 40 x 40.
      cols: [20, 60],
      rows: [20, 60],
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A tapestry-crochet picture panel to hang, the colour changing stitch by stitch.',
      // Rebecca, 7 September 2026: the routine skips this shelf until the
      // tapestry reopen proof (flat poster motifs, fill the frame, legible at
      // thumbnail size) has her sign-off. Do not remove without it.
      paused:
        'Tapestry reopen: wall-hanging pictures left dead borders and read poorly at thumbnail size; paused until Rebecca signs off the flat-motif proof.',
    },
  ],
  ornament: [
    {
      treatment: 'sphere',
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A small stuffed bauble to hang, worked as one spiral from a magic ring.',
    },
  ],
  pincushion: [
    {
      treatment: 'sphere',
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A firm little stuffed ball to keep pins in.',
    },
  ],
  amigurumi: [
    {
      treatment: 'amigurumi',
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A stuffed figure: a body, a head, a muzzle, ears and four limbs, each worked separately and sewn on.',
    },
  ],
  'animal-toy': [
    {
      treatment: 'amigurumi',
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A stuffed animal figure worked in pieces and sewn together.',
    },
  ],
  doll: [
    {
      treatment: 'amigurumi',
      staging: 'flatlay',
      yarnWeight: 'worsted',
      note: 'A stuffed doll figure worked in pieces and sewn together.',
    },
  ],
  'baby-toy-lovey': [
    {
      treatment: 'sphere',
      staging: 'flatlay',
      yarnWeight: 'dk',
      note: 'A soft stuffed ball rattle for a baby, with no small parts.',
    },
    {
      treatment: 'amigurumi',
      staging: 'flatlay',
      yarnWeight: 'dk',
      note: 'A soft stuffed baby figure worked in pieces, with embroidered features rather than safety eyes.',
    },
  ],
}

/** Every shelf the loom can build for today. */
export const CROCHET_BUILDABLE_SHELF_SLUGS: string[] = Object.keys(CROCHET_FORMS)

/** Can the loom build anything at all for this shelf today? */
export function shelfIsBuildable(slug: string): boolean {
  return (CROCHET_FORMS[slug]?.length ?? 0) > 0
}

/**
 * Why the autopilot is not filling this shelf right now, or null when it is.
 * A shelf is paused only when EVERY envelope it has is paused; a shelf with
 * one live envelope still gets quota, and the paused envelopes simply drop out
 * of what the session is offered (`activeEnvelopesForShelf`).
 */
export function shelfPausedReason(slug: string): string | null {
  const envelopes = envelopesForShelf(slug)
  if (!envelopes.length || envelopes.some((e) => !e.paused)) return null
  return envelopes[0]!.paused!
}

/** The buildable shelves the autopilot may hand quota to today. */
export function activeCrochetShelfSlugs(): string[] {
  return CROCHET_BUILDABLE_SHELF_SLUGS.filter((slug) => shelfPausedReason(slug) === null)
}

/** Every paused shelf with its reason, for the plan context to state openly. */
export function pausedCrochetShelves(): { slug: string; reason: string }[] {
  return CROCHET_BUILDABLE_SHELF_SLUGS.flatMap((slug) => {
    const reason = shelfPausedReason(slug)
    return reason ? [{ slug, reason }] : []
  })
}

/** A shelf's envelopes minus the paused ones — what a session may plan in. */
export function activeEnvelopesForShelf(slug: string): FormEnvelope[] {
  return envelopesForShelf(slug).filter((e) => !e.paused)
}

/** The envelopes a shelf may be built in, or an empty list. */
export function envelopesForShelf(slug: string): FormEnvelope[] {
  return CROCHET_FORMS[slug] ?? []
}

/** One envelope by shelf + treatment, or null when the pairing is not allowed. */
export function envelopeFor(slug: string, treatment: string): FormEnvelope | null {
  return envelopesForShelf(slug).find((e) => e.treatment === treatment) ?? null
}

/** The treatments a shelf allows, as a plain list for the planner prompt. */
export function treatmentsForShelf(slug: string): CrochetTreatment[] {
  return envelopesForShelf(slug).map((e) => e.treatment)
}
