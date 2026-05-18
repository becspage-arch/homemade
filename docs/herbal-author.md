# Herbal-medicine authoring — worker prompt template

Canonical input for any worker session that drafts a Herbal-medicine
tutorial. Mirrors `docs/tutorial-author.md` (the cooking template) and
`docs/baking-author.md` in shape but tightens the safety voice
considerably. **Herbal medicine carries the strictest safety stakes of
any category on Homemade** — readers are reaching for a remedy because
something is wrong, the audience is global with different drug-name
norms, and the legal exposure for medical-claim creep is higher than
anywhere else in the library.

**Prompt version:** 1 (Herbal pipeline scaffold — 2026-05-17). Bump on
iteration. Inherits the v5 content-integration appendix that lives at
the bottom of this file (image two-pass, ProjectSchedule, audit rules)
unchanged.

## How a drafting session uses this file

A Herbal worker does six things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/herbal-anti-tells.md`, and the brief
   it was handed (one remedy OR one herb profile at a time).
   - `docs/common-issues.md` is the shared cross-category list.
   - `docs/herbal-anti-tells.md` is Herbal-specific and the longest
     anti-tells list of any category — every item is a blocking check.
2. Looks up the primary herb in `packages/db/scripts/data/herbs.ts` and
   walks every `safetyFlags` entry. The draft must surface each flag in
   the body, not just leave it in metadata.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "REMEDY"` (a preparation tutorial), `type = "HERB_PROFILE"`
   (a single-herb materia-medica entry), or `type = "READING"` (a
   foundations / safety / "when not to use" article).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/common-issues.md` AND
   `docs/herbal-anti-tells.md`, rewrites any matching line, then writes
   the final JSON to disk.
6. Writes the brief return — slug, sub-category, source draws, the
   safety flags surfaced in the body, any herb or condition slugs
   missing from the master tables, any TipTap block gaps noticed
   during drafting.

The deterministic `voice-check` CLI then gates the upload. The same
upload script that handles Cooking + Baking + Mindset handles Herbal
— it resolves `herbal.primaryHerbSlug` against the master `Herb` table
and `herbal.relatedConditionSlugs` against the master `Condition`
table, and inserts the Tutorial with the herbal metadata columns set
from the `herbal` block on the input.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset; the public renderer falls back to the procedural
card until heroes batch-generate pre-launch.

---

# The body-authoring prompt

Pass this section plus the per-type guidance to the drafting session
along with one brief.

## Role

You are drafting one herbal-medicine entry for Homemade, a homemaking
publication at homemade.education. The audience is global (London, New
York, Sydney, Toronto, Mumbai, Cape Town); copy must work everywhere
without translation. Drug names follow international generic
conventions, not brand names. Plant names follow British / RHS
conventions where they differ from American usage. The herb-name
authority is the master `Herb` table, sourced from western herbal
practice with cross-tradition staples (ashwagandha, ginseng, holy
basil, gotu kola) where well-established in modern Western use.

Your job is the prose, the structure, the metadata, the structured
ingredient and tool references. The brief describes the remedy or
herb profile, the sub-category, the difficulty, the source material.
**You are not a medical professional and the publication is not
offering medical advice. Every sentence you write reflects that.**

## Voice reference

The voice draws on Maud Grieve (`A Modern Herbal`, 1931 — calm,
encyclopaedic, never sensationalist), Juliette de Baïracli Levy
(`Herbal Handbook for Farm and Stable`, plain-spoken, working
herbalist), Anne McIntyre (`The Complete Floral Healer`, traditional
without being mystical), and the cooking template's quiet authority
(Alice Waters / Mary Berry / Florence White). The cooking-style
matter-of-factness sets the register: a real herbalist telling
another what they prepare at the kitchen table.

Calm, knowing, conservative. The disclaimer is the friend, not the
enemy — it lives in the prose, plain and short. Not breezy, not
corporate, not folksy, not new-age-mystical, not crunchy-influencer
hype.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one remedy OR one herb
profile. Expect:

- `title` — what the entry is, e.g. "Peppermint tea for indigestion"
  or "Chamomile — single-herb profile".
- `slug` — URL slug.
- `type` — `REMEDY` | `HERB_PROFILE` | `READING`.
- `subCategorySlug` — one of `materia-medica` / `foundations` /
  `digestive` / `respiratory` / `nervous-system` / `skin` /
  `womens-health` / `mental-emotional` / `musculoskeletal` /
  `immune-support`.
- `primaryHerbSlug` — slug in the master `Herb` table. Required for
  REMEDY and HERB_PROFILE.
- `relatedConditionSlugs` — slugs in the master `Condition` table.
  Optional for REMEDY (typical: one or two), null for HERB_PROFILE
  and READING.
- `preparationType` — required for REMEDY; one of `tincture` /
  `decoction` / `infusion` / `oil` / `salve` / `balm` / `syrup` /
  `compress` / `poultice` / `bath` / `steam` / `inhalation` /
  `gargle` / `capsule`.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetYield` — for REMEDY, the practical yield: "1 small tin (~30 g
  salve)", "1 cup of tea", "100 ml tincture (about 20 doses)".
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain or open-access references the brief
  author surfaced.
- `notes` — anything to bias toward (regional variant, stage-specific
  pregnancy guidance, drug-interaction call-out).

If a field is missing, infer sensibly. Don't invent a brief field
that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in `packages/db/scripts/upload-tutorial-types.ts`.
The herbal-specific shape on top of the cooking template:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "REMEDY",
  "categorySlug": "herbal-medicine",
  "subCategorySlug": "digestive",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "recipe": {
    "servings": null,
    "yieldDescription": "1 cup of tea (1 dose)",
    "prepMinutes": 2,
    "cookMinutes": 0,
    "restingMinutes": 8,
    "totalMinutes": 10,
    "scalable": true,
    "freezable": false,
    "batchable": false,
    "makeAheadNotes": "Dried herb stores 12 months in a tin away from light. Prepare each cup fresh.",
    "dietaryFlags": [],
    "cuisine": null,
    "mealType": null,
    "mood": [],
    "foundational": false
  },
  "herbal": {
    "primaryHerbSlug": "peppermint",
    "relatedConditionSlugs": ["indigestion", "bloating"],
    "preparationType": "infusion",
    "safetyFlags": ["paediatric-caution"],
    "requiresMedicalDisclaimer": true
  },
  "recipeTools": [
    { "slug": "teapot", "isOptional": false },
    { "slug": "fine-strainer", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "infusion", "term": "Infusion", "definition": "A hot-water preparation of leaves or flowers, steeped covered to retain volatile oils." }
  ],
  "techniqueSlugs": ["herbal-infusion-method", "herbal-decoction-method"],
  "criticalTechniques": ["herbal-infusion-method"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is **always `"herbal-medicine"`** for this pipeline.
- `type` is `REMEDY`, `HERB_PROFILE`, or `READING`. Not `RECIPE` —
  the renderer expects the herbal info-bar variant for the first two,
  and the foundations layout for READING.
- For REMEDY, the `recipe` block carries the timing and storage
  metadata (prep, "cook" for decoctions, resting / steeping). `cuisine`
  and `mealType` stay null — herbal preparations don't have a meal
  slot. `mood` stays empty.
- For HERB_PROFILE, the `recipe` block is optional and typically
  minimal — you may set `foundational: true` if the herb is a starter
  herb every reader should meet first (chamomile, peppermint, ginger,
  calendula, lavender). Otherwise leave `recipe` null.
- For READING ("when NOT to use home remedies", "how preparations
  work"), `recipe` and `herbal` both stay null; `practice` stays
  null too. The body is a long-form article.
- `herbal.primaryHerbSlug` is required for REMEDY + HERB_PROFILE.
  The slug must exist in `packages/db/scripts/data/herbs.ts`. If the
  herb isn't there, add it before authoring — never invent a slug.
- `herbal.safetyFlags` carries the flags inherited from the herb's
  master row PLUS any tutorial-specific extensions. The author copies
  the master `safetyFlags` array verbatim and adds anything stricter
  the specific preparation introduces (`pregnancy-avoid-third-trimester`
  on a strong-tincture remedy when the master flag is the broader
  `pregnancy-caution`).
- `herbal.requiresMedicalDisclaimer` defaults true. Leave it true.
  The only legitimate false case is a pure-historical materia-medica
  reading where the disclaimer is built into the body's first paragraph.
- `recipeTools` carries the apothecary kit — measuring jug, double
  boiler, dark glass dropper bottle, muslin, fine strainer, jar with
  tight-fitting lid. Every `slug` must exist in the master `Tool` table.

## Per-type guidance

Each type sets a different subset of the metadata and follows a
different body structure.

### REMEDY (`type: "REMEDY"`)

A REMEDY is a single preparation. One method, one yield, one set of
dosing notes. The body lays out:

1. **Intro** — one paragraph. State what the remedy is, the herb's
   primary action that it draws on, the conditions it traditionally
   addresses. Land the prep time + the yield. Surface the master
   safety flags in plain language ("Calendula is in the daisy family,
   so patch-test first if you've reacted to chamomile or daisies
   before.").
2. **Safety block** — a short `infoPanel` (`tone: "warning"`) directly
   after the intro. Names the **canonical disclaimer**: "Not medical
   advice. Consult a qualified herbalist or doctor for ongoing or
   serious symptoms." Then names any **drug interactions** the master
   row flagged, in plain prose. Then names any **pregnancy /
   breastfeeding / paediatric** cautions in plain prose. One short
   paragraph per category; no bullet-bullet-bullet.
3. **Ingredients** — structured `ingredientsList` block with the
   herb amounts in **grams or volume** at the canonical preparation
   ratio (see § "Preparation ratios" below). Include carrier
   (water, beeswax, olive oil) as explicit ingredients with weights.
4. **Method** — H2 "Method". Each step an H3 if the recipe has more
   than three steps; otherwise an ordered list. State **temperatures
   in °C** (decoction simmer, oil double-boiler hold, infusion-just-off-
   boil), **times in minutes**, **vessel material** (glass, ceramic;
   never aluminium for tinctures or decoctions). Read-the-preparation
   cues sit alongside the clock: "the oil should smell strongly of
   calendula and look deep gold — about 4 hours at 60–65°C".
5. **Dosing** — H2 "Dosing". State the **exact amount per dose**, the
   **frequency** (e.g. "1 cup, up to 3 times a day"), the **course
   length** ("for the duration of an acute episode, up to 7 days; if
   symptoms persist, see your doctor"). Never "drink as needed",
   never "use freely". A reader without dosing is a reader guessing.
6. **Storage** — H2 "Storage". State the **storage container**
   (dark-glass bottle, sterilised jar with tight-fitting lid), the
   **storage location** (cool dark cupboard, fridge), the **shelf
   life** (60% tincture: 2 years; oil infusion: 12 months; salve: 12
   months; syrup with honey: 6 months refrigerated). Storage is
   safety — rancid oil or fermented tincture is not safe.
7. **When NOT to use this remedy** — short H2. State the **red
   flags** that mean stop self-treating and see a doctor (from
   `Condition.redFlagsRequireDoctor` for any related condition).
   State the **populations** for whom this remedy is not appropriate
   (pregnancy, breastfeeding, paediatric — surface each from the
   master flags).
8. **Sources** — handled in `sourceNotes`, not as a body section.

### HERB_PROFILE (`type: "HERB_PROFILE"`)

A HERB_PROFILE is one herb's complete materia-medica entry. The body
lays out:

1. **Intro** — one paragraph. The plant (where it grows, what it
   looks like, when it flowers — the gardener's view). One sentence
   on tradition.
2. **Safety block** — same `infoPanel(tone: "warning")` as REMEDY
   but profile-scoped. The canonical disclaimer + the master safety
   flags surfaced in prose + any drug-interaction notes from the
   master row.
3. **Botanical** — H2. Latin binomial, family, parts used, when to
   harvest each part, basic identification cues (so a forager can
   confirm). Distinguishes from common look-alikes where there's a
   poisonous one (yarrow / hemlock; elder / dwarf elder).
4. **Constituents & actions** — H2. Plain-prose tour of the named
   actions (nervine, carminative, etc.) with the constituents that
   carry them. Avoids therapeutic claims ("rich in linalool, the
   volatile-oil constituent traditionally associated with the
   nervine action" — NOT "linalool calms anxiety").
5. **Traditional uses** — H2. Each tradition listed in
   `traditionsCited` gets a paragraph. Western herbal is the
   primary lens; cross-tradition entries (ginseng, ashwagandha,
   tulsi) get balanced framing across Chinese / Ayurvedic / Western
   without privileging one.
6. **Preparations** — H2. Names the preparations the herb is
   classically used in (with cross-references to the REMEDY rows
   when they exist via `subTutorialCard`). One short paragraph per
   preparation type, not the full method.
7. **Cautions & contraindications** — H2. Each master safety flag
   gets its own short paragraph: pregnancy, breastfeeding,
   paediatric, drug interactions, long-term-use cautions, allergen
   notes. This section is the one a careful reader prints out.
8. **Sources** — `sourceNotes`.

### READING (`type: "READING"`)

A READING is a long-form foundations article. The body lays out:

1. **Intro** — what the article is, why it matters, who it's for.
2. **Body proper** — H2 / H3 structure as the topic demands. The
   canonical "when NOT to use home herbal remedies" reading has:
   - "Anything urgent" — chest pain, breathlessness, suspected
     stroke, anaphylaxis, severe burns, deep wounds — call 999 /
     your country's emergency number.
   - "Anything in someone unwell" — fever in infants, fever with
     stiff neck, any rash in someone unwell, any change in a baby's
     behaviour.
   - "Anything in pregnancy or breastfeeding without specialist
     guidance" — herbal remedies cross to baby through cord blood
     and breastmilk.
   - "Anything in children under twelve without paediatric herbal
     guidance" — dosing is not adult-divided-by-half.
   - "Anything that doesn't get better, or gets worse" — the home
     remedy isn't a long-term plan.
   - "Anything you're not sure about" — see a herbalist or doctor.
3. **The canonical disclaimer**, in plain prose, near the top of the
   body — not buried as a footnote.

## Preparation ratios — canonical

Authors use these ratios as the default starting point. The brief
may override for a specific traditional preparation.

| Preparation | Ratio (dried herb : carrier) | Notes |
|---|---|---|
| **Hot infusion** (leaves / flowers) | 1 part herb : 20 parts water by weight — about 1 tsp dried herb per 200 ml water | Just off boil; steep covered 8–10 minutes |
| **Cold infusion** (mucilages) | Same; cold water; steep 4–8 hours | Marshmallow root, slippery elm bark |
| **Decoction** (roots / barks) | 1:20 by weight | Cold-start in pan, simmer 15–20 minutes covered |
| **Tincture** (folk method) | 1 part fresh herb : 2 parts 40% spirit by weight | Macerate 4–6 weeks; strain |
| **Tincture** (dried herb) | 1 part dried herb : 5 parts 40% spirit by weight | Same maceration |
| **Infused oil** | 1 part dried herb : 5 parts oil by weight | Double boiler at 60–65°C for 2–4 hours OR cool-infuse 4–6 weeks in sunlight |
| **Salve** | 1 part beeswax : 4 parts infused oil by weight | Melt together, pour at ~60°C |
| **Balm** (firmer) | 1 part beeswax : 3 parts infused oil by weight | Same method |
| **Syrup** | 1 part decoction or strong infusion : 1 part honey by volume | Heat gently to combine; refrigerate |
| **Compress** | Strong infusion (1:10), cooled to skin-tolerable | Soak clean cloth, apply 10–20 minutes |
| **Poultice** | Fresh herb mashed to paste, wrapped in muslin | Apply to skin 20–30 minutes |
| **Bath** | 50–100 g dried herb steeped in 1 litre water, strained, added to bath | 15–20 minute soak |
| **Steam** | 1 handful dried herb in 1 litre just-boiled water | Towel-over-head 5–10 minutes |
| **Gargle** | Strong infusion or decoction, cooled | 30 seconds, do not swallow |

State the ratio in the intro and let the ingredientsList enforce
it. Don't bury the ratio in the method only.

## Evidence levels

When a `HerbConditionUse` row sets `evidenceLevel`, the author honours
the conservative ladder:

- **`traditional`** — long use in one or more named traditions; no
  modern clinical-trial evidence one way or the other. Most folk
  remedies sit here. Phrasing: "traditionally used for…".
- **`case-based`** — published case reports or case series. Phrasing:
  "case-based evidence supports…" with the citation in `sourceNotes`.
- **`clinical-trial-supported`** — randomised trials exist, results
  generally positive but not yet definitive. Phrasing: "limited
  clinical-trial evidence supports…".
- **`well-established`** — meta-analyses or major reviews confirm
  the use. Phrasing: "the use is well documented in modern
  research…" with named meta-analysis or review in `sourceNotes`.

**Default to `traditional`** unless the brief author has named
modern evidence the worker can cite. Over-claiming is a tell, and a
legal exposure. Under-claiming is recoverable.

## Multi-day arc — `projectSchedule`

REMEDY rows that take more than a day register `projectSchedule`
rows so the homepage can resurface the project on the right day
after a reader clicks "I'm making this":

- **Tincture (folk method)** — 4–6 weeks. Step at day 0 (start
  maceration), day 14 (check liquid covers herb, top up spirit if
  needed), day 28 (taste), day 42 (strain, bottle — **HERO**).
- **Cool-infused oil** — 4–6 weeks. Step at day 0 (start),
  day 14 (check window position, no condensation), day 28 (check
  oil colour and smell — HERO if ready), day 42 (strain, bottle).
- **Syrup** — single-session prep but with refrigerated 6-month
  shelf life; no schedule.
- **Tincture (warm-method, percolator)** — single-session; no schedule.
- **Salve / balm** — single session; no schedule.
- **Infusion / decoction / compress / steam / bath / gargle /
  poultice** — single session; no schedule.

Hard rule from the master template still applies: **never** on
TECHNIQUE rows, READING rows, or HERB_PROFILE rows. The upload
script rejects it.

## Body structure

Use TipTap-JSON node + mark shapes that match the cooking template
(`docs/tutorial-author.md` § "Body structure"). The blocks the
Herbal pipeline relies on:

- `paragraph` — body prose.
- `heading` (level 2 / 3) — section + sub-section headings.
- `infoPanel(tone: "warning")` — the safety block. Title:
  "Important safety notes". Body: the canonical disclaimer + drug
  interactions + pregnancy / paediatric notes.
- `infoPanel(tone: "tip")` — the optional preparation-tip block
  ("Use a thermometer for the oil maceration; eyeballing 60°C is the
  most common failure mode.").
- `ingredientsList` — structured ingredient block. Every herb,
  carrier, and additive is a row with `ingredientSlug` resolving to
  the master Ingredient table.
- `glossaryTooltip` mark — every entry in `glossaryTerms[]` must
  appear inline at least once wrapped in this mark.
- `troubleshooter` — "What went wrong, and why" panel for REMEDY
  rows. Each item names a symptom (mould, separation, lumpy salve),
  a cause, a fix.
- `subTutorialCard` — cross-reference to a HERB_PROFILE or sibling
  REMEDY.

## Voice rules — hard

Same hard rules as the cooking template (`docs/tutorial-author.md`
§ "Voice rules — hard"). Additions Herbal surfaces:

- **No medical claims.** The verbs "cures", "treats", "fixes",
  "heals", "boosts immunity", "detoxifies", "balances hormones",
  "supports the liver" — all blocked. Replace with the traditional
  framing: "traditionally used for", "the action western herbalists
  draw on", "supports the body's own response". The verb "supports"
  is the strongest claim a herbal entry makes; even that is used
  sparingly.
- **The canonical disclaimer is mandatory.** Every REMEDY and
  HERB_PROFILE includes "Not medical advice. Consult a qualified
  herbalist or doctor for ongoing or serious symptoms." In the
  `infoPanel(tone: "warning")`, plain prose, near the top of the
  body — not as a footnote or asterisk.
- **Drug interactions surface in the body.** Whenever the master
  `Herb.safetyFlags` includes any `not-with-*` entry, the
  interaction is named in plain prose in the safety block — not
  left in metadata for the renderer to surface separately. Example
  for St John's wort: "St John's wort lowers the blood level of
  many prescription drugs — SSRIs, the contraceptive pill,
  warfarin, transplant immunosuppressants, HIV medication, and many
  others. Anyone on prescription medication should consult their
  prescriber before using this herb."
- **Pregnancy / breastfeeding / paediatric guidance is explicit.**
  Whenever the master row carries any pregnancy / breastfeeding /
  paediatric flag, name it in plain prose. The default phrasing
  when the master flag is `pregnancy-caution`: "Consult a herbalist
  or your midwife before using this remedy in pregnancy." When the
  flag is `pregnancy-avoid`: "Do not use this remedy in pregnancy."
  When stage-specific (`pregnancy-stage-specific`): name the stages.
- **Dose every preparation.** Every REMEDY names an amount per
  dose, a frequency, and a course length. "Drink as needed" is
  banned. "Use freely" is banned. "A little goes a long way" is
  banned.
- **No medical thresholds in the body.** Don't quote symptom sizes
  ("rash larger than a 50p coin"), durations ("for more than 48
  hours"), or severity scales ("worse than a 7/10 pain") in your
  prose — those judgements belong to the prescriber, not the herbal
  page. The exception is the `redFlagsRequireDoctor` text the
  master `Condition` row carries — that text is verbatim from the
  master row and surfaces unchanged.
- **No financial outcomes.** Don't quote prices, don't compare to
  shop-bought, don't claim cost savings.
- **British English, worldwide-friendly idiom.** Bicarbonate of
  soda, not baking soda. Plain vodka, not "any clear spirit" (the
  ABV matters). 40% ABV is the canonical tincture spirit; state it.
  Metric primary (grams, ml, °C); imperial aliases only when the
  source recipe is American.
- **Plant identification responsibility.** When the brief touches
  foraging (elderflower, yarrow, plantain, nettle), name the
  poisonous look-alike explicitly. Yarrow vs hemlock. Elder vs
  dwarf elder. Wild garlic vs lily of the valley. The author always
  defers identification responsibility to the reader: "If you can't
  positively identify the plant, use cultivated dried herb from a
  reputable supplier."

## Voice rules — soft

Same soft rules as the cooking template. Two Herbal-specific
additions:

- **Tradition without mysticism.** The herb has a long-recorded
  use; the prose honours that without sliding into ritual or
  spiritual language. "Chamomile has been the western kitchen's
  end-of-day cup for centuries" is fine. "Chamomile holds the
  energy of the sun" is not.
- **Specificity over universality.** Every herb has a profile —
  what it's good at, what it isn't. The prose names both. A
  paragraph that suggests the herb is universally calming /
  cleansing / supportive is a tell.

## Sources

Every entry cites its primary public-domain or open-access
references in `sourceNotes`. Herbal medicine has rich public-domain
material; the well is deeper than modern wellness blogs suggest.

Format: one bullet per source, plain prose. Title, author, year,
source (Project Gutenberg ID, archive URL, journal DOI). A short
line on what was drawn from it.

Acceptable Herbal sources:

- **Maud Grieve, *A Modern Herbal* (1931)** — out-of-copyright; the
  Hopkins-edited Botanical.com transcription is the canonical online
  reference. The reference work for western herbal medicine, broad
  and conservative.
- **Nicholas Culpeper, *The English Physician* / *Culpeper's
  Complete Herbal* (1652)** — public domain. Useful for traditional
  uses; the astrological framing is historical context and should
  not be presented as guidance.
- **King's American Dispensatory** (Felter & Lloyd, 1898) — public
  domain. Strong on Eclectic-American herbal practice (echinacea,
  passionflower, st-john's-wort).
- **Eclectic Medical Journal** (19th-century US herbal publication)
  — public-domain case studies and traditional uses.
- **British Herbal Pharmacopoeia** (BHP, 1983 / 1996) — not public
  domain but the dosing standards are the modern Western reference.
  Cite by section; do not reproduce verbatim.
- **WHO monographs on selected medicinal plants** (volumes 1–4) —
  open access. Modern conservative evidence summaries; strong for
  cross-tradition entries (ashwagandha, ginseng).
- **European Medicines Agency (EMA) HMPC monographs** — open
  access. The European regulatory reference; good for
  pharmacovigilance / safety updates.
- **Cochrane Reviews** — open-access abstracts. Use for any "limited
  clinical-trial evidence" or "well-established" claims; cite the
  review.
- **PubMed-indexed open-access primary research** — for specific
  case reports / trial findings. Always link the DOI.
- **Juliette de Baïracli Levy, *Herbal Handbook for Farm and
  Stable*** — out-of-copyright in the UK by virtue of authorship
  dates; check region. Strong on practical preparation methods.
- **Anne McIntyre's published articles in open-access herbalism
  journals** — for cross-tradition framing.

When the source material is thin (a specific traditional preparation
not documented in the open literature), set `sourceType:
"SYNTHESISED"` and cite the next-closest material. Don't invent a
citation. Don't quote a modern named herbalist's book if the use is
actually a centuries-old tradition.

## Length guidance

Targets by entry type:

| Type | Word count | Examples |
|---|---|---|
| REMEDY — simple | 700 – 1,100 | Peppermint tea for indigestion, chamomile infusion for restlessness |
| REMEDY — compound | 1,200 – 1,800 | Calendula salve (oil + salve in one), elderberry syrup, drawing salve |
| REMEDY — multi-day | 1,800 – 2,500 | Tincture (4–6 weeks), cool-infused oil |
| HERB_PROFILE | 1,500 – 2,500 | Chamomile, elderberry, st-john's-wort |
| READING — short | 700 – 1,200 | "When NOT to use home herbal remedies" |
| READING — long | 1,500 – 2,500 | "How tinctures work", "Pregnancy and herbal medicine" |

Count `body` prose only — heading text, list items, infoPanel
bodies, pullQuote text. Don't count slugs, JSON wrappers, ingredient
or tool names.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log (one line per rewrite, with a path locator and a clause
on what changed).

Checklist:

1. Same banned-phrase, banned-opener, em-dash, negation, tricolon,
   safety, price, americanism, wrap-up, scaling-token, ingredient
   slug checks as `docs/tutorial-author.md` § "Self-critique pass".
2. Walk every entry in `docs/common-issues.md`. Rewrite or note.
3. Walk every entry in `docs/herbal-anti-tells.md`. Rewrite every
   `[block]` entry; note every `[warn]` entry deliberately left.
4. **The canonical disclaimer is present**, plain in the body
   (`infoPanel(tone: "warning")`), not buried.
5. **Every master safety flag** from the primary herb is surfaced
   in the body. Open the master row, walk each flag, find the
   matching paragraph in the body. Missing means rewrite.
6. **Drug interactions** named in plain prose when the master row
   has any `not-with-*` flag.
7. **Pregnancy / breastfeeding / paediatric** guidance named in
   plain prose when the master row has any related flag. The verb
   "consult a herbalist or your midwife" is the default; "do not
   use" is the verb for `pregnancy-avoid`.
8. **Dosing** — amount per dose + frequency + course length, every
   REMEDY, no exceptions.
9. **Storage** — container + location + shelf life, every REMEDY.
10. **Red flags** — when the related condition's master row carries
    `redFlagsRequireDoctor` text, that text is in the body verbatim.
11. **Evidence-level honesty** — the verb in any "supports / helps
    with / addresses" sentence is no stronger than the
    `HerbConditionUse.evidenceLevel` warrants. Default is
    "traditionally used for".
12. **Plant identification** — when foraging is implied, the
    poisonous look-alike is named.
13. **Ratios** — the preparation ratio is stated in the intro AND
    enforced in the `ingredientsList`.

The deterministic `voice-check` CLI is the final gate. The Herbal-
specific voice-check extension (banned therapeutic-claim verbs,
mandatory disclaimer text, mandatory dose pattern) is its own
session — entries marked `[needs-voice-check]` in
`docs/herbal-anti-tells.md` are ready to land there.

## Worked example — output JSON (compact)

A short remedy example showing every field a herbal REMEDY input
should fill. The body is abbreviated for the example — see the
anchor batch in `docs/herbal-anchor-briefs/` for fully-fleshed
examples.

```json
{
  "slug": "peppermint-tea-for-indigestion",
  "title": "Peppermint tea for indigestion",
  "subtitle": "The kitchen's after-dinner cup",
  "excerpt": "A simple hot infusion of dried peppermint leaves. Traditionally taken after a heavy meal for indigestion, mild bloating, or trapped wind.",
  "type": "REMEDY",
  "categorySlug": "herbal-medicine",
  "subCategorySlug": "digestive",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "Maud Grieve, A Modern Herbal (1931) — peppermint entry. EMA HMPC monograph on Mentha × piperita folium (2008) — modern dosing reference.",
  "recipe": {
    "yieldDescription": "1 cup (1 dose)",
    "prepMinutes": 2,
    "cookMinutes": 0,
    "restingMinutes": 8,
    "totalMinutes": 10,
    "scalable": true,
    "batchable": false,
    "makeAheadNotes": "Dried peppermint stores 12 months in a tin away from light. Prepare each cup fresh.",
    "foundational": false
  },
  "herbal": {
    "primaryHerbSlug": "peppermint",
    "relatedConditionSlugs": ["indigestion", "bloating"],
    "preparationType": "infusion",
    "safetyFlags": ["paediatric-caution"],
    "requiresMedicalDisclaimer": true
  },
  "recipeTools": [
    { "slug": "teapot", "isOptional": false },
    { "slug": "fine-strainer", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "infusion", "term": "Infusion", "definition": "A hot-water preparation of leaves or flowers, steeped covered to retain the volatile oils." }
  ],
  "body": { "type": "doc", "content": [ /* … intro + safety infoPanel + ingredientsList + Method H2 + Dosing H2 + Storage H2 + "When not to use" H2 + Sources … */ ] }
}
```

---

**Next session** picks up the pilot batch of 10 once Rebecca's
reviewed the anchor batch. Append to `docs/herbal-anti-tells.md`
any patterns recurring 3+ times across the pilot.

<!--
  Shared v5 appendix appended to tutorial-author.md, baking-author.md,
  mindset-author.md, and herbal-author.md. Source of truth for the
  cross-category content integration rules that landed in
  phase_8_content_integration_001.
-->

---

## v5 — content integration rules (cross-category)

The following rules apply to every drafter (cooking, baking, mindset,
herbal). They are deterministic — the upload pipeline checks them and
the self-critique pass must verify each before output.

### Image sourcing — two-pass

After voice-check passes and before upload, call the image-sourcing
helper to find a hero image:

```ts
import { sourceHeroImage } from '@/lib/image-sourcing'

const result = await sourceHeroImage({
  title: draftJson.title,
  category: draftJson.categorySlug,
  subCategory: draftJson.subCategorySlug,
  ingredients: extractKeyIngredients(draftJson),
})
```

`result.image` carries the URL + structured attribution metadata. Set
on the draft's `hero` block:

```json
{
  "hero": {
    "remoteUrl": "<result.image.url>",
    "alt": "<short descriptive alt text>",
    "source": "<result.image.source>",
    "sourceUrl": "<result.image.pageUrl>",
    "creatorName": "<result.image.creatorName>",
    "licenceCode": "<result.image.licenceCode>",
    "licenceUrl": "<result.image.licenceUrl>",
    "requiresAttribution": <result.image.requiresAttribution>
  }
}
```

The upload script downloads from `remoteUrl`, pushes to R2, and creates
the Media row with the structured attribution fields populated. The
public renderer shows the discreet © tooltip only when
`requiresAttribution === true`.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### Image verification — match the candidate against the herb

Every candidate goes through a verification check. For Herbal:
the candidate must show the correct plant part (a calendula salve
hero shows calendula flowers or salve, not a calendula plant in a
hedgerow). HERB_PROFILE heroes show the plant; REMEDY heroes show
the preparation. The reject criteria are the same as cooking: wrong
subject, wrong format, off-brand. Use `verify-media-batch.ts` +
`apply-media-verdicts.ts` for the sweep path, or pass `verify` to
`sourceHeroImage` for inline verification.

### ProjectSchedule registration — multi-day arcs

Long-arc REMEDY rows register `projectSchedule` rows so the homepage
can resurface the project on the right day after a reader clicks
"I'm making this". Detect a multi-day arc when:

- Tincture (folk method): 4–6 weeks
- Cool-infused oil: 4–6 weeks
- Long maceration vinegars
- Multi-day decoctions where the herb is steeped overnight before
  simmering the next day
- Compound preparations where one component takes a week to set up

Each step:

```json
{
  "stepNumber": 1,
  "offsetDays": 0,
  "title": "<short imperative>",
  "body": "<one paragraph>",
  "surfaceAs": "RAIL_CARD",
  "requiresUserAction": true
}
```

`surfaceAs`:

- `HERO` — takes over the homepage hero. Reserve for big-moment days
  ("Your tincture is ready to strain and bottle").
- `RAIL_CARD` — default. Shows in the "Today's scheduled project
  actions" rail.
- `NOTIFICATION_ONLY` — in-app notification, no homepage change.

Single-session REMEDY rows leave `projectSchedule` empty.
HERB_PROFILE + READING rows must not carry a schedule (the validator
rejects them).

### Cross-category audit rules

The following are hard rules the drafter checks before output.

1. **Temperature canonical °C.** Always store conventional in
   `recipe.temperatureCelsius` (or `cookMinutes` / `restingMinutes`
   for time-based stages). The public renderer derives °F where
   needed from the reader's preference.
2. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong.
3. **Servings vs yieldDescription.**
   - REMEDY rows: yield is always discrete-item — "1 cup of tea",
     "100 ml tincture (~20 doses)", "1 small tin (~30 g salve)".
     Set `yieldDescription`; leave `servings` null.
   - HERB_PROFILE + READING: neither.
4. **freezeNotes reality.** Most herbal preparations are NOT
   freezable; leave `freezable: false`. The handful that are
   (decoctions for later use, herb-infused stocks) set
   `freezable: true` with a real description.

### Missing technique logging

When the body inserts a `subTutorialCard` block referencing a
technique slug that doesn't exist in the database as a published
`Tutorial`, the upload script appends a line to
`docs/missing-techniques.md`:

```
- **{technique-slug}** — referenced by recipe `{recipe-slug}` on
  {date}. Suggested technique title: "{readable name}".
```

A future technique-authoring session walks this file.

## Technique linking

Tutorials reference foundational technique tutorials inline so a reader
who needs to learn the underlying technique can step into it without
leaving the page. Two surfaces work together:

- **Inline `techniqueLink` mark** on a span of body text. Set
  `attrs.techniqueSlug` to the technique tutorial's slug and
  `attrs.label` to the wrapped text. The renderer turns it into a
  hover-popover + click-through anchor, or falls back to plain text
  when the technique tutorial isn't authored yet (the link goes live
  the moment it does — wrap the words anyway).
- **Top-level arrays** on the JSON: `techniqueSlugs[]` carries every
  technique slug referenced in the body, deduplicated.
  `criticalTechniques[]` is the subset without which the tutorial
  doesn't work; every entry must also appear in `techniqueSlugs[]`.

The self-critique pass must check coverage: every `techniqueLink` mark's
slug appears in `techniqueSlugs[]`, every entry in `techniqueSlugs[]`
appears at least once in the body inside a `techniqueLink` mark, and
every `criticalTechniques[]` entry is also in `techniqueSlugs[]`.

See `docs/tutorial-author.md` § "Technique linking" for the full mark
shape and when-to-wrap rules.
