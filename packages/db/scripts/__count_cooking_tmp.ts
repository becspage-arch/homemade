import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { prisma } from '../src/index.js';

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'cooking' }, select: { id: true } });
  if (!cat) { console.log('CATEGORY NOT FOUND'); return; }

  const counts = await prisma.tutorial.groupBy({
    by: ['status'],
    where: { categoryId: cat.id },
    _count: { id: true },
  });

  console.log('cooking tutorial counts by status:');
  for (const c of counts) {
    console.log(`  ${c.status}: ${c._count.id}`);
  }

  // Check recent tutorials (last hour)
  const recent = await prisma.tutorial.findMany({
    where: {
      categoryId: cat.id,
      updatedAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) }, // last 3 hours
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { slug: true, status: true, updatedAt: true },
  });
  console.log('\nRecently updated (last 3h):', JSON.stringify(recent.map(r => ({ slug: r.slug, status: r.status })), null, 2));
}

main().catch(e => console.error('ERROR:' + e.message));
