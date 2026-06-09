/**
 * Inspect prose-prep-steps violations to understand what needs fixing.
 */
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

// TipTap body navigation by index path like "body > paragraph[6]"
function getNodeByPath(body: any, path: string): any {
  // path like "body > paragraph[6]" or "body > orderedList[7] > listItem[1] > paragraph[0]"
  // We want to navigate the content array by index
  const parts = path.replace('body > ', '').split(' > ')
  let node = body
  for (const part of parts) {
    const match = part.match(/\[(\d+)\]$/)
    if (!match) continue
    const idx = parseInt(match[1])
    const content = node.content || []
    node = content[idx]
    if (!node) return null
  }
  return node
}

// Extract plain text from a TipTap node
function getText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.content) return node.content.map(getText).join('')
  return ''
}

const SLUGS_PATHS: Array<{ slug: string; path: string }> = [
  { slug: 'cottage-pie-jacket-potato', path: 'body > orderedList[7] > listItem[1] > paragraph[0]' },
  { slug: 'folio-wallet-construction', path: 'body > paragraph[10]' },
  { slug: 'green-oak-tool-tote', path: 'body > orderedList[5] > listItem[0] > paragraph[0]' },
  { slug: 'kibbeh', path: 'body > paragraph[6]' },
  { slug: 'mercimek-corbasi', path: 'body > paragraph[9]' },
  { slug: 'pasta-aglio-e-olio', path: 'body > paragraph[9]' },
  { slug: 'polymer-clay-gradient-blend-earrings', path: 'body > paragraph[6]' },
  { slug: 'wet-felted-pebble-soap-dish', path: 'body > paragraph[8]' },
]

async function main(): Promise<void> {
  for (const { slug, path } of SLUGS_PATHS) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!t) { console.log(slug + ': NOT FOUND\n'); continue }
    const node = getNodeByPath(t.body, path)
    if (!node) { console.log(slug + ': path not found: ' + path + '\n'); continue }
    const text = getText(node)
    console.log('=== ' + slug + ' @ ' + path + ' ===')
    console.log(text)
    console.log()
  }
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('inspect failed:', err)
  process.exit(1)
})
