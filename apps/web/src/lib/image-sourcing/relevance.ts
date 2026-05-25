/**
 * Subject-relevance scoring for tutorial hero images.
 *
 * The existing verify.ts pipeline checks "does this image plausibly match
 * the tutorial" with a 2-tier verdict (verified | rejected). In practice the
 * worker rubric there is lenient on subject match: Rebecca audited 10 hero
 * images in the Most-loved rails (cooking + baking) and 9 were a different
 * subject from the tutorial title — Yorkshire puddings showing pasta, a
 * "bubble and squeak" tutorial showing a Christmas-tree bauble, "thyme
 * cough syrup" showing a honey bee.
 *
 * This module narrows the lens: subject of the photograph vs subject of the
 * tutorial, three tiers, strict. EXACT means the image unambiguously depicts
 * the named thing. PARTIAL means an adjacent or related subject. WRONG means
 * a different subject entirely (the bee for the cough syrup).
 *
 * Architecture mirrors verify.ts: this module owns the contract + the prompt
 * the worker session reads alongside each image. The actual judgement comes
 * from a Claude Code worker session inspecting the image inline with its
 * built-in multimodal Read tool — no paid API. Scripts:
 *
 *   - score-relevance-batch.ts → enqueues PUBLISHED hero images to a JSON
 *     manifest with one prompt-hint string per entry.
 *   - the worker reads each cached image with Read, evaluates against the
 *     prompt, writes verdicts to docs/image-relevance-verdicts.json.
 *   - apply-relevance-verdicts.ts → reads verdicts, stamps Media, and
 *     re-sources for WRONG entries via the orchestrator.
 *
 * The autopilot publish path can also call the orchestrator with a verify
 * callback that uses verdictToVerify() to translate a RelevanceVerdict back
 * into the orchestrator's existing 2-tier shape (EXACT/PARTIAL → verified,
 * WRONG → rejected → advance to next source).
 */

import type { VerifyImageResult } from './verify'

export type RelevanceTier = 'EXACT' | 'PARTIAL' | 'WRONG'

export interface RelevanceVerdict {
  tier: RelevanceTier
  /** One-sentence description of what the image shows and why it does or
   *  doesn't match the named subject. */
  reason: string
  /** Worker-supplied 0..1. Worker is asked to be honest about ambiguity. */
  confidence: number
}

export interface RelevanceInput {
  /** Tutorial title — primary signal for the named subject. */
  tutorialTitle: string
  /** Tutorial subtitle (one-line clarifier; optional). */
  tutorialSubtitle?: string | null
  /** Short tutorial excerpt to disambiguate ambiguous titles. */
  tutorialExcerpt?: string | null
  /** Top-level category slug — cooking / baking / mindset etc. */
  category: string
  /** Sub-category slug — bread / cake / tapping etc. */
  subCategory?: string | null
  /** Up to 5 key ingredient names (recipe content). */
  keyIngredients?: string[]
  /** Candidate image source (unsplash / pexels / ...). Label only. */
  imageSource: string
  /** Candidate image URL — used by the worker's Read tool after cache. */
  imageUrl: string
}

/**
 * Build the prompt hints a worker reads alongside the image. Deliberately
 * front-loads the named subject, gives examples for every tier, and warns
 * against keyword-only matching (the failure mode that produced the bee for
 * thyme cough syrup).
 */
export function buildRelevancePrompt(input: RelevanceInput): string {
  const lines: string[] = []
  lines.push('TUTORIAL')
  lines.push(`  Title: ${input.tutorialTitle}`)
  if (input.tutorialSubtitle) lines.push(`  Subtitle: ${input.tutorialSubtitle}`)
  if (input.tutorialExcerpt) {
    const excerpt = input.tutorialExcerpt.slice(0, 240).trim()
    lines.push(`  Excerpt: ${excerpt}`)
  }
  lines.push(`  Category: ${input.category}${input.subCategory ? ` / ${input.subCategory}` : ''}`)
  if (input.keyIngredients?.length) {
    lines.push(`  Key ingredients: ${input.keyIngredients.slice(0, 5).join(', ')}`)
  }
  lines.push(`  Candidate source: ${input.imageSource}`)
  lines.push('')
  lines.push('TASK')
  lines.push('  You will see one candidate hero image. Score the SUBJECT of')
  lines.push('  the photograph against the SUBJECT named in the tutorial')
  lines.push('  title. Be strict — keyword overlap is not relevance. A bee')
  lines.push('  is not a thyme cough syrup; a pasta dish is not a Yorkshire')
  lines.push('  pudding; a roast cut is not a Beef Wellington.')
  lines.push('')
  lines.push('TIERS')
  lines.push('  EXACT   — Image unambiguously shows the named subject.')
  lines.push('            For a recipe: the finished dish (or its key visible')
  lines.push('            stage — bread dough being kneaded for a bread')
  lines.push('            tutorial, lambs nursing for a lambing tutorial).')
  lines.push('            For a technique: the technique being performed or')
  lines.push('            its characteristic output (a treble crochet stitch')
  lines.push('            in close-up, a finished joint, a soldered seam).')
  lines.push('            For a remedy / preparation: the prepared product')
  lines.push('            (a bottle of syrup, a balm tin, a poultice on the')
  lines.push('            skin) OR the named botanical with the named')
  lines.push('            preparation form visible.')
  lines.push('  PARTIAL — Image shows the right CLASS of thing but not the')
  lines.push('            specific named subject. A generic stew for "Beef')
  lines.push('            bourguignon". A loaf of bread for a sourdough.')
  lines.push('            A hen for a "Marans hen molting" tutorial. The')
  lines.push('            named ingredient alone (a thyme sprig) for a')
  lines.push('            cough-syrup tutorial. Adjacent, not exact.')
  lines.push('  WRONG   — Image shows a genuinely different subject.')
  lines.push('            Yorkshire pudding → pasta. Bubble and squeak (food)')
  lines.push('            → Christmas-tree bauble. Thyme cough syrup → honey')
  lines.push('            bee with no thyme or syrup. Beef Wellington → roast')
  lines.push('            beef without pastry casing. Angel food cake → cake')
  lines.push('            with a cherub figurine on top.')
  lines.push('')
  lines.push('AMBIGUITY')
  lines.push('  - Decorative styling (props, garnishes, backgrounds) is fine')
  lines.push('    if the named subject is clearly the photograph\'s subject.')
  lines.push('  - If the image could pass for the named subject but you\'re')
  lines.push('    uncertain, that\'s PARTIAL, not EXACT.')
  lines.push('  - If you cannot identify the photograph\'s subject confidently')
  lines.push('    at all, score WRONG with confidence ≤ 0.5 and say so.')
  lines.push('')
  lines.push('RESPONSE — emit exactly three lines, no preamble:')
  lines.push('  VERDICT: <EXACT|PARTIAL|WRONG>')
  lines.push('  REASON: <one sentence on what the photo actually shows and')
  lines.push('           why that does or doesn\'t match the named subject>')
  lines.push('  CONFIDENCE: <0.0..1.0>')
  return lines.join('\n')
}

/**
 * Parse the three-line response the worker writes. Tolerant of leading /
 * trailing whitespace and mixed casing on the verdict keyword. Throws when
 * the response is unparseable so the batch script can surface it rather
 * than silently stamping a default.
 */
export function parseRelevanceVerdict(text: string): RelevanceVerdict {
  const verdictMatch = text.match(/VERDICT\s*:\s*(EXACT|PARTIAL|WRONG)/i)
  const reasonMatch = text.match(/REASON\s*:\s*(.+?)(?=\n\s*CONFIDENCE\s*:|$)/is)
  const confidenceMatch = text.match(/CONFIDENCE\s*:\s*([0-9]*\.?[0-9]+)/i)
  if (!verdictMatch) {
    throw new Error(`relevance: no VERDICT line in response: ${text.slice(0, 120)}`)
  }
  const tier = verdictMatch[1]!.toUpperCase() as RelevanceTier
  const reason = reasonMatch?.[1]?.trim().replace(/\s+/g, ' ') ?? ''
  const confidence = confidenceMatch ? clamp(Number(confidenceMatch[1]), 0, 1) : 0.5
  return { tier, reason, confidence }
}

function clamp(value: number, lo: number, hi: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.max(lo, Math.min(hi, value))
}

/**
 * Translate a 3-tier RelevanceVerdict into the orchestrator's existing
 * 2-tier VerifyImageResult. Used by the autopilot publish path so the
 * existing `verify` callback contract carries the new strict scoring.
 *
 * EXACT  → verified
 * PARTIAL→ verified (with an annotated reason so apply-* scripts can see it)
 * WRONG  → rejected (orchestrator advances to the next source)
 *
 * The PARTIAL → verified mapping is deliberate: PARTIAL is the right CLASS,
 * just not the specific subject. Better to keep a PARTIAL than fall through
 * to a procedural card for content where the orchestrator's free sources
 * carry no closer match. If Rebecca wants the autopilot stricter later,
 * flip this single mapping to rejected.
 */
export function verdictToVerify(verdict: RelevanceVerdict): VerifyImageResult {
  if (verdict.tier === 'WRONG') {
    return { verdict: 'rejected', reason: `relevance=WRONG: ${verdict.reason}` }
  }
  const note = verdict.tier === 'PARTIAL' ? 'relevance=PARTIAL' : 'relevance=EXACT'
  return { verdict: 'verified', reason: `${note}: ${verdict.reason}` }
}

/**
 * High-level scorer for callers that already hold a worker-vision callback
 * (e.g. an authoring path that downloads bytes, opens them inline, and
 * returns the three-line response text). The callback is passed the prompt
 * text and the local image path; it returns the worker's raw three-line
 * reply. Errors propagate so the caller can decide whether to retry the
 * next candidate.
 */
export async function scoreRelevance(
  input: RelevanceInput,
  localImagePath: string,
  scorer: (prompt: string, imagePath: string) => Promise<string>,
): Promise<RelevanceVerdict> {
  const prompt = buildRelevancePrompt(input)
  const reply = await scorer(prompt, localImagePath)
  return parseRelevanceVerdict(reply)
}
