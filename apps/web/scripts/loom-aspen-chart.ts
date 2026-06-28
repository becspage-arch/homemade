/**
 * Step 3 (per RENDER_PROCESS.md, Crochet) — SHOW THE STITCHES.
 *
 * Renders the Aspen Throw's crochet SYMBOL CHART straight from the our-format
 * structured stitch program, for sign-off BEFORE any photoreal render. Outputs:
 *   - aspen-chart-full.png    : the whole blanket (all 123 rows)
 *   - aspen-chart-start.png   : zoomed lower-left corner (magic ring + increases)
 *   - aspen-chart-finish.png  : zoomed top (Part 3 decreases to the final point)
 *   - aspen-program.txt       : the written row-by-row program (audited counts)
 *
 *   cd apps/web && npx tsx scripts/loom-aspen-chart.ts
 */

import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { buildChartSvg } from '../src/lib/loom/crochet/chart'
import { expandProgram, aspenRowOps } from '../src/lib/loom/crochet/aspenProgram'

const OUT = resolve(process.cwd(), '../../.loom-scratch/crochet')
mkdirSync(OUT, { recursive: true })

async function renderSvg(svg: string, file: string) {
  await sharp(Buffer.from(svg)).png().toFile(resolve(OUT, file))
  console.log('wrote', file)
}

function writtenProgram(): string {
  const { rows } = expandProgram()
  const ops = aspenRowOps()
  const lines: string[] = ['Aspen Throw — written stitch program (every row, audited counts)', '']
  for (const op of ops) {
    const r = rows[op.row - 1]!
    const part = r.part
    let desc: string
    if (op.magicCircle) desc = 'Magic ring, ch2, 3 hdc in ring'
    else {
      const e = (k?: string) =>
        k === 'inc2' ? '2 hdcblo in end st' : k === 'inc3' ? '3 hdcblo in end st' : k === 'dec2' ? 'hdc2tog (blo)' : k === 'dec3' ? 'hdc3tog (blo)' : '—'
      desc = `ch2, turn. start: ${e(op.start?.kind)} | ${r.plainHdc} hdcblo | end: ${e(op.end?.kind)}`
    }
    lines.push(`P${part} Row ${String(op.row).padStart(3)}: ${desc}  (${r.count})`)
  }
  return lines.join('\n')
}

async function main() {
  const { rows, totalStitches } = expandProgram()
  console.log(`our-format program: ${rows.length} rows, ${totalStitches} hdc — building symbol chart`)

  await renderSvg(buildChartSvg({ cell: 9, title: 'Aspen Throw — full crochet symbol chart (all 123 rows, blo)' }), 'aspen-chart-full.png')
  await renderSvg(
    buildChartSvg({ rows: { from: 1, to: 14 }, cell: 30, title: 'Aspen Throw — start (Part 1): magic ring + increases, rows 1–14' }),
    'aspen-chart-start.png',
  )
  await renderSvg(
    buildChartSvg({ rows: { from: 112, to: 123 }, cell: 30, title: 'Aspen Throw — finish (Part 3): decreases to the point, rows 112–123' }),
    'aspen-chart-finish.png',
  )

  writeFileSync(resolve(OUT, 'aspen-program.txt'), writtenProgram())
  console.log('wrote aspen-program.txt')
}

main()
