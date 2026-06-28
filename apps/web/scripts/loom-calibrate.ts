/**
 * Loom colour-calibration A/B. Renders a 16-colour DMC floss swatch chart
 * through the CURRENT pipeline (AgX + 1.5x saturation + green/warm tames) and
 * colour-accurate candidates, samples what each actually renders, and scores
 * each against the true DMC sRGB (CIELAB ΔE). Build-time only; no Fal, no deploy.
 *
 *   cd apps/web && npx tsx scripts/loom-calibrate.ts
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { patternToStrokes, type StitchedElement } from '../src/lib/loom/render/renderPattern'
import { strokesToBlenderScene } from '../src/lib/loom/render/blenderScene'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLENDER = process.env.LOOM_BLENDER ?? 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'
const OUT = resolve(__dirname, '../../../.loom-scratch/calib')
mkdirSync(OUT, { recursive: true })

// 16 DMC stands across whites, greens, warms, blue, grey, yellow.
const SWATCHES: { dmc: string; name: string; hex: string }[] = [
  { dmc: 'B5200', name: 'White', hex: '#fcfcfc' },
  { dmc: '890', name: 'Dk pistachio', hex: '#243f29' },
  { dmc: '3687', name: 'Mauve', hex: '#b05a6c' },
  { dmc: '818', name: 'Baby pink', hex: '#f2cdd4' },
  { dmc: '3345', name: 'Hunter green', hex: '#46603a' },
  { dmc: '211', name: 'Lavender', hex: '#cdbfde' },
  { dmc: '988', name: 'Forest green', hex: '#74914f' },
  { dmc: '581', name: 'Moss', hex: '#9ea03f' },
  { dmc: '740', name: 'Tangerine', hex: '#f0891b' },
  { dmc: '972', name: 'Canary', hex: '#fbbe26' },
  { dmc: '3348', name: 'Lt yellow-grn', hex: '#bfca84' },
  { dmc: '919', name: 'Red copper', hex: '#a83c22' },
  { dmc: '902', name: 'Dk garnet', hex: '#6e2029' },
  { dmc: '311', name: 'Navy blue', hex: '#1c5066' },
  { dmc: '666', name: 'Bright red', hex: '#e31d42' },
  { dmc: '415', name: 'Pearl grey', hex: '#d3d4d6' },
]
const COLS = 4
const PITCH = 33
const PATCH = 25
const GRID = COLS * PITCH - (PITCH - PATCH) // 124mm

function buildElements(): StitchedElement[] {
  return SWATCHES.map((s, i) => {
    const r = Math.floor(i / COLS)
    const c = i % COLS
    const x = c * PITCH
    const y = r * PITCH
    const pts: [number, number][] = [
      [x, y], [x + PATCH, y], [x + PATCH, y + PATCH], [x, y + PATCH], [x, y],
    ]
    return {
      stitchType: 'embroidery-satin',
      colourHex: s.hex,
      thread: { type: 'stranded-cotton', weight: '6-strand' },
      directionDeg: 0,
      geometry: { kind: 'path', points: pts },
    }
  })
}

function writeScene(file: string, tames: boolean) {
  const strokes = patternToStrokes(buildElements(), { strands: 6 })
  const scene = strokesToBlenderScene(
    strokes,
    { widthMm: GRID, heightMm: GRID, hex: '#e3d8c0', frameType: 'NONE' },
    { tameGreens: tames, tameWarm: tames },
  )
  writeFileSync(file, JSON.stringify(scene))
}

function render(scenePath: string, outPng: string, env: Record<string, string>) {
  const script = resolve(__dirname, 'loom_render.py')
  const res = spawnSync(
    BLENDER,
    ['--background', '--factory-startup', '--python', script, '--', scenePath, outPng, '140'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ...env } },
  )
  if (res.status !== 0 || !existsSync(outPng)) {
    throw new Error(`Blender failed (${res.status}): ${(res.stderr || res.stdout || '').slice(-800)}`)
  }
}

// sRGB hex -> CIELAB
function hexRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbLab([r, g, b]: [number, number, number]): [number, number, number] {
  const f = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const R = f(r), G = f(g), B = f(b)
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  let Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const g2 = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  X = g2(X); Y = g2(Y); Z = g2(Z)
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)]
}
function deltaE(a: string, b: [number, number, number]): number {
  const la = rgbLab(hexRgb(a)), lb = rgbLab(b)
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2])
}
function toHex([r, g, b]: number[]): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

// Sample the 16 patches: find the non-background bbox, divide 4x4, mean the
// inner 40% of each cell (excluding gap/background pixels).
async function sample(png: string): Promise<[number, number, number][]> {
  const img = sharp(png).removeAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height, ch = info.channels
  const at = (x: number, y: number) => { const i = (y * W + x) * ch; return [data[i], data[i + 1], data[i + 2]] as [number, number, number] }
  // background = mean of the 4 corners (linen margin)
  const corners = [at(2, 2), at(W - 3, 2), at(2, H - 3), at(W - 3, H - 3)]
  const bg: [number, number, number] = [0, 1, 2].map((k) => corners.reduce((s, c) => s + c[k], 0) / 4) as [number, number, number]
  const isBg = (p: [number, number, number]) => Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]) < 26
  // non-bg bbox
  let x0 = W, y0 = H, x1 = 0, y1 = 0
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    if (!isBg(at(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  }
  const cw = (x1 - x0) / COLS, chh = (y1 - y0) / COLS
  const out: [number, number, number][] = []
  for (let i = 0; i < SWATCHES.length; i++) {
    const r = Math.floor(i / COLS), c = i % COLS
    const cx = x0 + (c + 0.5) * cw, cy = y0 + (r + 0.5) * chh
    const rx = cw * 0.3, ry = chh * 0.3
    let sr = 0, sg = 0, sb = 0, n = 0
    for (let y = Math.round(cy - ry); y < cy + ry; y++) for (let x = Math.round(cx - rx); x < cx + rx; x++) {
      const p = at(x, y); if (isBg(p)) continue; sr += p[0]; sg += p[1]; sb += p[2]; n++
    }
    out.push(n ? [sr / n, sg / n, sb / n] : [0, 0, 0])
  }
  return out
}

async function main() {
  const sceneCur = resolve(OUT, 'swatch-current.scene.json')
  const sceneRaw = resolve(OUT, 'swatch-raw.scene.json')
  writeScene(sceneCur, true)   // production: green + warm tames applied
  writeScene(sceneRaw, false)  // raw DMC, no tames

  const variants = [
    { key: 'current', scene: sceneCur, env: {} as Record<string, string>, label: 'Current (AgX·1.5·tames)' },
    { key: 'fixedStd', scene: sceneRaw, env: { LOOM_VIEW: 'Standard', LOOM_SAT: '1.0', LOOM_EXP: '0' }, label: 'Fixed · Standard' },
    { key: 'fixedAgX', scene: sceneRaw, env: { LOOM_VIEW: 'AgX', LOOM_SAT: '1.0', LOOM_EXP: '0.9' }, label: 'Fixed · AgX neutral' },
  ]
  const sampled: Record<string, [number, number, number][]> = {}
  for (const v of variants) {
    const png = resolve(OUT, `swatch-${v.key}.png`)
    console.log(`rendering ${v.key}…`)
    render(v.scene, png, v.env)
    sampled[v.key] = await sample(png)
  }

  // Report + board
  console.log('\ncolour            true     ' + variants.map((v) => v.key.padEnd(10)).join(''))
  const meanDE: Record<string, number> = {}
  for (const v of variants) meanDE[v.key] = 0
  SWATCHES.forEach((s, i) => {
    const row = variants.map((v) => deltaE(s.hex, sampled[v.key][i]))
    variants.forEach((v, j) => (meanDE[v.key] += row[j]))
    console.log(
      `${s.dmc.padEnd(6)} ${s.name.padEnd(13)} ${s.hex}  ` +
        variants.map((v, j) => `${toHex(sampled[v.key][i])} ΔE${row[j].toFixed(1).padStart(5)}`).join('  '),
    )
  })
  console.log('\nMEAN ΔE:  ' + variants.map((v) => `${v.label} = ${(meanDE[v.key] / SWATCHES.length).toFixed(1)}`).join('   |   '))

  // Comparison board SVG -> PNG: per colour, chips [true | each variant]
  const CHIP = 90, GAP = 6, ROWH = 34, LABW = 150
  const cols = 1 + variants.length
  const w = LABW + cols * (CHIP + GAP) + 20
  const h = 40 + SWATCHES.length * ROWH + 30
  let body = `<text x="10" y="22" font-family="sans-serif" font-size="14" font-weight="700">DMC floss — true vs render (ΔE)</text>`
  const heads = ['true', ...variants.map((v) => v.label)]
  heads.forEach((hd, j) => { body += `<text x="${LABW + j * (CHIP + GAP) + CHIP / 2}" y="38" font-family="sans-serif" font-size="10" text-anchor="middle">${hd}</text>` })
  SWATCHES.forEach((s, i) => {
    const y = 46 + i * ROWH
    body += `<text x="10" y="${y + ROWH / 2}" font-family="sans-serif" font-size="11">${s.dmc} ${s.name}</text>`
    body += `<rect x="${LABW}" y="${y}" width="${CHIP}" height="${ROWH - GAP}" fill="${s.hex}" stroke="#999" stroke-width="0.5"/>`
    variants.forEach((v, j) => {
      const x = LABW + (j + 1) * (CHIP + GAP)
      const c = toHex(sampled[v.key][i])
      const de = deltaE(s.hex, sampled[v.key][i])
      body += `<rect x="${x}" y="${y}" width="${CHIP}" height="${ROWH - GAP}" fill="${c}" stroke="#999" stroke-width="0.5"/>`
      body += `<text x="${x + CHIP - 3}" y="${y + ROWH - GAP - 4}" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="end" fill="${de > 18 ? '#c00' : '#063'}">${de.toFixed(0)}</text>`
    })
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(resolve(OUT, 'calibration-board.png'))
  console.log('\nwrote', resolve(OUT, 'calibration-board.png'))
}
main().catch((e) => { console.error('FAIL', e?.stack || e); process.exit(1) })
