import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

type Node = { type?: string; text?: string; content?: Node[]; marks?: { type: string }[]; attrs?: Record<string, unknown> }

function extractText(n: Node): string {
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(extractText).join('')
}
function hasTooltip(n: Node): boolean {
  if (Array.isArray(n.marks) && n.marks.some((m) => m.type === 'glossaryTooltip')) return true
  if (Array.isArray(n.content)) return n.content.some(hasTooltip)
  return false
}
function specialMarks(n: Node): Set<string> {
  const s = new Set<string>()
  function w(x: Node) {
    if (Array.isArray(x.marks)) for (const m of x.marks) s.add(m.type)
    if (Array.isArray(x.content)) for (const c of x.content) w(c)
  }
  w(n)
  return s
}

function walk(body: Node): Array<{ path: string; node: Node }> {
  const out: Array<{ path: string; node: Node }> = []
  const root = body
  if (!root || !Array.isArray(root.content)) return out
  for (let i = 0; i < root.content.length; i++) {
    const n = root.content[i]!
    if (n.type === 'paragraph' || n.type === 'blockquote') {
      out.push({ path: `body > ${n.type}[${i}]`, node: n })
    } else if (Array.isArray(n.content)) {
      function deep(node: Node, p: string): void {
        if (!node) return
        if (node.type === 'paragraph' || node.type === 'blockquote') out.push({ path: p, node })
        if (Array.isArray(node.content)) node.content.forEach((c, j) => deep(c, `${p} > ${c.type ?? 'node'}[${j}]`))
      }
      n.content.forEach((c, j) => deep(c, `body > ${n.type ?? 'node'}[${i}] > ${c.type ?? 'node'}[${j}]`))
    }
  }
  return out
}

async function main() {
  const slugsArg = process.argv[2]
  const slugs: string[] = JSON.parse(readFileSync(slugsArg, 'utf8'))
  const { prisma } = await import('../src/index.js')
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true, type: true } })
    if (!t) { console.log(`\n### ${slug} — NOT FOUND`); continue }
    const paras = walk(t.body as Node)
    const flagged = paras.map((p) => ({ ...p, grade: fleschKincaidGrade(extractText(p.node)) }))
      .filter((p) => p.grade !== null && p.grade > 11)
    console.log(`\n### ${slug} ${(t as any).type} — ${flagged.length} flagged`)
    for (const f of flagged) {
      console.log(`  PATH ${f.path}`)
      console.log(`  GRADE ${f.grade!.toFixed(2)} | tooltip=${hasTooltip(f.node)} | marks=${[...specialMarks(f.node)].join(',')}`)
      console.log(`  TEXT ${JSON.stringify(extractText(f.node))}`)
    }
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
