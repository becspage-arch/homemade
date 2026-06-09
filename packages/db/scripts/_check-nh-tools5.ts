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
  const tools = await prisma.tool.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
    take: 1000,
  })
  
  // Find candle wick-related
  const wickTools = tools.filter(t => t.name.toLowerCase().includes('wick') || t.slug.includes('wick'))
  console.log('WICK_TOOLS:', JSON.stringify(wickTools))
  
  // All spoon related
  const spoons = tools.filter(t => t.slug.includes('spoon') || t.name.toLowerCase().includes('spoon'))
  console.log('SPOON_TOOLS:', JSON.stringify(spoons))
  
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
