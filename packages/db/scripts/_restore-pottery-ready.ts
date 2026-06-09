import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const updated = await prisma.category.update({
    where: { slug: 'pottery-ceramics' },
    data: { pipelineStatus: 'READY' },
    select: { slug: true, pipelineStatus: true },
  });
  process.stdout.write(`Restored: ${updated.slug} → ${updated.pipelineStatus}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
