/**
 * Pass-3 rewrites for batch20: strip em-dashes from titles and subtitles
 * carried over from the old autopilot. Voice-check skips title/subtitle but
 * the routine spec bans em-dashes everywhere.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')
const dir = resolve(root, 'docs/voice-retrofit-2026-05-28-batch20')

interface Rewrite { slug: string; from: string; to: string }

const rewrites: Rewrite[] = [
  {
    slug: 'when-did-the-sleep-story-start-journal',
    from: "A journal prompt set for tracing where the \\\"I can't sleep\\\" identity came from — and whether it was ever really yours.",
    to:   "A journal prompt set for tracing where the \\\"I can't sleep\\\" identity came from, and whether it was ever really yours.",
  },
  {
    slug: 'who-in-the-family-said-we-never-get-ahead-journal',
    from: "Who in the family said \\\"we never get ahead\\\" — and why?",
    to:   "Who in the family said \\\"we never get ahead\\\", and why?",
  },
  {
    slug: 'why-huge-wealth-feels-impossible-to-picture',
    from: "An explanation of the internal wealth ceiling — where it comes from, what it feels like, and how familiarity is the mechanism that moves it.",
    to:   "An explanation of the internal wealth ceiling: where it comes from, what it feels like, and how familiarity is the mechanism that moves it.",
  },
]

let okCount = 0
let missCount = 0

for (const r of rewrites) {
  const path = resolve(dir, `${r.slug}.json`)
  let raw: string
  try { raw = readFileSync(path, 'utf8') }
  catch { console.error(`[MISS] ${r.slug} — file not found`); missCount++; continue }

  if (!raw.includes(r.from)) {
    console.error(`[MISS] ${r.slug} — text not found`)
    console.error(`  expected: ${r.from}`)
    missCount++
    continue
  }
  const idx = raw.indexOf(r.from)
  const updated = raw.slice(0, idx) + r.to + raw.slice(idx + r.from.length)
  writeFileSync(path, updated, 'utf8')
  console.log(`[OK]   ${r.slug}`)
  okCount++
}

console.log(`\nDone: ${okCount} ok, ${missCount} missed`)
if (missCount > 0) process.exit(1)
