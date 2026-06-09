/**
 * Generator: D-Garments Batch 4 -- Children's and baby garments (G31-G40)
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch4.ts
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

const KIDS_SIZES = ['K-2', 'K-4', 'K-6', 'K-8', 'K-10', 'K-12', 'K-14'] as const
const BABY_SIZES = ['B-NB', 'B-3M', 'B-6M', 'B-12M', 'B-18M', 'B-24M'] as const

// Pre-compute grading for each pattern
const g31 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g31m = g31.find(g => g.size === 'K-6')!

const g32 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g32m = g32.find(g => g.size === 'K-6')!

const g33 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_6', garmentType: 'PULLOVER' })
const g33m = g33.find(g => g.size === 'K-6')!

const g34 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g34m = g34.find(g => g.size === 'K-6')!

const g35 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'TOP_DOWN_RAGLAN', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g35m = g35.find(g => g.size === 'K-6')!

const g36 = gradeAllSizes([...BABY_SIZES], { constructionShape: 'TOP_DOWN_YOKE', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g36m = g36.find(g => g.size === 'B-6M')!

const g37 = gradeAllSizes([...BABY_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN', options: { yarnWeightCategory: 3 } })
const g37m = g37.find(g => g.size === 'B-6M')!

const g38 = gradeAllSizes([...BABY_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER', options: { yarnWeightCategory: 3 } })
const g38m = g38.find(g => g.size === 'B-6M')!

const g39 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g39m = g39.find(g => g.size === 'K-6')!

const g40 = gradeAllSizes([...KIDS_SIZES], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'TANK', options: { yarnWeightCategory: 3 } })
const g40m = g40.find(g => g.size === 'K-6')!

const PATTERNS = [
{
  slug: 'kids-drop-shoulder-pullover',
  title: "Kids' drop-shoulder pullover",
  subtitle: "A relaxed-fit children's pullover with drop shoulders in aran yarn.",
  excerpt: "A simple drop-shoulder pullover for children in aran yarn. Worked flat and seamed. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g31m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's crochet pullover", "kids' crochet sweater", 'crochet jumper children'],
  glossaryTerms: [
    { slug: 'drop-shoulder-g31', term: 'Drop shoulder', definition: 'A garment shape with no armhole shaping. The sleeve sits below the natural shoulder point. The simplest sleeve construction for a beginner.' },
    { slug: 'ease-g31', term: 'Ease', definition: 'The extra fabric added to a body measurement to produce the finished garment size. Children\'s patterns include enough ease for comfortable movement and growth.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's drop-shoulder pullovers are a standard beginner garment.",
  body: {
    type: 'doc', content: [
      p(t('A good first garment project. The '), gt('drop-shoulder-g31', 'drop shoulder'), t(' shape means no armhole shaping at all. Build in '), gt('ease-g31', 'ease'), t(` to allow for movement and a little growing room.`)),
      p(t(`Size K-6: ${g31m.hemStitches} sts wide, body ${g31m.finishedMeasurements.body} cm, bust ${g31m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g31m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g31m.hemStitches + 2}. Work dc for ${g31m.finishedMeasurements.body} cm. Shape neck: work each shoulder separately for a few rows. Fasten off.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g31m.sleeveCuffStitches + 2}. Increase 1 st each end every 5 rows to ${g31m.sleeveBicepStitches} sts. Work to ${g31m.finishedMeasurements.sleeve} cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Set sleeves. Seam sides and sleeve seams.')),
      h2('What to try next'),
      p(t("The kids' raglan pullover uses the same yarn but is worked seamlessly from the neck down.")),
    ],
  },
},
{
  slug: 'kids-cardigan',
  title: "Kids' cardigan",
  subtitle: "An easy children's drop-shoulder cardigan in aran yarn.",
  excerpt: "A simple drop-shoulder cardigan for children in aran yarn. Worked flat with button bands added after. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g32m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's crochet cardigan", "kids' crochet jacket", 'crochet button cardigan children'],
  glossaryTerms: [
    { slug: 'button-band-g32', term: 'Button band', definition: 'A strip crocheted along each front edge. One band has buttons; the other has button holes. Gives a tidy edge and a way to close the front.' },
    { slug: 'neck-shaping-g32', term: 'Neck shaping', definition: 'Gradually casting off stitches at the top of the front panels to form a curved or V-shaped opening for the head.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's cardigans are a standard beginner garment.",
  body: {
    type: 'doc', content: [
      p(t('Work back as one piece, two front halves, and sleeves. Seam together. Add '), gt('button-band-g32', 'button bands'), t('. Use simple '), gt('neck-shaping-g32', 'neck shaping'), t(' at each front top.')),
      p(t(`Size K-6: back ${g32m.hemStitches} sts wide, body ${g32m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g32m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '1.5 cm buttons', qty: '5' },
      ]),
      h2('Back'),
      p(t(`Chain ${g32m.hemStitches + 2}. Work dc for ${g32m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g32m.hemStitches / 2) + 2}. Work to match back. Apply `), gt('neck-shaping-g32', 'neck shaping'), t(' at the top inner edge.')),
      h2('Assembly'),
      p(t('Seam shoulders, set sleeves, seam sides. Work '), gt('button-band-g32', 'button bands'), t(' along front edges.')),
      h2('What to try next'),
      p(t("The kids' drop-shoulder pullover uses the same shape with a closed front.")),
    ],
  },
},
{
  slug: 'kids-hoodie',
  title: "Kids' hoodie",
  subtitle: "A cosy children's pullover hoodie in aran yarn.",
  excerpt: "A drop-shoulder pullover hoodie for children in aran yarn. Hood worked as a flat panel. Graded K-2 to K-14.",
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g33m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's crochet hoodie", "kids' hooded crochet sweater", 'crochet hood jumper children'],
  glossaryTerms: [
    { slug: 'hood-seam-g33', term: 'Hood seam', definition: 'The seam along the top of a folded hood panel that closes the hood. The lower open edge is then joined all around the neck opening of the body.' },
    { slug: 'drawstring-channel-g33', term: 'Drawstring channel', definition: 'A row worked along the front face edge of the hood that forms a small tunnel for threading a cord. The cord can then be pulled to tighten the hood opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's hoodies are a popular garment style.",
  body: {
    type: 'doc', content: [
      p(t('Work the body as a drop-shoulder pullover. Work the hood as a flat rectangle, fold in half, and close with a '), gt('hood-seam-g33', 'hood seam'), t('. Attach to the neck. Add a '), gt('drawstring-channel-g33', 'drawstring channel'), t(' along the face edge if desired.')),
      p(t(`Size K-6: body ${g33m.finishedMeasurements.bust} cm chest, ${g33m.finishedMeasurements.body} cm long.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g33m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Cord for drawstring', qty: '1 m' },
      ]),
      h2('Body'),
      p(t(`Work back and front flat, ${g33m.hemStitches} sts wide, ${g33m.finishedMeasurements.body} cm. Seam shoulders and sides.`)),
      h2('Hood'),
      p(t(`Chain approx ${Math.round(g33m.finishedMeasurements.bust / 2)}. Work dc for approx 28 cm. Fold. Work `), gt('hood-seam-g33', 'hood seam'), t('. Attach to neck.')),
      h2('Sleeves and finish'),
      p(t('Work and set sleeves. Add '), gt('drawstring-channel-g33', 'drawstring channel'), t(' if desired.')),
      h2('What to try next'),
      p(t("The kids' drop-shoulder pullover uses the same body shape without the hood.")),
    ],
  },
},
{
  slug: 'kids-vest',
  title: "Kids' vest",
  subtitle: "A simple sleeveless children's vest in DK yarn.",
  excerpt: "A sleeveless vest for children in DK yarn. Worked flat as back and front panels with armhole and neck finishing. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g34m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's crochet vest", "kids' sleeveless jumper crochet", 'crochet tank top children'],
  glossaryTerms: [
    { slug: 'armhole-finish-g34', term: 'Armhole finish', definition: 'A border row of dc or slip stitch worked around the armhole edge after seaming the shoulders. This gives a neat finished edge.' },
    { slug: 'dc2tog-g34', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the shoulder area and shape the neck edges.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's vests are a beginner-friendly garment type.",
  body: {
    type: 'doc', content: [
      p(t('Work back and front flat. Use '), gt('dc2tog-g34', 'dc2tog'), t(' to shape the neck and shoulders. Seam shoulders and sides. Finish the armhole edge with an '), gt('armhole-finish-g34', 'armhole finish'), t('.')),
      p(t(`Size K-6: ${g34m.hemStitches} sts wide, body ${g34m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'DK yarn', qty: `${g34m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g34m.hemStitches + 2}. Work dc for ${g34m.finishedMeasurements.body} cm. Shape armhole at each top side with `), gt('dc2tog-g34', 'dc2tog'), t('. Shape neck.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work '), gt('armhole-finish-g34', 'armhole finish'), t(' and neck border.')),
      h2('What to try next'),
      p(t("The kids' drop-shoulder pullover adds sleeves to the same flat panel construction.")),
    ],
  },
},
{
  slug: 'kids-raglan-pullover',
  title: "Kids' raglan pullover",
  subtitle: "A seamless top-down raglan pullover for children in aran yarn.",
  excerpt: "A seamless top-down raglan pullover for children. Four raglan lines grow the yoke from neck to underarm. No seaming. Graded K-2 to K-14.",
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g35m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's raglan crochet", 'seamless crochet pullover kids', 'raglan jumper children crochet'],
  glossaryTerms: [
    { slug: 'raglan-marker-g35', term: 'Raglan marker', definition: 'A stitch marker placed at each of the four raglan points. These mark where the yoke increases happen on every other round.' },
    { slug: 'yoke-g35', term: 'Yoke', definition: 'The upper section of a top-down seamless pullover, from the neck to the underarm. The yoke is worked in one piece before the sleeves and body are separated.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down raglan construction is a widely published seamless method.',
  body: {
    type: 'doc', content: [
      p(t('Start at the neck. Place '), gt('raglan-marker-g35', 'raglan markers'), t(` at the four raglan points. Work the `), gt('yoke-g35', 'yoke'), t(`, increasing at each marker every other round for ${g35m.yokeDepthRows} rounds.`)),
      p(t(`Size K-6: neck cast-on ${g35m.neckStitches} sts, yoke ${g35m.yokeDepthRows} rounds, body ${g35m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g35m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '4' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g35m.neckStitches} sts in ring. Place `), gt('raglan-marker-g35', 'raglan markers'), t(`. Increase at each every other round for ${g35m.yokeDepthRows} rounds.`)),
      h2('Body and sleeves'),
      p(t(`Separate sleeve sts. Body: ${g35m.bustStitches} sts, work to ${g35m.finishedMeasurements.body} cm. Sleeves: ${g35m.sleeveBicepStitches} sts each, work to ${g35m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t("The kids' drop-shoulder pullover uses flat panels and seams rather than seamless construction.")),
    ],
  },
},
{
  slug: 'baby-yoke-pullover',
  title: 'Baby yoke pullover',
  subtitle: 'A seamless top-down yoke pullover for babies in DK yarn.',
  excerpt: 'A seamless top-down circular yoke pullover for babies in DK yarn. Worked in the round from neck to hem. Graded NB to 24 months.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded NB to 24 months. Size 6M: ${g36m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['baby crochet pullover', 'newborn yoke sweater crochet', 'baby circular yoke crochet'],
  glossaryTerms: [
    { slug: 'circular-yoke-g36', term: 'Circular yoke', definition: 'A wide disc of fabric worked in the round. It forms the neck, shoulders, and sleeve tops all in one piece before the body and sleeves are separated.' },
    { slug: 'snap-button-g36', term: 'Snap button', definition: 'A press stud fastener sewn to the shoulder or neckline of a baby garment to make it easy to put on over a large baby head.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Baby yoke pullovers are a standard beginner baby garment.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('circular-yoke-g36', 'circular yoke'), t(` in DK yarn for a lightweight baby pullover. Add snap shoulder openings using `), gt('snap-button-g36', 'snap buttons'), t(` so the neck is easy to get over a baby's head.`)),
      p(t(`Size 6M: neck cast-on ${g36m.neckStitches} sts, yoke ${g36m.yokeDepthRows} rounds, chest ${g36m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size 6M)', [
        { name: 'DK yarn (soft baby yarn)', qty: `${g36m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '8' },
        { name: 'Snap buttons', qty: '2' },
      ]),
      h2('Yoke'),
      p(t(`Cast on ${g36m.neckStitches} sts. Work `), gt('circular-yoke-g36', 'circular yoke'), t(` increasing 6 sts every other round for ${g36m.yokeIncreaseRows} rounds.`)),
      h2('Body and sleeves'),
      p(t(`Separate ${g36m.sleeveBicepStitches} sleeve sts on holders each side. Work body: ${g36m.bustStitches} sts to ${g36m.finishedMeasurements.body} cm. Work each sleeve to ${g36m.finishedMeasurements.sleeve} cm.`)),
      h2('What to try next'),
      p(t('The baby cardigan uses the same yarn worked flat with button fastenings instead.')),
    ],
  },
},
{
  slug: 'baby-cardigan',
  title: 'Baby cardigan',
  subtitle: 'A simple drop-shoulder cardigan for babies in DK yarn.',
  excerpt: 'A simple drop-shoulder cardigan for babies in DK yarn. Worked flat with button bands. Graded NB to 24 months.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded NB to 24 months. Size 6M: ${g37m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['baby crochet cardigan', 'newborn crochet jacket', 'baby button cardigan crochet'],
  glossaryTerms: [
    { slug: 'flat-seam-g37', term: 'Flat seam', definition: 'A seam worked with a tapestry needle and yarn, laying both pieces side by side and picking up one stitch from each edge alternately. Gives a very flat join suitable for baby garments.' },
    { slug: 'button-loop-g37', term: 'Button loop', definition: 'A small chain loop attached to the front edge of the cardigan, used instead of a buttonhole worked into the band. Easy to add at any point.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Baby cardigans are a standard beginner baby garment.',
  body: {
    type: 'doc', content: [
      p(t('Work back, two front halves, and sleeves flat. Join with a '), gt('flat-seam-g37', 'flat seam'), t(' for comfort against baby skin. Add dc button bands and '), gt('button-loop-g37', 'button loops'), t(' as fastenings.')),
      p(t(`Size 6M: back ${g37m.hemStitches} sts, body ${g37m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size 6M)', [
        { name: 'DK yarn (soft baby yarn)', qty: `${g37m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '1 cm buttons', qty: '4' },
      ]),
      h2('Back'),
      p(t(`Chain ${g37m.hemStitches + 2}. Work dc for ${g37m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front halves and sleeves'),
      p(t(`Chain ${Math.round(g37m.hemStitches / 2) + 2} each. Work to match back. Work sleeves to ${g37m.finishedMeasurements.sleeve} cm.`)),
      h2('Assembly'),
      p(t('Join with '), gt('flat-seam-g37', 'flat seams'), t('. Add dc button bands with '), gt('button-loop-g37', 'button loops'), t('.')),
      h2('What to try next'),
      p(t('The baby yoke pullover uses the same yarn for a seamless version with no front opening.')),
    ],
  },
},
{
  slug: 'baby-romper-pullover',
  title: 'Baby romper note -- pullover base',
  subtitle: 'A note on adapting the baby pullover pattern for a simple romper top.',
  excerpt: 'A note pattern on extending the baby drop-shoulder pullover to a romper. The body extends to cover the nappy area, with snap fastenings at the crotch. Graded NB to 24 months.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded NB to 24 months. Size 6M: approx ${g38m.finishedMeasurements.bust} cm chest, extended body for romper shape.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['baby romper crochet', 'baby onesie crochet', 'crochet all in one baby'],
  glossaryTerms: [
    { slug: 'crotch-snap-g38', term: 'Crotch snap', definition: 'A row of press-stud fastenings along the crotch seam that can be opened easily for nappy changes. Usually 3 snaps across the width.' },
    { slug: 'dc2tog-g38', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the leg opening edges toward the crotch seam.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Baby rompers are a modern garment adaptation.',
  body: {
    type: 'doc', content: [
      p(t('Start with the drop-shoulder pullover base. Extend the body below the waist, curving inward using '), gt('dc2tog-g38', 'dc2tog'), t(' toward the crotch. Work the back and front separately. Add '), gt('crotch-snap-g38', 'crotch snaps'), t(' along the lower edge.')),
      p(t(`Size 6M base: ${g38m.hemStitches} sts, chest ${g38m.finishedMeasurements.bust} cm. Extend body extra 10 to 15 cm for romper shape.`)),
      h2('What you need'),
      supplies('Materials (size 6M)', [
        { name: 'DK yarn (soft baby yarn)', qty: `${Math.round(g38m.yarnRequiredYards * 1.3)} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Snap buttons', qty: '3' },
      ]),
      h2('Body (back and front)'),
      p(t(`Work dc from chest to crotch level, about ${g38m.finishedMeasurements.body + 12} cm total. Narrow the last 8 rows with `), gt('dc2tog-g38', 'dc2tog'), t(' each end.')),
      h2('Sleeves'),
      p(t(`Work short sleeves about 8 cm long. Set into the drop-shoulder opening.`)),
      h2('Crotch finish'),
      p(t('Join front and back at crotch. Add '), gt('crotch-snap-g38', 'crotch snaps'), t('.')),
      h2('What to try next'),
      p(t('The baby cardigan is a simpler project using the same yarn and needle.')),
    ],
  },
},
{
  slug: 'kids-dress',
  title: "Kids' crochet dress",
  subtitle: "A simple drop-shoulder dress for children in aran yarn.",
  excerpt: "A simple drop-shoulder dress for children in aran yarn. The same construction as the kids' pullover but with an extended body to dress length. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g39m.finishedMeasurements.bust} cm chest, ${g39m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's crochet dress", "kids' crochet frock", 'crochet sweater dress girls'],
  glossaryTerms: [
    { slug: 'dress-length-g39', term: 'Dress length', definition: `The total body length from shoulder to hem on a dress. Graded to reach mid-thigh on each size. Size K-6 is ${g39m.finishedMeasurements.body} cm.` },
    { slug: 'pocket-g39', term: 'Patch pocket', definition: 'A small flat square crocheted separately and seamed to the front of the dress. An optional feature but useful for children\'s wear.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's crochet dresses are a popular garment style.",
  body: {
    type: 'doc', content: [
      p(t('Work the same as the kids\' drop-shoulder pullover but extend the body to '), gt('dress-length-g39', 'dress length'), t(`. Optionally add a `), gt('pocket-g39', 'patch pocket'), t(' on the front.')),
      p(t(`Size K-6: ${g39m.hemStitches} sts wide, body ${g39m.finishedMeasurements.body} cm, chest ${g39m.finishedMeasurements.bust} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Aran yarn', qty: `${g39m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g39m.hemStitches + 2}. Work dc for ${g39m.finishedMeasurements.body} cm. Shape neck and shoulders.`)),
      h2('Sleeves and assembly'),
      p(t('Work sleeves. Seam shoulders. Set sleeves. Seam sides. Add '), gt('pocket-g39', 'patch pocket'), t(' if desired.')),
      h2('What to try next'),
      p(t("The kids' drop-shoulder pullover uses the same panels at standard pullover body length.")),
    ],
  },
},
{
  slug: 'kids-summer-top',
  title: "Kids' summer top",
  subtitle: "A lightweight sleeveless top for children in cotton DK yarn.",
  excerpt: "A lightweight sleeveless top for children in cotton DK yarn. Simple flat construction with a scoop neck. Graded K-2 to K-14.",
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in cotton DK on a 4 mm hook.',
  finishedSize: `Graded K-2 to K-14. Size K-6: ${g40m.finishedMeasurements.bust} cm chest.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ["children's crochet top", "kids' summer crochet shirt", 'crochet tank top kids'],
  glossaryTerms: [
    { slug: 'scoop-neck-g40', term: 'Scoop neck', definition: 'A wide, rounded neck opening that sits below the base of the neck. Shaped by casting off a group of stitches at the top centre and then decreasing each side to the shoulder.' },
    { slug: 'dc2tog-g40', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the scoop neck curve at each shoulder.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: "Children's cotton tops are a beginner-friendly garment type.",
  body: {
    type: 'doc', content: [
      p(t('Work back and front flat in cotton DK. Shape a '), gt('scoop-neck-g40', 'scoop neck'), t(' using '), gt('dc2tog-g40', 'dc2tog'), t(' at each side of the neck opening. Seam shoulders and sides. Finish armhole edges with a border row.')),
      p(t(`Size K-6: ${g40m.hemStitches} sts wide, body ${g40m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size K-6)', [
        { name: 'Cotton DK yarn', qty: `${g40m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g40m.hemStitches + 2}. Work dc for ${g40m.finishedMeasurements.body} cm. Shape `), gt('scoop-neck-g40', 'scoop neck'), t(': cast off centre 8 sts. Work each shoulder, applying `'), gt('dc2tog-g40', 'dc2tog'), t(' at the neck edge for 2 rows.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Work dc border around armhole and neck edges.')),
      h2('What to try next'),
      p(t("The kids' vest uses the same flat panel construction in aran weight for cooler months.")),
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
