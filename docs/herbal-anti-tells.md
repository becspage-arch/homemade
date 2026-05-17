# Herbal-medicine anti-tells — drafts that recur

Patterns that recur in Herbal drafts often enough to be worth catching
proactively during self-critique. Maintained as a living list — the
Herbal equivalent of `docs/common-issues.md` for the shared cross-
category list, and the analogue of `docs/baking-anti-tells.md` for
Baking.

**This is the longest anti-tells list of any category on Homemade.**
The safety stakes are higher, the legal exposure for medical-claim creep
is real, and the "natural means safe" pull is constant. Every item here
is enforced; nothing is decorative.

**How this list is used:**

- Every Herbal drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/herbal-author.md`
  § "Self-critique pass") includes a step that checks each entry below
  against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry at the end of the relevant section before the
  session hands off.
- When Rebecca spot-checks live entries and finds a recurring issue,
  she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (a banned phrase, a banned verb), it
  should also be added to `packages/db/scripts/voice-check.ts` so the
  upload gate catches it without relying on self-critique. The Herbal-
  specific voice-check extension is its own session — entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity flag
with the rule: `[block]` (rewrite mandatory), `[warn]` (rewrite
preferred but not required).

Seeded with the patterns the anchor-batch worker expected to see + the
patterns the cooking, baking, and mindset pipelines surfaced that
translate to herbal. Will accrue more entries as pilot / bulk batches
land.

---

## Safety voice (the strict ones)

- **Therapeutic-claim verbs** `[block]` `[needs-voice-check]`
  Pattern: the verbs **cures**, **treats**, **fixes**, **heals**,
  **boosts the immune system**, **detoxifies**, **balances hormones**,
  **flushes out toxins**, **strengthens the liver**, **regulates blood
  sugar**, **fights infection**, **kills bacteria** in body prose
  referring to a herb's effect on a reader. Any of these is a medical
  claim and is blocked.
  **Why:** Herbal medicine is regulated in every market Homemade
  serves. Medical claims expose the publication to MHRA / FDA action
  and undermine the "not medical advice" disclaimer. The traditional-
  framing language is also more accurate — herbs work with the body,
  not on a disease.
  **How to fix:** Rewrite to the traditional frame. "Traditionally
  used for indigestion." "The action western herbalists draw on."
  "Supports the body's own response." The verb "supports" is the
  strongest claim a herbal entry makes; even that is used sparingly.
  Never name a disease as the object of the verb ("cures eczema" →
  "traditionally applied to mild skin irritation"). Never use
  "immune-boosting" — say "immune-supporting" or, better,
  "traditionally taken at the first sign of a cold".

- **Missing canonical disclaimer** `[block]`
  Pattern: a REMEDY or HERB_PROFILE body without the
  `infoPanel(tone: "warning")` block carrying the canonical
  disclaimer near the top. Or the disclaimer present but buried as
  a footnote, an asterisk, or the last line of `sourceNotes`.
  **Why:** The disclaimer is the legal and editorial backbone of
  the herbal pipeline. It belongs in the body, visible, plain. Not
  as a footnote a reader scrolls past, not as a tooltip on the
  sources block, not as the renderer-only "Always consult a doctor"
  microcopy in the footer. The renderer surfaces the footer
  disclaimer in addition to the body one, not in place of it.
  **How to fix:** Insert the `infoPanel(tone: "warning")` block
  directly after the intro paragraph. Title: "Important safety
  notes". First sentence of the body: "Not medical advice. Consult
  a qualified herbalist or doctor for ongoing or serious symptoms."
  Then the herb-specific drug interactions and pregnancy /
  paediatric notes in plain prose.

- **Pregnancy-safe statements without herb-specific verification** `[block]` `[needs-voice-check]`
  Pattern: "Safe in pregnancy." "Suitable for use throughout
  pregnancy." "Recommended during pregnancy." Generic pregnancy
  reassurances on any herb. Even on herbs that are widely tolerated
  (chamomile, ginger at low dose), the publication does not assert
  pregnancy safety.
  **Why:** Pregnancy safety claims invite reliance the publication
  cannot underwrite. Different stages of pregnancy carry different
  risks; individual readers carry different histories. The publication
  defers to the midwife or herbalist who knows the reader.
  **How to fix:** Name the master `safetyFlags` flag in plain prose.
  Default phrasing for `pregnancy-caution`: "Consult a herbalist or
  your midwife before using this remedy in pregnancy." Default
  phrasing for `pregnancy-avoid`: "Do not use this remedy in
  pregnancy." For stage-specific (`pregnancy-stage-specific`,
  e.g. raspberry leaf): name the stages — "Traditional Western
  herbal practice introduces raspberry leaf only in the third
  trimester (from about 32 weeks). Avoid in the first or second
  trimester." Never claim a herb is "pregnancy safe" without the
  qualifier.

- **Drug-interaction blindness** `[block]` `[needs-voice-check]`
  Pattern: a REMEDY or HERB_PROFILE for a herb whose master
  `safetyFlags` includes any `not-with-*` entry, but the
  interaction is not named in body prose. Most-common offenders:
  st-john's-wort (SSRIs / contraceptives / warfarin / many others),
  ginger / garlic / turmeric (anticoagulants), valerian /
  passionflower / hops (sedatives), liquorice (cardiac medication).
  **Why:** Drug interactions are the harms a herbal entry should
  proactively prevent. A reader scanning for whether their warfarin
  is a problem with their new echinacea or st-john's-wort cannot
  rely on a flag buried in metadata — the renderer cannot make that
  call. The author surfaces it in the safety block.
  **How to fix:** For every `not-with-*` flag in the primary herb's
  master row, add a sentence to the safety block's drug-interactions
  paragraph. "St John's wort lowers the blood level of many
  prescription drugs — SSRIs, the contraceptive pill, warfarin,
  transplant immunosuppressants, HIV medication, and many others.
  Anyone on prescription medication should consult their prescriber
  before using this herb." Plain prose, named drugs (generic names
  for international friendliness), no asterisks.

- **Children's dosing copied from adult dosing** `[block]`
  Pattern: a REMEDY's "Dosing" section names an adult dose and adds
  "for children, use half the dose" or "scale to body weight". Adult-
  divided-by-body-weight is not safe paediatric dosing — herbal
  paediatric dosing depends on developmental stage and the specific
  herb.
  **Why:** Some herbs (peppermint oil, eucalyptus) are contraindicated
  in infants regardless of weight-scaled dose. Some herbs need
  alcohol-free preparation forms in paediatric use (no tinctures —
  glycerites or syrups instead). Adult-style dosing in a child causes
  real harm.
  **How to fix:** Default phrasing on every REMEDY: "Paediatric use
  is not adult-divided-by-half. Consult a herbalist who specialises
  in children's herbal medicine, or a paediatric doctor, before using
  any herbal preparation in children under twelve." If a remedy IS
  appropriate for children at a documented dose, name the source and
  the dose for the specific age band (Maud Grieve and modern
  herbal-paediatric texts give stage-specific guidance); never invent.

- **Disclaimer-as-asterisk** `[block]`
  Pattern: the canonical disclaimer rendered as a footnote at the end
  of the body, or as a single italic sentence inside `sourceNotes`,
  or compressed onto an asterisk after the title. The disclaimer is
  the friend; treating it as something to hide is a tell.
  **Why:** A disclaimer the reader doesn't see has no effect. Modern
  herbal publishing has converged on body-level, plain-prose
  disclaimers in safety boxes — that is the standard the publication
  matches.
  **How to fix:** Move the disclaimer into the `infoPanel(tone:
  "warning")` block directly after the intro. The block also carries
  the drug-interaction and pregnancy / paediatric prose. Length: one
  short paragraph per concern. The disclaimer is the first sentence
  of the block's body.

- **Internal use of strictly-external herbs** `[block]`
  Pattern: a method or dosing section that suggests drinking, eating,
  or sipping a herb the master `safetyFlags` has flagged
  `external-use-only`. Worst offenders: comfrey (root or leaf — both
  external only in modern western herbal practice owing to pyrrolizidine
  alkaloids), arnica (any internal use), poison-oak / poison-ivy
  remedies that involve the plant.
  **Why:** External-only flags map to known hepatotoxic or otherwise
  systemically harmful constituents. The flag exists because the herb
  has historical internal uses (Culpeper recommends comfrey internally
  — that recommendation predates modern pharmacology). Following the
  historical recommendation produces real harm.
  **How to fix:** Honour the flag. If the brief mistakenly asked for
  an internal preparation of an external-only herb, push back on the
  brief — switch the brief to an external preparation (salve, oil,
  compress) or pick a different herb with the same traditional action
  but no `external-use-only` flag. Don't quietly draft the unsafe
  preparation.

- **"Natural means safe" undertone** `[block]`
  Pattern: framings like "a gentle, natural alternative to…", "the
  body recognises plant medicines as kin", "no side-effects because
  it's natural", "herbs work in harmony with your body" without the
  matching safety realism. The undertone is a tell even when no
  single sentence is overtly problematic.
  **Why:** The publication's voice is conservative. Herbs interact
  with drugs, herbs cause allergies, herbs accumulate in the liver,
  herbs cross to the foetus. Treating "natural" as a synonym for
  "safe" undermines every safety paragraph in the same body.
  **How to fix:** Cut the phrase. Replace with the herb's specific
  action ("a carminative herb traditionally taken after meals"
  rather than "nature's gentle remedy for digestion"). When the
  prose wants to acknowledge the herb's accessibility, use
  "centuries-used" or "kitchen-staple" — they're factual.

## Sourcing + evidence

- **Evidence-level overclaim** `[block]`
  Pattern: a remedy or herb profile asserting "clinical trials
  confirm…" or "research has shown…" or "studies prove…" when the
  underlying `HerbConditionUse.evidenceLevel` is `traditional`.
  **Why:** Evidence-level honesty matters more in herbal than in any
  other category. Overclaiming research evidence misleads readers,
  and the research / traditional ladder is the publication's
  honesty signal.
  **How to fix:** Match the verb to the evidence level. For
  `traditional`: "Traditionally used for…". For `case-based`:
  "Case-based evidence supports…" with the citation in
  `sourceNotes`. For `clinical-trial-supported`: "Limited clinical-
  trial evidence supports…". For `well-established`: "The use is
  well documented in modern research…", with the named meta-analysis
  or major review in `sourceNotes`. Default to `traditional` unless
  the brief explicitly says otherwise with a citation.

- **Tradition-mashing** `[block]`
  Pattern: quoting Ayurvedic constitution theory in a western
  herbal entry on chamomile; quoting traditional Chinese medicine
  "damp heat" framing on a European remedy for indigestion; using
  Native American traditional usage as the sole authority for a
  herb without acknowledging the tradition's sourcing standards.
  **Why:** Each tradition has its own internal logic. Lifting
  vocabulary from one to dress up a remedy from another reads as
  exotic-sounding window dressing and disrespects both traditions.
  **How to fix:** Match the framing to the tradition you're
  citing. For a herb the master row lists as `western-herbal`
  only, stay within western herbal vocabulary. For a cross-
  tradition herb (ashwagandha, ginseng, holy basil), name each
  tradition that documents it and give it a separate paragraph in
  the "Traditional uses" section. Don't merge them.

- **Crediting a public-domain remedy to a modern named herbalist** `[block]`
  Pattern: a `sourceNotes` that credits the remedy itself to a
  modern named herbalist (Stephen Buhner, Rosemary Gladstar, David
  Hoffmann) when the remedy is a centuries-old preparation those
  authors have re-described. Crediting the modern source obscures
  the lineage and exposes the publication to attribution
  challenges.
  **Why:** Same as the baking version — honesty + safety. Many
  modern herbal books cite the historical source they drew on; the
  publication cites the historical source directly and may mention
  the modern re-description as a secondary line.
  **How to fix:** Cite the historical source as primary (Maud
  Grieve, Culpeper, the King's Dispensatory, the EMA monograph).
  Mention the modern populariser as a secondary line if relevant
  ("modern herbal texts after Hoffmann frame the preparation this
  way; the structure here follows Grieve").

- **Vague preparation** `[block]`
  Pattern: method prose like "steep for a while", "until it smells
  herbal", "add enough alcohol to cover", "leave in a warm place
  for some weeks". The reader doesn't know what to do.
  **Why:** Herbal preparations live or die on the ratio + time +
  temperature triplet. A vague preparation is a failed preparation.
  **How to fix:** Pair time + visual cue + a sensory cue at every
  pause. "Steep covered, 8–10 minutes; the water should be deep
  green-yellow and smell strongly of peppermint when you uncover."
  "Macerate 4–6 weeks in a cool dark cupboard; the spirit should
  be deep amber and the herb should have lost its colour." State
  the ratio in the ingredientsList AND the intro (1 part herb : 5
  parts spirit by weight).

- **Missing dosing** `[block]`
  Pattern: a REMEDY whose "Dosing" section says "drink as needed",
  "use freely", "apply to the affected area as often as required",
  or names no amount per dose, frequency, or course length.
  **Why:** A reader without dosing is a reader guessing. Some
  herbs (valerian, st-john's-wort, liquorice, hops) have meaningful
  upper limits that the prose has to name. Even gentle herbs need
  a dose so the reader can recognise whether they're under- or
  over-dosing.
  **How to fix:** Name the three: **amount per dose** ("1 cup",
  "1 ml tincture", "1 tsp salve, thinly"), **frequency** ("up to
  3 times a day", "twice daily, morning and evening", "as needed
  for an acute episode, up to 6 doses a day"), **course length**
  ("for the duration of an acute episode, up to 7 days; see your
  doctor if symptoms persist", "for up to 4 weeks; take a 2-week
  break before another course"). Never "as needed" alone.

- **Em-dash appositive pairs in `sourceNotes` or body** `[block]`
  Pattern: prose using an em-dash pair to offset a clause: `"Maud
  Grieve — the canonical western herbal reference — documents…"`
  or `"this remedy — a simple infusion — is the kitchen's standard
  after-dinner cup"`. The voice-check CLI treats any `— text —`
  pattern as an ERROR.
  **Why:** The voice-check rule is applied across all string
  fields. The Homemade voice rejects appositive em-dash pairs as a
  voice tell regardless of the underlying text.
  **How to fix:** Rewrite as colons, parentheses, or two sentences.
  `"Maud Grieve (the canonical western herbal reference) documents…"`
  or `"This remedy is a simple infusion: the kitchen's standard
  after-dinner cup."` Run `fix-emdash.js` on the brief before
  attempting an upload.

## Metadata + structural

- **Wrong category slug** `[block]`
  Pattern: `"categorySlug": "herbal"` or `"categorySlug": "herbs"`
  or `"categorySlug": "apothecary"` — anything but the seeded slug.
  **Why:** The Category was seeded as `herbal-medicine` in
  `seed-categories.ts`; the upload script rejects any other slug.
  **How to fix:** Always `"categorySlug": "herbal-medicine"`.

- **Wrong type for the entry kind** `[block]`
  Pattern: a herb profile drafted as `type: "TECHNIQUE"`, or a
  remedy drafted as `type: "RECIPE"`, or a "when not to use"
  article drafted as anything other than `type: "READING"`.
  **Why:** The renderer surfaces different info-bar variants and
  different page layouts per type. A herb profile rendered as a
  technique loses the safety block placement and the materia-
  medica structure.
  **How to fix:** REMEDY for preparation tutorials. HERB_PROFILE
  for single-herb materia-medica entries. READING for foundations
  / safety / "when not to use" articles. The upload script
  validates the type against the herbal block — REMEDY without
  `herbal.preparationType` is rejected.

- **Missing or invalid `primaryHerbSlug`** `[block]`
  Pattern: a REMEDY or HERB_PROFILE whose `herbal.primaryHerbSlug`
  is missing, or set to a slug that doesn't exist in the master
  `Herb` table.
  **Why:** The upload script resolves the slug against the master
  table and fails loudly on a miss. A typo loses the FK
  relationship that powers the "remedies that use this herb" cross-
  reference.
  **How to fix:** Always look up the herb in
  `packages/db/scripts/data/herbs.ts` before authoring. If the herb
  isn't there, add it (with its full safetyFlags) and rerun
  `seed-herbs.ts` before uploading the entry.

- **Wrong `preparationType` value** `[block]`
  Pattern: `"preparationType": "tea"` (should be `infusion`),
  `"preparationType": "ointment"` (should be `salve`),
  `"preparationType": "lotion"` (not in the enum).
  **Why:** The `preparationType` field is the public filter
  ("show me all tincture remedies"). The vocabulary is fixed at
  the data layer.
  **How to fix:** Use one of: `tincture`, `decoction`, `infusion`,
  `oil`, `salve`, `balm`, `syrup`, `compress`, `poultice`, `bath`,
  `steam`, `inhalation`, `gargle`, `capsule`. If none fits, the
  brief or the master table needs the new value — don't invent.

- **Guessing tool slugs** `[block]`
  Pattern: `recipeTools` entries with tool slugs that seem
  plausible (`"dark-bottle"`, `"glass-jar-amber"`,
  `"muslin-cloth"`) but don't match the master table.
  **Why:** Tool slugs follow a specific naming convention
  (`bottle-dropper-amber`, `jar-glass-mason`, `cheesecloth`).
  Guessing fails the upload.
  **How to fix:** Always look up the exact slug in
  `packages/db/scripts/data/tools.ts` before writing a
  `recipeTools` entry. If the tool is genuinely new, add it to
  `tools.ts` and reseed before uploading.

- **`recipe.scalable: true` on a remedy that doesn't scale** `[warn]`
  Pattern: a tincture, salve, or syrup recipe left with the default
  `scalable: true`. Most preparations scale linearly, but salve
  ratios change at small batch sizes (the beeswax-to-oil ratio
  needs adjusting in a 5 g batch vs a 200 g batch), and syrup
  shelf-life changes with sugar concentration which can drift on
  scale-down.
  **Why:** A reader who scales an un-scalable preparation will
  produce a result that won't set or won't keep.
  **How to fix:** Set `false` on salves / balms / syrups unless the
  brief specifically confirms the recipe scales 0.5×–2× cleanly.
  Infusions, decoctions, compresses, baths, tinctures (folk
  method) all scale fine.

- **Season enum lowercase** `[block]`
  Pattern: `"season": "autumn"` — lowercase season values. Prisma
  rejects them at upload with a validation error.
  **Why:** The Prisma `Season` enum is `AUTUMN / WINTER / SPRING
  / SUMMER` (uppercase). JSON values must match.
  **How to fix:** Use `AUTUMN`, `WINTER`, `SPRING`, `SUMMER`,
  `YEAR_ROUND`, or `null`. Most herbal entries are year-round; use
  `null` when there's no seasonal pull.

- **Missing red-flags surfacing** `[warn]`
  Pattern: a REMEDY references a `Condition` via
  `relatedConditionSlugs` but the body does not include the
  `redFlagsRequireDoctor` text from the master `Condition` row in
  the "When NOT to use this remedy" section.
  **Why:** Red-flag text is the master row's reasoned advice on
  when self-treatment is the wrong call. Skipping it means the
  reader doesn't see the doctor-instead signal.
  **How to fix:** Walk every related condition's master row;
  include the `redFlagsRequireDoctor` text verbatim in the "When
  NOT to use this remedy" section. If the master row has no red-
  flag text, decide whether the condition needs one and add it to
  `data/conditions.ts` rather than silently skipping.

## Source-attribution

- **Citing a herbal-blog URL as a primary source** `[block]`
  Pattern: `sourceNotes` listing a Substack, Medium post, or
  herbal-influencer blog as the primary citation for a traditional
  use. The herbal blogosphere is a thin layer over Maud Grieve,
  Culpeper, and the King's Dispensatory — cite the underlying
  sources.
  **Why:** Citation transparency. A blog post cited as authority
  obscures whether the claim has any basis in the long-established
  literature, and exposes the publication to embarrassing follow-
  ups when the blog post turns out to have invented its own
  source.
  **How to fix:** Cite the underlying public-domain or open-access
  source. Most herbal-blog content traces to Maud Grieve, Culpeper,
  Felter & Lloyd's `King's American Dispensatory`, or the WHO /
  EMA monographs. If the brief author only had a blog, push back
  on the brief — find the underlying citation or set the
  `sourceType` to `SYNTHESISED` and cite the next-closest
  authoritative material.

- **Quoting Culpeper's astrology as guidance** `[block]`
  Pattern: a herb profile that includes Culpeper's astrological
  attribution ("Under Venus", "ruled by Mars") in body prose as if
  it were current guidance.
  **Why:** Culpeper's *English Physician* (1652) is rich
  traditional-use material; the astrological framing is a
  historical curiosity, not a guide to modern use. Surfacing it
  uncritically reads as new-age window dressing — exactly the
  voice the publication avoids.
  **How to fix:** Reference Culpeper for the traditional use as
  recorded in his text. If the astrological attribution is worth
  noting as historical context, put it in a single sentence under
  "Traditional uses" framed as history: "Culpeper attributed
  chamomile to the sun in his 1652 *English Physician*, a
  classification that reflects the herbal cosmology of his time
  rather than current understanding." Don't lead with it. Don't
  use it as guidance.
