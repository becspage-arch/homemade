/**
 * One-shot verification helper for voice-retrofit batch 2026-05-27-batch27.
 * Prints:
 *  - count of PUBLISHED tutorials with voiceRetrofittedAt set (post-apply)
 *  - count of PUBLISHED with voiceRetrofittedAt IS NULL
 *  - one random slug from this batch + its voiceRetrofittedAt timestamp
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

const BATCH27_SLUGS = [
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

async function main() {
  const total = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const remaining = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`PUBLISHED total:      ${total}`)
  console.log(`PUBLISHED retrofitted: ${retrofitted}`)
  console.log(`PUBLISHED remaining:   ${remaining}`)
  console.log('')

  const slugIdx = Math.floor(Math.random() * BATCH27_SLUGS.length)
  const slug = BATCH27_SLUGS[slugIdx]
  const t = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, title: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  console.log(`SPOT CHECK: ${t?.slug}`)
  console.log(`  title:               ${t?.title}`)
  console.log(`  category:            ${t?.category?.slug}`)
  console.log(`  voiceRetrofittedAt:  ${t?.voiceRetrofittedAt?.toISOString()}`)
  console.log(`  public URL:          https://homemade.education/${t?.category?.slug}/${t?.slug}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
