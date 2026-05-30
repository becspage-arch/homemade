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
  const slug = process.argv[2]!
  const pos = parseInt(process.argv[3] ?? '0')
  const liPos = parseInt(process.argv[4] ?? '0')
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  const content = body.content ?? []
  const node = content[pos]
  if (!node) { console.log('no node at', pos); return }
  const listItems = node.content ?? []
  const li = listItems[liPos]
  if (!li) { console.log('no listItem at', liPos); return }
  console.log('=== ' + slug + ' content[' + pos + '] listItem[' + liPos + '] ===')
  console.log(JSON.stringify(li).slice(0, 600))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
