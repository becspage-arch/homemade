import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

import { prisma } from '../src'

async function main() {
  const slugs = ['zapiekanka', 'zeppole-italian', 'zereshk-polo', 'zucchini-pine-nut-cranberry-paleo-pasta', 'zupa-pomidorowa', 'zuppa-di-pesce-italiana', 'zurek']
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
    })
    console.log(`${slug.padEnd(45)} cat=${t?.category?.slug?.padEnd(10) ?? '?'} voiceRetrofittedAt=${t?.voiceRetrofittedAt?.toISOString() ?? 'NULL'}`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
