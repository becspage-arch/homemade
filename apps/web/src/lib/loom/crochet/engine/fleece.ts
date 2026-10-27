/**
 * FLEECE (lamb-1027; parts catalogue CV8 "all-over fleece"): loop stitch worked
 * INTO a stuffed piece's own rounds, the way a loop-stitch lamb, poodle or
 * alpaca body is made, instead of a separate patch sewn on (hairPatch.ts).
 *
 * How a maker works it (UK terms): the piece is crocheted in the usual spiral
 * from a magic ring, but held INSIDE OUT (the inside of the cup facing you),
 * because a loop stitch's loop forms on the side away from the worker. On the
 * fleece rounds the named stitches are loop stitches (lp st: a dc with the
 * yarn wrapped round a finger held behind the work), the rest plain dc; a
 * decrease is always a plain dc2tog. The fabric's wrong side is then the
 * outside of the toy, the loops standing out of it.
 *
 * How it is built (nothing drawn): the locked closed-piece builder
 * (`buildSphere`) with `fleece`: the piece is worked with fz −1 (inside out),
 * each loop stitch is the loop-stitch emitter (loopStitch.ts `emitLoop`, its
 * two roots audited under the head below like every hook) and its loop body
 * is loose yarn (YarnModel.loose: held by its own length, stiffness and
 * collision, never blocked to the worked shape). Stuffed, relaxed and audited
 * like every other piece; the audit reads the inside-out piece's hooks as
 * diving outward (`BuiltContinuous.insideOut`).
 *
 * The SAME rule (`fleeceStitchAt`) picks the stitch for the build and for the
 * words, so the pattern names exactly the loops the render shows.
 */

import type { LoopShape, ShapeOp, StitchId } from './dictionary'
import { roundOps } from './shaping'

export interface FleeceSpec {
  /** The fleece rounds (0-based): loop stitches are worked in these rounds. */
  rounds: number[]
  /** A loop stitch in every `every`th stitch the round makes (1 = every
   *  stitch; default 1), the first at `offset` (default 0, so the first stitch
   *  of the round is a loop). Odd-numbered fleece rounds (counted along
   *  `rounds`) shift the start by `stagger` stitches (default ⌊every/2⌋), so
   *  the loops of one fleece round sit between those of the last. A list
   *  gives each fleece round its own spacing (counted along `rounds`, the
   *  last repeating): [2, 1] = every second stitch on the first fleece round,
   *  where the small cupped round has no room, then every stitch. */
  every?: number | number[]
  offset?: number
  stagger?: number
  /** The loop: how long (round how many fingers), how wide, how it leans
   *  (LoopShape, yarn radii; merged over the dictionary's lp st). */
  loop: Partial<LoopShape>
  /** Every `curlEvery`th loop (counted over the loops of a round, the first
   *  loop being 1) is a TWISTED loop (`loopcurl`: the loop twisted before the
   *  stitch is closed, so it curls back on itself): a few tight curls among
   *  the open loops (cute rule 37, mixed sizes). Absent = every loop open. */
  curlEvery?: number
  curlLoop?: Partial<LoopShape>
}

/** The loop spacing of the `at`th fleece round. */
function everyAt(f: FleeceSpec, at: number): number {
  const e = f.every ?? 1
  return Math.max(1, Array.isArray(e) ? e[Math.min(at, e.length - 1)] ?? 1 : e)
}

/** The stitch made at made-stitch i of round k, or undefined for the piece's
 *  own stitch. `op` is the shaping op that makes it (a decrease is plain). */
export function fleeceStitchAt(f: FleeceSpec, k: number, i: number, op: ShapeOp = 'st'): StitchId | undefined {
  const at = f.rounds.indexOf(k)
  if (at < 0 || op === 'dec') return undefined
  const every = everyAt(f, at)
  const shift = (f.offset ?? 0) + (at % 2 === 1 ? f.stagger ?? Math.floor(every / 2) : 0)
  if (((i - shift) % every + every) % every !== 0) return undefined
  if (f.curlEvery && f.curlEvery > 0) {
    const n = Math.floor((i - shift + every * 1000) / every) - 1000 // this loop's index along the round
    if ((n + 1) % f.curlEvery === 0) return 'loopcurl'
  }
  return 'loopst'
}

/** The loop shape for a loop at made-stitch i of round k. */
export function fleeceLoopAt(f: FleeceSpec, k: number, i: number): Partial<LoopShape> | undefined {
  const id = fleeceStitchAt(f, k, i)
  if (!id) return undefined
  return id === 'loopcurl' ? { ...f.loop, ...f.curlLoop } : f.loop
}

/** The ops a round of a closed piece is worked in, in the builder's order
 *  (shaping.ts buildSphere: the decreases and increases half a segment
 *  staggered on alternate rounds). */
export function sphereRoundOps(rounds: number[], k: number): ShapeOp[] {
  return k === 0 ? (Array(rounds[0]!).fill('st') as ShapeOp[]) : roundOps(rounds[k - 1]!, rounds[k]!, (k % 2) * 0.5)
}

/** Group a round's tokens into a maker's line: the shortest whole repeat
 *  ("[lp st, dc] 18 times"), else run-length groups. */
function groupTokens(tokens: string[]): string {
  const n = tokens.length
  // A short repeat that tiles the round exactly.
  for (let p = 1; p <= Math.min(12, Math.floor(n / 2)); p++) {
    if (n % p !== 0) continue
    let ok = true
    for (let i = p; i < n && ok; i++) if (tokens[i] !== tokens[i - p]) ok = false
    if (!ok) continue
    const unit = runs(tokens.slice(0, p))
    if (n / p === 1) return unit
    if (p === 1) {
      const t = tokens[0]!
      if (!t.startsWith('(')) return `${t} in each st around`
      const inner = t.slice(1, -1)
      return inner.endsWith(' in next st') ? `${inner.slice(0, -' in next st'.length)} in each st around` : `[${inner}] ${n} times`
    }
    return `[${unit}] ${n / p} times`
  }
  return runs(tokens)
}

/** Run-length words: "dc in next 3 sts, lp st, 2 dc in next st". */
function runs(tokens: string[]): string {
  const out: string[] = []
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]!
    let r = 1
    while (i + r < tokens.length && tokens[i + r] === t) r++
    if (t.startsWith('(')) out.push(r === 1 ? t.slice(1, -1) : `[${t.slice(1, -1)}] ${r} times`)
    else out.push(r === 1 ? `${t} in next st` : `${t} in next ${r} sts`)
    i += r
  }
  return out.join(', ')
}

/** UK name of a fleece stitch. */
const UK: Record<string, string> = { sc: 'dc', loopst: 'lp st', loopcurl: 'twisted lp st' }

/**
 * The written rounds of a fleece piece, from the same counts, ops and
 * stitch rule the build reads. Plain rounds are written the plain way; a
 * fleece round names every loop. `colourAt(k)` (optional) returns the yarn
 * to change to at the start of round k.
 */
export function writeFleeceRounds(
  rounds: number[],
  f: FleeceSpec,
  opts: { colourAt?: (k: number) => string | undefined; closeWords: string; plainWord?: (prev: number, cur: number) => string } = { closeWords: '' },
): string[] {
  const lines: string[] = []
  rounds.forEach((count, k) => {
    const change = opts.colourAt?.(k)
    if (change) lines.push(k === 0 ? `Start with the ${change} yarn.` : `Change to the ${change} yarn.`)
    const ops = sphereRoundOps(rounds, k)
    const fleeceRound = f.rounds.includes(k)
    const tokens: string[] = []
    let li = 0
    for (const op of ops) {
      if (op === 'dec') {
        tokens.push('(dc2tog)')
        li++
        continue
      }
      const n = op === 'inc' ? 2 : 1
      const ids: string[] = []
      for (let t = 0; t < n; t++) ids.push(UK[fleeceStitchAt(f, k, li++, op) ?? 'sc']!)
      tokens.push(n === 1 ? ids[0]! : ids[0] === ids[1] ? `(2 ${ids[0]} in next st)` : `(${ids[0]} and ${ids[1]} in next st)`)
    }
    if (k === 0) {
      const lp = fleeceRound ? tokens.filter((t) => t !== 'dc').length : 0
      lines.push(`Round 1: ${count} ${lp === count ? 'lp st' : 'dc'} into a magic ring. (${count} sts)`)
      return
    }
    if (!fleeceRound && opts.plainWord) {
      lines.push(`Round ${k + 1}: ${opts.plainWord(rounds[k - 1]!, count)}. (${count} sts)`)
      return
    }
    lines.push(`Round ${k + 1}${fleeceRound ? ' (fleece)' : ''}: ${groupTokens(tokens)}. (${count} sts)`)
  })
  if (opts.closeWords) lines.push(opts.closeWords)
  return lines
}

/** The fleece's how-to, said once before the rounds (from the same loop and
 *  rule the build uses). `fingerMm` is the loop's length in mm. */
export function fleeceHowTo(f: FleeceSpec, fingerMm: number): string {
  const cm = Math.max(0.5, Math.round(fingerMm / 5) / 2)
  const list = Array.isArray(f.every) ? f.every : [f.every ?? 1]
  const every = Math.max(1, list[list.length - 1] ?? 1)
  const first = Math.max(1, list[0] ?? 1)
  // A short loop is wrapped round something thinner than a finger.
  const former = cm < 1 ? 'a pencil (or a spare hook of about 5 mm) held behind the work' : 'your forefinger held behind the work'
  const nth = (n: number): string => (n === 1 ? 'every stitch' : `every ${({ 2: 'second', 3: 'third', 4: 'fourth' } as Record<number, string>)[n] ?? `${n}th`} stitch`)
  const each = first === every ? nth(every) : `${nth(every)} (${nth(first)} on the first fleece round)`
  return (
    'This piece is worked INSIDE OUT from the start, so the loops stand on the outside: as the first rounds cup, push the work through so the inside of the cup faces you, and keep it that way round to the end. ' +
    `Loop stitch (lp st): insert the hook in the next st, wrap the yarn from front to back round ${former}, ` +
    `catch the yarn behind it and pull it through the st (2 loops on hook), yrh and pull through both loops, then slip it out, leaving a soft loop about ${cm} cm long on the far side; do not pull the loops tight. ` +
    `On each fleece round a lp st is worked in ${each} as written, the rest plain dc; a decrease is always a plain dc2tog.` +
    (f.curlEvery ? ` A twisted lp st is the same stitch with the loop given ${((f.curlLoop?.twist ?? 3) / 2) >= 1.5 ? 'one and a half twists' : 'a full twist'} on your finger before you close the stitch, so it curls back on itself: a tight curl among the open loops.` : '')
  )
}
