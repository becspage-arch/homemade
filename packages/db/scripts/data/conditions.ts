/**
 * Master Condition seed data — ~32 starter rows covering the common home-
 * apothecary use cases. Conservative scope: the conditions a home herbalist
 * legitimately self-treats with infusions, decoctions, salves, and the
 * other preparations the Homemade herbal pipeline writes. Anything that
 * requires a medical diagnosis sits in `redFlagsRequireDoctor`, not in the
 * library row.
 *
 * Conventions:
 *
 *   - slug                     kebab-case, unique. Authoring briefs reference
 *                              conditions through this slug in
 *                              `herbal.relatedConditionSlugs`.
 *   - name                     plain English; matches what the reader would
 *                              search for.
 *   - bodySystem               one of: 'digestive' | 'respiratory' |
 *                              'nervous' | 'musculoskeletal' | 'skin' |
 *                              'womens-health' | 'mental-emotional' |
 *                              'immune' | 'circulatory' | 'urinary' |
 *                              'endocrine'. Drives the public browse
 *                              surface "what helps for X" by body system.
 *   - commonSymptoms           the symptoms a reader would self-recognise.
 *                              Short, plain-language. Not exhaustive.
 *   - redFlagsRequireDoctor    when the reader must stop self-treating and
 *                              see a doctor. Surfaced at the top of every
 *                              REMEDY page referencing this condition.
 *   - notes                    scratch field — not surfaced to the reader.
 */

export interface ConditionSeed {
  slug: string
  name: string
  bodySystem: string
  commonSymptoms: string[]
  redFlagsRequireDoctor?: string
  notes?: string
}

export const CONDITIONS: ConditionSeed[] = [
  // ── Digestive ───────────────────────────────────────────────────────
  {
    slug: 'indigestion',
    name: 'Indigestion',
    bodySystem: 'digestive',
    commonSymptoms: [
      'upper-abdominal-discomfort after eating',
      'bloating',
      'belching',
      'mild heartburn',
    ],
    redFlagsRequireDoctor:
      'See a doctor for indigestion that wakes you at night, comes with unexplained weight loss, painful swallowing, vomiting, black or tarry stools, or chest pain that radiates to the arm or jaw.',
  },
  {
    slug: 'nausea',
    name: 'Nausea',
    bodySystem: 'digestive',
    commonSymptoms: ['queasy sensation', 'aversion to food', 'mild stomach unease'],
    redFlagsRequireDoctor:
      'See a doctor for nausea with severe headache, stiff neck, severe abdominal pain, blood in vomit, signs of dehydration, or nausea that lasts more than 48 hours.',
  },
  {
    slug: 'bloating',
    name: 'Bloating',
    bodySystem: 'digestive',
    commonSymptoms: ['feeling of fullness', 'visible distension after meals', 'wind'],
    redFlagsRequireDoctor:
      'See a doctor for new persistent bloating (every day for three weeks or more), bloating with weight loss, or bloating with a change in bowel habit.',
  },
  {
    slug: 'mild-colic',
    name: 'Mild colic',
    bodySystem: 'digestive',
    commonSymptoms: ['cramping after eating', 'spasmodic abdominal discomfort'],
    redFlagsRequireDoctor:
      'See a doctor for severe pain, fever, vomiting, or any colic in infants — infant colic needs assessment, not home herbal treatment.',
  },
  {
    slug: 'mild-constipation',
    name: 'Mild constipation',
    bodySystem: 'digestive',
    commonSymptoms: ['infrequent passage', 'hard stools', 'straining'],
    redFlagsRequireDoctor:
      'See a doctor for constipation with blood in the stool, unexplained weight loss, severe pain, or a sudden persistent change in bowel habit lasting more than two weeks.',
  },

  // ── Respiratory ────────────────────────────────────────────────────
  {
    slug: 'common-cold',
    name: 'Common cold',
    bodySystem: 'respiratory',
    commonSymptoms: ['runny nose', 'mild sore throat', 'nasal congestion', 'mild cough'],
    redFlagsRequireDoctor:
      'See a doctor if symptoms last more than ten days, fever rises above 39°C, breathing is laboured, or symptoms worsen after initially improving.',
  },
  {
    slug: 'sore-throat',
    name: 'Sore throat',
    bodySystem: 'respiratory',
    commonSymptoms: ['pain on swallowing', 'rawness', 'mild hoarseness'],
    redFlagsRequireDoctor:
      'See a doctor for a sore throat lasting more than a week, very severe pain, difficulty swallowing or breathing, drooling, a hot lump in the neck, or a high fever.',
  },
  {
    slug: 'congestion',
    name: 'Nasal congestion',
    bodySystem: 'respiratory',
    commonSymptoms: ['blocked nose', 'pressure across the forehead and cheeks', 'mild headache'],
    redFlagsRequireDoctor:
      'See a doctor for congestion with high fever, severe facial pain, swelling around the eyes, or symptoms that worsen after ten days of cold-like illness — sinusitis may need treatment.',
  },
  {
    slug: 'mild-cough',
    name: 'Mild cough',
    bodySystem: 'respiratory',
    commonSymptoms: ['dry or productive cough', 'tickling throat', 'occasional chest tightness'],
    redFlagsRequireDoctor:
      'See a doctor for cough with blood in sputum, breathlessness, chest pain, weight loss, night sweats, a cough lasting more than three weeks, or wheezing in someone with asthma.',
  },
  {
    slug: 'hay-fever',
    name: 'Hay fever',
    bodySystem: 'respiratory',
    commonSymptoms: ['sneezing', 'itchy eyes', 'runny nose', 'mild seasonal congestion'],
    redFlagsRequireDoctor:
      'See a doctor for hay fever with wheezing, breathlessness, or severe daily symptoms not eased by usual measures — asthma may co-exist and need assessment.',
  },

  // ── Nervous system / sleep / stress ────────────────────────────────
  {
    slug: 'mild-stress',
    name: 'Mild stress',
    bodySystem: 'nervous',
    commonSymptoms: ['tension', 'irritability', 'feeling wound-up'],
    redFlagsRequireDoctor:
      'Stress that interferes with daily life or pairs with low mood, hopelessness, racing heart episodes, or thoughts of harm deserves a GP conversation rather than a home remedy.',
  },
  {
    slug: 'mild-tension',
    name: 'Mild tension',
    bodySystem: 'nervous',
    commonSymptoms: ['tight shoulders', 'tension headache', 'jaw clenching'],
  },
  {
    slug: 'mild-anxiety',
    name: 'Mild anxiety',
    bodySystem: 'nervous',
    commonSymptoms: ['restlessness', 'mild worry', 'difficulty winding down at bedtime'],
    redFlagsRequireDoctor:
      'See a GP for anxiety that interferes with daily life, comes with panic attacks, intrusive thoughts, or low mood with hopelessness. Herbal calm does not replace assessment.',
  },
  {
    slug: 'mild-insomnia',
    name: 'Mild insomnia',
    bodySystem: 'nervous',
    commonSymptoms: ['difficulty falling asleep', 'occasional waking', 'unrefreshed mornings'],
    redFlagsRequireDoctor:
      'See a GP for insomnia lasting more than a month, insomnia with low mood, loud snoring with daytime sleepiness (possible sleep apnoea), or any sudden change in sleep pattern in older adults.',
  },
  {
    slug: 'tension-headache',
    name: 'Tension headache',
    bodySystem: 'nervous',
    commonSymptoms: ['band-like pressure across the head', 'tight neck and shoulders'],
    redFlagsRequireDoctor:
      'See a doctor for any "worst headache of my life", sudden severe headache, headache with fever and stiff neck, headache after a head injury, or new headache pattern after age fifty.',
  },
  {
    slug: 'fatigue',
    name: 'Mild fatigue',
    bodySystem: 'nervous',
    commonSymptoms: ['low energy', 'feeling rundown', 'slow to recover from effort'],
    redFlagsRequireDoctor:
      'See a doctor for persistent fatigue lasting more than a few weeks, fatigue with weight loss, fatigue with shortness of breath, or fatigue that does not improve with sleep and rest — anaemia, thyroid disorders, and other treatable conditions cause it.',
  },

  // ── Skin (external preparations) ──────────────────────────────────
  {
    slug: 'minor-cut',
    name: 'Minor cut or graze',
    bodySystem: 'skin',
    commonSymptoms: ['shallow break in the skin', 'minor bleeding', 'mild stinging'],
    redFlagsRequireDoctor:
      'See a doctor or A&E for deep cuts, cuts that will not stop bleeding after fifteen minutes of pressure, cuts over a joint, cuts on the face or hand with possible nerve or tendon involvement, animal or human bites, or any wound showing spreading redness, warmth, pus, or fever (signs of infection).',
  },
  {
    slug: 'minor-burn',
    name: 'Minor burn',
    bodySystem: 'skin',
    commonSymptoms: ['superficial redness', 'small blister', 'mild stinging on cool water'],
    redFlagsRequireDoctor:
      'See A&E for any burn larger than the size of the casualty\'s palm, any burn on the face, hands, feet, joints, or genitals, any burn that goes through the skin layer (white, leathery, or charred), or any chemical or electrical burn. Run cool running water over a fresh burn for at least twenty minutes before any other treatment.',
  },
  {
    slug: 'mild-bruising',
    name: 'Mild bruising',
    bodySystem: 'skin',
    commonSymptoms: ['discoloured skin', 'tenderness on touch', 'no broken skin'],
    redFlagsRequireDoctor:
      'See a doctor for unexplained bruising, frequent bruising, bruising with bleeding gums or nosebleeds, or bruising in unusual sites — clotting disorders need assessment.',
  },
  {
    slug: 'skin-irritation',
    name: 'Mild skin irritation',
    bodySystem: 'skin',
    commonSymptoms: ['red patch', 'mild itch', 'localised dryness'],
    redFlagsRequireDoctor:
      'See a doctor for irritation that spreads, weeps, blisters, or comes with fever — and for any rash in someone unwell, which needs urgent assessment.',
  },
  {
    slug: 'mild-eczema',
    name: 'Mild eczema',
    bodySystem: 'skin',
    commonSymptoms: ['dry itchy patches', 'mild redness', 'minor flaking'],
    redFlagsRequireDoctor:
      'See a GP for eczema that is weeping, crusted, infected (gold-coloured crust), spreading rapidly, or interfering with sleep. Eczema in infants warrants GP review rather than home remedies.',
  },
  {
    slug: 'insect-bite',
    name: 'Insect bite or sting',
    bodySystem: 'skin',
    commonSymptoms: ['localised swelling', 'itch', 'small puncture mark'],
    redFlagsRequireDoctor:
      'Call 999 for any sign of anaphylaxis — swollen lips or tongue, difficulty breathing, dizziness, or sudden generalised rash. See A&E for tick bites with a bullseye rash, bites that become rapidly more swollen, or any bite in someone unwell.',
  },

  // ── Women\'s health ─────────────────────────────────────────────────
  {
    slug: 'menstrual-discomfort',
    name: 'Menstrual discomfort',
    bodySystem: 'womens-health',
    commonSymptoms: ['cramping', 'lower back ache', 'mild bloating around the period'],
    redFlagsRequireDoctor:
      'See a GP for period pain that interferes with daily life, pain that has changed in character or severity, very heavy bleeding (flooding, large clots), pain between periods, or any pain with fever — these can indicate conditions that need assessment.',
  },
  {
    slug: 'perimenopausal-symptoms',
    name: 'Perimenopausal symptoms',
    bodySystem: 'womens-health',
    commonSymptoms: ['hot flushes', 'sleep disturbance', 'mood shifts', 'irregular cycles'],
    redFlagsRequireDoctor:
      'See a GP for heavy bleeding, bleeding between periods, bleeding after the periods have stopped, severe mood symptoms, or any new symptom you would like a medical opinion on — the menopause is medically supportable and herbal remedies are an adjunct, not a substitute.',
  },
  {
    slug: 'cycle-support',
    name: 'Gentle cycle support',
    bodySystem: 'womens-health',
    commonSymptoms: ['mild irregularity', 'PMS-style mood shifts'],
    notes:
      'Phrase deliberately mild — anything more deserves a GP or specialist herbalist.',
  },

  // ── Mental & emotional (mild support only) ────────────────────────
  {
    slug: 'mild-low-mood',
    name: 'Mild low mood',
    bodySystem: 'mental-emotional',
    commonSymptoms: ['feeling flat', 'low energy', 'mild loss of pleasure in everyday things'],
    redFlagsRequireDoctor:
      'See a GP for low mood lasting more than two weeks, low mood with hopelessness, loss of interest in everything, sleep or appetite changes, or any thoughts of self-harm or suicide. Herbal remedies are an adjunct to professional support, not a substitute.',
  },
  {
    slug: 'focus-difficulty',
    name: 'Mild focus difficulty',
    bodySystem: 'mental-emotional',
    commonSymptoms: ['scattered attention', 'mild brain fog'],
    redFlagsRequireDoctor:
      'See a GP for sudden cognitive changes, focus difficulty with memory loss, or focus problems with low mood — these deserve assessment.',
  },

  // ── Musculoskeletal ───────────────────────────────────────────────
  {
    slug: 'muscular-soreness',
    name: 'Muscular soreness',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['post-exercise stiffness', 'general muscle ache'],
    redFlagsRequireDoctor:
      'See a doctor for sudden severe muscle pain, muscle pain with dark urine (possible rhabdomyolysis), muscle pain with weakness, or pain unrelated to exertion and persistent for more than a couple of weeks.',
  },
  {
    slug: 'mild-joint-ache',
    name: 'Mild joint ache',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['stiffness in the morning', 'mild ache after rest', 'occasional warmth'],
    redFlagsRequireDoctor:
      'See a GP for new joint swelling, joint pain with redness and warmth, joint pain with fever, or joint pain that wakes you at night — inflammatory arthritis needs assessment.',
  },

  // ── Immune ─────────────────────────────────────────────────────────
  {
    slug: 'general-immune-support',
    name: 'General immune support',
    bodySystem: 'immune',
    commonSymptoms: ['frequent colds', 'slow recovery between bugs', 'seasonal rundown'],
    notes:
      'Phrased deliberately as "support" not "boost". The voice rules in `docs/herbal-author.md` forbid the verb "boost the immune system" — it is a tell.',
  },

  // ── Urinary ───────────────────────────────────────────────────────
  {
    slug: 'mild-fluid-retention',
    name: 'Mild fluid retention',
    bodySystem: 'urinary',
    commonSymptoms: ['puffiness in the ankles after standing', 'mild ring-finger tightness'],
    redFlagsRequireDoctor:
      'See a doctor for sudden swelling, swelling in one leg only (possible deep vein thrombosis), swelling with breathlessness, or any fluid retention in someone with heart, kidney, or liver disease.',
  },
]
