import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();

import { prisma } from '../src';

async function main() {
  try {
    // Count published tutorials per category inline
    const categories = await prisma.category.findMany({
      where: { pipelineStatus: 'READY' },
      orderBy: [
        { lastAutopilotRunAt: 'asc' },
        { launchOrder: 'asc' },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        pipelineStatus: true,
        targetTutorialCount: true,
        lastAutopilotRunAt: true,
        launchOrder: true,
      },
    });

    // Get published counts
    const results = [];
    for (const cat of categories) {
      const publishedCount = await prisma.tutorial.count({
        where: { categoryId: cat.id, status: 'PUBLISHED' },
      });
      results.push({ ...cat, publishedCount });
    }

    console.log('CATEGORIES:' + JSON.stringify(results));
  } catch (e: any) {
    console.log('CATEGORY_ERROR:' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
