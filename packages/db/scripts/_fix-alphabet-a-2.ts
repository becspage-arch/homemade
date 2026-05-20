/**
 * Follow-up: remove the leftover sage cells at (9, 4) and (10, 4) that were
 * part of the same stray top bar the first fix targeted. These sit in the
 * gap between the A and B glyphs and are not part of any intended design.
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

interface Cell { x: number; y: number; paletteKey: string }

function walkUpdate(node: any, fn: (n: any) => any): any {
  if (!node || typeof node !== 'object') return node
  if (node.type === 'crossStitchChart') return fn(node)
  if (Array.isArray(node.content)) {
    node.content = node.content.map((c: any) => walkUpdate(c, fn))
  }
  return node
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'cross-stitch-alphabet-sampler-border' },
    select: { id: true, body: true, title: true, status: true },
  })
  if (!t) throw new Error('alphabet sampler tutorial not found')
  const body = structuredClone(t.body) as any
  const removed: Cell[] = []
  walkUpdate(body, (chartNode: any) => {
    const def = chartNode.attrs?.definition
    if (!def?.cells) return chartNode
    const cells = def.cells as Cell[]
    const toRemove = (c: Cell) =>
      (c.x === 9 && c.y === 4 && c.paletteKey === 'sage') ||
      (c.x === 10 && c.y === 4 && c.paletteKey === 'sage')
    for (const c of cells) if (toRemove(c)) removed.push(c)
    def.cells = cells.filter((c) => !toRemove(c))
    return chartNode
  })
  console.log('Cells removed:', removed.length)
  for (const c of removed) console.log('  -', c)
  if (removed.length === 0) {
    console.log('Nothing to do.')
    await prisma.$disconnect()
    return
  }

  const latest = await prisma.tutorialVersion.findFirst({
    where: { tutorialId: t.id },
    orderBy: { createdAt: 'desc' },
    select: { authorId: true },
  })
  const authorId = latest?.authorId
  if (!authorId) throw new Error('no author found')

  await prisma.$transaction([
    prisma.tutorial.update({ where: { id: t.id }, data: { body: body as object } }),
    prisma.tutorialVersion.create({
      data: {
        tutorialId: t.id,
        title: t.title,
        body: body as object,
        status: t.status,
        authorId,
        changeNote: 'Remove remaining stray sage cells at (9,4) and (10,4) — leftover from the A top bar that lived in the A/B gap.',
      },
    }),
  ])
  console.log('Saved.')
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
