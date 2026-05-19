import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const paused = await prisma.autopilotPauseState.findMany({
    where: {
      streamName: { in: ['queue', 'global'] },
      pausedAt: { not: null },
    },
  })
  if (paused.length > 0) {
    console.log('PAUSED:' + JSON.stringify(paused))
    process.exit(1)
  } else {
    console.log('NOT_PAUSED')
    process.exit(0)
  }
}

main().catch(e => { console.error(e); process.exit(2) })
