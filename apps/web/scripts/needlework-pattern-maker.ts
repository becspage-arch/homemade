/**
 * Needlework pattern-maker — the dual-use engine, driven end to end.
 *
 * One engine, two input paths, one deterministic back half:
 *
 *   A. design brief   -> Flux flat-illustration  ┐
 *   B. reference photo -> Flux img2img flatten    ┘-> bitmapToPattern()
 *        -> stitchedElements + DMC floss + legend + steps
 *        -> loom renderHero -> finished-piece photo
 *
 * The ONLY AI step is the line-art DESIGN (Flux). Everything after the bitmap is
 * deterministic and reads from one shared `stitchedElements` structure, so the
 * hero = the template = the guide = what the customer stitches. No AI drift.
 * (feedback_hero_must_be_exact_pattern.)
 *
 * The SAME boundary powers our bulk generation (path A) and the customer-facing
 * premium "upload a photo / describe an idea -> your own pattern" (paths A + B).
 *
 * Usage:
 *   cd apps/web
 *   npx tsx scripts/needlework-pattern-maker.ts            # 6 designs + engine + CPU preview
 *   npx tsx scripts/needlework-pattern-maker.ts --hero     #   ...also loom hero render (Blender + Fal)
 *   npx tsx scripts/needlework-pattern-maker.ts --only 2   # just sample #2
 *   npx tsx scripts/needlework-pattern-maker.ts --hero --only 2
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import sharp from 'sharp'

import { loadCredentials } from './loom-hybrid-fal'
import { generateWithFluxPro } from '../src/lib/image-sourcing/flux-pro'
import { generateWithFluxImg2Img } from '../src/lib/image-sourcing/flux-img2img'
import {
  bitmapToPattern,
  briefToPrompt,
  referenceToPrompt,
  patternToLineArtSvg,
  REFERENCE_IMG2IMG_STRENGTH,
  type DesignBitmap,
  type EmbroideryPattern,
  type PatternMeta,
} from '../src/lib/needlework/engine'
import { patternToStrokes } from '../src/lib/loom/render/renderPattern'
import { renderEmbroidery } from '../src/lib/loom/render/scene'
import { renderHero } from './loom-render-hero'
import { LOOKS, PALETTES } from '../../../packages/db/prisma/design-direction'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../.needlework-scratch')
mkdirSync(OUT, { recursive: true })

const THREAD = { type: 'stranded-cotton', weight: '6-strand' }

function look(slug: string): string {
  return LOOKS.find((l) => l.slug === slug)?.vibe ?? ''
}
function palette(slug: string): { name: string; hexes: string[] } {
  const p = PALETTES.find((x) => x.slug === slug)
  return { name: p?.name ?? slug, hexes: p?.hexes ?? [] }
}

type Size = 'small' | 'medium' | 'large'
const SIZE_MM: Record<Size, number> = { small: 115, medium: 150, large: 200 }

interface Sample {
  n: number
  name: string
  title: string
  path: 'brief' | 'photo'
  size: Size
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  /** Brief path. */
  brief?: { concept: string; look: string; palette: string }
  /** Photo path. */
  photo?: { sourcePrompt: string; note: string }
  /**
   * A coloured generation ground. `hex` is the colour to PROMPT + exclude as
   * cloth (the segmentation aid). `fabricHex` is what the hero cloth actually
   * renders as — defaults to `hex` (e.g. a navy night sky), but can differ when
   * the ground is only a segmentation aid and the real cloth should be linen.
   */
  ground?: { prompt: string; hex: string; fabricHex?: string }
  /** Per-sample engine overrides. */
  engine?: { workPx?: number; maxColours?: number; minRegionAreaFrac?: number }
  /** Flux generation dimensions (default 1024×1024 square). Wide scenes go landscape. */
  dims?: { w: number; h: number }
  /** Frame shape for the hero. Default 'auto' (round for squarish, rect otherwise). */
  frame?: { shape?: 'auto' | 'round' | 'oval' | 'square' | 'rect'; fit?: number }
  source: PatternMeta['source']
}

// 6 diverse samples — 4 brief-driven + 2 photo-driven, spanning simple<->complex
// and small<->large, per the needlework look bar.
const SAMPLES: Sample[] = [
  {
    n: 1,
    name: 'robin-holly',
    title: 'Robin on a Holly Sprig',
    path: 'brief',
    size: 'small',
    difficulty: 'beginner',
    brief: {
      concept: 'A plump round robin with a red breast perched on a sprig of holly with three red berries',
      look: 'cottagecore-botanical',
      palette: 'winter-frost',
    },
    // A soft tinted ground (not white) so the robin's WHITE breast isn't read as
    // cloth and excluded — that was gutting the bird's middle and fragmenting it.
    ground: { prompt: 'soft dusty blue-grey background filling the whole frame', hex: '#9fb0bd', fabricHex: '#efe7d6' },
    frame: { shape: 'round' },
    source: { kind: 'brief', territory: 'birds-bees-butterflies', look: 'cottagecore-botanical', palette: 'winter-frost', concept: 'robin on holly' },
  },
  {
    n: 2,
    name: 'wildflower-wreath',
    title: 'Wildflower Meadow Wreath',
    path: 'brief',
    size: 'medium',
    difficulty: 'intermediate',
    brief: {
      concept: 'A circular wreath of mixed wildflowers — white daisies, red poppies, blue cornflowers and trailing green foliage, open in the centre',
      look: 'cottagecore-botanical',
      palette: 'wildflower-meadow',
    },
    frame: { shape: 'round' },
    source: { kind: 'brief', territory: 'modern-botanicals', look: 'cottagecore-botanical', palette: 'wildflower-meadow', concept: 'wildflower wreath' },
  },
  {
    n: 3,
    name: 'sun-face',
    title: 'Smiling Sun',
    path: 'brief',
    size: 'small',
    difficulty: 'beginner',
    brief: {
      concept: 'A bold smiling sun with a calm friendly face and chunky pointed rays radiating around it, a few small stars, bold solid shapes',
      look: 'bright-playful',
      palette: 'bright-pop',
    },
    frame: { shape: 'round' },
    source: { kind: 'brief', territory: 'celestial-mystical', look: 'bright-playful', palette: 'bright-pop', concept: 'smiling sun with bold rays' },
  },
  {
    n: 4,
    name: 'toadstool-snail',
    title: 'Toadstool and Snail',
    path: 'brief',
    size: 'medium',
    difficulty: 'intermediate',
    brief: {
      concept: 'A single bright red toadstool with white dots and a chunky cream stem, a small snail and a few green leaves at its base, simple bold flat shapes, cheerful, no dark gills or dark underside, light and bright',
      look: 'storybook-whimsical',
      palette: 'mushroom-woodland',
    },
    frame: { shape: 'round' },
    source: { kind: 'brief', territory: 'cottagecore-mushroom', look: 'storybook-whimsical', palette: 'mushroom-woodland', concept: 'toadstool and snail' },
  },
  {
    n: 5,
    name: 'sunset-hills',
    title: 'Sunset Over the Hills',
    path: 'photo',
    size: 'large',
    difficulty: 'intermediate',
    photo: {
      sourcePrompt:
        'A photograph of rolling green hills at sunset, a calm lake in the foreground reflecting an orange and pink sky, a few trees on the ridge, golden hour, landscape photography',
      note: 'A landscape of rolling hills at sunset with a lake reflecting the sky',
    },
    dims: { w: 1216, h: 832 },
    frame: { shape: 'rect' },
    source: { kind: 'reference', note: 'Reference photo: rolling hills at sunset (a stand-in for a customer upload).' },
  },
  {
    n: 6,
    name: 'city-skyline',
    title: 'City Skyline at Dusk',
    path: 'photo',
    size: 'large',
    difficulty: 'intermediate',
    photo: {
      sourcePrompt:
        'A photograph of a city skyline at dusk, tall buildings silhouetted against a purple and orange sky, lit windows, a river in front reflecting the lights, urban photography',
      note: 'A city skyline at dusk with tall buildings against a coloured sky',
    },
    dims: { w: 1216, h: 832 },
    frame: { shape: 'rect' },
    source: { kind: 'reference', note: 'Reference photo: city skyline at dusk (a stand-in for a customer upload).' },
  },
  {
    // Validation run: a RICH detailed design at a HIGH colour count — the
    // corrected approach (no flattening, colours scale with size).
    n: 7,
    name: 'garden-posy',
    title: 'Garden Flower Posy',
    path: 'brief',
    size: 'large',
    difficulty: 'advanced',
    brief: {
      concept: 'A lush posy of English garden flowers — pink and peach roses, a peony, blue delphiniums, sweet peas, daisies and trailing green foliage, gathered together',
      look: 'cottagecore-botanical',
      palette: 'wildflower-meadow',
    },
    engine: { workPx: 520, maxColours: 80, minRegionAreaFrac: 0.00006 },
    frame: { shape: 'round' },
    source: { kind: 'brief', territory: 'modern-botanicals', look: 'cottagecore-botanical', palette: 'wildflower-meadow', concept: 'lush garden flower posy' },
  },
]

/** Retry a Flux call through fal billing flaps (memory: balance 403s settle). */
async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 6): Promise<T> {
  let last: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      const msg = e instanceof Error ? e.message : String(e)
      const billing = /balance|locked|exhausted/i.test(msg)
      if (!billing && i >= 1) throw e
      const wait = 4000 * (i + 1)
      console.log(`  [${label}] attempt ${i + 1} failed (${msg.slice(0, 80)}); retrying in ${wait / 1000}s`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw last
}

/** Decode a PNG buffer to an RGBA DesignBitmap. */
async function decodeBitmap(buf: Buffer): Promise<DesignBitmap> {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { rgba: new Uint8Array(data), width: info.width, height: info.height }
}

async function fetchBuf(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url}: HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Path A or B -> the flat-colour design PNG (cached to disk). The Flux DESIGN is
 * the only AI step; once generated we reuse the cached design so the engine can
 * be re-tuned for free. `--regen` forces a fresh Flux generation.
 */
async function designBitmap(s: Sample, regen: boolean): Promise<{ bitmap: DesignBitmap; designPath: string }> {
  const designPath = resolve(OUT, `${s.name}.design.png`)
  if (!regen && existsSync(designPath)) {
    return { bitmap: await decodeBitmap(readFileSync(designPath)), designPath }
  }

  const W = s.dims?.w ?? 1024
  const Hh = s.dims?.h ?? 1024
  let buf: Buffer
  if (s.path === 'brief') {
    const lk = s.brief!
    const pal = palette(lk.palette)
    const prompt = briefToPrompt({
      concept: lk.concept,
      lookVibe: look(lk.look),
      paletteHexes: pal.hexes,
      paletteName: pal.name,
      ground: s.ground?.prompt,
    })
    const img = await withRetry(`${s.name}:flux-pro`, () =>
      generateWithFluxPro(prompt, { width: W, height: Hh }),
    )
    buf = await fetchBuf(img.url)
  } else {
    // Path B: make a photoreal source (stand-in for a customer upload), then flatten.
    const ph = s.photo!
    const src = await withRetry(`${s.name}:flux-pro-source`, () =>
      generateWithFluxPro(ph.sourcePrompt, { width: W, height: Hh }),
    )
    writeFileSync(resolve(OUT, `${s.name}.source.png`), await fetchBuf(src.url))
    const flat = await withRetry(`${s.name}:flux-img2img`, () =>
      generateWithFluxImg2Img(src.url, referenceToPrompt(ph.note), {
        strength: REFERENCE_IMG2IMG_STRENGTH,
      }),
    )
    buf = await fetchBuf(flat.url)
  }
  writeFileSync(designPath, buf)
  return { bitmap: await decodeBitmap(buf), designPath }
}

/** Fast CPU thread render — a quick visual sanity check before the Blender hero. */
async function cpuPreview(pattern: EmbroideryPattern, file: string): Promise<void> {
  const strokes = patternToStrokes(pattern.stitchedElements, {
    strands: pattern.meta.strands ?? 6,
    defaultThread: THREAD,
  })
  const img = renderEmbroidery({
    widthMm: pattern.meta.finishedSizeMm.width,
    heightMm: pattern.meta.finishedSizeMm.height,
    pxPerMm: 6,
    ss: 2,
    fabric: { hex: pattern.meta.fabricHex ?? '#efe7d6', threadsPerCm: 8, weave: 0.5, lightX: -0.5, lightY: 0.62, seed: 5 },
    strokes,
  })
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } })
    .png()
    .toFile(file)
}

function writeArtifacts(s: Sample, pattern: EmbroideryPattern): void {
  // The loom-renderable pattern file (renderHeroFromPatternFile reads this shape).
  const patternFile = {
    name: s.name,
    title: s.title,
    discipline: 'SURFACE_EMBROIDERY',
    patternFormat: 'SURFACE_VECTOR',
    difficulty: s.difficulty,
    defaultThread: THREAD,
    finishedSizeMm: pattern.meta.finishedSizeMm,
    fabricSpec: { colourHex: pattern.meta.fabricHex ?? '#efe7d6' },
    source: pattern.meta.source,
    palette: pattern.palette,
    legend: pattern.legend,
    steps: pattern.steps,
    stats: pattern.stats,
    stitchedElements: pattern.stitchedElements,
  }
  writeFileSync(resolve(OUT, `${s.name}.pattern.json`), JSON.stringify(patternFile, null, 2))

  // A human-readable guide (legend + steps) for review.
  const lines: string[] = []
  lines.push(`# ${s.title}`)
  lines.push('')
  lines.push(`Path: ${s.path === 'brief' ? 'design brief' : 'reference photo'} | difficulty: ${s.difficulty} | size: ${Math.round(pattern.meta.finishedSizeMm.width)}×${Math.round(pattern.meta.finishedSizeMm.height)}mm`)
  lines.push(`Elements: ${pattern.stats.elements} | regions: ${pattern.stats.regions} | colours: ${pattern.stats.colours} | stitch types: ${pattern.stats.stitchTypes}`)
  lines.push('')
  lines.push('## Floss list (DMC)')
  for (const f of pattern.palette) lines.push(`- ${f.code} ${f.name} (${f.strands} strands) — ${f.elementCount} elements`)
  lines.push('')
  lines.push('## Stitch legend')
  for (const r of pattern.legend) lines.push(`- ${r.symbol}: DMC ${r.code} ${r.name}, ${r.stitchName} — ${r.area} (${r.count})`)
  lines.push('')
  lines.push('## Steps')
  for (const st of pattern.steps) lines.push(`${st.order}. ${st.text}`)
  lines.push('')
  writeFileSync(resolve(OUT, `${s.name}.guide.md`), lines.join('\n'))
}

async function runSample(s: Sample, doHero: boolean, regen: boolean): Promise<void> {
  console.log(`\n=== #${s.n} ${s.title} (${s.path}) ===`)
  const { bitmap } = await designBitmap(s, regen)
  console.log(`  design: ${bitmap.width}x${bitmap.height}`)

  const meta: PatternMeta = {
    name: s.name,
    title: s.title,
    finishedSizeMm: { width: SIZE_MM[s.size], height: SIZE_MM[s.size] },
    fabricHex: s.ground?.fabricHex ?? s.ground?.hex ?? '#efe7d6',
    defaultThread: THREAD,
    strands: 6,
    difficulty: s.difficulty,
    source: s.source,
  }
  const pattern = bitmapToPattern(bitmap, meta, {
    workPx: s.engine?.workPx ?? 400,
    maxColours: s.engine?.maxColours ?? 14,
    minRegionAreaFrac: s.engine?.minRegionAreaFrac,
    groundHint: s.ground?.hex,
  })
  console.log(`  engine: ${pattern.stats.elements} elements, ${pattern.stats.colours} colours, stitches:`, pattern.stats.byStitch)
  writeArtifacts(s, pattern)
  await cpuPreview(pattern, resolve(OUT, `${s.name}.preview.png`))
  // Printable line-art template — the outlines of the SAME shapes the hero
  // stitches (one source of truth). SVG prints at true scale + tiles to pages.
  const svg = patternToLineArtSvg(pattern.stitchedElements, pattern.meta.finishedSizeMm)
  writeFileSync(resolve(OUT, `${s.name}.lineart.svg`), svg)
  await sharp(Buffer.from(svg)).png().toFile(resolve(OUT, `${s.name}.lineart.png`))
  console.log(`  wrote ${s.name}.pattern.json / .guide.md / .preview.png / .lineart.svg+png`)

  if (doHero) {
    console.log('  rendering loom hero (Blender + Fal)…')
    const hero = await renderHero(
      {
        name: s.name,
        stitchedElements: pattern.stitchedElements,
        finishedSizeMm: pattern.meta.finishedSizeMm,
        fabricHex: pattern.meta.fabricHex,
        defaultThread: THREAD,
        strands: 6,
        frame: s.frame ?? { shape: 'auto' },
      },
      { persist: false, outDir: resolve(OUT, 'heroes') },
    )
    console.log(`  hero: ${hero.localHeroPath} (${hero.pathTaken.kind}, gate ${hero.gate.pass ? 'PASS' : 'FAIL'})`)
  }
}

async function main(): Promise<void> {
  loadCredentials()
  const doHero = process.argv.includes('--hero')
  const regen = process.argv.includes('--regen')
  const onlyArg = process.argv.indexOf('--only')
  const only = onlyArg >= 0 ? Number(process.argv[onlyArg + 1]) : null
  const list = only ? SAMPLES.filter((s) => s.n === only) : SAMPLES
  for (const s of list) {
    try {
      await runSample(s, doHero, regen)
    } catch (e) {
      console.error(`  #${s.n} ${s.name} FAILED:`, e instanceof Error ? e.message : String(e))
    }
  }
  console.log(`\nDone. Artifacts in ${OUT}`)
}

main().catch((e) => {
  console.error('pattern-maker FAILED:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
