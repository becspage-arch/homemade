import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { readdirSync } from 'fs'
import { resolve } from 'path'
import { spawnSync } from 'child_process'

const briefsDir = resolve('../../docs/baking-bulk-023-briefs')
const files = readdirSync(briefsDir).filter(f => f.endsWith('.json')).sort()

console.log(`Found ${files.length} files to upload`)

let published = 0
let failed = 0
const failures: string[] = []

for (const file of files) {
  const filePath = resolve(briefsDir, file)

  const result = spawnSync('node', [
    '--import', 'tsx',
    'scripts/upload-tutorial.ts',
    filePath,
    '--status', 'PUBLISHED'
  ], { encoding: 'utf8', cwd: resolve('.'), timeout: 60000 })

  if (result.status === 0) {
    const slug = file.replace('.json', '')
    console.log(`[OK] ${slug}`)
    published++
  } else {
    console.error(`[FAIL] ${file}`)
    const out = (result.stdout || '') + (result.stderr || '')
    const lines = out.split('\n')
    // Show lines after voice-check header (skip first 7 env/header lines, show error)
    const errorLines = lines.slice(7).filter((l: string) => l.trim()).join('\n')
    console.error(errorLines || out.split('\n').slice(0, 15).join('\n'))
    failed++
    failures.push(file)
  }
}

console.log(`\n--- Upload complete: ${published} published, ${failed} failed ---`)
if (failures.length > 0) {
  console.log('Failures:', failures.join(', '))
  process.exit(1)
}
