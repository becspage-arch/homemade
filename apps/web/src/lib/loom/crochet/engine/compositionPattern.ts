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

import { writeInstructions, type CrochetProgram } from './program'
import type { AmigurumiPart, CompositionProgram } from './composition'

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
}

const SIDE_SUFFIX = /-(?:l|r|al|ar|ll|lr)$/

/** "ear-l" → "ear"; "body" → "body". */
function baseName(name: string): string {
  return name.replace(SIDE_SUFFIX, '')
}

function prettify(base: string, quantity: number): string {
  const words = base.replace(/[-_]+/g, ' ').trim()
  const title = words.charAt(0).toUpperCase() + words.slice(1)
  if (quantity === 1) return title
  // Plain plural — every part name in the presets pluralises with an s.
  return title.endsWith('s') ? title : `${title}s`
}

/** Group the composition's parts into the pieces a written pattern lists. */
export function compositionPieces(p: CompositionProgram): CompositionPiece[] {
  const groups = new Map<string, AmigurumiPart[]>()
  const order: string[] = []
  for (const part of p.parts) {
    // Identical work (same base name, same rounds, same colour, same scale) is
    // one piece made more than once.
    const key = [baseName(part.name), part.rounds.join(','), part.colourHex, part.scale ?? 1].join('|')
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
    const joinRaw = (first.place as { on?: string }).on
    const joinsTo = !joinRaw || joinRaw === 'ground' ? null : prettify(baseName(joinRaw), 1)
    return {
      label,
      section: label,
      makeQuantity: parts.length,
      colourHex: first.colourHex,
      rounds: first.rounds,
      stitchCount: first.rounds.reduce((a, b) => a + b, 0),
      partNames: parts.map((x) => x.name),
      joinsTo,
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
    form: 'sphere',
    rounds: piece.rounds,
  }
  return writeInstructions(program)
}

/** The assembly lines, read off the placements. */
export function writeAssembly(p: CompositionProgram): string[] {
  const pieces = compositionPieces(p)
  const lines: string[] = []
  for (const piece of pieces) {
    if (!piece.joinsTo) continue
    const what = piece.makeQuantity > 1 ? `the ${piece.label.toLowerCase()}` : `the ${piece.label.toLowerCase()}`
    lines.push(`Sew ${what} to the ${piece.joinsTo.toLowerCase()}, stuffing firmly as you close each piece.`)
  }
  for (const prop of p.props ?? []) {
    const on = prettify(baseName(prop.on), 1).toLowerCase()
    lines.push(`Fit the ${prop.name.replace(SIDE_SUFFIX, '').replace(/[-_]+/g, ' ')} to the ${on} and fasten the washer behind it.`)
  }
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
  if ((p.props ?? []).some((x) => /eye/i.test(x.name))) {
    const eye = (p.props ?? []).find((x) => /eye/i.test(x.name))!
    notions.push(`Safety eyes, ${Math.round(eye.radiusMm * 2)} mm`)
  }
  if ((p.props ?? []).some((x) => /nose/i.test(x.name))) notions.push('Safety nose')
  return notions
}
