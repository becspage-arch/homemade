import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { writeFileSync } from 'node:fs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any)

async function main() {
  const ings = await prisma.ingredient.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } })
  const tools = await prisma.tool.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } })
  writeFileSync('/tmp/db-ingredients.txt', ings.map((i: any) => i.slug).join('\n'))
  writeFileSync('/tmp/db-tools.txt', tools.map((t: any) => t.slug).join('\n'))
  console.log(`ingredients=${ings.length} tools=${tools.length}`)
  await prisma.$disconnect(); await pool.end()
}
main().catch(e => { console.error(e); process.exit(1) })
