/**
 * Pass 2 of voice-retrofit rewrites for batch 2026-05-28-batch8.
 *
 * Pass 1 failed on 3 files because the offending attribution paragraph
 * appears both in body and in sourceNotes. The body occurrence is wrapped
 * in "text": "..." while sourceNotes is wrapped in "sourceNotes": "...".
 * This pass scopes the find to the body wrapping.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const BATCH_ID = '2026-05-28-batch8'
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

interface Rewrite {
  slug: string
  old: string
  next: string
}

const REWRITES: Rewrite[] = [
  {
    slug: 'the-fund-with-your-family-name-on-it',
    old: "Original to homemade.education. Creative visualisation as a self-development tool draws on public-domain traditions.",
    next: "Original to homemade.education. The shape draws on long-standing visualisation work used in self-help books.",
  },
  {
    slug: 'the-instagram-home-performance',
    old: "Written for homemade.education. Draws on cultural commentary about social media, domestic aesthetics, and the commercialisation of home.",
    next: "Written for homemade.education. The piece draws on cultural writing about social media. It also draws on writing about the home and how it is sold.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Written for homemade.education. Draws on public-domain literature on the history of retail investing, the gender investment gap, and financial literacy research.",
    next: "Written for homemade.education. The reading draws on public-domain work on retail investing, on the gender investment gap, and on financial literacy research.",
  },
]

async function main() {
  let ok = 0
  let fail = 0
  for (const r of REWRITES) {
    const filePath = resolve(batchDir, `${r.slug}.json`)
    if (!existsSync(filePath)) {
      console.error(`[FAIL] ${r.slug} — file not found`)
      fail++
      continue
    }
    const content = readFileSync(filePath, 'utf8')
    // Wrap the search in "text": "..." so we only hit the body occurrence.
    const escapedOldRaw = JSON.stringify(r.old).slice(1, -1)
    const escapedNewRaw = JSON.stringify(r.next).slice(1, -1)
    const oldWrapped = `"text": "${escapedOldRaw}"`
    const newWrapped = `"text": "${escapedNewRaw}"`
    if (!content.includes(oldWrapped)) {
      console.error(`[FAIL] ${r.slug} — wrapped text not found`)
      fail++
      continue
    }
    const occurrences = content.split(oldWrapped).length - 1
    if (occurrences > 1) {
      console.error(`[FAIL] ${r.slug} — wrapped text appears ${occurrences}x`)
      fail++
      continue
    }
    const updated = content.replace(oldWrapped, newWrapped)
    writeFileSync(filePath, updated, 'utf8')
    console.log(`[OK]   ${r.slug}`)
    ok++
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
