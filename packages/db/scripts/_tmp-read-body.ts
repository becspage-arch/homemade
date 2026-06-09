import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const SLUG = process.argv[2] || 'blown-cellulose-cavity-fill'

async function main() {
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findUnique({
    where: { slug: SLUG },
    select: { slug: true, body: true, title: true }
  })
  if (!t) { console.log('NOT FOUND'); process.exit(1) }
  console.log('TITLE:', t.title)
  const body = t.body as any
  console.log(JSON.stringify(body, null, 2))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
