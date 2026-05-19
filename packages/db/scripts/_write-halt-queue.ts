import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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

async function main() {
  const { prisma } = await import('../src/index.js')
  const row = await (prisma as any).autopilotHaltSignal.create({
    data: {
      stream: 'queue',
      reason: 'ALL_CATEGORIES_COMPLETE_OR_NOT_READY',
      detail: 'Round-robin pick returned no candidates. READY: 0, NOT_READY: 15, COMPLETE: 0, PAUSED: 2. Cooking pipelineStatus=PAUSED (intentional, _flip-cooking-paused.ts used by prior session), Baking pipelineStatus=PAUSED (prior session), Mindset pipelineStatus=NOT_READY (paused after mindset-bulk-017 per commit b866ac1). Cron left enabled — categories will move to READY once unpaused or pipeline-setup sessions land.',
    },
  })
  console.log(`[write-halt-signal] wrote ${row.id} stream=${row.stream} reason=${row.reason}`)
  await (prisma as any).$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
