import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const paused = await prisma.autopilotPauseState.findMany({
      where: { streamName: { in: ['queue', 'global'] }, pausedAt: { not: null } },
    });
    if (paused.length > 0) {
      console.log('PAUSED:' + JSON.stringify(paused));
      process.exit(2);
    }
    console.log('NO_PAUSE');
  } catch (e: any) {
    console.error('ERR:' + e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
