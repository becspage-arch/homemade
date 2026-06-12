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

  // ── Musculoskeletal ───────────────────────────────────────────────
  {
    slug: 'muscle-aching',
    name: 'Muscle aching',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['aching legs after standing', 'sore muscles after exertion', 'general muscular tiredness'],
    redFlagsRequireDoctor:
      'See a doctor for sudden severe muscle pain, muscle weakness, or persistent aching that does not improve with rest.',
  },
  {
    slug: 'poor-leg-circulation',
    name: 'Poor leg circulation',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['cold feet', 'tired heavy legs', 'leg aching after prolonged standing'],
    redFlagsRequireDoctor:
      'See a doctor for one-sided leg swelling, pain at rest, skin changes, or any leg wound that is slow to heal.',
  },

  // ── Herbal-medicine bulk-004 additions ──────────────────────────────────────

  // Skin
  {
    slug: 'acne',
    name: 'Acne',
    bodySystem: 'skin',
    commonSymptoms: ['spots and pimples', 'oily skin', 'blocked pores', 'occasional cysts'],
    redFlagsRequireDoctor:
      'See a GP for severe or cystic acne, acne leaving scars, or acne not improving after several months of self-care.',
  },
  {
    slug: 'conjunctivitis-allergic',
    name: 'Allergic conjunctivitis',
    bodySystem: 'skin',
    commonSymptoms: ['itchy red eyes', 'watery discharge', 'swollen eyelids in pollen season'],
    redFlagsRequireDoctor:
      'See a doctor for eye pain, sudden vision change, purulent discharge, or conjunctivitis in a contact-lens wearer — bacterial or viral causes need assessment.',
  },
  {
    slug: 'eye-irritation',
    name: 'Eye irritation',
    bodySystem: 'skin',
    commonSymptoms: ['mild redness', 'grittiness', 'mild watering'],
    redFlagsRequireDoctor:
      'See a doctor for eye pain, vision change, sensitivity to light, discharge, or irritation lasting more than 48 hours.',
  },
  {
    slug: 'skin-congestion',
    name: 'Skin congestion',
    bodySystem: 'skin',
    commonSymptoms: ['dull complexion', 'enlarged pores', 'blackheads', 'sluggish-looking skin'],
  },
  {
    slug: 'perineal-soreness',
    name: 'Perineal soreness',
    bodySystem: 'skin',
    commonSymptoms: ['soreness and tenderness around the perineum', 'mild swelling after birth or minor injury'],
    redFlagsRequireDoctor:
      'See a midwife or GP for signs of wound infection (increasing pain, heat, swelling, discharge, fever), or for pain that is severe or worsening.',
  },
  {
    slug: 'vulval-irritation',
    name: 'Vulval irritation',
    bodySystem: 'skin',
    commonSymptoms: ['external itch or soreness', 'mild redness of the vulval skin'],
    redFlagsRequireDoctor:
      'See a GP for persistent vulval irritation, any skin changes (white patches, thickening, ulceration), unusual discharge, or symptoms alongside internal pain — these need examination.',
  },

  // Respiratory
  {
    slug: 'allergic-rhinitis',
    name: 'Allergic rhinitis',
    bodySystem: 'respiratory',
    commonSymptoms: ['sneezing', 'clear runny nose', 'nasal itch', 'blocked nose'],
    redFlagsRequireDoctor:
      'See a doctor for rhinitis with wheezing, breathlessness, or symptoms not controlled by standard measures — asthma may co-exist.',
  },
  {
    slug: 'cold',
    name: 'Cold',
    bodySystem: 'respiratory',
    commonSymptoms: ['runny or blocked nose', 'mild sore throat', 'sneezing', 'mild fatigue'],
    redFlagsRequireDoctor:
      'See a doctor if symptoms last more than ten days, fever rises above 39°C, breathing is laboured, or symptoms worsen after initially improving.',
  },
  {
    slug: 'cold-prevention',
    name: 'Cold prevention',
    bodySystem: 'immune',
    commonSymptoms: ['frequent colds', 'seasonal susceptibility', 'slow recovery from minor illness'],
  },
  {
    slug: 'dry-cough',
    name: 'Dry cough',
    bodySystem: 'respiratory',
    commonSymptoms: ['persistent tickling dry cough', 'throat irritation without mucus'],
    redFlagsRequireDoctor:
      'See a doctor for cough lasting more than three weeks, cough with blood, breathlessness, chest pain, weight loss, or night sweats.',
  },
  {
    slug: 'flu-like-illness',
    name: 'Flu-like illness',
    bodySystem: 'respiratory',
    commonSymptoms: ['fever', 'muscle aches', 'headache', 'fatigue', 'cough', 'sore throat'],
    redFlagsRequireDoctor:
      'See a doctor for breathlessness, chest pain, confusion, inability to keep fluids down, fever above 39°C in vulnerable groups (elderly, immunosuppressed, pregnant), or symptoms that worsen after seeming to improve.',
  },
  {
    slug: 'head-cold',
    name: 'Head cold',
    bodySystem: 'respiratory',
    commonSymptoms: ['blocked or runny nose', 'sinus pressure', 'mild headache', 'facial heaviness'],
    redFlagsRequireDoctor:
      'See a doctor for high fever, severe facial pain, swelling around the eye, or symptoms worsening after ten days.',
  },
  {
    slug: 'irritated-throat',
    name: 'Irritated throat',
    bodySystem: 'respiratory',
    commonSymptoms: ['tickling or scratchy sensation', 'mild rawness', 'urge to clear the throat'],
    redFlagsRequireDoctor:
      'See a doctor for throat irritation lasting more than a week, severe pain, difficulty swallowing, or a lump in the neck.',
  },
  {
    slug: 'sinus-congestion',
    name: 'Sinus congestion',
    bodySystem: 'respiratory',
    commonSymptoms: ['blocked sinuses', 'pressure around the nose and forehead', 'post-nasal drip'],
    redFlagsRequireDoctor:
      'See a doctor for severe facial pain, fever, swelling around the eye, or symptoms worsening after ten days — sinusitis may need treatment.',
  },

  // Immune
  {
    slug: 'immune-support',
    name: 'Immune support',
    bodySystem: 'immune',
    commonSymptoms: ['frequent minor infections', 'slow recovery', 'feeling run down seasonally'],
    notes: 'Phrased as support, not boost — voice rules forbid the verb "boost the immune system".',
  },
  {
    slug: 'chronic-inflammation',
    name: 'Chronic low-grade inflammation',
    bodySystem: 'immune',
    commonSymptoms: ['persistent joint stiffness', 'generalised aching', 'slow recovery from exertion'],
    redFlagsRequireDoctor:
      'See a doctor for new unexplained inflammation, joint swelling with warmth, fever, or any symptom suggesting infection or autoimmune disease.',
  },

  // Nervous system
  {
    slug: 'anxiety',
    name: 'Anxiety',
    bodySystem: 'nervous',
    commonSymptoms: ['worry', 'restlessness', 'physical tension', 'difficulty winding down'],
    redFlagsRequireDoctor:
      'See a GP for anxiety that interferes with daily life, comes with panic attacks, intrusive thoughts, or low mood with hopelessness.',
  },
  {
    slug: 'difficulty-falling-asleep',
    name: 'Difficulty falling asleep',
    bodySystem: 'nervous',
    commonSymptoms: ['lying awake at bedtime', 'racing thoughts at night', 'taking more than 30 minutes to fall asleep'],
    redFlagsRequireDoctor:
      'See a GP for sleep problems lasting more than a month, or sleep difficulty with low mood, loud snoring, or daytime sleepiness.',
  },
  {
    slug: 'insomnia',
    name: 'Insomnia',
    bodySystem: 'nervous',
    commonSymptoms: ['difficulty falling or staying asleep', 'unrefreshed on waking', 'daytime fatigue'],
    redFlagsRequireDoctor:
      'See a GP for insomnia lasting more than a month, insomnia with low mood or anxiety, or any sudden change in sleep pattern.',
  },
  {
    slug: 'low-energy',
    name: 'Low energy',
    bodySystem: 'nervous',
    commonSymptoms: ['feeling drained', 'slow start to the day', 'flagging by mid-afternoon'],
    redFlagsRequireDoctor:
      'See a doctor for fatigue lasting more than a few weeks, fatigue with weight loss, shortness of breath, or fatigue that does not improve with rest.',
  },
  {
    slug: 'nervous-tension',
    name: 'Nervous tension',
    bodySystem: 'nervous',
    commonSymptoms: ['physical tightness', 'shallow breathing', 'feeling of being keyed up'],
    redFlagsRequireDoctor:
      'See a GP for tension with panic attacks, chest pain, palpitations, or symptoms interfering with daily life.',
  },
  {
    slug: 'neuralgia',
    name: 'Neuralgia',
    bodySystem: 'nervous',
    commonSymptoms: ['sharp shooting pain along a nerve path', 'burning or electric-shock sensation'],
    redFlagsRequireDoctor:
      'See a doctor for new or severe nerve pain, pain after shingles, pain with weakness or numbness, or any face pain involving the eye.',
  },
  {
    slug: 'stress',
    name: 'Stress',
    bodySystem: 'nervous',
    commonSymptoms: ['feeling overwhelmed', 'irritability', 'tension', 'poor sleep'],
    redFlagsRequireDoctor:
      'Stress with prolonged low mood, hopelessness, or thoughts of self-harm warrants GP support rather than a home remedy.',
  },

  // Mental-emotional
  {
    slug: 'low-mood',
    name: 'Low mood',
    bodySystem: 'mental-emotional',
    commonSymptoms: ['feeling flat or sad', 'low motivation', 'mild loss of pleasure'],
    redFlagsRequireDoctor:
      'See a GP for low mood lasting more than two weeks, hopelessness, loss of interest in everything, or any thoughts of self-harm.',
  },
  {
    slug: 'mild-depression',
    name: 'Mild depression',
    bodySystem: 'mental-emotional',
    commonSymptoms: ['persistent low mood', 'reduced energy', 'poor concentration', 'disrupted sleep or appetite'],
    redFlagsRequireDoctor:
      'See a GP for moderate or severe depression, hopelessness, inability to function, or any thoughts of self-harm or suicide. Herbal support is an adjunct, not a substitute for professional care.',
  },

  // Musculoskeletal
  {
    slug: 'arthritis',
    name: 'Arthritis',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['joint pain', 'stiffness on waking', 'reduced range of movement'],
    redFlagsRequireDoctor:
      'See a GP for new joint swelling with heat, fever with joint symptoms, or sudden severe joint pain — inflammatory arthritis and gout need assessment.',
  },
  {
    slug: 'back-ache',
    name: 'Back ache',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['dull ache in the lower or upper back', 'stiffness after sitting or sleeping'],
    redFlagsRequireDoctor:
      'See a doctor for back pain with leg weakness, numbness, loss of bladder or bowel control, unexplained weight loss, or pain waking you at night.',
  },
  {
    slug: 'joint-pain',
    name: 'Joint pain',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['aching joints', 'stiffness', 'discomfort after rest or prolonged use'],
    redFlagsRequireDoctor:
      'See a GP for joint swelling with redness and warmth, joint pain with fever, or new joint pain in someone with a known inflammatory condition.',
  },
  {
    slug: 'joint-stiffness',
    name: 'Joint stiffness',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['stiffness on waking or after sitting', 'slow loosening up with movement'],
    redFlagsRequireDoctor:
      'See a GP for prolonged morning stiffness (more than an hour), joint swelling, or stiffness worsening despite activity.',
  },
  {
    slug: 'muscle-tension',
    name: 'Muscle tension',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['tight knotted muscles', 'aching shoulders or neck', 'tension headache linked to neck tension'],
  },
  {
    slug: 'stiff-neck',
    name: 'Stiff neck',
    bodySystem: 'musculoskeletal',
    commonSymptoms: ['limited neck rotation', 'aching on turning the head', 'tight upper trapezius'],
    redFlagsRequireDoctor:
      'See a doctor immediately for neck stiffness with fever and headache (meningitis), or neck pain after a fall or road accident.',
  },

  // Digestive
  {
    slug: 'digestive-cramping',
    name: 'Digestive cramping',
    bodySystem: 'digestive',
    commonSymptoms: ['cramping abdominal pain', 'spasm after eating', 'intermittent gut pain relieved by passing wind'],
    redFlagsRequireDoctor:
      'See a doctor for severe abdominal pain, blood in the stool, unexplained weight loss, or cramping with fever.',
  },
  {
    slug: 'digestive-fatigue',
    name: 'Digestive fatigue',
    bodySystem: 'digestive',
    commonSymptoms: ['heaviness after meals', 'sluggish digestion', 'tiredness linked to eating'],
    notes: 'Distinct from general fatigue — specifically tied to digestive function.',
  },
  {
    slug: 'ibs',
    name: 'Irritable bowel syndrome (IBS)',
    bodySystem: 'digestive',
    commonSymptoms: ['alternating loose stools and constipation', 'abdominal cramping', 'bloating', 'urgency'],
    redFlagsRequireDoctor:
      'See a GP for IBS symptoms that are new, have changed in character, come with blood in the stool, unexplained weight loss, or are not responding to usual self-care.',
  },
  {
    slug: 'sluggish-digestion',
    name: 'Sluggish digestion',
    bodySystem: 'digestive',
    commonSymptoms: ['slow transit', 'food sitting heavily', 'infrequent bowel movements without straining'],
  },
  {
    slug: 'liver-recovery',
    name: 'Liver recovery support',
    bodySystem: 'digestive',
    commonSymptoms: ['fatigue following illness or excess', 'sluggish digestion', 'feeling generally below par'],
    redFlagsRequireDoctor:
      'See a doctor for jaundice (yellowing of skin or whites of eyes), severe right-side abdominal pain, dark urine or pale stools, or persistent unexplained fatigue — liver conditions need assessment.',
  },

  // Circulatory
  {
    slug: 'palpitations',
    name: 'Palpitations',
    bodySystem: 'circulatory',
    commonSymptoms: ['awareness of heartbeat', 'occasional missed or extra beat', 'fluttering sensation in the chest'],
    redFlagsRequireDoctor:
      'See a doctor promptly for palpitations with chest pain, breathlessness, dizziness, or fainting. Palpitations that are frequent, prolonged, or new need a cardiac assessment.',
  },
  {
    slug: 'varicose-veins',
    name: 'Varicose veins',
    bodySystem: 'circulatory',
    commonSymptoms: ['visible raised veins in the legs', 'leg heaviness', 'aching after standing'],
    redFlagsRequireDoctor:
      'See a GP for a varicose vein that bleeds, an ulcer near the ankle, one-sided leg swelling (possible DVT), or varicose veins with pain at rest.',
  },
  {
    slug: 'venous-insufficiency',
    name: 'Venous insufficiency',
    bodySystem: 'circulatory',
    commonSymptoms: ['ankle swelling by end of day', 'heavy tired legs', 'skin discolouration around the ankle'],
    redFlagsRequireDoctor:
      'See a GP for leg ulcers, sudden one-sided leg swelling, or skin changes — chronic venous insufficiency needs management.',
  },
  {
    slug: 'lymphatic-sluggishness',
    name: 'Lymphatic sluggishness',
    bodySystem: 'circulatory',
    commonSymptoms: ['puffiness in the face or limbs', 'feeling of congestion or fullness', 'slow recovery from minor illness'],
    notes: 'Traditional herbal concept; not a conventional medical diagnosis. Phrased carefully.',
  },

  // Women's health
  {
    slug: 'fluid-retention',
    name: 'Fluid retention',
    bodySystem: 'urinary',
    commonSymptoms: ['swollen ankles or fingers', 'puffiness', 'ring tightness at end of day'],
    redFlagsRequireDoctor:
      'See a doctor for sudden or severe swelling, one-sided leg swelling, or fluid retention with breathlessness or heart or kidney disease.',
  },
  {
    slug: 'menstrual-cramps',
    name: 'Menstrual cramps',
    bodySystem: 'womens-health',
    commonSymptoms: ['cramping lower abdominal pain during the period', 'lower back ache'],
    redFlagsRequireDoctor:
      'See a GP for period pain that interferes with daily life, pain that has changed in severity, or pain with fever or abnormal bleeding — endometriosis and other conditions need assessment.',
  },
  {
    slug: 'menstrual-irregularity',
    name: 'Menstrual irregularity',
    bodySystem: 'womens-health',
    commonSymptoms: ['variable cycle length', 'missed periods', 'spotting between periods'],
    redFlagsRequireDoctor:
      'See a GP for irregular periods with no known cause, periods that have stopped for more than three months, or irregular bleeding after menopause.',
  },
  {
    slug: 'pelvic-congestion',
    name: 'Pelvic congestion',
    bodySystem: 'womens-health',
    commonSymptoms: ['dull pelvic heaviness', 'dragging sensation before the period', 'lower abdominal fullness'],
    redFlagsRequireDoctor:
      'See a GP for pelvic pain that is severe, constant, or comes with irregular bleeding — pelvic congestion syndrome, fibroids, and endometriosis need investigation.',
  },
  {
    slug: 'premenstrual-bloating',
    name: 'Premenstrual bloating',
    bodySystem: 'womens-health',
    commonSymptoms: ['abdominal bloating in the week before the period', 'feeling of fullness', 'mild weight gain'],
  },
]
