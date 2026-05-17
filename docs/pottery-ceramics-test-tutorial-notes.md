# Pottery & ceramics — test tutorial review notes

**Tutorials reviewed:**
- `pinch-pot` — PATTERN / hand-building-no-equipment / BEGINNER
- `wedging-clay-spiral-method` — TECHNIQUE / clay-fundamentals / BEGINNER

**Session date:** 2026-05-17

---

## Preflight

- `docs/pottery-ceramics-author.md` v1 exists.
- 6 sub-categories seeded under `pottery-ceramics` Category per
  `seed-pottery-ceramics-taxonomy.ts` (hand-building-no-equipment,
  surface-decoration, throwing, glazing, firing, clay-fundamentals).
- Clay bodies `air-dry-clay`, `polymer-clay`, `earthenware-red`,
  `earthenware-white` present in `data/clay-bodies.ts`.
- Schema columns `Tutorial.requiresKiln` and `Tutorial.requiresWheel`
  added in migration `20260623030000_phase_pottery_pipeline_001`
  (commit 27d95cc).
- Tools `wooden-rib`, `pottery-sponge`, `needle-tool`, `wire-cutter`
  present in `data/tools.ts`.

**Gap flagged at preflight (BLOCKING for `requiresKiln` /
`requiresWheel` honesty):**

The pottery pipeline commit (27d95cc) added the `Tutorial.requiresKiln`
and `Tutorial.requiresWheel` columns to the Prisma schema, but the
`TutorialUploadInput` type in
`packages/db/scripts/upload-tutorial-types.ts` does NOT yet expose
these fields. There is also no `pottery` block on the upload type for
`requiredClayBodies` or `requiredCraftMaterials`. The upload script
will therefore land both pottery DRAFTs with the default
`requiresKiln = false` and `requiresWheel = false` — which is
actually correct for both tutorials in this batch (the pinch pot has
a no-kiln default path and the wedging tutorial is equipment-free),
but the data shape isn't author-controllable yet.

Both drafts work around the gap by omitting the field entirely; the
defaults are correct for the no-equipment track. A throwing or
glazing tutorial in a later batch will need the upload type to expose
these fields before it can be authored honestly.

---

## Voice register check

**Pinch pot (PATTERN):** Voice is calm, hands-on, and concrete. The
opening paragraph names the form, the process, the time, the two
clay paths in a single block. Step-by-step body uses the
geometry-and-pressure vocabulary the pottery author prompt calls for
("press the thumb of your dominant hand straight down into the
centre", "pinch firmly but evenly — the clay moves between the thumb
and the fingers"). Bernard Leach is cited for the form's history.

**Wedging (TECHNIQUE):** Same register, with the technique-tutorial
specificity — body mechanics described explicitly ("the rocking
motion comes from the hips and shoulders, not from the wrists or
forearms"), the rhythm called out as the experienced potter's tell,
and the cut test surfaced as the deterministic quality check. No
"trust the process" or "you've got this!" pep around the difficulty
of learning a physical skill.

No "easy" / "quick" / "simple" marketing language in either body.
Both safety preambles are proportional and factual. No medical claims
(this is the pottery pipeline, not herbal). No brand endorsement.

---

## Em-dash audit

Both drafts had one em-dash issue on first pass each:
- **pinch-pot:** an appositive pair in the "Start the first round"
  paragraph (em-dash before "where the wall meets the bottom" and
  again after) — rewritten with parentheses.
- **wedging:** two em-dashes in the safety infoPanel body (one in
  the Workspace paragraph, one in the Clay dust paragraph) — rewritten
  with colons.

Both clean after the rewrite pass; deterministic check confirms zero
issues.

---

## Safety preamble flow

Both tutorials open with an `infoPanel(tone: "warning")` block
directly after the intro.

**Pinch pot:** workspace (flat surface, water containment), hand
condition (clean, damp finger for finishing), **dust note (earthenware
path only)** with the conditional silica-safety rule pointing back to
the standard pottery dust safety. Paediatric supervision (air-dry
clay non-toxic but rim is sharp at leather-hard).

**Wedging:** workspace (waist-height surface, solid mount, height
calibrated to body), body mechanics (whole-body movement, hip-and-
shoulder rotation, no wrist-only), clay dust (wet-clean only — even
without kiln-firing, dried clay residue is a silica risk), duration
(20 minutes to start, build slowly).

The author prompt's silica-dust safety preamble is conditional
("mandatory on every glazing / firing tutorial"). Neither of these
tutorials is in the glazing or firing track, so the full glaze
chemistry preamble is not included. The conditional silica reference
in the pinch pot's earthenware-path note + the wedging-board
wet-clean rule cover the relevant subset.

Both safety blocks body-prose-level, not asterisks.

---

## Cross-link gaps

The two tutorials reference each other via `subTutorialCard`. Both
slugs resolve once both DRAFTs land in the DB.

The pinch pot references a "glazing tutorial" in body prose (no slug)
for the earthenware path. The author prompt would expect a slug like
`bisque-and-glaze-firing-earthenware` — out of scope for this session.
The reference is informational only; no `subTutorialCard` for it.

No placeholder slugs logged to `missing-techniques.md` from this
batch.

---

## Tools and clay-body registry hits

**Pinch pot:**

| Slug | In master table | Named in body |
|---|---|---|
| Tool: `wooden-rib` | ✓ (optional) | ✓ |
| Tool: `pottery-sponge` | ✓ | ✓ |
| Tool: `needle-tool` | ✓ (optional) | ✓ |
| Tool: `wire-cutter` | ✓ (optional) | ✓ |
| Clay body: `air-dry-clay` | ✓ | ✓ (named in body but NOT a structured field — see schema gap above) |
| Clay body: `earthenware-red` / `earthenware-white` | ✓ | ✓ (named in body as "red or white earthenware") |

Clean. Clay-body slugs cannot be set on the upload type yet — see
the BLOCKING gap above. Body prose carries the names instead.

**Wedging:**

| Slug | In master table | Named in body |
|---|---|---|
| Tool: `wire-cutter` | ✓ | ✓ |
| Tool: `wooden-rib` | ✓ (optional) | ✓ |

Clean. No specific clay-body slug listed in `recipeTools` (the
tutorial covers all throwing-track bodies generically).

---

## Glossary tooltips

**Pinch pot** — registered: `leather-hard`, `bone-dry`, `pinch-pot`,
`compression`

Inline tooltip check:
- `leather-hard` → ✗ defined but not wrapped inline. The term appears
  in the safety block ("rim of a leather-hard pot") but infoPanel
  bodies cannot host glossary tooltips (the field is a plain string).
  **Fix needed:** wrap the first body-prose occurrence (would need
  to add one, since the current body uses "leather-hard" only in
  the safety preamble). Alternatively, drop the term from
  `glossaryTerms` if not used in body prose.
- `bone-dry` → ✓ (settle and refine paragraph)
- `pinch-pot` → ✓ (intro)
- `compression` → ✓ (intro)

**Wedging** — registered: `wedging`, `spiral-wedging`, `air-pocket`,
`throwing-consistency`

Inline tooltip check:
- `wedging` → ✓ (intro)
- `spiral-wedging` → ✗ defined but not wrapped inline. Term appears
  in body as "spiral method" rather than "spiral wedging"; no tooltip
  mark applied. **Fix needed:** either rename the glossary entry slug
  to `spiral-method`, wrap one occurrence of "spiral wedging", or
  remove from `glossaryTerms`.
- `air-pocket` → ✓ (intro)
- `throwing-consistency` → ✓ (check the consistency paragraph)

Two glossary-tooltip gaps for Rebecca's review. The
infoPanel-as-plain-string limitation continues to surface across
categories; see the herbal review notes for the same observation.

---

## Schema / data gaps flagged

1. **BLOCKING: `Tutorial.requiresKiln` and `requiresWheel` not
   exposed on the upload type.** The Prisma columns exist; the
   `TutorialUploadInput` type in
   `packages/db/scripts/upload-tutorial-types.ts` does not include a
   `pottery` block. Both pottery drafts in this session work around
   by relying on the `false` defaults, which happen to be correct
   for this batch. Throwing and glazing tutorials in later batches
   will NOT be honest about their equipment barrier until the upload
   type is extended. **Required work** before the pottery pipeline
   can autopilot reliably:
   - Add `PotteryMetadata` interface to upload-tutorial-types.ts
     with `requiresKiln`, `requiresWheel`, `requiredClayBodySlugs[]`,
     `requiredCraftMaterialSlugs[]`.
   - Add a top-level `pottery?` field on `TutorialUploadInput`.
   - Update upload-tutorial.ts to write through to the Prisma
     columns.
   - Update validator with the no-equipment-track materials
     enforcement (rejects any `requiredCraftMaterialSlugs` entry
     where `trainedEnvironmentOnly = true` when `requiresKiln =
     false`).

2. **Clay-body slugs can only be referenced in body prose, not as
   structured fields.** Same root cause as #1 — no `pottery` block on
   the upload type means `requiredClayBodies` lives in the schema
   but cannot be set from a JSON draft. Both tutorials name clay
   bodies in body prose ("air-dry clay", "red or white earthenware")
   which works for the reader but doesn't populate the filter index.

3. **`craftType` for pottery PATTERN / TECHNIQUE rows.** Per the
   wood test precedent and the upload-script's PATTERN dispatch (only
   crochet / sewing / knitting require a craft block on PATTERN), the
   pottery tutorials in this session omit any craft block. The
   upload script derives `craftType` from `categorySlug`. Confirmed
   clean.

4. **infoPanel cannot host glossary tooltips.** Same observation as
   the herbal review notes — the `infoPanel.body` field is a plain
   string and cannot wrap inline glossary tooltips. The leather-hard
   term in the pinch pot's safety block is a case study. The author
   prompt should specify that glossary-tooltip terms used in safety
   blocks must also appear at least once in the body's TipTap prose.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render at the
public site per the v5 appendix deferred-image rule.

**Pinch pot:** Wikimedia Commons has good photographs of finished
pinch pots — both contemporary handmade and museum-collection
archaeological examples (the Levant Bronze Age pottery category is
rich). The pre-launch image sweep should target a finished pot in
warm-toned earthenware or air-dry clay rather than glazed
stoneware, to match the no-equipment-track default path of the
tutorial.

**Wedging:** harder. The activity is a process (clay being wedged
on a board), not a finished object. Wikimedia has some workshop
photographs of potters at wedging boards, but matching one to the
spiral-method specifics is unlikely. Procedural card is the right
fallback unless the pre-launch sweep finds a strict match.

---

## Proposed changes to docs/pottery-ceramics-author.md

These are proposals only. Rebecca decides what to apply before the
autopilot goes live.

1. **`PotteryMetadata` upload type — BLOCKING for the wider
   pipeline.** Add the `pottery` block to upload-tutorial-types.ts
   before the throwing or glazing autopilot starts. The author prompt
   currently assumes `requiresKiln`, `requiresWheel`,
   `requiredClayBodies`, and `requiredCraftMaterials` are
   author-controllable; the upload type does not expose them. This is
   the largest infrastructure gap of the five categories in this
   session.

2. **Conditional silica safety in no-equipment-track tutorials.** The
   pinch pot needs the standard pottery dust safety only in its
   optional earthenware path. The current author prompt drops the
   "silica dust" paragraph conditionally on `requiresKiln = true`,
   which is correct, but does not specify what a tutorial should do
   when it covers BOTH paths (no-kiln default + kiln-track optional).
   **Proposed addition:** under § "Glaze chemistry safety preamble",
   a note that dual-path tutorials carry a conditional silica-safety
   paragraph framed around the optional kiln-track path.

3. **`leather-hard` glossary term scope.** The term is the everyday
   pottery vocabulary for the in-between clay state — it warrants a
   glossary definition, but the pinch-pot tutorial doesn't naturally
   use the term in body prose (the pinch pot is finished while still
   soft, not at leather-hard). Either: (a) drop `leather-hard` from
   the pinch pot's `glossaryTerms` and let it land in a leather-hard-
   specific tutorial; (b) add a body-prose mention to the pinch pot
   for the optional refinement step ("at leather-hard the wall can be
   trimmed with a needle tool").

4. **Wedging duration target.** The author prompt's TECHNIQUE
   length guidance doesn't specifically address physical-skill
   tutorials. The wedging tutorial's "twenty minutes of continuous
   work" is named in the safety preamble but not as a top-line target.
   **Proposed addition:** under § "Per-type guidance" → TECHNIQUE, a
   note that physical-skill tutorials should name a practice-time
   target up front.

5. **Body-mechanics callouts.** The wedging tutorial benefits from
   explicit body-mechanics safety prose (hip-and-shoulder rotation,
   not wrist-only). The same applies to throwing tutorials (lumbar
   posture, foot pedal control, hand fatigue). **Proposed addition:**
   under § "Safety preamble", a paragraph on body-mechanics for
   physical-skill tutorials, distinct from the dust / chemistry /
   kiln safety paragraphs.

---

## Summary

Both DRAFTs landed at the targeted lengths (pinch pot ~1,700 words,
wedging ~1,700 words). Both pass the voice-check em-dash rule after
a small first-pass rewrite (one appositive pair, one infoPanel
double em-dash). Both safety preambles are present and proportional
to the activity.

Two glossary-tooltip gaps flagged (`leather-hard` in pinch pot;
`spiral-wedging` slug not matching body prose in wedging). One
larger infrastructure proposal queued: the `PotteryMetadata` upload
type needs adding before the throwing or glazing autopilot can
honestly populate `requiresKiln` / `requiresWheel` /
`requiredClayBodies` / `requiredCraftMaterials`.

For this batch, the upload-type gap doesn't block — both tutorials
correctly land with the `false` defaults for both equipment flags.
But it does block the wheel + kiln track from being authored at all.

Status: **ready for Rebecca's review of the two
no-equipment-track DRAFTs and the
hand-building-no-equipment + clay-fundamentals sub-category flip
decisions. The wheel + kiln sub-categories (throwing, glazing,
firing) should NOT flip to READY until the `PotteryMetadata`
upload-type extension lands.**
