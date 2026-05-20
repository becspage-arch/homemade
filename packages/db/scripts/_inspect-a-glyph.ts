import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
const body = JSON.parse(readFileSync(resolve(__dirname, '_alphabet-body.json'), 'utf-8'))
function walk(node: any): any {
  if (!node) return null
  if (node.type === 'crossStitchChart') return node
  if (Array.isArray(node.content)) {
    for (const c of node.content) { const r = walk(c); if (r) return r }
  }
  return null
}
const chart = walk(body)
const def = chart.attrs.definition
const cells = def.cells as Array<{ x: number; y: number; paletteKey: string }>
console.log('chart dims:', def.width, def.height)
console.log('total cells:', cells.length)

// Render grid view of cells where x < 16 (first two letters or so)
const minX = Math.min(...cells.map(c => c.x))
const maxX = Math.max(...cells.map(c => c.x))
const minY = Math.min(...cells.map(c => c.y))
const maxY = Math.max(...cells.map(c => c.y))
console.log(`x range: ${minX}..${maxX}`)
console.log(`y range: ${minY}..${maxY}`)

// Sort cells by y, then x
const limit = 24
console.log(`\nGrid (x=0..${limit - 1}, y=${minY}..${maxY}). Symbol per palette: R=red S=sage G=gold`)
for (let y = minY; y <= maxY; y++) {
  let row = String(y).padStart(2) + ': '
  for (let x = 0; x < limit; x++) {
    const cell = cells.find(c => c.x === x && c.y === y)
    if (cell) {
      const k = cell.paletteKey
      row += k === 'red' ? 'R' : k === 'sage' ? 'S' : k === 'gold' ? 'G' : '?'
    } else {
      row += '.'
    }
  }
  console.log(row)
}

// Now isolate cells in x=2..8 (the likely A glyph column range)
console.log('\nA-glyph candidate cells (x in 2..8):')
const aCells = cells.filter(c => c.x >= 2 && c.x <= 8).sort((a, b) => a.y - b.y || a.x - b.x)
for (const c of aCells) console.log(`  x=${c.x} y=${c.y} ${c.paletteKey}`)
