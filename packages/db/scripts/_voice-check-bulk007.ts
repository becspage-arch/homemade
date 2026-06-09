import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const briefsDir = resolve(__dirname, '../../../docs/pottery-ceramics-bulk-007-briefs')
const files = fs.readdirSync(briefsDir).filter(f => f.endsWith('.tutorial.json')).sort()

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
  console.log('\n--- ERROR: ' + e.file + ' ---')
  console.log(e.output.split('\n').slice(0, 30).join('\n'))
}
