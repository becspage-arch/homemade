/**
 * Pass 3 of voice-retrofit rewrites for batch 2026-05-28-batch8.
 *
 * Two residual files: investing-isnt-for-me (4 paragraphs that pass 1
 * skipped because pass 1 bailed mid-file on a non-unique text + 1
 * paragraph that pass 2 rewrote but still scored grade 12.8), and
 * the-fund-with-your-family-name-on-it (attribution still at 12.4).
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
  bodyOnly?: boolean
}

const REWRITES: Rewrite[] = [
  // the-fund: simpler attribution sentence to drop grade below 12.
  {
    slug: 'the-fund-with-your-family-name-on-it',
    old: "Original to homemade.education. The shape draws on long-standing visualisation work used in self-help books.",
    next: "Original to homemade.education. The shape draws on a long line of visualisation work used in self-help.",
    bodyOnly: true,
  },
  // investing: paragraphs 2, 3, 5, 6 still in their original form on disk
  // because pass 1 bailed mid-file. Re-apply them now (now safe — these
  // are body-only text strings, not duplicated in sourceNotes).
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Retail investing, including pensions, ISAs, and brokerage accounts, became widely accessible to ordinary households in the UK and US in the 1980s and 1990s. The marketing that accompanied this expansion was targeted at a specific demographic: men, typically white, typically middle-class, often shown in suits or golf clothes. The language was authoritative, technical, and signalled that a certain level of existing wealth was the starting point.",
    next: "Retail investing opened up to ordinary households in the UK and US in the 1980s and 1990s. That covers pensions, ISAs, and brokerage accounts. The marketing was aimed at one group. The audience was men. They were usually white. They were usually middle-class. They were often shown in suits or golf clothes. The language was firm and technical. It signalled that a certain level of wealth was the starting point.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Women, working-class households, and immigrants were not the primary target audience. The financial services sector was, and in many ways remains, demographically concentrated at the senior level in ways that shaped product design, distribution, and marketing for decades.",
    next: "Women, working-class households, and immigrants were not the main target. The sector still skews male at the top. That shaped how the products were made and sold for decades.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Research from multiple countries consistently shows that women invest less than men and, when they do invest, start later. The most commonly cited reasons are confidence and knowledge, women report feeling less knowledgeable and less confident than men about financial products. What the research sometimes doesn't note is that confidence and knowledge in a domain follow exposure, and women have systematically had less exposure.",
    next: "Research from many countries shows the same pattern. Women invest less than men. When they do invest, they start later. The reasons most often given are confidence and knowledge. Women report feeling less sure than men about money products. What the research can miss is simple. Confidence and knowledge in any field follow exposure. Women have had less of it.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Girls were less likely to grow up in households where investing was discussed. Women in partnerships have historically been less likely to be the primary person managing investments, even when both partners work. The gender investment gap is real, and it is primarily an access-and-exposure gap, not a capability gap.",
    next: "Girls were less likely to grow up in homes where investing was talked about. Women in couples have, in the past, been less likely to run the money side, even when both partners work. The gender investment gap is real. It is a gap in access and exposure, not in skill.",
  },
  // Pass 2 rewrote paragraph[11] but it still scores 12.8. Replace it
  // with the new state (from pass 2) and drop the grade further.
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Written for homemade.education. The reading draws on public-domain work on retail investing, on the gender investment gap, and on financial literacy research.",
    next: "Written for homemade.education. The reading draws on public work about the history of retail investing. It also draws on work about the gender investment gap and on basic studies of money skills.",
    bodyOnly: true,
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
    const escapedOldRaw = JSON.stringify(r.old).slice(1, -1)
    const escapedNewRaw = JSON.stringify(r.next).slice(1, -1)
    const old = r.bodyOnly ? `"text": "${escapedOldRaw}"` : escapedOldRaw
    const next = r.bodyOnly ? `"text": "${escapedNewRaw}"` : escapedNewRaw
    if (!content.includes(old)) {
      console.error(`[FAIL] ${r.slug} — text not found: ${old.slice(0, 80)}...`)
      fail++
      continue
    }
    const occurrences = content.split(old).length - 1
    if (occurrences > 1) {
      console.error(`[FAIL] ${r.slug} — text appears ${occurrences}x`)
      fail++
      continue
    }
    const updated = content.replace(old, next)
    writeFileSync(filePath, updated, 'utf8')
    console.log(`[OK]   ${r.slug} — ${old.slice(0, 60).replace(/\\n/g, ' ')}...`)
    ok++
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
