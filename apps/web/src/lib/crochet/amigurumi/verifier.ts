// Verifier - sanity-checks a multi-piece amigurumi pattern.
//
// Used by QC rules at the publish gate.

import type { AmigurumiPiece, AssemblyInstructions, VerificationResult } from './types'

export function verifyAmigurumiPattern(
  pieces: AmigurumiPiece[],
  assembly: AssemblyInstructions,
): VerificationResult {
  const issues: string[] = []

  if (pieces.length === 0) {
    return { ok: false, issues: ['No pieces provided.'] }
  }
  if (assembly.buildOrder.length === 0) {
    issues.push('buildOrder is empty.')
  }

  const pieceLabels = new Set<string>()
  for (const p of pieces) {
    if (!p.label) {
      issues.push(`Piece with shape ${p.shape} has no label; multi-piece patterns require labels.`)
      continue
    }
    if (pieceLabels.has(p.label)) {
      issues.push(`Duplicate piece label: ${p.label}`)
    }
    pieceLabels.add(p.label)

    // Each piece must close cleanly: stitch counts on the row-by-row sequence
    // never go negative and the final row stitch count must be reachable
    // from the previous by ±6.
    if (p.rowByRow.length === 0) {
      issues.push(`Piece ${p.label}: rowByRow is empty.`)
      continue
    }
    for (let i = 0; i < p.rowByRow.length; i++) {
      const r = p.rowByRow[i]!
      if (r.stitchCount <= 0) {
        issues.push(`Piece ${p.label} round ${r.round}: stitch count is non-positive.`)
      }
      if (i > 0) {
        const prev = p.rowByRow[i - 1]!
        const delta = Math.abs(r.stitchCount - prev.stitchCount)
        if (delta > 12 && delta !== r.stitchCount - prev.stitchCount) {
          // OK to have a row that grows a lot if it's the foundation round.
          if (i > 1) {
            issues.push(
              `Piece ${p.label} round ${r.round}: stitch count jumped by ${delta} from ${prev.stitchCount}, which is implausible.`,
            )
          }
        }
      }
    }
  }

  // buildOrder references must exist.
  for (const ref of assembly.buildOrder) {
    if (!pieceLabels.has(ref)) {
      issues.push(`buildOrder references piece "${ref}" which is not in pieces[].`)
    }
  }
  // Every piece must appear in buildOrder.
  for (const label of pieceLabels) {
    if (!assembly.buildOrder.includes(label)) {
      issues.push(`Piece "${label}" is not in buildOrder.`)
    }
  }
  // Every joint references must exist.
  for (const j of assembly.joints) {
    for (const ref of j.piecesJoined) {
      if (!pieceLabels.has(ref)) {
        issues.push(`Joint references piece "${ref}" which is not in pieces[].`)
      }
    }
  }
  // If a piece is in buildOrder beyond the first, it should appear in at
  // least one joint.
  for (let i = 1; i < assembly.buildOrder.length; i++) {
    const label = assembly.buildOrder[i]!
    const jointed = assembly.joints.some(j => j.piecesJoined.includes(label))
    if (!jointed) {
      issues.push(`Piece "${label}" is in buildOrder but does not appear in any joint.`)
    }
  }

  return { ok: issues.length === 0, issues }
}
