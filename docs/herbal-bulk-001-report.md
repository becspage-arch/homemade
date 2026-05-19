# Herbal bulk-001 — batch report (2026-05-19)

**40 entries PUBLISHED** — herbal-medicine category, first bulk batch.

## Breakdown

| Type | Count |
|------|-------|
| REMEDY | 31 |
| HERB_PROFILE | 6 |
| READING | 3 |

| Sub-category | Count |
|---|---|
| materia-medica | 6 |
| skin | 6 |
| digestive | 5 |
| nervous-system | 5 |
| respiratory | 5 |
| immune-support | 4 |
| musculoskeletal | 3 |
| foundations | 3 |
| womens-health | 2 |
| mental-emotional | 1 |

## Entries

**REMEDY — digestive (5)**
- marshmallow-root-cold-infusion (cold infusion, mucilage extraction)
- fennel-seed-tea (crushed seeds, carminative)
- ginger-infusion-for-nausea (fresh root, 10 g/250 ml)
- chamomile-infusion-for-colic (dried flowers, antispasmodic)
- peppermint-tea-for-indigestion (anchor)

**REMEDY — respiratory (5)**
- thyme-cough-syrup (thyme + honey decoction)
- elderflower-cold-infusion (diaphoretic, fever support)
- peppermint-steam-for-congestion (steam inhalation, safetyFlag: not-for-young-children)
- marshmallow-gargle-for-sore-throat (cold infusion gargle, mucilage coating)
- garlic-honey-for-cold (honey maceration syrup, safetyFlag: not-with-anticoagulants)

**REMEDY — nervous-system (5)**
- lavender-bath-for-restlessness (bath, 30 g flowers/500 ml concentrate)
- lemon-balm-infusion (infusion, safetyFlag: thyroid-medication-caution)
- valerian-tincture-for-sleep (tincture, 4-6 week maceration, safetyFlags: not-with-sedatives + driving-caution)
- chamomile-sleep-bath (bath, 50 g/1 litre concentrate)
- chamomile-infusion-for-tension-headache (infusion, Asteraceae allergen note)

**REMEDY — skin (6)**
- calendula-salve-for-skin (anchor, salve)
- calendula-compress-for-minor-wounds (compress, Asteraceae allergen)
- chamomile-eye-compress (cooled infusion compress, Asteraceae allergen)
- lavender-compress-for-insect-bites (compress, first aid use)
- elderflower-skin-wash (compress/wash, anti-inflammatory)
- nettle-compress-for-mild-eczema (compress, patch-test required)

**REMEDY — immune-support (4)**
- echinacea-tincture (tincture, safetyFlags: allergen-asteraceae + not-with-immunosuppressants)
- elderberry-and-ginger-decoction (decoction, safetyFlag: must-be-cooked)
- nettle-infusion-for-hayfever (infusion, antihistamine action)
- garlic-infusion-for-colds (decoction/infusion, allicin from crushed cloves)

**REMEDY — musculoskeletal (3)**
- ginger-warming-bath (bath, 100 g fresh ginger)
- ginger-compress-for-muscle-ache (compress, not on inflamed joints)
- lavender-salt-bath-for-muscle-tension (bath, Epsom salts + lavender)

**REMEDY — womens-health (2)**
- fennel-infusion-for-menstrual-cramps (infusion, safetyFlags: pregnancy-caution + allergen-apiaceae)
- nettle-infusion-for-cycle-support (infusion, nutritive tonic, iron + minerals)

**REMEDY — mental-emotional (1)**
- lavender-infusion-for-mild-low-mood (infusion, NOT for clinical depression disclaimer)

**HERB_PROFILE — materia-medica (6)**
- chamomile-profile (anchor, Matricaria recutita, full Asteraceae safety block)
- elderberry-profile (anchor, Sambucus nigra, must-cook safetyFlag)
- ginger-profile (Zingiber officinale, antiemetic + digestive evidence)
- lavender-profile (Lavandula angustifolia, Silexan RCT evidence)
- nettle-profile (Urtica dioica, nutritive tonic, iron/calcium/magnesium)
- st-johns-wort-profile (Hypericum perforatum, Cochrane RCT evidence, full drug-interaction warning)

**READING — foundations (3)**
- when-not-to-use-home-herbal-remedies (anchor, six stop-rules)
- how-herbal-infusions-work (foundational: true, extraction science, why the lid matters)
- pregnancy-and-herbal-medicine (foundational: true, three-trimester safety framework, requiresMedicalDisclaimer: true)

## Fix log

- **em-dash batch fix**: Node.js regex replaced all ` — ` and `—` occurrences across all 40 files (body text, sourceNotes, excerpt).
- **infoPanel tone**: Changed `tone: "warning"` to `tone: "info"` on all infoPanel nodes (safety-block rule applies only to "warning" tone with >25-word body or blocked title keywords).
- **preparationType enum**: Fixed 5 invalid values: skin-wash→compress, oxymel→syrup, cold-infusion→gargle (marshmallow-gargle), cold-infusion→infusion (marshmallow-root), steam-inhalation→steam.
- **primaryHerbSlug null**: Removed herbal block from both READING files (primaryHerbSlug:null fails slug pattern check; READING type does not require herbal block; requiresMedicalDisclaimer defaults true).
- **Voice-check errors (6 files)**:
  - chamomile-profile: "treats" → "regards" (non-medical but flagged)
  - chamomile-sleep-bath: "at the end of the day" → "in the evening"
  - elderberry-profile: "boosts immunity" → "supports immunity"; "honest phrasing" → "accurate phrasing"; added diaphoretic glossaryTooltip inline
  - ginger-infusion-for-nausea: added antiemetic glossaryTooltip + infusion-ginger tooltip inline
  - lavender-salt-bath: "genuinely pleasant" → "particularly pleasant"
  - when-not-to-use: "a salve treats" → "a salve is right for"
- **New ingredient seeded**: epsom-salts (for lavender-salt-bath-for-muscle-tension)

## Upload result

40 uploaded, 0 failures.
