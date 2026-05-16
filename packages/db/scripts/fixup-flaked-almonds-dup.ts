/**
 * One-off: collapse duplicate `flaked-almonds` Ingredient into the canonical
 * `almonds-flaked`. The duplicate was created by an autopilot worker that
 * didn't notice the existing alias (`slivered almonds`).
 *
 * Affected rows (verified 2026-05-16, both PUBLISHED):
 *   - florentines              — 100 g flaked almonds
 *   - pear-frangipane-tart     — 30 g flaked almonds (scattered)
 *
 * Steps:
 *   1. Snapshot a TutorialVersion of each affected tutorial.
 *   2. Walk each tutorial body JSON, rewrite every `"ingredientSlug":
 *      "flaked-almonds"` → `"almonds-flaked"`.
 *   3. Update each `RecipeIngredient` row's `ingredientId` to point at the
 *      canonical Ingredient row.
 *   4. Delete the duplicate Ingredient row.
 *   5. Re-sync the two tutorials into Typesense.
 *
 * Run:
 *   pnpm exec tsx scripts/fixup-flaked-almonds-dup.ts            (dry-run by default)
 *   pnpm exec tsx scripts/fixup-flaked-almonds-dup.ts --apply
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

import { prisma } from '../src/index.js'
import type { Prisma } from '@prisma/client'

const DUP_SLUG = 'flaked-almonds'
const CANON_SLUG = 'almonds-flaked'

interface BodyNode {
  type?: string
  attrs?: Record<string, unknown> | null
  content?: BodyNode[]
  marks?: Array<{ type: string; attrs?: Record<string, unknown> | null }>
  text?: string
}

function rewriteIngredientSlugs(node: BodyNode, from: string, to: string): number {
  let count = 0
  if (node.attrs && typeof node.attrs === 'object') {
    for (const key of Object.keys(node.attrs)) {
      const val = node.attrs[key]
      if (typeof val === 'string' && val === from && key === 'ingredientSlug') {
        node.attrs[key] = to
        count++
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object' && 'ingredientSlug' in item) {
            const obj = item as Record<string, unknown>
            if (obj.ingredientSlug === from) {
              obj.ingredientSlug = to
              count++
            }
          }
        }
      }
    }
  }
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      count += rewriteIngredientSlugs(child, from, to)
    }
  }
  return count
}

async function main() {
  const apply = process.argv.includes('--apply')

  const dup = await prisma.ingredient.findUnique({ where: { slug: DUP_SLUG } })
  const canon = await prisma.ingredient.findUnique({ where: { slug: CANON_SLUG } })
  if (!dup) throw new Error(`Duplicate slug ${DUP_SLUG} not found — nothing to do.`)
  if (!canon) throw new Error(`Canonical slug ${CANON_SLUG} not found — migration impossible.`)

  console.log(`Duplicate:  ${dup.slug} (id ${dup.id})`)
  console.log(`Canonical:  ${canon.slug} (id ${canon.id})`)
  console.log(`Mode:       ${apply ? 'APPLY' : 'dry-run (use --apply to write)'}`)
  console.log('')

  const affected = await prisma.recipeIngredient.findMany({
    where: { ingredientId: dup.id },
    select: {
      id: true,
      tutorialId: true,
      tutorial: { select: { slug: true, status: true, body: true } },
    },
  })
  console.log(`RecipeIngredient rows: ${affected.length}`)

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  for (const row of affected) {
    const body = row.tutorial.body as BodyNode | null
    if (!body) {
      console.log(`  ${row.tutorial.slug}: no body, only RecipeIngredient row will be updated`)
      continue
    }
    const clone = JSON.parse(JSON.stringify(body)) as BodyNode
    const rewrites = rewriteIngredientSlugs(clone, DUP_SLUG, CANON_SLUG)
    console.log(`  ${row.tutorial.slug} (${row.tutorial.status}): ${rewrites} body rewrite(s)`)
    if (!apply) continue

    await prisma.tutorialVersion.create({
      data: {
        tutorialId: row.tutorialId,
        title: '(pre-fixup-flaked-almonds)',
        subtitle: null,
        excerpt: null,
        body: body as Prisma.InputJsonValue,
        status: row.tutorial.status,
        authorId: author.id,
        changeNote: `Pre-fixup snapshot — collapsing ${DUP_SLUG} into ${CANON_SLUG}`,
      },
    })

    await prisma.tutorial.update({
      where: { id: row.tutorialId },
      data: { body: clone as unknown as Prisma.InputJsonValue },
    })

    await prisma.recipeIngredient.update({
      where: { id: row.id },
      data: { ingredientId: canon.id },
    })
  }

  if (apply) {
    // Sanity: no rows should still point at the duplicate.
    const remaining = await prisma.recipeIngredient.count({ where: { ingredientId: dup.id } })
    if (remaining > 0) {
      throw new Error(`Still ${remaining} RecipeIngredient row(s) on duplicate — aborting delete.`)
    }
    await prisma.ingredient.delete({ where: { id: dup.id } })
    console.log(`\nDeleted Ingredient ${DUP_SLUG} (id ${dup.id}).`)
  }

  await prisma.$disconnect()
  console.log(apply ? '\nApplied.' : '\nDry-run done. Pass --apply to write.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
