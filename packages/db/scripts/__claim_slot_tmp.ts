import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { prisma } from '../src/index.js';

async function main() {
  // Claim the slot for herbal-medicine
  const updated = await prisma.category.update({
    where: { id: 'cmp8mecsf0001d4v47qrv3zbh' },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  });
  console.log('CLAIMED:' + JSON.stringify(updated));
}

main().catch(e => console.error('ERROR:' + e.message));
