/**
 * Generator: D-Garments Batch 27 -- G261-G270 workwear and professional garments
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch27.ts
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

// G261 -- office cardigan (CARDIGAN, dk 4mm, POSITIVE_4)
const g261 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g261m = g261.find(g => g.size === 'M')!

// G262 -- work blazer (CARDIGAN, dk 4mm, POSITIVE_4)
const g262 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g262m = g262.find(g => g.size === 'M')!

// G263 -- pencil dress (DRESS, fingering 3.5mm, ZERO ease)
const g263 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 22, rowsPer10cm: 26 }, easePreset: 'ZERO', garmentType: 'DRESS' })
const g263m = g263.find(g => g.size === 'M')!

// G264 -- tailored vest (TANK, dk 4mm, POSITIVE_4)
const g264 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TANK' })
const g264m = g264.find(g => g.size === 'M')!

// G265 -- smart pullover (PULLOVER, dk 4mm, POSITIVE_4)
const g265 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g265m = g265.find(g => g.size === 'M')!

// G266 -- office wrap dress (DRESS, dk 4mm, POSITIVE_4)
const g266 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g266m = g266.find(g => g.size === 'M')!

// G267 -- structured jacket (CARDIGAN, dk 4mm, POSITIVE_4)
const g267 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g267m = g267.find(g => g.size === 'M')!

// G268 -- work skirt (use TANK for hip measurement grading, dk 4mm, POSITIVE_4)
const g268 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'TANK' })
const g268m = g268.find(g => g.size === 'M')!

// G269 -- button-down blouse (PULLOVER, dk 4mm, POSITIVE_4)
const g269 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g269m = g269.find(g => g.size === 'M')!

// G270 -- smart cropped cardigan (CARDIGAN, dk 4mm, POSITIVE_4)
const g270 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g270m = g270.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'office-cardigan-crochet',
  title: 'Office cardigan',
  excerpt: 'A neat button-front cardigan in DK yarn with a V-neck and ribbed cuffs and hem. Sits at hip length and works as a professional layer over a blouse or dress. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g261m.finishedMeasurements.bust} cm bust. Length 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['office cardigan crochet', 'work cardigan crochet', 'professional v-neck cardigan crochet'],
  glossaryTerms: [
    { slug: 'v-neck-shaping-g261', term: 'V-neck shaping', definition: 'A gradual decrease worked at the centre front of each front panel. One dc2tog is placed at the neck edge every fourth row until the neckline reaches the correct depth, creating the V line.' },
    { slug: 'rib-band-g261', term: 'Rib band', definition: 'A 4 cm band of fpdc and bpdc rib worked at the hem and cuffs. Keeps the cardigan edges neat and adds a tailored finish that suits professional settings.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Classic office cardigans are a staple professional crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels flat in dc. Shape the '), gt('v-neck-shaping-g261', 'V-neck'), t(' on each front panel with dc2tog at the neck edge every fourth row. Work '), gt('rib-band-g261', 'rib bands'), t(' at hem and cuffs in fpdc and bpdc.')),
      p(t(`Size M: ${g261m.finishedMeasurements.bust} cm bust. Length 60 cm. Five-button front band.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '550 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '5' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g261m.castOnStitches + 2}. Work dc for 60 cm. Work `), gt('rib-band-g261', 'rib band'), t(' at hem.')),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g261m.castOnStitches / 2) + 2}. Work dc for 60 cm. Shape `), gt('v-neck-shaping-g261', 'V-neck'), t(' with dc2tog every 4 rows at neck edge.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g261m.sleeveCapStitches + 2}. Work dc for 52 cm. Work `), gt('rib-band-g261', 'rib band'), t(' at cuff.')),
      h2('Button band'),
      p(t('Work dc button band down right front. Work buttonhole band down left front with 5 evenly spaced buttonholes. Attach buttons.')),
      h2('What to try next'),
      p(t('The work blazer uses a more structured collar and single closure for a sharper professional finish.')),
    ],
  },
},
{
  slug: 'work-blazer-crochet',
  title: 'Work blazer',
  excerpt: 'A structured single-button crochet blazer with a lapel collar and welt pocket detail. Worked flat in DK yarn. Professional enough for the office and relaxed enough for everyday wear. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g262m.finishedMeasurements.bust} cm bust. Length 68 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['work blazer crochet', 'crochet office jacket', 'professional blazer crochet'],
  glossaryTerms: [
    { slug: 'lapel-collar-g262', term: 'Lapel collar', definition: 'A collar worked in dc rows that folds back to form a pointed lapel at the front opening. The collar band is picked up from the neckline edge and worked outward, then the outer collar is folded and seamed at the lapel points.' },
    { slug: 'welt-pocket-g262', term: 'Welt pocket', definition: 'A decorative horizontal pocket opening worked into the front panel fabric. A dc strip forms the welt trim above the pocket opening. The pocket bag is a separate dc rectangle seamed to the inside.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Blazer-style jackets are a tailored workwear adaptation in crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels in dc. Shape side seams with dc2tog for a slight waist taper. Work the '), gt('lapel-collar-g262', 'lapel collar'), t(' from the neckline. Add a '), gt('welt-pocket-g262', 'welt pocket'), t(' to each front panel at hip level.')),
      p(t(`Size M: ${g262m.finishedMeasurements.bust} cm bust. Length 68 cm. Single button at waist.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '750 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Button, 2 cm', qty: '1' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g262m.castOnStitches + 2}. Work dc for 68 cm. Shape waist with dc2tog at each side at mid-length.`)),
      h2('Front panels (make 2)'),
      p(t('Work to match half the back width. Add front band with buttonhole on left panel. Work '), gt('welt-pocket-g262', 'welt pocket'), t(' at hip level on each panel.')),
      h2('Lapel collar'),
      p(t('Join shoulders. Pick up stitches from neckline. Work '), gt('lapel-collar-g262', 'lapel collar'), t(' in dc rows, folding at the lapel point and seaming flat.')),
      h2('What to try next'),
      p(t('The structured jacket uses heavier construction details for an even more tailored result.')),
    ],
  },
},
{
  slug: 'pencil-dress-crochet',
  title: 'Pencil dress',
  excerpt: 'A close-fit knee-length pencil dress in fingering weight with zero ease and a back vent. Clean and minimal, suitable for a smart work look. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '22 dc x 26 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g263m.finishedMeasurements.bust} cm bust with zero ease. Length 92 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['pencil dress crochet', 'fitted knee length dress crochet', 'work dress crochet'],
  glossaryTerms: [
    { slug: 'back-vent-g263', term: 'Back vent', definition: 'A slit left at the centre back hem, 20 cm long, that allows freedom of movement in a close-fit skirt. The vent edges are finished with a single dc row to prevent stretching.' },
    { slug: 'dart-shaping-g263', term: 'Dart shaping', definition: 'A series of dc2tog decreases worked symmetrically on both sides of the back and front panels at the waist level. The decreases narrow the fabric by 4 to 6 cm at the waist, then increases replace the stitches at hip level, giving the pencil silhouette its shape.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Pencil dresses are a classic workwear silhouette adapted to fingering crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back as flat dc panels using '), gt('dart-shaping-g263', 'dart shaping'), t(' at the waist for a fitted silhouette. Leave a '), gt('back-vent-g263', 'back vent'), t(' at the centre back hem for ease of movement. Seam sides and shoulders.')),
      p(t(`Size M: ${g263m.finishedMeasurements.bust} cm bust. Length 92 cm. Knee length on a 170 cm figure.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Fingering yarn', qty: '800 yards' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g263m.castOnStitches + 2}. Work dc for 92 cm. Add `), gt('dart-shaping-g263', 'dart shaping'), t(' at waist level. Leave '), gt('back-vent-g263', 'back vent'), t(' open at hem centre.')),
      h2('Front panel'),
      p(t('Work to match back. Apply same dart shaping at waist. No vent on front.')),
      h2('Neck and armhole edging'),
      p(t('Work one round of dc around each armhole and around the neckline. Fasten off.')),
      h2('What to try next'),
      p(t('The office wrap dress offers a softer fit with a similar knee-length professional silhouette.')),
    ],
  },
},
{
  slug: 'tailored-vest-crochet',
  title: 'Tailored vest',
  excerpt: 'A structured sleeveless vest with a V-neck, button front, and welt pocket detail. Worked flat in DK yarn to sit over a shirt or blouse. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g264m.finishedMeasurements.bust} cm bust. Length 55 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['tailored vest crochet', 'waistcoat crochet', 'sleeveless button vest crochet'],
  glossaryTerms: [
    { slug: 'vest-v-neck-g264', term: 'V-neck shaping', definition: 'A paired decrease worked at the centre of each front panel. One dc2tog at the neck edge every third row draws the front edges toward the centre, forming the V. The two front panels are worked as separate pieces and joined only at the shoulders.' },
    { slug: 'vest-welt-g264', term: 'Welt pocket', definition: 'A horizontal pocket worked into the lower front panel. A dc strip forms the decorative trim above the opening, and a small pocket bag is seamed inside. One pocket per front panel at hip level.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Tailored vests and waistcoats are a classic professional layering piece.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels in dc. Shape each front with '), gt('vest-v-neck-g264', 'V-neck shaping'), t(' using dc2tog at the neck edge. Add a '), gt('vest-welt-g264', 'welt pocket'), t(' to each front panel. Work armhole edging and front band after assembly.')),
      p(t(`Size M: ${g264m.finishedMeasurements.bust} cm bust. Length 55 cm. Three-button front.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '450 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '3' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g264m.castOnStitches + 2}. Work dc for 55 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g264m.castOnStitches / 2) + 2}. Work dc. Shape `), gt('vest-v-neck-g264', 'V-neck'), t(' with dc2tog every 3 rows. Add '), gt('vest-welt-g264', 'welt pocket'), t(' at hip level.')),
      h2('Finishing'),
      p(t('Seam shoulders and sides. Work dc armhole edging. Work button band down right front and buttonhole band down left front. Attach buttons.')),
      h2('What to try next'),
      p(t('The smart pullover uses a similar V-neck line but with sleeves for a warmer professional layer.')),
    ],
  },
},
{
  slug: 'smart-pullover-crochet',
  title: 'Smart pullover',
  excerpt: 'A V-neck pullover in DK yarn with set-in sleeve shaping and ribbed trims. Neat enough for the office, comfortable enough for all day. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g265m.finishedMeasurements.bust} cm bust. Length 62 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['smart pullover crochet', 'V-neck work sweater crochet', 'office pullover crochet'],
  glossaryTerms: [
    { slug: 'v-neck-pull-g265', term: 'V-neck opening', definition: 'A neckline that divides the front panel into two halves at the chest. Each half is worked separately, with dc2tog at the neck edge every fourth row. A narrow dc rib band is picked up around the V after shoulder seaming.' },
    { slug: 'rib-trim-g265', term: 'Rib trim', definition: 'A 4 cm band of fpdc and bpdc rib at the hem and cuffs. Adds elasticity at the body hem and wrist, keeping the pullover tucked and the sleeves in place during wear.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'V-neck pullovers are a timeless professional knitwear piece adapted to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front panels flat in dc. Split the front panel at the '), gt('v-neck-pull-g265', 'V-neck opening'), t(' and work each half to the shoulder. Work '), gt('rib-trim-g265', 'rib trim'), t(' at hem and cuffs. Pick up stitches for the V-neck rib band after seaming.')),
      p(t(`Size M: ${g265m.finishedMeasurements.bust} cm bust. Length 62 cm. Sleeve length 54 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g265m.castOnStitches + 2}. Work dc for 62 cm. Work `), gt('rib-trim-g265', 'rib trim'), t(' at hem.')),
      h2('Front panel'),
      p(t('Chain the same as back. Work dc to split point at mid-chest. Work each front half separately with dc2tog at neck edge every 4 rows to form the '), gt('v-neck-pull-g265', 'V-neck'), t('.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g265m.sleeveCapStitches + 2}. Work dc for 54 cm. Work `), gt('rib-trim-g265', 'rib trim'), t(' at cuff.')),
      h2('What to try next'),
      p(t('The button-down blouse adds a button front for a different work look.')),
    ],
  },
},
{
  slug: 'office-wrap-dress-crochet',
  title: 'Office wrap dress',
  excerpt: 'A knee-length wrap dress in DK yarn with a self-tie belt and a V-neckline. Adjustable at the waist and flattering across sizes. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g266m.finishedMeasurements.bust} cm bust. Length 95 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['office wrap dress crochet', 'work wrap dress crochet', 'V-neck wrap dress crochet'],
  glossaryTerms: [
    { slug: 'wrap-front-g266', term: 'Wrap front', definition: 'Two overlapping front panels that cross at the waist and tie at the side. The right panel crosses over the left, and both tie ends pass through side loops to secure the wrap. The V-neck forms naturally where the panels cross.' },
    { slug: 'self-tie-belt-g266', term: 'Self-tie belt', definition: 'A long dc strip worked from the side seam, tied around the waist to hold the wrap closed. Usually 3 cm wide and 100 cm long per side. Can be tied in a bow at the front or wrapped and knotted at the back.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wrap dresses are a classic office wardrobe piece, widely adapted to crochet.',
  body: {
    type: 'doc', content: [
      p(t('Work the back panel as a standard dc rectangle. Work two front panels with the '), gt('wrap-front-g266', 'wrap front'), t(' overlap and attach a '), gt('self-tie-belt-g266', 'self-tie belt'), t(' at each side seam. The panels cross naturally to form the V-neck.')),
      p(t(`Size M: ${g266m.finishedMeasurements.bust} cm bust. Length 95 cm. Knee length on a 170 cm figure.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '700 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g266m.castOnStitches + 2}. Work dc for 95 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g266m.castOnStitches * 0.6) + 2}. Work dc for 95 cm. Each panel overlaps by 10 cm at centre front to form the `), gt('wrap-front-g266', 'wrap front'), t('.')),
      h2('Belt (make 2)'),
      p(t('Chain 6. Work dc for 100 cm. Attach one '), gt('self-tie-belt-g266', 'self-tie belt'), t(' at each side seam opening.')),
      h2('What to try next'),
      p(t('The pencil dress offers a structured close-fit alternative for a more formal office setting.')),
    ],
  },
},
{
  slug: 'structured-jacket-crochet',
  title: 'Structured jacket',
  excerpt: 'A boxy cropped jacket in DK yarn with a single-button front closure and a wide round collar. Smart enough for work, relaxed enough to style casually. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g267m.finishedMeasurements.bust} cm bust. Length 55 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['structured jacket crochet', 'cropped crochet jacket', 'boxy crochet jacket'],
  glossaryTerms: [
    { slug: 'round-collar-g267', term: 'Round collar', definition: 'A flat collar worked in dc rows picked up from the neckline edge. The collar curves around the neck, sits flat on the shoulders, and measures about 6 cm deep. It is worked in one piece and seamed at the centre back.' },
    { slug: 'structured-edge-g267', term: 'Structured edge', definition: 'A double dc row worked along all outer edges of the jacket: hem, front opening, and sleeve cuffs. The double row adds firmness and body without stiffening the main fabric.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Structured cropped jackets are a versatile workwear and casual crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels as straight dc rectangles to 55 cm. Add the '), gt('round-collar-g267', 'round collar'), t(' by picking up stitches from the neckline after seaming. Work '), gt('structured-edge-g267', 'structured edges'), t(' around all outer edges with a double dc row.')),
      p(t(`Size M: ${g267m.finishedMeasurements.bust} cm bust. Length 55 cm. Single button at bust.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Button, 2.5 cm', qty: '1' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g267m.castOnStitches + 2}. Work dc for 55 cm. Work `), gt('structured-edge-g267', 'structured edge'), t(' at hem.')),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g267m.castOnStitches / 2) + 2}. Work dc for 55 cm. Work `), gt('structured-edge-g267', 'structured edge'), t(' at hem and front opening.')),
      h2('Round collar'),
      p(t('Join shoulders. Pick up stitches around neckline. Work '), gt('round-collar-g267', 'round collar'), t(' in dc rows to 6 cm deep. Seam at centre back.')),
      h2('What to try next'),
      p(t('The work blazer uses a lapel collar and waist shaping for a more traditional tailored jacket look.')),
    ],
  },
},
{
  slug: 'work-skirt-crochet',
  title: 'Work skirt',
  excerpt: 'A straight knee-length skirt in DK yarn with a waistband and side zip opening. Sits at the natural waist with a slight flare at the hem. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g268m.finishedMeasurements.bust} cm hip. Length 60 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['work skirt crochet', 'office skirt crochet', 'knee length crochet skirt'],
  glossaryTerms: [
    { slug: 'waistband-g268', term: 'Waistband', definition: 'A 5 cm band of fpdc and bpdc rib worked at the top of the skirt. Sits at the natural waist and holds the skirt in place. A zip opening is left in the side seam within the waistband height.' },
    { slug: 'hem-flare-g268', term: 'Hem flare', definition: 'A series of increases worked in the final 10 cm of the skirt length. One dc increase is placed at each side seam every two rows, adding 6 stitches per panel and producing a subtle A-line flare at the hem.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Straight skirts are a classic workwear piece adapted to DK crochet construction.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back skirt panels flat in dc. Shape the '), gt('waistband-g268', 'waistband'), t(' in fpdc/bpdc rib. Add '), gt('hem-flare-g268', 'hem flare'), t(' in the final 10 cm with increases at the side edges.')),
      p(t(`Size M: ${g268m.finishedMeasurements.bust} cm hip. Length 60 cm. Side zip in left seam.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '500 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Zip, 20 cm', qty: '1' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g268m.castOnStitches + 2}. Work dc for 55 cm. Add `), gt('hem-flare-g268', 'hem flare'), t(' over final 10 rows.')),
      h2('Front panel'),
      p(t('Work to match back.')),
      h2('Waistband and finishing'),
      p(t('Seam sides, leaving 20 cm open at top of left seam for zip. Work '), gt('waistband-g268', 'waistband'), t(' in fpdc/bpdc rib around waist. Sew in zip.')),
      h2('What to try next'),
      p(t('The pencil dress combines a fitted skirt with a bodice for a single coordinated work outfit.')),
    ],
  },
},
{
  slug: 'button-down-blouse-crochet',
  title: 'Button-down blouse',
  excerpt: 'A lightweight button-front blouse in DK yarn with a point collar and long sleeves. Mimics shirting fabric with fine-gauge dc and a neat front placket. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g269m.finishedMeasurements.bust} cm bust. Length 64 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['button down blouse crochet', 'crochet shirt blouse', 'point collar crochet blouse'],
  glossaryTerms: [
    { slug: 'point-collar-g269', term: 'Point collar', definition: 'A flat collar with pointed tips worked in dc rows from the neckline. The collar measures about 5 cm deep and 4 cm at each point. It lies flat on the shoulders and frames the neckline without standing up.' },
    { slug: 'shirt-placket-g269', term: 'Shirt placket', definition: 'A 4 cm wide dc band down the centre front of the blouse. The placket creates a clean button opening and adds structure at the front. Seven buttons are spaced evenly from collar to hem.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Button-down shirt blouses are a versatile workwear crochet garment adapted from shirting traditions.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels flat in dc. Add the '), gt('shirt-placket-g269', 'shirt placket'), t(' down each front edge. Work the '), gt('point-collar-g269', 'point collar'), t(' from the neckline after seaming. Space seven buttons evenly down the right placket.')),
      p(t(`Size M: ${g269m.finishedMeasurements.bust} cm bust. Length 64 cm. Sleeve length 56 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '650 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.2 cm', qty: '7' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g269m.castOnStitches + 2}. Work dc for 64 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g269m.castOnStitches / 2) + 2}. Work dc for 64 cm. Work `), gt('shirt-placket-g269', 'shirt placket'), t(' along each front edge, adding 7 buttonholes evenly on the right panel.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g269m.sleeveCapStitches + 2}. Work dc for 56 cm. Add dc cuff edging at wrist.`)),
      h2('Collar'),
      p(t('Join shoulders. Pick up stitches from neckline. Work '), gt('point-collar-g269', 'point collar'), t(' in dc rows. Sew buttons to right placket.')),
      h2('What to try next'),
      p(t('The office cardigan layers neatly over this blouse for a complete coordinated office look.')),
    ],
  },
},
{
  slug: 'smart-cropped-cardigan-crochet',
  title: 'Smart cropped cardigan',
  excerpt: 'A hip-length button-front cardigan in DK yarn with a neat round neck and short 3/4 sleeves. Works as a professional layer over a dress or high-waisted skirt. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g270m.finishedMeasurements.bust} cm bust. Length 50 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['smart cropped cardigan crochet', 'short cardigan work crochet', '3/4 sleeve cardigan crochet'],
  glossaryTerms: [
    { slug: 'three-quarter-sleeve-g270', term: 'Three-quarter sleeve', definition: 'A sleeve that ends between the elbow and the wrist, usually at mid-forearm. Works from the shoulder cast-on and is worked for 35 cm rather than the full 52 to 56 cm sleeve length. Finished with a narrow dc cuff edging.' },
    { slug: 'round-neck-band-g270', term: 'Round neck band', definition: 'A 3 cm rib band worked in fpdc and bpdc around the finished neckline after shoulder seaming. Sits flat around the neck without standing up, giving the cardigan a clean professional finish.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cropped smart cardigans are a popular professional layering piece across knitwear.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front panels to 50 cm. Attach '), gt('three-quarter-sleeve-g270', 'three-quarter sleeves'), t(' at the shoulder. Pick up stitches from the neckline and work the '), gt('round-neck-band-g270', 'round neck band'), t(' in fpdc/bpdc rib. Work a six-button front band.')),
      p(t(`Size M: ${g270m.finishedMeasurements.bust} cm bust. Length 50 cm. Sleeve 35 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn', qty: '500 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '6' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g270m.castOnStitches + 2}. Work dc for 50 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g270m.castOnStitches / 2) + 2}. Work dc for 50 cm.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g270m.sleeveCapStitches + 2}. Work `), gt('three-quarter-sleeve-g270', 'three-quarter sleeves'), t(' for 35 cm. Finish with dc cuff edging.')),
      h2('Neck band and front band'),
      p(t('Join shoulders and sides. Pick up stitches from neckline. Work '), gt('round-neck-band-g270', 'round neck band'), t('. Work button band down right front and buttonhole band down left front. Attach buttons.')),
      h2('What to try next'),
      p(t('The office cardigan uses full-length sleeves and a V-neck for a slightly different professional silhouette.')),
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
