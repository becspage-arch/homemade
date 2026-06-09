# Crochet amigurumi authoring - worker prompt template

## Voice - MANDATORY pre-read

Before drafting any amigurumi brief, read `docs/voice-spec-quick-reference.md`
end-to-end and `docs/crochet-author.md` for the shared crochet voice
and the per-type PATTERN structure. This file extends that template
with the specific structural and metadata requirements for stuffed,
multi-piece, in-the-round amigurumi.

---

## What this prompt is for

An amigurumi is a stuffed, three-dimensional creature or character
worked in tight single crochet in the round, then assembled from
multiple pieces. The reader's expectation is that each piece closes
cleanly, the assembly produces a recognisable creature, and the
finished object holds its shape under handling.

This file is the canonical input for a worker session that drafts one
amigurumi PATTERN. A worker drafts the prose, the structure, the
metadata, the row-by-row pattern for every piece, the assembly
instructions, and the embellishments list. A worker NEVER generates
the hero image; the image pipeline runs separately.

## How a drafting session uses this file

1. Reads this whole file, `docs/crochet-author.md`,
   `docs/voice-spec-quick-reference.md`, and `docs/crochet-anti-tells.md`.
2. Reads the brief it was handed.
3. Decomposes the creature into shape primitives (head as sphere or
   pear, body as pear or capsule, limbs as capsules or cylinders,
   etc).
4. Calls the shape math library at
   `apps/web/src/lib/crochet/amigurumi/shape-math.ts` to produce an
   AmigurumiPiece for each part. Never hand-types row-by-row patterns
   when the shape is a primitive - the library is the source of truth.
5. Defines `pieces[]`, `buildOrder`, and `assemblyInstructions` on the
   upload input.
6. Drafts the body following the structure in § Body structure.
7. Self-critiques against voice rules and the in-file checklist.
8. Writes the JSON to disk.

## Shape decomposition

Most amigurumi creatures decompose into a small set of shapes.
Reference table:

| Creature part | Most common shape |
|---|---|
| Round head (cat, bear, mouse) | SPHERE |
| Long head (rabbit, fox snout) | OVAL |
| Round body (snowman, beanie character) | SPHERE |
| Pear body (sitting figure, fruit, drop shape) | PEAR |
| Cylinder body (tube creatures, beans) | CYLINDER |
| Long body (snake, worm, long arms) | CAPSULE |
| Cone tail or hat | CONE |
| Limb with rounded end (paw, mitten finger) | CAPSULE |
| Limb with open end (sewn-on arm) | CYLINDER closeBothEnds: false |
| Ear (small round) | SPHERE small diameter |
| Ear (pointed) | CONE small base |
| Foot or paw (flat oval) | OVAL |
| Nose (small protruding) | SPHERE diameter ~ 1.5 cm |

## Calling the shape math library

The worker imports the primitives directly and runs each piece with
its dimensions.

```ts
import { sphere, pear, capsule, cone } from '@/lib/crochet/amigurumi/shape-math'

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 } // tight sc amigurumi gauge

const head = sphere({ diameterCm: 10, gauge: GAUGE, label: 'head' })
const body = pear({
  maxDiameterCm: 12, topDiameterCm: 8, heightCm: 14,
  gauge: GAUGE, label: 'body',
})
const armL = capsule({ diameterCm: 4, lengthCm: 8, gauge: GAUGE, label: 'arm-left' })
const armR = capsule({ diameterCm: 4, lengthCm: 8, gauge: GAUGE, label: 'arm-right' })
const earL = sphere({ diameterCm: 3, gauge: GAUGE, label: 'ear-left' })
const earR = sphere({ diameterCm: 3, gauge: GAUGE, label: 'ear-right' })
const tail = cone({ baseDiameterCm: 3, heightCm: 5, gauge: GAUGE, label: 'tail' })
```

Each call returns an AmigurumiPiece with the row-by-row instructions
already filled in. The worker writes them into the pattern body
verbatim (the renderer handles formatting).

## Input contract

Standard `TutorialUploadInput` from `docs/crochet-author.md`, with
these specific requirements:

- `type: "PATTERN"`
- `subCategorySlug: "amigurumi"`
- `crochet.shapeCategory: "AMIGURUMI"`
- `crochet.construction: "AMIGURUMI"`
- `crochet.constructionDirection: "MULTI_PIECE"` per the
  `ConstructionDirection` schema enum added by
  `phase_crochet_autopilot_foundation_001`.
- `crochet.bodyShape` - one of `SPHERE`, `CYLINDER`, `CONE`, `OVAL`,
  `CAPSULE`, `PEAR`, `COMPOSITE` per the `BodyShape` enum. Use
  `COMPOSITE` for multi-piece creatures that combine several body
  shapes; reserve the named primitives for single-piece amigurumi.
- `crochet.primaryYarnWeightSlug` - required, typically `dk`,
  `sport`, or `fingering` for amigurumi.
- `crochet.primaryHookSlug` - required, typically one or two sizes
  smaller than the yarn label recommends, to produce a dense fabric
  that hides the stuffing.
- `crochet.gaugeText` - required.
- `crochet.finishedSizeText` - required, height of the finished
  creature.
- `crochet.sizesGraded` - null (amigurumi are not body-sized).
- `crochet.yardageBySize` - `{ "default": <total grams> }` summed
  across pieces.
- `crochet.pieceCount` - number of distinct pieces.
- `crochet.pieces` - array of `{ name, sectionLabel, makeQuantity,
  stuffing, stitchCountTotal }` records, one per piece.
- `crochet.buildOrder` - string array listing pieces in the order
  the reader should make them, ending with `"Assembly"`.
- `crochet.craftStitchSlugs` - every stitch used. Most amigurumi
  use only `crochet-single-crochet`, `crochet-magic-ring`,
  `crochet-increase`, `crochet-decrease`, `crochet-slip-stitch`,
  occasionally `crochet-chain` for foundation rows.
- `techniqueSlugs` + `criticalTechniques` + `aliases` - populated
  per pipeline-setup standards. Amigurumi need at minimum:
  `crochet-magic-ring`, `crochet-invisible-decrease`,
  `crochet-stuffing`, `crochet-safety-eye-placement`,
  `crochet-amigurumi-assembly`.

## Body structure

An amigurumi PATTERN body lays out:

1. **Intro** - one paragraph. Name the creature in plain English
   (a small bear, a sitting cat, a round mouse). State the yarn
   weight + hook + finished height. End with the one sentence on
   what the piece is for (a gift, a desk companion, a child's
   first soft toy).
2. **What you need** - `suppliesCard` block with yarn weight slug
   + total grams per colour, hook size, tapestry needle, scissors,
   stitch markers, toy stuffing (polyester fibrefill or wool roving),
   safety eyes (if used) with size in mm, embroidery floss for
   facial features.
3. **Gauge** - H2 "Gauge". Quote the gaugeText verbatim, then a
   short sentence on swatch tension. Amigurumi gauge tells the
   reader whether the stuffing will show through (loose) or the
   fabric will be too stiff (very tight).
4. **Finished size** - H2 "Finished size". Height in cm with the
   tolerance noted (give or take a centimetre depending on stuffing).
5. **Pieces** - H2 "Pieces". Bullet list naming each piece, its
   shape, and how many to make. Pull directly from the
   `pieces[]` array.
6. **Stitches used** - H2 "Stitches used". UK + US abbreviations
   for every stitch.
7. **Build order** - H2 "Build order". An ordered list naming each
   piece in the order to make them. The brief reasoning for the
   order: small pieces first so they're ready when the body is
   assembled, head and body last because they take longest.
8. **Pattern** - H2 "Pattern" with H3 sub-sections per piece. Each
   H3 is the piece name. Body of each H3:
   - One sentence on what the piece is and how many to make.
   - The row-by-row pattern, one round per line, ending stitch
     count in brackets. Pull directly from the AmigurumiPiece's
     `rowByRow` field.
   - The stuffing instruction (when to stuff, how firmly) pulled
     from `stuffingNotes`.
9. **Assembly** - H2 "Assembly". Step-by-step instructions for
   joining pieces. Each step names the join method by its
   common name (ladder stitch, mattress stitch, whip stitch,
   slip-stitched join, picked-up join). Use the `joiner` library
   for the canonical description if unsure.
10. **Embellishments** - H2 "Embellishments". Safety eye placement
    (with round numbers), embroidered facial features, any
    accessories or attached details. Cite the safety eye size in
    mm.
11. **Finishing** - H2 "Finishing". Weaving in ends, final shaping
    notes (e.g. "press the seams down so the head sits flush on
    the body").
12. **Care** - H2 "Care". Hand-wash cool, lay flat to dry, do not
    tumble (amigurumi stuffing distorts in the dryer).
13. **What to try next** - short H2. Variations: different colour
    palette, additional accessories, scaling up to a larger version
    by switching to a heavier yarn weight.

## Self-critique before write

Before writing the JSON, run through this list. If any answer is "no",
fix the body before saving.

- Does the intro avoid marketing language ("perfect for", "ideal
  for", "irresistibly cute")?
- Does the intro avoid em dashes?
- Are the per-piece row-by-row patterns identical to the
  AmigurumiPiece.rowByRow values in `pieces[]`?
- Does every piece in `pieces[]` appear in `buildOrder`?
- Does `buildOrder` reference only pieces that exist in `pieces[]`?
- Does the Assembly section name a join method for every joint
  between two pieces?
- Are safety eyes specified with size in mm and placement by round
  number?
- Does every entry in `glossaryTerms[]` appear in the body as an
  inline `glossaryTooltip` mark with the matching `termSlug`?
- Are UK terminology defaults observed?
- Is the hero unset? (Hero is the image pipeline's job.)
- Does the body avoid academic register words?
- Does the body avoid soft-medical / efficacy claims?

## Shape examples

Use these as voice anchors when drafting piece intros.

**SPHERE head, small bear:**
> Head - make 1. Worked in the round from a magic ring, increasing
> to forty-two stitches at the equator, then mirrored decreases back
> down to close. Stuff firmly through round eighteen, then taper the
> stuffing toward the closure so the head holds its rounded shape.

**PEAR body, sitting figure:**
> Body - make 1. Worked in the round from a magic ring at the top of
> the neck. Sharp increases to thirty-six stitches form the narrower
> upper body, then gentler increases to sixty stitches form the
> lower belly. Work straight for the seat section, then decrease back
> down to close. Stuff the belly firmly so the seat sits flat.

**CAPSULE arm, small bear:**
> Arms - make 2. Each arm works in the round from a magic ring at
> the paw end. Increase to eighteen stitches at the rounded paw,
> work straight to the shoulder, then decrease and close. Stuff
> lightly through the middle so the arm hangs naturally.

## Scope - out (HARD lines)

- DO NOT hand-type row-by-row patterns when the shape is a primitive.
  Call the shape math library.
- DO NOT generate the hero image.
- DO NOT use em dashes, en dashes, or marketing register.
- DO NOT publish a pattern with buildOrder referencing a piece not
  in pieces[], or with pieces[] containing a piece not in buildOrder.
- DO NOT skip safety eye placement instructions when safety eyes
  are listed in supplies.
- DO NOT recommend safety eyes for amigurumi intended as gifts for
  children under three; recommend embroidered features instead and
  state the age guidance.
- DO NOT use academic register words.

## What QC rules will check

An amigurumi PATTERN runs through `packages/db/scripts/qc-audit.ts`
at the publish gate. The crochet-specific rules that apply:

- `amigurumi-piece-count-mismatch` - buildOrder must reference only
  pieces in pieces[].
- `amigurumi-assembly-incomplete` - buildOrder must include every
  piece in pieces[].
- `amigurumi-shape-math-implausible` - every piece must have a name
  and a positive makeQuantity.
- `hook-yarn-weight-mismatch` - hook mm size must fit the yarn weight
  per the standard table.
- `gauge-out-of-range` - gauge stated must fall in the plausible
  range for the yarn weight.

All five are BLOCK severity. A pattern that trips any of them does
not pass the publish gate.
