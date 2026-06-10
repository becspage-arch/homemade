/**
 * One-shot K-4.2 spot-check. Reads back the 3 wired knitting tutorials and
 * prints their image src list + sourceNotes excerpt. Confirms the wire
 * script's reported "wired" count matches what landed in the DB.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/spot-check-knitting-wirings.ts
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

const SLUGS = ['long-tail-cast-on', 'how-to-work-a-knit-stitch', 'stocking-stitch-dishcloth']

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

async function main() {
  const { prisma } = await import('../src/index.js')

  for (const slug of SLUGS) {
    const row = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, body: true, sourceNotes: true, diagramGenerationStatus: true },
    })
    if (!row) {
      console.log(`MISSING: ${slug}`)
      continue
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = row.body as any
    const content: TipTapNode[] = body?.content ?? []
    const dillmontImages = content
      .filter((n) => n.type === 'image' && typeof n.attrs?.src === 'string' && (n.attrs.src as string).includes('dillmont-1886'))
      .map((n) => n.attrs?.src as string)
    const sourceNotesHasDillmont = (row.sourceNotes ?? '').includes('Dillmont')
    console.log(`${slug}:`)
    console.log(`  diagramGenerationStatus: ${row.diagramGenerationStatus}`)
    console.log(`  Dillmont images in body: ${dillmontImages.length}`)
    for (const src of dillmontImages) console.log(`    ${src}`)
    console.log(`  sourceNotes contains "Dillmont": ${sourceNotesHasDillmont}`)
    console.log('')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
