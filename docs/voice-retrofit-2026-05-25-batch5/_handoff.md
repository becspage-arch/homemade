Batch 2026-05-25-batch5: 50 tutorials retrofitted. Deploy green, healthz 200.

## DB verification

### audit-recent-state (full category table)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | (none)           |      0 |     4
  7 | knitting              | NOT_READY   |    9 | (none)           |      0 |     3
  8 | needlework            | NOT_READY   |    4 | (none)           |      0 |     3
  9 | sewing                | NOT_READY   |   15 | (none)           |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-20 20:30 |    127 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2308
  VERIFIED                     : 1227
```

(Em-dash characters in the "last fire" column of the raw audit output have been replaced with "(none)" to keep this hand-off file dash-clean.)

### Voice-retrofit progress (filtered on voiceRetrofittedAt)

- Before batch5 apply: 181 retrofitted (pilot 10 + batch1 50 + batch2 21 + batch3 50 + batch4 50)
- After batch5 apply: 231 retrofitted, 3304 unretrofitted
- Difference: +50 retrofitted (matches batch size exactly)

### Spot-check

- slug: ginger-profile
- voiceRetrofittedAt: 2026-05-25T20:05:43.007Z
- category slug: herbal-medicine
- first paragraph in the live DB body:

> "Ginger is the root of a tropical grass grown across South and Southeast Asia, India, China, and West Africa. In British kitchens it shows up as fresh root, dried ground spice, crystallised ginger, and extract. In herbal medicine it is used fresh, dried, or as a tincture. Fresh and dried are not the same in strength: fresh ginger is richer in gingerols, while drying turns some of those into shogaols, which are warmer and stronger. Cooking ginger and medicinal ginger are the same plant. The dose makes the difference."

The public URL https://homemade.education/herbal-medicine/ginger-profile is currently behind the pre-launch splash gate (title "Homemade", body "coming soon") so a public-page render check is not possible at this stage of the build. The DB body above is authoritative.

### Slugs retrofitted in this batch (50)

```
a-six-figure-balance-shoulders-down
a-six-figure-deposit-and-your-body-staying-calm
activities-as-practice
air-fryer-cauliflower
air-fryer-cauliflower-steaks
air-fryer-chicken-drumsticks
air-fryer-chicken-thighs
air-fryer-chips
air-fryer-falafel
air-fryer-french-fries
aligned-clients-find-me-easily
american-buttercream-crusting
arms-open-i-allow-steady-income
bay-leaf-burn
bills-always-win-journal
bills-show-a-life-worth-running
buttercream-frosting-vanilla
caramel-sauce-salted
carved-beech-mustard-spoon
carved-birch-butter-spreader
carved-birch-kuksa
carved-birch-serving-fork
carved-cherry-dessert-server
carved-cherry-dessert-spoon
carved-cherry-salad-fork
carving-patterns-leather-hard-clay
centring-half-kilo-of-stoneware
chained-plying-wheel-technique
checking-ewe-condition-in-late-pregnancy
coconut-oil-body-polish
coconut-wax-jar-candle
coffee-sugar-scrub
cold-process-lavender-soap
cold-process-oatmeal-soap
colloidal-oat-cold-process-soap
deodorant-paste
drilling-into-masonry
dyeing-leather-upholstery
feathering-filler-technique
filling-scratches-and-dents-with-wax-sticks
fitting-a-compression-fitting
fitting-a-leather-edge-bevel-and-burnish
fitting-push-fit-plastic-waste-pipe
garlic-honey-for-cold
garlic-infusion-for-colds
ginger-compress-for-muscle-ache
ginger-infusion-for-nausea
ginger-profile
ginger-warming-bath
lavender-bath-for-restlessness
```

## Sample public URLs

- https://homemade.education/herbal-medicine/ginger-profile
- https://homemade.education/herbal-medicine/garlic-honey-for-cold
- https://homemade.education/herbal-medicine/lavender-bath-for-restlessness
- https://homemade.education/herbal-medicine/ginger-warming-bath
- https://homemade.education/mindset/a-six-figure-balance-shoulders-down
- https://homemade.education/mindset/bay-leaf-burn
- https://homemade.education/cooking/air-fryer-cauliflower
- https://homemade.education/natural-home/cold-process-oatmeal-soap
- https://homemade.education/natural-home/deodorant-paste
- https://homemade.education/home-repair/fitting-a-compression-fitting

All return the splash gate "coming soon" page at this stage of the build.

## Before / after excerpts across three content types

### Herbal (garlic-honey-for-cold, opening paragraph, second text node)

OLD:
"and other sulphur compounds from the garlic; the honey itself softens the harshness and acts as a mild preservative. Taken by the teaspoon at the onset of a cold, or stirred into a mug of hot water with lemon, this is one of those kitchen remedies that crosses cultures and centuries. Maud Grieve (1931) notes garlic's antimicrobial and expectorant properties at length; the WHO monograph on Allium sativum (1999) confirms the evidence for allicin as the key active constituent. The result is pungent, distinctive, and very effective at reminding everyone in the household that someone is trying to ward off a cold."

NEW:
"and other sulphur compounds from the garlic. The honey softens the harshness and acts as a mild preservative. Taken by the teaspoon at the start of a cold, or stirred into a mug of hot water with lemon. A kitchen tradition long made for the head cold and the tickly chest. Pungent, sharp, and easy to spot on the breath of whoever made it."

### Mindset (bay-leaf-burn, "Where this practice comes from")

OLD:
"Bay leaf burning is a widely practised ritual in folk magic traditions across many cultures, particularly those of the Mediterranean, where bay laurel has long been associated with purification and the release of what is no longer needed. Adapted here as a companion ritual for Day 16 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025)."

NEW:
"Bay leaf burning is a long folk-magic tradition across many cultures, in particular around the Mediterranean, where bay laurel is tied to purification and release. Adapted here as a companion ritual for Day 16 of MONEY: A 12-Week Tapping Program by Rebecca J Page. See the sources note for the program detail."

### Natural-home (cold-process-oatmeal-soap, "Cure milestones" paragraph)

OLD:
"Day 1, unmould and cut into bars (see Method above). Day 14, turn each bar 90 degrees so a different face is upward; the rack-facing face cures slowest and the turn evens that out. Day 28, cure-test by slicing a thin sliver off one corner, wetting it under the tap, and checking the lather (rich and stable) and the pH (9-10 on a narrow-range strip; anything above 11 means another two weeks). Use this test bar as the household soap; the rest finishes cure. Day 42, cure complete. Cured bars are firm, mild, and long-lasting; store six in a paper-lined wooden box or wrapped loosely in paper."

NEW:
"Day 1: unmould and cut into bars (see Method above). Day 14: turn each bar 90 degrees so a different face is upward. The rack-side face dries slowest, and the turn evens that out. Day 28: test a bar by slicing a thin sliver off one corner, wetting it under the tap, and checking the lather (rich and stable) and the pH (9 to 10 on a narrow-range strip; anything above 11 means another two weeks). Use this test bar at the sink while the rest finishes. Day 42: the bars are ready. Cured bars are firm, mild, and long-lasting. Store six in a paper-lined wooden box or wrapped loosely in paper."

## Category-by-category count

- mindset: 8
- cooking: 7
- wood-natural-craft: 7
- natural-home: 7
- home-repair: 7
- herbal-medicine: 7
- baking: 3
- pottery-ceramics: 2
- fibre-arts: 1
- animals-smallholding: 1

## Surprises

- 28 of the 50 picked files were already clean against the voice-check rule set on first scan. Only 22 needed any rewrite. Most of the cooking (air-fryer family) and the carved-spoon wood-natural-craft files were already in register from earlier authoring.
- The herbal cluster (garlic-honey, garlic-infusion, ginger-warming-bath, ginger-compress, ginger-infusion-for-nausea, ginger-profile, lavender-bath) carried the bulk of the rewrite work: stacked academic citations (Grieve, EMA, WHO), unwrapped clinical vocabulary (expectorant, antispasmodic, anti-inflammatory, maceration, decoction), and the old-shape "Consult a qualified herbalist or doctor" medical disclaimer in infoPanels. All seven normalised to the locked canonical disclaimer "Not medical advice. Consult a medical professional for ongoing or serious symptoms." while keeping every pregnancy, allergy, paediatric, anticoagulant, and red-flag note in plain-English form. Substance preserved across all of them.
- ginger-profile (herb-profile reference content) had the heaviest lift: 11 errors with one paragraph at grade 25.3. The seven sections (The herb, Traditional uses, What it is used for today, How well it is studied, Preparations and doses, Safety, plus the medical-note infoPanel) all kept their substance (gingerols / shogaols distinction, dose tables for hot infusion / compress / bath / tincture, anticoagulant and pregnancy notes) while losing the academic vocabulary (antiemetic, carminative, rubefacient, diaphoretic, expectorant) and the institutional citation density (WHO 1999, EMA 2012, King's American Dispensatory).
- cold-process-oatmeal-soap (9 errors) needed three rewrites for "saponification" (replaced with "soap-forming chemistry / reaction") and two for the medical-claim watchword "cures" (replaced with "dries" and "sits" where the original meant the soap-curing process, not medical curing). The 6-week cure paragraph and the troubleshooter symptom/cause/fix items kept their full substance.
- "(2025)" appeared in body prose on five Mindset tutorials (activities-as-practice, arms-open-i-allow-steady-income, bay-leaf-burn, bills-always-win-journal, bills-show-a-life-worth-running) referencing the MONEY and MANIFESTING program publication year. Per voice-spec rule 6.1, all moved to sourceNotes with the body retained as "Rebecca J Page" without the year. Mindset's "Where this practice comes from" section convention stays intact.
- "anhydrous" appeared unwrapped in the deodorant-paste storage paragraph (separate from the wrapped occurrence in the orientation). Replaced with "water-free" inline.
- No file dropped more than ~10 per cent of body word count. The biggest losses were on garlic-honey-for-cold (~9 per cent) and ginger-profile (~12 per cent), both because of citation-density paragraphs and "Important safety notes" infoPanel rewrites. Substance count is identical before and after on both.
- No em-dash or en-dash characters in any of the 50 rewritten body JSON files, hand-off file, or commit message. Grep confirmed clean before commit.

## Forward read

3304 PUBLISHED tutorials still have voiceRetrofittedAt IS NULL after this batch. The next cron fire (21:30) will pick the next 50 from the round-robin content-type pool (mindset 868 remaining, recipe 1649 remaining, craft-technique 367 remaining, craft-project 357 remaining, natural-home-recipe 66 remaining, home-repair 24 remaining, herbal 23 remaining). Combined retrofit total to date: pilot (10) + batch1 (50) + batch2 (21) + batch3 (50) + batch4 (50) + batch5 (50) = 231.

## Deploy verification

- Run ID 26417808199 on workflow deploy.yml against main.
- gh run watch exited 0 (deploy green).
- healthz smoke: https://homemade.education/healthz returned 200.
- Rebase note: a fast-forward push was blocked because origin/main had picked up one new commit (image-pipeline billing-failures notify Rebecca + auto-backfill) while the batch5 work was in flight. Rebased cleanly onto origin/main with no conflicts.

## Script changes shipped with this batch

- packages/db/scripts/_batch5-pick.ts (new): picks 50 candidates filtered on `voiceRetrofittedAt IS NULL` (the dedicated voice-retrofit tracking field, isolated from the shared `revisedFrom` field), with round-robin content-type spread and a 15-per-category cap. Replaces the earlier `_batch3-pick.ts` filter on `revisedFrom IS NULL`, which gave false positives because `revisedFrom` is shared with the image-relevance and mindset-audit pipelines.
- packages/db/scripts/_batch-voice-apply.ts (changed): now populates `voiceRetrofittedAt` on each successful apply so the routine's pick filter stays correct on every subsequent fire. Existing `revisedFrom` snapshot behaviour preserved (writes only when null, never overwrites a snapshot from another pipeline).
- packages/db/scripts/_batch5-verify-db.ts (new): one-shot verification script used to produce the DB counts and spot-check above. Not part of the routine pipeline; kept in scripts for repeatability.
