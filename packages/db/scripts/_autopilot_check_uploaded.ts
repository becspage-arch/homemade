import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const slugs = process.argv.slice(2)

async function main() {
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true },
  })
  const existingMap = Object.fromEntries(existing.map(t => [t.slug, t.status]))
  for (const slug of slugs) {
    const status = existingMap[slug] ?? 'NOT_FOUND'
    console.log(`${slug}:${status}`)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
