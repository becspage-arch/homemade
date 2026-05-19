import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { readdirSync } from 'fs'
import { resolve } from 'path'
import { spawnSync } from 'child_process'

const briefsDir = resolve('../../docs/mindset-bulk-013-briefs')
const files = readdirSync(briefsDir).filter(f => f.endsWith('.json')).sort()

console.log(`Found ${files.length} files to re-upload`)

let published = 0
let failed = 0
const failures: string[] = []

for (const file of files) {
  const filePath = resolve(briefsDir, file)
  // First run voice-check
  const vcResult = spawnSync('node', [
    '--import', 'tsx',
    'scripts/voice-check.ts',
    filePath,
    '--json'
  ], { encoding: 'utf8', cwd: resolve('.') })
  
  let vcData: { errors: any[] } = { errors: [] }
  try {
    vcData = JSON.parse(vcResult.stdout || '{"errors":[]}')
  } catch {}
  
  if (vcData.errors && vcData.errors.length > 0) {
    console.error(`[SKIP] ${file} — voice-check errors: ${JSON.stringify(vcData.errors)}`)
    failed++
    failures.push(file)
    continue
  }
  
  // Upload
  const upResult = spawnSync('node', [
    '--import', 'tsx',
    'scripts/upload-tutorial.ts',
    filePath,
    '--status', 'PUBLISHED'
  ], { encoding: 'utf8', cwd: resolve('.') })
  
  if (upResult.status === 0) {
    console.log(`[OK] ${file}`)
    published++
  } else {
    const errOut = (upResult.stderr || '') + (upResult.stdout || '')
    const errLine = errOut.split('\n').find(l => l.includes('Error') || l.includes('error')) || 'unknown error'
    console.error(`[FAIL] ${file}: ${errLine.slice(0, 120)}`)
    failed++
    failures.push(file)
  }
}

console.log(`\nDone: ${published} published, ${failed} failed`)
if (failures.length > 0) console.log('Failures:', failures.join(', '))
