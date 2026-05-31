/**
 * Dump full paragraph texts for BLOCK tutorials to enable manual rewrites.
 */
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
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

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

type TNode = { type?: string; text?: string; content?: TNode[]; attrs?: Record<string, unknown> }

function extractText(node: TNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

// Navigate a path like "body > orderedList[2] > listItem[3] > paragraph[0]"
// Returns the node at that path (null if not found)
function navigatePath(body: TNode, path: string): TNode | null {
  const parts = path.split(' > ').slice(1) // skip "body"
  let current: TNode | null = body
  for (const part of parts) {
    if (!current) return null
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (!m) {
      // No index — treat as type match on first child
      const children = Array.isArray(current.content) ? current.content : []
      current = children.find(c => c.type === part) ?? null
    } else {
      const [, nodeType, idxStr] = m
      const idx = parseInt(idxStr!, 10)
      const children = Array.isArray(current.content) ? current.content : []
      // Filter by type, then pick by index
      const matching = children.filter(c => c.type === nodeType!)
      current = matching[idx] ?? null
    }
  }
  return current
}

async function main() {
  const data = JSON.parse(readFileSync(repoPath('docs/qc-audit-2026-05-31.json'), 'utf8'))
  const nonMindset = data.verdicts.filter((v: { categorySlug: string }) => v.categorySlug !== 'mindset')

  for (const verdict of nonMindset) {
    const t = await prisma.tutorial.findUnique({
      where: { slug: verdict.slug },
      select: { body: true },
    })
    if (!t) continue

    const body = t.body as TNode
    for (const finding of verdict.findings.filter((f: { severity: string }) => f.severity === 'BLOCK')) {
      if (!finding.path) continue
      const node = navigatePath(body, finding.path)
      const text = node ? extractText(node) : '(navigation failed)'
      const grade = finding.message.match(/grade (\d+\.\d+)/)?.[1] ?? '?'
      console.log(`\n=== ${verdict.slug} [${finding.kind}] grade=${grade} ===`)
      console.log(`PATH: ${finding.path}`)
      console.log(`TEXT: ${text}`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
