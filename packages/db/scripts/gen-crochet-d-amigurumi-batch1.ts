/**
 * Generator: D-Amigurumi Batch 1 -- Farm Animals A1-A10
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch1.ts
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

// ── A1: amigurumi-cow ─────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Head' })
  const body = pear({ maxDiameterCm: 10, topDiameterCm: 7, heightCm: 12, gauge: GAUGE, label: 'Body' })
  const legFL = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Front leg (make 2)' })
  const legBL = capsule({ diameterCm: 3.5, lengthCm: 5.5, gauge: GAUGE, label: 'Back leg (make 2)' })
  const ear = oval({ longAxisCm: 4, shortAxisCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const snout = cylinder({ diameterCm: 4, heightCm: 2, gauge: GAUGE, closeBothEnds: false, label: 'Snout' })
  const horn = cone({ baseDiameterCm: 1.5, heightCm: 3, gauge: GAUGE, label: 'Horn (make 2)' })

  const totalGrams = head.yarnRequiredGrams + body.yarnRequiredGrams +
    legFL.yarnRequiredGrams * 2 + legBL.yarnRequiredGrams * 2 +
    ear.yarnRequiredGrams * 2 + snout.yarnRequiredGrams + horn.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 25 cm tall seated. Head ${head.finishedDimensionsCm.width} cm diameter. Body ${body.finishedDimensionsCm.height} cm tall.`

  const slug = 'amigurumi-cow'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-colour-change', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('This Holstein dairy cow uses a '),
        gt('amigurumi-magic-ring-cow', 'magic ring'),
        t(' start for every piece. Work in continuous rounds with a stitch marker. The black patches are added with '),
        gt('amigurumi-colour-change-cow', 'colour changes'),
        t(' as you go, or embroidered on at the end.'),
      ),
      h2('What you need'),
      p(t(`White DK yarn, approx. ${Math.round(totalGrams * 0.7)} g. Black DK yarn, approx. ${Math.round(totalGrams * 0.3)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 10 mm `, ), gt('amigurumi-safety-eyes-cow', 'safety eyes'), t(`. Polyester stuffing.`)),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', body.rowByRow),
      ...renderPiece('Front leg (make 2)', legFL.rowByRow),
      ...renderPiece('Back leg (make 2)', legBL.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Snout', snout.rowByRow),
      ...renderPiece('Horn (make 2)', horn.rowByRow),
      h2('Assembly'),
      p(
        t('Stuff the head firmly and attach '),
        gt('amigurumi-safety-eyes-cow', 'safety eyes'),
        t(' before closing. Pin the snout centred on the lower front of the head, then sew in place using your tapestry needle. Attach ears flat on each side. Insert horns at the crown and sew through. Stuff the body fully. Sew the head to the top of the body with a '),
        gt('amigurumi-assembly-cow', 'ladder stitch'),
        t(' for a clean join. Attach the back legs at the base of the body and the front legs midway up the sides.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. Embroider two oval nostrils on the snout in black yarn. Add a small black patch across the back using duplicate stitch or embroidery if you did not work colour changes in the round.')),
      h2('What to make next'),
      p(t('The amigurumi pig uses the same sphere head and a rounder oval body shape.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi cow', subtitle: '', excerpt: 'A Holstein dairy cow in black and white DK, standing about 25 cm tall. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi cow design synthesised from standard sphere-and-pear construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet cow toy', 'amigurumi dairy cow', 'crochet farm animal toy'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-cow', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round. Essential for amigurumi.' },
      { slug: 'amigurumi-colour-change-cow', term: 'Colour change', definition: 'Switching yarn colours mid-round to create patches or markings. Pull the new colour through the final pull-through of the last stitch before the change.' },
      { slug: 'amigurumi-safety-eyes-cow', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer that clicks through the fabric from the front. Insert and lock before stuffing is complete.' },
      { slug: 'amigurumi-assembly-cow', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join amigurumi pieces. Alternates small horizontal stitches on each piece and pulls tight to close the gap.' },
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

// ── A2: amigurumi-pig ─────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const bodyOval = oval({ longAxisCm: 11, shortAxisCm: 9, gauge: GAUGE, label: 'Body' })
  const snout = cylinder({ diameterCm: 4.5, heightCm: 2, gauge: GAUGE, closeBothEnds: false, label: 'Snout' })
  const ear = oval({ longAxisCm: 3.5, shortAxisCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const legP = cylinder({ diameterCm: 2.5, heightCm: 3.5, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 4)' })

  const totalGrams = head.yarnRequiredGrams + bodyOval.yarnRequiredGrams +
    snout.yarnRequiredGrams + ear.yarnRequiredGrams * 2 + legP.yarnRequiredGrams * 4

  const finishedSizeText = `Approx. 18 cm long. Head ${head.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-pig'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-wire-curly-tail']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A round pink pig with a disc snout and a curly tail. Start every piece with a '),
        gt('amigurumi-magic-ring-pig', 'magic ring'),
        t(' and work in continuous rounds. Insert '),
        gt('amigurumi-safety-eyes-pig', 'safety eyes'),
        t(' before the head is fully closed.'),
      ),
      h2('What you need'),
      p(t(`Pink DK yarn, approx. ${totalGrams} g. Small amount of black yarn for nostrils. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm safety eyes. Polyester stuffing. A short length of pink chenille or pipe cleaner for the `, ), gt('amigurumi-curly-tail-pig', 'curly tail'), t('.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', bodyOval.rowByRow),
      ...renderPiece('Snout', snout.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Leg (make 4)', legP.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-pig', 'safety eyes'),
        t(' into the head above the snout placement line. Stuff the head. Sew the snout disc centred on the lower face. Stuff the body. Attach the head to the body using a '),
        gt('amigurumi-assembly-pig', 'ladder stitch'),
        t('. Position legs flat under the body, two front and two back, and sew through.'),
      ),
      h2('Finishing'),
      p(t('Embroider two round nostrils on the snout in black yarn. Fold a short length of yarn or pipe cleaner into a spiral and attach at the rump for the '), gt('amigurumi-curly-tail-pig', 'curly tail'), t('. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi sheep swaps the oval body for a textured bobble sphere.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi pig', subtitle: '', excerpt: 'A round pink pig with a disc snout and a curly tail in DK yarn, about 18 cm long. Worked in continuous rounds from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi pig design synthesised from standard sphere-and-oval construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet pig toy', 'amigurumi piggy', 'crochet farm pig'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-pig', term: 'Magic ring', definition: 'An adjustable starting loop that closes to leave no hole at the centre of a crocheted round.' },
      { slug: 'amigurumi-safety-eyes-pig', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert from the right side and push the washer on from the inside before sealing.' },
      { slug: 'amigurumi-curly-tail-pig', term: 'Curly tail', definition: 'A short length of yarn or pipe cleaner twisted into a spiral and sewn at the base of the spine.' },
      { slug: 'amigurumi-assembly-pig', term: 'Ladder stitch', definition: 'An invisible seaming stitch used to join stuffed crochet pieces without leaving a visible ridge.' },
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

// ── A3: amigurumi-sheep ───────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const bodyS = sphere({ diameterCm: 11, gauge: GAUGE, label: 'Body (bobble texture)' })
  const ear = oval({ longAxisCm: 3.5, shortAxisCm: 2, gauge: GAUGE, label: 'Ear (make 2)' })
  const leg = cylinder({ diameterCm: 2, heightCm: 4, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 4)' })

  const totalGrams = head.yarnRequiredGrams + bodyS.yarnRequiredGrams +
    ear.yarnRequiredGrams * 2 + leg.yarnRequiredGrams * 4

  const finishedSizeText = `Approx. 20 cm tall. Body ${bodyS.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-sheep'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-bobble-stitch', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-bobble-stitch', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A fluffy white sheep with a textured '),
        gt('amigurumi-bobble-stitch-sheep', 'bobble stitch'),
        t(' body and a darker face. Start every piece with a '),
        gt('amigurumi-magic-ring-sheep', 'magic ring'),
        t('. The head is worked in grey or brown yarn; the body in cream or white.'),
      ),
      h2('What you need'),
      p(t(`Cream DK yarn, approx. ${Math.round(totalGrams * 0.75)} g. Grey or brown DK yarn, approx. ${Math.round(totalGrams * 0.25)} g. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `, ), gt('amigurumi-safety-eyes-sheep', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook. Bobble body will be slightly denser.')),
      h2('Bobble note'),
      p(gt('amigurumi-bobble-stitch-sheep', 'Bobble stitch'), t(': (yoh, insert hook, draw up loop, yoh, draw through 2 loops) x 5 in same stitch, yoh, draw through all 6 loops. Work a bobble every other stitch on every other round of the body.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body (bobble texture)', bodyS.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Leg (make 4)', leg.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-sheep', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body. Attach the head to the body with a '),
        gt('amigurumi-assembly-sheep', 'ladder stitch'),
        t('. Sew ears flat to the sides of the head. Position all four legs under the body and sew through firmly.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. Embroider a small Y-shaped nose in black yarn at the lower centre of the face.')),
      h2('What to make next'),
      p(t('The amigurumi goat uses the same legs and body cylinder with added cone horns.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi sheep', subtitle: '', excerpt: 'A fluffy white sheep with a bobble-stitch body and a grey face in DK yarn, about 20 cm tall.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi sheep design synthesised from standard sphere construction with bobble texture body. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet sheep toy', 'amigurumi lamb', 'fluffy crochet sheep'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-sheep', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds that closes with no hole at the centre.' },
      { slug: 'amigurumi-bobble-stitch-sheep', term: 'Bobble stitch', definition: 'A cluster of part-completed double crochets worked into the same stitch and joined at the top. Creates a raised rounded bump on the fabric surface.' },
      { slug: 'amigurumi-safety-eyes-sheep', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Must be inserted and locked before the piece is completely stuffed and closed.' },
      { slug: 'amigurumi-assembly-sheep', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
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

// ── A4: amigurumi-horse ───────────────────────────────────────────────────────
{
  const head = oval({ longAxisCm: 10, shortAxisCm: 7, gauge: GAUGE, label: 'Head' })
  const bodyH = capsule({ diameterCm: 9, lengthCm: 14, gauge: GAUGE, label: 'Body' })
  const leg = cylinder({ diameterCm: 2.5, heightCm: 7, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 4)' })
  const ear = cone({ baseDiameterCm: 2, heightCm: 3, gauge: GAUGE, label: 'Ear (make 2)' })

  const totalGrams = head.yarnRequiredGrams + bodyH.yarnRequiredGrams +
    leg.yarnRequiredGrams * 4 + ear.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 28 cm long. Body ${bodyH.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-horse'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-mane-fringe']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A sturdy brown horse with a yarn '),
        gt('amigurumi-mane-horse', 'mane and tail'),
        t('. Start every piece with a '),
        gt('amigurumi-magic-ring-horse', 'magic ring'),
        t('. The head is worked as an oval so the muzzle has a natural elongated shape.'),
      ),
      h2('What you need'),
      p(t(`Brown DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. Dark brown or black DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for mane and tail. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 12 mm `, ), gt('amigurumi-safety-eyes-horse', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', bodyH.rowByRow),
      ...renderPiece('Leg (make 4)', leg.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-horse', 'safety eyes'),
        t(' into the sides of the head. Stuff the head firmly. Stuff the body. Attach the head at one end of the body with a '),
        gt('amigurumi-assembly-horse', 'ladder stitch'),
        t('. Sew the cone ears upright at the crown. Attach legs in pairs at the underside of the body, positioned so the horse stands evenly.'),
      ),
      h2('Finishing'),
      p(
        t('Cut lengths of dark yarn for the '),
        gt('amigurumi-mane-horse', 'mane and tail'),
        t('. Loop each strand through the fabric along the neck and at the rump using a crochet hook, then trim to length. Embroider two oval nostrils in black yarn on the muzzle tip.'),
      ),
      h2('What to make next'),
      p(t('The amigurumi donkey uses a similar oval head with longer capsule ears.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi horse', subtitle: '', excerpt: 'A brown horse with a yarn mane and tail in DK, about 28 cm long. Oval head gives a natural muzzle shape.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi horse design synthesised from oval-head and capsule-body construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet horse toy', 'amigurumi pony', 'crochet farm horse'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-horse', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-horse', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Lock them in before the piece is fully stuffed.' },
      { slug: 'amigurumi-mane-horse', term: 'Mane and tail', definition: 'Cut yarn lengths looped through the fabric along the neck ridge and at the rump, then trimmed to the desired length.' },
      { slug: 'amigurumi-assembly-horse', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces cleanly.' },
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

// ── A5: amigurumi-chicken ─────────────────────────────────────────────────────
{
  const bodyC = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Body' })
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const beak = cone({ baseDiameterCm: 2, heightCm: 2.5, gauge: GAUGE, label: 'Beak' })
  const comb = cone({ baseDiameterCm: 2.5, heightCm: 3, gauge: GAUGE, label: 'Comb' })
  const wing = oval({ longAxisCm: 5, shortAxisCm: 3, gauge: GAUGE, label: 'Wing (make 2)' })

  const totalGrams = bodyC.yarnRequiredGrams + head.yarnRequiredGrams +
    beak.yarnRequiredGrams + comb.yarnRequiredGrams + wing.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 18 cm tall. Body ${bodyC.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-chicken'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-wattle']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A white or brown hen with a red comb and a yellow beak. Start every piece with a '),
        gt('amigurumi-magic-ring-chicken', 'magic ring'),
        t('. The body is the largest sphere; the head sits on top.'),
      ),
      h2('What you need'),
      p(t(`White or brown DK yarn, approx. ${Math.round(totalGrams * 0.75)} g. Red DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for comb and `, ), gt('amigurumi-wattle-chicken', 'wattle'), t(`. Yellow DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for the beak. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `), gt('amigurumi-safety-eyes-chicken', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Body', bodyC.rowByRow),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Comb', comb.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-chicken', 'safety eyes'),
        t(' into the head. Stuff the head. Attach the beak between the eyes. Stuff the body. Attach the head to the top of the body with a '),
        gt('amigurumi-assembly-chicken', 'ladder stitch'),
        t('. Sew the comb upright at the crown. Sew the wings flat on each side of the body.'),
      ),
      h2('Finishing'),
      p(
        t('Work a small loop of red yarn below the beak for the '),
        gt('amigurumi-wattle-chicken', 'wattle'),
        t('. Weave in all ends.'),
      ),
      h2('What to make next'),
      p(t('The amigurumi duck uses a similar sphere body with an oval shape and a flat bill.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi chicken', subtitle: '', excerpt: 'A hen with a red comb and a yellow beak in DK yarn, about 18 cm tall. Body and head are both worked as spheres.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi chicken design synthesised from sphere construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet chicken toy', 'amigurumi hen', 'crochet farm chicken'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-chicken', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds.' },
      { slug: 'amigurumi-wattle-chicken', term: 'Wattle', definition: 'The small fleshy red flap that hangs below a chicken\'s beak. Recreated in amigurumi as a small crocheted loop or chain sewn below the beak.' },
      { slug: 'amigurumi-safety-eyes-chicken', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Lock them before the piece is fully stuffed and closed.' },
      { slug: 'amigurumi-assembly-chicken', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed crochet pieces.' },
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

// ── A6: amigurumi-duck ────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const bodyD = oval({ longAxisCm: 10, shortAxisCm: 8, gauge: GAUGE, label: 'Body' })
  const beak = cone({ baseDiameterCm: 3, heightCm: 2, gauge: GAUGE, label: 'Beak' })
  const wing = oval({ longAxisCm: 4.5, shortAxisCm: 3, gauge: GAUGE, label: 'Wing (make 2)' })

  const totalGrams = head.yarnRequiredGrams + bodyD.yarnRequiredGrams +
    beak.yarnRequiredGrams + wing.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 16 cm long. Body ${bodyD.finishedDimensionsCm.width} cm wide.`
  const slug = 'amigurumi-duck'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A yellow duckling with an orange bill. Start every piece with a '),
        gt('amigurumi-magic-ring-duck', 'magic ring'),
        t('. The body sits as an oval with the head on top. The flattened cone beak gives the duck its characteristic look.'),
      ),
      h2('What you need'),
      p(t(`Yellow DK yarn, approx. ${Math.round(totalGrams * 0.85)} g. Orange DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for the beak. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `, ), gt('amigurumi-safety-eyes-duck', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', bodyD.rowByRow),
      ...renderPiece('Beak', beak.rowByRow),
      ...renderPiece('Wing (make 2)', wing.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-duck', 'safety eyes'),
        t(' into the head. Stuff the head. Pin the beak at the centre front of the head and sew through. Stuff the body. Attach the head to the body with a '),
        gt('amigurumi-assembly-duck', 'ladder stitch'),
        t('. Sew the wings flat on each side of the body.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. If you like, add a small tuft of white yarn at the tail end for a fluffy look.')),
      h2('What to make next'),
      p(t('The amigurumi chick is a smaller, simpler version using just a sphere body and cone beak.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi duck', subtitle: '', excerpt: 'A yellow duckling with an orange cone beak in DK yarn, about 16 cm long. Oval body and sphere head worked from a magic ring.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi duck design synthesised from sphere and oval construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet duck toy', 'amigurumi duckling', 'yellow crochet duck'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-duck', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no gap at the centre.' },
      { slug: 'amigurumi-safety-eyes-duck', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Lock before the piece is fully closed.' },
      { slug: 'amigurumi-assembly-duck', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
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

// ── A7: amigurumi-rabbit-farm ─────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const bodyR = cylinder({ diameterCm: 7, heightCm: 9, gauge: GAUGE, closeBothEnds: false, label: 'Body' })
  const ear = capsule({ diameterCm: 2, lengthCm: 8, gauge: GAUGE, label: 'Ear (make 2)' })
  const arm = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Arm (make 2)' })
  const legR = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 2)' })
  const tail = sphere({ diameterCm: 3, gauge: GAUGE, label: 'Tail' })

  const totalGrams = head.yarnRequiredGrams + bodyR.yarnRequiredGrams +
    ear.yarnRequiredGrams * 2 + arm.yarnRequiredGrams * 2 +
    legR.yarnRequiredGrams * 2 + tail.yarnRequiredGrams

  const finishedSizeText = `Approx. 22 cm tall seated. Head ${head.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-rabbit-farm'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A seated white farm rabbit with long capsule ears and a fluffy sphere tail. Start every piece with a '),
        gt('amigurumi-magic-ring-rabbit', 'magic ring'),
        t(' and work in continuous rounds. Use a stitch marker to track the round start.'),
      ),
      h2('What you need'),
      p(t(`White DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. Pink DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for inner ears and nose. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 9 mm `, ), gt('amigurumi-safety-eyes-rabbit', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', bodyR.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Arm (make 2)', arm.rowByRow),
      ...renderPiece('Leg (make 2)', legR.rowByRow),
      ...renderPiece('Tail', tail.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-rabbit', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body lightly so the rabbit sits. Attach the head to the top of the body with a '),
        gt('amigurumi-assembly-rabbit', 'ladder stitch'),
        t('. Fold each ear lengthwise and sew at the crown with a slight inward curve. Attach arms at the shoulder level and legs at the base. Sew the tail sphere at the back lower body.'),
      ),
      h2('Finishing'),
      p(t('Embroider a small Y-shaped nose in pink yarn below the eye line. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi sheep uses a similar seated posture with a bobble-textured body.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi farm rabbit', subtitle: '', excerpt: 'A seated white farm rabbit with long ears and a fluffy tail in DK yarn, about 22 cm tall.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi rabbit design synthesised from sphere and capsule construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet rabbit toy', 'amigurumi bunny', 'white crochet rabbit'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-rabbit', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no hole at the centre.' },
      { slug: 'amigurumi-safety-eyes-rabbit', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert and lock before the piece is fully closed.' },
      { slug: 'amigurumi-assembly-rabbit', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
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

// ── A8: amigurumi-goat ────────────────────────────────────────────────────────
{
  const head = sphere({ diameterCm: 8, gauge: GAUGE, label: 'Head' })
  const bodyG = cylinder({ diameterCm: 8, heightCm: 10, gauge: GAUGE, closeBothEnds: false, label: 'Body' })
  const horn = cone({ baseDiameterCm: 1.5, heightCm: 4, gauge: GAUGE, label: 'Horn (make 2)' })
  const ear = oval({ longAxisCm: 4, shortAxisCm: 2, gauge: GAUGE, label: 'Ear (make 2)' })
  const legG = cylinder({ diameterCm: 2.5, heightCm: 5, gauge: GAUGE, closeBothEnds: false, label: 'Leg (make 4)' })
  const beard = cone({ baseDiameterCm: 2, heightCm: 3.5, gauge: GAUGE, label: 'Beard' })

  const totalGrams = head.yarnRequiredGrams + bodyG.yarnRequiredGrams +
    horn.yarnRequiredGrams * 2 + ear.yarnRequiredGrams * 2 +
    legG.yarnRequiredGrams * 4 + beard.yarnRequiredGrams

  const finishedSizeText = `Approx. 22 cm tall. Head ${head.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-goat'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-beard']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A white goat with cone horns and a pointed '),
        gt('amigurumi-beard-goat', 'beard'),
        t('. Start every piece with a '),
        gt('amigurumi-magic-ring-goat', 'magic ring'),
        t('. The body is a short cylinder; the legs are longer cylinders.'),
      ),
      h2('What you need'),
      p(t(`White DK yarn, approx. ${Math.round(totalGrams * 0.85)} g. Grey DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for horns and hooves. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 10 mm `, ), gt('amigurumi-safety-eyes-goat', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', bodyG.rowByRow),
      ...renderPiece('Horn (make 2)', horn.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      ...renderPiece('Leg (make 4)', legG.rowByRow),
      ...renderPiece('Beard', beard.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-goat', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body. Attach the head to the body with a '),
        gt('amigurumi-assembly-goat', 'ladder stitch'),
        t('. Insert the horns at the crown and sew through. Attach ears flat on each side. Position the four legs underneath the body and sew in place. Attach the '),
        gt('amigurumi-beard-goat', 'beard'),
        t(' below the chin.'),
      ),
      h2('Finishing'),
      p(t('Embroider a small nose in pink yarn. Work 2 to 3 rounds of grey yarn at the base of each leg for the hooves. Weave in all ends.')),
      h2('What to make next'),
      p(t('The amigurumi cow uses a similar standing posture with a pear-shaped body.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi goat', subtitle: '', excerpt: 'A white goat with cone horns and a pointed beard in DK yarn, about 22 cm tall.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi goat design synthesised from sphere and cylinder construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet goat toy', 'amigurumi billy goat', 'crochet farm goat'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-goat', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds.' },
      { slug: 'amigurumi-safety-eyes-goat', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Insert and lock before fully sealing the piece.' },
      { slug: 'amigurumi-beard-goat', term: 'Beard', definition: 'A small pointed cone piece sewn below the chin. Worked in white or grey yarn and lightly stuffed.' },
      { slug: 'amigurumi-assembly-goat', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
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

// ── A9: amigurumi-donkey ──────────────────────────────────────────────────────
{
  const head = oval({ longAxisCm: 11, shortAxisCm: 7.5, gauge: GAUGE, label: 'Head' })
  const bodyDon = cylinder({ diameterCm: 9, heightCm: 12, gauge: GAUGE, closeBothEnds: false, label: 'Body' })
  const legDon = capsule({ diameterCm: 3, lengthCm: 7, gauge: GAUGE, label: 'Leg (make 4)' })
  const ear = capsule({ diameterCm: 2, lengthCm: 6, gauge: GAUGE, label: 'Ear (make 2)' })

  const totalGrams = head.yarnRequiredGrams + bodyDon.yarnRequiredGrams +
    legDon.yarnRequiredGrams * 4 + ear.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 30 cm long. Body ${bodyDon.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-donkey'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly', 'amigurumi-mane-fringe']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A grey donkey with a short yarn '),
        gt('amigurumi-mane-donkey', 'mane'),
        t(' and long capsule ears. Start every piece with a '),
        gt('amigurumi-magic-ring-donkey', 'magic ring'),
        t('. The oval head gives the donkey its characteristic long muzzle.'),
      ),
      h2('What you need'),
      p(t(`Grey DK yarn, approx. ${Math.round(totalGrams * 0.9)} g. Dark grey or black DK yarn, approx. ${Math.round(totalGrams * 0.1)} g for mane, tail and hooves. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 12 mm `, ), gt('amigurumi-safety-eyes-donkey', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Head', head.rowByRow),
      ...renderPiece('Body', bodyDon.rowByRow),
      ...renderPiece('Leg (make 4)', legDon.rowByRow),
      ...renderPiece('Ear (make 2)', ear.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-donkey', 'safety eyes'),
        t(' into the head. Stuff the head. Stuff the body. Attach the head at one end of the body with a '),
        gt('amigurumi-assembly-donkey', 'ladder stitch'),
        t('. Sew the capsule ears upright at the crown with a slight forward angle. Attach legs in pairs under the body.'),
      ),
      h2('Finishing'),
      p(
        t('Cut short lengths of dark yarn and loop through the fabric along the neck ridge for the '),
        gt('amigurumi-mane-donkey', 'mane'),
        t('. Trim to about 2 cm. Attach a short tassel at the rump for the tail. Work 2 rounds of dark yarn at the base of each leg for the hooves. Embroider two oval nostrils on the muzzle in black yarn.'),
      ),
      h2('What to make next'),
      p(t('The amigurumi horse uses a very similar construction with a slightly different head shape.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi donkey', subtitle: '', excerpt: 'A grey donkey with a short mane and long ears in DK yarn, about 30 cm long. Oval head gives a natural muzzle shape.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi donkey design synthesised from oval-head and cylinder-body construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet donkey toy', 'amigurumi donkey', 'grey crochet donkey'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-donkey', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds with no gap at the centre.' },
      { slug: 'amigurumi-safety-eyes-donkey', term: 'Safety eyes', definition: 'Plastic eyes with a locking washer. Lock them before the piece is fully stuffed and closed.' },
      { slug: 'amigurumi-mane-donkey', term: 'Mane', definition: 'Short yarn lengths looped through the fabric along the neck ridge and trimmed to a uniform short length.' },
      { slug: 'amigurumi-assembly-donkey', term: 'Ladder stitch', definition: 'An invisible seaming stitch for joining stuffed amigurumi pieces.' },
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

// ── A10: amigurumi-chick ──────────────────────────────────────────────────────
{
  const bodyChick = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Body' })
  const beakChick = cone({ baseDiameterCm: 1.5, heightCm: 1.5, gauge: GAUGE, label: 'Beak' })
  const wingChick = oval({ longAxisCm: 2.5, shortAxisCm: 1.5, gauge: GAUGE, label: 'Wing (make 2)' })

  const totalGrams = bodyChick.yarnRequiredGrams + beakChick.yarnRequiredGrams + wingChick.yarnRequiredGrams * 2

  const finishedSizeText = `Approx. 8 cm tall. Body ${bodyChick.finishedDimensionsCm.width} cm diameter.`
  const slug = 'amigurumi-chick'
  const techniqueSlugs = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases', 'amigurumi-safety-eyes', 'amigurumi-assembly']
  const criticalTechniques = ['amigurumi-magic-ring', 'amigurumi-increases', 'amigurumi-decreases']

  const body_doc = {
    type: 'doc',
    content: [
      p(
        t('A tiny yellow chick that works up in about an hour. All pieces start with a '),
        gt('amigurumi-magic-ring-chick', 'magic ring'),
        t('. The body is a single small sphere. This is a great first amigurumi project.'),
      ),
      h2('What you need'),
      p(t(`Yellow DK yarn, approx. ${Math.round(totalGrams * 0.85)} g. Orange DK yarn, approx. ${Math.round(totalGrams * 0.15)} g for the beak. 3.5 mm crochet hook. Tapestry needle. Craft scissors. Soft measuring tape. Pair of 6 mm `, ), gt('amigurumi-safety-eyes-chick', 'safety eyes'), t('. Polyester stuffing.')),
      h2('Gauge'),
      p(t('24 dc x 28 rows = 10 x 10 cm in DK yarn on a 3.5 mm hook.')),
      h2('Pieces'),
      ...renderPiece('Body', bodyChick.rowByRow),
      ...renderPiece('Beak', beakChick.rowByRow),
      ...renderPiece('Wing (make 2)', wingChick.rowByRow),
      h2('Assembly'),
      p(
        t('Lock '),
        gt('amigurumi-safety-eyes-chick', 'safety eyes'),
        t(' into the upper body before closing. Stuff the body lightly. Sew the beak at the centre front below the eyes with a '),
        gt('amigurumi-assembly-chick', 'ladder stitch'),
        t('. Sew the two small wings flat on each side.'),
      ),
      h2('Finishing'),
      p(t('Weave in all ends. The chick needs no additional stuffing in the wings; leave them flat.')),
      h2('What to make next'),
      p(t('The amigurumi chicken is the grown-up version with a separate head, comb and longer wings.')),
    ],
  }

  out(slug, {
    slug, title: 'Amigurumi chick', subtitle: '', excerpt: 'A tiny yellow chick in DK yarn, about 8 cm tall. A great first amigurumi project that works up quickly.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Amigurumi chick design synthesised from a single sphere body. No single public-domain source.',
    techniqueSlugs, criticalTechniques,
    aliases: ['crochet chick toy', 'tiny amigurumi chick', 'beginner amigurumi'],
    glossaryTerms: [
      { slug: 'amigurumi-magic-ring-chick', term: 'Magic ring', definition: 'An adjustable starting loop for crocheted rounds. The standard starting point for all amigurumi.' },
      { slug: 'amigurumi-safety-eyes-chick', term: 'Safety eyes', definition: 'Small plastic eyes with a locking washer. Lock them into the body before completing the last rounds.' },
      { slug: 'amigurumi-assembly-chick', term: 'Ladder stitch', definition: 'An invisible seaming stitch for attaching small pieces to a stuffed body.' },
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

console.log('\nAll 10 farm animal amigurumi patterns generated.')
