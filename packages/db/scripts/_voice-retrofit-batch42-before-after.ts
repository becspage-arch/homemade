import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
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

function firstParaText(body: any): string {
  const p = body?.content?.find((n: any) => n.type === 'paragraph')
  return (p?.content ?? []).map((c: any) => c.text ?? '').join('')
}

async function main() {
  const slugs = [
    'gammon-with-parsley-sauce',
    'pasteis-de-nata',
    'tapping-for-joy-that-softens-the-sleep-system',
  ]
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, type: true, body: true, revisedFrom: true },
    })
    if (!t) { console.log(`MISS ${slug}`); continue }
    console.log(`=== ${slug} (${t.type})`)
    console.log('BEFORE:', firstParaText(t.revisedFrom))
    console.log('AFTER :', firstParaText(t.body))
    console.log()
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
