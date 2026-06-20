import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();
import { prisma } from '../src';

async function main() {
  const tools = await prisma.tool.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  });
  for (const t of tools) console.log(t.slug + ' | ' + t.name);
  console.log('TOTAL_TOOLS:' + tools.length);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
