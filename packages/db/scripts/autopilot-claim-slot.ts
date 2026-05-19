import { prisma } from '../src/index.js';

async function main() {
  const updated = await (prisma as any).category.update({
    where: { slug: 'cooking' },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  });
  console.log('CLAIMED:', JSON.stringify(updated));
  await prisma.$disconnect();
}
main();
