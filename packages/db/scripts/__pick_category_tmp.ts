import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { prisma } from '../src/index.js';

async function main() {
  // Count categories by status
  const statusCounts = await prisma.category.groupBy({
    by: ['pipelineStatus'],
    _count: { id: true },
  });
  console.log('STATUS_COUNTS:' + JSON.stringify(statusCounts));

  // Pick the next READY category (least recently fired)
  const candidates = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' },
    ],
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: {
        select: {
          tutorials: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
  });

  if (candidates.length === 0) {
    console.log('NO_CANDIDATES');
    return;
  }

  // Filter out any where published >= target
  const eligible = [];
  for (const c of candidates) {
    const publishedCount = c._count.tutorials;
    if (c.targetTutorialCount !== null && publishedCount >= c.targetTutorialCount) {
      console.log(`FLIP_COMPLETE:${c.slug} (published=${publishedCount} >= target=${c.targetTutorialCount})`);
      await prisma.category.update({
        where: { id: c.id },
        data: { pipelineStatus: 'COMPLETE' },
      });
    } else {
      eligible.push({ ...c, publishedCount });
    }
  }

  if (eligible.length === 0) {
    console.log('NO_ELIGIBLE_AFTER_FILTER');
    return;
  }

  const picked = eligible[0];
  console.log('PICKED:' + JSON.stringify({
    id: picked.id,
    slug: picked.slug,
    pipelineStatus: picked.pipelineStatus,
    targetTutorialCount: picked.targetTutorialCount,
    publishedCount: picked.publishedCount,
    lastAutopilotRunAt: picked.lastAutopilotRunAt,
    launchOrder: picked.launchOrder,
  }));
}

main().catch(e => console.error('ERROR:' + e.message));
