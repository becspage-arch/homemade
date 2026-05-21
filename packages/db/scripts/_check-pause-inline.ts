import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const paused = await prisma.autopilotPauseState.findMany({
    where: {
      streamName: { in: ['queue', 'global'] },
      pausedAt: { not: null },
    },
  })
  if (paused.length > 0) {
    console.log('PAUSED:' + JSON.stringify(paused))
    process.exit(2)
  }
  console.log('NOT_PAUSED')
}
main().catch(e => { console.error(e); process.exit(1) })
