/**
 * Thread: materials + the bridge from stitch geometry to the rasteriser.
 *
 * A `ThreadStroke` is the single thing every stitch primitive produces: a
 * polyline path through the fabric plane (millimetres), at some small height
 * above the fabric, of a given thread radius and material. A back stitch is one
 * stroke; a satin block is many parallel strokes; a French knot is one tightly-
 * coiled stroke. Always real thread, never a faked shape.
 *
 * Realism comes from rendering each stroke as its actual STRANDS, not one smooth
 * tube. Stranded cotton is several fine filaments twisted gently together; perlé
 * is a tight two-ply cord. We splat each filament as it spirals around the
 * bundle — that is what gives floss its grooves, its directional sheen and its
 * "real thread under macro" read, instead of a plastic-looking pipe.
 */

import type { Vec2 } from '../core/vec'
import { parseHex, type Rgb } from '../core/color'
import { valueNoise3 } from '../core/noise'
import type { Framebuffer, Material, ThreadSeg } from './framebuffer'

/** A length of laid thread the renderer can draw. */
export interface ThreadStroke {
  /** Path through the fabric plane, in millimetres. >= 2 points. */
  path: Vec2[]
  /** Base height above the fabric, in mm (the thread sits proud of the cloth). */
  z0: number
  /** Extra height at the path midpoint, in mm — the raised arch of a stitch. */
  arch: number
  /** Bundle radius in mm (set by strand count). */
  radiusMm: number
  /** How many filaments make up the bundle (the visible strands). */
  filaments: number
  /** Twists per millimetre of the bundle — how tightly the strands spiral. */
  twistPerMm: number
  material: Material
  /** Stable seed for deterministic micro-wobble + shading. */
  seed: number
}

/**
 * Thread material presets. Colour is set per-stroke (the floss colour); these
 * carry the fibre character — how it catches light, and how its strands lie.
 */
export type ThreadKind = 'stranded-cotton' | 'perle-cotton' | 'crewel-wool' | 'silk' | 'metallic'

interface KindSpec extends Omit<Material, 'colour'> {
  /** Default filaments + twist for this thread kind. */
  twistPerMm: number
}

const KINDS: Record<ThreadKind, KindSpec> = {
  // Stranded cotton: gentle twist, mid sheen — the workhorse.
  'stranded-cotton': { sheen: 0.62, shininess: 18, plyPerMm: 0.0, halo: 0.14, twistPerMm: 0.16 },
  // Perlé: a tight 2-ply cord, glossier, strong visible twist.
  'perle-cotton': { sheen: 0.72, shininess: 22, plyPerMm: 0.0, halo: 0.1, twistPerMm: 0.5 },
  'crewel-wool': { sheen: 0.32, shininess: 10, plyPerMm: 0.0, halo: 0.45, twistPerMm: 0.2 },
  silk: { sheen: 0.9, shininess: 32, plyPerMm: 0.0, halo: 0.05, twistPerMm: 0.12 },
  metallic: { sheen: 1.0, shininess: 46, plyPerMm: 0.0, halo: 0.0, twistPerMm: 0.6 },
}

export function material(kind: ThreadKind, hex: string): Material {
  const { twistPerMm, ...mat } = KINDS[kind]
  void twistPerMm
  return { colour: parseHex(hex), ...mat }
}

/** Default filament count + twist for a thread kind at a strand count. */
export function threadStructure(kind: ThreadKind, strands: number): { filaments: number; twistPerMm: number } {
  if (kind === 'perle-cotton') return { filaments: 2, twistPerMm: KINDS[kind].twistPerMm }
  if (kind === 'metallic') return { filaments: 3, twistPerMm: KINDS[kind].twistPerMm }
  // Stranded threads show one filament per strand (capped so it stays legible).
  return { filaments: Math.max(2, Math.min(6, Math.round(strands))), twistPerMm: KINDS[kind].twistPerMm }
}

/**
 * Radius (mm) of a laid bundle for a given strand count of stranded cotton.
 * One DMC strand is ~0.4 mm; bundled strands round up sub-linearly.
 */
export function strandRadiusMm(strands: number): number {
  return 0.42 * Math.sqrt(Math.max(1, strands)) * 0.62
}

/**
 * Tessellate a stroke into its filaments and splat them. Each filament spirals
 * around the bundle centreline (a gentle helix): its lateral offset and its
 * height both rotate with the twist, so some strands ride on top (lit) and some
 * tuck behind (shadowed) — the z-buffer sorts them and the grooves fall out for
 * free. `pps` = pixels per millimetre at the (supersampled) render resolution.
 */
export function splatStroke(fb: Framebuffer, stroke: ThreadStroke, pps: number): void {
  const { path, material: mat, radiusMm, z0, arch, seed } = stroke
  if (path.length < 2) return
  const nFil = Math.max(1, Math.round(stroke.filaments))
  // Filament radius: fills the bundle, slightly overlapping for no gaps.
  const rFil = (radiusMm / Math.sqrt(nFil)) * 0.92
  const spread = Math.max(0, radiusMm - rFil)
  const rFilPx = rFil * pps
  const twist = stroke.twistPerMm

  // Arc-length table for arch + twist continuity.
  const cum: number[] = [0]
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1]! + Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y))
  }
  const total = cum[cum.length - 1]! || 1e-6
  const step = 0.3
  const heightAt = (u: number): number => z0 + arch * Math.sin(Math.PI * Math.min(1, Math.max(0, u)))
  const wob = (d: number): number => valueNoise3(d * 0.7 + seed, 11.1, seed * 0.3) - 0.5

  for (let f = 0; f < nFil; f++) {
    const basePhase = (2 * Math.PI * f) / nFil + seed * 0.7
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!
      const b = path[i]!
      const legLen = Math.hypot(b.x - a.x, b.y - a.y)
      if (legLen < 1e-6) continue
      const n = Math.max(1, Math.round(legLen / step))
      const dirx = (b.x - a.x) / legLen
      const diry = (b.y - a.y) / legLen
      const nx = -diry // in-plane perpendicular
      const ny = dirx
      for (let k = 0; k < n; k++) {
        const t0 = k / n
        const t1 = (k + 1) / n
        const d0 = cum[i - 1]! + legLen * t0
        const d1 = cum[i - 1]! + legLen * t1
        const ph0 = d0 * twist * 2 * Math.PI + basePhase
        const ph1 = d1 * twist * 2 * Math.PI + basePhase
        // Helix: lateral offset in-plane + height offset out-of-plane.
        const lat0 = Math.cos(ph0) * spread + wob(d0) * radiusMm * 0.12
        const lat1 = Math.cos(ph1) * spread + wob(d1) * radiusMm * 0.12
        const zoff0 = Math.sin(ph0) * spread * 0.55
        const zoff1 = Math.sin(ph1) * spread * 0.55
        const p0x = a.x + dirx * legLen * t0 + nx * lat0
        const p0y = a.y + diry * legLen * t0 + ny * lat0
        const p1x = a.x + dirx * legLen * t1 + nx * lat1
        const p1y = a.y + diry * legLen * t1 + ny * lat1
        const z0h = heightAt(d0 / total) + zoff0
        const z1h = heightAt(d1 / total) + zoff1

        const seg: ThreadSeg = {
          av: { x: p0x, y: -p0y, z: z0h },
          bv: { x: p1x, y: -p1y, z: z1h },
          ax: p0x * pps,
          ay: p0y * pps,
          bx: p1x * pps,
          by: p1y * pps,
          r: rFilPx,
          along: d0,
          material: mat,
          seed: seed + f * 1.7 + i * 0.137 + k * 0.0193,
        }
        fb.splat(seg)
      }
    }
  }
}

/**
 * The 3D filament polylines of a stroke, in millimetres (x, y, z) — the same
 * helix the raster splats, but emitted as geometry for the path-traced backend
 * (Blender). Each filament becomes a real curve there. `y` is in the loom's
 * y-down convention; the renderer flips it.
 */
export function filamentPolylines(stroke: ThreadStroke): {
  radiusMm: number
  filaments: { x: number; y: number; z: number }[][]
} {
  const { path, radiusMm, z0, arch, seed } = stroke
  const out: { x: number; y: number; z: number }[][] = []
  const nFil = Math.max(1, Math.round(stroke.filaments))
  const rFil = (radiusMm / Math.sqrt(nFil)) * 0.92
  const spread = Math.max(0, radiusMm - rFil)
  const twist = stroke.twistPerMm
  if (path.length < 2) return { radiusMm: rFil, filaments: out }

  const cum: number[] = [0]
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1]! + Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y))
  }
  const total = cum[cum.length - 1]! || 1e-6
  const step = 0.3
  const heightAt = (u: number): number => z0 + arch * Math.sin(Math.PI * Math.min(1, Math.max(0, u)))
  const wob = (d: number): number => valueNoise3(d * 0.7 + seed, 11.1, seed * 0.3) - 0.5

  for (let f = 0; f < nFil; f++) {
    const basePhase = (2 * Math.PI * f) / nFil + seed * 0.7
    const pts: { x: number; y: number; z: number }[] = []
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!
      const b = path[i]!
      const legLen = Math.hypot(b.x - a.x, b.y - a.y)
      if (legLen < 1e-6) continue
      const n = Math.max(1, Math.round(legLen / step))
      const dirx = (b.x - a.x) / legLen
      const diry = (b.y - a.y) / legLen
      const nx = -diry
      const ny = dirx
      const start = i === 1 ? 0 : 1 // avoid duplicating shared leg endpoints
      for (let k = start; k <= n; k++) {
        const t = k / n
        const d = cum[i - 1]! + legLen * t
        const ph = d * twist * 2 * Math.PI + basePhase
        const lat = Math.cos(ph) * spread + wob(d) * radiusMm * 0.12
        const zoff = Math.sin(ph) * spread * 0.55
        pts.push({
          x: a.x + dirx * legLen * t + nx * lat,
          y: a.y + diry * legLen * t + ny * lat,
          z: heightAt(d / total) + zoff,
        })
      }
    }
    if (pts.length >= 2) out.push(pts)
  }
  return { radiusMm: rFil, filaments: out }
}

export type { Material, Rgb }
