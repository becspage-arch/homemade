/**
 * xs-tiers-measure — what one heirloom chart actually costs to carry.
 *
 * The showpiece tier is two hundred times the cells of a quick win, so the
 * question is not whether the pipeline can build one — it can — but what the
 * finished row weighs and how long each surface takes to draw it. This measures
 * the four that matter: the pattern JSON on the row, the persisted hero, the
 * working-chart SVG, and the printable PDF with its tiling and its paginated
 * floss key. Every number is measured, none is estimated.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx --conditions=react-server \
 *     scripts/xs-tiers-measure.ts <slug> [--pdf] [--out DIR]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    /* env from the shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import sharp from 'sharp'
import { prisma, parsePatternData, computePatternMetrics } from '@homemade/db'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { renderBeautyThumbnail } from '@/lib/studio/generation/bulk/beauty-thumbnail'
import { buildPatternPdf } from '@/lib/studio/pdf-export'
import { POST_SAT } from '@/lib/studio/generation/bulk/cross-stitch-style'

const kb = (n: number): string => `${(n / 1024).toFixed(0)} KB`
const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(2)} MB`
const secs = (ms: number): string => `${(ms / 1000).toFixed(1)}s`

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null
}

async function main(): Promise<void> {
  const slug = process.argv[2]
  if (!slug || slug.startsWith('--')) throw new Error('usage: xs-tiers-measure.ts <slug> [--pdf] [--out DIR]')
  const outDir = arg('--out') ?? '../../scratchpad/measure'
  mkdirSync(outDir, { recursive: true })

  const row = await prisma.pattern.findUnique({
    where: { slug },
    select: { name: true, data: true, thumbnail: { select: { bytes: true } } },
  })
  if (!row) throw new Error(`no pattern ${slug}`)
  const data = parsePatternData(row.data)
  const m = computePatternMetrics(data)

  console.log(`\n${slug}`)
  console.log(`  ${m.widthCells}×${m.heightCells} cells · ${m.colourCount} flosses · ${m.totalStitches.toLocaleString()} stitches`)
  console.log(
    `  stitchability ${m.stitchability} · confetti ${(m.confettiShare * 100).toFixed(1)}% · median run ${m.medianRunLength} · ${m.colourChangesPer100} colour changes / 100`,
  )

  const json = Buffer.byteLength(JSON.stringify(row.data))
  console.log(`\n  pattern JSON on the row      ${mb(json)}`)
  console.log(`  persisted hero (thumbnail)   ${kb(row.thumbnail?.bytes ?? 0)}`)

  // The hero, re-rendered, so the time is measured rather than remembered.
  let t = Date.now()
  const hero = await renderBeautyThumbnail(data, POST_SAT)
  console.log(`  hero render                  ${secs(Date.now() - t)}  → ${kb(hero.byteLength)}`)
  writeFileSync(`${outDir}/${slug}-hero.png`, hero)

  // The working chart, at the cell size the Studio viewport uses when a chart
  // is opened whole. This is the honest worst case for the browser.
  for (const cellPx of [4, 8, 24]) {
    t = Date.now()
    const svg = renderPatternSvgString(data, { mode: 'chart', cellPx, showSymbols: cellPx >= 14, cellStyle: 'block' })
    const built = Date.now() - t
    t = Date.now()
    const png = await sharp(Buffer.from(svg)).png().toBuffer()
    console.log(
      `  chart SVG @ ${String(cellPx).padStart(2)}px/cell        ${secs(built)} to build ${mb(Buffer.byteLength(svg))}, ${secs(Date.now() - t)} to rasterise → ${kb(png.byteLength)}`,
    )
    if (cellPx === 8) writeFileSync(`${outDir}/${slug}-chart.png`, png)
  }

  if (process.argv.includes('--pdf')) {
    t = Date.now()
    const pdf = await buildPatternPdf(data, row.name, { paper: 'a4' })
    console.log(`  printable PDF (A4)           ${secs(Date.now() - t)}  → ${mb(pdf.byteLength)}`)
    writeFileSync(`${outDir}/${slug}.pdf`, Buffer.from(pdf))
  }
  console.log(`\n  files in ${outDir}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
    await prisma.$disconnect()
    process.exit(1)
  })
