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

interface ApplyPayload {
  defaultServings: number | null
  items: IngredientsListItem[]
}

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
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      console.error('Payload must include items[] with at least one entry.')
      process.exit(1)
    }

    // Resolve every ingredient slug against the master table.
    const slugs = payload.items.map((i) => i.ingredientSlug).filter(Boolean)
    const masterRows = await prisma.ingredient.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true, name: true, defaultUnit: true },
    })
    const masterBySlug = new Map(masterRows.map((r) => [r.slug, r]))
    const missing = slugs.filter((s) => !masterBySlug.has(s))
    if (missing.length > 0) {
      console.error(
        `Missing ingredient slugs in master table: ${missing.join(', ')}. ` +
          `Add them to packages/db/scripts/data/ingredients.ts and reseed, then retry.`,
      )
      process.exit(2)
    }

    // Build the populated items[] for the body (with ingredientId and back-
    // filled name/unit where missing).
    const populatedItems = payload.items.map((raw) => {
      const master = masterBySlug.get(raw.ingredientSlug)!
      return {
        ingredientId: master.id,
        ingredientSlug: master.slug,
        name: typeof raw.unit === 'string' && raw.unit.length > 0
          ? master.name
          : master.name,
        amount: typeof raw.amount === 'number' ? raw.amount : null,
        unit: raw.unit ?? master.defaultUnit ?? null,
        prepNote: raw.prepNote ?? null,
        isOptional: raw.isOptional === true,
        groupLabel: raw.groupLabel ?? null,
      }
    })

    // Load the existing body and splice in the populated ingredientsList.
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
    const newBlock: TipTapNode = {
      type: 'ingredientsList',
      attrs: { defaultServings, items: populatedItems as unknown as Record<string, unknown>[] },
    }

    // Replace the first existing ingredientsList block (if any), else insert
    // before the first heading that says "Method", else append.
    let replaced = false
    for (let i = 0; i < doc.content.length; i++) {
      if (doc.content[i]?.type === 'ingredientsList') {
        doc.content[i] = newBlock
        replaced = true
        break
      }
    }
    if (!replaced) {
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

    // Apply: update body + delete-then-insert RecipeIngredient rows.
    await prisma.$transaction(async (tx) => {
      await tx.tutorial.update({
        where: { id: t.id },
        data: { body: doc as unknown as object },
      })
      await tx.recipeIngredient.deleteMany({ where: { tutorialId: t.id } })
      await tx.recipeIngredient.createMany({
        data: populatedItems.map((item, position) => ({
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

    console.log(`OK ${justSlug} — ${populatedItems.length} items applied`)
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
  console.error('  --check-slugs <comma,separated>       Validate ingredient slugs against master')
  console.error('  --apply <slug>  < items.json          Apply repair (JSON on stdin)')
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
