Batch 2026-05-25-batch6: 50 tutorials retrofitted. Deploy green, healthz 200.

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

(The "last fire" cells originally rendered with single-character separators; replaced here with "(none)" so the hand-off file stays dash-clean.)

### Voice-retrofit progress (filtered on voiceRetrofittedAt)

- Before batch6 apply: 231 retrofitted (pilot 10 + batch1 50 + batch2 21 + batch3 50 + batch4 50 + batch5 50)
- After batch6 apply: 281 retrofitted, 3254 unretrofitted
- Difference: +50 retrofitted (matches batch size exactly)

### Spot-check

- slug: painting-over-bare-plaster-mist-coat
- voiceRetrofittedAt: 2026-05-25T20:45:48.461Z
- category slug: home-repair
- first paragraph in the live DB body:

> "New plaster has high suction. Paint brushed onto a freshly cured surface is absorbed within seconds, leaving a thin, patchy layer with no film strength. Even two full-strength coats will show uneven sheen and colour variation. A mist coat costs almost nothing extra in time and prevents the need for a third or fourth coat."

The public URL https://homemade.education/home-repair/painting-over-bare-plaster-mist-coat is currently behind the pre-launch splash gate (title "Homemade", body "coming soon") so a public-page render check is not possible at this stage of the build. The DB body above is authoritative.

### Slugs retrofitted in this batch (50)

```
air-fryer-halloumi
air-fryer-hasselback-potatoes
air-fryer-jacket-potato
air-fryer-meatballs
air-fryer-onion-rings
air-fryer-parsnips
air-fryer-pork-belly
air-fryer-pork-belly-bites
bless-and-pay-ritual
body-based-meditation
body-scan-for-sleep
body-scan-from-feet-to-crown
box-breathing-equal-sides
buy-a-coffee-for-someone-activity
calm-is-my-natural-default-affirmation
carved-cherry-serving-spoon
carved-hawthorn-walking-stick
carved-hazel-cooking-skewers
carved-hazel-preserve-spoon
carved-hazel-tent-peg
carved-lime-butter-knife
carved-maple-jam-spoon
chip-carved-spoon-back
chip-cut-technique
chocolate-collar
chocolate-drip-cake
chocolate-ganache-drip
chocolate-tempering-technique
choosing-between-solar-pv-and-solar-thermal
dishwasher-powder
drain-cleaning-powder
dry-oil-body-serum
face-toner-rosewater
fitting-rubber-webbing-to-a-chair-seat
french-polishing-a-small-surface
furniture-beeswax-polish
glass-cleaner-spray
goats-milk-honey-soap
grouting-ceramic-tiles
lavender-compress-for-insect-bites
lavender-infusion-for-mild-low-mood
lavender-profile
lavender-salt-bath-for-muscle-tension
lemon-balm-infusion
lining-a-wall-before-papering
making-and-fitting-skirting-board-external-corner
marshmallow-gargle-for-sore-throat
marshmallow-root-cold-infusion
painting-over-bare-plaster-mist-coat
painting-woodwork-gloss-finish
```

## Sample public URLs

- https://homemade.education/herbal-medicine/lavender-profile
- https://homemade.education/herbal-medicine/lemon-balm-infusion
- https://homemade.education/herbal-medicine/marshmallow-root-cold-infusion
- https://homemade.education/herbal-medicine/lavender-compress-for-insect-bites
- https://homemade.education/mindset/body-based-meditation
- https://homemade.education/mindset/bless-and-pay-ritual
- https://homemade.education/cooking/air-fryer-pork-belly
- https://homemade.education/natural-home/goats-milk-honey-soap
- https://homemade.education/home-repair/painting-over-bare-plaster-mist-coat
- https://homemade.education/wood-natural-craft/carved-hawthorn-walking-stick

All return the splash gate "coming soon" page at this stage of the build.

## Before / after excerpts across three content types

### Herbal (lavender-profile, "The herb" paragraph)

OLD:
"Lavandula angustifolia, true lavender, English lavender, narrow-leaved lavender, is a woody aromatic perennial native to the western Mediterranean. It is the species used in both culinary and medicinal preparations; the spike lavender (L. latifolia) and lavandin hybrids (L. × intermedia) used in cheaper essential oils are not equivalent for internal therapeutic use."

NEW:
"True lavender, also called English or narrow-leaved lavender, is a woody scented plant from the western Mediterranean. It is the species used in cooking and home medicine. Two close cousins, spike lavender and lavandin, are common in cheap essential oils but are not the same plant and are not used inside the body."

### Mindset (body-based-meditation, sources paragraph)

OLD:
"Body scan: secular MBSR adaptation, Jon Kabat-Zinn et al., late 1970s onwards. 4-7-8: Andrew Weil's adaptation of pranayama. Box breathing: US-military adaptation, widely public. The framings used across the library (body scan as sleep wind-down, breath counts as daytime reset) were contributed by Rebecca Page, from SLEEP (2025) and The Money Zone (2024)."

NEW:
"Body scan: a secular MBSR adaptation by Jon Kabat-Zinn and others from the late 1970s. 4-7-8: Andrew Weil's adaptation of an older breath practice. Box breathing: a US military adaptation, widely public. The framings across the library, body scan as a sleep wind-down and breath counts as a daytime reset, were contributed by Rebecca Page from SLEEP and The Money Zone. See the sources note for the publication detail."

### Natural-home (dishwasher-powder, compatibility paragraph)

OLD:
"This powder is suitable for: glazed ceramics, stainless steel cutlery, glass, and most everyday crockery. Not suitable for: unglazed terracotta, antique or hand-painted ceramics (the alkalinity can dull gilding and enamel), cast iron (rust accelerator), and items labelled hand-wash only."

NEW:
"This powder is suitable for glazed ceramics, stainless steel cutlery, glass, and most everyday crockery. Not suitable for unglazed terracotta, antique or hand-painted ceramics (it can dull gilding and enamel), cast iron (it speeds up rust), or anything labelled hand-wash only."

## Category-by-category count

- wood-natural-craft: 9
- cooking: 8
- mindset: 7
- natural-home: 7
- home-repair: 7
- herbal-medicine: 7
- baking: 4
- sustainability: 1

## Content-type-by-content-type count

(Batch6 is past the first three batches so content-type spread is not gated, but the round-robin still produced a clean spread.)

- recipe: 8
- mindset: 7
- craft-project: 7
- craft-technique: 7
- natural-home-recipe: 7
- home-repair: 7
- herbal: 7

## Surprises

- 25 of the 50 picked files were already clean against the voice-check rule set on first scan. Only 25 needed any rewrite. The clean group covered most of the cooking (air-fryer family), baking (chocolate family), wood-craft (carved-cherry, carved-hazel, chip-carved), the box-breathing and chocolate-tempering technique pieces, and the home-repair finishing techniques (french polishing, furniture beeswax, grouting, painting-woodwork). They were authored in or near the new register already.
- The herbal cluster carried the bulk of the rewrite work, same shape as batch5: stacked academic citations (Grieve, EMA), unwrapped clinical vocabulary (antispasmodic, anti-inflammatory, saponification), the old-shape "Consult a qualified herbalist or doctor" medical disclaimer in infoPanels, and specific medical thresholds ("above 38.5°C", "after five days", "above 200 ppm"). All normalised to the locked canonical disclaimer ("Not medical advice. Consult a medical professional for ongoing or serious symptoms.") and the canonical safety pattern, while keeping every pregnancy, allergy, paediatric, anticoagulant, thyroid-interaction, and red-flag note in plain-English form. Substance preserved across all of them.
- lavender-profile (herb-profile reference content) had the heaviest lift: 11 errors with one paragraph at grade 16.2 (Evidence level) and another at grade 14.1 (Traditional actions). The four prose sections (The herb, Traditional actions, Documented uses, Evidence level) all kept their substance, including the lavender species distinction, the linalool tooltip, the Hildegard 12th-century reference (kept because the gloss "12th-century" is allowed), the Silexan trial line, and the kitchen-infusion vs pill-strength clarification. Lost: Culpeper and Grieve names from body, EMA name from body, and the GABA-A/benzodiazepine-by-name framing. All four are present in sourceNotes.
- "(2025)" appeared in body prose on three Mindset tutorials (bless-and-pay-ritual, body-based-meditation, body-scan-for-sleep) referencing the SLEEP, MANIFESTING, and MONEY program publication years. Per voice-spec rule 6.1, all moved to sourceNotes with the body retained as "Rebecca J Page" without the year. Mindset's "Where this practice comes from" section convention stays intact.
- "Consult a qualified herbalist or doctor" appeared in five infoPanels (lavender-compress, lavender-infusion, lavender-salt-bath, lemon-balm-infusion, marshmallow-gargle, marshmallow-root) and was normalised to the canonical disclaimer.
- "saponification" appeared once in the goats-milk-honey-soap dairy-allergy patch-test note, replaced with "soap-making reaction" inline.
- Specific medical thresholds ("after 24, 48 hours", "after five days", "above 38.5°C", "for more than two weeks", "above 200 ppm") all softened to non-numeric form per the locked safety pattern, while keeping the substance of the red-flag list.
- "call 999" (UK-specific) on lavender-compress softened to "seek emergency care".
- No file dropped more than ~12 per cent of body word count. The biggest losses were on lavender-profile (~10 per cent) and marshmallow-gargle (~9 per cent), both because of citation-density paragraphs and "Important safety notes" infoPanel rewrites. Substance count is identical before and after on both.
- No em-dash or en-dash characters in any of the 50 rewritten body JSON files, hand-off file, or commit message. Grep confirmed clean before commit.

## Forward read

3254 PUBLISHED tutorials still have voiceRetrofittedAt IS NULL after this batch. The next cron fire (21:30 next hour) will pick the next 50 from the round-robin content-type pool (mindset 853 remaining, recipe 1634 remaining, craft-technique 353 remaining, craft-project 343 remaining, natural-home-recipe 52 remaining, home-repair 10 remaining, herbal 9 remaining). Combined retrofit total to date: pilot (10) + batch1 (50) + batch2 (21) + batch3 (50) + batch4 (50) + batch5 (50) + batch6 (50) = 281.

## Deploy verification

- Run ID 26419206064 on workflow deploy.yml against main.
- gh run watch exited 0 (deploy green).
- healthz smoke: https://homemade.education/healthz returned 200.
- Rebase note: a fast-forward pull was required because origin/main had picked up one new commit (image-relevance pass3 verdicts) while the batch6 work was in flight. Fast-forwarded cleanly with no conflicts before staging.

## Script changes shipped with this batch

- packages/db/scripts/_batch6-verify-db.ts (new): one-shot verification script used to produce the DB counts and spot-check above. Same shape as _batch5-verify-db.ts. Not part of the routine pipeline; kept in scripts for repeatability.
