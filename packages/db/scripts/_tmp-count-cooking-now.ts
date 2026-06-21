import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  const count = await prisma.tutorial.count({ where: { categorySlug: "cooking", status: "PUBLISHED" } });
  console.log(`Cooking PUBLISHED: ${count}`);
}
main().finally(() => prisma.$disconnect());
