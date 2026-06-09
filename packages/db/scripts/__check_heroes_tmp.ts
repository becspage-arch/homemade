import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { prisma } from '../src/index.js';

async function main() {
  const total = await prisma.tutorial.count({
    where: { categorySlug: 'herbal-medicine', status: 'PUBLISHED' },
  });
  const withHero = await prisma.tutorial.count({
    where: { categorySlug: 'herbal-medicine', status: 'PUBLISHED', heroMediaId: { not: null } },
  });
  const withoutHero = await prisma.tutorial.count({
    where: { categorySlug: 'herbal-medicine', status: 'PUBLISHED', heroMediaId: null },
  });
  console.log(`herbal-medicine PUBLISHED: ${total} total, ${withHero} with hero, ${withoutHero} without hero`);

  // Show recent ones without heroes
  const recent = await prisma.tutorial.findMany({
    where: { categorySlug: 'herbal-medicine', status: 'PUBLISHED', heroMediaId: null },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { slug: true, type: true, updatedAt: true },
  });
  console.log('Recent without hero:', JSON.stringify(recent));
}

main().catch(e => console.error('ERROR:' + e.message));
