/**
 * Studio "locate" model for a dense surface-embroidery pattern — the data the
 * Studio needs to let a stitcher SELECT a colour or an area and SEE WHERE it is
 * on the design (mirroring the cross-stitch chart's select-and-isolate flow).
 *
 * Built (server-side, at request time) from the same stored stitch data the loom
 * renders, so it can never drift from the finished piece:
 *   - an interactive colour map SVG where every stitch carries its floss number
 *     (`data-f`) and its area id (`data-r`), so the Studio highlights by toggling
 *     a tiny injected CSS rule — no per-stitch React nodes, no laggy re-render;
 *   - the floss list (each colour + how many stitches use it);
 *   - the area list (the major shapes — derived from the pattern's outline — each
 *     with a human label, its stitch count and the colours that fill it).
 *
 * Pure + dependency-light so the Studio page can compute it on the server and
 * ship only the result (not the thousands of raw stitches).
 */

import type { StitchedElement } from '../loom/render/renderPattern'
import type { OutlinePath } from './illustration-engine'

export interface LocateFloss {
  number: number
  code: string
  name: string
  hex: string
  count: number
}

export interface LocateArea {
  /** Colour-family id (see FAMILIES) — also the `data-r` on each stitch. */
  id: number
  label: string
  count: number
  /** Floss numbers in this family, most-used first (for the colour chips). */
  flossNumbers: number[]
}

/**
 * Areas for a dense thread-painting piece = COLOUR FAMILIES, not spatial boxes.
 * That's how the work is actually approached (do the greens of the leaves, the
 * pinks of the petals, the cream highlights), and for a colour-organised subject
 * a family lights up its part of the design (greens → the leaves). Far more
 * useful than overlapping segmentation polygons that all sit on the centre.
 */
const FAMILIES: { id: number; name: string }[] = [
  { id: 0, name: 'Pinks & reds' },
  { id: 1, name: 'Oranges & golds' },
  { id: 2, name: 'Yellows' },
  { id: 3, name: 'Greens' },
  { id: 4, name: 'Teals & blues' },
  { id: 5, name: 'Purples' },
  { id: 6, name: 'Browns' },
  { id: 7, name: 'Creams & neutrals' },
  { id: 8, name: 'Darks' },
]

function familyOf(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255) as [number, number, number]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
  if (l < 0.16) return 8 // darks
  if (s < 0.12) return 7 // creams / neutrals / greys / whites
  let h: number
  if (max === r) h = ((g - b) / (max - min)) % 6
  else if (max === g) h = (b - r) / (max - min) + 2
  else h = (r - g) / (max - min) + 4
  h = (h * 60 + 360) % 360
  if (h >= 20 && h < 45 && l < 0.45) return 6 // browns (dark oranges)
  if (h < 20 || h >= 340) return 0 // pinks & reds
  if (h < 45) return 1 // oranges & golds
  if (h < 70) return 2 // yellows
  if (h < 170) return 3 // greens
  if (h < 255) return 4 // teals & blues
  if (h < 320) return 5 // purples
  return 0 // magentas → pinks
}

export interface LocateModel {
  mapSvg: string
  floss: LocateFloss[]
  areas: LocateArea[]
  sizeMm: { width: number; height: number }
}

type FlossKeyRow = { number: number; code: string; name: string; hex: string }

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function elementHex(el: StitchedElement): string {
  if (el.shade?.ramp?.length) return el.shade.ramp[Math.floor(el.shade.ramp.length / 2)]!
  return el.colourHex
}

export function buildLocateModel(
  elements: StitchedElement[],
  outline: OutlinePath[] | undefined,
  flossKey: FlossKeyRow[],
  sizeMm: { width: number; height: number },
): LocateModel {
  // hex → floss number (the engine snaps every stitch to a DMC, so most hit
  // exactly; anything that doesn't falls back to the nearest key colour).
  const byHex = new Map<string, FlossKeyRow>()
  for (const f of flossKey) byHex.set(f.hex.toLowerCase(), f)
  const keyRgb = flossKey.map((f) => ({ f, rgb: hexToRgb(f.hex) }))
  const nearestCache = new Map<string, number>()
  const flossNumberFor = (hex: string): number => {
    const k = hex.toLowerCase()
    const exact = byHex.get(k)
    if (exact) return exact.number
    const cached = nearestCache.get(k)
    if (cached !== undefined) return cached
    const [r, g, b] = hexToRgb(hex)
    let best = keyRgb[0]?.f.number ?? 0
    let bd = Infinity
    for (const { f, rgb } of keyRgb) {
      const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2
      if (d < bd) {
        bd = d
        best = f.number
      }
    }
    nearestCache.set(k, best)
    return best
  }

  const flossCount = new Map<number, number>()
  const familyCount = new Map<number, number>()
  const familyFloss = new Map<number, Map<number, number>>()
  const familyOfFloss = new Map<number, number>()
  const sw = Math.max(0.4, sizeMm.width / 300)
  let stitches = ''
  for (const el of elements) {
    const hex = elementHex(el)
    const fn = flossNumberFor(hex)
    let fam = familyOfFloss.get(fn)
    if (fam === undefined) {
      fam = familyOf(hex)
      familyOfFloss.set(fn, fam)
    }
    flossCount.set(fn, (flossCount.get(fn) ?? 0) + 1)
    familyCount.set(fam, (familyCount.get(fam) ?? 0) + 1)
    let fm = familyFloss.get(fam)
    if (!fm) {
      fm = new Map()
      familyFloss.set(fam, fm)
    }
    fm.set(fn, (fm.get(fn) ?? 0) + 1)
    const g = el.geometry
    const pts = g.points
    if (pts && pts.length >= 2) {
      const x1 = r2(pts[0]![0])
      const y1 = r2(pts[0]![1])
      const x2 = r2(pts[pts.length - 1]![0])
      const y2 = r2(pts[pts.length - 1]![1])
      stitches += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hex}" data-f="${fn}" data-r="${fam}"/>`
    } else if (g.at) {
      stitches += `<circle cx="${r2(g.at[0])}" cy="${r2(g.at[1])}" r="${r2(sw)}" fill="${hex}" data-f="${fn}" data-r="${fam}"/>`
    }
  }

  // Outline overlay so the shapes read on top of the colour.
  let outlineBody = ''
  for (const p of outline ?? []) {
    if (p.points.length < 3) continue
    const d = p.points.map((q) => `${r2(q[0])},${r2(q[1])}`).join(' ')
    const w = p.kind === 'silhouette' ? sw * 1.1 : sw * 0.7
    outlineBody += `<polygon points="${d}" fill="none" stroke="#1b2a4a" stroke-width="${r2(w)}" stroke-linejoin="round"/>`
  }

  const W = r2(sizeMm.width)
  const H = r2(sizeMm.height)
  const mapSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">` +
    `<rect width="100%" height="100%" fill="#f1ead9"/>` +
    `<g class="nw-stitches" stroke-width="${r2(sw)}" stroke-linecap="round">${stitches}</g>` +
    `<g class="nw-outline">${outlineBody}</g>` +
    `</svg>`

  const flossByNumber = new Map(flossKey.map((f) => [f.number, f]))
  const floss: LocateFloss[] = [...flossCount.entries()]
    .map(([number, count]) => {
      const f = flossByNumber.get(number)
      return { number, code: f?.code ?? '', name: f?.name ?? `#${number}`, hex: f?.hex ?? '#000', count }
    })
    .sort((a, b) => b.count - a.count)

  // Drop families that are just a few stray stitches — they aren't a real "area".
  const areaMin = Math.max(12, Math.round(elements.length * 0.004))
  const areas: LocateArea[] = FAMILIES.map((fam) => {
    const fm = familyFloss.get(fam.id) ?? new Map<number, number>()
    const flossNumbers = [...fm.entries()].sort((x, y) => y[1] - x[1]).map((e) => e[0])
    return { id: fam.id, label: fam.name, count: familyCount.get(fam.id) ?? 0, flossNumbers }
  })
    .filter((a) => a.count >= areaMin)
    .sort((a, b) => b.count - a.count)

  return { mapSvg, floss, areas, sizeMm }
}
