/**
 * Generator: D-Garments Batch 29 -- G281-G290 maternity and nursing-friendly garments
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch29.ts
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

// G281 -- maternity pullover (PULLOVER, dk 5mm, GENEROUS_15)
const g281 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'PULLOVER' })
const g281m = g281.find(g => g.size === 'M')!

// G282 -- maternity cardigan (CARDIGAN, dk 5mm, GENEROUS_15)
const g282 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g282m = g282.find(g => g.size === 'M')!

// G283 -- nursing cardigan (CARDIGAN, dk 5mm, GENEROUS_15)
const g283 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g283m = g283.find(g => g.size === 'M')!

// G284 -- nursing top (TANK, dk 5mm, GENEROUS_15)
const g284 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'TANK' })
const g284m = g284.find(g => g.size === 'M')!

// G285 -- bump-friendly dress (DRESS, dk 5mm, GENEROUS_15)
const g285 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'DRESS' })
const g285m = g285.find(g => g.size === 'M')!

// G286 -- maternity skirt (PULLOVER as proxy, dk 5mm, GENEROUS_15)
const g286 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'PULLOVER' })
const g286m = g286.find(g => g.size === 'M')!

// G287 -- nursing vest (TANK, dk 4mm, GENEROUS_15)
const g287 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'GENEROUS_15', garmentType: 'TANK' })
const g287m = g287.find(g => g.size === 'M')!

// G288 -- postpartum wrap (CARDIGAN, aran 6mm, GENEROUS_15)
const g288 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g288m = g288.find(g => g.size === 'M')!

// G289 -- maternity lounge top (PULLOVER, aran 6mm, GENEROUS_15)
const g289 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'PULLOVER' })
const g289m = g289.find(g => g.size === 'M')!

// G290 -- nursing nightgown (DRESS, dk 5mm, GENEROUS_15)
const g290 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 16, rowsPer10cm: 18 }, easePreset: 'GENEROUS_15', garmentType: 'DRESS' })
const g290m = g290.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'maternity-pullover-crochet',
  title: 'Maternity pullover',
  excerpt: 'A soft DK pullover with generous ease designed to accommodate a growing bump. Empire-line shaping sits above the bump and the hem hangs freely below. Worked flat and seamed. Graded XS to 3XL pre-pregnancy.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g281m.finishedMeasurements.bust} cm bust. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['maternity pullover crochet', 'pregnancy jumper crochet', 'bump friendly sweater crochet'],
  glossaryTerms: [
    { slug: 'empire-line-g281', term: 'Empire line', definition: 'A seam line placed directly under the bust rather than at the natural waist. In maternity garments, the fabric above the empire line fits the bust while the section below falls in a loose column over the bump, allowing room without extra bulk across the shoulders.' },
    { slug: 'generous-ease-g281', term: 'Generous ease', definition: 'Extra width built into the garment beyond the body measurement. Here the front and back panels are made 15 cm wider than a standard fit to give the fabric room to span the bump across the second and third trimesters. Choose your pre-pregnancy size.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Maternity-specific crochet pullovers with empire-line shaping are a well-established adaptation of standard construction to accommodate bump growth.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front flat in dc. The '), gt('empire-line-g281', 'empire line'), t(' is formed by working the lower section in a wider chain than the upper body, then seaming them at the under-bust point. The '), gt('generous-ease-g281', 'generous ease'), t(' in the lower section provides room for the bump through all three trimesters.')),
      p(t(`Size M: ${g281m.finishedMeasurements.bust} cm bust. Length 65 cm. Choose your pre-pregnancy size: the pattern fits through third trimester.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft fibre', qty: '650 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Upper body (front and back)'),
      p(t(`Chain ${g281m.castOnStitches + 2}. Work dc for 35 cm. Do not fasten off.`)),
      h2('Lower body (front and back)'),
      p(t(`Chain ${g281m.castOnStitches + 10}. Work dc for 30 cm, working the final row to match the upper body stitch count. Join to upper body at the `), gt('empire-line-g281', 'empire line'), t(' with a slip stitch seam.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g281m.sleeveCapStitches + 2}. Work dc for 55 cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders and sides. Set in sleeves. The '), gt('generous-ease-g281', 'generous ease'), t(' in the lower section falls freely over the bump. Work 2 cm dc rounds around the neckline to finish.')),
      h2('What to try next'),
      p(t('The maternity cardigan uses the same construction with an open front for easy layering and nursing access.')),
    ],
  },
},
{
  slug: 'maternity-cardigan-crochet',
  title: 'Maternity cardigan',
  excerpt: 'An open-front DK cardigan with generous ease for wearing through pregnancy and beyond. The front panels hang loose and provide easy access for nursing after birth. Worked flat and seamed. Graded XS to 3XL pre-pregnancy.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g282m.finishedMeasurements.bust} cm bust. Length 68 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['maternity cardigan crochet', 'pregnancy open cardigan crochet', 'nursing open front crochet'],
  glossaryTerms: [
    { slug: 'open-front-maternity-g282', term: 'Open-front maternity cardigan', definition: 'A cardigan with no button or tie fastening. Both fronts hang loose. During pregnancy the open front accommodates the bump without gaping. After birth the same opening allows nursing access without undressing.' },
    { slug: 'bump-length-g282', term: 'Bump length', definition: 'The extended front length used in maternity garments. The front panels are worked 5 cm longer than the back to allow for the hem to sit level when the fabric is pulled forward over the bump. Without this, the front hem rides up.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open-front maternity cardigans are among the most versatile garments for pregnancy and the postpartum period, worn across both stages without alteration.',
  body: {
    type: 'doc', content: [
      p(t('Work an '), gt('open-front-maternity-g282', 'open-front maternity cardigan'), t(' in dc. The front panels use '), gt('bump-length-g282', 'bump length'), t(': work each front panel 5 cm longer than the back to keep the hem level over the bump.')),
      p(t(`Size M: ${g282m.finishedMeasurements.bust} cm bust. Back length 68 cm. Front panel length 73 cm. Sleeve length 58 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft fibre', qty: '750 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g282m.castOnStitches + 2}. Work dc for 68 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g282m.castOnStitches / 2) + 2}. Work dc for 73 cm using `), gt('bump-length-g282', 'bump length'), t('. Work one dc row along the front edge to neaten.')),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g282m.sleeveCapStitches + 2}. Work dc for 58 cm.`)),
      h2('Assembly'),
      p(t('Seam shoulders. Set in sleeves. Seam sides. The '), gt('open-front-maternity-g282', 'open-front'), t(' hangs loose throughout pregnancy and nursing. Block to shape.')),
      h2('What to try next'),
      p(t('The nursing cardigan is a button-front version with a gap in the centre for nursing access.')),
    ],
  },
},
{
  slug: 'nursing-cardigan-crochet',
  title: 'Nursing cardigan',
  excerpt: 'A button-front cardigan adapted for nursing access. The front band carries two button positions near the hem and two near the neckline, leaving the centre unbuttoned for a discreet opening. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g283m.finishedMeasurements.bust} cm bust. Length 65 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['nursing cardigan crochet', 'breastfeeding cardigan crochet', 'postpartum button cardigan crochet'],
  glossaryTerms: [
    { slug: 'nursing-opening-g283', term: 'Nursing opening', definition: 'A deliberate gap in the button band that allows the front to be pulled aside for feeding without unbuttoning the whole garment. Achieved by placing buttons only at the hem and neckline, leaving the centre breast area unbuttons. The garment stays on the body while feeding.' },
    { slug: 'nursing-button-band-g283', term: 'Nursing button band', definition: 'A 4-row dc band worked along each front edge after assembly. Buttonholes are placed on the right band at positions 1 and 2 from the hem and positions 1 and 2 from the neckline only. The centre 4 buttonhole positions are omitted to create the nursing opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Nursing cardigans with strategic button placement are a practical adaptation of a classic cardigan construction for the postpartum period.',
  body: {
    type: 'doc', content: [
      p(t('Work a standard dc cardigan with a '), gt('nursing-button-band-g283', 'nursing button band'), t(' that creates a '), gt('nursing-opening-g283', 'nursing opening'), t(' across the chest. The cardigan looks like a conventional button-front when closed at hem and neckline but folds back easily for feeding.')),
      p(t(`Size M: ${g283m.finishedMeasurements.bust} cm bust. Length 65 cm. Sleeve length 58 cm. 4 buttons total.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft fibre', qty: '800 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Buttons, 1.5 cm', qty: '4' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g283m.castOnStitches + 2}. Work dc for 65 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g283m.castOnStitches / 2) + 2}. Work dc for 65 cm.`)),
      h2('Button bands'),
      p(t('Seam shoulders and sides. Work '), gt('nursing-button-band-g283', 'nursing button bands'), t(' along each front. Place 4 buttonholes on the right band: 2 near the hem, 2 near the neckline. Leave the centre unworked for the '), gt('nursing-opening-g283', 'nursing opening'), t('. Sew buttons to left band.')),
      h2('Assembly'),
      p(t('Set in sleeves. Seam sleeve underarms. The centre opening provides nursing access without removing the garment.')),
      h2('What to try next'),
      p(t('The nursing top is a sleeveless version built for warmer weather and easier indoor nursing.')),
    ],
  },
},
{
  slug: 'nursing-top-crochet',
  title: 'Nursing top',
  excerpt: 'A sleeveless top with a wrap-style front that folds back for nursing access. Two short front panels cross at the chest and tie at the side seams. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g284m.finishedMeasurements.bust} cm bust. Length 58 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['nursing top crochet', 'breastfeeding top crochet', 'wrap front nursing tank crochet'],
  glossaryTerms: [
    { slug: 'wrap-front-g284', term: 'Wrap front', definition: 'A garment front made from two overlapping panels rather than a single piece. Each panel covers one breast and wraps past the centre. For nursing, pulling one panel aside exposes that side without disturbing the rest of the garment. The panels are held in place by ties at the side seam.' },
    { slug: 'side-tie-g284', term: 'Side tie', definition: 'A crocheted chain cord, about 40 cm long, worked from the lower corner of each front panel and from the corresponding point on the back. The front and back ties at each side are knotted together to hold the wrap closed. The ties are left long enough to adjust through the postpartum months.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wrap-front nursing tops are a practical garment pattern used widely in hand crochet and knitting for the postpartum period.',
  body: {
    type: 'doc', content: [
      p(t('Work a rectangular back and two overlapping front panels to create a '), gt('wrap-front-g284', 'wrap front'), t('. The panels cross at the chest and are secured with '), gt('side-tie-g284', 'side ties'), t(' so each side can be opened independently for nursing.')),
      p(t(`Size M: ${g284m.finishedMeasurements.bust} cm bust. Length 58 cm. Each front panel 60% of the bust width, worked to the full length.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft breathable fibre', qty: '500 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g284m.castOnStitches + 2}. Work dc for 58 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g284m.castOnStitches * 0.6) + 2}. Work dc for 58 cm. Work a dc edging along the angled front edge.`)),
      h2('Side ties'),
      p(t('At each lower front corner, work a chain '), gt('side-tie-g284', 'side tie'), t(' 40 cm long. Work matching ties at the back side edges. Knot front and back ties together at each side to close.')),
      h2('Finishing'),
      p(t('Seam at shoulders only. Edge armholes and neckline with dc. The '), gt('wrap-front-g284', 'wrap front'), t(' crosses at the chest and ties at the sides. Either panel folds back for nursing access.')),
      h2('What to try next'),
      p(t('The nursing vest uses a similar wrap-front in a longer vest shape for extra coverage.')),
    ],
  },
},
{
  slug: 'bump-friendly-dress-crochet',
  title: 'Bump-friendly dress',
  excerpt: 'A sleeveless shift dress with generous ease and a short empire seam for wearing through pregnancy. The straight column below the empire seam accommodates the bump without fitted waist shaping. Worked flat and seamed. Graded XS to 3XL pre-pregnancy.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g285m.finishedMeasurements.bust} cm bust. Length 95 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['maternity dress crochet', 'bump friendly shift dress crochet', 'pregnancy dress crochet'],
  glossaryTerms: [
    { slug: 'empire-seam-dress-g285', term: 'Empire seam', definition: 'A horizontal join line worked directly under the bust. The bodice and skirt sections are worked separately and joined at this line. The skirt hangs as a straight column below, with no waist darts or side shaping to restrict the bump.' },
    { slug: 'skirt-flare-g285', term: 'Skirt flare', definition: 'A gradual increase in stitch count added over the first 10 rows below the empire seam. Working one extra dc every 10 stitches for 10 rows adds gentle width at the hem without creating a fitted look. The flare keeps the fabric falling clear of the legs.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Empire-line maternity dresses are a long-established garment type across both knit and crochet design, with the seam placement chosen specifically for bump accommodation.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back bodice panels to the under-bust point. Work front and back skirt panels with '), gt('skirt-flare-g285', 'skirt flare'), t(' below the '), gt('empire-seam-dress-g285', 'empire seam'), t('. Join bodice to skirt at the empire seam. Seam sides and shoulders.')),
      p(t(`Size M: ${g285m.finishedMeasurements.bust} cm bust. Total length 95 cm. Bodice 30 cm. Skirt 65 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft fibre', qty: '900 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Bodice (front and back)'),
      p(t(`Chain ${g285m.castOnStitches + 2}. Work dc for 30 cm. Fasten off.`)),
      h2('Skirt (front and back)'),
      p(t(`Chain ${g285m.castOnStitches + 2}. Work dc with `), gt('skirt-flare-g285', 'skirt flare'), t(' over the first 10 rows. Continue straight for 55 cm. Join to bodice at the '), gt('empire-seam-dress-g285', 'empire seam'), t(' with slip stitch.')),
      h2('Assembly'),
      p(t('Seam at shoulders and sides. Edge armholes and neckline with dc. The dress works in any trimester: choose your pre-pregnancy size.')),
      h2('What to try next'),
      p(t('The maternity skirt uses only the lower panel as a standalone piece, worn with any top.')),
    ],
  },
},
{
  slug: 'maternity-skirt-crochet',
  title: 'Maternity skirt',
  excerpt: 'A pull-on midi skirt with a wide elastic waistband and generous hip ease for wearing through pregnancy. The waistband folds over for extra belly support. Worked flat and seamed. Graded XS to 3XL pre-pregnancy.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g286m.finishedMeasurements.bust} cm hip. Length 70 cm including waistband.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['maternity skirt crochet', 'pregnancy midi skirt crochet', 'elastic waist maternity skirt crochet'],
  glossaryTerms: [
    { slug: 'fold-over-waistband-g286', term: 'Fold-over waistband', definition: 'A wide dc casing at the top of the skirt, deep enough to fold down over the bump. The waistband is worked to 16 cm, then threaded with wide elastic. When folded down, the extra fabric cradles the bump from below; when folded up, it sits at the natural waist for the early months.' },
    { slug: 'side-shaping-skirt-g286', term: 'Side shaping', definition: 'A pair of dc2tog decreases at each side edge worked from the widest hip point upward to meet the waistband. This takes in the skirt body slightly so the waistband sits higher without the fabric hanging in a column from the widest hip.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Pull-on maternity skirts with fold-over waistbands are a practical and adaptable garment worn from early pregnancy through postpartum.',
  body: {
    type: 'doc', content: [
      p(t('Work front and back skirt panels in dc. Add '), gt('side-shaping-skirt-g286', 'side shaping'), t(' near the top edge. Seam sides. Work the '), gt('fold-over-waistband-g286', 'fold-over waistband'), t(' in dc rounds at the top. Thread wide elastic.')),
      p(t(`Size M: ${g286m.finishedMeasurements.bust} cm hip. Skirt length 54 cm. Waistband 16 cm, folded to 8 cm in wear.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft fibre', qty: '600 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '5 cm wide elastic', qty: '90 cm' },
      ]),
      h2('Skirt panels (front and back)'),
      p(t(`Chain ${g286m.castOnStitches + 2}. Work dc for 54 cm. Work `, ), gt('side-shaping-skirt-g286', 'side shaping'), t(': dc2tog at each side edge over the top 10 cm, 4 times.')),
      h2('Waistband'),
      p(t('Work 16 rows of dc in the round at the top edge for the '), gt('fold-over-waistband-g286', 'fold-over waistband'), t('. Thread elastic at mid-height. The top 8 cm folds down over the bump or up above the waist.')),
      h2('What to try next'),
      p(t('The bump-friendly dress combines a bodice with this skirt panel as a single garment.')),
    ],
  },
},
{
  slug: 'nursing-vest-crochet',
  title: 'Nursing vest',
  excerpt: 'A longer vest with wrap-front panels for nursing access. The wrap crosses at the chest and ties at the back for a secure fit that stays in place during feeding. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g287m.finishedMeasurements.bust} cm bust. Length 68 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['nursing vest crochet', 'breastfeeding vest crochet', 'wrap front nursing layer crochet'],
  glossaryTerms: [
    { slug: 'wrap-cross-g287', term: 'Wrap cross', definition: 'The point at the centre chest where the two front panels overlap. The right panel passes over the left. Each panel is long enough to reach the opposite side seam, so the cross sits at bust level. Pulling one panel aside opens one side for nursing.' },
    { slug: 'back-tie-anchor-g287', term: 'Back tie anchor', definition: 'A chain cord attached at the inner edge of each front panel and passed around the back to tie at the opposite side seam. The anchor cords keep the wrap cross in position and prevent the panels from pulling apart during movement.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Wrap-front nursing vests are a popular crochet project for the postpartum period, offering layering coverage with hands-free nursing access.',
  body: {
    type: 'doc', content: [
      p(t('Work a back panel and two front panels wide enough to cross at the chest. The '), gt('wrap-cross-g287', 'wrap cross'), t(' sits at bust level. Thread '), gt('back-tie-anchor-g287', 'back tie anchors'), t(' from each front panel inner edge around the back to the opposite side seam to hold the cross in place.')),
      p(t(`Size M: ${g287m.finishedMeasurements.bust} cm bust. Length 68 cm. Each front panel 65% of full bust width.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft fibre', qty: '600 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g287m.castOnStitches + 2}. Work dc for 68 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g287m.castOnStitches * 0.65) + 2}. Work dc for 68 cm. The inner edge is straight; the outer edge aligns with the back side seam.`)),
      h2('Back tie anchors'),
      p(t('At the inner top edge of each front panel, work a chain '), gt('back-tie-anchor-g287', 'back tie anchor'), t(' 60 cm long. Thread each cord around the back waist and tie to the opposite side seam to fix the '), gt('wrap-cross-g287', 'wrap cross'), t('.')),
      h2('Finishing'),
      p(t('Seam at shoulders only. Edge armholes and neckline in dc. The vest ties at the back and the wrap cross holds at the chest.')),
      h2('What to try next'),
      p(t('The postpartum wrap is a looser and more relaxed version for immediate postpartum comfort.')),
    ],
  },
},
{
  slug: 'postpartum-wrap-crochet',
  title: 'Postpartum wrap',
  excerpt: 'A roomy aran-weight wrap cardigan for the early postpartum weeks. Oversized and soft, with long front panels that cross and tie at the back. No shaping, no seaming at the sides. Worked flat. Graded XS to 3XL.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-6-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 6 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g288m.finishedMeasurements.bust} cm bust. Length 70 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['postpartum wrap crochet', 'new mum wrap cardigan crochet', 'nursing wrap robe crochet'],
  glossaryTerms: [
    { slug: 'wrap-tie-g288', term: 'Wrap tie', definition: 'A long chain cord attached at the waist edge of each front panel, 90 cm long. The two ties cross at the front waist, pass behind the body, and tie at the front again in a bow. The tie keeps the wrap closed over the chest and can be loosened for nursing access in seconds.' },
    { slug: 'cocooning-ease-g288', term: 'Cocooning ease', definition: 'Extra width beyond generous ease, used here specifically for early postpartum wear. The back and front panels together measure 20 cm more than the body at the widest point. The extra fabric is gathered by the wrap ties and drapes softly around the torso.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Postpartum wrap garments are a well-known project type in hand crochet and knitting, valued for their comfort, quick access, and forgiving fit during body changes.',
  body: {
    type: 'doc', content: [
      p(t('Work a wide back panel and two long front panels as dc rectangles. No side seams or waist shaping. The '), gt('cocooning-ease-g288', 'cocooning ease'), t(' is held by '), gt('wrap-tie-g288', 'wrap ties'), t(' at the waist that cross at the front and tie behind the back.')),
      p(t(`Size M: ${g288m.finishedMeasurements.bust} cm bust. Length 70 cm. The wrap is intentionally roomy for early postpartum wear.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn, very soft fibre', qty: '700 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g288m.castOnStitches + 2}. Work dc for 70 cm.`)),
      h2('Front panels (make 2)'),
      p(t(`Chain ${Math.round(g288m.castOnStitches / 2) + 2}. Work dc for 70 cm. At the waist point (35 cm from hem), attach a `), gt('wrap-tie-g288', 'wrap tie'), t(' by working a 90 cm chain from the side edge of the panel.')),
      h2('Sleeves (make 2, optional)'),
      p(t(`Chain ${g288m.sleeveCapStitches + 2}. Work dc for 55 cm. Set into shoulder opening or leave sleeveless.`)),
      h2('Assembly'),
      p(t('Seam at shoulders only. The '), gt('cocooning-ease-g288', 'cocooning ease'), t(' at the sides is left open. Tie at the front waist, cross the ties behind the body, and tie at the front again. This holds the wrap closed without restricting.')),
      h2('What to try next'),
      p(t('The maternity lounge top is a more fitted version for later in the postpartum recovery period.')),
    ],
  },
},
{
  slug: 'maternity-lounge-top-crochet',
  title: 'Maternity lounge top',
  excerpt: 'A cosy aran-weight pullover for wearing at home through pregnancy and the postpartum weeks. Oversized fit, wide neckline, and drop sleeves for comfort. Worked flat and seamed. Graded XS to 3XL pre-pregnancy.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-6-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 6 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g289m.finishedMeasurements.bust} cm bust. Length 62 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['maternity lounge top crochet', 'pregnancy loungewear crochet', 'postpartum cosy top crochet'],
  glossaryTerms: [
    { slug: 'wide-neck-g289', term: 'Wide neckline', definition: 'A neckline opening 28 cm across, achieved by casting off the centre 40% of stitches on the front panel before working each shoulder separately. The wide opening slips over the head without needing a button or zipper, and pairs well with a nursing bralette underneath.' },
    { slug: 'drop-sleeve-lounge-g289', term: 'Drop sleeve', definition: 'A sleeve set without a shaped armhole. The back and front panels are worked to their full length with straight side edges. The sleeve top is seamed directly to the body at the shoulder, creating a relaxed oversize shape. Drop sleeves are the simplest sleeve construction and suit lounge garments well.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Oversized lounge pullovers for pregnancy and postpartum wear are a practical and popular crochet garment project.',
  body: {
    type: 'doc', content: [
      p(t('Work back and front as straight dc rectangles with a '), gt('wide-neck-g289', 'wide neckline'), t(' on the front. Attach '), gt('drop-sleeve-lounge-g289', 'drop sleeves'), t(' at the shoulder seam for a relaxed oversize shape. No waist shaping.')),
      p(t(`Size M: ${g289m.finishedMeasurements.bust} cm bust. Length 62 cm. Neckline 28 cm across. Sleeve length 52 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn, very soft fibre', qty: '800 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back panel'),
      p(t(`Chain ${g289m.castOnStitches + 2}. Work dc for 62 cm.`)),
      h2('Front panel'),
      p(t(`Chain ${g289m.castOnStitches + 2}. Work dc for 54 cm. Shape `), gt('wide-neck-g289', 'wide neckline'), t(`: cast off centre ${Math.round(g289m.castOnStitches * 0.4)} sts over 8 cm. Work each shoulder separately.`)),
      h2('Sleeves (make 2)'),
      p(t(`Chain ${g289m.sleeveCapStitches + 2}. Work dc for 52 cm as `, ), gt('drop-sleeve-lounge-g289', 'drop sleeves'), t('.')),
      h2('Assembly'),
      p(t('Seam shoulders. Set in '), gt('drop-sleeve-lounge-g289', 'drop sleeves'), t('. Seam sides and sleeve underarms. Edge neckline with 2 rows of dc. The oversize fit works through the third trimester and in the postpartum weeks.')),
      h2('What to try next'),
      p(t('The nursing nightgown uses the same relaxed shape as a full-length nightwear piece.')),
    ],
  },
},
{
  slug: 'nursing-nightgown-crochet',
  title: 'Nursing nightgown',
  excerpt: 'A knee-length nightgown with a crossover front bodice for nursing at night. The bodice wraps to adjust as the body changes through late pregnancy and early postpartum. Worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-5-0mm',
  gauge: '16 dc x 18 rows = 10 x 10 cm in DK on a 5 mm hook.',
  finishedSize: `Designed to fit XS-3XL pre-pregnancy with generous ease for bump growth. Size M: ${g290m.finishedMeasurements.bust} cm bust. Length 90 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['nursing nightgown crochet', 'maternity nightie crochet', 'breastfeeding nightgown crochet'],
  glossaryTerms: [
    { slug: 'crossover-bodice-g290', term: 'Crossover bodice', definition: 'A bodice construction using two overlapping front panels rather than a single front piece. Each panel covers one side of the chest and crosses past the centre line. The overlap is held by a tie at the under-bust. For nursing, pulling one panel aside gives access without lifting the whole garment.' },
    { slug: 'nightgown-skirt-g290', term: 'Nightgown skirt', definition: 'A straight dc panel worked from the under-bust to the hem. The skirt hangs from the empire seam in a column with no shaping. The wide width provides room for the bump during late pregnancy and falls freely in the postpartum months.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Nursing nightgowns with wrap or crossover fronts are a practical garment for the late pregnancy and postpartum period, combining comfortable nightwear with easy nursing access.',
  body: {
    type: 'doc', content: [
      p(t('Work a '), gt('crossover-bodice-g290', 'crossover bodice'), t(' with two overlapping front panels held by an under-bust tie. Attach the '), gt('nightgown-skirt-g290', 'nightgown skirt'), t(' at the empire seam and work straight to knee length. Seam at shoulders and side seams.')),
      p(t(`Size M: ${g290m.finishedMeasurements.bust} cm bust. Total length 90 cm. Bodice 28 cm. Skirt 62 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'DK yarn, soft washable fibre', qty: '850 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back bodice and back skirt'),
      p(t(`Chain ${g290m.castOnStitches + 2}. Work dc for 28 cm (bodice). Work a new chain ${g290m.castOnStitches + 4}. Work dc for 62 cm (skirt). Join at empire seam with slip stitch.`)),
      h2('Front bodice panels (make 2)'),
      p(t(`Chain ${Math.round(g290m.castOnStitches * 0.6) + 2}. Work dc for 28 cm for the `), gt('crossover-bodice-g290', 'crossover bodice'), t('. At the lower edge, work a 50 cm chain tie.')),
      h2('Front skirt'),
      p(t(`Chain ${g290m.castOnStitches + 4}. Work `, ), gt('nightgown-skirt-g290', 'nightgown skirt'), t(' dc for 62 cm. Join to front bodice panels at the empire seam.')),
      h2('Assembly'),
      p(t('Seam at shoulders and sides. Cross the front bodice panels and thread the ties through the side seams to tie at the back. Edge armholes and neckline with dc.')),
      h2('What to try next'),
      p(t('The nursing top is a sleeveless daywear version of the same crossover construction.')),
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
