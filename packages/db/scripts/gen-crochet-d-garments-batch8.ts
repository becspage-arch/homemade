/**
 * Generator: D-Garments Batch 8 -- Wraps, shawls, and shrug styles G71-G80
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch8.ts
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

// G71 rectangle wrap shawl: one size, use TUNIC for grading reference (not really size-graded but useful for stitch reference)
const g71 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'GENEROUS_15', garmentType: 'TUNIC', options: { yarnWeightCategory: 3 } })
const g71m = g71.find(g => g.size === 'M')!

// G72 triangle shawl: one size, similar reference
const g72 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'GENEROUS_15', garmentType: 'TUNIC', options: { yarnWeightCategory: 3 } })
const g72m = g72.find(g => g.size === 'M')!

// G73 basic shrug: VEST shape
const g73 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST', options: { yarnWeightCategory: 3 } })
const g73m = g73.find(g => g.size === 'M')!

// G74 long-sleeve shrug: VEST shape
const g74 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST', options: { yarnWeightCategory: 3 } })
const g74m = g74.find(g => g.size === 'M')!

// G75 bolero: CARDIGAN shape
const g75 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN', options: { yarnWeightCategory: 3 } })
const g75m = g75.find(g => g.size === 'M')!

// G76 summer cover-up: TUNIC shape
const g76 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'GENEROUS_15', garmentType: 'TUNIC', options: { yarnWeightCategory: 3 } })
const g76m = g76.find(g => g.size === 'M')!

// G77 oversized scarf wrap: one size, aran 5mm reference
const g77 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'TUNIC' })
const g77m = g77.find(g => g.size === 'M')!

// G78 kimono cardigan: aran 5mm
const g78 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g78m = g78.find(g => g.size === 'M')!

// G79 longline vest: VEST aran to DK 4mm
const g79 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST', options: { yarnWeightCategory: 3 } })
const g79m = g79.find(g => g.size === 'M')!

// G80 granny square poncho: TUNIC aran 5mm
const g80 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'TUNIC' })
const g80m = g80.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'rectangle-wrap-shawl-crochet',
  title: 'Rectangle wrap shawl',
  subtitle: 'A large moss stitch rectangle worn as a wrap.',
  suffix: 'G71',
  excerpt: 'A wide rectangle shawl in DK worked in moss stitch throughout. Worn draped over the shoulders or wrapped across the body. One size.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook. Moss stitch gauge: 18 sts = 10 cm.',
  finishedSize: 'One size: 60 cm wide x 200 cm long.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['rectangle shawl crochet', 'wrap shawl dk crochet', 'moss stitch shawl'],
  glossaryTerms: [
    { slug: 'moss-stitch-g71', term: 'Moss stitch', definition: 'An alternating pattern of a dc and a ch-1 space, worked into the spaces of the previous row. Creates an even textured fabric with a slight drape.' },
    { slug: 'drape-g71', term: 'Drape', definition: 'The way a finished fabric hangs. A shawl with good drape falls softly from the shoulders rather than holding a stiff shape.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Rectangle shawls in moss stitch are a classic beginner-friendly crochet accessory pattern.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('moss-stitch-g71', 'moss stitch'), t(' throughout. The finished rectangle measures 60 cm wide and 200 cm long, giving enough length to wrap the body once with both ends draping at the front. Good '), gt('drape-g71', 'drape'), t(' makes it comfortable to wear all day.')),
      p(t('Chain 109 (108 sts in moss stitch pattern). Work moss stitch rows until the piece measures 200 cm. Fasten off and weave in ends.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '800 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 109. Row 1: dc in 4th ch from hook, (ch 1, skip 1, dc) to end. Turn.')),
      h2('Moss stitch body'),
      p(t('Row 2: ch 2, (dc into ch-1 sp, ch 1) to last sp, dc into last sp. Turn. Repeat row 2 until piece measures 200 cm.')),
      h2('Finishing'),
      p(t('Fasten off. Add a simple dc edging around all four edges if desired. Weave in all ends.')),
      h2('What to try next'),
      p(t('The triangle shawl uses the same yarn weight but grows from a single top point to a wide curved hem.')),
    ],
  },
},
{
  slug: 'triangle-shawl-crochet',
  title: 'Triangle shawl',
  subtitle: 'Worked from the top down, increasing to a wide hem.',
  suffix: 'G72',
  excerpt: 'A classic triangle shawl in DK yarn worked from the top centre point down. Increases at each edge and at the centre spine create the triangle shape. One size.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: 'One size: approximately 160 cm along the top edge x 70 cm depth at centre.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['triangle shawl crochet', 'top down shawl crochet', 'dk shawl beginner'],
  glossaryTerms: [
    { slug: 'spine-increase-g72', term: 'Spine increase', definition: 'Two dc worked into the same centre stitch to add width at the midpoint of the shawl. Placed on every row to keep the triangle growing symmetrically.' },
    { slug: 'edge-increase-g72', term: 'Edge increase', definition: 'Two dc worked into the first and last stitches of the row. Combined with the spine increase, edge increases create the classic triangle shape.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down triangle shawls are one of the most popular beginner shawl constructions.',
  body: {
    type: 'doc', content: [
      p(t('Start at the top centre point and increase on every row. Work a '), gt('spine-increase-g72', 'spine increase'), t(' at the midpoint and an '), gt('edge-increase-g72', 'edge increase'), t(' at each side on every right-side row. The shawl grows by 4 stitches per row.')),
      p(t('Begin with 5 sts. Work increases every row until the top edge measures 160 cm. Fasten off.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Starting point'),
      p(t('Chain 6. Row 1: dc in 4th ch from hook, dc, 2 dc in last ch (5 sts). Turn.')),
      h2('Increase rows'),
      p(t('Row 2: ch 3, 2 dc in first st, dc to centre st, '), gt('spine-increase-g72', '2 dc in centre st'), t(', dc to last st, '), gt('edge-increase-g72', '2 dc in last st'), t('. Turn. Repeat row 2 until length is reached.')),
      h2('Border'),
      p(t('Work 1 round of dc around all three sides of the triangle. Fasten off and weave in ends.')),
      h2('What to try next'),
      p(t('The rectangle wrap shawl uses the same DK yarn in a flat moss stitch rectangle construction.')),
    ],
  },
},
{
  slug: 'crochet-shrug-basic',
  title: 'Basic crochet shrug',
  subtitle: 'A rectangle sewn into a shrug with short sleeve openings.',
  suffix: 'G73',
  excerpt: 'A simple crochet shrug made from a flat rectangle sewn at each end to form sleeves. No shaping required. DK yarn. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g73m.finishedMeasurements.bust} cm across, sleeve seam approximately 20 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['basic shrug crochet', 'rectangle shrug crochet', 'beginner shrug crochet'],
  glossaryTerms: [
    { slug: 'shrug-seam-g73', term: 'Shrug seam', definition: 'The seam sewn along each short end of the rectangle, creating the sleeve tubes. The centre of the rectangle drapes across the back.' },
    { slug: 'back-panel-g73', term: 'Back panel', definition: 'The central unstitched section of the rectangle that sits across the upper back. Its width determines how much of the back is covered.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Rectangle shrugs are a classic beginner garment construction.',
  body: {
    type: 'doc', content: [
      p(t('Work a plain dc rectangle, then fold it in half lengthways and sew a '), gt('shrug-seam-g73', 'shrug seam'), t(' along each short end, leaving the centre open as the '), gt('back-panel-g73', 'back panel'), t('. The sleeves form where the seams are stitched.')),
      p(t(`Size M: rectangle ${g73m.finishedMeasurements.bust} cm wide x 60 cm long. Seam 20 cm at each end.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g73m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Rectangle'),
      p(t(`Chain ${g73m.hemStitches + 2}. Work dc for 60 cm. Fasten off.`)),
      h2('Assembly'),
      p(t('Fold the rectangle in half. Sew '), gt('shrug-seam-g73', 'a seam'), t(' along 20 cm at each short end. The remaining 20 cm at each end forms the sleeve opening. The centre section spans the '), gt('back-panel-g73', 'back panel'), t('.')),
      h2('Edging'),
      p(t('Work 1 round of dc around each sleeve opening and along the back centre edge.')),
      h2('What to try next'),
      p(t('The long-sleeve shrug uses the same rectangle method with a longer piece for extended sleeves.')),
    ],
  },
},
{
  slug: 'long-sleeve-shrug-crochet',
  title: 'Long-sleeve shrug',
  subtitle: 'A rectangle shrug with sleeves extending to the wrist.',
  suffix: 'G74',
  excerpt: 'A crochet shrug made from a longer rectangle with sleeves reaching to the wrist. Same seaming method as the basic shrug. DK yarn. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g74m.finishedMeasurements.bust} cm across, sleeve seam approximately 50 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['long sleeve shrug crochet', 'full sleeve shrug crochet', 'wrist length shrug crochet'],
  glossaryTerms: [
    { slug: 'wrist-seam-g74', term: 'Wrist-length seam', definition: 'A seam running the full sleeve length of the rectangle, bringing the sleeve from the shoulder to the wrist. Longer than the basic shrug seam.' },
    { slug: 'cuff-edging-g74', term: 'Cuff edging', definition: 'A round of dc or a short ribbed strip worked around the sleeve opening at the wrist end to neaten the edge and add a little structure.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Long-sleeve rectangle shrugs are a popular cold-weather layering garment.',
  body: {
    type: 'doc', content: [
      p(t('Work a dc rectangle long enough for full-length sleeves. Fold in half and sew a '), gt('wrist-seam-g74', 'wrist-length seam'), t(' at each end, leaving the centre open for the back. Add '), gt('cuff-edging-g74', 'cuff edging'), t(' at each sleeve opening.')),
      p(t(`Size M: rectangle ${g74m.finishedMeasurements.bust} cm wide x 120 cm long. Seam 50 cm at each end.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g74m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Rectangle'),
      p(t(`Chain ${g74m.hemStitches + 2}. Work dc for 120 cm. Fasten off.`)),
      h2('Assembly'),
      p(t('Fold in half. Sew '), gt('wrist-seam-g74', 'a seam'), t(' along 50 cm at each short end. The centre 20 cm spans the back.')),
      h2('Cuff edging'),
      p(t('Work 1 round of dc around each sleeve opening. For added structure, work a 5-row rib strip and join it as '), gt('cuff-edging-g74', 'cuff edging'), t('.')),
      h2('What to try next'),
      p(t('The basic shrug is the same construction with shorter sleeve seams.')),
    ],
  },
},
{
  slug: 'bolero-crochet',
  title: 'Crochet bolero',
  subtitle: 'A short cropped open-front jacket ending above the waist.',
  suffix: 'G75',
  excerpt: 'A cropped open-front bolero jacket in DK yarn ending above the natural waist. Drop-shoulder construction with short sleeves. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g75m.finishedMeasurements.bust} cm bust, body ending at 30 cm from shoulder.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bolero crochet', 'cropped jacket crochet', 'short open cardigan crochet'],
  glossaryTerms: [
    { slug: 'bolero-length-g75', term: 'Bolero length', definition: 'A body ending above the natural waist, typically 28 to 32 cm from the shoulder seam. The front edges remain open and the hem is above the waistband of a skirt or trousers.' },
    { slug: 'dc2tog-g75', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the rounded front neckline of the bolero.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Bolero jackets are a classic fashion garment style adapted to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work a back and two front panels to '), gt('bolero-length-g75', 'bolero length'), t(', stopping at 30 cm from the shoulder. Apply '), gt('dc2tog-g75', 'dc2tog'), t(' at the front neck corners to round them slightly. Seam shoulders and sides. Add short sleeves.')),
      p(t(`Size M: ${g75m.hemStitches} sts wide across the back, body 30 cm. Each front panel is half the back width.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g75m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g75m.hemStitches + 2}. Work dc for 30 cm. Shape neck. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g75m.hemStitches / 2) + 2}. Work dc for 25 cm. `), gt('dc2tog-g75', 'Dc2tog'), t(' at inner neck edge for 5 cm. Fasten off.')),
      h2('Sleeves (make 2)'),
      p(t('Chain to sleeve sts. Work dc for 20 cm. Fasten off. Set in sleeves and seam.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan extends the same front-open construction to full hip length.')),
    ],
  },
},
{
  slug: 'summer-cover-up-crochet',
  title: 'Summer cover-up',
  subtitle: 'A hip-length open-front beach cover-up in cotton DK.',
  suffix: 'G76',
  excerpt: 'A hip-length open-front cover-up in cotton DK with an open stitchwork body. Lightweight and airy for beach or poolside wear. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in cotton DK on a 4 mm hook. Open stitch: 18 sts = 10 cm.',
  finishedSize: `Graded XS to 3XL. Size M: ${g76m.finishedMeasurements.bust} cm bust, ${g76m.finishedMeasurements.body} cm body length.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['beach cover up crochet', 'summer top crochet', 'open stitch cover up crochet'],
  glossaryTerms: [
    { slug: 'open-stitch-g76', term: 'Open stitchwork', definition: 'A stitch pattern combining dc or treble groups with ch spaces. Creates a fabric that allows light to pass through, suitable for beach cover-ups and warm weather layers.' },
    { slug: 'cotton-dk-g76', term: 'Cotton DK', definition: 'A double-knit weight yarn spun from cotton fibres. Cooler against the skin than wool and suited to warm-weather garments. Takes longer to dry than synthetic yarns.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open-stitch beach cover-ups in cotton yarn are a popular summer garment.',
  body: {
    type: 'doc', content: [
      p(t('Use '), gt('cotton-dk-g76', 'cotton DK'), t(' throughout. Work the body and front panels in an '), gt('open-stitch-g76', 'open stitchwork'), t(' pattern, alternating treble clusters with ch-2 spaces. The open fabric makes the garment cool to wear.')),
      p(t(`Size M: ${g76m.hemStitches} sts wide, body ${g76m.finishedMeasurements.body} cm long. Work front panels as separate open-front halves.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: `${g76m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g76m.hemStitches + 2}. Work open stitch rows for ${g76m.finishedMeasurements.body} cm. Shape neck. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g76m.hemStitches / 2) + 2}. Work open stitch rows for ${g76m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Finishing'),
      p(t('Seam at shoulders and sides. Add a dc edging around all edges.')),
      h2('What to try next'),
      p(t('The bolero uses the same open-front shape in a cropped length for year-round wear.')),
    ],
  },
},
{
  slug: 'oversized-scarf-wrap-crochet',
  title: 'Oversized scarf wrap',
  subtitle: 'A very long wide scarf worn as a body wrap in aran.',
  suffix: 'G77',
  excerpt: 'An oversized scarf in aran yarn wide enough to wrap around the shoulders and long enough to cross at the front. No shaping. One size.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: 'One size: 50 cm wide x 250 cm long.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['oversized scarf crochet', 'wrap scarf aran crochet', 'blanket scarf crochet'],
  glossaryTerms: [
    { slug: 'blanket-scarf-g77', term: 'Blanket scarf', definition: 'An oversized scarf wide and long enough to wrap over the shoulders like a shawl. Typically 45 to 60 cm wide and at least 200 cm long.' },
    { slug: 'fringe-g77', term: 'Fringe', definition: 'Short strands of yarn knotted through the short ends of a scarf. Cut lengths of yarn, fold in half, and pull through with a hook to attach.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Oversized blanket scarves worn as wraps are a popular cold-weather accessory.',
  body: {
    type: 'doc', content: [
      p(t('Work a wide dc rectangle in aran for a '), gt('blanket-scarf-g77', 'blanket scarf'), t(' that doubles as a wrap. Add '), gt('fringe-g77', 'fringe'), t(' along both short ends to finish. No increases or shaping at any point.')),
      p(t('Chain 71 (70 sts). Work dc for 250 cm. Fasten off and add fringe.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '700 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Scarf body'),
      p(t('Chain 71. Row 1: dc in 3rd ch from hook, dc to end (70 sts). Turn. Row 2: ch 2, dc to end. Turn. Repeat row 2 until 250 cm.')),
      h2('Fringe'),
      p(t('Cut 25 cm lengths of yarn in bundles of 4. Attach '), gt('fringe-g77', 'fringe'), t(' every 5 sts along each short end. Trim to even length.')),
      h2('What to try next'),
      p(t('The rectangle wrap shawl uses the same flat rectangle in DK for a lighter fabric.')),
    ],
  },
},
{
  slug: 'kimono-cardigan-crochet',
  title: 'Kimono cardigan',
  subtitle: 'A kimono-style open cardigan with wide drop sleeves in aran.',
  suffix: 'G78',
  excerpt: 'A kimono-style open cardigan with wide drop shoulders and minimal shaping in aran yarn. Long wide sleeves and an open front with no buttons. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g78m.finishedMeasurements.bust} cm bust, ${g78m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['kimono cardigan crochet', 'wide sleeve cardigan crochet', 'kimono jacket crochet'],
  glossaryTerms: [
    { slug: 'kimono-sleeve-g78', term: 'Kimono sleeve', definition: 'A wide rectangular sleeve set at a very deep drop shoulder. The sleeve is a rectangle, not tapered, and hangs loose from the body.' },
    { slug: 'dc2tog-g78', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the V-neckline to shape the front opening of the kimono cardigan.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Kimono-style cardigans are a modern crochet garment adaptation of the traditional Japanese silhouette.',
  body: {
    type: 'doc', content: [
      p(t('Work a back and two front panels with a wide set for the '), gt('kimono-sleeve-g78', 'kimono sleeves'), t('. Apply '), gt('dc2tog-g78', 'dc2tog'), t(' at the inner front edge to create the V opening. Seam shoulders and sides at the narrow points only.')),
      p(t(`Size M: back ${g78m.hemStitches} sts, body ${g78m.finishedMeasurements.body} cm. Kimono sleeves are wide rectangles attached at the deep drop shoulder.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g78m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g78m.hemStitches + 2}. Work dc for ${g78m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g78m.hemStitches / 2) + 2}. Work dc for ${Math.round(g78m.finishedMeasurements.body * 0.9)} cm. `), gt('dc2tog-g78', 'Dc2tog'), t(' at inner neck edge. Fasten off. Seam shoulders.')),
      h2('Kimono sleeves (make 2)'),
      p(t('Chain to sleeve width. Work plain dc rectangle for sleeve length. Attach at the wide drop shoulder seam.')),
      h2('What to try next'),
      p(t('The long oversized cardigan uses the same open-front body with a standard sleeve set.')),
    ],
  },
},
{
  slug: 'crochet-vest-longline',
  title: 'Longline crochet vest',
  subtitle: 'A sleeveless drop-shoulder vest ending at the hip in DK.',
  suffix: 'G79',
  excerpt: 'A longline sleeveless vest in DK yarn ending at the hip. Drop-shoulder construction with armhole edging. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g79m.finishedMeasurements.bust} cm bust, ${g79m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['longline vest crochet', 'hip length vest crochet', 'sleeveless top crochet dk'],
  glossaryTerms: [
    { slug: 'longline-vest-g79', term: 'Longline vest', definition: 'A sleeveless garment extending to the hip rather than the waist. The additional length makes it work as a light layering piece over a long-sleeve top or shirt.' },
    { slug: 'dc2tog-g79', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the armhole and neck openings on both body panels.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Longline vests are a popular layering garment in DK yarn.',
  body: {
    type: 'doc', content: [
      p(t('Work a back and front panel to '), gt('longline-vest-g79', 'longline vest'), t(' hip length. Use '), gt('dc2tog-g79', 'dc2tog'), t(' to shape the neck and armhole on each panel. Finish the armhole openings with a round of dc edging after seaming.')),
      p(t(`Size M: ${g79m.hemStitches} sts wide, body ${g79m.finishedMeasurements.body} cm long.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g79m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g79m.hemStitches + 2}. Work dc for ${g79m.finishedMeasurements.body} cm. `), gt('dc2tog-g79', 'Dc2tog'), t(' at armhole and neck. Seam shoulders and sides.')),
      h2('Armhole edging'),
      p(t('Work 1 round of dc around each armhole. Work a dc neckband of 3 rounds.')),
      h2('What to try next'),
      p(t('The drop-shoulder pullover adds full-length sleeves to the same two-panel body.')),
    ],
  },
},
{
  slug: 'granny-square-poncho-crochet',
  title: 'Granny square poncho',
  subtitle: 'A poncho assembled from large granny squares in aran.',
  suffix: 'G80',
  excerpt: 'A poncho assembled from four large granny squares in aran yarn. Two squares joined at the shoulder seam for the front and back, then joined at the sides. One size fits most.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook. Granny square: 30 cm x 30 cm per square.',
  finishedSize: `Graded XS to 3XL reference. Size M: ${g80m.finishedMeasurements.bust} cm bust approx. Poncho is one-size-fits-most at 60 cm across.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-treble'],
  aliases: ['granny square poncho crochet', 'poncho granny square aran', 'square poncho crochet'],
  glossaryTerms: [
    { slug: 'granny-square-g80', term: 'Granny square', definition: 'A square motif worked from the centre out in rounds. Each round adds a layer of treble clusters and ch-2 corner spaces. A large granny square for a poncho is typically 28 to 32 cm across.' },
    { slug: 'join-as-you-go-g80', term: 'Join-as-you-go', definition: 'A method of attaching granny squares to each other during the final round of each square rather than sewing them together afterwards. Creates a flat join with no visible seam.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Granny square ponchos are a classic crochet garment construction using motif assembly.',
  body: {
    type: 'doc', content: [
      p(t('Work four large '), gt('granny-square-g80', 'granny squares'), t(' each 30 cm across. Join two squares along one edge using '), gt('join-as-you-go-g80', 'join-as-you-go'), t(' for the front panel and two more for the back panel. Seam front and back at each shoulder, leaving a central neck opening. Join the side edges, leaving armhole gaps at each side.')),
      p(t(`Four squares total. Each 30 cm x 30 cm. Neck opening approximately 30 cm wide. Side seams leave 20 cm armholes.`)),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: `${g80m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Granny squares (make 4)'),
      p(t('Round 1: magic ring, 12 dc, sl st to join. Round 2: ch 3, 2 tr in same sp, (ch 2, 3 tr, ch 2, 3 tr) at each corner. Sl st. Continue adding rounds until square measures 30 cm.')),
      h2('Assembly'),
      p(t('Join two squares for front with '), gt('join-as-you-go-g80', 'join-as-you-go'), t(' on the final round. Repeat for back. Seam front and back at shoulders. Join side edges, leaving 20 cm armhole gaps.')),
      h2('Neck edging'),
      p(t('Work 2 rounds of dc around the neck opening to neaten.')),
      h2('What to try next'),
      p(t('The granny square cardigan uses the same motif construction with front panels and a button band.')),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: (pat as any).subtitle ?? '',
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
