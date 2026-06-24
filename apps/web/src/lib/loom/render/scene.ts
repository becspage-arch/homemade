/**
 * The scene renderer — the loom's public render entrypoint for flat embroidery.
 *
 * Hand it a fabric ground + a flat list of thread strokes (whatever the stitch
 * library and placement engine produced from a pattern) and it returns a
 * developed RGBA image. It does NOT know about stitches or patterns: it renders
 * thread on cloth, identically for our designs and a user's. That is the
 * render-only boundary — generation lives upstream, the loom just draws.
 */

import { normalize, v } from '../core/vec'
import { Framebuffer, type Lights } from './framebuffer'
import { paintFabric, type FabricOpts } from './fabric'
import { splatStroke, type ThreadStroke } from './thread'

export interface RenderOpts {
  /** Canvas size in millimetres (the embroidered area shown). */
  widthMm: number
  heightMm: number
  /** Output resolution: pixels per millimetre (before supersampling). */
  pxPerMm: number
  /** Supersample factor (2 for iteration, 3 for a crisp final). */
  ss: number
  fabric: FabricOpts
  strokes: ThreadStroke[]
}

function defaultLights(): Lights {
  return {
    // Key from upper-left, tipped toward the viewer — classic hoop-shot light.
    key: normalize(v(-0.5, 0.62, 0.6)),
    ambient: 0.34,
    fill: 0.16,
    skyTint: { r: 1.0, g: 1.01, b: 1.04 },
    groundTint: { r: 1.04, g: 0.99, b: 0.94 },
  }
}

export function renderEmbroidery(opts: RenderOpts): { data: Buffer; width: number; height: number } {
  const ss = Math.max(1, Math.round(opts.ss))
  const pps = opts.pxPerMm * ss
  const W = Math.round(opts.widthMm * pps)
  const H = Math.round(opts.heightMm * pps)

  const lights = defaultLights()
  const fb = new Framebuffer(W, H, lights)

  // 1. The cloth.
  paintFabric(fb, opts.fabric, pps)

  // 2. Every thread stroke, in order (later stitches lie over earlier ones).
  for (const stroke of opts.strokes) splatStroke(fb, stroke, pps)

  // 3. Depth cues: soft crevice AO + the soft shadow each raised stitch casts.
  fb.ambientOcclusion(1.8 * ss, 0.32)
  // Screen-space direction toward the light (screen y is down, view y is up).
  const k = lights.key
  const lx = k.x
  const ly = -k.y
  const ll = Math.hypot(lx, ly) || 1
  fb.directionalShadow({
    lx: lx / ll,
    ly: ly / ll,
    steps: 14,
    stepPx: 1.1 * ss,
    bias: 0.12,
    range: 1.1,
    strength: 0.28,
  })

  // 4. Photographic finish — punchy, macro, lightly vignetted.
  return fb.develop({
    ss,
    bloom: 0.07,
    grain: 0.22,
    vignette: 0.1,
    exposure: 1.02,
    saturation: 1.3,
    contrast: 1.16,
    dof: 0.22,
  })
}
