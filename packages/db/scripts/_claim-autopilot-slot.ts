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

const slug = process.argv[2]
if (!slug) { console.error('usage: _claim-autopilot-slot.ts <slug>'); process.exit(1) }

async function main() {
  const { prisma } = await import('../src/index.js')
  const updated = await prisma.category.update({
    where: { slug },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true }
  })
  console.log(`Claimed slot for ${updated.slug} at ${updated.lastAutopilotRunAt?.toISOString()}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
