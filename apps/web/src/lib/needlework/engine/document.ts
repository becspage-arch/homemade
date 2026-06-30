/**
 * Pattern DOCUMENT builder — the printable deliverable, derived from ONE
 * structured dataset (per-element geometry + stitch slug + DMC floss + optional
 * shade ramp). The loom's renderHero renders the SAME elements as the photoreal
 * hero, so document and hero can never diverge. Mirrors a professional pattern:
 * a colour guide (line drawing labelled [stitch-letter][colour-number]), a clean
 * technical chart (the transfer template), a numbered floss key, a lettered
 * stitch key, and the worked steps.
 *
 * Reusable service behind both our own catalogue and the customer
 * "describe an idea -> your own pattern" feature.
 */

import { nearestDmcFull } from '../../floss/dmc-full'
import { patternToGuideSvg } from './guide'
import { outlineToSvg, overlayOutline } from './outline'
import type { OutlinePath } from '../illustration-engine'
import type { StitchedElement } from '../../loom/render/renderPattern'

/** Canonical stitch names + a one-line how-to for the stitch key. */
const STITCH_INFO: Record<string, { name: string; how: string }> = {
  stem: { name: 'Stem stitch', how: 'Overlapping slanted stitches worked along a line — smooth stems, outlines and lettering.' },
  outline: { name: 'Outline stitch', how: 'The mirror twist of stem stitch, for a fine raised line.' },
  back: { name: 'Back stitch', how: 'Even stitches worked backwards along a line — fine continuous outlines.' },
  split: { name: 'Split stitch', how: 'Each stitch splits the previous — a fine textured line and a shading base.' },
  running: { name: 'Running stitch', how: 'Simple dashed line, in and out at an even spacing.' },
  straight: { name: 'Straight stitch', how: 'A single flat stitch — spokes, rays, stamens and scattered fillings.' },
  satin: { name: 'Satin stitch', how: 'Parallel stitches packed edge to edge to fill a small shape with a smooth sheen.' },
  'padded-satin': { name: 'Padded satin', how: 'Satin worked over a padding stitch for a raised, domed fill.' },
  'long-and-short': { name: 'Long and short stitch', how: 'Alternating long and short stitches in graded shades — painterly needle-painting fills that blend.' },
  fern: { name: 'Fern stitch', how: 'Three straight stitches from a point, repeated down a line — leaf veins and fronds.' },
  'detached-chain': { name: 'Lazy daisy', how: 'A single chain loop held with a tiny tacking stitch at the tip — petals and leaves.' },
  'french-knot': { name: 'French knot', how: 'Thread wrapped round the needle and pulled through — dotted centres, stamens and texture.' },
  'colonial-knot': { name: 'Colonial knot', how: 'A firmer figure-eight knot — candlewicking and dense texture.' },
  seed: { name: 'Seed stitch', how: 'Tiny straight stitches scattered at random — light filling and texture.' },
  'woven-wheel': { name: 'Woven wheel', how: 'Thread woven over an odd number of spokes into a raised rose.' },
  'ribbed-spider-web': { name: 'Ribbed spider web', how: 'Thread whipped around spokes into a raised spoked wheel.' },
  'buttonhole-wheel': { name: 'Buttonhole wheel', how: 'Buttonhole stitches worked in a ring — flowers and eyelets.' },
}

export interface FlossRow { number: number; code: string; name: string; hex: string; /** Worked elements in this colour. */ count: number }
export interface StitchRow { letter: string; slug: string; name: string; how: string }
export interface ElementLabel { x: number; y: number; /** e.g. 'C1' = stitch C, colour 1. */ text: string }
export interface PatternDocument {
  title: string
  finishedSizeMm: { width: number; height: number }
  flossKey: FlossRow[]
  stitchKey: StitchRow[]
  steps: string[]
  /** One label per (stitch, colour) group, at the group's centre. */ labels: ElementLabel[]
  /** Clean transfer template (line drawing). */ technicalChartSvg: string
  /** The working guide: for shape patterns the labelled colour guide; for dense
   *  thread-painting the colour/stitch-direction map with the outline overlaid. */ colourGuideSvg: string
  /** Dense patterns only — a clean traceable outline, separate from the dense map,
   *  registered to the same coordinates (undefined for shape/vector patterns). */ outlineSvg?: string
  /** Dense patterns only — the dense colour/stitch-direction map (the working
   *  guide), with the outline overlaid so it visibly registers. */ denseMapSvg?: string
  /** True for a dense thread-painting pattern (stitch field + derived outline). */ isDense: boolean
}

function baseSlug(s: string): string {
  return s.replace(/^embroidery-/, '')
}

function geomCentre(el: StitchedElement): [number, number] {
  const g = el.geometry
  if (g.at) return g.at
  const pts = g.points ?? []
  if (!pts.length) return [0, 0]
  let sx = 0
  let sy = 0
  for (const p of pts) {
    sx += p[0]
    sy += p[1]
  }
  return [sx / pts.length, sy / pts.length]
}

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Rough area of an element — to pick the LARGEST region of a (stitch,colour)
 *  group as the natural home for its label (a centroid average piles symmetric
 *  items onto the centre line). */
function elementArea(el: StitchedElement): number {
  const g = el.geometry
  if (g.kind === 'disc') return Math.PI * (g.radiusMm ?? 1) ** 2
  const pts = g.points
  if (g.kind === 'point' || !pts) return 1
  if (pts.length < 3) {
    return pts.length === 2 ? Math.hypot(pts[1]![0] - pts[0]![0], pts[1]![1] - pts[0]![1]) : 0.5
  }
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    a += pts[i]![0] * pts[j]![1] - pts[j]![0] * pts[i]![1]
  }
  return Math.abs(a) / 2
}

/** Push overlapping labels apart so they're readable and spread across the design
 *  rather than stacked. Simple pairwise repulsion, then clamp into the frame. */
function spreadLabels(
  labels: ElementLabel[],
  size: { width: number; height: number },
): ElementLabel[] {
  const min = Math.max(size.width, size.height) * 0.058
  const m = size.width * 0.04
  const pts = labels.map((l) => ({ ...l }))
  for (let it = 0; it < 80; it++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j]!.x - pts[i]!.x
        let dy = pts[j]!.y - pts[i]!.y
        const d = Math.hypot(dx, dy) || 0.01
        if (d < min) {
          const push = (min - d) / 2
          dx /= d
          dy /= d
          pts[i]!.x -= dx * push
          pts[i]!.y -= dy * push
          pts[j]!.x += dx * push
          pts[j]!.y += dy * push
        }
      }
    }
  }
  for (const p of pts) {
    p.x = Math.max(m, Math.min(size.width - m, p.x))
    p.y = Math.max(m, Math.min(size.height - m, p.y))
  }
  return pts
}

export function buildPatternDocument(
  elements: StitchedElement[],
  finishedSizeMm: { width: number; height: number },
  opts: { title?: string; outline?: OutlinePath[] } = {},
): PatternDocument {
  const outline = opts.outline?.length ? opts.outline : null
  const flossByCode = new Map<string, FlossRow>()
  const stitchBySlug = new Map<string, StitchRow>()
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const ensureFloss = (hex: string): FlossRow => {
    const e = nearestDmcFull(hex)
    let f = flossByCode.get(e.code)
    if (!f) {
      f = { number: flossByCode.size + 1, code: e.code, name: e.name, hex: e.hex, count: 0 }
      flossByCode.set(e.code, f)
    }
    return f
  }
  const ensureStitch = (slug: string): StitchRow => {
    let s = stitchBySlug.get(slug)
    if (!s) {
      const info = STITCH_INFO[slug] ?? { name: slug, how: '' }
      s = { letter: LETTERS[stitchBySlug.size] ?? `#${stitchBySlug.size + 1}`, slug, name: info.name, how: info.how }
      stitchBySlug.set(slug, s)
    }
    return s
  }

  const resolved = elements.map((el) => {
    // A shaded shape counts every colour in its ramp; its label uses the mid shade.
    let floss: FlossRow
    if (el.shade?.ramp?.length) {
      for (const hex of el.shade.ramp) ensureFloss(hex).count++
      floss = ensureFloss(el.shade.ramp[Math.floor(el.shade.ramp.length / 2)]!)
    } else {
      floss = ensureFloss(el.colourHex)
      floss.count++
    }
    return { el, floss, stitch: ensureStitch(baseSlug(el.stitchType)) }
  })

  // One label per (stitch, colour) group, placed inside that group's LARGEST
  // element (its biggest, most natural region), then de-clustered so labels
  // spread across the design instead of stacking down the centre line.
  const groups = new Map<string, { x: number; y: number; area: number; text: string }>()
  for (const r of resolved) {
    const key = `${r.stitch.letter}|${r.floss.number}`
    const area = elementArea(r.el)
    const g = groups.get(key)
    if (!g || area > g.area) {
      const [cx, cy] = geomCentre(r.el)
      groups.set(key, { x: cx, y: cy, area, text: `${r.stitch.letter}${r.floss.number}` })
    }
  }
  const labels = spreadLabels(
    [...groups.values()].map((g) => ({ x: g.x, y: g.y, text: g.text })),
    finishedSizeMm,
  )

  const flossKey = [...flossByCode.values()]
  const stitchKey = [...stitchBySlug.values()]
  const steps = buildSteps(stitchKey, flossKey, resolved)

  if (outline) {
    // DENSE thread-painting: the elements are thousands of tiny stitches, so the
    // clean transfer template is the DERIVED outline (the major shapes), and the
    // working guide is the dense colour/direction map with that outline overlaid
    // — the two share coordinates, so they register and overlay exactly. The
    // [stitch][colour] labels are dropped here (one stitch × many colours makes
    // them noise; the dense map shows the colour directly, keyed by the floss list).
    const outlineSvg = outlineToSvg(outline, finishedSizeMm)
    const denseMap = patternToGuideSvg(elements, finishedSizeMm, { mode: 'colour', background: '#f1ead9' })
    const denseMapSvg = overlayOutline(denseMap, outline, finishedSizeMm)
    return {
      title: opts.title ?? 'Pattern', finishedSizeMm, flossKey, stitchKey, steps, labels,
      technicalChartSvg: outlineSvg, colourGuideSvg: denseMapSvg, outlineSvg, denseMapSvg, isDense: true,
    }
  }

  // SHAPE/vector patterns: clean, layered artwork (occlusion: front shapes hide
  // the lines behind them) — a white-filled transfer template and a thread-colour
  // colour guide with the outline on top + direction ticks, then the labels.
  const technicalChartSvg = patternToGuideSvg(elements, finishedSizeMm, { mode: 'template' })
  const colourGuideSvg = withLabels(
    patternToGuideSvg(elements, finishedSizeMm, { mode: 'colour', background: '#f1ead9', directionHints: true }),
    labels,
    finishedSizeMm,
  )

  return { title: opts.title ?? 'Pattern', finishedSizeMm, flossKey, stitchKey, steps, labels, technicalChartSvg, colourGuideSvg, isDense: false }
}

/** Worked order: fills first, then lines/outlines, then wheels, then knots. */
const PHASE: Record<string, number> = {
  'long-and-short': 0, satin: 0, 'padded-satin': 0,
  fern: 1, stem: 1, outline: 1, back: 1, split: 1, running: 1, straight: 1,
  'detached-chain': 2, 'woven-wheel': 3, 'ribbed-spider-web': 3, 'buttonhole-wheel': 3,
  'french-knot': 4, 'colonial-knot': 4, seed: 4,
}

function buildSteps(
  stitchKey: StitchRow[],
  flossKey: FlossRow[],
  resolved: Array<{ stitch: StitchRow; floss: FlossRow }>,
): string[] {
  const seen = new Map<string, { stitch: StitchRow; floss: FlossRow }>()
  for (const r of resolved) seen.set(`${r.stitch.letter}|${r.floss.number}`, { stitch: r.stitch, floss: r.floss })
  const rows = [...seen.values()].sort((a, b) => (PHASE[a.stitch.slug] ?? 9) - (PHASE[b.stitch.slug] ?? 9))
  const steps: string[] = ['Transfer the design to your fabric and mount it in the hoop, drum-tight.']
  for (const r of rows) {
    steps.push(
      `Work the areas marked ${r.stitch.letter}${r.floss.number} in ${r.stitch.name.toLowerCase()} (${r.stitch.letter}) ` +
        `using DMC ${r.floss.code} ${r.floss.name.toLowerCase()} (${r.floss.number}).`,
    )
  }
  steps.push('Press from the back over a soft towel, then lace or frame the finished piece.')
  return steps
}

/** Inject the [letter][number] labels into the line-art SVG, before </svg>. */
function withLabels(svg: string, labels: ElementLabel[], size: { width: number; height: number }): string {
  const fs = Math.max(2.4, size.width / 45)
  const tags = labels
    .map(
      (l) =>
        `<g><circle cx="${r2(l.x)}" cy="${r2(l.y)}" r="${r2(fs * 0.9)}" fill="#ffffff" stroke="#1b2a4a" stroke-width="0.25"/>` +
        `<text x="${r2(l.x)}" y="${r2(l.y + fs * 0.35)}" font-family="sans-serif" font-size="${r2(fs)}" font-weight="700" fill="#1b2a4a" text-anchor="middle">${l.text}</text></g>`,
    )
    .join('')
  return svg.replace('</svg>', `${tags}</svg>`)
}
