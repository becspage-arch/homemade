import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

async function main() {
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'external-wall-insulation-etics-installation' },
    select: { body: true },
  })
  if (!t) { console.log('NOT FOUND'); return }

  const body = t.body as any

  // Count all infoPanels in entire body JSON
  const bodyStr = JSON.stringify(body)
  const matches = [...bodyStr.matchAll(/"type":"infoPanel"/g)]
  console.log('Total infoPanel occurrences in JSON:', matches.length)

  // Print all top-level content nodes and their types
  const content = body?.content ?? []
  console.log('\nTop-level content nodes (first 5):')
  content.slice(0, 5).forEach((n: any, i: number) => {
    console.log(`  [${i}] type=${n.type} attrs=${JSON.stringify(n.attrs)?.slice(0, 80)}`)
  })

  // Find all infoPanels by walking recursively
  let ipCount = 0
  function findInfoPanels(node: any, path: string): void {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach((n, i) => findInfoPanels(n, path + '[' + i + ']')); return }
    if (node.type === 'infoPanel') {
      ipCount++
      const body = node.attrs?.body
      console.log(`\ninfoPanel #${ipCount} at path ${path}:`)
      console.log('  tone:', node.attrs?.tone)
      console.log('  body:', JSON.stringify(body)?.slice(0, 100))
      console.log('  has content?', Array.isArray(node.content) && node.content.length > 0)
    }
    if (Array.isArray(node.content)) node.content.forEach((n: any, i: number) => findInfoPanels(n, path + '.content[' + i + ']'))
  }

  findInfoPanels(body, 'body')
  console.log('\nTotal infoPanels found:', ipCount)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
