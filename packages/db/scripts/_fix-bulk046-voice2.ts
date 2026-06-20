import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DIR = join(process.cwd(), '../../docs/bulk-batch-046-briefs')

function read(name: string) { return JSON.parse(readFileSync(join(DIR, name), 'utf8')) }
function write(name: string, d: unknown) { writeFileSync(join(DIR, name), JSON.stringify(d, null, 2)); console.log('[fixed]', name) }
function txt(text: string, marks?: unknown[]) { const n: Record<string, unknown> = { type: 'text', text }; if (marks?.length) n.marks = marks; return n }
function tooltip(slug: string) { return { type: 'glossaryTooltip', attrs: { termSlug: slug } } }

// ── 13 navarin: add glossaryTooltip for "navarin" in intro ───────────────────
{
  const d = read('13-navarin-d-agneau.json')
  // The first text node of para[0] is "Navarin d'agneau printanier is a spring dish..."
  // Need to wrap first occurrence of "Navarin" with tooltip
  const para = d.body.content[0] // intro paragraph
  const rawText = para.content[0].text as string
  // Split: "Navarin" tooltip + " d'agneau printanier is..."
  const afterNavarin = rawText.replace(/^Navarin/, '')
  para.content = [
    txt('Navarin', [tooltip('navarin')]),
    txt(afterNavarin),
  ]
  write('13-navarin-d-agneau.json', d)
}

// ── 18 bouillabaisse: add glossaryTooltip for "rouille" ──────────────────────
{
  const d = read('18-bouillabaisse.json')
  // para[0] currently has 3 content nodes:
  // [0] 'Bouillabaisse is defined by its broth: a '
  // [1] 'saffron' with mark
  // [2] '-scented...with croutons spread with rouille.'
  const para = d.body.content[0]
  const thirdText = para.content[2].text as string
  // Split around 'rouille' to add tooltip
  const idx = thirdText.indexOf('rouille')
  const before = thirdText.substring(0, idx)
  const after = thirdText.substring(idx + 'rouille'.length)
  para.content = [
    para.content[0],
    para.content[1],
    txt(before),
    txt('rouille', [tooltip('rouille')]),
    txt(after),
  ]
  write('18-bouillabaisse.json', d)
}

// ── 20 coquilles: grade-level rewrite para[1] ────────────────────────────────
{
  const d = read('20-coquilles-saint-jacques.json')
  const node = d.body.content[1]
  node.content = [txt('Ask your fishmonger to open the scallops and keep the deep half-shells. If you cannot get shells, use small gratin dishes instead.')]
  write('20-coquilles-saint-jacques.json', d)
}

// ── 27 carottes-vichy: grade rewrites para[0] and para[7] ────────────────────
{
  const d = read('27-carottes-vichy.json')
  d.body.content[0].content = [txt(
    'Carottes Vichy is the French way of glazing carrots. The carrots braise in a small amount of water with butter and sugar. The pan is covered first so the carrots cook through; then the lid comes off and the liquid reduces until the carrots are coated in a sweet, shiny glaze. It takes around 20 minutes and is considerably more interesting than plain boiled carrots.'
  )]
  d.body.content[7].content = [txt(
    'The link with Vichy is culinary legend. The town\'s famous mineral water was said to improve the flavour when used instead of plain water. In practice, plain water gives the same result. Vichy in the Auvergne was a famous spa town in the 19th century and its name attached to several dishes of the period. The technique itself, braising root vegetables in butter, sugar, and water, is basic to French cooking and works equally well with turnips, pearl onions, and other vegetables.'
  )]
  write('27-carottes-vichy.json', d)
}

// ── 28 tian-de-legumes: grade-level rewrite para[0] ─────────────────────────
{
  const d = read('28-tian-de-legumes.json')
  d.body.content[0].content = [txt(
    'A tian is Provençal summer food at its most direct. Courgettes, tomatoes, and aubergine are sliced thin, layered in a dish with garlic and thyme, and soaked with olive oil. They bake slowly until the vegetables have collapsed and the edges have browned into the oil. It is one of the best dishes to bring to the table, and almost entirely mechanical to prepare: slice, layer, bake.'
  )]
  write('28-tian-de-legumes.json', d)
}

// ── 29 oeufs-en-cocotte: grade-level rewrite para[8] ─────────────────────────
{
  const d = read('29-oeufs-en-cocotte.json')
  d.body.content[8].content = [txt(
    'The cocotte, a small earthenware or porcelain pot, is one of the most useful vessels in the French kitchen. It serves for everything from individual terrines to braised vegetables. Oeufs en cocotte are one of its most classic uses, appearing in the egg chapter of French cookery books from Escoffier onwards. They are also one of the most adaptable: the base can be varied with almost anything to hand, and the cooking time is never more than 12 minutes.'
  )]
  write('29-oeufs-en-cocotte.json', d)
}

// ── 31 salade-nicoise: grade-level rewrite para[7] ───────────────────────────
{
  const d = read('31-salade-nicoise.json')
  d.body.content[7].content = [txt(
    'Nice and the Côte d\'Azur have been making this salad since the late 19th century, when it appears in records of local café and restaurant menus. The tradition in Nice is strict about using raw vegetables only: the tomatoes must be fresh and ripe, the beans raw and thin, and the tuna should be the best available. The cooked-potato version became popular in Parisian bistros in the 20th century and spread worldwide as the better-known form. Nice does not approve of the potato.'
  )]
  write('31-salade-nicoise.json', d)
}

// ── 32 pate-de-campagne: fix "honest", grade rewrite, tricolon, servings ─────
{
  const d = read('32-pate-de-campagne.json')
  d.body.content[10].content = [txt(
    'The charcuterie tradition is one of the foundations of French regional cooking. Every market town in France has a charcuterie producing its own pâtés, rillettes, terrines, and sausages. The campagne style is the most universal: rough, direct, and without ornament, the opposite of the fancier pâté de foie gras tradition. Jane Grigson, the first serious English-language writer on French charcuterie, described it as well-seasoned food that asks nothing of the cook except patience.'
  )]
  // Fix servings-yield: pâté is a discrete item (1 loaf), null servings
  d.recipe.servings = null
  write('32-pate-de-campagne.json', d)
}

// ── 33 steak-au-poivre: grade-level rewrite para[10] ─────────────────────────
{
  const d = read('33-steak-au-poivre.json')
  d.body.content[10].content = [txt(
    'Steak au poivre is a Paris brasserie dish. The brasserie is a particular French institution: it serves food at all hours to a mixed crowd of businesspeople, tourists, and theatre-goers. The brandy-and-cream version of the sauce was established in the large brasseries of the grands boulevards in the 1950s and 1960s. It has been one of the most ordered dishes in French restaurants ever since. It is also a useful recipe for showing how a simple pan sauce can be made in the time it takes a steak to rest.'
  )]
  write('33-steak-au-poivre.json', d)
}

// ── 34 pot-de-creme: grade rewrite para[7], fix servings-yield ───────────────
{
  const d = read('34-pot-de-creme-au-chocolat.json')
  d.body.content[7].content = [txt(
    'Pot de crème is a dessert of the French restaurant tradition. It has appeared on Parisian menus for at least two centuries. The appeal is its simplicity: it needs no special technique beyond making a custard, and it rewards good chocolate. The small lidded pots (pots à crème) in which it is baked and served are their own category of French kitchenware, sold in specialist shops across France.'
  )]
  // Fix servings-yield: 6 ramekins = 6 servings, null yieldDescription
  d.recipe.yieldDescription = null
  write('34-pot-de-creme-au-chocolat.json', d)
}

// ── 35 iles-flottantes: grade-level rewrite para[12] ─────────────────────────
{
  const d = read('35-iles-flottantes.json')
  d.body.content[12].content = [txt(
    'Îles flottantes belongs to the French tradition of egg-based desserts. Both parts of the egg are used: the yolks go into the custard, the whites become the meringue. The dish appears in the classical French repertoire as an elegant, light dessert suitable for the end of a formal dinner. It requires technique rather than expensive ingredients, which made it a favourite in professional kitchens where skill mattered more than budget.'
  )]
  write('35-iles-flottantes.json', d)
}

// ── 36 creme-caramel: grade rewrite para[10], fix servings-yield ─────────────
{
  const d = read('36-creme-caramel.json')
  d.body.content[10].content = [txt(
    'Crème caramel spread from France to Spain, where it is called flan, and then to Portugal, Brazil, and much of the world. It is now one of the most widely eaten desserts across multiple continents. Each version differs slightly: the French original has a strong, dark caramel and a firm custard; the Spanish flan is often richer and sweeter; the Latin American version is thicker, usually made with condensed milk. The French original remains the reference point for the others.'
  )]
  // Fix servings-yield: 6 ramekins = 6 servings, null yieldDescription
  d.recipe.yieldDescription = null
  write('36-creme-caramel.json', d)
}

// ── 37 crepes-suzette: fix servings-yield (discrete: ~16 crêpes) ─────────────
{
  const d = read('37-crepes-suzette.json')
  d.recipe.servings = null
  write('37-crepes-suzette.json', d)
}

console.log('\nAll round-2 voice fixes applied.')
