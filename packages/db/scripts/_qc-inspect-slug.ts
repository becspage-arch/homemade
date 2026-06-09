import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
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

async function main() {
  const slug = process.argv[2] ?? '12v-shed-battery-bank'

  const t = await prisma.tutorial.findUnique({
    where: { slug },
    select: { title: true, body: true, excerpt: true, type: true, category: { select: { slug: true } } }
  })

  if (!t) { console.log('NOT FOUND'); process.exit(1) }

  console.log('Title:', t.title)
  console.log('Type:', t.type)
  console.log('Category:', t.category.slug)
  console.log('Excerpt:', t.excerpt)
  console.log('')
  console.log('Body (JSON):')
  console.log(JSON.stringify(t.body, null, 2))

  await prisma.$disconnect()
}
main()
