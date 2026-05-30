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
  const slug = process.argv[2] ?? 'soy-candle-rose-geranium'
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  // Dump first 3 content nodes raw
  const content = body.content ?? []
  for (let i = 0; i < Math.min(3, content.length); i++) {
    console.log('content[' + i + ']:', JSON.stringify(content[i]).slice(0, 500))
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
