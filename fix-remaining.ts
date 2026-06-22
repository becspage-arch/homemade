/**
 * Second pass fix: grade-level, em-dash, banned-phrase, americanism, and remaining glossary misses.
 * Run: npx tsx fix-remaining.ts
 */

import fs from 'fs'
import path from 'path'

const DIR = path.join(__dirname, 'docs', 'cooking-sprint-worker-0')

type Mark = { type: string; attrs?: Record<string, unknown> }
type DocNode = { type: string; text?: string; marks?: Mark[]; attrs?: Record<string, unknown>; content?: DocNode[] }

function makeText(text: string, extraMark?: Mark): DocNode {
  return extraMark ? { type: 'text', text, marks: [extraMark] } : { type: 'text', text }
}

function tooltipMark(termSlug: string): Mark {
  return { type: 'glossaryTooltip', attrs: { termSlug } }
}

function textNode(str: string): DocNode { return { type: 'text', text: str } }

function para(texts: DocNode[]): DocNode { return { type: 'paragraph', content: texts } }

function simpleText(str: string): DocNode[] { return [textNode(str)] }

// ---- helpers to build a paragraph node with a single text child (the common case)
function pt(str: string): DocNode { return para([textNode(str)]) }

// ---- Replace a node in body.content at a given index
function replaceAt(body: DocNode, idx: number, newNode: DocNode): DocNode {
  const content = [...(body.content ?? [])]
  content[idx] = newNode
  return { ...body, content }
}

// ---- Walk + replace all text matching a string (for simple inline substitutions)
function replaceText(node: DocNode, oldStr: string, newStr: string): DocNode {
  if (node.type === 'text' && node.text?.includes(oldStr)) {
    return { ...node, text: node.text.replace(oldStr, newStr) }
  }
  if (node.content) {
    return { ...node, content: node.content.map(c => replaceText(c, oldStr, newStr)) }
  }
  return node
}

// ---- Replace em-dash (—) with a specified replacement in all text nodes
function fixEmDash(node: DocNode, replacement: string): DocNode {
  return replaceText(replaceText(node, '—', replacement), '–', replacement)
}

// ---- Wrap a term in a glossaryTooltip by splitting the first matching text node
function wrapTerm(nodes: DocNode[], searchStr: string, termSlug: string): DocNode[] {
  const found = { done: false }
  function walk(ns: DocNode[]): DocNode[] {
    if (found.done) return ns
    const out: DocNode[] = []
    for (const n of ns) {
      if (found.done) { out.push(n); continue }
      if (n.type === 'text' && n.text && !n.marks?.some(m => m.type === 'glossaryTooltip')) {
        const idx = n.text.toLowerCase().indexOf(searchStr.toLowerCase())
        if (idx !== -1) {
          found.done = true
          const before = n.text.slice(0, idx)
          const matched = n.text.slice(idx, idx + searchStr.length)
          const after = n.text.slice(idx + searchStr.length)
          if (before) out.push({ ...n, text: before })
          out.push({ ...n, text: matched, marks: [...(n.marks ?? []), tooltipMark(termSlug)] })
          if (after) out.push({ ...n, text: after })
          continue
        }
      }
      if (n.content) { out.push({ ...n, content: walk(n.content) }); continue }
      out.push(n)
    }
    return out
  }
  return walk(nodes)
}

function load(name: string): { data: Record<string, unknown>; filepath: string } {
  const filepath = path.join(DIR, name)
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8')) as Record<string, unknown>
  return { data, filepath }
}

function save(filepath: string, data: Record<string, unknown>): void {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Saved: ${path.basename(filepath)}`)
}

// ---- 01-yorkshire-parkin: grade-level at orderedList[7] > listItem[1] > paragraph[0]
{
  const { data, filepath } = load('01-yorkshire-parkin.json')
  const body = data.body as DocNode
  // body.content[7] is the first orderedList; listItem[1] is the second step
  const olist = body.content![7]
  const listItem = olist.content![1]
  const step = listItem.content![0] // paragraph
  // Replace the single long sentence with two shorter ones
  const newText = 'Put {{porridge-oats}} of oatmeal, {{plain-flour}} of flour, {{dark-brown-sugar}} of dark brown sugar, {{ginger-ground}} of ground ginger, and {{cinnamon-ground}} of cinnamon into a large bowl. Add {{baking-powder}} of baking powder, {{bicarbonate-of-soda}} of bicarbonate of soda, and {{salt-table}} of salt. Stir until combined.'
  const newStep = { ...step, content: [textNode(newText)] }
  const newListItem = { ...listItem, content: [newStep] }
  const newContent = [...olist.content!]
  newContent[1] = newListItem
  const newOlist = { ...olist, content: newContent }
  const newBodyContent = [...body.content!]
  newBodyContent[7] = newOlist
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 05-risotto-ai-funghi-porcini: grade-level at paragraph[13]
{
  const { data, filepath } = load('05-risotto-ai-funghi-porcini.json')
  const body = data.body as DocNode
  const newP = pt('Porcini risotto is northern Italian cooking at its most direct: rice from the Po valley, dried mushrooms from the Alps and Apennines, butter and Parmesan from Lombardy. In autumn, fresh porcini are available; in other seasons, dried porcini and their soaking liquid do the work. The soaking liquid is what gives the dish its depth. Use it all.')
  const newBodyContent = [...body.content!]
  newBodyContent[13] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 06-eccles-cakes: banned "essentially" at paragraph[0]
{
  const { data, filepath } = load('06-eccles-cakes.json')
  let body = data.body as DocNode
  body = replaceText(body, 'are essentially a vehicle', 'are a vehicle') as DocNode
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 07-scottish-tablet: em-dash at paragraph[4]
{
  const { data, filepath } = load('07-scottish-tablet.json')
  let body = data.body as DocNode
  body = replaceText(body, 'before you start — there is no time', 'before you start. There is no time') as DocNode
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 09-dundee-cake: em-dashes in sourceNotes
{
  const { data, filepath } = load('09-dundee-cake.json')
  let notes = data.sourceNotes as string
  notes = notes.replace('format — a light, boiled-fruit-free recipe with almonds on top — is distinct', 'format (a light, boiled-fruit-free recipe with almonds on top) is distinct')
  ;(data as Record<string, unknown>).sourceNotes = notes
  // Also fix americanism "fall" in troubleshooter
  let body = data.body as DocNode
  body = replaceText(body, 'fall', 'autumn') as DocNode
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 14-cornish-fairings: grade-level at orderedList[5] > listItem[1] > paragraph[0]
{
  const { data, filepath } = load('14-cornish-fairings.json')
  const body = data.body as DocNode
  const olist = body.content![5] // orderedList at index 5
  const listItem = olist.content![1] // second listItem
  const step = listItem.content![0] // paragraph
  const newText = 'Put {{plain-flour}} of flour, {{ginger-ground}} of ginger, {{mixed-spice}} of mixed spice, {{bicarbonate-of-soda}} of bicarbonate of soda, {{baking-powder}} of baking powder, and {{salt-table}} of salt into a bowl. Rub in {{unsalted-butter}} of cold butter until it looks like breadcrumbs. Stir in {{caster-sugar}} of sugar.'
  const newStep = { ...step, content: [textNode(newText)] }
  const newListItem = { ...listItem, content: [newStep] }
  const newContent = [...olist.content!]
  newContent[1] = newListItem
  const newOlist = { ...olist, content: newContent }
  const newBodyContent = [...body.content!]
  newBodyContent[5] = newOlist
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 16-bara-lawr: grade-level at paragraph[8] + americanism "fall"
{
  const { data, filepath } = load('16-bara-lawr.json')
  let body = data.body as DocNode
  // Fix americanism
  body = replaceText(body, 'fall', 'autumn') as DocNode
  // Replace paragraph[8]
  const newP = pt('Bara lawr fried in oatmeal is the standard Welsh breakfast presentation. Served alongside bacon, cockles, and eggs, it belongs to south Wales, especially the coastal and mining communities where seaweed gathering was part of daily life. The oatmeal crust keeps the patties together and gives a crisp contrast to the soft laver inside. It appears at good Welsh cafes and guesthouses on weekend mornings.')
  const newBodyContent = [...body.content!]
  newBodyContent[8] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 19-fettuccine-alfredo: grade-level at paragraph[8]
{
  const { data, filepath } = load('19-fettuccine-alfredo.json')
  const body = data.body as DocNode
  const newP = pt('Fettuccine Alfredo is the most famous Roman pasta outside Italy, and also the most misunderstood. The cream version served in most English-speaking restaurants has nothing to do with the Roman original. In Rome the dish is a point of pride: simple, and technically demanding. The restaurant Alfredo all\'Augusteo in Rome still makes it tableside with a golden fork and spoon. The American chain version is a different dish. Not wrong exactly, but not this.')
  const newBodyContent = [...body.content!]
  newBodyContent[8] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 20-tagliatelle-ai-funghi: grade-level at paragraph[1] and paragraph[8]
{
  const { data, filepath } = load('20-tagliatelle-ai-funghi.json')
  const body = data.body as DocNode
  const newP1 = pt('A small handful of dried porcini, soaked and added with their liquid, makes chestnut mushrooms taste much better. If you can get fresh porcini, ceps, or chanterelles, use those instead. Wild mushrooms are more delicate, so reduce the cooking time.')
  const newP8 = pt('Tagliatelle ai funghi is from the part of Italy where the autumn porcini harvest and egg pasta meet: Emilia-Romagna, Piedmont, and the foothills of the Apennines. In the farmhouses of Emilia, tagliatelle with mushrooms and cream is as unremarkable and essential as roast chicken is in France. The cream is not lavish. It coats the pasta and carries the mushroom flavour. The dish is mild, filling, and forgiving of small variations in mushroom quality.')
  const newBodyContent = [...body.content!]
  newBodyContent[1] = newP1
  newBodyContent[8] = newP8
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 21-pappardelle-ai-funghi-misti: grade-level at paragraph[0]
{
  const { data, filepath } = load('21-pappardelle-ai-funghi-misti.json')
  const body = data.body as DocNode
  const newP = pt('Pappardelle ai funghi misti is the cream-free version of mushroom pasta. The mushrooms cook in wine until the liquid reduces and coats them. A splash of pasta water and a quick toss in the pan make a light sauce. The result is deeply savoury and less rich than the cream version, with the mushrooms tasting more clearly of themselves.')
  const newBodyContent = [...body.content!]
  newBodyContent[0] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 22-pici-con-le-briciole: grade-level at paragraph[11] + mollica glossary miss
{
  const { data, filepath } = load('22-pici-con-le-briciole.json')
  let body = data.body as DocNode
  // Fix grade-level at paragraph[11]
  const newP11 = pt('Pici are the pasta of Siena province. Pici con le briciole is their oldest sauce and the most economical. The hill towns of southern Tuscany all make pici as their daily pasta. The breadcrumb version began as a poor substitute for cheese-dressed pasta, but it was good enough to stay on menus. You find it in Siena trattorias as a first course alongside game ragu and the more expensive versions, and it holds its own.')
  const newBodyContent = [...body.content!]
  newBodyContent[11] = newP11
  body = { ...body, content: newBodyContent }
  // Fix mollica: add word to paragraph[0] intro by replacing "breadcrumbs fried" with "mollica (breadcrumbs) fried"
  // Then wrap mollica in glossaryTooltip
  body = replaceText(body, 'is breadcrumbs fried in olive oil', 'is fried mollica (breadcrumbs) with') as DocNode
  // Now wrap "mollica" in glossaryTooltip
  body = { ...body, content: wrapTerm(body.content!, 'mollica', 'mollica') }
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 24-tagliatelle-al-tartufo: banned + em-dash + grade at paragraph[0], grade paragraph[1], grade paragraph[8]
{
  const { data, filepath } = load('24-tagliatelle-al-tartufo.json')
  const body = data.body as DocNode
  const newP0 = pt('Tagliatelle al tartufo is not a complex dish. It is butter and Parmesan pasta, the same technique as Alfredo, with truffle added at the last moment. Cold butter emulsified with pasta water and the pasta\'s starch creates a glossy coating. The truffle goes in off the heat, shaved or grated over the top so the warmth draws out its aroma without cooking it.')
  const newP1 = pt('A fresh truffle is necessary here. Truffle oil made with synthetic compounds tastes artificial and obvious. If fresh truffle is not available, preserved whole truffle in brine or oil (Tuber melanosporum) is a distant but workable substitute.')
  const newP8 = pt('Tagliatelle al tartufo is eaten wherever Italian truffles are grown. In Norcia (Umbria), December and January bring the black truffle season. Local restaurants serve pasta, game, and truffle. In Alba (Piedmont), the white truffle season in October and November is a civic event: the Fiera del Tartufo draws buyers and chefs from across Europe. Tagliatelle al tartufo bianco from Alba is one of the finest things Italian cooking produces. In both cases the rule is the same: the simpler the dish, the more the truffle speaks.')
  const newBodyContent = [...body.content!]
  newBodyContent[0] = newP0
  newBodyContent[1] = newP1
  newBodyContent[8] = newP8
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 25-pappardelle-al-ragu-di-lepre: soffritto glossary miss + americanism "stove"
{
  const { data, filepath } = load('25-pappardelle-al-ragu-di-lepre.json')
  let body = data.body as DocNode
  // Fix americanism
  body = replaceText(body, 'on the stove', 'on the hob') as DocNode
  // Fix soffritto: add "soffritto" to the body by rewriting paragraph[0] intro
  // Old: "Hare ragu is a two-day project: overnight marinade in red wine, then a long slow braise until the meat falls from the bone. The bones go in too; they enrich the ragu as it reduces. Once the hare is cooked and shredded, the sauce is concentrated on the stove until it is thick and dark. Tossed with fresh pappardelle, it is one of the great Italian pasta dishes."
  // The body also has a method where onion/carrot/celery are cooked - I need to add soffritto there
  // Strategy: replace "concentrated on the stove" with "concentrated on the hob" (also fixes americanism) AND
  // replace body text where soffritto is built (in the method steps) to include the word
  // Let me add soffritto to a method step. I'll replace "onion" mention with "the soffritto"
  // Actually let me add it to the intro: "...then a long slow braise with a soffritto of onion..."
  // First fix paragraph[0] to add "soffritto"
  body = replaceText(body, 'Once the hare is cooked and shredded, the sauce is concentrated on the hob until it is thick and dark.', 'Cook a soffritto of onion, carrot, and celery before adding the hare and wine. Once the hare is cooked and shredded, reduce the sauce on the hob until thick and dark.') as DocNode
  // Now wrap "soffritto" in glossaryTooltip
  body = { ...body, content: wrapTerm(body.content!, 'soffritto', 'soffritto') }
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 26-spaghetti-ai-ricci-di-mare: banned "genuinely" at paragraph[8]
{
  const { data, filepath } = load('26-spaghetti-ai-ricci-di-mare.json')
  let body = data.body as DocNode
  body = replaceText(body, 'worth making only when the roe is genuinely good', 'worth making only when the roe is very good') as DocNode
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 27-risotto-ai-funghi-misti: grade-level at paragraph[8]
{
  const { data, filepath } = load('27-risotto-ai-funghi-misti.json')
  const body = data.body as DocNode
  const newP = pt('Mixed mushroom risotto is autumn home cooking from northern Italy. The mushroom mix changes with what is available. The combination here works year-round with shop-bought mushrooms. In autumn, use chanterelles or fresh ceps instead of oyster mushrooms when you can get them. The dried porcini matter in all seasons. Without them the risotto is good but lacks the depth that makes this one of the benchmarks of Italian cooking.')
  const newBodyContent = [...body.content!]
  newBodyContent[8] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 28-risotto-al-radicchio: grade-level at paragraph[8]
{
  const { data, filepath } = load('28-risotto-al-radicchio.json')
  const body = data.body as DocNode
  const newP = pt('Radicchio belongs to the Veneto more than anywhere else. The area around Treviso has grown it since the 16th century. Risotto al radicchio is a winter dish in Venice and the Veneto, on menus from October to February. The deep pink colour is striking. The flavour is bitter, warming, and quite unlike any other risotto.')
  const newBodyContent = [...body.content!]
  newBodyContent[8] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 29-risotto-al-nero-di-seppia: grade-level at paragraph[8]
{
  const { data, filepath } = load('29-risotto-al-nero-di-seppia.json')
  const body = data.body as DocNode
  const newP = pt('Risotto nero is a Venetian dish, tied to the lagoon and the fishing traditions of the Adriatic. It appears in the bacari (wine bars) of the Rialto and Cannaregio. The ink was once extracted from the cuttlefish by the cook; sachets make this easier, and the flavour is the same. Eaten in Venice with a glass of Soave and a view of a canal, it is as good as Italian cooking gets.')
  const newBodyContent = [...body.content!]
  newBodyContent[8] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 30-polenta-concia: em-dash at paragraph[8]
{
  const { data, filepath } = load('30-polenta-concia.json')
  let body = data.body as DocNode
  body = replaceText(body, 'in abundance — corn and alpine milk', 'in abundance, corn and alpine milk') as DocNode
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 31-polenta-taragna: grade-level at paragraph[1] and paragraph[8]
{
  const { data, filepath } = load('31-polenta-taragna.json')
  const body = data.body as DocNode
  const newP1 = pt('Pre-mixed polenta taragna (the corn and buckwheat blend) is sold at Italian delis and online. To make your own, blend coarse polenta with buckwheat flour in a 70:30 ratio. Traditional polenta taragna takes 40 to 50 minutes to cook; instant versions exist but the texture is not as good.')
  const newP8 = pt('Polenta taragna comes from the Lombard Alps: the Valtellina, Val Brembana, and the mountains above Bergamo. It is heavier and more filling than yellow polenta. It was the daily staple of mountain communities before the Italian food supply changed in the 20th century. Today it appears in the agriturismi and trattorie of the Lombard Alps alongside bresaola, game birds, and the local cheeses. In Milan it is seen as mountain peasant food, and eaten with affection for that reason.')
  const newBodyContent = [...body.content!]
  newBodyContent[1] = newP1
  newBodyContent[8] = newP8
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 32-polenta-con-gorgonzola: grade-level at paragraph[0] and paragraph[8]
{
  const { data, filepath } = load('32-polenta-con-gorgonzola.json')
  const body = data.body as DocNode
  const newP0 = pt('Polenta con Gorgonzola is strong, rich, and very indulgent. Soft buttered polenta is the base; Gorgonzola dolce, added off the heat and stirred until melted, is what makes it worth eating. Mild, slightly sweet polenta and pungent blue cheese is a classic Lombard balance. Neither is subtle. They work better together than apart.')
  const newP8 = pt('Polenta con Gorgonzola is from the Po valley and the Lombard plains, where winter cooking runs rich and hearty. Gorgonzola takes its name from the village near Milan where it was aged in the cold November air. Polenta was the staple grain of northern Italy before rice took over in the 18th century, and it never left Lombard tables. The two together are winter comfort food in its purest form: nothing sophisticated, nothing held back.')
  const newBodyContent = [...body.content!]
  newBodyContent[0] = newP0
  newBodyContent[8] = newP8
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 33-grilled-polenta-wedges: banned "genuinely" at paragraph[0] + grade-level at paragraph[11]
{
  const { data, filepath } = load('33-grilled-polenta-wedges.json')
  const body = data.body as DocNode
  const newP0 = replaceText(body.content![0], 'while also being a genuinely good dish', 'while also being a good dish') as DocNode
  const newP11 = pt('Grilled polenta appears in mountain trattorie across northern Italy as a side dish alongside mushrooms, braised boar, or grilled sausage. It began as a way of using leftover cold polenta: the Italian habit of not wasting food applied to the staple grain of the Alps. As a dish in its own right, it is valued for the contrast between the crisp outside and the creamy inside, which soft polenta cannot give. It is now common on restaurant menus throughout northern Italy.')
  const newBodyContent = [...body.content!]
  newBodyContent[0] = newP0
  newBodyContent[11] = newP11
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 34-vegan-mushroom-risotto: grade-level at paragraph[0] and paragraph[8]
{
  const { data, filepath } = load('34-vegan-mushroom-risotto.json')
  const body = data.body as DocNode
  const newP0 = pt('Vegan mushroom risotto works because the creaminess in risotto comes from technique, not from dairy. Rice starch released during stirring, plus fat beaten in at the end, creates the glossy coating texture. Replacing butter with olive oil and Parmesan with nutritional yeast keeps the technique intact. The character changes but the quality does not.')
  const newP8 = pt('This is a dairy-free version of northern Italian mushroom risotto that does not compromise the technique. It works best in autumn when mushroom flavour is strongest, but the dried porcini keep it good year-round. The vegan version is lighter and slightly oilier than the original. It is not the same dish, but it is a good one. Anyone who cannot eat dairy can eat this without feeling they are missing out.')
  const newBodyContent = [...body.content!]
  newBodyContent[0] = newP0
  newBodyContent[8] = newP8
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 36-branzino-al-sale: grade-level at paragraph[8] + brand "Target" in troubleshooter
{
  const { data, filepath } = load('36-branzino-al-sale.json')
  let body = data.body as DocNode
  // Fix grade-level
  const newP8 = pt('Branzino al sale is found in coastal restaurants all along the Mediterranean, from Liguria to Sicily to Sardinia. The fish changes by region: branzino in Liguria, orata or spigola in Sicily, whatever the catch includes in Sardinia. The technique is the same everywhere: salt, egg white, oven. It makes an impression when the crust is cracked at the table. It is achievable at home and needs less skill than most fish dishes.')
  const newBodyContent = [...body.content!]
  newBodyContent[8] = newP8
  body = { ...body, content: newBodyContent }
  // Fix brand name "Target" in troubleshooter
  body = replaceText(body, 'Target', 'any kitchenware shop') as DocNode
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 37-sarde-a-beccafico: grade-level at paragraph[0] and paragraph[11] + agrodolce glossary miss
{
  const { data, filepath } = load('37-sarde-a-beccafico.json')
  let body = data.body as DocNode
  // Fix paragraph[0] - add agrodolce to intro
  const newP0: DocNode = {
    type: 'paragraph',
    content: [
      textNode('Sarde a beccafico is a study in Sicilian '),
      { type: 'text', text: 'agrodolce', marks: [tooltipMark('agrodolce')] },
      textNode(' (sweet-and-savoury) cooking. Breadcrumbs toasted in olive oil, pine nuts, raisins, anchovy, and orange zest go inside a butterflied fresh sardine. The sardine is rolled up, stood upright in a baking dish, and baked until golden. The raisins give sweetness, the anchovy gives salt, and the breadcrumbs give body and texture.'),
    ]
  }
  // Fix paragraph[11] - simplify grade-level
  const newP11 = pt('Sarde a beccafico is the unofficial dish of Palermo. It appears in the Vucciria and Ballarò markets, in neighbourhood restaurants across the city, and on family tables every Sunday. The flavours, sweet, salty, and herbal together, are pure Arab-Norman Sicily: the legacy of centuries of different peoples cooking with the same ingredients. It began as a way of making sardines go further with a cheap stuffing. It is now one of the finest expressions of Sicilian cooking.')
  const newBodyContent = [...body.content!]
  newBodyContent[0] = newP0
  newBodyContent[11] = newP11
  body = { ...body, content: newBodyContent }
  ;(data as Record<string, unknown>).body = body
  save(filepath, data)
}

// ---- 38-pasta-con-le-sarde: grade-level at paragraph[13]
{
  const { data, filepath } = load('38-pasta-con-le-sarde.json')
  const body = data.body as DocNode
  const newP = pt('Pasta con le sarde is the dish that best represents Sicilian culinary history. Its ingredients reflect nine centuries of Arab, Norman, and Greek influence on the island\'s cooking. The saffron and raisins came from the Arab-Norman kitchen; the sardines and fennel from the Greek and Roman tradition; the pine nuts from the Arab spice trade. In Palermo it is eaten on 19 March for the feast of San Giuseppe. Outside Sicily it is less common but entirely achievable. All the ingredients are available and the technique is simple once you understand how the elements fit together.')
  const newBodyContent = [...body.content!]
  newBodyContent[13] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

// ---- 40-calamari-ripieni: grade-level at paragraph[11]
{
  const { data, filepath } = load('40-calamari-ripieni.json')
  const body = data.body as DocNode
  const newP = pt('Calamari ripieni is found along the southern Italian coast, from Naples through Calabria and into Sicily, with different stuffings by region. The Sicilian version adds raisins and pine nuts; the Campanian is plainer and more anchovy-forward. It is a home-cooking dish rather than a restaurant one: the long braise means it is cooked ahead and reheated, which suits a domestic kitchen well. It improves overnight and the sauce is even better the next day.')
  const newBodyContent = [...body.content!]
  newBodyContent[11] = newP
  ;(data as Record<string, unknown>).body = { ...body, content: newBodyContent }
  save(filepath, data)
}

console.log('\nAll fixes applied.')
