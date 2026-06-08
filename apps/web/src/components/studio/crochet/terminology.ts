/**
 * Apply a UK / US terminology pass to a written instruction.
 *
 * The pattern is authored in either convention (see
 * CrochetPattern.terminologyConvention) and the Studio user can flip
 * the toggle live. The conversion is done in one pass against a token
 * stream, so a `tr` rewritten to US `dc` is not then rewritten again
 * by the `dc → sc` rule.
 *
 * Limitations of v1: word-boundary replacement only. Not aware of
 * mid-word strings — so this is safe for "dc" inside a row but it
 * wouldn't reflow a sentence that names the stitch in full prose. The
 * pattern bodies stick to abbreviations in row instructions, so this
 * is enough.
 */

import type { TerminologyMode } from './types'

interface AbbreviationPair {
  uk: string
  us: string
}

const ABBREVIATIONS: AbbreviationPair[] = [
  { uk: 'dc', us: 'sc' },
  { uk: 'htr', us: 'hdc' },
  { uk: 'tr', us: 'dc' },
  { uk: 'dtr', us: 'tr' },
  { uk: 'ttr', us: 'dtr' },
  { uk: 'dc2tog', us: 'sc2tog' },
  { uk: 'dc3tog', us: 'sc3tog' },
  { uk: 'tr2tog', us: 'dc2tog' },
  { uk: 'tr3tog', us: 'dc3tog' },
]

const UK_TO_US = new Map<string, string>(ABBREVIATIONS.map((p) => [p.uk, p.us]))
const US_TO_UK = new Map<string, string>(ABBREVIATIONS.map((p) => [p.us, p.uk]))

/**
 * Apply terminology conversion. The v1 assumption is the pattern is
 * authored in UK convention; the target is the Studio toggle position.
 */
export function applyTerminology(instruction: string, target: TerminologyMode): string {
  if (target === 'uk') return instruction
  return convertOnce(instruction, UK_TO_US)
}

/**
 * The inverse direction. Currently unused (v1 assumes UK source);
 * surfaced for step 6 when US-source patterns land.
 */
export function applyTerminologyToUk(instruction: string): string {
  return convertOnce(instruction, US_TO_UK)
}

/**
 * Single-pass word-boundary replacement using a map lookup. Splits
 * the string into word tokens and non-word separators, replaces only
 * the word tokens whose lowercase form matches a map key, and leaves
 * everything else untouched.
 *
 * The split-then-rejoin pattern guarantees no token is converted
 * twice in the same pass.
 */
function convertOnce(input: string, map: Map<string, string>): string {
  // Token = run of word characters; everything else is a separator.
  // Hyphens stay attached to words so "ch-3" reads as one token.
  return input.replace(/[A-Za-z][A-Za-z0-9-]*/g, (token) => {
    const lower = token.toLowerCase()
    const replacement = map.get(lower)
    if (!replacement) return token
    return matchCase(token, replacement)
  })
}

function matchCase(source: string, replacement: string): string {
  if (source === source.toUpperCase()) return replacement.toUpperCase()
  if (source.charAt(0) === source.charAt(0).toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}
