/**
 * Generate a Homemade-voice description for a Stitching Mama pattern.
 *
 * Voice constraints (per memory/feedback_homemade_voice.md and
 * docs/voice-spec-2026-05-21.md):
 *   - Mary Berry / Erin Boyle register — direct, calm, factual.
 *   - No em dashes, no en dashes, no exclamation points.
 *   - No marketing copy ("perfect for", "ideal for", "you'll love").
 *   - No "honest" / "honestly".
 *   - 3–4 sentences.
 *   - Names what the pattern depicts, who it suits, what's distinctive
 *     about the chart.
 *
 * Generated from the parsed pattern metadata + per-theme subject phrase
 * so descriptions are accurate to the actual chart (palette size,
 * dimensions, technique used) rather than handwaving.
 */

import type { ParsedStitchingMamaPattern } from './parse-stitching-mama-pdf'
import type { CatalogueEntry, Theme } from './catalogue'

function colourCountPhrase(n: number): string {
  if (n <= 10) return `${n} DMC shades`
  if (n <= 25) return `${n} DMC colours`
  if (n <= 45) return `${n} DMC colours`
  return `${n} DMC colours across the palette`
}

function sizePhrase(parsed: ParsedStitchingMamaPattern): string {
  const w = parsed.gridWidth
  const h = parsed.gridHeight
  if (parsed.finishedSizeCm) {
    const cmW = parsed.finishedSizeCm.width
    const cmH = parsed.finishedSizeCm.height
    return `${w} by ${h} stitches, finishing at ${cmW} by ${cmH} centimetres on 14-count Aida`
  }
  return `${w} by ${h} stitches on 14-count Aida`
}

function techniquePhrase(parsed: ParsedStitchingMamaPattern): string {
  // Stitching Mama's PDFs are full cross only — no back-stitch / French
  // knots / beads. State that plainly so stitchers know what they're
  // committing to.
  return 'Worked in full cross with no back-stitch or French knots'
}

function suitabilityPhrase(parsed: ParsedStitchingMamaPattern): string {
  const colours = parsed.palette.length
  const cells = parsed.cells.length
  if (colours < 25 && cells < 4000) return 'comfortable for a stitcher with a few projects behind them'
  if (colours < 45) return 'asks for steady time with the floss key and good light'
  return 'a longer commitment, with close tonal shifts that reward unhurried work'
}

interface FlowerSubject { kind: 'flower'; name: string }
interface AnimalSubject { kind: 'animal'; name: string }
interface QuoteSubject { kind: 'quote'; text: string; tone: 'mom' | 'sass' | 'pride' }

function classifySubject(entry: CatalogueEntry): FlowerSubject | AnimalSubject | QuoteSubject {
  if (entry.theme === 'Flowers') {
    return { kind: 'flower', name: entry.name.toLowerCase() }
  }
  if (entry.theme === 'Elephant') {
    return { kind: 'animal', name: entry.name.toLowerCase() }
  }
  if (entry.theme === 'LGBTQ') {
    return { kind: 'quote', text: entry.name, tone: 'pride' }
  }
  if (entry.theme === 'Mom') {
    return { kind: 'quote', text: entry.name, tone: 'mom' }
  }
  return { kind: 'quote', text: entry.name, tone: 'sass' }
}

function leadSentence(entry: CatalogueEntry, parsed: ParsedStitchingMamaPattern): string {
  const subject = classifySubject(entry)
  const colourPhrase = colourCountPhrase(parsed.palette.length)
  if (subject.kind === 'flower') {
    return `${capitalise(subject.name)} in counted cross-stitch, with ${colourPhrase} carrying the petals and leaves through tonal steps.`
  }
  if (subject.kind === 'animal') {
    return `${capitalise(subject.name)} in counted cross-stitch, with ${colourPhrase} drawing the form against a plain Aida ground.`
  }
  // Quote-style subjects
  if (subject.tone === 'pride') {
    return `A pride-themed counted cross-stitch piece reading "${subject.text}", lettered across the canvas with a small surrounding design.`
  }
  if (subject.tone === 'mom') {
    return `A counted cross-stitch piece reading "${subject.text}", from Stitching Mama's mother-of-young-kids range.`
  }
  return `A counted cross-stitch piece reading "${subject.text}", from Stitching Mama's snarky-quote range.`
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function buildDescription(entry: CatalogueEntry, parsed: ParsedStitchingMamaPattern): string {
  const lead = leadSentence(entry, parsed)
  const size = `${sizePhrase(parsed)}.`
  const technique = `${techniquePhrase(parsed)}, ${suitabilityPhrase(parsed)}.`
  return `${lead} ${size} ${technique}`
}
