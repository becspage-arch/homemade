/**
 * Generator: D-Homewares Batch 12 -- Decorative/seasonal 19-30 + Kitchen 1-3
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-homewares-batch12.ts
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

// ── D19 ── easter egg covers ──────────────────────────────────────────────────
{
  slug: 'crochet-easter-egg-covers',
  title: 'Crochet easter egg covers',
  subtitle: 'A set of six small crochet egg covers to dress plain wooden or plastic eggs.',
  excerpt: 'Six small crochet sleeves in different stitch patterns cover wooden or plastic 6 cm Easter eggs for a table display or Easter tree.',
  difficulty: 'BEGINNER',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-2-5mm',
  gauge: '24 dc x 28 rounds = 10 x 10 cm in fingering on a 2.5 mm hook.',
  finishedSize: 'Set of 6, each covering a 6 cm egg.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-dc2tog', 'crochet-shell'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['crochet egg covers', 'easter egg crochet', 'egg cosy crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-egg', term: 'Magic ring', definition: 'An adjustable loop start for circular work. Used at the pointed tip of each egg cover.' },
    { slug: 'dc2tog-egg', term: 'Dc2tog', definition: 'Double crochet two together. Used to narrow the cover toward the tip of the egg.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet egg covers are a popular modern seasonal craft project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each cover starts at the narrow top of the egg from a '), gt('magic-ring-egg', 'magic ring'), t(' and expands in dc to the widest point, then stays even for a few rounds before narrowing again. Use '), gt('dc2tog-egg', 'dc2tog'), t(' decreases to close the bottom.')),
      p(t('Make six covers in different pastel colours, or in the same colour with different stitch details (plain, shell, rib). Slip each over an egg. Total yarn around 60 m across six colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn in 6 colours', qty: '10 m each' },
        { name: '2.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '6 cm wooden or plastic eggs', qty: '6' },
      ]),
      h2('Cover (make 6)'),
      p(t('Round 1: magic ring, 4 dc. Round 2: 2 dc in each (8 dc). Rounds 3 to 5: increase to 18 dc. Rounds 6 to 9: dc even. Rounds 10 to 12: '), gt('dc2tog-egg', 'dc2tog'), t(' to close. Insert egg at round 9 before fully closing.')),
      h2('What to try next'),
      p(t('The crochet pumpkin uses the same in-the-round shaping for a larger seasonal piece.')),
    ],
  },
},

// ── D20 ── christmas stocking ─────────────────────────────────────────────────
{
  slug: 'crochet-christmas-stocking',
  title: 'Crochet christmas stocking',
  subtitle: 'A 30 cm striped christmas stocking worked in the round in double crochet.',
  excerpt: 'A classic 30 cm christmas stocking in double crochet stripes, worked in the round from the cuff down. Large enough to fill with small gifts.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rounds = 10 x 10 cm in aran on a 5 mm hook.',
  finishedSize: '30 cm tall christmas stocking.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-magic-ring'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet christmas stocking', 'crochet stocking', 'holiday stocking crochet'],
  glossaryTerms: [
    { slug: 'heel-turn-stocking', term: 'Heel turn', definition: 'A short-row section worked back and forth to create the angled shape at the back of the foot. Worked in rows then rejoined to the round.' },
    { slug: 'cuff-stocking', term: 'Cuff', definition: 'The open top of the stocking. Worked as a ribbed or plain band before the leg section, often in a contrast colour.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet christmas stockings are a popular modern seasonal project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work the '), gt('cuff-stocking', 'cuff'), t(' in rows of dc rib, then join and work the leg in dc rounds with stripe changes. Shape the '), gt('heel-turn-stocking', 'heel turn'), t(' in short rows, then continue the foot in the round. Close the toe with dc2tog decreases.')),
      p(t('Use red and white for a classic look or any two colours. Hang the loop at the cuff from a mantel hook. Total yarn around 220 m across two colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn, colour A (main)', qty: '160 m' },
        { name: 'Aran yarn, colour B (contrast)', qty: '60 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Cuff'),
      p(t('Chain 45, sl st to join. Work 6 rounds of 1x1 rib in colour B. Join colour A.')),
      h2('Leg'),
      p(t('Work dc rounds in colour A for 15 cm. Work '), gt('heel-turn-stocking', 'heel turn'), t(' over half the sts in short rows. Rejoin and work foot for 10 cm.')),
      h2('Toe'),
      p(t('Dc2tog at each end of the foot tube every round until 8 sts remain. Thread yarn through sts and pull to close.')),
      h2('What to try next'),
      p(t('The advent wreath cover uses the same seasonal approach for a different Christmas decoration.')),
    ],
  },
},

// ── D21 ── herb pot trio ──────────────────────────────────────────────────────
{
  slug: 'herb-pot-trio-covers',
  title: 'Herb pot trio covers',
  subtitle: 'A matching set of three crochet pot covers for a trio of small herb pots.',
  excerpt: 'Three small 8 cm pot covers in a matching but distinct style: one plain, one striped, one with a bobble row. Perfect for a kitchen windowsill herb trio.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '3 covers, each fitting an 8 cm pot.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-bobble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk', 'crochet-bobble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['herb pot cover crochet', 'pot trio covers', 'kitchen herb pot crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-herb', term: 'Magic ring', definition: 'An adjustable loop start for the base of each pot cover circle.' },
    { slug: 'bobble-herb', term: 'Bobble row', definition: 'A single round where a 3-treble bobble is placed every 4 stitches around the pot cover. Adds a decorative relief texture.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet plant pot covers are a popular modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('All three covers start from a flat '), gt('magic-ring-herb', 'magic ring'), t(' base, then rise straight up in dc in the round. Pot 1 is plain. Pot 2 adds a stripe every 3 rounds. Pot 3 has a '), gt('bobble-herb', 'bobble row'), t(' at the midpoint.')),
      p(t('Use three colours that work well together. Total yarn around 120 m across three colours. Each cover fits any 8 cm diameter pot.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn, colour A', qty: '40 m' },
        { name: 'DK yarn, colour B', qty: '40 m' },
        { name: 'DK yarn, colour C', qty: '40 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '8 cm pots', qty: '3' },
      ]),
      h2('Base (all 3)'),
      p(t('Round 1: '), gt('magic-ring-herb', 'magic ring'), t(', 6 dc. Rounds 2 to 4: increase to 24 dc. BLO fold round.')),
      h2('Sides'),
      p(t('Work dc in spiral. Pot 1: plain to 8 cm. Pot 2: change colour every 3 rounds to 8 cm. Pot 3: plain for 3 rounds, '), gt('bobble-herb', 'bobble round'), t(', plain to 8 cm. Sl st. Fasten off.')),
      h2('What to try next'),
      p(t('The storage pot cover uses a rib stitch for a stretch-fit variation of the same project.')),
    ],
  },
},

// ── D22 ── bookmarks set ──────────────────────────────────────────────────────
{
  slug: 'crochet-bookmarks-set',
  title: 'Crochet bookmarks set',
  subtitle: 'A set of four slim crochet bookmarks with small decorative ends.',
  excerpt: 'Four 16 cm slim dc bookmarks, each ending in a different small motif: a circle, a leaf, a star, and a simple tassel.',
  difficulty: 'BEGINNER',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-2-5mm',
  gauge: 'Not critical; bookmark is 1.5 cm wide.',
  finishedSize: 'Set of 4, each 16 cm long.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch', 'crochet-magic-ring'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-magic-ring'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet bookmark', 'crochet bookmarks set', 'book marker crochet'],
  glossaryTerms: [
    { slug: 'slip-cord-bk', term: 'Slip stitch cord', definition: 'A very narrow strip of dc or slip stitches along a chain foundation. Used as the main body of each bookmark.' },
    { slug: 'end-motif', term: 'End motif', definition: 'A small shaped piece attached to one end of the bookmark. Acts as a stopper and decoration.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet bookmarks are a classic project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each bookmark is a '), gt('slip-cord-bk', 'slim dc strip'), t(' 16 cm long. The '), gt('end-motif', 'end motif'), t(' is made separately and sewn to the bottom: a small flat circle (6 rounds of dc), a leaf, a star, or a yarn tassel.')),
      p(t('Fingering yarn gives a flat, flexible bookmark that does not bulk the pages. Total yarn around 30 m across four colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn, 4 colours', qty: '8 m each' },
        { name: '2.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Bookmark body (make 4)'),
      p(t('Chain 4. Work '), gt('slip-cord-bk', 'dc strip'), t(': dc in 2nd ch from hook, dc in each ch, ch 1, turn. Continue dc rows until strip is 16 cm (2 sts wide). Fasten off.')),
      h2('End motifs'),
      p(t('Circle: magic ring, 6 dc, 2 dc each round to 2 cm. Leaf: ch 8, work both sides of spine. Star: 5-point star from ring. Tassel: cut 8 cm lengths and knot at end of strip.')),
      h2('Assembly'),
      p(t('Sew an '), gt('end-motif', 'end motif'), t(' to one end of each bookmark strip. Weave in all ends.')),
      h2('What to try next'),
      p(t('The snowflake bunting uses the same small motif approach on a display cord.')),
    ],
  },
},

// ── D23 ── decorative cushion buttons ─────────────────────────────────────────
{
  slug: 'decorative-crochet-buttons',
  title: 'Decorative crochet buttons',
  subtitle: 'A set of six large 3 cm crochet buttons to cover and replace cushion or garment buttons.',
  excerpt: 'Six large covered buttons worked over button forms in double crochet. Use to replace or decorate cushion fastenings, bags, or garments.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-3-5mm',
  gauge: 'Not critical; tension should be tight to cover the button form.',
  finishedSize: '3 cm diameter each, set of 6.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-dc2tog'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk', 'crochet-dc2tog'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['crochet button covers', 'crochet buttons set', 'covered buttons crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-btn', term: 'Magic ring', definition: 'An adjustable loop start. Pulled tight, it leaves no hole at the centre of each button.' },
    { slug: 'dc2tog-btn', term: 'Dc2tog', definition: 'Double crochet two together. Used to close the button cover around the form after inserting it.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Covered button techniques appear in Victorian needlework. Modern crochet button forms are a recent adaptation.',
  body: {
    type: 'doc', content: [
      p(t('Each button starts from a '), gt('magic-ring-btn', 'magic ring'), t(' and grows to 3 cm, then decreases with '), gt('dc2tog-btn', 'dc2tog'), t(' as the button form is inserted. Pull tight and secure the yarn to hold the form inside.')),
      p(t('Use a smaller hook than usual for DK yarn to keep the fabric tight so the button form does not show through. Total yarn around 20 m across one or two colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '20 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '3 cm button forms', qty: '6' },
      ]),
      h2('Button (make 6)'),
      p(t('Round 1: '), gt('magic-ring-btn', 'magic ring'), t(', 6 dc. Round 2: 2 dc in each (12 dc). Round 3: * 2 dc, 1 dc; rep (18 dc). Insert button form. Round 4: * '), gt('dc2tog-btn', 'dc2tog'), t(', 1 dc; rep. Round 5: dc2tog around. Thread yarn through last 6 sts, pull tight.')),
      h2('Finishing'),
      p(t('Leave a long yarn tail to sew each button to the cushion or garment.')),
      h2('What to try next'),
      p(t('The button-fastening cushion cover uses buttons like these as functional fastenings.')),
    ],
  },
},

// ── D24 ── christmas tree skirt ───────────────────────────────────────────────
{
  slug: 'crochet-tree-skirt',
  title: 'Crochet tree skirt',
  subtitle: 'A 60 cm round christmas tree skirt worked in granny squares joined into a flat circle.',
  excerpt: 'Sixteen granny squares joined in a fan arrangement form a 60 cm flat tree skirt with an opening at the back. Works for a standard indoor christmas tree.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '1 granny square = 15 x 15 cm in aran on a 5 mm hook.',
  finishedSize: '60 cm diameter tree skirt.',
  stitchSlugs: ['crochet-chain', 'crochet-slip-stitch', 'crochet-double-uk', 'crochet-granny-cluster', 'crochet-whipstitch-join'],
  techniqueSlugs: ['crochet-granny-cluster', 'crochet-whipstitch-join'],
  criticalTechniques: ['crochet-granny-cluster'],
  aliases: ['crochet christmas tree skirt', 'tree skirt granny squares', 'christmas skirt crochet'],
  glossaryTerms: [
    { slug: 'granny-treeskirt', term: 'Granny square', definition: 'A square motif built from granny clusters worked from a central ring outward. The repeating unit of the tree skirt.' },
    { slug: 'ws-join-treeskirt', term: 'Whipstitch join', definition: 'A seam worked through matching edges of two squares. Creates a visible ridge join that suits the rustic look of a tree skirt.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Granny square tree skirts are a popular modern crochet project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Make 16 '), gt('granny-treeskirt', 'granny squares'), t(' at 15 cm each. Arrange in a fan: a centre row of 4 joined squares, with rows of 5, 5, and 2 joined outward. '), gt('ws-join-treeskirt', 'Whipstitch join'), t(' all squares together. Add a narrow dc edging round the outer and inner circles.')),
      p(t('The back opening is left unseamed. Use two or three colours to give a festive look. Total yarn around 600 m across two or three colours.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn, main colour', qty: '400 m' },
        { name: 'Aran yarn, contrast colour', qty: '200 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Squares (make 16)'),
      p(t('Each '), gt('granny-treeskirt', 'granny square'), t(': chain 4, sl st to ring, work 3 rounds of granny clusters to 15 cm.')),
      h2('Assembly'),
      p(t('Lay out squares in fan arrangement. '), gt('ws-join-treeskirt', 'Whipstitch join'), t(' squares edge to edge, leaving the back seam open. Work a dc border around outer and inner edges.')),
      h2('What to try next'),
      p(t('The granny square cushion cover uses the same squares on a smaller scale for a different project.')),
    ],
  },
},

// ── D25 ── doorstep mat ───────────────────────────────────────────────────────
{
  slug: 'oval-doorstep-mat',
  title: 'Oval doorstep mat',
  subtitle: 'A 60 x 40 cm oval doorstep mat crocheted in chunky cotton rope.',
  excerpt: 'A flat oval mat in chunky cotton rope worked from a foundation chain. Durable and machine-washable at a practical 60 x 40 cm doorstep size.',
  difficulty: 'BEGINNER',
  yarnWeight: 'super-chunky',
  hook: 'crochet-hook-10-0mm',
  gauge: '8 dc x 9 rounds = 10 x 10 cm in super-chunky rope on a 10 mm hook.',
  finishedSize: '60 x 40 cm oval mat.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet door mat', 'oval rag mat', 'doorstep mat crochet'],
  glossaryTerms: [
    { slug: 'oval-base-mat', term: 'Oval base', definition: 'A flat oval worked by chaining a foundation, then crocheting along both sides of the chain with curved ends. Grows outward round by round.' },
    { slug: 'dc-mat', term: 'Double crochet', definition: 'The base stitch throughout the mat. Working in a tight tension with chunky rope gives a firm, flat fabric.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Oval crocheted mats have Victorian precedents. This chunky rope application is a modern adaptation.',
  body: {
    type: 'doc', content: [
      p(t('The mat starts with an '), gt('oval-base-mat', 'oval base'), t(' worked along a 30 cm foundation chain. Each round adds 8 '), gt('dc-mat', 'double crochets'), t(' at the two curved ends, growing the oval to 60 x 40 cm over 5 rounds.')),
      p(t('Use 8 to 10 mm cotton or recycled cotton rope. The rope weight gives the mat enough body to stay flat. Total yarn around 400 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Super-chunky cotton rope, 8 to 10 mm', qty: '400 m' },
        { name: '10 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle (large eye)', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Base'),
      p(t('Chain 31 cm. Round 1: dc along both sides, 3 dc at each short end (about 50 dc). Rounds 2 to 5: add 8 dc per round at both curved ends. By round 5 the mat is 60 x 40 cm.')),
      h2('Finishing'),
      p(t('Sl st to close final round. Fasten off. Weave in ends firmly. Lay flat and allow to settle. Machine wash 40 degrees.')),
      h2('What to try next'),
      p(t('The laundry basket uses the same oval foundation method at a much taller scale.')),
    ],
  },
},

// ── D26 ── napkin rings ───────────────────────────────────────────────────────
{
  slug: 'crochet-napkin-rings',
  title: 'Crochet napkin rings',
  subtitle: 'A set of six small crochet rings for rolling cloth napkins.',
  excerpt: 'Six small tubular napkin rings in double crochet, each 5 cm wide. One colour or a set of six different colours for an informal table setting.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rounds = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '6 cm diameter x 5 cm wide, set of 6.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet napkin rings', 'napkin ring set crochet', 'table ring crochet'],
  glossaryTerms: [
    { slug: 'dc-ring-napkin', term: 'Dc ring', definition: 'A tube of double crochet worked in the round from a joined foundation chain. Sized to slide over a rolled cloth napkin.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet napkin rings are a traditional project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each napkin ring is a short '), gt('dc-ring-napkin', 'dc ring'), t(' worked in the round. Foundation chain 36 sts joined into a ring. Work 10 rounds of dc to reach 5 cm width. Sl st to close. Fasten off.')),
      p(t('Use a single neutral colour for a formal table, or six bright shades for casual meals so each person has their own ring. Total yarn around 80 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn, one or six colours', qty: '80 m total' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Ring (make 6)'),
      p(t('Chain 36, sl st to join. Work 10 rounds '), gt('dc-ring-napkin', 'dc in the round'), t('. Sl st. Fasten off. Weave in ends.')),
      h2('What to try next'),
      p(t('The round coaster set uses the same dc-in-the-round technique in a flat circle format.')),
    ],
  },
},

// ── D27 ── cushion tassels ────────────────────────────────────────────────────
{
  slug: 'crochet-tassel-set',
  title: 'Crochet tassel set',
  subtitle: 'A set of eight large crocheted tassels for cushions, bags, or keyrings.',
  excerpt: 'Eight large tassels with crocheted heads in aran yarn. Hang from cushion corners, zip pulls, bags, or bookmarks.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: 'Not critical for tassel heads.',
  finishedSize: 'Set of 8, each 10 cm with head.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-dc2tog'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-magic-ring'],
  aliases: ['crochet tassel', 'cushion tassels', 'tassel keyring crochet'],
  glossaryTerms: [
    { slug: 'tassel-head', term: 'Tassel head', definition: 'A small crochet ball worked over a core of yarn wraps. Holds the hanging strands in place and provides an attachment loop.' },
    { slug: 'tassel-skirt', term: 'Tassel skirt', definition: 'The hanging yarn strands below the head. Cut to equal length after attaching.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet tassel heads are a modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each tassel has a crochet '), gt('tassel-head', 'head'), t(' and a '), gt('tassel-skirt', 'skirt'), t(' of 20 cm yarn lengths. Wind 30 strands around a 10 cm card, cut at one end, fold at the other. Wrap the fold inside the crochet head ball.')),
      p(t('Make all eight in the same colour or vary the shades. Total yarn around 200 m across all eight including skirt lengths.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Aran yarn', qty: '200 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: '10 cm piece of card for winding', qty: '1' },
      ]),
      h2('Tassel head (make 8)'),
      p(t('Round 1: magic ring, 6 dc. Round 2: 2 dc each. Round 3: dc even. Prepare '), gt('tassel-skirt', 'skirt'), t(' bundle: wind 30 yarn strands around card, cut at bottom, fold. Insert folded bundle through the crochet head. Round 4: dc2tog each st to close around bundle. Pull tight. Leave long tail loop for hanging.')),
      h2('Finishing'),
      p(t('Trim '), gt('tassel-skirt', 'tassel skirt'), t(' to an even 8 cm below the head.')),
      h2('What to try next'),
      p(t('The boho tassel cushion cover uses a simpler knotted fringe to the same effect.')),
    ],
  },
},

// ── D28 ── picture cord hanger ────────────────────────────────────────────────
{
  slug: 'crochet-picture-cord-hanger',
  title: 'Crochet picture cord hanger',
  subtitle: 'A decorative crocheted hanging cord for framed prints or small mirrors.',
  excerpt: 'A crocheted rope cord of twisted half treble columns for hanging a framed print or small mirror. Two end loops slip over picture hooks.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: 'Not critical; cord is 1.5 cm thick.',
  finishedSize: '60 cm long cord with two end loops.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-half-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-half-treble'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet picture hanger', 'picture cord crochet', 'hanging cord crochet'],
  glossaryTerms: [
    { slug: 'htr-cord', term: 'Half treble cord', definition: 'A row of half treble stitches 3 sts wide folded and seamed into a round cord. Thicker and firmer than a chain cord.' },
    { slug: 'end-loop-cord', term: 'End loop', definition: 'A small ring of chain or dc stitches at each end of the cord that slips over a picture hook or nail.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Decorative picture cords are a modern home craft project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a 3-stitch wide strip of '), gt('htr-cord', 'half treble cord'), t(' to 60 cm, then fold and seam the long edges to form a round cord. Make a small '), gt('end-loop-cord', 'end loop'), t(' at each end.')),
      p(t('Chunky yarn gives a cord substantial enough to look good against a wall. Total yarn around 80 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky yarn, natural or gold', qty: '80 m' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Cord strip'),
      p(t('Chain 4. Row 1: htr in 3rd ch from hook, htr in next ch (2 sts). Continue htr rows until strip is 60 cm.')),
      h2('Seaming'),
      p(t('Fold strip in half lengthways. Whipstitch the long edge to close into a round '), gt('htr-cord', 'cord'), t('.')),
      h2('End loops'),
      p(t('At each end: ch 8, sl st back to the same point to form an '), gt('end-loop-cord', 'end loop'), t('. Fasten off. Weave in ends.')),
      h2('What to try next'),
      p(t('The crochet wall hanging uses a dowel mount as an alternative display method.')),
    ],
  },
},

// ── D29 ── herb sachet ────────────────────────────────────────────────────────
{
  slug: 'lavender-herb-sachet',
  title: 'Lavender herb sachet',
  subtitle: 'A small 10 x 8 cm crochet sachet bag filled with dried lavender.',
  excerpt: 'A small open-mesh crochet sachet in fingering yarn holds dried lavender for drawers, wardrobes, or gift bags.',
  difficulty: 'BEGINNER',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-2-5mm',
  gauge: '24 st x 28 rows = 10 x 10 cm in fingering on a 2.5 mm hook.',
  finishedSize: '10 x 8 cm sachet.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-v-stitch', 'crochet-picot'],
  techniqueSlugs: ['crochet-double-uk', 'crochet-v-stitch', 'crochet-picot'],
  criticalTechniques: ['crochet-v-stitch'],
  aliases: ['crochet lavender sachet', 'herb sachet crochet', 'crochet drawstring bag'],
  glossaryTerms: [
    { slug: 'v-stitch-sachet', term: 'V-stitch mesh', definition: 'Rows of alternating dc and chain-1 gaps. Produces an open fabric that lets the lavender scent through while holding the dried flowers inside.' },
    { slug: 'drawstring-sachet', term: 'Drawstring', definition: 'A length of ribbon or crochet cord threaded through the top edge to close the sachet and form a hanging loop.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet sachets for dried herbs have Victorian precedents. No direct source found.',
  body: {
    type: 'doc', content: [
      p(t('Work two small panels in '), gt('v-stitch-sachet', 'V-stitch mesh'), t(' to 10 x 8 cm. Whipstitch three sides. Thread a '), gt('drawstring-sachet', 'drawstring'), t(' through the top edge of both panels. Fill with dried lavender and pull the drawstring closed.')),
      p(t('Fingering yarn in a natural cotton or linen works best as it does not hold the lavender scent. Total yarn around 30 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn, cotton or linen', qty: '30 m' },
        { name: '2.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
        { name: 'Narrow ribbon or cord, 40 cm', qty: '1' },
        { name: 'Dried lavender', qty: 'a handful' },
      ]),
      h2('Panel (make 2)'),
      p(t('Chain 25. Row 1: dc across. Row 2: '), gt('v-stitch-sachet', 'V-stitch'), t(' row: * dc, ch 1, skip 1; rep. Row 3: dc in each ch-1 sp and each dc. Repeat rows 2 and 3 to 8 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Whipstitch three sides. Thread '), gt('drawstring-sachet', 'drawstring ribbon'), t(' through the top edge. Fill with lavender. Pull drawstring closed and tie.')),
      h2('What to try next'),
      p(t('The crochet lantern cover uses the same open V-stitch mesh at a larger scale.')),
    ],
  },
},

// ── D30 ── small tray liner ───────────────────────────────────────────────────
{
  slug: 'crochet-tray-liner',
  title: 'Crochet tray liner',
  subtitle: 'A 30 x 20 cm rectangular crochet mat to line a decorative tray or ottoman top.',
  excerpt: 'A flat 30 x 20 cm dc rectangle in cotton yarn lines a decorative tray or ottoman top. The firm fabric protects surfaces and adds texture.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '18 dc x 20 rows = 10 x 10 cm in cotton DK on a 4 mm hook.',
  finishedSize: '30 x 20 cm tray liner.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet tray liner', 'ottoman tray mat', 'crochet place mat small'],
  glossaryTerms: [
    { slug: 'dc-liner', term: 'Double crochet', definition: 'The base stitch throughout the liner. Insert hook, draw up a loop, yarn over and pull through both loops.' },
    { slug: 'border-liner', term: 'Border round', definition: 'A final round of dc worked all around the four edges to tidy the corners and give the liner a neat frame.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet tray liners are a modern practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a 30 x 20 cm rectangle in plain '), gt('dc-liner', 'double crochet'), t('. A final '), gt('border-liner', 'border round'), t(' around all four edges tidies the corners and matches the liner to the tray size precisely.')),
      p(t('Cotton DK is the best choice: it is flat, firm, and machine-washable. A neutral or natural colour suits most tray colours. Total yarn around 120 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Cotton DK yarn, natural', qty: '120 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Liner'),
      p(t('Chain 55. Work '), gt('dc-liner', 'dc rows'), t(' until piece is 20 cm (about 40 rows). Fasten off.')),
      h2('Border'),
      p(t('Join yarn at a corner. Work '), gt('border-liner', 'border round'), t(': dc along long edge, 3 dc in corner, dc along short edge, 3 dc in corner; rep all 4 sides. Sl st to join. Fasten off.')),
      h2('What to try next'),
      p(t('The shell stitch table runner uses the same flat panel format at a much larger scale.')),
    ],
  },
},

// ── K1 ── oven mitt ───────────────────────────────────────────────────────────
{
  slug: 'double-thick-oven-mitt',
  title: 'Double thick oven mitt',
  subtitle: 'A double-layer 100% cotton oven mitt worked in dc for heat protection.',
  excerpt: 'A double-layer oven mitt worked in two separate dc panels of 100% cotton yarn, seamed together for heat insulation. One size fits most hands.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in cotton aran on a 5 mm hook.',
  finishedSize: '28 x 18 cm oven mitt.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet oven mitt', 'cotton oven glove', 'oven glove crochet'],
  glossaryTerms: [
    { slug: 'dc-cotton-mitt', term: 'Double crochet in cotton', definition: 'Working dc in 100% cotton yarn produces a dense, heat-resistant fabric. Cotton does not melt, making it safe for oven use.' },
    { slug: 'thumb-gusset', term: 'Thumb gusset', definition: 'A small separate dc tube seamed to the side of the mitt to accommodate the thumb.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Double crochet cotton oven mitts are a popular practical modern project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Make two identical mitt shapes in '), gt('dc-cotton-mitt', 'double crochet cotton'), t('. Work the '), gt('thumb-gusset', 'thumb gusset'), t(' as a small separate tube. Seam the two layers with the gusset in place. The double layer provides the heat protection.')),
      p(t('Use 100% cotton yarn only. Acrylic and wool are not safe for oven use. Total yarn around 200 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: '100% cotton aran yarn', qty: '200 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Mitt panel (make 2)'),
      p(t('Chain 27. Work dc rows for 20 cm (hand section). Decrease each side every 2 rows for 8 cm to form the top curve. Fasten off.')),
      h2('Thumb'),
      p(t('Chain 14, sl st to join. Work 10 rounds dc. Fasten off.')),
      h2('Assembly'),
      p(t('Whipstitch thumb to the right side of one panel. Place both panels wrong sides together. Whipstitch all around the outer edge. Work 3 rows of dc rib at the wrist opening.')),
      h2('What to try next'),
      p(t('The pot holder set uses the same double layer method at a simpler square format.')),
    ],
  },
},

// ── K2 ── pot holder set ──────────────────────────────────────────────────────
{
  slug: 'pot-holder-set',
  title: 'Pot holder set',
  subtitle: 'A set of four 18 cm square double-layer cotton pot holders.',
  excerpt: 'Four 18 cm square pot holders in 100% cotton, each made from two dc panels seamed together. Practical, washable, and quick to make.',
  difficulty: 'BEGINNER',
  yarnWeight: 'aran',
  hook: 'crochet-hook-5-0mm',
  gauge: '14 dc x 16 rows = 10 x 10 cm in cotton aran on a 5 mm hook.',
  finishedSize: '18 x 18 cm, set of 4.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet pot holder', 'pot holder set crochet', 'cotton hot pad crochet'],
  glossaryTerms: [
    { slug: 'dc-hot-pad', term: 'Double crochet', definition: 'The base stitch throughout each panel. Cotton double crochet at tight tension gives adequate heat protection for pot handling.' },
    { slug: 'hanging-loop', term: 'Hanging loop', definition: 'A small chain loop added at one corner after assembly. Allows the pot holder to hang from a kitchen hook when not in use.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet pot holders are a long-established practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Each pot holder is two 18 cm dc squares of 100% cotton seamed together. A small '), gt('hanging-loop', 'hanging loop'), t(' at one corner keeps them tidy between uses.')),
      p(t('Use only 100% cotton. Choose a range of colours for the set. Total yarn around 280 m across four holders.')),
      h2('What you need'),
      supplies('Materials', [
        { name: '100% cotton aran yarn', qty: '280 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Square panel (make 8, two per holder)'),
      p(t('Chain 27. Work '), gt('dc-hot-pad', 'dc rows'), t(' until square is 18 cm. Fasten off.')),
      h2('Assembly'),
      p(t('Place two panels wrong sides together. Whipstitch three sides. Tuck in any tails. Whipstitch remaining side. Add '), gt('hanging-loop', 'hanging loop'), t(': ch 12, sl st to corner. Fasten off.')),
      h2('What to try next'),
      p(t('The double thick oven mitt uses the same two-layer cotton approach at a larger scale.')),
    ],
  },
},

// ── K3 ── market shopping bag ─────────────────────────────────────────────────
{
  slug: 'market-shopper-tote',
  title: 'Market shopper tote',
  subtitle: 'A 30 x 35 cm crochet tote bag for shopping or farmers market use.',
  excerpt: 'A sturdy 30 x 35 cm tote bag crocheted in the round in cotton rope. Two long handles allow it to hang from the shoulder.',
  difficulty: 'BEGINNER',
  yarnWeight: 'chunky',
  hook: 'crochet-hook-6-0mm',
  gauge: '11 dc x 13 rounds = 10 x 10 cm in chunky cotton on a 6 mm hook.',
  finishedSize: '30 x 35 cm bag body, 60 cm handles.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-magic-ring', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-magic-ring', 'crochet-double-uk'],
  criticalTechniques: ['crochet-double-uk'],
  aliases: ['crochet tote bag', 'market bag crochet', 'shopping bag crochet'],
  glossaryTerms: [
    { slug: 'magic-ring-bag', term: 'Magic ring', definition: 'An adjustable loop start for the circular base of the bag. Pulled closed, it leaves no hole at the centre.' },
    { slug: 'dc-handles', term: 'Bag handles', definition: 'Two long strips of dc seamed into tubes, attached across the top opening on opposite sides. Each handle is 60 cm long.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Crochet tote bags are a popular practical project. No direct public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Work a 30 cm circular base from a '), gt('magic-ring-bag', 'magic ring'), t(', then continue straight up in dc rounds for 35 cm. Make two '), gt('dc-handles', 'bag handles'), t(' and sew them to the top edge on opposite sides.')),
      p(t('Chunky cotton rope makes a bag strong enough for shopping. Total yarn around 400 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Chunky cotton yarn or rope', qty: '400 m' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Base'),
      p(t('Round 1: '), gt('magic-ring-bag', 'magic ring'), t(', 6 dc. Increase 6 dc per round until base is 30 cm (about 10 rounds). BLO fold round.')),
      h2('Sides'),
      p(t('Work dc in spiral for 35 cm (about 45 rounds). Sl st to close. Fasten off.')),
      h2('Handles (make 2)'),
      p(t('Chain 5. Work dc rows for 60 cm. Seam long edge into a tube. Sew each end of each '), gt('dc-handles', 'handle'), t(' firmly to the inside of the bag top, 8 cm from the side edges.')),
      h2('What to try next'),
      p(t('The laundry basket uses the same base-up circular construction at a much larger scale.')),
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
