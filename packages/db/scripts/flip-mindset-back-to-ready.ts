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
  const cat = await prisma.category.findUnique({ where: { slug: 'mindset' }, select: { pipelineStatus: true } })
  if (!cat) { console.log('mindset not found'); return }
  if (cat.pipelineStatus === 'READY') { console.log('already READY, no change'); return }
  await prisma.category.update({ where: { slug: 'mindset' }, data: { pipelineStatus: 'READY' } })
  console.log(`mindset: ${cat.pipelineStatus} → READY (false positive CATEGORY_PROMPT_MISSING halt at 03:23, file exists)`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
