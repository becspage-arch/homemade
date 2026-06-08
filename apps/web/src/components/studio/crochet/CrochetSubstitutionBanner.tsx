'use client'

/**
 * CrochetSubstitutionBanner — calm advisory line shown in the active
 * project footer when the user's chosen yarn + hook differ from the
 * pattern's recommendations enough to matter.
 *
 * The numbers are approximate. The calculator deliberately rounds and
 * trades accuracy for legibility: a maker doesn't need three decimal
 * places to know "this is going to be 12 percent bigger".
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { computeSubstitution, type SubstitutionInputs } from './yarn-substitution'

interface Props {
  inputs: SubstitutionInputs
}

export function CrochetSubstitutionBanner({ inputs }: Props) {
  const result = computeSubstitution(inputs)
  if (!result.haveEnoughInputs) return null
  if (result.verdict === 'match') {
    return (
      <span className="crochet-studio-substitution match">
        <CheckCircle2 size={12} strokeWidth={1.8} aria-hidden />
        <span>Your yarn matches the pattern.</span>
      </span>
    )
  }

  return (
    <span className={`crochet-studio-substitution ${result.verdict}`}>
      <AlertCircle size={12} strokeWidth={1.8} aria-hidden />
      <span>{result.warning}</span>
    </span>
  )
}
