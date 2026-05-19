import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  if (process.env.AUTOPILOT_PAUSED === 'true') {
    console.log('ENV_PAUSED')
    process.exit(0)
  }
  try {
    const paused = await prisma.autopilotPauseState.findMany({
      where: {
        streamName: { in: ['queue', 'global'] },
        pausedAt: { not: null },
      },
    })
    if (paused.length > 0) {
      console.log('MANUAL_PAUSE:' + JSON.stringify(paused))
    } else {
      console.log('NOT_PAUSED')
    }
  } catch (e) {
    console.log('TABLE_MISSING_OR_ERROR:' + String(e).slice(0, 300))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
