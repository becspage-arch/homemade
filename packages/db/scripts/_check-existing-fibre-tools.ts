import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
  // Get distinct tool slugs used by fibre-arts tutorials via recipeTools join
  const tutorialTools = await prisma.tutorialTool.findMany({
    where: { tutorial: { category: { slug: 'fibre-arts' } } },
    select: { tool: { select: { slug: true, name: true } } },
    distinct: ['toolId'],
  })
  console.log('Distinct tool slugs in fibre-arts:')
  console.log(JSON.stringify(tutorialTools.map((t: any) => t.tool.slug).sort()))
  await prisma.$disconnect()
}
main()
