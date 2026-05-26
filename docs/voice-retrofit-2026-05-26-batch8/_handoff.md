Batch 2026-05-26-batch8: 50 tutorials retrofitted. No deploy run triggered (GitHub Actions issue, see below). healthz 200 throughout.

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
  UNVERIFIED                   : 2316
  VERIFIED                     : 1219
```

("last fire" cells originally rendered with single-character separators; replaced here with "(none)" so the hand-off file stays dash-clean.)

### Voice-retrofit progress (filtered on voiceRetrofittedAt)

- Before batch8 apply: 331 retrofitted (pilot 10 + batch1 50 + batch2 21 + batch3 50 + batch4 50 + batch5 50 + batch6 50 + batch7 50)
- After batch8 apply:  381 retrofitted, 3154 unretrofitted
- Difference: +50 retrofitted (matches batch size exactly)

### Spot-check

- slug: nettle-profile
- voiceRetrofittedAt: 2026-05-26T10:45:48.909Z
- category slug: herbal-medicine
- first paragraph in the live DB body (after retrofit):

> "Stinging nettle is a perennial herb that grows across Britain and most of the temperate world. The sting comes from hollow silica hairs on the leaves and stems. Drying, cooking, or blanching takes the sting out. The dried leaf is the medicinal part. Nettle sits between food and medicine: cooks use it for soup and pesto, and weavers once used it as a textile fibre. As a nutritive herb, its mineral load is strong: iron, calcium, magnesium, potassium, and silica in forms the body takes up well."

The public URL https://homemade.education/herbal-medicine/nettle-profile is currently behind the pre-launch splash gate ("Homemade", "coming soon"), so a public-page render check is not possible at this stage. The DB body above is authoritative.

### Slugs retrofitted in this batch (50)

```
air-fryer-rack-of-lamb
air-fryer-roast-carrots
air-fryer-roast-potatoes
air-fryer-roasted-broccoli
apple-cake-german
apple-frangipane-tart
apple-galette-rough-puff
apple-pear-pie
carved-sycamore-egg-cup
carved-sycamore-porridge-spurtle
carved-sycamore-salad-servers
carved-sycamore-soup-spoon
cold-pipe-insulation
combing-fleece-with-hand-combs
compost-in-a-small-garden
composting-difficult-materials
composting-toilet-decision-guide
consistency-is-allowed-to-feel-easy
contact-printing-on-silk
copper-mordant-after-bath
copperplate-connected-script
copperplate-lower-case-alphabet
coptic-stitch-hardback
coptic-stitch-notebook
courage-lands-in-the-body-first
crossing-out-the-old-sleep-story
culling-a-chicken-humanely
cutting-and-baling-hay-a-small-scale-guide
dagging-and-crutching-sheep
daily-feeding-and-checking-pigs
daily-spiritual-practice-the-simple-version
decorating-polymer-clay-with-alcohol-inks
deep-litter-method-for-coop-management
fitting-a-dimmer-switch
fitting-a-door-closer
fitting-a-door-handle-and-latch-set
fitting-a-door-lock-and-cylinder
incised-name-sign-clay
inkle-woven-belt
laundry-stain-spray
lavender-beeswax-balm
lavender-moth-sachet
lavender-oat-drawer-sachets
layered-glaze-dip-two-colour-effect
leaf-impression-tile-set
log-cabin-weave-rigid-heddle
nettle-profile
peppermint-steam-for-congestion
peppermint-tea-for-indigestion
pregnancy-and-herbal-medicine
```

## Sample public URLs

- https://homemade.education/baking/apple-cake-german
- https://homemade.education/baking/apple-galette-rough-puff
- https://homemade.education/cooking/air-fryer-rack-of-lamb
- https://homemade.education/herbal-medicine/nettle-profile
- https://homemade.education/herbal-medicine/peppermint-tea-for-indigestion
- https://homemade.education/herbal-medicine/pregnancy-and-herbal-medicine
- https://homemade.education/mindset/daily-spiritual-practice-the-simple-version
- https://homemade.education/natural-home/lavender-beeswax-balm
- https://homemade.education/animals-smallholding/culling-a-chicken-humanely
- https://homemade.education/home-repair/fitting-a-door-lock-and-cylinder
- https://homemade.education/sustainability/composting-toilet-decision-guide

All return the splash gate "coming soon" page at this stage of the build.

## Before / after excerpts across three content types

### Herbal (nettle-profile, orientation paragraph)

OLD:
"Urtica dioica, the stinging nettle, is a perennial herb found across the whole of Britain and most of the temperate world. The sting is produced by hollow silica hairs on the leaves and stems; it is deactivated by drying, cooking, or blanching. The dried leaf is the medicinal part. Nettle is one of the few herbs that crosses the boundary between food and medicine without qualification, it is also a nutritious vegetable (nettle soup, nettle pesto) and was historically used as a textile fibre."

NEW:
"Stinging nettle is a perennial herb that grows across Britain and most of the temperate world. The sting comes from hollow silica hairs on the leaves and stems. Drying, cooking, or blanching takes the sting out. The dried leaf is the medicinal part. Nettle sits between food and medicine: cooks use it for soup and pesto, and weavers once used it as a textile fibre."

### Recipe-baking (apple-galette-rough-puff, filling paragraph)

OLD:
"The filling is just apple, sugar, and a little butter dotted over the top. That simplicity is the point: the pastry and the fruit carry the whole thing, and any additional flavouring (cinnamon, almond cream, vanilla) is optional and should not overwhelm the apple."

NEW:
"The filling is just apple, sugar, and a little butter on top. That plainness is the point. The pastry and the fruit carry the dish. Any extra flavour (cinnamon, almond cream, vanilla) is optional and should not crowd the apple."

### Mindset (daily-spiritual-practice-the-simple-version, research paragraph)

OLD:
"The wellbeing research on contemplative and spiritual practice converges on a few things: regularity matters more than duration; even short practices (five to ten minutes) have measurable effects on stress and mood; the specific form matters less than the fact of doing it consistently. The best practice is the one you will actually do every day."

NEW:
"The wellbeing research on quiet, reflective practice lines up on a few points. How often you do it matters more than how long. Even short sessions of five to ten minutes show up in measures of stress and mood. The exact form matters less than turning up daily. The best practice is the one you will actually do every day."

## Category-by-category count

- animals-smallholding: 5
- fibre-arts: 5
- baking: 4
- cooking: 4
- herbal-medicine: 4
- home-repair: 4
- mindset: 4
- natural-home: 4
- paper-word: 4
- pottery-ceramics: 4
- sustainability: 4
- wood-natural-craft: 4

## Content-type-by-content-type count

(Batch8 is past the first three batches so content-type spread is not gated, but the round-robin still produced a clean spread.)

- animals-smallholding: 5
- craft-project: 5
- craft-technique: 4
- herbal: 4
- home-repair: 4
- mindset: 4
- natural-home: 4
- other-paper-word: 4
- other-wood-natural-craft: 4
- recipe-baking: 4
- recipe-cooking: 4
- sustainability: 4

## Surprises

- 32 of the 50 picked files were already clean against the voice-check rule set on first scan. 18 needed any rewrite. The clean set covered the whole air-fryer cooking family for this batch, the apple-frangipane-tart and apple-pear-pie bakes, the four "fitting a" home-repair pieces, the carved-sycamore-salad-servers and carved-sycamore-soup-spoon wood items, several pottery techniques (incised-name-sign-clay, leaf-impression-tile-set, decorating-polymer-clay-with-alcohol-inks), the fibre-arts weaving and printing pieces (combing-fleece-with-hand-combs, contact-printing-on-silk, inkle-woven-belt), the natural-home recipes (laundry-stain-spray, lavender-oat-drawer-sachets), the coptic-stitch-notebook and copperplate-connected-script paper-craft pieces, the cutting-and-baling-hay and dagging-and-crutching-sheep and daily-feeding-and-checking-pigs and deep-litter-method-for-coop-management animals pieces, and the two consistency-is-allowed-to-feel-easy and courage-lands-in-the-body-first mindset affirmations. They were authored in the new register already.
- Two herbal-medicine pieces carried most of the rewrite work: nettle-profile (11 errors, mostly grade-level plus year and historical-figure refs) and pregnancy-and-herbal-medicine (11 errors, mostly grade-level plus two unwrapped "emmenagogue" mentions and an "EMA" mention). Both reduced cleanly to the new register, with all substance kept in plain English. The third heavier file was lavender-beeswax-balm (3 errors: EMA HMPC + EMA + grade-level on a single pregnancy-safety paragraph), all addressed by reworking the sentence rhythm and saying "the European pregnancy first-trimester caution list" in plain English.
- "EMA" and "EMA HMPC" appeared in body prose on three tutorials (lavender-beeswax-balm, nettle-profile, pregnancy-and-herbal-medicine, peppermint-steam-for-congestion). All four references dropped from body. Source-notes citations either kept (where the original sourceNotes had them in long-form, e.g. "EMA HMPC monograph on Menthae piperitae herba (2020)") or expanded to plain-English equivalents in the body ("European Medicines Agency" or "a modern European review").
- Year-only references (1652), (2011) appeared in body prose on nettle-profile. Both moved to sourceNotes (Culpeper 1652 already there with the 17th-century gloss; EMA 2011 already there).
- Historical figure "Culpeper" appeared once without gloss in nettle-profile, and "Grieve" appeared three times across nettle-profile, peppermint-steam-for-congestion, and peppermint-tea-for-indigestion. All four references dropped from body. Grieve and Culpeper kept in sourceNotes on each affected tutorial.
- Clinical vocab violations: "anti-inflammatory" once in nettle-profile (rewritten to "calms swelling" / "calms surface swelling"), "catarrh" once in peppermint-steam-for-congestion (replaced by "the mucus that is blocking the sinuses"), "emmenagogue" twice in pregnancy-and-herbal-medicine outside the tooltip wrap (replaced by "period-bringing flag at medicinal dose" and the surrounding text rewritten). The tooltipped occurrence in pregnancy-and-herbal-medicine's heading-paragraph stayed put (clinical-vocab check skips tooltipped text).
- One medical-claim watchword introduced during the rewrite: "treats" in composting-toilet-decision-guide ("The Environment Agency treats it as a controlled waste"). Caught on a second voice-check pass and rewritten to "The Environment Agency classes it as a controlled waste". Worth flagging as a gotcha for future rewrites; the medical-claim rule fires on any "treats" verb regardless of medical context.
- Five non-body em or en dashes lived in fields not covered by the paragraph-level dash check: two titles/subtitles (apple-cake-german subtitle, copperplate-lower-case-alphabet title), two suppliesCard item names or qty fields (copperplate-lower-case-alphabet item, incised-name-sign-clay qty), and two troubleshooter symptom fields (layered-glaze-dip-two-colour-effect, log-cabin-weave-rigid-heddle). All replaced before commit. Worth noting: the apply script does not write the title field, so the title-cleanup on the JSON is documentary; the subtitle is applied.
- No body file dropped more than ~15 per cent of its body word count. The biggest losses were on pregnancy-and-herbal-medicine and nettle-profile because of citation-density paragraphs and dose-clause rewrites. Substance count is identical before and after on each.
- No em or en dash characters in any of the 50 rewritten body JSON files, hand-off file, or commit message. Grep confirmed clean before commit.

## Deploy verification

- Commit pushed to main: 4d29cb38bff98633281a28f8e3a7c14f301c7663.
- No deploy run was registered by GitHub Actions for this commit, even though the commit changed `packages/db/scripts/_batch8-verify-db.ts` (which matches the deploy.yml `packages/**` path filter that triggered batch5, batch6, and batch7 deploys identically). At least 12 minutes after the push the last Deploy run was still 26445796235 for the earlier image-rescue commit at 10:04 UTC.
- Manual fallback via `gh workflow run deploy.yml --ref main` returned HTTP 500 from GitHub three times in a row. GitHub Actions appears to be having an incident affecting this repo (or organisation), not a workflow-config issue. The deploy.yml file is unchanged from batch7's successful run.
- healthz smoke: https://homemade.education/healthz returned 200 immediately after the push and again 12 minutes later. The site is healthy. The current ECS task is the build deployed by run 26445642916 (batch7).
- Functional impact: zero. This batch only changes Tutorial body content in the database (`prisma.tutorial.update` calls in the apply script). The deployed Next.js container reads bodies from the database via Prisma at request time, so the new register is already live behind the splash gate without any container rebuild.
- Per the brief's "external thing Rebecca can do" clause, the worker stops on this point rather than retrying past the 3-cap. Suggested next step for Rebecca: re-check Actions status at github.com/becspage-arch/homemade/actions next time you sit down, and either let the next worker push re-trigger naturally, or `gh workflow run deploy.yml --ref main` once the API is healthy again.

## Script changes shipped with this batch

- packages/db/scripts/_batch8-verify-db.ts (new): one-shot verification script used to produce the DB counts and spot-check above. Same shape as _batch6-verify-db.ts and _batch7-verify-db.ts. Not part of the routine pipeline; kept in scripts for repeatability.

## Forward read

3154 PUBLISHED tutorials still have voiceRetrofittedAt IS NULL after this batch. The next cron fire (next :30 past the hour) will pick the next 50 from the same round-robin content-type pool. Combined retrofit total to date: pilot (10) + batch1 (50) + batch2 (21) + batch3 (50) + batch4 (50) + batch5 (50) + batch6 (50) + batch7 (50) + batch8 (50) = 381.
