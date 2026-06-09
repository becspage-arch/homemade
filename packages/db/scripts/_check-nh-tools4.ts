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
  
  const slugsToCheck = ['salve-tin', 'thermometer-probe', 'silicone-spatula', 'stick-blender', 'silicone-loaf-mould', 'soap-cutter-wire', 'double-boiler', 'silicone-mould', 'wick-centring-bar', 'candle-wick', 'safety-goggles', 'stainless-steel-spoon', 'hdpe-pitcher', 'rubber-gloves', 'spray-bottle', 'glass-spray-bottle', 'aluminum-tin', 'aluminium-tin', 'cosmetic-jar']
  
  const found: Record<string, string> = {}
  for (const s of slugsToCheck) {
    const tool = tools.find(t => t.slug === s)
    found[s] = tool ? tool.name : 'NOT FOUND'
  }
  console.log('TOOL_CHECK:', JSON.stringify(found, null, 2))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
