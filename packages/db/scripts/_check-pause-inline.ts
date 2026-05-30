import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  try {
    const paused = await prisma.autopilotPauseState.findMany({
      where: {
        streamName: { in: ['queue', 'global'] },
        pausedAt: { not: null },
      },
    })
    if (paused.length > 0) {
      console.log('PAUSED:', JSON.stringify(paused, null, 2))
      process.exit(1)
    } else {
      console.log('NOT_PAUSED')
    }
  } catch (e: any) {
    if (e.message?.includes('does not exist') || e.code === 'P2021') {
      console.log('TABLE_NOT_FOUND — proceeding')
    } else {
      throw e
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
