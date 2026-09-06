---
name: Every registered glossary term surfaces inline at least once
description: Locked rule for the relationship between Tutorial.glossaryTerms and body prose. Every term registered on a tutorial must appear at least once in the body wrapped in a `glossaryTooltip` mark so the hover definition reaches the reader. Applies to every category. Self-critique pass + audit session enforce it.
type: feedback
originSessionId: optimistic-cori-2069ce
---

Locked 2026-05-15 from the Baking anchor batch review. The first
pass shipped four anchors with `glossaryTerms` registered but no
inline `glossaryTooltip` marks in body prose. Hover definitions
never reached the reader; the glossary entries existed only as
dead rows.

## The rule

**Every entry in `Tutorial.glossaryTerms[]` must appear at least
once in the body prose wrapped in a `glossaryTooltip` mark.**
Conversely: if a technical term in body prose has a definition
worth surfacing, register it in `glossaryTerms` AND mark it up
inline. Registered-but-not-used and used-but-not-registered are
both wrong.

**Why:** the glossary tooltips are one of the platform's two
core teaching mechanisms (the other is `subTutorialCard`). They
let the reader hover a term and get a one-line definition
without leaving the recipe. Recipes that register glossary terms
but don't surface them inline waste a teaching surface AND
clutter the GlossaryTerm table with dead rows.

## Applies to every category

- **Cooking** — sauces, mother-sauce derivatives, technique
  terms ("emulsify", "deglaze", "reduce", "monter au beurre").
- **Baking** — "baker's percentages", "windowpane test",
  "rubbing-in", "blind-baking", "soft-ball stage", "tempering",
  "knock back", "shape and tin", "lamination", etc.
- **Mindset** — generally fewer technical terms; EFT-specific
  vocab ("setup statement", "reframe round", "karate-chop point")
  may benefit from tooltips.
- **Garden / Herbal / future categories** — same rule applies.
  Latin binomials, hardiness zones, decoction technique, etc.

## TipTap mark shape

```json
{
  "type": "text",
  "text": "baker's percentages",
  "marks": [
    {
      "type": "glossaryTooltip",
      "attrs": { "termSlug": "bakers-percentage" }
    }
  ]
}
```

The upload script swaps `termSlug` for `termId` at upload time
against the registered `glossaryTerms[]` entry.

## How to apply when authoring

- When the body prose first uses a technical term, decide
  whether it warrants a tooltip:
  - **Yes** if the term is jargon the reader might not know,
    AND a one-line definition genuinely helps.
  - **No** if it's a one-off filler word, or the definition
    would be circular (defining "stir" as "stir" doesn't help).
- For every term that wants a tooltip, register it in
  `glossaryTerms[]` at the top of the input AND mark up the
  first occurrence in body prose.
- Subsequent occurrences in the same body **don't** need the
  mark — once is enough; multiple tooltips on the same term
  inside one tutorial reads cluttered. The mark goes on the
  first plain-text mention, typically in the intro or the
  first method step.
- Cross-tutorial: the same glossary term lives in the
  `GlossaryTerm` table once globally. Multiple tutorials
  referencing the same slug reuse the row.

## Self-critique pass

Drafters check at session end:

1. For each entry in `glossaryTerms[]`, search the body for the
   term. If it doesn't appear at all, either add a tooltip mark
   to the first natural mention OR drop the entry from
   `glossaryTerms[]`.
2. For each technical term in body prose, ask: is this a term
   readers will want defined? If yes and it's not in
   `glossaryTerms[]`, register it and mark up the first
   mention.

## Audit binding

- **Every new tutorial** authored from this point lands with
  this self-critique pass run.
- **Every existing tutorial** gets audited in the cross-category
  content audit session (see `BUILD_PROGRESS.md` § "Cross-
  category content audit + temperature unit system"). The
  four Baking anchors (2026-05-15) already have the second
  pass run; the ~200 Cooking DRAFTs + Mindset DRAFTs + bulk
  batches need the sweep.

## Prompt template wiring

The rule lives in `docs/tutorial-author.md` § Self-critique pass
(cooking template) + `docs/baking-author.md` § Self-critique pass
(Baking) + future per-category prompt templates. The audit-
session worker is the first to bring the existing templates
into line.
