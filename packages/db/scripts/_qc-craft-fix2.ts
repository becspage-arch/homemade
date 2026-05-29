/**
 * Second pass fixes for split-node paragraphs (text nodes with glossary marks).
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

// [slug, fromText, toText]
const SLUG_FIXES: [string, string, string][] = [
  // adding-a-honey-super — split node: "The right moment to add a [super]"
  ['adding-a-honey-super',
    ' is when bees are occupying eight or nine of the brood frames and beginning to crowd the top bars during a routine inspection. At that point the colony has the numbers to work a second box and the population pressure that leads to swarming if there is nowhere to expand.',
    ' is when bees fill eight or nine brood frames and begin to crowd the top bars at inspection. The colony is then large enough for a second box. Without room to expand, swarming pressure builds.'],

  // colostrum — split: "[Colostrum]" is a link
  ['colostrum-and-newborn-lamb-management',
    'A lamb born with no passive immunity is vulnerable to every pathogen in the lambing shed. ',
    'A lamb born with no passive immunity is open to every germ in the lambing shed. '],
  ['colostrum-and-newborn-lamb-management',
    ' window means every lambing shed decision in the first two hours should be organised around getting colostrum into the lamb.',
    ' window means every choice in the first two hours should focus on getting colostrum into the lamb.'],

  // farrowing — split: "[farrowing arc] or hut, the [creep area], [the perimeter fencing], and the [anti-crush rails]"
  ['farrowing-pen-setup-for-an-outdoor-sow',
    'A sow should be moved into the prepared farrowing area five to seven days before her due date so she can settle into the space before farrowing begins. The preparation covers the ',
    'Move the sow into the farrowing area five to seven days before her due date so she can settle in. The setup covers the '],
  ['farrowing-pen-setup-for-an-outdoor-sow',
    '. Each element has a specific function; skipping any one of them increases piglet mortality.',
    '. Each element has a clear job; leaving any one out raises piglet losses.'],

  // mucking-out-a-pig-arc — split around [deep-litter] glossary mark
  ['mucking-out-a-pig-arc',
    'The arc should be mucked out completely once a week in summer and topped up with fresh straw every two to three days. In winter, a ',
    'Muck out the arc fully once a week in summer. Top up with fresh straw every two to three days. In winter, a '],
  ['mucking-out-a-pig-arc',
    ' approach reduces heat loss: add 5 to 10 cm of fresh straw on top of the existing bedding every two to three days and remove and replace the whole bed every three to four weeks.',
    ' method cuts heat loss: add 5 to 10 cm of fresh straw on top every two to three days, then replace the whole bed every three to four weeks.'],

  // malted-seeded-loaf — [malt extract] is a glossary mark
  ['malted-seeded-loaf',
    ' does two things in this loaf: it feeds the yeast in the early proving stages and it gives the crumb its dark colour and the slight sweetness that makes malted bread work well with sharp cheddar or cold-roast-beef sandwiches. Do not substitute golden syrup or treacle, the flavour is different and the colour wrong.',
    ' does two things in this loaf: it feeds the yeast in the early prove and gives the crumb its dark colour and the slight sweetness that makes malted bread go well with sharp cheddar or cold beef. Do not swap in golden syrup or treacle; the flavour is different and the colour wrong.'],

  // four-shaft-overshot — [The overshot] is a glossary mark
  ['four-shaft-overshot-table-mat',
    ' structure produces a cloth with a geometric figure on one face and the inverse of that figure on the back. The Goose-Eye is a four-block pattern based on a rosette threading that creates a diamond-and-chevron figure across the mat width. It is one of the most widely documented traditional four-shaft overshot threadings in the British and North American guild canon.',
    ' structure produces a cloth with a geometric figure on one side and its inverse on the back. The Goose-Eye is a four-block pattern with rosette threading that creates a diamond-and-chevron figure across the mat. It is one of the most widely known four-shaft overshot threadings in the British and North American guild record.'],
]

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) { count++; return (v as string).replaceAll(fromText, toText) }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) { out[k] = walk(val) }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

async function main() {
  let totalFixed = 0
  const grouped = new Map<string, [string, string][]>()
  for (const [slug, from, to] of SLUG_FIXES) {
    if (!grouped.has(slug)) grouped.set(slug, [])
    grouped.get(slug)!.push([from, to])
  }

  for (const [slug, pairs] of grouped) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }

    let body = t.body
    let changed = false
    const applied: string[] = []
    const missed: string[] = []

    for (const [from, to] of pairs) {
      const { body: newBody, count } = applyStringReplace(body, from, to)
      if (count > 0) { body = newBody; changed = true; applied.push(from.slice(0, 35) + '...') }
      else { missed.push(from.slice(0, 60)) }
    }

    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
      })
      totalFixed++
      console.log('Fixed: ' + slug + ' (' + applied.length + ' replacements)')
    } else {
      console.log('MISS:  ' + slug)
    }
    if (missed.length) {
      for (const m of missed) console.log('  MISS: ' + m)
    }
  }

  console.log('\nTotal fixed: ' + totalFixed)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
