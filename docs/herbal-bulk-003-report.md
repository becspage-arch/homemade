# Herbal bulk-003 — batch report (2026-06-02)

**28 net new entries PUBLISHED** — herbal-medicine category, third bulk batch (74 → 102).
40 entries uploaded; 12 were upserts of existing records from the previous incomplete fire (05:05 UTC same day).

## Breakdown

| Type | Count |
|------|-------|
| REMEDY | 30 |
| HERB_PROFILE | 7 |
| READING | 3 |

| Sub-category | Count |
|---|---|
| materia-medica | 7 (herb profiles) |
| foundations | 3 (readings) |
| nervous-system | 7 |
| womens-health | 4 |
| digestive | 4 |
| skin | 3 |
| immune-support | 3 |
| musculoskeletal | 3 |
| respiratory | 3 |
| mental-emotional | 2 |
| other | 1 |

## Entries

**HERB_PROFILE — materia-medica (7)**
- calendula-profile (Calendula officinalis, Asteraceae, skin and wound herb)
- echinacea-profile (Echinacea purpurea, Asteraceae, immune-short-course herb)
- ginger-profile (Zingiber officinale, Zingiberaceae, digestive and nausea herb)
- ginseng-profile (Panax ginseng, Araliaceae, tonic adaptogen)
- lemon-balm-profile (Melissa officinalis, Lamiaceae, calming herb)
- peppermint-profile (Mentha × piperita, Lamiaceae, digestive and cooling herb)
- valerian-profile (Valeriana officinalis, Caprifoliaceae, sleep herb)

**READING — foundations (3)**
- growing-and-drying-herbs-at-home
- herbal-medicine-and-drug-interactions
- how-infused-oils-work

**REMEDY — nervous-system (7)**
- ashwagandha-tincture-for-burnout (tincture, adaptogen, thyroid + autoimmune cautions)
- chamomile-tincture-for-nervous-digestion (tincture, Asteraceae allergen)
- gotu-kola-tincture-for-mental-clarity (tincture, focus tonic)
- holy-basil-tincture-for-chronic-stress (tincture, anticoagulant + hypoglycaemic cautions)
- lavender-tincture-for-anxiety (tincture, mild sedative)
- nettle-seed-tincture-for-adrenal-fatigue (tincture, adrenal tonic)
- passionflower-infusion-for-sleeplessness (infusion, sedative potentiation warning)

**REMEDY — womens-health (4)**
- chamomile-infusion-for-menstrual-cramps (infusion, Asteraceae allergen)
- sage-leaf-digestive-infusion (infusion, pregnancy-avoid, breastfeeding-caution)
- vervain-infusion-for-lactation-support (infusion, pregnancy-avoid)
- yarrow-toner-infusion-for-oily-skin (infusion/compress, Asteraceae allergen)

**REMEDY — digestive (4)**
- dandelion-leaf-infusion-for-fluid-retention (infusion, diuretic, kidney-stone caution)
- elderflower-infusion-for-sinus-congestion (infusion, mild diaphoretic)
- hawthorn-berry-decoction (decoction, cardiac-medication caution)
- thyme-carminative-infusion (infusion, wind-easing, anti-spasmodic)

**REMEDY — skin (3)**
- chickweed-salve-for-dry-itchy-skin (salve, emollient, external)
- comfrey-salve-for-sprains (salve, external-only, 10-day max)
- plantain-salve-for-minor-wounds (salve, external, first-aid)

**REMEDY — immune-support (3)**
- echinacea-infusion-for-cold-onset (infusion, short-course, Asteraceae allergen)
- elderberry-syrup (syrup, must-cook, projectSchedule none — single session)
- how-infused-oils-work (READING — placed here in foundations)

**REMEDY — musculoskeletal (3)**
- rosemary-infused-oil-for-muscle-pain (infused oil, rubefacient, external)
- rosemary-infusion-for-circulation (infusion, circulatory stimulant, pregnancy-caution)
- valerian-bath-for-bedtime-tension (bath, sedative, 2-week course limit)

**REMEDY — respiratory (3)**
- sage-gargle-for-throat-infection (gargle, antimicrobial, pregnancy-avoid)
- st-johns-wort-infusion-for-low-mood (infusion, full drug-interaction warning)
- thyme-gargle-for-sore-throat (gargle, antimicrobial)

**REMEDY — mental-emotional (2)**
- ginger-infusion-for-morning-sickness (infusion, pregnancy-caution, anticoagulant)
- lemon-balm-glycerite-for-anxiety-children (glycerite, alcohol-free, paediatric-appropriate)

**REMEDY — other (1)**
- st-johns-wort-infused-oil-for-nerve-pain (infused oil, external, drug-interaction note in body)

**REMEDY — skin (additional)**
- yarrow-infusion-for-fever-support (infusion, diaphoretic, Asteraceae allergen)

## Fix log

**New ingredients seeded (23):**
ashwagandha-root-dried, chamomile-dried, chickweed-dried, comfrey-leaf-dried, dandelion-leaf-dried, echinacea-dried, elderberry-dried, elderflower-dried, ginger-dried-ground, gotu-kola-dried, hawthorn-berries-dried, holy-basil-dried, lavender-dried, lemon-balm-dried, nettle-seed-fresh, passionflower-dried, plantain-leaf-dried, rosemary-dried, sage-fresh, st-johns-wort-dried, valerian-root-dried, vervain-dried, yarrow-dried.

**Voice-check fix passes** — extensive batch across all 40 files. Primary categories:
- **Clinical vocabulary replacements**: "constituents" → "active compounds", "volatile oils" → "aromatic oils", "pharmacological" → "chemical", "anti-inflammatory" → "calms swelling", "antispasmodic" → "eases muscle spasm". Applied via fix script across all 40 files.
- **glossaryTerms cleanup**: removed tincture/maceration/adaptogen/nervine/carminative from glossaryTerms for files where plain-English replacement was safer than tooltip surgery. Applied body replacements to match.
- **Safety-block heading fix**: "Important safety notes" → "Precautions" in all 7 HERB_PROFILE infoPanel nodes.
- **Historical-figure gloss**: "Culpeper" → "the 17th-century herbalist Nicholas Culpeper"; "Grieve" → "Maud Grieve, the early 20th-century botanical writer".
- **Medical-claim verb fix**: "consult your doctor" → "consult a doctor" (3 files).
- **Institutional reference**: "British Herbal Pharmacopoeia" removed from how-infused-oils-work body paragraph.
- **Grade-level rewrites**: ~75 targeted paragraph rewrites across 28 files, using sentence splitting, word simplification, and targeted prose rewrites. Multiple fix passes required for HERB_PROFILE entries (calendula, echinacea, ginger, ginseng, lemon-balm, peppermint, valerian) and READING entries (herbal-medicine-and-drug-interactions).
- **Americanism fix**: "fall asleep" preserved (false positive); season "autumn" correctly applied.

Final voice-check: 32 clean, 8 warnings-only (tricolon / Americanism — all accepted), 0 errors.

## Upload result

40 uploaded, 28 net new PUBLISHED (74 → 102). 12 were upserts of existing records.

## Hero fill

29 entries filled (24 unsplash, 5 pexels, 0 failed). 11 entries had no hero needed (HERB_PROFILE entries render without hero).
Image relevance queue written to docs/image-relevance-queue-herbal-medicine-bulk-003.json.

## QC

processed=29 pass=18 still_blocked=11. Hourly qc-fix-batch will handle remaining.

## Chain

2/10 since last human commit (unpause commit a1d8a6e5).

## Notes

This fire ran on Claude Sonnet 4.6. The 40 briefs were originally authored in the previous fire (05:05 UTC 2026-06-02) but that fire halted before upload. This fire completed the voice-fix and upload passes.
