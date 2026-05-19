import { prisma } from '../src/index.js';

async function main() {
  try {
    // Check pause state
    let paused: any[] = [];
    try {
      paused = await (prisma as any).autopilotPauseState.findMany({
        where: { streamName: { in: ['queue', 'global'] }, pausedAt: { not: null } },
      });
    } catch (_e) {
      // Table may not exist yet
    }
    console.log('PAUSED_ROWS:', JSON.stringify(paused));

    // Round-robin pick
    const picked = await (prisma as any).category.findFirst({
      where: { pipelineStatus: 'READY' },
      orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
      include: {
        _count: {
          select: { tutorials: { where: { status: 'PUBLISHED' } } },
        },
      },
    });
    console.log('PICKED:', JSON.stringify(picked));

    // Count per pipelineStatus
    const statusCounts = await (prisma as any).category.groupBy({
      by: ['pipelineStatus'],
      _count: { id: true },
    });
    console.log('STATUS_COUNTS:', JSON.stringify(statusCounts));
  } catch (e: any) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
