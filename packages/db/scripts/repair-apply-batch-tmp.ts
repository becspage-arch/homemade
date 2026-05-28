/**
 * Throwaway: batch-apply a JSONL of ingredient payloads, one recipe per
 * line. Each line is one of:
 *   {"slug": "afghans-biscuits", "category": "baking",
 *    "blocks": [{"items": [...]}, {"items": [...]}]}
 *   {"slug": "..", "category": "..", "items": [...]}
 *
 * Defaults defaultServings to the tutorial's servings field. Prints one
 * OK/FAIL line per slug and a summary at the end. Used during the
 * 2026-05-28 repair pass; delete when done.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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

interface PayloadItem {
  ingredientSlug: string
  amount: number | null
  unit?: string | null
  prepNote?: string | null
  isOptional?: boolean
  groupLabel?: string | null
}

interface PayloadLine {
  slug: string
  category?: string
  defaultServings?: number | null
  items?: PayloadItem[]
  blocks?: Array<{ items: PayloadItem[] }>
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
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: tsx scripts/repair-apply-batch-tmp.ts <payloads.jsonl>')
    process.exit(1)
  }
  const lines = readFileSync(file, 'utf-8').split('\n').filter((l) => l.trim().length > 0)
  console.error(`Loading ${lines.length} payloads from ${file}`)

  const { prisma, TutorialType } = await import('@homemade/db')

  // Fetch master ingredients once.
  const master = await prisma.ingredient.findMany({
    select: { id: true, slug: true, name: true, defaultUnit: true },
  })
  const masterBySlug = new Map(master.map((r) => [r.slug, r]))

  let ok = 0
  let fail = 0
  let totalItems = 0

  for (const raw of lines) {
    let p: PayloadLine
    try {
      p = JSON.parse(raw)
    } catch (e) {
      console.error(`SKIP — invalid JSON: ${(e as Error).message}`)
      fail++
      continue
    }
    if (!p.slug) {
      console.error('SKIP — missing slug')
      fail++
      continue
    }

    // Normalise to blocks form.
    let blocksIn: Array<{ items: PayloadItem[] }>
    if (Array.isArray(p.blocks)) {
      blocksIn = p.blocks
    } else if (Array.isArray(p.items)) {
      blocksIn = [{ items: p.items }]
    } else {
      console.error(`FAIL ${p.slug} — neither items[] nor blocks[]`)
      fail++
      continue
    }
    if (blocksIn.length === 0 || blocksIn.some((b) => !Array.isArray(b.items) || b.items.length === 0)) {
      console.error(`FAIL ${p.slug} — empty block`)
      fail++
      continue
    }

    // Validate slugs against the master cache.
    const allItems = blocksIn.flatMap((b) => b.items)
    const missing = Array.from(new Set(allItems.map((i) => i.ingredientSlug).filter((s) => !masterBySlug.has(s))))
    if (missing.length > 0) {
      console.error(`FAIL ${p.slug} — missing master slugs: ${missing.join(', ')}`)
      fail++
      continue
    }

    // Load the tutorial.
    const t = await prisma.tutorial.findFirst({
      where: { slug: p.slug, type: TutorialType.RECIPE },
      select: { id: true, body: true, servings: true },
    })
    if (!t) {
      console.error(`FAIL ${p.slug} — tutorial not found`)
      fail++
      continue
    }

    const doc = (t.body as TipTapNode | null) ?? { type: 'doc', content: [] }
    if (!doc.content) doc.content = []

    const defaultServings = p.defaultServings ?? t.servings ?? null

    // Find existing ingredientsList block indices.
    const existingIdx: number[] = []
    for (let i = 0; i < doc.content.length; i++) {
      if (doc.content[i]?.type === 'ingredientsList') existingIdx.push(i)
    }

    if (existingIdx.length > 0 && existingIdx.length !== blocksIn.length) {
      console.error(
        `FAIL ${p.slug} — body has ${existingIdx.length} blocks, payload has ${blocksIn.length}`,
      )
      fail++
      continue
    }
    if (existingIdx.length === 0 && blocksIn.length > 1) {
      console.error(
        `FAIL ${p.slug} — no existing block; multi-block payload requires scaffolding`,
      )
      fail++
      continue
    }

    function populate(rawItem: PayloadItem): {
      ingredientId: string
      ingredientSlug: string
      name: string
      amount: number | null
      unit: string | null
      prepNote: string | null
      isOptional: boolean
      groupLabel: string | null
    } {
      const m = masterBySlug.get(rawItem.ingredientSlug)!
      return {
        ingredientId: m.id,
        ingredientSlug: m.slug,
        name: m.name,
        amount: typeof rawItem.amount === 'number' ? rawItem.amount : null,
        unit: rawItem.unit ?? m.defaultUnit ?? null,
        prepNote: rawItem.prepNote ?? null,
        isOptional: rawItem.isOptional === true,
        groupLabel: rawItem.groupLabel ?? null,
      }
    }

    const populatedBlocks = blocksIn.map((b) => b.items.map(populate))

    if (existingIdx.length > 0) {
      for (let k = 0; k < existingIdx.length; k++) {
        doc.content[existingIdx[k]!] = {
          type: 'ingredientsList',
          attrs: { defaultServings, items: populatedBlocks[k] as unknown as Record<string, unknown>[] },
        }
      }
    } else {
      // No existing block; single new block — insert before "Method" heading.
      const items = populatedBlocks[0]!
      const newBlock: TipTapNode = {
        type: 'ingredientsList',
        attrs: { defaultServings, items: items as unknown as Record<string, unknown>[] },
      }
      let methodIndex = -1
      for (let i = 0; i < doc.content.length; i++) {
        const n = doc.content[i]
        if (n?.type === 'heading') {
          const txt = collectText(n).toLowerCase()
          if (/method/.test(txt)) {
            methodIndex = i
            break
          }
        }
      }
      if (methodIndex >= 0) doc.content.splice(methodIndex, 0, newBlock)
      else doc.content.push(newBlock)
    }

    const allPopulated = populatedBlocks.flat()
    try {
      await prisma.$transaction(async (tx) => {
        await tx.tutorial.update({
          where: { id: t.id },
          data: { body: doc as unknown as object },
        })
        await tx.recipeIngredient.deleteMany({ where: { tutorialId: t.id } })
        await tx.recipeIngredient.createMany({
          data: allPopulated.map((item, position) => ({
            tutorialId: t.id,
            position,
            ingredientId: item.ingredientId,
            amount: item.amount,
            unit: item.unit,
            prepNote: item.prepNote,
            isOptional: item.isOptional,
            groupLabel: item.groupLabel,
          })),
        })
      })
      console.log(`OK ${p.slug} — ${allPopulated.length} items in ${populatedBlocks.length} block(s)`)
      ok++
      totalItems += allPopulated.length
    } catch (e) {
      console.error(`FAIL ${p.slug} — db error: ${(e as Error).message}`)
      fail++
    }
  }

  console.error(`\n--- SUMMARY ---`)
  console.error(`ok: ${ok}`)
  console.error(`fail: ${fail}`)
  console.error(`total items applied: ${totalItems}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
