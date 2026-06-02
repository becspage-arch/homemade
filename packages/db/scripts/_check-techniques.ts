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

async function main() {
  const { prisma } = await import('../src/index.js')
  const techniques = await prisma.tutorial.findMany({
    where: { type: 'TECHNIQUE', category: { slug: 'natural-home' } },
    select: { slug: true, title: true },
    orderBy: { slug: 'asc' },
  })
  console.log('Natural-home TECHNIQUE count:', techniques.length)
  techniques.forEach(t => console.log(' -', t.slug, '|', t.title))

  // Also check if working-with-lye-safely exists anywhere
  const lye = await prisma.tutorial.findFirst({ where: { slug: 'working-with-lye-safely' } })
  console.log('working-with-lye-safely exists:', !!lye)
  const cp = await prisma.tutorial.findFirst({ where: { slug: 'cold-process-soap-method' } })
  console.log('cold-process-soap-method exists:', !!cp)

  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
