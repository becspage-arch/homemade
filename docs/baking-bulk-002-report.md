# Baking bulk-002 batch report

**Date:** 2026-05-17
**Session model:** claude-sonnet-4-6 (autopilot worker, per `feedback_model_choice.md`)
**Briefs directory:** `docs/baking-bulk-002-briefs/`
**Status on landing:** PUBLISHED
**Driver:** scheduled task `autopilot-baking-bulk`

---

## What landed

50 baking rows published across 6 sub-categories. Slice was weighted
toward sub-categories under-represented after the pilot + anchor +
bulk-001 — `pies`, `pastries`, `biscuits`, `scones`,
`sweets-confectionery` and `cake-decorating`. `bread` and `cakes`
were intentionally rested (they sat on 13 each after bulk-001).

| Sub-category | Slugs | Count |
|---|---|---|
| `pies` | pumpkin-pie-thanksgiving, pecan-pie-classic, key-lime-pie-florida, cherry-pie-double-crust, blueberry-pie-double-crust, strawberry-rhubarb-pie, bakewell-tart-cherry, tarte-tatin-apple, banoffee-pie, lemon-tart-au-citron, pasteis-de-nata, tarte-aux-pommes, plum-frangipane-tart | 13 |
| `pastries` | croissants-laminated, pain-au-chocolat, kanelbullar-cardamom-cinnamon, chelsea-buns-currant, hot-cross-buns-spiced, cinnamon-morning-buns-laminated, mille-feuille-napoleon, palmiers-caramelised, choux-pastry-base, gougeres-cheese-choux, almond-croissants-leftover | 11 |
| `biscuits` | shortbread-fingers, millionaires-shortbread, macarons-french-vanilla, brandy-snaps-cream-filled, gingerbread-biscuits-cutter, hobnobs-oat-biscuits, anzac-biscuits, lebkuchen-christmas, snickerdoodles-cinnamon, custard-creams-homemade | 10 |
| `scones` | plain-scones-afternoon-tea, cherry-scones, buttermilk-scones-american, treacle-scones-scottish, sourdough-scones, american-biscuits-buttermilk, rock-cakes-currant | 7 |
| `sweets-confectionery` | honeycomb-cinder-toffee, salted-caramels-soft, chocolate-truffles-ganache, tempered-dark-chocolate, turkish-delight-rosewater, toffee-hard-crack | 6 |
| `cake-decorating` (TECHNIQUE) | royal-icing-piping-consistencies, ganache-drip-finish, swiss-meringue-buttercream | 3 |

**Difficulty spread:** 19 BEGINNER / 24 INTERMEDIATE / 7 ADVANCED.
The skew toward beginner is deliberate; the library wanted accessible
entry points after bulk-001's 8 / 31 / 11 mix.

---

## New master-table additions

No new ingredient slugs were added in this batch. Every brief was
authored against existing slugs in `packages/db/scripts/data/ingredients.ts`
(633 rows). The lookup work was front-loaded by checking each draft's
slugs against the master list before drafting.

No new tool slugs were added. Tool references were resolved to existing
slugs in `packages/db/scripts/data/tools.ts` (188 rows); one
post-draft correction (`balloon-whisk` → `whisk-balloon`, seven
occurrences) was applied before voice-check.

---

## Errors encountered and fixed

### Em-dash appositive pairs in body prose and definitions (10 files)

The same dominant failure mode as bulk-001. The drafter naturally
reached for the `X — Y — Z` shape, especially in glossary definitions
and in compound observational sentences ("rolling window is narrow —
about two minutes wide —"). Caught pre-emptively by a pre-flight
em-dash scan that ran across all 50 briefs after drafting and before
voice-check. Each instance was rewritten as a colon, parentheses, or
two sentences. No em-dash pair survived to voice-check.

### Tool slug naming (1 batch)

`balloon-whisk` was used in seven briefs; the canonical slug is
`whisk-balloon` (per the convention `noun-modifier`). Caught by the
pre-upload slug audit pass. Single batch sed-style rewrite applied;
no other tool slugs were wrong.

### Voice-check at upload time

Zero blocking errors across all 50 briefs. 9 advisory warnings across
6 files:

- 3 × `americanism: "fall"` (macarons, ganache-drip ×2) — left as-is;
  all are verb uses ("let it fall", "drips fall in even rounds"), not
  season uses.
- 3 × `brand-trademark` (custard-creams: "Bird's"; honeycomb:
  "Cadbury", "Crunchie") — left as-is in `sourceNotes`; these are
  honest historical citations of the commercial origin, not
  collaborations.
- 2 × `tricolon` (american-biscuits, gingerbread-biscuits) — left
  as-is; the three items earned their places.
- 1 × `brand-trademark: "Target"` (ganache-drip) — false positive on
  the common-noun "target temperature".

---

## Upload run summary

| Run | OK | FAIL | Notes |
|---|---|---|---|
| 1 | 50 | 0 | Clean pass on first attempt — em-dash and slug audits caught everything before upload. |

A material improvement on bulk-001's 4-run pattern (50 fails on run 1).
The pre-flight em-dash scan and the slug audit caught the failure
modes that previously surfaced at voice-check or upload time.

---

## Quality-drift check

The autopilot's quality-drift check (compares error counts across the
last 3 baking batch reports) is not yet meaningful: there are now 2
baking-bulk reports (001 and 002). The check requires 3 prior reports
before its trend signal is usable. Treating as pass-through this fire;
the check will engage on bulk-003 and onward.

---

## Patterns to carry forward

1. **Pre-flight em-dash scan before voice-check.** A single node script
   that walks all briefs and flags any line with 2+ em-dashes catches
   the dominant failure mode cheaply. Run this on the briefs directory
   immediately after drafting.

2. **Slug audit against the worktree's `ingredients.ts` and
   `tools.ts` before voice-check.** A second node script that walks
   all briefs and confirms every `ingredientSlug` and tool `slug`
   resolves against the master files. Catches typos and convention
   slips (`balloon-whisk` → `whisk-balloon`) at the cheapest point.

3. **The britishism gap.** "Fall" as a verb is being flagged by the
   americanism check; this is a known false-positive pattern. The
   check fires on any "fall" regardless of meaning. Not worth fixing
   in the brief — but worth noting for future authors so they don't
   spend time second-guessing the prose.

4. **Brand mentions in sourceNotes are usually citations, not
   collaborations.** Bird's custard powder (1837 commercial origin of
   the recipe), Cadbury / Crunchie (1929 standardised the modern form),
   Borden Eagle Brand (key-lime pamphlet) — these are appropriate
   historical attributions in sourceNotes. The voice-check warning is
   advisory; do not rewrite to remove the brand name from a genuine
   citation, but do not put a brand name in a recipe title or body
   prose where the warning would matter.

5. **Tool naming convention is `noun-modifier`, not
   `modifier-noun`.** `saucepan-medium` not `medium-saucepan`;
   `whisk-balloon` not `balloon-whisk`; `piping-nozzle-round` not
   `round-piping-nozzle`. The convention is consistent across the
   master file — always look up the exact slug, never guess.

---

## Cumulative baking position

Baking is at roughly 109 PUBLISHED after this batch, against the
3,000 target for the category. Sub-category fill after bulk-002:

| Sub-category | Cumulative published |
|---|---:|
| `bread` | 13 (rested this batch) |
| `cakes` | 13 (rested this batch) |
| `pies` | 19 (+13) |
| `pastries` | 20 (+11) |
| `biscuits` | 18 (+10) |
| `scones` | 12 (+7) |
| `sweets-confectionery` | 13 (+6) |
| `cake-decorating` | 5 (+3) |

The next baking bulk should rotate `bread` and `cakes` back in to
keep coverage even across the sub-categories.

---

## Files

- Briefs: `docs/baking-bulk-002-briefs/` (50 JSON files)
- Baking author prompt: `docs/baking-author.md` (unmodified, v2)
- Baking anti-tells: `docs/baking-anti-tells.md`
- Prior batch report: `docs/archive/baking-bulk-001-report.md`
- Autopilot prompt: `docs/autopilot-prompts/baking.md`
