/**
 * Pattern DOCUMENT builder — the deliverable, derived from ONE structured
 * dataset (the per-element plan: geometry + stitch slug + DMC floss). The loom's
 * renderHero renders the same data as the photoreal hero, so document and hero
 * can never diverge. This is the reusable service behind both our own catalogue
 * and the customer "describe an idea -> your own pattern" feature.
 *
 * Mirrors the professional format (DMC / Anchor): a colour guide (line drawing
 * with each element labelled [stitch-letter][colour-number]), a clean technical
 * chart (the transfer template), a numbered floss key, a lettered stitch key,
 * and the worked steps.
 */

import { nearestFloss } from '../../floss/nearest-floss'
import { patternToLineArtSvg } from './lineart'
import type { StitchedElement } from '../../loom/render/renderPattern'

/**
 * A planned element. A shaded fill is authored as ONE shape carrying a DMC
 * `ramp` (dark→light) + a `axisDeg` fade direction — so the line drawing and the
 * colour guide show one clean outline, while `expandShading` splits it into the
 * graded long-and-short bands the loom renders. One dataset, two views.
 */
export interface ShadedElement extends StitchedElement {
  shade?: { ramp: string[]; axisDeg: number }
}

function baseSlug(s: string): string {
  return s.replace(/^embroidery-/, '')
}

function clipHP(poly: [number, number][], px: number, py: number, nx: number, ny: number): [number, number][] {
  const out: [number, number][] = []
  const side = (p: [number, number]) => (p[0] - px) * nx + (p[1] - py) * ny
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i]!
    const nxt = poly[(i + 1) % poly.length]!
    const sc = side(cur)
    const sn = side(nxt)
    if (sc >= 0) out.push(cur)
    if (sc >= 0 !== sn >= 0) {
      const t = sc / (sc - sn)
      out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])])
    }
  }
  return out
}

/**
 * Expand shaded shapes into graded long-and-short bands for the loom. A shape
 * with a `shade` ramp becomes N bands along its fade axis (dark base → light
 * tip); everything else passes through unchanged (with `shade` stripped).
 */
export function expandShading(elements: ShadedElement[]): StitchedElement[] {
  const out: StitchedElement[] = []
  for (const el of elements) {
    const poly = el.geometry.points
    if (!el.shade || !poly || poly.length < 3) {
      const { shade, ...rest } = el
      void shade
      out.push(rest)
      continue
    }
    const { ramp, axisDeg } = el.shade
    const a = (axisDeg * Math.PI) / 180
    const nx = Math.cos(a)
    const ny = Math.sin(a)
    let lo = Infinity
    let hi = -Infinity
    for (const p of poly) {
      const pr = p[0] * nx + p[1] * ny
      if (pr < lo) lo = pr
      if (pr > hi) hi = pr
    }
    for (let i = 0; i < ramp.length; i++) {
      const b0 = lo + ((hi - lo) * i) / ramp.length
      const b1 = lo + ((hi - lo) * (i + 1)) / ramp.length
      let band = clipHP(poly, nx * b0, ny * b0, nx, ny)
      if (band.length >= 3) band = clipHP(band, nx * b1, ny * b1, -nx, -ny)
      if (band.length >= 3) out.push({ stitchType: el.stitchType, colourHex: ramp[i]!, thread: el.thread, directionDeg: axisDeg, geometry: { kind: 'path', points: band } })
    }
  }
  return out
}

/** Canonical stitch names + a one-line how-to for the stitch key. */
const STITCH_INFO: Record<string, { name: string; how: string }> = {
  stem: { name: 'Stem stitch', how: 'Overlapping slanted stitches worked along a line — smooth stems, outlines and lettering.' },
  outline: { name: 'Outline stitch', how: 'The mirror twist of stem stitch, for a fine raised line.' },
  back: { name: 'Back stitch', how: 'Even stitches worked backwards along a line — fine continuous outlines.' },
  split: { name: 'Split stitch', how: 'Each stitch splits the previous — a fine textured line and shading base.' },
  running: { name: 'Running stitch', how: 'Simple dashed line, in and out at an even spacing.' },
  straight: { name: 'Straight stitch', how: 'A single flat stitch — spokes, rays and scattered fillings.' },
  satin: { name: 'Satin stitch', how: 'Parallel stitches packed edge to edge to fill a small shape with a smooth sheen.' },
  'padded-satin': { name: 'Padded satin', how: 'Satin worked over a padding stitch for a raised, domed fill.' },
  'long-and-short': { name: 'Long and short stitch', how: 'Alternating long and short stitches in graded shades — painterly needle-painting fills.' },
  fern: { name: 'Fern stitch', how: 'Three straight stitches from a point, repeated down a line — leaf veins and fronds.' },
  'detached-chain': { name: 'Lazy daisy', how: 'A single chain loop held with a tiny tacking stitch at the tip — petals and leaves.' },
  'french-knot': { name: 'French knot', how: 'Thread wrapped round the needle and pulled through — dotted texture, centres and stamens.' },
  'colonial-knot': { name: 'Colonial knot', how: 'A firmer figure-eight knot — candlewicking and dense texture.' },
  seed: { name: 'Seed stitch', how: 'Tiny straight stitches scattered at random — light filling and texture.' },
  'woven-wheel': { name: 'Woven wheel', how: 'Thread woven over an odd number of spokes into a raised rose.' },
  'ribbed-spider-web': { name: 'Ribbed spider web', how: 'Thread whipped around spokes into a raised spoked wheel.' },
  'buttonhole-wheel': { name: 'Buttonhole wheel', how: 'Buttonhole stitches worked in a ring — flowers and eyelets.' },
}

export interface FlossRow {
  number: number
  code: string
  name: string
  hex: string
  /** Elements worked in this colour. */ count: number
}
export interface StitchRow {
  letter: string
  slug: string
  name: string
  how: string
}
export interface ElementLabel {
  x: number
  y: number
  /** e.g. 'C1' = stitch C, colour 1. */ text: string
}
export interface PatternDocument {
  title: string
  finishedSizeMm: { width: number; height: number }
  flossKey: FlossRow[]
  stitchKey: StitchRow[]
  steps: string[]
  /** One label per (stitch, colour) group, at the group's centre. */
  labels: ElementLabel[]
  /** Clean transfer template (line drawing). */ technicalChartSvg: string
  /** The transfer template + the [letter][number] labels. */ colourGuideSvg: string
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

export function buildPatternDocument(
  elements: ShadedElement[],
  finishedSizeMm: { width: number; height: number },
  opts: { title: string } = { title: 'Pattern' },
): PatternDocument {
  // Colour numbers: unique DMC codes, in first-seen order.
  const flossByCode = new Map<string, FlossRow>()
  // Stitch letters: unique slugs, in first-seen order.
  const stitchBySlug = new Map<string, StitchRow>()
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const ensureFloss = (hex: string): FlossRow => {
    const { entry } = nearestFloss(hex, { brand: 'DMC' })
    let f = flossByCode.get(entry.code)
    if (!f) {
      f = { number: flossByCode.size + 1, code: entry.code, name: entry.name, hex: entry.rgb, count: 0 }
      flossByCode.set(entry.code, f)
    }
    return f
  }

  const resolved = elements.map((el) => {
    // A shaded shape uses every colour in its ramp; the label/representative is
    // the mid shade. A flat shape uses its single colour.
    let floss: FlossRow
    if (el.shade?.ramp?.length) {
      for (const hex of el.shade.ramp) ensureFloss(hex).count++
      floss = ensureFloss(el.shade.ramp[Math.floor(el.shade.ramp.length / 2)]!)
    } else {
      floss = ensureFloss(el.colourHex)
      floss.count++
    }
    const slug = baseSlug(el.stitchType)
    let stitch = stitchBySlug.get(slug)
    if (!stitch) {
      const info = STITCH_INFO[slug] ?? { name: slug, how: '' }
      stitch = { letter: LETTERS[stitchBySlug.size] ?? `#${stitchBySlug.size + 1}`, slug, name: info.name, how: info.how }
      stitchBySlug.set(slug, stitch)
    }
    return { el, floss, stitch }
  })

  // One label per (stitch, colour) group, at the group's mean centre.
  const groups = new Map<string, { x: number; y: number; n: number; text: string }>()
  for (const r of resolved) {
    const key = `${r.stitch.letter}|${r.floss.number}`
    const [cx, cy] = geomCentre(r.el)
    const g = groups.get(key)
    if (g) {
      g.x += cx
      g.y += cy
      g.n++
    } else {
      groups.set(key, { x: cx, y: cy, n: 1, text: `${r.stitch.letter}${r.floss.number}` })
    }
  }
  const labels: ElementLabel[] = [...groups.values()].map((g) => ({ x: g.x / g.n, y: g.y / g.n, text: g.text }))

  const flossKey = [...flossByCode.values()]
  const stitchKey = [...stitchBySlug.values()]
  const steps = buildSteps(stitchKey, flossKey, resolved)

  const technicalChartSvg = patternToLineArtSvg(elements, finishedSizeMm)
  const colourGuideSvg = withLabels(technicalChartSvg, labels, finishedSizeMm)

  return { title: opts.title, finishedSizeMm, flossKey, stitchKey, steps, labels, technicalChartSvg, colourGuideSvg }
}

/** Worked order: fills, then lines/outlines, then wheels, then knots. */
const PHASE: Record<string, number> = { 'long-and-short': 0, satin: 0, 'padded-satin': 0, fern: 1, stem: 1, outline: 1, back: 1, split: 1, running: 1, straight: 1, 'detached-chain': 2, 'woven-wheel': 3, 'ribbed-spider-web': 3, 'buttonhole-wheel': 3, 'french-knot': 4, 'colonial-knot': 4, seed: 4 }

function buildSteps(
  stitchKey: StitchRow[],
  flossKey: FlossRow[],
  resolved: Array<{ stitch: StitchRow; floss: FlossRow }>,
): string[] {
  // Group worked elements by (stitch, colour), ordered by working phase.
  const seen = new Map<string, { stitch: StitchRow; floss: FlossRow; n: number }>()
  for (const r of resolved) {
    const k = `${r.stitch.letter}|${r.floss.number}`
    const g = seen.get(k)
    if (g) g.n++
    else seen.set(k, { stitch: r.stitch, floss: r.floss, n: 1 })
  }
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

function r2(n: number): number {
  return Math.round(n * 100) / 100
}
