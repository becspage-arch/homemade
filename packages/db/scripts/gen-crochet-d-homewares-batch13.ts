/**
 * Generator: D-Homewares Batch 13 -- Kitchen 4-15 + Small accents 1-3
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-homewares-batch13.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-homewares')
mkdirSync(OUT, { recursive: true })

function p(...nodes: object[]) { return { type: 'paragraph', content: nodes } }
function t(text: string) { return { type: 'text', text } }
function h2(text: string) { return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] } }
function gt(termSlug: string, text: string) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text } }
function li(...c: object[]) { return { type: 'listItem', content: [{ type: 'paragraph', content: c }] } }
function ul(...items: object[]) { return { type: 'bulletList', content: items } }
function supplies(heading: string, items: { name: string; qty: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

const PATTERNS = [

// ── K4 ── bread basket liner ──────────────────────────────────────────────────
{
  slug: 'bread-basket-liner',
  title: 'Bread basket liner',
  subtitle: 'A 30 cm round cotton liner to sit inside a bread basket.',
  excerpt: 'A flat 30 cm round cotton liner in double crochet keeps bread warm inside a basket. Edges are finished with a simple dc border.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in cotton DK on a 4 mm hook.',
  finishedSize: '30 cm diameter round liner.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['bread basket liner', 'crochet basket liner', 'round liner crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-liner', term: 'Magic ring', definition: 'An adjustable loop start for circular work. Pulled closed, it gives a neat centre point to the liner.' },
    { slug: 'dc-liner-bread', term: 'Double crochet', definition: 'The base stitch throughout. Cotton dc gives a flat, absorbent, washable fabric.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet basket liners are a simple practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat circle in '), gt('dc-liner-bread', 'double crochet'), t(' from a '), gt('magic-ring-liner', 'magic ring'), t(', adding 6 dc per round until the circle reaches 30 cm. Finish with a dc border round.')),
      p(t('Cotton DK is washable and food-safe. Natural or white is the most useful colour. Total yarn around 120 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Cotton DK yarn', qty: '120 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Liner'),
      p(t('Round 1: magic ring, 6 dc. Round 2: 2 dc each (12). Round 3: * 2 dc, 1 dc; rep (18). Continue adding 6 dc per round until 30 cm. Final round: '), gt('dc-liner-bread', 'dc'), t(' plain. Sl st. Fasten off.')),
      h2('What to try next'),
      p(t('The pot holder set uses the same cotton dc fabric in a square format for heat protection.')),
    ],
  },
},

// ── K5 ── jar cosy ────────────────────────────────────────────────────────────
{
  slug: 'preserving-jar-cosy',
  title: 'Preserving jar cosy',
  subtitle: 'A ribbed crochet sleeve for a 1-litre preserving jar, for insulation or display.',
  excerpt: 'A 1x1 ribbed crochet sleeve for a standard 1-litre preserving jar. Works as an insulating sleeve for hot drinks or as a decorative cover.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 st x 20 rounds = 10 x 10 cm in rib pattern on a 4 mm hook.',
  finishedSize: 'Fits a standard 1-litre jar (9 cm diameter x 16 cm tall).',
  stitchSlugs: ['crochet-chain', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc'],
  aliases: ['jar cosy crochet', 'mason jar sleeve', 'preserving jar cover'],
  glossaryTerms: [
    { slug: 'fpdc-jar', term: 'Front post double crochet', definition: 'A dc worked around the post of the stitch below from the front. Creates a raised vertical rib on the right side of the sleeve.' },
    { slug: 'bpdc-jar', term: 'Back post double crochet', definition: 'A dc worked around the post from the back. The recessed counterpart, forming the 1x1 rib pattern.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet jar cosies are a popular modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('A 1x1 rib of alternating '), gt('fpdc-jar', 'front post dc'), t(' and '), gt('bpdc-jar', 'back post dc'), t(' stretches to fit the jar snugly. The rib also gives the sleeve good grip on the glass surface.')),
      p(t('Measure the jar circumference and adjust the foundation chain to fit. Total yarn around 80 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '80 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '1-litre preserving jar', qty: '1' },
      ]),
      h2('Sleeve'),
      p(t('Foundation: chain to fit jar circumference (approx. 56 sts), sl st to join. Round 1: dc around. Round 2 onwards: * '), gt('fpdc-jar', 'fpdc'), t(', '), gt('bpdc-jar', 'bpdc'), t('; rep. Continue to jar height (16 cm). Sl st. Fasten off.')),
      h2('What to try next'),
      p(t('The storage pot cover uses the same rib sleeve at a smaller 12 cm size.')),
    ],
  },
},

// ── K6 ── bottle cosy ─────────────────────────────────────────────────────────
{
  slug: 'water-bottle-cosy',
  title: 'Water bottle cosy',
  subtitle: 'A stretchy crochet sleeve for a standard 500 ml drinks bottle.',
  excerpt: 'A stretchy dc sleeve in cotton DK fits over a 500 ml water bottle or travel cup. Keeps drinks cooler and protects the bottle surface.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: 'Fits a 500 ml bottle (6.5 cm diameter x 20 cm tall).',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bottle cosy crochet', 'drinks bottle cover', 'water bottle sleeve crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-bottle', term: 'Magic ring', definition: 'An adjustable loop start. Used for the circular base of the bottle cosy.' },
    { slug: 'dc-tube-bottle', term: 'Dc tube', definition: 'A cylindrical sleeve worked in dc rounds. Sized to fit snugly over the bottle with a small amount of stretch.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet bottle cosies are a popular modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a circular base from a '), gt('magic-ring-bottle', 'magic ring'), t(' to 6.5 cm, then rise straight up in '), gt('dc-tube-bottle', 'dc rounds'), t(' for 20 cm. A small loop at the top edge allows the cosy to hang from a bag hook.')),
      p(t('Cotton or bamboo DK is soft enough to add some insulation. Total yarn around 80 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK cotton or bamboo yarn', qty: '80 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Base'),
      p(t('Round 1: magic ring, 6 dc. Round 2: 2 dc each. Round 3: * 2 dc, 1 dc; rep. Continue to 6.5 cm. BLO fold round.')),
      h2('Body'),
      p(t('Work dc in spiral for 20 cm. Final round: sl st, ch 12, sl st to same st to form hanging loop. Fasten off.')),
      h2('What to try next'),
      p(t('The preserving jar cosy uses the same sleeve shape with a ribbed stitch for a different fit.')),
    ],
  },
},

// ── K7 ── mug cosy ────────────────────────────────────────────────────────────
{
  slug: 'crochet-mug-cosy',
  title: 'Crochet mug cosy',
  subtitle: 'A ribbed crochet sleeve that slips over a standard mug to keep drinks hot.',
  excerpt: 'A 1x1 ribbed sleeve in aran yarn that slips over a standard 10 cm tall mug. Fastens with a single button at the back.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 st x 16 rows = 10 x 10 cm in rib on a 5 mm hook.',
  finishedSize: 'Fits a standard 8 cm diameter mug.',
  stitchSlugs: ['crochet-chain', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc'],
  criticalTechniques: ['crochet-fpdc'],
  aliases: ['mug cosy crochet', 'coffee cup cosy', 'mug warmer crochet'],
  glossaryTerms: [
    { slug: 'fpdc-mug', term: 'Front post double crochet', definition: 'A dc around the post of the stitch below from the front. Creates raised vertical ribs that stretch to fit the mug.' },
    { slug: 'bpdc-mug', term: 'Back post double crochet', definition: 'A dc around the post from the back. Forms the recessed part of the 1x1 rib pattern.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet mug cosies are a well-established popular project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat rectangle in 1x1 rib using '), gt('fpdc-mug', 'front post dc'), t(' and '), gt('bpdc-mug', 'back post dc'), t('. The rectangle wraps around the mug and fastens with a single button at the back. The rib stretches slightly to grip different mug sizes.')),
      p(t('Aran weight on a 5 mm hook gives good insulation. Total yarn around 40 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '40 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm button', qty: '1' },
      ]),
      h2('Cosy'),
      p(t('Chain 31. Row 1: dc across (foundation). Row 2: * '), gt('fpdc-mug', 'fpdc'), t(', '), gt('bpdc-mug', 'bpdc'), t('; rep. Repeat row 2 until piece wraps mug (about 8 cm tall). On last row, ch 3 at end for button loop. Fasten off. Sew button to other end.')),
      h2('What to try next'),
      p(t('The preserving jar cosy uses the same rib stitch for a taller cylindrical sleeve.')),
    ],
  },
},

// ── K8 ── tea cosy ────────────────────────────────────────────────────────────
{
  slug: 'classic-tea-cosy',
  title: 'Classic tea cosy',
  subtitle: 'A double-layer tea cosy for a standard 6-cup teapot.',
  excerpt: 'Two dc panels seamed to make a double-layer tea cosy that fits a standard 6-cup teapot. Openings for spout and handle. Finished with a pompom on top.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: 'Fits a 6-cup teapot (approx. 20 cm wide x 14 cm tall).',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet tea cosy', 'teapot cover crochet', 'tea pot cosy'],
  glossaryTerms: [
    { slug: 'dome-shaping', term: 'Dome shaping', definition: 'Decreasing stitches at the top of each panel to form a curved dome over the teapot lid.' },
    { slug: 'spout-gap', term: 'Spout gap', definition: 'A section left unworked on one side of each panel to allow the teapot spout and handle to pass through.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Tea cosies are a well-established Victorian and modern crochet project. No direct Weldon source needed.',
  body: {
    type: 'doc', content: [
      p(t('Work two panels to the same shape: a rectangle with '), gt('dome-shaping', 'dome shaping'), t(' at the top. Leave a '), gt('spout-gap', 'spout gap'), t(' open on each panel where the spout and handle will pass through. Seam panels together at the top and sides.')),
      p(t('Aran weight works up fast and provides good insulation. Add a yarn pompom on top. Total yarn around 180 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn, main colour', qty: '150 m' },
        { name: 'Aran yarn, contrast (pompom)', qty: '30 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Panel (make 2)'),
      p(t('Chain 29. Work dc rows for 14 cm (straight sides). Begin '), gt('dome-shaping', 'dome shaping'), t(': decrease 1 st each end every 2 rows for 4 cm. Leave a 4 cm '), gt('spout-gap', 'gap'), t(' at the base of each side during the straight section.')),
      h2('Assembly'),
      p(t('Whipstitch the two dome sections together at the top. Whipstitch side seams above and below the spout gaps. Add a pompom to the dome.')),
      h2('What to try next'),
      p(t('The double thick oven mitt uses the same double-panel cotton construction for kitchen heat protection.')),
    ],
  },
},

// ── K9 ── cutlery wrap ────────────────────────────────────────────────────────
{
  slug: 'cutlery-travel-wrap',
  title: 'Cutlery travel wrap',
  subtitle: 'A small 15 x 12 cm crochet roll for travelling cutlery or a picnic set.',
  excerpt: 'A flat 15 x 12 cm dc rectangle that rolls around a fork, knife, and spoon and ties closed. Useful for packed lunches and picnics.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '15 x 12 cm flat, rolls to approximately 5 x 12 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cutlery wrap crochet', 'picnic cutlery roll', 'travel utensil roll'],
  glossaryTerms: [
    { slug: 'dc-wrap-panel', term: 'Double crochet panel', definition: 'A flat rectangle of double crochet. Used as the main body of the wrap and as the inner pocket flap.' },
    { slug: 'tie-cord', term: 'Crochet tie cord', definition: 'A narrow chain or twisted cord attached to one long edge. Wraps around the rolled case to hold it closed.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet cutlery rolls are a modern practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a main '), gt('dc-wrap-panel', 'double crochet panel'), t(' at 15 x 12 cm. Add a narrower inner flap (4 cm wide) along the bottom third of the main panel. The cutlery sits in the pocket formed by the flap. Roll and secure with a '), gt('tie-cord', 'crochet tie cord'), t('.')),
      p(t('Use a firm cotton DK so the wrap holds its shape when rolled. Total yarn around 60 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Cotton DK yarn', qty: '60 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Main panel'),
      p(t('Chain 28. Work '), gt('dc-wrap-panel', 'dc rows'), t(' for 12 cm.')),
      h2('Inner pocket'),
      p(t('On the main panel, chain 28 at the bottom edge. Work dc rows for 4 cm. Whipstitch side edges of pocket to the main panel.')),
      h2('Tie cord'),
      p(t('Attach a '), gt('tie-cord', 'chain cord'), t(' at the centre of one long edge: ch 40, fasten off. Roll and tie to close.')),
      h2('What to try next'),
      p(t('The bread basket liner uses the same flat cotton dc approach at a larger circular scale.')),
    ],
  },
},

// ── K10 ── fruit bowl ─────────────────────────────────────────────────────────
{
  slug: 'large-fruit-bowl',
  title: 'Large fruit bowl',
  subtitle: 'A 28 cm wide stiffened crochet bowl for fruit or vegetable display.',
  excerpt: 'A wide, low dc bowl stiffened with fabric stiffener holds its shape for everyday use as a fruit or vegetable bowl at 28 cm diameter.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '11 dc x 13 rounds = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: '28 cm diameter, 10 cm tall.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-blo-dc'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk', 'crochet-blo-dc'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['crochet fruit bowl', 'large crochet bowl', 'rope fruit bowl'],
  glossaryTerms: [
    { slug: 'magic-ring-fruit', term: 'Magic ring', definition: 'An adjustable loop start. Pulled tight, it leaves no hole at the centre of the bowl base.' },
    { slug: 'blo-fruit', term: 'BLO fold round', definition: 'One round worked into the back loops only at the base-to-side transition. Creates a clean right-angle fold.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Stiffened crochet fruit bowls are a modern practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a flat base from a '), gt('magic-ring-fruit', 'magic ring'), t(' to 28 cm. A '), gt('blo-fruit', 'BLO fold round'), t(' turns the work upward for 10 cm of sides. Stiffen while shaped over a 28 cm bowl or plate mould.')),
      p(t('Chunky cotton or jute holds stiffener well. The bowl supports fruit weight when thoroughly dry. Total yarn around 300 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky cotton or jute yarn', qty: '300 m' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Fabric stiffener', qty: 'as needed' },
      ]),
      h2('Base'),
      p(t('Round 1: magic ring, 6 dc. Increase 6 dc per round until base is 28 cm. Work '), gt('blo-fruit', 'BLO fold round'), t('.')),
      h2('Sides'),
      p(t('Work dc in spiral for 10 cm. Sl st. Fasten off. Apply stiffener and dry over a mould.')),
      h2('What to try next'),
      p(t('The decorative bowl centrepiece uses the same technique at a smaller 20 cm scale.')),
    ],
  },
},

// ── K11 ── dish scrubber ──────────────────────────────────────────────────────
{
  slug: 'crochet-dish-scrubber',
  title: 'Crochet dish scrubber',
  subtitle: 'A 10 cm square scrubber in cotton and cotton loop yarn for washing dishes.',
  excerpt: 'A dense double crochet scrubber in cotton yarn gives a scrubbing surface for washing dishes and wiping surfaces. Machine-washable.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in cotton aran on a 5 mm hook.',
  finishedSize: '10 x 10 cm scrubber.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-blo-dc'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-blo-dc'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet dish scrubber', 'dishcloth scrubber crochet', 'kitchen scrubber cotton'],
  glossaryTerms: [
    { slug: 'blo-scrubber', term: 'BLO double crochet', definition: 'A dc worked into the back loop only. Leaves the front loop exposed, creating a ridged surface that helps scrub food residue.' },
    { slug: 'dc-dense', term: 'Dense double crochet', definition: 'Working dc at a tight tension with a smaller hook than usual for the yarn weight. Produces a firm, thick fabric with good scrubbing action.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet kitchen scrubbers are a widely used modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work in '), gt('blo-scrubber', 'BLO double crochet'), t(' for a ridged surface texture. The raised loops grip food particles and work harder than plain dc. Use 100% cotton for a food-safe, '), gt('dc-dense', 'dense'), t(' scrubber.')),
      p(t('Make several at once. They last through many washes before needing replacement. Total yarn around 20 m per scrubber.')),
      h2('What you need'),
      supplies('Materials', [
        { name: '100% cotton aran yarn', qty: '20 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Scrubber'),
      p(t('Chain 15. Work '), gt('blo-scrubber', 'BLO dc'), t(' every row until square is 10 cm. Fasten off. Weave in ends.')),
      h2('What to try next'),
      p(t('The set of dishcloths uses the same cotton dc approach at a larger 25 cm format.')),
    ],
  },
},

// ── K12 ── french press cosy ──────────────────────────────────────────────────
{
  slug: 'french-press-cosy',
  title: 'French press cosy',
  subtitle: 'An insulating crochet sleeve for a standard 8-cup french press.',
  excerpt: 'A textured crochet sleeve in aran yarn wraps around a standard 8-cup french press to keep coffee warm for longer.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: 'Fits a standard 8-cup french press (11 cm diameter x 16 cm body).',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-fpdc', 'crochet-bpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fpdc', 'crochet-bpdc', 'crochet-double-uk'],
  criticalTechniques: ['crochet-fpdc'],
  aliases: ['french press cosy', 'cafetiere cosy crochet', 'coffee press cover'],
  glossaryTerms: [
    { slug: 'fpdc-press', term: 'Front post double crochet', definition: 'A dc around the post of the stitch below from the front. Creates raised ribs on the cosy exterior.' },
    { slug: 'bpdc-press', term: 'Back post double crochet', definition: 'A dc around the post from the back. Forms the recessed part of the 1x1 rib.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet french press cosies are a popular modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a 1x1 rib rectangle in '), gt('fpdc-press', 'front post dc'), t(' and '), gt('bpdc-press', 'back post dc'), t('. The rectangle wraps around the press body and fastens at the back with a button or button loop.')),
      p(t('Aran weight gives a warm insulating layer. Total yarn around 80 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '80 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '2 cm button', qty: '1' },
      ]),
      h2('Cosy'),
      p(t('Chain 37 (press circumference, approx. 36 cm). Work rib for 16 cm. Add button loop on last row. Fasten off. Sew button to matching end.')),
      h2('What to try next'),
      p(t('The classic tea cosy uses the same wrapping approach for a teapot.')),
    ],
  },
},

// ── K13 ── bowl cosy ──────────────────────────────────────────────────────────
{
  slug: 'microwavable-bowl-cosy',
  title: 'Microwavable bowl cosy',
  subtitle: 'A 100% cotton bowl cosy for handling hot bowls from the microwave.',
  excerpt: 'A cotton bowl cosy cradles a standard 14 cm soup bowl so it can be lifted safely from the microwave. Made from two folded dc squares seamed together.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in cotton aran on a 5 mm hook.',
  finishedSize: 'Fits a 14 cm diameter soup or cereal bowl.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bowl cosy crochet', 'bowl holder microwave', 'hot bowl holder'],
  glossaryTerms: [
    { slug: 'dc-cotton-cosy', term: 'Double crochet in cotton', definition: '100% cotton dc produces a heat-safe, food-grade fabric suitable for microwave use. Never use acrylic for this project.' },
    { slug: 'folded-cosy', term: 'Folded cosy', definition: 'Two square dc panels each folded diagonally, then nested together at 90 degrees and seamed at the corners. Forms a pocket that cradles the bowl.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Microwave bowl cosies are a popular practical modern crochet project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('This cosy uses the '), gt('folded-cosy', 'folded cosy'), t(' method: make two 28 cm dc squares in '), gt('dc-cotton-cosy', '100% cotton'), t('. Fold each in half diagonally, then place at 90 degrees to each other. Seam the corners together. The bowl sits in the pocket formed by the overlapping triangles.')),
      p(t('Cotton only. The cosy must be completely dry before microwave use. Total yarn around 200 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: '100% cotton aran yarn', qty: '200 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Square (make 2)'),
      p(t('Chain 41. Work '), gt('dc-cotton-cosy', 'dc rows'), t(' until square is 28 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Fold each square in half diagonally. Nest the two triangles at 90 degrees, raw edges inside. Seam the two outer corner points together. The bowl drops into the centre pocket.')),
      h2('What to try next'),
      p(t('The pot holder set uses the same double-layer cotton approach in a simpler square format.')),
    ],
  },
},

// ── K14 ── utensil holder ─────────────────────────────────────────────────────
{
  slug: 'kitchen-utensil-holder',
  title: 'Kitchen utensil holder',
  subtitle: 'A 15 cm tall crochet pot for holding kitchen utensils on the worktop.',
  excerpt: 'A straight-sided 15 cm crochet pot in super-chunky rope holds spoons, spatulas, and other utensils upright on the kitchen worktop.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-chunky',
  hook: 'crochet-hook-10-0mm',
  gauge: '8 dc x 9 rounds = 10 x 10 cm in super-chunky rope on a 10 mm hook.',
  finishedSize: '12 cm diameter x 15 cm tall.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-blo-dc'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['crochet utensil pot', 'kitchen tool holder', 'utensil crock crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-utensil', term: 'Magic ring', definition: 'An adjustable loop start for the base circle. Pulled closed, it gives a neat solid base with no hole.' },
    { slug: 'blo-utensil', term: 'BLO fold round', definition: 'One round in back loops only at the base-to-side transition. Creates the right-angle fold that gives the pot a defined base edge.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet utensil holders are a popular practical modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a 12 cm flat base from a '), gt('magic-ring-utensil', 'magic ring'), t('. A '), gt('blo-utensil', 'BLO fold round'), t(' turns the work upward. Rise straight for 15 cm in dc spiral. The firm rope fabric supports the weight of utensils without tipping.')),
      p(t('Use 8 to 10 mm cotton rope. Total yarn around 200 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Super-chunky cotton rope', qty: '200 m' },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Base'),
      p(t('Round 1: magic ring, 6 dc. Increase 6 dc per round until base is 12 cm. Work '), gt('blo-utensil', 'BLO fold round'), t('.')),
      h2('Sides'),
      p(t('Work dc in spiral for 15 cm. Sl st. Fasten off.')),
      h2('What to try next'),
      p(t('The large fruit bowl uses the same base-up rope construction at a wider, lower proportion.')),
    ],
  },
},

// ── K15 ── egg cosy set ───────────────────────────────────────────────────────
{
  slug: 'boiled-egg-cosy-set',
  title: 'Boiled egg cosy set',
  subtitle: 'A set of four small egg cosies in dk yarn to keep boiled eggs warm.',
  excerpt: 'Four small egg cosies in different colours cover the top of a boiled egg to keep it warm at the table. Each is a small dc dome in DK yarn.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: 'Set of 4, each fitting a standard boiled egg in an egg cup.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-dc2tog'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['egg cosy set', 'crochet egg cosy', 'egg cup cover crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-eggcosy', term: 'Magic ring', definition: 'An adjustable loop start for the top of each egg cosy. Pulled tight, it gives a neat closed dome.' },
    { slug: 'dc2tog-eggcosy', term: 'Dc2tog', definition: 'Double crochet two together. Used to taper the cosy toward the opening to fit snugly over the egg top.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Egg cosies are a traditional knitting and crochet project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each cosy starts at the top of the dome from a '), gt('magic-ring-eggcosy', 'magic ring'), t(' and grows outward to fit over the top of a boiled egg. Small '), gt('dc2tog-eggcosy', 'dc2tog'), t(' decreases at the bottom edge help the cosy grip the egg.')),
      p(t('Make four in different bright colours. The cosies sit on the egg at the table. Total yarn around 40 m across four colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn, 4 colours', qty: '10 m each' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Cosy (make 4)'),
      p(t('Round 1: '), gt('magic-ring-eggcosy', 'magic ring'), t(', 5 dc. Rounds 2 to 4: increase to 15 dc. Rounds 5 to 7: dc even. Round 8: * '), gt('dc2tog-eggcosy', 'dc2tog'), t(', 1 dc; rep (10 dc). Sl st. Fasten off.')),
      h2('What to try next'),
      p(t('The classic tea cosy uses the same dome-and-opening method at a much larger scale.')),
    ],
  },
},

// ── S1 ── bookend covers ──────────────────────────────────────────────────────
{
  slug: 'crochet-bookend-covers',
  title: 'Crochet bookend covers',
  subtitle: 'A pair of crochet covers for standard cast-iron bookends.',
  excerpt: 'A pair of simple dc sleeves cover standard cast-iron bookends. Work each as a rectangular tube and slip over the bookend foot.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '11 dc x 13 rows = 10 x 10 cm in chunky on a 6 mm hook.',
  finishedSize: 'Fits standard L-shaped bookend with 12 x 8 cm foot.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['bookend cover crochet', 'crochet bookend', 'book end sleeve'],
  glossaryTerms: [
    { slug: 'dc-tube-bookend', term: 'Dc tube', definition: 'A flat dc rectangle seamed into a tube and slipped over the bookend foot. Sized to fit snugly so it does not slide.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet bookend covers are a modern decorative project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each '), gt('dc-tube-bookend', 'dc tube'), t(' is sized to fit the bookend foot: a rectangle with width equal to the foot perimeter and length equal to the foot depth. Seam the long edge into a tube and slip over the foot.')),
      p(t('Chunky yarn works up fast and gives the covers body. Total yarn around 100 m for the pair.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky yarn', qty: '100 m' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Cast-iron L-shaped bookends', qty: '1 pair' },
      ]),
      h2('Cover (make 2)'),
      p(t('Measure bookend foot: perimeter is the chain count, depth is the row count. Chain accordingly. Work dc rows to depth. Seam long edge. Slip over foot.')),
      h2('What to try next'),
      p(t('The house door stop cover uses the same sleeve-over-object approach with a shaped top.')),
    ],
  },
},

// ── S2 ── cable tidy ──────────────────────────────────────────────────────────
{
  slug: 'cable-tidy-wrap',
  title: 'Cable tidy wrap',
  subtitle: 'A set of four small crochet velcro-free cable wraps for desk or home use.',
  excerpt: 'Four small dc tubes with a button closure wrap and bundle cables, earphones, or charging leads for tidy storage.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: 'Not critical; each wrap is 3 cm wide.',
  finishedSize: 'Set of 4, each 3 cm wide x 12 cm circumference.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['cable organiser crochet', 'cable wrap crochet', 'wire tidy crochet'],
  glossaryTerms: [
    { slug: 'dc-ring-cable', term: 'Dc ring', definition: 'A short tube of dc in the round. The cable wrap snaps closed when the button passes through the button loop.' },
    { slug: 'button-loop-cable', term: 'Button loop', definition: 'A small chain loop worked at one edge of the ring. Passes over the button on the other edge to close the wrap around the cable bundle.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet cable tidies are a modern practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each wrap is a flat '), gt('dc-ring-cable', 'dc ring'), t(' 3 cm wide. A '), gt('button-loop-cable', 'button loop'), t(' on one edge passes over a button on the other to close it. Coil the cable, wrap the ring around it, and button closed.')),
      p(t('Make in four colours to colour-code different cables. Total yarn around 20 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn, 4 colours', qty: '5 m each' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '1 cm buttons', qty: '4' },
      ]),
      h2('Wrap (make 4)'),
      p(t('Chain 13, sl st to join ring. Work 6 rounds of dc. On final round: at one point, ch 5 and sl st back to form '), gt('button-loop-cable', 'button loop'), t('. Fasten off. Sew button opposite the loop.')),
      h2('What to try next'),
      p(t('The crochet bookmarks set uses the same small functional form at a flat, narrow strip.')),
    ],
  },
},

// ── S3 ── doorknob cover ──────────────────────────────────────────────────────
{
  slug: 'doorknob-cover',
  title: 'Doorknob cover',
  subtitle: 'A small crochet cover for a round door knob, for grip or decoration.',
  excerpt: 'A small round dc cover that stretches over a round doorknob. Adds grip and softness, and can serve as a door bumper to protect walls.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: 'Fits a standard round doorknob, 5 cm diameter.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-dc2tog'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['doorknob cover crochet', 'door knob cover', 'door bumper crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-knob', term: 'Magic ring', definition: 'An adjustable loop start. Used at the front of the doorknob cover for a neat closed centre.' },
    { slug: 'dc2tog-knob', term: 'Dc2tog', definition: 'Double crochet two together. Used to close the cover around the back of the doorknob after fitting.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet doorknob covers are a small modern practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a small ball shape from a '), gt('magic-ring-knob', 'magic ring'), t('. Expand to the knob diameter, then rise straight for the knob depth, then decrease with '), gt('dc2tog-knob', 'dc2tog'), t(' to close around the back of the knob.')),
      p(t('Use a DK yarn with some elasticity to allow the cover to stretch over the knob. Total yarn around 20 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn (with stretch)', qty: '20 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Cover'),
      p(t('Round 1: '), gt('magic-ring-knob', 'magic ring'), t(', 6 dc. Rounds 2 to 4: increase to 18 dc. Rounds 5 to 7: dc even. Rounds 8 to 10: '), gt('dc2tog-knob', 'dc2tog'), t(' reduce to 9 dc. Pull yarn through last sts, pull tight.')),
      h2('Fitting'),
      p(t('Stretch the cover over the doorknob from the front. The elastic DC will grip the knob without a fastening.')),
      h2('What to try next'),
      p(t('The storage pot cover uses the same fitted sleeve approach for a kitchen surface.')),
    ],
  },
},

]

// ── write files ───────────────────────────────────────────────────────────────
for (const pat of PATTERNS) {
  const out = {
    slug: pat.slug,
    title: pat.title,
    subtitle: pat.subtitle,
    excerpt: pat.excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'homewares',
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
