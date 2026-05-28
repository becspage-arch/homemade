/**
 * Pull the actual first body paragraph of the spot-check slug for the
 * batch4 hand-off.
 */
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

function flatten(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(flatten).join('')
  return ''
}

async function main() {
  const slug = process.argv[2] ?? 'tapping-to-release-the-grip-of-tension'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, body: true, voiceRetrofittedAt: true, category: { select: { slug: true } } },
  })
  if (!t) {
    console.log(`[MISS] ${slug}`)
    process.exit(1)
  }
  console.log(`slug: ${t.slug}`)
  console.log(`category: ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt: ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`first paragraph:`)
  for (const n of t.body?.content ?? []) {
    if (n.type === 'paragraph') {
      console.log(flatten(n))
      break
    }
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
