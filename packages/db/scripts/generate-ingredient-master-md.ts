/**
 * Generates `docs/ingredient-master.md` from `data/ingredients.ts`.
 *
 * The TypeScript file is the source of truth. The markdown is a generated
 * human-readable view. Edit the TS, run this script, commit both.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/generate-ingredient-master-md.ts
 */

import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { INGREDIENTS } from './data/ingredients.js'
import type { IngredientSeed } from './data/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../../..', 'docs', 'ingredient-master.md')

const CATEGORY_ORDER = [
  'flour', 'dairy', 'meat', 'fish', 'vegetable', 'fruit', 'herb', 'spice',
  'condiment', 'baking', 'pulse', 'grain', 'nut', 'seed', 'oil', 'sweetener',
  'alcohol', 'other',
]

const CATEGORY_HEADINGS: Record<string, string> = {
  flour: 'Flours',
  dairy: 'Dairy and eggs',
  meat: 'Meat',
  fish: 'Fish and shellfish',
  vegetable: 'Vegetables',
  fruit: 'Fruit',
  herb: 'Herbs',
  spice: 'Spices',
  condiment: 'Condiments, sauces, and vinegars',
  baking: 'Baking',
  pulse: 'Pulses',
  grain: 'Grains and pasta',
  nut: 'Nuts',
  seed: 'Seeds',
  oil: 'Oils and fats',
  sweetener: 'Sweeteners',
  alcohol: 'Alcohol',
  other: 'Other',
}

function flagBadges(row: IngredientSeed): string {
  if (row.dietaryFlags.length === 0) return '—'
  return row.dietaryFlags.join(', ')
}

function allergenLabel(row: IngredientSeed): string {
  if (!row.isAllergen) return '—'
  return row.allergenType ?? 'yes'
}

function render(): string {
  const lines: string[] = []

  lines.push('# Master ingredient list')
  lines.push('')
  lines.push(
    'Generated from `packages/db/scripts/data/ingredients.ts` — that file is the',
  )
  lines.push(
    'source of truth, the database upsert reads it directly. Run',
  )
  lines.push(
    '`pnpm --filter "@homemade/db" exec tsx scripts/generate-ingredient-master-md.ts`',
  )
  lines.push('to regenerate this view after editing.')
  lines.push('')
  lines.push(
    `Counts: ${INGREDIENTS.length} ingredients across ${new Set(INGREDIENTS.map((i) => i.category)).size} categories.`,
  )
  lines.push('')
  lines.push(
    'UK conventions throughout — "plain flour" not "all-purpose flour",',
  )
  lines.push(
    '"coriander" not "cilantro". US and regional names live in the aliases column.',
  )
  lines.push('')
  lines.push(
    'Dietary flags are per-ingredient; recipes AND-derive their own flags at',
  )
  lines.push(
    'index time from the ingredients they use. Halal and kosher are not applied',
  )
  lines.push(
    'at ingredient level — those depend on slaughter or certification context',
  )
  lines.push('and are set on the recipe by the author.')
  lines.push('')

  const grouped = new Map<string, IngredientSeed[]>()
  for (const row of INGREDIENTS) {
    if (!grouped.has(row.category)) grouped.set(row.category, [])
    grouped.get(row.category)!.push(row)
  }

  for (const cat of CATEGORY_ORDER) {
    const rows = grouped.get(cat)
    if (!rows || rows.length === 0) continue
    const heading = CATEGORY_HEADINGS[cat] ?? cat
    lines.push(`## ${heading}`)
    lines.push('')
    lines.push(`${rows.length} entries.`)
    lines.push('')
    lines.push('| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |')
    lines.push('| --- | --- | --- | --- | --- | --- | --- |')

    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name))
    for (const row of sorted) {
      const aliases = row.aliases.length > 0 ? row.aliases.join(', ') : '—'
      const notes = (row.notes ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|')
      lines.push(
        `| ${row.name} | \`${row.slug}\` | ${aliases} | ${row.defaultUnit} | ${flagBadges(row)} | ${allergenLabel(row)} | ${notes} |`,
      )
    }
    lines.push('')
  }

  return lines.join('\n') + '\n'
}

async function main(): Promise<void> {
  const md = render()
  await writeFile(OUTPUT_PATH, md, 'utf8')
  console.log(`[generate-ingredient-master-md] wrote ${OUTPUT_PATH} (${md.length} bytes)`)
}

main().catch((err) => {
  console.error('[generate-ingredient-master-md] failed:', err)
  process.exit(1)
})
