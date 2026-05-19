import { prisma } from '../src/index.js';

async function main() {
  const slugs = ['arroz-caldoso-marisco', 'boeuf-en-daube', 'cacio-e-pepe', 'poulet-chasseur', 'souvlaki-chicken', 'whole-grilled-bream-greek'];
  for (const slug of slugs) {
    const t = await (prisma as any).tutorial.findUnique({
      where: { slug },
      select: { slug: true, status: true, publishedAt: true },
    });
    console.log(slug, t?.status, t?.publishedAt?.toISOString()?.slice(0, 19) ?? 'null');
  }

  const cookingCount = await (prisma as any).tutorial.count({
    where: { category: { slug: 'cooking' }, status: 'PUBLISHED' },
  });
  console.log('COOKING_PUBLISHED:', cookingCount);
  await prisma.$disconnect();
}
main();
