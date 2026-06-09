/**
 * Dump the failing source/provenance paragraphs from mindset tutorials.
 * Used to identify bulk-fixable patterns.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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
import { auditTutorial } from './qc-audit.js'

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: unknown[]
  content?: TipTapNode[]
  text?: string
}

function getNodeAtPath(root: TipTapNode, path: string): TipTapNode | null {
  // path like "body > paragraph[9]" or "body > bulletList[4] > listItem[0] > paragraph[0]"
  const parts = path.replace(/^body\s*>\s*/, '').split(/\s*>\s*/)
  let current: TipTapNode = root
  for (const part of parts) {
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (!m) return null
    const [, nodeType, idxStr] = m
    const idx = parseInt(idxStr!)
    const children = current.content ?? []
    const matches = children.filter(n => n.type === nodeType)
    if (idx >= matches.length) return null
    current = matches[idx]!
  }
  return current
}

function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', category: { slug: 'mindset' } },
    select: {
      id: true, slug: true, title: true, body: true, excerpt: true,
      subtitle: true, sourceNotes: true, difficulty: true,
      servings: true, yieldDescription: true, type: true,
      status: true, voiceRetrofittedAt: true, publishedAt: true,
      heroMediaId: true, revisedFrom: true,
      hero: { select: { id: true, r2Key: true, cloudflareId: true } },
      recipeIngredients: { select: { id: true, amount: true, unit: true, ingredientId: true } },
      recipeTools: { select: { id: true, toolId: true } },
      category: { select: { slug: true } },
    }
  })

  for (const t of tutorials) {
    const v = auditTutorial(t as any)
    const blockFinds = v.findings.filter(f => f.severity === 'BLOCK')
    if (blockFinds.length === 0) continue

    // Skip if any finding has a protected EFT statement
    const hasProtected = blockFinds.some(f => f.snippet && (
      f.snippet.startsWith('Even though') ||
      f.snippet.includes('I deeply and completely accept myself')
    ))
    if (hasProtected) continue

    for (const f of blockFinds) {
      if (f.path) {
        const node = getNodeAtPath(t.body as TipTapNode, f.path)
        const fullText = extractText(node)
        if (fullText.startsWith('Original to') || fullText.startsWith('Written for')) {
          console.log('=== ' + t.slug + ' === path: ' + f.path)
          console.log('FULL TEXT: ' + fullText)
          console.log('GRADE: ' + f.message.match(/grade [\d.]+/)?.[0])
          console.log('')
        }
      }
    }
  }

  await prisma.$disconnect()
}

main()
