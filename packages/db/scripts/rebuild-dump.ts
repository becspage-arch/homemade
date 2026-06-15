/**
 * Rebuild step 1 — dump a blocked DRAFT tutorial for repair.
 *
 * Writes the row's TipTap body to docs/rebuild-work/<slug>.json (so a Claude
 * rebuild session can Edit it directly), and prints a readable rendering plus
 * the recorded qcBlockReason so the editor knows exactly what to fix.
 *
 * Workflow:
 *   1. rebuild-dump.ts --slug <slug>      -> writes the body file + prints it
 *   2. (Edit docs/rebuild-work/<slug>.json — remove the scaffold "Method"
 *      section, spell out every truncated/repeated instruction in full, fix any
 *      NaN/undefined, ensure real Row/Round steps + coherent counts)
 *   3. rebuild-publish.ts --slug <slug>   -> gated re-publish
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/rebuild-dump.ts --slug crochet-granny-square-three-round
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

const WORK_DIR = resolve(__dirname, '..', 'docs', 'rebuild-work')

interface Node { type?: string; attrs?: Record<string, unknown>; content?: Node[]; text?: string }
function render(n: Node | undefined, depth = 0): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  const tag = n.type === 'heading' ? `\n${'#'.repeat((n.attrs?.level as number) ?? 2)} ` : n.type === 'paragraph' ? '\n' : ''
  if (n.type === 'orderedList' || n.type === 'bulletList') {
    return (n.content || []).map((c, i) => `\n  ${i + 1}. ${render(c).trim()}`).join('')
  }
  if (Array.isArray(n.content)) return tag + n.content.map((c) => render(c, depth)).join('')
  return tag
}

async function main() {
  const i = process.argv.indexOf('--slug')
  const slug = i >= 0 ? process.argv[i + 1] : null
  if (!slug) { console.error('Usage: rebuild-dump.ts --slug <slug>'); process.exit(1) }
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, title: true, type: true, status: true, excerpt: true, body: true, qcBlockReason: true, category: { select: { slug: true } } },
  })
  if (!t) { console.error(`not found: ${slug}`); process.exit(1) }
  mkdirSync(WORK_DIR, { recursive: true })
  const file = resolve(WORK_DIR, `${slug}.json`)
  writeFileSync(file, JSON.stringify(t.body, null, 2))
  console.log(`slug:     ${t.slug}`)
  console.log(`category: ${t.category.slug}   type: ${t.type}   status: ${t.status}`)
  console.log(`excerpt:  ${t.excerpt ?? ''}`)
  console.log(`qcBlockReason: ${JSON.stringify((t.qcBlockReason as { reasons?: string[] } | null)?.reasons ?? t.qcBlockReason)}`)
  console.log(`body file -> ${file}`)
  console.log('\n----- readable body -----')
  console.log(render(t.body as Node))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
