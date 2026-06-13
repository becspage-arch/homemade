import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = resolve(__dirname, '../../../docs/wood-natural-craft-bulk-010-briefs')

const ALREADY_UPLOADED = new Set([
  'willow-fruit-bowl',
  'willow-garden-trug',
  'stop-cut-technique',
  'oval-willow-shopping-basket',
])

const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json')).sort()

let published = 0
let dropped = 0
const dropped_slugs: string[] = []
const published_slugs: string[] = []

for (const file of files) {
  const fullPath = resolve(BRIEFS_DIR, file)
  const json = JSON.parse(readFileSync(fullPath, 'utf-8'))
  const slug = json.slug as string

  if (ALREADY_UPLOADED.has(slug)) {
    console.log(`SKIP (already uploaded): ${slug}`)
    continue
  }

  let attempt = 0
  let success = false
  while (attempt < 3 && !success) {
    attempt++
    try {
      const out = execSync(
        `npx tsx "${resolve(__dirname, 'upload-tutorial.ts')}" "${fullPath}" --status PUBLISHED`,
        { cwd: resolve(__dirname, '..'), encoding: 'utf-8', timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] }
      )
      console.log(`PUBLISHED (attempt ${attempt}): ${slug}`)
      published++
      published_slugs.push(slug)
      success = true
    } catch (err: any) {
      const errText = (err.stderr?.toString() ?? '') + (err.stdout?.toString() ?? '')
      console.log(`FAIL (attempt ${attempt}): ${slug}: ${errText.slice(0, 200)}`)
      if (attempt >= 3) {
        console.log(`DROPPED: ${slug}`)
        dropped++
        dropped_slugs.push(slug)
      }
    }
  }
}

console.log(`\nSUMMARY: ${published} PUBLISHED, ${dropped} dropped`)
if (dropped_slugs.length > 0) {
  console.log('DROPPED_SLUGS:', JSON.stringify(dropped_slugs))
}
console.log('PUBLISHED_SLUGS:', JSON.stringify(published_slugs))
