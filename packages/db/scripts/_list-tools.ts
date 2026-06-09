import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const tools = await prisma.tool.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } })
  for (const t of tools) console.log(t.slug)
}

main().catch(err => { console.error(err); process.exit(1) }).finally(() => prisma.$disconnect())
