import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cats = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
    },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' },
    ],
  });

  for (const c of cats) {
    process.stdout.write(
      `${c.slug.padEnd(28)} | ${String(c.pipelineStatus).padEnd(12)} | lastRun: ${c.lastAutopilotRunAt?.toISOString() ?? 'null'}\n`
    );
  }

  const ready = cats.filter(c => c.pipelineStatus === 'READY');
  process.stdout.write(`\nREADY count: ${ready.length}\n`);
  if (ready.length > 0) {
    process.stdout.write(`TOP PICK: ${ready[0].slug} (${ready[0].id}) lastRun: ${ready[0].lastAutopilotRunAt?.toISOString() ?? 'null'}\n`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
