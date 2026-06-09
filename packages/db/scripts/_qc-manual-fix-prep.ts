import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

const slugs = [
  'calculating-stocking-rates',
  'choosing-sheep-breeds-for-a-small-flock',
  'composting-toilet-annual-maintenance',
  'external-wall-insulation-etics-installation',
  'fitting-a-thermostatic-bath-filler-tap',
  'borehole-water-supply-feasibility',
  'building-regs-part-l-retrofit-notification',
  'community-energy-co-op-joining',
  'flat-roof-cold-deck-remediation',
]

function extractText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  if (typeof node.attrs?.body === 'string') return node.attrs.body
  return ''
}

function findSnippet(body: any, snippet: string): string {
  const bodyStr = JSON.stringify(body)
  // Find the snippet in the full body JSON and extract surrounding context
  const idx = bodyStr.indexOf(snippet.slice(0, 40))
  if (idx === -1) return ''
  // Find the full paragraph text by looking for the surrounding text node
  // Walk all nodes and find the one containing the snippet
  const results: string[] = []
  function walk(node: any) {
    if (!node) return
    const text = extractText(node)
    if (text.includes(snippet.slice(0, 30)) && text.length > 10) {
      // Is this a leaf-ish node (paragraph or infoPanel)?
      if (node.type === 'paragraph' || node.type === 'infoPanel') {
        results.push(text)
      }
    }
    if (Array.isArray(node.content)) node.content.forEach(walk)
  }
  walk(body)
  return results[0] ?? ''
}

async function main() {
  // Walk up to repo root (where pnpm-workspace.yaml lives)
  let repoRoot = __dirname
  for (let d = 0; d < 12; d++) {
    if (existsSync(resolve(repoRoot, 'pnpm-workspace.yaml'))) break
    const parent = dirname(repoRoot); if (parent === repoRoot) break; repoRoot = parent
  }
  let auditPath = resolve(repoRoot, 'docs/qc-audit-2026-05-30.json')
  const audit = JSON.parse(readFileSync(auditPath, 'utf8'))

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true, title: true } })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }

    const verdict = audit.verdicts.find((v: any) => v.slug === slug)
    if (!verdict) { console.log(slug + ': no verdict'); continue }

    const realFindings = verdict.findings.filter((f: any) =>
      f.severity === 'BLOCK' && f.kind === 'grade-level-strict' &&
      (!f.snippet || !f.snippet.startsWith('Step-by-step instructions for'))
    )

    console.log(`\n=== ${slug} ===`)
    for (const f of realFindings) {
      const text = findSnippet(t.body, f.snippet ?? '')
      console.log('PATH:', f.path)
      console.log('SNIPPET:', JSON.stringify(f.snippet))
      console.log('FULL TEXT:', JSON.stringify(text || f.snippet))
      console.log()
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
