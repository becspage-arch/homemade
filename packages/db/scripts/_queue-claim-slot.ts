import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const CATEGORY_SLUG = process.argv[2]
if (!CATEGORY_SLUG) { console.error('Usage: tsx _queue-claim-slot.ts <slug>'); process.exit(1) }

async function main() {
  const { prisma } = await import('../src/index.js')
  const updated = await prisma.category.update({
    where: { slug: CATEGORY_SLUG },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:' + JSON.stringify(updated))
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
