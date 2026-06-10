/**
 * Generator: D-Garments Batch 7 -- Specialty constructions G61-G70
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch7.ts
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

// G61: poncho -- trapezoid front+back seamed at shoulders, DROP_SHOULDER, TUNIC, aran 5mm GENEROUS_15
const g61 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'TUNIC' })
const g61m = g61.find(g => g.size === 'M')!

// G62: cowl-neck pullover -- drop-shoulder, aran 5mm
const g62 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g62m = g62.find(g => g.size === 'M')!

// G63: turtleneck pullover -- drop-shoulder, aran 5mm
const g63 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g63m = g63.find(g => g.size === 'M')!

// G64: mock-neck pullover -- top-down yoke, dk 4mm
const g64 = gradeAllSizes([...W], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g64m = g64.find(g => g.size === 'M')!

// G65: cocoon cardigan -- drop-shoulder GENEROUS_15, aran 5mm, open front
const g65 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g65m = g65.find(g => g.size === 'M')!

// G66: cape-sleeve pullover -- drop-shoulder, TUNIC, dk 4mm
const g66 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g66m = g66.find(g => g.size === 'M')!

// G67: vest with ribbed side panels -- drop-shoulder VEST, aran 5mm
const g67 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g67m = g67.find(g => g.size === 'M')!

// G68: tunic with patch pockets -- drop-shoulder TUNIC, aran 5mm
const g68 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g68m = g68.find(g => g.size === 'M')!

// G69: split-hem tunic -- drop-shoulder TUNIC, aran 5mm
const g69 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g69m = g69.find(g => g.size === 'M')!

// G70: button-up vest -- drop-shoulder VEST, dk 4mm
const g70 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g70m = g70.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'crochet-poncho',
  title: 'Crochet poncho',
  subtitle: '',
  suffix: 'G61',
  excerpt: 'A roomy poncho made from two wide trapezoid panels seamed at the shoulders in aran yarn. No side seams. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g61m.finishedMeasurements.bust} cm across, tunic length.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet poncho pattern', 'two piece poncho crochet', 'seamed poncho aran'],
  glossaryTerms: [
    { slug: 'trapezoid-panel-g61', term: 'Trapezoid panel', definition: 'A rectangular piece that is wider at the hem than at the shoulder. For a poncho, front and back panels are near-rectangular. The wider hem falls freely without side seams.' },
    { slug: 'shoulder-seam-g61', term: 'Shoulder seam', definition: 'The join at the top of front and back panels. On a poncho, seaming leaves a wide neck opening in the centre and the arms pass through the open sides.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Two-piece seamed ponchos are a classic crochet garment. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work two identical wide '), gt('trapezoid-panel-g61', 'trapezoid panels'), t(': one for front and one for back. Each panel is worked flat from hem to shoulder. The panels are the same width across the full length, giving a relaxed rectangle shape.')),
      p(t(`Size M: each panel ${g61m.hemStitches} sts wide and ${g61m.finishedMeasurements.body} cm tall.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g61m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Front panel'),
      p(t(`Chain ${g61m.hemStitches + 2}. Work dc rows for ${g61m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Back panel'),
      p(t('Work as for the front panel. Both panels are identical.')),
      h2('Assembly'),
      p(t('Place front and back with right sides facing. Work a '), gt('shoulder-seam-g61', 'shoulder seam'), t(' across 20 cm at each top corner, leaving the central 20 to 25 cm open as the neck. The sides remain open below the seam. Weave in ends.')),
      h2('Neck and hem edging'),
      p(t('Work 1 round of dc around the neck opening and 1 round of dc along each hem edge.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same panels with side seams and a set sleeve.')),
    ],
  },
},
{
  slug: 'crochet-cowl-neck-pullover',
  title: 'Cowl neck pullover',
  subtitle: '',
  suffix: 'G62',
  excerpt: 'A drop-shoulder pullover in aran yarn with a deep draped cowl neck worked as extended rounds after joining. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g62m.finishedMeasurements.bust} cm bust. Cowl depth approximately 20 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cowl neck sweater crochet', 'draped neck pullover crochet', 'cowl collar jumper crochet'],
  glossaryTerms: [
    { slug: 'cowl-neck-g62', term: 'Cowl neck', definition: 'A wide extended neckline worked in rounds after the body is assembled. The extra rounds pile up at the neck and drape in soft folds around the collar.' },
    { slug: 'dc2tog-g62', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the neck opening before picking up stitches for the cowl.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cowl-neck pullovers are a classic garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work front, back, and sleeves as for a classic drop-shoulder pullover. Seam shoulders and sides. Pick up stitches around the neck opening and work the '), gt('cowl-neck-g62', 'cowl neck'), t(' in dc rounds for 20 cm. Use '), gt('dc2tog-g62', 'dc2tog'), t(' on the first round to ensure the neck sits snug before the cowl flares out.')),
      p(t(`Size M: ${g62m.hemStitches} sts wide body, ${g62m.finishedMeasurements.body} cm body, neck pick-up approximately ${g62m.neckStitches} sts.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g62m.yarnRequiredYards + 100} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Body and sleeves'),
      p(t(`Work back and front, each ${g62m.hemStitches} sts wide and ${g62m.finishedMeasurements.body} cm long. Work sleeves to ${g62m.finishedMeasurements.sleeve} cm. Seam shoulders and sides.`)),
      h2('Cowl'),
      p(t(`Pick up approximately ${g62m.neckStitches} sts around the neck opening. Work 1 round of `), gt('dc2tog-g62', 'dc2tog'), t(' to reduce by a few sts for a snug base. Then work plain dc rounds for 20 cm without further shaping. The cowl drapes naturally. Fasten off and weave in ends.')),
      h2('What to try next'),
      p(t('The turtleneck pullover uses the same base with a shorter, firmer neck finish in 1x1 rib.')),
    ],
  },
},
{
  slug: 'turtleneck-pullover-crochet',
  title: 'Turtleneck pullover',
  subtitle: '',
  suffix: 'G63',
  excerpt: 'A drop-shoulder pullover in aran yarn finished with a 10 cm 1x1 rib turtleneck worked in fpdc and bpdc. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g63m.finishedMeasurements.bust} cm bust. Turtleneck 10 cm deep.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['turtleneck sweater crochet', 'polo neck crochet pullover', 'high neck crochet jumper'],
  glossaryTerms: [
    { slug: 'turtleneck-g63', term: 'Turtleneck', definition: 'A close-fitting ribbed neck tube at least 10 cm deep that folds over itself. Also called a polo neck. Worked in rounds of 1x1 rib after the body is assembled.' },
    { slug: 'fpdc-g63', term: 'Front post double crochet', definition: 'A dc worked around the front of the post. Alternating fpdc and bpdc creates the raised rib texture used for the turtleneck.' },
    { slug: 'bpdc-g63', term: 'Back post double crochet', definition: 'A dc worked around the back of the post. The recessed counterpart to fpdc in the 1x1 rib turtleneck.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Turtleneck pullovers are a classic garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work front, back, and sleeves the same as the classic drop-shoulder pullover. Seam shoulders and sides. Pick up stitches around the neck and work the '), gt('turtleneck-g63', 'turtleneck'), t(' in 1x1 rib using alternating '), gt('fpdc-g63', 'fpdc'), t(' and '), gt('bpdc-g63', 'bpdc'), t(' for 20 cm of rib in total. The tube folds over to give the 10 cm visible turtleneck.')),
      p(t(`Size M: ${g63m.hemStitches} sts wide body, ${g63m.finishedMeasurements.body} cm body, neck pick-up approximately ${g63m.neckStitches} sts.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g63m.yarnRequiredYards + 80} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Body and sleeves'),
      p(t(`Work back and front, each ${g63m.hemStitches} sts wide and ${g63m.finishedMeasurements.body} cm long. Work sleeves to ${g63m.finishedMeasurements.sleeve} cm. Seam shoulders and sides.`)),
      h2('Turtleneck'),
      p(t(`Pick up approximately ${g63m.neckStitches} sts around the neck opening. Work 20 cm of 1x1 rib: alternate `), gt('fpdc-g63', 'fpdc'), t(' and '), gt('bpdc-g63', 'bpdc'), t(' every round. Fasten off. The tube folds in half to sit as a 10 cm turtleneck at the chin.')),
      h2('What to try next'),
      p(t('The cowl neck pullover uses the same body with a wide, loose neck that drapes rather than fitting close.')),
    ],
  },
},
{
  slug: 'mock-neck-pullover-crochet',
  title: 'Mock neck pullover',
  subtitle: '',
  suffix: 'G64',
  excerpt: 'A seamless top-down yoke pullover in DK yarn finished with a 5 cm 1x1 rib mock neck. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g64m.finishedMeasurements.bust} cm bust. Mock neck 5 cm deep.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['mock neck crochet pullover', 'funnel neck sweater crochet', 'short high neck crochet jumper'],
  glossaryTerms: [
    { slug: 'mock-neck-g64', term: 'Mock neck', definition: 'A short ribbed stand at the neck, typically 4 to 6 cm deep. Sits above the collarbone without folding over. Less bulky than a turtleneck.' },
    { slug: 'fpdc-g64', term: 'Front post double crochet', definition: 'A dc worked around the front of the post. Alternating fpdc and bpdc creates the raised rib for the mock neck.' },
    { slug: 'bpdc-g64', term: 'Back post double crochet', definition: 'A dc around the back of the post. The recessed stitch in the 1x1 rib mock neck.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Mock neck pullovers are a popular modern garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a seamless top-down yoke in DK in the round. Begin at the neck with '), gt('mock-neck-g64', 'mock neck'), t(' ribbing. Work 5 cm of 1x1 rib using alternating '), gt('fpdc-g64', 'fpdc'), t(' and '), gt('bpdc-g64', 'bpdc'), t(' before starting the yoke increases. Then continue the yoke and body as for a standard top-down yoke pullover.')),
      p(t(`Size M: cast on ${g64m.neckStitches} sts. Work 5 cm mock neck rib. Yoke ${g64m.yokeDepthRows} rows. Body ${g64m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g64m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Mock neck'),
      p(t(`Chain ${g64m.neckStitches + 2} and join in a round. Work 5 cm of 1x1 rib: `), gt('fpdc-g64', 'fpdc'), t(' and '), gt('bpdc-g64', 'bpdc'), t(' alternating each round.')),
      h2('Yoke'),
      p(t(`Increase evenly across the yoke over ${g64m.yokeDepthRows} rows to reach body stitch count at the underarm.`)),
      h2('Body and sleeves'),
      p(t(`Separate sleeve sts at the underarm. Work body in round for ${g64m.finishedMeasurements.body} cm. Work sleeves for ${g64m.finishedMeasurements.sleeve} cm. Fasten off.`)),
      h2('What to try next'),
      p(t('The turtleneck pullover starts the same way but works the neck tube to 20 cm so it folds over.')),
    ],
  },
},
{
  slug: 'cocoon-cardigan-crochet',
  title: 'Cocoon cardigan',
  subtitle: '',
  suffix: 'G65',
  excerpt: 'A very wide, shapeless open-front cardigan in aran yarn with no buttons and a generous 15 cm ease. No shaping. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g65m.finishedMeasurements.bust} cm bust with generous ease.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cocoon cardigan crochet', 'oversized open cardigan crochet', 'boxy open cardigan aran'],
  glossaryTerms: [
    { slug: 'cocoon-silhouette-g65', term: 'Cocoon silhouette', definition: 'A very wide, shapeless garment with no waist or bust shaping. The fabric hangs from the shoulders straight to the hem, creating a cocooning effect.' },
    { slug: 'drop-shoulder-g65', term: 'Drop shoulder', definition: 'A shoulder line where the sleeve join sits well below the natural shoulder point. On a cocoon cardigan, the sleeve seam may fall to the upper arm.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cocoon cardigans are a popular modern oversized garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This cardigan uses the '), gt('cocoon-silhouette-g65', 'cocoon silhouette'), t(': no waist shaping, no bust darts, no button bands. The front edges hang open. The '), gt('drop-shoulder-g65', 'drop shoulder'), t(' seam sits at the upper arm. Simply work three rectangles for back and two front halves, then short rectangles for the sleeves.')),
      p(t(`Size M: back ${g65m.hemStitches} sts wide and ${g65m.finishedMeasurements.body} cm tall. Each front half is ${Math.round(g65m.hemStitches / 2)} sts wide.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g65m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Back'),
      p(t(`Chain ${g65m.hemStitches + 2}. Work dc rows for ${g65m.finishedMeasurements.body} cm with no shaping. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g65m.hemStitches / 2) + 2}. Work dc for ${g65m.finishedMeasurements.body} cm. No neck shaping. Fasten off.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain to cuff width. Work dc for ${g65m.finishedMeasurements.sleeve} cm. No sleeve shaping. Fasten off.`)),
      h2('Assembly'),
      p(t('Seam shoulders and set sleeves. Leave sides fully open or seam for 10 cm at the hem for a slight taper. Weave in all ends.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan uses the same construction with a fitted waist and buttons.')),
    ],
  },
},
{
  slug: 'cape-sleeve-pullover-crochet',
  title: 'Cape-sleeve pullover',
  subtitle: '',
  suffix: 'G66',
  excerpt: 'A tunic-length pullover in DK yarn where the sleeves are wide flat cape panels rather than tubes, draping from the shoulder seam. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g66m.finishedMeasurements.bust} cm bust, tunic length. Cape panels approximately 30 cm wide at hem.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cape sleeve pullover crochet', 'butterfly sleeve sweater crochet', 'flat sleeve tunic crochet'],
  glossaryTerms: [
    { slug: 'cape-panel-g66', term: 'Cape panel', definition: 'A wide flat rectangle that replaces the sleeve tube. It attaches at the shoulder seam and hangs down over the arm rather than enclosing it. Gives a draped butterfly or batwing silhouette.' },
    { slug: 'dc2tog-g66', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck shaping on the front panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cape-sleeve and butterfly-sleeve pullovers are a popular modern garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back body panels as for a standard drop-shoulder tunic. Instead of sleeve tubes, work a '), gt('cape-panel-g66', 'cape panel'), t(' for each arm. Each cape panel is a wide rectangle that attaches along the shoulder seam. Use '), gt('dc2tog-g66', 'dc2tog'), t(' at the front neck edges.')),
      p(t(`Size M: body ${g66m.hemStitches} sts wide and ${g66m.finishedMeasurements.body} cm tall. Each cape panel is approximately 54 sts wide at the hem and 25 cm tall, tapering to 30 sts at the shoulder edge.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g66m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Body'),
      p(t(`Chain ${g66m.hemStitches + 2}. Work dc for ${g66m.finishedMeasurements.body} cm. Shape neck with `), gt('dc2tog-g66', 'dc2tog'), t(`. Work back panel identically without neck shaping.`)),
      h2('Cape panels (make 2)'),
      p(t('Chain 56 for size M (adjust for other sizes). Decrease 1 st each side every 5 rows for 25 cm until 30 sts remain at the shoulder edge. Fasten off.')),
      h2('Assembly'),
      p(t('Seam front to back at shoulders. Attach the narrow edge of each '), gt('cape-panel-g66', 'cape panel'), t(' along the shoulder seam. Seam body sides below the cape attachment. Weave in ends.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same body with sleeve tubes instead of cape panels.')),
    ],
  },
},
{
  slug: 'vest-with-ribbed-sides-crochet',
  title: 'Vest with ribbed side panels',
  subtitle: '',
  suffix: 'G67',
  excerpt: 'A drop-shoulder vest in aran yarn with vertical side panels worked in fpdc and bpdc 1x1 rib for a structured look. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g67m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['ribbed side vest crochet', 'panel vest crochet aran', 'vest fpdc bpdc rib sides'],
  glossaryTerms: [
    { slug: 'fpdc-g67', term: 'Front post double crochet', definition: 'A dc worked around the front of the post. Alternating fpdc and bpdc across a panel creates a firm, raised 1x1 rib texture.' },
    { slug: 'bpdc-g67', term: 'Back post double crochet', definition: 'A dc around the back of the post. The recessed stitch in the 1x1 rib side panels.' },
    { slug: 'side-panel-g67', term: 'Ribbed side panel', definition: 'A vertical strip of 1x1 fpdc/bpdc rib worked down the side of the body. Adds texture and a subtle shaping effect at the side seam.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Vests with structured side panels are a popular modern garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back panels in plain dc, reserving the outer 10 sts on each side for the '), gt('side-panel-g67', 'ribbed side panel'), t('. Work those outer sts in 1x1 rib using alternating '), gt('fpdc-g67', 'fpdc'), t(' and '), gt('bpdc-g67', 'bpdc'), t(' for every row. This gives a continuous rib strip down each side.')),
      p(t(`Size M: each panel ${g67m.hemStitches} sts wide total. Centre dc section ${g67m.hemStitches - 20} sts. Side rib sections 10 sts each side. Body ${g67m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g67m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g67m.hemStitches + 2}. Row 1: dc across. From row 2, work 10 sts in 1x1 rib (`), gt('fpdc-g67', 'fpdc'), t('/'), gt('bpdc-g67', 'bpdc'), t(`), dc across centre ${g67m.hemStitches - 20} sts, then 10 sts rib. Continue for ${g67m.finishedMeasurements.body} cm.`)),
      h2('Front panel'),
      p(t('Work as for back. Shape the neck opening in the centre top section. Fasten off.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work dc edging around each armhole. Weave in ends.')),
      h2('What to try next'),
      p(t('The drop-shoulder vest uses the same shape in plain dc across the full width.')),
    ],
  },
},
{
  slug: 'crochet-tunic-with-pockets',
  title: 'Tunic with patch pockets',
  subtitle: '',
  suffix: 'G68',
  excerpt: 'A drop-shoulder tunic in aran yarn with two patch pockets sewn at hip level on the front panel. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g68m.finishedMeasurements.bust} cm bust, ${g68m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet tunic with pockets', 'patch pocket tunic crochet', 'tunic with hip pockets crochet'],
  glossaryTerms: [
    { slug: 'patch-pocket-g68', term: 'Patch pocket', definition: 'A pocket made as a separate flat square and sewn onto the surface of the garment. No opening is cut into the body; the pocket sits flush on top.' },
    { slug: 'dc2tog-g68', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the neck opening at the top of the front panel.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Patch pockets are a universal garment detail. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work the tunic body as a standard drop-shoulder build. Work two '), gt('patch-pocket-g68', 'patch pockets'), t(' separately as 15 x 15 cm dc squares. Sew them to the front panel at hip level, one on each side of the centre, leaving the top edge open. Use '), gt('dc2tog-g68', 'dc2tog'), t(' at the front neck opening.')),
      p(t(`Size M: front panel ${g68m.hemStitches} sts wide and ${g68m.finishedMeasurements.body} cm tall. Pocket placement: 8 cm above hem, 6 cm from each side.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g68m.yarnRequiredYards + 60} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Body and sleeves'),
      p(t(`Work back ${g68m.hemStitches} sts wide for ${g68m.finishedMeasurements.body} cm. Work front the same, shaping neck with `), gt('dc2tog-g68', 'dc2tog'), t(`. Work sleeves for ${g68m.finishedMeasurements.sleeve} cm. Seam.`)),
      h2('Patch pockets (make 2)'),
      p(t('Chain 22. Work dc for 15 cm. Work 1 round of dc edging around all four sides. Fasten off.')),
      h2('Sewing pockets'),
      p(t('Pin each '), gt('patch-pocket-g68', 'patch pocket'), t(' to the front panel at the hip. Using the tapestry needle, whip stitch around three sides, leaving the top edge open. Weave in ends.')),
      h2('What to try next'),
      p(t('The split-hem tunic uses the same base with slit vents at each side instead of patch pockets.')),
    ],
  },
},
{
  slug: 'split-hem-tunic-crochet',
  title: 'Split-hem tunic',
  subtitle: '',
  suffix: 'G69',
  excerpt: 'A drop-shoulder tunic in aran yarn with a side slit vent 15 cm deep at each hem, giving ease of movement and a relaxed look. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g69m.finishedMeasurements.bust} cm bust, ${g69m.finishedMeasurements.body} cm body with 15 cm side vents.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['split hem tunic crochet', 'side slit tunic crochet', 'vent hem crochet sweater'],
  glossaryTerms: [
    { slug: 'side-vent-g69', term: 'Side vent', definition: 'An opening left at the hem of each side seam for a set distance. The front and back panels are not joined at the lower hem, leaving a slit that allows freer movement.' },
    { slug: 'dc2tog-g69', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the front neck opening to narrow the neckline before the shoulder seam.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Side-vent tunics are a classic garment style applied to crochet. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back body panels as for a standard drop-shoulder tunic. When seaming the sides, begin the seam 15 cm above the hem and work up to the underarm, leaving the lower 15 cm of each side unjoined as a '), gt('side-vent-g69', 'side vent'), t('. Finish each vent edge with a dc edging. Use '), gt('dc2tog-g69', 'dc2tog'), t(' at the front neck.')),
      p(t(`Size M: panels ${g69m.hemStitches} sts wide and ${g69m.finishedMeasurements.body} cm tall. Side seam begins ${Math.round(16 * 1.5)} rows up from hem (approximately 15 cm).`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g69m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Measuring tape', qty: '1' },
      ]),
      h2('Body and sleeves'),
      p(t(`Work back and front panels, each ${g69m.hemStitches} sts wide and ${g69m.finishedMeasurements.body} cm tall. Shape the front neck with `), gt('dc2tog-g69', 'dc2tog'), t(`. Work sleeves for ${g69m.finishedMeasurements.sleeve} cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders. For each side, begin the seam at the underarm and sew down to 15 cm above the hem. Leave the lower 15 cm open as a '), gt('side-vent-g69', 'side vent'), t('. Work dc edging along each open vent edge.')),
      h2('Sleeves'),
      p(t('Set sleeves as normal. Weave in all ends.')),
      h2('What to try next'),
      p(t('The tunic with patch pockets uses the same body with hip pockets added to the front instead of vents.')),
    ],
  },
},
{
  slug: 'crochet-button-up-vest',
  title: 'Button-up vest',
  subtitle: '',
  suffix: 'G70',
  excerpt: 'A drop-shoulder vest in DK yarn with a button band on both front edges and 5 buttons. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g70m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['button up vest crochet', 'crochet waistcoat dk', 'buttoned vest crochet pattern'],
  glossaryTerms: [
    { slug: 'button-band-g70', term: 'Button band', definition: 'A narrow strip of rib or dc worked along the front edge of a cardigan or vest. One side carries the buttons, the other has buttonholes spaced to match.' },
    { slug: 'dc2tog-g70', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck shaping on each front panel.' },
    { slug: 'fpdc-g70', term: 'Front post double crochet', definition: 'A dc worked around the front of the post. Used in the button band rib for a firm, neat edge.' },
    { slug: 'bpdc-g70', term: 'Back post double crochet', definition: 'A dc around the back of the post. The recessed stitch in the button band rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Button-up vests are a classic garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels in plain dc as for a standard drop-shoulder vest. Use '), gt('dc2tog-g70', 'dc2tog'), t(' at the front neck edges. After seaming, work a '), gt('button-band-g70', 'button band'), t(' along each front edge using '), gt('fpdc-g70', 'fpdc'), t(' and '), gt('bpdc-g70', 'bpdc'), t(' 1x1 rib. On the left band, work 5 evenly spaced buttonholes by chaining 2 and skipping 2 sts.')),
      p(t(`Size M: back ${g70m.hemStitches} sts wide and ${g70m.finishedMeasurements.body} cm tall. Each front half ${Math.round(g70m.hemStitches / 2)} sts wide. Button band 5 sts wide, 5 buttons spaced evenly.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g70m.yarnRequiredYards + 80} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: '2 cm buttons', qty: '5' },
      ]),
      h2('Back'),
      p(t(`Chain ${g70m.hemStitches + 2}. Work dc for ${g70m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g70m.hemStitches / 2) + 2}. Work dc for ${g70m.finishedMeasurements.body} cm. Shape neck with `), gt('dc2tog-g70', 'dc2tog'), t('. Fasten off.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work dc edging around armholes.')),
      h2('Button bands'),
      p(t('Work 5 sts of 1x1 rib ('), gt('fpdc-g70', 'fpdc'), t('/'), gt('bpdc-g70', 'bpdc'), t(') along the right front edge for the button band. Work the left front edge the same but on the 3rd band row, work 5 evenly spaced buttonholes: ch 2, skip 2. Sew buttons to the right band to match. Weave in ends.')),
      h2('What to try next'),
      p(t('The drop-shoulder vest uses the same base without the button bands for a sleeveless pullover vest.')),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: pat.subtitle ?? '',
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'garments',
    difficulty: pat.difficulty,
    sourceType: 'SYNTHESISED',
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
