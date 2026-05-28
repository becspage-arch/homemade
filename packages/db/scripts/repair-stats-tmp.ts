/**
 * Throwaway: count ingredientsList blocks across all broken recipes
 * + extract per-block group-label sub-headings if any.
 * Used once during the 2026-05-28 repair pass. Delete when done.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
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

async function main(): Promise<void> {
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
      category: { select: { slug: true } },
      body: true,
    },
  })
  const lines: string[] = []
  let single = 0
  let multi = 0
  let multiBlockCounts: number[] = []
  for (const r of broken) {
    const body = r.body as TipTapNode | null
    const content = body?.content ?? []
    const labels: string[] = []
    let lastHeading = ''
    for (const node of content) {
      if (node.type === 'heading') {
        lastHeading = collectText(node).trim()
      }
      if (node.type === 'ingredientsList') {
        labels.push(lastHeading)
      }
    }
    const n = labels.length
    if (n <= 1) single++
    else {
      multi++
      multiBlockCounts.push(n)
    }
    lines.push(`${r.category.slug}/${r.slug}\t${n}\t${labels.join(' | ')}`)
  }
  console.log(lines.join('\n'))
  console.error(`\n--- SUMMARY ---`)
  console.error(`total: ${broken.length}`)
  console.error(`single-block: ${single}`)
  console.error(`multi-block: ${multi}`)
  const dist: Record<number, number> = {}
  for (const n of multiBlockCounts) dist[n] = (dist[n] ?? 0) + 1
  for (const [k, v] of Object.entries(dist)) {
    console.error(`  ${k}-block: ${v}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
