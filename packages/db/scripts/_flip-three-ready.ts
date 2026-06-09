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
async function main() {
  const { prisma } = await import('../src/index.js')
  const slugs = ['wood-natural-craft', 'paper-word', 'pottery-ceramics']
  for (const slug of slugs) {
    const updated = await prisma.category.update({
      where: { slug },
      data: { pipelineStatus: 'READY' },
      select: { slug: true, pipelineStatus: true },
    })
    console.log(`FLIPPED ${updated.slug} -> ${updated.pipelineStatus}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
