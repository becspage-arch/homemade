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
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  // Just read tapping-for-hosting-anxiety node[11] in full
  const slug = 'tapping-for-hosting-anxiety'
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  const nodes = (t?.body as any)?.content ?? []
  console.log(JSON.stringify(nodes[11], null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
