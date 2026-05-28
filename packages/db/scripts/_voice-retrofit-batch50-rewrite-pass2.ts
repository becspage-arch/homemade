/**
 * Pass 2 rewrites for batch7 residuals.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-28-batch7'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)

function loadFile(slug: string): any {
  return JSON.parse(readFileSync(resolve(batchDir, `${slug}.json`), 'utf8'))
}
function saveFile(slug: string, data: any): void {
  writeFileSync(resolve(batchDir, `${slug}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8')
}
function replaceParagraphAt(body: any, idx: number, newText: string): void {
  const node = body.content[idx]
  if (!node || node.type !== 'paragraph') throw new Error(`block[${idx}] not paragraph`)
  node.content = [{ type: 'text', text: newText }]
}

// 1. the-deed-that-outlasts-you-visualisation paragraph[9] — drop "Forward-looking"
{
  const f = loadFile('the-deed-that-outlasts-you-visualisation')
  replaceParagraphAt(f.body, 9, 'Original to homemade.education. Imagery that looks ahead in time shows up in many coaching and therapy styles. No single source is claimed.')
  saveFile('the-deed-that-outlasts-you-visualisation', f)
}

// 2. the-door-you-didnt-know-was-a-door paragraph[9] — simpler still
{
  const f = loadFile('the-door-you-didnt-know-was-a-door')
  replaceParagraphAt(f.body, 9, 'Original to homemade.education. A short practice for opening to new income paths.')
  saveFile('the-door-you-didnt-know-was-a-door', f)
}

// 3. the-drawer-where-the-paperwork-lives-visualisation paragraph[0] — remove "treats" medical-claim watchword
{
  const f = loadFile('the-drawer-where-the-paperwork-lives-visualisation')
  replaceParagraphAt(f.body, 0, 'A ten-minute visualisation for building a calm picture of money-paperwork in order. The practice uses one real place (a drawer, a folder, a shelf, wherever your paperwork lives) to anchor the feeling of order and ease. The body responds to what the mind sees as if it were real. That is why this kind of rehearsal shifts the charge around money admin.')
  saveFile('the-drawer-where-the-paperwork-lives-visualisation', f)
}

// 4. the-family-story-shifting-visualisation paragraph[8] — drop "Lineage-shift"
{
  const f = loadFile('the-family-story-shifting-visualisation')
  replaceParagraphAt(f.body, 8, 'Original to homemade.education. Imagery that shifts a family story shows up in many coaching and therapy styles. No single source is claimed.')
  saveFile('the-family-story-shifting-visualisation', f)
}

// === Recheck ===
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))
let clean = 0
let dirty = 0
for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) {
    clean++
  } else {
    dirty++
    console.log(`\n--- ${file} (${report.errors.length} errors) ---`)
    for (const e of report.errors) {
      console.log(`  [${e.kind}] ${e.path}: ${e.message}`)
    }
  }
}
console.log(`\nSummary: ${clean} clean, ${dirty} need work`)
