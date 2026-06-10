/**
 * Generator: D-Garments Batch 22 -- Extended sizes and adaptive styles G211-G220
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch22.ts
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

// Extended plus sizing array: XS to 6XL (10 sizes)
const W10 = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'] as const

// Reduced array for patterns graded XS-3XL only
const W7 = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

// G211: extended-size-pullover (aran 5mm, DROP_SHOULDER PULLOVER, XS-6XL)
const g211 = gradeAllSizes([...W10], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g211m = g211.find(g => g.size === 'M')!
const g211_6xl = g211.find(g => g.size === '6XL')!

// G212: extended-size-cardigan (aran 5mm, DROP_SHOULDER CARDIGAN, XS-6XL)
const g212 = gradeAllSizes([...W10], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g212m = g212.find(g => g.size === 'M')!

// G213: extended-size-vest (aran 5mm, DROP_SHOULDER VEST, XS-6XL)
const g213 = gradeAllSizes([...W10], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'VEST' })
const g213m = g213.find(g => g.size === 'M')!

// G214: open-back-top (dk 4mm, DROP_SHOULDER PULLOVER, XS-3XL)
const g214 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'PULLOVER' })
const g214m = g214.find(g => g.size === 'M')!

// G215: one-shoulder-top (dk 4mm, DROP_SHOULDER PULLOVER, XS-3XL)
const g215 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'PULLOVER' })
const g215m = g215.find(g => g.size === 'M')!

// G216: adaptive-pullover (aran 5mm, DROP_SHOULDER PULLOVER, XS-3XL)
const g216 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'PULLOVER' })
const g216m = g216.find(g => g.size === 'M')!

// G217: side-button-cardigan (aran 5mm, DROP_SHOULDER CARDIGAN, XS-3XL)
const g217 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g217m = g217.find(g => g.size === 'M')!

// G218: tube-skirt (dk 4mm, no drop shoulder, XS-3XL)
const g218 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_2', garmentType: 'DRESS' })
const g218m = g218.find(g => g.size === 'M')!

// G219: swing-dress (dk 4mm, DROP_SHOULDER DRESS, XS-3XL)
const g219 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 18, rowsPer10cm: 20 }, easePreset: 'POSITIVE_4', garmentType: 'DRESS' })
const g219m = g219.find(g => g.size === 'M')!

// G220: tent-dress (aran 5mm, DROP_SHOULDER DRESS, XS-3XL, GENEROUS_15)
const g220 = gradeAllSizes([...W7], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'GENEROUS_15', garmentType: 'DRESS' })
const g220m = g220.find(g => g.size === 'M')!

const PATTERNS = [
  {
    slug: 'extended-size-pullover-crochet',
    title: 'Extended-size pullover',
    excerpt: 'A classic drop-shoulder pullover graded from XS to 6XL in aran yarn. Simple dc construction with minimal shaping. Includes extended plus sizes up to 6XL.',
    difficulty: 'BEGINNER' as const,
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 6XL. Size M: ${g211m.finishedMeasurements.bust} cm bust. Size 6XL: ${g211_6xl.finishedMeasurements.bust} cm bust. Length varies with size.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['extended size pullover crochet', 'plus size pullover crochet', 'crochet pullover XS to 6XL', 'big size crochet sweater'],
    glossaryTerms: [
      { slug: 'drop-shoulder-g211', term: 'Drop shoulder', definition: 'A construction where the sleeve is joined to the body at a point below the natural shoulder line. No armhole shaping is required, making grading across a wide size range straightforward.' },
      { slug: 'full-bust-ease-g211', term: 'Full bust ease', definition: 'The total width added above the body bust measurement to give comfortable room across the chest and back. This pullover uses 4 cm of positive ease at each size.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Extended-size grading to 6XL responds to demand for inclusive crochet patterns.',
    body: {
      type: 'doc', content: [
        p(t('The '), gt('drop-shoulder-g211', 'drop-shoulder'), t(' construction keeps every size to the same flat-panel method: two rectangles for front and back, two sleeves, all seamed. '), gt('full-bust-ease-g211', 'Full bust ease'), t(' of 4 cm is applied at each size from XS through to 6XL so the fit is consistent.')),
        p(t(`Size M: ${g211m.finishedMeasurements.bust} cm bust, ${g211m.finishedMeasurements.length} cm body length. Size 6XL: ${g211_6xl.finishedMeasurements.bust} cm bust.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '700 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g211m.backStitches + 2}. Work dc rows to ${g211m.finishedMeasurements.length} cm. Fasten off.`)),
        h2('Front panel'),
        p(t('Work to match back. Leave centre 20 sts unworked at the top for the neckline.')),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g211m.sleeveStitches + 2}. Work dc for ${g211m.finishedMeasurements.sleeveLength} cm. Fasten off.`)),
        h2('Assembly'),
        p(t('Seam shoulders. Set sleeves into the '), gt('drop-shoulder-g211', 'drop-shoulder'), t(' opening. Seam sides and sleeves.')),
        h2('What to try next'),
        p(t('The extended-size cardigan uses the same front and back panels with a centre-front opening.')),
      ],
    },
  },
  {
    slug: 'extended-size-cardigan-crochet',
    title: 'Extended-size cardigan',
    excerpt: 'A drop-shoulder open-front cardigan graded from XS to 6XL in aran yarn. No button bands: worn open or with a belt. Includes extended plus sizes up to 6XL.',
    difficulty: 'BEGINNER' as const,
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 6XL. Size M: ${g212m.finishedMeasurements.bust} cm bust open. Length varies with size.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['extended size cardigan crochet', 'plus size cardigan crochet', 'crochet cardigan XS to 6XL', 'open front cardigan crochet'],
    glossaryTerms: [
      { slug: 'open-front-g212', term: 'Open front', definition: 'A cardigan that has no button band or fastening at the centre front. The two front panels hang apart or are held with a belt. Simpler to finish than a buttoned band.' },
      { slug: 'front-panel-g212', term: 'Front panel', definition: 'Each front of a cardigan is worked as a separate narrower rectangle. The two front panels together equal the width of the single back panel.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Extended-size grading to 6XL responds to demand for inclusive crochet patterns.',
    body: {
      type: 'doc', content: [
        p(t('Work the back as a full-width rectangle, then each '), gt('front-panel-g212', 'front panel'), t(' as a narrower rectangle at half that width. The '), gt('open-front-g212', 'open front'), t(' needs no button band. Seam shoulders and set the sleeves in a drop-shoulder position.')),
        p(t(`Size M: back ${g212m.backStitches} sts, each front ${Math.round(g212m.backStitches / 2)} sts. Body length ${g212m.finishedMeasurements.length} cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '750 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g212m.backStitches + 2}. Work dc for ${g212m.finishedMeasurements.length} cm.`)),
        h2('Front panels (make 2)'),
        p(t(`Chain ${Math.round(g212m.backStitches / 2) + 2}. Work dc for ${g212m.finishedMeasurements.length} cm.`)),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g212m.sleeveStitches + 2}. Work dc for ${g212m.finishedMeasurements.sleeveLength} cm.`)),
        h2('Assembly'),
        p(t('Seam shoulders. Join '), gt('front-panel-g212', 'front panels'), t(' to back at shoulders. Set sleeves. Seam sides and underarms.')),
        h2('What to try next'),
        p(t('The extended-size vest uses the same back panel without sleeves.')),
      ],
    },
  },
  {
    slug: 'extended-size-vest-crochet',
    title: 'Extended-size vest',
    excerpt: 'A sleeveless drop-shoulder vest graded from XS to 6XL in aran yarn. Armhole edges are finished with a round of dc. Includes extended plus sizes up to 6XL.',
    difficulty: 'BEGINNER' as const,
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 6XL. Size M: ${g213m.finishedMeasurements.bust} cm bust. Length varies with size.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['extended size vest crochet', 'plus size crochet vest', 'crochet tabard XS to 6XL', 'sleeveless crochet top large sizes'],
    glossaryTerms: [
      { slug: 'armhole-edging-g213', term: 'Armhole edging', definition: 'A single round of dc worked around the armhole opening to prevent the edge from curling and give a clean finish. No sleeve is attached.' },
      { slug: 'shoulder-seam-g213', term: 'Shoulder seam', definition: 'The seam joining the top of the front and back panels at each shoulder. On a vest this is a short seam, leaving a wide armhole opening on each side.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Extended-size grading to 6XL responds to demand for inclusive crochet patterns.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back panels as matching dc rectangles. Seam the '), gt('shoulder-seam-g213', 'shoulder seams'), t(', leaving the armhole open. Work one round of dc as '), gt('armhole-edging-g213', 'armhole edging'), t(' on each side. Seam the side seams to the underarm.')),
        p(t(`Size M: ${g213m.backStitches} sts wide, ${g213m.finishedMeasurements.length} cm long. Armhole opening approx. 22 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '400 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g213m.backStitches + 2}. Work dc for ${g213m.finishedMeasurements.length} cm. Fasten off.`)),
        h2('Front panel'),
        p(t('Work to match back. Shape neckline by leaving centre 18 sts unworked at the top.')),
        h2('Finishing'),
        p(t('Seam '), gt('shoulder-seam-g213', 'shoulders'), t(' and sides. Work '), gt('armhole-edging-g213', 'armhole edging'), t(' around each opening.')),
        h2('What to try next'),
        p(t('The extended-size pullover adds sleeves using the same back and front panels.')),
      ],
    },
  },
  {
    slug: 'open-back-top-crochet',
    title: 'Open-back top',
    excerpt: 'A lightweight DK top with a panel of open-work at the back, held closed with two tie cords at the centre back. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE' as const,
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g214m.finishedMeasurements.bust} cm bust. Length approx. 55 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-treble'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['open back top crochet', 'backless crochet top', 'crochet tie back top', 'open work back crochet'],
    glossaryTerms: [
      { slug: 'open-back-panel-g214', term: 'Open back panel', definition: 'The centre-back section of the top worked in an alternating treble and chain-space mesh instead of solid dc. The mesh reveals the skin while the treble columns give structure.' },
      { slug: 'tie-cord-g214', term: 'Tie cord', definition: 'A length of dc chain worked from each side of the open-back panel. The two cords cross at the back and tie in a bow or knot at the waist.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Open-back tops are a popular warm-weather crochet garment style.',
    body: {
      type: 'doc', content: [
        p(t('Work a solid dc front panel to full width. For the back, work two side panels in solid dc and the '), gt('open-back-panel-g214', 'open back panel'), t(' between them in treble and chain-space mesh. Seam shoulders and sides. Add a '), gt('tie-cord-g214', 'tie cord'), t(' at each side of the open panel.')),
        p(t(`Size M: front ${g214m.backStitches} sts, back side panels each ${Math.round(g214m.backStitches / 4)} sts, centre open mesh panel ${Math.round(g214m.backStitches / 2)} sts wide.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK yarn', qty: '350 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Front panel'),
        p(t(`Chain ${g214m.backStitches + 2}. Work dc for 55 cm. Fasten off.`)),
        h2('Back panels'),
        p(t(`Work two solid dc side panels, each ${Math.round(g214m.backStitches / 4)} sts wide, for 55 cm. Work the `, ), gt('open-back-panel-g214', 'open back panel'), t(' in tr and ch-2 spaces between them.')),
        h2('Ties'),
        p(t('Chain 60 from each inner edge of the back side panels to form the '), gt('tie-cord-g214', 'tie cords'), t('. Fasten off.')),
        h2('What to try next'),
        p(t('The one-shoulder top uses asymmetric placement for a different open-work effect.')),
      ],
    },
  },
  {
    slug: 'one-shoulder-top-crochet',
    title: 'One-shoulder top',
    excerpt: 'An asymmetric top with a single shoulder strap and one bare shoulder. Worked flat and seamed. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE' as const,
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g215m.finishedMeasurements.bust} cm bust. Length approx. 55 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['one shoulder top crochet', 'asymmetric top crochet', 'single strap crochet top', 'off shoulder one strap crochet'],
    glossaryTerms: [
      { slug: 'one-shoulder-g215', term: 'One-shoulder neckline', definition: 'An asymmetric neckline that curves from a high point at one shoulder strap across to the opposite underarm, leaving one shoulder bare. The shaping is worked with dc2tog decreases along the neckline curve.' },
      { slug: 'dc2tog-g215', term: 'Dc2tog', definition: 'Double crochet two stitches together to reduce stitch count by one. Used here to shape the diagonal neckline from the strap side down to the open shoulder side.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'One-shoulder asymmetric tops are a popular modern crochet garment style.',
    body: {
      type: 'doc', content: [
        p(t('Work the front and back as identical dc rectangles to the underarm. Shape the '), gt('one-shoulder-g215', 'one-shoulder neckline'), t(' on the front only by working '), gt('dc2tog-g215', 'dc2tog'), t(' decreases diagonally from the full-width side down to a single shoulder strap width at the opposite side. Leave the back straight for a strapless back.')),
        p(t(`Size M: body ${g215m.backStitches} sts wide. Neckline starts at row 45 and decreases to a strap of 10 sts over 10 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK yarn', qty: '300 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g215m.backStitches + 2}. Work dc for 55 cm. Shape straight across the top. Fasten off.`)),
        h2('Front panel'),
        p(t(`Chain ${g215m.backStitches + 2}. Work dc to row 45. Shape `, ), gt('one-shoulder-g215', 'one-shoulder neckline'), t(' using '), gt('dc2tog-g215', 'dc2tog'), t(' on the left edge every row for 10 cm until strap width is 10 sts.')),
        h2('Assembly'),
        p(t('Seam the single shoulder strap. Seam the side seams.')),
        h2('What to try next'),
        p(t('The open-back top uses back mesh panels to create a different open-work effect.')),
      ],
    },
  },
  {
    slug: 'crochet-adaptive-pullover',
    title: 'Adaptive pullover',
    excerpt: 'A pullover designed for adaptive dressing: side seams are left partially open and finished with snap tape so the garment can be put on without pulling over the head. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE' as const,
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g216m.finishedMeasurements.bust} cm bust. Length ${g216m.finishedMeasurements.length} cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['adaptive pullover crochet', 'open side seam pullover crochet', 'crochet snap tape pullover', 'crochet easy-dress pullover'],
    glossaryTerms: [
      { slug: 'adaptive-opening-g216', term: 'Adaptive side opening', definition: 'The lower 20 cm of each side seam is left unsewn and edged with dc. Snap tape is hand-sewn along both edges so the opening can be fastened and unfastened without stretching or pulling fabric.' },
      { slug: 'snap-tape-g216', term: 'Snap tape', definition: 'A ribbon with evenly spaced press-studs attached. Sewn by hand along the crochet edge of each side opening so the garment can be fastened at the side rather than pulled over the head.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Adaptive clothing design allows people with limited mobility to dress independently.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back panels in dc exactly as a standard drop-shoulder pullover. When seaming the sides, leave the lower 20 cm open on each side as an '), gt('adaptive-opening-g216', 'adaptive side opening'), t('. Edge both raw edges with dc. Hand-sew '), gt('snap-tape-g216', 'snap tape'), t(' along the inner edges of the openings.')),
        p(t(`Size M: ${g216m.backStitches} sts wide, ${g216m.finishedMeasurements.length} cm body length. Side opening: lower 20 cm of each side seam.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '650 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Snap tape, 20 cm per side', qty: '2 lengths' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g216m.backStitches + 2}. Work dc for ${g216m.finishedMeasurements.length} cm.`)),
        h2('Front panel'),
        p(t('Work to match back. Shape neckline by leaving centre 18 sts unworked at the top.')),
        h2('Sleeves (make 2)'),
        p(t(`Chain ${g216m.sleeveStitches + 2}. Work dc for ${g216m.finishedMeasurements.sleeveLength} cm.`)),
        h2('Assembly and adaptive openings'),
        p(t('Seam shoulders. Set sleeves. Seam side seams from the underarm downward, leaving the lower 20 cm open. Edge openings with dc. Attach '), gt('snap-tape-g216', 'snap tape'), t(' to form the '), gt('adaptive-opening-g216', 'adaptive side openings'), t('.')),
        h2('What to try next'),
        p(t('The side-button cardigan uses full-length side openings secured with buttons as an alternative adaptive closure.')),
      ],
    },
  },
  {
    slug: 'crochet-side-button-cardigan',
    title: 'Side-button cardigan',
    excerpt: 'A cardigan that opens completely at both side seams with a row of buttons, making it easy to put on by laying the garment flat. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE' as const,
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g217m.finishedMeasurements.bust} cm bust. Length ${g217m.finishedMeasurements.length} cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['side button cardigan crochet', 'crochet wrap cardigan buttons', 'full side opening cardigan crochet', 'adaptive cardigan crochet'],
    glossaryTerms: [
      { slug: 'side-button-band-g217', term: 'Side button band', definition: 'A strip of dc worked along the full side edge of the front and back panels. Buttons and buttonholes are worked into the band so the garment opens completely along each side seam.' },
      { slug: 'buttonhole-g217', term: 'Buttonhole', definition: 'A small ch-2 space worked in the button band to correspond with each button. The chain space is just wide enough for the button shank to pass through.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Side-opening cardigans are an adaptive clothing design that aids independent dressing.',
    body: {
      type: 'doc', content: [
        p(t('Work front and back panels in dc. Do not seam the side seams. Instead, work a '), gt('side-button-band-g217', 'side button band'), t(' along both side edges of both panels: work dc along the edge, placing '), gt('buttonhole-g217', 'buttonholes'), t(' at even intervals on the front side bands. Sew buttons to the back side bands.')),
        p(t(`Size M: ${g217m.backStitches} sts wide back, each front ${Math.round(g217m.backStitches / 2)} sts wide. Body length ${g217m.finishedMeasurements.length} cm. Side button band 8 buttons per side.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '700 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Buttons, 2 cm', qty: '16' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g217m.backStitches + 2}. Work dc for ${g217m.finishedMeasurements.length} cm.`)),
        h2('Front panels (make 2)'),
        p(t(`Chain ${Math.round(g217m.backStitches / 2) + 2}. Work dc for ${g217m.finishedMeasurements.length} cm.`)),
        h2('Side button bands'),
        p(t('Work dc along each side edge of all four panels. On the two front side edges, place '), gt('buttonhole-g217', 'buttonholes'), t(' every 6 cm. Sew buttons to the back side edges to form the '), gt('side-button-band-g217', 'side button bands'), t('.')),
        h2('What to try next'),
        p(t('The adaptive pullover uses snap tape for a side closure that does not require a button band.')),
      ],
    },
  },
  {
    slug: 'crochet-tube-skirt',
    title: 'Tube skirt',
    excerpt: 'A simple pull-on tube skirt in DK yarn worked in the round with no closures. Elasticated waist. Graded XS to 3XL.',
    difficulty: 'BEGINNER' as const,
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g218m.finishedMeasurements.bust} cm hip. Length 60 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['tube skirt crochet', 'pull on crochet skirt', 'crochet midi tube skirt', 'no closure crochet skirt'],
    glossaryTerms: [
      { slug: 'tube-skirt-g218', term: 'Tube skirt', definition: 'A cylindrical skirt with the same circumference from waist to hem, worked in a continuous spiral of rounds. No shaping, no closures. The elasticated waist gathers the top to the waist measurement.' },
      { slug: 'elastic-casing-g218', term: 'Elastic casing', definition: 'The folded and sewn top edge of the skirt forming a tunnel for threading elastic. The elastic is cut to the waist measurement and joined in a loop before the casing is fully closed.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Tube skirts are among the simplest crochet garments, ideal for beginners tackling their first skirt.',
    body: {
      type: 'doc', content: [
        p(t('The '), gt('tube-skirt-g218', 'tube skirt'), t(' is worked in a single continuous spiral of dc rounds from the waist downward. No increases or decreases needed. The waist is finished with an '), gt('elastic-casing-g218', 'elastic casing'), t(' by folding the top edge and sewing it down, then threading elastic through.')),
        p(t(`Size M: ${g218m.hemStitches} sts per round, 60 cm length.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK yarn', qty: '350 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
          { name: 'Elastic, 2.5 cm wide', qty: 'waist + 5 cm' },
        ]),
        h2('Body'),
        p(t(`Chain ${g218m.hemStitches}. Join to form a ring. Work dc rounds in spiral for 56 cm.`)),
        h2('Waist casing'),
        p(t('Work 4 extra cm of dc rounds at the top. Fold to the inside and sew to form the '), gt('elastic-casing-g218', 'elastic casing'), t('. Thread elastic and close the gap.')),
        h2('What to try next'),
        p(t('The crochet swing dress uses the same tube construction with graduated increases toward the hem.')),
      ],
    },
  },
  {
    slug: 'crochet-swing-dress',
    title: 'Swing dress',
    excerpt: 'An A-line swing dress wider at the hem than the bust, worked with a drop-shoulder bodice and a flared skirt section in DK yarn. Graded XS to 3XL.',
    difficulty: 'INTERMEDIATE' as const,
    yarnWeight: 'dk',
    hook: 'crochet-hook-4-0mm',
    gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g219m.finishedMeasurements.bust} cm bust at bodice. Hem width approx. 140 cm. Length 90 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['swing dress crochet', 'A-line crochet dress', 'flared hem dress crochet', 'trapeze dress crochet'],
    glossaryTerms: [
      { slug: 'swing-skirt-g219', term: 'Swing skirt', definition: 'The lower section of the dress where stitches increase gradually in every fourth round to create the A-line flare. The hem is approximately twice the width of the bodice hem.' },
      { slug: 'increase-round-g219', term: 'Increase round', definition: 'A round where 2 dc are worked into a set of stitches at regular intervals to expand the circumference. Working an increase round every 4 cm adds width gradually without a visible ridge.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Swing dresses are a flattering silhouette popular in modern crochet fashion.',
    body: {
      type: 'doc', content: [
        p(t('Work the bodice as a standard drop-shoulder top to the waist. Then work the '), gt('swing-skirt-g219', 'swing skirt'), t(' section in rounds: work an '), gt('increase-round-g219', 'increase round'), t(' every 4 cm, placing two dc into every eighth stitch, until the hem is approximately twice the bodice width. Continue to the desired length.')),
        p(t(`Size M: bodice ${g219m.backStitches * 2} sts around at waist join. Hem approx. ${g219m.hemStitches * 2} sts. Total length 90 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'DK yarn', qty: '700 yards' },
          { name: '4 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Bodice'),
        p(t(`Work front and back panels as for a drop-shoulder top. Seam shoulders, sides, and set short sleeves or leave sleeveless. Join body in round at the waist: ${g219m.backStitches * 2} sts.`)),
        h2('Swing skirt'),
        p(t('Work dc rounds. Place '), gt('increase-round-g219', 'increase rounds'), t(' every 4 cm to expand to the full hem width. Work to 90 cm total length. Fasten off. The hem naturally forms the '), gt('swing-skirt-g219', 'swing skirt'), t(' shape.')),
        h2('What to try next'),
        p(t('The tent dress uses a much larger ease allowance for an even more voluminous silhouette.')),
      ],
    },
  },
  {
    slug: 'crochet-tent-dress',
    title: 'Tent dress',
    excerpt: 'A very oversized tent-silhouette dress in aran yarn with generous ease throughout. Worked with drop-shoulder shaping and no waist definition. Graded XS to 3XL.',
    difficulty: 'BEGINNER' as const,
    yarnWeight: 'aran',
    hook: 'crochet-hook-5-0mm',
    gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
    finishedSize: `Graded XS to 3XL. Size M: ${g220m.finishedMeasurements.bust} cm bust with generous ease. Length 100 cm.`,
    stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
    techniqueSlugs: ['crochet-double-uk'],
    criticalTechniques: ['crochet-double-uk'],
    aliases: ['tent dress crochet', 'oversized crochet dress', 'cocoon dress crochet', 'loose fit crochet dress'],
    glossaryTerms: [
      { slug: 'tent-silhouette-g220', term: 'Tent silhouette', definition: 'A garment shape that is as wide or wider at the hem than at the shoulders, with no waist shaping. The fabric hangs straight from the shoulder seam outward, creating a cocoon or tent shape.' },
      { slug: 'generous-ease-g220', term: 'Generous ease', definition: 'An ease allowance of 15 cm or more above the body measurement. The garment sits away from the body rather than following its contours, giving a relaxed draped appearance.' },
    ],
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Tent dresses are a classic oversized silhouette popular in contemporary crochet.',
    body: {
      type: 'doc', content: [
        p(t('The '), gt('tent-silhouette-g220', 'tent silhouette'), t(' is achieved by using '), gt('generous-ease-g220', 'generous ease'), t(' of 15 cm across all sizes. Work the front and back panels as wide dc rectangles. No waist shaping. No hip shaping. The garment hangs with the same width from shoulder to hem. Set the sleeves in a drop-shoulder position or work without sleeves.')),
        p(t(`Size M: ${g220m.backStitches} sts wide front and back, ${g220m.finishedMeasurements.bust} cm across. Length 100 cm.`)),
        h2('What you need'),
        supplies('Materials (size M)', [
          { name: 'Aran yarn', qty: '900 yards' },
          { name: '5 mm crochet hook', qty: '1' },
          { name: 'Tapestry needle', qty: '1' },
          { name: 'Scissors', qty: '1 pair' },
        ]),
        h2('Back panel'),
        p(t(`Chain ${g220m.backStitches + 2}. Work dc for 100 cm. Fasten off.`)),
        h2('Front panel'),
        p(t('Work to match back. Leave centre 20 sts unworked at the top for the neckline opening.')),
        h2('Sleeves (optional, make 2)'),
        p(t(`Chain ${g220m.sleeveStitches + 2}. Work dc for ${g220m.finishedMeasurements.sleeveLength} cm.`)),
        h2('Assembly'),
        p(t('Seam shoulders. Set sleeves or leave as a sleeveless shift. Seam sides. The completed garment has the '), gt('tent-silhouette-g220', 'tent silhouette'), t(' with '), gt('generous-ease-g220', 'generous ease'), t(' throughout.')),
        h2('What to try next'),
        p(t('The swing dress shapes the hem wider than the bodice for a more defined A-line.')),
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
