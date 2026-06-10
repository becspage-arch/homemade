/**
 * Generator: D-Garments Batch 25 -- Final garments G241-G250
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch25.ts
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

// G241 -- twinset cardigan (CARDIGAN, dk 4mm, POSITIVE_4)
const g241 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g241m = g241.find(g => g.size === 'M')!

// G242 -- twinset shell top (TANK, dk 4mm, POSITIVE_4)
const g242 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TANK' })
const g242m = g242.find(g => g.size === 'M')!

// G243 -- slip dress (DRESS, fingering 3.5mm, ZERO ease)
const g243 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 22, rowsPer10cm: 26 }, easePreset: 'ZERO', garmentType: 'DRESS' })
const g243m = g243.find(g => g.size === 'M')!

// G244 -- oversized sweater dress (DRESS, chunky 6mm, GENEROUS_15)
const g244 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 12, rowsPer10cm: 14 }, easePreset: 'GENEROUS_15', garmentType: 'DRESS' })
const g244m = g244.find(g => g.size === 'M')!

// G245 -- longline blazer (CARDIGAN, dk 4mm, POSITIVE_4)
const g245 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g245m = g245.find(g => g.size === 'M')!

// G246 -- cowl back top (PULLOVER, dk 4mm, POSITIVE_4)
const g246 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g246m = g246.find(g => g.size === 'M')!

// G247 -- side slit pullover (PULLOVER, aran 5mm, POSITIVE_4)
const g247 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g247m = g247.find(g => g.size === 'M')!

// G248 -- colour block cardigan (CARDIGAN, aran 5mm, POSITIVE_4)
const g248 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g248m = g248.find(g => g.size === 'M')!

// G249 -- oversized shirt pullover (PULLOVER, dk 4mm, POSITIVE_8)
const g249 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_8', garmentType: 'PULLOVER' })
const g249m = g249.find(g => g.size === 'M')!

// G250 -- statement sleeve top (PULLOVER, dk 4mm, POSITIVE_4)
const g250 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g250m = g250.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'crochet-twinset-cardigan',
  title: 'Twinset cardigan',
  excerpt: 'A short fitted cardigan with crew neck, sized to layer over the matching twinset shell top. Worked flat in DK and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g241m.finishedMeasurements.bust} cm bust. Length 52 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['twinset cardigan crochet', 'matching cardigan crochet', 'crew neck short cardigan crochet'],
  glossaryTerms: [
    { slug: 'twinset-g241', term: 'Twinset', definition: 'A coordinated pair of top and cardigan designed to be worn together. The cardigan is cut short and fitted so it skims the shell top beneath without adding bulk.' },
    { slug: 'crew-neck-band-g241', term: 'Crew neck band', definition: 'A narrow dc ribbed edging worked around the neckline after assembly. Sits flat against the neck and matches the lower band of the shell top.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Twinsets are a classic knitwear tradition adapted to crochet.',
  body: {
    type: 'doc', content: [
      p(t('This cardigan is the top half of a '), gt('twinset-g241', 'twinset'), t(': a fitted short cardigan that layers over the matching shell top. Work front and back panels flat in dc, seam at the shoulders and sides, then work the '), gt('crew-neck-band-g241', 'crew neck band'), t(' around the joined neckline.')),
      p(t(`Size M: ${g241m.finishedMeasurements.bust} cm bust, length 52 cm. Button band worked along both front edges.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '500 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '5' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g241m.castOnStitches + 2}. Work dc for 52 cm. Fasten off.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g241m.castOnStitches / 2) + 2}. Work dc for 52 cm. Shape armhole with dc2tog at sleeve edge.`)),
      h2('Neck band'),
      p(t('Join shoulders and sides. Pick up stitches around neck. Work 4 rows dc for the '), gt('crew-neck-band-g241', 'crew neck band'), t('.')),
      h2('What to try next'),
      p(t('The twinset shell top is worked in the same DK on a 4 mm hook to match gauge exactly.')),
    ],
  },
},
{
  slug: 'crochet-shell-top-twinset',
  title: 'Twinset shell top',
  excerpt: 'A sleeveless shell top with crew neck to match the twinset cardigan. Worked flat in DK and seamed. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g242m.finishedMeasurements.bust} cm bust. Length 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['twinset shell top crochet', 'matching shell top crochet', 'sleeveless crew neck top crochet'],
  glossaryTerms: [
    { slug: 'shell-top-g242', term: 'Shell top', definition: 'A sleeveless top with a simple crew or scoop neck. The armhole is finished with a narrow dc edging rather than a set-in sleeve. Designed to be worn alone or under a cardigan.' },
    { slug: 'armhole-edging-g242', term: 'Armhole edging', definition: 'A single round of dc worked around each armhole opening after shoulder seaming. Keeps the raw edge flat without adding bulk.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Shell tops are the sleeveless companion to twinset cardigans.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and front of the '), gt('shell-top-g242', 'shell top'), t(' as flat dc panels. Shape armholes with dc2tog at each side. After seaming, add '), gt('armhole-edging-g242', 'armhole edging'), t(' around each opening.')),
      p(t(`Size M: ${g242m.finishedMeasurements.bust} cm bust, length 58 cm. Work in the same DK yarn and gauge as the twinset cardigan.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '350 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g242m.castOnStitches + 2}. Work dc for 58 cm. Shape armhole by working dc2tog at each side edge for the top 20 cm.`)),
      h2('Front panel'),
      p(t('Work to match back. Shape armhole and scoop neck at the top of the front panel.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Work '), gt('armhole-edging-g242', 'armhole edging'), t(' around each armhole in one round of dc.')),
      h2('What to try next'),
      p(t('The twinset cardigan works in matching yarn to complete the set.')),
    ],
  },
},
{
  slug: 'crochet-slip-dress',
  title: 'Slip dress',
  excerpt: 'A close-fit sleeveless slip dress in fingering weight with narrow straps and a straight hem. Zero ease for a body-skimming silhouette. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '22 dc x 26 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g243m.finishedMeasurements.bust} cm bust with zero ease. Length 95 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['slip dress crochet', 'tank dress fingering crochet', 'sleeveless dress zero ease crochet'],
  glossaryTerms: [
    { slug: 'zero-ease-g243', term: 'Zero ease', definition: 'The finished garment matches the body measurements exactly, adding no extra width. The dress drapes close to the body without gripping or stretching.' },
    { slug: 'strap-g243', term: 'Dress strap', definition: 'A long narrow strip of dc chain and dc rows worked from the front bust edge up and over the shoulder to the back. Usually 2 to 3 cm wide and long enough to adjust over the shoulder.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Slip dresses are a popular modern crochet garment with a minimalist silhouette.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as flat dc panels with '), gt('zero-ease-g243', 'zero ease'), t(': the cast-on equals the exact body measurement. Shape the bust line and side seams with dc2tog for a body-skimming fit. Add narrow '), gt('strap-g243', 'straps'), t(' at the shoulders.')),
      p(t(`Size M: ${g243m.finishedMeasurements.bust} cm bust, length 95 cm. Cast on for exact measurements.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Fingering yarn', qty: '700 yards' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g243m.castOnStitches + 2}. Work dc for 95 cm. Shape sides every 10 rows with dc2tog.`)),
      h2('Front panel'),
      p(t('Work to match back. Add bust dart shaping at centre front with short rows.')),
      h2('Straps'),
      p(t('Work each '), gt('strap-g243', 'strap'), t(' as a 3 cm wide dc strip, 55 cm long. Attach to front and back edges. Adjust length.')),
      h2('What to try next'),
      p(t('The cosy oversized sweater dress uses a longer length with generous ease for a completely different feel.')),
    ],
  },
},
{
  slug: 'cosy-oversized-sweater-dress',
  title: 'Cosy oversized sweater dress',
  excerpt: 'A very oversized midi-length sweater dress in chunky yarn. Generously proportioned with drop shoulders and a ribbed hem and cuffs. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '12 dc x 14 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g244m.finishedMeasurements.bust} cm bust with very generous ease. Length 100 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['oversized sweater dress crochet', 'chunky sweater dress crochet', 'midi sweater dress crochet'],
  glossaryTerms: [
    { slug: 'midi-length-g244', term: 'Midi length', definition: 'A garment length finishing between the knee and the ankle, typically 95 to 110 cm from the shoulder. On a sweater dress this gives a relaxed, cosy silhouette.' },
    { slug: 'rib-trim-g244', term: 'Rib trim', definition: 'A 5 cm band of fpdc and bpdc rib worked at the hem, sleeve cuffs, and neckline. Anchors the loose fabric and gives the garment its finished edge.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Oversized chunky sweater dresses are one of the most popular cold-weather crochet projects.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as wide dc panels to '), gt('midi-length-g244', 'midi length'), t('. The generous ease means no shaping is needed: straight sides from hem to shoulder. Add '), gt('rib-trim-g244', 'rib trim'), t(' at the hem, cuffs, and neckline using fpdc/bpdc.')),
      p(t(`Size M: ${g244m.finishedMeasurements.bust} cm bust. Length 100 cm. Sleeve length 52 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Chunky yarn', qty: '900 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body (front and back)'),
      p(t(`Chain ${g244m.castOnStitches + 2}. Work dc for 100 cm. No side shaping. Seam shoulders.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g244m.sleeveCapStitches + 2}. Work dc for 52 cm. Add `), gt('rib-trim-g244', 'rib trim'), t(' at cuff.')),
      h2('Finishing'),
      p(t('Seam sides. Work '), gt('rib-trim-g244', 'rib trim'), t(' at hem and neckline. Weave in ends.')),
      h2('What to try next'),
      p(t('The slip dress uses fingering weight for a completely different close-fit silhouette.')),
    ],
  },
},
{
  slug: 'crochet-longline-blazer',
  title: 'Longline crochet blazer',
  excerpt: 'A structured longline blazer jacket in DK yarn that falls below the hip. Single button closure with a notched collar. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g245m.finishedMeasurements.bust} cm bust. Length 80 cm below shoulder.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['longline blazer crochet', 'crochet jacket below hip', 'crochet blazer single button'],
  glossaryTerms: [
    { slug: 'notched-collar-g245', term: 'Notched collar', definition: 'A collar with a V-shaped cut at the centre front where the lapel meets the collar band. Worked in dc rows attached to the neckline and front bands, then folded and seamed at the notch.' },
    { slug: 'single-button-g245', term: 'Single button closure', definition: 'One button placed at the waist seam on the right front band with a matching buttonhole on the left. Holds the blazer closed with a clean open-front line above and below.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Longline blazers are a popular tailored crochet garment for structured outerwear styling.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels to 80 cm. Shape with dc2tog at waist for a slight taper. Seam at shoulders and sides. Work button bands along front edges with a '), gt('single-button-g245', 'single button closure'), t(' at the waist. Work the '), gt('notched-collar-g245', 'notched collar'), t(' in dc rows around the neckline.')),
      p(t(`Size M: ${g245m.finishedMeasurements.bust} cm bust. Length 80 cm. Sleeve 58 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '850 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Button, 2.5 cm', qty: '1' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g245m.castOnStitches + 2}. Work dc for 80 cm. Shape sides with dc2tog at waist level.`)),
      h2('Front panels (make 2)'),
      p(t('Work to match back at half width. Add dc button band along front edge with one buttonhole.')),
      h2('Collar'),
      p(t('Work the '), gt('notched-collar-g245', 'notched collar'), t(' in dc rows from the neckline, folding at the front edges.')),
      h2('What to try next'),
      p(t('The colour block cardigan uses a similar open-front cardigan shape in a bolder palette.')),
    ],
  },
},
{
  slug: 'crochet-cowl-back-top',
  title: 'Cowl back top',
  excerpt: 'A fitted top with an open draping cowl at the back, pooling at mid-back. Simple front panel, dramatic open back. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g246m.finishedMeasurements.bust} cm bust. Length 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cowl back top crochet', 'open back draped top crochet', 'back cowl crochet top'],
  glossaryTerms: [
    { slug: 'cowl-back-g246', term: 'Cowl back', definition: 'An open back panel worked wider and longer than the front, with the extra fabric gathered at the side seams to create a loose draping pool of fabric at mid-back. The sides are seamed normally; the back itself hangs free.' },
    { slug: 'treble-drape-g246', term: 'Treble drape', definition: 'Treble crochet used in the back panel instead of dc. The taller stitch creates a lighter, more fluid fabric that drapes well and forms the cowl pool without stiffening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cowl back and open back tops are a popular draped crochet garment style.',
  body: {
    type: 'doc', content: [
      p(t('Work the front panel as a standard dc top. Work the '), gt('cowl-back-g246', 'cowl back'), t(' in '), gt('treble-drape-g246', 'treble drape'), t(': wider and taller than the front, gathering the extra fabric at each side seam so it pools at mid-back. The two shoulder straps connect front and back.')),
      p(t(`Size M: front ${g246m.finishedMeasurements.bust} cm bust. Back panel 20 cm wider. Length 58 cm front; back drape adds 15 cm of fabric.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '450 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Front panel'),
      p(t(`Chain ${g246m.castOnStitches + 2}. Work dc for 58 cm.`)),
      h2('Back panel'),
      p(t(`Chain ${g246m.castOnStitches + 38}. Work in `), gt('treble-drape-g246', 'treble rows'), t(' for 73 cm. Gather at each side seam when seaming to create the '), gt('cowl-back-g246', 'cowl back'), t(' pool.')),
      h2('What to try next'),
      p(t('The statement sleeve top uses a different dramatic design element at the upper sleeve.')),
    ],
  },
},
{
  slug: 'crochet-side-slit-pullover',
  title: 'Side slit pullover',
  excerpt: 'A relaxed pullover with long side slits extending 20 cm from the hem. The slits open with movement and give the boxy silhouette a flowing quality. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g247m.finishedMeasurements.bust} cm bust. Length 62 cm with 20 cm side slits.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['side slit pullover crochet', 'crochet sweater side slits', 'split hem pullover crochet'],
  glossaryTerms: [
    { slug: 'side-slit-g247', term: 'Side slit', definition: 'An opening left at the lower side seam, worked by leaving the bottom 20 cm of each side seam unstitched. The raw slit edge is finished with a single round of dc to prevent stretching.' },
    { slug: 'slit-edging-g247', term: 'Slit edging', definition: 'A single dc row worked along both edges of the side slit opening. Keeps the hem flat and prevents the slit from growing during wear.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Side slit hems are a popular design detail on relaxed-fit pullovers.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as flat dc panels. When seaming, leave the lower 20 cm of each side seam open to form the '), gt('side-slit-g247', 'side slit'), t('. Finish both edges of each slit with '), gt('slit-edging-g247', 'slit edging'), t(' in dc.')),
      p(t(`Size M: ${g247m.finishedMeasurements.bust} cm bust. Body length 62 cm. Slits extend 20 cm from hem.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: '600 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g247m.castOnStitches + 2}. Work dc for 62 cm.`)),
      h2('Front panel'),
      p(t('Work to match back.')),
      h2('Assembly and slits'),
      p(t('Seam shoulders. Seam sides from the armhole down, stopping 20 cm from hem to form '), gt('side-slit-g247', 'side slits'), t('. Work '), gt('slit-edging-g247', 'slit edging'), t(' along each open edge.')),
      h2('What to try next'),
      p(t('The colour block cardigan adds visual interest with a two-tone palette instead of construction details.')),
    ],
  },
},
{
  slug: 'crochet-colour-block-cardigan',
  title: 'Colour block cardigan',
  excerpt: 'An open cardigan worked in two bold contrasting halves: one colour for the left side and sleeves, a second for the right. Worked flat in aran. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g248m.finishedMeasurements.bust} cm bust. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['colour block cardigan crochet', 'two tone cardigan crochet', 'split colour cardigan crochet'],
  glossaryTerms: [
    { slug: 'colour-block-join-g248', term: 'Colour block join', definition: 'The centre back seam where the two contrasting panels meet. Each half is worked separately in one colour, then seamed at the back centre and one shoulder to form the full back and front.' },
    { slug: 'contrast-sleeve-g248', term: 'Contrast sleeve', definition: 'Each sleeve is worked in the colour of the front panel it attaches to. Left sleeve matches the left front colour; right sleeve matches the right front colour.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Colour block garments are a popular modern crochet design technique.',
  body: {
    type: 'doc', content: [
      p(t('Work each half of the cardigan separately in one colour. The '), gt('colour-block-join-g248', 'colour block join'), t(' seam runs down the centre back. Each '), gt('contrast-sleeve-g248', 'contrast sleeve'), t(' matches the front panel on its side. No yarn carrying is needed: each section is a solid single colour.')),
      p(t(`Size M: each half ${Math.round(g248m.finishedMeasurements.bust / 2)} cm wide at the colour join. Total bust ${g248m.finishedMeasurements.bust} cm. Length 65 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn, colour A', qty: '400 yards' },
        { name: 'Aran yarn, colour B', qty: '400 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Left half (colour A)'),
      p(t(`Chain ${Math.round(g248m.castOnStitches / 2) + 2}. Work dc in colour A for 65 cm.`)),
      h2('Right half (colour B)'),
      p(t('Work to match left half in colour B.')),
      h2('Assembly'),
      p(t('Seam at '), gt('colour-block-join-g248', 'colour block join'), t('. Attach '), gt('contrast-sleeve-g248', 'contrast sleeves'), t(' on each side. Work single dc edging around all edges.')),
      h2('What to try next'),
      p(t('The crochet oversized shirt uses a single yarn with shirt-style detailing for a different kind of statement.')),
    ],
  },
},
{
  slug: 'crochet-oversized-shirt',
  title: 'Oversized shirt-style pullover',
  excerpt: 'A boxy oversized pullover that mimics a shirt with a shirt collar, front placket, and chest button detail. Worked flat in DK. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g249m.finishedMeasurements.bust} cm bust. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet shirt pullover', 'shirt collar crochet sweater', 'oversized shirt crochet'],
  glossaryTerms: [
    { slug: 'shirt-collar-g249', term: 'Shirt collar', definition: 'A two-layer dc collar worked in rows from the neckline edge. The inner stand is 2.5 cm tall; the outer collar folds over it. Both layers are worked in dc with a clean turning chain.' },
    { slug: 'front-placket-g249', term: 'Front placket', definition: 'A 5 cm wide dc band worked vertically down the centre front of the pullover. The placket adds the visual reference to a shirt without turning the pullover into a cardigan. One or two decorative buttons are sewn to the placket face.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Shirt-style pullovers bridge the gap between casual knitwear and structured shirting.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as wide dc panels with generous ease. Add the '), gt('front-placket-g249', 'front placket'), t(' as a dc band down the centre front. Work the '), gt('shirt-collar-g249', 'shirt collar'), t(' in two layers from the neckline. Sew decorative buttons to the placket.')),
      p(t(`Size M: ${g249m.finishedMeasurements.bust} cm bust. Body length 65 cm. Placket 5 cm wide.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '2' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g249m.castOnStitches + 2}. Work dc for 65 cm.`)),
      h2('Front panel'),
      p(t('Work to match back. Work the '), gt('front-placket-g249', 'front placket'), t(' as a 5 cm dc band at centre front.')),
      h2('Collar'),
      p(t('Pick up stitches around neck. Work '), gt('shirt-collar-g249', 'shirt collar'), t(' in two layers. Sew buttons to placket.')),
      h2('What to try next'),
      p(t('The statement sleeve top uses a clean minimal front with dramatic volume at the upper sleeve instead.')),
    ],
  },
},
{
  slug: 'crochet-statement-sleeve-top',
  title: 'Statement sleeve top',
  excerpt: 'A fitted top with exaggerated wide upper sleeves that create bold volume at the shoulder. Simple body, dramatic sleeve. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g250m.finishedMeasurements.bust} cm bust. Sleeve length 25 cm at maximum width 50 cm around.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['statement sleeve top crochet', 'wide sleeve top crochet', 'exaggerated sleeve crochet'],
  glossaryTerms: [
    { slug: 'statement-sleeve-g250', term: 'Statement sleeve', definition: 'An oversized sleeve panel worked much wider than the standard drop shoulder sleeve. The upper sleeve is up to 50 cm around at the widest point, tapering to 30 cm at the cuff. The excess width creates dramatic volume at the shoulder.' },
    { slug: 'sleeve-taper-g250', term: 'Sleeve taper', definition: 'A series of dc2tog decreases worked at both edges of the sleeve panel. Starting at the maximum sleeve width, decreases narrow the sleeve to the wrist dimension over the lower sleeve length.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Statement sleeves are a popular fashion-forward crochet garment design.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as fitted dc panels. Work the '), gt('statement-sleeve-g250', 'statement sleeves'), t(' as wide panels: cast on for 50 cm around at the top and taper with '), gt('sleeve-taper-g250', 'sleeve taper'), t(' decreases to 30 cm at the wrist over 25 cm length.')),
      p(t(`Size M: body ${g250m.finishedMeasurements.bust} cm bust. Each sleeve: 50 cm at top, tapers to 30 cm at cuff over 25 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '550 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body (front and back)'),
      p(t(`Chain ${g250m.castOnStitches + 2}. Work dc for 58 cm.`)),
      h2('Sleeves (make 2)'),
      p(t('Chain 92. Work dc for 8 cm at full width. Begin '), gt('sleeve-taper-g250', 'sleeve taper'), t(': dc2tog at both edges every 2 rows until sleeve measures 25 cm and 54 sts remain. Fasten off.')),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Set in '), gt('statement-sleeve-g250', 'statement sleeves'), t(' at the shoulder seam. Seam sleeve underarm.')),
      h2('What to try next'),
      p(t('This is the final entry in the garments collection. Return to the twinset cardigan for a classic coordinated look.')),
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
