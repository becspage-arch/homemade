import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main(): Promise<void> {
  const t = await prisma.tutorial.findUnique({ where: { slug: 'macrame-headboard' }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  const content = body.content || []
  console.log('paragraph[0]:')
  console.log(JSON.stringify(content[0], null, 2))
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
