import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  try {
    const paused = await prisma.autopilotPauseState.findMany({
      where: { streamName: { in: ['queue', 'global'] }, pausedAt: { not: null } }
    })
    console.log('PAUSED_ROWS:' + JSON.stringify(paused))
  } catch (e: any) {
    // Model may not exist
    console.log('ERROR:' + e.message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
