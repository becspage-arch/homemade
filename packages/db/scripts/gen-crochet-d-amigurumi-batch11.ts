/**
 * Generator: D-Amigurumi Batch 11 -- Birds A101-A110
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch11.ts
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

// ── A101: amigurumi-robin ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-robin'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 1.5, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })
  const wing = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Wing (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    beak.yarnRequiredGrams + wing.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 14 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-colour-change', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('This cheerful robin has a warm '),
        gt('robin-breast-patch', 'colour-change'),
        t(' breast panel worked in rounds. Start every piece with a '),
        gt('robin-magic-ring', 'magic ring'),
        t(' and work in continuous rounds with a stitch marker. The beak is a small cone sewn on after assembly.'),
      ),
      h2('What you need'),
      p(t(`Brown DK yarn, approx. ${Math.round(totalGrams * 0.7)} g. Rust-red DK yarn, approx. ${Math.round(totalGrams * 0.2)} g. Cream DK yarn, approx. ${Math.round(totalGrams * 0.1)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 8 mm `), gt('robin-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('robin-safety-eyes', 'safety eyes'),
        t(' on either side of the head before closing. Stuff the head firmly. Sew the beak cone to the front of the head. Stuff the body and attach the head using '),
        gt('robin-ladder-stitch', 'ladder stitch'),
        t('. Pin both wings flat along the sides of the body and sew through.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. The rust-red breast patch can be worked as a colour change during the body rounds, or embroidered on afterwards in satin stitch.')),
      h2('What to make next'),
      p(t('The amigurumi pigeon uses the same sphere head and oval body combination.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi robin', subtitle: '', excerpt: 'A red-breasted robin in brown and rust DK, about 14 cm tall. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi robin design synthesised from standard sphere-and-oval construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet robin toy', 'amigurumi red breast bird', 'crochet garden bird'],
    glossaryTerms: [
      { slug: 'robin-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'robin-breast-patch', term: 'Colour change', definition: 'Switching yarn colours mid-round to create patches or markings. Pull the new colour through the final pull-through of the last stitch before the change.' },
      { slug: 'robin-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'robin-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A102: amigurumi-flamingo ──────────────────────────────────────────────────
{
  const slug = 'amigurumi-flamingo'
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 12, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const neck = cylinder({ diameterCm: 3, heightCm: 10, gauge: GAUGE, closeBothEnds: false, label: 'Neck' })
  const leg = cylinder({ diameterCm: 1.5, heightCm: 12, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 2)' })
  const beak = cone({ baseDiameterCm: 1.5, heightCm: 2.5, gauge: GAUGE, label: 'Beak' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    neck.yarnRequiredGrams + leg.yarnRequiredGrams * 2 + beak.yarnRequiredGrams

  const finishedSizeText = `Approx. 30 cm tall standing. Body ${body.finishedDimensionsCm.height} cm tall. Leg ${leg.finishedDimensionsCm.height} cm long.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-wire-armature', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-wire-armature']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('This tall flamingo stands on two long legs thanks to a '),
        gt('flamingo-wire-armature', 'wire armature'),
        t(' threaded through each leg before stuffing. The S-curve neck is shaped by bending the armature gently after assembly. Start every piece with a '),
        gt('flamingo-magic-ring', 'magic ring'),
        t(' and work in continuous rounds.'),
      ),
      h2('What you need'),
      p(t(`Deep pink DK yarn, approx. ${Math.round(totalGrams * 0.8)} g. Black DK yarn, approx. ${Math.round(totalGrams * 0.05)} g. White DK yarn, approx. ${Math.round(totalGrams * 0.15)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 8 mm `), gt('flamingo-safety-eyes', 'safety eyes'), t(`. Polyester stuffing. Two lengths of floral wire or pipe cleaner for legs.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Neck', neck.rowByRow),
      ...renderPiece('Leg (make 2)', leg.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      h2('Assembly'),
      p(
        t('Thread wire through each leg tube before seaming closed. Insert '),
        gt('flamingo-safety-eyes', 'safety eyes'),
        t(' on the head, then stuff. Attach the beak cone below the eye line. Attach the neck tube between head and body. Stuff the body, then insert wired legs at the underside and sew securely. Use '),
        gt('flamingo-ladder-stitch', 'ladder stitch'),
        t(' throughout for clean joins.'),
      ),
      h2('Finishing'),
      p(t('Bend the neck wire to form a gentle S-curve. Shape the leg wires so the flamingo stands flat. Weave in all ends and trim.')),
      h2('What to make next'),
      p(t('The amigurumi swan uses a similar curved neck worked from a cylinder.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi flamingo', subtitle: '', excerpt: 'A pink flamingo standing about 30 cm tall with a wire-supported S-curve neck and long legs. Worked in continuous rounds.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi flamingo design synthesised from cylinder-and-oval construction with wire armature. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet flamingo toy', 'amigurumi pink bird', 'crochet tropical bird'],
    glossaryTerms: [
      { slug: 'flamingo-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'flamingo-wire-armature', term: 'Wire armature', definition: 'A length of wire or pipe cleaner threaded inside a crocheted limb to make it poseable and self-supporting.' },
      { slug: 'flamingo-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'flamingo-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A103: amigurumi-peacock ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-peacock'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 13, shortAxisCm: 10, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 1.5, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })
  const tailFeather = oval({ longAxisCm: 9, shortAxisCm: 4, gauge: GAUGE, label: 'Tail feather (make 5)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    beak.yarnRequiredGrams + tailFeather.yarnRequiredGrams * 5

  const finishedSizeText = `Approx. 18 cm tall body, tail fan extends to 18 cm wide. Head ${head.finishedDimensionsCm.width} cm diameter.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-colour-change', 'amigurumi-embroidery', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-colour-change', 'amigurumi-embroidery']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A jewel-toned peacock with five individual tail feathers fanned out behind the body. Each feather is a flat oval worked in teal, with a '),
        gt('peacock-eyespot', 'colour-change'),
        t(' eyespot embroidered in blue and gold. Start every piece with a '),
        gt('peacock-magic-ring', 'magic ring'),
        t(' and work in continuous rounds.'),
      ),
      h2('What you need'),
      p(t(`Teal DK yarn, approx. ${Math.round(totalGrams * 0.55)} g. Royal blue DK yarn, approx. ${Math.round(totalGrams * 0.2)} g. Green DK yarn, approx. ${Math.round(totalGrams * 0.15)} g. Gold DK yarn, approx. ${Math.round(totalGrams * 0.1)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `), gt('peacock-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Tail feather (make 5)', tailFeather.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('peacock-safety-eyes', 'safety eyes'),
        t(' on the head and stuff firmly. Sew the beak below the eye line. Stuff the body and join the head using '),
        gt('peacock-ladder-stitch', 'ladder stitch'),
        t('. Arrange the five tail feathers in a fan shape behind the body and sew each securely at the base. Embroider an eyespot on each feather: a small circle of blue with a gold centre dot.'),
      ),
      h2('Finishing'),
      p(
        t('Embroider a small crest of 3 to 5 straight stitches topped with French knots on the crown of the head. Use '),
        gt('peacock-eyespot', 'colour-change'),
        t(' blue yarn for the French knots. Weave in all ends.'),
      ),
      h2('What to make next'),
      p(t('The amigurumi eagle uses similar oval feather-shaped pieces for its wing panels.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi peacock', subtitle: '', excerpt: 'A jewel-toned peacock with five fanned tail feathers, about 18 cm tall. An advanced project with embroidered eyespots.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'ADVANCED', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi peacock design synthesised from sphere-and-oval construction with multi-piece fan tail. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet peacock toy', 'amigurumi peafowl', 'crochet bird with tail feathers'],
    glossaryTerms: [
      { slug: 'peacock-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'peacock-eyespot', term: 'Colour change', definition: 'Switching yarn colours mid-round or using embroidery to create a contrasting eyespot on each tail feather.' },
      { slug: 'peacock-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'peacock-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A104: amigurumi-swan ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-swan'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 14, shortAxisCm: 11, gauge: GAUGE, label: 'Body' })
  const neck = cylinder({ diameterCm: 3.5, heightCm: 10, gauge: GAUGE, closeBothEnds: false, label: 'Neck' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 2, gauge: GAUGE, label: 'Beak' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    neck.yarnRequiredGrams + beak.yarnRequiredGrams

  const finishedSizeText = `Approx. 22 cm tall. Body ${body.finishedDimensionsCm.height} cm tall. Neck ${neck.finishedDimensionsCm.height} cm long.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-wire-armature', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-wire-armature']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A graceful white swan with a long curved neck supported by a '),
        gt('swan-wire-armature', 'wire armature'),
        t('. The neck cylinder is worked in continuous rounds and shaped into an S-curve after the wire is inserted. Start every piece with a '),
        gt('swan-magic-ring', 'magic ring'),
        t('.'),
      ),
      h2('What you need'),
      p(t(`White DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. Orange DK yarn, approx. ${Math.round(totalGrams * 0.07)} g. Black DK yarn, approx. ${Math.round(totalGrams * 0.03)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `), gt('swan-safety-eyes', 'safety eyes'), t(`. Polyester stuffing. One length of sturdy floral wire for the neck.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Neck', neck.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      h2('Assembly'),
      p(
        t('Thread wire through the neck before seaming. Insert '),
        gt('swan-safety-eyes', 'safety eyes'),
        t(' on the head and stuff. Sew the orange beak to the front of the head. Attach the neck between head and body. Stuff the body fully and join using '),
        gt('swan-ladder-stitch', 'ladder stitch'),
        t('. Bend the neck wire into a graceful curve.'),
      ),
      h2('Finishing'),
      p(t('Embroider a small black teardrop above each safety eye for the facial mask marking. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi flamingo uses the same wired neck method.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi swan', subtitle: '', excerpt: 'An elegant white swan with a wire-supported curved neck, about 22 cm tall. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi swan design synthesised from sphere-oval-cylinder construction with wire neck. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet swan toy', 'amigurumi white bird', 'crochet lake bird'],
    glossaryTerms: [
      { slug: 'swan-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'swan-wire-armature', term: 'Wire armature', definition: 'A length of wire or pipe cleaner threaded inside a crocheted limb to make it poseable and self-supporting.' },
      { slug: 'swan-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'swan-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A105: amigurumi-eagle ─────────────────────────────────────────────────────
{
  const slug = 'amigurumi-eagle'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 14, shortAxisCm: 10, gauge: GAUGE, label: 'Body' })
  const wing = capsule({ diameterCm: 4, lengthCm: 10, gauge: GAUGE, label: 'Wing (make 2)' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 3, gauge: GAUGE, label: 'Beak' })
  const talon = cone({ baseDiameterCm: 1, heightCm: 2, gauge: GAUGE, label: 'Talon (make 4)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    wing.yarnRequiredGrams * 2 + beak.yarnRequiredGrams + talon.yarnRequiredGrams * 4

  const finishedSizeText = `Approx. 22 cm tall. Wingspan approx. 26 cm tip to tip. Head ${head.finishedDimensionsCm.width} cm diameter.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-colour-change', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A bald eagle with a white head, brown body, and large capsule wings. Each wing is worked in a single piece and shaped with '),
        gt('eagle-increases', 'increases'),
        t(' at the centre and '),
        gt('eagle-decreases', 'decreases'),
        t(' at both ends. Start every piece with a '),
        gt('eagle-magic-ring', 'magic ring'),
        t(' and work in continuous rounds.'),
      ),
      h2('What you need'),
      p(t(`Brown DK yarn, approx. ${Math.round(totalGrams * 0.6)} g. White DK yarn, approx. ${Math.round(totalGrams * 0.25)} g. Yellow DK yarn, approx. ${Math.round(totalGrams * 0.15)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 10 mm `), gt('eagle-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Talon (make 4)', talon.rowByRow),
      h2('Assembly'),
      p(
        t('Work the head in white yarn. Insert '),
        gt('eagle-safety-eyes', 'safety eyes'),
        t(' and stuff firmly. Attach the yellow hooked beak below the eye line. Stuff the body and join the head using '),
        gt('eagle-ladder-stitch', 'ladder stitch'),
        t('. Attach both wings flat against the sides of the body. Sew four talon cones to the underside of the body in two groups of two.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. Colour changes between white head and brown body can be worked during the body rounds, or the white collar embroidered on in satin stitch.')),
      h2('What to make next'),
      p(t('The amigurumi crow uses a similar capsule wing construction in all black.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi eagle', subtitle: '', excerpt: 'A bald eagle in brown and white DK with a wingspan of about 26 cm. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi eagle design synthesised from sphere-oval-capsule construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet eagle toy', 'amigurumi bald eagle', 'crochet bird of prey'],
    glossaryTerms: [
      { slug: 'eagle-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'eagle-increases', term: 'Increases', definition: 'Working two double crochets into the same stitch to add stitches and widen the fabric.' },
      { slug: 'eagle-decreases', term: 'Decreases', definition: 'Crocheting two stitches together (dc2tog) to reduce the stitch count and narrow the fabric.' },
      { slug: 'eagle-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'eagle-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A106: amigurumi-hummingbird ───────────────────────────────────────────────
{
  const slug = 'amigurumi-hummingbird'
  const head = sphere({ diameterCm: 4, gauge: GAUGE, label: 'Head' })
  const body = capsule({ diameterCm: 3.5, lengthCm: 5, gauge: GAUGE, label: 'Body' })
  const wing = oval({ longAxisCm: 5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Wing (make 2)' })
  const beak = cone({ baseDiameterCm: 0.8, heightCm: 2, gauge: GAUGE, label: 'Beak' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    wing.yarnRequiredGrams * 2 + beak.yarnRequiredGrams

  const finishedSizeText = `Approx. 8 cm long. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm long.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A tiny hummingbird worked entirely in small pieces. The compact size makes this a great first bird amigurumi. Start every piece with a '),
        gt('hummingbird-magic-ring', 'magic ring'),
        t(' and work in continuous rounds with a stitch marker. Use a smaller hook if needed to keep the fabric tight enough to hold stuffing.'),
      ),
      h2('What you need'),
      p(t(`Iridescent green DK yarn, approx. ${Math.round(totalGrams * 0.6)} g. Ruby red DK yarn, approx. ${Math.round(totalGrams * 0.2)} g. Cream DK yarn, approx. ${Math.round(totalGrams * 0.2)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 6 mm `), gt('hummingbird-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('hummingbird-safety-eyes', 'safety eyes'),
        t(' on the head and stuff. Sew the thin beak cone to the front of the head. Attach the head to the front of the body using '),
        gt('hummingbird-ladder-stitch', 'ladder stitch'),
        t('. Pin both wings at a slight upward angle on the sides of the body and sew through.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. The ruby throat patch can be embroidered in satin stitch on the front of the body.')),
      h2('What to make next'),
      p(t('The amigurumi robin uses the same sphere head and oval body at a slightly larger scale.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi hummingbird', subtitle: '', excerpt: 'A tiny iridescent hummingbird about 8 cm long. A beginner-friendly bird amigurumi worked in continuous rounds.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi hummingbird design synthesised from sphere-capsule-oval construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet hummingbird toy', 'amigurumi tiny bird', 'crochet garden bird'],
    glossaryTerms: [
      { slug: 'hummingbird-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'hummingbird-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'hummingbird-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A107: amigurumi-pigeon ────────────────────────────────────────────────────
{
  const slug = 'amigurumi-pigeon'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const wing = capsule({ diameterCm: 3, lengthCm: 7, gauge: GAUGE, label: 'Wing (make 2)' })
  const beak = cone({ baseDiameterCm: 1.5, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    wing.yarnRequiredGrams * 2 + beak.yarnRequiredGrams

  const finishedSizeText = `Approx. 16 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A plump city pigeon in grey and white DK. The body is worked in a simple oval, and the wings are capsule-shaped pieces sewn flat against the sides. Start every piece with a '),
        gt('pigeon-magic-ring', 'magic ring'),
        t(' and work in continuous rounds.'),
      ),
      h2('What you need'),
      p(t(`Grey DK yarn, approx. ${Math.round(totalGrams * 0.7)} g. White DK yarn, approx. ${Math.round(totalGrams * 0.2)} g. Iridescent or purple DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for the neck sheen. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 8 mm `), gt('pigeon-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('pigeon-safety-eyes', 'safety eyes'),
        t(' on the head and stuff. Sew the small beak below the eye line. Stuff the body and attach the head using '),
        gt('pigeon-ladder-stitch', 'ladder stitch'),
        t('. Lay both wings flat along the upper sides of the body and sew through.'),
      ),
      h2('Finishing'),
      p(t('Embroider a band of iridescent or purple chain stitches around the neck for the sheen marking. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi crow uses the same capsule wing construction in all black.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi pigeon', subtitle: '', excerpt: 'A plump city pigeon in grey DK, about 16 cm tall. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi pigeon design synthesised from sphere-oval-capsule construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet pigeon toy', 'amigurumi grey bird', 'crochet city bird'],
    glossaryTerms: [
      { slug: 'pigeon-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'pigeon-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'pigeon-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A108: amigurumi-crow ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-crow'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 11, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const wing = capsule({ diameterCm: 3, lengthCm: 8, gauge: GAUGE, label: 'Wing (make 2)' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 2.5, gauge: GAUGE, label: 'Beak' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    wing.yarnRequiredGrams * 2 + beak.yarnRequiredGrams

  const finishedSizeText = `Approx. 16 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('An all-black crow with a large sturdy beak and long wings. Work entirely in black DK. Start every piece with a '),
        gt('crow-magic-ring', 'magic ring'),
        t(' and work in continuous rounds. The wings are longer than the pigeon version to give the crow its characteristic silhouette.'),
      ),
      h2('What you need'),
      p(t(`Black DK yarn, approx. ${totalGrams} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 8 mm `), gt('crow-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('crow-safety-eyes', 'safety eyes'),
        t(' on the head and stuff. Sew the large beak to the front of the head. Stuff the body and attach the head using '),
        gt('crow-ladder-stitch', 'ladder stitch'),
        t('. Pin both wings flat along the upper sides of the body and sew through. The wing tips should extend slightly past the tail end of the body.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. A small piece of blue or purple yarn woven through a few stitches on the wing gives the iridescent sheen characteristic of real crow feathers.')),
      h2('What to make next'),
      p(t('The amigurumi eagle uses a similar capsule wing shape scaled up to a larger size.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi crow', subtitle: '', excerpt: 'An all-black crow in DK yarn, about 16 cm tall with long wings. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi crow design synthesised from sphere-oval-capsule construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet crow toy', 'amigurumi black bird', 'crochet raven toy'],
    glossaryTerms: [
      { slug: 'crow-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'crow-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'crow-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A109: amigurumi-pelican ───────────────────────────────────────────────────
{
  const slug = 'amigurumi-pelican'
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 15, shortAxisCm: 11, gauge: GAUGE, label: 'Body' })
  const pouch = cylinder({ diameterCm: 4, heightCm: 6, gauge: GAUGE, closeBothEnds: false, label: 'Pouch beak' })
  const wing = capsule({ diameterCm: 4, lengthCm: 9, gauge: GAUGE, label: 'Wing (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    pouch.yarnRequiredGrams + wing.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 22 cm tall. Body ${body.finishedDimensionsCm.height} cm tall. Pouch beak ${pouch.finishedDimensionsCm.height} cm long.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A white pelican with its distinctive large pouch beak worked as a wide cylinder attached below the head. Start every piece with a '),
        gt('pelican-magic-ring', 'magic ring'),
        t(' and work in continuous rounds. The pouch cylinder is left open at the bottom to give a realistic drooping shape.'),
      ),
      h2('What you need'),
      p(t(`White DK yarn, approx. ${Math.round(totalGrams * 0.8)} g. Yellow DK yarn, approx. ${Math.round(totalGrams * 0.15)} g. Orange DK yarn, approx. ${Math.round(totalGrams * 0.05)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `), gt('pelican-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Pouch beak', pouch.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('pelican-safety-eyes', 'safety eyes'),
        t(' on the head and stuff. Sew the open end of the pouch cylinder below the head, curving it downward. Stuff the body and attach the head using '),
        gt('pelican-ladder-stitch', 'ladder stitch'),
        t('. Attach both wings flat on the sides of the body.'),
      ),
      h2('Finishing'),
      p(t('Lightly stuff the pouch beak to hold its shape without making it rigid. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi flamingo also uses a long wired neck.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi pelican', subtitle: '', excerpt: 'A white pelican with its large pouch beak, about 22 cm tall. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi pelican design synthesised from sphere-oval-cylinder construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet pelican toy', 'amigurumi seabird', 'crochet coastal bird'],
    glossaryTerms: [
      { slug: 'pelican-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'pelican-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'pelican-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A110: amigurumi-kiwi ──────────────────────────────────────────────────────
{
  const slug = 'amigurumi-kiwi'
  const body = oval({ longAxisCm: 12, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const beak = cone({ baseDiameterCm: 1, heightCm: 5, gauge: GAUGE, label: 'Beak' })
  const leg = cylinder({ diameterCm: 2, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 2)' })

  const totalGrams = body.yarnRequiredGrams + head.yarnRequiredGrams +
    beak.yarnRequiredGrams + leg.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 16 cm long. Body ${body.finishedDimensionsCm.height} cm long. Beak ${beak.finishedDimensionsCm.height} cm long.`
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A compact kiwi bird (Apteryx) from New Zealand, famous for its round body, tiny wings, and long slender beak. The wings are vestigial in a real kiwi, so this pattern omits them entirely. Start every piece with a '),
        gt('kiwi-magic-ring', 'magic ring'),
        t(' and work in continuous rounds.'),
      ),
      h2('What you need'),
      p(t(`Brown DK yarn, approx. ${totalGrams} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 8 mm `), gt('kiwi-safety-eyes', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Leg (make 2)', leg.rowByRow),
      h2('Assembly'),
      p(
        t('Insert '),
        gt('kiwi-safety-eyes', 'safety eyes'),
        t(' on the head and stuff. Sew the long thin beak cone to the front of the head. Stuff the body and attach the head using '),
        gt('kiwi-ladder-stitch', 'ladder stitch'),
        t('. Sew the two short leg cylinders to the underside of the body, angled slightly forward.'),
      ),
      h2('Finishing'),
      p(t('The kiwi has hair-like feathers rather than smooth plumage. Work surface loops or brush the finished piece lightly with a stiff brush to fluff the yarn. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi penguin uses a similar round oval body with no wings visible from the front.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi kiwi', subtitle: '', excerpt: 'A round brown kiwi bird from New Zealand, about 16 cm long with a long slender beak. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi kiwi bird design synthesised from oval-sphere-cone construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet kiwi toy', 'amigurumi New Zealand bird', 'crochet Apteryx'],
    glossaryTerms: [
      { slug: 'kiwi-magic-ring', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'kiwi-safety-eyes', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'kiwi-ladder-stitch', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

console.log('Done -- batch 11 birds A101-A110')
