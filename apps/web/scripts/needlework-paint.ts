/**
 * Needlework illustration-guided engine (surface thread-painting).
 *
 * Flux generates a beautiful illustration of the subject; this builds a directional
 * long-and-short stitch FIELD where every short straight stitch samples its colour
 * from the illustration (DMC-snapped) and runs along the local FORM (structure-tensor
 * flow). The loom (`renderHero`) renders it unchanged — real thread-painting, picture-
 * level richness, no confetti/blobs. This is the dual-use engine (also powers the
 * customer "upload a photo/idea -> your own pattern" feature).
 *
 * Modes: dense (cut-out subject) · line (delicate motifs + edge outline, bare linen) ·
 * bleed (full scene, edge-to-edge). Levers: detail (denser), tameWarm (calm warm skin).
 * Framing: round hoop for circular, else frameless (--none) — see loom_render.py margins.
 *
 *   cd apps/web && npx tsx scripts/needlework-paint.ts [slug ...] [--none]
 *
 * Build-time tooling: excluded from next build in tsconfig.json (imports the dotenv
 * loader + the Blender/Fal render chain). Run from the MAIN checkout (needs node_modules).
 * The reusable core (bitmap -> StitchedElement[]) should be promoted into
 * src/lib/needlework for Phase-2 volume; this script is the proven reference.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnv(path: string): void {
  try { for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
    if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
  } } catch { /* shell env */ }
}
loadEnv('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import sharp from 'sharp'
import { fluxIllustration } from '../src/lib/studio/generation/sources'
import { nearestDmcFull } from '../src/lib/floss/dmc-full'
import type { StitchedElement } from '../src/lib/loom/render/renderPattern'
import { renderHero } from './loom-render-hero'
import { r2UploadScript } from './import-lib/r2-script'

const OUT = resolve(process.cwd(), '../../.loom-scratch/needlework/paint')
type Pt = [number, number]

interface Job { slug: string; prompt: string; widthMm?: number; mode?: 'dense' | 'line'; frame?: 'round' | 'square' | 'rect'; tameWarm?: boolean; detail?: boolean; bleed?: boolean }
const PLAIN = ', centered, filling the frame, plain pale cream background, no text, no border'
const DELICATE = ', thin clean dark outlines, soft watercolour colours, centered, plain off-white background, lots of negative space, no text'
const JOBS: Record<string, Job> = {
  fox: { slug: 'fox', prompt: 'a highly detailed naturalistic illustration of a single red fox sitting and facing forward, fluffy fur, bright amber eyes, bushy tail, soft woodland colours' + PLAIN, frame: 'rect', widthMm: 250 },
  peacock: { slug: 'peacock', prompt: 'a stunning highly detailed illustration of a peacock with its tail fanned out, iridescent blue and teal and gold feathers with eye spots, ornate, symmetrical' + PLAIN, frame: 'square', widthMm: 280 },
  cat: { slug: 'cat', prompt: 'a highly detailed naturalistic illustration of a fluffy ginger cat curled up asleep, soft fur, cosy' + PLAIN, frame: 'square', widthMm: 240 },
  hare: { slug: 'hare', prompt: 'a highly detailed naturalistic illustration of a brown hare sitting alert in profile, soft fur, long ears' + PLAIN, frame: 'round', widthMm: 200 },
  robin: { slug: 'robin', prompt: 'a highly detailed naturalistic illustration of a plump European robin perched on a twig with a few red berries, orange-red breast' + PLAIN, frame: 'round', widthMm: 165 },
  kingfisher: { slug: 'kingfisher', prompt: 'a highly detailed naturalistic illustration of a kingfisher bird perched, vivid electric blue back and bright orange belly' + PLAIN, frame: 'rect', widthMm: 230 },
  cottage: { slug: 'cottage', prompt: 'a highly detailed naturalistic illustration of a thatched english cottage with a lush cottage flower garden, path and trees under a soft blue sky' + PLAIN, frame: 'rect', widthMm: 320 },
  peony: { slug: 'peony', prompt: 'a highly detailed naturalistic illustration of a single large blush-pink peony bloom with soft layered petals and green leaves' + PLAIN, frame: 'round', widthMm: 150 },
  jar: { slug: 'jar', prompt: 'a simple delicate botanical illustration of a small glass mason jar holding a little bunch of mixed wildflowers, poppies cornflowers daisies' + DELICATE, mode: 'line', frame: 'rect', widthMm: 200 },
  sprig: { slug: 'sprig', prompt: 'a simple delicate botanical illustration of three lavender stems and two small wildflowers tied with twine' + DELICATE, mode: 'line', frame: 'round', widthMm: 150 },
  facecrown: { slug: 'facecrown', prompt: "a beautiful fine-art portrait illustration of a young woman's face looking forward, adorned with a lush crown of colourful flowers - roses, poppies and blooms - woven into her hair, soft painterly naturalistic style, warm skin tones, delicate facial features, gentle even lighting" + PLAIN, frame: 'rect', widthMm: 210, tameWarm: true, detail: true },
  dogwine: { slug: 'dogwine', prompt: 'a whimsical fashionable painterly illustration of a dachshund dog wearing pink heart-shaped sunglasses, sitting at a little table with a glass of rosé wine and a stack of colourful books, hot pink room, bold and stylish, highly detailed, full scene filling the whole frame, no text', frame: 'rect', widthMm: 230, tameWarm: true, detail: true, bleed: true },
}

// ---- DMC snap with memo ----
const dmcMemo = new Map<number, string>()
function snap(r: number, g: number, b: number): string {
  const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2)
  let v = dmcMemo.get(key)
  if (!v) { v = nearestDmcFull(`#${[r,g,b].map((c)=>c.toString(16).padStart(2,'0')).join('')}`).hex; dmcMemo.set(key, v) }
  return v
}

async function fluxCached(job: Job): Promise<Buffer> {
  mkdirSync(OUT, { recursive: true })
  const p = resolve(OUT, `${job.slug}.flux.png`)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(job.prompt, { imageSize: 'square_hd' })
  writeFileSync(p, src.buffer)
  return src.buffer
}

function boxBlur(src: Float64Array, W: number, H: number, rad: number): Float64Array {
  const tmp = new Float64Array(W * H), out = new Float64Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0
    for (let d = -rad; d <= rad; d++) { const xx = x + d; if (xx >= 0 && xx < W) { s += src[y*W+xx]!; n++ } }
    tmp[y*W+x] = s / n
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0
    for (let d = -rad; d <= rad; d++) { const yy = y + d; if (yy >= 0 && yy < H) { s += tmp[yy*W+x]!; n++ } }
    out[y*W+x] = s / n
  }
  return out
}

async function paint(job: Job): Promise<void> {
  const img = await fluxCached(job)
  const WORK = 460
  const { data, info } = await sharp(img).resize(WORK, WORK, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height
  const at = (x: number, y: number): [number, number, number] => { const k = (y*W+x)*3; return [data[k]!, data[k+1]!, data[k+2]!] }

  // 1. background mask: flood-fill the plain ground from the edges, matching the
  // actual corner colour (cream OR white) within a tolerance — interior whites
  // (fox chest/tail tip) are safe because they're not edge-connected.
  const bg = new Uint8Array(W * H)
  const corners = [at(2,2), at(W-3,2), at(2,H-3), at(W-3,H-3)]
  const bgR = corners.reduce((s,c)=>s+c[0],0)/4, bgG = corners.reduce((s,c)=>s+c[1],0)/4, bgB = corners.reduce((s,c)=>s+c[2],0)/4
  const isBg = (x: number, y: number): boolean => { const [r,g,b] = at(x,y); const dr=r-bgR, dg=g-bgG, db=b-bgB; return dr*dr+dg*dg+db*db < 46*46 }
  const stack: number[] = []
  for (let x = 0; x < W; x++) { stack.push(x, 0, x, H-1) }
  for (let y = 0; y < H; y++) { stack.push(0, y, W-1, y) }
  while (stack.length) { const y = stack.pop()!, x = stack.pop()!; if (x<0||y<0||x>=W||y>=H||bg[y*W+x]||!isBg(x,y)) continue; bg[y*W+x] = 1; stack.push(x+1,y,x-1,y,x,y+1,x,y-1) }
  // Full-bleed scenes (animals-doing-human-things etc.) stitch the WHOLE image;
  // single subjects cut out the plain ground.
  const fg = (x: number, y: number): boolean => job.bleed ? true : !bg[y*W+x]

  // 2. structure-tensor flow: stitches run ALONG image structure (perpendicular to gradient).
  const gray = new Float64Array(W * H)
  for (let i = 0; i < W*H; i++) gray[i] = 0.299*data[i*3]! + 0.587*data[i*3+1]! + 0.114*data[i*3+2]!
  const gx = new Float64Array(W*H), gy = new Float64Array(W*H)
  for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
    gx[y*W+x] = (gray[y*W+x+1]! - gray[y*W+x-1]!)
    gy[y*W+x] = (gray[(y+1)*W+x]! - gray[(y-1)*W+x]!)
  }
  const Jxx = new Float64Array(W*H), Jxy = new Float64Array(W*H), Jyy = new Float64Array(W*H)
  for (let i = 0; i < W*H; i++) { Jxx[i] = gx[i]!*gx[i]!; Jxy[i] = gx[i]!*gy[i]!; Jyy[i] = gy[i]!*gy[i]! }
  const Sxx = boxBlur(Jxx, W, H, 5), Sxy = boxBlur(Jxy, W, H, 5), Syy = boxBlur(Jyy, W, H, 5)
  const flowAngle = (x: number, y: number): number => {
    const i = y*W+x
    const theta = 0.5 * Math.atan2(2*Sxy[i]!, Sxx[i]! - Syy[i]!) // dominant gradient orientation
    return theta + Math.PI/2 // run along the structure
  }

  // 3. subject bbox -> framed canvas with a linen margin. round/square use a
  // SQUARED canvas (so the round hoop frames the subject the same); rect hugs the
  // subject's own aspect (landscape for a wide scene, portrait for a tall animal).
  let mnx=W, mny=H, mxx=0, mxy=0
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) if (fg(x,y)) { if(x<mnx)mnx=x; if(y<mny)mny=y; if(x>mxx)mxx=x; if(y>mxy)mxy=y }
  const cxb=(mnx+mxx)/2, cyb=(mny+mxy)/2
  const bw = mxx-mnx, bh = mxy-mny
  const frame = job.frame ?? 'round'
  let canvasW: number, canvasH: number, frameType: string
  // Generous linen margin: the design should sit at ~65% of the frame with a
  // clear ring of bare linen around it (industry standard — never cropped to the
  // edge). round/square = squared canvas; rect hugs the subject's aspect.
  if (frame === 'rect') { canvasW = bw*1.55; canvasH = bh*1.55; frameType = 'SLATE_FRAME' }
  else { const s = Math.max(bw,bh)*1.62; canvasW = s; canvasH = s; frameType = frame === 'square' ? 'SLATE_FRAME' : 'HOOP' }
  if (process.argv.includes('--none')) frameType = 'NONE'  // frameless flat-lay comparison
  const x0 = cxb - canvasW/2, y0 = cyb - canvasH/2
  const Wmm = job.widthMm ?? 180
  const scale = Wmm / canvasW
  const finishedH = canvasH * scale
  const tx = (x: number, y: number): Pt => [(x-x0)*scale, (y-y0)*scale]

  // 4. stitch field. dense = fill every area (animals/birds/florals/scenes).
  // line = fill only saturated motifs (flowers/stems) + back-stitch the strong
  // edges as an outline, leaving pale negative space as bare linen.
  const mode = job.mode ?? 'dense'
  const els: StitchedElement[] = []
  const spacing = job.detail ? 2.7 : (mode === 'line' ? 3.0 : 3.4)  // detail = denser stitching
  const lenLong = 12, lenShort = 7
  let h = 2166136261
  const rnd = (): number => { h = (h*16777619)>>>0; return h/4294967296 }
  const gmag = (jx: number, jy: number): number => Math.hypot(gx[jy*W+jx]!, gy[jy*W+jx]!)
  for (let y = Math.max(0,mny); y < Math.min(H,mxy); y += spacing) for (let x = Math.max(0,mnx); x < Math.min(W,mxx); x += spacing) {
    const jx = Math.round(x + (rnd()-0.5)*spacing), jy = Math.round(y + (rnd()-0.5)*spacing)
    if (jx<1||jy<1||jx>=W-1||jy>=H-1 || !fg(jx,jy)) continue
    const [r,g,b] = at(jx, jy)
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b)
    const sat = mx ? (mx-mn)/mx : 0
    const a = flowAngle(jx, jy) + (rnd()-0.5)*0.25
    if (mode === 'line') {
      if (sat > 0.34) {
        const L = lenShort * (0.85+0.3*rnd()); const hx=Math.cos(a)*L/2, hy=Math.sin(a)*L/2
        els.push({ stitchType:'embroidery-straight', colourHex: snap(r,g,b), thread:{type:'stranded-cotton',weight:'3-strand'}, directionDeg:null, geometry:{kind:'path', points:[tx(jx-hx,jy-hy), tx(jx+hx,jy+hy)]} })
      } else if (gmag(jx,jy) > 15) {
        const L = 9 * (0.85+0.3*rnd()); const hx=Math.cos(a)*L/2, hy=Math.sin(a)*L/2
        els.push({ stitchType:'embroidery-back', colourHex: snap(r*0.62|0, g*0.62|0, b*0.62|0), thread:{type:'stranded-cotton',weight:'2-strand'}, directionDeg:null, geometry:{kind:'path', points:[tx(jx-hx,jy-hy), tx(jx+hx,jy+hy)]} })
      }
    } else {
      const L = ((Math.floor(x/spacing)+Math.floor(y/spacing))%2===0 ? lenLong : lenShort) * (0.85+0.3*rnd())
      const hx = Math.cos(a)*L/2, hy = Math.sin(a)*L/2
      els.push({ stitchType:'embroidery-straight', colourHex: snap(r,g,b), thread:{type:'stranded-cotton',weight:'3-strand'}, directionDeg:null, geometry:{kind:'path', points:[ tx(jx-hx,jy-hy), tx(jx+hx,jy+hy) ]} })
    }
  }
  console.log(`[${job.slug}] ${mode} · ${frame} · ${els.length} stitches · ${Math.round(Wmm)}x${Math.round(finishedH)}mm`)
  writeFileSync(resolve(OUT, `${job.slug}.pattern.json`), JSON.stringify({ name: job.slug, frameType, finishedSizeMm: { width: Wmm, height: finishedH }, stitchedElements: els }, null, 2))

  const hero = await renderHero(
    { name: job.slug, stitchedElements: els, finishedSizeMm: { width: Wmm, height: finishedH },
      fabricHex: '#ece4d2', frameType, defaultThread: { type:'stranded-cotton', weight:'3-strand' }, strands: 3 },
    { persist: false, tameWarm: job.tameWarm ?? false },
  )
  const { publicUrl } = await r2UploadScript(readFileSync(hero.localHeroPath), 'image/png', { prefix: 'scratch-review' })
  console.log(`[${job.slug}] URL: ${publicUrl}`)
}

async function main(): Promise<void> {
  const want = process.argv.slice(2).filter((a)=>!a.startsWith('--'))
  for (const slug of (want.length ? want : ['fox'])) { const j = JOBS[slug]; if (!j) { console.error('no job', slug); continue } await paint(j) }
}
main().catch((e)=>{ console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
