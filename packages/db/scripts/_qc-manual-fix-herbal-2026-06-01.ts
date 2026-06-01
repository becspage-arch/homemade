/**
 * Manual QC fixes for herbal-medicine tutorials — 2026-06-01 hourly batch
 * Three tutorials blocked after mechanical qc-fix pass:
 *   echinacea-tincture:      paragraph[12] grade 11.1 → simplify storage line
 *   elderflower-cold-infusion: paragraph[0] grade 11.9 → simplify orientation
 *   lavender-profile:        paragraph[1] grade 11.5 + EMA institutional ref
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

import { prisma } from '../src/index.js'

type TNode = { type: string; text?: string; marks?: unknown[]; attrs?: Record<string, unknown>; content?: TNode[] }

function patchNodeAtIndex(body: TNode, index: number, newText: string): TNode {
  const content = body.content ?? []
  const node = content[index]
  if (!node || node.type !== 'paragraph') {
    throw new Error(`Node at index ${index} is not a paragraph (got ${node?.type ?? 'undefined'})`)
  }
  const updated: TNode = { ...node, content: [{ type: 'text', text: newText, marks: [] }] }
  return { ...body, content: [...content.slice(0, index), updated, ...content.slice(index + 1)] }
}

const fixes = [
  {
    slug: 'echinacea-tincture',
    idx: 12,
    text: 'The finished tincture keeps for 2 years in a sealed amber bottle. Store away from direct light and heat.',
    label: 'paragraph[12] storage — grade simplified',
  },
  {
    slug: 'elderflower-cold-infusion',
    idx: 0,
    text: 'Dried elderflowers steeped in just-boiled water. Taken at the first signs of a cold or mild flu. Long used to ease the early stages of a cold.',
    label: 'paragraph[0] orientation — grade simplified',
  },
  {
    slug: 'lavender-profile',
    idx: 1,
    text: 'A herb profile of lavender: its traditional actions, uses for the nervous system, skin, and muscles, how to prepare it, and safety notes. The most widely used aromatic herb in the western herbal tradition. A long kitchen tradition for everyday use at home. About 15 minutes of active work.',
    label: 'paragraph[1] orientation — grade simplified + EMA removed from prose',
  },
]

async function main() {
  for (const fix of fixes) {
    const t = await prisma.tutorial.findUnique({ where: { slug: fix.slug }, select: { id: true, body: true } })
    if (!t) { console.log(`NOT FOUND: ${fix.slug}`); continue }
    const patched = patchNodeAtIndex(t.body as TNode, fix.idx, fix.text)
    await prisma.tutorial.update({ where: { id: t.id }, data: { body: patched as object, voiceRetrofittedAt: new Date() } })
    console.log(`FIXED ${fix.slug} — ${fix.label}`)
  }
  await prisma.$disconnect()
  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })
