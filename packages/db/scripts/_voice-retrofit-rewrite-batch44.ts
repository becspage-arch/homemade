/**
 * Targeted rewrites for batch 2026-05-28-batch1.
 *
 * For each file with voice-check errors we apply a surgical fix in place
 * (or remove unfixable verbatim-EFT slugs from the batch entirely).
 *
 * After this script runs, all remaining JSON files in the batch dir should
 * pass voice-check.
 */
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BATCH_ID = '2026-05-28-batch1'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

// Slugs that can't be applied: their only blocker is a verbatim EFT setup
// statement or tapping-point script line from Rebecca's books, which the
// verbatim-energy-statements memory exempts from voice rewrites. The
// voice-check grade-level rule still fires; routing these to KNOWN_BLOCKED.
const BLOCKED_BY_VERBATIM = [
  'tapping-for-the-new-family-story',
  'tapping-for-the-over-promised-week',
  'tapping-for-the-parent-money-tangle',
  'tapping-for-the-unearned-money',
]

function load(slug: string): any {
  const path = resolve(batchDir, `${slug}.json`)
  return JSON.parse(readFileSync(path, 'utf8'))
}

function save(slug: string, data: any): void {
  const path = resolve(batchDir, `${slug}.json`)
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function setTextAt(data: any, idx: number, newText: string): void {
  const node = data.body.content[idx]
  if (!node || node.type !== 'paragraph') {
    throw new Error(`expected paragraph at ${idx}, got ${node?.type}`)
  }
  node.content = [{ text: newText, type: 'text' }]
}

function removeIndices(data: any, indices: number[]): void {
  const sorted = [...indices].sort((a, b) => b - a)
  for (const i of sorted) {
    data.body.content.splice(i, 1)
  }
}

function rewriteTroubleshooterFix(data: any, contentIdx: number, itemIdx: number, newFix: string): void {
  const node = data.body.content[contentIdx]
  if (node?.type !== 'troubleshooter') {
    throw new Error(`expected troubleshooter at ${contentIdx}, got ${node?.type}`)
  }
  const items = node.attrs?.items
  if (!items?.[itemIdx]) throw new Error(`no item ${itemIdx} in troubleshooter[${contentIdx}]`)
  items[itemIdx].fix = newFix
}

function rewriteListItemParagraph(data: any, listContentIdx: number, listItemIdx: number, paragraphIdx: number, newText: string): void {
  const list = data.body.content[listContentIdx]
  if (list?.type !== 'bulletList' && list?.type !== 'orderedList') {
    throw new Error(`expected list at ${listContentIdx}, got ${list?.type}`)
  }
  const listItem = list.content?.[listItemIdx]
  if (!listItem) throw new Error(`no listItem ${listItemIdx}`)
  const paragraph = listItem.content?.[paragraphIdx]
  if (paragraph?.type !== 'paragraph') throw new Error(`no paragraph at ${paragraphIdx}`)
  paragraph.content = [{ text: newText, type: 'text' }]
}

// =====================================================================
// 1. gumbo-chicken-andouille: rewrite paragraph[15] + troubleshooter fix.
// =====================================================================
{
  const d = load('gumbo-chicken-andouille')
  setTextAt(
    d,
    15,
    'Gumbo is the state dish of Louisiana. It brings together West African, French, Spanish, and Native American cooking. The word comes from the Bantu ki ngombo, meaning okra. The dark roux is French in origin. The trio of vegetables (onion, celery, green pepper) is the Louisiana take on French mirepoix. Andouille sausage is the Cajun touch. Every cook makes it a bit differently, and arguing about the right version is a local pastime.',
  )
  rewriteTroubleshooterFix(
    d,
    13,
    2,
    'Add the okra at the end. Cook it for only the last 15 minutes. Or dry-roast the okra slices first in the oven at 200°C for 15 minutes before adding.',
  )
  save('gumbo-chicken-andouille', d)
}

// =====================================================================
// 2. gumbo-with-chicken-and-andouille: drop the "Before you start" H2
//    heading. The dark-roux note paragraph stays and acts as the opening
//    note before the Ingredients heading.
// =====================================================================
{
  const d = load('gumbo-with-chicken-and-andouille')
  removeIndices(d, [0])
  save('gumbo-with-chicken-and-andouille', d)
}

// =====================================================================
// 3. ham-chive-filo-tartlets: rewrite the vegetarian variation line.
// =====================================================================
{
  const d = load('ham-chive-filo-tartlets')
  rewriteListItemParagraph(
    d,
    8,
    0,
    0,
    'Vegetarian: use roasted veg in place of the ham. Try courgette, pepper, and aubergine with feta.',
  )
  save('ham-chive-filo-tartlets', d)
}

// =====================================================================
// 4. hard-dough-bread: rewrite paragraph[11] cultural note.
// =====================================================================
{
  const d = load('hard-dough-bread')
  setTextAt(
    d,
    11,
    'Hard-dough bread is the bread of Jamaica. Every bakery on the island sells it. It has been the household bread for generations. In Britain you can buy it in Caribbean bakeries and some supermarkets. It is a white sliced loaf, denser and chewier than standard British bread. It is the right base for a plate of ackee and saltfish. Few people bake it at home in the UK because the shop loaf is easy to find. The homemade one is much better though.',
  )
  save('hard-dough-bread', d)
}

// =====================================================================
// 5. harissa-chicken: rewrite paragraph[11] + troubleshooter fix.
// =====================================================================
{
  const d = load('harissa-chicken')
  setTextAt(
    d,
    11,
    'Harissa is the national condiment of Tunisia. Cooks there serve it with couscous, stir it into soups, and spread it on bread. The name comes from the Arabic harasa, meaning "to pound". The traditional method pounds dried chillies and spices in a mortar. Today harissa is sold in two main styles. Rose harissa is milder, made with rose petals and sweet pepper. Plain harissa is hotter and more chilli-led. Both are useful kitchen staples.',
  )
  rewriteTroubleshooterFix(
    d,
    9,
    2,
    'Marinate the chicken overnight. Use a hotter harissa. Score the chicken thighs first so the paste sinks in.',
  )
  save('harissa-chicken', d)
}

// =====================================================================
// 6. hash-browns: rewrite paragraph[11] + troubleshooter fix.
// =====================================================================
{
  const d = load('hash-browns')
  setTextAt(
    d,
    11,
    'Hashed potato dishes show up in American cooking from the late 1800s. The potato was a staple food, and short-order diner kitchens needed quick sides. The shredded-and-fried style became a standard diner breakfast by the early 1900s. Later it landed on every fast-food breakfast menu, which made it familiar all over the world. The good home version, made with floury potato squeezed dry and cooked in real butter, beats the version most people first taste.',
  )
  rewriteTroubleshooterFix(
    d,
    9,
    1,
    'Press the patties firmly when you shape them. Press down again in the pan straight away. Do not turn until the bottom is set and golden. That takes at least 4 minutes.',
  )
  save('hash-browns', d)
}

// =====================================================================
// 7. hasselback-potatoes: rewrite paragraph[0] (preserve glossaryTooltip)
//    and paragraph[13] (cultural note).
// =====================================================================
{
  const d = load('hasselback-potatoes')
  const p0 = d.body.content[0]
  // Preserve the glossaryTooltip mark on "Hasselback cut" (second inline node).
  // Rebuild the inline content with simpler surrounding prose.
  const tooltipNode = p0.content?.find((n: any) => n.marks?.[0]?.type === 'glossaryTooltip')
  if (!tooltipNode) throw new Error('expected glossaryTooltip in hasselback p0')
  p0.content = [
    { text: 'A ', type: 'text' },
    tooltipNode,
    {
      text: ' turns a plain roasting potato into a fan of thin slices. Every cut edge crisps in the oven. The gaps between slices fill with herb butter. To stop the knife at the base, lay a chopstick along each side of the potato. The chopsticks block the blade so it cannot cut all the way through.',
      type: 'text',
    },
  ]
  setTextAt(
    d,
    13,
    'The cut takes its name from the Hasselbacken hotel in Stockholm, where the technique was first served. British food writers picked it up later. It sits well next to a roast as a more striking option than plain roast potatoes. It also works as a weeknight side that looks more deliberate than it is.',
  )
  save('hasselback-potatoes', d)
}

// =====================================================================
// 8. hob-nobs: rewrite orderedList[5] listItem[4] paragraph[0] step.
// =====================================================================
{
  const d = load('hob-nobs')
  rewriteListItemParagraph(
    d,
    5,
    4,
    0,
    'Scoop out 1.5 tablespoons of dough at a time. Press the dough firmly into the scoop. Roll each scoop into a ball. Press the dough with your hands as you roll so the ball holds its shape.',
  )
  save('hob-nobs', d)
}

// =====================================================================
// 9. holodets: rewrite paragraph[13] (move Molokhovets to sourceNotes).
// =====================================================================
{
  const d = load('holodets')
  setTextAt(
    d,
    13,
    'Holodets sits on the Russian New Year\'s table next to vinegret, Olivier salad, and herring under a fur coat. These are the classic cold starters of the Soviet and post-Soviet feast. The name comes from the Russian kholod (cold). The dish must be made ahead, kept cold, and eaten cold. It is December food. Cooks make it in large batches and leave it to set overnight while the rest of the holiday meal is prepared.',
  )
  // Append Molokhovets attribution to sourceNotes (if not already there)
  const sn = d.sourceNotes ?? ''
  if (!/molokhovets/i.test(sn)) {
    d.sourceNotes =
      (sn ? sn.trim() + ' ' : '') +
      'Molokhovets, A Gift to Young Housewives (mid-19th century): early Russian recipes for set meat jelly under the name studienets.'
  }
  save('holodets', d)
}

// =====================================================================
// 10. holubtsi: rewrite paragraph[0] + paragraph[11].
// =====================================================================
{
  const d = load('holubtsi')
  setTextAt(
    d,
    0,
    'Holubtsi differ from Polish gołąbki in two main ways. The filling uses both pork and beef mince. That gives a slightly richer flavour than all-pork. Sunflower oil replaces butter as the fat in the filling and sauce. The tomato sauce is made from tinned tomatoes, not a lighter stock-and-puree mix. The braise is more intensely flavoured as a result.',
  )
  setTextAt(
    d,
    11,
    'Holubtsi turn up at almost every big meal in Ukrainian home cooking. They appear at Christmas Eve (Svyata Vechera), at Easter, at weddings, and at weekday dinners when something slow-cooked is wanted. Cooks make them in large batches, often with the whole family helping. They improve over the next few days as the sauce reduces and the filling softens. Nearly identical versions exist in Polish, Hungarian, Romanian, and Jewish Eastern European cooking. The Ukrainian version stands out for its two-meat filling and sunflower-oil base.',
  )
  save('holubtsi', d)
}

// =====================================================================
// 11. pumpkin-bread-american: split the long ingredient-token paragraphs
//     into shorter sentences so the FK grade drops.
// =====================================================================
{
  const d = load('pumpkin-bread-american')
  setTextAt(
    d,
    6,
    'In a large bowl, whisk the {{pumpkin-puree}} with the {{light-brown-sugar}}. Add the {{vegetable-oil}}, {{free-range-eggs}}, and {{vanilla-extract}}. Whisk until smooth.',
  )
  setTextAt(
    d,
    8,
    'Add the {{plain-flour}}, {{bicarbonate-of-soda}}, and {{baking-powder}}. Add the {{fine-sea-salt}}. Add the {{ground-cinnamon}}, {{ground-ginger}}, {{ground-nutmeg}}, and {{ground-cloves}}. Stir until just combined.',
  )
  save('pumpkin-bread-american', d)
}

// =====================================================================
// 12. ricotta-cheesecake-sicilian: rewrite paragraph[0] keeping the
//     pasta-frolla glossaryTooltip.
// =====================================================================
{
  const d = load('ricotta-cheesecake-sicilian')
  const p0 = d.body.content[0]
  const tooltipNode = p0.content?.find((n: any) => n.marks?.[0]?.type === 'glossaryTooltip')
  if (!tooltipNode) throw new Error('expected glossaryTooltip in ricotta p0')
  p0.content = [
    {
      text: 'The New York cheesecake is dense and rich. This Sicilian version is lighter and finer. The ricotta gives a texture that is almost mousse-like at the centre. The pastry case is a ',
      type: 'text',
    },
    tooltipNode,
    {
      text: ', a sweet Italian short pastry. It lines the base and sides of a springform tin. The filling is beaten ricotta, eggs, sugar, and the flavours that set Sicilian baking apart. Those are orange zest and candied peel, vanilla, and a scrape of lemon.',
      type: 'text',
    },
  ]
  save('ricotta-cheesecake-sicilian', d)
}

// =====================================================================
// 13. rocky-road-slice: split paragraph[8] step into shorter sentences.
// =====================================================================
{
  const d = load('rocky-road-slice')
  setTextAt(
    d,
    8,
    'Fold the broken {{digestive-biscuits}} into the chocolate. Fold in the {{mini-marshmallows}}. Fold in the {{raisins}}. Stir until everything is coated. Tip into the tin and press into an even layer.',
  )
  save('rocky-road-slice', d)
}

// =====================================================================
// 14. rough-puff-pastry: rewrite paragraph[24] (drop Beeton/Acton/White
//     historical figures (already in sourceNotes).
// =====================================================================
{
  const d = load('rough-puff-pastry')
  setTextAt(
    d,
    24,
    'Rough-puff is the everyday British kitchen version of French puff pastry. The full puff method needs a marble slab, plenty of time, and a cold kitchen. Rough-puff asks for the same rests but works in any kitchen. It became the standard home pastry for savoury pies across regional Britain. See the Sources block for the kitchen manuals that codified the method.',
  )
  save('rough-puff-pastry', d)
}

// =====================================================================
// 15. tapping-for-the-good-mother-pressure: rewrite paragraph[0].
// =====================================================================
{
  const d = load('tapping-for-the-good-mother-pressure')
  setTextAt(
    d,
    0,
    'A five-minute EFT tapping practice for the good-mother pressure. The script works through the steady inner check on whether you are mothering well enough. It taps the moving goalposts, and the tiredness of being judged: by other people and, more sharply, by yourself.',
  )
  save('tapping-for-the-good-mother-pressure', d)
}

// =====================================================================
// 16. tapping-for-the-money-fight-that-keeps-returning: rewrite p[0] +
//     drop the "Where this comes from" H2 + attribution paragraph
//     (substance is already in sourceNotes).
// =====================================================================
{
  const d = load('tapping-for-the-money-fight-that-keeps-returning')
  setTextAt(
    d,
    0,
    'An EFT tapping sequence for the money argument that keeps coming back. The same lines, the same positions, never quite resolved. The script taps the worn-out feel of two different money histories meeting. It works toward the idea that different does not have to mean stuck.',
  )
  // h12 and p13 (the duplicate attribution)
  removeIndices(d, [12, 13])
  save('tapping-for-the-money-fight-that-keeps-returning', d)
}

// =====================================================================
// 17. tapping-for-the-need-to-control-the-night: drop h10 + p11.
// =====================================================================
{
  const d = load('tapping-for-the-need-to-control-the-night')
  removeIndices(d, [10, 11])
  save('tapping-for-the-need-to-control-the-night', d)
}

// =====================================================================
// 18. tapping-for-the-should-be-over-it-pressure: drop h10 + p11.
// =====================================================================
{
  const d = load('tapping-for-the-should-be-over-it-pressure')
  removeIndices(d, [10, 11])
  save('tapping-for-the-should-be-over-it-pressure', d)
}

// =====================================================================
// 19. tapping-for-the-wait-for-apology-trap: drop h10 + p11.
// =====================================================================
{
  const d = load('tapping-for-the-wait-for-apology-trap')
  removeIndices(d, [10, 11])
  save('tapping-for-the-wait-for-apology-trap', d)
}

// =====================================================================
// Remove the 4 verbatim-EFT-blocked JSON files from the batch dir so
// the apply step processes a clean set.
// =====================================================================
for (const slug of BLOCKED_BY_VERBATIM) {
  const p = resolve(batchDir, `${slug}.json`)
  if (existsSync(p)) {
    rmSync(p)
    console.log(`[removed] ${slug}.json (verbatim-EFT blocked)`)
  }
}

// Update _slugs.json to reflect the dropped slugs.
{
  const slugsPath = resolve(batchDir, '_slugs.json')
  const slugsBlob = JSON.parse(readFileSync(slugsPath, 'utf8'))
  const blocked = new Set(BLOCKED_BY_VERBATIM)
  const before = slugsBlob.slugs.length
  slugsBlob.slugs = slugsBlob.slugs.filter((s: string) => !blocked.has(s))
  if (Array.isArray(slugsBlob.details)) {
    slugsBlob.details = slugsBlob.details.filter((d: any) => !blocked.has(d.slug))
  }
  slugsBlob.count = slugsBlob.slugs.length
  slugsBlob.droppedVerbatimEFT = BLOCKED_BY_VERBATIM
  console.log(`[slugs] before ${before}, after ${slugsBlob.slugs.length}`)
  writeFileSync(slugsPath, JSON.stringify(slugsBlob, null, 2) + '\n', 'utf8')
}

console.log('\n[done] all rewrites applied')
console.log('Next: run _batch-voice-check-all.ts to verify, then _pilot-voice-apply.ts to apply.')
