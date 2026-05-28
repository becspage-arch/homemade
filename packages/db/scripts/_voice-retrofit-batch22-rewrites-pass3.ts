/**
 * Pass 3 rewrite for voice-retrofit batch 2026-05-28-batch22. Targets the
 * paragraph[2] of why-women-say-yes-reading which was mistakenly missed
 * in pass 1.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const BATCH_ID = '2026-05-28-batch22'
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

interface Rewrite { slug: string; old: string; next: string }

const REWRITES: Rewrite[] = [
  {
    slug: 'why-women-say-yes-reading',
    old: 'Time use research consistently shows that women do more unpaid work than men across most of the world, in most household configurations, even when both partners work full-time outside the home. Women do more childcare, more domestic work, more kin-keeping, more emotional support work, and more community volunteering. The gap is not small: studies in the UK estimate that women do an average of 26 hours of unpaid work per week, compared to 16 hours for men.',
    next: 'Time use research shows that women do more unpaid work than men in most of the world. They do more across most home set-ups, even when both partners work full-time outside the home. Women do more childcare, more housework, more kin-keeping, more emotional support work, and more unpaid community work. The gap is not small. UK studies put women at an average of 26 hours of unpaid work a week. Men do 16.',
  },
]

async function main() {
  for (const r of REWRITES) {
    const filePath = resolve(batchDir, `${r.slug}.json`)
    if (!existsSync(filePath)) {
      console.error(`[FAIL] ${r.slug} - file not found`)
      continue
    }
    let content = readFileSync(filePath, 'utf8')
    const escapedOld = JSON.stringify(r.old).slice(1, -1)
    const escapedNew = JSON.stringify(r.next).slice(1, -1)
    if (!content.includes(escapedOld)) {
      console.error(`[FAIL] ${r.slug} - old text not found`)
      continue
    }
    content = content.replace(escapedOld, escapedNew)
    writeFileSync(filePath, content, 'utf8')
    console.log(`[OK]   ${r.slug}  oldG=${fleschKincaidGrade(r.old)?.toFixed(1)}  newG=${fleschKincaidGrade(r.next)?.toFixed(1)}`)
  }
  for (const r of REWRITES) {
    const filePath = resolve(batchDir, `${r.slug}.json`)
    const data = JSON.parse(readFileSync(filePath, 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) console.log(`  [CLEAN] ${r.slug}`)
    else {
      console.log(`  [DIRTY] ${r.slug}  ${report.errors.length} errors`)
      for (const e of report.errors) console.log(`    ${e.kind} @ ${e.path}: ${e.message.slice(0, 120)}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
