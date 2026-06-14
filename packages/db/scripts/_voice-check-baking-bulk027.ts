import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const briefsDir = resolve(__dirname, '../../../docs/baking-bulk-027-briefs')
const files = fs.readdirSync(briefsDir).filter(f => f.endsWith('.json')).sort()

console.log(`Checking ${files.length} files in ${briefsDir}`)

const errors: { file: string; output: string }[] = []
const warnings: { file: string; output: string }[] = []
let passed = 0

for (const fn of files) {
  const fp = path.join(briefsDir, fn)
  try {
    const vcPath = path.join(__dirname, 'voice-check.ts')
    const out = execSync(
      `tsx "${vcPath}" "${fp}"`,
      { cwd: __dirname, encoding: 'utf8', timeout: 30000 }
    )
    passed++
    process.stdout.write('.')
  } catch (e: any) {
    const out = ((e.stdout || '') + (e.stderr || '')).trim()
    if (e.status === 2) {
      errors.push({ file: fn, output: out })
      process.stdout.write('E')
    } else {
      warnings.push({ file: fn, output: out })
      passed++
      process.stdout.write('W')
    }
  }
}

console.log('\n\nResults: ' + passed + ' passed, ' + errors.length + ' BLOCKED, ' + warnings.length + ' warnings-only')

for (const e of errors) {
  console.log('\n--- BLOCKED: ' + e.file + ' ---')
  console.log(e.output.split('\n').slice(0, 40).join('\n'))
}
for (const w of warnings) {
  console.log('\n--- WARNING: ' + w.file + ' ---')
  console.log(w.output.split('\n').slice(0, 20).join('\n'))
}
