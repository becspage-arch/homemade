import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const CATEGORY_ID = 'cmp8mecup0008d4v4rr5mf0jr'; // paper-word
  const updated = await prisma.category.update({
    where: { id: CATEGORY_ID },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  });
  process.stdout.write(`Claimed: ${updated.slug} at ${updated.lastAutopilotRunAt?.toISOString()}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
