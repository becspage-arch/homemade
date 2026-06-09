import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();

import { prisma } from '../src';

async function main() {
  try {
    const paused = await prisma.autopilotPauseState.findMany({
      where: {
        streamName: { in: ['queue', 'global'] },
        pausedAt: { not: null },
      },
    });
    console.log('PAUSE_CHECK:' + JSON.stringify(paused));
  } catch (e: any) {
    console.log('PAUSE_CHECK_ERROR:' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
