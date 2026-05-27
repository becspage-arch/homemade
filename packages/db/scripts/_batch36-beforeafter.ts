import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

function firstPara(body: any): string {
  if (!body?.content) return ''
  for (const node of body.content) {
    if (node.type === 'paragraph' && node.content) {
      const text = node.content
        .filter((c: any) => c.type === 'text' || typeof c.text === 'string')
        .map((c: any) => c.text)
        .join('')
      if (text.trim()) return text
    }
  }
  return ''
}

async function main() {
  const slugs = process.argv.slice(2)
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, title: true, body: true, revisedFrom: true, category: { select: { slug: true } } },
    })
    if (!t) {
      console.log(`MISS: ${slug}`)
      continue
    }
    console.log(`\n=== ${t.slug} (${t.category?.slug}) ===`)
    console.log(`BEFORE: ${firstPara(t.revisedFrom)}`)
    console.log(`AFTER:  ${firstPara(t.body)}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
