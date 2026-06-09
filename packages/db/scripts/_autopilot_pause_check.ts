import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const paused = await prisma.autopilotPauseState.findMany({
    where: { streamName: { in: ['queue', 'global'] }, pausedAt: { not: null } },
  })
  console.log('PAUSED_COUNT:' + paused.length)
  if (paused.length > 0) console.log(JSON.stringify(paused))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
