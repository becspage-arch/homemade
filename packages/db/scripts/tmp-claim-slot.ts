import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
loadEnv();

import { prisma } from '../src';

async function main() {
  try {
    await prisma.category.update({
      where: { id: 'cmp8mecw7000dd4v4vkqwh5hh' },
      data: { lastAutopilotRunAt: new Date() },
    });
    console.log('CLAIMED:sustainability');
  } catch (e: any) {
    console.log('CLAIM_ERROR:' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
