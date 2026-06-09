import { config as loadEnv } from 'dotenv'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

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

const briefDir = process.argv[2]
const startFrom = parseInt(process.argv[3] || '1', 10)
const status = process.argv[4] || 'PUBLISHED'

if (!briefDir) { console.error('Usage: tsx _batch-upload.ts <briefDir> [startFrom] [status]'); process.exit(1) }

const files = readdirSync(briefDir)
  .filter(f => f.endsWith('.json'))
  .sort()
  .filter((_, i) => i + 1 >= startFrom)

console.log(`Uploading ${files.length} files from ${briefDir} (starting from #${startFrom})`)

let ok = 0, blocked = 0, err = 0

for (const fn of files) {
  const filePath = join(briefDir, fn)
  try {
    const out = execSync(
      `pnpm --filter "@homemade/db" exec tsx scripts/upload-tutorial.ts "${filePath}" --status ${status}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], cwd: resolve(__dirname, '../../../') }
    )
    if (out.includes('CREATED') || out.includes('UPDATED')) {
      const slug = out.match(/slug: ([^\s]+)/)?.[1] || fn
      console.log(`✓ ${fn} → ${slug}`)
      ok++
    } else {
      console.log(`? ${fn}`)
      err++
    }
  } catch (e: any) {
    const out = (e.stdout || '') + (e.stderr || '')
    if (out.includes('BLOCKED')) {
      const errLine = out.match(/ERROR\s+[^\n]+/)?.[0] || 'voice error'
      console.log(`✗ BLOCKED ${fn}: ${errLine}`)
      blocked++
    } else {
      console.log(`✗ ERR ${fn}: ${String(e.message).slice(0, 80)}`)
      err++
    }
  }
}

console.log(`\nDone: ${ok} ok, ${blocked} blocked, ${err} error`)
