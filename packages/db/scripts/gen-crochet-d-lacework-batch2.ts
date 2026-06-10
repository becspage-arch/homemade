/**
 * Generator: D-Lacework Batch 2 -- L11-L20 lace shawls part 2 (10 patterns)
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-lacework-batch2.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'briefs-crochet-d-lacework')
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

// ── L11 ── boho lace shawl ───────────────────────────────────────────────────
{
  slug: 'boho-lace-shawl-crochet',
  title: 'Boho lace shawl',
  subtitle: 'An open mesh crescent shawl in sport yarn with knotted fringe.',
  excerpt: 'Relaxed and roomy, this boho shawl works a simple open chain-space mesh in sport yarn then finishes with knotted fringe along the lower edge.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '14 mesh squares x 8 rows = 10 x 10 cm in sport on a 4 mm hook.',
  finishedSize: '175 x 60 cm including fringe.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-chain-space-mesh', 'crochet-fringe', 'crochet-increases'],
  criticalTechniques: ['crochet-chain-space-mesh', 'crochet-fringe'],
  aliases: ['boho crochet shawl', 'open mesh shawl', 'fringed crochet shawl', 'bohemian shawl crochet'],
  glossaryTerms: [
    { slug: 'chain-space-mesh-boho', term: 'Chain-space mesh', definition: 'A regular grid of double crochet stitches separated by chain loops. The loops form the open holes that give the mesh its airy look.' },
    { slug: 'knotted-fringe', term: 'Knotted fringe', definition: 'Cut lengths of yarn folded through the foundation loops of the lower edge and tied with a simple overhand knot to form a decorative fringe.' },
    { slug: 'boho-crescent', term: 'Crescent shaping', definition: 'A shawl shape that curves like a crescent moon. Extra increases at the centre back push the middle out further than the ends.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Open mesh shawls with fringe are a widely published modern technique. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The boho shawl grows from a '), gt('boho-crescent', 'crescent'), t(' spine outward. You work a '), gt('chain-space-mesh-boho', 'chain-space mesh'), t(' across each row, adding one repeat at each end every right-side row until the shawl reaches the required width. A row of dc along the lower edge anchors the '), gt('knotted-fringe', 'knotted fringe'), t('.')),
      p(t('Use a plant-fibre or plant-blend sport yarn. Drape matters more than stitch definition here. Allow around 400 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport yarn', qty: '400 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 10. Work 1 dc in 4th ch from hook to set the first mesh square. Continue '), gt('chain-space-mesh-boho', 'chain-space mesh'), t(' to end of foundation.')),
      h2('Body'),
      p(t('Row 1 (RS): Chain 5, turn. Work one extra mesh repeat at each end to increase the width. Repeat for the body rows until the piece spans 140 cm across the top edge.')),
      h2('Lower edge'),
      p(t('Work 1 row of dc along the entire lower edge, placing 1 dc into each ch-1 space. This gives firm loops for the '), gt('knotted-fringe', 'fringe'), t('.')),
      h2('Fringe'),
      p(t('Cut 35 cm lengths. Fold two together, push the folded loop through a dc, pull ends through and tighten the '), gt('knotted-fringe', 'knot'), t('. Repeat across the full lower edge. Trim to an even 15 cm.')),
      h2('What to try next'),
      p(t('The summer lace shawl uses the same mesh grid in cotton for warm-weather wear.')),
    ],
  },
},

// ── L12 ── evening wrap shawl ────────────────────────────────────────────────
{
  slug: 'evening-wrap-shawl-crochet',
  title: 'Evening wrap shawl',
  subtitle: 'A rectangular shell-stitch shawl in fingering yarn for evening wear.',
  excerpt: 'Elegant shell stitch fans across a long rectangle of fingering yarn to make a draping evening wrap. A dc edging and a turned picot border finish the piece.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '2 shell repeats x 10 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: '180 x 55 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-shell-stitch', 'crochet-picot-edging', 'crochet-rectangular-shawl'],
  criticalTechniques: ['crochet-shell-stitch', 'crochet-picot-edging'],
  aliases: ['evening wrap crochet', 'shell stitch shawl', 'dressy crochet wrap', 'formal crochet shawl'],
  glossaryTerms: [
    { slug: 'shell-stitch-evening', term: 'Shell stitch', definition: 'Five or more trebles worked into the same stitch or space. The stitches fan out to form a fan or shell shape across the fabric.' },
    { slug: 'picot-border-evening', term: 'Picot border', definition: 'A decorative edging of small loops formed by chaining 3 and slip stitching back. Each picot stands out from the edge like a small point.' },
    { slug: 'dc-turning-chain', term: 'Turning chain', definition: 'The chain or chains worked at the start of a row to bring the yarn to the correct height for the first stitch.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Shell stitch rectangles for eveningwear are a well-documented modern approach. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The wrap is a straight rectangle in '), gt('shell-stitch-evening', 'shell stitch'), t('. The turning chain method matters: use a '), gt('dc-turning-chain', 'turning chain'), t(' of 4 and count it as the first treble so shells line up cleanly.')),
      p(t('Choose a silk-blend or wool-blend fingering yarn for evening shine and drape. Allow around 600 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn', qty: '600 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain a multiple of 8 plus 4. For 55 cm width, that is around 190 stitches in fingering on a 3.5 mm hook. Check your gauge swatch first.')),
      h2('Body'),
      p(t('Row 1 (RS): 4 tr in 5th ch from hook (first shell), skip 3, dc in next, skip 3, 5 tr in next. Repeat to end. Continue in '), gt('shell-stitch-evening', 'shell stitch'), t(' rows for 180 cm.')),
      h2('Picot border'),
      p(t('Work 1 round of dc around all edges, then a second round of '), gt('picot-border-evening', 'picot'), t(' across the long sides. Place one picot after every third dc.')),
      h2('What to try next'),
      p(t('The bridal lace shawl uses fine lace-weight yarn for a more delicate result.')),
    ],
  },
},

// ── L13 ── summer lace shawl ─────────────────────────────────────────────────
{
  slug: 'summer-lace-shawl-crochet',
  title: 'Summer lace shawl',
  subtitle: 'An airy cotton mesh shawl in sport-weight cotton for warm days.',
  excerpt: 'A simple mesh grid in sport-weight cotton makes a lightweight shawl that packs small and blocks flat. Good for a beach bag or summer travel.',
  difficulty: 'BEGINNER',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '12 mesh squares x 9 rows = 10 x 10 cm in sport cotton on a 4 mm hook.',
  finishedSize: '160 x 55 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-chain-space-mesh', 'crochet-blocking', 'crochet-rectangular-shawl'],
  criticalTechniques: ['crochet-chain-space-mesh', 'crochet-blocking'],
  aliases: ['summer crochet shawl', 'cotton lace shawl', 'beach shawl crochet', 'lightweight crochet wrap'],
  glossaryTerms: [
    { slug: 'mesh-grid-summer', term: 'Mesh grid', definition: 'A repeating pattern of 1 dc, chain 1, skip 1. Every cell is the same size, so errors are easy to spot and fix.' },
    { slug: 'wet-block-cotton', term: 'Wet blocking', definition: 'Soaking the finished piece in cool water, squeezing gently, then pinning it to a foam mat or towel until dry. Cotton responds well and the cells open evenly.' },
    { slug: 'summer-selvage', term: 'Selvage stitch', definition: 'The first and last dc of every row, worked without a ch-1. These create a firm, straight edge that sits flat without rolling.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cotton mesh shawls are a widely published warm-weather project. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('A '), gt('mesh-grid-summer', 'mesh grid'), t(' is the simplest lace structure: 1 dc, ch 1, skip 1, repeated across every row. The '), gt('summer-selvage', 'selvage stitch'), t(' at each end keeps the sides straight. '), gt('wet-block-cotton', 'Wet blocking'), t(' is the finishing step that opens the cells and gives the shawl its drape.')),
      p(t('Pure cotton or linen-cotton blend works best. Acrylic will not block flat. Allow around 350 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport cotton or linen-cotton', qty: '350 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 195 (a multiple of 2 plus 3 for turning). Row 1: dc in 4th ch, ch 1, skip 1, dc across keeping '), gt('summer-selvage', 'selvage stitches'), t(' at each end.')),
      h2('Body'),
      p(t('Repeat '), gt('mesh-grid-summer', 'mesh grid'), t(' rows, turning with ch 3 each time, until work measures 55 cm wide. Fasten off.')),
      h2('Blocking'),
      p(t('Soak, press out water, pin to shape on a mat. Leave to dry fully before removing pins. '), gt('wet-block-cotton', 'Wet blocking'), t(' may take several hours.')),
      h2('What to try next'),
      p(t('The cotton beach shawl uses larger chain spaces for a more open, quicker mesh.')),
    ],
  },
},

// ── L14 ── vintage lace shawl ────────────────────────────────────────────────
{
  slug: 'vintage-lace-shawl-crochet',
  title: 'Vintage lace shawl',
  subtitle: 'A cluster-lace rectangular shawl in fingering yarn with a vintage feel.',
  excerpt: 'Staggered clusters of trebles paired with open chain arches give this rectangular shawl a vintage lace texture. A simple chain-loop edging adds the final detail.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '3 cluster repeats x 9 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: '170 x 52 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-cluster-stitch', 'crochet-chain-loop-edging', 'crochet-rectangular-shawl'],
  criticalTechniques: ['crochet-cluster-stitch', 'crochet-chain-loop-edging'],
  aliases: ['vintage crochet shawl', 'cluster lace shawl', 'old-fashioned crochet shawl', 'heirloom crochet shawl'],
  glossaryTerms: [
    { slug: 'treble-cluster', term: 'Treble cluster', definition: 'Three or four trebles worked into the same space, each left unfinished until the last step when all loops are closed together. The result is a single raised point.' },
    { slug: 'chain-arch-vintage', term: 'Chain arch', definition: 'A chain of 4 or 5 bridging two cluster points. The arch creates the open space between clusters that gives vintage lace its characteristic airiness.' },
    { slug: 'chain-loop-edge', term: 'Chain-loop edging', definition: 'A border of evenly spaced chain loops, each joined to the edge with a slip stitch. A simple but visually effective finishing row.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cluster lace with chain arches draws on 19th and early 20th century thread crochet traditions. No single public-domain source used directly.',
  body: {
    type: 'doc', content: [
      p(t('The vintage shawl alternates rows of '), gt('treble-cluster', 'treble clusters'), t(' with open '), gt('chain-arch-vintage', 'chain arches'), t('. The clusters sit between the arches of the previous row, creating a staggered brick effect. The '), gt('chain-loop-edge', 'chain-loop edging'), t(' runs along both short ends to finish the piece.')),
      p(t('A wool or wool-silk fingering yarn blocks to hold the arches open. Allow around 550 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn', qty: '550 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain a multiple of 6 plus 4. Swatch first to confirm your repeat count for 52 cm width.')),
      h2('Cluster row'),
      p(t('4 tr tog in next space ('), gt('treble-cluster', 'cluster'), t('), ch 4 ('), gt('chain-arch-vintage', 'arch'), t('), repeat across. End row with 1 dc into turning ch.')),
      h2('Plain row'),
      p(t('Ch 4, turn. Work 1 dc into each '), gt('chain-arch-vintage', 'arch'), t(' centre. Alternate rows for 170 cm.')),
      h2('Edging'),
      p(t('Work '), gt('chain-loop-edge', 'chain-loop edging'), t(' along each short end: join yarn, ch 5, sl st 2 stitches along, repeat across.')),
      h2('What to try next'),
      p(t('The bridal lace shawl combines cluster rows with picot edging for a more formal result.')),
    ],
  },
},

// ── L15 ── bridal lace shawl ─────────────────────────────────────────────────
{
  slug: 'bridal-lace-shawl-crochet',
  title: 'Bridal lace shawl',
  subtitle: 'A fine picot-edged shawl in lace-weight yarn for weddings and formal occasions.',
  excerpt: 'A triangular shawl in fine lace-weight yarn, worked in rows of delicate treble fans separated by chain spaces, with a deep picot border on all three sides.',
  difficulty: 'ADVANCED',
  yarnWeight: 'lace',
  hook: 'crochet-hook-3-5mm',
  gauge: '4 fan repeats x 12 rows = 10 x 10 cm in lace weight on a 3.5 mm hook.',
  finishedSize: '170 cm wingspan x 72 cm depth.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-fan-stitch', 'crochet-picot-edging', 'crochet-triangular-shawl', 'crochet-blocking'],
  criticalTechniques: ['crochet-fan-stitch', 'crochet-picot-edging', 'crochet-blocking'],
  aliases: ['bridal crochet shawl', 'wedding shawl crochet', 'lace weight shawl', 'formal crochet wrap', 'picot edged shawl'],
  glossaryTerms: [
    { slug: 'treble-fan', term: 'Treble fan', definition: 'Seven trebles worked into the same chain space, fanning out symmetrically to form a pointed shape. At lace weight these fans are fine and barely visible at a conversational distance.' },
    { slug: 'deep-picot-border', term: 'Deep picot border', definition: 'A multi-row edging that combines a dc foundation row, a chain arch row, and a final picot row. The depth adds visible structure that frames the shawl.' },
    { slug: 'lace-blocking', term: 'Blocking with wires', definition: 'Threading blocking wires through the edge loops before pinning allows long edges to be straightened in one pass. Essential for a crisp triangular outline at lace weight.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Fine triangular bridal shawls draw on Victorian and Edwardian thread crochet patterns. No single public-domain source used directly.',
  body: {
    type: 'doc', content: [
      p(t('The bridal shawl is worked from the top neck edge downward. Each RS row adds one extra '), gt('treble-fan', 'treble fan'), t(' repeat at each side of centre. The result is a triangle that widens evenly. A '), gt('deep-picot-border', 'deep picot border'), t(' runs around all three sides after the body is complete.')),
      p(t('Work at a tighter-than-usual tension for lace weight: the fabric should hold its shape without stiffness. '), gt('lace-blocking', 'Blocking with wires'), t(' is strongly advised. Allow around 800 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Lace-weight yarn', qty: '800 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation and setup'),
      p(t('Chain 7. Row 1: 1 dc in 4th ch from hook, ch 2, 7 tr into last ch (first '), gt('treble-fan', 'fan'), t('), ch 2, 1 dc in same ch. Turn.')),
      h2('Body'),
      p(t('Every RS row: work ch 5, dc, ch 2, fan, ch 2, dc at centre point, then mirror on opposite side. Increase by one fan group per side per RS row. Continue until wingspan reaches 170 cm.')),
      h2('Edging'),
      p(t('Attach yarn at one corner. Row 1: dc across all edges. Row 2: ch 4, skip 2 dc, repeat. Row 3 (picot): dc in arch, '), gt('deep-picot-border', 'ch 3, sl st in 1st ch'), t(', dc in same arch, repeat. This completes the '), gt('deep-picot-border', 'deep picot border'), t('.')),
      h2('Blocking'),
      p(t('Thread '), gt('lace-blocking', 'blocking wires'), t(' through the points along all three sides before pinning. Mist with water and leave to dry on a foam mat.')),
      h2('What to try next'),
      p(t('The leaf lace shawl uses the same triangular growth method with leaf motif borders for a different formal look.')),
    ],
  },
},

// ── L16 ── chunky openwork shawl ─────────────────────────────────────────────
{
  slug: 'chunky-openwork-shawl-crochet',
  title: 'Chunky openwork shawl',
  subtitle: 'A quick-make DK openwork shawl with bold scale and easy mesh.',
  excerpt: 'Large chain-space cells in DK yarn make a lightweight openwork shawl that knits up quickly and blocks with minimal effort. Good for beginners who want a lace look without fine yarn.',
  difficulty: 'BEGINNER',
  yarnWeight: 'dk',
  hook: 'crochet-hook-4-0mm',
  gauge: '8 mesh squares x 6 rows = 10 x 10 cm in DK on a 4 mm hook.',
  finishedSize: '155 x 50 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-chain-space-mesh', 'crochet-rectangular-shawl'],
  criticalTechniques: ['crochet-chain-space-mesh'],
  aliases: ['chunky lace shawl', 'dk openwork shawl', 'quick crochet shawl', 'easy lace shawl crochet'],
  glossaryTerms: [
    { slug: 'large-cell-mesh', term: 'Large-cell mesh', definition: 'A mesh where each chain bridge spans 2 or 3 chains instead of 1. The larger gaps give a bolder, more open look suited to DK weight.' },
    { slug: 'dk-drape', term: 'DK drape', definition: 'The way DK yarn falls when worked on a slightly larger hook than the ball band recommends. A looser tension gives a softer, more flowing result.' },
    { slug: 'chunky-dc-edge', term: 'DC border', definition: 'A single row of double crochet worked around all four sides to neaten the edges and stop the mesh from curling inward.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Openwork DK shawls are a popular quick-make modern project. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Use a 4 mm hook with DK yarn to achieve a soft '), gt('dk-drape', 'DK drape'), t('. The '), gt('large-cell-mesh', 'large-cell mesh'), t(' pattern is: 1 dc, ch 2, skip 2, repeat. The '), gt('chunky-dc-edge', 'DC border'), t(' runs around all sides at the end.')),
      p(t('A merino DK or cotton DK will both work. Cotton will need wet blocking; merino responds to steam. Allow around 300 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK yarn', qty: '300 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 165 (55 repeats of 3, plus 3 turning). Row 1: dc in 4th ch, ch 2, skip 2, dc in next. Repeat to end. This sets the '), gt('large-cell-mesh', 'large-cell mesh'), t('.')),
      h2('Body'),
      p(t('Ch 3, turn. Dc into first ch-2 space, ch 2. Repeat across. Work until piece measures 50 cm wide from foundation. The turning ch counts as the first dc each row.')),
      h2('Border'),
      p(t('Work 1 round of '), gt('chunky-dc-edge', 'dc border'), t(' around all edges, placing 3 dc in each corner. Join and fasten off.')),
      h2('What to try next'),
      p(t('The boho lace shawl uses the same open mesh idea in sport yarn with fringe added at the lower edge.')),
    ],
  },
},

// ── L17 ── spiral lace shawl ─────────────────────────────────────────────────
{
  slug: 'spiral-lace-shawl-crochet',
  title: 'Spiral lace shawl',
  subtitle: 'A triangular fingering shawl that grows from a spiral centre stitch.',
  excerpt: 'Starting from a single chain, this triangular shawl grows via a two-stitch spine that creates a subtle spiral effect as the lace fans out on each side.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '16 tr x 10 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: '160 cm wingspan x 65 cm depth.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-triangular-shawl', 'crochet-spine-increases', 'crochet-open-mesh'],
  criticalTechniques: ['crochet-triangular-shawl', 'crochet-spine-increases'],
  aliases: ['spiral shawl crochet', 'spine increase shawl', 'triangle shawl crochet', 'centre spine shawl'],
  glossaryTerms: [
    { slug: 'two-stitch-spine', term: 'Two-stitch spine', definition: 'Two dc worked side by side at the exact centre of each RS row. They form a raised vertical line down the middle of the triangle and create the left and right increase points.' },
    { slug: 'spine-yos', term: 'Yarn-over increase', definition: 'A simple yarn-over placed immediately before and after the centre spine stitches. Each one adds a stitch and leaves a small decorative eyelet.' },
    { slug: 'spiral-mesh-fill', term: 'Mesh infill', definition: 'The ch-1 skip-1 mesh worked on each side of the spine to fill the triangle. The mesh rows are plain; the increases happen only at the spine and the two outer edges.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Spine-increase triangle shawls are a modern crochet convention. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Chain 6. Row 1 (RS): 2 dc in 4th ch from hook (first '), gt('two-stitch-spine', 'spine'), t('), ch 1, 1 dc in last ch. The spine sits at centre and the '), gt('spiral-mesh-fill', 'mesh infill'), t(' grows on each side. On every RS row place a '), gt('spine-yos', 'yarn-over increase'), t(' on each side of the spine to widen the triangle.')),
      p(t('The spiral effect comes from twisting the mesh one step per section. It is subtle and shows best in a semi-solid or tonal yarn. Allow around 500 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn', qty: '500 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 6. Row 1: dc in 4th ch, ch 1, dc in last ch. Turn. Row 2 (WS): ch 3, dc in ch sp, 2 dc ('), gt('two-stitch-spine', 'spine'), t('), dc in ch sp, dc in top of turning ch. Turn.')),
      h2('Body'),
      p(t('RS rows: ch 3, work '), gt('spiral-mesh-fill', 'mesh'), t(' to 1 st before spine, '), gt('spine-yos', 'yo increase'), t(', 2 dc spine, yo increase, mesh to end. WS rows: ch 3, work dc across without increasing. Repeat until wingspan is 160 cm.')),
      h2('Border'),
      p(t('Work 1 round of dc around all three sides, 3 dc in each corner point. Fasten off.')),
      h2('What to try next'),
      p(t('The leaf lace shawl adds a leaf-motif border to a similar triangular base for a more structured edge.')),
    ],
  },
},

// ── L18 ── leaf lace shawl ───────────────────────────────────────────────────
{
  slug: 'leaf-lace-shawl-crochet',
  title: 'Leaf lace shawl',
  subtitle: 'A fingering triangle shawl with a raised leaf motif border, ADVANCED.',
  excerpt: 'A plain triangular mesh body frames a deep leaf-motif border. Each leaf is worked in relief across three rows and stands out from the mesh background.',
  difficulty: 'ADVANCED',
  yarnWeight: 'fingering',
  hook: 'crochet-hook-3-5mm',
  gauge: '18 sts x 12 rows = 10 x 10 cm in fingering on a 3.5 mm hook.',
  finishedSize: '165 cm wingspan x 68 cm depth.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-fpdc', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-leaf-motif', 'crochet-relief-stitch', 'crochet-triangular-shawl', 'crochet-blocking'],
  criticalTechniques: ['crochet-leaf-motif', 'crochet-relief-stitch', 'crochet-blocking'],
  aliases: ['leaf shawl crochet', 'leaf motif shawl', 'botanical crochet shawl', 'relief stitch shawl'],
  glossaryTerms: [
    { slug: 'leaf-motif-crochet', term: 'Leaf motif', definition: 'A worked shape of front-post trebles and chain loops that forms an outlined leaf. The leaf sits proud of the background mesh.' },
    { slug: 'front-post-leaf', term: 'Front post treble', definition: 'A treble worked around the post of the stitch below rather than into the top loops. It stands forward from the fabric surface, creating the raised effect used in the leaf outline.' },
    { slug: 'mesh-background', term: 'Mesh background', definition: 'The plain ch-1 skip-1 mesh that fills the triangle body. It acts as a neutral background that makes the leaf border read clearly.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Leaf-motif borders on triangle shawls are a modern crochet technique. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('The shawl body is a standard triangle in '), gt('mesh-background', 'mesh'), t('. The leaf border begins when the wingspan reaches 130 cm. Each '), gt('leaf-motif-crochet', 'leaf motif'), t(' is 12 stitches wide and uses '), gt('front-post-leaf', 'front post trebles'), t(' to stand above the mesh.')),
      p(t('This is an advanced project because the leaf chart must be read correctly and the post stitches worked at consistent tension. Merino or merino-silk fingering is recommended for definition. Allow around 650 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering yarn', qty: '650 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Body'),
      p(t('Work the triangular mesh body following the spine-increase method until wingspan is 130 cm. Work the '), gt('mesh-background', 'mesh'), t(' evenly across the last plain rows.')),
      h2('Leaf border setup'),
      p(t('Identify the centre point of the lower edge. Place the first '), gt('leaf-motif-crochet', 'leaf motif'), t(' at centre, then space further motifs every 18 stitches. Adjust spacing at the two outer edges so the leaves sit symmetrically.')),
      h2('Leaf rows'),
      p(t('Work 3 rows per leaf, using '), gt('front-post-leaf', 'front post trebles'), t(' to outline each leaf and chain loops to form the central vein. Continue the background mesh between leaves.')),
      h2('Finishing'),
      p(t('Work 1 round of dc around the entire edge. Block firmly to open the mesh and define the leaf outlines.')),
      h2('What to try next'),
      p(t('The bridal lace shawl uses a similar triangular shape with a picot border rather than a leaf motif.')),
    ],
  },
},

// ── L19 ── cotton beach shawl ────────────────────────────────────────────────
{
  slug: 'cotton-beach-shawl-crochet',
  title: 'Cotton beach shawl',
  subtitle: 'An open mesh beach cover-up in sport cotton, BEGINNER friendly.',
  excerpt: 'A wide rectangle of large chain-space mesh in sport cotton doubles as a beach cover-up. The large cells work up fast and the cotton washes well after a day at the water.',
  difficulty: 'BEGINNER',
  yarnWeight: 'sport',
  hook: 'crochet-hook-4-0mm',
  gauge: '10 mesh squares x 7 rows = 10 x 10 cm in sport cotton on a 4 mm hook.',
  finishedSize: '180 x 65 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-chain-space-mesh', 'crochet-rectangular-shawl'],
  criticalTechniques: ['crochet-chain-space-mesh'],
  aliases: ['beach shawl crochet', 'cotton cover-up crochet', 'beach wrap crochet', 'summer cover up crochet'],
  glossaryTerms: [
    { slug: 'large-mesh-beach', term: 'Large chain-space mesh', definition: 'A mesh with ch 2 bridges. The larger gaps make the fabric airy enough to wear as a beach cover while still giving enough drape to wrap around the body.' },
    { slug: 'cotton-care', term: 'Cotton care', definition: 'Cotton can be machine washed at 30 C and laid flat to dry. Unlike wool, it does not felt or distort with washing.' },
    { slug: 'turning-chain-3', term: 'Chain-3 turning chain', definition: 'A 3-chain turn used to reach the correct height for the first dc across a ch-2 mesh row. The chain-3 counts as the first dc plus bridge.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Cotton beach cover-ups in mesh are a popular modern quick-make pattern. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Sport cotton on a 4 mm hook produces a firm but light '), gt('large-mesh-beach', 'large chain-space mesh'), t('. The '), gt('turning-chain-3', 'chain-3 turning chain'), t(' handles row height cleanly so you do not need to count the first stitch separately. '), gt('cotton-care', 'Cotton care'), t(' means you can machine-wash the finished shawl after beach use.')),
      p(t('Choose a tightly spun 2-ply sport cotton rather than a fluffy cotton blend. The mesh cells stay open longer. Allow around 380 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport cotton', qty: '380 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 183 (60 repeats of 3 plus 3 turning). Row 1: dc in 4th ch from hook, ch 2, skip 2, dc. Repeat to end. 61 mesh cells across.')),
      h2('Body'),
      p(t('Ch 3, turn. Dc in first ch-2 space, ch 2, dc in next space. Repeat the '), gt('large-mesh-beach', 'large mesh'), t(' row until work measures 65 cm from foundation. Use a '), gt('turning-chain-3', 'chain-3 turn'), t(' every row.')),
      h2('Edging'),
      p(t('Work 1 round of dc around all four sides, 3 dc at each corner. Fasten off and weave ends.')),
      h2('What to try next'),
      p(t('The summer lace shawl uses the same cotton mesh idea in a ch-1 repeat for a finer texture.')),
    ],
  },
},

// ── L20 ── mohair lace shawl ─────────────────────────────────────────────────
{
  slug: 'mohair-lace-shawl-crochet',
  title: 'Mohair lace shawl',
  subtitle: 'A cloud-light halo shawl in lace-weight mohair on a 5 mm hook.',
  excerpt: 'Lace-weight mohair held on a larger-than-usual hook creates a halo-soft openwork shawl. A simple mesh grid lets the yarn do the work, with minimal shaping.',
  difficulty: 'INTERMEDIATE',
  yarnWeight: 'lace',
  hook: 'crochet-hook-5-0mm',
  gauge: '10 mesh squares x 6 rows = 10 x 10 cm in lace mohair on a 5 mm hook.',
  finishedSize: '170 x 58 cm.',
  stitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-slip-stitch'],
  techniqueSlugs: ['crochet-chain-space-mesh', 'crochet-mohair-technique', 'crochet-rectangular-shawl'],
  criticalTechniques: ['crochet-chain-space-mesh', 'crochet-mohair-technique'],
  aliases: ['mohair shawl crochet', 'halo shawl crochet', 'fluffy crochet shawl', 'cloud shawl crochet'],
  glossaryTerms: [
    { slug: 'mohair-halo', term: 'Mohair halo', definition: 'The cloud of fine fibres that surrounds each strand of mohair yarn. The halo softens the stitch definition and blurs the mesh cells into a misty texture.' },
    { slug: 'over-sized-hook-mohair', term: 'Over-sized hook', definition: 'Using a hook 1.5 to 2 sizes larger than the yarn label suggests. With mohair, the extra space lets the halo bloom and prevents the fabric from matting.' },
    { slug: 'mohair-frogging', term: 'Frogging mohair', definition: 'Undoing rows of mohair crochet. The halo fibres tangle together, making frogging difficult. It is important to check each row before moving on.' },
  ],
  sourceType: 'SYNTHESISED',
  sourceNotes: 'Mohair mesh shawls on oversized hooks are a widely shared modern technique. No single public-domain source.',
  body: {
    type: 'doc', content: [
      p(t('Mohair is beautiful but unforgiving: '), gt('mohair-frogging', 'frogging'), t(' is difficult once the '), gt('mohair-halo', 'halo'), t(' has set. Work each row carefully and check before turning. The '), gt('over-sized-hook-mohair', 'over-sized hook'), t(' is deliberate; do not switch down to the label size.')),
      p(t('Use a 70/30 kid mohair/silk blend lace weight. Pure mohair without silk is harder to work and splits more easily. Allow around 300 m.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Lace-weight kid mohair/silk', qty: '300 m' },
        { name: '5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Scissors', qty: '1 pair' },
      ]),
      h2('Foundation'),
      p(t('Chain 205. Row 1: dc in 4th ch from hook, ch 1, skip 1, dc. Repeat to end. 102 mesh cells.')),
      h2('Body'),
      p(t('Ch 2, turn. Dc in first ch-1 space, ch 1. Repeat across. The '), gt('mohair-halo', 'halo'), t(' will obscure the stitch count; place a marker at the start of every 10th cell to keep track. Work until piece measures 58 cm.')),
      h2('Finishing'),
      p(t('Do not block aggressively. A light misting and gentle smoothing by hand is enough. Steaming can mat the '), gt('mohair-halo', 'halo'), t(' flat, which removes the cloud effect. Weave ends carefully to avoid splitting the fibres.')),
      h2('What to try next'),
      p(t('The bridal lace shawl uses lace weight on a standard 3.5 mm hook for a crisper, more structured result.')),
    ],
  },
},

] // end PATTERNS

// ── Write files ──────────────────────────────────────────────────────────────
for (const pat of PATTERNS) {
  const {
    slug, title, subtitle, excerpt, difficulty, yarnWeight, hook,
    gauge, finishedSize, stitchSlugs, techniqueSlugs, criticalTechniques,
    aliases, glossaryTerms, sourceType, sourceNotes, body,
  } = pat

  const out = {
    slug,
    title,
    subtitle,
    excerpt,
    type: 'PATTERN',
    categorySlug: 'crochet',
    subCategorySlug: 'lacework',
    difficulty,
    sourceType,
    sourceNotes,
    techniqueSlugs,
    criticalTechniques,
    aliases,
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: yarnWeight,
      primaryHookSlug: hook,
      gaugeText: gauge,
      finishedSizeText: finishedSize,
      terminologyConvention: 'uk',
      craftStitchSlugs: stitchSlugs,
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  }

  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`wrote ${slug}.json`)
}

console.log(`\nDone — ${PATTERNS.length} patterns written to ${OUT}`)
