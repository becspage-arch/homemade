/**
 * Pass-2 rewrites for batch20: fix the 4 stragglers after pass-1.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')
const dir = resolve(root, 'docs/voice-retrofit-2026-05-28-batch20')

interface Rewrite { slug: string; from: string; to: string }

const rewrites: Rewrite[] = [
  // 1. medical-claim: word "treats"
  {
    slug: 'when-a-parent-dies-grief-reading',
    from: 'These layered losses are part of what makes parental grief heavier than the culture treats it.',
    to: 'These layered losses are part of what makes parental grief heavier than the culture admits.',
  },
  // 2. grade-level on the new body paragraph[13]
  {
    slug: 'when-a-parent-dies-grief-reading',
    from: "Written for homemade.education. The reading draws on grief research, including work on continuing bonds, the 'buffer' generation idea in bereavement studies, and accounts of parental grief across many settings.",
    to: "Written for homemade.education. The reading draws on grief research. That includes work on continuing bonds. It includes the 'buffer' generation idea from bereavement studies. And many accounts of parental grief.",
  },
  // 3. grade-level
  {
    slug: 'when-women-trigger-each-other-about-money',
    from: 'Original to homemade.education. It draws on research about social comparison, on writing about women and friendship, and on money psychology work about the comparison response.',
    to: 'Original to homemade.education. The work here draws on research on social comparison. It draws on writing about women and friendship. It draws on money psychology work on the comparison response.',
  },
  // 4. body still has the original "Draws on cultural criticism..." (rewrite only hit sourceNotes)
  {
    slug: 'where-did-fast-and-now-come-from',
    from: "Written for homemade.education. Draws on cultural criticism around diet culture, body image, and the commercialisation of women's self-improvement.",
    to: "Written for homemade.education. The piece draws on cultural writing about diet culture and body image. It draws on writing about how women's self-improvement got sold back to them.",
  },
  // 5. medical-claim: word "treats"
  {
    slug: 'why-debt-obsession-grows-in-the-dark',
    from: 'The day treats debt obsession as a pattern that tapping can break.',
    to: 'The day looks at debt obsession as a pattern that tapping can break.',
  },
]

let okCount = 0
let missCount = 0

for (const r of rewrites) {
  const path = resolve(dir, `${r.slug}.json`)
  let raw: string
  try { raw = readFileSync(path, 'utf8') }
  catch { console.error(`[MISS] ${r.slug} — file not found`); missCount++; continue }

  const enc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const fromEnc = enc(r.from)
  const toEnc = enc(r.to)

  if (!raw.includes(fromEnc)) {
    console.error(`[MISS] ${r.slug} — text not found`)
    console.error(`  expected: ${fromEnc.slice(0, 100)}...`)
    missCount++
    continue
  }
  const idx = raw.indexOf(fromEnc)
  const updated = raw.slice(0, idx) + toEnc + raw.slice(idx + fromEnc.length)
  writeFileSync(path, updated, 'utf8')
  console.log(`[OK]   ${r.slug}`)
  okCount++
}

console.log(`\nDone: ${okCount} ok, ${missCount} missed`)
if (missCount > 0) process.exit(1)
