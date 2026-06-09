/**
 * Bulk fix for mindset tutorial source/provenance paragraphs that hit
 * grade-level-strict. Applies targeted string replacements where the
 * complex phrase can be safely simplified.
 *
 * Does NOT touch verbatim EFT tapping scripts (protected per feedback).
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

// String pairs: [from, to]. Applied in order across the full body JSON.
// Sorted: longest/most-specific first to avoid partial matches.
const REPLACEMENTS: [string, string][] = [
  // ─── Book attribution: long subtitle → short ─────────────────────────────
  [
    'Developed as a companion practice to Day 9 of SLEEP: A 30-Day Tapping Intensive to Fall Asleep Faster and Wake Energised.',
    'Made for Day 9 of SLEEP: A 30-Day Tapping Intensive.',
  ],
  [
    'Developed as a companion practice to Day 9 of SLEEP: A 30-Day Tapping Intensive to Fall Asleep Faster and Wake Refreshed.',
    'Made for Day 9 of SLEEP: A 30-Day Tapping Intensive.',
  ],
  [
    'Developed for Day 5 of SLEEP: A 30-Day Tapping Intensive.',
    'Made for Day 5 of SLEEP: A 30-Day Tapping Intensive.',
  ],
  // Generic: strip long book subtitles from SLEEP attributions
  [
    'to Fall Asleep Faster and Wake Energised',
    '',
  ],
  [
    'to Fall Asleep Faster and Wake Refreshed',
    '',
  ],

  // ─── Complex descriptive clauses → plain ─────────────────────────────────
  [
    'A creative visualisation for building the felt sense of effortless income.',
    'A practice for picturing money that comes in on its own.',
  ],
  [
    'The release-and-allow structure draws on the energy statement method from The Money Zone.',
    'Uses the release-and-allow approach from The Money Zone.',
  ],
  [
    'The release-and-allow structure is from The Money Zone.',
    'The release-and-allow approach comes from The Money Zone.',
  ],
  [
    'Water imagery for rest and stillness appears across many contemplative traditions.',
    'Still water imagery for rest appears in many traditions.',
  ],
  [
    'Ancestor work has many lineages in faith and in cultural custom.',
    'Ancestor work appears in many faiths and cultures.',
  ],
  [
    'The version here uses no closed-tradition framing.',
    'This version does not draw on any single tradition.',
  ],
  [
    'The cancel-with-grace move is common in writing on time and on boundaries.',
    'Cancelling with care is a topic in many books on time and limits.',
  ],
  [
    'Box breathing is used in military, clinical, and performance contexts for rapid nervous system regulation.',
    'Box breathing is taught in many settings to help calm the nervous system fast.',
  ],
  [
    'The hand-on-belly hand-on-heart shape is used in body-based mindfulness, in somatic work, and in self-compassion teaching.',
    'This shape appears in mindfulness, body work, and self-compassion practice.',
  ],
  [
    'The version here uses breath only, so the practice fits a three-minute window.',
    'Here it uses breath only and fits in three minutes.',
  ],
  [
    'Any of these done every day will produce more benefit than a more elaborate practice done occasionally.',
    'Doing any of these every day brings more value than a complex practice done now and then.',
  ],
  [
    'Drawing on old daily-practice habits and habit research.',
    'Draws on daily-practice habits and research.',
  ],
  [
    ', drawing on the role of physical choices in identity signalling.',
    '. Draws on how physical choices shape identity.',
  ],
  [
    // Long sleep-research paragraph
    'This reading is original to homemade.education. It sits alongside Day 15 of Rebecca J Page\'s SLEEP: A 30-Day Tapping Program. The learned-alert model draws on Richard Bootzin\'s early stimulus-control research and later cognitive behavioural work on insomnia. The tapping element draws on EFT research showing the amygdala settles down through paired bilateral stimulation. Full citations sit in the Sources block below.',
    'This reading is original to homemade.education. It sits alongside Day 15 of SLEEP: A 30-Day Tapping Program by Rebecca Page. The ideas draw on sleep research and EFT work on calming the nervous system. Full sources are listed below.',
  ],
  [
    'Based on research into health anxiety and how the checking cycle works.',
    'Based on research into health anxiety and the checking cycle.',
  ],
  [
    'Written for homemade.education as part of the beginner entry points for money work.',
    'Written for homemade.education as a starting point for money work.',
  ],
]

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) {
        count++
        return v.replaceAll(fromText, toText)
      }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        out[k] = walk(val)
      }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', category: { slug: 'mindset' } },
    select: { id: true, slug: true, body: true, revisedFrom: true },
  })

  console.log(`Processing ${tutorials.length} mindset tutorials...`)
  let totalFixed = 0

  for (const t of tutorials) {
    let body = t.body
    let changed = false
    const appliedPairs: string[] = []

    for (const [from, to] of REPLACEMENTS) {
      const { body: newBody, count } = applyStringReplace(body, from, to)
      if (count > 0) {
        body = newBody
        changed = true
        appliedPairs.push(from.slice(0, 40) + '...')
      }
    }

    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: {
          body: body as any,
          voiceRetrofittedAt: new Date(),
          revisedFrom: t.revisedFrom ?? t.body,
        },
      })
      totalFixed++
      console.log(`  Fixed: ${t.slug} (${appliedPairs.length} replacements)`)
    }
  }

  console.log(`\nTotal fixed: ${totalFixed}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
