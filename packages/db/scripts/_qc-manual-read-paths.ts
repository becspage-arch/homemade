/**
 * Read the full text of failing grade-level paragraphs for manual rewrite.
 * Usage: pass slug as arg, or hard-coded list
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvFile() {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); return }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

type TipTapNode = { type: string; content?: TipTapNode[]; text?: string; marks?: unknown[]; attrs?: unknown }

function extractText(node: TipTapNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (!node.content) return ''
  return node.content.map(extractText).join('')
}

function navigatePath(body: TipTapNode, path: string): TipTapNode | null {
  // path like "body > paragraph[0]" or "body > orderedList[17] > listItem[0] > paragraph[0]"
  // Indices are positional within the parent's content array (matching qc-audit.ts logic)
  const parts = path.replace(/^body\s*>\s*/, '').split(/\s*>\s*/)
  let node: TipTapNode = body
  for (const part of parts) {
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (!m) return null
    const [, , idxStr] = m
    const idx = parseInt(idxStr!)
    const children = node.content ?? []
    if (idx >= children.length) return null
    node = children[idx]!
  }
  return node
}

async function main() {
  loadEnvFile()
  const { prisma } = await import('../src/index.js')

  const ENTRIES: Array<{ slug: string; path: string }> = [
    { slug: 'tapping-for-always-behind', path: 'body > paragraph[11]' },
    { slug: 'my-anxiety-is-information-not-identity', path: 'body > paragraph[1]' },
    { slug: 'long-exhale-breath-for-perimenopause-anxiety', path: 'body > paragraph[9]' },
    { slug: 'avocado-conditioning-hair-mask', path: 'body > paragraph[0]' },
    { slug: 'citronella-bug-repellent-balm', path: 'body > paragraph[0]' },
    { slug: 'natural-deodorant-spray', path: 'body > paragraph[0]' },
    { slug: 're-webbing-a-sagging-sofa-base', path: 'body > paragraph[0]' },
    { slug: 'laying-luxury-vinyl-tile-click-flooring', path: 'body > paragraph[0]' },
    { slug: 'reclaiming-homemaker-as-feminist-identity', path: 'body > paragraph[0]' },
    { slug: 'five-senses-scan-three-minutes', path: 'body > paragraph[10]' },
    { slug: 'conditioning-and-feeding-a-leather-sofa', path: 'body > orderedList[17] > listItem[0] > paragraph[0]' },
    { slug: 'preparing-floor-self-levelling-compound', path: 'body > orderedList[17] > listItem[0] > paragraph[0]' },
    { slug: 'removing-and-replacing-vinyl-floor-tiles', path: 'body > orderedList[14] > listItem[0] > paragraph[0]' },
    { slug: 'replacing-a-worn-radiator-compression-valve', path: 'body > orderedList[13] > listItem[0] > paragraph[0]' },
  ]

  for (const { slug, path } of ENTRIES) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }
    const node = navigatePath(t.body as TipTapNode, path)
    if (!node) { console.log(slug + ': PATH NOT FOUND: ' + path); continue }
    const text = extractText(node)
    console.log('\n[' + slug + ' @ ' + path + ']')
    console.log(text)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
