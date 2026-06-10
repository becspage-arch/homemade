/**
 * Generator: D-Amigurumi Batch 9 -- A81-A90 Seasonal and holiday amigurumi
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch9.ts
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
function li(...c: object[]) { return { type: 'listItem', content: [{ type: 'paragraph', content: c }] } }
function ul(...items: object[]) { return { type: 'bulletList', content: items } }

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

// ─────────────────────────────────────────────────────────────────────────────
// A81 — Christmas tree
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-christmas-tree'
  const treeCone = cone({ baseDiameterCm: 10, heightCm: 14, gauge: GAUGE, label: 'Tree body' })
  const baubleA = sphere({ diameterCm: 2, gauge: GAUGE, label: 'Bauble (make 4)' })
  const trunk = cylinder({ diameterCm: 2, heightCm: 2, gauge: GAUGE, label: 'Trunk' })

  const out = {
    slug, title: 'Christmas tree amigurumi',
    subtitle: 'A cone-shaped green tree with small sphere baubles and a short cylinder trunk.',
    excerpt: 'A compact 14 cm Christmas tree in green DK yarn. The cone body is worked in continuous rounds, topped with a chain-loop star and decorated with four small bauble spheres sewn on after stuffing.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Christmas tree amigurumi is a widely made seasonal crochet project. No single public-domain source; construction synthesised from common amigurumi cone technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-colour-change'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds'],
    aliases: ['crochet christmas tree', 'amigurumi tree', 'mini christmas tree crochet'],
    glossaryTerms: [
      { slug: 'magic-ring-tree', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi rounds. Pull the tail tight to close the centre hole.' },
      { slug: 'continuous-rounds-tree', term: 'Continuous rounds', definition: 'Working in a spiral without slip stitching to join. A stitch marker tracks the start of each round.' },
      { slug: 'dc2tog-tree', term: 'dc2tog', definition: 'Double crochet two together. Insert hook, pull through, repeat in next stitch, then draw through all three loops to decrease by one stitch.' },
      { slug: 'invisible-join-tree', term: 'Invisible fasten-off', definition: 'A finishing method that mimics a normal stitch, leaving a barely visible end at the top of the piece.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Tree approx. 14 cm tall, 10 cm wide at base. Each bauble approx. 2 cm diameter.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-colour-change'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [treeCone, trunk, baubleA],
      assembly: {
        buildOrder: ['Tree body', 'Trunk', 'Bauble (make 4)'],
        joints: [
          { piecesJoined: ['Tree body', 'Trunk'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew trunk centred to the base of the cone.' },
          { piecesJoined: ['Bauble (make 4)', 'Tree body'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Sew baubles evenly around the cone surface.' },
        ],
        embellishments: ['Chain 6 and fasten off to form a star loop at the tip of the cone. Sew in place.', 'Embroider or glue small dots in contrasting colours for lights if desired.'],
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Christmas tree stands 14 cm tall and works up quickly in green DK yarn. The cone body grows from a '), gt('magic-ring-tree', 'magic ring'), t(' at the tip, expanding outward in '), gt('continuous-rounds-tree', 'continuous rounds'), t(' to a 10 cm base. Four small bauble spheres and a short trunk are made separately and sewn on.')),
        h2('What you need'),
        ul(
          li(t('Green DK yarn, approx. 40 g')),
          li(t('Small amounts of red and yellow DK yarn for baubles and star')),
          li(t('Brown DK yarn, approx. 5 g for trunk')),
          li(t('3.5 mm crochet hook')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker')),
          li(t('Tapestry needle, scissors')),
        ),
        h2('Tree body (cone)'),
        p(t('Start at the tip. Make a '), gt('magic-ring-tree', 'magic ring'), t(' and work 4 dc into the ring. Do not join. Place a stitch marker. Work in '), gt('continuous-rounds-tree', 'continuous rounds'), t(', increasing every second stitch each round. Continue until the base measures 10 cm across, then stuff firmly and close.')),
        p(t('On the last round, '), gt('dc2tog-tree', 'dc2tog'), t(' around to 6 stitches. Stuff the piece before the gap gets too small. Use an '), gt('invisible-join-tree', 'invisible fasten-off'), t(' to close. Weave in the end.')),
        h2('Trunk (cylinder)'),
        p(t('Work a small cylinder 2 cm tall and 2 cm wide using brown yarn. Stuff lightly. Sew centred to the base of the tree cone using ladder stitch.')),
        h2('Baubles (make 4)'),
        p(t('Work four small spheres each 2 cm across in red yarn. Stuff firmly. Sew evenly around the cone surface using the tail.')),
        h2('Finishing'),
        p(t('Chain 6 in yellow yarn, join into a loop, and sew to the tip of the tree as a star. Weave in all ends. The tree can be lightly misted and shaped while damp if it lists to one side.')),
        h2('What to try next'),
        p(t('The Christmas pudding amigurumi uses the same sphere technique. It pairs well with the tree for a seasonal display.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A82 — Santa Claus
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-santa'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = cylinder({ diameterCm: 8, heightCm: 9, gauge: GAUGE, closeBothEnds: true, label: 'Body' })
  const hat = cone({ baseDiameterCm: 7, heightCm: 7, gauge: GAUGE, label: 'Hat' })
  const arm = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Arm (make 2)' })
  const leg = capsule({ diameterCm: 3, lengthCm: 5, gauge: GAUGE, label: 'Leg (make 2)' })

  const out = {
    slug, title: 'Santa Claus amigurumi',
    subtitle: 'A 22 cm Santa figure with sphere head, cylinder body, cone hat, and capsule limbs.',
    excerpt: 'A cheerful 22 cm Santa in red and white DK yarn. The body is a stuffed cylinder with arms and legs sewn on, and a red cone hat with a white pompom tip completes the look.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Santa Claus amigurumi is a popular seasonal crochet figure. No single public-domain source; construction synthesised from standard amigurumi multi-piece technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-colour-change', 'amigurumi-safety-eyes'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-decrease', 'amigurumi-colour-change'],
    aliases: ['crochet santa', 'santa amigurumi', 'father christmas amigurumi'],
    glossaryTerms: [
      { slug: 'magic-ring-santa', term: 'Magic ring', definition: 'An adjustable starting loop that pulls closed at the centre, giving a neat flat beginning to a sphere or cylinder.' },
      { slug: 'continuous-rounds-santa', term: 'Continuous rounds', definition: 'Working in a spiral without closing each round. Use a stitch marker to track the round start.' },
      { slug: 'dc2tog-santa', term: 'dc2tog', definition: 'Double crochet two together. A standard decrease that removes one stitch from the round total.' },
      { slug: 'colour-change-santa', term: 'Colour change', definition: 'Switching to a new yarn colour at a specific stitch. Draw the new colour through the final loop of the last stitch before the change.' },
      { slug: 'ladder-stitch-santa', term: 'Ladder stitch', definition: 'A nearly invisible seaming method worked through alternating edge stitches of two pieces held together.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 22 cm tall including hat.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-colour-change', 'amigurumi-safety-eyes'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [head, body, hat, arm, leg],
      assembly: {
        buildOrder: ['Body', 'Head', 'Arm (make 2)', 'Leg (make 2)', 'Hat'],
        joints: [
          { piecesJoined: ['Head', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Centre head on top of body, angled very slightly forward.' },
          { piecesJoined: ['Arm (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew one arm to each upper side of the body.' },
          { piecesJoined: ['Leg (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew legs to the underside of the body, evenly spaced.' },
          { piecesJoined: ['Hat', 'Head'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Sew hat opening around the top of the head, tilted to one side.' },
        ],
        embellishments: [
          'Work a white yarn border along the hat brim, body waistband, and boot cuffs.',
          'Make a small white pompom and sew to the hat tip.',
          'Attach 9 mm black safety eyes before closing the head.',
          'Embroider a red mouth and rosy cheeks with a small amount of pink yarn.',
          'Work or glue a small black belt buckle at the waist.',
        ],
        safetyEyePlacement: 'Place 9 mm black safety eyes 2.5 cm apart on the face, centred between rounds 7 and 8 of the head sphere.',
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Santa figure stands 22 cm tall and is made from six separate pieces joined at the end. The body is a stuffed cylinder worked in red DK. A '), gt('colour-change-santa', 'colour change'), t(' at the waist adds a white belt band, and another at the boots switches to black.')),
        h2('What you need'),
        ul(
          li(t('Red DK yarn, approx. 50 g')),
          li(t('Skin-tone DK yarn, approx. 20 g')),
          li(t('White DK yarn, approx. 15 g')),
          li(t('Black DK yarn, approx. 10 g')),
          li(t('Pink DK yarn, small amount for cheeks')),
          li(t('3.5 mm crochet hook')),
          li(t('Two 9 mm black safety eyes')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Body (cylinder)'),
        p(t('Start at the base. Make a '), gt('magic-ring-santa', 'magic ring'), t(' and work 12 dc. Increase to 24 dc over the next two rounds, then work straight until the cylinder is 9 cm tall. Switch to white for one round as a belt, then continue red. Stuff firmly as you close the top.')),
        h2('Head (sphere)'),
        p(t('Make a '), gt('magic-ring-santa', 'magic ring'), t(' with 6 dc and increase to 36 dc over six rounds. Work even for four rounds, then attach 9 mm safety eyes. Decrease with '), gt('dc2tog-santa', 'dc2tog'), t(' until closed. Stuff before the gap is too small to reach inside. Use '), gt('continuous-rounds-santa', 'continuous rounds'), t(' throughout.')),
        h2('Hat (cone)'),
        p(t('Start at the tip with 6 dc and increase one stitch per round until the brim is 7 cm wide. Work a single white round at the brim edge. Sew to the top of the head.')),
        h2('Arms and legs'),
        p(t('Work each arm as a capsule: 12 dc around, straight for 4 cm in skin tone, then switch to red for 2 cm. Work legs similarly, starting with 2 cm in black (boots) then switching to red.')),
        h2('Assembly'),
        p(t('Join all pieces using '), gt('ladder-stitch-santa', 'ladder stitch'), t(' for a neat invisible seam. Attach the head centred on the body top. Sew arms to the upper sides. Sew legs to the underside. Tilt the hat to one side before stitching. Embroider a red smile and pink circles for cheeks.')),
        h2('What to try next'),
        p(t('The gingerbread man amigurumi uses similar capsule arms and legs. The Christmas tree amigurumi makes a matching display partner for Santa.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A83 — Pumpkin
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-pumpkin'
  const body = oval({ longAxisCm: 10, shortAxisCm: 8, gauge: GAUGE, label: 'Pumpkin body' })
  const stem = cone({ baseDiameterCm: 2, heightCm: 3, gauge: GAUGE, label: 'Stem' })

  const out = {
    slug, title: 'Pumpkin amigurumi',
    subtitle: 'An orange oval pumpkin body with surface ridges and a short brown cone stem.',
    excerpt: 'A plump 10 cm orange pumpkin for autumn display. Surface ridges are created by pulling yarn through vertical columns of stitches after stuffing, and a small brown cone stem is sewn on top.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Pumpkin amigurumi is a widely made seasonal crochet project. No single public-domain source; ridge-pull technique synthesised from standard amigurumi finishing methods.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-surface-ridge'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-surface-ridge'],
    aliases: ['crochet pumpkin', 'halloween pumpkin amigurumi', 'autumn pumpkin crochet'],
    glossaryTerms: [
      { slug: 'magic-ring-pumpkin', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi in the round. Pull the centre tight before the first round.' },
      { slug: 'continuous-rounds-pumpkin', term: 'Continuous rounds', definition: 'Working without slip-stitch joins, in a continuous spiral. Mark the start with a stitch marker.' },
      { slug: 'surface-ridge-pumpkin', term: 'Surface ridge', definition: 'A finishing technique where yarn is threaded down through the stuffed body from top to base and pulled snug, creating an indented vertical segment line.' },
      { slug: 'dc2tog-pumpkin', term: 'dc2tog', definition: 'Double crochet two together. Used in the decrease rounds to close the oval body.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Pumpkin approx. 10 cm tall, 8 cm wide. Stem approx. 3 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-surface-ridge'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [body, stem],
      assembly: {
        buildOrder: ['Pumpkin body', 'Stem'],
        joints: [
          { piecesJoined: ['Stem', 'Pumpkin body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew stem centred to the top of the pumpkin, over the ridge-pull hole.' },
        ],
        embellishments: [
          'Thread orange yarn onto the tapestry needle. Push down through the top centre, pull up at the base, and pull snug to form each ridge. Repeat for 6 to 8 ridges evenly around.',
          'Embroider a small curling tendril in green yarn near the stem if desired.',
        ],
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This autumn pumpkin is shaped as an oval and given its characteristic segments by a '), gt('surface-ridge-pumpkin', 'surface ridge'), t(' technique worked after stuffing. The small stem is a tight cone sewn on top.')),
        h2('What you need'),
        ul(
          li(t('Orange DK yarn, approx. 30 g')),
          li(t('Brown DK yarn, approx. 5 g for stem')),
          li(t('Green DK yarn, small amount for tendril')),
          li(t('3.5 mm crochet hook')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Body (oval)'),
        p(t('Make a '), gt('magic-ring-pumpkin', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-pumpkin', 'continuous rounds'), t(', increasing to 36 dc over six rounds. Work even for 8 rounds, then decrease with '), gt('dc2tog-pumpkin', 'dc2tog'), t(' back to 6 dc. Stuff firmly before the opening closes. Fasten off and leave a long tail.')),
        h2('Stem (cone)'),
        p(t('Start with 6 dc in a magic ring using brown yarn. Increase to 12 dc over two rounds, then work one straight round. Fasten off with a long tail and do not stuff.')),
        h2('Creating ridges'),
        p(t('Thread orange yarn onto the tapestry needle. Push from the top centre down through the stuffed body, exiting at the base. Pull snug enough to indent the surface. Tie off, then repeat to create 6 to 8 evenly spaced '), gt('surface-ridge-pumpkin', 'ridges'), t(' around the body.')),
        h2('Assembly'),
        p(t('Sew the stem to the top centre using the tail. The ridge-pull naturally draws the top inward, creating a recess that anchors the stem neatly.')),
        h2('What to try next'),
        p(t('The Halloween cat amigurumi pairs well with this pumpkin for an autumn display. The Easter egg amigurumi uses the same oval shape with a different surface treatment.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A84 — Easter bunny
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-easter-bunny'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const ear = capsule({ diameterCm: 2, lengthCm: 7, gauge: GAUGE, label: 'Ear (make 2)' })
  const arm = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Arm (make 2)' })
  const tail = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Tail' })

  const out = {
    slug, title: 'Easter bunny amigurumi',
    subtitle: 'A white Easter bunny with sphere head, oval body, long capsule ears, and a pompom tail.',
    excerpt: 'A 20 cm white Easter bunny in dk yarn. Long upright capsule ears, a pompom tail, and a pastel-ribbon bow make this a classic spring seasonal gift. Safety eyes and embroidered features complete the face.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Easter bunny amigurumi is a popular seasonal crochet project. No single public-domain source; construction synthesised from standard amigurumi technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-safety-eyes'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-decrease'],
    aliases: ['crochet easter bunny', 'bunny amigurumi', 'spring bunny crochet'],
    glossaryTerms: [
      { slug: 'magic-ring-bunny', term: 'Magic ring', definition: 'An adjustable starting loop pulled tight after the first round. Leaves no hole at the centre of sphere and oval pieces.' },
      { slug: 'continuous-rounds-bunny', term: 'Continuous rounds', definition: 'A spiral working method. A stitch marker at the start of each round prevents losing count.' },
      { slug: 'dc2tog-bunny', term: 'dc2tog', definition: 'Double crochet two together. The decrease used to close sphere and oval pieces before the final stuffing.' },
      { slug: 'ladder-stitch-bunny', term: 'Ladder stitch', definition: 'A seaming method worked through alternating edge stitches. Gives a nearly invisible join when attaching the head to the body.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 20 cm tall including ears.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-safety-eyes'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [head, body, ear, arm, tail],
      assembly: {
        buildOrder: ['Body', 'Head', 'Ear (make 2)', 'Arm (make 2)', 'Tail'],
        joints: [
          { piecesJoined: ['Head', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew head centred on top of body, slightly forward.' },
          { piecesJoined: ['Ear (make 2)', 'Head'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew ears to the top of the head, evenly spaced, upright.' },
          { piecesJoined: ['Arm (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew one arm to each side of the upper body.' },
          { piecesJoined: ['Tail', 'Body'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Sew tail to the rear base of the body.' },
        ],
        embellishments: [
          'Attach 9 mm black safety eyes before closing the head.',
          'Embroider a pink nose and mouth in satin stitch.',
          'Work a thin pink capsule ear liner in slip stitch along the centre of each ear.',
          'Tie a pastel ribbon bow around the neck.',
        ],
        safetyEyePlacement: 'Place 9 mm safety eyes 2.5 cm apart, on round 8 of the head sphere.',
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Easter bunny stands 20 cm tall and is worked in white DK yarn across five pieces. A pink inner ear liner, a ribbon bow, and safety eyes bring the face together.')),
        h2('What you need'),
        ul(
          li(t('White DK yarn, approx. 60 g')),
          li(t('Pink DK yarn, small amount for ear liners and nose')),
          li(t('3.5 mm crochet hook')),
          li(t('Two 9 mm black safety eyes')),
          li(t('Polyester toy stuffing')),
          li(t('Pastel ribbon, approx. 30 cm')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Head (sphere)'),
        p(t('Make a '), gt('magic-ring-bunny', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-bunny', 'continuous rounds'), t(', increasing to 36 dc over six rounds. Work even for four rounds. Attach safety eyes. Decrease with '), gt('dc2tog-bunny', 'dc2tog'), t(' until 6 dc remain, stuffing before the gap closes.')),
        h2('Body (oval)'),
        p(t('Work an oval starting with 6 dc in a '), gt('magic-ring-bunny', 'magic ring'), t('. Increase to 42 dc. Work even for 10 rounds. Decrease back to 6 dc. Stuff firmly.')),
        h2('Ears (make 2)'),
        p(t('Work each ear as a capsule: start with 8 dc, work straight for 7 cm. Leave lightly stuffed. Work a pink slip-stitch line along the centre of each ear for the inner liner.')),
        h2('Arms (make 2)'),
        p(t('Work each arm as a small capsule, 12 dc around for 5 cm. Stuff lightly.')),
        h2('Tail'),
        p(t('Work a small 2.5 cm sphere in white. Stuff firmly. Alternatively, wrap white yarn around three fingers 40 times and tie off as a pompom.')),
        h2('Assembly'),
        p(t('Join all pieces using '), gt('ladder-stitch-bunny', 'ladder stitch'), t('. Attach the head to the body top. Sew ears upright to the head crown. Sew arms to the upper body sides. Sew the tail to the rear base. Tie a ribbon bow at the neck.')),
        h2('What to try next'),
        p(t('The Easter egg amigurumi makes a colourful companion for the bunny. The Valentine bear uses the same sphere-head and oval-body construction.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A85 — Easter egg
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-easter-egg'
  const egg = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Egg' })

  const out = {
    slug, title: 'Easter egg amigurumi',
    subtitle: 'A pastel oval Easter egg, 8 cm tall, with embroidered stripe and dot decorations.',
    excerpt: 'A neat 8 cm Easter egg in pastel DK yarn. The oval body is worked in one piece, stuffed, and then decorated with surface embroidery stripes, dots, and a zigzag band in contrasting pastel shades.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Easter egg amigurumi is a widely made seasonal crochet project. No single public-domain source; construction synthesised from standard oval amigurumi technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-colour-change'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds'],
    aliases: ['crochet easter egg', 'easter egg amigurumi', 'spring egg crochet'],
    glossaryTerms: [
      { slug: 'magic-ring-egg', term: 'Magic ring', definition: 'An adjustable loop used to start rounded amigurumi. Pull the centre closed before the first dc round.' },
      { slug: 'continuous-rounds-egg', term: 'Continuous rounds', definition: 'Working in a spiral without join rounds. Use a stitch marker to count rounds correctly.' },
      { slug: 'colour-change-egg', term: 'Colour change', definition: 'Joining a new yarn colour by drawing it through the last loop of a stitch, then continuing with the new shade.' },
      { slug: 'dc2tog-egg', term: 'dc2tog', definition: 'Double crochet two together. The decrease that closes the oval at top and base.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 8 cm tall, 6 cm wide.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-colour-change'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [egg],
      assembly: {
        buildOrder: ['Egg'],
        joints: [],
        embellishments: [
          'Embroider horizontal stripes in a contrasting pastel shade using running stitch.',
          'Add small cross-stitch or French knot dots scattered between stripes.',
          'Work a central zigzag band using backstitch in a third pastel colour.',
        ],
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Easter egg works up quickly in a single oval piece. The shaping is all in the '), gt('continuous-rounds-egg', 'continuous rounds'), t(' increases and decreases; the decoration comes entirely from surface embroidery after stuffing.')),
        h2('What you need'),
        ul(
          li(t('Pastel DK yarn in two or three colours, approx. 15 g total')),
          li(t('3.5 mm crochet hook')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Egg (oval)'),
        p(t('Make a '), gt('magic-ring-egg', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-egg', 'continuous rounds'), t(', increasing to 30 dc over five rounds. Work even for 6 rounds. Add a '), gt('colour-change-egg', 'colour change'), t(' stripe at the widest point if desired. Then decrease with '), gt('dc2tog-egg', 'dc2tog'), t(' back to 6 dc. Stuff firmly before the opening closes.')),
        h2('Decoration'),
        p(t('Thread a contrasting pastel yarn onto the tapestry needle. Embroider horizontal running-stitch stripes around the egg body. Add French knot dots between stripes. Finish with a zigzag line in a third pastel shade around the middle.')),
        h2('What to try next'),
        p(t('Make a set of three in different pastel shades for a spring display. The Easter bunny amigurumi is the natural companion piece.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A86 — Christmas pudding
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-christmas-pudding'
  const pudding = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Pudding body' })
  const base = cylinder({ diameterCm: 8, heightCm: 2, gauge: GAUGE, label: 'Base plate' })
  const icingCap = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Icing cap' })

  const out = {
    slug, title: 'Christmas pudding amigurumi',
    subtitle: 'A dark sphere pudding body with a draping white icing cap and a cylinder base plate.',
    excerpt: 'A 9 cm Christmas pudding amigurumi in dark brown and white DK yarn. The icing cap is a partial sphere in white, sewn over the top of the brown pudding body to mimic dripping icing. A flat cylinder base stabilises the finished piece.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Christmas pudding amigurumi is a widely made seasonal crochet project. No single public-domain source; construction synthesised from standard amigurumi sphere technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-partial-piece'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-partial-piece'],
    aliases: ['crochet christmas pudding', 'plum pudding amigurumi', 'holiday pudding crochet'],
    glossaryTerms: [
      { slug: 'magic-ring-pudding', term: 'Magic ring', definition: 'An adjustable starting loop for in-the-round work. Closing the loop gives a flat centre with no hole.' },
      { slug: 'continuous-rounds-pudding', term: 'Continuous rounds', definition: 'A spiral working method that avoids join seams in the finished piece.' },
      { slug: 'partial-piece-pudding', term: 'Partial piece', definition: 'A component worked for only part of its sphere rounds, leaving it open at one edge so it can be sewn flat against another piece.' },
      { slug: 'dc2tog-pudding', term: 'dc2tog', definition: 'Double crochet two together. Used to close the pudding sphere at the base and to shape the icing cap edge.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Pudding approx. 9 cm diameter. Base plate approx. 8 cm diameter, 2 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-partial-piece'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [pudding, icingCap, base],
      assembly: {
        buildOrder: ['Pudding body', 'Base plate', 'Icing cap'],
        joints: [
          { piecesJoined: ['Base plate', 'Pudding body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew base plate to the underside of the pudding sphere.' },
          { piecesJoined: ['Icing cap', 'Pudding body'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Drape the icing cap over the top of the pudding, pulling the open edge down on the sides to mimic dripping. Sew around the edge.' },
        ],
        embellishments: [
          'Make three small red yarn berries (tiny spheres) and sew in a cluster on the icing cap.',
          'Cut two small green felt or crocheted holly leaves and sew beside the berries.',
          'Attach two small black safety eyes or embroider a smiling face if desired.',
        ],
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Christmas pudding is a round dark-brown sphere capped with a white '), gt('partial-piece-pudding', 'partial piece'), t(' that mimics dripping icing. A flat base plate keeps it upright. The three-piece construction is straightforward once each piece is worked in '), gt('continuous-rounds-pudding', 'continuous rounds'), t('.')),
        h2('What you need'),
        ul(
          li(t('Dark brown DK yarn, approx. 35 g')),
          li(t('White DK yarn, approx. 15 g for icing cap')),
          li(t('Red DK yarn, small amount for berries')),
          li(t('Green felt or yarn, small amount for holly')),
          li(t('3.5 mm crochet hook')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Pudding body (sphere)'),
        p(t('Make a '), gt('magic-ring-pudding', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-pudding', 'continuous rounds'), t(', increasing to 42 dc over seven rounds. Work even for five rounds. Decrease with '), gt('dc2tog-pudding', 'dc2tog'), t(' back to 6 dc, stuffing before the opening closes.')),
        h2('Base plate (cylinder)'),
        p(t('Work a flat cylinder 8 cm wide and 2 cm tall using dark brown yarn. This gives the pudding a stable flat base. Sew to the underside of the pudding sphere.')),
        h2('Icing cap (partial sphere)'),
        p(t('In white yarn, make a magic ring with 6 dc. Increase to 30 dc over five rounds. Work even for two more rounds. Do not close. This '), gt('partial-piece-pudding', 'partial piece'), t(' is draped over the top of the pudding with the open edge pulled down on the sides. Sew around the lower edge to secure.')),
        h2('Embellishments'),
        p(t('Make three tiny red spheres (6 dc, closed immediately) for holly berries. Cut or crochet two small green leaf shapes. Sew all three to the top of the icing cap.')),
        h2('What to try next'),
        p(t('The Christmas tree amigurumi makes a matching seasonal display set with this pudding. The pumpkin uses a similar oval body for an autumn companion.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A87 — Halloween cat
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-halloween-cat'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const tail = capsule({ diameterCm: 2, lengthCm: 9, gauge: GAUGE, label: 'Tail' })
  const ear = cone({ baseDiameterCm: 2.5, heightCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })

  const out = {
    slug, title: 'Halloween cat amigurumi',
    subtitle: 'A black Halloween cat with sphere head, oval body, pointed cone ears, and a curved capsule tail.',
    excerpt: 'A 16 cm black cat for Halloween display. Pointed cone ears and bright green safety eyes give the classic Halloween silhouette. The long capsule tail curves forward when the piece is assembled.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Halloween black cat amigurumi is a popular seasonal crochet project. No single public-domain source; construction synthesised from standard amigurumi technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-safety-eyes'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-decrease', 'amigurumi-safety-eyes'],
    aliases: ['crochet halloween cat', 'black cat amigurumi', 'halloween amigurumi cat'],
    glossaryTerms: [
      { slug: 'magic-ring-cat', term: 'Magic ring', definition: 'An adjustable loop for starting amigurumi. Pull tight to close the centre before the first round.' },
      { slug: 'continuous-rounds-cat', term: 'Continuous rounds', definition: 'Working in a continuous spiral without a closing slip stitch between rounds. Mark the start of each round.' },
      { slug: 'dc2tog-cat', term: 'dc2tog', definition: 'Double crochet two together. Used to close sphere and oval pieces as they taper toward the end.' },
      { slug: 'safety-eyes-cat', term: 'Safety eyes', definition: 'Plastic eyes with a backing washer that locks them through the fabric. Always attach before the piece is fully closed.' },
      { slug: 'ladder-stitch-cat', term: 'Ladder stitch', definition: 'A nearly invisible seaming stitch used to join the head, tail, and ears to the cat body.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 16 cm tall, 22 cm including curved tail.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-safety-eyes'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [head, body, tail, ear],
      assembly: {
        buildOrder: ['Body', 'Head', 'Ear (make 2)', 'Tail'],
        joints: [
          { piecesJoined: ['Head', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew head on top of the body, face pointing slightly forward.' },
          { piecesJoined: ['Ear (make 2)', 'Head'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Sew pointed ears to the top of the head, evenly spaced.' },
          { piecesJoined: ['Tail', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew tail base to the lower rear of the body. Curve the tail around and tuck the tip under the front paws or beside the body.' },
        ],
        embellishments: [
          'Attach 9 mm green safety eyes before closing the head.',
          'Embroider a small pink nose in satin stitch and a Y-shaped mouth below.',
          'Use white yarn to embroider four or five whisker lines from the cheek area.',
          'Work a thin orange or yellow collar in chain stitch around the neck.',
        ],
        safetyEyePlacement: 'Place 9 mm green safety eyes 2.5 cm apart on round 7 of the head sphere.',
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Halloween cat is worked across four pieces in black DK yarn. Bright green '), gt('safety-eyes-cat', 'safety eyes'), t(' and pointed ears give it the classic Halloween look. The long tail is stuffed lightly so it can be curved when the piece is assembled.')),
        h2('What you need'),
        ul(
          li(t('Black DK yarn, approx. 60 g')),
          li(t('White DK yarn, small amount for whiskers')),
          li(t('Pink DK yarn, small amount for nose')),
          li(t('Orange or yellow yarn for collar, small amount')),
          li(t('3.5 mm crochet hook')),
          li(t('Two 9 mm green safety eyes')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Head (sphere)'),
        p(t('Make a '), gt('magic-ring-cat', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-cat', 'continuous rounds'), t(', increasing to 36 dc. Work even for four rounds. Attach safety eyes. Decrease with '), gt('dc2tog-cat', 'dc2tog'), t(' to close. Stuff before the opening is too small.')),
        h2('Body (oval)'),
        p(t('Start with 6 dc in a magic ring. Increase to 42 dc. Work even for 10 rounds. Decrease to 6 dc. Stuff firmly.')),
        h2('Ears (make 2)'),
        p(t('Work two small cones: start with 6 dc in a magic ring, increase to 12 dc over two rounds, work two straight rounds. Do not stuff. Leave a long tail for sewing.')),
        h2('Tail'),
        p(t('Work a capsule: start with 8 dc. Work straight for 9 cm. Stuff lightly so the tail holds a curve. Leave a long tail for sewing.')),
        h2('Assembly'),
        p(t('Join head to body using '), gt('ladder-stitch-cat', 'ladder stitch'), t('. Sew ears to the head top. Sew the tail base to the rear of the body, then curve the tail forward. Embroider whiskers in white yarn and a nose in pink.')),
        h2('What to try next'),
        p(t('The pumpkin amigurumi makes a natural companion for this cat. The Valentine bear uses the same sphere-head and oval-body format.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A88 — Valentine bear
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-valentine-bear'
  const head = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 9, shortAxisCm: 7, gauge: GAUGE, label: 'Body' })
  const ear = sphere({ diameterCm: 2.5, gauge: GAUGE, label: 'Ear (make 2)' })
  const arm = capsule({ diameterCm: 2.5, lengthCm: 5, gauge: GAUGE, label: 'Arm (make 2)' })
  const leg = capsule({ diameterCm: 3, lengthCm: 4, gauge: GAUGE, label: 'Leg (make 2)' })
  const heart = oval({ longAxisCm: 5, shortAxisCm: 4, gauge: GAUGE, label: 'Heart' })

  const out = {
    slug, title: 'Valentine bear amigurumi',
    subtitle: 'A pink bear holding a flat red heart, with sphere head and ears, oval body, and capsule limbs.',
    excerpt: 'A 18 cm pink Valentine bear in DK yarn, holding a small flat red heart. Round sphere ears, a contrast-coloured nose, and safety eyes give a classic teddy silhouette for a Valentine gift.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'INTERMEDIATE',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Valentine bear amigurumi is a popular seasonal crochet project. No single public-domain source; construction synthesised from standard teddy amigurumi technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-safety-eyes', 'amigurumi-flat-piece'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-decrease', 'amigurumi-flat-piece'],
    aliases: ['crochet valentine bear', 'teddy bear amigurumi', 'valentine amigurumi bear'],
    glossaryTerms: [
      { slug: 'magic-ring-bear', term: 'Magic ring', definition: 'An adjustable loop that closes completely at the centre. The starting point for all sphere and oval pieces in this pattern.' },
      { slug: 'continuous-rounds-bear', term: 'Continuous rounds', definition: 'A spiral working method. Mark the start of each round to keep the piece symmetrical.' },
      { slug: 'dc2tog-bear', term: 'dc2tog', definition: 'Double crochet two together. The decrease used to close the head, body, and heart pieces.' },
      { slug: 'flat-piece-bear', term: 'Flat piece', definition: 'A component worked in rows or partial rounds to produce a flat shape rather than a stuffed 3D piece.' },
      { slug: 'ladder-stitch-bear', term: 'Ladder stitch', definition: 'An invisible seaming method worked through alternating edge stitches, used to attach the head, ears, arms, and legs.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Bear approx. 18 cm tall. Heart approx. 5 cm wide.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease', 'amigurumi-safety-eyes', 'amigurumi-flat-piece'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [head, body, ear, arm, leg, heart],
      assembly: {
        buildOrder: ['Body', 'Head', 'Ear (make 2)', 'Arm (make 2)', 'Leg (make 2)', 'Heart'],
        joints: [
          { piecesJoined: ['Head', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew head centred on the body top.' },
          { piecesJoined: ['Ear (make 2)', 'Head'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew ears to the top sides of the head.' },
          { piecesJoined: ['Arm (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew arms to the upper body sides, positioned to hold the heart in front.' },
          { piecesJoined: ['Leg (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew legs to the underside front of the body.' },
          { piecesJoined: ['Heart', 'Arm (make 2)'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Position the heart between the two paws and whip stitch the top edge of the heart to the end of each arm.' },
        ],
        embellishments: [
          'Attach 9 mm black safety eyes before closing the head.',
          'Embroider a brown or black nose in satin stitch on the face centre.',
          'Embroider a small smiling mouth below the nose in backstitch.',
          'Work a pale pink inner ear circle in slip stitch on each ear.',
          'Tie a small red or white ribbon bow around the neck.',
        ],
        safetyEyePlacement: 'Place 9 mm safety eyes 2.5 cm apart on round 8 of the head sphere.',
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This Valentine bear is a classic teddy silhouette worked in pink DK across seven pieces. The arms are positioned to hold a small '), gt('flat-piece-bear', 'flat'), t(' red heart between them. A ribbon bow at the neck completes the Valentine look.')),
        h2('What you need'),
        ul(
          li(t('Pink DK yarn, approx. 60 g')),
          li(t('Red DK yarn, approx. 10 g for heart')),
          li(t('3.5 mm crochet hook')),
          li(t('Two 9 mm black safety eyes')),
          li(t('Polyester toy stuffing')),
          li(t('Red or white ribbon, approx. 25 cm')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Head (sphere)'),
        p(t('Make a '), gt('magic-ring-bear', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-bear', 'continuous rounds'), t(', increasing to 36 dc. Work even for four rounds. Attach safety eyes at round 8. Decrease with '), gt('dc2tog-bear', 'dc2tog'), t(' to close. Stuff well.')),
        h2('Body (oval)'),
        p(t('Start with 6 dc in a '), gt('magic-ring-bear', 'magic ring'), t('. Increase to 42 dc. Work even for 10 rounds. Decrease to close. Stuff firmly.')),
        h2('Ears (make 2)'),
        p(t('Work two small spheres 2.5 cm across. Stuff lightly or leave flat by not stuffing. Sew to the top sides of the head with a pale pink inner circle embroidered in slip stitch.')),
        h2('Arms and legs'),
        p(t('Work arms as capsules: 12 dc around, straight for 5 cm. Legs: 14 dc around, straight for 4 cm. Stuff lightly.')),
        h2('Heart (flat piece)'),
        p(t('Work the heart as a '), gt('flat-piece-bear', 'flat piece'), t(' in red: begin with 6 dc in a magic ring. Work two increase rounds to 18 dc. Work two even rounds. The piece remains open and flat (do not stuff). Shape by working a small V-notch at the top in slip stitch.')),
        h2('Assembly'),
        p(t('Join all pieces using '), gt('ladder-stitch-bear', 'ladder stitch'), t('. Position arms angled forward and sew the heart between the paws. Tie a ribbon bow around the neck.')),
        h2('What to try next'),
        p(t('The Easter bunny uses the same sphere-head and oval-body format. The gingerbread man amigurumi uses capsule limbs in a different seasonal shape.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A89 — New Year star
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-new-year-star'
  const discCentre = cylinder({ diameterCm: 5, heightCm: 1.5, gauge: GAUGE, label: 'Centre disc' })
  const point = cone({ baseDiameterCm: 3, heightCm: 4, gauge: GAUGE, label: 'Point (make 5)' })

  const out = {
    slug, title: 'New Year star amigurumi',
    subtitle: 'A gold five-pointed star with five cone points sewn around a flat cylinder centre disc.',
    excerpt: 'A 12 cm gold star amigurumi for New Year display. Five stuffed cone points are sewn evenly around a flat cylinder centre, creating a classic five-pointed star shape. Works up quickly in metallic or gold DK yarn.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Star amigurumi is a widely made celebratory crochet project. No single public-domain source; five-cone construction synthesised from standard amigurumi technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds'],
    aliases: ['crochet star amigurumi', 'new year star crochet', 'gold star amigurumi'],
    glossaryTerms: [
      { slug: 'magic-ring-star', term: 'Magic ring', definition: 'An adjustable loop for starting amigurumi shapes. The adjustable loop closes the centre neatly on the cone and disc pieces.' },
      { slug: 'continuous-rounds-star', term: 'Continuous rounds', definition: 'Working without closing each round. Keeps the surface smooth on small cone pieces.' },
      { slug: 'dc2tog-star', term: 'dc2tog', definition: 'Double crochet two together. Used to close each cone point before stuffing.' },
      { slug: 'whip-stitch-star', term: 'Whip stitch', definition: 'A seaming method used to attach each cone point to the centre disc at the correct angle.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 12 cm point to point.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [discCentre, point],
      assembly: {
        buildOrder: ['Centre disc', 'Point (make 5)'],
        joints: [
          { piecesJoined: ['Point (make 5)', 'Centre disc'] as [string, string], method: 'WHIP_STITCH' as const, placement: 'Sew the base of each cone to the edge of the centre disc. Space all five points evenly at 72-degree intervals.' },
        ],
        embellishments: [
          'Thread a length of gold yarn through the top of one point to hang as an ornament.',
          'Sew a sequin or small button to the front of the centre disc if desired.',
        ],
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This star is made from six pieces: one flat cylinder centre and five cone points. All pieces are worked in '), gt('continuous-rounds-star', 'continuous rounds'), t(' starting from a '), gt('magic-ring-star', 'magic ring'), t('. Once stuffed and sewn at even intervals, the result is a firm five-pointed star that holds its shape without a frame.')),
        h2('What you need'),
        ul(
          li(t('Gold or metallic DK yarn, approx. 35 g')),
          li(t('3.5 mm crochet hook')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Centre disc (cylinder)'),
        p(t('Make a '), gt('magic-ring-star', 'magic ring'), t(' with 6 dc. Increase to 30 dc over five rounds. Work two straight rounds, keeping the piece flat. Decrease with '), gt('dc2tog-star', 'dc2tog'), t(' back to 6 dc. Stuff lightly so the disc remains fairly flat. Close and leave a long tail.')),
        h2('Points (make 5)'),
        p(t('For each point, make a magic ring with 6 dc. Increase to 18 dc over two rounds. Work two even rounds. Decrease back to 6 dc, stuffing before the gap closes. Fasten off with a long tail.')),
        h2('Assembly'),
        p(t('Mark five evenly spaced positions around the edge of the centre disc. Sew each cone base to one marked position using '), gt('whip-stitch-star', 'whip stitch'), t('. Pull the tail through to the disc centre and knot off. Adjust the angles so each point radiates evenly outward.')),
        h2('Finishing'),
        p(t('Thread a length of yarn through the tip of one point and knot into a hanging loop. The star can also stand upright if placed with two points at the base.')),
        h2('What to try next'),
        p(t('The Christmas tree amigurumi uses a similar cone-point technique. A set of stars in different sizes makes an easy garland project.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// A90 — Gingerbread man
// ─────────────────────────────────────────────────────────────────────────────
{
  const slug = 'amigurumi-gingerbread-man'
  const head = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Head' })
  const body = oval({ longAxisCm: 8, shortAxisCm: 6, gauge: GAUGE, label: 'Body' })
  const arm = capsule({ diameterCm: 2, lengthCm: 5, gauge: GAUGE, label: 'Arm (make 2)' })
  const leg = capsule({ diameterCm: 2.5, lengthCm: 6, gauge: GAUGE, label: 'Leg (make 2)' })

  const out = {
    slug, title: 'Gingerbread man amigurumi',
    subtitle: 'A gingerbread-brown sphere head, oval body, and capsule arms and legs with white icing embroidery.',
    excerpt: 'A classic 18 cm gingerbread man amigurumi in warm brown DK yarn. White yarn embroidery recreates the icing details: buttons, a smiling face, and zigzag cuffs. Simple shapes and quick assembly make this an ideal seasonal beginner project.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'amigurumi',
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'Gingerbread man amigurumi is a widely made seasonal crochet project. No single public-domain source; construction synthesised from standard amigurumi multi-piece technique.',
    techniqueSlugs: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease'],
    criticalTechniques: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds'],
    aliases: ['crochet gingerbread man', 'gingerbread amigurumi', 'christmas gingerbread crochet'],
    glossaryTerms: [
      { slug: 'magic-ring-ginger', term: 'Magic ring', definition: 'An adjustable starting loop that closes the centre. Used for every piece in this pattern.' },
      { slug: 'continuous-rounds-ginger', term: 'Continuous rounds', definition: 'A spiral working method without closing slip stitches between rounds. Use a stitch marker at the start of each round.' },
      { slug: 'dc2tog-ginger', term: 'dc2tog', definition: 'Double crochet two together. The decrease used to taper and close the head and body.' },
      { slug: 'ladder-stitch-ginger', term: 'Ladder stitch', definition: 'A nearly invisible seaming method used to attach the head, arms, and legs to the body.' },
    ],
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc x 28 rows = 10 x 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText: 'Approx. 18 cm tall.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: ['amigurumi-magic-ring', 'amigurumi-continuous-rounds', 'amigurumi-increase', 'amigurumi-decrease'],
    },
    recipeTools: TOOLS,
    amigurumi: {
      pieces: [head, body, arm, leg],
      assembly: {
        buildOrder: ['Body', 'Head', 'Arm (make 2)', 'Leg (make 2)'],
        joints: [
          { piecesJoined: ['Head', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew head centred on top of the body.' },
          { piecesJoined: ['Arm (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew arms to the upper sides of the body, angled slightly outward.' },
          { piecesJoined: ['Leg (make 2)', 'Body'] as [string, string], method: 'LADDER_STITCH' as const, placement: 'Sew legs to the lower body front, evenly spaced.' },
        ],
        embellishments: [
          'Embroider two small black cross-stitch eyes on the head.',
          'Embroider a curved white backstitch smile.',
          'Sew three small white French knot buttons down the body centre.',
          'Work white chain stitch zigzag cuffs around the end of each arm and leg.',
          'Embroider a small red bow tie or ribbon at the neck.',
        ],
      },
    },
    body: {
      type: 'doc', content: [
        p(t('This gingerbread man is worked in warm brown DK across five pieces. All the character comes from white yarn embroidery after assembly: a smiling face, button trail, and zigzag icing cuffs. The shapes are all basic amigurumi in '), gt('continuous-rounds-ginger', 'continuous rounds'), t('.')),
        h2('What you need'),
        ul(
          li(t('Brown DK yarn, approx. 40 g')),
          li(t('White DK yarn, small amount for icing details')),
          li(t('Red DK yarn, small amount for bow tie')),
          li(t('3.5 mm crochet hook')),
          li(t('Polyester toy stuffing')),
          li(t('Stitch marker, tapestry needle, scissors')),
        ),
        h2('Head (sphere)'),
        p(t('Make a '), gt('magic-ring-ginger', 'magic ring'), t(' with 6 dc. Work in '), gt('continuous-rounds-ginger', 'continuous rounds'), t(', increasing to 30 dc. Work even for four rounds. Decrease with '), gt('dc2tog-ginger', 'dc2tog'), t(' to close. Stuff before the opening is too narrow to reach.')),
        h2('Body (oval)'),
        p(t('Start with 6 dc in a '), gt('magic-ring-ginger', 'magic ring'), t('. Increase to 36 dc. Work even for 8 rounds. Decrease to close. Stuff firmly.')),
        h2('Arms (make 2)'),
        p(t('Work each arm as a capsule: 10 dc around, straight for 5 cm. Stuff lightly. The ends naturally round to mimic mittened hands.')),
        h2('Legs (make 2)'),
        p(t('Work each leg: 12 dc around, straight for 6 cm. Stuff lightly. The rounded ends form feet.')),
        h2('Assembly'),
        p(t('Join all pieces with '), gt('ladder-stitch-ginger', 'ladder stitch'), t('. Sew head to body top. Sew arms to the upper body sides, angled outward. Sew legs to the lower body front.')),
        h2('Icing details'),
        p(t('Thread white yarn onto the tapestry needle. Embroider cross-stitch eyes, a backstitch smile, three French knot buttons down the body centre, and chain-stitch zigzag cuffs at each limb end. Add a small red backstitch bow tie at the neck.')),
        h2('What to try next'),
        p(t('The Santa amigurumi uses similar capsule arms and legs in a more complex seasonal figure. The Christmas pudding amigurumi is a quick companion piece.')),
      ],
    },
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log('wrote', slug)
}

console.log('Batch 9 done.')
