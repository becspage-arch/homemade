import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'
async function main() {
  const total = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const realPhoto = await prisma.tutorial.count({ where: { status: 'PUBLISHED', heroImageStrategy: 'REAL_PHOTO' } })
  const aiGen = await prisma.tutorial.count({ where: { status: 'PUBLISHED', heroImageStrategy: 'AI_GENERATED' } })
  const procedural = await prisma.tutorial.count({ where: { status: 'PUBLISHED', heroImageStrategy: 'PROCEDURAL_CARD' } })
  const unset = await prisma.tutorial.count({ where: { status: 'PUBLISHED', heroImageStrategy: 'UNSET' } })
  console.log(`PUBLISHED: ${total}`)
  console.log(`  REAL_PHOTO   : ${realPhoto}`)
  console.log(`  AI_GENERATED : ${aiGen}`)
  console.log(`  PROCEDURAL   : ${procedural}`)
  console.log(`  UNSET        : ${unset}`)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
