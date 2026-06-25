/**
 * THE FEATURE: a photo (customer upload, or a backend-generated idea) -> a
 * pattern. Photo provides the colour (aligned, full, real); the job is to reduce
 * it to clean, stitchable SHAPES + shades, then drive the document + loom hero.
 *
 *   npx tsx scripts/needlework-photo.ts [imagePathOrPrompt] [--hero]
 * With no arg it generates a realistic rose photo as the stand-in upload.
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import sharp from 'sharp'

import { loadCredentials } from './loom-hybrid-fal'
import { generateWithFluxPro } from '../src/lib/image-sourcing/flux-pro'
import { bitmapToPattern, buildPatternDocument, type DesignBitmap } from '../src/lib/needlework/engine'
import { patternToStrokes } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { renderHero } from './loom-render-hero'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../.needlework-scratch/photo')
mkdirSync(OUT, { recursive: true })
const THREAD = { type: 'stranded-cotton', weight: '6-strand' }

async function getPhoto(regen: boolean): Promise<Buffer> {
  const p = resolve(OUT, 'upload.png')
  if (!regen && existsSync(p)) {
    console.log('using cached upload photo')
    return readFileSync(p)
  }
  loadCredentials()
  const img = await generateWithFluxPro(
    'A realistic close-up photograph of a single deep red garden rose in full bloom with a couple of green leaves, soft natural light, plain pale background, sharp focus, high detail',
    { width: 1024, height: 1024 },
  )
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer())
  writeFileSync(p, buf)
  console.log('generated stand-in upload photo')
  return buf
}

async function main(): Promise<void> {
  const regen = process.argv.includes('--regen')
  const photo = await getPhoto(regen)

  // Simplify the photo like a designer would: smooth so shading becomes a few
  // broad bands (not noise), then let the engine reduce to floss-coloured shapes.
  const smoothed = await sharp(photo).flatten({ background: '#ffffff' }).median(7).blur(4).png().toBuffer()
  await sharp(smoothed).toFile(resolve(OUT, 'simplified.png'))
  const { data, info } = await sharp(smoothed).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const bitmap: DesignBitmap = { rgba: new Uint8Array(data), width: info.width, height: info.height }

  const W = 150
  const pattern = bitmapToPattern(
    bitmap,
    {
      name: 'photo-rose',
      title: 'Rose (from photo)',
      finishedSizeMm: { width: W, height: W },
      fabricHex: '#efe7d6',
      defaultThread: THREAD,
      strands: 6,
      source: { kind: 'reference', note: 'from an uploaded photo' },
    },
    { workPx: 360, maxColours: 14, minRegionAreaFrac: 0.0016 }, // higher min area -> fewer specks
  )
  console.log(`engine: ${pattern.stats.elements} elements, ${pattern.stats.colours} colours, stitches:`, pattern.stats.byStitch)

  const strokes = patternToStrokes(pattern.stitchedElements, { strands: 6, defaultThread: THREAD })
  const img = renderEmbroidery({ widthMm: pattern.meta.finishedSizeMm.width, heightMm: pattern.meta.finishedSizeMm.height, pxPerMm: 5, ss: 2, fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 }, strokes })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(resolve(OUT, 'plan-preview.png'))
  console.log(`plan-preview.png (${strokes.length} stitches)`)

  const doc = buildPatternDocument(pattern.stitchedElements, pattern.meta.finishedSizeMm, { title: 'Rose (from photo)' })
  await sharp(Buffer.from(doc.technicalChartSvg)).resize({ width: 700 }).png().toFile(resolve(OUT, 'line-drawing.png'))

  if (process.argv.includes('--hero')) {
    console.log('rendering loom hero…')
    const hero = await renderHero({ name: 'photo-rose', stitchedElements: pattern.stitchedElements, finishedSizeMm: pattern.meta.finishedSizeMm, fabricHex: '#efe7d6', defaultThread: THREAD, strands: 6, frame: { shape: 'round' } }, { persist: false, outDir: resolve(OUT, 'heroes') })
    console.log(`hero: ${hero.localHeroPath} (gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

main().catch((e) => { console.error('photo FAILED:', e instanceof Error ? e.message : String(e)); process.exit(1) })
