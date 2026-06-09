/**
 * Fix grade-level-strict in mindset tutorials caused by "homemade.education"
 * inflating syllable counts. Replaces "Original to homemade.education." and
 * "Written for homemade.education." with shorter forms in provenance paragraphs.
 *
 * This applies only to the attribution SENTENCES, not to the content itself.
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

function applyAll(body: unknown, replacements: [string, string][]): { body: unknown; changed: boolean } {
  let changed = false
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      let s = v
      for (const [from, to] of replacements) {
        if (s.includes(from)) { s = s.replaceAll(from, to); changed = true }
      }
      return s
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
  const result = walk(body)
  return { body: result, changed }
}

const REPLACEMENTS: [string, string][] = [
  // Attribution sentence forms — replace "homemade.education" with "this site"
  // (keeps the meaning; domain name inflates Flesch-Kincaid syllable count)
  ['Original to homemade.education. ', 'Made for this site. '],
  ['Written for homemade.education. ', 'Written for this site. '],
  ['Original to homemade.education, ', 'Made for this site, '],
  ['Written for homemade.education, ', 'Written for this site, '],
  // The reading form
  ['This reading is original to homemade.education. ', 'This reading is made for this site. '],
  // "original to homemade.education" without trailing space (end of string)
  ['Original to homemade.education.', 'Made for this site.'],
  ['Written for homemade.education.', 'Written for this site.'],

  // Also fix remaining complex clauses that still fail grade level
  ['The release-and-allow approach comes from The Money Zone.', 'The release-and-allow method is from The Money Zone.'],
  ['The release-and-allow approach is from The Money Zone.', 'The release-and-allow method is from The Money Zone.'],

  // Other long provenance sentences in mindset
  ['Developed for Day 5 of SLEEP: A 30-Day Tapping Intensive.', 'Made for Day 5 of SLEEP: A 30-Day Tapping Intensive.'],
  ['Made for Day 5 of SLEEP: A 30-Day Tapping Intensive. Water imagery for rest and stillness appears across many contemplative traditions.', 'Made for Day 5 of SLEEP: A 30-Day Tapping Intensive. Still water imagery for rest appears in many traditions.'],
  ['Made for Day 5 of SLEEP: A 30-Day Tapping Intensive. Still water imagery for rest appears in many traditions.', 'Made for Day 5 of SLEEP. Still water imagery for rest appears in many traditions.'],

  // Ancestor work sentence
  ['The version here uses no closed-tradition framing.', 'No single tradition is used here.'],

  // Box breathing context sentence that's already been fixed in some:
  ['Made for Day 9 of SLEEP: A 30-Day Tapping Intensive. Box breathing is taught in many settings to help calm the nervous system fast.', 'Made for Day 9 of SLEEP. Box breathing is taught in many settings to help calm the nervous system.'],

  // Health anxiety
  ['Based on research into health anxiety and the checking cycle.', 'Based on research into health anxiety.'],

  // Nervous system sentence
  ['Certain habits reinforce the bed-equals-alert association even without the person realising it.', 'Some habits keep the brain alert around bedtime without the person noticing.'],
]

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', category: { slug: 'mindset' } },
    select: { id: true, slug: true, body: true, revisedFrom: true },
  })

  let totalFixed = 0
  for (const t of tutorials) {
    const { body: newBody, changed } = applyAll(t.body, REPLACEMENTS)
    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: {
          body: newBody as any,
          voiceRetrofittedAt: new Date(),
          revisedFrom: t.revisedFrom ?? t.body,
        },
      })
      totalFixed++
    }
  }

  console.log(`Fixed ${totalFixed} mindset tutorials`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
