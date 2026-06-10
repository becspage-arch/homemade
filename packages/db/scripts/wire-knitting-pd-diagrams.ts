/**
 * Wire Dillmont 1886 PD knitting diagrams into existing Knitting Tutorial DB
 * records. Mirrors `wire-crochet-foundations-diagrams.ts`.
 *
 * K-4.2 approval received. K-4.4 expanded WIRINGS array to cover the new
 * STITCH tutorials authored in that phase.
 *
 * Coverage (K-4.4): the 20-figure K-4.2 Dillmont batch plus 11 K-4.4 wirings
 * maps into the 8 original + 11 new STITCH tutorial slugs. The
 * existing knitting tutorial slugs. Unmapped figures (the second-batch
 * additions covering brioche, colorwork, drop-stitch lace, the rest of the
 * cast-on family, knot stitch, p tbl) stay on the CDN as library assets the
 * next pipeline phase picks up once the matching tutorial records exist.
 *
 * Run (only after Rebecca approves quality):
 *   pnpm --filter "@homemade/db" exec tsx scripts/wire-knitting-pd-diagrams.ts
 *
 * Insertion position (matches crochet pipeline):
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

const IMAGE_URL_PREFIX = '/tutorial-diagrams/knitting/_sources/dillmont-1886'

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: unknown[]
}

const WIRINGS: Array<{ figFile: string; caption: string; figNum: string; tutorialSlug: string }> = [
  {
    figFile: 'fig-342-crossed-casting-on-single-thread.jpg',
    caption: "Crossed casting on with a single thread (Dillmont's name; the modern long-tail cast-on)",
    figNum: '342',
    tutorialSlug: 'long-tail-cast-on',
  },
  {
    figFile: 'fig-349-plain-stitch-knit.jpg',
    caption: "Plain stitch (Dillmont's name; the modern knit stitch)",
    figNum: '349',
    tutorialSlug: 'how-to-work-a-knit-stitch',
  },
  {
    figFile: 'fig-349-plain-stitch-knit.jpg',
    caption: "Plain stitch (Dillmont's name; the modern knit stitch)",
    figNum: '349',
    tutorialSlug: 'knit-and-purl-the-foundation-stitches',
  },
  {
    figFile: 'fig-350-back-or-seam-stitch-purl.jpg',
    caption: "Back or seam-stitch (Dillmont's name; the modern purl stitch)",
    figNum: '350',
    tutorialSlug: 'knit-and-purl-the-foundation-stitches',
  },
  {
    figFile: 'fig-341-position-of-the-hands.jpg',
    caption: 'Position of the hands in knitting (English / French style)',
    figNum: '341',
    tutorialSlug: 'how-to-work-a-knit-stitch',
  },
  {
    figFile: 'fig-341-position-of-the-hands.jpg',
    caption: 'Position of the hands in knitting (English / French style)',
    figNum: '341',
    tutorialSlug: 'knit-and-purl-the-foundation-stitches',
  },
  {
    figFile: 'fig-349-plain-stitch-knit.jpg',
    caption: "Plain stitch (Dillmont's name; the modern knit stitch)",
    figNum: '349',
    tutorialSlug: 'stocking-stitch-dishcloth',
  },
  {
    figFile: 'fig-350-back-or-seam-stitch-purl.jpg',
    caption: "Back or seam-stitch (Dillmont's name; the modern purl stitch)",
    figNum: '350',
    tutorialSlug: 'stocking-stitch-dishcloth',
  },
  {
    figFile: 'fig-349-plain-stitch-knit.jpg',
    caption: "Plain stitch (Dillmont's name; the modern knit stitch)",
    figNum: '349',
    tutorialSlug: 'garter-stitch-scarf',
  },
  {
    figFile: 'fig-349-plain-stitch-knit.jpg',
    caption: "Plain stitch (Dillmont's name; the modern knit stitch)",
    figNum: '349',
    tutorialSlug: 'simple-ribbed-hat',
  },
  {
    figFile: 'fig-350-back-or-seam-stitch-purl.jpg',
    caption: "Back or seam-stitch (Dillmont's name; the modern purl stitch)",
    figNum: '350',
    tutorialSlug: 'simple-ribbed-hat',
  },
  {
    figFile: 'fig-382-plaited-stitch.jpg',
    caption: 'Plaited stitch (the Victorian forerunner of modern cabling)',
    figNum: '382',
    tutorialSlug: 'cable-basics-c4f-and-c4b',
  },
  {
    figFile: 'fig-382-plaited-stitch.jpg',
    caption: 'Plaited stitch (the Victorian forerunner of modern cabling)',
    figNum: '382',
    tutorialSlug: 'cabled-dishcloth',
  },
  // K-4.4 additions — new STITCH tutorials authored in this phase
  {
    figFile: 'fig-345-knitting-on-stitches.jpg',
    caption: "Knitting on stitches (Dillmont's name; the modern knitted-on cast-on)",
    figNum: '345',
    tutorialSlug: 'knitted-on-cast-on',
  },
  {
    figFile: 'fig-348-casting-on-with-picots.jpg',
    caption: 'Casting on with picots (decorative cast-on for lace edges)',
    figNum: '348',
    tutorialSlug: 'picot-cast-on',
  },
  {
    figFile: 'fig-351-plain-stitch-taken-from-behind.jpg',
    caption: 'Plain stitch taken from behind (the modern knit through back loop, k tbl)',
    figNum: '351',
    tutorialSlug: 'knit-through-back-loop',
  },
  {
    figFile: 'fig-353-overs-yarn-over.jpg',
    caption: "Overs (Dillmont's name; the modern yarn-over)",
    figNum: '353',
    tutorialSlug: 'yarn-over',
  },
  {
    figFile: 'fig-352-back-stitch-from-behind-purl-tbl.jpg',
    caption: 'Back or seam-stitch taken from behind (the modern purl through back loop, p tbl)',
    figNum: '352',
    tutorialSlug: 'purl-through-back-loop',
  },
  {
    figFile: 'fig-357-common-heel.jpg',
    caption: 'Common heel construction (sock heel turn)',
    figNum: '357',
    tutorialSlug: 'sock-heel-turn',
  },
  {
    figFile: 'fig-382-plaited-stitch.jpg',
    caption: 'Plaited stitch (the Victorian forerunner of modern cabling)',
    figNum: '382',
    tutorialSlug: 'plaited-stitch',
  },
  {
    figFile: 'fig-354-knot-stitch.jpg',
    caption: 'Knot stitch (the Victorian forerunner of the modern bobble / popcorn)',
    figNum: '354',
    tutorialSlug: 'knot-stitch-and-bobble',
  },
  {
    figFile: 'fig-380-plain-patent-brioche.jpg',
    caption: 'Plain patent knitting, or brioche pattern (the foundational brioche stitch)',
    figNum: '380',
    tutorialSlug: 'brioche-one-colour',
  },
  {
    figFile: 'fig-381-double-patent-brioche.jpg',
    caption: 'Double patent knitting (the two-colour brioche variant)',
    figNum: '381',
    tutorialSlug: 'brioche-two-colour',
  },
  {
    figFile: 'fig-387-dropped-stitch-pattern.jpg',
    caption: 'Knitting pattern with dropped stitches (a Victorian drop-stitch lace technique)',
    figNum: '387',
    tutorialSlug: 'drop-stitch-lace',
  },
]

function buildImageNode(figFile: string, caption: string, figNum: string): TipTapNode {
  return {
    type: 'image',
    attrs: {
      src: `${IMAGE_URL_PREFIX}/${figFile}`,
      alt: caption,
      title: `Fig. ${figNum}, Encyclopaedia of Needlework (Thérèse de Dillmont, 1886). Public domain.`,
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
    const credit = `Thérèse de Dillmont, Encyclopaedia of Needlework (1886), Knitting chapter, ${figNums}. Project Gutenberg.`
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
