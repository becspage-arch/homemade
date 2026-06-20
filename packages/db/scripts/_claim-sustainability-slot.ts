import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();
import { prisma } from '../src';

async function main() {
  const updated = await prisma.category.update({
    where: { id: 'cmp8mecw7000dd4v4vkqwh5hh' },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  });
  console.log('Claimed slot:', JSON.stringify(updated, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
