/**
 * Render one sample chart per type (colourwork / lace / cable / brioche),
 * write SVG + PNG to apps/web/public/knitting-samples/ so they ship with
 * the next deploy at https://homemade.education/knitting-samples/<file>.
 *
 * Run:
 *   pnpm --filter @homemade/web exec tsx scripts/render-knitting-samples.ts
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderKnittingChart } from '../src/lib/knitting/renderer'
import type { KnittingChartData } from '../src/lib/knitting/renderer'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const OUT_DIR = resolve(HERE, '..', 'public', 'knitting-samples')

const FAIR_ISLE: KnittingChartData = (() => {
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const onDiamond = Math.abs((x % 10) - 5) + Math.abs((y % 10) - 5) <= 2
      const onGround = (x + y) % 4 === 0
      if (onDiamond) cells.push({ x, y, s: 'cw-accent' })
      else if (onGround) cells.push({ x, y, s: 'cw-dark' })
      else cells.push({ x, y, s: 'cw-natural' })
    }
  }
  return {
    schemaVersion: 1,
    type: 'COLOURWORK',
    grid: { width: 20, height: 20, cells },
    palette: [
      { symbol: 'cw-natural', rgb: '#ece2c9', name: 'Natural' },
      { symbol: 'cw-dark', rgb: '#3a3a40', name: 'Charcoal' },
      { symbol: 'cw-accent', rgb: '#a13a2c', name: 'Madder red' },
    ],
    metadata: {
      construction: 'IN_THE_ROUND',
      rsRowsStartFrom: 'RIGHT',
      title: 'Fair Isle diamond motif (sample)',
    },
  }
})()

const SHETLAND: KnittingChartData = (() => {
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 30; y++) {
    const activeStart = Math.max(0, Math.floor((30 - y) / 4))
    const activeEnd = 24 - activeStart
    for (let x = 0; x < 24; x++) {
      if (x < activeStart || x >= activeEnd) {
        cells.push({ x, y, s: 'no-stitch' })
        continue
      }
      const isPatternRow = y % 4 === 1
      if (isPatternRow) {
        const localX = x - activeStart
        if (localX % 6 === 1) cells.push({ x, y, s: 'yarn-over' })
        else if (localX % 6 === 3) cells.push({ x, y, s: 'cdd' })
        else if (localX % 6 === 5) cells.push({ x, y, s: 'yarn-over' })
        else cells.push({ x, y, s: 'knit' })
      } else {
        cells.push({ x, y, s: 'knit' })
      }
    }
  }
  return {
    schemaVersion: 1,
    type: 'LACE',
    grid: { width: 24, height: 30, cells },
    metadata: {
      construction: 'FLAT',
      rsRowsStartFrom: 'RIGHT',
      title: 'Shetland triangular lace (sample)',
    },
  }
})()

const CABLE: KnittingChartData = (() => {
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 14; x++) {
      const inCable = (x >= 1 && x < 5) || (x >= 9 && x < 13)
      cells.push({ x, y, s: inCable ? 'knit' : 'purl' })
    }
  }
  const cables: Array<{
    startX: number; endX: number; y: number;
    crossDirection: 'LEFT' | 'RIGHT'; type: string
  }> = []
  for (let y = 3; y < 16; y += 6) {
    cables.push({ startX: 1, endX: 4, y, crossDirection: 'LEFT', type: 'C4F' })
    cables.push({ startX: 9, endX: 12, y, crossDirection: 'RIGHT', type: 'C4B' })
  }
  return {
    schemaVersion: 1,
    type: 'CABLE',
    grid: { width: 14, height: 16, cells, cables },
    metadata: {
      construction: 'FLAT',
      rsRowsStartFrom: 'RIGHT',
      title: 'Cable sampler (C4F + C4B)',
    },
  }
})()

const BRIOCHE: KnittingChartData = (() => {
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 18; x++) {
      cells.push({ x, y, s: x % 2 === 0 ? 'brk' : 'brp' })
    }
  }
  return {
    schemaVersion: 1,
    type: 'BRIOCHE',
    grid: { width: 18, height: 14, cells },
    palette: [
      { symbol: 'dark', rgb: '#2a2733', name: 'Indigo' },
      { symbol: 'light', rgb: '#e8d7b0', name: 'Honey' },
    ],
    metadata: {
      construction: 'FLAT',
      rsRowsStartFrom: 'RIGHT',
      title: 'Two-colour brioche (sample)',
    },
  }
})()

const SAMPLES = [
  { name: 'colourwork', data: FAIR_ISLE },
  { name: 'lace', data: SHETLAND },
  { name: 'cable', data: CABLE },
  { name: 'brioche', data: BRIOCHE },
]

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true })

  for (const { name, data } of SAMPLES) {
    const rendered = await renderKnittingChart(data, {
      outputFormat: 'BOTH',
      cellPx: 30,
      pixelWidth: 1200,
      pixelHeight: 1200,
      theme: 'DEFAULT',
    })
    const svgPath = resolve(OUT_DIR, `${name}.svg`)
    const pngPath = resolve(OUT_DIR, `${name}.png`)
    await writeFile(svgPath, rendered.svg ?? '', 'utf8')
    if (rendered.pngBuffer) {
      await writeFile(pngPath, rendered.pngBuffer)
    }
    console.log(
      `  ${name}: ${svgPath} (${(rendered.svg?.length ?? 0).toLocaleString()} chars), ` +
      `${pngPath} (${(rendered.pngBuffer?.length ?? 0).toLocaleString()} bytes). ` +
      `Warnings: ${rendered.warnings.length === 0 ? 'none' : rendered.warnings.join('; ')}`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
