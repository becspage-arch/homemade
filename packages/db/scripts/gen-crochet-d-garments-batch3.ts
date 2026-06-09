/**
 * Generator: D-Garments Batch 3 -- Men's garments (G21-G30)
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch3.ts
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

const MENS_SIZES = ['M-XS', 'M-S', 'M-M', 'M-L', 'M-XL', 'M-2XL', 'M-3XL'] as const

// Pre-compute grading for each pattern
const g21 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_6', garmentType: 'PULLOVER' })
const g21m = g21.find(g => g.size === 'M-M')!

const g22 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'TOP_DOWN_RAGLAN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g22m = g22.find(g => g.size === 'M-M')!

const g23 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g23m = g23.find(g => g.size === 'M-M')!

const g24 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g24m = g24.find(g => g.size === 'M-M')!

const g25 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'BOTTOM_UP_SET_IN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g25m = g25.find(g => g.size === 'M-M')!

const g26 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 12, rowsPer10cm: 14 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g26m = g26.find(g => g.size === 'M-M')!

const g27 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g27m = g27.find(g => g.size === 'M-M')!

const g28 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'PULLOVER' })
const g28m = g28.find(g => g.size === 'M-M')!

const g29 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g29m = g29.find(g => g.size === 'M-M')!

const g30 = gradeAllSizes([...MENS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'TUNIC' })
const g30m = g30.find(g => g.size === 'M-M')!

const PATTERNS = [
{
  slug: 'mens-drop-shoulder-pullover',
  title: "Men's drop-shoulder pullover",
  subtitle: "A relaxed-fit men's pullover with drop shoulders in aran yarn.",
  excerpt: "A relaxed-fit men's pullover worked flat from hem to shoulder. Drop-shoulder shape with no armhole shaping. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g21m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's crochet pullover", "men's drop shoulder sweater crochet", 'crochet jumper men'],
  glossaryTerms: [
    { slug: 'drop-shoulder-g21', term: 'Drop shoulder', definition: 'A construction where the sleeve is attached without any armhole or shoulder shaping. The sleeve top sits below the natural shoulder point. Simple to crochet and gives a relaxed, wide fit.' },
    { slug: 'tension-square-g21', term: 'Tension square', definition: 'A test swatch worked before starting the main piece. It confirms that your stitches match the stated gauge, so the finished garment comes out the right size.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Drop-shoulder construction is a standard garment method.',
  body: {
    type: 'doc', content: [
      p(t('The '), gt('drop-shoulder-g21', 'drop shoulder'), t(` shape is the easiest men's pullover construction. Work back and front as flat rectangles. Check your gauge first with a `), gt('tension-square-g21', 'tension square'), t('. Seam the shoulders, join the sides, and set in the sleeves.')),
      p(t(`Size M-M: ${g21m.hemStitches} sts wide, body ${g21m.finishedMeasurements.body} cm, bust ${g21m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g21m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g21m.hemStitches + 2}. Work dc rows for ${g21m.finishedMeasurements.body} cm. Shape neck by working each shoulder separately. Fasten off.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g21m.sleeveCuffStitches + 2}. Increase 1 st each end every 6 rows to ${g21m.sleeveBicepStitches} sts. Work even to ${g21m.finishedMeasurements.sleeve} cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Set sleeves into the side opening. Seam side and sleeve seams.')),
      h2('What to try next'),
      p(t("The men's raglan pullover uses a top-down seamless approach with no seams to sew.")),
    ],
  },
},
{
  slug: 'mens-raglan-pullover',
  title: "Men's raglan pullover",
  subtitle: "A top-down seamless raglan pullover for men in aran yarn.",
  excerpt: "A seamless top-down raglan pullover for men. Four raglan lines grow from neck to underarm. No seaming. Graded M-XS to M-3XL.",
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g22m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's raglan pullover crochet", 'raglan sweater men crochet', 'seamless crochet pullover men'],
  glossaryTerms: [
    { slug: 'raglan-g22', term: 'Raglan line', definition: 'A diagonal column of increases running from the neck to the underarm. Four raglan lines grow the yoke outward, separating the sleeves from the body.' },
    { slug: 'magic-ring-g22', term: 'Magic ring', definition: 'A method of starting work in the round without a hole at the centre. The tail yarn is pulled tight to close the opening after the first round of stitches.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down raglan construction is a widely published seamless garment method.',
  body: {
    type: 'doc', content: [
      p(t('Start at the neck with a '), gt('magic-ring-g22', 'magic ring'), t(` or a foundation chain joined into a ring. Place stitch markers at the four `), gt('raglan-g22', 'raglan lines'), t(`. Increase at each marker every other round for ${g22m.yokeDepthRows} rounds.`)),
      p(t(`Size M-M: neck cast-on ${g22m.neckStitches} sts, yoke ${g22m.yokeDepthRows} rounds, body ${g22m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g22m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '4' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g22m.neckStitches} sts in ring. Place 4 raglan markers. Increase at each marker every other round for ${g22m.yokeDepthRows} rounds.`)),
      h2('Body and sleeves'),
      p(t(`Separate ${g22m.sleeveBicepStitches} sleeve sts on holders. Work body in round: ${g22m.bustStitches} sts to ${g22m.finishedMeasurements.body} cm. Work each sleeve to ${g22m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses the same drop-shoulder shape sewn from flat pieces instead.")),
    ],
  },
},
{
  slug: 'mens-drop-shoulder-cardigan',
  title: "Men's drop-shoulder cardigan",
  subtitle: "A relaxed-fit men's open cardigan with drop shoulders in aran yarn.",
  excerpt: "A relaxed men's cardigan worked flat in aran yarn. Drop-shoulder shape. Button bands added after. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g23m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's crochet cardigan", 'crochet open cardigan men', "men's crochet jacket"],
  glossaryTerms: [
    { slug: 'button-band-g23', term: 'Button band', definition: 'A strip of fabric crocheted along each front edge. One band carries the buttons; the other has button holes. Adds a neat finished edge and a fastening.' },
    { slug: 'dc-rib-g23', term: 'Dc rib', definition: 'A ribbed edge worked in dc into the back loops only. Gives a stretchy band at the hem and cuffs.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Men's cardigans are a standard garment type.",
  body: {
    type: 'doc', content: [
      p(t('Work back as one piece, and the two front halves separately. Add '), gt('dc-rib-g23', 'dc rib'), t(' at hem and cuffs. Seam shoulders and sleeves. Pick up stitches along each front edge to work the '), gt('button-band-g23', 'button bands'), t('.')),
      p(t(`Size M-M: back ${g23m.hemStitches} sts, each front half approx ${Math.round(g23m.hemStitches / 2)} sts, body ${g23m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g23m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '7' },
      ]),
      h2('Back'),
      p(t(`Chain ${g23m.hemStitches + 2}. Work dc rows for ${g23m.finishedMeasurements.body} cm. Work each shoulder separately. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g23m.hemStitches / 2) + 2}. Work to match back length. Shape neck at top.`)),
      h2('Sleeves and assembly'),
      p(t('Work sleeves. Seam shoulders. Set sleeves. Seam sides. Work dc rib hem and cuffs. Add '), gt('button-band-g23', 'button bands'), t(' along front edges.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses the same shape with a closed front.")),
    ],
  },
},
{
  slug: 'mens-vest',
  title: "Men's vest",
  subtitle: "A sleeveless men's pullover vest in aran yarn.",
  excerpt: "A sleeveless men's vest in aran yarn. Worked flat as back and front panels. Simple V-neck or round neck. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g24m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's crochet vest", 'sleeveless jumper crochet men', 'crochet waistcoat men'],
  glossaryTerms: [
    { slug: 'armhole-vest-g24', term: 'Armhole edge', definition: 'The curved or straight edge at the top side of the vest where a sleeve would normally be attached. On a vest, the armhole is finished with a neat border row instead.' },
    { slug: 'dc2tog-g24', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the V-neck and armhole edges on the vest.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Men's vests are a standard garment style.",
  body: {
    type: 'doc', content: [
      p(t('Work back and front as flat panels. Shape the '), gt('armhole-vest-g24', 'armhole edges'), t(' at each top side. Use '), gt('dc2tog-g24', 'dc2tog'), t(' to narrow toward the shoulder. Seam shoulders and sides.')),
      p(t(`Size M-M: ${g24m.hemStitches} sts wide, body ${g24m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g24m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g24m.hemStitches + 2}. Work dc rows to armhole. Shape `), gt('armhole-vest-g24', 'armhole edges'), t(`: cast off 4 sts each side, then `), gt('dc2tog-g24', 'dc2tog'), t(` each end for 3 rows. Work to shoulder.`)),
      h2('Front'),
      p(t('Work as back to armhole. Shape armhole as back. Shape V-neck by splitting work at centre and working each side separately.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work a dc border around armhole and neck edges.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder cardigan adds sleeves and a button front to the same flat construction.")),
    ],
  },
},
{
  slug: 'mens-set-in-sleeve-pullover',
  title: "Men's set-in sleeve pullover",
  subtitle: "A more fitted men's pullover with shaped set-in sleeves in aran yarn.",
  excerpt: "A fitted men's pullover with set-in sleeve shaping. Armhole and sleeve-cap curves give a closer arm fit. Graded M-XS to M-3XL.",
  difficulty: 'ADVANCED',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g25m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ["men's fitted pullover crochet", 'set in sleeve sweater men crochet', 'crochet tailored jumper men'],
  glossaryTerms: [
    { slug: 'sleeve-cap-g25', term: 'Sleeve cap', definition: 'The curved section at the top of a set-in sleeve, shaped by gradual decreases. It fits into the curved armhole of the body, giving the sleeve a close fit at the shoulder.' },
    { slug: 'dc2tog-g25', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape both the armhole curve and the sleeve cap.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Set-in sleeve construction is the classic tailored garment shape.',
  body: {
    type: 'doc', content: [
      p(t('Work back, front, and each sleeve separately. Each piece has shaped armhole curves and a '), gt('sleeve-cap-g25', 'sleeve cap'), t('. Use '), gt('dc2tog-g25', 'dc2tog'), t(' for all curve shaping.')),
      p(t(`Size M-M: ${g25m.hemStitches} sts wide, body ${g25m.finishedMeasurements.body} cm, armhole depth ${g25m.yokeDepthRows} rows.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g25m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g25m.hemStitches + 2}. Work dc rows to underarm. Shape armhole: cast off 4 sts each side, `), gt('dc2tog-g25', 'dc2tog'), t(` each end for 3 rows. Work to shoulder.`)),
      h2('Sleeves'),
      p(t(`Chain ${g25m.sleeveCuffStitches + 2}. Work to ${g25m.finishedMeasurements.sleeve} cm. Shape `), gt('sleeve-cap-g25', 'sleeve cap'), t(': cast off 4 sts each end, then decrease each end every row to match armhole depth.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses the same pieces with no armhole shaping, and is much faster to make.")),
    ],
  },
},
{
  slug: 'mens-ribbed-pullover',
  title: "Men's ribbed pullover",
  subtitle: "A men's pullover with an all-over ribbed texture in chunky yarn.",
  excerpt: "A men's pullover worked in an all-over back-loop-only rib. Chunky yarn gives clear texture. Drop-shoulder shape. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '12 dc x 14 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g26m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's ribbed crochet jumper", 'crochet rib stitch pullover men', 'chunky crochet sweater men'],
  glossaryTerms: [
    { slug: 'blo-rib-g26', term: 'BLO rib', definition: 'Rows of dc worked through the back loop only. Because the front loops stay visible on the right side, this creates a raised vertical line texture that looks similar to knit rib.' },
    { slug: 'turning-chain-g26', term: 'Turning chain', definition: 'A chain worked at the end of a row before turning to work back. On a dc row, the turning chain counts as one stitch to keep the edge straight.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'BLO rib is a standard crochet texture technique.',
  body: {
    type: 'doc', content: [
      p(t('Work every row in '), gt('blo-rib-g26', 'BLO rib'), t(' (dc through back loop only). The '), gt('turning-chain-g26', 'turning chain'), t(` keeps edges neat. Work back, front, and sleeves flat, then seam.`)),
      p(t(`Size M-M: ${g26m.hemStitches} sts, body ${g26m.finishedMeasurements.body} cm, chest ${g26m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Chunky yarn', qty: `${g26m.yarnRequiredYards} yards` },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g26m.hemStitches + 2}. Work `), gt('blo-rib-g26', 'BLO rib'), t(` for ${g26m.finishedMeasurements.body} cm. Shape neck. Fasten off.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g26m.sleeveCuffStitches + 2}. Increase to ${g26m.sleeveBicepStitches} sts. Work even to ${g26m.finishedMeasurements.sleeve} cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders, set sleeves, seam sides.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses plain dc for a smoother finish.")),
    ],
  },
},
{
  slug: 'mens-open-cardigan',
  title: "Men's open cardigan",
  subtitle: "A lightweight men's open-front cardigan with no buttons.",
  excerpt: "A men's open-front cardigan in aran yarn. No buttons or button bands -- the front edges hang open. Drop-shoulder shape. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g27m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's open front cardigan crochet", 'crochet drape cardigan men', 'crochet open jacket men'],
  glossaryTerms: [
    { slug: 'open-front-g27', term: 'Open front', definition: 'A cardigan where both front edges are simply finished with a border row and left without a button fastening. The fronts hang loosely.' },
    { slug: 'dc-border-g27', term: 'Dc border', definition: 'A single row of dc worked along the front edges and neck to give a tidy, stable finish.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open-front cardigans are a modern garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work back, two front halves, and sleeves flat. Seam together. Work a '), gt('dc-border-g27', 'dc border'), t(' along each '), gt('open-front-g27', 'open front'), t(' edge to finish without buttons.')),
      p(t(`Size M-M: back ${g27m.hemStitches} sts, body ${g27m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g27m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g27m.hemStitches + 2}. Work dc for ${g27m.finishedMeasurements.body} cm. Shape shoulders.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g27m.hemStitches / 2) + 2}. Work to match back. Shape neck at top.`)),
      h2('Sleeves and assembly'),
      p(t('Work sleeves. Seam. Work '), gt('dc-border-g27', 'dc border'), t(' along front and neck edges.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder cardigan adds button bands to the same base shape.")),
    ],
  },
},
{
  slug: 'mens-oversized-hoodie',
  title: "Men's oversized hoodie",
  subtitle: "A very relaxed men's pullover hoodie in aran yarn.",
  excerpt: "A very relaxed men's pullover hoodie. Drop-shoulder shape with an attached hood worked as a flat panel. Graded M-XS to M-3XL.",
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g28m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's crochet hoodie", 'crochet hooded sweater men', 'oversized hoodie crochet'],
  glossaryTerms: [
    { slug: 'hood-panel-g28', term: 'Hood panel', definition: 'A large flat rectangle folded in half along the top edge and seamed to form the hood shape. The lower open edge is then seamed to the neck opening of the body.' },
    { slug: 'kangaroo-pocket-g28', term: 'Kangaroo pocket', definition: 'A large front pocket worked as a separate flat panel and seamed to the front body along the lower and side edges, with the top left open.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Hooded drop-shoulder sweaters are a standard garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the body as a drop-shoulder pullover with generous ease. Work the '), gt('hood-panel-g28', 'hood panel'), t(' separately as a rectangle, fold and seam the top, then attach the open lower edge around the neck. Add a '), gt('kangaroo-pocket-g28', 'kangaroo pocket'), t(' on the front if desired.')),
      p(t(`Size M-M: body ${g28m.finishedMeasurements.bust} cm chest, ${g28m.finishedMeasurements.body} cm long.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g28m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Cord for drawstring', qty: '1.5 m' },
      ]),
      h2('Body'),
      p(t(`Work back and front as flat rectangles, ${g28m.hemStitches} sts wide. Seam shoulders and sides.`)),
      h2('Hood'),
      p(t(`Chain approx ${Math.round(g28m.finishedMeasurements.bust / 2)}. Work dc rows to approx 35 cm. Fold in half. Seam the top edge to form the `), gt('hood-panel-g28', 'hood panel'), t('. Attach to neck opening.')),
      h2('Sleeves and pocket'),
      p(t('Work sleeves. Set in. Optionally add a '), gt('kangaroo-pocket-g28', 'kangaroo pocket'), t(' on the front.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses the same base without the hood.")),
    ],
  },
},
{
  slug: 'mens-cotton-tee',
  title: "Men's cotton tee",
  subtitle: "A lightweight men's short-sleeve top in cotton DK yarn.",
  excerpt: "A lightweight short-sleeve tee for men in cotton DK yarn. Drop-shoulder shape with short sleeves. Good for warm weather. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in cotton DK on a 4 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g29m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's crochet t-shirt", 'crochet summer top men', "men's cotton crochet top"],
  glossaryTerms: [
    { slug: 'cotton-yarn-g29', term: 'Cotton yarn', definition: 'A plant-fibre yarn with little stretch. It gives a firm fabric with good stitch definition. Cotton is cooler to wear than wool, making it good for warm-weather garments.' },
    { slug: 'short-sleeve-g29', term: 'Short sleeve', definition: 'A sleeve ending above the elbow, usually 15 to 20 cm long from the underarm.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Lightweight cotton tees are a standard summer garment.',
  body: {
    type: 'doc', content: [
      p(t('Use '), gt('cotton-yarn-g29', 'cotton yarn'), t(` for a breathable summer top. Work back and front flat. Add `), gt('short-sleeve-g29', 'short sleeves'), t(` worked as small rectangles.`)),
      p(t(`Size M-M: ${g29m.hemStitches} sts wide, body ${g29m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Cotton DK yarn', qty: `${g29m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g29m.hemStitches + 2}. Work dc for ${g29m.finishedMeasurements.body} cm. Shape neck.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g29m.sleeveBicepStitches + 2}. Work dc for 18 cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Set '), gt('short-sleeve-g29', 'short sleeves'), t('. Seam sides and sleeve seams.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses heavier yarn for a year-round version of the same shape.")),
    ],
  },
},
{
  slug: 'mens-tunic-pullover',
  title: "Men's tunic-length pullover",
  subtitle: "A longer-body men's pullover reaching below the hip.",
  excerpt: "A men's pullover with an extended body reaching below the hip. Drop-shoulder shape in aran yarn. Graded M-XS to M-3XL.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded M-XS to M-3XL. Size M-M: ${g30m.finishedMeasurements.bust} cm chest, ${g30m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["men's tunic crochet", 'longline crochet jumper men', 'crochet longline pullover men'],
  glossaryTerms: [
    { slug: 'tunic-length-g30', term: 'Tunic length', definition: `A body that extends below the hip, typically 70 to 80 cm from shoulder to hem. Size M-M is ${g30m.finishedMeasurements.body} cm in this pattern.` },
    { slug: 'side-slit-g30', term: 'Side slit', definition: 'A short opening at the hem of each side seam, usually 8 to 10 cm, that allows easier movement with the longer body.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Longline men's pullovers are a contemporary garment style.",
  body: {
    type: 'doc', content: [
      p(t('Work the same as the men\'s drop-shoulder pullover but extend the body to '), gt('tunic-length-g30', 'tunic length'), t(`. Leave `, ), gt('side-slit-g30', 'side slits'), t(` open at the hem for ease of movement.`)),
      p(t(`Size M-M: ${g30m.hemStitches} sts wide, body ${g30m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M-M)', [
        { name: 'Aran yarn', qty: `${g30m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g30m.hemStitches + 2}. Work dc rows for ${g30m.finishedMeasurements.body} cm. Shape neck. Leave lower 8 cm of each side unseamed for a `), gt('side-slit-g30', 'side slit'), t('.')),
      h2('Sleeves and assembly'),
      p(t('Work sleeves. Seam shoulders. Set sleeves. Seam sides above slits.')),
      h2('What to try next'),
      p(t("The men's drop-shoulder pullover uses the same shape at standard body length.")),
    ],
  },
},
]

for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: pat.subtitle,
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
