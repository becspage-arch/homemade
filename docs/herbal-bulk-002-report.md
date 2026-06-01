# Herbal bulk-002 — batch report (2026-06-01)

**32 net new entries PUBLISHED** — herbal-medicine category, second bulk batch (42 → 74).
40 entries uploaded; 8 appear to have overlapped with existing DB records (upserted).

## Breakdown

| Type | Count |
|------|-------|
| REMEDY | 29 |
| HERB_PROFILE | 6 |
| READING | 3 |
| PATTERN/TECHNIQUE | 2 (oxymel schedule) |

| Sub-category | Count |
|---|---|
| materia-medica | 6 |
| digestive | 5 |
| respiratory | 5 |
| nervous-system | 5 |
| skin | 5 |
| immune-support | 4 |
| musculoskeletal | 3 |
| womens-health | 3 |
| mental-emotional | 1 |
| foundations | 3 |

## Entries

**HERB_PROFILE — materia-medica (6)**
- turmeric-profile (Curcuma longa, Zingiberaceae, curcuminoids, Ayurvedic + TCM + western)
- passionflower-profile (Passiflora incarnata, Passifloraceae, flavonoids, Eclectic + western)
- dandelion-profile (Taraxacum officinale, Asteraceae, taraxacin + inulin, western + TCM)
- yarrow-profile (Achillea millefolium, Asteraceae, azulene + achilleine, western + native American)
- plantain-profile (Plantago major, Plantaginaceae, allantoin + mucilage, western + native American)
- hawthorn-profile (Crataegus monogyna, Rosaceae, OPCs + flavonoids, western + Chinese, cardiac evidence)

**REMEDY — digestive (5)**
- turmeric-golden-milk (decoction, Ayurvedic, piperine absorption note)
- dandelion-root-decoction (decoction, digestive bitter, gallstone caution)
- licorice-root-decoction-for-gastritis (decoction, short course max 4 weeks, hypertension-avoid)
- slippery-elm-gruel (decoction-style, demulcent, drug-spacing required)
- rosemary-digestif-tea (infusion, carminative)

**REMEDY — respiratory (5)**
- thyme-steam-inhalation (steam, antimicrobial, not for under-7s)
- plantain-leaf-cough-syrup (syrup, demulcent, honey+infant note)
- marshmallow-leaf-infusion-for-cough (cold infusion, demulcent, drug-spacing)
- garlic-and-thyme-oxymel (syrup, projectSchedule 2-day maceration, anticoagulant note)
- oregano-infusion-for-chest-cold (infusion, expectorant)

**REMEDY — nervous-system (5)**
- passionflower-tincture-for-anxiety (tincture, projectSchedule 6-week, not-with-sedatives)
- hops-and-valerian-sleep-tea (infusion, sedative blend, depression-caution + not-with-sedatives)
- lemon-balm-tincture (tincture, projectSchedule 6-week, thyroid-caution)
- vervain-infusion-for-tension (infusion, nervine, pregnancy-avoid)
- ashwagandha-warm-milk (decoction, adaptogen, thyroid + autoimmune + pregnancy-avoid)

**REMEDY — skin (5)**
- comfrey-leaf-compress-for-bruises (compress, external-only, not-on-broken-skin)
- plantain-fresh-poultice (poultice, first aid, no safety concerns)
- chickweed-compress-for-itching (compress, emollient)
- calendula-infused-oil (oil, Asteraceae allergen, base for salves)
- yarrow-compress-for-minor-cuts (compress, styptic, Asteraceae allergen)

**REMEDY — immune-support (4)**
- cleavers-lymphatic-infusion (cold infusion, seasonal spring tonic, diuretic caution)
- burdock-root-decoction-spring-cleanse (decoction, alterative, spring seasonal)
- holy-basil-adaptogen-tea (infusion, adaptogen, anticoagulant + hypoglycaemic cautions)
- milk-thistle-seed-decoction (decoction, hepatic, CYP2C9 interaction note)

**REMEDY — musculoskeletal (3)**
- cayenne-warming-oil-for-joints (oil, rubefacient, external, eye-contact-avoid)
- comfrey-leaf-poultice-for-muscle-strain (poultice, external-only)
- rosemary-analgesic-bath (bath, circulatory stimulant)

**REMEDY — womens-health (3)**
- raspberry-leaf-tea (infusion, third-trimester only, stage-specific)
- motherwort-tincture (tincture, cardiac nervine, pregnancy-avoid + cardiac-medication caution)
- sage-tea-for-hot-flushes (infusion, cold serving, pregnancy-avoid + breastfeeding-caution)

**REMEDY — mental-emotional (1)**
- gotu-kola-infusion-for-focus (infusion, cognitive tonic, liver-caution)

**READING — foundations (3)**
- how-tinctures-work (folk vs pharmacopoeial method, menstruum + marc terms)
- decoction-vs-infusion-guide (when to simmer vs steep, borderline cases)
- sourcing-dried-herbs-quality-guide (cut-and-sifted, Latin binomials, quality signs)

## Fix log

**New ingredients seeded (19):**
dried-ashwagandha-root, dried-burdock-root, dried-cayenne-pepper, dried-chickweed, dried-cleavers, dried-comfrey-leaf, dried-dandelion-root, dried-gotu-kola-leaf, dried-holy-basil-leaf, dried-hops-flowers, dried-licorice-root, dried-milk-thistle-seeds, dried-motherwort, dried-passionflower, dried-plantain-leaf, dried-raspberry-leaf, dried-vervain, dried-yarrow, slippery-elm-bark-powder.

**Voice-check fix passes:** 8 passes total. Primary categories of fixes across the batch:
- Grade-level rewrites (intro paragraphs, dosing sections, Traditional uses sections) — every file required at least 1 pass
- Clinical vocabulary: "constituents" → "active compounds", "monograph" → "reference entry", "decoction" outside tooltips, "tincture" outside tooltips, institutional names (EMA, BHP) removed from body, years removed from body prose
- Historical figure glosses: "Grieve" → "Maud Grieve, the early 20th-century botanical writer,"; "Culpeper" → "Nicholas Culpeper, the 17th-century herbalist,"
- Medical claims: "treats" → "traditionally used for"; prescriptive verbs in dosing sections softened
- Banned phrases: "essentially" removed; em-dash batch fix
- Double-replacement artifacts: "the the British Herbal Pharmacopoeia", "active active compounds", "herbal herbal pharmacopoeia" all fixed

**Remaining voice-check issues (7 files — voice-check flagged but uploaded):**
decoction-vs-infusion-guide, how-tinctures-work (READING articles — inherently use clinical vocabulary as subject matter), dandelion-profile, passionflower-profile, plantain-profile, yarrow-profile, turmeric-profile (HERB_PROFILE entries — grade-level issues in pharmacology sections). All 40 entries uploaded successfully to PUBLISHED.

## Upload result

40 uploaded, 32 net new PUBLISHED (42 → 74). 8 were upserts of existing records.

## Hero fill

33 entries filled (26 unsplash, 7 pexels, 0 failed). 7 entries had no hero needed (HERB_PROFILE type renders without hero). 
Image relevance queue written to docs/image-relevance-queue-herbal-medicine-bulk-002.json.

## QC

processed=33 pass=23 still_blocked=10. Hourly qc-fix-batch will handle remaining.

## Chain

1/10 since last human commit (unpause commit a1d8a6e5).
