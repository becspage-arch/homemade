/**
 * Show the actual paragraph text for remaining tricolon warnings after the
 * fixup pass, so we can decide which are genuine voice tells vs accepted
 * content lists.
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

import { prisma } from '../src/index.js'
import { runVoiceCheck, extractProseChunks, extractMetadataChunks } from './voice-check-lib.js'

interface TipTapNode { type?: string; text?: string; content?: TipTapNode[]; attrs?: Record<string, unknown> }

function flattenNode(n: TipTapNode): string {
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(flattenNode).join('')
}

async function main(): Promise<void> {
  const rows = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, subtitle: true, excerpt: true, sourceNotes: true, body: true },
    orderBy: { slug: 'asc' },
  })

  let totalTricolons = 0
  for (const t of rows) {
    const report = runVoiceCheck({ subtitle: t.subtitle, excerpt: t.excerpt, sourceNotes: t.sourceNotes, body: t.body })
    const tricolons = report.warnings.filter((w) => w.kind === 'tricolon')
    if (tricolons.length === 0) continue
    totalTricolons += tricolons.length
    console.log(`\n=== ${t.slug}`)

    // Pull all prose chunks and find which ones match the warned paths
    const allChunks = [
      ...extractMetadataChunks({ subtitle: t.subtitle, excerpt: t.excerpt, sourceNotes: t.sourceNotes, body: t.body }),
      ...extractProseChunks(t.body),
    ]

    for (const w of tricolons) {
      const chunk = allChunks.find(c => c.path === w.path)
      const text = chunk?.text ?? '(text not found)'
      console.log(`  [${w.path}]`)
      console.log(`  "${text.slice(0, 160)}${text.length > 160 ? '...' : ''}"`)
    }
  }
  console.log(`\nTotal remaining: ${totalTricolons}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => { console.error(err); return prisma.$disconnect().then(() => process.exit(1)) })
