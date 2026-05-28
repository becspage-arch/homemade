/**
 * Apply targeted prose rewrites to the 15 batch15 files that failed voice-check.
 * Each rewrite is keyed by slug + path. The rewrite is a string of new prose;
 * the script swaps the existing inline content for a single text node.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch15')

interface Rewrite {
  slug: string
  // Targets one of:
  //   ['paragraph', <body idx>]
  //   ['list-para', <body idx of orderedList>, <listItem idx>, <paragraph idx within>]
  //   ['troubleshooter', <body idx>, <item idx>, 'cause'|'fix'|'symptom']
  target:
    | { kind: 'paragraph'; idx: number }
    | { kind: 'list-para'; ol: number; li: number; para: number }
    | { kind: 'troubleshooter'; idx: number; item: number; field: 'cause' | 'fix' | 'symptom' }
  text: string
}

const REWRITES: Rewrite[] = [
  {
    slug: 'saltfish-fritters',
    target: { kind: 'paragraph', idx: 1 },
    text:
      'This version uses fresh cod poached briefly in salted water. It gives a close approximation of salt cod flavour without the overnight soak. For the real thing, use dried salt cod soaked overnight in several changes of cold water. The texture and depth of flavour are better. Either way, the fritters should be very thin, barely thick enough to hold together, so the outside crisps before the inside overcooks.',
  },
  {
    slug: 'saltimbocca-alla-romana',
    target: { kind: 'paragraph', idx: 11 },
    text:
      "Saltimbocca alla romana is a trattoria staple in Rome and the Lazio region around it. It is one of the dishes that defines Roman cooking: quick, bold about fat, made with good cured meat, and finished with wine rather than cream. The name means 'jump in the mouth' and reflects what the dish should do. It should be so good that it imposes itself. The chicken version is widely made in Rome today and tastes the same as the veal original, apart from the meat itself.",
  },
  {
    slug: 'scampi',
    target: { kind: 'paragraph', idx: 12 },
    text:
      'Scampi became a staple of the British pub in the 1950s and 1960s. The Norway lobster (also called Dublin Bay prawn) was being landed in large numbers from British and Irish waters and needed a commercial use. The breaded and fried format, borrowed from Italian fritto misto di mare, suited a pub kitchen and grew very popular. As langoustine catches became more expensive, the pub version moved to minced prawn products. The homemade version, made with whole tails, is a different and far better dish.',
  },
  {
    slug: 'scotch-broth',
    target: { kind: 'troubleshooter', idx: 11, item: 2, field: 'fix' },
    text:
      'Use at least 800 g of bone-in mutton for 6 servings. A bare simmer pulls more flavour out than a rolling boil. A rolling boil drives off the liquid without concentrating the meat.',
  },
  {
    slug: 'scotch-broth',
    target: { kind: 'paragraph', idx: 13 },
    text:
      'Scotch broth has been made in Scotland for centuries. It appears in household accounts and cookery books from the eighteenth century onward, listed as a standard British soup by Victorian writers who saw the barley as the element that set it apart from English mutton broth. The dish is frugal by design: a cheap cut of meat, a handful of root vegetables, and a cold afternoon. It is eaten from October to March and reheated the next day, when it is always better.',
  },
  {
    slug: 'sea-bass-with-crispy-potatoes',
    target: { kind: 'list-para', ol: 6, li: 5, para: 0 },
    text:
      'Heat a large, wide-based pan with a matching lid (preferably non-stick) over a medium-high heat. Add a drizzle of vegetable oil.',
  },
  {
    slug: 'seville-orange-marmalade',
    target: { kind: 'paragraph', idx: 13 },
    text:
      'Seville orange marmalade is the preserve of the British winter. Sevilles arrive in January and they go fast. You make a batch in a weekend afternoon and eat it on toast for months. It belongs to a British tradition of seasonal preserving that takes one short window when an ingredient is at its best and turns it into something that lasts all year. A pot of homemade marmalade is one of the most satisfying things a kitchen can make.',
  },
  {
    slug: 'shakshuka',
    target: { kind: 'paragraph', idx: 11 },
    text:
      "Shakshuka's origins are disputed across the Middle East. Tunisia claims it. Libya claims it. Israel took it up so fully that it became a national breakfast dish in the twentieth century. The name probably comes from an Arabic root meaning 'all mixed up', which describes the method. It exists in every country in the region under different names and with different spices. The Tunisian version is more strongly spiced. The Israeli version is milder. The Yemeni version uses zhug and is much hotter. What they share is the method: eggs in tomato sauce, lid on, patience.",
  },
  {
    slug: 'shawarma-chicken',
    target: { kind: 'paragraph', idx: 13 },
    text:
      "Shawarma comes from the Ottoman döner kebab tradition. That is the vertical rotating spit that gives the thin-shaved meat sold in Turkish and Arab restaurants worldwide. The word 'shawarma' likely comes from the Turkish 'çevirme', meaning turning. In Lebanon and Syria, the chicken version is the default street food. It is late-night, cheap, eaten from paper with garlic sauce running down the forearm. The oven version loses the rotation and the spit drip but keeps everything else, and is the most practical way to copy the original at home.",
  },
  {
    slug: 'shorbat-adas',
    target: { kind: 'paragraph', idx: 11 },
    text:
      'Shorbat adas is the soup Lebanese cooks make when there is nothing else in the house. It needs only lentils, an onion, and some spices. It is eaten at every level of Lebanese cooking, from restaurant starters to weeknight family dinners. The lemon sets the Lebanese version apart from the Egyptian, which uses vinegar, and the Syrian, which often skips the citrus. In Beirut through the winter, shorbat adas plays the same role as chicken soup in Central Europe. It is comforting, restorative, and made when someone is ill or when the weather demands it.',
  },
  {
    slug: 'shrimp-and-grits',
    target: { kind: 'paragraph', idx: 13 },
    text:
      "Shrimp and grits is a dish of the South Carolina and Georgia Lowcountry. The tidal marshes and estuaries there have supplied shrimp to local cooking for centuries. Hominy grits, made from dried corn treated with lye, have been a staple since Native American times. For much of its history the dish was a fishermen's breakfast, eaten before the boats went out. It rose to national restaurant fame through the Chapel Hill restaurant Crook's Corner in the 1980s, and is now one of the dishes that defines the American South in restaurants from New Orleans to New York.",
  },
  {
    slug: 'sigara-boregi',
    target: { kind: 'paragraph', idx: 13 },
    text:
      'Börek is pastry made with thin layers of yufka or filo and filled with cheese, meat, or vegetables. It is one of the core preparations of Ottoman palace cooking. It spread with the Ottoman empire across Southeastern Europe, the Levant, and North Africa. Each region adapted it to local fillings and pastry styles: the Moroccan bastilla, the Greek spanakopita, and the Balkan burek all come from the same Ottoman dish. Sigara böreği is the simplest form. It is a single layer of filo around a modest filling. It is quick to make, quick to eat, and rarely lasts long enough at the table for anyone to feel they have had enough.',
  },
  {
    slug: 'skordalia',
    target: { kind: 'troubleshooter', idx: 9, item: 0, field: 'cause' },
    text: 'Waxy potato was used, or the potato was beaten too hard in a food processor.',
  },
  {
    slug: 'skordalia',
    target: { kind: 'paragraph', idx: 11 },
    text:
      'Skordalia (from skordo, garlic) is eaten wherever fried or grilled fish is on the table. It is also served with salt cod fritters (bakaliaros) on 25th March for Greek Independence Day. The bread-based version came first, by centuries, and is still made in some regions. The dish has close relatives across the Mediterranean. Spanish alioli, Provençal aïoli, and Italian agliata all share the same garlic-fat idea.',
  },
  {
    slug: 'sloppy-joe',
    target: { kind: 'troubleshooter', idx: 11, item: 0, field: 'fix' },
    text:
      'Keep simmering uncovered until the sauce is thick and holds its shape on a spoon. It should mound slightly when piled onto the bun.',
  },
  {
    slug: 'sloppy-joe',
    target: { kind: 'paragraph', idx: 13 },
    text:
      'The Sloppy Joe belongs to the American school cafeteria and diner tradition. It was designed to be made in large pots, served fast, and eaten without ceremony. The name attached itself to the loose-meat sandwich in the 1930s and 1940s. By the 1950s it was on menus and in home cooking across the country. The tinned version (Manwich) launched in 1969 and sold the dish to a generation as a weeknight shortcut. The homemade version takes twenty minutes and tastes better, but the tinned version made the Sloppy Joe a household name.',
  },
  {
    slug: 'slow-cooker-chicken-tikka-masala',
    target: { kind: 'paragraph', idx: 0 },
    text:
      'Smoked paprika gives the sauce its red colour. That, plus more tomato, is what sets tikka masala apart from butter chicken at first glance. Bloom the spices in oil on the hob before adding them to the slow cooker. This step takes two minutes and you cannot skip it.',
  },
  {
    slug: 'slow-cooker-italian-beef-ragu',
    target: { kind: 'list-para', ol: 5, li: 6, para: 0 },
    text:
      'In the last hour take the lid off and shred the beef with two forks. Stir in one more tablespoon of fresh rosemary and thyme. Add a splash of water or wine if the meat is too dry.',
  },
]

function applyRewrite(data: any, r: Rewrite): void {
  const newContent = [{ type: 'text', text: r.text }]
  const body = data.body
  if (r.target.kind === 'paragraph') {
    const node = body.content[r.target.idx]
    if (!node || node.type !== 'paragraph') {
      throw new Error(`${r.slug}: expected paragraph at idx ${r.target.idx}, got ${node?.type}`)
    }
    node.content = newContent
  } else if (r.target.kind === 'list-para') {
    const ol = body.content[r.target.ol]
    if (!ol || ol.type !== 'orderedList') throw new Error(`${r.slug}: not orderedList at ${r.target.ol}`)
    const li = ol.content[r.target.li]
    if (!li || li.type !== 'listItem') throw new Error(`${r.slug}: not listItem at ${r.target.li}`)
    const p = li.content[r.target.para]
    if (!p || p.type !== 'paragraph') throw new Error(`${r.slug}: not paragraph at ${r.target.para}`)
    p.content = newContent
  } else if (r.target.kind === 'troubleshooter') {
    const ts = body.content[r.target.idx]
    if (!ts || ts.type !== 'troubleshooter') throw new Error(`${r.slug}: not troubleshooter at ${r.target.idx}`)
    const items = ts.attrs?.items
    if (!Array.isArray(items)) throw new Error(`${r.slug}: troubleshooter no items`)
    const item = items[r.target.item]
    if (!item) throw new Error(`${r.slug}: no item at ${r.target.item}`)
    item[r.target.field] = r.text
  }
}

const bySlug: Record<string, Rewrite[]> = {}
for (const r of REWRITES) {
  if (!bySlug[r.slug]) bySlug[r.slug] = []
  bySlug[r.slug]!.push(r)
}

for (const slug of Object.keys(bySlug)) {
  const path = resolve(batchDir, slug + '.json')
  if (!existsSync(path)) {
    console.error(`MISSING: ${slug}`)
    continue
  }
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const r of bySlug[slug]!) {
    applyRewrite(data, r)
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[rewrote] ${slug} (${bySlug[slug]!.length} fix${bySlug[slug]!.length > 1 ? 'es' : ''})`)
}
console.log(`\nTotal: ${Object.keys(bySlug).length} files, ${REWRITES.length} rewrites applied`)
