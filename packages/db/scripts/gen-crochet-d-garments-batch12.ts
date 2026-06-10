/**
 * Generator: D-Garments Batch 12 -- Outerwear, coats, and wearable accessories G111-G120
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-garments-batch12.ts
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

// G111 -- long A-line winter coat, DROP_SHOULDER CARDIGAN, chunky, 6mm, GENEROUS_15 ease
const g111 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 10, rowsPer10cm: 12 }, easePreset: 'GENEROUS_15', garmentType: 'CARDIGAN' })
const g111m = g111.find(g => g.size === 'M')!

// G112 -- cropped boxy jacket, DROP_SHOULDER CARDIGAN, aran, 5mm, POSITIVE_4 ease
const g112 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g112m = g112.find(g => g.size === 'M')!

// G113 -- blazer-style open jacket, DROP_SHOULDER CARDIGAN, aran, 5mm, POSITIVE_4 ease
const g113 = gradeAllSizes([...W], { constructionShape: 'DROP_SHOULDER', gauge: { stitchesPer10cm: 14, rowsPer10cm: 16 }, easePreset: 'POSITIVE_4', garmentType: 'CARDIGAN' })
const g113m = g113.find(g => g.size === 'M')!

const PATTERNS = [
{
  slug: 'crochet-winter-coat',
  title: 'Crochet winter coat',
  excerpt: 'A long A-line coat in chunky yarn with a generous fit. Drop-shoulder construction worked flat in four panels and seamed. A dc tie belt finishes the waist. Graded XS to 3XL.',
  difficulty: 'ADVANCED',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g111m.finishedMeasurements.bust} cm bust. Body approx. 105 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk', 'crochet-dc2tog'],
  aliases: ['crochet coat pattern', 'long crochet coat chunky', 'A-line crochet coat'],
  glossaryTerms: [
    { slug: 'a-line-g111', term: 'A-line shaping', definition: 'A gradual increase in width from shoulder to hem. The garment is wider at the lower edge than at the bust, creating a silhouette that resembles the letter A. On a coat, extra stitches are added every few rows at the side edges below the hip.' },
    { slug: 'dc-tie-belt-g111', term: 'DC tie belt', definition: 'A long narrow strip of double crochet chains worked to a consistent width of around 4 cm and sewn at the side seams or threaded through belt loops at waist level. Ties at the front centre.' },
    { slug: 'dc2tog-g111', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used to shape the front neck edges on each front half of the coat.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Long crochet coats in chunky yarn are a well-established modern crochet garment.',
  body: {
    type: 'doc', content: [
      p(t('Work the back, two front halves, and two sleeves as flat panels in chunky dc. The body uses '), gt('a-line-g111', 'A-line shaping'), t(' below the hip: add 1 st each side every 8 rows to the hem. Use '), gt('dc2tog-g111', 'dc2tog'), t(' at the front neck edges. Seam shoulders, sides, and sleeves. Work a '), gt('dc-tie-belt-g111', 'dc tie belt'), t(' and sew it at the waist seams.')),
      p(t(`Size M: ${g111m.hemStitches} sts wide at bust. Body 105 cm. Sleeve 55 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Chunky yarn', qty: '1400 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g111m.hemStitches + 2}. Work dc. Begin A-line shaping at row 10: add 1 st each side every 8 rows for 5 repeats. Continue to 105 cm. Shape neck. Fasten off.`)),
      h2('Front halves (make 2, mirrored)'),
      p(t(`Chain ${Math.round(g111m.hemStitches / 2) + 2}. Work dc with matching A-line additions. At neck, work `), gt('dc2tog-g111', 'dc2tog'), t(' at inner edge for 15 cm. Fasten off.')),
      h2('Sleeves (make 2)'),
      p(t('Chain 25. Work dc for 55 cm, adding 1 st each side every 10 rows. Seam underarm. Set flat into armhole.')),
      h2('Belt'),
      p(t('Chain 5. Work dc for 180 cm. Fasten off. Attach at side seams at waist height.')),
      h2('What to try next'),
      p(t('The duster cardigan uses the same long open-front construction in aran for a lighter drape.')),
    ],
  },
},
{
  slug: 'cropped-crochet-jacket',
  title: 'Cropped crochet jacket',
  excerpt: 'A boxy cropped jacket in aran yarn. Hip-length body with set-in sleeves and a dc collar. Drop-shoulder construction worked flat and seamed. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g112m.finishedMeasurements.bust} cm bust. Body approx. 50 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cropped jacket crochet', 'boxy crochet jacket', 'hip length crochet cardigan'],
  glossaryTerms: [
    { slug: 'boxy-fit-g112', term: 'Boxy fit', definition: 'A garment cut with straight sides and no waist shaping. The back and fronts are worked as rectangles with the same stitch count from hem to armhole. The shape sits squarely at the hip without tapering.' },
    { slug: 'dc-collar-g112', term: 'DC collar', definition: 'A stand-up collar worked by picking up stitches around the back neck and front neck edges, then working rows of dc outward for 6 to 8 cm. The collar sits away from the neck rather than lying flat.' },
    { slug: 'dc2tog-g112', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the inner neck edge of each front half to shape the V-neck opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cropped boxy jackets are a core modern crochet garment shape.',
  body: {
    type: 'doc', content: [
      p(t('Work the back and two front halves as flat dc rectangles for a '), gt('boxy-fit-g112', 'boxy fit'), t('. The body is 50 cm from hem to shoulder. Sleeves are worked as rectangles and seamed. After assembly, pick up stitches at the neck and work the '), gt('dc-collar-g112', 'dc collar'), t(' outward for 7 cm.')),
      p(t(`Size M: back ${g112m.hemStitches} sts wide. Each front half: ${Math.round(g112m.hemStitches / 2)} sts. Body 50 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g112m.yarnRequiredYards} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g112m.hemStitches + 2}. Work dc for 50 cm. Fasten off.`)),
      h2('Front halves (make 2, mirrored)'),
      p(t(`Chain ${Math.round(g112m.hemStitches / 2) + 2}. Work dc for 45 cm. Use `), gt('dc2tog-g112', 'dc2tog'), t(' at inner neck edge for 5 cm. Fasten off.')),
      h2('Collar'),
      p(t('Pick up sts around neck opening. Work dc outward for 7 cm. Fasten off. The '), gt('dc-collar-g112', 'collar'), t(' sits upright at the neck.')),
      h2('What to try next'),
      p(t('The blazer-style jacket uses a similar open front with a structured collar and longer proportions.')),
    ],
  },
},
{
  slug: 'crochet-blazer-style',
  title: 'Crochet blazer-style jacket',
  excerpt: 'A structured open-front jacket with a collar and no buttons. Drop-shoulder construction in aran. Worn open for a smart layered look. Graded XS to 3XL.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: `Graded XS to 3XL. Size M: ${g113m.finishedMeasurements.bust} cm bust. Body approx. 70 cm.`,
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet blazer pattern', 'blazer style cardigan crochet', 'structured open jacket crochet'],
  glossaryTerms: [
    { slug: 'lapel-facing-g113', term: 'Lapel facing', definition: 'A folded front edge on the upper part of each front panel. The facing is worked by picking up stitches along the front edge and adding rows that fold back to form the lapel shape.' },
    { slug: 'structured-hem-g113', term: 'Structured hem', definition: 'A row of tighter stitches along the lower edge to prevent flaring. On a blazer hem, 1 dc2tog is worked for every 8 sts to pull the edge in slightly.' },
    { slug: 'dc2tog-g113', term: 'Dc2tog', definition: 'Double crochet two stitches together. Used at the inner front neck edge to shape the angled neckline opening.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Blazer-shaped crochet jackets are a popular smart-casual fashion garment.',
  body: {
    type: 'doc', content: [
      p(t('Work back and two front halves flat in dc. The front panels have a '), gt('lapel-facing-g113', 'lapel facing'), t(' picked up at the upper front edge after assembly. The lower hem is worked as a '), gt('structured-hem-g113', 'structured hem'), t(' to keep the body flat. No buttons: the jacket is worn open.')),
      p(t(`Size M: back ${g113m.hemStitches} sts wide. Each front: ${Math.round(g113m.hemStitches / 2)} sts. Body 70 cm. Sleeves 55 cm.`)),
      h2('What you need'),
      supplies('Materials (size M)', [
        { name: 'Aran yarn', qty: `${g113m.yarnRequiredYards + 100} yards` },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Back'),
      p(t(`Chain ${g113m.hemStitches + 2}. Work dc for 70 cm. Shape back neck. Fasten off.`)),
      h2('Front halves (make 2, mirrored)'),
      p(t(`Chain ${Math.round(g113m.hemStitches / 2) + 2}. Work dc for 65 cm. Use `), gt('dc2tog-g113', 'dc2tog'), t(' at inner edge for 5 cm to form neck angle. Fasten off.')),
      h2('Lapel and hem finishing'),
      p(t('Pick up sts along front edge and work '), gt('lapel-facing-g113', 'lapel facing'), t(' for 3 cm. Fold back and pin. Work '), gt('structured-hem-g113', 'structured hem'), t(' row along lower body edge.')),
      h2('What to try next'),
      p(t('The duster cardigan extends the same open-front jacket silhouette to near-knee length.')),
    ],
  },
},
{
  slug: 'crochet-wrist-warmers',
  title: 'Crochet wrist warmers',
  excerpt: 'Fingerless wrist warmers worked in ribbed rounds of fpdc and bpdc. A gap in the rib forms the thumb opening. One size. Aran yarn on a 5 mm hook.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in aran rib on a 5 mm hook.',
  finishedSize: 'One size: approx. 18 cm circumference x 20 cm tall. Stretches to fit most adult hands.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc', 'crochet-double-uk'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['fingerless wrist warmers crochet', 'crochet wrist warmers pattern', 'ribbed wrist warmers crochet'],
  glossaryTerms: [
    { slug: 'fpdc-bpdc-rib-g114', term: 'FPDC/BPDC rib', definition: 'A crochet rib made by alternating front post double crochet and back post double crochet across each round. Working consistently into the same posts each round creates a stretchy raised rib fabric.' },
    { slug: 'thumb-opening-g114', term: 'Thumb opening', definition: 'A gap in the rib formed by skipping several stitches and replacing them with chains on one round. On the following round those chains are worked as stitches, leaving an opening for the thumb to pass through.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Ribbed wrist warmers are a classic beginner crochet accessory.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('fpdc-bpdc-rib-g114', 'fpdc/bpdc rib'), t(' in the round throughout. Chain 26. Join into a ring. Work rounds of alternating fpdc and bpdc. After 10 cm, form the '), gt('thumb-opening-g114', 'thumb opening'), t(': skip 5 sts, chain 5 in their place, continue rib. On the next round work 5 dc into the chain-5 space and resume rib. Continue for a further 10 cm. Fasten off.')),
      p(t('One size: 26 sts in the round, 20 cm total height. Make 2.')),
      h2('What you need'),
      supplies('Materials (one pair)', [
        { name: 'Aran yarn', qty: '100 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Working in the round'),
      p(t('Use a slip stitch join and turning chain at the start of each round. The '), gt('fpdc-bpdc-rib-g114', 'rib'), t(' must align on every round: fpdc above fpdc, bpdc above bpdc.')),
      h2('Thumb opening'),
      p(t('At round 16 (approx. 10 cm from start): work rib to marker, skip 5 sts, ch 5, continue rib to end. Next round: work 5 dc into ch-5 sp. '), gt('thumb-opening-g114', 'Opening'), t(' is complete.')),
      h2('What to try next'),
      p(t('The fingerless gloves pattern extends the same construction with a longer palm and finger sections.')),
    ],
  },
},
{
  slug: 'crochet-boot-cuffs',
  title: 'Crochet boot cuffs',
  excerpt: 'Boot cuff toppers worked in chunky rib in the round. The cuffs sit over the boot top and show above the shaft. One size, 12 cm tall. Chunky yarn on a 6 mm hook.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '10 sts x 12 rows = 10 x 10 cm in chunky rib on a 6 mm hook.',
  finishedSize: 'One size: approx. 35 cm circumference x 12 cm tall. Folds over the boot shaft.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc', 'crochet-double-uk'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['boot cuffs crochet', 'crochet boot toppers', 'chunky boot cuffs crochet'],
  glossaryTerms: [
    { slug: 'boot-cuff-rib-g115', term: 'Boot cuff rib', definition: 'A wide cylinder of fpdc/bpdc rib worked in the round at a large enough circumference to slide over a boot shaft. The stretch in the rib holds the cuff in place without pinching.' },
    { slug: 'fold-cuff-g115', term: 'Fold-over cuff', definition: 'The finished tube is long enough to fold once at the top, doubling the fabric thickness at the visible edge. The fold sits at the boot shaft and the ribbed edge shows above.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Boot cuff toppers are a popular crochet accessory worked quickly in chunky yarn.',
  body: {
    type: 'doc', content: [
      p(t('Work each '), gt('boot-cuff-rib-g115', 'boot cuff'), t(' in chunky fpdc/bpdc rib in the round. Chain 36. Join into a ring. Work 12 rounds of alternating fpdc and bpdc (approx. 12 cm). Fasten off. Fold at the centre for a '), gt('fold-cuff-g115', 'fold-over cuff'), t(' effect, or wear flat.')),
      p(t('One size: 36 sts in the round, 12 cm tall. Make 2.')),
      h2('What you need'),
      supplies('Materials (one pair)', [
        { name: 'Chunky yarn', qty: '80 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Working in the round'),
      p(t('Join with ss. Each round starts with ch 2. Work fpdc above fpdc, bpdc above bpdc throughout. The '), gt('boot-cuff-rib-g115', 'rib'), t(' is complete at 12 rounds.')),
      h2('What to try next'),
      p(t('The leg warmers pattern uses the same fpdc/bpdc rib construction at a taller height and the same circumference.')),
    ],
  },
},
{
  slug: 'crochet-leg-warmers',
  title: 'Crochet leg warmers',
  excerpt: 'Leg warmers in chunky 1x1 fpdc/bpdc rib worked in the round. Stretchy enough to pull on over leggings. One size, 45 cm tall. Chunky yarn on a 6 mm hook.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '10 sts x 12 rows = 10 x 10 cm in chunky rib on a 6 mm hook.',
  finishedSize: 'One size: approx. 35 cm circumference (stretches) x 45 cm tall.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc', 'crochet-double-uk'],
  criticalTechniques: ['crochet-fpdc', 'crochet-bpdc'],
  aliases: ['crochet leg warmers pattern', 'chunky leg warmers crochet', 'fpdc bpdc leg warmers'],
  glossaryTerms: [
    { slug: '1x1-rib-g116', term: '1x1 rib', definition: 'A rib pattern with one front post stitch alternating with one back post stitch across every round. The equal alternation produces a firm elastic fabric that lies flat when unstretched and expands evenly when pulled on.' },
    { slug: 'leg-warmer-length-g116', term: 'Leg warmer length', definition: 'The total height from ankle to below the knee, typically 40 to 50 cm. At chunky gauge this requires approximately 54 to 60 rounds of rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet leg warmers in rib are a straightforward beginner accessory.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('1x1-rib-g116', '1x1 rib'), t(' in the round throughout. Chain 36. Join into a ring. Work rounds of alternating fpdc and bpdc until the piece reaches '), gt('leg-warmer-length-g116', 'leg warmer length'), t(' of 45 cm. At chunky gauge, 45 cm is approximately 54 rounds. Fasten off.')),
      p(t('One size: 36 sts in the round, 54 rounds, 45 cm total. Make 2.')),
      h2('What you need'),
      supplies('Materials (one pair)', [
        { name: 'Chunky yarn', qty: '200 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Working in the round'),
      p(t('Join with ss. Each round: ch 2, fpdc above fpdc, bpdc above bpdc to end. The '), gt('1x1-rib-g116', 'rib'), t(' is uniform from ankle to top.')),
      h2('What to try next'),
      p(t('The boot cuffs are a shorter version of the same rib worked to 12 cm instead of 45 cm.')),
    ],
  },
},
{
  slug: 'crochet-mittens-basic',
  title: 'Basic crochet mittens',
  excerpt: 'Classic mittens with a thumb gusset, worked in the round in aran. The gusset builds gradually from the palm base. Available in S, M, and L.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 sts x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: 'S: 16 cm circumference. M: 18 cm. L: 20 cm. All sizes approx. 23 cm long.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-dc2tog'],
  aliases: ['crochet mittens pattern', 'basic mittens crochet', 'thumb gusset mittens crochet'],
  glossaryTerms: [
    { slug: 'thumb-gusset-g117', term: 'Thumb gusset', definition: 'A wedge-shaped increase section on the palm side of the mitten that creates space for the thumb. One stitch is increased on each side of a central thumb marker every other round until enough stitches are on the marker for the thumb tube.' },
    { slug: 'mitten-crown-g117', term: 'Mitten crown', definition: 'The rounded top of the mitten formed by dc2tog decreases evenly spaced around the final rounds. Decreases reduce the stitch count until 6 sts remain, then the yarn is pulled through to close.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Basic crochet mittens with a thumb gusset are a staple cold-weather accessory.',
  body: {
    type: 'doc', content: [
      p(t('Work in the round from the cuff upward. Chain 22 (S) / 26 (M) / 30 (L). Join and work 5 cm of dc rib cuff. Continue in plain dc rounds, placing a marker at the gusset position. Work '), gt('thumb-gusset-g117', 'thumb gusset'), t(' increases every other round until 10 gusset sts are on the marker. Place gusset sts on hold. Continue mitten tube to 18 cm. Shape '), gt('mitten-crown-g117', 'mitten crown'), t(' with dc2tog decreases. For the thumb, rejoin yarn at held sts and work a short tube. Fasten off.')),
      p(t('Make 2. S: 22 sts. M: 26 sts. L: 30 sts. Crown reached at approx. 18 cm.')),
      h2('What you need'),
      supplies('Materials (one pair, size M)', [
        { name: 'Aran yarn', qty: '150 yards' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Cuff'),
      p(t('Chain 26 for size M. Join. Work 5 cm of fpdc/bpdc rib cuff in the round.')),
      h2('Palm and gusset'),
      p(t('Continue in dc rounds. Place marker. Inc 1 st each side of marker every 2nd round until 10 sts sit on the gusset marker. Place those 10 sts on a length of yarn. Continue in dc for 13 cm. Begin '), gt('mitten-crown-g117', 'crown'), t(' decreases.')),
      h2('What to try next'),
      p(t('The fingerless gloves pattern uses the same palm construction with the top left open rather than closed.')),
    ],
  },
},
{
  slug: 'crochet-beanie-hat',
  title: 'Classic crochet beanie',
  excerpt: 'A straightforward beanie worked top-down in continuous rounds of double crochet. Increases from a magic ring at the crown, then straight to the band. One size, chunky yarn on a 6 mm hook.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: 'One size: approx. 54 cm head circumference (fits most adults), 22 cm tall.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet beanie hat pattern', 'chunky beanie crochet', 'top down beanie crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-g118', term: 'Magic ring', definition: 'A starting ring formed by looping the yarn over the fingers and crocheting into the loop before pulling the tail to close the centre hole. Used to begin flat circular pieces without a visible hole at the centre.' },
    { slug: 'crown-increase-g118', term: 'Crown increase', definition: 'A set of evenly spaced increases worked in the early rounds of a top-down hat. Six increases are placed one per equal section in each round, expanding the circle until the diameter matches the intended head circumference.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Top-down beanie hats are one of the most widely worked crochet patterns.',
  body: {
    type: 'doc', content: [
      p(t('Start with a '), gt('magic-ring-g118', 'magic ring'), t('. Round 1: 6 dc into ring. Round 2 onward: work '), gt('crown-increase-g118', 'crown increases'), t(' of 6 sts per round until the circle is 18 cm wide (approx. 7 to 8 increase rounds at chunky gauge). Continue in straight rounds with no increases until the hat is 22 cm tall. Fasten off with a ss to the first st of the final round.')),
      p(t('One size: approx. 54 sts in the round at the body section. 22 cm total height.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky yarn', qty: '100 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Crown'),
      p(t('Work '), gt('magic-ring-g118', 'magic ring'), t('. 6 dc. Inc 6 sts per round until 54 sts. Continue straight for 14 cm.')),
      h2('What to try next'),
      p(t('The infinity cowl uses the same chunky yarn in a wide tube instead of a closed circle.')),
    ],
  },
},
{
  slug: 'crochet-infinity-cowl',
  title: 'Crochet infinity cowl',
  excerpt: 'A wide infinity cowl worked in rounds of double crochet. No seaming and no shaping. Worn looped twice or left long. One size: 35 cm tall x 60 cm around. Chunky on a 6 mm hook.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '10 dc x 12 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: 'One size: 60 cm circumference x 35 cm tall.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['infinity cowl crochet', 'chunky cowl crochet', 'crochet loop scarf'],
  glossaryTerms: [
    { slug: 'infinity-loop-g119', term: 'Infinity loop', definition: 'A closed tube of fabric with no defined start or end. Worn by pulling over the head and twisting or looping around the neck. The cowl stays in place without buttons or ties.' },
    { slug: 'seamless-round-g119', term: 'Seamless round', definition: 'A round that joins to the first stitch with a slip stitch and begins the next round with a turning chain. Because each round closes, the fabric forms a continuous tube rather than a spiral.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Infinity cowls are a classic beginner crochet project worked in rounds.',
  body: {
    type: 'doc', content: [
      p(t('Work as an '), gt('infinity-loop-g119', 'infinity loop'), t(' in plain dc rounds. Chain 60. Join with ss into a ring, taking care not to twist the chain. Work '), gt('seamless-round-g119', 'seamless rounds'), t(' of dc until the cowl is 35 cm tall (approximately 42 rounds at chunky gauge). Fasten off and weave in ends.')),
      p(t('One size: 60 ch foundation (approx. 60 cm), 42 rounds, 35 cm tall.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky yarn', qty: '180 yards' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Working in rounds'),
      p(t('Foundation: ch 60, join with ss. Ch 3, dc into each st around. Join each round with ss. Repeat for 42 rounds. Each '), gt('seamless-round-g119', 'round'), t(' is 60 dc.')),
      h2('What to try next'),
      p(t('The chunky beanie uses the same hook and yarn in a smaller closed circle rather than a tube.')),
    ],
  },
},
{
  slug: 'crochet-fingerless-gloves',
  title: 'Crochet fingerless gloves',
  excerpt: 'Fingerless gloves in dk yarn worked in the round with a thumb opening. Two sizes: S and M. Tighter gauge than mittens for a neater fit on the palm.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in dk on a 4 mm hook.',
  finishedSize: 'S: 16 cm palm circumference. M: 18 cm palm circumference. Both sizes approx. 18 cm long.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-dc2tog', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['fingerless gloves crochet', 'dk fingerless gloves crochet', 'crochet gloves no fingers'],
  glossaryTerms: [
    { slug: 'thumb-hole-g120', term: 'Thumb hole', definition: 'An opening created by skipping stitches and replacing them with chains on one round, then working into those chains on the next round. The resulting gap is the right size for the thumb to pass through without a separate thumb tube.' },
    { slug: 'wrist-rib-g120', term: 'Wrist rib', definition: 'A cuff of fpdc/bpdc rib worked in the round for 5 cm before the plain palm section begins. The rib is elastic enough to grip the wrist without feeling tight.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Fingerless gloves in dk are a popular light-weight hand accessory.',
  body: {
    type: 'doc', content: [
      p(t('Work in the round from the wrist upward. Start with 5 cm of '), gt('wrist-rib-g120', 'wrist rib'), t(' in fpdc/bpdc. Continue in plain dc rounds for 8 cm. On the next round, work the '), gt('thumb-hole-g120', 'thumb hole'), t(': skip 6 sts (S) / 7 sts (M), chain same number, continue dc to end. Next round: dc into each chain across the gap. Continue in dc for a further 5 cm. Fasten off.')),
      p(t('S: 28 sts in the round. M: 32 sts. Both: 18 cm total height. Make 2.')),
      h2('What you need'),
      supplies('Materials (one pair, size M)', [
        { name: 'DK yarn', qty: '120 yards' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Wrist rib'),
      p(t('Chain 32 (M) / 28 (S). Join. Work 5 cm of '), gt('wrist-rib-g120', 'wrist rib'), t(' in fpdc/bpdc. Switch to plain dc.')),
      h2('Thumb hole'),
      p(t('After 8 cm of dc palm: work '), gt('thumb-hole-g120', 'thumb hole'), t(' by skipping 7 sts, ch 7, continue dc round. Next round: dc into each ch. Continue 5 cm. Fasten off.')),
      h2('What to try next'),
      p(t('The basic mittens pattern adds a full thumb gusset and a closed crown above the same palm construction.')),
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
