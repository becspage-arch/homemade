/**
 * Dump pre-rewrite first paragraph (from revisedFrom) for batch27 selected slugs.
 * Picks three slugs across content types where the rewrite was substantive.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}
import { prisma } from '../src'

const BATCH27 = [
  'bigos','bircher-muesli','biscuits-and-gravy','bissara','bistecca-alla-fiorentina',
  'black-pudding-hash','blackberry-jam','blanquette-de-veau','blini','blt-sandwich',
  'boeuf-bourguignon','boeuf-en-daube','boiled-bacon-and-cabbage','bombay-potato',
  'boozy-irish-cream-cheesecake','chiffon-cake-citrus','chocolate-and-beetroot-cake',
  'chocolate-bark-dark','chocolate-bark-pistachio-cranberry','chocolate-chip-cookies',
  'chocolate-chip-shortbread','chocolate-cream-pie','chocolate-crinkle-cookies',
  'chocolate-digestives','chocolate-eclairs','chocolate-fudge','chocolate-fudge-cake',
  'chocolate-layer-cake','chocolate-mendiants','chocolate-orange-cake',
  'i-can-be-wealthy-and-kind-affirmation','i-can-hold-a-full-account-without-bracing',
  'i-can-support-them-and-still-be-supported','i-celebrate-every-flow-of-fresh-income',
  'i-claim-my-money-and-my-desire','i-clear-the-hidden-refusal-yes-is-allowed',
  'i-did-the-best-i-could-with-what-i-knew','i-do-the-daily-things-wealthy-women-do',
  'i-dont-need-rescue-the-work-is-the-wealth','i-enjoy-abundance-in-every-form-affirmation',
  'i-forgive-the-years-i-didnt-sleep','i-get-to-be-the-one-who-breaks-the-pattern',
  'i-get-to-do-this-differently','i-give-and-teach-from-full',
  'i-give-to-my-parents-from-full-affirmation','sharpening-a-sloyd-knife',
  'side-axe-technique','simple-oak-bookends','simple-pine-wall-shelf',
  'sized-paper-for-calligraphy-alum-gelatin',
]

function textOf(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.content) return node.content.map(textOf).join('')
  return ''
}

async function main() {
  const candidates: { slug: string; type: string; cat: string; before: string; after: string; delta: number }[] = []
  for (const slug of BATCH27) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, type: true, body: true, revisedFrom: true, category: { select: { slug: true } } },
    })
    if (!t) continue
    const before = textOf(t.revisedFrom?.content?.[0])
    const after = textOf(t.body?.content?.[0])
    candidates.push({ slug, type: t.type, cat: t.category?.slug ?? '', before, after, delta: Math.abs(before.length - after.length) + (before === after ? 0 : 100) })
  }
  // Sort: pick distinct content type, largest delta within each type
  candidates.sort((a, b) => b.delta - a.delta)
  console.log('TOP 10 BY DELTA:')
  for (const c of candidates.slice(0, 10)) {
    console.log(`  ${c.slug} [${c.type}/${c.cat}] delta=${c.delta} eq=${c.before === c.after}`)
  }
  console.log('\n--- BLT SANDWICH (cooking RECIPE) ---')
  const blt = candidates.find(c => c.slug === 'blt-sandwich')!
  console.log('BEFORE:'); console.log(blt.before)
  console.log('AFTER:'); console.log(blt.after)
  console.log('\n--- I CLEAR THE HIDDEN REFUSAL (mindset PRACTICE) ---')
  const m = candidates.find(c => c.slug === 'i-clear-the-hidden-refusal-yes-is-allowed')!
  console.log('BEFORE:'); console.log(m.before)
  console.log('AFTER:'); console.log(m.after)
  console.log('\n--- SHARPENING A SLOYD KNIFE (wood-natural-craft READING) ---')
  const w = candidates.find(c => c.slug === 'sharpening-a-sloyd-knife')!
  console.log('BEFORE:'); console.log(w.before)
  console.log('AFTER:'); console.log(w.after)
  console.log('\n--- SIDE AXE TECHNIQUE (wood-natural-craft TECHNIQUE) ---')
  const sa = candidates.find(c => c.slug === 'side-axe-technique')!
  console.log('BEFORE:'); console.log(sa.before)
  console.log('AFTER:'); console.log(sa.after)
  console.log('\n--- SIZED PAPER (paper-word TECHNIQUE) ---')
  const sp = candidates.find(c => c.slug === 'sized-paper-for-calligraphy-alum-gelatin')!
  console.log('BEFORE:'); console.log(sp.before)
  console.log('AFTER:'); console.log(sp.after)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
