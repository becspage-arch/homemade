import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

const SLUGS = ['fettuccine-alfredo', 'mille-feuille-napoleon', 'tapping-for-being-the-older-generation']

function firstParagraph(body: any): string {
  if (!body?.content) return '(no body)'
  for (const node of body.content) {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      return node.content.map((c: any) => c?.text ?? '').join('')
    }
  }
  return '(no paragraph)'
}

async function main() {
  for (const slug of SLUGS) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, type: true, body: true, revisedFrom: true, category: { select: { slug: true } } },
    })
    if (!t) {
      console.log(`[MISS] ${slug}`)
      continue
    }
    console.log(`\n=== ${slug} (${t.category?.slug}, ${t.type}) ===`)
    console.log('BEFORE:')
    console.log(`  ${firstParagraph(t.revisedFrom)}`)
    console.log('AFTER:')
    console.log(`  ${firstParagraph(t.body)}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
