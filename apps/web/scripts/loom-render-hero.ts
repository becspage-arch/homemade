/**
 * renderHero — the single production entrypoint for the loom hero pipeline.
 *
 * A pattern-generator hands this a pattern's stitched elements; it returns a
 * persisted, fidelity-checked hero image. It encapsulates the whole PROVEN chain
 * (see src/lib/loom/WORKER_BRIEF.md "SOLVED PIPELINE"):
 *
 *   stitchedElements
 *     -> patternToStrokes()              deterministic, exact pattern geometry
 *     -> strokesToBlenderScene()         scene JSON (+ tame over-saturated greens)
 *     -> loom_render.py (Blender)        photoreal BASE (raking light, linen, hoop)
 *     -> falCreativeUpscale()            LOCKED creative-upscale: thread texture, no drift
 *     -> fidelityGate()                  prove no drift; auto-retry / fall back
 *     -> r2Upload()                      persist the PNG to our image store
 *
 * This is BUILD-TIME tooling, exactly like the Fal photo-hero pipeline — Blender
 * + Fal run where patterns are generated (a worker / local box), NEVER in the
 * live ECS server. The public site only ever serves the persisted image.
 *
 * Programmatic:
 *   import { renderHero } from './loom-render-hero'
 *   const hero = await renderHero({ name, stitchedElements, finishedSizeMm, ... })
 *
 * CLI proof (reads a *.pattern.json — stitchedElements + size + fabric):
 *   cd apps/web && npx tsx scripts/loom-render-hero.ts <pattern.json> [name] [--no-persist]
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, isAbsolute } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

import { patternToStrokes, type StitchedElement } from '../src/lib/loom/render/renderPattern'
import { strokesToBlenderScene } from '../src/lib/loom/render/blenderScene'
import { loadCredentials, falCreativeUpscale } from './loom-hybrid-fal'
import { fidelityGate, type FidelityVerdict } from './loom-fidelity-gate'
import { r2UploadScript } from './import-lib/r2-script'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_MAIN = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

const DEFAULT_BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

export interface RenderHeroInput {
  /** Slug-ish name; drives output filenames + the persisted hero filename. */
  name: string
  /** The pattern's bound stitch elements — the exact geometry + stitch + colour. */
  stitchedElements: StitchedElement[]
  /** Finished size in millimetres (the fabric plane the loom renders onto). */
  finishedSizeMm: { width: number; height: number }
  /** Linen/aida ground colour. Defaults to the warm even-weave linen we use. */
  fabricHex?: string
  /** Default thread when an element doesn't carry its own. */
  defaultThread?: { type: string; weight: string } | null
  /** Strand count for stranded floss (perle/metallic ignore it). Default 6. */
  strands?: number
}

export interface RenderHeroOptions {
  /** Absolute path to blender.exe. Defaults to $LOOM_BLENDER or the known box. */
  blenderExe?: string
  /** Cycles samples for the base render. Default 200. */
  samples?: number
  /** Starting Fal creativity. Default 0.5 (the lock). Retries step down from here. */
  creativity?: number
  /** Fal resemblance. Default 0.85 (the lock). */
  resemblance?: number
  /** Creativity ladder to try on a gate FAIL before falling back to base. */
  retryCreativity?: number[]
  /** Scratch dir for scene/base/final PNGs. Default ../../.loom-scratch/heroes. */
  outDir?: string
  /** R2 key prefix for the persisted hero. Default 'patterns/loom'. */
  r2Prefix?: string
  /** Pull over-saturated greens down a touch (cosmetic). Default true. */
  tameGreens?: boolean
  /** Pull highly-saturated warm reds/pinks down so AgX doesn't skew them orange. Default false. */
  tameWarm?: boolean
  /** Persist the chosen hero to R2. Default true; false = local-only proof. */
  persist?: boolean
  /** Override the fidelity-gate thresholds (defaults are the calibrated lock). */
  gateThresholds?: { structMin?: number; colourMax?: number }
}

export type HeroPath =
  | { kind: 'upscale'; creativity: number }
  | { kind: 'base-fallback' }

export interface RenderHeroResult {
  name: string
  /** The chosen hero on disk (the upscaled final, or the base on fallback). */
  localHeroPath: string
  /** The deterministic Blender base (always produced). */
  localBasePath: string
  /** The Blender scene JSON. */
  localScenePath: string
  width: number
  height: number
  bytes: number
  /** Which path produced the shipped hero. */
  pathTaken: HeroPath
  /** The winning gate verdict (base-vs-base is a trivial pass on fallback). */
  gate: FidelityVerdict
  /** Every gate attempt, in order, for the log trail. */
  attempts: Array<{ path: HeroPath; verdict: FidelityVerdict }>
  /** R2 result, when persisted. */
  r2?: { key: string; publicUrl: string }
}

function resolveBlender(opts: RenderHeroOptions): string {
  const exe = opts.blenderExe ?? process.env.LOOM_BLENDER ?? DEFAULT_BLENDER
  if (!existsSync(exe)) {
    throw new Error(
      `Blender not found at ${exe}. Set $LOOM_BLENDER or pass { blenderExe }. ` +
        'The loom hero render needs Blender (Cycles) on the box that generates patterns.',
    )
  }
  return exe
}

/** Run loom_render.py to produce the photoreal base. Throws on a Blender error. */
function blenderRenderBase(
  blenderExe: string,
  scenePath: string,
  basePath: string,
  samples: number,
): void {
  const script = resolve(__dirname, 'loom_render.py')
  const args = [
    '--background',
    '--factory-startup',
    '--python',
    script,
    '--',
    resolve(scenePath),
    resolve(basePath),
    String(samples),
  ]
  const res = spawnSync(blenderExe, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (res.status !== 0 || !existsSync(basePath)) {
    const tail = `${res.stdout ?? ''}\n${res.stderr ?? ''}`.trim().slice(-1200)
    throw new Error(`Blender base render failed (exit ${res.status}).\n${tail}`)
  }
}

async function pngSize(path: string): Promise<{ width: number; height: number; bytes: number }> {
  const meta = await sharp(path).metadata()
  const bytes = readFileSync(path).length
  return { width: meta.width ?? 0, height: meta.height ?? 0, bytes }
}

/**
 * Render, fidelity-check, and persist a hero. The gate is automated: a passing
 * upscale ships; a FAIL retries at progressively lower creativity (more
 * faithful); if every upscale still drifts, it falls back to the deterministic
 * base — so a drifted hero is NEVER shipped.
 */
export async function renderHero(
  input: RenderHeroInput,
  options: RenderHeroOptions = {},
): Promise<RenderHeroResult> {
  loadCredentials()
  const blenderExe = resolveBlender(options)
  const samples = options.samples ?? 200
  const startCreativity = options.creativity ?? 0.5
  const resemblance = options.resemblance ?? 0.85
  const ladder = options.retryCreativity ?? [0.35, 0.2]
  const persist = options.persist ?? true
  const outDir = resolve(options.outDir ?? resolve(__dirname, '../../../.loom-scratch/heroes'))
  mkdirSync(outDir, { recursive: true })

  const safe = input.name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
  const scenePath = resolve(outDir, `${safe}.scene.json`)
  const basePath = resolve(outDir, `${safe}.base.png`)

  // 1. exact geometry -> strokes -> scene (greens tamed in the scene builder).
  const strokes = patternToStrokes(input.stitchedElements, {
    strands: input.strands ?? 6,
    defaultThread: input.defaultThread ?? null,
  })
  const scene = strokesToBlenderScene(
    strokes,
    { widthMm: input.finishedSizeMm.width, heightMm: input.finishedSizeMm.height, hex: input.fabricHex ?? '#e3d8c0' },
    { tameGreens: options.tameGreens ?? true, tameWarm: options.tameWarm ?? false },
  )
  writeFileSync(scenePath, JSON.stringify(scene))
  log(`[loom:${safe}] ${input.stitchedElements.length} elements -> ${strokes.length} strokes -> scene`)

  // 2. photoreal base in Blender (deterministic; the exact pattern).
  blenderRenderBase(blenderExe, scenePath, basePath, samples)
  log(`[loom:${safe}] base rendered: ${basePath}`)

  // 3. creative-upscale finish + automated fidelity gate, with retry/fallback.
  const attempts: RenderHeroResult['attempts'] = []
  const creativities = [startCreativity, ...ladder]
  let chosen: { heroPath: string; pathTaken: HeroPath; verdict: FidelityVerdict } | null = null

  for (const creativity of creativities) {
    const finalPath = resolve(outDir, `${safe}.final-c${String(creativity).replace('.', '')}.png`)
    try {
      await falCreativeUpscale(basePath, finalPath, creativity, resemblance)
    } catch (e) {
      log(`[loom:${safe}] upscale@${creativity} errored: ${e instanceof Error ? e.message : String(e)}`)
      continue
    }
    const verdict = await fidelityGate(basePath, finalPath, options.gateThresholds)
    const path: HeroPath = { kind: 'upscale', creativity }
    attempts.push({ path, verdict })
    log(
      `[loom:${safe}] upscale@${creativity}: structure=${verdict.structureScore} ` +
        `colour=${verdict.colourDelta} -> ${verdict.pass ? 'PASS' : 'FAIL'}`,
    )
    if (verdict.pass) {
      chosen = { heroPath: finalPath, pathTaken: path, verdict }
      break
    }
  }

  if (!chosen) {
    // Every upscale drifted (or errored) — ship the deterministic base. It IS the
    // exact pattern, so it is fidelity-perfect by construction.
    const verdict = await fidelityGate(basePath, basePath)
    chosen = { heroPath: basePath, pathTaken: { kind: 'base-fallback' }, verdict }
    log(`[loom:${safe}] all upscales failed the gate -> fell back to the deterministic base`)
  }

  const { width, height, bytes } = await pngSize(chosen.heroPath)
  const result: RenderHeroResult = {
    name: input.name,
    localHeroPath: chosen.heroPath,
    localBasePath: basePath,
    localScenePath: scenePath,
    width,
    height,
    bytes,
    pathTaken: chosen.pathTaken,
    gate: chosen.verdict,
    attempts,
  }

  // 4. persist to R2 (same store the other heroes use).
  if (persist) {
    const buf = readFileSync(chosen.heroPath)
    const { key, publicUrl } = await r2UploadScript(buf, 'image/png', {
      filename: `${safe}-hero.png`,
      prefix: options.r2Prefix ?? 'patterns/loom',
    })
    result.r2 = { key, publicUrl }
    log(`[loom:${safe}] persisted hero -> ${publicUrl} (${describePath(chosen.pathTaken)})`)
  } else {
    log(`[loom:${safe}] persist=false — local hero only: ${chosen.heroPath}`)
  }

  return result
}

function describePath(p: HeroPath): string {
  return p.kind === 'upscale' ? `creative-upscale @${p.creativity}` : 'deterministic base (fallback)'
}

function log(msg: string): void {
  console.log(msg)
}

// ---- shapes a *.pattern.json carries (loom fixtures + Studio output) ----
interface PatternFile {
  name?: string
  finishedSizeMm?: { width: number; height: number }
  fabricSpec?: { colourHex?: string | null }
  defaultThread?: { type: string; weight: string } | null
  stitchedElements: StitchedElement[]
}

/** Read a *.pattern.json and render its hero — the generator-agnostic path. */
export async function renderHeroFromPatternFile(
  patternPath: string,
  options: RenderHeroOptions & { name?: string } = {},
): Promise<RenderHeroResult> {
  const abs = isAbsolute(patternPath) ? patternPath : resolve(process.cwd(), patternPath)
  const data = JSON.parse(readFileSync(abs, 'utf8')) as PatternFile
  if (!Array.isArray(data.stitchedElements) || data.stitchedElements.length === 0) {
    throw new Error(`${abs}: no stitchedElements to render`)
  }
  const name = options.name ?? data.name ?? 'pattern'
  return renderHero(
    {
      name,
      stitchedElements: data.stitchedElements,
      finishedSizeMm: data.finishedSizeMm ?? { width: 150, height: 150 },
      fabricHex: data.fabricSpec?.colourHex ?? undefined,
      defaultThread: data.defaultThread ?? null,
    },
    options,
  )
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => a !== '--no-persist')
  const persist = !process.argv.includes('--no-persist')
  const patternPath = args[0]
  if (!patternPath) {
    console.error('usage: loom-render-hero.ts <pattern.json> [name] [--no-persist]')
    process.exit(2)
  }
  const result = await renderHeroFromPatternFile(patternPath, { name: args[1], persist })
  console.log('\n=== renderHero result ===')
  console.log(
    JSON.stringify(
      {
        name: result.name,
        pathTaken: describePath(result.pathTaken),
        gate: result.gate,
        size: `${result.width}x${result.height}`,
        bytes: result.bytes,
        hero: result.r2?.publicUrl ?? result.localHeroPath,
        attempts: result.attempts.map((a) => ({ path: describePath(a.path), ...a.verdict })),
      },
      null,
      2,
    ),
  )
}

if (IS_MAIN) {
  main().catch((e) => {
    console.error('[loom-render-hero] FAILED:', e instanceof Error ? e.message : String(e))
    process.exit(1)
  })
}
