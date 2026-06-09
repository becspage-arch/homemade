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

const NH_KEYWORDS2 = ['sili','spray','pipette','dropper','bowl','funnel','roller','pump','bottle','storage','brush','spatula','spoon','whisk','pastry','scraper']

async function main() {
  const { prisma } = await import('../src/index.js')
  const tools = await prisma.tool.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
    take: 500,
  })
  const nhTools = tools.filter(t => NH_KEYWORDS2.some(k => t.slug.includes(k)))
  console.log('NH_TOOLS2:\n' + nhTools.map(t => `  ${t.slug}: ${t.name}`).join('\n'))
  // Also show salve-tin
  const salve = tools.find(t => t.slug === 'salve-tin')
  console.log('SALVE_TIN:', salve ? JSON.stringify(salve) : 'NOT FOUND')
  // Check for wax-related
  const waxTools = tools.filter(t => t.name.toLowerCase().includes('wax') || t.slug.includes('wax'))
  console.log('WAX_TOOLS:\n' + waxTools.map(t => `  ${t.slug}: ${t.name}`).join('\n'))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
