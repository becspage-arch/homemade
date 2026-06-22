import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma, TutorialStatus } from '../src';
const db = prisma;

async function main() {
  const cookingCat = await db.category.findFirst({ where: { slug: 'cooking' } });
  if (!cookingCat) throw new Error('cooking category not found');
  const slugs = await db.tutorial.findMany({
    where: { categoryId: cookingCat.id, status: TutorialStatus.PUBLISHED },
    select: { slug: true },
    orderBy: { slug: 'asc' }
  });
  process.stdout.write(slugs.map((s) => s.slug).join('\n') + '\n');
  await db.$disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
