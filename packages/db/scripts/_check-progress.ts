import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const total = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const done = await prisma.tutorial.count({ where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } } })
  const remaining = await prisma.tutorial.count({ where: { status: 'PUBLISHED', voiceRetrofittedAt: null } })
  console.log('Total PUBLISHED:', total)
  console.log('Retrofitted:', done)
  console.log('Remaining:', remaining)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
