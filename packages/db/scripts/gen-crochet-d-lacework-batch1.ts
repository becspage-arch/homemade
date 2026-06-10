/**
 * Generator: D-Lacework Batch 1 -- L1-L10 Lace Shawls
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/gen-crochet-d-lacework-batch1.ts
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
function supplies(heading: string, items: { name: string; qty: string }[]) {
  return { type: 'suppliesCard', attrs: { heading, items } }
}

const TOOLS = [
  { slug: 'crochet-hook', isOptional: false },
  { slug: 'tapestry-needle', isOptional: false },
  { slug: 'craft-scissors', isOptional: false },
  { slug: 'measuring-tape-soft', isOptional: false },
]

function out(slug: string, data: object) {
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(data, null, 2))
  console.log(`wrote ${slug}.json`)
}

// ── L1: triangle-lace-shawl-crochet ──────────────────────────────────────────
{
  const slug = 'triangle-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-treble-fan', 'crochet-lace-blocking', 'crochet-top-down-triangle', 'crochet-chain-space']
  const criticalTechniques = ['crochet-treble-fan', 'crochet-lace-blocking', 'crochet-top-down-triangle']
  const glossaryTerms = [
    { slug: 'treble-fan-l1', term: 'Treble fan', definition: 'Five or more treble crochets worked into a single chain space, spreading into a fan shape. The core unit of fan lace patterns.' },
    { slug: 'top-down-triangle-l1', term: 'Top-down triangle', definition: 'A shawl construction that starts with a small chain at the spine and increases at each side and the centre on every right-side row, building outward from the top point.' },
    { slug: 'blocking-l1', term: 'Blocking', definition: 'Wetting or steaming the finished shawl and pinning it to its full dimensions while it dries. Essential for opening up lace stitches to their proper shape.' },
    { slug: 'chain-space-l1', term: 'Chain space', definition: 'An arch of chain stitches in a lace row that creates an open gap for the treble fan to sit into on the following row.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('This shawl starts with three chains at the spine and grows by increases at each side edge and the centre spine on every right-side row. The '),
        gt('treble-fan-l1', 'treble fan'),
        t(' repeat alternates with '),
        gt('chain-space-l1', 'chain spaces'),
        t(' to create an open lace fabric. The '),
        gt('top-down-triangle-l1', 'top-down triangle'),
        t(' shape means you can stop at any depth you like and the shawl will be complete.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '400 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('3 fan repeats x 8 rows = 10 x 10 cm after blocking. Gauge is approximate in lace; finished size is more important than row count.')),
      h2('Pattern notes'),
      p(t('Fan repeat (worked over 9 sts): dc, ch 3, skip 3, 5 tr in next st, ch 3, skip 3, dc. On the following row work chain spaces into the tr cluster. The spine increase is 3 tr into the centre chain space on every right-side row.')),
      h2('Foundation'),
      p(t('Chain 6. Row 1 (right side): dc in 4th ch from hook, ch 3, dc in last ch. Turn. (3 sts, 1 ch-sp)')),
      h2('Body'),
      p(
        t('Row 2 (wrong side): ch 4 (counts as tr), 2 tr in first st, ch 3, 3 tr in last st. Turn.'),
      ),
      p(
        t('Row 3 (right side): ch 3 (counts as dc), '),
        gt('treble-fan-l1', 'fan'),
        t(' in ch-sp, ch 3, 5 tr in centre sp (spine increase), ch 3, fan in ch-sp, dc in top of t-ch. Turn.'),
      ),
      p(t('Continue in pattern, working a fan into each chain space and a 5-tr spine increase at the centre on every right-side row. On wrong-side rows, chain 3 between each cluster. Work to approximately 52 cm depth (about 34 right-side rows) or until yarn is almost used, leaving 2 m for the border.')),
      h2('Border'),
      p(t('Final row: ch 1, dc evenly along each edge. Work 3 dc into each corner point. Join with slip stitch. Fasten off.')),
      h2('Finishing'),
      p(
        t('Weave in all ends. Wet the shawl, press out excess water, then pin it to shape on a mat using blocking pins. '),
        gt('blocking-l1', 'Blocking'),
        t(' opens the fans and sets the wingspan. Leave flat until fully dry.'),
      ),
      h2('What to crochet next'),
      p(t('The crescent lace shawl uses the same fingering yarn with shell stitch rows for a curved shape that sits neatly at the back of the shoulders.')),
    ],
  }

  out(slug, {
    slug, title: 'Triangle lace shawl', subtitle: '',
    excerpt: 'A top-down crochet triangle shawl in fingering yarn with a treble fan lace repeat. Increases at each side and the centre spine build an open lace fabric.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Top-down triangle shawl construction with fan lace is a standard modern crochet shawl form. No single public-domain source.',
    techniqueSlugs, criticalTechniques, aliases: ['triangle lace shawl crochet', 'top down shawl crochet', 'fan lace shawl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '3 fan repeats x 8 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 160 cm wingspan x 80 cm depth after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L2: crescent-lace-shawl-crochet ──────────────────────────────────────────
{
  const slug = 'crescent-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-shell-stitch', 'crochet-lace-blocking', 'crochet-crescent-shaping', 'crochet-short-rows']
  const criticalTechniques = ['crochet-shell-stitch', 'crochet-lace-blocking', 'crochet-crescent-shaping']
  const glossaryTerms = [
    { slug: 'crescent-shaping-l2', term: 'Crescent shaping', definition: 'A shawl form where stitches increase faster at the outer edge than at the inner edge, pulling the fabric into a curved arc that sits flat against the back.' },
    { slug: 'shell-stitch-l2', term: 'Shell stitch', definition: 'A group of treble crochets worked into the same stitch or space, fanning out into a curved cluster. In this pattern each shell is 5 tr.' },
    { slug: 'blocking-l2', term: 'Blocking', definition: 'Wetting the finished shawl and pinning it to its full crescent shape on a blocking mat while it dries. This opens the lace and fixes the curve.' },
    { slug: 'turning-chain-l2', term: 'Turning chain', definition: 'A chain worked at the start of a row to raise the hook to the correct height before the first stitch. In treble rows the turning chain is 3 chains.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('The crescent shawl curves because you add stitches faster at the outer edge than at the inner edge. Each '),
        gt('shell-stitch-l2', 'shell stitch'),
        t(' row uses '),
        gt('turning-chain-l2', 'turning chains'),
        t(' at both ends to shape the arc. '),
        gt('crescent-shaping-l2', 'Crescent shaping'),
        t(' keeps the shawl from standing out from the shoulders.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '450 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('2 shells x 8 rows = 10 x 10 cm in shell stitch after blocking.')),
      h2('Pattern notes'),
      p(t('Shell: 5 tr into the same ch-sp. Chain-1 between shells. Outer-edge increase: work 2 shells into the final chain space of each right-side row.')),
      h2('Foundation'),
      p(t('Chain 30. Row 1 (right side): dc in 4th ch from hook, * ch 1, skip 2, 5 tr in next ch (shell), ch 1, skip 2, dc; rep from * to end. Turn. (4 shells)')),
      h2('Body'),
      p(
        t('Row 2 (wrong side): ch 3, dc into each ch-1 sp with ch 1 between. Turn.'),
      ),
      p(
        t('Row 3 (right side): ch 3, dc, * ch 1, '),
        gt('shell-stitch-l2', 'shell'),
        t(' in ch-sp, ch 1, dc; rep. At outer (right) edge work 2 shells into final ch-sp (increase). Turn.'),
      ),
      p(t('Repeat rows 2 and 3, adding one extra shell at the outer edge of every right-side row. Work to 22 cm depth (about 18 rows) or until yarn is almost used.')),
      h2('Border'),
      p(t('Work 1 round of dc evenly along all edges, placing 3 dc at each point. Fasten off.')),
      h2('Finishing'),
      p(
        t('Weave in ends. Wet the shawl and pin to a full crescent shape on a blocking mat. '),
        gt('blocking-l2', 'Blocking'),
        t(' sets the curve and opens the shells. Leave flat until dry.'),
      ),
      h2('What to crochet next'),
      p(t('The rectangular lace shawl uses a dc mesh on a straight rectangle. It is the simplest shape in the collection.')),
    ],
  }

  out(slug, {
    slug, title: 'Crescent lace shawl', subtitle: '',
    excerpt: 'A crescent-shaped crochet shawl in fingering yarn with shell stitch rows. Faster increases at the outer edge pull the fabric into a gentle curve.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Crescent shawl construction is a modern crochet form. No single public-domain source.',
    techniqueSlugs, criticalTechniques, aliases: ['crescent shawl crochet', 'shell stitch shawl curved', 'crochet crescent wrap'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '2 shells x 8 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 150 cm outer edge x 30 cm depth at centre after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L3: rectangular-lace-shawl-crochet ───────────────────────────────────────
{
  const slug = 'rectangular-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-dc-mesh', 'crochet-lace-blocking', 'crochet-reversible-fabric']
  const criticalTechniques = ['crochet-dc-mesh', 'crochet-lace-blocking']
  const glossaryTerms = [
    { slug: 'dc-mesh-l3', term: 'Dc mesh', definition: 'A lace fabric of double crochet stitches separated by chain spaces. Each dc sits above the dc of the previous row; the chain spaces form the open grid.' },
    { slug: 'blocking-l3', term: 'Blocking', definition: 'Wetting and pinning the finished rectangle to its full dimensions on a blocking mat. The mesh opens fully to its grid pattern once dry.' },
    { slug: 'reversible-l3', term: 'Reversible fabric', definition: 'A fabric that looks the same from both sides. The dc mesh is reversible because the chain spaces read as open grid from either face.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('The '),
        gt('dc-mesh-l3', 'dc mesh'),
        t(' is the simplest lace fabric in crochet. It produces a '),
        gt('reversible-l3', 'reversible'),
        t(' open grid that looks clean from both sides, making it ideal for a rectangle shawl worn as a wrap or a stole.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '500 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('8 dc-mesh repeats x 12 rows = 10 x 10 cm after blocking.')),
      h2('Pattern notes'),
      p(t('Mesh row: ch 4 (counts as dc, ch 1), * dc in next dc, ch 1; rep to end, dc in top of t-ch. The foundation chain sets the width; use a multiple of 2 plus 1.')),
      h2('Foundation'),
      p(t('Chain 73 (for 35 repeats, approx. 45 cm wide after blocking). Row 1: dc in 4th ch from hook, * ch 1, skip 1 ch, dc in next ch; rep to end. Turn. (36 dc)')),
      h2('Body'),
      p(
        t('Every row: ch 4, * '),
        gt('dc-mesh-l3', 'dc'),
        t(' in next dc, ch 1; rep to end, dc in top of t-ch. Turn.'),
      ),
      p(t('Work to 200 cm length (approx. 240 rows) or desired length. The rectangle can be any length you like.')),
      h2('Finishing'),
      p(
        t('Fasten off. Weave in ends. Wet the piece and pin it flat to its full dimensions. '),
        gt('blocking-l3', 'Blocking'),
        t(' opens the mesh grid and straightens the edges. Leave flat until fully dry.'),
      ),
      h2('What to crochet next'),
      p(t('The fan lace shawl adds treble fan clusters to the same mesh base for a wider, more decorative shawl.')),
    ],
  }

  out(slug, {
    slug, title: 'Rectangular lace shawl', subtitle: '',
    excerpt: 'A reversible rectangular shawl in fingering yarn worked as a dc mesh grid. Simple to make and adapts to any length.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Dc mesh lace is a classic crochet stitch dating to nineteenth-century hairpin and filet traditions.',
    techniqueSlugs, criticalTechniques, aliases: ['rectangular lace shawl crochet', 'crochet stole lace', 'dc mesh wrap'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '8 dc-mesh repeats x 12 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 45 cm wide x 200 cm long after blocking. Adjustable.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L4: fan-lace-shawl-crochet ────────────────────────────────────────────────
{
  const slug = 'fan-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-fan-and-shell', 'crochet-lace-blocking', 'crochet-wingspan-shawl']
  const criticalTechniques = ['crochet-fan-and-shell', 'crochet-lace-blocking']
  const glossaryTerms = [
    { slug: 'fan-repeat-l4', term: 'Fan repeat', definition: 'A sequence of 7 treble crochets worked into the same chain space, creating a wide fan. Each fan sits between two dc stitches.' },
    { slug: 'wingspan-l4', term: 'Wingspan', definition: 'The total width of a shawl measured from tip to tip along the top edge. A wide-wingspan shawl is worn across the shoulders like a stole.' },
    { slug: 'blocking-l4', term: 'Blocking', definition: 'Wetting and pinning the shawl to its full wingspan and depth. Fan stitch opens dramatically when blocked, doubling the apparent width of each fan.' },
    { slug: 'shell-repeat-l4', term: 'Shell repeat', definition: 'The 11-stitch horizontal unit of this pattern. The foundation chain must be a multiple of 11 plus 2 for the fans to land evenly.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('This shawl uses a 7-tr '),
        gt('fan-repeat-l4', 'fan'),
        t(' over an 11-stitch '),
        gt('shell-repeat-l4', 'shell repeat'),
        t('. The wide fans and the open chain spaces between them produce a generous '),
        gt('wingspan-l4', 'wingspan'),
        t(' without a huge yarn quantity. The rectangle is worked lengthwise so you can stop at any width.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '600 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('1 fan repeat x 4 rows = 11 x 8 cm after blocking.')),
      h2('Pattern notes'),
      p(t('Fan: 7 tr into same ch-sp. Row A (right side): ch 3, dc, * ch 3, skip 4, fan in next ch-sp, ch 3, skip 4, dc; rep. Row B (wrong side): ch 6 (counts as tr, ch 3), * dc in top of fan, ch 3, tr in dc; rep. Repeat rows A and B.')),
      h2('Foundation'),
      p(t('Chain 46 (3 fan repeats, approx. 33 cm wide before blocking). Row 1 (right side): dc in 4th ch, * ch 3, skip 4, 7 tr in next ch, ch 3, skip 4, dc; rep to end. Turn. (3 fans)')),
      h2('Body'),
      p(
        t('Row 2 (wrong side): ch 6, * dc in top of '),
        gt('fan-repeat-l4', 'fan'),
        t(' (4th tr), ch 3, tr in next dc; rep, end tr in top of t-ch. Turn.'),
      ),
      p(t('Row 3 (right side): ch 3, dc in first tr, * ch 3, fan in dc, ch 3, dc in tr; rep, end dc in t-ch. Turn.')),
      p(t('Repeat rows 2 and 3 until work measures 185 cm (approx. 46 row-pairs) or yarn is nearly used. Fasten off.')),
      h2('Finishing'),
      p(
        t('Weave in ends. Wet the shawl and pin to full '),
        gt('wingspan-l4', 'wingspan'),
        t(' and depth on a blocking mat. '),
        gt('blocking-l4', 'Blocking'),
        t(' opens the fans to their full spread. Leave flat until dry.'),
      ),
      h2('What to crochet next'),
      p(t('The pineapple lace shawl uses a classic pineapple motif panel set between plain treble columns for a more structured look.')),
    ],
  }

  out(slug, {
    slug, title: 'Fan lace shawl', subtitle: '',
    excerpt: 'A wide-wingspan crochet shawl in fingering yarn with a 7-treble fan repeat over an 11-stitch unit. Worked lengthwise for easy sizing.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Fan-and-shell lace is a classic crochet stitch from Victorian and Edwardian pattern books. No single public-domain source.',
    techniqueSlugs, criticalTechniques, aliases: ['fan lace shawl crochet', 'fan and shell shawl', 'wide wingspan shawl crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '1 fan repeat x 4 rows = 11 x 8 cm after blocking.',
      finishedSizeText: 'Approx. 185 cm wingspan x 33 cm depth after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L5: pineapple-lace-shawl-crochet ─────────────────────────────────────────
{
  const slug = 'pineapple-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-pineapple-motif', 'crochet-lace-blocking', 'crochet-treble-columns', 'crochet-dc-mesh']
  const criticalTechniques = ['crochet-pineapple-motif', 'crochet-lace-blocking']
  const glossaryTerms = [
    { slug: 'pineapple-motif-l5', term: 'Pineapple motif', definition: 'A teardrop-shaped lace panel built from rows of decreasing treble clusters over chain spaces. The cluster count drops by one each row until a single dc closes the tip.' },
    { slug: 'treble-column-l5', term: 'Treble column', definition: 'A vertical line of single treble crochets worked between the pineapple panels. Separates each motif and gives the fabric a structured grid.' },
    { slug: 'blocking-l5', term: 'Blocking', definition: 'Wetting and pinning the shawl flat to its full dimensions. Pineapple motifs must be blocked to show their teardrop shape clearly.' },
    { slug: 'dc-mesh-l5', term: 'Dc mesh', definition: 'A simple open grid of dc stitches and chain spaces used as the background around the pineapple panels.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('The '),
        gt('pineapple-motif-l5', 'pineapple motif'),
        t(' is a classic crochet lace form. Each panel is a row of decreasing treble clusters flanked by '),
        gt('treble-column-l5', 'treble columns'),
        t('. The background uses a '),
        gt('dc-mesh-l5', 'dc mesh'),
        t(' to keep the work light. Work the shawl as a flat rectangle with three pineapple panels across the width.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '550 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('1 pineapple panel (14 sts wide) x 18 rows tall = 9 x 10 cm after blocking.')),
      h2('Pattern notes'),
      p(t('Pineapple base: 12 dc into a ch-4 space. Row 2: ch 3, tr in each dc, ch 3, tr. Row 3 onward: dc at start and end, ch 2, (tr, ch 1) across reducing by 1 cluster per row. Final row: dc in the single remaining ch-sp. The pineapple repeats every 14 sts. Place a tr column (1 tr) between each panel and at each edge.')),
      h2('Foundation'),
      p(t('Chain 50. Row 1: establish 3 pineapple bases of 12 dc separated by tr columns. Turn.')),
      h2('Body'),
      p(
        t('Work the '),
        gt('pineapple-motif-l5', 'pineapple'),
        t(' decrease rows for each panel simultaneously. When a panel closes, replace it with '),
        gt('dc-mesh-l5', 'dc mesh'),
        t(' for 3 rows, then start the next pineapple from the bottom of the same space. Continue for 160 cm total length.'),
      ),
      h2('Finishing'),
      p(
        t('Fasten off. Weave in ends. Wet the shawl and pin it to its full rectangle with each pineapple panel spread to its teardrop outline. '),
        gt('blocking-l5', 'Blocking'),
        t(' is essential to show the motif shape. Leave flat until dry.'),
      ),
      h2('What to crochet next'),
      p(t('The shell stitch shawl uses a simpler all-over shell repeat in sport weight yarn for a faster, beginner-friendly project.')),
    ],
  }

  out(slug, {
    slug, title: 'Pineapple lace shawl', subtitle: '',
    excerpt: 'A rectangular crochet shawl in fingering yarn with three pineapple motif panels across the width separated by treble columns and a dc mesh background.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Pineapple crochet lace has roots in Victorian thread lace. The motif appears across European pattern books from the 1880s onward.',
    techniqueSlugs, criticalTechniques, aliases: ['pineapple crochet shawl', 'pineapple lace stole', 'crochet pineapple motif shawl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '1 pineapple panel x 18 rows = 9 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 42 cm wide x 160 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L6: shell-stitch-shawl-crochet ───────────────────────────────────────────
{
  const slug = 'shell-stitch-shawl-crochet'
  const techniqueSlugs = ['crochet-shell-stitch', 'crochet-lace-blocking', 'crochet-rectangle-shawl']
  const criticalTechniques = ['crochet-shell-stitch', 'crochet-lace-blocking']
  const glossaryTerms = [
    { slug: 'shell-l6', term: 'Shell stitch', definition: 'Five treble crochets worked into the same stitch or chain space. The clustered stitches spread into a fan shape on each row.' },
    { slug: 'dc-spacer-l6', term: 'Dc spacer', definition: 'A single double crochet placed between shells. It sits in the centre of the shell below and keeps the pattern aligned from row to row.' },
    { slug: 'blocking-l6', term: 'Blocking', definition: 'Wetting and pinning the finished shawl flat to its full dimensions. Shell stitch opens noticeably when blocked, spreading the fans.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('This shawl uses a simple '),
        gt('shell-l6', 'shell stitch'),
        t(' repeat with a '),
        gt('dc-spacer-l6', 'dc spacer'),
        t(' between each shell. The pattern is the same on every right-side row and the same on every wrong-side row, making it easy to memorise quickly. Sport weight yarn gives a slightly denser fabric suitable for a beginner.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Sport weight yarn', qty: '450 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('2 shells x 6 rows = 10 x 10 cm after blocking.')),
      h2('Pattern notes'),
      p(t('Shell: 5 tr in same st. Right-side row: ch 3, * dc in top of shell (3rd tr), ch 2, shell in dc; rep, dc in top of t-ch. Wrong-side row: ch 3, * shell in dc, ch 2, dc in 3rd tr of shell; rep, end tr in t-ch.')),
      h2('Foundation'),
      p(t('Chain 50 (6 shell repeats, approx. 40 cm wide). Row 1 (right side): shell in 4th ch from hook, * skip 4, dc in next ch, skip 4, shell in next ch; rep, skip 4, dc in last ch. Turn. (5 shells)')),
      h2('Body'),
      p(
        t('Row 2 (wrong side): ch 3, * '),
        gt('shell-l6', 'shell'),
        t(' in dc, ch 2, '),
        gt('dc-spacer-l6', 'dc spacer'),
        t(' in 3rd tr of shell; rep. Turn.'),
      ),
      p(t('Row 3 (right side): ch 3, dc in first shell, * ch 2, shell in dc, ch 2, dc in shell; rep, end tr in t-ch. Turn.')),
      p(t('Repeat rows 2 and 3 for 160 cm length (approx. 96 rows) or until yarn is nearly used.')),
      h2('Finishing'),
      p(
        t('Fasten off. Weave in ends. Wet the shawl and pin to full dimensions. '),
        gt('blocking-l6', 'Blocking'),
        t(' opens the shells. Leave flat until dry.'),
      ),
      h2('What to crochet next'),
      p(t('The v-stitch shawl uses a lighter v-stitch repeat in fingering yarn for an even airier wrap.')),
    ],
  }

  out(slug, {
    slug, title: 'Shell stitch shawl', subtitle: '',
    excerpt: 'A beginner-friendly crochet shawl in sport yarn with a simple shell stitch repeat. The same two rows alternate throughout for easy memorisation.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'Shell stitch lace rectangles appear in crochet publications from the early twentieth century onward.',
    techniqueSlugs, criticalTechniques, aliases: ['shell stitch shawl crochet', 'beginner crochet shawl', 'sport yarn lace shawl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'sport', primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '2 shells x 6 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 40 cm wide x 160 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L7: v-stitch-shawl-crochet ────────────────────────────────────────────────
{
  const slug = 'v-stitch-shawl-crochet'
  const techniqueSlugs = ['crochet-v-stitch', 'crochet-lace-blocking', 'crochet-rectangle-shawl']
  const criticalTechniques = ['crochet-v-stitch', 'crochet-lace-blocking']
  const glossaryTerms = [
    { slug: 'v-stitch-l7', term: 'V-stitch', definition: 'Two treble crochets worked into the same chain space with a chain-1 between them. The pair sits in the ch-1 space of the v-stitch below, creating a diagonal grid.' },
    { slug: 'blocking-l7', term: 'Blocking', definition: 'Wetting and pinning the finished wrap to its full dimensions. V-stitch opens to a very airy mesh when blocked, almost doubling apparent size.' },
    { slug: 'drape-l7', term: 'Drape', definition: 'The way fabric hangs under its own weight. V-stitch in fingering yarn has excellent drape, making it suitable for a lightweight wrap worn over the shoulders.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('The '),
        gt('v-stitch-l7', 'v-stitch'),
        t(' produces one of the most open lace fabrics in crochet. Each pair of trebles sits in the gap left by the pair below, building a diagonal lattice with excellent '),
        gt('drape-l7', 'drape'),
        t('. Fingering yarn keeps the weight low.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '350 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('5 v-stitches x 7 rows = 10 x 10 cm after blocking.')),
      h2('Pattern notes'),
      p(t('V-stitch: (tr, ch 1, tr) in same ch-1 sp. Every row: ch 4 (counts as tr, ch 1), * v-stitch in ch-1 sp of v below; rep to end, tr in top of t-ch. The foundation chain needs a multiple of 2.')),
      h2('Foundation'),
      p(t('Chain 61. Row 1: tr in 6th ch from hook, * ch 1, skip 1, (tr, ch 1, tr) in next ch; rep, ch 1, skip 1, tr in last ch. Turn.')),
      h2('Body'),
      p(
        t('Every row: ch 4, * '),
        gt('v-stitch-l7', 'v-stitch'),
        t(' in next ch-1 sp; rep to end, tr in top of t-ch. Turn.'),
      ),
      p(t('Work until piece is 175 cm long (approx. 120 rows) or yarn is nearly used.')),
      h2('Finishing'),
      p(
        t('Fasten off. Weave in ends. Wet the wrap and pin to full dimensions. '),
        gt('blocking-l7', 'Blocking'),
        t(' opens the v-stitch lattice to its full '),
        gt('drape-l7', 'drape'),
        t('. Leave flat until dry.'),
      ),
      h2('What to crochet next'),
      p(t('The granny lace shawl adds a granny square border to a simple dc body, suitable for those comfortable with granny squares.')),
    ],
  }

  out(slug, {
    slug, title: 'V-stitch lace wrap', subtitle: '',
    excerpt: 'A lightweight crochet wrap in fingering yarn built entirely from the v-stitch repeat. Very open and airy once blocked, with excellent drape.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'BEGINNER', sourceType: 'SYNTHESISED',
    sourceNotes: 'V-stitch lace is a foundational crochet stitch. No single public-domain source.',
    techniqueSlugs, criticalTechniques, aliases: ['v stitch shawl crochet', 'crochet lightweight wrap', 'v stitch lace wrap'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '5 v-stitches x 7 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 50 cm wide x 175 cm long after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L8: granny-lace-shawl-crochet ─────────────────────────────────────────────
{
  const slug = 'granny-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-granny-square', 'crochet-lace-blocking', 'crochet-join-as-you-go', 'crochet-dc-border']
  const criticalTechniques = ['crochet-granny-square', 'crochet-lace-blocking', 'crochet-join-as-you-go']
  const glossaryTerms = [
    { slug: 'granny-square-l8', term: 'Granny square', definition: 'A small square motif built from tr clusters separated by chain spaces, worked in the round from a centre ring. The classic three-cluster-per-side format is used here.' },
    { slug: 'jayg-l8', term: 'Join-as-you-go', definition: 'A technique for joining motifs during the final round of each new square. A slip stitch replaces one chain in the corner or side space of the adjacent square, eliminating seaming.' },
    { slug: 'blocking-l8', term: 'Blocking', definition: 'Wetting and pinning the finished shawl to straighten and open the granny border. Each square should be pinned to its exact dimensions to keep the grid even.' },
    { slug: 'dc-border-l8', term: 'Dc border', definition: 'A round of double crochet worked around the outer edge of the assembled shawl to neaten and unify the edge.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('This shawl combines a plain dc body with a border of '),
        gt('granny-square-l8', 'granny squares'),
        t(' joined using '),
        gt('jayg-l8', 'join-as-you-go'),
        t('. The body is a simple dc rectangle; the border is a single row of squares attached as each one is finished. A final '),
        gt('dc-border-l8', 'dc border'),
        t(' round ties the two elements together.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'DK weight yarn (main)', qty: '300 m' },
        { name: 'DK weight yarn (contrast for squares)', qty: '150 m' },
        { name: '4 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('1 granny square = 8 x 8 cm after blocking. Body: 18 dc x 22 rows = 10 x 10 cm.')),
      h2('Pattern notes'),
      p(t('Granny square (worked in 3 rounds): Round 1: 12 dc in magic ring. Round 2: ch 3, 2 tr in same st, ch 2 (corner), * 3 tr in next st, ch 1, 3 tr in next st, ch 2; rep 3 times, join. Round 3: sl st to corner, ch 3, (2 tr, ch 2, 3 tr) in corner, * ch 1, 3 tr in ch-1 sp, ch 1, (3 tr, ch 2, 3 tr) in next corner; rep. Join.')),
      h2('Body'),
      p(t('Chain 67. Work dc rows for 130 cm (approx. 286 rows). Fasten off. This gives a rectangle approx. 38 x 130 cm.')),
      h2('Granny square border'),
      p(
        t('Make the first '),
        gt('granny-square-l8', 'granny square'),
        t(' fully. For each subsequent square, use '),
        gt('jayg-l8', 'join-as-you-go'),
        t(' on round 3: replace corner ch-2 with ch-1, sl st into adjacent square corner, ch-1. Replace side ch-1 with sl st into adjacent side sp. Work squares along all four edges of the body rectangle. 32 squares fit around a 38 x 130 cm rectangle at 8 cm per square.'),
      ),
      h2('Finishing'),
      p(
        t('Work one round of '),
        gt('dc-border-l8', 'dc border'),
        t(' around the outer edge of all squares. Fasten off. Weave in ends. Wet the shawl and pin each square to 8 x 8 cm. '),
        gt('blocking-l8', 'Blocking'),
        t(' aligns the border grid.'),
      ),
      h2('What to crochet next'),
      p(t('The openwork triangle shawl uses a simple treble mesh in lace weight yarn for a lighter, more open fabric.')),
    ],
  }

  out(slug, {
    slug, title: 'Granny square border shawl', subtitle: '',
    excerpt: 'A DK crochet shawl with a plain dc body and a granny square border joined as you go. Suitable for crocheters who are comfortable with granny squares.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Granny square border shawls combine classic motif crochet with simple garment construction. No single public-domain source.',
    techniqueSlugs, criticalTechniques, aliases: ['granny square shawl', 'crochet border shawl dk', 'join as you go shawl crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'dk', primaryHookSlug: 'crochet-hook-4-0mm',
      gaugeText: '1 granny square = 8 x 8 cm after blocking. Body: 18 dc x 22 rows = 10 x 10 cm.',
      finishedSizeText: 'Approx. 54 cm wide x 146 cm long (including border) after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L9: openwork-triangle-shawl-crochet ──────────────────────────────────────
{
  const slug = 'openwork-triangle-shawl-crochet'
  const techniqueSlugs = ['crochet-treble-mesh', 'crochet-lace-blocking', 'crochet-top-down-triangle', 'crochet-chain-space']
  const criticalTechniques = ['crochet-treble-mesh', 'crochet-lace-blocking', 'crochet-top-down-triangle']
  const glossaryTerms = [
    { slug: 'treble-mesh-l9', term: 'Treble mesh', definition: 'An open grid of single treble crochets separated by chain-2 spaces. Each treble sits above the treble of the previous row, building a diagonal lattice.' },
    { slug: 'top-down-triangle-l9', term: 'Top-down triangle', definition: 'A shawl started at the apex point and increased at each side edge and a centre spine on every right-side row, building outward to the desired depth.' },
    { slug: 'blocking-l9', term: 'Blocking', definition: 'Wetting lace weight yarn and pinning the shawl to its full dimensions. Lace weight opens dramatically when blocked and may reach twice its unblocked width.' },
    { slug: 'lace-weight-l9', term: 'Lace weight yarn', definition: 'The finest yarn category, typically 400 to 600 m per 100 g. It produces the most delicate and open lace fabric when used with a hook one size larger than the ball band recommends.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('Worked in '),
        gt('lace-weight-l9', 'lace weight yarn'),
        t(', this shawl uses a '),
        gt('treble-mesh-l9', 'treble mesh'),
        t(' over a '),
        gt('top-down-triangle-l9', 'top-down triangle'),
        t(' construction. The open grid grows by four stitches on each right-side row. The final fabric is very light and must be '),
        gt('blocking-l9', 'blocked'),
        t(' to reach its full size.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Lace weight yarn', qty: '500 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking wires and pins', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('4 tr-mesh repeats x 8 rows = 10 x 10 cm after blocking. Gauge varies significantly with yarn; check after blocking a swatch.')),
      h2('Pattern notes'),
      p(t('Treble mesh row (right side): ch 5 (counts as tr, ch 2), tr in next tr, ch 2; at spine work (tr, ch 2, tr) in centre space; continue. Wrong-side row: ch 5, tr in each tr with ch-2 between, working plain over the spine (tr, ch 2, tr).')),
      h2('Foundation'),
      p(t('Chain 10. Row 1 (right side): tr in 6th ch, ch 2, (tr, ch 2, tr, ch 2, tr) in last ch (spine). Turn. (5 tr)')),
      h2('Body'),
      p(
        t('Right-side rows: ch 5, '),
        gt('treble-mesh-l9', 'treble mesh'),
        t(' across left half, (tr, ch 2, tr) in spine sp, mesh across right half, tr in t-ch. Turn.'),
      ),
      p(t('Wrong-side rows: ch 5, mesh across to end. Turn.')),
      p(t('Increase rate: 4 tr added per right-side row (2 per half). Work to approx. 60 cm depth (about 48 right-side rows) or yarn is nearly used.')),
      h2('Border'),
      p(t('Work 1 round of dc along each edge with 3 dc at each corner. Work 3 dc into each ch-2 sp along the curved lower edge to keep it from pulling. Join with slip stitch. Fasten off.')),
      h2('Finishing'),
      p(
        t('Weave in ends. Wet the shawl. Use blocking wires along the two straight edges and pin the lower scalloped edge with individual pins. '),
        gt('blocking-l9', 'Blocking'),
        t(' is essential for lace weight; the unblocked fabric looks far smaller than the finished shawl. Leave flat until fully dry.'),
      ),
      h2('What to crochet next'),
      p(t('The asymmetric lace shawl uses a one-row increase in fingering yarn for a modern slanted shape.')),
    ],
  }

  out(slug, {
    slug, title: 'Openwork triangle shawl', subtitle: '',
    excerpt: 'A top-down triangle shawl in lace weight yarn with an open treble mesh. Very light before blocking; reaches full size only when pinned out.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Open treble mesh triangles are a modern crochet shawl form. No single public-domain source.',
    techniqueSlugs, criticalTechniques, aliases: ['openwork triangle shawl crochet', 'lace weight shawl crochet', 'treble mesh shawl'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'lace', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '4 tr-mesh repeats x 8 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 190 cm wingspan x 60 cm depth after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

// ── L10: asymmetric-lace-shawl-crochet ───────────────────────────────────────
{
  const slug = 'asymmetric-lace-shawl-crochet'
  const techniqueSlugs = ['crochet-asymmetric-shawl', 'crochet-lace-blocking', 'crochet-one-row-repeat', 'crochet-dc-mesh']
  const criticalTechniques = ['crochet-asymmetric-shawl', 'crochet-lace-blocking', 'crochet-one-row-repeat']
  const glossaryTerms = [
    { slug: 'asymmetric-shawl-l10', term: 'Asymmetric shawl', definition: 'A shawl that increases on one side only. One end stays narrow and the other grows steadily, producing a curved triangular shape that drapes well over one shoulder.' },
    { slug: 'one-row-repeat-l10', term: 'One-row repeat', definition: 'A pattern where the same instructions apply to every row without a separate right-side and wrong-side row. Easier to follow without a chart.' },
    { slug: 'blocking-l10', term: 'Blocking', definition: 'Wetting and pinning the finished shawl to stretch the lace open. The asymmetric shape must be pinned carefully to keep the angled edge straight.' },
    { slug: 'dc-mesh-l10', term: 'Dc mesh', definition: 'A grid of dc stitches separated by chain-1 spaces. Used as the background stitch in this shawl.' },
  ]

  const body = {
    type: 'doc',
    content: [
      p(
        t('The '),
        gt('asymmetric-shawl-l10', 'asymmetric shawl'),
        t(' grows by increasing at one end only on every row. It uses a '),
        gt('one-row-repeat-l10', 'one-row repeat'),
        t(' over a '),
        gt('dc-mesh-l10', 'dc mesh'),
        t(' background, so the pattern is simple to follow even on long rows. The finished shape drapes naturally over one shoulder.'),
      ),
      h2('What you need'),
      supplies('Materials', [
        { name: 'Fingering weight yarn', qty: '400 m' },
        { name: '3.5 mm crochet hook', qty: '1' },
        { name: 'Tapestry needle', qty: '1' },
        { name: 'Blocking pins and mat', qty: '1 set' },
      ]),
      h2('Gauge'),
      p(t('8 dc-mesh sts x 10 rows = 10 x 10 cm after blocking.')),
      h2('Pattern notes'),
      p(t('Every row: ch 4 (counts as dc, ch 1), dc in first ch-1 sp, (ch 1, dc) across, ch 2, (dc, ch 1, dc, ch 1, dc) in last sp (increase corner). The 3-dc cluster at the end adds 2 sts per row.')),
      h2('Foundation'),
      p(t('Chain 6. Row 1: dc in 4th ch, ch 1, dc in last ch, ch 2, (dc, ch 1, dc, ch 1, dc) in last ch. Turn. (5 sts)')),
      h2('Body'),
      p(
        t('Every row: ch 4, '),
        gt('dc-mesh-l10', 'dc'),
        t(' in first ch-1 sp, (ch 1, dc) across row, ch 2, ('),
        gt('asymmetric-shawl-l10', 'increase corner'),
        t('): (dc, ch 1, dc, ch 1, dc) in last sp. Turn.'),
      ),
      p(t('The row count increases by 2 mesh stitches each row. Work to approx. 55 cm at the longest edge (about 88 rows) or yarn is nearly used.')),
      h2('Border'),
      p(t('Work 1 round of dc along all edges, placing 3 dc at the wide corner point. Join with slip stitch. Fasten off.')),
      h2('Finishing'),
      p(
        t('Weave in ends. Wet the shawl and pin it to shape with the angled edge straight. '),
        gt('blocking-l10', 'Blocking'),
        t(' sets the asymmetric outline and opens the mesh. Leave flat until dry.'),
      ),
      h2('What to crochet next'),
      p(t('The triangle lace shawl returns to a symmetrical top-down triangle with treble fans for a more traditional lace shawl shape.')),
    ],
  }

  out(slug, {
    slug, title: 'Asymmetric lace shawl', subtitle: '',
    excerpt: 'An asymmetric crochet shawl in fingering yarn with a one-row dc mesh increase. Grows wider on one side only to create a slanted triangular shape.',
    type: 'PATTERN', categorySlug: 'crochet', subCategorySlug: 'lacework',
    difficulty: 'INTERMEDIATE', sourceType: 'SYNTHESISED',
    sourceNotes: 'Asymmetric one-sided increase shawls are a modern crochet form popularised through online pattern communities.',
    techniqueSlugs, criticalTechniques, aliases: ['asymmetric shawl crochet', 'one sided increase shawl', 'modern lace shawl crochet'],
    glossaryTerms,
    crochet: {
      primaryYarnWeightSlug: 'fingering', primaryHookSlug: 'crochet-hook-3-5mm',
      gaugeText: '8 dc-mesh sts x 10 rows = 10 x 10 cm after blocking.',
      finishedSizeText: 'Approx. 55 cm at longest edge x 130 cm outer edge after blocking.',
      terminologyConvention: 'uk',
      craftStitchSlugs: ['crochet-chain', 'crochet-double-uk', 'crochet-treble', 'crochet-slip-stitch'],
      craftTechniqueTags: techniqueSlugs,
    },
    recipeTools: TOOLS,
    body,
  })
}

console.log('Done: 10 lacework shawl patterns written.')
