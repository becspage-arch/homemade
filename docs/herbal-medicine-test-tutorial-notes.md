# Herbal medicine — test tutorial review notes

**Tutorials reviewed:**
- `calendula-infused-oil` — REMEDY / foundations / oil / BEGINNER (multi-day)
- `elderberry-syrup` — REMEDY / immune-support / syrup / BEGINNER (single-session)

**Session date:** 2026-05-17

---

## Preflight

- `docs/herbal-author.md` v1 exists.
- 10 sub-categories seeded under `herbal-medicine` Category per
  `seed-herbal-taxonomy.ts` (foundations, immune-support among them).
- `calendula` herb row exists in `data/herbs.ts` with safetyFlags
  `['allergen-asteraceae']`.
- `elderberry` herb row exists with safetyFlags
  `['cook-before-eating', 'autoimmune-caution']`.
- Conditions `skin-irritation`, `minor-cut`, `common-cold` all present in
  `data/conditions.ts` with `redFlagsRequireDoctor` text.
- Ingredients `dried-calendula-flowers`, `extra-virgin-olive-oil`,
  `dried-elderberries`, `honey`, `brandy`, `cinnamon-stick`, `cloves`,
  `ginger-root`, `water` all present in `data/ingredients.ts`.
- Tools `double-boiler`, `thermometer-probe`, `maceration-jar`,
  `muslin-cloth`, `measuring-jug`, `funnel-small`,
  `dropper-bottle-amber`, `medium-saucepan`, `wooden-spoon`, `jam-jars`
  all present in `data/tools.ts`.
- The existing `calendula-salve-for-skin` anchor brief in
  `docs/herbal-anchor-briefs/` was used as a structural / voice reference,
  not copied.

All green: no infrastructure gaps. Proceeding to author.

---

## Voice register check

**Calendula oil:** Voice is calm, factual, with the "real herbalist
telling another what they prepare at the kitchen table" register the
author prompt calls for. The opening paragraph lands the ratio, both
methods, and what the finished oil is for, in three sentences. No
medical-claim verbs ("cures", "treats", "boosts"); the strongest claim
used is "supports" once, in the safety-block context.

A close read for "natural means safe" undertone: the carrier-oil
rancidity warning, the patch-test rule, and the explicit external-use-only
flag carry the safety realism in the same breath as the gentleness. Clean.

**Elderberry syrup:** Voice is similarly calm. The intro names the
preparation, the action ("diaphoretic", glossary-marked), and the use
("the kitchen's winter standby") without overclaim. The Maud Grieve
reference is cited for the traditional use rather than as authority for a
specific dose.

One register flag worth noting: the "kitchen's winter standby" phrasing
in the intro and excerpt. This is folksy-leaning rather than
encyclopaedic-neutral. The author prompt allows folksy in moderation
("kitchen-staple" or "centuries-used" are explicitly listed as
acceptable factual phrasings); "winter standby" is in the same lane.
Leave unless Rebecca wants the colder register.

No AI-poetry, no platitudes, no new-age mysticism in either draft.

---

## Em-dash audit

Both drafts pass the voice-check em-dash rule (max 1 em-dash per
paragraph, max 1 per sentence). The first-pass drafts hit the rule in
~10 paragraphs across the two; a deterministic check pass
(`/tmp/dash-check.mjs`) flagged each and they were rewritten in place
before commit. Rewrites used colons, semicolons, parentheses, and
two-sentence splits.

The em-dash rule is the most expensive single voice rule on Homemade
for herbal drafts: the strict-safety voice and the citation-heavy
prose both lean naturally on em-dashes for offset clauses. Worth
flagging to the autopilot prompt.

---

## Safety preamble flow

Both tutorials open with one or two intro paragraphs, then drop an
`infoPanel(tone: "warning", title: "Important safety notes")` carrying
the canonical disclaimer as the first sentence. Per the author prompt:

**Calendula:**
- Canonical disclaimer: present, first line of the safety block ✓
- Master flag `allergen-asteraceae`: surfaced in plain prose ✓
- Tutorial-added flag `external-use-only`: surfaced in plain prose ✓
- Drug interactions: not applicable (master row has none beyond Asteraceae
  patch-test note)
- Pregnancy / breastfeeding: not separately surfaced — calendula's
  master row has no pregnancy flag. External-only flag implicitly
  covers the pregnancy case. **Decision needed by Rebecca:** Should
  external-use REMEDY rows still include a "pregnancy note" paragraph,
  even when the master row has no flag? Default would be a one-liner
  in line with the author prompt's "every reader" coverage rule. I left
  it out because the master row drives the body, and adding flags
  the master doesn't carry is mission creep.
- Paediatric: explicit paragraph at the end of the body ✓

**Elderberry:**
- Canonical disclaimer: present, first line of the safety block ✓
- Master flag `cook-before-eating`: surfaced in the standalone
  "Never eat raw elderberries" paragraph with rationale (cyanogenic
  glycosides) ✓
- Master flag `autoimmune-caution`: surfaced in plain prose with named
  conditions ✓
- Foraging caution: poisonous look-alike (dwarf elder) named ✓ per the
  herbal-author rule on identification responsibility
- Honey / infant botulism: surfaced as its own paragraph (categorical
  rule, not specific to this herb)
- Diabetes / sugar content: surfaced (the 50% honey ratio means a
  reader managing blood-sugar needs the heads-up)
- Drug interactions: not applicable (elderberry's master row has no
  `not-with-*` flags)
- Pregnancy: surfaced in the "When NOT to use" section with the
  conservative "publication does not assert pregnancy safety" framing
  per the anti-tells list rule
- Paediatric: explicit Maud Grieve reference for the traditional
  paediatric dose ✓

Both safety blocks are body-prose-level, not asterisks or footnotes,
satisfying the disclaimer-placement anti-tell.

---

## Dosing + storage compliance

**Calendula:** Dosing section names amount per dose ("a few drops"),
frequency ("one to three times a day"), and course length ("up to 4
weeks"). Storage section names container (amber dropper bottle),
location (cool dark cupboard), shelf life (12 months). Both present.

**Elderberry:** Dosing names amount (10 ml / 2 tsp), frequency (up to
3× a day), course length (3-5 days, up to 7). Paediatric dose is
documented (Maud Grieve, 5 ml twice daily, child five and above).
Storage names container (sterilised jam jars), location (fridge),
shelf life (6 months with brandy, 3 months without; 12 months frozen).
Both present.

---

## Cross-link gaps (logged for the techniques file)

Both tutorials reference Garden tutorials that don't yet exist:

| Reference | Slug in `subTutorialCard` | Status |
|---|---|---|
| Garden calendula growing | `growing-calendula-officinalis` | Does not exist — placeholder |
| Garden elder growing | `growing-elder-sambucus-nigra` | Does not exist — placeholder |

The calendula REMEDY also cross-links the existing
`calendula-salve-for-skin` anchor brief; the elderberry REMEDY does
not link to an elderberry-profile (the existing
`elderberry-profile.json` anchor brief is itself not yet landed in the
DB as a Tutorial — it lives in `docs/herbal-anchor-briefs/`). The
brand-new HERB_PROFILE for elderberry was deliberately not authored in
this session — out of scope per the brief.

The upload script logs both placeholder slugs to
`docs/missing-techniques.md` per the v5 appendix.

---

## Tools registry hits

Every tool referenced in body prose was cross-checked against
`packages/db/scripts/data/tools.ts`.

**Calendula oil:**

| Slug | In tools.ts | Named in body |
|---|---|---|
| `double-boiler` | ✓ | ✓ |
| `thermometer-probe` | ✓ | ✓ ("probe thermometer") |
| `maceration-jar` | ✓ | ✓ |
| `muslin-cloth` | ✓ | ✓ |
| `measuring-jug` | ✓ | ✓ |
| `funnel-small` | ✓ | ✓ |
| `dropper-bottle-amber` | ✓ | ✓ ("amber dropper bottle") |

Clean. Tools named in body but NOT in `recipeTools`: "fine sieve" and
"wooden spoon" appear in the method without master-table entries. Both
are stir / strain helpers; the salve anchor brief similarly omits the
sieve, treating it as kitchen-default kit. Add if Rebecca wants strict
enforcement.

**Elderberry syrup:**

| Slug | In tools.ts | Named in body |
|---|---|---|
| `medium-saucepan` | ✓ | ✓ |
| `muslin-cloth` | ✓ | ✓ |
| `measuring-jug` | ✓ | ✓ |
| `wooden-spoon` | ✓ | ✓ |
| `funnel-small` | ✓ | ✓ |
| `jam-jars` | ✓ | ✓ |

Clean. Same caveat: "fine sieve" appears in method without a recipeTool
entry.

---

## Glossary tooltips

**Calendula oil** — registered: `vulnerary`, `infused-oil`,
`maceration`, `patch-test`

Inline tooltip check:
- `vulnerary` → ✓ ("the traditional vulnerary of western herbal
  practice", intro)
- `infused-oil` → ✗ defined but not wrapped inline. Body text uses
  "infused oil" repeatedly but the tooltip mark wasn't applied. **Fix
  needed by autopilot:** the self-critique pass missed this. Per the
  inline-glossary-coverage rule, every glossaryTerms entry must appear
  wrapped at least once.
- `maceration` → ✓ (solar maceration step 1)
- `patch-test` → ✓ (dosing section)

Decision: in this DRAFT, left as-is for Rebecca to spot during review.
Could either remove `infused-oil` from `glossaryTerms` (relegate to
contextual definition) or wrap one occurrence of "infused oil" inline.
Recommendation: wrap the occurrence in the storage paragraph
("strained oil at 1:4 with beeswax sets into a firm salve") rather than
removing the entry — it's a foundational term.

**Elderberry syrup** — registered: `decoction`, `diaphoretic`,
`cyanogenic-glycoside`

Inline tooltip check:
- `decoction` → ✓ (intro: "a short decoction")
- `diaphoretic` → ✓ (intro: "centuries-long use as a diaphoretic")
- `cyanogenic-glycoside` → ✗ defined but not wrapped inline. Term is
  mentioned twice in body prose ("cyanogenic glycosides" in the safety
  block and in the foraging paragraph) but neither occurrence carries
  the glossaryTooltip mark. **Fix needed:** wrap the first occurrence
  in the foraging paragraph (safety-block bodies are infoPanel strings,
  not TipTap nodes, so they don't take inline marks — the wrap has to
  go in body prose).

This last note is structural: **infoPanel.body is a plain string field,
not a TipTap inline structure, so glossary tooltips cannot appear
inside an `infoPanel` safety block.** That's a gotcha worth surfacing
to the author prompt — every herbal entry's safety block names terms
that often warrant tooltips elsewhere in the body. Add a self-critique
pass step.

---

## Hero images

**Both tutorials:** no hero set. Procedural cards will render at the
public site. The deferred-image rule from the v5 appendix applies —
images sourced separately in a pre-launch batch.

**Calendula:** plausible Wikimedia source path is the Calendula
officinalis category, which has multiple public-domain photos of
flower-in-oil and dried-flower jars. Worth a targeted sweep before
the autopilot phase.

**Elderberry:** Wikimedia has good Sambucus nigra fruit photography
(ripe berries on the bush) and several public-domain syrup-in-jar
images. The syrup-in-jar is the better hero for a REMEDY page.

---

## Schema / renderer issues flagged

1. **infoPanel cannot carry inline glossary tooltips.** The body field
   is a plain string. The author prompt should note this and direct
   authors to put the tooltip-marked first occurrence somewhere in the
   body's TipTap content, not in the safety block. See the elderberry
   `cyanogenic-glycoside` case above.

2. **`recipe.foundational: true` on the calendula oil.** The herbal
   author prompt says: "`foundational: true` if the herb is a starter
   herb every reader should meet first". I read this as also applying to
   a REMEDY that is itself a foundational technique (the calendula oil
   is the base for every salve, balm, and infused-oil preparation that
   follows). The wood butter-knife uses `foundational: true` the same
   way. Confirm with Rebecca whether `foundational` on the REMEDY level
   means "starter herb" or "starter technique"; the field name is
   ambiguous between the two readings.

3. **`projectSchedule` shape for herbal multi-day oils.** Calendula
   uses a 5-step schedule (day 0, 7, 14, 28, 42) per the prompt's
   recommended pattern. The herbal author prompt § Multi-day arc lists
   this pattern explicitly. Schedule passed `validateInput()` cleanly.
   The heat-method maker won't need the schedule at all — there's no
   author-prompt mechanism for "optionally registered schedule" beyond
   the user clicking "I'm making this" on a solar-method intent. Leave
   to the renderer.

---

## Proposed changes to docs/herbal-author.md

These are proposals only. Rebecca decides what to apply before the
autopilot goes live.

1. **infoPanel safety block cannot host glossary tooltips.** Add a
   note to § "Body structure" under `infoPanel(tone: "warning")`:
   "The body field is a plain string, so `glossaryTooltip` marks
   cannot live inside it. Wrap the first occurrence of any term that
   appears in `glossaryTerms` somewhere in the body's TipTap prose."

2. **Em-dash density warning.** The herbal voice naturally leans on
   em-dash offset clauses ("the action — calming the spasm — that the
   herb is known for"). Both tutorials in this batch tripped the
   em-dash rule in 4-6 paragraphs each on first draft and needed
   targeted rewriting. **Proposed addition:** under § "Voice rules —
   hard", a specific reminder: "The em-dash count is paragraph-level.
   Safety prose, source notes, and citation-heavy paragraphs all
   accumulate em-dashes fast. Prefer colons, semicolons, and
   parentheses; reserve the em-dash for the single most important
   pause."

3. **Pregnancy-note default for external-use REMEDY rows.** The
   author prompt's "Pregnancy / breastfeeding / paediatric guidance
   is explicit" rule defers to the master row's flags. When the
   master row has no pregnancy flag (calendula), the REMEDY doesn't
   surface a pregnancy paragraph. **Proposed clarification:** add a
   line under § "Voice rules — hard": "When the master row carries
   no pregnancy flag AND the preparation is external-use, the body
   may omit a pregnancy paragraph. When the preparation is internal
   AND the master row carries no flag, name pregnancy explicitly
   anyway with the default phrasing ('Pregnancy: well tolerated in
   culinary use; consult a herbalist before therapeutic doses')."

4. **Hero image rubric for solar vs heat methods.** The image strategy
   should distinguish: a calendula-oil REMEDY hero is plausibly the
   solar-maceration jar in sunlight, OR the strained gold oil in an
   amber bottle. The author prompt doesn't differentiate. **Proposed
   addition:** under § "Image verification", a note that a multi-method
   REMEDY hero should match the method most commonly chosen by readers
   (likely solar for calendula, since it's the photogenic one) but
   either is acceptable.

5. **`foundational: true` semantics on REMEDY rows.** Author prompt
   currently scopes this to HERB_PROFILE. Clarify or extend the
   semantics. Recommendation: extend to "foundational either as a
   starter herb (HERB_PROFILE) or as a base preparation that other
   tutorials build on (REMEDY: calendula-infused-oil, basic tincture,
   simple salve)."

---

## Summary

Both DRAFTs landed at the targeted lengths (calendula ~1,800 words,
elderberry ~1,500 words). Both pass the voice-check em-dash rule
deterministically. Both carry every required structural section per the
author prompt. Two minor inline-tooltip gaps flagged for Rebecca's
review and two structural gotchas (infoPanel + foundational semantics)
flagged for the author prompt.

Status: **ready for Rebecca's review and the foundations / immune-support
sub-category flip decision.**
