/**
 * Targeted ingredients repair for the 2026-05-14 → 2026-05-20 broken
 * batch (~392 baking + cooking recipes that shipped with empty
 * ingredientsList blocks). Companion to the publish-gate added to
 * upload-tutorial-types.ts so this kind of regression can't recur.
 *
 * Usage (worker session loops these per slug):
 *
 *   # 1. Get the list of broken slugs (one per line)
 *   pnpm --filter @homemade/db exec tsx scripts/repair-recipe-ingredients.ts --list
 *
 *   # 2. Inspect a single recipe — prints title + method prose so the
 *   #    worker can infer ingredients
 *   pnpm --filter @homemade/db exec tsx scripts/repair-recipe-ingredients.ts \
 *     --inspect <slug>
 *
 *   # 3. Apply a repair — reads JSON from stdin with the populated items,
 *   #    splices an ingredientsList block into the body (replacing the
 *   #    existing empty one if present), and re-syncs RecipeIngredient
 *   #    rows. Skips the heavy upload-tutorial pipeline (no hero work,
 *   #    no glossary changes, no slug resolution — just ingredients).
 *   echo '{"defaultServings": 4, "items": [...]}' | \
 *     pnpm --filter @homemade/db exec tsx scripts/repair-recipe-ingredients.ts \
 *       --apply <slug>
 *
 *   # 4. Check missing master-table slugs before applying
 *   pnpm --filter @homemade/db exec tsx scripts/repair-recipe-ingredients.ts \
 *     --check-slugs '<comma,separated,slugs>'
 *
 * Reads DATABASE_URL from .env.credentials at the repo root (walks up
 * from this file).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Walk up for .env.credentials (same pattern as upload-tutorial.ts).
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

interface IngredientsListItem {
  ingredientSlug: string
  amount: number | null
  unit: string | null
  prepNote?: string | null
  isOptional?: boolean
  groupLabel?: string | null
}

interface ApplyPayloadSingle {
  defaultServings: number | null
  items: IngredientsListItem[]
  blocks?: never
}

interface ApplyPayloadMulti {
  defaultServings: number | null
  items?: never
  blocks: Array<{ items: IngredientsListItem[] }>
}

type ApplyPayload = ApplyPayloadSingle | ApplyPayloadMulti

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const cmd = args[0]
  if (!cmd) {
    printUsage()
    process.exit(1)
  }

  const { prisma, TutorialStatus, TutorialType } = await import('@homemade/db')

  if (cmd === '--list') {
    const broken = await prisma.tutorial.findMany({
      where: {
        type: TutorialType.RECIPE,
        status: TutorialStatus.PUBLISHED,
        recipeIngredients: { none: {} },
      },
      orderBy: [{ category: { slug: 'asc' } }, { slug: 'asc' }],
      select: { slug: true, category: { select: { slug: true } } },
    })
    for (const r of broken) {
      // Output the FULL path so the worker can grep by category if needed.
      console.log(`${r.category.slug}/${r.slug}`)
    }
    await prisma.$disconnect()
    return
  }

  if (cmd === '--inspect') {
    const slug = args[1]
    if (!slug) {
      console.error('--inspect requires a slug (or category/slug path).')
      process.exit(1)
    }
    const justSlug = slug.includes('/') ? slug.split('/').pop()! : slug
    const t = await prisma.tutorial.findFirst({
      where: { slug: justSlug, type: TutorialType.RECIPE },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        servings: true,
        scalable: true,
        category: { select: { slug: true } },
        body: true,
      },
    })
    if (!t) {
      console.error(`Tutorial "${justSlug}" not found.`)
      process.exit(1)
    }
    console.log('===== TUTORIAL =====')
    console.log('slug:        ', t.slug)
    console.log('category:    ', t.category.slug)
    console.log('title:       ', t.title)
    console.log('excerpt:     ', t.excerpt)
    console.log('servings:    ', t.servings)
    console.log('scalable:    ', t.scalable)
    console.log('')
    console.log('===== BODY (orientation + method paragraphs) =====')
    const body = t.body as TipTapNode | null
    for (const node of body?.content ?? []) {
      const txt = collectText(node)
      if (node.type === 'heading') {
        const level = (node.attrs?.level as number | undefined) ?? 2
        console.log(`\n${'#'.repeat(level)} ${txt}`)
      } else if (node.type === 'paragraph') {
        console.log(txt)
      } else if (node.type === 'orderedList' || node.type === 'bulletList') {
        const marker = node.type === 'orderedList' ? '1.' : '-'
        for (const li of node.content ?? []) {
          console.log(`${marker} ${collectText(li)}`)
        }
      } else if (node.type === 'ingredientsList') {
        const itemCount = Array.isArray(node.attrs?.items) ? (node.attrs.items as unknown[]).length : 0
        console.log(`\n[ingredientsList block — currently ${itemCount} items]`)
      } else {
        console.log(`[${node.type}]`)
      }
    }
    await prisma.$disconnect()
    return
  }

  if (cmd === '--check-slugs') {
    const raw = args[1]
    if (!raw) {
      console.error('--check-slugs requires a comma-separated slug list.')
      process.exit(1)
    }
    const slugs = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const found = await prisma.ingredient.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, name: true, defaultUnit: true },
    })
    const foundSet = new Set(found.map((f) => f.slug))
    const missing = slugs.filter((s) => !foundSet.has(s))
    console.log('FOUND:')
    for (const f of found) console.log(`  ${f.slug.padEnd(40)} ${f.name} (default unit: ${f.defaultUnit ?? '—'})`)
    if (missing.length > 0) {
      console.log('MISSING:')
      for (const m of missing) console.log(`  ${m}`)
    } else {
      console.log('(all slugs resolved)')
    }
    await prisma.$disconnect()
    return
  }

  if (cmd === '--count-blocks') {
    const slug = args[1]
    if (!slug) {
      console.error('--count-blocks requires a slug.')
      process.exit(1)
    }
    const justSlug = slug.includes('/') ? slug.split('/').pop()! : slug
    const t = await prisma.tutorial.findFirst({
      where: { slug: justSlug, type: TutorialType.RECIPE },
      select: { body: true },
    })
    if (!t) {
      console.error(`Tutorial "${justSlug}" not found.`)
      process.exit(1)
    }
    const body = t.body as TipTapNode | null
    let n = 0
    for (const node of body?.content ?? []) {
      if (node?.type === 'ingredientsList') n++
    }
    console.log(n)
    await prisma.$disconnect()
    return
  }

  if (cmd === '--apply') {
    const slug = args[1]
    if (!slug) {
      console.error('--apply requires a slug.')
      process.exit(1)
    }
    const justSlug = slug.includes('/') ? slug.split('/').pop()! : slug

    // Read JSON payload from stdin.
    const stdinRaw = await readStdin()
    let payload: ApplyPayload
    try {
      payload = JSON.parse(stdinRaw)
    } catch (e) {
      console.error('Invalid JSON on stdin:', (e as Error).message)
      process.exit(1)
    }

    // Normalise payload to blocks[] form.
    let blocksIn: Array<{ items: IngredientsListItem[] }>
    if (Array.isArray(payload.blocks)) {
      blocksIn = payload.blocks
    } else if (Array.isArray(payload.items)) {
      blocksIn = [{ items: payload.items }]
    } else {
      console.error('Payload must include items[] OR blocks[] with at least one entry.')
      process.exit(1)
    }
    if (blocksIn.length === 0) {
      console.error('blocks[] must have at least one entry.')
      process.exit(1)
    }
    for (const b of blocksIn) {
      if (!Array.isArray(b.items) || b.items.length === 0) {
        console.error('Every block must include items[] with at least one entry.')
        process.exit(1)
      }
    }

    // Flatten for slug resolution.
    const allItems = blocksIn.flatMap((b) => b.items)
    const slugs = allItems.map((i) => i.ingredientSlug).filter(Boolean)
    const masterRows = await prisma.ingredient.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true, name: true, defaultUnit: true },
    })
    const masterBySlug = new Map(masterRows.map((r) => [r.slug, r]))
    const missing = Array.from(new Set(slugs.filter((s) => !masterBySlug.has(s))))
    if (missing.length > 0) {
      console.error(
        `Missing ingredient slugs in master table: ${missing.join(', ')}. ` +
          `Add them to packages/db/scripts/data/ingredients.ts and reseed, then retry.`,
      )
      process.exit(2)
    }

    function populate(raw: IngredientsListItem): {
      ingredientId: string
      ingredientSlug: string
      name: string
      amount: number | null
      unit: string | null
      prepNote: string | null
      isOptional: boolean
      groupLabel: string | null
    } {
      const master = masterBySlug.get(raw.ingredientSlug)!
      return {
        ingredientId: master.id,
        ingredientSlug: master.slug,
        name: master.name,
        amount: typeof raw.amount === 'number' ? raw.amount : null,
        unit: raw.unit ?? master.defaultUnit ?? null,
        prepNote: raw.prepNote ?? null,
        isOptional: raw.isOptional === true,
        groupLabel: raw.groupLabel ?? null,
      }
    }

    // Load the existing body.
    const t = await prisma.tutorial.findFirst({
      where: { slug: justSlug, type: TutorialType.RECIPE },
      select: { id: true, body: true, servings: true },
    })
    if (!t) {
      console.error(`Tutorial "${justSlug}" not found.`)
      process.exit(1)
    }
    const doc = (t.body as TipTapNode | null) ?? { type: 'doc', content: [] }
    if (!doc.content) doc.content = []

    const defaultServings = payload.defaultServings ?? t.servings ?? null

    // Find every existing ingredientsList block.
    const existingIdx: number[] = []
    for (let i = 0; i < doc.content.length; i++) {
      if (doc.content[i]?.type === 'ingredientsList') existingIdx.push(i)
    }

    if (existingIdx.length > 0 && existingIdx.length !== blocksIn.length) {
      console.error(
        `Body has ${existingIdx.length} ingredientsList block(s) but payload provides ${blocksIn.length}. ` +
          `Use --count-blocks <slug> to check and supply a matching blocks[] payload.`,
      )
      process.exit(3)
    }

    const populatedBlocks = blocksIn.map((b) => b.items.map(populate))

    if (existingIdx.length > 0) {
      // Replace each existing block in order.
      for (let k = 0; k < existingIdx.length; k++) {
        const items = populatedBlocks[k]
        doc.content[existingIdx[k]!] = {
          type: 'ingredientsList',
          attrs: { defaultServings, items: items as unknown as Record<string, unknown>[] },
        }
      }
    } else {
      // No existing block — insert one (single block) before the first
      // "Method" heading, else append. Multi-block payloads must target a body
      // that already has the matching block scaffold.
      if (blocksIn.length > 1) {
        console.error(
          'Body has no existing ingredientsList block but payload provides multiple blocks. ' +
            'Apply via a single items[] (or hand-edit the body first to scaffold groups).',
        )
        process.exit(3)
      }
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
      if (methodIndex >= 0) {
        doc.content.splice(methodIndex, 0, newBlock)
      } else {
        doc.content.push(newBlock)
      }
    }

    // Flatten all items for the RecipeIngredient rows, preserving order
    // across blocks.
    const allPopulated = populatedBlocks.flat()

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

    console.log(`OK ${justSlug} — ${allPopulated.length} items applied across ${populatedBlocks.length} block(s)`)
    await prisma.$disconnect()
    return
  }

  printUsage()
  process.exit(1)
}

function printUsage(): void {
  console.error('Usage:')
  console.error('  --list                                List all broken recipe slugs')
  console.error('  --inspect <slug>                      Print title + method prose')
  console.error('  --count-blocks <slug>                 Print count of existing ingredientsList blocks')
  console.error('  --check-slugs <comma,separated>       Validate ingredient slugs against master')
  console.error('  --apply <slug>  < payload.json        Apply repair (JSON on stdin)')
}

function collectText(node: TipTapNode | undefined): string {
  if (!node) return ''
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(collectText).join('')
}

async function readStdin(): Promise<string> {
  return new Promise((resolveP, rejectP) => {
    let data = ''
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolveP(data))
    process.stdin.on('error', rejectP)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
