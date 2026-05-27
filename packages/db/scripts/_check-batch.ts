import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

async function main() {
  const batchId = process.argv[2]
  if (!batchId) throw new Error('batch id required')
  const worktreeRoot = resolve(__dirname, '../../..')
  const dir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  let cleanCount = 0
  const summary: Record<string, number> = {}
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      cleanCount++
    } else {
      for (const e of report.errors) {
        summary[e.kind] = (summary[e.kind] ?? 0) + 1
      }
      console.log(`${file}: ${report.errors.length} errors`)
      for (const e of report.errors.slice(0, 3)) {
        console.log(`  ${e.kind}: ${e.message.slice(0, 100)} @ ${e.path.slice(0, 60)}`)
      }
    }
  }
  console.log(`\n${cleanCount} of ${files.length} files clean.`)
  console.log(`Error kinds: ${JSON.stringify(summary, null, 2)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
