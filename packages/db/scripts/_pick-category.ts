import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();

import { prisma } from '../src';

async function main() {
  // Get counts by status for reporting
  const statusCounts = await prisma.category.groupBy({
    by: ['pipelineStatus'],
    _count: { id: true }
  });
  const counts: Record<string, number> = {};
  for (const row of statusCounts) {
    counts[row.pipelineStatus] = row._count.id;
  }

  const statusReport = JSON.stringify(counts);
  console.log('STATUS_COUNTS:', statusReport);

  // Pick next READY category (round-robin by lastAutopilotRunAt ASC NULLS FIRST)
  const categories = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' }
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
          tutorials: { where: { status: 'PUBLISHED' } }
        }
      }
    },
    take: 10
  });

  if (categories.length === 0) {
    console.log('NO_READY_CATEGORIES');
    await prisma.$disconnect();
    return;
  }

  // Print candidates
  for (const cat of categories) {
    const published = (cat._count as any).tutorials ?? 0;
    const target = cat.targetTutorialCount;
    console.log(`CANDIDATE: slug=${cat.slug} published=${published} target=${target ?? 'null'} lastRun=${cat.lastAutopilotRunAt?.toISOString() ?? 'null'}`);
  }

  // Pick first that isn't already complete
  for (const cat of categories) {
    const published = (cat._count as any).tutorials ?? 0;
    const target = cat.targetTutorialCount;
    if (target !== null && published >= target) {
      // Flip to COMPLETE
      await prisma.category.update({ where: { id: cat.id }, data: { pipelineStatus: 'COMPLETE' } });
      console.log(`FLIPPED_COMPLETE: ${cat.slug}`);
      continue;
    }
    console.log(`PICKED: ${JSON.stringify({ id: cat.id, slug: cat.slug, published, target })}`);
    await prisma.$disconnect();
    return;
  }

  console.log('ALL_CANDIDATES_COMPLETE');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
