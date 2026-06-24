/**
 * Render the Countryside finished-piece image FROM the format file — reads
 * countryside.pattern.json's stitchedElements through the format-driven renderer
 * (no hand-placement). Fast CPU preview + path-traced scene export.
 *
 *   cd apps/web && npx tsx scripts/loom-render-countryside.ts
 */

import { resolve } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { filamentPolylines } from '../src/lib/loom/render/thread'
import { patternToStrokes, type StitchedElement } from '../src/lib/loom/render/renderPattern'

const FIX = resolve(process.cwd(), 'src/lib/loom/fixtures/countryside.pattern.json')
const OUT = resolve(process.cwd(), '../../.loom-scratch/blender')
mkdirSync(OUT, { recursive: true })

function main() {
  const pat = JSON.parse(readFileSync(FIX, 'utf8'))
  const strokes = patternToStrokes(pat.stitchedElements as StitchedElement[], {
    strands: 3,
    defaultThread: pat.defaultThread,
  })
  const W = pat.vectorData.width
  const H = pat.vectorData.height
  console.log(`${pat.stitchedElements.length} elements -> ${strokes.length} strokes; ${W}x${H}mm`)

  const img = renderEmbroidery({
    widthMm: W, heightMm: H, pxPerMm: 7, ss: 2,
    fabric: { hex: pat.fabricSpec.colourHex ?? '#e3d8c2', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
    strokes,
  })
  const pv = resolve(OUT, 'countryside-from-format-preview.png')
  sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(pv).then(() => console.log(`preview -> ${pv}`))

  const out = {
    fabric: { widthMm: W, heightMm: H, hex: pat.fabricSpec.colourHex ?? '#e3d8c2' },
    strokes: strokes.map((st) => {
      const fp = filamentPolylines(st)
      const hx = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
      return {
        hex: `#${hx(st.material.colour.r)}${hx(st.material.colour.g)}${hx(st.material.colour.b)}`,
        sheen: st.material.sheen,
        radiusMm: fp.radiusMm,
        filaments: fp.filaments.map((poly) => poly.map((p) => [p.x, p.y, p.z])),
      }
    }),
  }
  writeFileSync(resolve(OUT, 'countryside.json'), JSON.stringify(out))
  console.log(`wrote scene for path tracer`)
}

main()
