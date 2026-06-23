# Needlework — STITCH teaching library author prompt

Canonical input for authoring the embroidery STITCH teaching library: one
tutorial per stitch in the controlled dictionary
(`packages/db/scripts/data/embroidery-stitches.ts`, 94 stitches, seeded into the
`Stitch` table as `craft='embroidery'`, slug `embroidery-<slug>`).

The teaching tutorials live on the `stitch-library` shelf as `STITCH` rows with
slug `embroidery-<slug>-stitch`, linked to their dictionary stitch via the
`needlework` upload-metadata block (`needlework.craftStitchSlugs`). Brick stitch,
Pekinese stitch and basket filling were added to the dictionary on 2026-06-23
when the earlier `surface-embroidery` stitch effort was migrated onto the
dictionary and that shelf's STITCH rows were archived.

This is a PREREQUISITE: every needlework pattern links several stitches via the
glossary / technique marks, so the teaching entry must exist first or pattern
stitch-references dangle. Do not invent stitch names — author only what's in the
dictionary; a genuinely missing stitch is a controlled edit to that file + reseed,
routed through the orchestrator.

## One tutorial per stitch

- `type = STITCH`, `craftType = 'needlework'`.
- `subCategorySlug = 'stitch-library'` (the teaching shelf — distinct from the
  themed PATTERN shelves animals/florals/etc.). Create the shelf if absent.
- Title = the stitch's canonical name (e.g. "Satin stitch"). Where the US name
  differs, give it in the opening and as `usName` already on the Stitch row
  (e.g. Holbein / double running; detached chain / lazy daisy).
- `difficulty` mirrors the Stitch row.
- Foundational teaching content: it depicts nothing, so it carries NO cross-craft
  subject/style/occasion tags (those are for patterns). Leave collection tags empty.

## Body structure (in order)

1. **Opening sentence + orientation paragraph** — name the stitch, what it does,
   its family (flat-line / chain / knotted / …), and where it's typically used
   (from the dictionary's `usedFor`). One short paragraph; calm, plain.
2. **`suppliesCard`** ("You will need") — fabric (e.g. cotton or linen), an
   embroidery hoop, the needle type + size suited to the stitch (crewel/embroidery
   needle, or chenille for ribbon/heavier), stranded cotton + strand count,
   scissors. Beginner-mode substitutions where useful.
3. **H2 "Working the stitch"** — an `orderedList` walking the needle path step by
   step: where the needle comes UP, where it goes DOWN, how the loop/wrap is held,
   how to space it. Reference points as "A, B, C" matching the diagram. 5–10 steps.
   For variants (e.g. padded satin), a second H2 for the variation.
4. **The how-to diagram** — added LATER by the procedural-diagram pass (an `image`
   block showing the needle path / working steps). NOT required to publish — the
   completeness gate does not require a diagram on STITCH tutorials, so author the
   text now (describe the needle path clearly in the `orderedList`); the diagram
   attaches as an enhancement. See "Diagrams" below.
5. **`troubleshooter`** — 3–5 common failures → cause → fix (e.g. satin: "stitches
   look loose and gappy → tension too slack / strands untwisted → keep the hoop
   drum-tight and lay strands flat with a laying tool").
6. **H2 "Where it's used"** — a closing paragraph pointing to the kinds of designs
   that use it, with `techniqueLink` marks to 1–3 related stitches (e.g. satin →
   long-and-short, padded satin).

## Diagrams (coordinate — do NOT fork a renderer)

The diagram is a HOW-TO (needle path, numbered steps), NOT a finished-piece render
(that's the loom). Per [[project_crochet_diagrams]] the path is a hybrid:
- Prefer tracing clean public-domain stitch diagrams (Dillmont's *Encyclopedia of
  Needlework* and Weldon's are PD and have excellent stitch diagrams) into crisp
  in-house SVG — reference + redraw in our line style, never a republished scan.
- In-house SVG for any stitch the PD sources don't cover well.
- If the loom exposes reusable embroidery stitch-illustration primitives, use those
  rather than building a parallel diagram system. Confirm with the orchestrator
  before standing up any new diagram engine.
Each diagram: a single clean line drawing of the fabric grid-free ground, the
worked stitch, the needle, and A/B/C entry/exit points matching the steps. Stored
as Media, embedded via the `image` block. 960px wide, transparent or off-white.

## Glossary

Register the cross-cutting embroidery terms once as `GlossaryTerm`
(categoryId = needlework): e.g. "coming up / going down", "loop", "anchor", "laying
the strands", "couching", "tension", "strand count", "evenweave", "tail". In each
tutorial wrap the FIRST use of a registered term in a `glossaryTooltip` mark
(`termId` = slug). Every registered term must be used at least once inline, and
every wrapped term must be registered (the glossary-coverage rule).

## Voice + QC

- Voice spec `docs/voice-spec-2026-05-21.md` §3.4 (craft technique) + the
  quick-reference 10-point self-critique. UK English, reading age ~12, calm
  authority. NO em/en dashes, no banned phrases ("perfect for", "simply", "just",
  "elevate", "nestled", "boasts", "whether you're"). Numbers + measurements in cm
  (canonical) — the renderer converts to inches per user preference.
- Length ~600–1200 words.
- Publishes through the standard gate: non-empty body, no NaN/undefined/placeholder,
  glossary coverage satisfied (every registered term used inline, every wrapped term
  registered). The PATTERN completeness rule does NOT fire on STITCH type, and a
  diagram is NOT gate-required — so the text publishes now; diagrams follow.

## Batch + scale

Author across families, beginner-first within each family (running/back/stem before
long-and-short; chain before its variants; French knot before bullion). Spread the
work so the foundational stitches (the ~30 a pattern will actually reference most:
running, back, stem, split, satin, long-and-short, seed, straight, chain, detached
chain, blanket, fly, feather, fishbone, French knot, bullion, colonial knot,
couching, woven wheel, satin variants) land first. Suitable for a Sonnet fill-worker
pool; the driver supplies the Stitch-row list + this prompt + the voice spec.
