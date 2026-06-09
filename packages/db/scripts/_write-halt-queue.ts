/**
 * Write a halt signal for the 'queue' stream (write-halt-signal.ts only accepts
 * cooking|baking|mindset; this covers the multi-category queue stream).
 *   pnpm --filter @homemade/db exec tsx scripts/_write-halt-queue.ts \
 *     --reason HARD_CAP_REACHED --detail "..."
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
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

async function main() {
  const { prisma } = await import('../src/index.js')
  const args = process.argv.slice(2)
  let reason = ''
  let detail = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reason') reason = args[++i] ?? ''
    else if (args[i] === '--detail') detail = args[++i] ?? ''
  }
  if (!reason) { console.error('--reason required'); process.exit(1) }
  const row = await prisma.autopilotHaltSignal.create({
    data: { stream: 'queue', reason, detail: detail || null },
  })
  console.log(`[write-halt-queue] wrote ${row.id} stream=queue reason=${row.reason}`)
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
