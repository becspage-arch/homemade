/**
 * Generator: D-Lacework Batch 4 — L31-L45 Lace Scarves and Cowls
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-lacework-batch4.ts
 * Writes JSON files to briefs-crochet-d-lacework/
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
function gt(termSlug: string, text: string) {
  return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text }
}
function li(...content: object[]) {
  return { type: 'listItem', content: [{ type: 'paragraph', content: content }] }
}
function ul(...items: object[]) { return { type: 'bulletList', content: items } }
function ol(...items: object[]) { return { type: 'orderedList', content: items } }
function supplies(heading: string, items: { name: string; qty: string; substitutions?: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

// ── 1 ── lace-scarf-crochet ────────────────────────────────────────────────────
{
  const slug = 'lace-scarf-crochet'
  const glossaryTerms = [
    { slug: 'fan-stitch', term: 'Fan stitch', definition: 'A shell of five or more trebles worked into the same stitch, fanning out in a semicircle to create a lace motif.' },
    { slug: 'foundation-chain', term: 'Foundation chain', definition: 'The starting row of chains that sets the width and stitch count for a flat piece of crochet.' },
    { slug: 'turning-chain', term: 'Turning chain', definition: 'Chains worked at the end of a row to raise the hook to the correct height before turning to work back along the next row.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A long lace scarf worked flat in a repeating fan stitch. Each repeat is 12 stitches wide and four rows tall, so the scarf grows quickly once the '), gt('fan-stitch', 'fan stitch'), t(' rhythm is established.')),
      p(t('The '), gt('foundation-chain', 'foundation chain'), t(' sets the width at 37 stitches, giving three fans across. The scarf is worked to approximately 180 cm, then fastened off. Both short ends receive a picot border for a neat finish.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '200 g', substitutions: 'A smooth plied fingering in wool, cotton, or a blend all work well.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('One fan repeat (12 sts, 4 rows) = 6 cm wide by 3 cm tall in fingering with a 3.5 mm hook after wet blocking. Work one full repeat as a swatch and measure before starting. A wider swatch is more reliable than a single repeat.')),
      h2('Finished size'),
      p(t('Approximately 18 cm wide by 180 cm long after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK) / sc (US): double crochet, one loop only, short stitch')),
        li(t('tr (UK) / dc (US): treble, one yarn-over before inserting hook')),
        li(gt('fan-stitch', 'fan stitch'), t(': five trebles into the same stitch')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 37.')),
      h2('Row 1 (right side)'),
      p(t('Work 1 dc into the 4th ch from hook. *Skip 2 ch, work 5 tr into the next ch (one fan made), skip 2 ch, work 1 dc into the next ch*. Repeat from * to * to end. Turn. (3 fans, 4 dc.)')),
      h2('Row 2'),
      p(gt('turning-chain', 'Turning chain'), t(' of 3 (counts as first tr). Work 2 tr into the first dc. *Skip 2 tr, dc into the centre tr of the next fan, skip 2 tr, work 5 tr into the next dc*. Repeat, ending with 3 tr into the last dc. Turn.')),
      h2('Row 3'),
      p(t('Ch 1. Dc into the first tr. *Skip 2 tr, work 5 tr into the next dc, skip 2 tr, dc into the centre tr of the next fan*. Repeat to end, dc into the top of the turning chain. Turn.')),
      h2('Row 4'),
      p(t('As Row 2.')),
      p(t('Repeat Rows 3 and 4 until the scarf measures approximately 180 cm. Fasten off.')),
      h2('Picot border'),
      p(t('Rejoin yarn to one short end. *Sl st into the next st, ch 3, sl st into the same st (one picot made)*. Repeat along the short edge. Fasten off. Repeat on the other short end.')),
      h2('Finishing'),
      p(t('Weave in all ends with the tapestry needle. Wet block by soaking in cool water, pressing gently, then pinning out to the full dimensions on a flat surface. Leave to dry completely before removing pins.')),
    ],
  }
  const out = {
    slug, title: 'Lace scarf', subtitle: '', excerpt: 'A long scarf in a three-fan repeat using fingering yarn and a 3.5 mm hook. The fan stitch lace builds up quickly once the four-row repeat clicks.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Fan stitch construction synthesised from Victorian lace crochet traditions documented in Weldon\'s Practical Crochet (various series, 1880s-1890s, Internet Archive). Picot border is a standard period finish.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-fan-stitch', 'wet-blocking', 'picot-edging'],
    criticalTechniques: ['crochet-treble', 'crochet-double-uk'],
    aliases: ['fan lace scarf crochet', 'beginner lace scarf', 'long crochet lace scarf'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: 'One fan repeat (12 sts, 4 rows) = 6 cm wide by 3 cm tall after blocking.',
      finishedSizeText: 'Approximately 18 cm wide by 180 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-fan-stitch', 'wet-blocking', 'picot-edging'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 2 ── infinity-lace-scarf-crochet ──────────────────────────────────────────
{
  const slug = 'infinity-lace-scarf-crochet'
  const glossaryTerms = [
    { slug: 'magic-ring', term: 'Magic ring', definition: 'An adjustable loop used to start crocheting in the round so the centre can be pulled tight, leaving no hole.' },
    { slug: 'joining-round', term: 'Joining round', definition: 'A slip stitch used at the end of a round to connect the last stitch to the first, closing the circle before beginning the next round.' },
    { slug: 'shell-stitch', term: 'Shell stitch', definition: 'A group of trebles worked into the same stitch or space, forming a fan shape used widely in lace crochet.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('An infinity scarf worked in the round as a long tube, then joined at the ends. The '), gt('shell-stitch', 'shell stitch'), t(' lace repeat works the same in every round because the right side always faces you.')),
      p(t('The tube is 80 rounds of shell lace, making a loop approximately 150 cm in circumference. It is worn doubled around the neck.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '200 g', substitutions: 'Any smooth fingering or 4-ply yarn.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('14 tr by 7 rounds = 10 x 10 cm in fingering with a 3.5 mm hook, blocked. Swatch flat if you prefer; the stitch gauge is identical in round.')),
      h2('Finished size'),
      p(t('Approximately 18 cm wide (tube circumference 36 cm) by 150 cm circumference when laid flat.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK): double crochet')),
        li(gt('shell-stitch', 'shell stitch'), t(': 5 tr into the same stitch')),
        li(gt('joining-round', 'joining round'), t(': sl st to close each round')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 51. Sl st to the first ch to form a ring. Be careful not to twist.')),
      h2('Round 1'),
      p(t('Ch 3 (counts as first tr). Work 4 tr into the first ch (first shell). *Skip 4 ch, dc into the next ch, skip 4 ch, work 5 tr into the next ch (one shell)*. Repeat from * to * around. '), gt('joining-round', 'Join'), t(' with sl st to the top of the ch-3. (5 shells.)')),
      h2('Round 2'),
      p(t('Ch 1. Dc into the first tr (centre of shell). *Skip 2 tr, work 5 tr into the next dc, skip 2 tr, dc into the centre tr of the next shell*. Repeat around. Join with sl st to first dc.')),
      p(t('Repeat Round 2 until work measures 150 cm in circumference (approximately 80 rounds). Fasten off. Weave in ends. Block lightly.')),
    ],
  }
  const out = {
    slug, title: 'Infinity lace scarf', subtitle: '', excerpt: 'A shell-stitch infinity loop worked in the round in fingering yarn. No seam: the tube is joined as you go, and the right side always faces you.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Shell stitch lace worked in the round. Construction synthesised from standard in-the-round shell lace techniques documented across multiple 20th-century crochet encyclopaedias.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-in-the-round', 'crochet-shell-stitch', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-in-the-round'],
    aliases: ['infinity scarf crochet', 'loop scarf lace crochet', 'circle scarf crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '14 tr by 7 rounds = 10 x 10 cm in fingering with a 3.5 mm hook, blocked.',
      finishedSizeText: 'Approximately 18 cm wide, 150 cm circumference when doubled.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-in-the-round', 'crochet-shell-stitch', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 3 ── lace-cowl-crochet ────────────────────────────────────────────────────
{
  const slug = 'lace-cowl-crochet'
  const glossaryTerms = [
    { slug: 'shell-lace', term: 'Shell lace', definition: 'A lace pattern built from shells of grouped trebles separated by chain spaces and single stitches, creating an open, airy fabric.' },
    { slug: 'stitch-marker', term: 'Stitch marker', definition: 'A small clip or loop placed on a specific stitch to mark the start of a round or a key position in the pattern.' },
    { slug: 'picot', term: 'Picot', definition: 'A tiny decorative loop made by chaining three stitches and slip-stitching back into the first chain, used as a border finish.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A circular cowl in '), gt('shell-lace', 'shell lace'), t(' worked from the bottom up in the round. The shell repeat is six stitches wide, and each round of shells sits between the double crochets of the round below.')),
      p(t('A '), gt('stitch-marker', 'stitch marker'), t(' placed at the start of each round keeps the count accurate as the cowl grows. The top edge is finished with a '), gt('picot', 'picot'), t(' round for a decorative border that echoes the open lace texture.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '150 g', substitutions: 'Wool or cotton fingering both block well.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
        { name: 'Stitch marker', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('One shell repeat (6 sts) = 4 cm wide by 2.5 cm tall in fingering with a 3.5 mm hook after wet blocking.')),
      h2('Finished size'),
      p(t('Approximately 56 cm circumference by 28 cm tall after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK): double crochet')),
        li(gt('shell-lace', 'shell lace'), t(': 5 tr into the same stitch or space')),
        li(t('sl st: slip stitch')),
        li(gt('picot', 'picot'), t(': ch 3, sl st into first ch')),
      ),
      h2('Pattern'),
      p(t('Foundation ring: chain 84. Sl st to the first ch to form a ring, placing the stitch marker at the join.')),
      h2('Round 1'),
      p(t('Ch 3 (counts as tr). Work 2 tr into the first ch. *Skip 2 ch, dc into the next ch, skip 2 ch, work 5 tr into the next ch*. Repeat around, ending with 2 tr into the foundation ch-3 space. Join with sl st.')),
      h2('Round 2'),
      p(t('Ch 1. Dc into the join. *Skip 2 tr, work 5 tr into the next dc, skip 2 tr, dc into the centre tr of the next shell*. Repeat around. Join with sl st to first dc.')),
      p(t('Repeat Round 2 until the cowl measures 26 cm from the foundation ring.')),
      h2('Picot round'),
      p(t('*Sl st into the next st, ch 3, sl st into the same st*. Repeat all the way round. Fasten off. Weave in all ends. Wet block to the finished dimensions.')),
    ],
  }
  const out = {
    slug, title: 'Lace cowl', subtitle: '', excerpt: 'A circular cowl in a six-stitch shell lace repeat, worked in the round in fingering yarn. A picot round finishes the top edge.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Shell lace cowl synthesised from 19th-century neck-wrap patterns in Weldon\'s Practical Crochet (series 3-5, Internet Archive) adapted for modern in-the-round construction.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-in-the-round', 'crochet-shell-stitch', 'picot-edging', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-in-the-round', 'crochet-double-uk'],
    aliases: ['shell lace cowl crochet', 'lace neck cowl', 'circular lace cowl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: 'One shell repeat (6 sts) = 4 cm wide by 2.5 cm tall after wet blocking.',
      finishedSizeText: 'Approximately 56 cm circumference by 28 cm tall after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-in-the-round', 'crochet-shell-stitch', 'picot-edging', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 4 ── wide-lace-cowl-crochet ───────────────────────────────────────────────
{
  const slug = 'wide-lace-cowl-crochet'
  const glossaryTerms = [
    { slug: 'open-mesh', term: 'Open mesh', definition: 'A lace structure of chain spaces separated by single trebles or double crochets, creating a regular grid of holes in the fabric.' },
    { slug: 'blocking', term: 'Blocking', definition: 'Wetting, pinning, and drying crochet to open up the lace structure and set the fabric to its final dimensions.' },
    { slug: 'foundation-ring', term: 'Foundation ring', definition: 'The initial chain joined into a circle that forms the base of any piece worked in the round.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A wide, slouchy cowl in '), gt('open-mesh', 'open mesh'), t(' lace, worked in sport weight yarn. The mesh is a simple alternating grid of trebles and chain-2 spaces, which makes a very open, drapey fabric when '), gt('blocking', 'blocked'), t('.')),
      p(t('The cowl is 40 rounds tall so it folds over in a wide double loop or sits high as a loose collar. The '), gt('foundation-ring', 'foundation ring'), t(' is 120 chains, giving 30 mesh repeats around.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport weight yarn', qty: '150 g', substitutions: 'Cotton sport or a cotton-linen blend drapes best.' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('10 tr by 6 rounds = 10 x 10 cm in open mesh with a 4 mm hook after blocking. The mesh opens up noticeably with blocking, so always swatch and block before measuring.')),
      h2('Finished size'),
      p(t('Approximately 76 cm circumference by 40 cm tall after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(gt('open-mesh', 'open mesh'), t(': tr, ch 2, skip 2, repeat')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 120. Sl st to first ch to form a ring, checking the chain is not twisted.')),
      h2('Round 1'),
      p(t('Ch 5 (counts as tr plus ch 2). *Skip 2 ch, tr into the next ch, ch 2*. Repeat around. Sl st to the 3rd ch of the starting ch-5. (40 tr, 40 ch-2 spaces.)')),
      h2('Round 2'),
      p(t('Ch 5 (counts as tr plus ch 2). *Skip the ch-2 space, tr into the next tr, ch 2*. Repeat around. Sl st to 3rd ch of starting ch-5.')),
      p(t('Repeat Round 2 for 40 rounds in total. Fasten off. Weave in ends. Wet block to finished dimensions.')),
    ],
  }
  const out = {
    slug, title: 'Wide lace cowl', subtitle: '', excerpt: 'A big, slouchy cowl in open mesh lace worked in sport yarn. Forty rounds of treble-and-chain-2 grid give a drapey fabric that opens up beautifully after blocking.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Open mesh cowl synthesised from standard filet mesh construction documented in multiple early 20th-century crochet pattern books including Clark\'s Crochet Book (various editions, Internet Archive).',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-in-the-round'],
    aliases: ['slouchy cowl crochet', 'mesh lace cowl', 'wide neck warmer crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'sport',
      primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '10 tr by 6 rounds = 10 x 10 cm in open mesh after blocking.',
      finishedSizeText: 'Approximately 76 cm circumference by 40 cm tall after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 5 ── filet-scarf-crochet ───────────────────────────────────────────────────
{
  const slug = 'filet-scarf-crochet'
  const glossaryTerms = [
    { slug: 'filet-mesh', term: 'Filet mesh', definition: 'A lace grid of trebles and chain-2 spaces. Open squares in the grid are chain spaces; filled squares are two extra trebles worked into the space.' },
    { slug: 'filet-motif', term: 'Filet motif', definition: 'A picture or pattern created within a filet grid by filling selected squares with trebles, leaving others open.' },
    { slug: 'chart-reading', term: 'Chart reading', definition: 'Following a grid diagram where each filled square represents a block of trebles and each empty square represents a chain space.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A long scarf worked in '), gt('filet-mesh', 'filet mesh'), t(' with a simple diamond '), gt('filet-motif', 'filet motif'), t(' repeated along the length. Filet crochet is '), gt('chart-reading', 'chart-based'), t(': open squares are chain-2 spaces, filled squares are treble blocks.')),
      p(t('The scarf is 13 squares wide (13 treble columns), giving enough width for the diamond motif centred across three squares with two open squares on each side. The motif repeats every 10 rows.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Lace weight yarn', qty: '150 g', substitutions: 'Smooth cotton or linen lace weight gives the crisper grid line; wool lace also works.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('5 filet squares (10 tr columns plus 4 ch-2 spaces) = 10 cm wide. 5 filet rows = 5 cm tall. Work a swatch at least 10 squares wide and 10 rows tall for accuracy.')),
      h2('Finished size'),
      p(t('Approximately 20 cm wide by 160 cm long after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(gt('filet-mesh', 'open square'), t(': ch 2, skip 2, tr into next tr')),
        li(t('filled square: 2 tr into the ch-2 space, tr into next tr (3 tr total)')),
      ),
      h2('Foundation'),
      p(t('Chain 40 (13 squares = 13 tr columns, 12 ch-2 spaces, plus 4 for turning).')),
      h2('Row 1 (right side)'),
      p(t('Tr into the 8th ch from hook (1 open square made). *Ch 2, skip 2 ch, tr into the next ch*. Repeat across. Turn. (13 squares, all open.)')),
      h2('Row 2'),
      p(t('Ch 5 (counts as tr plus ch 2). Skip the ch-2 space, tr into the next tr. Continue in mesh to end. Turn.')),
      h2('Diamond motif rows 3 to 12'),
      p(t('Follow the motif below. O = open square, X = filled square. Read right-side rows from right to left, wrong-side rows from left to right.')),
      ul(
        li(t('Row 3:  O O O O O X O O O O O O O')),
        li(t('Row 4:  O O O O X X X O O O O O O')),
        li(t('Row 5:  O O O X X X X X O O O O O')),
        li(t('Row 6:  O O X X X X X X X O O O O')),
        li(t('Row 7:  O X X X X X X X X X O O O')),
        li(t('Row 8:  O O X X X X X X X O O O O')),
        li(t('Row 9:  O O O X X X X X O O O O O')),
        li(t('Row 10: O O O O X X X O O O O O O')),
        li(t('Row 11: O O O O O X O O O O O O O')),
        li(t('Row 12: O O O O O O O O O O O O O (all open)')),
      ),
      p(t('Repeat Rows 3 to 12 until the scarf reaches 160 cm. Fasten off. Wet block to finished dimensions.')),
    ],
  }
  const out = {
    slug, title: 'Filet lace scarf', subtitle: '', excerpt: 'A long scarf worked in filet mesh with a repeating diamond motif. Lace weight yarn and a 3.5 mm hook give a fine, crisp grid.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Filet crochet grid and diamond motif construction synthesised from Weldon\'s Practical Needlework vol. 7 (1890s, Internet Archive) and the standard filet grid rules documented across multiple Victorian needlework encyclopaedias.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'filet-crochet', 'chart-reading-crochet', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'filet-crochet'],
    aliases: ['filet crochet scarf', 'grid lace scarf', 'diamond filet scarf'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'lace',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '5 filet squares = 10 cm wide; 5 rows = 5 cm tall.',
      finishedSizeText: 'Approximately 20 cm wide by 160 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'filet-crochet', 'chart-reading-crochet', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 6 ── ruffled-lace-scarf-crochet ───────────────────────────────────────────
{
  const slug = 'ruffled-lace-scarf-crochet'
  const glossaryTerms = [
    { slug: 'ruffle-edging', term: 'Ruffle edging', definition: 'A border worked by increasing heavily into each stitch of the existing edge, causing the extra fabric to gather and frill outward.' },
    { slug: 'lace-border', term: 'Lace border', definition: 'A strip of open lacework added to the edge of a piece to give a decorative finish.' },
    { slug: 'right-side', term: 'Right side', definition: 'The face of the fabric intended to show on the outside of the finished item.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A long flat scarf with a plain shell lace body and a '), gt('ruffle-edging', 'ruffle edging'), t(' along both long sides. The ruffle is a '), gt('lace-border', 'lace border'), t(' that gathers heavily by working three stitches into every stitch of the edge.')),
      p(t('The '), gt('right-side', 'right side'), t(' of the body is kept facing up throughout to make the ruffle join invisible. A light wet block sets the ruffle in its gathered position without flattening it.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '225 g', substitutions: 'Extra yarn is needed for the ruffle. A single-ply wool gives a soft drape; plied cotton gives a crisper frill.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('16 tr by 8 rows = 10 x 10 cm in fingering with a 3.5 mm hook, blocked.')),
      h2('Finished size'),
      p(t('Body approximately 15 cm wide by 170 cm long. Ruffle adds approximately 5 cm to each long edge.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(t('dc (UK): double crochet')),
        li(gt('ruffle-edging', 'ruffle'), t(': 3 tr into the same stitch along the edge')),
        li(t('sl st: slip stitch')),
      ),
      h2('Body'),
      p(t('Chain 37. Work in a five-treble shell repeat as given for the Lace Scarf pattern (rows of five-tr shells separated by dc) until the body reaches 170 cm. Fasten off.')),
      h2('Ruffle edging'),
      p(t('With the right side facing, rejoin yarn at one corner of a long edge. Ch 3 (counts as first tr). Work 2 tr into the same st (3 tr total). *Work 3 tr into the next st along the edge*. Repeat all along the long edge to the far corner. Fasten off. Repeat on the other long edge.')),
      h2('Finishing'),
      p(t('Weave in all ends. Wet block: soak, press gently, pin the body to its dimensions, and allow the ruffle to gather naturally along each side. Leave to dry fully before unpinning.')),
    ],
  }
  const out = {
    slug, title: 'Ruffled lace scarf', subtitle: '', excerpt: 'A shell lace scarf with a gathered ruffle edging along both long sides. The ruffle is worked by trebling into every stitch of the edge.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Ruffle border technique synthesised from Victorian frill edgings documented in Weldon\'s Practical Crochet series 4 (1880s, Internet Archive). The body uses a standard shell lace repeat.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-shell-stitch', 'ruffle-edging', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-double-uk', 'ruffle-edging'],
    aliases: ['frill scarf crochet', 'ruffle lace scarf', 'shell scarf with ruffle'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '16 tr by 8 rows = 10 x 10 cm in fingering with a 3.5 mm hook, blocked.',
      finishedSizeText: 'Body approximately 15 cm wide by 170 cm long; ruffle adds 5 cm to each long edge.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-shell-stitch', 'ruffle-edging', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 7 ── snood-lace-crochet ────────────────────────────────────────────────────
{
  const slug = 'snood-lace-crochet'
  const glossaryTerms = [
    { slug: 'snood', term: 'Snood', definition: 'A wide tube of fabric worn over the head and neck like a hood, usually with a loose, open fit.' },
    { slug: 'treble-mesh', term: 'Treble mesh', definition: 'A lace structure made from evenly spaced trebles separated by one or two chains, creating a regular open grid.' },
    { slug: 'top-down', term: 'Top-down', definition: 'A construction method that begins at the head opening and works downward toward the neck edge.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A '), gt('snood', 'snood'), t('-style hooded cowl worked '), gt('top-down', 'top-down'), t(' in a simple '), gt('treble-mesh', 'treble mesh'), t(' using DK yarn. The open mesh gives a lightweight, drapey feel despite the thicker yarn, and the snood sits comfortably over the head in cold weather.')),
      p(t('The tube is 35 cm tall and 62 cm in circumference, fitting most adult heads with ease. DK yarn and a 4 mm hook make this one of the quickest patterns in this collection.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK weight yarn', qty: '150 g', substitutions: 'Wool DK has the most give; acrylic DK is machine washable.' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('12 tr by 6 rounds = 10 x 10 cm in treble mesh with a 4 mm hook, lightly blocked.')),
      h2('Finished size'),
      p(t('Approximately 62 cm circumference by 35 cm tall, lightly blocked.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(gt('treble-mesh', 'treble mesh'), t(': tr, ch 1, skip 1, repeat')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 74. Sl st to first ch to form a ring.')),
      h2('Round 1'),
      p(t('Ch 4 (counts as tr plus ch 1). *Skip 1 ch, tr into the next ch, ch 1*. Repeat around. Sl st to the 3rd ch of starting ch-4. (37 tr, 37 ch-1 spaces.)')),
      h2('Round 2'),
      p(t('Ch 4 (counts as tr plus ch 1). *Skip the ch-1 space, tr into the next tr, ch 1*. Repeat around. Sl st to 3rd ch of starting ch-4.')),
      p(t('Repeat Round 2 for 35 rounds total, or until the snood measures 35 cm from the foundation ring. Fasten off. Weave in ends.')),
    ],
  }
  const out = {
    slug, title: 'Snood lace cowl', subtitle: '', excerpt: 'A snood-style hooded cowl in open treble mesh using DK yarn and a 4 mm hook. Loose enough to pull over the head, and quick to work up.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Treble mesh snood synthesised from standard open mesh construction. Snood as a neck-and-head covering is documented in mid-20th-century British fashion knitting and crochet books.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh'],
    criticalTechniques: ['crochet-treble', 'crochet-in-the-round'],
    aliases: ['hooded cowl crochet', 'crochet snood', 'mesh hood cowl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk',
      primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '12 tr by 6 rounds = 10 x 10 cm in treble mesh with a 4 mm hook, lightly blocked.',
      finishedSizeText: 'Approximately 62 cm circumference by 35 cm tall, lightly blocked.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 8 ── lace-neck-wrap-crochet ────────────────────────────────────────────────
{
  const slug = 'lace-neck-wrap-crochet'
  const glossaryTerms = [
    { slug: 'neck-wrap', term: 'Neck wrap', definition: 'A narrow strip of fabric worn tied, pinned, or tucked around the neck, shorter than a scarf but wider than a collar.' },
    { slug: 'picot-edge', term: 'Picot edge', definition: 'A decorative border of small loops formed by chaining and slip-stitching back into the same stitch, creating tiny scalloped points.' },
    { slug: 'chain-space', term: 'Chain space', definition: 'The open loop formed by a chain within a pattern row, into which subsequent stitches are worked.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A narrow '), gt('neck-wrap', 'neck wrap'), t(' worked in a simple V-stitch lace, finished with a '), gt('picot-edge', 'picot edge'), t(' along both long sides. The strip is 10 cm wide and 100 cm long, giving enough length to tie in a loose knot or drape as a jabot.')),
      p(t('The V-stitch is one treble, one chain, one treble all into the same '), gt('chain-space', 'chain space'), t(' from the row below. It creates a pointed, airy fabric that opens further with blocking.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '100 g', substitutions: 'Silk or silk-blend fingering gives a luxurious drape. Cotton or wool both work.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('5 V-stitches by 8 rows = 10 x 10 cm in fingering with a 3.5 mm hook, blocked.')),
      h2('Finished size'),
      p(t('Approximately 10 cm wide by 100 cm long after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(t('V-stitch: [tr, ch 1, tr] all into the same chain space')),
        li(gt('picot-edge', 'picot edge'), t(': ch 3, sl st into first ch')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 25.')),
      h2('Row 1'),
      p(t('Work [tr, ch 1, tr] into the 6th ch from hook (first V-stitch). *Skip 2 ch, work [tr, ch 1, tr] into the next ch*. Repeat across. Tr into the last ch. Turn. (7 V-stitches.)')),
      h2('Row 2'),
      p(t('Ch 4 (counts as tr plus ch 1). *Work [tr, ch 1, tr] into the ch-1 space of the next V-stitch*. Repeat across. Tr into the turning chain. Turn.')),
      p(t('Repeat Row 2 until the wrap measures 100 cm. Fasten off.')),
      h2('Picot edge'),
      p(t('With the right side facing, rejoin yarn at one corner of a long edge. *Sl st into the next st, ch 3, sl st into the same st*. Repeat along the full length of the edge. Fasten off. Repeat on the other long edge. Weave in ends. Wet block to finished dimensions.')),
    ],
  }
  const out = {
    slug, title: 'Lace neck wrap', subtitle: '', excerpt: 'A narrow lace neck wrap in a V-stitch repeat with a picot border along both long edges. Fine fingering yarn and a 3.5 mm hook give a delicate finish.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'V-stitch lace construction synthesised from Victorian cravat and neck-wrap patterns documented in Weldon\'s Practical Crochet (various series, Internet Archive). Picot border is a standard period finish.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-v-stitch', 'picot-edging', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-v-stitch'],
    aliases: ['neck wrap crochet', 'lace cravat crochet', 'jabot crochet lace'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '5 V-stitches by 8 rows = 10 x 10 cm in fingering, blocked.',
      finishedSizeText: 'Approximately 10 cm wide by 100 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-v-stitch', 'picot-edging', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 9 ── pineapple-lace-scarf-crochet ─────────────────────────────────────────
{
  const slug = 'pineapple-lace-scarf-crochet'
  const glossaryTerms = [
    { slug: 'pineapple-motif', term: 'Pineapple motif', definition: 'A classic crochet lace shape formed by a series of treble clusters that decrease gradually toward a point, resembling the spines of a pineapple.' },
    { slug: 'base-mesh', term: 'Base mesh', definition: 'The open filet or chain ground from which pineapple clusters grow, providing the structural grid for the motif.' },
    { slug: 'cluster-decrease', term: 'Cluster decrease', definition: 'A group of trebles worked into the same stitch or space but not completed until the final step, which draws them together into a single top loop.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A long scarf built around a column of '), gt('pineapple-motif', 'pineapple motifs'), t(' running down the centre. Each pineapple grows from a '), gt('base-mesh', 'base mesh'), t(' of chain loops and shrinks through a series of '), gt('cluster-decrease', 'cluster decreases'), t(' to a point, then a new pineapple begins immediately below.')),
      p(t('Pineapple crochet takes patience but the motif is built from just two moves: chain arcs and treble clusters. Once the first pineapple is complete the rhythm becomes predictable.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '200 g', substitutions: 'A smooth, tightly-plied fingering shows the pineapple shape most clearly. Avoid hairy or textured yarns.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('One pineapple motif = approximately 9 cm tall by 8 cm wide after wet blocking. Measure the blocked motif to calibrate the finished scarf length.')),
      h2('Finished size'),
      p(t('Approximately 18 cm wide by 170 cm long after blocking (about 18 pineapples).')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(t('dc (UK): double crochet')),
        li(gt('pineapple-motif', 'pineapple motif'), t(': 13-row sequence of tr clusters into ch-loop arcs')),
        li(gt('cluster-decrease', 'cluster decrease'), t(': [yarn over, insert, pull up loop, yarn over, draw through 2 loops] repeated, then draw through all loops')),
        li(t('sl st: slip stitch')),
      ),
      h2('Foundation'),
      p(t('Chain 61 (width for one central pineapple column with open mesh on each side).')),
      h2('Row 1 (base mesh)'),
      p(t('Tr into the 8th ch from hook. *Ch 2, skip 2 ch, tr into the next ch*. Repeat across. Turn. (19 mesh squares.)')),
      h2('Starting the pineapple (rows 2 to 14)'),
      p(t('Row 2: Ch 5. *Tr into the next tr, ch 2*. Repeat to the 9th tr (centre). Into the 9th tr: ch 3, [tr, ch 1] x 13, tr, ch 3. Continue in mesh to end. Turn.')),
      p(t('Rows 3 to 13: Work mesh on the outer squares. For the pineapple centre: on each right-side row work dc into each ch-1 arc of the pineapple. On each wrong-side row work ch-5 arcs over the dc stitches, decreasing by one arc each time (12 arcs on row 3, 11 on row 5, and so on down to 1 arc on row 13).')),
      p(t('Row 14: Ch 5. Dc into the one remaining arc. Ch 5. Continue in mesh. This closes the pineapple point.')),
      p(t('Begin the next pineapple at Row 2 immediately. Repeat until the scarf reaches 170 cm. Fasten off. Wet block carefully to open up each motif.')),
    ],
  }
  const out = {
    slug, title: 'Pineapple lace scarf', subtitle: '', excerpt: 'A long fingering scarf with a repeating column of pineapple motifs down the centre. Each pineapple grows from a chain-arc base and tapers through cluster decreases.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'ADVANCED', sourceType: 'SYNTHESISED',
    sourceNotes: 'Pineapple crochet motif is documented extensively in 19th-century Irish and Continental lace crochet. Structure synthesised from Weldon\'s Practical Crochet (series 8-10, Internet Archive) and Priscilla Crochet Book (1909, Internet Archive).',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'pineapple-crochet', 'crochet-cluster', 'filet-crochet', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'pineapple-crochet', 'crochet-cluster'],
    aliases: ['pineapple crochet scarf', 'advanced lace scarf', 'Victorian pineapple scarf'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: 'One pineapple motif = approximately 9 cm tall by 8 cm wide after wet blocking.',
      finishedSizeText: 'Approximately 18 cm wide by 170 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'pineapple-crochet', 'crochet-cluster', 'filet-crochet', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 10 ── double-cowl-lace-crochet ────────────────────────────────────────────
{
  const slug = 'double-cowl-lace-crochet'
  const glossaryTerms = [
    { slug: 'v-stitch-lace', term: 'V-stitch lace', definition: 'A lace pattern made from pairs of trebles with a chain between them, worked into the chain space of the row below, creating a V shape on the fabric face.' },
    { slug: 'double-loop-cowl', term: 'Double loop cowl', definition: 'A cowl long enough to wrap twice around the neck, forming two layers of fabric for extra warmth.' },
    { slug: 'joining-seam', term: 'Joining seam', definition: 'A line of slip stitches or a sewn seam used to close a flat piece of crochet into a tube.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A '), gt('double-loop-cowl', 'double loop cowl'), t(' in '), gt('v-stitch-lace', 'V-stitch lace'), t(' worked flat then joined into a tube with a '), gt('joining-seam', 'joining seam'), t('. The flat construction makes the V-stitch repeat easier to follow because the right side always faces the same direction.')),
      p(t('The cowl panel is 40 cm wide and 100 cm long. Once the seam joins the short ends, the tube is 100 cm in circumference and is worn doubled to give two layers around the neck.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport weight yarn', qty: '175 g', substitutions: 'A DK yarn used with a 4 mm hook will give a similar drape with a slightly airier result.' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('6 V-stitches by 8 rows = 10 x 10 cm in sport with a 4 mm hook, blocked.')),
      h2('Finished size'),
      p(t('Approximately 40 cm wide panel, 100 cm long, giving a 100 cm circumference tube worn doubled.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(gt('v-stitch-lace', 'V-stitch'), t(': [tr, ch 1, tr] into the same ch-1 space')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 73.')),
      h2('Row 1'),
      p(t('Work [tr, ch 1, tr] into the 6th ch from hook. *Skip 2 ch, work [tr, ch 1, tr] into the next ch*. Repeat across to the last ch. Tr into the last ch. Turn. (23 V-stitches.)')),
      h2('Row 2'),
      p(t('Ch 4 (counts as tr plus ch 1). Work [tr, ch 1, tr] into each ch-1 space across. Tr into the turning chain. Turn.')),
      p(t('Repeat Row 2 until the panel measures 100 cm. Fasten off. Fold the panel so the short ends meet. With the tapestry needle and a length of yarn, sew a slip-stitch seam along the short ends. Weave in ends. Wet block the tube to the finished dimensions.')),
    ],
  }
  const out = {
    slug, title: 'Double loop lace cowl', subtitle: '', excerpt: 'A V-stitch lace cowl worked flat and seamed into a tube long enough to wear doubled around the neck. Sport yarn and a 4 mm hook.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'V-stitch lace and flat-seamed tube cowl construction synthesised from standard 20th-century crochet technique references.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-v-stitch', 'flat-seam-joining', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-v-stitch'],
    aliases: ['double loop cowl crochet', 'V-stitch cowl', 'long cowl crochet lace'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'sport',
      primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '6 V-stitches by 8 rows = 10 x 10 cm in sport, blocked.',
      finishedSizeText: 'Panel approximately 40 cm wide by 100 cm long; tube 100 cm circumference when doubled.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-v-stitch', 'flat-seam-joining', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 11 ── chevron-lace-scarf-crochet ──────────────────────────────────────────
{
  const slug = 'chevron-lace-scarf-crochet'
  const glossaryTerms = [
    { slug: 'chevron-repeat', term: 'Chevron repeat', definition: 'A zigzag pattern created by working increases at the peaks and decreases at the valleys of each row, so the stitch count remains constant.' },
    { slug: 'lace-increase', term: 'Lace increase', definition: 'Working multiple stitches into the same point to create a raised peak in a chevron or shell lace pattern.' },
    { slug: 'lace-decrease', term: 'Lace decrease', definition: 'Working stitches together at a valley point to pull the fabric inward and complete the zigzag shape.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A long scarf in a '), gt('chevron-repeat', 'chevron lace repeat'), t(' that creates a pointed zigzag texture along the length. The '), gt('lace-increase', 'increases'), t(' at each peak and the '), gt('lace-decrease', 'decreases'), t(' at each valley keep the stitch count even across every row.')),
      p(t('The repeat is 18 stitches wide, giving two full chevrons across the scarf. The zigzag also appears along the long edges, giving a naturally shaped border without any additional edging work.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '200 g', substitutions: 'A smooth, light-coloured yarn shows the chevron line most clearly.' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('One chevron repeat (18 sts) = 9 cm wide. 8 rows = 5 cm tall. Work a two-repeat swatch for at least 16 rows to get a reliable measurement.')),
      h2('Finished size'),
      p(t('Approximately 18 cm wide by 180 cm long after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(t('dc (UK): double crochet')),
        li(gt('lace-increase', 'peak increase'), t(': 5 tr into the same stitch')),
        li(gt('lace-decrease', 'valley decrease'), t(': skip 2 sts at the valley point')),
        li(t('sl st: slip stitch')),
      ),
      h2('Foundation'),
      p(t('Chain 37 (2 repeats of 18 sts, plus 1 turning chain).')),
      h2('Row 1 (right side)'),
      p(t('Dc into the 2nd ch from hook. *Skip 2 ch, work 5 tr into the next ch (peak), skip 2 ch, dc into the next ch, skip 2 ch, dc into the next ch (valley pair), skip 2 ch, work 5 tr into the next ch (peak), skip 2 ch, dc into the next ch*. Repeat for the second chevron. Turn.')),
      h2('Row 2'),
      p(t('Ch 3 (counts as first tr). Work 2 tr into the first dc (half peak). *Dc into the centre tr of the next peak, dc into the dc, dc into the next dc (valley), dc into the centre tr of the next peak, work 5 tr into the next dc (peak)*. End with 3 tr into the last dc. Turn.')),
      p(t('Repeat Rows 1 and 2 alternately until the scarf measures 180 cm. Fasten off. Wet block, pinning out the peaks and valleys firmly.')),
    ],
  }
  const out = {
    slug, title: 'Chevron lace scarf', subtitle: '', excerpt: 'A two-chevron lace scarf in fingering yarn. Increases at the peaks and decreases at the valleys create a natural zigzag edge with no separate border needed.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Chevron lace construction synthesised from Victorian ripple and chevron Afghan patterns documented in Weldon\'s Practical Crochet (series 6, Internet Archive), adapted to a narrower lace-weight scarf format.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'chevron-crochet', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'chevron-crochet'],
    aliases: ['chevron scarf crochet', 'zigzag lace scarf', 'ripple lace scarf'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: 'One chevron repeat (18 sts) = 9 cm wide; 8 rows = 5 cm tall.',
      finishedSizeText: 'Approximately 18 cm wide by 180 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'chevron-crochet', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 12 ── cluster-lace-cowl-crochet ───────────────────────────────────────────
{
  const slug = 'cluster-lace-cowl-crochet'
  const glossaryTerms = [
    { slug: 'cluster-stitch', term: 'Cluster stitch', definition: 'A group of trebles drawn together at the top to form a single stitch with a rounded, bobble-like head.' },
    { slug: 'lace-panel', term: 'Lace panel', definition: 'A defined section of open lace stitches within a fabric that is otherwise worked in a closer stitch.' },
    { slug: 'alternating-rounds', term: 'Alternating rounds', definition: 'A pattern structure where the cluster and chain positions swap every round so the clusters stack in a brick pattern rather than in vertical columns.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A cowl with alternating '), gt('cluster-stitch', 'cluster stitches'), t(' set between open '), gt('lace-panel', 'lace panels'), t('. The '), gt('alternating-rounds', 'alternating rounds'), t(' shift the clusters half a repeat sideways each time, creating a brick-laid texture across the fabric.')),
      p(t('The cowl is worked in the round in sport yarn. The stitch repeat is four stitches: one cluster, one chain, one double crochet, one chain. Eight stitches between panels gives the open ladder look on the vertical lines.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport weight yarn', qty: '175 g', substitutions: 'DK yarn used with a 4 mm hook gives a bulkier version of the same stitch.' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('4 cluster repeats by 6 rounds = 10 x 10 cm in sport with a 4 mm hook, blocked.')),
      h2('Finished size'),
      p(t('Approximately 60 cm circumference by 30 cm tall after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('dc (UK): double crochet')),
        li(gt('cluster-stitch', 'cluster'), t(': [yarn over, insert into st, pull up loop, yarn over, draw through 2 loops] x 3 into same st, yarn over, draw through all 4 loops')),
        li(gt('lace-panel', 'lace space'), t(': ch 1, dc into next st, ch 1 between clusters')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 120. Sl st to first ch to form a ring.')),
      h2('Round 1'),
      p(t('Ch 3 (counts as first tr of cluster). Complete the cluster into the first ch. *Ch 1, dc into the next ch, ch 1, work cluster into the next ch*. Repeat around. Ch 1, dc into the last ch, ch 1. Sl st to top of first cluster. (30 clusters.)')),
      h2('Round 2'),
      p(t('Ch 2. Work dc into the top of the first cluster. *Ch 1, work cluster into the next dc, ch 1, dc into the top of the next cluster*. Repeat around. Ch 1. Sl st to first dc. (30 clusters, positions shifted by half a repeat.)')),
      p(t('Repeat Rounds 1 and 2 alternately until the cowl measures 30 cm. Fasten off. Weave in ends. Wet block to finished dimensions.')),
    ],
  }
  const out = {
    slug, title: 'Cluster lace cowl', subtitle: '', excerpt: 'A sport yarn cowl in alternating cluster stitches with open lace panels between. The brickwork shift every round gives the fabric a honeycomb quality.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Cluster stitch lace cowl synthesised from cluster mesh construction documented across multiple 20th-century British crochet encyclopaedias.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-cluster', 'crochet-in-the-round', 'wet-blocking'],
    criticalTechniques: ['crochet-cluster', 'crochet-in-the-round'],
    aliases: ['cluster cowl crochet', 'bobble lace cowl', 'sport lace cowl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'sport',
      primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '4 cluster repeats by 6 rounds = 10 x 10 cm in sport, blocked.',
      finishedSizeText: 'Approximately 60 cm circumference by 30 cm tall after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-cluster', 'crochet-in-the-round', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 13 ── mesh-tube-scarf-crochet ─────────────────────────────────────────────
{
  const slug = 'mesh-tube-scarf-crochet'
  const glossaryTerms = [
    { slug: 'tube-scarf', term: 'Tube scarf', definition: 'A scarf formed as a hollow tube of fabric, worn stuffed or flat around the neck.' },
    { slug: 'cotton-sport', term: 'Cotton sport', definition: 'Sport weight yarn spun from cotton, which gives a smooth, cool fabric that drapes without stretching out of shape.' },
    { slug: 'open-lace-mesh', term: 'Open lace mesh', definition: 'A regular grid of chain spaces and single trebles creating a very open, breathable fabric ideal for warm-weather accessories.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A '), gt('tube-scarf', 'tube scarf'), t(' worked in the round in '), gt('cotton-sport', 'cotton sport'), t(' yarn. The '), gt('open-lace-mesh', 'open lace mesh'), t(' stitch makes the tube light and breathable, useful in spring or as a layering piece.')),
      p(t('The tube is 20 cm in diameter (circumference 62 cm) and 110 cm long, giving a generous drape when worn flat or folded double. Cotton sport blocks crisply and the mesh holds its shape without pinning.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport weight cotton yarn', qty: '150 g', substitutions: 'Cotton-linen blend works equally well. Avoid stretchy yarns as the tube can distort.' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('10 tr by 6 rounds = 10 x 10 cm in open mesh with a 4 mm hook in cotton sport, blocked.')),
      h2('Finished size'),
      p(t('Approximately 62 cm circumference by 110 cm long, blocked.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(gt('open-lace-mesh', 'open mesh'), t(': tr, ch 2, skip 2, repeat')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 60. Sl st to the first ch to form a ring.')),
      h2('Round 1'),
      p(t('Ch 5 (counts as tr plus ch 2). *Skip 2 ch, tr into the next ch, ch 2*. Repeat around. Sl st to the 3rd ch of starting ch-5. (20 tr, 20 ch-2 spaces.)')),
      h2('Round 2'),
      p(t('Ch 5 (counts as tr plus ch 2). *Skip the ch-2 space, tr into the next tr, ch 2*. Repeat around. Sl st to 3rd ch of starting ch-5.')),
      p(t('Repeat Round 2 for 110 rounds, or until the tube measures 110 cm from the foundation ring. Fasten off. Weave in ends. Wet block, pulling the tube gently into a uniform cylinder.')),
    ],
  }
  const out = {
    slug, title: 'Mesh tube scarf', subtitle: '', excerpt: 'A lightweight tube scarf in open mesh crochet using cotton sport yarn. Simple treble-and-chain-2 rounds work up quickly in the round.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Open mesh tube construction synthesised from standard filet mesh and tube crochet techniques widely documented from the early 20th century onward.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh', 'wet-blocking'],
    criticalTechniques: ['crochet-treble', 'crochet-in-the-round'],
    aliases: ['tube scarf crochet', 'cotton mesh scarf', 'circle scarf mesh crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'sport',
      primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '10 tr by 6 rounds = 10 x 10 cm in open mesh with a 4 mm hook, blocked.',
      finishedSizeText: 'Approximately 62 cm circumference by 110 cm long, blocked.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 14 ── mohair-cowl-lace-crochet ────────────────────────────────────────────
{
  const slug = 'mohair-cowl-lace-crochet'
  const glossaryTerms = [
    { slug: 'mohair-halo', term: 'Mohair halo', definition: 'The soft, fuzzy bloom of fibres that surrounds a mohair yarn, creating a light, misty appearance in the finished fabric.' },
    { slug: 'lace-weight-mohair', term: 'Lace weight mohair', definition: 'A very fine yarn spun mostly from kid mohair, used with an oversized hook to create a light, airy fabric.' },
    { slug: 'oversized-hook', term: 'Oversized hook', definition: 'A hook much larger than the yarn weight would normally require, used deliberately to create a very open, fluid fabric.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A loose, fluffy cowl in '), gt('lace-weight-mohair', 'lace weight mohair'), t(' worked on an '), gt('oversized-hook', 'oversized hook'), t(' to maximise the '), gt('mohair-halo', 'mohair halo'), t(' and create a cloud-like drape. The open treble mesh has very large chain-3 spaces that leave a lot of air in the fabric.')),
      p(t('The cowl works up in about 20 rounds and the mohair halo blurs the stitch definition to give a soft, romantic finish. This is the warmest cowl in this collection despite its open structure.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Lace weight mohair yarn', qty: '100 g', substitutions: 'Kid mohair lace is the classic choice. An 80/20 kid mohair and silk blend gives extra sheen.' },
        { name: '6 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('7 tr by 5 rounds = 10 x 10 cm in lace weight mohair with a 6 mm hook, unblocked. Mohair does not need blocking; measure after working.')),
      h2('Finished size'),
      p(t('Approximately 58 cm circumference by 26 cm tall, unblocked.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(gt('lace-weight-mohair', 'open mohair mesh'), t(': tr, ch 3, skip 3, repeat')),
        li(t('sl st: slip stitch')),
      ),
      h2('Pattern'),
      p(t('Foundation: chain 56. Sl st to first ch to form a ring.')),
      h2('Round 1'),
      p(t('Ch 6 (counts as tr plus ch 3). *Skip 3 ch, tr into the next ch, ch 3*. Repeat around. Sl st to the 3rd ch of starting ch-6. (14 tr, 14 ch-3 spaces.)')),
      h2('Round 2'),
      p(t('Ch 6 (counts as tr plus ch 3). *Skip the ch-3 space, tr into the next tr, ch 3*. Repeat around. Sl st to 3rd ch of starting ch-6.')),
      p(t('Repeat Round 2 for 20 rounds total, or until the cowl measures 26 cm. Fasten off. Thread the tapestry needle carefully through the mohair halo to weave in ends without breaking the fibres.')),
    ],
  }
  const out = {
    slug, title: 'Mohair lace cowl', subtitle: '', excerpt: 'A fluffy, cloud-like cowl in lace weight mohair on a 6 mm hook. Wide chain-3 spaces make an open mesh that lets the mohair halo bloom through.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Open-hook mohair mesh construction synthesised from modern textile practice. Mohair with oversized hook is a standard 21st-century approach to luxurious lightweight accessories.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh'],
    criticalTechniques: ['crochet-treble', 'crochet-in-the-round'],
    aliases: ['mohair cowl crochet', 'fluffy cowl crochet', 'halo cowl crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'lace',
      primaryHookSlug: 'crochet-hook-6-0mm',
      gaugeText: '7 tr by 5 rounds = 10 x 10 cm in lace weight mohair with a 6 mm hook, unblocked.',
      finishedSizeText: 'Approximately 58 cm circumference by 26 cm tall, unblocked.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-in-the-round', 'crochet-open-mesh'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

// ── 15 ── autumn-leaves-scarf-crochet ─────────────────────────────────────────
{
  const slug = 'autumn-leaves-scarf-crochet'
  const glossaryTerms = [
    { slug: 'leaf-motif', term: 'Leaf motif', definition: 'A shaped crochet unit that resembles a leaf, built from increases along a central spine and finished with a pointed tip.' },
    { slug: 'border-strip', term: 'Border strip', definition: 'A row of motifs worked along the outer edge of a piece as a decorative frame, leaving the centre in a simpler stitch.' },
    { slug: 'motif-join', term: 'Motif join', definition: 'A slip stitch or chain-space link used to attach individual crochet motifs to each other or to the body of a piece as they are worked.' },
  ]
  const body = {
    type: 'doc',
    content: [
      p(t('A long scarf with a plain mesh body and a '), gt('border-strip', 'border strip'), t(' of '), gt('leaf-motif', 'leaf motifs'), t(' along both short ends. The leaves are worked separately and then joined to the body with a '), gt('motif-join', 'motif join'), t(' of sl sts along the short edge.')),
      p(t('Each leaf motif is 8 cm tall by 5 cm wide after blocking. Five leaves sit side by side at each end, covering the full 25 cm width of the scarf. The autumn palette suits warm russet or gold fingering yarn.')),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn, main colour', qty: '175 g', substitutions: 'Any smooth fingering. Earthy tones work beautifully for the leaf border.' },
        { name: 'Fingering weight yarn, contrast colour for leaves', qty: '50 g' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Craft scissors', qty: '1 pair' },
        { name: 'Soft measuring tape', qty: '1' },
      ]),
      h2('Gauge'),
      p(t('14 tr by 8 rows = 10 x 10 cm in mesh in fingering with a 3.5 mm hook, blocked. One leaf = 8 cm tall by 5 cm wide after blocking.')),
      h2('Finished size'),
      p(t('Approximately 25 cm wide by 175 cm long including the leaf borders, after blocking.')),
      h2('Stitches used'),
      ul(
        li(t('ch: chain')),
        li(t('tr (UK): treble')),
        li(t('dc (UK): double crochet')),
        li(gt('leaf-motif', 'leaf motif'), t(': increases along a ch-spine with dc at the tip')),
        li(gt('motif-join', 'motif join'), t(': sl st through the edge stitch of the body and the leaf base simultaneously')),
        li(t('sl st: slip stitch')),
      ),
      h2('Body'),
      p(t('In the main colour, chain 61. Work in a simple V-stitch repeat (as given for the Lace Neck Wrap) until the body measures 155 cm. Fasten off.')),
      h2('Leaf motif (make 10)'),
      p(t('In the contrast colour, chain 12.')),
      ol(
        li(t('Row 1 (spine): dc into the 2nd ch from hook. Dc across to the last ch. Work 3 dc into the last ch (tip). Rotate work, dc back along the other side of the foundation chain to the start. Do not turn.')),
        li(t('Row 2 (increases): Ch 1. Work 2 dc into each st around the outer edge of the leaf, working 3 dc into the tip st. Sl st to join. Fasten off.')),
      ),
      h2('Joining the leaves'),
      p(t('Block all 10 leaves. Lay five leaves along one short end of the body, aligning their bases with the scarf edge. With the tapestry needle and main colour yarn, slip-stitch the base of each leaf to the scarf edge. Repeat at the other short end. Weave in all ends.')),
    ],
  }
  const out = {
    slug, title: 'Autumn leaves scarf', subtitle: '', excerpt: 'A mesh lace scarf with a border of leaf motifs at both short ends. Ten leaf motifs are worked separately and joined to the body after blocking.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Leaf motif construction synthesised from Victorian botanical lace crochet documented in Weldon\'s Practical Crochet series 5-7 (Internet Archive). Motif-join technique is standard mid-20th-century practice.',
    techniqueSlugs: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-motif', 'crochet-v-stitch', 'motif-join', 'wet-blocking'],
    criticalTechniques: ['crochet-double-uk', 'crochet-motif', 'motif-join'],
    aliases: ['leaf scarf crochet', 'autumn lace scarf', 'leaf border scarf crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering',
      primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '14 tr by 8 rows = 10 x 10 cm in mesh, blocked. One leaf = 8 cm tall by 5 cm wide.',
      finishedSizeText: 'Approximately 25 cm wide by 175 cm long including leaf borders, after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: ['crochet-chain-foundation', 'crochet-treble', 'crochet-double-uk', 'crochet-motif', 'crochet-v-stitch', 'motif-join', 'wet-blocking'],
    },
    recipeTools: TOOLS,
    body,
  }
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out, null, 2))
  console.log(`Written: ${slug}`)
}

console.log('Done. All 15 lacework patterns written.')
