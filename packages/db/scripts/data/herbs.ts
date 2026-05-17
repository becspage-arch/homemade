/**
 * Master Herb seed data — Western herbal canon + a handful of cross-tradition
 * staples in widespread Western use (ashwagandha, holy basil, ginseng,
 * gotu kola). ~42 starter rows; the brief targets ~40 and we stop once we
 * cover the western-folk + safe-tradition spread the anchor batch and
 * subsequent bulk batches need.
 *
 * Conventions:
 *
 *   - slug              kebab-case, unique. URL-safe and brief-author-friendly.
 *   - commonName        the British / common English form.
 *   - latinBinomial     genus + species. Botanical-source authoritative.
 *   - family            plant family (Asteraceae, Lamiaceae, etc.). Optional
 *                       but populated where it matters for allergen flagging.
 *   - partsUsed         the parts that go into the preparations the
 *                       authoring sessions can write. Comfrey is 'leaf' +
 *                       'root' even though both are external-use-only.
 *   - primaryActions    one or more named actions from the western-herbal
 *                       categorisation. Not exhaustive — the anchor row
 *                       captures the actions a remedy would draw on.
 *   - keyConstituents   the chemistry the remedy hangs on. Surfaced in
 *                       HERB_PROFILE bodies.
 *   - traditionsCited   traditions that document the herb in widespread
 *                       use. Conservative: only what the authoring session
 *                       has solid public-domain or open-access sourcing for.
 *   - safetyFlags       flagged for the prompt + the renderer. Every entry
 *                       gets a careful pass — under-flagging is the harm
 *                       direction. The string values mirror the controlled
 *                       vocabulary documented in the Prisma `Herb` model
 *                       (see `schema.prisma`).
 *   - drugInteractionNotes
 *                       one paragraph, plain prose. Surfaced in the
 *                       HERB_PROFILE body and prefixed onto any REMEDY page
 *                       that uses this herb. Null when the master row has
 *                       no documented interactions of consequence.
 *   - notes             scratch field for the worker session. Not surfaced
 *                       to the reader.
 *
 * See `docs/herbal-author.md` for the voice rules. Every flag here drives
 * a hard checkpoint in the body-authoring prompt.
 */

export interface HerbSeed {
  slug: string
  commonName: string
  latinBinomial: string
  family?: string
  partsUsed: string[]
  primaryActions: string[]
  keyConstituents?: string[]
  traditionsCited: string[]
  safetyFlags: string[]
  drugInteractionNotes?: string
  notes?: string
}

export const HERBS: HerbSeed[] = [
  // ── Carminative / digestive workhorses ────────────────────────────────
  {
    slug: 'chamomile',
    commonName: 'Chamomile',
    latinBinomial: 'Matricaria recutita',
    family: 'Asteraceae',
    partsUsed: ['flower'],
    primaryActions: ['nervine', 'carminative', 'anti-inflammatory', 'mild-sedative'],
    keyConstituents: ['apigenin', 'bisabolol', 'chamazulene', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european', 'eclectic-american'],
    safetyFlags: ['allergen-asteraceae'],
    drugInteractionNotes:
      'Members of the Asteraceae (daisy) family share cross-reactive pollens; readers with a known ragweed, daisy, or chrysanthemum allergy should patch-test first. No clinically significant drug interactions at culinary-tea doses; concentrated tinctures may potentiate sedatives.',
  },
  {
    slug: 'peppermint',
    commonName: 'Peppermint',
    latinBinomial: 'Mentha × piperita',
    family: 'Lamiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['carminative', 'antispasmodic', 'digestive-bitter', 'cooling'],
    keyConstituents: ['menthol', 'menthone', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['paediatric-caution'],
    drugInteractionNotes:
      'Menthol from concentrated peppermint oil should not be applied to the face or chest of infants and small children (apnea risk from menthol vapours). Culinary teas at standard strength are tolerated from school age upward. May relax the lower oesophageal sphincter; readers with significant reflux may find their symptoms worsen.',
  },
  {
    slug: 'fennel',
    commonName: 'Fennel',
    latinBinomial: 'Foeniculum vulgare',
    family: 'Apiaceae',
    partsUsed: ['seed', 'leaf', 'bulb'],
    primaryActions: ['carminative', 'antispasmodic', 'galactagogue'],
    keyConstituents: ['anethole', 'fenchone', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european', 'ayurveda'],
    safetyFlags: ['pregnancy-caution', 'allergen-apiaceae'],
    drugInteractionNotes:
      'Pregnancy: culinary use of seeds in cooking is unproblematic; therapeutic-dose tinctures and concentrated teas of fennel should be avoided. Allergen note: cross-reactivity with celery, carrot, and parsley in the Apiaceae family.',
  },
  {
    slug: 'ginger',
    commonName: 'Ginger',
    latinBinomial: 'Zingiber officinale',
    family: 'Zingiberaceae',
    partsUsed: ['rhizome'],
    primaryActions: ['carminative', 'circulatory-stimulant', 'anti-inflammatory', 'antiemetic'],
    keyConstituents: ['gingerols', 'shogaols', 'zingiberene'],
    traditionsCited: ['western-herbal', 'chinese-medicine', 'ayurveda'],
    safetyFlags: ['not-with-anticoagulants', 'pregnancy-caution-high-dose'],
    drugInteractionNotes:
      'Anticoagulants: ginger has mild antiplatelet activity. Readers on warfarin, aspirin, or other anticoagulants should keep intake to culinary levels and consult their prescriber before therapeutic doses. Pregnancy: culinary use and small medicinal teas (≤1 g dried per cup) are widely documented as safe for morning sickness; higher therapeutic doses (>2 g/day) sit in the cautious-with-pregnancy column.',
  },
  {
    slug: 'turmeric',
    commonName: 'Turmeric',
    latinBinomial: 'Curcuma longa',
    family: 'Zingiberaceae',
    partsUsed: ['rhizome'],
    primaryActions: ['anti-inflammatory', 'hepatic', 'antioxidant'],
    keyConstituents: ['curcumin', 'turmerone'],
    traditionsCited: ['ayurveda', 'chinese-medicine', 'western-herbal'],
    safetyFlags: ['not-with-anticoagulants', 'gallstone-caution', 'liver-caution-high-dose'],
    drugInteractionNotes:
      'Curcumin has mild antiplatelet activity; readers on anticoagulants should keep intake to culinary levels. Gallstones: turmeric stimulates bile flow and is contraindicated when stones obstruct the bile duct. Liver: standard culinary use is well tolerated; high-dose isolated-curcumin supplements have generated isolated reports of hepatotoxicity.',
  },

  // ── Cold + immune ───────────────────────────────────────────────────
  {
    slug: 'echinacea',
    commonName: 'Echinacea',
    latinBinomial: 'Echinacea purpurea',
    family: 'Asteraceae',
    partsUsed: ['root', 'aerial-parts', 'flower'],
    primaryActions: ['immune-modulating', 'antimicrobial', 'lymphatic'],
    keyConstituents: ['alkylamides', 'polysaccharides', 'caffeic-acid-derivatives'],
    traditionsCited: ['native-american', 'eclectic-american', 'western-herbal'],
    safetyFlags: ['allergen-asteraceae', 'autoimmune-caution', 'not-long-term'],
    drugInteractionNotes:
      'Autoimmune conditions: traditional western-herbal practice avoids long-term echinacea use in autoimmune readers because the herb modulates immune activity; readers with lupus, rheumatoid arthritis, MS, or similar should consult a herbalist before use. Course length: traditionally taken as a short acute course (7–14 days) rather than continuously.',
  },
  {
    slug: 'elderberry',
    commonName: 'Elderberry',
    latinBinomial: 'Sambucus nigra',
    family: 'Adoxaceae',
    partsUsed: ['berry'],
    primaryActions: ['antiviral', 'diaphoretic', 'immune-modulating'],
    keyConstituents: ['anthocyanins', 'flavonoids', 'vitamin-c'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['cook-before-eating', 'autoimmune-caution'],
    drugInteractionNotes:
      'Raw elderberries contain cyanogenic glycosides and should always be cooked before eating or syrupping. Autoimmune readers should consult a herbalist before continuous use.',
    notes:
      'Berries (Sambucus nigra) are a separate row from elderflower below — distinct parts used, distinct preparations, distinct primary actions.',
  },
  {
    slug: 'elderflower',
    commonName: 'Elderflower',
    latinBinomial: 'Sambucus nigra',
    family: 'Adoxaceae',
    partsUsed: ['flower'],
    primaryActions: ['diaphoretic', 'anti-catarrhal', 'anti-inflammatory'],
    keyConstituents: ['flavonoids', 'triterpenes', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: [],
  },
  {
    slug: 'thyme',
    commonName: 'Thyme',
    latinBinomial: 'Thymus vulgaris',
    family: 'Lamiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['expectorant', 'antimicrobial', 'antispasmodic'],
    keyConstituents: ['thymol', 'carvacrol', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['pregnancy-caution-therapeutic-dose'],
    drugInteractionNotes:
      'Pregnancy: culinary use is well tolerated; therapeutic doses (concentrated tinctures, essential oil internally) are avoided in pregnancy.',
  },
  {
    slug: 'garlic',
    commonName: 'Garlic',
    latinBinomial: 'Allium sativum',
    family: 'Amaryllidaceae',
    partsUsed: ['bulb'],
    primaryActions: ['antimicrobial', 'circulatory-stimulant', 'hypotensive', 'expectorant'],
    keyConstituents: ['allicin', 'ajoene', 'sulfur-compounds'],
    traditionsCited: ['western-herbal', 'chinese-medicine', 'ayurveda', 'folk-european'],
    safetyFlags: ['not-with-anticoagulants', 'gastric-irritation-on-empty-stomach'],
    drugInteractionNotes:
      'Anticoagulants: garlic has well-documented antiplatelet activity and significantly increases bleeding risk in readers on warfarin, aspirin, or pre-surgery. Stop therapeutic-dose garlic at least 7 days before any planned surgery.',
  },

  // ── Skin (external) ─────────────────────────────────────────────────
  {
    slug: 'calendula',
    commonName: 'Calendula',
    latinBinomial: 'Calendula officinalis',
    family: 'Asteraceae',
    partsUsed: ['flower'],
    primaryActions: ['vulnerary', 'anti-inflammatory', 'lymphatic', 'antimicrobial'],
    keyConstituents: ['triterpenes', 'flavonoids', 'carotenoids'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['allergen-asteraceae'],
    drugInteractionNotes:
      'External use is well tolerated. Internal use: readers with a known Asteraceae allergy should patch-test before either external salves or internal teas.',
  },
  {
    slug: 'plantain',
    commonName: 'Plantain',
    latinBinomial: 'Plantago major',
    family: 'Plantaginaceae',
    partsUsed: ['leaf'],
    primaryActions: ['vulnerary', 'demulcent', 'astringent', 'anti-inflammatory'],
    keyConstituents: ['aucubin', 'allantoin', 'mucilage'],
    traditionsCited: ['western-herbal', 'folk-european', 'native-american'],
    safetyFlags: [],
    notes:
      'The common lawn weed, not the banana relative. Plantago lanceolata is interchangeable with P. major for most preparations.',
  },
  {
    slug: 'comfrey',
    commonName: 'Comfrey',
    latinBinomial: 'Symphytum officinale',
    family: 'Boraginaceae',
    partsUsed: ['leaf', 'root'],
    primaryActions: ['vulnerary', 'demulcent', 'anti-inflammatory', 'astringent'],
    keyConstituents: ['allantoin', 'mucilage', 'pyrrolizidine-alkaloids'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['external-use-only', 'not-on-broken-skin', 'liver-caution-internal'],
    drugInteractionNotes:
      'Comfrey contains pyrrolizidine alkaloids that are hepatotoxic when ingested. Use externally only, and never on deep wounds or broken skin (the herb heals tissue too fast and can trap infection underneath). Internal use is no longer accepted in modern western herbal practice — older sources that recommend infusions of comfrey leaf or root predate the alkaloid evidence.',
  },
  {
    slug: 'yarrow',
    commonName: 'Yarrow',
    latinBinomial: 'Achillea millefolium',
    family: 'Asteraceae',
    partsUsed: ['aerial-parts', 'flower', 'leaf'],
    primaryActions: ['styptic', 'anti-inflammatory', 'diaphoretic', 'astringent'],
    keyConstituents: ['azulene', 'achilleine', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['allergen-asteraceae', 'pregnancy-caution', 'photosensitising-rare'],
    drugInteractionNotes:
      'Pregnancy: yarrow has emmenagogue (uterine-stimulating) activity and is avoided in pregnancy at therapeutic doses. Allergen note: Asteraceae cross-reactivity.',
  },

  // ── Nervine / sleep / mild anxiety ──────────────────────────────────
  {
    slug: 'lavender',
    commonName: 'Lavender',
    latinBinomial: 'Lavandula angustifolia',
    family: 'Lamiaceae',
    partsUsed: ['flower', 'aerial-parts'],
    primaryActions: ['nervine', 'mild-sedative', 'carminative', 'antimicrobial'],
    keyConstituents: ['linalool', 'linalyl-acetate', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: [],
  },
  {
    slug: 'lemon-balm',
    commonName: 'Lemon balm',
    latinBinomial: 'Melissa officinalis',
    family: 'Lamiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['nervine', 'mild-sedative', 'carminative', 'antiviral'],
    keyConstituents: ['rosmarinic-acid', 'citral', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['thyroid-caution-high-dose'],
    drugInteractionNotes:
      'Thyroid: high doses of lemon balm have been studied for hyperthyroid symptom relief; readers on thyroid hormone replacement should consult their prescriber before therapeutic doses.',
  },
  {
    slug: 'valerian',
    commonName: 'Valerian',
    latinBinomial: 'Valeriana officinalis',
    family: 'Caprifoliaceae',
    partsUsed: ['root', 'rhizome'],
    primaryActions: ['sedative', 'nervine', 'antispasmodic'],
    keyConstituents: ['valerenic-acid', 'valepotriates', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['not-with-sedatives', 'not-with-alcohol', 'pregnancy-caution', 'driving-caution'],
    drugInteractionNotes:
      'Sedatives: valerian potentiates benzodiazepines, barbiturates, and other CNS depressants — never combine. Alcohol: same caution. Driving: take only before bed if it is a reader\'s first time, and never before driving or operating machinery.',
  },
  {
    slug: 'passionflower',
    commonName: 'Passionflower',
    latinBinomial: 'Passiflora incarnata',
    family: 'Passifloraceae',
    partsUsed: ['aerial-parts', 'leaf', 'flower'],
    primaryActions: ['nervine', 'mild-sedative', 'antispasmodic', 'anxiolytic'],
    keyConstituents: ['flavonoids', 'harman-alkaloids', 'maltol'],
    traditionsCited: ['native-american', 'eclectic-american', 'western-herbal'],
    safetyFlags: ['not-with-sedatives', 'pregnancy-caution', 'driving-caution'],
    drugInteractionNotes:
      'Sedatives: passionflower potentiates benzodiazepines and similar CNS depressants. Pregnancy: passionflower is avoided in pregnancy at therapeutic doses owing to traditional concerns about uterine stimulation.',
  },
  {
    slug: 'st-johns-wort',
    commonName: "St John's wort",
    latinBinomial: 'Hypericum perforatum',
    family: 'Hypericaceae',
    partsUsed: ['flower', 'aerial-parts'],
    primaryActions: ['nervine', 'mild-antidepressant', 'vulnerary'],
    keyConstituents: ['hypericin', 'hyperforin', 'flavonoids'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: [
      'not-with-ssri',
      'not-with-contraceptives',
      'not-with-warfarin',
      'not-with-immunosuppressants',
      'not-with-hiv-medication',
      'photosensitising',
      'pregnancy-caution',
    ],
    drugInteractionNotes:
      "St John's wort is a potent inducer of the CYP3A4 liver enzyme and the P-glycoprotein transporter. It significantly lowers the blood level of: SSRIs and SNRIs (serotonin-syndrome risk on coadministration), hormonal contraceptives (the pill, the patch, the ring, the implant — pregnancy risk), warfarin, ciclosporin and tacrolimus, HIV antiretrovirals (treatment failure), and many anti-cancer drugs. The interaction list is long and serious. Anyone on any prescription medication should consult their prescriber before using St John's wort. Photosensitivity: at high doses fair-skinned readers should avoid prolonged sun exposure.",
  },
  {
    slug: 'hops',
    commonName: 'Hops',
    latinBinomial: 'Humulus lupulus',
    family: 'Cannabaceae',
    partsUsed: ['flower'],
    primaryActions: ['sedative', 'nervine', 'digestive-bitter'],
    keyConstituents: ['lupulone', 'humulone', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['depression-caution', 'not-with-sedatives', 'oestrogenic-activity'],
    drugInteractionNotes:
      'Hops have mild oestrogenic activity; readers with hormone-sensitive conditions should consult a herbalist. Depression: hops can deepen low mood in susceptible readers and is avoided as a sleep aid in active depression. Sedatives: same potentiation as valerian and passionflower.',
  },
  {
    slug: 'motherwort',
    commonName: 'Motherwort',
    latinBinomial: 'Leonurus cardiaca',
    family: 'Lamiaceae',
    partsUsed: ['aerial-parts', 'leaf'],
    primaryActions: ['nervine', 'cardiac-tonic', 'antispasmodic', 'emmenagogue'],
    keyConstituents: ['leonurine', 'iridoids', 'flavonoids'],
    traditionsCited: ['western-herbal', 'chinese-medicine', 'folk-european'],
    safetyFlags: ['pregnancy-avoid', 'not-with-cardiac-medication'],
    drugInteractionNotes:
      'Pregnancy: motherwort has well-documented emmenagogue activity and is avoided throughout pregnancy. It is used by some midwives to support uterine tone in the immediate postpartum period — that is a herbalist call, not a self-care call. Cardiac medication: readers on digoxin, beta-blockers, or antiarrhythmics should consult their prescriber.',
  },
  {
    slug: 'vervain',
    commonName: 'Vervain',
    latinBinomial: 'Verbena officinalis',
    family: 'Verbenaceae',
    partsUsed: ['aerial-parts', 'leaf', 'flower'],
    primaryActions: ['nervine', 'galactagogue', 'antispasmodic', 'hepatic'],
    keyConstituents: ['verbenalin', 'verbascoside', 'iridoids'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['pregnancy-avoid'],
  },

  // ── Women's health (with pregnancy notes) ────────────────────────────
  {
    slug: 'raspberry-leaf',
    commonName: 'Raspberry leaf',
    latinBinomial: 'Rubus idaeus',
    family: 'Rosaceae',
    partsUsed: ['leaf'],
    primaryActions: ['astringent', 'uterine-tonic', 'mineral-rich'],
    keyConstituents: ['fragarine', 'tannins', 'flavonoids'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['pregnancy-stage-specific', 'not-in-first-trimester'],
    drugInteractionNotes:
      'Pregnancy use is stage-specific. Traditional western herbal practice introduces raspberry leaf only in the third trimester (from ~32 weeks) as preparation for labour, never in the first or second trimester. Readers with a history of preterm labour or fast labour should consult their midwife before starting.',
  },
  {
    slug: 'mugwort',
    commonName: 'Mugwort',
    latinBinomial: 'Artemisia vulgaris',
    family: 'Asteraceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['emmenagogue', 'nervine', 'digestive-bitter'],
    keyConstituents: ['thujone', 'cineole', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'chinese-medicine', 'folk-european'],
    safetyFlags: ['pregnancy-avoid', 'allergen-asteraceae', 'thujone-content'],
    drugInteractionNotes:
      'Pregnancy: mugwort is a well-known emmenagogue and abortifacient at therapeutic doses; strictly avoided in pregnancy. Thujone: the volatile oil contains thujone; the herb is not used long-term internally.',
  },

  // ── Cardiac + circulatory ───────────────────────────────────────────
  {
    slug: 'hawthorn',
    commonName: 'Hawthorn',
    latinBinomial: 'Crataegus monogyna',
    family: 'Rosaceae',
    partsUsed: ['leaf', 'flower', 'berry'],
    primaryActions: ['cardiac-tonic', 'hypotensive', 'antioxidant'],
    keyConstituents: ['oligomeric-procyanidins', 'flavonoids', 'crataegolic-acid'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['not-with-cardiac-medication'],
    drugInteractionNotes:
      'Hawthorn potentiates the action of digoxin, beta-blockers, and ACE inhibitors. Readers on any cardiac medication should consult their prescriber before therapeutic doses.',
  },
  {
    slug: 'cayenne',
    commonName: 'Cayenne',
    latinBinomial: 'Capsicum annuum',
    family: 'Solanaceae',
    partsUsed: ['fruit'],
    primaryActions: ['circulatory-stimulant', 'rubefacient', 'analgesic-topical', 'diaphoretic'],
    keyConstituents: ['capsaicin', 'capsaicinoids'],
    traditionsCited: ['western-herbal', 'native-american', 'folk-european'],
    safetyFlags: ['not-with-anticoagulants', 'gastric-ulcer-caution', 'eye-contact-avoid'],
    drugInteractionNotes:
      'Anticoagulants: cayenne has antiplatelet activity at therapeutic doses. Ulcers: avoided in active gastric or duodenal ulceration. External use: avoid contact with eyes and mucous membranes; wash hands thoroughly after preparation.',
  },

  // ── Hepatic + nutritive + alterative ────────────────────────────────
  {
    slug: 'nettle',
    commonName: 'Nettle',
    latinBinomial: 'Urtica dioica',
    family: 'Urticaceae',
    partsUsed: ['leaf', 'aerial-parts', 'root', 'seed'],
    primaryActions: ['nutritive', 'diuretic', 'astringent', 'anti-inflammatory'],
    keyConstituents: ['minerals', 'flavonoids', 'chlorophyll'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['not-with-diuretics-without-supervision'],
    notes:
      'Sting deactivates on drying, blanching, or brief simmering. The most-cited nutritive tonic of the western herbal tradition.',
  },
  {
    slug: 'dandelion',
    commonName: 'Dandelion',
    latinBinomial: 'Taraxacum officinale',
    family: 'Asteraceae',
    partsUsed: ['leaf', 'root'],
    primaryActions: ['hepatic', 'diuretic', 'digestive-bitter', 'nutritive'],
    keyConstituents: ['taraxacin', 'inulin', 'minerals'],
    traditionsCited: ['western-herbal', 'chinese-medicine', 'folk-european'],
    safetyFlags: ['allergen-asteraceae', 'gallstone-caution'],
    drugInteractionNotes:
      'Gallstones: dandelion root strongly stimulates bile flow and is contraindicated when stones obstruct the bile duct. Readers on lithium or diuretics should consult a prescriber before therapeutic use.',
  },
  {
    slug: 'burdock',
    commonName: 'Burdock',
    latinBinomial: 'Arctium lappa',
    family: 'Asteraceae',
    partsUsed: ['root', 'seed'],
    primaryActions: ['alterative', 'hepatic', 'diuretic', 'lymphatic'],
    keyConstituents: ['inulin', 'arctigenin', 'polyacetylenes'],
    traditionsCited: ['western-herbal', 'chinese-medicine', 'folk-european'],
    safetyFlags: ['allergen-asteraceae', 'pregnancy-caution'],
  },
  {
    slug: 'milk-thistle',
    commonName: 'Milk thistle',
    latinBinomial: 'Silybum marianum',
    family: 'Asteraceae',
    partsUsed: ['seed'],
    primaryActions: ['hepatic', 'antioxidant', 'cholagogue'],
    keyConstituents: ['silymarin', 'silybin', 'flavonolignans'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['allergen-asteraceae'],
    drugInteractionNotes:
      'Milk thistle can affect the metabolism of drugs that depend on the CYP2C9 and P-glycoprotein pathways; readers on hormone therapy, anticoagulants, or chemotherapy should consult their prescriber before therapeutic doses.',
  },

  // ── Demulcents ─────────────────────────────────────────────────────
  {
    slug: 'marshmallow',
    commonName: 'Marshmallow',
    latinBinomial: 'Althaea officinalis',
    family: 'Malvaceae',
    partsUsed: ['root', 'leaf', 'flower'],
    primaryActions: ['demulcent', 'emollient', 'anti-inflammatory'],
    keyConstituents: ['mucilage', 'flavonoids', 'pectin'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['absorption-spacing-required'],
    drugInteractionNotes:
      'The mucilage can slow or reduce absorption of other oral medication taken at the same time. Space doses of marshmallow at least 2 hours away from any prescription drug.',
  },
  {
    slug: 'slippery-elm',
    commonName: 'Slippery elm',
    latinBinomial: 'Ulmus rubra',
    family: 'Ulmaceae',
    partsUsed: ['bark'],
    primaryActions: ['demulcent', 'emollient', 'nutritive'],
    keyConstituents: ['mucilage', 'tannins'],
    traditionsCited: ['native-american', 'eclectic-american', 'western-herbal'],
    safetyFlags: ['absorption-spacing-required', 'ethical-sourcing-required'],
    drugInteractionNotes:
      'Mucilage absorption note as above. Sourcing: wild slippery elm is over-harvested; insist on bark from sustainably cultivated trees or substitute marshmallow root for the same demulcent action.',
  },

  // ── Antimicrobial / culinary ──────────────────────────────────────
  {
    slug: 'rosemary',
    commonName: 'Rosemary',
    latinBinomial: 'Salvia rosmarinus',
    family: 'Lamiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['circulatory-stimulant', 'nervine', 'antimicrobial', 'hepatic'],
    keyConstituents: ['rosmarinic-acid', 'carnosic-acid', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['pregnancy-caution-therapeutic-dose'],
  },
  {
    slug: 'sage',
    commonName: 'Sage',
    latinBinomial: 'Salvia officinalis',
    family: 'Lamiaceae',
    partsUsed: ['leaf'],
    primaryActions: ['antimicrobial', 'astringent', 'oestrogenic', 'antiperspirant'],
    keyConstituents: ['thujone', 'cineole', 'rosmarinic-acid', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['pregnancy-avoid-therapeutic-dose', 'breastfeeding-caution-suppresses-milk', 'thujone-content'],
    drugInteractionNotes:
      'Pregnancy: sage at therapeutic dose is avoided in pregnancy (thujone content + uterine activity). Breastfeeding: sage tea is the traditional milk-suppressing herb at weaning — actively avoid during established breastfeeding unless the goal is weaning.',
  },
  {
    slug: 'oregano',
    commonName: 'Oregano',
    latinBinomial: 'Origanum vulgare',
    family: 'Lamiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['antimicrobial', 'expectorant', 'carminative'],
    keyConstituents: ['carvacrol', 'thymol', 'volatile-oil'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['pregnancy-caution-therapeutic-dose', 'allergen-lamiaceae'],
  },

  // ── Adaptogens (cross-tradition staples) ──────────────────────────
  {
    slug: 'ginseng',
    commonName: 'Ginseng (Asian)',
    latinBinomial: 'Panax ginseng',
    family: 'Araliaceae',
    partsUsed: ['root'],
    primaryActions: ['adaptogen', 'tonic', 'circulatory-stimulant'],
    keyConstituents: ['ginsenosides'],
    traditionsCited: ['chinese-medicine', 'western-herbal'],
    safetyFlags: ['pregnancy-avoid', 'hypertension-caution', 'not-with-anticoagulants', 'not-long-term'],
    drugInteractionNotes:
      'Pregnancy: ginseng is avoided throughout pregnancy. Anticoagulants: ginseng has mild antiplatelet activity. Hypertension: traditional Chinese herbal practice avoids ginseng in heat-condition presentations including uncontrolled hypertension. Course length: take in 3-month-on / 1-month-off cycles rather than continuously.',
  },
  {
    slug: 'ashwagandha',
    commonName: 'Ashwagandha',
    latinBinomial: 'Withania somnifera',
    family: 'Solanaceae',
    partsUsed: ['root'],
    primaryActions: ['adaptogen', 'nervine', 'mild-sedative', 'tonic'],
    keyConstituents: ['withanolides', 'sitoindosides'],
    traditionsCited: ['ayurveda', 'western-herbal'],
    safetyFlags: ['pregnancy-avoid', 'thyroid-caution', 'autoimmune-caution', 'allergen-solanaceae'],
    drugInteractionNotes:
      'Pregnancy: ashwagandha is avoided throughout pregnancy. Thyroid: the herb can raise thyroid hormone levels; readers on thyroid replacement should consult their prescriber. Autoimmune: immune-modulating activity; consult a herbalist before continuous use.',
  },
  {
    slug: 'holy-basil',
    commonName: 'Holy basil (tulsi)',
    latinBinomial: 'Ocimum tenuiflorum',
    family: 'Lamiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['adaptogen', 'nervine', 'antimicrobial', 'antioxidant'],
    keyConstituents: ['eugenol', 'rosmarinic-acid', 'ursolic-acid'],
    traditionsCited: ['ayurveda', 'western-herbal'],
    safetyFlags: ['pregnancy-caution', 'not-with-anticoagulants', 'hypoglycaemic-activity'],
    drugInteractionNotes:
      'Anticoagulants: mild antiplatelet activity. Hypoglycaemic: tulsi can lower blood sugar; readers on diabetes medication should monitor carefully and consult their prescriber.',
  },
  {
    slug: 'gotu-kola',
    commonName: 'Gotu kola',
    latinBinomial: 'Centella asiatica',
    family: 'Apiaceae',
    partsUsed: ['leaf', 'aerial-parts'],
    primaryActions: ['nervine', 'vulnerary', 'adaptogen', 'circulatory-tonic'],
    keyConstituents: ['asiaticoside', 'madecassoside', 'triterpenes'],
    traditionsCited: ['ayurveda', 'chinese-medicine', 'western-herbal'],
    safetyFlags: ['pregnancy-caution', 'liver-caution-prolonged-use'],
  },

  // ── Other traditional staples ─────────────────────────────────────
  {
    slug: 'licorice',
    commonName: 'Liquorice',
    latinBinomial: 'Glycyrrhiza glabra',
    family: 'Fabaceae',
    partsUsed: ['root'],
    primaryActions: ['demulcent', 'anti-inflammatory', 'adrenal-tonic', 'expectorant'],
    keyConstituents: ['glycyrrhizin', 'flavonoids', 'glabridin'],
    traditionsCited: ['chinese-medicine', 'western-herbal', 'ayurveda'],
    safetyFlags: ['hypertension-avoid', 'pregnancy-avoid', 'not-long-term', 'not-with-cardiac-medication'],
    drugInteractionNotes:
      'Hypertension: liquorice raises blood pressure by inhibiting cortisol breakdown (pseudoaldosteronism); strictly avoided in readers with hypertension or heart failure. Pregnancy: avoided throughout pregnancy. Course length: use limited to 4–6 weeks at therapeutic dose; long-term use causes potassium loss and oedema. Cardiac medication: significant interaction with digoxin.',
  },
  {
    slug: 'chickweed',
    commonName: 'Chickweed',
    latinBinomial: 'Stellaria media',
    family: 'Caryophyllaceae',
    partsUsed: ['aerial-parts', 'leaf'],
    primaryActions: ['demulcent', 'emollient', 'cooling'],
    keyConstituents: ['saponins', 'flavonoids', 'mucilage'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: [],
  },
  {
    slug: 'cleavers',
    commonName: 'Cleavers',
    latinBinomial: 'Galium aparine',
    family: 'Rubiaceae',
    partsUsed: ['aerial-parts'],
    primaryActions: ['lymphatic', 'diuretic', 'alterative'],
    keyConstituents: ['iridoids', 'tannins', 'flavonoids'],
    traditionsCited: ['western-herbal', 'folk-european'],
    safetyFlags: ['not-with-diuretics-without-supervision'],
  },
]
