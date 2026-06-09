/**
 * Wire Dillmont 1886 PD diagrams directly into Crochet Foundations Tutorial DB records.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/wire-crochet-foundations-diagrams.ts
 *
 * What it does:
 *   - Uses a hardcoded WIRINGS table mapping each figure to its actual tutorial slug
 *     (the manifest's suggestedTopics used a different naming scheme).
 *   - For each tutorial, queries the DB, inserts missing image nodes, and updates
 *     the body + sourceNotes in place. Idempotent — safe to re-run.
 *
 * Insertion position (per tutorial body shape):
 *   - If the body has an orderedList, insert all images after the first orderedList.
 *   - Else if the body has a heading, insert all images before the first heading.
 *   - Else append to end.
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

const IMAGE_URL_PREFIX = '/tutorial-diagrams/crochet/foundations/_sources/dillmont-1886'

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: unknown[]
}

// Explicit figure-to-slug wiring. The manifest's suggestedTopics used generic
// how-to-* slugs that predate our actual tutorial slug naming scheme.
const WIRINGS: Array<{ figFile: string; caption: string; figNum: string; tutorialSlug: string }> = [
  { figFile: 'fig-400-hook-wooden-handle.jpg', caption: 'Crochet needle with wooden handle', figNum: '400', tutorialSlug: 'crochet-hook-materials' },
  { figFile: 'fig-401-hook-steel-handle.jpg', caption: 'Crochet needle with steel handle', figNum: '401', tutorialSlug: 'crochet-hook-materials' },
  { figFile: 'fig-402-english-hook.jpg', caption: 'English crochet needle with wooden handle', figNum: '402', tutorialSlug: 'crochet-hook-size-choice' },
  { figFile: 'fig-403-position-of-hands-and-chain.jpg', caption: 'Position of the hands and explanation of chain stitch', figNum: '403', tutorialSlug: 'how-to-hold-a-crochet-hook' },
  { figFile: 'fig-403-position-of-hands-and-chain.jpg', caption: 'Position of the hands and explanation of chain stitch', figNum: '403', tutorialSlug: 'crochet-chain-stitch' },
  { figFile: 'fig-404-slip-stitch.jpg', caption: "Single stitch (Dillmont's name; modern UK / US: slip stitch)", figNum: '404', tutorialSlug: 'crochet-slip-stitch-tutorial' },
  { figFile: 'fig-405-plain-stitch-uk-double.jpg', caption: "Plain stitch (Dillmont's name; modern UK: double crochet; US: single crochet)", figNum: '405', tutorialSlug: 'crochet-double-crochet-uk-stitch' },
  { figFile: 'fig-414-plain-stitches-for-a-chain.jpg', caption: 'Plain stitches worked into a foundation chain', figNum: '414', tutorialSlug: 'crochet-chain-stitch' },
  { figFile: 'fig-415-half-trebles.jpg', caption: 'Half trebles (UK; US: half double crochet)', figNum: '415', tutorialSlug: 'crochet-half-treble-stitch' },
  { figFile: 'fig-416-trebles.jpg', caption: 'Trebles made directly above one another (UK treble; US double crochet)', figNum: '416', tutorialSlug: 'how-to-work-a-treble' },
  { figFile: 'fig-418-double-trebles.jpg', caption: "Double trebles or 'long stitch' (UK double treble; US treble crochet)", figNum: '418', tutorialSlug: 'crochet-double-treble-stitch' },
  { figFile: 'fig-441-crochet-square.jpg', caption: 'Crochet square worked in rounds', figNum: '441', tutorialSlug: 'crochet-joined-rounds-technique' },
  { figFile: 'fig-441-crochet-square.jpg', caption: 'Crochet square worked in rounds', figNum: '441', tutorialSlug: 'crochet-granny-square-basics' },
  { figFile: 'fig-447-decreasing.jpg', caption: 'Decreasing in Tunisian crochet (also illustrates the general decrease motion)', figNum: '447', tutorialSlug: 'crochet-decrease-basics' },
]

function buildImageNode(figFile: string, caption: string, figNum: string): TipTapNode {
  return {
    type: 'image',
    attrs: {
      src: `${IMAGE_URL_PREFIX}/${figFile}`,
      alt: caption,
      title: `Fig. ${figNum}, Encyclopaedia of Needlework (Therese de Dillmont, 1886). Public domain.`,
    },
  }
}

function findInsertionIndex(content: TipTapNode[]): number {
  const olIdx = content.findIndex((n) => n.type === 'orderedList')
  if (olIdx !== -1) return olIdx + 1
  const hIdx = content.findIndex((n) => n.type === 'heading')
  if (hIdx !== -1) return hIdx
  return content.length
}

async function main() {
  const { prisma } = await import('../src/index.js')

  // Group wirings by tutorial slug
  const bySlug = new Map<string, typeof WIRINGS>()
  for (const w of WIRINGS) {
    if (!bySlug.has(w.tutorialSlug)) bySlug.set(w.tutorialSlug, [])
    bySlug.get(w.tutorialSlug)!.push(w)
  }

  let wired = 0
  let alreadyWired = 0
  let notFound = 0

  for (const [slug, figs] of bySlug) {
    const row = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, slug: true, body: true, sourceNotes: true },
    })
    if (!row) {
      console.log(`NOT FOUND: ${slug}`)
      notFound++
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = row.body as any
    const content: TipTapNode[] = body?.content ?? []

    const newImages: TipTapNode[] = []
    for (const fig of figs) {
      const src = `${IMAGE_URL_PREFIX}/${fig.figFile}`
      const present = content.some((n) => n.type === 'image' && n.attrs?.src === src)
      if (!present) {
        newImages.push(buildImageNode(fig.figFile, fig.caption, fig.figNum))
      }
    }

    if (newImages.length === 0) {
      console.log(`  already wired: ${slug}`)
      alreadyWired++
      continue
    }

    const insertAt = findInsertionIndex(content)
    content.splice(insertAt, 0, ...newImages)

    let sourceNotes: string | null = row.sourceNotes ?? null
    const figNums = figs.map((f) => `Fig. ${f.figNum}`).join(', ')
    const credit = `Therese de Dillmont, Encyclopaedia of Needlework (1886), Chapter 9, ${figNums}. Project Gutenberg.`
    if (sourceNotes && !sourceNotes.includes('Dillmont')) {
      sourceNotes += `\n• ${credit}`
    } else if (!sourceNotes) {
      sourceNotes = credit
    }

    await prisma.tutorial.update({
      where: { id: row.id },
      data: {
        body: { ...body, content },
        sourceNotes,
        diagramGenerationStatus: 'SUCCESS',
      },
    })

    console.log(`  wired: ${slug} (+${newImages.length} image${newImages.length === 1 ? '' : 's'})`)
    wired++
  }

  console.log(`\nDone. wired=${wired}  already-wired=${alreadyWired}  not-found=${notFound}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
