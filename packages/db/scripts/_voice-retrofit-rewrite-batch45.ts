/**
 * Targeted rewrites for batch 2026-05-28-batch2.
 *
 * For each file with voice-check errors we apply a surgical fix in place
 * (or remove unfixable verbatim-EFT slugs from the batch entirely).
 *
 * After this script runs, all remaining JSON files in the batch dir should
 * pass voice-check.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BATCH_ID = '2026-05-28-batch2'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

// Slugs blocked because their only voice-check failure is on a verbatim
// EFT setup statement ("Even though X, I deeply and completely accept
// myself"). These cannot be rewritten per the verbatim-energy-statements
// memory rule.
const BLOCKED_BY_VERBATIM = [
  'tapping-to-anchor-trust-in-multi-million-investments',
  'tapping-to-build-generational-wealth',
  'tapping-to-celebrate-daily-freedom-and-joy',
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

function rewriteTroubleshooterFix(
  data: any,
  contentIdx: number,
  itemIdx: number,
  newFix: string,
): void {
  const node = data.body.content[contentIdx]
  if (node?.type !== 'troubleshooter') {
    throw new Error(`expected troubleshooter at ${contentIdx}, got ${node?.type}`)
  }
  const items = node.attrs?.items
  if (!items?.[itemIdx]) throw new Error(`no item ${itemIdx} in troubleshooter[${contentIdx}]`)
  items[itemIdx].fix = newFix
}

function rewriteListItemParagraph(
  data: any,
  listContentIdx: number,
  listItemIdx: number,
  paragraphIdx: number,
  newText: string,
): void {
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
// 1. honey-roast-carrots-and-parsnips: rewrite paragraph[12].
// =====================================================================
{
  const d = load('honey-roast-carrots-and-parsnips')
  setTextAt(
    d,
    12,
    'Carrots and parsnips roast well together. Both take the same oven heat. Both take the same glaze. Roasting them in one tin saves hob space on a busy Sunday. It is one tray to manage, not two. The pairing is partly tradition, partly practicality.',
  )
  save('honey-roast-carrots-and-parsnips', d)
}

// =====================================================================
// 2. honey-soy-baked-drumsticks: rewrite the step at orderedList[5]
//    listItem[4] paragraph[0]. Also convert the °F reading to °C, which
//    matches the rest of the site convention.
// =====================================================================
{
  const d = load('honey-soy-baked-drumsticks')
  rewriteListItemParagraph(
    d,
    5,
    4,
    0,
    'Bake for 35 minutes. Baste the drumsticks every 10 minutes with the marinade. They are done when a meat thermometer in the thickest part reads 75°C.',
  )
  save('honey-soy-baked-drumsticks', d)
}

// =====================================================================
// 3. hortobagyi-palacsinta: rewrite paragraph[15] cultural note.
// =====================================================================
{
  const d = load('hortobagyi-palacsinta')
  setTextAt(
    d,
    15,
    "The Hortobágy is Hungary's great eastern steppe. It is a UNESCO World Heritage landscape of grassland, cattle, and horsemen. The name attaches to this dish as a nod to hearty plains cooking. The recipe is on restaurant menus all over Hungary. It is taught in cooking schools as one of the classic dishes of the national kitchen. It sits in the same family as filled palacsinta, Hungary's version of the French crêpe. Those turn up at every meal, sweet and savoury, and have been part of Central European cooking for hundreds of years.",
  )
  save('hortobagyi-palacsinta', d)
}

// =====================================================================
// 4. hot-chocolate: rewrite paragraph[12] cultural note.
// =====================================================================
{
  const d = load('hot-chocolate')
  setTextAt(
    d,
    12,
    "London's first chocolate houses opened in the 1650s. England was one of the earliest countries in Europe to take up hot chocolate as a social drink. By the 1700s, houses like White's and Cocoa Tree had become political and social hubs. Many of them later became gentlemen's clubs. Cocoa powder versions came in during the 1800s and 1900s. They were cheaper and easier to keep on the shelf than real chocolate. The real-chocolate version is the older tradition though.",
  )
  save('hot-chocolate', d)
}

// =====================================================================
// 5. huevos-rancheros: rewrite paragraph[0] orientation + paragraph[13]
//    cultural note.
// =====================================================================
{
  const d = load('huevos-rancheros')
  setTextAt(
    d,
    0,
    'The dish has three layers. A corn tortilla, crisped briefly in oil so it does not go limp. A fried egg with a runny yolk on top. And a ranchero salsa of tinned tomatoes, garlic, chilli, and cumin. The salsa is sharp, a little spicy, and loose enough to soak into the edges of the tortilla. Fry the eggs sunny-side up or over-easy. The yolk breaks when you cut into it and mixes with the salsa.',
  )
  setTextAt(
    d,
    13,
    'Huevos rancheros is the traditional breakfast of Mexican ranch workers. They ate it before a long day in the fields. It is filling and fast. It uses ingredients that were always to hand. The dish crossed into American cooking through Tex-Mex kitchens in the Southwest. It appears on diner and brunch menus in Texas, New Mexico, Arizona, and California. From the 1970s on, US interest in Mexican food spread the dish across the country. It is a morning dish that works at any hour.',
  )
  save('huevos-rancheros', d)
}

// =====================================================================
// 6. hummus-with-warm-pita: rewrite troubleshooter[9] item[1] fix +
//    paragraph[11] cultural note.
// =====================================================================
{
  const d = load('hummus-with-warm-pita')
  rewriteTroubleshooterFix(
    d,
    9,
    1,
    'Start with 1 clove of garlic. Taste before adding the second. Tahini quality varies a lot. Use a runny, pale tahini, not a thick, dark one.',
  )
  setTextAt(
    d,
    11,
    'Hummus bi tahini appears in Arabic cookbooks from the 1200s. It is a staple across the Levant, Turkey, Cyprus, and North Africa. The question of who invented it is hotly debated and probably cannot be settled. Chickpeas and sesame paste have been combined across the eastern Mediterranean for many hundreds of years. The home version, made fresh and eaten the same day, bears little resemblance to the shop-tub kind. Tub hummus is made for long shelf life, not for flavour.',
  )
  save('hummus-with-warm-pita', d)
}

// =====================================================================
// 7. hummus: rewrite troubleshooter[11] item[1] fix.
// =====================================================================
{
  const d = load('hummus')
  rewriteTroubleshooterFix(
    d,
    11,
    1,
    'With the processor running, add cold water one tablespoon at a time. Keep going until the hummus is smooth and easy to spread.',
  )
  save('hummus', d)
}

// =====================================================================
// 8. hungarian-goulash: rewrite paragraph[7] cultural note.
// =====================================================================
{
  const d = load('hungarian-goulash')
  setTextAt(
    d,
    7,
    "Goulash began as a herdsman's dish. Gulyás means cowherd in Hungarian. Cattle drovers cooked it on the plains of the Puszta. They dried the cooked beef for the journey and added water and onions on the road. Paprika reached Hungary in the 1500s during Ottoman rule. Within two hundred years it was central to the national cooking. The dish spread through Central Europe with the Habsburg Empire. It turns up in Austria, the Czech lands, Slovakia, and southern Germany. The Hungarian version remains the most paprika-forward.",
  )
  save('hungarian-goulash', d)
}

// =====================================================================
// 9. insalata-di-rinforzo: rewrite paragraph[0] orientation +
//    paragraph[11] cultural note.
// =====================================================================
{
  const d = load('insalata-di-rinforzo')
  setTextAt(
    d,
    0,
    'Insalata di rinforzo is the salad of the Neapolitan Christmas table. It is the counterweight to the rich food around it. The cauliflower is blanched just enough to lose its raw edge. The dressing is sharp with vinegar, anchovies, capers, and olives. It cuts through heavier food as acid always does. It tastes better as it sits.',
  )
  setTextAt(
    d,
    11,
    'This salad is on Christmas Eve tables all over Naples, almost without exception. The Feast of the Seven Fishes is a southern Italian Catholic tradition. It bans meat on Christmas Eve. The table fills with fish, shellfish, and vegetable dishes instead. Insalata di rinforzo is the salad part. It is sharp, briny, and vegetable-led. It sits well next to rich baccalà fritto and anguilla in umido. Outside Naples it is a very good cauliflower salad. It works alongside any rich protein. A small set of pantry ingredients gives a lot of flavour when they are the right ones.',
  )
  save('insalata-di-rinforzo', d)
}

// =====================================================================
// 10. irish-stew: rewrite paragraph[0] orientation + paragraph[12]
//     cultural note. Both year references (1843) and (1937) drop from
//     body; sourceNotes already covers Florence Irwin and gets a
//     Thackeray reference appended if not present.
// =====================================================================
{
  const d = load('irish-stew')
  setTextAt(
    d,
    0,
    'Irish stew is one of the most minimal dishes in the British repertoire. Lamb neck, potato, onion, water, and time. That is the purist version. The recipe here adds a small amount of thyme and parsley. That is a common modern touch and does not change the character of the dish. Carrots appear in some versions and not others. Their use is a matter of regional preference, not authenticity.',
  )
  setTextAt(
    d,
    12,
    'Irish stew has a long history in pot cooking over an open fire. The pure version uses three things and water. Lamb, potato, and onion. Victorian travel writers and Irish country cooks both recorded that version. The simplest mix of what was on hand was the most reliable. Whether carrots belong has split Irish cooks for generations. The lamb-and-potato pair is the only fixed point. Some households use mutton instead of lamb. The flavour is stronger and suits the long braise even better. See the Sources block for the cookery writers who recorded the original.',
  )
  // Append Thackeray reference to sourceNotes if not already there.
  const sn = d.sourceNotes ?? ''
  if (!/thackeray/i.test(sn)) {
    d.sourceNotes =
      (sn ? sn.trim() + ' ' : '') +
      'William Makepeace Thackeray, The Irish Sketch Book (1843): an early Victorian travel record praising Irish stew as cooked in country households.'
  }
  save('irish-stew', d)
}

// =====================================================================
// 11. tapping-for-turning-50: drop h10 + p11 (Where this practice comes
//     from). Substance lives in sourceNotes.
// =====================================================================
{
  const d = load('tapping-for-turning-50')
  removeIndices(d, [10, 11])
  save('tapping-for-turning-50', d)
}

// =====================================================================
// 12. tapping-for-we-cant-talk-anymore: drop h10 + p11.
// =====================================================================
{
  const d = load('tapping-for-we-cant-talk-anymore')
  removeIndices(d, [10, 11])
  save('tapping-for-we-cant-talk-anymore', d)
}

// =====================================================================
// 13. tapping-for-we-never-get-ahead: drop h10 + p11.
// =====================================================================
{
  const d = load('tapping-for-we-never-get-ahead')
  removeIndices(d, [10, 11])
  save('tapping-for-we-never-get-ahead', d)
}

// =====================================================================
// 14. tapping-for-what-if-it-runs-out: drop h12 + p13 (extra "When
//     this isn't working" block sits between, so the Where-comes-from
//     pair is at [12, 13]).
// =====================================================================
{
  const d = load('tapping-for-what-if-it-runs-out')
  removeIndices(d, [12, 13])
  save('tapping-for-what-if-it-runs-out', d)
}

// =====================================================================
// 15. tapping-for-who-am-i-to-have-so-much: drop h12 + p13.
// =====================================================================
{
  const d = load('tapping-for-who-am-i-to-have-so-much')
  removeIndices(d, [12, 13])
  save('tapping-for-who-am-i-to-have-so-much', d)
}

// =====================================================================
// 16. tapping-for-working-mum-guilt: drop h10 + p11.
// =====================================================================
{
  const d = load('tapping-for-working-mum-guilt')
  removeIndices(d, [10, 11])
  save('tapping-for-working-mum-guilt', d)
}

// =====================================================================
// 17. tapping-to-attract-the-right-advisors-and-deals: rewrite p[0]
//     orientation. The "Where this practice comes from" attribution
//     paragraph[11] is already within grade and stays as-is.
// =====================================================================
{
  const d = load('tapping-to-attract-the-right-advisors-and-deals')
  setTextAt(
    d,
    0,
    'A five-minute EFT tapping practice from Day 74 of a 12-week money programme. The script works with the feeling of facing large money decisions without the right people around you. It moves toward a settled expectation that the right advisors, mentors, and opportunities will turn up at the right time.',
  )
  save('tapping-to-attract-the-right-advisors-and-deals', d)
}

// =====================================================================
// Remove the verbatim-EFT-blocked JSON files from the batch dir.
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
