/**
 * Generator: D-Amigurumi Batch 2 -- A11-A20 Woodland Animals and Items
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch2.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  sphere,
  cylinder,
  cone,
  capsule,
  oval,
  pear,
} from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-amigurumi')
mkdirSync(OUT, { recursive: true })

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) {
  return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

function roundsToBody(rounds: ReturnType<typeof sphere>['rowByRow']) {
  return rounds.map(r =>
    p(t(`Round ${r.round}: ${r.instructions} (${r.stitchCount} sts)`))
  )
}

function makeOut(fields: object) {
  return {
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'amigurumi',
    sourceType: 'SYNTHESISED',
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
    },
    recipeTools: TOOLS,
    ...fields,
  }
}

// ─── A11: FOX ────────────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = pear({ maxDiameterCm: 8, topDiameterCm: 5, heightCm: 9, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 4, gauge: GAUGE, label: 'Leg (make 4)' })
  const nose = cone({ baseDiameterCm: 2, heightCm: 2, gauge: GAUGE, label: 'Nose cone' })
  const tail = capsule({ diameterCm: 4, lengthCm: 10, gauge: GAUGE, label: 'Tail' })

  const slug = 'amigurumi-fox'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-colour-change', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-colour-change']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'colour-change', definition: 'Switching yarn mid-round or at the end of a round to create a two-tone effect.' },
  ]

  const body_content = [
    p(
      t('This red woodland fox is made in five pieces: a round '),
      gt('magic-ring', 'magic-ring'),
      t(' head, a pear-shaped body, four short leg capsules, a pointed nose cone, and a long fluffy tail. '),
      gt('colour-change', 'Colour changes'),
      t(' between red and white give the muzzle, chest, and tail tip their markings. Use '),
      gt('safety-eyes', 'safety eyes'),
      t(' before closing the head. The finished fox stands about 18 cm tall.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 80 g russet red, 20 g white, 5 g black. 3.5 mm crochet hook. Pair of 10 mm '), gt('safety-eyes', 'safety eyes'), t('. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook. Gauge is important for a firm, stuffing-hiding fabric.')),
    h2('Head'),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    ...roundsToBody(body.rowByRow),
    h2('Legs (make 4)'),
    ...roundsToBody(leg.rowByRow),
    h2('Nose Cone'),
    ...roundsToBody(nose.rowByRow),
    h2('Tail'),
    ...roundsToBody(tail.rowByRow),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' between rounds 10 and 11 of the head, spaced 3 cm apart. Stuff all pieces. Attach the nose cone to the front of the head at rounds 8 to 11. Sew the head to the top of the body. Attach legs to the underside of the body, front pair at round 3 from the base and back pair flush at the base. Sew the tail to the rear of the body at a slight upward angle.')),
    p(t('Work the white muzzle patch in satin stitch over the lower face. Add the white chest patch over the front of the body and the white tail-tip over the last 3 cm of the tail.')),
    h2('Finishing'),
    p(t('Weave in all ends. Use black yarn to '), gt('amigurumi-decrease', 'embroider'), t(' the nose tip on the cone and the mouth curve below it. Trim stray fibres. Mist with water and shape by hand to finish.')),
    p(t('Next up: the amigurumi-squirrel shares the pear body shape, or the amigurumi-deer adds a taller figure to the set.')),
  ]

  const out = makeOut({
    slug,
    title: 'Woodland Fox Amigurumi',
    subtitle: '',
    excerpt: 'A five-piece red and white fox with a pear-shaped body, fluffy tail, and pointed nose cone. Colour changes create the classic muzzle and chest markings.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['fox amigurumi', 'red fox plushie', 'crochet fox'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 18 cm tall when assembled.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A12: HEDGEHOG ───────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Body (spike texture)' })

  const slug = 'amigurumi-hedgehog'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-spike-stitch']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-spike-stitch']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'spike-stitch', definition: 'A stitch worked by inserting the hook one or more rows below the current row, creating a raised spike effect on the fabric surface.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
  ]

  const body_content = [
    p(
      t('This plump hedgehog uses '),
      gt('spike-stitch', 'spike stitch'),
      t(' over the back half of the body to mimic spines. No needle felting, no separate spine pieces. A smaller sphere forms the smooth face. Start both pieces with a '),
      gt('magic-ring', 'magic ring'),
      t('. The hedgehog sits about 10 cm tall and 12 cm long.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 50 g dark brown, 20 g cream. 3.5 mm crochet hook. Pair of 9 mm '), gt('safety-eyes', 'safety eyes'), t('. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Head'),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    p(t('Work the first half of the body in cream dc. Switch to dark brown for the second half and replace every third dc with a '), gt('spike-stitch', 'spike stitch'), t(' worked two rounds below to form the spine texture.')),
    ...roundsToBody(body.rowByRow),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' on the head between rounds 7 and 8, 2.5 cm apart. Stuff both pieces firmly. Use '), gt('amigurumi-decrease', 'ladder stitch'), t(' to sew the head to the front of the body, angling it slightly downward so the snout points forward.')),
    h2('Finishing'),
    p(t('Embroider the nose with a small triangle of black yarn. Weave in all ends. Give the spike-stitch rows a gentle finger-press outward so the spines stand proud of the body.')),
    p(t('Next up: the amigurumi-mouse-woodland has a similar sphere head, or the amigurumi-acorn is a quick companion piece.')),
  ]

  const out = makeOut({
    slug,
    title: 'Hedgehog Amigurumi',
    subtitle: '',
    excerpt: 'A plump brown hedgehog with spike-stitch texture on the back half of its body sphere. Two pieces, no separate spines needed.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['hedgehog amigurumi', 'crochet hedgehog', 'spike stitch amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 10 cm tall, 12 cm long when assembled.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A13: SQUIRREL ───────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 6.5, gauge: GAUGE, label: 'Head' })
  const body = pear({ maxDiameterCm: 7, topDiameterCm: 4, heightCm: 8, gauge: GAUGE, label: 'Body' })
  const tail = capsule({ diameterCm: 5, lengthCm: 12, gauge: GAUGE, label: 'Fluffy Tail' })
  const arm = capsule({ diameterCm: 2, lengthCm: 4, gauge: GAUGE, label: 'Arm (make 2)' })

  const slug = 'amigurumi-squirrel'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-fluffy-yarn']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-fluffy-yarn']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'fluffy-yarn', definition: 'A yarn with a hairy or bouclé texture used to add a tactile, furry finish to amigurumi pieces.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
  ]

  const body_content = [
    p(
      t('This bushy-tailed squirrel has a sphere head and a pear body worked in warm brown DK. The oversized tail capsule uses a '),
      gt('fluffy-yarn', 'fluffy yarn'),
      t(' so it stands out from the smooth body. Start every piece with a '),
      gt('magic-ring', 'magic ring'),
      t('. The squirrel sits about 14 cm tall with its tail arched behind it.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 60 g chestnut brown, 10 g cream. Fluffy or bouclé DK: 25 g tawny brown for the tail. 3.5 mm crochet hook. Pair of 9 mm '), gt('safety-eyes', 'safety eyes'), t('. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook. Fluffy yarn rows may run slightly looser; check tension before starting the tail.')),
    h2('Head'),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    ...roundsToBody(body.rowByRow),
    h2('Arms (make 2)'),
    ...roundsToBody(arm.rowByRow),
    h2('Tail (fluffy yarn)'),
    p(t('Switch to your '), gt('fluffy-yarn', 'fluffy yarn'), t(' for this piece. The extra bulk gives the tail its trademark volume.')),
    ...roundsToBody(tail.rowByRow),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' between rounds 8 and 9, 2.5 cm apart. Stuff the head and body firmly. Leave the tail lightly stuffed so it curves naturally. Sew the head to the top of the body. Attach arms to either side of the body at round 4 from the top. Pin the tail in a curve at the back before sewing down; catch it at the base and at the midpoint with tacking stitches.')),
    h2('Finishing'),
    p(t('Embroider the nose in cream with a small oval. Add tiny cream ear patches using satin stitch. Weave in all ends. Brush the '), gt('amigurumi-decrease', 'fluffy tail'), t(' lightly with a soft-bristle brush to lift the fibres.')),
    p(t('Next up: the amigurumi-fox shares the pear body shape, or the amigurumi-acorn makes a good prop to sit with your squirrel.')),
  ]

  const out = makeOut({
    slug,
    title: 'Squirrel Amigurumi',
    subtitle: '',
    excerpt: 'A chestnut-brown squirrel with a pear body and an oversized fluffy-yarn tail that arches over the back. Four pieces plus an optional acorn prop.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['squirrel amigurumi', 'crochet squirrel', 'fluffy tail amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 14 cm tall when sitting with tail arched.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A14: DEER ───────────────────────────────────────────────────────────────
{
  const head = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Head' })
  const body = capsule({ diameterCm: 7, lengthCm: 10, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 4)' })
  const antler = cone({ baseDiameterCm: 1.5, heightCm: 5, gauge: GAUGE, label: 'Antler (make 2)' })

  const slug = 'amigurumi-deer'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-wire-armature']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-wire-armature']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'wire-armature', definition: 'A length of craft wire threaded through limbs or antlers to allow posing and add structural support.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
  ]

  const body_content = [
    p(
      t('This fawn deer uses an oval head and a capsule body, with four slender wire-armature legs and cone antlers. A '),
      gt('wire-armature', 'wire armature'),
      t(' through each leg lets you pose it standing. Start every piece with a '),
      gt('magic-ring', 'magic ring'),
      t('. The deer stands about 20 cm from hoof to ear tip.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 70 g fawn, 10 g white, 5 g dark brown. 3.5 mm crochet hook. Pair of 10 mm '), gt('safety-eyes', 'safety eyes'), t('. Polyester stuffing. 1 mm craft wire (30 cm). Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Head'),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    ...roundsToBody(body.rowByRow),
    h2('Legs (make 4)'),
    p(t('Before stuffing each leg, fold a 7 cm length of '), gt('wire-armature', 'craft wire'), t(' in half and insert it. Leave 1 cm extending from the open end to tuck into the body.')),
    ...roundsToBody(leg.rowByRow),
    h2('Antlers (make 2)'),
    ...roundsToBody(antler.rowByRow),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' on the head between rounds 6 and 7, 3 cm apart. Stuff the head and body. Skip stuffing the antlers; the wire holds their shape. Sew the head to the body. Push leg wires into the body base and sew the leg tops to the underside. Attach antlers to the crown, angling them outward at about 20 degrees.')),
    h2('Finishing'),
    p(t('Embroider a small white tail patch at the rear of the body using satin stitch. Add white spots across the back using French knots if desired. Weave in all ends. Bend the '), gt('amigurumi-decrease', 'wire legs'), t(' gently into the desired pose.')),
    p(t('Next up: the amigurumi-fox or amigurumi-squirrel add friends to the set, or the amigurumi-mushroom is a quick prop piece.')),
  ]

  const out = makeOut({
    slug,
    title: 'Fawn Deer Amigurumi',
    subtitle: '',
    excerpt: 'A poseable fawn deer with an oval head, four wire-armature legs, and upright cone antlers. Stands about 20 cm tall.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['deer amigurumi', 'crochet deer', 'fawn amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 20 cm tall from hoof to ear tip.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A15: BADGER ─────────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 3.5, gauge: GAUGE, label: 'Leg (make 4)' })

  const slug = 'amigurumi-badger'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-colour-change', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-colour-change']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'colour-change', definition: 'Switching yarn at a specified point to create distinct colour sections within a single piece.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
  ]

  const body_content = [
    p(
      t('The badger is a stocky, low-slung figure with a sphere head and an oval body, both worked in its signature grey-and-white pattern. Two black stripes run along the head from snout to crown using '),
      gt('colour-change', 'colour changes'),
      t('. Start every piece with a '),
      gt('magic-ring', 'magic ring'),
      t('. The badger sits about 12 cm long and 9 cm tall.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 50 g grey, 20 g white, 15 g black. 3.5 mm crochet hook. Pair of 9 mm '), gt('safety-eyes', 'safety eyes'), t('. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Head'),
    p(t('Work rounds 1 to 5 in white. On round 6, begin black '), gt('colour-change', 'colour changes'), t(' at the centre-front 8 stitches to form the two facial stripes. Continue the stripe pattern up to round 14, then switch back to grey for the crown.')),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    p(t('Work the body in grey with a white underside. Change to white for the lower third of the oval, creating a pale belly.')),
    ...roundsToBody(body.rowByRow),
    h2('Legs (make 4)'),
    ...roundsToBody(leg.rowByRow),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' between rounds 9 and 10, 2.5 cm apart, above the white facial area. Stuff all pieces. Sew the head to one end of the body. Attach the legs to the underside, keeping them short so the badger sits low.')),
    h2('Finishing'),
    p(t('Embroider the nose in black using satin stitch over the white muzzle tip. Thread the needle with black yarn and carry it under the surface to start each stripe section without cutting. Weave in all ends. The '), gt('amigurumi-decrease', 'invisible decrease'), t(' keeps the stripe edges clean where the colours meet.')),
    p(t('Next up: the amigurumi-hedgehog has a similar low shape, or the amigurumi-mushroom is a quick piece to add to the set.')),
  ]

  const out = makeOut({
    slug,
    title: 'Badger Amigurumi',
    subtitle: '',
    excerpt: 'A stocky black-and-white badger with signature facial stripes worked in colour changes on a sphere head and low oval body.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['badger amigurumi', 'crochet badger', 'woodland badger plushie'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 12 cm long, 9 cm tall when assembled.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A16: OWL ────────────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 9, shortAxisCm: 6.5, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })
  const wing = oval({ longAxisCm: 5, shortAxisCm: 3, gauge: GAUGE, label: 'Wing (make 2)' })

  const slug = 'amigurumi-owl'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-surface-embroidery', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-surface-embroidery']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'surface-embroidery', definition: 'Decorative stitching applied on top of finished crochet fabric to add detail such as feather markings.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
  ]

  const body_content = [
    p(
      t('This round brown owl has a sphere head and an oval body, with wing ovals and a small beak cone attached. Feather markings on the body and the large disc-like facial area around the eyes are added with '),
      gt('surface-embroidery', 'surface embroidery'),
      t(' after assembly. Start every piece with a '),
      gt('magic-ring', 'magic ring'),
      t('. The finished owl sits about 14 cm tall.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 55 g warm brown, 15 g cream, 5 g amber. 3.5 mm crochet hook. Pair of 12 mm '), gt('safety-eyes', 'safety eyes'), t(' (large for owl effect). Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Head'),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    ...roundsToBody(body.rowByRow),
    h2('Beak'),
    ...roundsToBody(beak.rowByRow),
    h2('Wings (make 2)'),
    ...roundsToBody(wing.rowByRow),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' between rounds 9 and 10, 3 cm apart. Stuff the head and body. Sew the head to the top of the body. Centre the beak just below the eyes and sew it on. Pin the wings flat to either side at round 3 from the top, then sew down.')),
    h2('Finishing'),
    p(t('Work '), gt('surface-embroidery', 'surface embroidery'), t(' in cream around each eye for the facial disc. Add V-shaped feather marks in dark brown across the chest. Embroider small talon marks at the base. Use the '), gt('amigurumi-decrease', 'invisible decrease'), t(' technique throughout the pieces to keep the fabric neat. Weave in all ends.')),
    p(t('Next up: the amigurumi-mushroom makes a perch for your owl, or the amigurumi-deer adds a tall figure to the set.')),
  ]

  const out = makeOut({
    slug,
    title: 'Woodland Owl Amigurumi',
    subtitle: '',
    excerpt: 'A round brown owl with a sphere head, oval body, and flat wings. Large safety eyes and surface-embroidery feather marks bring the face to life.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['owl amigurumi', 'crochet owl', 'woodland owl plushie'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 14 cm tall when sitting.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A17: MOUSE (WOODLAND) ───────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = pear({ maxDiameterCm: 7, topDiameterCm: 4, heightCm: 7, gauge: GAUGE, label: 'Body' })
  const ear = cone({ baseDiameterCm: 3, heightCm: 1, gauge: GAUGE, label: 'Ear (make 2)' })

  const slug = 'amigurumi-mouse-woodland'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
    { slug: 'slip-stitch-join', definition: 'A slip stitch used to join the final stitch of a round to the first, keeping the join invisible on the right side.' },
  ]

  const body_content = [
    p(
      t('This small grey wood mouse has a round sphere head, a pear-shaped body, and two flat cone ears. The thin rope tail is a crochet chain. Start every piece with a '),
      gt('magic-ring', 'magic ring'),
      t('. '),
      gt('safety-eyes', 'Safety eyes'),
      t(' give the mouse its wide-eyed look. The finished mouse sits about 10 cm tall.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 40 g mid grey, 5 g pale pink. 3.5 mm crochet hook. Pair of 8 mm '), gt('safety-eyes', 'safety eyes'), t('. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Head'),
    ...roundsToBody(head.rowByRow),
    h2('Body'),
    ...roundsToBody(body.rowByRow),
    h2('Ears (make 2)'),
    p(t('Work each ear as a short cone in grey. Switch to pink for the inner 2 rounds to create the ear cup.')),
    ...roundsToBody(ear.rowByRow),
    h2('Tail'),
    p(t('Chain 30 in grey. Work 1 '), gt('slip-stitch-join', 'slip stitch'), t(' in each chain back to the start. Fasten off leaving a 15 cm tail for sewing.')),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' between rounds 8 and 9, 2 cm apart. Stuff the head and body. Sew the head to the top of the body. Flatten the ears and sew them to the crown at round 3, angling outward. Thread the tail chain through the body base from inside before closing the opening.')),
    h2('Finishing'),
    p(t('Embroider the nose in pink: 3 straight stitches meeting at a point. Thread a 15 cm length of white thread through the muzzle, knot at the centre, then trim to 3 cm each side for whiskers. Weave in all ends. Use '), gt('amigurumi-decrease', 'ladder stitch'), t(' to close any gaps.')),
    p(t('Next up: the amigurumi-acorn is a good prop piece, or the amigurumi-hedgehog is about the same size and a natural pair.')),
  ]

  const out = makeOut({
    slug,
    title: 'Woodland Mouse Amigurumi',
    subtitle: '',
    excerpt: 'A small grey wood mouse with a round head, pear body, cone ears, and a chain tail. A quick intermediate project that sits about 10 cm tall.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['mouse amigurumi', 'crochet mouse', 'woodland mouse plushie'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 10 cm tall when sitting.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A18: MUSHROOM ───────────────────────────────────────────────────────────
{
  const cap = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Cap' })
  const stem = cylinder({ diameterCm: 4, heightCm: 5, gauge: GAUGE, label: 'Stem' })

  const slug = 'amigurumi-mushroom'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
    { slug: 'half-double-crochet', definition: 'A stitch of medium height worked with one yarn-over, producing a softer, denser fabric than treble crochet.' },
    { slug: 'slip-stitch-join', definition: 'A slip stitch used to close a round invisibly.' },
  ]

  const body_content = [
    p(
      t('This cheerful red-spotted mushroom is not an animal but a favourite woodland accent piece. A large sphere forms the cap and a short cylinder is the stem. No safety eyes required, which makes it an ideal first amigurumi project. Start both pieces with a '),
      gt('magic-ring', 'magic ring'),
      t('. The finished mushroom stands about 11 cm tall.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 40 g red, 20 g white, 5 g cream. 3.5 mm crochet hook. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Cap (red)'),
    p(t('Work the full sphere in red. The lower hemisphere will curve over the stem once assembled, giving the characteristic mushroom silhouette. Use the '), gt('amigurumi-decrease', 'invisible decrease'), t(' throughout to keep the fabric taut.')),
    ...roundsToBody(cap.rowByRow),
    h2('Stem (cream)'),
    ...roundsToBody(stem.rowByRow),
    h2('Assembly'),
    p(t('Stuff the cap firmly so it keeps its dome shape. Stuff the stem lightly. Position the open base of the cap over the top of the stem, overlapping by about 1 cm. Sew around the join with '), gt('slip-stitch-join', 'whip stitch'), t(', making sure the cap overhang is even all the way round.')),
    h2('Finishing'),
    p(t('Cut six 1.5 cm white felt circles for the spots. Tack each one to the cap top with a single stitch at the centre, spacing them evenly. Or embroider them in white using '), gt('half-double-crochet', 'satin stitch'), t('. Weave in all ends.')),
    p(t('Next up: the amigurumi-acorn is another quick piece, or the amigurumi-snail adds a creature to the set.')),
  ]

  const out = makeOut({
    slug,
    title: 'Red Spotted Mushroom Amigurumi',
    subtitle: '',
    excerpt: 'A classic red mushroom with white felt spots. Two pieces, no safety eyes, and no colour changes mid-round. A great first amigurumi project.',
    difficulty: 'BEGINNER',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['mushroom amigurumi', 'crochet mushroom', 'toadstool amigurumi'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 11 cm tall when assembled.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A19: ACORN ──────────────────────────────────────────────────────────────
{
  const body = oval({ longAxisCm: 5, shortAxisCm: 4, gauge: GAUGE, label: 'Acorn Body' })
  const cap = cylinder({ diameterCm: 4.5, heightCm: 2, gauge: GAUGE, label: 'Acorn Cap' })

  const slug = 'amigurumi-acorn'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
    { slug: 'back-loop-only', definition: 'Working through the back loop of each stitch only, leaving the front loop free and creating a visible ridge on the right side.' },
    { slug: 'slip-stitch-join', definition: 'A slip stitch used to close a round invisibly.' },
  ]

  const body_content = [
    p(
      t('This tiny acorn is one of the simplest amigurumi in the woodland collection. An oval body forms the nut and a textured cylinder cap sits on top, joined with a chain stitch stalk. Both pieces start with a '),
      gt('magic-ring', 'magic ring'),
      t('. The finished acorn measures about 7 cm tall including the stalk.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 15 g chestnut, 10 g dark brown, 1 g green (for stalk). 3.5 mm crochet hook. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Acorn Body (chestnut)'),
    ...roundsToBody(body.rowByRow),
    h2('Acorn Cap (dark brown)'),
    p(t('Work the cap in '), gt('back-loop-only', 'back loops only'), t(' throughout to create the bumpy texture of a real acorn cap. The raised front loops will show on the right side.')),
    ...roundsToBody(cap.rowByRow),
    h2('Stalk'),
    p(t('Chain 5 in green. Work 1 '), gt('slip-stitch-join', 'slip stitch'), t(' in each chain. Fasten off, leaving a 10 cm tail for sewing.')),
    h2('Assembly'),
    p(t('Stuff the body lightly to hold its oval shape. Leave the cap unstuffed. Set the cap base over the top third of the body and sew it down with '), gt('amigurumi-decrease', 'whip stitch'), t(' all round. Thread the stalk through the cap top and knot it on the inside with a few back stitches.')),
    h2('Finishing'),
    p(t('Weave in all ends. The acorn can be made in multiples as props for the squirrel or as Christmas tree decorations by adding a loop of thread at the stalk end.')),
    p(t('Next up: the amigurumi-mushroom is another quick piece, or the amigurumi-squirrel is a natural pair with the acorn.')),
  ]

  const out = makeOut({
    slug,
    title: 'Acorn Amigurumi',
    subtitle: '',
    excerpt: 'A tiny two-piece acorn with a textured back-loop cap and a chain stitch stalk. About 7 cm tall. A quick beginner project or ornament.',
    difficulty: 'BEGINNER',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['acorn amigurumi', 'crochet acorn', 'woodland ornament crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 7 cm tall including stalk.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

// ─── A20: SNAIL ──────────────────────────────────────────────────────────────
{
  const bodyPiece = pear({ maxDiameterCm: 6, topDiameterCm: 3, heightCm: 7, gauge: GAUGE, label: 'Body' })
  const shell = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Shell' })

  const slug = 'amigurumi-snail'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-surface-embroidery']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-surface-embroidery']
  const glossaryTerms = [
    { slug: 'magic-ring', definition: 'An adjustable start loop that closes to leave no hole at the centre of a piece.' },
    { slug: 'surface-embroidery', definition: 'Decorative stitching worked on top of finished crochet fabric to add spiral or texture detail.' },
    { slug: 'safety-eyes', definition: 'Plastic eyes with a locking washer; secure before stuffing as they cannot be added afterwards.' },
    { slug: 'amigurumi-decrease', definition: 'An invisible decrease worked through the front loops only to reduce stitch count without a visible gap.' },
  ]

  const body_content = [
    p(
      t('This garden snail has a pear-shaped body curling upward at the front and a sphere shell mounted on its back. The shell spiral is added with '),
      gt('surface-embroidery', 'surface embroidery'),
      t(' after the piece is assembled. The body sits flat, giving the snail a stable base. Start both pieces with a '),
      gt('magic-ring', 'magic ring'),
      t('. The snail measures about 12 cm from nose to tail.'),
    ),
    h2('Materials'),
    p(t('DK yarn: 30 g sage green (body), 25 g terracotta (shell), 5 g cream. 3.5 mm crochet hook. Pair of 8 mm '), gt('safety-eyes', 'safety eyes'), t(' on stalks if available, or standard 8 mm. Polyester stuffing. Tapestry needle.')),
    h2('Gauge'),
    p(t('24 sts × 28 rows = 10 × 10 cm in dc on a 3.5 mm hook.')),
    h2('Body (sage green)'),
    p(t('Work the pear with the wide base at the bottom. Leave the top open after the final round; this open end will tuck under the shell during assembly.')),
    ...roundsToBody(bodyPiece.rowByRow),
    h2('Shell (terracotta)'),
    ...roundsToBody(shell.rowByRow),
    h2('Antennae (make 2)'),
    p(t('Chain 8 in sage green, then work 1 dc in each of the last 7 chains back to the base. Fasten off.')),
    h2('Assembly'),
    p(t('Insert '), gt('safety-eyes', 'safety eyes'), t(' at the front tip of the body, 1.5 cm apart. Stuff the body so the wide base sits flat. Stuff the shell firmly. Set the shell on the upper back of the body with about one third of its base resting on the body. Sew the shell down with '), gt('amigurumi-decrease', 'ladder stitch'), t(', catching both layers all the way round. Attach the antennae 1 cm apart at the crown.')),
    h2('Finishing'),
    p(t('Work '), gt('surface-embroidery', 'surface embroidery'), t(' in cream from the shell centre outward in loose chain stitches. Two or three rotations make a clear spiral. Weave in all ends. Add two straight stitches in black at each antenna tip for eyes if stalk eyes are not available.')),
    p(t('Next up: the amigurumi-mushroom pairs well with the snail, or the amigurumi-hedgehog is another small creature in the set.')),
  ]

  const out = makeOut({
    slug,
    title: 'Snail Amigurumi',
    subtitle: '',
    excerpt: 'A sage-green snail with a terracotta sphere shell decorated with a cream surface-embroidery spiral. Sits flat for a stable display base.',
    difficulty: 'INTERMEDIATE',
    sourceNotes: 'Synthesised from standard amigurumi construction principles.',
    techniqueSlugs,
    criticalTechniques,
    aliases: ['snail amigurumi', 'crochet snail', 'garden snail plushie'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
      finishedSizeText: 'Approximately 12 cm from nose to tail.',
    },
    body: { type: 'doc', content: body_content },
  })
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('Written:', slug)
}

console.log('Done. All 10 patterns written to', OUT)
