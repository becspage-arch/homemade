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

type Node = { type?: string; text?: string; content?: Node[]; marks?: unknown[] }
type Run = { text: string; marks?: unknown[] }
type Edit = { path: number[]; runs: Run[] }
type Spec = { slug: string; edits: Edit[] }

function extractText(n: Node): string {
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(extractText).join('')
}
function nodeAt(body: Node, path: number[]): Node | null {
  let n: Node = body
  for (const i of path) {
    if (!n.content || !n.content[i]) return null
    n = n.content[i]!
  }
  return n
}

async function main() {
  const dry = process.argv.includes('--dry')
  const specPath = process.argv[2]
  const specs: Spec[] = JSON.parse(readFileSync(specPath, 'utf8'))
  const { prisma } = await import('../src/index.js')
  let written = 0
  const failed: string[] = []
  for (const spec of specs) {
    const t = await prisma.tutorial.findUnique({ where: { slug: spec.slug }, select: { body: true } })
    if (!t) { console.log(`MISS ${spec.slug} — not found`); failed.push(spec.slug); continue }
    const body = JSON.parse(JSON.stringify(t.body)) as Node
    let ok = true
    const report: string[] = []
    for (const e of spec.edits) {
      const node = nodeAt(body, e.path)
      if (!node || node.type !== 'paragraph') {
        report.push(`  [${e.path.join(',')}] NODE-MISS type=${node?.type}`)
        ok = false
        continue
      }
      node.content = e.runs.map((r) => ({ type: 'text', text: r.text, ...(r.marks ? { marks: r.marks } : {}) }))
      const g = fleschKincaidGrade(extractText(node))
      const pass = g === null || g <= 10.9
      if (!pass) ok = false
      report.push(`  [${e.path.join(',')}] grade=${g === null ? 'null' : g.toFixed(2)} ${pass ? 'OK' : 'STILL-HIGH'}`)
    }
    console.log(`${ok ? 'PASS' : 'FAIL'} ${spec.slug}`)
    for (const r of report) console.log(r)
    if (!ok) { failed.push(spec.slug); continue }
    if (!dry) {
      await prisma.tutorial.update({ where: { slug: spec.slug }, data: { body, voiceRetrofittedAt: new Date() } })
      written++
    }
  }
  console.log(`\n${dry ? '[DRY] ' : ''}written=${written} failed=${failed.length}${failed.length ? ' :: ' + failed.join(', ') : ''}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
