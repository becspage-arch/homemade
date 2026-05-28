/**
 * Pass 2 rewrites for voice-retrofit batch 2026-05-28-batch22.
 *
 * Two paragraphs were still over the grade-12 threshold after pass 1.
 * Drop them further.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const BATCH_ID = '2026-05-28-batch22'
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

interface Rewrite {
  slug: string
  old: string
  next: string
}

const REWRITES: Rewrite[] = [
  {
    slug: 'why-inheritance-and-tax-fear-slows-down-wealth-planning',
    old: 'Original to homemade.education. The framing draws on money avoidance research.',
    next: 'Original to homemade.education. Draws on work in money avoidance.',
  },
  {
    slug: 'why-women-say-yes-reading',
    old: "This means a woman's yes reflex is not running in neutral ground. Women who say yes are often saying yes on top of a week that is already too full. The time they give away is time they do not have.",
    next: "This means a woman's yes reflex is not running in neutral. Women who say yes often say yes on top of a week that is already too full. The time they give away is time they do not have.",
  },
]

async function main() {
  let ok = 0
  let fail = 0
  for (const r of REWRITES) {
    const filePath = resolve(batchDir, `${r.slug}.json`)
    if (!existsSync(filePath)) {
      console.error(`[FAIL] ${r.slug} - file not found`)
      fail++
      continue
    }
    let content = readFileSync(filePath, 'utf8')
    const escapedOld = JSON.stringify(r.old).slice(1, -1)
    const escapedNew = JSON.stringify(r.next).slice(1, -1)
    if (!content.includes(escapedOld)) {
      console.error(`[FAIL] ${r.slug} - old text not found`)
      fail++
      continue
    }
    const count = content.split(escapedOld).length - 1
    if (count > 1) {
      console.error(`[FAIL] ${r.slug} - old text not unique (${count}x)`)
      fail++
      continue
    }
    content = content.replace(escapedOld, escapedNew)
    writeFileSync(filePath, content, 'utf8')
    console.log(`[OK]   ${r.slug}  oldG=${fleschKincaidGrade(r.old)?.toFixed(1)}  newG=${fleschKincaidGrade(r.next)?.toFixed(1)}`)
    ok++
  }
  console.log(`\nApplied: ${ok} ok, ${fail} failed`)

  for (const r of REWRITES) {
    const filePath = resolve(batchDir, `${r.slug}.json`)
    const data = JSON.parse(readFileSync(filePath, 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      console.log(`  [CLEAN] ${r.slug}`)
    } else {
      console.log(`  [DIRTY] ${r.slug}  ${report.errors.length} errors`)
      for (const e of report.errors) console.log(`    ${e.kind} @ ${e.path}: ${e.message.slice(0, 120)}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
