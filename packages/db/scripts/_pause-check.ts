import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  try {
    const rows = await prisma.autopilotPauseState.findMany({
      where: { streamName: { in: ['queue', 'global'] }, pausedAt: { not: null } },
    })
    console.log('PAUSE_ROWS:' + JSON.stringify(rows))
  } catch (e: any) {
    console.log('TABLE_MISSING:' + e.message.slice(0, 120))
  }
  await prisma.$disconnect()
}
main()
