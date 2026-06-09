import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  const now = new Date()
  const row = await prisma.category.update({
    where: { slug: 'pottery-ceramics' },
    data: { lastAutopilotRunAt: now },
    select: { slug: true, lastAutopilotRunAt: true },
  })
  console.log(`CLAIMED: ${row.slug} lastAutopilotRunAt=${row.lastAutopilotRunAt?.toISOString()}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
