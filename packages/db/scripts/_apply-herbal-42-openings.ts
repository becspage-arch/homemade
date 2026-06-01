/**
 * Apply hand-authored first-paragraph openings from _herbal-42-openings.ts
 * to each of the 42 herbal-medicine PUBLISHED tutorials.
 *
 *   - Snapshots the pre-rewrite body to Tutorial.revisedFrom (only if null,
 *     so an existing revisedFrom from an earlier qc-fix pass is preserved).
 *   - Replaces the FIRST paragraph of body.content with a single text node
 *     carrying the new opening. All other body blocks stay intact.
 *   - Sets voiceRetrofittedAt = now().
 *   - Logs before/after for spot-check.
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
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
import { OPENINGS } from './_herbal-42-openings.js'

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

function txt(node: unknown): string {
  const n = node as TipTapNode | null | undefined
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(txt).join('')
  return ''
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run')
  let applied = 0
  let skipped = 0
  const samples: Array<{ slug: string; before: string; after: string }> = []
  for (const [slug, opening] of Object.entries(OPENINGS)) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, body: true, status: true, revisedFrom: true },
    })
    if (!t) { console.warn(`SKIP missing: ${slug}`); skipped++; continue }
    if (t.status !== 'PUBLISHED') { console.warn(`SKIP not PUBLISHED: ${slug} (${t.status})`); skipped++; continue }
    const body = t.body as { type?: string; content?: TipTapNode[] } | null
    if (!body || !Array.isArray(body.content)) { console.warn(`SKIP empty body: ${slug}`); skipped++; continue }
    const firstParaIdx = body.content.findIndex((n) => n.type === 'paragraph')
    const beforeFirst = firstParaIdx >= 0 ? txt(body.content[firstParaIdx]) : ''
    const newParagraph: TipTapNode = {
      type: 'paragraph',
      content: [{ type: 'text', text: opening, marks: [] }],
    }
    const newContent = [...body.content]
    if (firstParaIdx >= 0) {
      newContent.splice(firstParaIdx, 1, newParagraph)
    } else {
      newContent.unshift(newParagraph)
    }
    const newBody = { ...body, content: newContent }
    if (samples.length < 4) {
      samples.push({
        slug,
        before: beforeFirst.slice(0, 240),
        after: opening.slice(0, 240),
      })
    }
    if (DRY_RUN) {
      applied++
      continue
    }
    const updateData: Record<string, unknown> = {
      body: newBody,
      voiceRetrofittedAt: new Date(),
    }
    // Only snapshot to revisedFrom if it's currently null (preserves any
    // earlier qc-fix snapshot).
    if (t.revisedFrom === null) updateData.revisedFrom = t.body
    await prisma.tutorial.update({
      where: { id: t.id },
      data: updateData,
    })
    applied++
  }
  console.log(`\n${DRY_RUN ? 'DRY-RUN: would apply' : 'Applied'} ${applied} openings; skipped ${skipped}.`)
  for (const s of samples) {
    console.log(`\n=== ${s.slug} ===`)
    console.log(`BEFORE: ${s.before}`)
    console.log(`AFTER : ${s.after}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
