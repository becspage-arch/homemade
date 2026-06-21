import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { prisma } from '../src/index.js';

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'cooking' }, select: { id: true } });
  if (!cat) return;
  const slugs = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { slug: true },
    orderBy: { slug: 'asc' }
  });
  const keywords = ['tikka','korma','biryani','jalfrezi','rogan-josh','bhuna','dhansak','madras','vindaloo','phaal','pathia','dopiaza','passanda','balti','tandoori','bhaji','samosa','bombay-potato','saag','tarka','chana','aloo-gobi','mushroom-bhaji','pilau','peshwari','raita'];
  const matches = slugs.map(s => s.slug).filter(s => keywords.some(k => s.includes(k)));
  console.log('Curry-house published:', matches.length);
  console.log(matches.join('\n'));
  await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
