import { config as loadEnv } from 'dotenv'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

import { exitCodeFor, runVoiceCheck } from './voice-check-lib.js'

async function main() {
  const inputDir = process.argv[2]
  if (!inputDir) { console.error('Usage: _voice-check-batch.ts <directory>'); process.exit(1) }

  const files = readdirSync(inputDir).filter(f => f.endsWith('.json')).sort()

  let blockingErrors = 0
  const errorFiles: string[] = []

  for (const file of files) {
    const filePath = resolve(inputDir, file)
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
    } catch (e) {
      console.log(`PARSE_ERROR ${file}: ${e}`)
      blockingErrors++
      errorFiles.push(file)
      continue
    }

    const result = runVoiceCheck(parsed as any)
    const code = exitCodeFor(result)

    if (code === 2) {
      console.log(`ERROR ${file}`)
      for (const e of (result.errors ?? [])) {
        console.log(`  [E] ${e.rule}: ${e.message} @ ${e.location}`)
      }
      blockingErrors++
      errorFiles.push(file)
    } else if (code === 1) {
      const wc = result.warnings?.length ?? 0
      console.log(`WARN  ${file} (${wc} warnings)`)
    } else {
      console.log(`OK    ${file}`)
    }
  }

  console.log(`\n--- ${files.length} files checked: ${blockingErrors} with blocking errors ---`)
  if (errorFiles.length) {
    console.log('Blocking error files:')
    errorFiles.forEach(f => console.log(`  ${f}`))
  }

  process.exit(blockingErrors > 0 ? 2 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })
