/**
 * One-shot fix: the alphabet sampler's "A" glyph currently has a stray sage
 * top bar (5 cells at y=4, x=4..8) which makes it read as a deformed H. The
 * rest of the letter is red. This script:
 *   1. Loads the alphabet sampler tutorial.
 *   2. Mutates the cells array of the embedded crossStitchChart node so the
 *      "A" becomes a proper peaked A in red only.
 *   3. Writes the new body back to Tutorial.body and appends a new
 *      TutorialVersion snapshot.
 *
 * Cell delta documented in the body of run().
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
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

function rebuildA(cells: Cell[]): { next: Cell[]; removed: Cell[]; added: Cell[] } {
  // The A glyph lives at x=4..8, y=4..10 (5 wide, 7 tall).
  // Current shape (broken):
  //   y=4  SSSSS   <- stray sage top bar (the bug)
  //   y=5  R...R
  //   y=6  R...R
  //   y=7  RRRRR   (crossbar)
  //   y=8  R...R
  //   y=9  R...R
  //   y=10 R...R
  //
  // Target peaked A (red only):
  //   y=4  ..R..
  //   y=5  .R.R.
  //   y=6  R...R
  //   y=7  RRRRR
  //   y=8  R...R
  //   y=9  R...R
  //   y=10 R...R
  const inAGlyph = (c: Cell) => c.x >= 4 && c.x <= 8 && c.y >= 4 && c.y <= 10
  const removed = cells.filter(inAGlyph)
  const kept = cells.filter((c) => !inAGlyph(c))
  const added: Cell[] = [
    { x: 6, y: 4, paletteKey: 'red' },
    { x: 5, y: 5, paletteKey: 'red' },
    { x: 7, y: 5, paletteKey: 'red' },
    { x: 4, y: 6, paletteKey: 'red' },
    { x: 8, y: 6, paletteKey: 'red' },
    { x: 4, y: 7, paletteKey: 'red' },
    { x: 5, y: 7, paletteKey: 'red' },
    { x: 6, y: 7, paletteKey: 'red' },
    { x: 7, y: 7, paletteKey: 'red' },
    { x: 8, y: 7, paletteKey: 'red' },
    { x: 4, y: 8, paletteKey: 'red' },
    { x: 8, y: 8, paletteKey: 'red' },
    { x: 4, y: 9, paletteKey: 'red' },
    { x: 8, y: 9, paletteKey: 'red' },
    { x: 4, y: 10, paletteKey: 'red' },
    { x: 8, y: 10, paletteKey: 'red' },
  ]
  return { next: [...kept, ...added], removed, added }
}

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
  let appliedDelta: { removed: Cell[]; added: Cell[] } | null = null
  walkUpdate(body, (chartNode: any) => {
    const def = chartNode.attrs?.definition
    if (!def?.cells) return chartNode
    const result = rebuildA(def.cells as Cell[])
    def.cells = result.next
    appliedDelta = { removed: result.removed, added: result.added }
    return chartNode
  })
  if (!appliedDelta) throw new Error('no crossStitchChart node found')
  const delta = appliedDelta as { removed: Cell[]; added: Cell[] }
  writeFileSync(resolve(__dirname, '_alphabet-a-delta.json'), JSON.stringify(delta, null, 2))
  console.log('Cells removed:', delta.removed.length)
  for (const c of delta.removed) console.log('  -', c)
  console.log('Cells added:', delta.added.length)
  for (const c of delta.added) console.log('  +', c)

  // Snapshot the latest version to find the author for the new TutorialVersion.
  const latest = await prisma.tutorialVersion.findFirst({
    where: { tutorialId: t.id },
    orderBy: { createdAt: 'desc' },
    select: { authorId: true },
  })
  const authorId = latest?.authorId
  if (!authorId) throw new Error('no author found')

  await prisma.$transaction([
    prisma.tutorial.update({
      where: { id: t.id },
      data: { body: body as object },
    }),
    prisma.tutorialVersion.create({
      data: {
        tutorialId: t.id,
        title: t.title,
        body: body as object,
        status: t.status,
        authorId,
        changeNote: 'Rebuild A glyph: replace stray sage top bar with proper peaked A apex.',
      },
    }),
  ])
  console.log('Saved.')
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
