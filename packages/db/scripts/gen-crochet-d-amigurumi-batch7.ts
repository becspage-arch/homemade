/**
 * Generator: D-Amigurumi Batch 7 -- Food and Sweets A61-A70
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-amigurumi-batch7.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sphere, cylinder, cone, oval, pear } from '../../../apps/web/src/lib/crochet/amigurumi/shape-math'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-amigurumi')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

// ── A61: Cupcake ──────────────────────────────────────────────────────────────
const a61Base = cylinder({ diameterCm: 6, heightCm: 4, gauge: GAUGE, closeBothEnds: true, label: 'Cupcake base' })
const a61Swirl = sphere({ diameterCm: 5, gauge: GAUGE, label: 'Frosting swirl' })

// ── A62: Strawberry ───────────────────────────────────────────────────────────
const a62Body = sphere({ diameterCm: 6, gauge: GAUGE, label: 'Strawberry body' })
const a62Leaves = cone({ baseDiameterCm: 4, heightCm: 3, gauge: GAUGE, label: 'Leaf cap' })

// ── A63: Avocado ──────────────────────────────────────────────────────────────
const a63Body = pear({ maxDiameterCm: 8, topDiameterCm: 5, heightCm: 10, gauge: GAUGE, label: 'Avocado body' })
const a63Seed = oval({ longAxisCm: 4, shortAxisCm: 3, gauge: GAUGE, label: 'Avocado seed' })

// ── A64: Donut ────────────────────────────────────────────────────────────────
// Closest shape: two cylinders — inner tube and outer ring approximation
const a64Outer = cylinder({ diameterCm: 9, heightCm: 4, gauge: GAUGE, closeBothEnds: true, label: 'Donut outer ring' })
const a64Inner = cylinder({ diameterCm: 3, heightCm: 4, gauge: GAUGE, closeBothEnds: true, label: 'Donut inner hole shaper' })

// ── A65: Ice Cream Cone ───────────────────────────────────────────────────────
const a65Scoop = sphere({ diameterCm: 7, gauge: GAUGE, label: 'Ice cream scoop' })
const a65Cone = cone({ baseDiameterCm: 5, heightCm: 8, gauge: GAUGE, label: 'Waffle cone' })

// ── A66: Watermelon Slice ─────────────────────────────────────────────────────
// Closest shape: use a sphere and describe the slice assembly in instructions
const a66Body = sphere({ diameterCm: 10, gauge: GAUGE, label: 'Watermelon body (half sphere slice)' })
const a66Rind = oval({ longAxisCm: 10, shortAxisCm: 2, gauge: GAUGE, label: 'Rind strip' })

// ── A67: Pineapple ────────────────────────────────────────────────────────────
const a67Body = oval({ longAxisCm: 12, shortAxisCm: 7, gauge: GAUGE, label: 'Pineapple body' })
const a67Crown = cylinder({ diameterCm: 3, heightCm: 5, gauge: GAUGE, closeBothEnds: false, label: 'Pineapple crown base' })

// ── A68: Burger ───────────────────────────────────────────────────────────────
const a68BunTop = sphere({ diameterCm: 9, gauge: GAUGE, label: 'Top bun' })
const a68Patty = oval({ longAxisCm: 9, shortAxisCm: 8, gauge: GAUGE, label: 'Burger patty' })
const a68BunBottom = cylinder({ diameterCm: 8, heightCm: 2, gauge: GAUGE, closeBothEnds: true, label: 'Bottom bun' })

// ── A69: Pizza Slice ──────────────────────────────────────────────────────────
// Closest shape: cone approximation for a flat triangle slice
const a69Base = cone({ baseDiameterCm: 10, heightCm: 12, gauge: GAUGE, label: 'Pizza slice base' })
const a69Topping = oval({ longAxisCm: 6, shortAxisCm: 5, gauge: GAUGE, label: 'Topping (cheese layer)' })

// ── A70: Sushi Roll ──────────────────────────────────────────────────────────
const a70Body = cylinder({ diameterCm: 5, heightCm: 4, gauge: GAUGE, closeBothEnds: true, label: 'Sushi roll body' })
const a70Filling = oval({ longAxisCm: 3, shortAxisCm: 3, gauge: GAUGE, label: 'Filling inset' })

// ─────────────────────────────────────────────────────────────────────────────

const PATTERNS = [

// ── A61: Cupcake ──────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-cupcake',
  title: 'Amigurumi cupcake',
  excerpt: 'A sweet crochet cupcake in dk yarn with a pink cylinder base and a plump frosting swirl on top. A great first amigurumi for beginners.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round'],
  aliases: ['crochet cupcake amigurumi', 'mini cupcake crochet toy', 'beginner crochet cupcake'],
  glossaryTerms: [
    { slug: 'magic-ring-a61', term: 'Magic ring', definition: 'An adjustable loop that closes the centre of a piece worked in the round. Pull the starting tail to close the hole completely before continuing.' },
    { slug: 'working-in-the-round-a61', term: 'Working in the round', definition: 'Crocheting in continuous rounds without turning, so the right side always faces you.' },
    { slug: 'invisible-finish-a61', term: 'Invisible finish', definition: 'A method of closing the final round using the tail threaded through the front loops of the last stitches, hiding the join.' },
  ],
  finishedSizeText: 'Approx. 6 cm wide and 9 cm tall (base and swirl combined).',
  sourceNotes: 'Synthesised from standard amigurumi cupcake construction. No direct public-domain source.',
  pieces: [a61Base, a61Swirl],
  body: {
    type: 'doc', content: [
      p(t('This cupcake uses two pieces: a cylinder base for the cake case and a sphere swirl on top for the frosting. Start each piece with a '), gt('magic-ring-a61', 'magic ring'), t(' and crochet '), gt('working-in-the-round-a61', 'in the round'), t('.')),
      h2('Cupcake base (cylinder)'),
      ...a61Base.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a61Base.stuffingNotes)),
      h2('Frosting swirl (sphere)'),
      ...a61Swirl.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a61Swirl.stuffingNotes)),
      h2('Assembly'),
      p(t('Stuff the base firmly. Flatten the top of the sphere slightly and pin it centred on top of the base. Use the tail to sew the swirl to the top of the base with a whip stitch, hiding the stitches inside the edge. Use the '), gt('invisible-finish-a61', 'invisible finish'), t(' on both pieces before joining.')),
      h2('Finishing'),
      p(t('Thread your needle with black yarn to add two small seed-stitch eyes to the frosting swirl if desired. Weave in all ends.')),
      h2('What to try next'),
      p(t('Make a batch of cupcakes in different frosting colours and add a strip of surface slip-stitch for the cupcake case ridges.')),
    ],
  },
},

// ── A62: Strawberry ───────────────────────────────────────────────────────────
{
  slug: 'amigurumi-strawberry',
  title: 'Amigurumi strawberry',
  excerpt: 'A plump red strawberry in dk yarn with a green cone leaf cap on top. Two simple pieces make this a fast beginner project.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round'],
  aliases: ['crochet strawberry amigurumi', 'mini strawberry crochet toy', 'beginner fruit amigurumi'],
  glossaryTerms: [
    { slug: 'magic-ring-a62', term: 'Magic ring', definition: 'An adjustable starting loop for rounds. Pull the tail to close the centre hole before the first round is complete.' },
    { slug: 'working-in-the-round-a62', term: 'Working in the round', definition: 'Crocheting in continuous spirals so the outer face stays facing you throughout.' },
    { slug: 'invisible-finish-a62', term: 'Invisible finish', definition: 'Closing the final round by threading the tail through the front loops of the last stitches to mimic a regular stitch.' },
  ],
  finishedSizeText: 'Approx. 6 cm wide and 9 cm tall (body and leaf cap combined).',
  sourceNotes: 'Synthesised from standard amigurumi fruit construction. No direct public-domain source.',
  pieces: [a62Body, a62Leaves],
  body: {
    type: 'doc', content: [
      p(t('This strawberry has two pieces: a sphere body in red and a cone leaf cap in green. Begin with a '), gt('magic-ring-a62', 'magic ring'), t(' and work '), gt('working-in-the-round-a62', 'in the round'), t(' throughout.')),
      h2('Strawberry body (sphere)'),
      ...a62Body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a62Body.stuffingNotes)),
      h2('Leaf cap (cone)'),
      ...a62Leaves.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Assembly'),
      p(t('Stuff the body firmly. Use the '), gt('invisible-finish-a62', 'invisible finish'), t(' to close the sphere. Pin the flat base of the leaf cap centred on top of the body and sew in place with a whip stitch. Weave in all ends.')),
      h2('Details'),
      p(t('Use yellow or white yarn to embroider seed dots across the surface of the berry in a scattered pattern. Add two small black French knots for eyes if desired.')),
      h2('What to try next'),
      p(t('Make the avocado and watermelon slice from this collection to build a full fruit bowl set.')),
    ],
  },
},

// ── A63: Avocado ──────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-avocado',
  title: 'Amigurumi avocado',
  excerpt: 'A pear-shaped green avocado in dk yarn with an oval seed sewn into the centre of the opened half. A satisfying two-piece build.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'colour-change', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round'],
  aliases: ['crochet avocado amigurumi', 'amigurumi avocado toy', 'cute avocado crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-a63', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces. Pull the tail after the first round to close the centre hole.' },
    { slug: 'working-in-the-round-a63', term: 'Working in the round', definition: 'Crocheting in continuous rounds without turning, keeping the right side facing outward.' },
    { slug: 'colour-change-a63', term: 'Colour change', definition: 'Switching yarn colour at the start of a new round. Drop the old colour, pick up the new one, and continue without a knot.' },
    { slug: 'invisible-finish-a63', term: 'Invisible finish', definition: 'Closing the last round of a piece by threading the tail through the front loops of the final stitches to create a seamless closure.' },
  ],
  finishedSizeText: 'Approx. 8 cm wide and 10 cm tall.',
  sourceNotes: 'Synthesised from standard amigurumi pear-shape construction. No direct public-domain source.',
  pieces: [a63Body, a63Seed],
  body: {
    type: 'doc', content: [
      p(t('This avocado uses a pear body in two greens and an oval seed in brown. Start the body with a '), gt('magic-ring-a63', 'magic ring'), t(' and work '), gt('working-in-the-round-a63', 'in the round'), t('. Use a '), gt('colour-change-a63', 'colour change'), t(' to switch from the outer dark green to the inner pale green at the halfway point.')),
      h2('Avocado body (pear shape)'),
      ...a63Body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a63Body.stuffingNotes)),
      h2('Seed (oval)'),
      ...a63Seed.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t('Stuff the seed lightly so it holds its oval shape without being rigid.')),
      h2('Assembly'),
      p(t('Use the '), gt('invisible-finish-a63', 'invisible finish'), t(' to close both pieces. Pin the seed centred on the pale green face of the body and sew down with a whip stitch. Weave in all ends.')),
      h2('What to try next'),
      p(t('Add a small smiling face using black yarn French knots, or make a pair of avocado halves that nest together.')),
    ],
  },
},

// ── A64: Donut ────────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-donut',
  title: 'Amigurumi donut',
  excerpt: 'A ring-shaped crochet donut in dk yarn with a textured icing swirl on top. The ring is formed by joining a stuffed tube end to end.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'joining-in-the-round', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'joining-in-the-round'],
  aliases: ['crochet donut amigurumi', 'doughnut amigurumi pattern', 'crochet ring doughnut toy'],
  glossaryTerms: [
    { slug: 'magic-ring-a64', term: 'Magic ring', definition: 'An adjustable loop for starting amigurumi pieces. Pull the tail after the first round to close the centre.' },
    { slug: 'working-in-the-round-a64', term: 'Working in the round', definition: 'Crocheting in continuous rounds so the right side always faces you.' },
    { slug: 'joining-in-the-round-a64', term: 'Joining in the round', definition: 'Connecting the open end of a tube to its own beginning using a slip-stitch seam, forming a closed ring.' },
    { slug: 'invisible-finish-a64', term: 'Invisible finish', definition: 'Closing the final round of a piece by threading the tail through the front loops to hide the seam.' },
  ],
  finishedSizeText: 'Approx. 9 cm outer diameter, 3 cm inner hole, 4 cm thick.',
  sourceNotes: 'Synthesised from standard amigurumi torus construction. The ring is formed by joining a tube end to end rather than a direct torus primitive. No direct public-domain source.',
  pieces: [a64Outer, a64Inner],
  body: {
    type: 'doc', content: [
      p(t('A donut (torus) in amigurumi is made as a stuffed tube joined end to end. Begin the tube with a '), gt('magic-ring-a64', 'magic ring'), t(' and crochet '), gt('working-in-the-round-a64', 'in the round'), t('. The inner hole shaper is a smaller cylinder used to guide the final ring shape before joining.')),
      h2('Outer tube'),
      p(t('Work the outer tube rows below. Leave both ends open for now.')),
      ...a64Outer.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Shaping the ring'),
      p(t('Stuff the tube firmly along its full length. Curl the tube into a ring, aligning the cast-on end with the open final end. Use the '), gt('joining-in-the-round-a64', 'joining-in-the-round'), t(' method to slip-stitch the two ends together, sewing through both layers of the tube wall.')),
      h2('Icing'),
      p(t('Use a contrasting colour yarn to surface-chain or slip-stitch a wavy icing drizzle across the top of the ring. Secure at the start and finish with a knot on the inside.')),
      h2('Assembly and finish'),
      p(t('Use the '), gt('invisible-finish-a64', 'invisible finish'), t(' to neaten the join where the tube ends meet. Weave in all ends securely.')),
      h2('What to try next'),
      p(t('Make a glazed set by repeating the pattern in vanilla, chocolate, and strawberry frosting colours.')),
    ],
  },
},

// ── A65: Ice Cream Cone ───────────────────────────────────────────────────────
{
  slug: 'amigurumi-ice-cream-cone',
  title: 'Amigurumi ice cream cone',
  excerpt: 'A two-piece crochet ice cream cone with a round scoop on top of a waffle cone. A classic beginner amigurumi made in dk yarn.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round'],
  aliases: ['crochet ice cream cone amigurumi', 'amigurumi ice cream toy', 'beginner crochet ice cream pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-a65', term: 'Magic ring', definition: 'An adjustable starting loop for amigurumi. Close the centre hole by pulling the tail before finishing the first round.' },
    { slug: 'working-in-the-round-a65', term: 'Working in the round', definition: 'Crocheting in a continuous spiral so the right side always faces outward.' },
    { slug: 'invisible-finish-a65', term: 'Invisible finish', definition: 'A tidy closure for the final round, threading the tail through front loops to hide the seam.' },
  ],
  finishedSizeText: 'Approx. 7 cm wide at the scoop, 15 cm tall cone to tip.',
  sourceNotes: 'Synthesised from standard amigurumi ice cream cone construction. No direct public-domain source.',
  pieces: [a65Scoop, a65Cone],
  body: {
    type: 'doc', content: [
      p(t('The ice cream cone has two pieces: a sphere scoop and a cone. Each starts with a '), gt('magic-ring-a65', 'magic ring'), t(' and is worked '), gt('working-in-the-round-a65', 'in the round'), t('.')),
      h2('Scoop (sphere)'),
      ...a65Scoop.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a65Scoop.stuffingNotes)),
      h2('Waffle cone'),
      ...a65Cone.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a65Cone.stuffingNotes)),
      h2('Assembly'),
      p(t('Apply the '), gt('invisible-finish-a65', 'invisible finish'), t(' to the scoop before joining. Sit the base of the scoop in the open top of the cone. Pin in place and sew around the join with whip stitch using a matching yarn colour. Weave in all ends.')),
      h2('Details'),
      p(t('Add a waffle texture to the cone by working surface slip-stitches in diagonal lines across the cone body in a slightly darker tan. Embroider small black eyes and a curved smile onto the scoop.')),
      h2('What to try next'),
      p(t('Make two or three scoops in different flavours and stack them on the cone by sewing each sphere to the one below.')),
    ],
  },
},

// ── A66: Watermelon Slice ─────────────────────────────────────────────────────
{
  slug: 'amigurumi-watermelon-slice',
  title: 'Amigurumi watermelon slice',
  excerpt: 'A crochet watermelon slice in dk yarn with red flesh, white rind trim, and embroidered black seeds. Worked as a shaped half-sphere.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'colour-change', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'colour-change'],
  aliases: ['crochet watermelon amigurumi', 'watermelon slice crochet toy', 'amigurumi fruit slice pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-a66', term: 'Magic ring', definition: 'An adjustable loop for starting amigurumi rounds. Tighten the tail after the first round to close the centre.' },
    { slug: 'working-in-the-round-a66', term: 'Working in the round', definition: 'Crocheting in continuous rounds so the right side faces outward.' },
    { slug: 'colour-change-a66', term: 'Colour change', definition: 'Switching to a new yarn colour at the start of a round by drawing the new colour through the final stitch of the old round.' },
    { slug: 'invisible-finish-a66', term: 'Invisible finish', definition: 'Closing the final round with the yarn tail threaded through the front loops, hiding the seam entirely.' },
  ],
  finishedSizeText: 'Approx. 10 cm across and 5 cm thick (half-sphere slice).',
  sourceNotes: 'Synthesised from standard amigurumi fruit slice construction. The slice shape is the increase half of a sphere, stopped at the equator and backed with a flat oval. No direct public-domain source.',
  pieces: [a66Body, a66Rind],
  body: {
    type: 'doc', content: [
      p(t('The slice is worked as the increase half of a sphere stopped at the equator, giving a dome of flesh. Start with a '), gt('magic-ring-a66', 'magic ring'), t(' and work '), gt('working-in-the-round-a66', 'in the round'), t('. Use a '), gt('colour-change-a66', 'colour change'), t(' to add white rind rounds at the outer edge.')),
      h2('Flesh dome (half sphere)'),
      p(t('Work only the increase rounds from the sphere pattern below, stopping when you reach the equator stitch count. Do not decrease.')),
      ...a66Body.rowByRow.slice(0, Math.ceil(a66Body.rowByRow.length / 2)).map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Rind strip (oval)'),
      ...a66Rind.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Assembly'),
      p(t('Use the '), gt('invisible-finish-a66', 'invisible finish'), t(' on the rind strip. Pin the flat rind oval to the open bottom of the dome, right sides out. Sew around the perimeter with a whip stitch, stuffing lightly before closing completely. Embroider black seed dots across the red dome with scattered French knots.')),
      h2('What to try next'),
      p(t('Make a set of four slices and join them at the straight edges to recreate a full round watermelon cross-section.')),
    ],
  },
},

// ── A67: Pineapple ────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-pineapple',
  title: 'Amigurumi pineapple',
  excerpt: 'A golden pineapple amigurumi in dk yarn with a spiky green crown and textured cross-hatch surface. A confident beginner project.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'surface-crochet', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'surface-crochet'],
  aliases: ['crochet pineapple amigurumi', 'amigurumi pineapple toy', 'cute pineapple crochet pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-a67', term: 'Magic ring', definition: 'An adjustable starting loop for amigurumi. Close the centre hole by pulling the tail after the first round.' },
    { slug: 'working-in-the-round-a67', term: 'Working in the round', definition: 'Crocheting in a continuous spiral so the right side faces you at all times.' },
    { slug: 'surface-crochet-a67', term: 'Surface crochet', definition: 'Working chains or slip-stitches directly onto the surface of a finished piece to add texture or pattern without separate pieces.' },
    { slug: 'invisible-finish-a67', term: 'Invisible finish', definition: 'Closing the final round using the tail threaded through the front loops of the last stitches.' },
  ],
  finishedSizeText: 'Approx. 7 cm wide and 17 cm tall (body and crown).',
  sourceNotes: 'Synthesised from standard amigurumi pineapple construction. No direct public-domain source.',
  pieces: [a67Body, a67Crown],
  body: {
    type: 'doc', content: [
      p(t('The pineapple has an oval body in yellow and a short cylinder crown base in green. Begin the body with a '), gt('magic-ring-a67', 'magic ring'), t(' and work '), gt('working-in-the-round-a67', 'in the round'), t('.')),
      h2('Pineapple body (oval)'),
      ...a67Body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a67Body.stuffingNotes)),
      h2('Crown base (cylinder)'),
      ...a67Crown.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Crown spikes'),
      p(t('Chain 8, slip-stitch back down to base. Repeat to make 7 to 9 spikes radiating from the top of the crown cylinder. Stuff the cylinder lightly before closing.')),
      h2('Surface texture'),
      p(gt('surface-crochet-a67', 'Surface crochet'), t(' diagonal slip-stitch lines in two directions across the body. This makes a diamond grid that reads as pineapple skin.')),
      h2('Assembly'),
      p(t('Apply the '), gt('invisible-finish-a67', 'invisible finish'), t(' to the body. Pin the crown centred on top and sew down with a whip stitch. Weave in all ends.')),
      h2('What to try next'),
      p(t('Work the body rounds in back loops only for a more pronounced ridged texture without the surface crochet step.')),
    ],
  },
},

// ── A68: Burger ───────────────────────────────────────────────────────────────
{
  slug: 'amigurumi-burger',
  title: 'Amigurumi burger',
  excerpt: 'A stacked crochet burger in dk yarn with a domed bun top, oval patty, and flat bun base. Three pieces snap together for a satisfying build.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'colour-change', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'colour-change'],
  aliases: ['crochet burger amigurumi', 'amigurumi hamburger pattern', 'crochet cheeseburger toy'],
  glossaryTerms: [
    { slug: 'magic-ring-a68', term: 'Magic ring', definition: 'An adjustable loop used to start amigurumi pieces. Close the centre hole by pulling the tail.' },
    { slug: 'working-in-the-round-a68', term: 'Working in the round', definition: 'Crocheting in continuous rounds so the right side faces outward.' },
    { slug: 'colour-change-a68', term: 'Colour change', definition: 'Joining a new yarn colour at a round boundary by drawing it through the last stitch of the previous round before continuing.' },
    { slug: 'invisible-finish-a68', term: 'Invisible finish', definition: 'Closing the final round by threading the tail through front loops of the last stitches.' },
  ],
  finishedSizeText: 'Approx. 9 cm wide and 9 cm tall (all three pieces stacked).',
  sourceNotes: 'Synthesised from standard amigurumi layered food construction. No direct public-domain source.',
  pieces: [a68BunTop, a68Patty, a68BunBottom],
  body: {
    type: 'doc', content: [
      p(t('The burger has three pieces: a domed bun top (sphere), an oval patty, and a flat bun base (cylinder). Start each with a '), gt('magic-ring-a68', 'magic ring'), t(' and work '), gt('working-in-the-round-a68', 'in the round'), t('.')),
      h2('Top bun (sphere)'),
      ...a68BunTop.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a68BunTop.stuffingNotes)),
      h2('Patty (oval)'),
      ...a68Patty.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t('Stuff the patty lightly to keep it flat.')),
      h2('Bottom bun (cylinder)'),
      ...a68BunBottom.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a68BunBottom.stuffingNotes)),
      h2('Assembly'),
      p(t('Apply the '), gt('invisible-finish-a68', 'invisible finish'), t(' to each piece. Use a '), gt('colour-change-a68', 'colour change'), t(' to add a yellow cheese round on the patty before assembling. Stack the patty on the bottom bun, then the top bun on the patty. Sew each layer to the one below with a whip stitch at the rim. Weave in all ends.')),
      h2('Details'),
      p(t('Add sesame seeds to the top bun using white yarn French knots. Embroider eyes and a smile onto the bun dome.')),
      h2('What to try next'),
      p(t('Add extra layers: a round of green dc for lettuce, a flat red oval for tomato, and a yellow oval for mustard between patty and bun base.')),
    ],
  },
},

// ── A69: Pizza Slice ──────────────────────────────────────────────────────────
{
  slug: 'amigurumi-pizza-slice',
  title: 'Amigurumi pizza slice',
  excerpt: 'A crochet pizza slice in dk yarn with a cone-based triangle shape, red tomato base, and bobble cheese toppings. A playful intermediate build.',
  difficulty: 'INTERMEDIATE',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'colour-change', 'bobble-stitch'],
  criticalTechniques: ['magic-ring', 'working-in-the-round', 'colour-change'],
  aliases: ['crochet pizza slice amigurumi', 'amigurumi pizza toy', 'crochet food slice pattern'],
  glossaryTerms: [
    { slug: 'magic-ring-a69', term: 'Magic ring', definition: 'An adjustable loop for starting amigurumi rounds. Pull the tail to close the centre hole.' },
    { slug: 'working-in-the-round-a69', term: 'Working in the round', definition: 'Crocheting in continuous rounds so the right side always faces you.' },
    { slug: 'colour-change-a69', term: 'Colour change', definition: 'Picking up a new yarn colour at the start of a round by drawing it through the final stitch of the previous round.' },
    { slug: 'bobble-stitch-a69', term: 'Bobble stitch', definition: 'A cluster of several partially-worked double crochet stitches joined at the top to create a raised round bump. Used here for cheese or topping details.' },
  ],
  finishedSizeText: 'Approx. 10 cm across the wide base and 12 cm from crust to tip.',
  sourceNotes: 'Synthesised from standard amigurumi cone and flat-triangle construction. The slice uses a modified cone base worked flat across one side to produce a triangular profile. No direct public-domain source.',
  pieces: [a69Base, a69Topping],
  body: {
    type: 'doc', content: [
      p(t('A pizza slice is shaped as a wide, flat cone. Start with a '), gt('magic-ring-a69', 'magic ring'), t(' at the tip and increase across one side only to form the triangular face. Work '), gt('working-in-the-round-a69', 'in the round'), t(' for the crust edge.')),
      h2('Slice base (cone modification)'),
      p(t('Work the cone rounds below as written, but after reaching the base diameter, join the open edge into a straight crust seam rather than decreasing to a point.')),
      ...a69Base.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Topping layer (oval)'),
      p(t('The oval topping represents the cheese and sauce layer.')),
      ...a69Topping.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      h2('Topping details'),
      p(t('Use a '), gt('colour-change-a69', 'colour change'), t(' to add a red layer to the oval. Then work '), gt('bobble-stitch-a69', 'bobble stitches'), t(' across the surface in white or cream for the cheese.')),
      h2('Assembly'),
      p(t('Sew the topping oval flat onto the wide face of the slice base. Weave in all ends.')),
      h2('What to try next'),
      p(t('Cut small felt circles and sew them on as toppings. Crochet flat grey circles to use as mushroom slices.')),
    ],
  },
},

// ── A70: Sushi Roll ───────────────────────────────────────────────────────────
{
  slug: 'amigurumi-sushi-roll',
  title: 'Amigurumi sushi roll',
  excerpt: 'A compact crochet sushi roll in dk yarn with a black nori cylinder body and a coloured filling oval in the centre. Quick and satisfying.',
  difficulty: 'BEGINNER',
  techniqueSlugs: ['magic-ring', 'working-in-the-round', 'invisible-finish'],
  criticalTechniques: ['magic-ring', 'working-in-the-round'],
  aliases: ['crochet sushi amigurumi', 'amigurumi sushi roll pattern', 'crochet maki roll toy'],
  glossaryTerms: [
    { slug: 'magic-ring-a70', term: 'Magic ring', definition: 'An adjustable loop for starting amigurumi rounds. Tighten the tail to close the centre before the first round is finished.' },
    { slug: 'working-in-the-round-a70', term: 'Working in the round', definition: 'Crocheting in continuous rounds so the right side faces outward throughout.' },
    { slug: 'invisible-finish-a70', term: 'Invisible finish', definition: 'Closing the final round cleanly by threading the tail through the front loops of the last stitches.' },
  ],
  finishedSizeText: 'Approx. 5 cm wide and 4 cm tall.',
  sourceNotes: 'Synthesised from standard amigurumi cylinder construction. No direct public-domain source.',
  pieces: [a70Body, a70Filling],
  body: {
    type: 'doc', content: [
      p(t('This sushi roll uses a short black cylinder body and a small oval filling. Both pieces start with a '), gt('magic-ring-a70', 'magic ring'), t(' and are worked '), gt('working-in-the-round-a70', 'in the round'), t('.')),
      h2('Nori body (cylinder)'),
      ...a70Body.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t(a70Body.stuffingNotes)),
      h2('Filling (oval)'),
      ...a70Filling.rowByRow.map(r => p(t(`Round ${r.round}: ${r.instructions}`))),
      p(t('Stuff the filling lightly to keep it flat and round.')),
      h2('Assembly'),
      p(t('Apply the '), gt('invisible-finish-a70', 'invisible finish'), t(' to both pieces. Pin the filling oval centred on top of the cylinder body, visible from the end. Sew around the edge with a whip stitch. Weave in all ends.')),
      h2('Details'),
      p(t('Add a white ring of chain stitch around the filling to represent rice. Embroider small eyes and a smile onto the flat end of the cylinder.')),
      h2('What to try next'),
      p(t('Make a set of three different fillings: pink salmon, green avocado, and yellow egg, to create a sushi platter arrangement.')),
    ],
  },
},

] // end PATTERNS

for (const pat of PATTERNS) {
  const {
    slug, title, excerpt, difficulty,
    techniqueSlugs, criticalTechniques, aliases, glossaryTerms,
    finishedSizeText, sourceNotes, pieces, body,
  } = pat

  const out = {
    slug,
    title,
    subtitle: '',
    excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'amigurumi',
    difficulty,
    sourceType: 'SYNTHESISED',
    sourceNotes,
    techniqueSlugs,
    criticalTechniques,
    aliases,
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '24 dc × 28 rows = 10 × 10 cm in dk yarn on a 3.5 mm hook.',
      finishedSizeText,
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-dc2tog'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    amigurumi: { pieces },
    body,
  }

  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}.json`)
}

console.log('\nDone. 10 patterns written to', OUT)
