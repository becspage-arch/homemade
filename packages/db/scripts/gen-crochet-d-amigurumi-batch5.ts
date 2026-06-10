/**
 * Generator: D-Amigurumi Batch 5 -- A41-A50 Pet and Domestic Animals
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch5.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sphere, cylinder, cone, capsule, oval } from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-amigurumi')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

function write(slug: string, out: object) {
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`wrote ${slug}.json`)
}

// ── A41 ── Tabby Cat ──────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-cat'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const legFront = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 3, lengthCm: 6, gauge: GAUGE, label: 'Back leg (make 2)' })
  const earL = cone({ baseDiameterCm: 3, heightCm: 3, gauge: GAUGE, label: 'Ear (make 2)' })
  const tail = cylinder({ diameterCm: 1.5, heightCm: 10, gauge: GAUGE, label: 'Tail' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'colour-change', 'safety-eyes', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'assembly-ladder-stitch']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease that removes a stitch without leaving a visible gap on the right side of the fabric.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi to give a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main stitch in amigurumi construction.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('You need approximately 60 g of dk-weight yarn in three shades: main tabby (orange or grey), white for the muzzle and belly, and dark for stripe details. Use a 3.5 mm hook throughout. Four 12 mm ')),
    p(gt('safety-eyes', 'safety eyes'), t(' (two green for the cat, two small black for the nose triangle), polyester stuffing, and one tapestry needle complete the kit.')),
    h2('Getting started'),
    p(t('Make a '), gt('magic-ring', 'magic ring'), t(' and work 6 '), gt('sc', 'sc'), t(' into it to start every piece. Pull the ring closed before continuing.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Attach the eyes between rounds 8 and 9, spaced 5 stitches apart. Stuff the head firmly, then close with an '), gt('invisible-decrease', 'invisible decrease'), t(' spiral.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Leave a 20 cm tail for seaming the head to the body later.')),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tail'),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Use '), gt('assembly-ladder-stitch', 'ladder stitch'), t(' to attach the head to the top of the body. Pin the front legs to the lower body sides and the back legs to the base. Sew the ears to the top of the head with 3 stitches apart. Tuck the tail base under the back of the body and secure firmly. Use the yarn tail to embroider three whisker lines on each cheek using straight stitch.')),
    h2('Finishing'),
    p(t('Weave in all ends. Use dark yarn to embroider a small triangular nose and a curved mouth under the muzzle. A light touch of toy-safe blush gives the cheeks a warm flush.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Tabby Cat', subtitle: '', excerpt: 'A striped tabby cat with cone ears, a long tail, and a curious expression. Worked in dk yarn at tight tension for a firm, poseable result.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet cat', 'cat amigurumi', 'tabby cat toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A42 ── Golden Labrador ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-dog-labrador'
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const legFront = capsule({ diameterCm: 3, lengthCm: 7, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 3.5, lengthCm: 7, gauge: GAUGE, label: 'Back leg (make 2)' })
  const earL = oval({ longAxisCm: 5, shortAxisCm: 3.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const muzzle = sphere({ diameterCm: 4, gauge: GAUGE, label: 'Muzzle' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'surface-embroidery', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'assembly-ladder-stitch']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease that removes a stitch without leaving a visible gap on the right side of the fabric.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer, used in amigurumi to give a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main stitch in amigurumi construction.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
    { slug: 'surface-embroidery', term: 'surface embroidery', definition: 'Embroidery worked directly on the surface of a finished crocheted piece to add fine detail.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 80 g of golden dk-weight yarn plus a small amount of dark brown for nose embroidery. Use a 3.5 mm hook, two 14 mm amber ')),
    p(gt('safety-eyes', 'safety eyes'), t(', polyester stuffing, and one tapestry needle.')),
    h2('Getting started'),
    p(t('All pieces start from a '), gt('magic-ring', 'magic ring'), t(' with 6 '), gt('sc', 'sc'), t('. Pull the tail to close the ring snugly.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Muzzle'),
    ...muzzle.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Stuff the muzzle gently so it sits forward of the head. Attach to the lower centre of the head using '), gt('assembly-ladder-stitch', 'ladder stitch'), t('.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the body at the narrow end. Attach front legs to the lower body sides and back legs to the base. Fold each ear in half lengthways and stitch to the sides of the head at round 4.')),
    h2('Finishing'),
    p(t('Use '), gt('surface-embroidery', 'surface embroidery'), t(' to add a dark oval nose on the muzzle. Insert the '), gt('invisible-decrease', 'invisible decrease'), t(' technique at the closing round to get a neat seam. Weave in all ends.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Golden Labrador', subtitle: '', excerpt: 'A chunky golden Labrador with a soft muzzle, floppy oval ears, and a friendly face. Dk yarn gives a smooth, dense finish.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet labrador', 'dog amigurumi', 'golden lab toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A43 ── Dachshund ──────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-dog-dachshund'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = cylinder({ diameterCm: 6, heightCm: 14, gauge: GAUGE, label: 'Body' })
  const legFront = capsule({ diameterCm: 2, lengthCm: 4, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 2, lengthCm: 4, gauge: GAUGE, label: 'Back leg (make 2)' })
  const earL = oval({ longAxisCm: 5, shortAxisCm: 3, gauge: GAUGE, label: 'Ear (make 2)' })
  const snout = oval({ longAxisCm: 4, shortAxisCm: 2.5, gauge: GAUGE, label: 'Snout' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'assembly-ladder-stitch']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease that removes a stitch without leaving a visible gap on the right side.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('Around 70 g of brown dk-weight yarn. A small amount of tan for the snout and paw pads. A 3.5 mm hook, two 10 mm dark ')),
    p(gt('safety-eyes', 'safety eyes'), t(', stuffing, and one tapestry needle.')),
    h2('Getting started'),
    p(t('Begin every piece with a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('. The dachshund body is a long cylinder that gives the breed its signature silhouette.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Snout'),
    ...snout.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Stuff lightly and attach to the lower half of the head with '), gt('assembly-ladder-stitch', 'ladder stitch'), t('.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Attach the head at one end of the cylinder body. Position front legs about 3 cm from the head end and back legs 3 cm from the tail end. Drape the floppy ears down each side of the head and secure.')),
    h2('Finishing'),
    p(t('Embroider a dark oval nose on the snout tip. Use the '), gt('invisible-decrease', 'invisible decrease'), t(' method at the body closing round for a smooth seam. Weave in all ends and trim neatly.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Dachshund', subtitle: '', excerpt: 'A long-bodied brown dachshund with short stubby legs and floppy ears. The cylinder body is the key to capturing the breed shape.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet dachshund', 'sausage dog amigurumi', 'wiener dog crochet'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 22 cm long, 10 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A44 ── Corgi ──────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-dog-corgi'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const legFront = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Back leg (make 2)' })
  const earL = oval({ longAxisCm: 6, shortAxisCm: 4, gauge: GAUGE, label: 'Ear (make 2)' })
  const muzzle = sphere({ diameterCm: 3.5, gauge: GAUGE, label: 'Muzzle' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'colour-change', 'safety-eyes', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'colour-change']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn colour on the last pull-through of a stitch so the new colour appears cleanly at the start of the next stitch.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 75 g of golden-orange dk yarn, plus cream for the muzzle and belly. A 3.5 mm hook, two 12 mm dark ')),
    p(gt('safety-eyes', 'safety eyes'), t(', stuffing, and one tapestry needle.')),
    h2('Getting started'),
    p(t('Work each piece from a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('. Use '), gt('colour-change', 'colour change'), t(' to switch between orange and cream on the body and legs.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Muzzle'),
    ...muzzle.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Attach centred on the lower head using '), gt('assembly-ladder-stitch', 'ladder stitch'), t('.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Sew the head to the body. Attach legs at the base. The large oval ears stand upright on corgis: stitch each ear base firmly to the top of the head, angled slightly outward. Use the '), gt('invisible-decrease', 'invisible decrease'), t(' technique when shaping the ear tips for a sharp point.')),
    h2('Finishing'),
    p(t('Embroider a dark nose on the muzzle. Weave in all ends. The corgi rear can have a small circle of white yarn as a fluffy tail stub, sewn on flat.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Corgi', subtitle: '', excerpt: 'A golden corgi with oversized upright ears, a cream muzzle, and short sturdy legs. Colour changes on the body capture the classic two-tone coat.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet corgi', 'corgi amigurumi', 'welsh corgi toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A45 ── Hamster ────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-hamster'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head (with cheek pouches)' })
  const body = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Body' })
  const earL = sphere({ diameterCm: 2, gauge: GAUGE, label: 'Ear (make 2)' })
  const legFront = capsule({ diameterCm: 1.5, lengthCm: 2, gauge: GAUGE, label: 'Front paw (make 2)' })
  const legBack = capsule({ diameterCm: 2, lengthCm: 3, gauge: GAUGE, label: 'Back foot (make 2)' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'stuffing-technique', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'stuffing-technique']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'stuffing-technique', term: 'stuffing technique', definition: 'The method of filling an amigurumi piece firmly and evenly with polyester fibrefill to hold its shape.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 55 g of sandy or golden dk yarn plus a small amount of cream for the belly. A 3.5 mm hook, two 8 mm black ')),
    p(gt('safety-eyes', 'safety eyes'), t(', plenty of stuffing for the chubby cheeks, and one tapestry needle.')),
    h2('Getting started'),
    p(t('Every piece begins with a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('. The hamster head and body are both spheres. Good '), gt('stuffing-technique', 'stuffing technique'), t(' is key to the rounded silhouette.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Before closing: insert the '), gt('safety-eyes', 'safety eyes'), t(' between rounds 6 and 7, spaced 5 stitches apart. Add extra stuffing at the sides to puff the cheeks. Then close with '), gt('invisible-decrease', 'invisible decrease'), t('.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Do not stuff the ears. Flatten each into a disc before sewing to the head.')),
    h2('Front paws (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back feet (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Join the head to the body using '), gt('assembly-ladder-stitch', 'ladder stitch'), t('. Sew the flat ear discs to the top of the head. Attach the front paws just below the neck and the back feet at the base. The hamster sits low so the belly nearly touches the surface.')),
    h2('Finishing'),
    p(t('Embroider a small pink triangle for the nose and a curved mouth line. Weave in all ends.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Hamster', subtitle: '', excerpt: 'A round chubby hamster with stuffed cheek pouches, tiny round ears, and stubby paws. Two spheres and good stuffing do most of the work.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet hamster', 'hamster amigurumi', 'stuffed hamster toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A46 ── Guinea Pig ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-guinea-pig'
  const head = sphere({ diameterCm: 7.5, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const earL = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const legFront = capsule({ diameterCm: 2, lengthCm: 3, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 2.5, lengthCm: 3, gauge: GAUGE, label: 'Back leg (make 2)' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'colour-change', 'safety-eyes', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'colour-change']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn colour on the last pull-through of a stitch so the new colour appears cleanly at the start of the next stitch.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 65 g of dk yarn in two or three colours for a patchy coat. Use '), gt('colour-change', 'colour change'), t(' or carry colours across rounds. A 3.5 mm hook, two 10 mm dark ')),
    p(gt('safety-eyes', 'safety eyes'), t(', stuffing, and one tapestry needle.')),
    h2('Getting started'),
    p(t('All pieces start from a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('. The guinea pig has no visible neck: the head sits directly against the body oval.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Do not stuff. Flatten and fold the ear base slightly before sewing on.')),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Butt the head directly against the wide end of the body and sew with '), gt('assembly-ladder-stitch', 'ladder stitch'), t('. There should be no gap between head and body. Attach legs low on the body so the animal sits close to the surface. Sew ears flat against the sides of the head.')),
    h2('Finishing'),
    p(t('Apply the '), gt('invisible-decrease', 'invisible decrease'), t(' method at the body closing round for a smooth seam. Embroider a small V-shaped nose and weave in all ends.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Guinea Pig', subtitle: '', excerpt: 'A rounded guinea pig with a patchy two-tone coat, flat folded ears, and no visible neck. Colour changes across the body create the characteristic markings.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet guinea pig', 'guinea pig amigurumi', 'cavy crochet toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm long, 10 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A47 ── Budgerigar ─────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-budgie'
  const head = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 8, shortAxisCm: 5, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 1.5, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })
  const wing = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Wing (make 2)' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'colour-change', 'safety-eyes', 'surface-embroidery', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'colour-change', 'surface-embroidery']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn colour on the last pull-through of a stitch so the new colour appears cleanly at the start of the next stitch.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'surface-embroidery', term: 'surface embroidery', definition: 'Embroidery worked directly on the surface of a finished crocheted piece to add fine feather detail.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 35 g of bright green dk yarn, plus yellow for the face and blue for wing tips. A 3.5 mm hook, two 6 mm black ')),
    p(gt('safety-eyes', 'safety eyes'), t(', light stuffing, and one tapestry needle.')),
    h2('Getting started'),
    p(t('All pieces begin with a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('. Use '), gt('colour-change', 'colour change'), t(' to build the typical budgie markings. Add feather lines with '), gt('surface-embroidery', 'surface embroidery'), t(' once the pieces are assembled.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Insert the '), gt('safety-eyes', 'safety eyes'), t(' at rounds 4 and 5, spaced 3 stitches apart. Stuff and close.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Beak'),
    ...beak.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Do not stuff. Pinch the beak flat along the base and sew to the face between the eyes.')),
    h2('Wings (make 2)'),
    ...wing.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Flatten each wing before sewing on. A flat unstuffed wing gives a more realistic silhouette.')),
    h2('Assembly'),
    p(t('Sew the head to the wide end of the body using '), gt('assembly-ladder-stitch', 'ladder stitch'), t('. Attach wings flat on each side of the body, angled slightly downward. Sew the beak between the eyes.')),
    h2('Finishing'),
    p(t('Apply the '), gt('invisible-decrease', 'invisible decrease'), t(' method at the tail base if a taper is needed. Add feather detail lines with '), gt('surface-embroidery', 'surface embroidery'), t(' using dark green or black yarn. Weave in all ends.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Budgerigar', subtitle: '', excerpt: 'A bright green budgie with a cone beak, flat wings, and surface-embroidered feather markings. Colour changes build the yellow face and darker wing tips.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet budgie', 'budgerigar amigurumi', 'parakeet crochet toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A48 ── Goldfish ───────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-goldfish'
  const body = oval({ longAxisCm: 9, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
  const tailFin = oval({ longAxisCm: 5, shortAxisCm: 4, gauge: GAUGE, label: 'Tail fin (make 2, fold together)' })
  const pectoralFin = cone({ baseDiameterCm: 2, heightCm: 3, gauge: GAUGE, label: 'Pectoral fin (make 2)' })
  const dorsalFin = cone({ baseDiameterCm: 2.5, heightCm: 3.5, gauge: GAUGE, label: 'Dorsal fin' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'flat-piece', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease', 'flat-piece']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'flat-piece', term: 'flat piece', definition: 'A crocheted piece worked without stuffing, sewn flat onto the main body as a fin or ear.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 40 g of bright orange dk yarn plus white for the belly. A 3.5 mm hook, two 8 mm black ')),
    p(gt('safety-eyes', 'safety eyes'), t(', light stuffing for the body, and one tapestry needle.')),
    h2('Getting started'),
    p(t('The body is a stuffed oval. The fins are all '), gt('flat-piece', 'flat pieces'), t(' worked without stuffing, then sewn on. All pieces start from a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Insert the '), gt('safety-eyes', 'safety eyes'), t(' at rounds 5 and 6, spaced 4 stitches apart. Stuff moderately and close.')),
    h2('Tail fin (make 2 ovals, then join)'),
    ...tailFin.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Make two identical ovals without stuffing. Flatten and pin back-to-back, then sew around the edges to join. Attach the joined tail fin at the narrow end of the body.')),
    h2('Pectoral fins (make 2)'),
    ...pectoralFin.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Flatten each cone fin before sewing on.')),
    h2('Dorsal fin'),
    ...dorsalFin.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Use '), gt('assembly-ladder-stitch', 'ladder stitch'), t(' throughout. Sew the tail fin at the narrow body end. Attach pectoral fins just behind the eye line on each side. Sew the dorsal fin along the top centre of the body, pointing upward.')),
    h2('Finishing'),
    p(t('Use the '), gt('invisible-decrease', 'invisible decrease'), t(' method to smooth any bumps where fins join the body. Weave in all ends. The white belly is added by embroidering a few straight stitches along the underside.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Goldfish', subtitle: '', excerpt: 'A bright orange goldfish with a double tail fin, pectoral fins, and a dorsal fin. Flat unstuffed fins keep the shape light and realistic.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet goldfish', 'goldfish amigurumi', 'fish crochet toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A49 ── Pet Tortoise ───────────────────────────────────────────────────────
{
  const slug = 'amigurumi-tortoise-pet'
  const shell = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Shell (dome)' })
  const head = oval({ longAxisCm: 6, shortAxisCm: 4.5, gauge: GAUGE, label: 'Head' })
  const legFront = capsule({ diameterCm: 2, lengthCm: 4, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Back leg (make 2)' })
  const tail = cone({ baseDiameterCm: 1.5, heightCm: 2.5, gauge: GAUGE, label: 'Tail' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'colour-change', 'surface-embroidery', 'safety-eyes', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'surface-embroidery', 'colour-change']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'colour-change', term: 'colour change', definition: 'Swapping yarn colour on the last pull-through of a stitch so the new colour appears cleanly at the start of the next stitch.' },
    { slug: 'surface-embroidery', term: 'surface embroidery', definition: 'Embroidery worked directly on the surface of a finished crocheted piece to add shell segment markings.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('Materials'),
    p(t('About 60 g of dark green or brown dk yarn for the shell. Use olive green or khaki for the head, legs, and tail. A 3.5 mm hook, two 8 mm dark ')),
    p(gt('safety-eyes', 'safety eyes'), t(', stuffing, and one tapestry needle. Dark brown yarn for '), gt('surface-embroidery', 'surface embroidery'), t(' shell markings.')),
    h2('Getting started'),
    p(t('The shell is worked from a '), gt('magic-ring', 'magic ring'), t(' as a sphere, then flattened slightly at the base. The head, legs, and tail use a lighter khaki yarn with '), gt('colour-change', 'colour change'), t(' where the skin meets the shell edge. Use '), gt('sc', 'sc'), t(' throughout.')),
    h2('Shell'),
    ...shell.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Stuff the shell firmly so it holds a dome shape. The base is left open to accommodate the body inside.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Insert the '), gt('safety-eyes', 'safety eyes'), t(' between rounds 4 and 5. Stuff and close, leaving a 15 cm tail for attachment.')),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Tail'),
    ...tail.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Assembly'),
    p(t('Work a flat crocheted base piece the same diameter as the shell opening. Sew the head to the front of the shell opening, the legs at each corner, and the tail at the rear. Use '), gt('assembly-ladder-stitch', 'ladder stitch'), t(' throughout. Sew the base piece inside to close the shell neatly.')),
    h2('Finishing'),
    p(t('Add hexagonal shell markings with '), gt('surface-embroidery', 'surface embroidery'), t(' using straight stitch in dark brown. Use the '), gt('invisible-decrease', 'invisible decrease'), t(' method where the neck emerges from the shell for a smooth join. Weave in all ends.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Pet Tortoise', subtitle: '', excerpt: 'A small pet tortoise with a domed shell, wrinkled head, and stubby legs. Surface embroidery adds the geometric shell pattern.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet tortoise', 'tortoise amigurumi', 'pet turtle toy'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 14 cm long, 8 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

// ── A50 ── Kitten (BEGINNER) ──────────────────────────────────────────────────
{
  const slug = 'amigurumi-kitten'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 8, shortAxisCm: 5.5, gauge: GAUGE, label: 'Body' })
  const legFront = capsule({ diameterCm: 2, lengthCm: 3.5, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBack = capsule({ diameterCm: 2, lengthCm: 4, gauge: GAUGE, label: 'Back leg (make 2)' })
  const earL = cone({ baseDiameterCm: 2.5, heightCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })

  const techniqueSlugs = ['magic-ring', 'working-in-the-round', 'invisible-decrease', 'safety-eyes', 'assembly-ladder-stitch']
  const criticalTechniques = ['magic-ring', 'invisible-decrease']
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'magic ring', definition: 'An adjustable loop used to start amigurumi pieces with a tight, hole-free centre.' },
    { slug: 'invisible-decrease', term: 'invisible decrease', definition: 'A decrease worked through the front loops only to avoid a visible gap on the right side.' },
    { slug: 'safety-eyes', term: 'safety eyes', definition: 'Plastic eyes with a locking washer used in amigurumi for a secure, professional finish.' },
    { slug: 'sc', term: 'sc', definition: 'Single crochet (UK: double crochet) — the main amigurumi stitch.' },
    { slug: 'assembly-ladder-stitch', term: 'assembly ladder stitch', definition: 'A seaming technique that joins stuffed pieces invisibly by weaving through alternating stitches.' },
  ]
  const bodyContent = [
    h2('About this pattern'),
    p(t('This kitten is designed for beginners. There are no colour changes and no surface embroidery. The shaping uses basic increases and '), gt('invisible-decrease', 'invisible decreases'), t(' only. The finished kitten sits at 10 cm tall.')),
    h2('Materials'),
    p(t('About 40 g of any single-colour dk yarn. A 3.5 mm hook, two 10 mm ')),
    p(gt('safety-eyes', 'safety eyes'), t(', polyester stuffing, and one tapestry needle.')),
    h2('Getting started'),
    p(t('Every piece starts with a '), gt('magic-ring', 'magic ring'), t(' of 6 '), gt('sc', 'sc'), t('. Pull the tail tight to close the centre hole before crocheting round 2.')),
    h2('Head'),
    ...head.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Insert the '), gt('safety-eyes', 'safety eyes'), t(' between rounds 6 and 7, spaced 5 stitches apart. Stuff firmly. Close with '), gt('invisible-decrease', 'invisible decrease'), t(' until the hole is gone, then fasten off.')),
    h2('Body'),
    ...body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Stuff the body and leave a 20 cm yarn tail for sewing to the head.')),
    h2('Front legs (make 2)'),
    ...legFront.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Back legs (make 2)'),
    ...legBack.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    h2('Ears (make 2)'),
    ...earL.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
    p(t('Do not stuff the ears. Flatten each cone and pinch the base gently before sewing on.')),
    h2('Assembly'),
    p(t('Sew the head to the body using '), gt('assembly-ladder-stitch', 'ladder stitch'), t('. Attach the front legs below the neck and the back legs at the body base. Pin the ears to the top of the head about 3 stitches apart, then sew securely.')),
    h2('Finishing'),
    p(t('Embroider a small nose triangle and a curved mouth. Weave in all ends. The finished kitten is approximately 10 cm tall and safe for supervised play from age 3 upward when ')),
    p(gt('safety-eyes', 'safety eyes'), t(' are used as directed.')),
  ]

  write(slug, {
    slug, title: 'Amigurumi Kitten', subtitle: '', excerpt: 'A beginner-friendly kitten standing 10 cm tall. No colour changes or embroidery. Just increases, decreases, and simple assembly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs, criticalTechniques, aliases: ['crochet kitten', 'kitten amigurumi', 'beginner cat crochet'], glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 10 cm tall seated.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: { type: 'doc', content: bodyContent },
  })
}

console.log('Done -- 10 patterns written to', OUT)
