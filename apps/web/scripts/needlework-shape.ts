/**
 * Needlework SHAPE-FIRST engine driver (the rebuilt pipeline).
 *
 * The old approach chopped a colour picture into flat-colour PATCHES, which gave
 * blobs (few colours) or confetti (many) and a useless dotty "line art". The
 * shape-first pipeline works the way Rebecca asked — and the way real patterns
 * are made:
 *
 *   Stage 1  LINE DRAWING  — a clean drawing of the actual shapes. This IS the
 *                            printable template, and the source of the regions.
 *   Stage 2  REGIONS       — turn the drawing into closed shapes + lines.
 *   Stage 3  COLOURS       — a thread colour per shape.
 *   Stage 4  STITCHES      — a stitch per shape/line (shaded fills within a shape).
 *   Stage 5  RENDER        — loom hero + the matching printable template.
 *
 * Each stage writes its artifact to .needlework-scratch/shape/<subject>/ and is
 * approved before the next. Run one stage at a time:
 *   npx tsx scripts/needlework-shape.ts --subject rose --stage 1
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

import { loadCredentials } from './loom-hybrid-fal'
import { generateWithFluxPro } from '../src/lib/image-sourcing/flux-pro'
import { generateWithFluxImg2Img } from '../src/lib/image-sourcing/flux-img2img'
import { extractShapes, type Shape } from '../src/lib/needlework/engine/shapes'
import { regionContour } from '../src/lib/needlework/engine/contour'
import { nearestFloss } from '../src/lib/floss/nearest-floss'
import { patternToStrokes, type StitchedElement } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { bitmapToPattern, patternToLineArtSvg, type DesignBitmap } from '../src/lib/needlework/engine'
import { existsSync, readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../../.needlework-scratch/shape')

// ── Subjects we can drive through the stages ─────────────────────────────────
interface Subject {
  slug: string
  title: string
  /** What to draw, plain. */
  subject: string
}
const SUBJECTS: Record<string, Subject> = {
  rose: { slug: 'rose', title: 'Garden Rose Sprig', subject: 'a single garden rose flower with one bud, a few leaves and a stem' },
}

type Detail = 'outline' | 'simple' | 'medium'

/**
 * A clean embroidery line-drawing prompt. 'outline' is what the shape pipeline
 * actually needs: a colouring-book / appliqué template — bold CLOSED shapes,
 * almost no interior lines — so every part extracts as ONE fillable region.
 */
function lineDrawingPrompt(subject: string, detail: Detail): string {
  if (detail === 'outline') {
    return (
      `A simple bold OUTLINE drawing for a hand-embroidery applique template: ${subject}. ` +
      `Draw ONLY the main outline shapes — each shape a single clean CLOSED loop, ` +
      `like a colouring-book or paper cut-out. Bold, even-weight solid black outlines on a ` +
      `pure white background, well separated. ` +
      `Absolutely NO interior detail: no vein lines, no petal lines, no swirls, no shading, ` +
      `no hatching, no stippling, no texture, no dots, no colour, no grey. ` +
      `At most ONE simple centre line per leaf. Keep it minimal and very clean. ` +
      `Flat 2D, centred. No text, no letters, no watermark, no signature.`
    )
  }
  const d =
    detail === 'simple'
      ? 'Minimal — just the main shapes, few lines, generous spacing.'
      : 'A moderate amount of detail — petals and leaves defined, but still clean.'
  return (
    `A clean line drawing for a hand-embroidery pattern: ${subject}. ` +
    `Bold, even-weight solid black continuous outlines on a pure white background. ` +
    `Every shape fully closed and clearly separated from its neighbours, with small gaps between shapes. ` +
    `${d} ` +
    `No colour, no grey, no shading, no fill, no hatching or cross-hatching, no stippling, no texture, no shadow. ` +
    `Flat 2D, centred. No text, no letters, no watermark, no signature.`
  )
}

/** Crisp the Flux line art to pure black-on-white for clean region-finding. */
async function cleanLineArt(raw: Buffer, outPath: string): Promise<void> {
  await sharp(raw)
    .flatten({ background: '#ffffff' })
    .greyscale()
    .normalise()
    .median(2) // knock out stray speckles / jpeg fuzz
    .threshold(200) // dark lines -> black, everything else -> white
    .png()
    .toFile(outPath)
}

async function stage1(subj: Subject, details: Detail[]): Promise<void> {
  loadCredentials()
  const dir = resolve(ROOT, subj.slug)
  mkdirSync(dir, { recursive: true })
  for (const detail of details) {
    const prompt = lineDrawingPrompt(subj.subject, detail)
    const img = await generateWithFluxPro(prompt, { width: 1024, height: 1024 })
    const raw = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    writeFileSync(resolve(dir, `1-linedraw-${detail}-raw.png`), raw)
    await cleanLineArt(raw, resolve(dir, `1-linedraw-${detail}.png`))
    console.log(`  wrote 1-linedraw-${detail}.png (+ raw)`)
  }
}

/** HSL hue -> [r,g,b], full sat/mid-light, for distinct shape colours. */
function hue(i: number): [number, number, number] {
  const h = ((i * 137.508) % 360) / 60
  const c = 0.62
  const x = c * (1 - Math.abs((h % 2) - 1))
  let r = 0,
    g = 0,
    b = 0
  if (h < 1) [r, g, b] = [c, x, 0]
  else if (h < 2) [r, g, b] = [x, c, 0]
  else if (h < 3) [r, g, b] = [0, c, x]
  else if (h < 4) [r, g, b] = [0, x, c]
  else if (h < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const m = 0.32
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

async function stage2(subj: Subject, detail: string): Promise<void> {
  const dir = resolve(ROOT, subj.slug)
  const drawPath = resolve(dir, `1-linedraw-${detail}.png`)
  const { data, info } = await sharp(readFileSync(drawPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const res = extractShapes(new Uint8Array(data), info.width, info.height, { workPx: 760, closeGapsPx: 2 })
  console.log(`  found ${res.shapes.length} shapes + ${res.lines.length} drawn lines (${res.width}x${res.height})`)

  // Visualise: each shape a distinct flat colour, drawn lines in black on top.
  const W = res.width
  const H = res.height
  const buf = new Uint8Array(W * H * 4).fill(255)
  for (let s = 0; s < res.shapes.length; s++) {
    const [r, g, b] = hue(s)
    for (const p of res.shapes[s]!.region.pixels) {
      const o = p * 4
      buf[o] = r
      buf[o + 1] = g
      buf[o + 2] = b
      buf[o + 3] = 255
    }
  }
  for (let i = 0; i < res.ink.length; i++) {
    if (res.ink[i] === 1) {
      const o = i * 4
      buf[o] = 20
      buf[o + 1] = 20
      buf[o + 2] = 20
    }
  }
  await sharp(Buffer.from(buf), { raw: { width: W, height: H, channels: 4 } }).png().toFile(resolve(dir, `2-shapes-${detail}.png`))
  console.log(`  wrote 2-shapes-${detail}.png`)
}

/** Per-shape median colour sampled from the coloured rose, skipping ink/edges. */
function sampleShapeColour(
  shape: Shape,
  shapeW: number,
  shapeH: number,
  col: { rgba: Uint8Array; width: number; height: number },
): [number, number, number] {
  const sx = col.width / shapeW
  const sy = col.height / shapeH
  const rs: number[] = []
  const gs: number[] = []
  const bs: number[] = []
  for (const p of shape.region.pixels) {
    const x = Math.min(col.width - 1, Math.floor((p % shapeW) * sx))
    const y = Math.min(col.height - 1, Math.floor(((p / shapeW) | 0) * sy))
    const o = (y * col.width + x) * 4
    const r = col.rgba[o]!
    const g = col.rgba[o + 1]!
    const b = col.rgba[o + 2]!
    if (0.2126 * r + 0.7152 * g + 0.0722 * b < 60) continue // skip black outline
    rs.push(r)
    gs.push(g)
    bs.push(b)
  }
  if (rs.length === 0) return [255, 255, 255]
  const med = (a: number[]) => {
    a.sort((x, y) => x - y)
    return a[a.length >> 1]!
  }
  return [med(rs), med(gs), med(bs)]
}

function isCloth([r, g, b]: [number, number, number]): boolean {
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const sat = Math.max(r, g, b) - Math.min(r, g, b)
  return luma > 232 && sat < 10 // ONLY near-pure-white = bare cloth
}

/** Richen a pale img2img wash into a real floss shade (boost saturation, cap brightness). */
function richen([r, g, b]: [number, number, number]): [number, number, number] {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2 / 255
  if (max - min < 6) return [r, g, b] // truly neutral — leave (white/grey/black)
  let h = 0
  const d = (max - min) / 255
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  if (max === r) h = ((gn - bn) / d) % 6
  else if (max === g) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  h *= 60
  if (h < 0) h += 360
  const s = Math.min(1, (d / (1 - Math.abs(2 * l - 1))) * 1.9) // boost saturation
  const ll = Math.min(0.62, l) // cap brightness so pale washes deepen to floss
  const c = (1 - Math.abs(2 * ll - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let rr = 0,
    gg = 0,
    bb = 0
  if (hp < 1) [rr, gg, bb] = [c, x, 0]
  else if (hp < 2) [rr, gg, bb] = [x, c, 0]
  else if (hp < 3) [rr, gg, bb] = [0, c, x]
  else if (hp < 4) [rr, gg, bb] = [0, x, c]
  else if (hp < 5) [rr, gg, bb] = [x, 0, c]
  else [rr, gg, bb] = [c, 0, x]
  const m = ll - c / 2
  return [Math.round((rr + m) * 255), Math.round((gg + m) * 255), Math.round((bb + m) * 255)]
}

async function stage3(subj: Subject, detail: string): Promise<void> {
  loadCredentials()
  const dir = resolve(ROOT, subj.slug)
  const drawBuf = readFileSync(resolve(dir, `1-linedraw-${detail}.png`))
  const { data, info } = await sharp(drawBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = 760
  const res = extractShapes(new Uint8Array(data), info.width, info.height, { workPx: W, closeGapsPx: 2 })

  // Colour the EXACT outline via img2img (keeps the shapes aligned), so each
  // shape's colour can be read straight back. img2img is stochastic — it
  // sometimes returns a still-monochrome drawing, so retry until the result is
  // genuinely colourful, then cache it.
  const colPath = resolve(dir, `3-coloured-source.png`)
  const dataUri = `data:image/png;base64,${drawBuf.toString('base64')}`
  const prompt =
    `A fully painted, vivid colour illustration of ${subj.subject}: deep pink and red rose petals, ` +
    `rich green leaves, a green stem. EVERY shape filled with strong saturated colour — this is a ` +
    `COLOUR painting, NOT black and white, NOT a line drawing, no white areas inside the flower or leaves. ` +
    `Keep the same composition and shapes. Flat colour, plain white background only outside the design.`
  let colBuf: Buffer | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const img = await generateWithFluxImg2Img(dataUri, prompt, { strength: 0.9 })
    const b = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    const stats = await sharp(b).stats()
    const [r, g, bl] = stats.channels
    const spread = Math.max(r!.mean, g!.mean, bl!.mean) - Math.min(r!.mean, g!.mean, bl!.mean)
    if (spread > 8) {
      colBuf = b
      break
    }
    console.log(`  colour source attempt ${attempt + 1} read monochrome (spread ${spread.toFixed(1)}), retrying`)
  }
  if (!colBuf) throw new Error('could not get a coloured source from img2img')
  writeFileSync(colPath, colBuf)
  const cd = await sharp(colBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const col = { rgba: new Uint8Array(cd.data), width: cd.info.width, height: cd.info.height }

  // Assign a DMC colour per shape; drop shapes that read as bare cloth.
  let dropped = 0
  const kept: Array<{ shape: Shape; hex: string; code: string; name: string }> = []
  const usedCodes = new Set<string>()
  for (const shape of res.shapes) {
    const rgb = sampleShapeColour(shape, res.width, res.height, col)
    if (isCloth(rgb)) {
      dropped++
      continue
    }
    const rich = richen(rgb)
    const hex = `#${rich.map((c) => c.toString(16).padStart(2, '0')).join('')}`
    const { entry } = nearestFloss(hex, { brand: 'DMC' })
    kept.push({ shape, hex: entry.rgb, code: entry.code, name: entry.name })
    usedCodes.add(entry.code)
  }
  console.log(`  ${kept.length} shapes coloured, ${dropped} cloth pockets dropped, ${usedCodes.size} DMC shades`)

  // Render the shapes filled in their real thread colours, lines on top.
  const buf = new Uint8Array(res.width * res.height * 4).fill(245)
  for (const k of kept) {
    const r = parseInt(k.hex.slice(1, 3), 16)
    const g = parseInt(k.hex.slice(3, 5), 16)
    const b = parseInt(k.hex.slice(5, 7), 16)
    for (const p of k.shape.region.pixels) {
      const o = p * 4
      buf[o] = r
      buf[o + 1] = g
      buf[o + 2] = b
      buf[o + 3] = 255
    }
  }
  for (let i = 0; i < res.ink.length; i++) {
    if (res.ink[i] === 1) {
      const o = i * 4
      buf[o] = 25
      buf[o + 1] = 25
      buf[o + 2] = 25
    }
  }
  await sharp(Buffer.from(buf), { raw: { width: res.width, height: res.height, channels: 4 } }).png().toFile(resolve(dir, `3-colours-${detail}.png`))
  console.log(`  wrote 3-colours-${detail}.png (+ 3-coloured-source.png)`)
}

const THREAD = { type: 'stranded-cotton', weight: '6-strand' }
type Src = { rgba: Uint8Array; width: number; height: number }

/** Colourise the exact outline via img2img (cached + retry-until-colourful). */
async function colourSource(dir: string, name: string, drawBuf: Buffer, prompt: string, regen: boolean): Promise<Src> {
  const path = resolve(dir, `${name}.png`)
  if (!regen && existsSync(path)) {
    const d = await sharp(readFileSync(path)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    return { rgba: new Uint8Array(d.data), width: d.info.width, height: d.info.height }
  }
  loadCredentials()
  const dataUri = `data:image/png;base64,${drawBuf.toString('base64')}`
  let buf: Buffer | null = null
  for (let a = 0; a < 5; a++) {
    const img = await generateWithFluxImg2Img(dataUri, prompt, { strength: 0.9 })
    const b = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    const st = await sharp(b).stats()
    const sp = Math.max(...st.channels.slice(0, 3).map((c) => c.mean)) - Math.min(...st.channels.slice(0, 3).map((c) => c.mean))
    if (sp > 8) {
      buf = b
      break
    }
    console.log(`  ${name} attempt ${a + 1} monochrome, retrying`)
  }
  if (!buf) throw new Error(`${name}: no colourful source`)
  writeFileSync(path, buf)
  const d = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { rgba: new Uint8Array(d.data), width: d.info.width, height: d.info.height }
}

/** Sample a source colour at a shape-resolution point, skipping black ink. */
function sampleAt(src: Src, sxPx: number, syPx: number, shapeW: number): [number, number, number] {
  const x = Math.min(src.width - 1, Math.max(0, Math.round(sxPx * (src.width / shapeW))))
  const y = Math.min(src.height - 1, Math.max(0, Math.round(syPx * (src.width / shapeW))))
  const o = (y * src.width + x) * 4
  return [src.rgba[o]!, src.rgba[o + 1]!, src.rgba[o + 2]!]
}

/** Build one solid long-and-short fill element covering a shape. */
function fillElement(shape: Shape, srcWidth: number, mmPerPx: number, hex: string): StitchedElement | null {
  const contour = regionContour(shape.region, srcWidth, 1.4, 1)
  if (contour.length < 3) return null
  // Orientation from second moments -> fill runs across the short axis.
  let mxx = 0,
    myy = 0,
    mxy = 0
  for (const p of shape.region.pixels) {
    const dx = (p % srcWidth) - shape.cx
    const dy = ((p / srcWidth) | 0) - shape.cy
    mxx += dx * dx
    myy += dy * dy
    mxy += dx * dy
  }
  const orient = (Math.atan2(2 * mxy, mxx - myy) / 2) * (180 / Math.PI)
  return {
    stitchType: 'embroidery-long-and-short',
    colourHex: hex,
    thread: THREAD,
    directionDeg: orient + 90,
    geometry: { kind: 'path', points: contour.map((p) => [p[0] * mmPerPx, p[1] * mmPerPx]) },
  }
}

function hexOf(rgb: [number, number, number]): string {
  return `#${rgb.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`
}

async function renderStrokes(strokes: ReturnType<typeof patternToStrokes>, wMm: number, hMm: number, out: string) {
  const img = renderEmbroidery({
    widthMm: wMm,
    heightMm: hMm,
    pxPerMm: 5,
    ss: 2,
    fabric: { hex: '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
    strokes,
  })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png().toFile(out)
}

async function stage4(subj: Subject, detail: string, regen: boolean): Promise<void> {
  const dir = resolve(ROOT, subj.slug)
  const drawBuf = readFileSync(resolve(dir, `1-linedraw-${detail}.png`))
  const { data, info } = await sharp(drawBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = 760
  const res = extractShapes(new Uint8Array(data), info.width, info.height, { workPx: W, closeGapsPx: 2 })
  const mmPerPx = 200 / res.width
  const wMm = res.width * mmPerPx
  const hMm = res.height * mmPerPx

  // One reliable colour source (img2img is flaky, so reuse a cached good roll).
  // Flat mode reads ONE colour per shape from it; realistic mode samples its
  // shading per stitch. Prefer the cached Stage-3 source if present.
  const prompt =
    `A fully painted, vivid, softly shaded colour illustration of ${subj.subject}: deep crimson-to-pink ` +
    `rose petals with natural light and shadow, rich green leaves shading dark to light, a green stem. ` +
    `EVERY shape filled with strong colour — a COLOUR painting, NOT black and white, NOT a line drawing, ` +
    `no white areas inside the flower or leaves. Keep the same composition and shapes. Plain white background only outside.`
  const cached3 = resolve(dir, `3-coloured-source.png`)
  let flatSrc: Src
  if (!regen && existsSync(cached3)) {
    const d = await sharp(readFileSync(cached3)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    flatSrc = { rgba: new Uint8Array(d.data), width: d.info.width, height: d.info.height }
    console.log('  using cached Stage-3 colour source')
  } else {
    flatSrc = await colourSource(dir, '4-src', drawBuf, prompt, regen)
  }
  const shadedSrc = flatSrc

  // Per-shape solid DMC colour = the MEDIAN colour over the whole shape (robust
  // to a vein line or highlight at the centroid). Drop only true cloth.
  const elements: StitchedElement[] = []
  let dropped = 0
  const shades = new Set<string>()
  for (const shape of res.shapes) {
    const rgb = sampleShapeColour(shape, res.width, res.height, flatSrc)
    if (isCloth(rgb)) {
      dropped++
      continue
    }
    const { entry } = nearestFloss(hexOf(richen(rgb)), { brand: 'DMC' })
    const el = fillElement(shape, res.width, mmPerPx, entry.rgb)
    if (el) {
      elements.push(el)
      shades.add(entry.code)
    }
  }
  console.log(`  ${elements.length} shapes filled, ${dropped} cloth dropped, ${shades.size} DMC shades (flat)`)

  // FLAT render: each shape its single thread colour.
  const flatStrokes = patternToStrokes(elements, { strands: 6, defaultThread: THREAD })
  await renderStrokes(flatStrokes, wMm, hMm, resolve(dir, `4-flat-${detail}.png`))
  console.log(`  wrote 4-flat-${detail}.png (${flatStrokes.length} stitches)`)

  // REALISTIC render: same fills, but recolour EACH stitch by sampling a BLURRED
  // copy of the source at its position -> smooth shading (blur kills the vein /
  // highlight noise that otherwise stripes the leaves).
  const bd = await sharp(Buffer.from(shadedSrc.rgba), { raw: { width: shadedSrc.width, height: shadedSrc.height, channels: 4 } })
    .blur(8)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const blurred: Src = { rgba: new Uint8Array(bd.data), width: bd.info.width, height: bd.info.height }
  const realStrokes = patternToStrokes(elements, { strands: 6, defaultThread: THREAD })
  for (const st of realStrokes as Array<{ path: Array<{ x: number; y: number }>; material: { colour: { r: number; g: number; b: number } } }>) {
    let mx = 0,
      my = 0
    for (const p of st.path) {
      mx += p.x
      my += p.y
    }
    mx /= st.path.length
    my /= st.path.length
    const rgb = sampleAt(blurred, mx / mmPerPx, my / mmPerPx, res.width)
    const { entry } = nearestFloss(hexOf(richen(rgb)), { brand: 'DMC' })
    st.material.colour = {
      r: parseInt(entry.rgb.slice(1, 3), 16),
      g: parseInt(entry.rgb.slice(3, 5), 16),
      b: parseInt(entry.rgb.slice(5, 7), 16),
    }
  }
  await renderStrokes(realStrokes, wMm, hMm, resolve(dir, `4-realistic-${detail}.png`))
  console.log(`  wrote 4-realistic-${detail}.png (${realStrokes.length} stitches)`)
}

/**
 * Stage 5 — COLOUR-FIRST. Generate a fully-coloured FLAT illustration (reliable,
 * no white gaps), then take shapes + colour straight from it. Coverage is
 * guaranteed because the source is fully painted; shapes are clean because the
 * source is flat (not painterly). Renders flat + emits the line-art template.
 */
async function stage5(subj: Subject, regen: boolean): Promise<void> {
  loadCredentials()
  const dir = resolve(ROOT, subj.slug)
  mkdirSync(dir, { recursive: true })
  const srcPath = resolve(dir, `5-coloured-flat.png`)
  let buf: Buffer
  if (!regen && existsSync(srcPath)) {
    buf = readFileSync(srcPath)
    console.log('  using cached coloured-flat source')
  } else {
    const prompt =
      `A flat vector illustration of ${subj.subject}: a red garden rose, green leaves, a green stem. ` +
      `Bold FLAT solid colours, clean simple shapes, a limited palette of about 12-16 colours. ` +
      `Every part fully filled with colour — NO white, cream or pale gaps inside the flower, leaves or stem. ` +
      `No gradients, no soft shading, no fine texture, no thick black outlines. Plain white background only ` +
      `behind the design. Centred, crisp flat colour.`
    const img = await generateWithFluxPro(prompt, { width: 1024, height: 1024 })
    buf = Buffer.from(await (await fetch(img.url)).arrayBuffer())
    writeFileSync(srcPath, buf)
    console.log('  generated coloured-flat source')
  }

  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const bitmap: DesignBitmap = { rgba: new Uint8Array(data), width: info.width, height: info.height }
  const pattern = bitmapToPattern(
    bitmap,
    {
      name: `${subj.slug}-cf`,
      title: subj.title,
      finishedSizeMm: { width: 200, height: 200 },
      fabricHex: '#efe7d6',
      defaultThread: THREAD,
      strands: 6,
      source: { kind: 'brief', territory: 't', look: 'l', palette: 'p', concept: subj.subject },
    },
    { workPx: 420, maxColours: 18 },
  )
  console.log(`  ${pattern.stats.elements} elements, ${pattern.stats.colours} DMC shades, stitches:`, pattern.stats.byStitch)

  const strokes = patternToStrokes(pattern.stitchedElements, { strands: 6, defaultThread: THREAD })
  await renderStrokes(strokes, pattern.meta.finishedSizeMm.width, pattern.meta.finishedSizeMm.height, resolve(dir, `5-colourfirst.png`))
  const svg = patternToLineArtSvg(pattern.stitchedElements, pattern.meta.finishedSizeMm)
  await sharp(Buffer.from(svg)).png().toFile(resolve(dir, `5-lineart.png`))
  console.log(`  wrote 5-colourfirst.png (${strokes.length} stitches) + 5-lineart.png`)
}

async function main(): Promise<void> {
  const argv = process.argv
  const subjSlug = argv[argv.indexOf('--subject') + 1] ?? 'rose'
  const stage = Number(argv[argv.indexOf('--stage') + 1] ?? 1)
  const subj = SUBJECTS[subjSlug]
  if (!subj) throw new Error(`unknown subject ${subjSlug}`)
  const detail = (argv[argv.indexOf('--detail') + 1] ?? 'outline') as Detail
  console.log(`=== ${subj.title} — stage ${stage} ===`)
  const regen = argv.includes('--regen')
  if (stage === 1) await stage1(subj, [detail])
  else if (stage === 2) await stage2(subj, detail)
  else if (stage === 3) await stage3(subj, detail)
  else if (stage === 4) await stage4(subj, detail, regen)
  else if (stage === 5) await stage5(subj, regen)
  else throw new Error(`stage ${stage} not built yet`)
  console.log(`Done. Artifacts in ${resolve(ROOT, subj.slug)}`)
}

main().catch((e) => {
  console.error('shape FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
