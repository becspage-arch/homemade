import { readFileSync, writeFileSync } from 'node:fs'

// Dependency-free env loader (apps/web has no dotenv; importing it breaks the
// production type-check). Reads KEY=VALUE lines without shell interpretation.
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    // env already provided by the shell
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import { prisma, parsePatternData } from '@homemade/db'
import { runSpecBatch } from '@/lib/studio/generation/autopilot'
import type { Spec } from '@/lib/studio/generation/spec'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'
import sharp from 'sharp'

/**
 * Generate cross-stitch patterns from a JSON specs file through the production
 * generation library (runSpecBatch → REVIEW state) and render a proof PNG per
 * pattern for the Claude vision gate.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/xs-gen-from-json.ts <specs.json> [category] [slugFilter...]
 *
 * `category` defaults to cross-stitch. Spec shapes: see
 * `apps/web/src/lib/studio/generation/spec.ts`.
 */
async function renderProof(slug: string, id: string): Promise<void> {
  const row = await prisma.pattern.findUnique({ where: { id }, select: { data: true } })
  if (!row) return
  const data = parsePatternData(row.data)
  const bb = stitchedBoundingBox(data)
  const mg = 2
  const region = bb
    ? {
        x: Math.max(0, bb.minX - mg),
        y: Math.max(0, bb.minY - mg),
        width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg),
        height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg),
      }
    : undefined
  const rw = region?.width ?? data.grid.width
  const cp = rw <= 120 ? 12 : 9
  const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx: cp, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cp * 0.8), region })
  writeFileSync(`C:/tmp/${slug}.png`, await sharp(Buffer.from(svg)).resize(680, 680, { fit: 'inside', background: { r: 245, g: 240, b: 232 } }).png().toBuffer())
}

async function main() {
  const [file, maybeCategory, ...rest] = process.argv.slice(2)
  if (!file) {
    console.error('usage: xs-gen-from-json <specs.json> [category] [slugFilter...]')
    process.exit(1)
  }
  const category = maybeCategory && !maybeCategory.endsWith('.json') ? maybeCategory : 'cross-stitch'
  const filter = (maybeCategory && maybeCategory.endsWith('.json') ? [maybeCategory, ...rest] : rest).filter(Boolean)
  let specs = JSON.parse(readFileSync(file, 'utf8')) as Spec[]
  if (filter.length) specs = specs.filter((s) => filter.includes(s.slug))
  console.log(`Generating ${specs.length} ${category} patterns from ${file}...`)
  const results = await runSpecBatch(category, specs)
  for (const r of results) {
    if (!r.ok) { console.log(`  [FAIL] ${r.slug.padEnd(28)} ${r.error}`); continue }
    console.log(`  [${r.held ? 'HOLD' : 'ok'}] ${r.slug.padEnd(28)} ${r.size} ${String(r.colours).padStart(2)}col  ${r.reasons.join('; ')}`)
    if (r.id) await renderProof(r.slug, r.id)
  }
  const ok = results.filter((r) => r.ok).length
  console.log(`\nDone: ${ok}/${results.length} generated into REVIEW. Proofs at C:/tmp/<slug>.png`)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1) })
