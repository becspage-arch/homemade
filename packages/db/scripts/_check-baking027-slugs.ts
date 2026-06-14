import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const slugs = ['baking-sourdough-dutch-oven','blind-baking-technique','blitz-puff-pastry','starting-sourdough-starter','puff-pastry-full-classical','macaron-pistachio']
const rows = await p.tutorial.findMany({ where: { slug: { in: slugs } }, select: { slug: true, status: true } })
console.log('FOUND:', rows.length, 'of', slugs.length, 'checked')
console.log(JSON.stringify(rows, null, 2))
await p.$disconnect()
