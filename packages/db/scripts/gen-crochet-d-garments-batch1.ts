/**
 * Generator: D-Garments Batch 1 -- Pullovers 1-10 (women's drop-shoulder)
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch1.ts
 *
 * gradeAllSizes() drives accurate stitch counts / measurements in the body text.
 * sizesGraded lives on CrochetPattern (Studio model), not on Tutorial; we embed
 * the grading output inline as instructions.
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

const WOMENS_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

// ── G1 ── classic drop-shoulder pullover ──────────────────────────────────────
const g1graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_4',
  garmentType: 'PULLOVER',
})
const g1m = g1graded.find(g => g.size === 'M')!

// ── G2 ── ribbed hem pullover ─────────────────────────────────────────────────
const g2graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_4',
  garmentType: 'PULLOVER',
})
const g2m = g2graded.find(g => g.size === 'M')!

// ── G3 ── oversized tee ───────────────────────────────────────────────────────
const g3graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 },
  easePreset: 'GENEROUS_10',
  garmentType: 'PULLOVER',
  options: { yarnWeightCategory: 3 },
})
const g3m = g3graded.find(g => g.size === 'M')!

// ── G4 ── v-neck pullover ─────────────────────────────────────────────────────
const g4graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_2',
  garmentType: 'PULLOVER',
})
const g4m = g4graded.find(g => g.size === 'M')!

// ── G5 ── shell stitch pullover ───────────────────────────────────────────────
const g5graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_4',
  garmentType: 'PULLOVER',
})
const g5m = g5graded.find(g => g.size === 'M')!

// ── G6 ── cardigan ────────────────────────────────────────────────────────────
const g6graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_6',
  garmentType: 'CARDIGAN',
})
const g6m = g6graded.find(g => g.size === 'M')!

// ── G7 ── vest ────────────────────────────────────────────────────────────────
const g7graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_2',
  garmentType: 'VEST',
})
const g7m = g7graded.find(g => g.size === 'M')!

// ── G8 ── granny square cardigan ──────────────────────────────────────────────
const g8graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 12, rowsPer10cm: 14 },
  easePreset: 'GENEROUS_10',
  garmentType: 'CARDIGAN',
})
const g8m = g8graded.find(g => g.size === 'M')!

// ── G9 ── tunic ───────────────────────────────────────────────────────────────
const g9graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 },
  easePreset: 'POSITIVE_4',
  garmentType: 'TUNIC',
})
const g9m = g9graded.find(g => g.size === 'M')!

// ── G10 ── tank top ───────────────────────────────────────────────────────────
const g10graded = gradeAllSizes([...WOMENS_SIZES], {
  constructionShape: 'DROP_SHOULDER',
  gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 },
  easePreset: 'POSITIVE_2',
  garmentType: 'TANK',
  options: { yarnWeightCategory: 3 },
})
const g10m = g10graded.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'classic-drop-shoulder-pullover',
  title: 'Classic drop-shoulder pullover',
  subtitle: 'A relaxed-fit women\'s pullover in aran yarn worked in pieces.',
  excerpt: 'A classic drop-shoulder pullover in aran yarn worked in four flat pieces and seamed at the shoulders and sides. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g1m.finishedMeasurements.bust} cm bust, ${g1m.finishedMeasurements.body} cm body length.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['drop shoulder pullover crochet', 'crochet sweater women', 'aran pullover crochet'],
  glossaryTerms: [
    { slug: 'drop-shoulder-gs1', term: 'Drop shoulder', definition: 'A construction where the sleeve seam falls below the natural shoulder point. The body has no armhole shaping; the sleeve head is seamed straight to the body side.' },
    { slug: 'dc2tog-gs1', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck edge to narrow the neckline.' },
    { slug: 'gauge-swatch-gs1', term: 'Gauge swatch', definition: 'A 15 x 15 cm test square worked in the pattern stitch. Accurate gauge is critical for a wearable fit in a sized garment.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Drop-shoulder construction appears in crochet publications from the 1970s onward. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('A '), gt('drop-shoulder-gs1', 'drop-shoulder'), t(' pullover is the most accessible garment construction. The body and sleeves are flat rectangles with minimal shaping, and accurate '), gt('gauge-swatch-gs1', 'gauge'), t(' determines the fit.')),
      p(t('Work each piece as a flat dc rectangle. Seam the shoulders first, then set in the sleeves flat to the body side edge.')),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g1graded.find(g=>g.size==='M')!.yarnRequiredYards} yards (approx. ${Math.round(g1graded.find(g=>g.size==='M')!.yarnRequiredYards * 0.9144 / 100) * 100} m)` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Stitch markers', qty: '4' },
      ]),
      h2('Back'),
      p(t(`Chain ${g1m.hemStitches + 2}. Work double crochet rows for ${g1m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front'),
      p(t(`Work same as back to ${Math.round(g1m.finishedMeasurements.body * 0.75)} cm. Shape neck: divide at the centre. On each shoulder, use `), gt('dc2tog-gs1', 'dc2tog'), t(' at the neck edge once per row until shoulder width is reached. Fasten off.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g1m.sleeveCuffStitches + 2}. Increase 1 st each end every 6 rows to ${g1m.sleeveBicepStitches} sts. Work even to ${g1m.finishedMeasurements.sleeve} cm. Fasten off.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Set sleeve tops to body side edge from shoulder down. Seam sleeve and side seams in one run. Finish neck with a dc round.')),
      h2('What to try next'),
      p(t('The ribbed hem pullover uses the same build with a 1x1 rib trim at the hem and cuffs.')),
    ],
  },
},
{
  slug: 'ribbed-hem-drop-shoulder-pullover',
  title: 'Ribbed hem drop-shoulder pullover',
  subtitle: 'A drop-shoulder pullover with 1x1 rib hems and cuffs in aran yarn.',
  excerpt: 'A drop-shoulder pullover in aran yarn with 5 cm 1x1 rib hems at the body and cuffs. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g2m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk', 'crochet-fpdc'],
  aliases: ['ribbed sweater crochet', 'rib hem pullover', 'crochet pullover rib cuff'],
  glossaryTerms: [
    { slug: 'rib-hem-gs2', term: '1x1 rib hem', definition: 'Alternating front post dc and back post dc worked sideways and seamed to the bottom of the body. Gives a neat elastic edge that sits flat.' },
    { slug: 'fpdc-gs2', term: 'Front post double crochet', definition: 'A dc worked around the front of the post of the stitch below. Creates the raised ribs in the 1x1 rib.' },
    { slug: 'bpdc-gs2', term: 'Back post double crochet', definition: 'A dc worked around the back of the post below. Forms the recessed part of the rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Ribbed-hem drop-shoulder pullovers are a standard modern crochet garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the body and sleeves as a plain drop-shoulder pullover. Before seaming the bottom, make a separate '), gt('rib-hem-gs2', '1x1 rib'), t(' strip: chain 9, work '), gt('fpdc-gs2', 'fpdc'), t(' and '), gt('bpdc-gs2', 'bpdc'), t(' alternating rows until the strip matches the hem circumference. Seam to the bottom edge.')),
      p(t('Rib cuffs use the same strip at a smaller count. The rib trim sits flat and gives a tidier finish than a plain dc edge.')),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g2m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body and sleeves'),
      p(t(`Follow the classic drop-shoulder pullover pattern for back, front, and sleeves (size M: ${g2m.hemStitches} sts wide, ${g2m.finishedMeasurements.body} cm body). Omit any plain hem row.`)),
      h2('Rib hem strip'),
      p(t('Chain 9. Work '), gt('fpdc-gs2', 'fpdc'), t('/'), gt('bpdc-gs2', 'bpdc'), t(' rows for body circumference. Seam short ends. Seam to body bottom. Repeat at cuffs at smaller count.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same build without the rib trim.')),
    ],
  },
},
{
  slug: 'oversized-crochet-tee',
  title: 'Oversized crochet tee',
  subtitle: 'An oversized short-body t-shirt in cotton DK.',
  excerpt: 'A cotton DK tee with an oversized boxy fit and short sleeves. Drop-shoulder construction worked flat, graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g3m.finishedMeasurements.bust} cm bust (oversized).`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['oversized crochet tee', 'crochet t-shirt', 'cotton crochet top'],
  glossaryTerms: [
    { slug: 'oversized-ease-gs3', term: 'Oversized ease', definition: 'Adding 10 cm or more to the body measurements so the finished garment sits well off the shoulders with a boxy look.' },
    { slug: 'dc2tog-gs3', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the neck opening to shape the neckline.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet tees are a popular modern summer garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Use '), gt('oversized-ease-gs3', 'oversized ease'), t(' for a boxy fit. Back and front are wide dc rectangles with a plain neck opening. Short sleeves are cut at 22 cm from the underarm. Use '), gt('dc2tog-gs3', 'dc2tog'), t(' to neaten the neck corners.')),
      p(t(`Size M: ${g3m.hemStitches} sts wide, ${g3m.finishedMeasurements.body} cm body, ${g3m.finishedMeasurements.bust} cm bust.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: `${g3m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front (make 2)'),
      p(t(`Chain ${g3m.hemStitches + 2}. Work dc rows for ${g3m.finishedMeasurements.body} cm. Neck opening: leave centre 12 sts unworked at top. Fasten off.`)),
      h2('Short sleeves (make 2)'),
      p(t(`Chain ${g3m.sleeveBicepStitches + 2}. Work dc rows for 22 cm. Fasten off.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Seam sleeve tops to body. Seam sleeve and side seams. Finish neck with a dc round.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same build with long sleeves and aran weight yarn.')),
    ],
  },
},
{
  slug: 'v-neck-drop-shoulder-pullover',
  title: 'V-neck drop-shoulder pullover',
  subtitle: 'A classic-fit pullover with a V-neck in aran yarn.',
  excerpt: 'A drop-shoulder pullover with a deep V-neck in aran yarn. The front is divided and each half decreased to the shoulder. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g4m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['v-neck pullover crochet', 'crochet v neck sweater', 'vneck jumper crochet'],
  glossaryTerms: [
    { slug: 'v-neck-gs4', term: 'V-neck shaping', definition: 'Dividing the front at the centre and working each half with neck-edge decreases. Both halves slope inward to the shoulder width.' },
    { slug: 'dc2tog-gs4', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used every 2 rows at the neck edge to slope the V.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'V-neck pullovers are a standard garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and sleeves the same as the classic drop-shoulder pullover. For the front, work to '), t(`${Math.round(g4m.finishedMeasurements.body * 0.55)} cm`), t(', then apply '), gt('v-neck-gs4', 'V-neck shaping'), t(' by dividing at the centre and using '), gt('dc2tog-gs4', 'dc2tog'), t(' at the neck edge every 2 rows until the shoulder width is reached.')),
      p(t(`Size M: ${g4m.hemStitches} sts wide, ${g4m.finishedMeasurements.body} cm body, V starts at ${Math.round(g4m.finishedMeasurements.body * 0.55)} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g4m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front'),
      p(t(`Work dc to ${Math.round(g4m.finishedMeasurements.body * 0.55)} cm. Place marker at centre. Work left half: `), gt('dc2tog-gs4', 'dc2tog'), t(' at neck edge every 2 rows to shoulder. Repeat for right half with new yarn.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses a plain round neck on the same base.')),
    ],
  },
},
{
  slug: 'shell-stitch-pullover',
  title: 'Shell stitch pullover',
  subtitle: 'A drop-shoulder pullover with an all-over shell stitch body.',
  excerpt: 'A drop-shoulder pullover in aran yarn with an all-over shell stitch body. The shell repeat is 6 stitches wide. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows (plain). Shell gauge: 1 shell = 6 sts, approx. 2 cm wide.',
  finishedSize: `Graded XS to 3XL. Size M: ${g5m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-shell', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-shell'],
  criticalTechniques: ['crochet-shell'],
  aliases: ['shell stitch sweater', 'crochet shell pullover', 'fan stitch jumper'],
  glossaryTerms: [
    { slug: 'shell-gs5', term: 'Shell stitch', definition: 'Five treble crochets worked into the same stitch, fanning out. Each shell sits over a dc from the previous row.' },
    { slug: 'shell-repeat-gs5', term: 'Shell repeat', definition: 'The 6-stitch unit of the all-over pattern. The foundation chain must be a multiple of 6 for the shells to sit evenly.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Shell stitch garments are a classic crochet style from mid-twentieth-century pattern books.',
  body: {
    type: 'doc', content: [
      p(t('The '), gt('shell-gs5', 'shell stitch'), t(' body uses a 6-stitch '), gt('shell-repeat-gs5', 'shell repeat'), t('. Cast on to a multiple of 6 for back and front. The pattern alternates a shell row with a plain dc row. Sleeves use plain dc for easier finishing.')),
      p(t(`Size M: cast on to the nearest multiple of 6 close to ${g5m.hemStitches} sts. Body: ${g5m.finishedMeasurements.body} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g5m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Shell pattern'),
      p(t('Row A (right side): * dc 2, '), gt('shell-gs5', 'shell'), t(' (5 tr in same st), dc 2; rep. Row B: dc plain. Repeat rows A and B.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same build in plain dc.')),
    ],
  },
},
{
  slug: 'drop-shoulder-cardigan',
  title: 'Drop-shoulder cardigan',
  subtitle: 'A relaxed open-front cardigan in aran yarn worked flat.',
  excerpt: 'A relaxed drop-shoulder cardigan in aran yarn with an open front and dc button band. Worked in four flat pieces and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g6m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet cardigan drop shoulder', 'open front cardigan crochet', 'aran cardigan crochet'],
  glossaryTerms: [
    { slug: 'button-band-gs6', term: 'Button band', definition: 'A narrow dc strip worked along both front edges of a cardigan. One side carries button holes; the other carries the buttons.' },
    { slug: 'dc2tog-gs6', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the neck edge at the top of each front piece.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Drop-shoulder cardigans are a standard garment shape. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The back is the same as a pullover back. The front is split into two halves, each worked as a narrow rectangle. A '), gt('button-band-gs6', 'button band'), t(' is added along both centre fronts after assembly. Use '), gt('dc2tog-gs6', 'dc2tog'), t(' at the neck edge to shape the front neckline.')),
      p(t(`Size M: back ${g6m.hemStitches} sts wide, each front half ${Math.round(g6m.hemStitches / 2)} sts wide, ${g6m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g6m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm buttons', qty: '5' },
      ]),
      h2('Back'),
      p(t(`Chain ${g6m.hemStitches + 2}. Work dc rows for ${g6m.finishedMeasurements.body} cm. Fasten off.`)),
      h2('Front halves (make 2)'),
      p(t(`Chain ${Math.round(g6m.hemStitches / 2) + 2}. Work dc rows to shoulder, applying `), gt('dc2tog-gs6', 'dc2tog'), t(' at neck edge for last 6 cm.')),
      h2('Button band'),
      p(t('Work a '), gt('button-band-gs6', 'dc button band'), t(' along each front edge. On one side, space 5 ch-2 button holes evenly. Sew buttons on the other side.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same construction with a closed front.')),
    ],
  },
},
{
  slug: 'drop-shoulder-vest',
  title: 'Drop-shoulder vest',
  subtitle: 'A sleeveless fitted vest in DK yarn.',
  excerpt: 'A sleeveless fitted vest in DK yarn worked in two flat pieces. Armholes are shaped with simple decreases. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g7m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['crochet vest women', 'sleeveless pullover crochet', 'dk vest crochet'],
  glossaryTerms: [
    { slug: 'armhole-shaping-gs7', term: 'Armhole shaping', definition: 'Decreasing stitches at the sides of the body at the underarm point. Creates a defined armhole opening for a sleeveless garment.' },
    { slug: 'dc2tog-gs7', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used for the armhole and neck decreases.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet vests are a classic lightweight garment. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front as flat dc rectangles to the underarm. Apply '), gt('armhole-shaping-gs7', 'armhole shaping'), t(' using '), gt('dc2tog-gs7', 'dc2tog'), t(' at each side edge. Continue to the shoulder. Seam shoulders and sides.')),
      p(t(`Size M: ${g7m.hemStitches} sts wide, ${g7m.finishedMeasurements.body} cm body, armhole shaping begins at ${Math.round(g7m.finishedMeasurements.body * 0.6)} cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: `${g7m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g7m.hemStitches + 2}. Work dc to ${Math.round(g7m.finishedMeasurements.body * 0.6)} cm. Armhole shaping: `), gt('dc2tog-gs7', 'dc2tog'), t(' each end for 5 rows. Continue to ${g7m.finishedMeasurements.body} cm. Fasten off.')),
      h2('Front'),
      p(t('Work same as back. Shape neck: at shoulder height, leave centre stitches unworked and work each shoulder separately.')),
      h2('What to try next'),
      p(t('The drop-shoulder cardigan adds a front opening and sleeves to the same body shape.')),
    ],
  },
},
{
  slug: 'granny-square-cardigan',
  title: 'Granny square cardigan',
  subtitle: 'A motif-assembled cardigan made from 10 cm granny squares.',
  excerpt: 'A motif-assembled open-front cardigan made from 10 cm granny squares joined together. The square grid forms the body and sleeve panels. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '1 granny square = 10 x 10 cm on a 4 mm hook with DK.',
  finishedSize: `Graded XS to 3XL. Size M: ${g8m.finishedMeasurements.bust} cm bust (approx. ${Math.round(g8m.hemStitches / 12)} squares wide).`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-granny-square', 'crochet-join-as-you-go'],
  criticalTechniques: ['crochet-granny-square'],
  aliases: ['granny square cardigan', 'patchwork crochet cardigan', 'motif cardigan crochet'],
  glossaryTerms: [
    { slug: 'granny-square-gs8', term: 'Granny square', definition: 'A classic 4-round crochet motif worked in the round from a central ring. Groups of 3 trebles in each corner space form the square shape.' },
    { slug: 'jayg-gs8', term: 'Join-as-you-go', definition: 'Joining each new square to its neighbours during the final round instead of sewing them together afterwards. Keeps the joins flat and avoids a seaming step.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Granny square garments have roots in 1970s crochet fashion. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each '), gt('granny-square-gs8', 'granny square'), t(' is 10 x 10 cm. Work the required number of squares for each panel, then '), gt('jayg-gs8', 'join-as-you-go'), t(' during the last round of each new square.')),
      p(t(`Size M: back panel is ${Math.round(g8m.hemStitches / 12)} squares wide x ${Math.round(g8m.finishedMeasurements.body / 10)} squares tall. Each front half is half that width.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, multiple colours', qty: `${g8m.yarnRequiredYards} yards total` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Squares'),
      p(t('Round 1: magic ring, ch 3, 2 tr, ch 2; rep x4, join. Round 2: join at each corner: ch 3, 2 tr, ch 2, 3 tr; repeat. Round 3: add sides.')),
      h2('Assembly'),
      p(t('Lay squares in the grid plan. '), gt('jayg-gs8', 'Join-as-you-go'), t(' as you work the final round. Seam shoulder squares and join sleeve squares. Add a dc edge along the front opening.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover uses the same panelled construction in flat dc.')),
    ],
  },
},
{
  slug: 'oversized-tunic-crochet',
  title: 'Oversized crochet tunic',
  subtitle: 'A long-line drop-shoulder pullover with hem at the high hip in aran.',
  excerpt: 'A long-line drop-shoulder tunic in aran yarn reaching the high hip. Worked the same as a standard pullover but with a longer body. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g9m.finishedMeasurements.bust} cm bust, ${g9m.finishedMeasurements.body} cm body.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet tunic', 'long pullover crochet', 'hip length jumper crochet'],
  glossaryTerms: [
    { slug: 'tunic-length-gs9', term: 'Tunic length', definition: 'A body length reaching the high hip, typically 10 to 15 cm longer than a standard pullover. Pairs well with leggings or jeans.' },
    { slug: 'dc2tog-gs9', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the neck opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Long-line pullovers are a modern garment style. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work the same as a classic drop-shoulder pullover but extend the body to '), gt('tunic-length-gs9', 'tunic length'), t(`. Size M body is ${g9m.finishedMeasurements.body} cm. Use `, ), gt('dc2tog-gs9', 'dc2tog'), t(' to shape the neck.')),
      p(t(`Size M: ${g9m.hemStitches} sts wide, ${g9m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g9m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g9m.hemStitches + 2}. Work dc rows for ${g9m.finishedMeasurements.body} cm. Shape neck: work across, leave centre sts unworked, apply `), gt('dc2tog-gs9', 'dc2tog'), t(' at neck edge. Fasten off.')),
      h2('What to try next'),
      p(t('The classic drop-shoulder pullover is the same build at standard length.')),
    ],
  },
},
{
  slug: 'cotton-tank-top',
  title: 'Cotton tank top',
  subtitle: 'A fitted cotton DK sleeveless tank top.',
  excerpt: 'A fitted sleeveless tank top in cotton DK worked in two flat pieces. Minimal armhole shaping, single crochet neck and armhole edging. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in cotton DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g10m.finishedMeasurements.bust} cm bust.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['crochet tank top', 'cotton vest top crochet', 'sleeveless top crochet'],
  glossaryTerms: [
    { slug: 'dc2tog-gs10', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to narrow the armhole and neckline edges.' },
    { slug: 'shoulder-strap-gs10', term: 'Shoulder strap', definition: 'The narrow dc section above the armhole on each side of the neck. Typically 5 to 6 cm wide.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet tank tops are a popular summer garment. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front as flat dc rectangles to the underarm. Apply '), gt('dc2tog-gs10', 'dc2tog'), t(' each side to narrow to the armhole. Continue up the '), gt('shoulder-strap-gs10', 'shoulder strap'), t(' width. Seam shoulders and sides.')),
      p(t(`Size M: ${g10m.hemStitches} sts wide, ${g10m.finishedMeasurements.body} cm body.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Cotton DK yarn', qty: `${g10m.yarnRequiredYards} yards` },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back and front'),
      p(t(`Chain ${g10m.hemStitches + 2}. Work dc to ${Math.round(g10m.finishedMeasurements.body * 0.6)} cm. Apply `), gt('dc2tog-gs10', 'dc2tog'), t(' each side every row until strap width is reached. Work straps to full body length. Fasten off.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Work a dc edging round the neck and armholes.')),
      h2('What to try next'),
      p(t('The drop-shoulder vest adds full side panels and a shaped armhole for a more structured look.')),
    ],
  },
},
]

// ── write files ───────────────────────────────────────────────────────────────
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
