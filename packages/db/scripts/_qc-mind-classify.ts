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

type Node = { type?: string; text?: string; content?: Node[] }
function extractText(n: Node): string {
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(extractText).join('')
}
function walk(body: Node): Array<{ path: string; isPullQuote: boolean; text: string }> {
  const out: Array<{ path: string; isPullQuote: boolean; text: string }> = []
  const root = body
  if (!root || !Array.isArray(root.content)) return out
  for (let i = 0; i < root.content.length; i++) {
    const n = root.content[i]!
    if (n.type === 'paragraph' || n.type === 'blockquote') out.push({ path: `body > ${n.type}[${i}]`, isPullQuote: false, text: extractText(n) })
    else if (Array.isArray(n.content)) {
      const topIsPull = n.type === 'pullQuote'
      function deep(node: Node, p: string, inPull: boolean): void {
        if (!node) return
        if (node.type === 'paragraph' || node.type === 'blockquote') out.push({ path: p, isPullQuote: inPull, text: extractText(node) })
        if (Array.isArray(node.content)) node.content.forEach((c, j) => deep(c, `${p} > ${c.type ?? 'node'}[${j}]`, inPull || node.type === 'pullQuote'))
      }
      n.content.forEach((c, j) => deep(c, `body > ${n.type ?? 'node'}[${i}] > ${c.type ?? 'node'}[${j}]`, topIsPull))
    }
  }
  return out
}

// Heuristics for verbatim energy-statement content that must NOT be reworded.
function isVerbatim(text: string, isPullQuote: boolean): boolean {
  if (isPullQuote) return true
  const t = text.trim()
  if (/I deeply and completely accept myself/.test(t)) return true // EFT setup
  if (/there is something more solid underneath\.?$/.test(t)) return true // EFT setup variant
  if (/^(Top of head|Eyebrow|Side of eye|Under eye|Under nose|Chin|Collarbone|Under arm|Karate chop)\s*:/i.test(t)) return true // EFT tapping points
  if (/^I (allow|am|joyfully|release|choose|let|welcome|deserve|trust)\b/.test(t)) return true // affirmations
  if (/^This week,\s/i.test(t)) return true // weekly affirmation
  if (/release the belief that/i.test(t)) return true // release statement
  if (/find me easily\.?$/.test(t)) return true // affirmation tail
  return false
}
function isProvenance(text: string): boolean {
  return /homemade\.education|Gary Craig developed EFT|No single source|Drawn from .*research|cultural traditions|This version is secular/.test(text)
}

async function main() {
  const slugs: string[] = JSON.parse(readFileSync(process.argv[2], 'utf8'))
  const { prisma } = await import('../src/index.js')
  const fullyFixable: string[] = []
  const blocked: string[] = []
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!t) continue
    const paras = walk(t.body as Node)
    const flagged = paras.filter((p) => { const g = fleschKincaidGrade(p.text); return g !== null && g > 11 })
    const verb = flagged.filter((p) => isVerbatim(p.text, p.isPullQuote))
    const prov = flagged.filter((p) => !isVerbatim(p.text, p.isPullQuote) && isProvenance(p.text))
    const fixable = flagged.filter((p) => !isVerbatim(p.text, p.isPullQuote) && !isProvenance(p.text))
    if (verb.length === 0 && prov.length === 0 && fixable.length > 0) {
      fullyFixable.push(slug)
      console.log(`FIXABLE ${slug} — ${fixable.length} fixable para(s)`)
      for (const p of fixable) console.log(`   ${p.path} :: ${JSON.stringify(p.text).slice(0, 200)}`)
    } else {
      blocked.push(slug)
    }
  }
  console.log(`\nfully-fixable entries: ${fullyFixable.length}`)
  console.log(`entries with verbatim/provenance blockers (cannot clear): ${blocked.length}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
