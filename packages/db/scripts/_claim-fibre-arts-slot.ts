import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const CATEGORY_ID = 'cmp8mecu30006d4v46t73nh01' // fibre-arts
  const updated = await prisma.category.update({
    where: { id: CATEGORY_ID },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  })
  console.log(`Claimed: ${updated.slug} at ${updated.lastAutopilotRunAt?.toISOString()}`)
}
main().catch(console.error).finally(() => prisma.$disconnect())
