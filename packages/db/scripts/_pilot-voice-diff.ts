/**
 * Diff each pilot tutorial's CURRENT body against its REVISED_FROM snapshot.
 * Shows what content was removed by the rewrite. Useful to spot accidental
 * deletions (entire sections that should have been kept).
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

const SLUGS = [
  'calendula-salve-for-skin',
  'a-bank-balance-that-climbs-while-you-sleep',
  'ackee-and-saltfish',
  'almond-croissants-leftover',
  'alternating-square-knot-macrame',
  'ash-serving-tray',
  'applying-a-limewash-finish',
  'arnica-balm',
  'airtightness-survey-smoke-pencil',
  'assisting-a-stuck-lamb-at-lambing',
]

function collectHeadings(node: any, out: string[]): void {
  if (!node) return
  if (node.type === 'heading') {
    const text = (node.content || []).map((c: any) => c.text || '').join('')
    const lvl = node.attrs?.level || 2
    out.push(`H${lvl}: ${text}`)
  }
  if (node.type === 'infoPanel') {
    const title = node.attrs?.title
    if (title) out.push(`infoPanel: ${title}`)
  }
  if (node.content) for (const c of node.content) collectHeadings(c, out)
}

function countWords(node: any): number {
  if (!node) return 0
  let n = 0
  if (node.text) n += node.text.split(/\s+/).filter(Boolean).length
  if (node.content) for (const c of node.content) n += countWords(c)
  if (node.attrs?.items && Array.isArray(node.attrs.items)) {
    for (const it of node.attrs.items) {
      for (const k of ['symptom', 'cause', 'fix', 'description', 'name', 'body']) {
        if (typeof it?.[k] === 'string') n += it[k].split(/\s+/).filter(Boolean).length
      }
    }
  }
  if (node.attrs?.body && typeof node.attrs.body === 'string') {
    n += node.attrs.body.split(/\s+/).filter(Boolean).length
  }
  return n
}

async function main() {
  for (const slug of SLUGS) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { body: true, revisedFrom: true },
    })
    if (!t || !t.revisedFrom) {
      console.log(`[${slug}] no revisedFrom snapshot`)
      continue
    }
    const oldHeadings: string[] = []
    const newHeadings: string[] = []
    collectHeadings(t.revisedFrom, oldHeadings)
    collectHeadings(t.body, newHeadings)
    const oldWords = countWords(t.revisedFrom)
    const newWords = countWords(t.body)
    const removed = oldHeadings.filter((h) => !newHeadings.includes(h))
    const added = newHeadings.filter((h) => !oldHeadings.includes(h))
    console.log(`\n=== ${slug} (${oldWords}w → ${newWords}w, ${oldWords - newWords > 0 ? '-' : '+'}${Math.abs(oldWords - newWords)}w) ===`)
    if (removed.length) {
      console.log('REMOVED headings/panels:')
      for (const h of removed) console.log(`  - ${h}`)
    }
    if (added.length) {
      console.log('ADDED headings/panels:')
      for (const h of added) console.log(`  + ${h}`)
    }
    if (!removed.length && !added.length) {
      console.log('(headings unchanged)')
    }
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
