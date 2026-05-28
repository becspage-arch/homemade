/**
 * Apply hand-written rewrites for voice-retrofit batch 2026-05-28-batch7.
 * Operates on the JSON files in docs/voice-retrofit-2026-05-28-batch7/.
 * Re-runs voice-check after each rewrite and prints residuals.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-28-batch7'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)

function loadFile(slug: string): any {
  return JSON.parse(readFileSync(resolve(batchDir, `${slug}.json`), 'utf8'))
}
function saveFile(slug: string, data: any): void {
  writeFileSync(resolve(batchDir, `${slug}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function replaceParagraphAt(body: any, idx: number, newText: string): void {
  const node = body.content[idx]
  if (!node || node.type !== 'paragraph') throw new Error(`block[${idx}] not paragraph (got ${node?.type})`)
  node.content = [{ type: 'text', text: newText }]
}

function replaceTextInList(body: any, listIdx: number, itemIdx: number, paraIdx: number, newText: string): void {
  const list = body.content[listIdx]
  if (!list || (list.type !== 'orderedList' && list.type !== 'bulletList')) throw new Error(`block[${listIdx}] not list`)
  const item = list.content[itemIdx]
  if (!item || item.type !== 'listItem') throw new Error(`list[${listIdx}].content[${itemIdx}] not listItem`)
  const para = item.content[paraIdx]
  if (!para || para.type !== 'paragraph') throw new Error(`list[${listIdx}].content[${itemIdx}].content[${paraIdx}] not paragraph`)
  para.content = [{ type: 'text', text: newText }]
}

function replaceTroubleshooterField(body: any, blockIdx: number, itemIdx: number, field: 'symptom' | 'cause' | 'fix', newText: string): void {
  const block = body.content[blockIdx]
  if (!block || block.type !== 'troubleshooter') throw new Error(`block[${blockIdx}] not troubleshooter`)
  const item = block.attrs?.items?.[itemIdx]
  if (!item) throw new Error(`troubleshooter item[${itemIdx}] missing`)
  item[field] = newText
}

// === REWRITES ===

// 1. lemonade.json paragraph[12]
{
  const f = loadFile('lemonade')
  replaceParagraphAt(f.body, 12, 'Homemade lemonade is a summer ritual in Britain. It sits alongside Wimbledon, summer fêtes, and back-garden cricket. Most shop versions are made from lemon flavouring, fizz, and sweetener rather than real lemon. That is why homemade tastes so different from the bottled kind: sharper and less sweet. This version uses a simple sugar syrup and fresh lemon. The ratio is easy to adjust to taste.')
  saveFile('lemonade', f)
}

// 2. lentil-and-bacon-soup.json paragraph[14]
{
  const f = loadFile('lentil-and-bacon-soup')
  replaceParagraphAt(f.body, 14, 'Lentil and bacon soup is one of the lasting British lunch soups. It is filling, cheap to make in big batches, and better the day after. Cured pork with dried pulses appears in nearly every European cooking tradition. The British version borrows from the French soupe aux lentilles and the German Linsensuppe without being either. It is midwinter food: plain and reliable.')
  saveFile('lentil-and-bacon-soup', f)
}

// 3. lentil-and-feta-salad.json paragraph[14]
{
  const f = loadFile('lentil-and-feta-salad')
  replaceParagraphAt(f.body, 14, 'The warm lentil salad is a French bistro staple that crossed into British cooking with ease. It needs no skill beyond boiling and dressing. Puy lentils, grown in the volcanic soils of the Auvergne, became common in British shops and are now standard. The feta is not French. It is the British home version of the dish: a practical add-on that makes the salad filling enough for lunch rather than a side.')
  saveFile('lentil-and-feta-salad', f)
}

// 4. linguine-ai-gamberi.json paragraph[11]
{
  const f = loadFile('linguine-ai-gamberi')
  replaceParagraphAt(f.body, 11, 'Pasta with shellfish in the aglio-olio-peperoncino style is the classic dish of the Italian coast from Campania to Sicily. The base of garlic, olive oil, chilli, and white wine suits nearly every shellfish. It works for clams, mussels, prawns, and scallops with little change to the method. Linguine ai gamberi is the prawn version. It is one of the most ordered pasta dishes in Italian seaside restaurants.')
  saveFile('linguine-ai-gamberi', f)
}

// 5. linguine-allastice.json paragraph[11]
{
  const f = loadFile('linguine-allastice')
  replaceParagraphAt(f.body, 11, "Linguine all'astice is a dish of the Italian seaside summer. It is pricey, festive, and tied to the restaurant tables of Sardinia, Campania, and Sicily. The lobster is halved live or bought straight from fishing boats. Abroad it has become a prestige pasta dish: shell-sautéing applied to a whole halved lobster. This version uses king prawns. It keeps the method and the flavour without the cost or the work of handling a live lobster.")
  saveFile('linguine-allastice', f)
}

// 6. liver-and-onions.json paragraph[12]
{
  const f = loadFile('liver-and-onions')
  replaceParagraphAt(f.body, 12, 'Liver and onions is one of the most misunderstood dishes in British cooking. Most people remember it badly because school and canteen kitchens nearly always overcooked it. Cooked well, it is nearly always excellent. Its place in British home cooking goes back centuries. Liver was cheap, full of iron, and easy to find. The pairing with slowly caramelised onions is one of the oldest flavour combinations in Europe. Nose-to-tail cooking has brought it back in restaurants. It works as a quick, cheap dish with real flavour.')
  saveFile('liver-and-onions', f)
}

// 7. loaded-mashed-potato-casserole.json orderedList[5] listItem[0] paragraph[0]
// 8. loaded-mashed-potato-casserole.json orderedList[5] listItem[4] paragraph[0]
{
  const f = loadFile('loaded-mashed-potato-casserole')
  replaceTextInList(f.body, 5, 0, 0, 'First, line a baking sheet with foil. Lay the bacon on it. Bake at 400F for 10 min until crispy. Chop the bacon into tiny pieces for garnish and set aside.')
  replaceTextInList(f.body, 5, 4, 0, 'Fold in 2 cups of cheese with a spatula. Move the potatoes to a casserole dish. Top with 1 cup of shredded cheese. Bake uncovered at 350 F for 30 minutes until heated through.')
  saveFile('loaded-mashed-potato-casserole', f)
}

// 9. lobster-roll.json troubleshooter[11] item[3] fix
// 10. lobster-roll.json paragraph[13]
{
  const f = loadFile('lobster-roll')
  replaceTroubleshooterField(f.body, 11, 3, 'fix', 'Season the filling with salt and white pepper. Add lemon juice freely; lobster is better with acid.')
  replaceParagraphAt(f.body, 13, 'The lobster roll is a New England summer staple. Roadside shacks along the Maine and Connecticut coasts sell it from June to September. The two versions are cold Maine-style and warm Connecticut-style, butter only and no mayo. Each is a different way of eating the same thing, and loyalties run deep. The cold version travels well and holds up on the way to the beach. The warm version is best straight away. Both joined the American seafood canon in the early twentieth century. Lobster had been treated as a poverty food until coastal fishing towns saw that city buyers would pay for what they had been eating for years.')
  saveFile('lobster-roll', f)
}

// 11. mac-and-cheese-baked.json paragraph[13]
{
  const f = loadFile('mac-and-cheese-baked')
  replaceParagraphAt(f.body, 13, 'Baked macaroni cheese was already a household dish in early 19th-century America. It appears in printed cookbooks of that period (see Sources below). The oven version with a breadcrumb crust is the traditional American form. The stovetop version with a processed cheese sauce came much later. The dish became closely tied to African American Southern cooking through the 1800s and 1900s. It was a centrepiece of Sunday meals and holiday tables.')
  // Make sure sourceNotes carries the Mary Randolph reference if not present.
  const sn = f.sourceNotes ?? ''
  if (!sn.includes('Mary Randolph')) {
    f.sourceNotes = (sn ? sn + '\n\n' : '') + "Mary Randolph, The Virginia Housewife (1824), is the earliest American printed source for baked macaroni cheese."
  }
  saveFile('mac-and-cheese-baked', f)
}

// 12. the-deed-that-outlasts-you-visualisation.json paragraph[9]
{
  const f = loadFile('the-deed-that-outlasts-you-visualisation')
  replaceParagraphAt(f.body, 9, 'Original to homemade.education. Forward-looking imagery shows up in many therapy and coaching styles. No single source is claimed.')
  saveFile('the-deed-that-outlasts-you-visualisation', f)
}

// 13. the-deposit-coin.json paragraph[13]
// 14. the-deposit-coin.json paragraph[17]
{
  const f = loadFile('the-deposit-coin')
  replaceParagraphAt(f.body, 13, "If you can't reach the property line unseen, you can post the coin through the letterbox. You can slip it under a stone near the boundary. You can drop it into a hedge by the gate. Or you can leave it on a doorstep.")
  replaceParagraphAt(f.body, 17, 'Deposit-token and walk-by manifesting show up across folk magic and property-manifesting groups. The pattern is recorded in self-help and folk-craft sources going back decades. The specific staged version here (walk, place, walk away) is original to homemade.education.')
  saveFile('the-deposit-coin', f)
}

// 15. the-door-you-didnt-know-was-a-door.json paragraph[9]
{
  const f = loadFile('the-door-you-didnt-know-was-a-door')
  replaceParagraphAt(f.body, 9, 'Original to homemade.education. A visualisation for opening to surprise income routes.')
  saveFile('the-door-you-didnt-know-was-a-door', f)
}

// 16. the-drawer-where-the-paperwork-lives-visualisation.json paragraph[0]
// 17. the-drawer-where-the-paperwork-lives-visualisation.json paragraph[12]
{
  const f = loadFile('the-drawer-where-the-paperwork-lives-visualisation')
  replaceParagraphAt(f.body, 0, 'A ten-minute visualisation for building a calm picture of money-paperwork in order. The practice uses one real place (a drawer, a folder, a shelf, wherever your paperwork lives) to anchor the feeling of order and ease. The body treats what the mind sees as real. That is why this kind of rehearsal shifts the charge around money admin.')
  replaceParagraphAt(f.body, 12, "Original to homemade.education. Built for the theme of Day 55 in Rebecca's tapping program (see Sources below).")
  const sn = f.sourceNotes ?? ''
  if (!sn.includes('MONEY: A 12-Week Tapping Program')) {
    f.sourceNotes = (sn ? sn + '\n\n' : '') + 'Day 55 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025).'
  }
  saveFile('the-drawer-where-the-paperwork-lives-visualisation', f)
}

// 18. the-family-story-shifting-visualisation.json paragraph[8]
{
  const f = loadFile('the-family-story-shifting-visualisation')
  replaceParagraphAt(f.body, 8, 'Original to homemade.education. Lineage-shift imagery shows up in many therapy and coaching styles. No single source is claimed.')
  saveFile('the-family-story-shifting-visualisation', f)
}

// 19. the-feast-and-famine-cycle-and-how-to-widen-the-floor.json paragraph[14]
// 20. the-feast-and-famine-cycle-and-how-to-widen-the-floor.json paragraph[22]
{
  const f = loadFile('the-feast-and-famine-cycle-and-how-to-widen-the-floor')
  replaceParagraphAt(f.body, 14, 'Steady earner. Feast-and-famine earner. "Always one launch away." "Self-employment is always shaky." Name it plainly.')
  replaceParagraphAt(f.body, 22, "Original to homemade.education. Adapted from Phase 2 identity work in Rebecca's MONEY program (see Sources below). Also draws on public-domain writing on self-employment income swings.")
  const sn = f.sourceNotes ?? ''
  if (!sn.includes('MONEY v2')) {
    f.sourceNotes = (sn ? sn + '\n\n' : '') + 'Adapted from Phase 2 identity work in MONEY v2 (Rebecca J Page, 2025) and from public-domain literature on self-employment income volatility.'
  }
  saveFile('the-feast-and-famine-cycle-and-how-to-widen-the-floor', f)
}

// 21. the-feast-and-famine-money-cycle-explained.json paragraph[0]
// 22. the-feast-and-famine-money-cycle-explained.json paragraph[14] (banned "genuinely")
{
  const f = loadFile('the-feast-and-famine-money-cycle-explained')
  replaceParagraphAt(f.body, 0, 'The feast-and-famine cycle is partly practical: irregular income is irregular. It is also partly nervous system: the body learns to expect the swing and braces for it, even in months where income is steady. This reading sketches how the cycle works. It then walks a Release/Allow energy-statement pair for the gap period, when the bracing has arrived too early.')
  replaceParagraphAt(f.body, 14, "If the Allow lands as a lie because the next inflow date really is unknown, that's real material, not resistance. Tap on the named uncertainty first. Once the charge of the unknown has reduced, the Allow lands more easily.")
  saveFile('the-feast-and-famine-money-cycle-explained', f)
}

// 23. the-first-thing-i-ever-heard-about-money-journal.json paragraph[16]
{
  const f = loadFile('the-first-thing-i-ever-heard-about-money-journal')
  replaceParagraphAt(f.body, 16, "Drawn from Rebecca's Money Journal, Week 2 (see Sources below). It addresses breaking family money patterns through structured reflection.")
  const sn = f.sourceNotes ?? ''
  if (!sn.includes('Money Journal')) {
    f.sourceNotes = (sn ? sn + '\n\n' : '') + 'The Money Journal: 12 Weeks to Peace, Freedom and Overflow (Rebecca J Page, 2025), Week 2.'
  }
  saveFile('the-first-thing-i-ever-heard-about-money-journal', f)
}

// 24. the-fork-in-the-road-choosing-the-new-path.json paragraph[10]
{
  const f = loadFile('the-fork-in-the-road-choosing-the-new-path')
  replaceParagraphAt(f.body, 10, "Original to homemade.education. Built for the fear-of-repetition theme in Day 11 of Rebecca's tapping program (see Sources below). The choice-point image draws on public-domain coaching and contemplative work.")
  const sn = f.sourceNotes ?? ''
  if (!sn.includes('Day 11')) {
    f.sourceNotes = (sn ? sn + '\n\n' : '') + 'Day 11 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025).'
  }
  saveFile('the-fork-in-the-road-choosing-the-new-path', f)
}

// 25. victoria-sandwich-classic.json paragraph[22]
// 26. victoria-sandwich-classic.json recipe servings/yieldDescription conflict — drop yieldDescription.
{
  const f = loadFile('victoria-sandwich-classic')
  replaceParagraphAt(f.body, 22, 'A lemon Victoria takes the zest of two unwaxed lemons folded into the creamed butter, and lemon curd instead of raspberry jam. A buttercream version adds vanilla buttercream as well as the jam. Soften 100 g unsalted butter. Beat in 200 g sifted icing sugar and 1 tsp vanilla. Spread between the jam and the second sponge. The classic four-quarters with raspberry and icing sugar is the cake this recipe is named for. Anything richer is a different cake.')
  if (f.recipe) {
    f.recipe.yieldDescription = null
  }
  saveFile('victoria-sandwich-classic', f)
}

// === Recheck ===
console.log('Rewriting complete. Re-running voice-check on all batch files...')

import { readdirSync } from 'node:fs'
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))
let clean = 0
let dirty = 0
for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) {
    clean++
  } else {
    dirty++
    console.log(`\n--- ${file} (${report.errors.length} errors) ---`)
    for (const e of report.errors) {
      console.log(`  [${e.kind}] ${e.path}: ${e.message}`)
    }
  }
}
console.log(`\nSummary: ${clean} clean, ${dirty} need work`)
