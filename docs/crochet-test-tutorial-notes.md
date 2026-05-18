# Crochet — test tutorial review notes

**Tutorials reviewed:**
- `crochet-magic-ring` — STITCH / foundations / DK / BEGINNER
- `granny-square-basic-three-round` — PATTERN / motifs / DK cotton / BEGINNER

**Session date:** 2026-05-18

---

## Preflight

- `docs/crochet-author.md` v1 in place.
- Five sub-categories under `crochet` Category per
  `seed-crochet-taxonomy.ts` (stitches, motifs, homewares, garments,
  foundations).
- `data/yarn-weights.ts` carries `dk` (the yarn weight the test
  tutorials assume).
- `data/crochet-hooks.ts` carries `crochet-hook-4-0mm` (the hook the
  test tutorials assume).
- Stitch slugs the tests reference all exist in `data/stitches.ts`:
  `crochet-chain`, `crochet-slip-stitch`, `crochet-treble`,
  `crochet-magic-ring`, `crochet-treble-cluster`.
- Tool slugs the tests reference all exist in `data/tools.ts`:
  `crochet-hook-4-0mm`, `tapestry-needle`, `craft-scissors`,
  `measuring-tape-soft`, `blocking-mat`, `blocking-pins`.

No master-table gaps flagged at preflight.

---

## Voice register check

**Magic ring (STITCH):** voice is calm and instructional. The opening
paragraph ("Most crochet motifs start in the round...") names the
historical context (Victorian chain-loop default), the alternative
the tutorial covers (magic ring), and what it solves (the open hole
problem). The step-by-step uses concrete language ("Pinch the
crossing of the two strands between the off-hand thumb and ring
finger") rather than the soft-focus "you should now..." voice the
brand guidelines reject.

The "How to know it's right" section frames the test by what the
maker would actually do — "Held to the light, no daylight passes
through the centre" — rather than vague "looks good". Clean.

**Granny square (PATTERN):** voice carries through. The intro
states the structure ("three rounds of granny clusters") and the
factual frame ("the most-made motif in crochet") without ornament.
The UK/US terminology paragraph is matter-of-fact: "UK 'treble' is
US 'double crochet'; UK 'double crochet' does not appear here." No
condescension to readers who don't know which is which; no
over-explaining the distinction.

The finishing paragraph names the actual work involved ("one square
needs about three minutes of finishing work — more than the crochet
itself takes") which lands the reality of crocheted-motif-based
projects: the finishing is the bigger time sink than the crochet.

No "easy", no "simple", no "you've got this" lines in either
tutorial. One marginal register flag in the magic ring tutorial:
the opening paragraph ends "the magic ring replaces the chain-loop.
The ring stays adjustable until the round is anchored, then the tail
pulls it shut." This is the right register — concrete, factual —
but reads slightly drier than the granny square's intro. Decision:
keep, the dryness suits a foundations STITCH article.

---

## Em-dash audit

Spot-check across both tutorials. Both pass the voice-check
em-dash rule (max one per paragraph, max one per sentence) on a
manual scan. The magic ring tutorial's "Step 6 — Close the ring"
paragraph uses one em-dash in the body sentence ("Find the cut tail
end — it sits on top of the original loop — and pull it firmly"),
which is two em-dashes in one paragraph and technically breaks the
rule. **Decision needed by Rebecca:** rewrite to remove one
em-dash, or accept as a legitimate appositive pair. The
deterministic voice-check CLI will catch this if it's wrong; flagging
here so the question is asked.

Otherwise clean.

---

## Cross-link gaps

The granny square PATTERN uses one `techniqueLink` mark to the
magic-ring tutorial (slug `crochet-magic-ring`). When both DRAFTs
upload together, the link resolves immediately. No
`missing-techniques.md` entries should be triggered.

The magic ring tutorial uses a `techniqueLink` to itself (technically
`crochet-magic-ring` references the slug it is). That is correct —
the renderer falls back to plain text if the link points at the
current page, and the inline mark is what flags `techniqueSlugs[]`
coverage in the validator.

---

## Tools registry hits

**Magic ring** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `crochet-hook-4-0mm` | ✓ (master CrochetHook table) | ✓ (4 mm hook) |
| `craft-scissors` | ✓ | ✓ |
| `tapestry-needle` | ✓ | ✓ |

Clean. Note: `crochet-hook-4-0mm` lives in the master `CrochetHook`
table, not in `tools.ts`. The upload script's `recipeTools` resolves
against the `Tool` table. This may fail upload — see "Schema gap
flagged" below.

**Granny square** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `crochet-hook-4-0mm` | ✗ (in CrochetHook table only) | ✓ |
| `tapestry-needle` | ✓ | ✓ |
| `craft-scissors` | ✓ | ✓ |
| `measuring-tape-soft` | ✓ | ✓ |
| `blocking-mat` | ✓ | ✓ |
| `blocking-pins` | ✓ | ✓ |

The same `crochet-hook-4-0mm` issue as above.

---

## Schema gap flagged — crochet hook in two tables

The `crochet-hook-4-0mm` slug exists in the master `CrochetHook`
table (separate from `Tool`). When listed in `recipeTools`, the
upload script looks up against `Tool` and will fail. Three
resolutions, in increasing complexity:

1. **(a) Remove `crochet-hook-4-0mm` from `recipeTools`** in both
   tutorials. The hook is already structurally referenced via
   `crochet.primaryHookSlug`; `recipeTools` is for additional kit
   that the master tables don't cover. The `recipeTools` "What you
   need" section can mention the hook in prose without a structured
   ref.
2. **(b) Add `crochet-hook-4-0mm` as a row in `tools.ts`** so the
   slug resolves in either table. Doubles up storage but works
   without changes to the upload script.
3. **(c) Extend the upload script** to look up against
   `CrochetHook` when a `crochet-hook-*` slug is given in
   `recipeTools`. Cleanest long-term fix; needs script change.

**Recommended:** option (a) for this session. I'll update the JSON
to drop the hook from `recipeTools` before uploading. Long term,
option (c) is the right fix.

---

## Glossary tooltips

**Magic ring** — registered: `magic-ring`, `working-yarn`,
`yarn-over`, `anchor-the-ring`, `first-round`.

Inline tooltip check:
- `magic-ring` → ✓ (opening paragraph)
- `working-yarn` → ✓ (Step 1)
- `yarn-over` → ✓ (Step 3)
- `anchor-the-ring` → ✗ (registered but not used inline anywhere)
- `first-round` → ✗ (registered but not used inline anywhere)

**Action required:** either delete `anchor-the-ring` and
`first-round` from the registered list, or wrap one inline use of
each in the body. Per the homemade voice rules, registered-but-not-
used and used-but-not-registered are both wrong. **I'll wrap these
inline before uploading.**

**Granny square** — registered: `granny-cluster`, `chain-space`,
`turning-chain`, `steam-blocking`.

Inline tooltip check:
- `granny-cluster` → ✓ (opening paragraph)
- `chain-space` → ✓ (opening paragraph)
- `turning-chain` → ✗ (registered but not used inline anywhere)
- `steam-blocking` → ✓ (Finishing section)

**Action required:** drop `turning-chain` from glossaryTerms OR
wrap one inline use. **I'll wrap inline before uploading.**

---

## Technique annotation per Worker C update

Both tutorials populate:
- `techniqueSlugs[]` — every inline `techniqueLink` slug appears
- `criticalTechniques[]` — subset of `techniqueSlugs` without which
  the tutorial doesn't work
- `aliases[]` — common phrasings for the reverse-sweep

Coverage:

**Magic ring:**
- `techniqueSlugs`: `crochet-magic-ring`
- `criticalTechniques`: `crochet-magic-ring`
- `aliases`: `adjustable ring`, `magic circle`, `magic loop`

**Granny square:**
- `techniqueSlugs`: `crochet-magic-ring`, `crochet-treble`,
  `crochet-blocking`
- `criticalTechniques`: `crochet-magic-ring`, `crochet-treble`
- `aliases`: `granny square`, `basic granny square`,
  `three-round granny`

Note: `crochet-treble` and `crochet-blocking` aren't published
Tutorial rows yet — the upload script will log them to
`missing-techniques.md`. That's expected behaviour.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render until a
pre-launch image sweep. Strong sources for both:

**Magic ring:** Wikimedia Commons has a number of close-up crochet
in-progress shots from craft-fair photographers; verify each shows
the ring at the closed-centre moment, not a chain-loop start.
Old Book Illustrations has Weldon's Practical Crochet plates with
ring-start hexagons that would render very well as period
illustration heroes.

**Granny square:** Pexels and Unsplash both have ample finished
granny square photography — verify each shows the colour-block
construction with squares clearly visible (not a generic blanket,
not solid crochet). The de Dillmont Encyclopedia of Needlework
(Project Gutenberg #20776) has lithograph plates of motif crochet
that would suit a period-illustration hero.

---

## Open questions for Rebecca

1. **`crochet-hook-4-0mm` slug split between `Tool` and `CrochetHook`
   tables** — see Schema gap flagged above. My take: option (a)
   (drop from `recipeTools`) for now; option (c) (extend upload
   script) later. Confirm direction before next crochet batch
   lands at scale.
2. **`crochet-blocking` and `crochet-treble` as `techniqueSlugs`** —
   both will log to `missing-techniques.md`. Should the crochet
   pipeline include a "foundations batch" of these tutorials before
   the autopilot flips, or let the autopilot naturally produce them
   as part of the fill?
3. **Em-dash audit edge case** — magic ring Step 6 has a paragraph
   with two em-dashes in an appositive ("Find the cut tail end — it
   sits on top of the original loop — and pull it firmly"). Hard
   rule says max one per paragraph; voice-check CLI will catch.
   Should the rule be softened for appositive pairs, or should I
   rewrite to comply strictly?
4. **`crochet.primaryHookSlug` on a STITCH tutorial** — the magic
   ring sets `primaryHookSlug: 'crochet-hook-4-0mm'` even though
   the author prompt says it's optional for STITCH. The 4 mm hook
   is named in the body, so the structured reference is
   appropriate. Just flagging that the field is set; if Rebecca
   prefers STITCH rows to leave it null, I'll drop it next time.

---

## Summary

Two crochet DRAFTs ready for upload after small fixes:
1. **Remove `crochet-hook-4-0mm` from `recipeTools` on both** — the
   hook is referenced via `crochet.primaryHookSlug` which is the
   correct structural path.
2. **Fix glossary coverage** — wrap inline tooltips for
   `anchor-the-ring`, `first-round` (magic ring) and `turning-chain`
   (granny square), or drop them from `glossaryTerms`.

Both tutorials sit comfortably in the author prompt's length bands
(magic ring ~900 words STITCH; granny square ~1,500 words PATTERN —
motif lower bound is 1,200). Voice register is calm and factual
throughout. Technique annotation per Worker C update is fully
populated.

Status: **ready for Rebecca's review after the two fixes above land
in the JSONs.** pipelineStatus stays NOT_READY; the flip script
exists and is not run this session.
