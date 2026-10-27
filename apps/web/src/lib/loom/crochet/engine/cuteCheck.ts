/**
 * THE CUTE CHECK (cute-engine plan step 3, 26 Oct 2026).
 *
 * Every compiled toy is measured (cuteMeasure.ts) and checked against the
 * cute rules for its family (cuteRules.ts): per rule, pass or fail, the
 * measured value, the range, the strictness and, for a failure, one plain
 * line ("eyes too close: 0.47 of the head width, want 0.55-0.70").
 *
 * It is a REPORT by default: `compileComposition` attaches it to the compile
 * result (`CompiledComposition.cute`) and the preset / audit tooling prints
 * it; it moves no geometry hash and fails no build. The GATE is opt-in
 * (`CompositionProgram.cute.gate`, set by `cuteGate: true` on the designer's
 * or the cow's choices): then every HARD or FIRM failure read off the
 * geometry or the program joins `problems` (the compile fails, nothing is
 * rendered or saved), SOFT ones only warn. Colour rules are read off the
 * yarn hex (a proxy for the render's colour) and never gate.
 */

import type { CompiledComposition, CompositionProgram } from './composition'
import { CUTE_RULES, type CuteRange, type CuteRule, type Strictness, type ToyFamily } from './cuteRules'
import { measureCute, type CuteMeasurement, type CuteSource } from './cuteMeasure'

export interface CuteRuleResult {
  /** The rule's number in CUTE-RULES.md (1-41). */
  n: number
  id: string
  strictness: Strictness
  value: number
  range: CuteRange
  pass: boolean
  source: CuteSource
  /** A failure in plain words; absent on a pass. */
  line?: string
}

export interface CuteReport {
  family: ToyFamily | null
  familyFrom: CuteMeasurement['familyFrom']
  results: CuteRuleResult[]
  /** Rules ranged for this family that had nothing to measure (no horns...). */
  notMeasured: { n: number; id: string; why: string }[]
  /** The failures in plain words, hard first, then firm, then soft. */
  failures: string[]
  /** True when the gate is on for this toy. */
  gate: boolean
  /** The failures that block the compile when the gate is on (hard and firm
   *  geometry / program reads); empty with the gate off. */
  blocking: string[]
  /** One line: "quadruped-seated: 14 / 31 pass; hard fails 5, 13, 21, 24". */
  summary: string
  measured: { W: number; H: number; T: number; notes: string[] }
  /** Set when the measurer could not run (the report is then empty). */
  error?: string
}

const fmt = (v: number): string => (Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2))

/** How each rule's failure reads: what is wrong when the value is low /
 *  high, and the unit the value is in. */
const WORDS: Record<string, { low: string; high: string; unit: string }> = {
  'big-head': { low: 'head too small for the toy', high: 'head too big for the toy', unit: 'of the toy height' },
  'head-as-wide-as-body': { low: 'body wider than the head', high: 'head far wider than the body', unit: 'x the torso width' },
  'head-is-the-widest': { low: 'something below the head sticks out wider than the ears', high: 'ears spread far wider than the body', unit: 'x the widest span below' },
  'seated-haunches': { low: 'haunches too narrow', high: 'haunches too wide', unit: 'x the head width' },
  'eyes-wide-apart': { low: 'eyes too close', high: 'eyes too far apart', unit: 'of the head width' },
  'eyes-low': { low: 'eyes too low', high: 'eyes too high', unit: 'of the head height above the chin' },
  'eyes-small': { low: 'eyes too small', high: 'eyes too big', unit: 'of the head width' },
  'eyes-on-the-muzzle': { low: 'eyes sunk too far into the muzzle', high: 'eyes float above the muzzle', unit: 'of the head width (eye bottom to muzzle top)' },
  'eyes-over-muzzle-corners': { low: 'eyes outside the muzzle corners', high: 'eyes too far in from the muzzle corners', unit: 'of the head width' },
  'eyes-read-dark': { low: 'eyes do not read dark against the face', high: 'eyes too dark (unreachable)', unit: 'L* (yarn hex, a proxy)' },
  'muzzle-wide': { low: 'muzzle too narrow', high: 'muzzle too wide', unit: 'of the head width' },
  'muzzle-height': { low: 'muzzle too short', high: 'muzzle too tall', unit: 'of the head height' },
  'muzzle-is-the-chin': { low: 'muzzle hangs below the head', high: 'muzzle sits inside the face, face colour shows beside it at the chin', unit: 'of the head width' },
  'muzzle-tone': { low: 'muzzle too close to the face colour', high: 'muzzle too stark against the face', unit: 'L* (yarn hex, a proxy)' },
  'muzzle-warm': { low: 'muzzle too cold (near white)', high: 'muzzle too yellow', unit: 'b* (yarn hex, a proxy)' },
  blush: { low: 'blush too faint', high: 'blush too strong', unit: 'a* (yarn hex, a proxy)' },
  'blush-placement': { low: 'blush too close to the eye line', high: 'blush too low', unit: 'of the head height below the eyes' },
  'ears-stand-out': { low: 'ears too close to the head', high: 'ears stick out too far', unit: 'of the head width past the side' },
  'ears-high': { low: 'ears too low (at eye level)', high: 'ears too high', unit: 'of the head height above the eyes' },
  'ear-shape': { low: 'ears too flat and wide', high: 'ears too tall (a ring)', unit: 'height / width' },
  'ears-folded': { low: 'ears not folded: an even ring', high: 'ear rim far too uneven', unit: 'thickest / thinnest rim' },
  'lop-ears-long': { low: 'lop ears too short', high: 'lop ears too long', unit: 'x the head height' },
  'lop-ears-wide': { low: 'lop ears too narrow', high: 'lop ears too wide', unit: 'of the head width' },
  'appendage-curved': { low: 'horns or tail too straight', high: 'horns or tail curled too far', unit: 'sagitta / chord' },
  'appendage-bend': { low: 'horns or tail do not turn up', high: 'horns or tail turn up too sharply', unit: 'degrees of bend' },
  'appendage-rises': { low: 'horns too level', high: 'horns too upright', unit: 'degrees above level' },
  'appendage-tapers': { low: 'horns or tail taper too sharply', high: 'horns or tail barely taper', unit: 'tip / base thickness' },
  'appendage-short': { low: 'horns too short', high: 'horns too long', unit: 'of the head width' },
  'limbs-chunky': { low: 'limbs too thin', high: 'limbs too thick', unit: 'of the head width' },
  'legs-close': { low: 'front legs too close', high: 'front legs too far apart', unit: 'of the head width' },
  'limb-ends-rounded': { low: 'legs end in straight columns, no rounded foot', high: 'feet too bulbous', unit: 'foot / mid-leg width' },
  'big-feet': { low: 'feet too small', high: 'feet too big', unit: 'of the head width' },
  'no-sharp-corners': { low: '(unreachable)', high: 'sharp corners on the head outline', unit: 'corners' },
  'no-straight-edges': { low: '(unreachable)', high: 'a straight edge on the head outline', unit: 'of the head width' },
  'gentle-tilt': { low: '(unreachable)', high: 'head tilted too far', unit: 'degrees' },
  'one-asymmetry': { low: 'perfectly mirrored: no deliberate asymmetry', high: 'too many asymmetries', unit: 'cues' },
  'curls-mixed': { low: 'curls all one size (a stamp)', high: 'curl sizes too scattered', unit: 'std / mean of curl size' },
  'appendage-clears-crown': { low: 'horns tower over the crown', high: 'horn tips hidden below the crown of the curls', unit: 'of the head height below the crown' },
  'appendage-slender': { low: 'horns too thin where they leave the head', high: 'horns a fat wedge where they leave the head', unit: 'of the head width' },
  'ear-rim-thick': { low: 'ear rim a thin edge somewhere round the hollow', high: 'ear rim so thick the hollow closes', unit: 'thinnest rim / ear width' },
  'muzzle-light': { low: 'muzzle too dark (an oatmeal, not a cream)', high: 'muzzle too light (white)', unit: 'L* (yarn hex, a proxy: want the hex range)' },
}

/** One plain line for a failed rule. */
export function cuteFailureLine(rule: CuteRule, value: number, range: CuteRange): string {
  const w = WORDS[rule.id] ?? { low: `${rule.id} low`, high: `${rule.id} high`, unit: '' }
  const low = value < range.min
  // Counts read as whole numbers; a value that rounds onto the bound it
  // misses is shown a place finer.
  const f = rule.quantity === 'sharpCorners' || rule.quantity === 'asymmetryCues' ? (x: number): string => String(Math.round(x)) : fmt
  const bound = low ? range.min : range.max
  const v = f(value) === f(bound) ? value.toFixed(3) : f(value)
  return `${low ? w.low : w.high}: ${v} ${w.unit}, want ${f(range.min)}-${f(range.max)}`
}

const ORDER: Record<Strictness, number> = { hard: 0, firm: 1, soft: 2 }

/** Check a measurement against the family's rules. */
export function cuteCheck(m: CuteMeasurement, gate = false): CuteReport {
  const results: CuteRuleResult[] = []
  const notMeasured: CuteReport['notMeasured'] = []
  if (m.family) {
    CUTE_RULES.forEach((rule, i) => {
      const photoRange = rule.ranges[m.family!]
      if (!photoRange) return
      const value = m.values[rule.quantity]
      if (value == null) {
        notMeasured.push({ n: i + 1, id: rule.id, why: m.absent[rule.quantity] ?? 'not measured' })
        return
      }
      const source = m.source[rule.quantity] ?? 'geometry'
      // A yarn-hex proxy is checked against the rule's hex range where it has
      // one (cuteRules.ts `proxyRanges`): the photo range is for the render.
      const range = (source === 'proxy' && rule.proxyRanges?.[m.family!]) || photoRange
      const pass = value >= range.min && value <= range.max
      results.push({
        n: i + 1, id: rule.id, strictness: rule.strictness, value, range, pass,
        source,
        ...(pass ? {} : { line: cuteFailureLine(rule, value, range) }),
      })
    })
  }
  const fails = results.filter((r) => !r.pass).sort((a, b) => ORDER[a.strictness] - ORDER[b.strictness] || a.n - b.n)
  const failures = fails.map((r) => `${r.line} (rule ${r.n}, ${r.strictness}${r.source === 'proxy' ? ', colour proxy' : ''})`)
  const blocking = gate ? fails.filter((r) => r.strictness !== 'soft' && r.source !== 'proxy').map((r) => `cute: ${r.line} (rule ${r.n}, ${r.strictness})`) : []
  const passN = results.filter((r) => r.pass).length
  const hardFails = fails.filter((r) => r.strictness === 'hard').map((r) => r.n)
  const summary = m.family
    ? `${m.family}: ${passN} / ${results.length} pass${hardFails.length ? `; hard fails ${hardFails.join(', ')}` : ''}${fails.length ? `; fails ${fails.map((r) => r.n).sort((a, b) => a - b).join(', ')}` : ''}`
    : 'not a figure: no cute rules apply'
  return { family: m.family, familyFrom: m.familyFrom, results, notMeasured, failures, gate, blocking, summary, measured: { W: m.W, H: m.H, T: m.T, notes: m.notes } }
}

/** Measure and check a compiled toy. Never throws: a measurer error is
 *  reported, not raised, so a report can never break a build. */
export function cuteReportFor(p: CompositionProgram, c: CompiledComposition): CuteReport {
  const gate = p.cute?.gate === true
  try {
    return cuteCheck(measureCute(p, c), gate)
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return {
      family: null, familyFrom: 'none', results: [], notMeasured: [], failures: [], gate,
      blocking: gate ? [`cute: the cute check could not run (${error})`] : [],
      summary: `cute check error: ${error}`, measured: { W: 0, H: 0, T: 0, notes: [] }, error,
    }
  }
}
