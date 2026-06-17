/**
 * Mechanical voice fix for the published crochet teaching library: strip em/en
 * dashes from sourceNotes citation lines (the dominant voice-gate error), and
 * from any body text leaf (none expected, but safe). Replaces " — " / "–" with
 * ", " and tidies the result. Snapshots a TutorialVersion before each write.
 *
 * Grade-level paragraphs and stray banned words are NOT touched here — they
 * need real rewriting and are handled by hand.
 *
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/fix-crochet-teaching-voice.ts [--apply]
 * Without --apply it is a dry run (reports what would change).
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 8; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

function fixDashes(s: string): string {
  return s
    .replace(/\s*[—–]\s*/g, ', ')   // em/en dash (with surrounding space) -> comma
    .replace(/\s{2,}/g, ' ')         // collapse double spaces
    .replace(/\s+,/g, ',')           // " ," -> ","
    .replace(/,\s*,/g, ',')          // ",," -> ","
    .trim()
}

interface Node { type?: string; text?: string; content?: Node[]; attrs?: Record<string, unknown> }
function fixBodyDashes(body: unknown): { body: unknown; changed: boolean } {
  let changed = false
  const walk = (n: Node): Node => {
    let node = n
    if (typeof node.text === 'string' && /[—–]/.test(node.text)) {
      node = { ...node, text: fixDashes(node.text) }
      changed = true
    }
    if (Array.isArray(node.content)) node = { ...node, content: node.content.map(walk) }
    return node
  }
  const out = body && typeof body === 'object' ? walk(body as Node) : body
  return { body: out, changed }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const { prisma, Prisma } = await import('../src/index.js')
  const cat = await prisma.category.findUnique({ where: { slug: 'crochet' } })
  if (!cat) { console.log('no crochet category'); return }
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })

  const rows = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, type: { in: ['STITCH', 'TECHNIQUE', 'READING'] }, status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, sourceNotes: true, status: true },
  })

  let changedCount = 0
  for (const r of rows) {
    const newSource = r.sourceNotes && /[—–]/.test(r.sourceNotes) ? fixDashes(r.sourceNotes) : r.sourceNotes
    const { body: newBody, changed: bodyChanged } = fixBodyDashes(r.body)
    const sourceChanged = newSource !== r.sourceNotes
    if (!sourceChanged && !bodyChanged) continue
    changedCount++
    console.log(`${apply ? 'FIX' : 'WOULD FIX'} ${r.slug}${sourceChanged ? ' [sourceNotes]' : ''}${bodyChanged ? ' [body]' : ''}`)
    if (apply) {
      if (author) {
        await prisma.tutorialVersion.create({
          data: {
            tutorialId: r.id, title: r.title, subtitle: r.subtitle, excerpt: r.excerpt,
            body: r.body as Prisma.InputJsonValue,
            status: r.status, authorId: author.id, changeNote: 'Mechanical voice pass: em/en dash removal',
          },
        })
      }
      await prisma.tutorial.update({
        where: { id: r.id },
        data: {
          sourceNotes: newSource ?? null,
          body: newBody as Prisma.InputJsonValue,
        },
      })
    }
  }
  console.log(`\n${apply ? 'Applied' : 'Dry run'}: ${changedCount}/${rows.length} rows ${apply ? 'fixed' : 'would change'}.`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
