/**
 * Pull before/after first-paragraph text for three batch43 slugs across
 * content types for the hand-off.
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

function plainText(node: any): string {
  if (!node) return ''
  if (Array.isArray(node)) return node.map(plainText).join(' ')
  if (typeof node !== 'object') return ''
  if (node.type === 'text' && typeof node.text === 'string') return node.text
  if (node.content) return plainText(node.content)
  return ''
}

function findParagraphAt(body: any, idx: number): string {
  const c = body?.content
  if (!Array.isArray(c) || !c[idx]) return '(not found)'
  return plainText(c[idx])
}

async function main() {
  const targets: Array<{ slug: string; paraIdx: number; label: string }> = [
    { slug: 'gulyasleves', paraIdx: 11, label: 'cooking RECIPE paragraph[11]' },
    { slug: 'plum-frangipane-tart', paraIdx: 0, label: 'baking RECIPE paragraph[0]' },
    { slug: 'tapping-for-the-doubted-intuition', paraIdx: 0, label: 'mindset PRACTICE paragraph[0]' },
  ]

  for (const t of targets) {
    const row: any = await prisma.tutorial.findUnique({
      where: { slug: t.slug },
      select: { slug: true, body: true, revisedFrom: true, category: { select: { slug: true } } },
    })
    if (!row) {
      console.log(`MISS ${t.slug}`)
      continue
    }
    console.log('\n===== ' + t.slug + ' (' + t.label + ')')
    console.log('  url: https://homemade.education/' + row.category?.slug + '/' + row.slug)
    console.log('\nBEFORE:')
    console.log('  ' + findParagraphAt(row.revisedFrom, t.paraIdx))
    console.log('\nAFTER:')
    console.log('  ' + findParagraphAt(row.body, t.paraIdx))
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
