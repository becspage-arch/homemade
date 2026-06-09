/**
 * Pipeline A backfill — walks every crochet category Tutorial and updates
 * `diagramGenerationStatus` based on what the body currently contains.
 *
 *   - Tutorial body has at least one image from a known PD source folder
 *     (currently /tutorial-diagrams/crochet/{sub}/_sources/) → SUCCESS
 *   - Otherwise: status stays PENDING (we have NOT actively determined
 *     there is no source; the topic just hasn't been processed yet).
 *     The wiring scripts mark NO_SOURCE when they explicitly try a
 *     known source list and find no match (manifest gaps list).
 *
 * Idempotent — safe to re-run after wiring scripts add new images.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/update-crochet-diagram-status.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

const PD_SOURCE_MARKERS = ['/dillmont-1886/', '/_sources/']

function bodyHasPdDiagram(body: unknown): boolean {
  const content = (body as { content?: TipTapNode[] } | null)?.content ?? []
  for (const n of content) {
    if (n.type !== 'image') continue
    const src = n.attrs?.src
    if (typeof src !== 'string') continue
    if (PD_SOURCE_MARKERS.some((m) => src.includes(m))) return true
  }
  return false
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const cat = await prisma.category.findFirst({
    where: { slug: 'crochet' },
    select: { id: true },
  })
  if (!cat) {
    console.error('No crochet category found.')
    await prisma.$disconnect()
    return
  }

  const tutorials = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { id: true, slug: true, body: true, diagramGenerationStatus: true },
  })

  let flippedToSuccess = 0
  let alreadySuccess = 0
  let stayedPending = 0

  for (const t of tutorials) {
    const hasDiagram = bodyHasPdDiagram(t.body)
    if (hasDiagram) {
      if (t.diagramGenerationStatus === 'SUCCESS') {
        alreadySuccess++
        continue
      }
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { diagramGenerationStatus: 'SUCCESS' },
      })
      flippedToSuccess++
      console.log(`  SUCCESS: ${t.slug}`)
    } else {
      stayedPending++
    }
  }

  console.log(
    `\nDone. flippedToSuccess=${flippedToSuccess}  alreadySuccess=${alreadySuccess}  stayedPending=${stayedPending}  total=${tutorials.length}`,
  )
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
