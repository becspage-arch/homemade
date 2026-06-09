/**
 * Manual QC fix for 3 paper-word BLOCKs that auto-fix couldn't handle.
 * Run: pnpm --filter @homemade/db exec tsx scripts/_qc-manual-fix-blocking.ts
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}
import { prisma } from '../src'

function makeTextNode(text: string) {
  return { type: 'text', text }
}

function makeParagraph(text: string) {
  return { type: 'paragraph', content: [makeTextNode(text)] }
}

function makeListItem(text: string) {
  return { type: 'listItem', content: [makeParagraph(text)] }
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function repoPath(rel: string): string {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return resolve(dir, rel)
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return resolve(process.cwd(), rel)
}

async function main() {
  const snapshotDir = repoPath('docs/qc-fixes-' + dateStamp())
  if (!existsSync(snapshotDir)) mkdirSync(snapshotDir, { recursive: true })

  // ─── 1. book-repair-lifting-endpaper — simplify paragraph[0] ────────────
  {
    const slug = 'book-repair-lifting-endpaper'
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
    if (!t) { console.log(slug + ': not found'); } else {
      const body = t.body as any
      writeFileSync(resolve(snapshotDir, slug + '.before.json'), JSON.stringify(body, null, 2))

      const content = body.content as any[]
      // paragraph[0] — simplify grade level from 11.3 to ≤8
      const p0 = content[0]
      if (p0?.type === 'paragraph') {
        p0.content = [
          makeTextNode(
            'A lifting paste-down means the glue dried out and the paper pulled away from the board. ' +
            'The fix is simple if the paper has not torn: work fresh paste under the lifted area and press it flat until it sets. ' +
            'The tricky part is getting the paste in without marking the cloth or paper on the outside of the board.'
          ),
        ]
      }

      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body, voiceRetrofittedAt: new Date() },
      })
      console.log(slug + ': updated')
    }
  }

  // ─── 2. illuminated-border-design — simplify paragraph[6] ───────────────
  {
    const slug = 'illuminated-border-design'
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
    if (!t) { console.log(slug + ': not found'); } else {
      const body = t.body as any
      writeFileSync(resolve(snapshotDir, slug + '.before.json'), JSON.stringify(body, null, 2))

      const content = body.content as any[]
      // paragraph[6] — grade 11.3 + tricolon
      // Original: "The acanthus motif scales well, reads clearly in paint or pen, and frames text
      //            without overwhelming it. Simpler starting points include vine-scroll, geometric
      //            interlace, and simple floral repeats. Johnston's Writing and Illuminating and
      //            Lettering illustrates all of these in public-domain plates."
      // Fix: drop one tricolon arm; shorten sentences
      const p6 = content[6]
      if (p6?.type === 'paragraph') {
        p6.content = [
          makeTextNode(
            'The acanthus motif scales well and reads clearly in paint or pen. ' +
            'Simpler starting points include vine-scroll, geometric interlace, and plain floral repeats. ' +
            "Johnston's Writing and Illuminating and Lettering shows all three in its plates."
          ),
        ]
      }

      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body, voiceRetrofittedAt: new Date() },
      })
      console.log(slug + ': updated')
    }
  }

  // ─── 3. maintaining-copperplate-slant — replace scaffold list item ───────
  {
    const slug = 'maintaining-copperplate-slant'
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
    if (!t) { console.log(slug + ': not found'); } else {
      const body = t.body as any
      writeFileSync(resolve(snapshotDir, slug + '.before.json'), JSON.stringify(body, null, 2))

      const content = body.content as any[]
      // orderedList[11][0] — scaffold text "Step-by-step instructions for ... go here."
      // Replace with 5 real method steps (grade 6-8)
      const ol11 = content[11]
      if (ol11?.type === 'orderedList') {
        ol11.content = [
          makeListItem('Rule slant lines at 54 degrees across your practice sheet, spaced about 5 mm apart.'),
          makeListItem('Load the nib and draw one shade stroke per interval, running from x-height to baseline with full pressure. Each stroke must follow a slant line.'),
          makeListItem('Step back and check the row. If more than three in ten strokes drift from the guide, repeat the drill until the angle feels natural.'),
          makeListItem('When writing on a good sheet, tape a printed 54-degree guide beneath tracing paper so the slant lines stay off the finished piece.'),
          makeListItem("Hold the finished page at arm's length and sight along the downstrokes. If they look uneven, lay a clear ruler against successive letterforms to measure the drift."),
        ]
      }

      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body, voiceRetrofittedAt: new Date() },
      })
      console.log(slug + ': updated')
    }
  }

  console.log('\nDone. Snapshots saved to ' + snapshotDir)
}

main().finally(() => prisma.$disconnect().catch(() => {}))
