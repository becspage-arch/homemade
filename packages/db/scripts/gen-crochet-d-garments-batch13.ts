/**
 * Generator: D-Garments Batch 13 -- Loungewear and casual home wear G121-G130
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch13.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gradeAllSizes } from '../../../apps/web/src/lib/crochet/grading/grader'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-garments')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }
function supplies(heading: string, items: { name: string; qty: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const W = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

// G121 -- jogger trousers (TUNIC shape used for trouser grading, aran 5mm)
const g121 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g121m = g121.find(g => g.size === 'M')!

// G122 -- lounge shorts (TANK shape, dk 4mm)
const g122 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TANK' })
const g122m = g122.find(g => g.size === 'M')!

// G123 -- lounge top (PULLOVER, aran 5mm)
const g123 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g123m = g123.find(g => g.size === 'M')!

// G124 -- dressing gown (CARDIGAN, chunky 6mm)
const g124 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 12, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g124m = g124.find(g => g.size === 'M')!

// G125 -- pyjama top (PULLOVER, dk 4mm)
const g125 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g125m = g125.find(g => g.size === 'M')!

// G127 -- wide-leg lounge trousers (TUNIC shape, aran 5mm)
const g127 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g127m = g127.find(g => g.size === 'M')!

// G128 -- crop hoodie (PULLOVER, chunky 6mm)
const g128 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 12, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g128m = g128.find(g => g.size === 'M')!

// G129 -- oversized hoodie (PULLOVER, chunky 6mm)
const g129 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 12, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g129m = g129.find(g => g.size === 'M')!

// G130 -- zip hoodie cardigan (CARDIGAN, aran 5mm)
const g130 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g130m = g130.find(g => g.size === 'M')!

const PATTERNS = [
  // G121 -- crochet-jogger-trousers
  {
    slug: 'crochet-jogger-trousers',
    title: 'Crochet jogger trousers',
    excerpt: 'Elasticated waist jogger trousers in aran yarn worked as two leg tubes seamed at the crotch. Ribbed ankle cuffs and a fold-over waistband. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g121m.finishedMeasurements.bust} cm hip. Inseam approx. 72 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    criticalTechniques: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
    aliases: ['crochet joggers', 'crochet sweatpants', 'crochet jogging bottoms'],
    glossaryTerms: [
      { slug: 'crochet-fold-over-waistband-g121', term: 'Fold-over waistband', definition: 'A double-thickness band at the top of the trousers. Work the waistband to twice the finished depth, fold in half and sew the lower edge to the trouser body, then thread elastic through the fold.' },
      { slug: 'crochet-ankle-rib-g121', term: 'Ankle rib', definition: 'A short section of fpdc and bpdc rib worked in the round at the base of each leg. The rib gathers the leg opening to a narrower cuff.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Crochet joggers are a popular modern loungewear project.',
    body: {
      type: 'doc', content: [
        p(t('Work each leg as a dc tube in the round. Start at the ankle with a short '), gt('crochet-ankle-rib-g121', 'ankle rib'), t(' in fpdc and bpdc, then increase gradually to the thigh width. Join both tubes at the crotch and continue in the round to the waist. Finish with a '), gt('crochet-fold-over-waistband-g121', 'fold-over waistband'), t(' and elastic.')),
        p(t(`Size M: each leg ${Math.round(g121m.hemStitches / 2)} sts around at thigh. Hip ${g121m.finishedMeasurements.bust} cm. Inseam 72 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '700 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Elastic, 3 cm wide', qty: 'waist + 5 cm' },
        ]),
        h2('Legs (make 2)'),
        p(t('Chain 36 and join into a ring. Work 8 cm of '), gt('crochet-ankle-rib-g121', 'ankle rib'), t(', then switch to dc in round. Increase 2 sts evenly every 10 rows until you reach the thigh count. Work to 72 cm from the ankle.')),
        h2('Join and body'),
        p(t(`Join both legs at the crotch. Work in round to the waist for a further 25 cm. Add a `, ), gt('crochet-fold-over-waistband-g121', 'fold-over waistband'), t(' of 10 cm folded, then thread elastic.')),
        h2('What to try next'),
        p(t('The wide-leg lounge trousers use the same tube construction with a wider leg opening and no ankle rib.')),
      ],
    },
  },

  // G122 -- crochet-lounge-shorts
  {
    slug: 'crochet-lounge-shorts',
    title: 'Crochet lounge shorts',
    excerpt: 'Loose lounge shorts in DK yarn with a 20 cm inseam and an elasticated waistband. Quick to make and comfortable to wear around the house. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g122m.finishedMeasurements.bust} cm hip. Inseam 20 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet lounge shorts', 'crochet house shorts', 'crochet casual shorts'],
    glossaryTerms: [
      { slug: 'crochet-flat-panel-shorts-g122', term: 'Flat panel shorts', definition: 'Each leg is worked as a flat dc rectangle, seamed along the inner edge, then both legs are joined at the crotch. A simpler construction than working in the round from the waist.' },
      { slug: 'crochet-inseam-g122', term: 'Inseam', definition: 'The measurement from the crotch seam to the hem at the inner leg. These shorts have a 20 cm inseam, placing the hem mid-thigh.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Lounge shorts are a quick and popular crochet project for home wear.',
    body: {
      type: 'doc', content: [
        p(t('Use '), gt('crochet-flat-panel-shorts-g122', 'flat panel construction'), t(': work each leg as a dc rectangle, then seam along the inner edge. The '), gt('crochet-inseam-g122', 'inseam'), t(' is 20 cm. Join both panels at the crotch and add an elasticated waistband.')),
        p(t(`Size M: each panel ${Math.round(g122m.hemStitches / 2)} sts wide, 45 cm tall (rise plus inseam). Hip ${g122m.finishedMeasurements.bust} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK yarn', qty: '300 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
        ]),
        h2('Legs (make 2)'),
        p(t(`Chain ${Math.round(g122m.hemStitches / 2) + 2}. Work dc for 45 cm. Seam inner edge.`)),
        h2('Assembly'),
        p(t('Join at the crotch. Work 5 cm dc for the waistband. Fold and sew a casing. Thread elastic.')),
        h2('What to try next'),
        p(t('The crochet jogger trousers use the same construction with a longer leg and ribbed ankle cuff.')),
      ],
    },
  },

  // G123 -- crochet-lounge-top
  {
    slug: 'crochet-lounge-top',
    title: 'Crochet lounge top',
    excerpt: 'A relaxed-fit drop shoulder lounge top in aran yarn to match the lounge shorts or joggers. Worked flat in two panels. Graded XS to 3XL.',
    difficulty: 'BEGINNER',
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g123m.finishedMeasurements.bust} cm bust. Length ${g123m.finishedMeasurements.length} cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet lounge top', 'crochet matching set top', 'crochet casual tee'],
    glossaryTerms: [
      { slug: 'drop-shoulder-g123', term: 'Drop shoulder', definition: 'A sleeve construction where the shoulder seam falls past the natural shoulder point, typically to the upper arm. There is no armhole shaping. Front and back are worked as straight rectangles.' },
      { slug: 'relaxed-ease-g123', term: 'Relaxed ease', definition: 'A garment that measures several centimetres wider than the body. This top is designed to sit loosely on the body for comfort at home.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Relaxed drop shoulder tops are a foundational crochet garment pattern.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back as identical flat dc rectangles using '), gt('drop-shoulder-g123', 'drop shoulder'), t(' construction. The '), gt('relaxed-ease-g123', 'relaxed ease'), t(' means no waist shaping. Seam at the shoulders and sides. Work a round of dc around the neck, armhole edges and hem.')),
        p(t(`Size M: ${g123m.frontStitches} sts wide. Bust ${g123m.finishedMeasurements.bust} cm. Length ${g123m.finishedMeasurements.length} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '450 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Front and back (make 2)'),
        p(t(`Chain ${g123m.frontStitches + 2}. Work dc for ${g123m.finishedMeasurements.length} cm. Leave the central 20 sts unworked for the neck opening.`)),
        h2('Finishing'),
        p(t('Seam shoulders and sides. Work 1 round dc around the neck opening and each armhole edge.')),
        h2('What to try next'),
        p(t('The crochet dressing gown uses the same dc fabric at a full length with a front opening.')),
      ],
    },
  },

  // G124 -- crochet-dressing-gown
  {
    slug: 'crochet-dressing-gown',
    title: 'Crochet dressing gown',
    excerpt: 'A full-length belted dressing gown in chunky yarn with drop shoulder construction and an open front. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'chunky',
    hook: 'crochet-hook-6-0mm',
    gauge: '12 dc x 14 rows = 10 x 10 cm in chunky on a 6 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g124m.finishedMeasurements.bust} cm bust. Length approx. 110 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet dressing gown', 'crochet robe', 'crochet bathrobe'],
    glossaryTerms: [
      { slug: 'crochet-belt-carrier-g124', term: 'Belt carrier', definition: 'A small loop of chain or dc attached at the side seam at waist level. The belt threads through both carriers to hold it in place at the centre front.' },
      { slug: 'crochet-collar-band-g124', term: 'Collar band', definition: 'A wide dc strip worked from the back neck, down both front edges and around the hem in one continuous band. The band reinforces the open-front edges and forms a shawl collar.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Dressing gowns and robes are a popular longer-length crochet project.',
    body: {
      type: 'doc', content: [
        p(t('Work the back and two front panels as flat dc rectangles. Seam shoulders and sides. Work sleeves flat and sew in. Work a continuous '), gt('crochet-collar-band-g124', 'collar band'), t(' from the back neck around all front edges to the hem. Attach '), gt('crochet-belt-carrier-g124', 'belt carriers'), t(' at the waist and work a long dc belt.')),
        p(t(`Size M: back ${g124m.backStitches} sts wide. Bust ${g124m.finishedMeasurements.bust} cm. Length 110 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Chunky yarn', qty: '900 yards' },
          { name: '6 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g124m.backStitches + 2}. Work dc for 110 cm.`)),
        h2('Front panels (make 2)'),
        p(t(`Chain ${Math.round(g124m.backStitches / 2) + 2}. Work dc for 110 cm.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g124m.sleeveStitches + 2}. Work dc for 60 cm. Seam short edges into a tube.`)),
        h2('Finishing'),
        p(t('Seam shoulders and sides. Sew in sleeves. Work the '), gt('crochet-collar-band-g124', 'collar band'), t(' in 10 cm width dc along all front and neck edges. Add '), gt('crochet-belt-carrier-g124', 'belt carriers'), t(' at the waist. Work the belt as a long dc strip.')),
        h2('What to try next'),
        p(t('The crochet lounge top is the same drop shoulder construction in a shorter length.')),
      ],
    },
  },

  // G125 -- crochet-pyjama-top
  {
    slug: 'crochet-pyjama-top',
    title: 'Crochet pyjama top',
    excerpt: 'A drop shoulder pyjama top in DK yarn with a chest placket and three buttons. Worked flat in two panels. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g125m.finishedMeasurements.bust} cm bust. Length ${g125m.finishedMeasurements.length} cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet pyjama top', 'crochet pj top', 'crochet sleepwear top'],
    glossaryTerms: [
      { slug: 'chest-placket-g125', term: 'Chest placket', definition: 'A narrow vertical strip at the centre front worked in dc rows. The placket has three button loops spaced evenly along one side, and three buttons sewn to the other side.' },
      { slug: 'button-loop-g125', term: 'Button loop', definition: 'A small chain loop worked at the edge of the placket. The chain is sized to pass over the button and hold it closed.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Crochet pyjama tops are a popular sleepwear and lounge pattern.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back as flat dc rectangles. Divide the front into two halves at the centre. Work a '), gt('chest-placket-g125', 'chest placket'), t(' strip along each centre front edge. Add three '), gt('button-loop-g125', 'button loops'), t(' to the right placket and sew three buttons to the left placket. Seam shoulders and sides.')),
        p(t(`Size M: ${g125m.frontStitches} sts total front. Bust ${g125m.finishedMeasurements.bust} cm. Length ${g125m.finishedMeasurements.length} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK yarn', qty: '400 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Buttons, 2 cm', qty: '3' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g125m.frontStitches + 2}. Work dc for ${g125m.finishedMeasurements.length} cm.`)),
        h2('Front panels (make 2)'),
        p(t(`Chain ${Math.round(g125m.frontStitches / 2) + 2}. Work dc for ${g125m.finishedMeasurements.length} cm.`)),
        h2('Placket'),
        p(t('Work 3 cm dc strip along each centre front edge. On the right front, work three '), gt('button-loop-g125', 'button loops'), t(' spaced evenly. Sew buttons to the left front '), gt('chest-placket-g125', 'placket'), t('.')),
        h2('What to try next'),
        p(t('The crochet lounge top uses the same panels without a placket for a pullover version.')),
      ],
    },
  },

  // G126 -- crochet-bralette
  {
    slug: 'crochet-bralette',
    title: 'Crochet bralette',
    excerpt: 'A bandeau bralette in DK cotton worked flat with adjustable back ties. Available in S, M and L.',
    difficulty: 'BEGINNER',
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK cotton on a 4 mm hook.',
    finishedSize: 'Available in S (75-80 cm bust), M (85-90 cm bust) and L (95-100 cm bust). The back ties adjust the fit by up to 8 cm.',
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet bralette', 'crochet bandeau top', 'crochet bra top'],
    glossaryTerms: [
      { slug: 'crochet-bandeau-g126', term: 'Bandeau', definition: 'A straight horizontal band worn across the chest without shoulder straps. Worked as a flat rectangle from the side seam and joined at the back with ties rather than a fixed seam.' },
      { slug: 'back-ties-g126', term: 'Back ties', definition: 'Two long dc chains worked from the back edges of the bralette. They wrap around the body and tie at the front or back, letting the wearer adjust the fit.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Crochet bralettes and bandeau tops are a popular modern summer pattern.',
    body: {
      type: 'doc', content: [
        p(t('Work the main panel as a flat dc rectangle at '), gt('crochet-bandeau-g126', 'bandeau'), t(' width. The panel covers the front and wraps partway around to the sides. Attach '), gt('back-ties-g126', 'back ties'), t(' at each back edge and tie to close.')),
        p(t('Size S: chain 80. Size M: chain 90. Size L: chain 100. Work dc for 15 cm in all sizes.')),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK cotton yarn', qty: '150 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Main panel'),
        p(t('Chain 80 (S), 90 (M) or 100 (L). Work dc for 15 cm. Fasten off.')),
        h2('Ties'),
        p(t('Work two 50 cm dc strips from the short back edges. These are the '), gt('back-ties-g126', 'back ties'), t('. Cross them at the back and bring to the front to tie.')),
        h2('What to try next'),
        p(t('The crochet lounge top adds a back panel for more coverage.')),
      ],
    },
  },

  // G127 -- crochet-wide-leg-lounge-trousers
  {
    slug: 'crochet-wide-leg-lounge-trousers',
    title: 'Wide-leg lounge trousers',
    excerpt: 'Wide-leg lounge trousers in aran yarn with a generous silhouette and elasticated waist. Worked as two flat panels seamed into leg tubes. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g127m.finishedMeasurements.bust} cm hip. Leg opening 70 cm. Inseam 74 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet wide leg lounge trousers', 'crochet palazzo trousers', 'crochet wide trousers'],
    glossaryTerms: [
      { slug: 'wide-leg-tube-g127', term: 'Wide leg tube', definition: 'A straight dc tube worked with no tapering from the ankle to the crotch. The same stitch count is maintained throughout the leg length, producing the wide silhouette.' },
      { slug: 'crotch-join-g127', term: 'Crotch join', definition: 'The point where both leg tubes are seamed together. A small dart is sewn at the inner front and inner back to give a smooth curve across the crotch.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Wide-leg trousers are a popular loungewear adaptation for crochet.',
    body: {
      type: 'doc', content: [
        p(t('Work each leg as a '), gt('wide-leg-tube-g127', 'wide leg tube'), t(' in dc, worked flat and seamed along the inner edge. Join both legs at the '), gt('crotch-join-g127', 'crotch'), t(' and add an elasticated waistband.')),
        p(t(`Size M: each leg tube 70 cm around, 74 cm inseam. Hip ${g127m.finishedMeasurements.bust} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '750 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Elastic, 3 cm wide', qty: 'waist + 5 cm' },
        ]),
        h2('Legs (make 2)'),
        p(t('Chain 100. Work dc for 74 cm. Seam inner edge to form the '), gt('wide-leg-tube-g127', 'wide leg tube'), t('.')),
        h2('Assembly'),
        p(t('Join both tubes at the '), gt('crotch-join-g127', 'crotch join'), t('. Work dc waistband for 8 cm. Fold and thread elastic.')),
        h2('What to try next'),
        p(t('The crochet jogger trousers use the same construction with a narrower tapered leg.')),
      ],
    },
  },

  // G128 -- crochet-crop-hoodie-top
  {
    slug: 'crochet-crop-hoodie-top',
    title: 'Cropped crochet hoodie',
    excerpt: 'A cropped drop shoulder hoodie in chunky yarn with a 35 cm body length and a large hood. Worked flat in two panels with a separate hood. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'chunky',
    hook: 'crochet-hook-6-0mm',
    gauge: '12 dc x 14 rows = 10 x 10 cm in chunky on a 6 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g128m.finishedMeasurements.bust} cm bust. Body length 35 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet crop hoodie', 'crochet cropped hooded top', 'chunky crop hoodie crochet'],
    glossaryTerms: [
      { slug: 'hood-panel-g128', term: 'Hood panel', definition: 'Two large dc rectangles worked to approximately 35 x 40 cm and seamed along the top edge. The lower edge is then attached around the neckline of the pullover.' },
      { slug: 'crop-length-g128', term: 'Crop length', definition: 'A garment body that ends above the hip, typically at or above the navel. This hoodie measures 35 cm from the shoulder seam to the hem.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Cropped hoodies are a popular modern crochet garment project.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back panels as flat dc rectangles at '), gt('crop-length-g128', 'crop length'), t(' (35 cm body). Seam shoulders and sides. Work sleeves flat and sew in. Make the '), gt('hood-panel-g128', 'hood'), t(' from two large dc rectangles seamed at the top and attached around the neck edge.')),
        p(t(`Size M: front ${g128m.frontStitches} sts wide. Bust ${g128m.finishedMeasurements.bust} cm. Body 35 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Chunky yarn', qty: '500 yards' },
          { name: '6 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Front and back (make 2)'),
        p(t(`Chain ${g128m.frontStitches + 2}. Work dc for 35 cm. Leave central 18 sts for the neck.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g128m.sleeveStitches + 2}. Work dc for 55 cm. Seam into a tube.`)),
        h2('Hood'),
        p(t('Work two 35 x 40 cm dc rectangles. Seam along the top edge to form the '), gt('hood-panel-g128', 'hood panel'), t('. Attach around the neck opening.')),
        h2('What to try next'),
        p(t('The oversized hoodie uses the same construction at hip length for more coverage.')),
      ],
    },
  },

  // G129 -- oversized-hoodie-crochet
  {
    slug: 'oversized-hoodie-crochet',
    title: 'Oversized crochet hoodie',
    excerpt: 'A hip-length oversized hoodie in chunky yarn with drop shoulder construction and a large hood. Generous ease throughout. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'chunky',
    hook: 'crochet-hook-6-0mm',
    gauge: '12 dc x 14 rows = 10 x 10 cm in chunky on a 6 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g129m.finishedMeasurements.bust} cm bust. Body length ${g129m.finishedMeasurements.length} cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['oversized hoodie crochet', 'crochet hooded sweatshirt', 'chunky crochet hoodie'],
    glossaryTerms: [
      { slug: 'oversized-ease-g129', term: 'Oversized ease', definition: 'A garment worked at a significantly larger measurement than the body. This hoodie is worked 15 to 20 cm wider than the body measurement to produce the relaxed boxy look.' },
      { slug: 'kangaroo-pocket-g129', term: 'Kangaroo pocket', definition: 'A single wide pocket worked on the front panel below the chest. A dc rectangle is sewn to the front with both side edges open. The wearer inserts both hands from either side.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Oversized hoodies are one of the most popular modern crochet garment projects.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back as flat dc rectangles with '), gt('oversized-ease-g129', 'oversized ease'), t('. Seam shoulders and sides. Work sleeves flat and sew in. Add a '), gt('kangaroo-pocket-g129', 'kangaroo pocket'), t(' on the front. Attach the hood.')),
        p(t(`Size M: front ${g129m.frontStitches} sts wide. Bust ${g129m.finishedMeasurements.bust} cm. Length ${g129m.finishedMeasurements.length} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Chunky yarn', qty: '750 yards' },
          { name: '6 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Front and back (make 2)'),
        p(t(`Chain ${g129m.frontStitches + 2}. Work dc for ${g129m.finishedMeasurements.length} cm. Leave central 18 sts for neck.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g129m.sleeveStitches + 2}. Work dc for 58 cm. Seam into a tube.`)),
        h2('Kangaroo pocket'),
        p(t('Work a 30 x 20 cm dc rectangle. Sew bottom and outer side edges to the front panel. Leave both inner side edges open for the '), gt('kangaroo-pocket-g129', 'kangaroo pocket'), t('.')),
        h2('Hood'),
        p(t('Work two 38 x 42 cm dc rectangles. Seam at the top edge. Attach around the neck opening.')),
        h2('What to try next'),
        p(t('The cropped crochet hoodie uses the same pattern at 35 cm body length.')),
      ],
    },
  },

  // G130 -- crochet-zip-hoodie-cardigan
  {
    slug: 'crochet-zip-hoodie-cardigan',
    title: 'Zip hoodie cardigan',
    excerpt: 'An open front hoodie cardigan in aran yarn with a zip or dc edge finish. Drop shoulder construction with a large hood. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE',
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g130m.finishedMeasurements.bust} cm bust. Length ${g130m.finishedMeasurements.length} cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['crochet zip hoodie', 'crochet open front hoodie', 'crochet hooded cardigan'],
    glossaryTerms: [
      { slug: 'dc-front-band-g130', term: 'Dc front band', definition: 'A narrow strip of dc rows worked along each open front edge. The bands neaten the edge and provide a firm base for sewing in a zip or leaving the front open.' },
      { slug: 'separating-zip-g130', term: 'Separating zip', definition: 'A zip with two separate bottom stops that allow the two fronts to come completely apart. The zip is sewn by hand along the inside of the dc front bands using a whip stitch.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Open front hooded cardigans are a popular modern crochet project.',
    body: {
      type: 'doc', content: [
        p(t('Work the back and two front panels as flat dc rectangles. Seam shoulders and sides. Work sleeves flat and sew in. Add a '), gt('dc-front-band-g130', 'dc front band'), t(' along each open front edge. Either sew in a '), gt('separating-zip-g130', 'separating zip'), t(' or leave the bands as a plain dc edge. Attach the hood.')),
        p(t(`Size M: back ${g130m.backStitches} sts wide. Bust ${g130m.finishedMeasurements.bust} cm. Length ${g130m.finishedMeasurements.length} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '700 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Separating zip (optional)', qty: '1, to match body length' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g130m.backStitches + 2}. Work dc for ${g130m.finishedMeasurements.length} cm.`)),
        h2('Front panels (make 2)'),
        p(t(`Chain ${Math.round(g130m.backStitches / 2) + 2}. Work dc for ${g130m.finishedMeasurements.length} cm.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g130m.sleeveStitches + 2}. Work dc for 56 cm. Seam into a tube.`)),
        h2('Front bands'),
        p(t('Work 4 rows of dc along each front edge for the '), gt('dc-front-band-g130', 'front band'), t('. If adding a zip, sew the '), gt('separating-zip-g130', 'separating zip'), t(' to the inner face of both bands.')),
        h2('Hood'),
        p(t('Work two 38 x 42 cm dc rectangles. Seam at the top edge. Attach around the neck opening.')),
        h2('What to try next'),
        p(t('The crochet dressing gown uses the same open front cardigan shape at full length.')),
      ],
    },
  },
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: '',
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    difficulty: pat.difficulty,
    sourceType: pat.sourceType,
    sourceNotes: pat.sourceNotes,
    techniqueSlugs: pat.techniqueSlugs,
    criticalTechniques: pat.criticalTechniques,
    aliases: pat.aliases,
    glossaryTerms: pat.glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: pat.yarnWeight,
      primaryHookSlug: pat.hook,
      gaugeText: pat.gauge,
      finishedSizeText: pat.finishedSize,
      terminologyConvention: 'uk',
      craftStitchSlugs: pat.stitchSlugs,
      craftTechniqueTags: pat.techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: pat.body,
  }
  writeFileSync(join(OUT, `${pat.slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${pat.slug}`)
}
console.log(`\nDone: ${PATTERNS.length} patterns`)
