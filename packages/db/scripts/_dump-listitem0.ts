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
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  const content = body.content ?? []
  // Find bulletList[7] (position 7 in content array)
  const bl7 = content[7]
  if (!bl7) { console.log('No node at position 7'); return }
  console.log('content[7] type:', bl7.type)
  if (bl7.type === 'bulletList') {
    const li0 = (bl7.content ?? [])[0]
    if (li0) {
      console.log('listItem[0] raw:', JSON.stringify(li0).slice(0, 800))
    }
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
