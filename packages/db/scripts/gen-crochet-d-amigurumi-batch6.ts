/**
 * Generator: D-Amigurumi Batch 6 -- Polar and Arctic Animals A51-A60
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch6.ts
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
} from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-amigurumi')
mkdirSync(OUT, { recursive: true })

// ── helpers ───────────────────────────────────────────────────────────────────
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
const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

function renderPiece(label: string, rounds: Array<{ round: number; instructions: string; stitchCount: number }>) {
  const nodes: object[] = [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: label }] },
  ]
  for (const r of rounds) {
    nodes.push(p(t(`Round ${r.round}: ${r.instructions} (${r.stitchCount} sts)`)))
  }
  return nodes
}

function out(slug: string, data: object) {
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(data, null, 2))
  console.log(`wrote ${slug}.json`)
}

// ── A51: amigurumi-polar-bear ─────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const legF = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legB = capsule({ diameterCm: 3.5, lengthCm: 6, gauge: GAUGE, label: 'Back leg (make 2)' })
  const ear = oval({ longAxisCm: 3, shortAxisCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const snout = cylinder({ diameterCm: 3.5, heightCm: 2, gauge: GAUGE, closeBothEnds: false, label: 'Snout' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    legF.yarnRequiredGrams * 2 + legB.yarnRequiredGrams * 2 +
    ear.yarnRequiredGrams * 2 + snout.yarnRequiredGrams

  const finishedSizeText = `Approx. 26 cm tall seated. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const slug = 'amigurumi-polar-bear'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A white polar bear worked entirely in cream or white DK. Start every piece with a '),
        gt('amigurumi-magic-ring-pb', 'magic ring'),
        t(' and work in continuous rounds. Use a stitch marker to track the round start. The snout is a short cylinder sewn onto the lower face.'),
      ),
      h2('What you need'),
      p(
        t(`White or cream DK yarn, approx. ${totalGrams} g. Small amount of black yarn for the nose and claws. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 12 mm `),
        gt('amigurumi-safety-eyes-pb', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Front leg (make 2)', legF.rowByRow),
      ...renderPiece('Back leg (make 2)', legB.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Snout', snout.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-pb', 'safety eyes'),
        t(' into the head above the snout placement line. Stuff the head firmly. Sew the snout cylinder centred on the lower face. Pin ears flat on the crown and sew through. Stuff the body fully. Attach the head to the top of the body with a '),
        gt('amigurumi-assembly-pb', 'ladder stitch'),
        t('. Sew the back legs at the base of the body and the front legs at mid-body height on each side.'),
      ),
      h2('Finishing'),
      p(t('Embroider a round black nose on the snout tip. Add three short claw marks in black yarn at the paw end of each leg. Weave in all ends.')),
      h2('What to make next'),
      p(t('The baby seal uses a simpler two-piece construction and works up quickly after this.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi polar bear', subtitle: '', excerpt: 'A white polar bear in cream DK, seated at about 26 cm. Sphere head, oval body, and capsule legs worked from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Polar bear amigurumi synthesised from standard sphere-and-oval construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet polar bear toy', 'amigurumi white bear', 'crochet arctic bear'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-pb', term: 'Magic ring', definition: 'An adjustable starting loop that closes with no hole at the centre of a crocheted round. The standard start for amigurumi pieces.' },
      { slug: 'amigurumi-safety-eyes-pb', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric. Insert and lock before stuffing is complete.' },
      { slug: 'amigurumi-assembly-pb', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join stuffed amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A52: amigurumi-penguin ────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const flipper = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Flipper (make 2)' })
  const foot = oval({ longAxisCm: 4, shortAxisCm: 2.5, gauge: GAUGE, label: 'Foot (make 2)' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 2, gauge: GAUGE, label: 'Beak' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    flipper.yarnRequiredGrams * 2 + foot.yarnRequiredGrams * 2 + beak.yarnRequiredGrams

  const finishedSizeText = `Approx. 22 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const slug = 'amigurumi-penguin'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-colour-change', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-colour-change', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A black and white penguin with an orange beak and feet. The body uses a '),
        gt('amigurumi-colour-change-pg', 'colour change'),
        t(' to create the white belly panel. Start every piece with a '),
        gt('amigurumi-magic-ring-pg', 'magic ring'),
        t(' and work in continuous rounds.'),
      ),
      h2('What you need'),
      p(
        t(`Black DK yarn, approx. ${Math.round(totalGrams * 0.6)} g. White DK yarn, approx. ${Math.round(totalGrams * 0.25)} g for the belly panel. Orange DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for the beak and feet. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 10 mm `),
        gt('amigurumi-safety-eyes-pg', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Colour change note'),
      p(
        gt('amigurumi-colour-change-pg', 'Colour change'),
        t(': work the belly stitches in white and the back stitches in black on each round of the body. Carry the unused colour loosely across the back. Alternatively, embroider the white oval belly panel onto a plain black body after assembly.'),
      ),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Flipper (make 2)', flipper.rowByRow),
      ...renderPiece('Foot (make 2)', foot.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-pg', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body. Attach the head to the top of the body with a '),
        gt('amigurumi-assembly-pg', 'ladder stitch'),
        t('. Sew the beak at the centre front of the face between the eyes. Attach the flippers flat on each side of the upper body. Sew the feet at the base of the body so the penguin stands upright.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. If you used a plain black body, embroider or sew on a white oval belly panel from felt or spare white yarn.')),
      h2('What to make next'),
      p(t('The puffin uses a similar sphere-and-oval construction with a large orange beak.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi penguin', subtitle: '', excerpt: 'A black and white penguin with an orange beak and feet in DK yarn, about 22 cm tall. White belly panel worked with colour changes.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Penguin amigurumi synthesised from sphere-and-oval construction with colour-change belly. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet penguin toy', 'amigurumi penguin', 'black white crochet penguin'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-pg', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-colour-change-pg', term: 'Colour change', definition: 'Switching yarn colours mid-round to create a two-tone effect. Pull the new colour through on the final pull-through of the stitch before the change.' },
      { slug: 'amigurumi-safety-eyes-pg', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert and lock before the piece is fully stuffed.' },
      { slug: 'amigurumi-assembly-pg', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces cleanly.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A53: amigurumi-seal ───────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = capsule({ diameterCm: 9, lengthCm: 14, gauge: GAUGE, label: 'Body' })
  const flipperF = oval({ longAxisCm: 6, shortAxisCm: 3, gauge: GAUGE, label: 'Front flipper (make 2)' })
  const flipperB = oval({ longAxisCm: 7, shortAxisCm: 3.5, gauge: GAUGE, label: 'Back flipper (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    flipperF.yarnRequiredGrams * 2 + flipperB.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 28 cm long. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.width} cm wide.`
  const slug = 'amigurumi-seal'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A grey seal lying on its belly, with flat oval flippers and large eyes. Start every piece with a '),
        gt('amigurumi-magic-ring-sl', 'magic ring'),
        t(' and work in continuous rounds. The body is a long capsule that tapers at each end.'),
      ),
      h2('What you need'),
      p(
        t(`Grey DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. White DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for the belly area. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 14 mm `),
        gt('amigurumi-safety-eyes-sl', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Front flipper (make 2)', flipperF.rowByRow),
      ...renderPiece('Back flipper (make 2)', flipperB.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-sl', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body firmly. Attach the head to one tapered end of the body with a '),
        gt('amigurumi-assembly-sl', 'ladder stitch'),
        t('. Sew the front flippers angled downward from the shoulder area. Attach the back flippers at the tail end, splayed slightly outward.'),
      ),
      h2('Finishing'),
      p(t('Embroider a small black nose and a curved smile in black yarn on the face. Weave in all ends.')),
      h2('What to make next'),
      p(t('The baby seal is a smaller beginner version using just a sphere head and a short oval body.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi seal', subtitle: '', excerpt: 'A grey seal with large eyes and four flat flippers in DK yarn, about 28 cm long. Capsule body worked from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Seal amigurumi synthesised from sphere-and-capsule construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet seal toy', 'amigurumi grey seal', 'crochet arctic seal'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-sl', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-sl', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Large eyes give the seal its characteristic look. Lock before fully stuffing.' },
      { slug: 'amigurumi-assembly-sl', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A54: amigurumi-arctic-fox ──────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const legF = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legB = capsule({ diameterCm: 3, lengthCm: 5.5, gauge: GAUGE, label: 'Back leg (make 2)' })
  const tail = capsule({ diameterCm: 5, lengthCm: 10, gauge: GAUGE, label: 'Tail' })
  const ear = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    legF.yarnRequiredGrams * 2 + legB.yarnRequiredGrams * 2 +
    tail.yarnRequiredGrams + ear.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 24 cm long including tail. Head ${head.finishedDimensionsCm.width} cm diameter. Tail ${tail.finishedDimensionsCm.height} cm long.`
  const slug = 'amigurumi-arctic-fox'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A white arctic fox with a large fluffy tail. Start every piece with a '),
        gt('amigurumi-magic-ring-af', 'magic ring'),
        t(' and work in continuous rounds. The tail is a wide capsule, bigger than the legs, and gives the fox its character.'),
      ),
      h2('What you need'),
      p(
        t(`White DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. Black DK yarn, small amount for nose and eye area. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 10 mm `),
        gt('amigurumi-safety-eyes-af', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Front leg (make 2)', legF.rowByRow),
      ...renderPiece('Back leg (make 2)', legB.rowByRow),
      ...renderPiece('Tail', tail.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-af', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body. Attach the head to one end of the body with a '),
        gt('amigurumi-assembly-af', 'ladder stitch'),
        t('. Sew pointed ears upright at the crown. Attach front legs at the chest and back legs at the base of the body. Stuff the tail firmly and sew at the rump end, angling it up and over the back.'),
      ),
      h2('Finishing'),
      p(t('Embroider a small black triangle nose on the muzzle. Add black embroidery around the eye sockets for the eye mask marking. Weave in all ends.')),
      h2('What to make next'),
      p(t('The reindeer uses a similar standing posture with cone antlers added at the crown.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi arctic fox', subtitle: '', excerpt: 'A white arctic fox with a large fluffy tail in DK yarn, about 24 cm long. Sphere head and oval body with capsule legs.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Arctic fox amigurumi synthesised from sphere-and-oval construction with a large capsule tail. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet arctic fox toy', 'amigurumi white fox', 'crochet winter fox'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-af', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-af', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert and lock before the piece is fully stuffed.' },
      { slug: 'amigurumi-assembly-af', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A55: amigurumi-walrus ──────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 15, shortAxisCm: 11, gauge: GAUGE, label: 'Body' })
  const tusk = cone({ baseDiameterCm: 1.5, heightCm: 5, gauge: GAUGE, label: 'Tusk (make 2)' })
  const flipperF = oval({ longAxisCm: 6, shortAxisCm: 3.5, gauge: GAUGE, label: 'Front flipper (make 2)' })
  const flipperB = oval({ longAxisCm: 7, shortAxisCm: 4, gauge: GAUGE, label: 'Back flipper (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    tusk.yarnRequiredGrams * 2 + flipperF.yarnRequiredGrams * 2 + flipperB.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 32 cm long. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm long.`
  const slug = 'amigurumi-walrus'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A brown walrus with ivory cone tusks and flat flippers. Start every piece with a '),
        gt('amigurumi-magic-ring-wl', 'magic ring'),
        t(' and work in continuous rounds. The head is the largest sphere in this pattern; the tusks hang down from the muzzle.'),
      ),
      h2('What you need'),
      p(
        t(`Brown DK yarn, approx. ${Math.round(totalGrams * 0.85)} g. Cream or ivory DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for the tusks. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 12 mm `),
        gt('amigurumi-safety-eyes-wl', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Tusk (make 2)', tusk.rowByRow),
      ...renderPiece('Front flipper (make 2)', flipperF.rowByRow),
      ...renderPiece('Back flipper (make 2)', flipperB.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-wl', 'safety eyes'),
        t(' into the head high on the face. Stuff the head. Stuff the body. Attach the head to one end of the body with a '),
        gt('amigurumi-assembly-wl', 'ladder stitch'),
        t('. Sew the two tusks side by side below the muzzle, pointing downward. Attach the front flippers at the shoulder area and the back flippers at the tail end.'),
      ),
      h2('Finishing'),
      p(t('Embroider short whisker lines radiating from the muzzle in black yarn. Weave in all ends.')),
      h2('What to make next'),
      p(t('The seal uses a similar lying posture with flippers at each end of a long capsule body.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi walrus', subtitle: '', excerpt: 'A brown walrus with ivory cone tusks and flat flippers in DK yarn, about 32 cm long. Large sphere head and oval body.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Walrus amigurumi synthesised from sphere-and-oval construction with cone tusks. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet walrus toy', 'amigurumi walrus', 'crochet arctic walrus'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-wl', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-wl', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Place them high on the walrus face, above the tusks. Lock before stuffing is complete.' },
      { slug: 'amigurumi-assembly-wl', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces cleanly.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A56: amigurumi-reindeer ────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 14, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 7, gauge: GAUGE, label: 'Leg (make 4)' })
  const antler = cone({ baseDiameterCm: 2, heightCm: 6, gauge: GAUGE, label: 'Antler (make 2)' })
  const ear = oval({ longAxisCm: 4, shortAxisCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const snout = cylinder({ diameterCm: 3, heightCm: 1.5, gauge: GAUGE, closeBothEnds: false, label: 'Snout' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    leg.yarnRequiredGrams * 4 + antler.yarnRequiredGrams * 2 +
    ear.yarnRequiredGrams * 2 + snout.yarnRequiredGrams

  const finishedSizeText = `Approx. 30 cm tall including antlers. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm long.`
  const slug = 'amigurumi-reindeer'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-wire-armature']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A brown reindeer with cone antlers and a round red or brown snout. Start every piece with a '),
        gt('amigurumi-magic-ring-rd', 'magic ring'),
        t(' and work in continuous rounds. Optional: thread a short length of '),
        gt('amigurumi-wire-rd', 'wire armature'),
        t(' through each leg so the reindeer stands unaided.'),
      ),
      h2('What you need'),
      p(
        t(`Brown DK yarn, approx. ${Math.round(totalGrams * 0.75)} g. Tan or cream DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for the belly and face marking. Red DK yarn, small amount for the nose. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 10 mm `),
        gt('amigurumi-safety-eyes-rd', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Leg (make 4)', leg.rowByRow),
      ...renderPiece('Antler (make 2)', antler.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Snout', snout.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-rd', 'safety eyes'),
        t(' into the head. Attach the snout at the centre lower face. Stuff the head. Stuff the body. Attach the head to one end of the body with a '),
        gt('amigurumi-assembly-rd', 'ladder stitch'),
        t('. Insert '),
        gt('amigurumi-wire-rd', 'wire armature'),
        t(' into the legs if using, then stuff and sew them under the body. Sew antlers upright at the crown. Attach ears on each side of the antler base.'),
      ),
      h2('Finishing'),
      p(t('Embroider a red or brown nose on the snout. Add a cream patch on the belly by embroidery or by working colour changes in the body rounds. Weave in all ends.')),
      h2('What to make next'),
      p(t('The arctic fox uses a similar standing build with a large capsule tail instead of antlers.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi reindeer', subtitle: '', excerpt: 'A brown reindeer with cone antlers and a round nose in DK yarn, about 30 cm tall. Optional wire legs help it stand unaided.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Reindeer amigurumi synthesised from sphere-and-oval construction with cone antlers. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet reindeer toy', 'amigurumi reindeer', 'crochet christmas reindeer'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-rd', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-rd', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert and lock before the piece is fully stuffed and closed.' },
      { slug: 'amigurumi-wire-rd', term: 'Wire armature', definition: 'A length of florist wire or pipe cleaner threaded through a limb before stuffing. Lets the piece hold a pose and stand on its own.' },
      { slug: 'amigurumi-assembly-rd', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A57: amigurumi-snowman ─────────────────────────────────────────────────────
{
  const bottom = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Bottom sphere' })
  const middle = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Middle sphere' })
  const topSphere = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head sphere' })
  const hat = cylinder({ diameterCm: 6, heightCm: 5, gauge: GAUGE, closeBothEnds: false, label: 'Hat' })
  const brim = cylinder({ diameterCm: 8, heightCm: 1, gauge: GAUGE, closeBothEnds: false, label: 'Hat brim' })
  const nose = cone({ baseDiameterCm: 1.5, heightCm: 3, gauge: GAUGE, label: 'Carrot nose' })

  const totalGrams = bottom.yarnRequiredGrams + middle.yarnRequiredGrams +
    topSphere.yarnRequiredGrams + hat.yarnRequiredGrams + brim.yarnRequiredGrams + nose.yarnRequiredGrams

  const finishedSizeText = `Approx. 28 cm tall. Bottom ${bottom.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-snowman'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A classic three-ball snowman with a top hat and a carrot nose. All pieces start with a '),
        gt('amigurumi-magic-ring-sm', 'magic ring'),
        t('. This is a great beginner project: every sphere uses the same increase-and-decrease sequence, just at different sizes. No safety eyes are needed; the eyes are embroidered on.'),
      ),
      h2('What you need'),
      p(
        t(`White DK yarn, approx. ${Math.round(totalGrams * 0.65)} g. Black DK yarn, approx. ${Math.round(totalGrams * 0.25)} g for the hat. Orange DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for the nose. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Polyester stuffing. Small buttons or beads for the eyes and front buttons, or embroider them on.`),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Bottom sphere', bottom.rowByRow),
      ...renderPiece('Middle sphere', middle.rowByRow),
      ...renderPiece('Head sphere', topSphere.rowByRow),
      ...renderPiece('Hat', hat.rowByRow),
      ...renderPiece('Hat brim', brim.rowByRow),
      ...renderPiece('Carrot nose', nose.rowByRow),
      h2('Assembly'),
      p(
        t('Stuff all three spheres firmly. Stack them bottom to top and join each pair with a '),
        gt('amigurumi-assembly-sm', 'ladder stitch'),
        t(', going through both layers several times for strength. Sew the hat brim around the base of the hat cylinder. Stuff the hat lightly and sew it to the top of the head sphere at a slight angle. Attach the carrot nose to the centre of the face.'),
      ),
      h2('Finishing'),
      p(t('Embroider two round black eyes on the head. Embroider a row of small round buttons down the middle sphere for the coat buttons. Weave in all ends.')),
      h2('What to make next'),
      p(t('The polar bear uses the same sphere-and-increase sequence with added limbs.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi snowman', subtitle: '', excerpt: 'A classic three-ball snowman with a top hat and a carrot nose in DK yarn, about 28 cm tall. No safety eyes needed.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Snowman amigurumi synthesised from three graduated spheres with cylinder hat and cone nose. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet snowman toy', 'amigurumi snowman', 'beginner crochet snowman'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-sm', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds. Pull the tail end tight after the first round to close any gap.' },
      { slug: 'amigurumi-assembly-sm', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces. Run the needle through both pieces in small horizontal stitches, then pull tight.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A58: amigurumi-puffin ─────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 3.5, heightCm: 3.5, gauge: GAUGE, label: 'Beak' })
  const wing = oval({ longAxisCm: 5, shortAxisCm: 3, gauge: GAUGE, label: 'Wing (make 2)' })
  const foot = oval({ longAxisCm: 3.5, shortAxisCm: 2, gauge: GAUGE, label: 'Foot (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    beak.yarnRequiredGrams + wing.yarnRequiredGrams * 2 + foot.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 18 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const slug = 'amigurumi-puffin'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-colour-change', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-colour-change', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A black and white puffin with a large striped orange beak. Start every piece with a '),
        gt('amigurumi-magic-ring-pf', 'magic ring'),
        t(' and work in continuous rounds. The beak is the centrepiece: work it in orange with yellow and grey '),
        gt('amigurumi-colour-change-pf', 'colour change'),
        t(' stripes, or embroider the stripes onto a plain orange cone after making up.'),
      ),
      h2('What you need'),
      p(
        t(`Black DK yarn, approx. ${Math.round(totalGrams * 0.55)} g. White DK yarn, approx. ${Math.round(totalGrams * 0.3)} g for the belly and face patch. Orange DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for the beak and feet. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 8 mm `),
        gt('amigurumi-safety-eyes-pf', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      ...renderPiece('Foot (make 2)', foot.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-pf', 'safety eyes'),
        t(' into the head at the edge of the white face patch. Stuff the head. Sew the beak onto the centre front of the face. Stuff the body. Attach the head to the body with a '),
        gt('amigurumi-assembly-pf', 'ladder stitch'),
        t('. Sew the wings flat on each side. Attach the feet at the base of the body.'),
      ),
      h2('Finishing'),
      p(
        t('If you did not work '),
        gt('amigurumi-colour-change-pf', 'colour change'),
        t(' stripes into the beak, embroider narrow horizontal lines in grey and yellow yarn across the beak now. Weave in all ends.'),
      ),
      h2('What to make next'),
      p(t('The penguin uses a similar black and white palette with a simpler cone beak.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi puffin', subtitle: '', excerpt: 'A black and white puffin with a large striped orange beak in DK yarn, about 18 cm tall. Sphere head and oval body.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Puffin amigurumi synthesised from sphere-and-oval construction with large cone beak. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet puffin toy', 'amigurumi puffin', 'crochet atlantic puffin'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-pf', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-colour-change-pf', term: 'Colour change', definition: 'Switching yarn colours mid-round or at round start. Used here to add stripe markings to the beak.' },
      { slug: 'amigurumi-safety-eyes-pf', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Position them at the edge of the white face patch for the puffin look.' },
      { slug: 'amigurumi-assembly-pf', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A59: amigurumi-snowy-owl ──────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })
  const wing = capsule({ diameterCm: 3, lengthCm: 8, gauge: GAUGE, label: 'Wing (make 2)' })
  const ear = cone({ baseDiameterCm: 2, heightCm: 2.5, gauge: GAUGE, label: 'Ear tuft (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    beak.yarnRequiredGrams + wing.yarnRequiredGrams * 2 + ear.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 24 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const slug = 'amigurumi-snowy-owl'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-surface-embroidery']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A white snowy owl with large yellow eyes and capsule wings. Start every piece with a '),
        gt('amigurumi-magic-ring-so', 'magic ring'),
        t(' and work in continuous rounds. Add grey speckle markings with '),
        gt('amigurumi-embroidery-so', 'surface embroidery'),
        t(' after assembly.'),
      ),
      h2('What you need'),
      p(
        t(`White DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. Grey DK yarn, small amount for embroidered speckles. Yellow DK yarn, small amount for the eye ring embroidery. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 14 mm yellow `),
        gt('amigurumi-safety-eyes-so', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      ...renderPiece('Ear tuft (make 2)', ear.rowByRow),
      h2('Assembly'),
      p(
        t('Lock yellow '),
        gt('amigurumi-safety-eyes-so', 'safety eyes'),
        t(' into the head, set wide apart for the owl look. Sew the short beak cone just below and between the eyes. Stuff the head. Stuff the body. Attach the head to the top of the body with a '),
        gt('amigurumi-assembly-so', 'ladder stitch'),
        t('. Sew the small ear tufts upright at the crown. Attach the capsule wings flat on each side of the body.'),
      ),
      h2('Finishing'),
      p(
        t('Use '),
        gt('amigurumi-embroidery-so', 'surface embroidery'),
        t(' to scatter short grey cross-stitch marks across the body and wings. Embroider a yellow ring around each eye. Weave in all ends.'),
      ),
      h2('What to make next'),
      p(t('The puffin uses a similar sphere-and-oval build with a much larger beak.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi snowy owl', subtitle: '', excerpt: 'A white snowy owl with large yellow eyes and grey speckle embroidery in DK yarn, about 24 cm tall.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Snowy owl amigurumi synthesised from sphere-and-oval construction with capsule wings. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet owl toy', 'amigurumi snowy owl', 'crochet white owl'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-so', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-so', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Yellow eyes set wide apart give the snowy owl its distinctive look.' },
      { slug: 'amigurumi-embroidery-so', term: 'Surface embroidery', definition: 'Decorative stitches worked on the surface of a finished crochet piece. Used here to add grey speckle marks to the owl plumage.' },
      { slug: 'amigurumi-assembly-so', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

// ── A60: amigurumi-baby-seal ───────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 9, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams

  const finishedSizeText = `Approx. 9 cm long. Head ${head.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-baby-seal'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A tiny white baby seal made from just two pieces: a sphere head and a small oval body. Both start with a '),
        gt('amigurumi-magic-ring-bs', 'magic ring'),
        t('. This is an ideal first amigurumi project. The whole seal uses less than 30 g of yarn and can be finished in a single sitting.'),
      ),
      h2('What you need'),
      p(
        t(`White DK yarn, approx. ${totalGrams} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `),
        gt('amigurumi-safety-eyes-bs', 'safety eyes'),
        t('. Polyester stuffing.'),
      ),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-bs', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body lightly. Attach the head to one tapered end of the body with a '),
        gt('amigurumi-assembly-bs', 'ladder stitch'),
        t('. The body naturally tapers at the tail end without any extra pieces.'),
      ),
      h2('Finishing'),
      p(t('Embroider a small black oval nose on the muzzle and a curved smile below it. Weave in all ends. The seal lies flat on its belly.')),
      h2('What to make next'),
      p(t('The full-size seal adds front and back flippers and a larger capsule body.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi baby seal', subtitle: '', excerpt: 'A tiny white baby seal made from just a sphere head and an oval body in DK yarn, about 9 cm long. A perfect first amigurumi.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Baby seal amigurumi synthesised from sphere and oval. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet baby seal toy', 'amigurumi baby seal', 'tiny crochet seal'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-bs', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds. Pull the tail end tight to close the gap at the centre.' },
      { slug: 'amigurumi-safety-eyes-bs', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert and lock before the piece is fully stuffed and closed.' },
      { slug: 'amigurumi-assembly-bs', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces without leaving a visible ridge.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText, terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body: body_doc,
  })
}

console.log('\nAll 10 polar and arctic animal amigurumi patterns generated.')
