/**
 * A composed amigurumi → the pattern's OTHER two faces: the written
 * instructions and the piece list.
 *
 * `programScene.ts` does this for a single flat/round program, and
 * `program.ts` writes the words for one piece. A composition is several of
 * those pieces plus how they are joined, so this module groups the identical
 * parts (a left and a right ear are "Ears, make 2"), writes each group once,
 * and adds the assembly from the placements the composition already declares.
 * Derived from the SAME `CompositionProgram` the geometry comes from, so the
 * words and the rendered hero cannot drift.
 *
 * New file rather than an edit to `composition.ts`: the composition layer
 * itself is owned elsewhere and untouched here.
 */

import { programToChart, writeInstructions, type CrochetProgram, type YarnWeight } from './program'
import type { AmigurumiPart, CompositionProgram } from './composition'
import { writeFaceInstructions } from './faceEmbroidery'
import { writeHairInstructions } from './hairPatch'
import { nightcapInstructions } from './hatAccessory'

export interface CompositionPiece {
  /** Display label: "Body", "Ears". */
  label: string
  /** Section key used in the row-by-row structure. */
  section: string
  /** How many of this piece to make. */
  makeQuantity: number
  colourHex: string
  rounds: number[]
  /** Total stitches worked across one of this piece. */
  stitchCount: number
  /** The part names in the composition this piece covers. */
  partNames: string[]
  /** What it is joined to, if anything. */
  joinsTo: string | null
  /** How the piece is made (toy-pose pass): a stuffed 'sphere' (default), a
   *  flat appliqué 'disc', or a 'pressed' unstuffed piece. */
  kind?: 'sphere' | 'disc' | 'pressed'
  /** A tapestry panel in the second yarn: per round, [first st, count]. */
  panel?: Record<number, [number, number]>
  /** Worked in a lighter yarn than the rest. */
  yarnWeight?: YarnWeight
}

// A side suffix, optionally numbered (`toe-bean-l0`): the three toe beans on
// each foot are one piece made six times.
const SIDE_SUFFIX = /-(?:l|r|al|ar|ll|lr)\d*$/

/** "Arm" + "Leg" → "arms and legs" in a sentence. */
function joinList(labels: string[]): string {
  if (labels.length === 1) return labels[0]!
  const plural = labels.map((l) => (l.endsWith('s') ? l : `${l}s`))
  return `${plural.slice(0, -1).join(', ')} and ${plural[plural.length - 1]}`
}

/** "ear-l" → "ear"; "body" → "body". */
function baseName(name: string): string {
  return name.replace(SIDE_SUFFIX, '')
}

/** The part names that do not pluralise with an s. A pattern that says "make 2
 *  Foots" is not a pattern anyone would trust with the rest of the maths. */
const IRREGULAR_PLURAL: Record<string, string> = { foot: 'feet' }

function prettify(base: string, quantity: number): string {
  const words = base.replace(/[-_]+/g, ' ').trim()
  const plural = quantity === 1 ? null : IRREGULAR_PLURAL[words.toLowerCase()]
  const out = plural ?? (quantity === 1 || words.endsWith('s') ? words : `${words}s`)
  return out.charAt(0).toUpperCase() + out.slice(1)
}

/** Group the composition's parts into the pieces a written pattern lists. */
export function compositionPieces(p: CompositionProgram): CompositionPiece[] {
  const groups = new Map<string, AmigurumiPart[]>()
  const order: string[] = []
  for (const part of p.parts) {
    // Identical work (same base name, same rounds, same colour, same scale) is
    // one piece made more than once.
    const key = [
      baseName(part.name), part.rounds.join(','), part.colourHex, part.scale ?? 1,
      part.form ?? '', part.press ?? '', JSON.stringify(part.panel?.runs ?? null), part.yarnWeight ?? '',
    ].join('|')
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(part)
  }
  return order.map((key) => {
    const parts = groups.get(key)!
    const first = parts[0]!
    const base = baseName(first.name)
    const label = prettify(base, parts.length)
    // A group can be sewn to more than one place: the four paw pads go on two
    // arms and two legs, so the assembly line has to name both.
    const parents = [
      ...new Set(
        parts
          .map((x) => (x.place as { on?: string }).on)
          .filter((on): on is string => Boolean(on) && on !== 'ground')
          .map((on) => prettify(baseName(on), 1)),
      ),
    ]
    const joinsTo = parents.length === 0 ? null : joinList(parents)
    return {
      label,
      section: label,
      makeQuantity: parts.length,
      colourHex: first.colourHex,
      rounds: first.rounds,
      stitchCount: first.rounds.reduce((a, b) => a + b, 0),
      partNames: parts.map((x) => x.name),
      joinsTo,
      ...(first.form === 'disc' ? { kind: 'disc' as const } : first.press ? { kind: 'pressed' as const } : {}),
      ...(first.panel ? { panel: first.panel.runs } : {}),
      ...(first.yarnWeight ? { yarnWeight: first.yarnWeight } : {}),
    }
  })
}

/** The order a maker works the pieces: as declared, since a part may only
 *  reference an earlier one. Plus the assembly step at the end. */
export function compositionBuildOrder(p: CompositionProgram): string[] {
  return [...compositionPieces(p).map((piece) => piece.section), 'Assembly']
}

/** One piece's round-by-round words, from the same sphere program the geometry
 *  is built from. */
export function writePieceInstructions(piece: CompositionPiece): string[] {
  const program: CrochetProgram = {
    name: piece.label,
    stitch: 'sc',
    form: piece.kind === 'disc' ? 'disc' : 'sphere',
    rounds: piece.rounds,
  }
  const lines = writeInstructions(program)
  if (!piece.kind && !piece.panel && !piece.yarnWeight) return lines
  // The closing line depends on how the piece is made.
  const body = lines.slice(0, -1)
  const close =
    piece.kind === 'disc'
      ? 'Join with a sl st into the next st and fasten off, leaving a long tail for sewing. This piece is not stuffed.'
      : piece.kind === 'pressed'
        ? 'Fasten off without stuffing, thread the tail through the final round and draw it closed, then press the piece flat with the lining centred on the front.'
        : lines[lines.length - 1]!
  const out = piece.panel ? withPanel(body, piece) : body
  const head = piece.yarnWeight ? [`Change to ${YARN_WORDS[piece.yarnWeight] ?? piece.yarnWeight} yarn and a 2.5 mm hook for this piece.`] : []
  return [...head, ...out, close]
}

const YARN_WORDS: Partial<Record<YarnWeight, string>> = {
  lace: 'lace weight', fine: 'fine (4 ply)', sport: 'sport', dk: 'DK', worsted: 'worsted', aran: 'aran',
}

// Every line above is phrased so the completeness gate reads it as an
// instruction rather than a round (packages/db crochet-completeness.ts
// UNCOUNTED_LINE: it starts "join", "change to", "fasten off" or "start with").

/**
 * A tapestry PANEL written into the rounds: on each round it covers, the run
 * of stitches worked in the second yarn, counted from the round's first
 * stitch (the marker). These are exactly the stitches the render colours
 * (`composition.ts` panelMaskOf). A panel only ever sits on rounds worked
 * straight (sc in each st around) or covers a whole round, so each round
 * splits cleanly into plain runs.
 */
/** Every composition piece is worked in sc, written in UK terms. */
const UK_SC = 'dc'

function withPanel(lines: string[], piece: CompositionPiece): string[] {
  const runs = piece.panel!
  const out: string[] = []
  let inContrast = false
  let carried = false
  piece.rounds.forEach((count, k) => {
    const line = lines[k]!
    const run = runs[k]
    const full = run && run[0] === 0 && run[1] >= count
    if (full && !inContrast) {
      out.push(k === 0 ? 'Start with the contrast yarn.' : 'Change to the contrast yarn.')
      inContrast = true
    } else if (!full && inContrast) {
      out.push('Change to the main yarn.')
      inContrast = false
    }
    if (!run || full) {
      out.push(line)
      return
    }
    if (!carried) {
      out.push('Join the contrast yarn and carry the unused yarn inside the piece, working over it, until the lining is done.')
      carried = true
    }
    const [a, n] = run
    const after = count - a - n
    const parts = [
      a > 0 ? `${UK_SC} in next ${a} sts` : null,
      `change to the contrast yarn, ${UK_SC} in next ${n} sts`,
      `change to the main yarn${after > 0 ? `, ${UK_SC} in next ${after} sts` : ''}`,
    ].filter(Boolean)
    out.push(`Round ${k + 1}: ${parts.join(', ')}. (${count} sts)`)
  })
  // Any line past the rounds (none today) is kept as written.
  return [...out, ...lines.slice(piece.rounds.length)]
}

/** The assembly lines, read off the placements. */
export function writeAssembly(p: CompositionProgram): string[] {
  const pieces = compositionPieces(p)
  const lines: string[] = []
  for (const piece of pieces) {
    if (!piece.joinsTo) continue
    const to = piece.joinsTo.toLowerCase()
    if (piece.kind === 'disc') {
      lines.push(
        /toe pad/i.test(piece.label)
          ? `Sew a toe pad flat onto the sole of each ${to.replace(/s$/, '')}, a little below the middle, with the tail.`
          : /toe bean/i.test(piece.label)
            ? `Sew three toe beans flat onto each sole in an arc above its pad, with the tails.`
          : `Sew the ${piece.label.toLowerCase()} flat onto the front of the ${to} with the tail.`,
      )
    } else if (piece.kind === 'pressed') {
      lines.push(`Sew the ${piece.label.toLowerCase()} to the ${to} by the closed end, lining facing forward, so they hang down beside the face.`)
    } else {
      lines.push(
        `Sew the ${piece.label.toLowerCase()} to the ${to}, ` +
        'stuffing firmly as you close each piece.',
      )
    }
  }
  for (const prop of p.props ?? []) {
    const on = prettify(baseName(prop.on), 1).toLowerCase()
    lines.push(`Fit the ${prop.name.replace(SIDE_SUFFIX, '').replace(/[-_]+/g, ' ')} to the ${on} and fasten the washer behind it.`)
  }
  // The embroidered face, from the same round-and-stitch spots the render
  // lays the strands on.
  if (p.embroidery?.length) {
    const headName = p.embroidery[0]!.on
    lines.push(...writeFaceInstructions(p.embroidery, prettify(baseName(headName), 1).toLowerCase()))
  }
  // The hair: a separate loop-stitch circle, worked and sewn on.
  for (const h of p.hair ?? []) lines.push(...writeHairInstructions(h, prettify(baseName(h.on), 1).toLowerCase()))
  lines.push('Weave in every end and give the finished piece a gentle shape with your hands.')
  return lines
}

/** The whole pattern as flat lines, in working order. */
export function writeCompositionInstructions(p: CompositionProgram): string[] {
  const out: string[] = []
  for (const piece of compositionPieces(p)) {
    out.push(
      piece.makeQuantity > 1
        ? `${piece.label} (make ${piece.makeQuantity})`
        : piece.label,
    )
    out.push(...writePieceInstructions(piece))
  }
  out.push('Assembly')
  out.push(...writeAssembly(p))
  for (const a of p.accessories ?? []) {
    if (a.kind !== 'nightcap') continue
    out.push('Nightcap')
    out.push(...nightcapInstructions({ headRadiusMm: a.headRadiusMm, colourHex: a.colourHex, yarnWeight: a.yarnWeight }))
    out.push(`Sit the hat on the ${baseName(a.on)} with the band just above the eyes and let the tip flop to one side; a few stitches through the band hold it.`)
  }
  return out
}

export interface StructuredRow {
  section: string
  rowNumber: number
  rowLabel: string
  instruction: string
  stitchCount?: number
}

/** The `CrochetPattern.rowsStructured` shape the Studio's written view reads. */
export function compositionRowsStructured(p: CompositionProgram): StructuredRow[] {
  const rows: StructuredRow[] = []
  for (const piece of compositionPieces(p)) {
    const lines = writePieceInstructions(piece)
    lines.forEach((line, i) => {
      rows.push({
        section: piece.section,
        rowNumber: i + 1,
        rowLabel: line.split(':')[0] ?? `Round ${i + 1}`,
        instruction: line,
        stitchCount: piece.rounds[i],
      })
    })
  }
  writeAssembly(p).forEach((line, i) => {
    rows.push({
      section: 'Assembly',
      rowNumber: i + 1,
      rowLabel: `Step ${i + 1}`,
      instruction: line,
    })
  })
  return rows
}

/** The notions a composition needs beyond yarn. */
export function compositionNotions(p: CompositionProgram): string[] {
  const notions = ['Toy stuffing', 'Tapestry needle', 'Stitch marker']
  if (p.parts.some((x) => x.yarnWeight === 'fine')) notions.push('Fine (4 ply) yarn in the contrast colour and a 2.5 mm hook, for the toe beans')
  if ((p.props ?? []).some((x) => /eye/i.test(x.name))) {
    const eye = (p.props ?? []).find((x) => /eye/i.test(x.name))!
    notions.push(`Safety eyes, ${Math.round(eye.radiusMm * 2)} mm`)
  }
  if ((p.props ?? []).some((x) => /nose/i.test(x.name))) notions.push('Safety nose')
  for (const label of new Set((p.embroidery ?? []).map((e) => e.threadLabel))) notions.push(`${label}, for the face`)
  if ((p.accessories ?? []).some((a) => a.kind === 'nightcap')) notions.push('A third yarn for the nightcap, and card or a pompom maker for its pompom')
  return notions
}

/**
 * The symbol chart of a composition, or null.
 *
 * A multi-piece amigurumi is written-only by design (charting one piece of
 * nine and calling it the pattern's chart would mislead). A ONE-piece
 * composition — the plain ball and egg bases — is a single sphere, and the
 * completeness gate demands a chart of every single-piece pattern, so it is
 * charted as the sphere it is.
 */
export function compositionChart(p: CompositionProgram): ReturnType<typeof programToChart> | null {
  if (p.parts.length !== 1) return null
  const only = p.parts[0]!
  return programToChart({ name: p.name, form: 'sphere', stitch: only.stitch, rounds: only.rounds })
}
