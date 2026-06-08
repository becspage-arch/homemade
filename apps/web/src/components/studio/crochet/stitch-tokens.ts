/**
 * Tokenise a pattern instruction for inline stitch help.
 *
 * Walks the string, finds every known crochet abbreviation, and
 * returns a flat list of text + stitch tokens the renderer can map
 * over. Stitch tokens carry both the displayed abbreviation (with the
 * pattern's terminology applied) and the slug the renderer uses to
 * look up the foundation tutorial via /api/studio/crochet/stitch-help.
 */

import type { TerminologyMode } from './types'

interface AbbreviationPair {
  uk: string
  us: string
  slug: string // master Stitch.slug
}

/**
 * The same set the terminology helper uses, extended with the master
 * Stitch slugs so the inline help can resolve each match to its
 * foundation tutorial in one round trip.
 */
const ABBREVIATIONS: AbbreviationPair[] = [
  { uk: 'ch', us: 'ch', slug: 'crochet-chain' },
  { uk: 'sl st', us: 'sl st', slug: 'crochet-slip-stitch' },
  { uk: 'dc', us: 'sc', slug: 'crochet-double-crochet-uk' },
  { uk: 'htr', us: 'hdc', slug: 'crochet-half-treble' },
  { uk: 'tr', us: 'dc', slug: 'crochet-treble' },
  { uk: 'dtr', us: 'tr', slug: 'crochet-double-treble' },
  { uk: 'ttr', us: 'dtr', slug: 'crochet-triple-treble' },
  { uk: 'mr', us: 'mr', slug: 'crochet-magic-ring' },
]

export interface TextToken {
  kind: 'text'
  text: string
}

export interface StitchToken {
  kind: 'stitch'
  displayText: string
  slug: string
  /** The matched canonical abbreviation in the source convention,
   *  before terminology translation. */
  sourceMatch: string
}

export type InstructionToken = TextToken | StitchToken

/**
 * Tokenise an instruction. `sourceTerminology` is the pattern's
 * declared convention (defaults UK); `target` is what to display.
 */
export function tokeniseInstruction(
  instruction: string,
  sourceTerminology: TerminologyMode,
  target: TerminologyMode,
): InstructionToken[] {
  if (!instruction) return []

  // Build the pattern from the source terminology's abbreviations.
  // The slug is shared either way, but the display text is converted
  // to the target convention.
  const sortedAbbreviations = [...ABBREVIATIONS].sort((a, b) => {
    // Match longest first so "sl st" wins over "st".
    const aLen = sourceTerminology === 'uk' ? a.uk.length : a.us.length
    const bLen = sourceTerminology === 'uk' ? b.uk.length : b.us.length
    return bLen - aLen
  })

  // Build the master regex: alternation of all source abbreviations,
  // with word boundaries to avoid mid-word matches.
  const sourceTokens = sortedAbbreviations.map((p) =>
    sourceTerminology === 'uk' ? p.uk : p.us,
  )
  const escaped = sourceTokens.map(escapeRegex)
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')

  const tokens: InstructionToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(instruction)) !== null) {
    const matchStart = match.index
    const matchEnd = matchStart + match[0].length

    if (matchStart > lastIndex) {
      tokens.push({ kind: 'text', text: instruction.slice(lastIndex, matchStart) })
    }

    const sourceMatch = match[0]
    const lower = sourceMatch.toLowerCase()
    const pair = sortedAbbreviations.find(
      (p) => (sourceTerminology === 'uk' ? p.uk : p.us).toLowerCase() === lower,
    )
    if (pair) {
      const targetText = target === 'uk' ? pair.uk : pair.us
      tokens.push({
        kind: 'stitch',
        displayText: matchCase(sourceMatch, targetText),
        slug: pair.slug,
        sourceMatch,
      })
    } else {
      tokens.push({ kind: 'text', text: sourceMatch })
    }

    lastIndex = matchEnd
  }

  if (lastIndex < instruction.length) {
    tokens.push({ kind: 'text', text: instruction.slice(lastIndex) })
  }

  return tokens
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchCase(source: string, replacement: string): string {
  if (source === source.toUpperCase()) return replacement.toUpperCase()
  if (source.charAt(0) === source.charAt(0).toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}
