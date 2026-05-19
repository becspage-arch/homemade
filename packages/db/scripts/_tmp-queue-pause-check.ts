import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const rows = await prisma.autopilotPauseState.findMany({
      where: { streamName: { in: ['queue', 'global'] } },
    })
    console.log('ALL_ROWS:' + JSON.stringify(rows))
    const paused = rows.filter((r: { pausedAt: Date | null }) => r.pausedAt !== null)
    if (paused.length > 0) {
      console.log('PAUSED:true')
      process.exit(1)
    } else {
      console.log('PAUSED:false')
      process.exit(0)
    }
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.log('ERROR:' + e); process.exit(2) })
