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
import { patternToLineArtSvg } from './lineart'
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
  /** The transfer template + the [letter][number] labels. */ colourGuideSvg: string
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

export function buildPatternDocument(
  elements: StitchedElement[],
  finishedSizeMm: { width: number; height: number },
  opts: { title?: string } = {},
): PatternDocument {
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

  return { title: opts.title ?? 'Pattern', finishedSizeMm, flossKey, stitchKey, steps, labels, technicalChartSvg, colourGuideSvg }
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
