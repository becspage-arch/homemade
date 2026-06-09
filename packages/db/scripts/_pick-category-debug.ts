import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();

import { prisma } from '../src';

async function main() {
  const cats = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' as const } } } },
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
  });

  for (const c of cats) {
    const published = c._count.tutorials;
    const target = c.targetTutorialCount ?? 'null';
    const pct = c.targetTutorialCount ? Math.round((published / c.targetTutorialCount) * 100) : '?';
    const lastRun = c.lastAutopilotRunAt?.toISOString() ?? 'null';
    console.log(`${c.slug.padEnd(30)} | ${String(c.pipelineStatus).padEnd(12)} | ${published}/${target} (${pct}%) | lastRun=${lastRun}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
