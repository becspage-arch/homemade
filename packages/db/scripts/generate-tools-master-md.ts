/**
 * Generates `docs/tools-master.md` from `data/tools.ts`.
 *
 * The TypeScript file is the source of truth. Edit the TS, run this script,
 * commit both.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/generate-tools-master-md.ts
 */

import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from './data/tools.js'
import type { ToolSeed } from './data/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../../..', 'docs', 'tools-master.md')

const CATEGORY_ORDER = [
  'knife', 'pan', 'pot', 'oven', 'mixer', 'processor', 'measuring', 'bowl',
  'tray', 'tin', 'board', 'utensil', 'appliance', 'electrical', 'thermometer',
  'scale', 'other',
]

const CATEGORY_HEADINGS: Record<string, string> = {
  knife: 'Knives',
  pan: 'Pans',
  pot: 'Pots',
  oven: 'Ovens and ancillary',
  mixer: 'Mixers and whisks',
  processor: 'Processors and blenders',
  measuring: 'Measuring and decorating',
  bowl: 'Bowls',
  tray: 'Trays and racks',
  tin: 'Tins and moulds',
  board: 'Boards',
  utensil: 'Utensils',
  appliance: 'Appliances',
  electrical: 'Electricals',
  thermometer: 'Thermometers',
  scale: 'Scales',
  other: 'Other',
}

function formatPrice(pennies: number | undefined): string {
  if (pennies === undefined) return '—'
  const pounds = pennies / 100
  return pounds >= 100 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`
}

function render(): string {
  const lines: string[] = []

  lines.push('# Master tools list')
  lines.push('')
  lines.push(
    'Generated from `packages/db/scripts/data/tools.ts` — that file is the',
  )
  lines.push(
    'source of truth, the database upsert reads it directly. Run',
  )
  lines.push(
    '`pnpm --filter "@homemade/db" exec tsx scripts/generate-tools-master-md.ts`',
  )
  lines.push('to regenerate this view after editing.')
  lines.push('')
  lines.push(
    `Counts: ${TOOLS.length} tools across ${new Set(TOOLS.map((t) => t.category)).size} categories.`,
  )
  lines.push('')
  lines.push(
    '`isPurchasable: false` marks kitchen fixtures (oven, hob, sink) so the',
  )
  lines.push(
    'Phase 7 marketplace can filter them out of the buy panel. `typicalPriceGbp`',
  )
  lines.push(
    'is in pounds-and-pence; skip when uncertain — a missing price beats a wrong one.',
  )
  lines.push('')

  const grouped = new Map<string, ToolSeed[]>()
  for (const row of TOOLS) {
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
    lines.push('| Name | Slug | Aliases | Buy | Typical price | Notes |')
    lines.push('| --- | --- | --- | --- | --- | --- |')

    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name))
    for (const row of sorted) {
      const aliases = row.aliases.length > 0 ? row.aliases.join(', ') : '—'
      const buy = row.isPurchasable ? 'yes' : 'fixture'
      const price = formatPrice(row.typicalPriceGbp)
      const notes = (row.notes ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|')
      lines.push(
        `| ${row.name} | \`${row.slug}\` | ${aliases} | ${buy} | ${price} | ${notes} |`,
      )
    }
    lines.push('')
  }

  return lines.join('\n') + '\n'
}

async function main(): Promise<void> {
  const md = render()
  await writeFile(OUTPUT_PATH, md, 'utf8')
  console.log(`[generate-tools-master-md] wrote ${OUTPUT_PATH} (${md.length} bytes)`)
}

main().catch((err) => {
  console.error('[generate-tools-master-md] failed:', err)
  process.exit(1)
})
