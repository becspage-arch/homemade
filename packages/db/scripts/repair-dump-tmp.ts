/**
 * Throwaway: dump all broken recipe bodies into a single JSON file
 * so the worker can iterate without paying tsx startup per slug.
 * Used once during the 2026-05-28 repair pass. Delete when done.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
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

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
}

function collectText(node: TipTapNode | undefined): string {
  if (!node) return ''
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(collectText).join('')
}

interface DumpEntry {
  slug: string
  category: string
  title: string
  excerpt: string | null
  servings: number | null
  scalable: boolean
  blockCount: number
  blockLabels: string[]
  body: string
}

function bodyToText(content: TipTapNode[]): { text: string; blockLabels: string[] } {
  const out: string[] = []
  const labels: string[] = []
  let lastHeading = ''
  for (const node of content) {
    const txt = collectText(node)
    if (node.type === 'heading') {
      const level = (node.attrs?.level as number | undefined) ?? 2
      const headingText = txt.trim()
      lastHeading = headingText
      out.push(`${'#'.repeat(level)} ${headingText}`)
    } else if (node.type === 'paragraph') {
      if (txt.trim()) out.push(txt)
    } else if (node.type === 'orderedList' || node.type === 'bulletList') {
      const marker = node.type === 'orderedList' ? '1.' : '-'
      for (const li of node.content ?? []) {
        out.push(`${marker} ${collectText(li).trim()}`)
      }
    } else if (node.type === 'ingredientsList') {
      const itemCount = Array.isArray(node.attrs?.items) ? (node.attrs.items as unknown[]).length : 0
      labels.push(lastHeading)
      out.push(`[ingredientsList #${labels.length} — ${itemCount} items — label: "${lastHeading}"]`)
    }
  }
  return { text: out.join('\n'), blockLabels: labels }
}

async function main(): Promise<void> {
  const outPath = process.argv[2]
  if (!outPath) {
    console.error('Usage: tsx scripts/repair-dump-tmp.ts <out.json>')
    process.exit(1)
  }
  const { prisma, TutorialStatus, TutorialType } = await import('@homemade/db')
  const broken = await prisma.tutorial.findMany({
    where: {
      type: TutorialType.RECIPE,
      status: TutorialStatus.PUBLISHED,
      recipeIngredients: { none: {} },
    },
    orderBy: [{ category: { slug: 'asc' } }, { slug: 'asc' }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      servings: true,
      scalable: true,
      category: { select: { slug: true } },
      body: true,
    },
  })
  const dump: DumpEntry[] = []
  for (const r of broken) {
    const body = r.body as TipTapNode | null
    const { text, blockLabels } = bodyToText(body?.content ?? [])
    dump.push({
      slug: r.slug,
      category: r.category.slug,
      title: r.title,
      excerpt: r.excerpt,
      servings: r.servings,
      scalable: r.scalable,
      blockCount: blockLabels.length,
      blockLabels,
      body: text,
    })
  }
  writeFileSync(outPath, JSON.stringify(dump, null, 2), 'utf-8')
  console.error(`Wrote ${dump.length} entries to ${outPath}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
