/**
 * One-shot: update lastAutopilotRunAt for a given category slug.
 * Usage: tsx scripts/_claim-category-slot.ts --slug <slug>
 */
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

const slugIdx = process.argv.indexOf('--slug')
const slug = slugIdx >= 0 ? process.argv[slugIdx + 1] : null
if (!slug) { console.error('Usage: tsx scripts/_claim-category-slot.ts --slug <slug>'); process.exit(1) }

async function main() {
  const { prisma } = await import('../src/index.js')
  const now = new Date()
  const updated = await prisma.category.update({
    where: { slug },
    data: { lastAutopilotRunAt: now },
    select: { slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:' + JSON.stringify(updated))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
