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

function extractText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map((n: any) => extractText(n)).join('')
  return ''
}

async function main() {
  // Dump calligraphy-ink-testing paragraph[0] full text
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'calligraphy-ink-testing' },
    select: { body: true },
  })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  const para0 = body.content?.[0]
  console.log('calligraphy-ink-testing paragraph[0]:')
  console.log(extractText(para0))
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
