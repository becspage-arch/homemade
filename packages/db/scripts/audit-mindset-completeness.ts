/**
 * Audit mindset tutorials against the "every tutorial DELIVERS a practice"
 * rule locked in `feedback_mindset_voice.md` (2026-05-19).
 *
 * Three failure modes:
 *
 *   VIOLATES_A — Body has no actionable practice. Descriptive prose only.
 *                No tapping rounds, no journal prompts, no energy
 *                statements, no ritual steps, no meditation script.
 *
 *   VIOLATES_B — Intro / description references a technique that isn't
 *                delivered in body. Mentions tapping → body has no
 *                tapping; mentions journal → body has no journal prompts;
 *                mentions energy statements → body has no release/allow
 *                statements; mentions ritual → body has no ritual steps;
 *                mentions meditation → body has no meditation script.
 *
 *   VIOLATES_C — Body has an action stub (e.g. "write the number down")
 *                but no follow-through practice AND no forward action close.
 *
 *   VIOLATES_MULTIPLE — Two or more of the above.
 *
 * READING-type tutorials are exempt from the practice-delivery rule by
 * design (they're reference articles). They still need a clear topic +
 * body so we record them as PASS_READING separately.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/audit-mindset-completeness.ts
 *
 * Default: PUBLISHED only. Add `--include-drafts` to widen the scope.
 *
 * Outputs:
 *   - stdout summary (per-verdict counts)
 *   - docs/mindset-completeness-audit-YYYY-MM-DD.md (full table)
 *
 * The audit is read-only: it never writes to the database.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

interface CliFlags {
  includeDrafts: boolean
  outDir: string
  outFile?: string
  filterSlug?: string
}

function parseFlags(argv: string[]): CliFlags {
  const includeDrafts = argv.includes('--include-drafts')
  const outIdx = argv.indexOf('--out-dir')
  const outFileIdx = argv.indexOf('--out-file')
  const slugIdx = argv.indexOf('--slug')
  const outDir = outIdx >= 0 && argv[outIdx + 1] ? argv[outIdx + 1]! : resolve(__dirname, '..', '..', '..', 'docs')
  const outFile = outFileIdx >= 0 && argv[outFileIdx + 1] ? argv[outFileIdx + 1]! : undefined
  const filterSlug = slugIdx >= 0 && argv[slugIdx + 1] ? argv[slugIdx + 1]! : undefined
  return { includeDrafts, outDir, outFile, filterSlug }
}

type Node = {
  type: string
  attrs?: Record<string, unknown>
  content?: Node[]
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  text?: string
}

interface BodyAnalysis {
  text: string
  introText: string
  bodyText: string
  hasHeading2: boolean
  headingTexts: string[]
  bulletListCount: number
  /** Sum of all listItem nodes across both bullet + ordered lists. */
  totalListItems: number
  numberedListCount: number
  /** orderedList list-items where the first paragraph reads as an imperative. */
  imperativeOrderedItems: number
  pullQuoteCount: number
  /** TipTap may use `blockquote` for short verse / affirmation chunks. */
  blockquoteCount: number
  totalParagraphs: number
}

function walkText(node: Node, out: string[]): void {
  if (typeof node.text === 'string') out.push(node.text)
  // pullQuote stores its text in attrs.quote (and optional attrs.attribution),
  // not in a `content` array. Same shape as the admin TipTap pullQuote
  // extension. Without this, every pullQuote-based affirmation / energy
  // statement / ritual statement disappears from the body text — and
  // the practice-delivery detectors all flag the tutorial as broken.
  if (node.type === 'pullQuote' && node.attrs) {
    const q = node.attrs.quote
    if (typeof q === 'string') out.push(q)
    const a = node.attrs.attribution
    if (typeof a === 'string' && a) out.push(a)
  }
  if (Array.isArray(node.content)) for (const c of node.content) walkText(c, out)
}

function extractParagraphText(node: Node): string {
  const out: string[] = []
  walkText(node, out)
  return out.join('')
}

function analyseBody(body: unknown): BodyAnalysis {
  const doc = (body && typeof body === 'object' && 'content' in body)
    ? (body as { content: Node[] })
    : { content: [] }
  const content = Array.isArray(doc.content) ? doc.content : []

  const headingTexts: string[] = []
  let hasHeading2 = false
  let bulletListCount = 0
  let totalListItems = 0
  let numberedListCount = 0
  let imperativeOrderedItems = 0
  let pullQuoteCount = 0
  let blockquoteCount = 0
  let totalParagraphs = 0

  // Intro = everything from the start of the body up to the first H2 heading.
  let firstHeading2Index = -1
  for (let i = 0; i < content.length; i++) {
    const n = content[i]!
    if (n.type === 'heading' && (n.attrs?.level === 2 || n.attrs?.level === '2')) {
      firstHeading2Index = i
      break
    }
  }

  const IMPERATIVE_LEAD = /^(?:write|tap|say|breathe|light|sit|stand|read|place|walk|hold|pick|set|find|close|open|take|repeat|inhale|exhale|put|press|notice|let|move|turn|name|count|trace|burn|drop|bring|leave|step|carry|return|continue|cross|focus|allow|release|picture|imagine|visualise|visualize|do |start|begin)/i

  function inspectListItems(list: Node, ordered: boolean): void {
    if (!Array.isArray(list.content)) return
    for (const item of list.content) {
      if (item.type !== 'listItem' || !Array.isArray(item.content)) continue
      totalListItems++
      if (ordered) {
        const firstPara = item.content.find((c) => c.type === 'paragraph')
        if (firstPara) {
          const text = extractParagraphText(firstPara).trim()
          if (IMPERATIVE_LEAD.test(text)) imperativeOrderedItems++
        }
      }
    }
  }

  for (const n of content) {
    if (n.type === 'heading') {
      const level = n.attrs?.level
      if (level === 2 || level === '2') hasHeading2 = true
      headingTexts.push(extractParagraphText(n))
    } else if (n.type === 'bulletList') {
      bulletListCount++
      inspectListItems(n, false)
    } else if (n.type === 'orderedList') {
      numberedListCount++
      inspectListItems(n, true)
    } else if (n.type === 'pullQuote') {
      pullQuoteCount++
    } else if (n.type === 'blockquote') {
      blockquoteCount++
    } else if (n.type === 'paragraph') {
      totalParagraphs++
    }
  }

  const introNodes = firstHeading2Index >= 0 ? content.slice(0, firstHeading2Index) : content
  const bodyNodes = firstHeading2Index >= 0 ? content.slice(firstHeading2Index) : []

  const introText = introNodes.map(extractParagraphText).join('\n').trim()
  const bodyText = bodyNodes.map(extractParagraphText).join('\n').trim()
  const text = content.map(extractParagraphText).join('\n').trim()

  return {
    text,
    introText,
    bodyText,
    hasHeading2,
    headingTexts,
    bulletListCount,
    totalListItems,
    numberedListCount,
    imperativeOrderedItems,
    pullQuoteCount,
    blockquoteCount,
    totalParagraphs,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Practice-delivery detectors. Each returns true when the body contains the
// signature of that practice family. Detectors are conservative-true: they
// look for structural hallmarks (tapping point list, release-allow pair,
// numbered question list, etc.), not just topical words.
// ─────────────────────────────────────────────────────────────────────────────

const TAPPING_POINTS = [
  'eyebrow',
  'side of eye',
  'under eye',
  'under nose',
  'chin',
  'collarbone',
  'under arm',
  'top of head',
  'karate chop',
]

function deliversTapping(a: BodyAnalysis): boolean {
  const t = a.bodyText.toLowerCase()
  // Must mention at least 3 of the 8 named points OR the karate chop point.
  let hits = 0
  for (const pt of TAPPING_POINTS) if (t.includes(pt)) hits++
  if (hits >= 3) return true
  // Or a setup statement starting with "Even though I" (tapping setup).
  if (/even though i\b/i.test(a.bodyText)) return true
  return false
}

function deliversEnergyStatements(a: BodyAnalysis): boolean {
  const t = a.bodyText.toLowerCase()
  // Release / Allow pair — the locked structural marker.
  const hasRelease = /\bi (?:am ready to )?release\b/.test(t) || /\brelease (?:it|this) now\b/.test(t)
  const hasAllow = /\bi (?:am ready to )?(?:align with and )?allow\b/.test(t) || /\ballow (?:it|this) now\b/.test(t)
  if (hasRelease && hasAllow) return true
  // Or a heading explicitly titled Release / Allow.
  const heads = a.headingTexts.map((h) => h.toLowerCase())
  const hasReleaseHead = heads.some((h) => /^release\b/.test(h) || /^release\s*\(/.test(h))
  const hasAllowHead = heads.some((h) => /^allow\b/.test(h) || /^allow\s*\(/.test(h))
  if (hasReleaseHead && hasAllowHead) return true
  return false
}

function deliversJournalPrompts(a: BodyAnalysis): boolean {
  // A journal-prompt set is a series of questions. Count question-shaped
  // headings or paragraphs across the whole body. ~3 or more is a set.
  let questionCount = 0
  for (const h of a.headingTexts) if (/\?\s*$/.test(h.trim())) questionCount++
  const lines = a.bodyText.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  for (const l of lines) if (/\?\s*$/.test(l)) questionCount++
  // Or numbered headings (1., 2., 3., …) — used in the canonical journal
  // prompt structure (see "feast-and-famine-journal-prompts").
  const numberedHeadings = a.headingTexts.filter((h) => /^\s*\d+[.)]\s/.test(h)).length
  if (questionCount >= 3 || numberedHeadings >= 3) return true
  // A single-prompt deep practice (one main question + going-further
  // extension) is also valid. Recognise it as: ≥1 question-shaped heading
  // + ≥2 instructional paragraphs.
  if (questionCount >= 1 && a.totalParagraphs >= 3) return true
  // Or an explicit "prompts" heading + a bulletList of prompt items.
  const heads = a.headingTexts.map((h) => h.toLowerCase())
  const hasPromptHead = heads.some((h) => /prompt|question/.test(h))
  if (hasPromptHead && (a.totalListItems >= 3 || a.totalParagraphs >= 3)) return true
  return false
}

function deliversRitualSteps(a: BodyAnalysis): boolean {
  // The five-part ritual shape: Prepare, Release, Allow, Integrate, Anchor.
  const heads = a.headingTexts.map((h) => h.toLowerCase())
  const ritualHeadings = ['prepare', 'release', 'allow', 'integrate', 'anchor']
  const hits = ritualHeadings.filter((rh) => heads.some((h) => h.startsWith(rh))).length
  if (hits >= 3) return true
  // Or numbered ritual steps (Step 1 / Step 2 / Step 3).
  const numberedSteps = a.headingTexts.filter((h) => /^step\s*\d/i.test(h)).length
  if (numberedSteps >= 3) return true
  // Or an orderedList of ≥3 imperative-shaped steps (cinnamon / bay-leaf
  // pattern: "open your front door", "place the leaf", etc.).
  if (a.imperativeOrderedItems >= 3) return true
  // Or a "what you'll need" + "the practice" / "the spell" sectioning with
  // any list of steps (≥3 items).
  const hasNeed = heads.some((h) => /(what.{0,5}you.{0,5}need|materials|you.{0,5}ll need|you will need)/.test(h))
  const hasPracticeHead = heads.some((h) => /practice|spell|rite|ritual|method/.test(h))
  if (hasNeed && hasPracticeHead && a.totalListItems >= 3) return true
  return false
}

function deliversMeditationScript(a: BodyAnalysis): boolean {
  // Body-scan markers or breath-count markers.
  const t = a.bodyText.toLowerCase()
  if (/body scan|soles of (the |your )?feet|crown of (the |your )?head/.test(t)) return true
  if (/inhale (?:through|for|slow|deeply|gently)|exhale (?:through|for|slow|out|deeply)/.test(t)) return true
  if (/4-7-8|box breathing|4 ?- ?7 ?- ?8|equal sides/.test(t)) return true
  // Plain-language breath counts ("in through the nose for a count of four,
  // out through the mouth for a count of six") — common in the breath-work
  // practices.
  if (/in through (?:the |your )?(?:nose|mouth)\b/.test(t) && /out through (?:the |your )?(?:nose|mouth)\b/.test(t)) return true
  if (/count of (?:four|five|six|seven|eight)/.test(t)) return true
  // Or a visualisation walkthrough (image-led meditation).
  if (/picture (?:a |the |yourself|this|that)|imagine (?:a |the |yourself|this|that)|visualise (?:a |the |yourself|this|that)/.test(t) && a.totalParagraphs >= 3) return true
  // Grounding observation-style meditations ("notice the bed under you",
  // "let your awareness drop").
  if (/notice (?:the |what's|what is|where|how) /.test(t) && a.totalParagraphs >= 3) return true
  if (/let (?:your |the )?awareness (?:drop|rest|move|settle)/.test(t)) return true
  // Or a guided sit / breath practice with explicit instructions.
  const hasEyesClosed = /\b(?:eyes closed|close your eyes|gaze soft)/.test(t)
  const hasAttention = /\b(?:bring your attention|attention to (?:the |your )?breath|attention to (?:the |your )?body|notice (?:the |your )?breath)/.test(t)
  if (hasEyesClosed && hasAttention && a.totalParagraphs >= 2) return true
  if (/close your eyes|slow breath|deep breath/.test(t) && a.totalParagraphs >= 3) return true
  // Set-a-timer noting / observation practices.
  if (/set a (?:two|three|four|five|six|seven|eight|nine|ten)[ -]minute timer/.test(t)) return true
  return false
}

function deliversActivity(a: BodyAnalysis): boolean {
  // Embodied activity: explicit step-by-step walkthrough OR a step list +
  // multiple paragraphs of guidance.
  if (a.imperativeOrderedItems >= 3) return true
  const t = a.bodyText.toLowerCase()
  const imperativeMarkers = [
    /\bset out\b/, /\bwalk to\b/, /\bwalk away\b/, /\bplace (the |a |your )/,
    /\bfind (?:a |the |somewhere |one )/, /\bpick (?:up|out|one|an? |the )/,
    /\bturn (?:off|away|to)\b/, /\bstand at\b/, /\bsit (?:somewhere|down|with|in)/,
    /\bwrite (?:the|down|a |tomorrow's|three|one|it )/,
    /\bsay (?:the |aloud|out loud|once|three times|it )/, /\bbuy (?:a |the |one )/,
    /\bcarry (?:a |the |this )/, /\bgo (?:to|out|for)\b/, /\bleave (?:the |a |it )/,
    /\bopen (?:the |your |a |one )/, /\btake (?:a |the |out |off |one )/,
    /\bcount (?:to |out )/, /\bpay (?:for|the )/, /\btell (?:the |a )/,
    /\boffer (?:to |a )/, /\bchoose (?:one |a |the )/, /\bmake (?:a |the |one |yourself )/,
    /\bdo (?:it|this|just|only|the practice|one )/, /\bread (?:it|a |one |the )/,
    /\blog (?:every|one|the )/, /\btrack (?:every|each|one|the )/,
    /\bset (?:up|aside|a )/, /\bdraft (?:the |an? )/, /\bnotice (?:what|how|where|the )/,
    /\bidentify (?:one |a |the )/, /\blist (?:one |a |the |three )/,
    /\bclose (?:the |your )/, /\bnarrate (?:what|the )/, /\blisten (?:without|to )/,
    /\brepeat (?:for|this|each|tomorrow)/, /\bcheck (?:the |your )/,
    /\bonce (?:a |it|you )/, /\beach (?:morning|evening|day|night|time)\b/,
  ]
  const hits = imperativeMarkers.filter((rx) => rx.test(t)).length
  if (hits >= 3) return true
  // Or a body with ≥3 list items + multiple paragraphs of activity guidance.
  if (a.totalListItems >= 3 && a.totalParagraphs >= 2 && hits >= 1) return true
  // Or a body with multiple practice-heading sub-sections + ≥2 imperative
  // hits (typical "choose / do / close" activity walkthrough).
  if (a.headingTexts.length >= 3 && hits >= 2) return true
  return false
}

function deliversAffirmationSet(a: BodyAnalysis): boolean {
  // An affirmation practice delivers an affirmation text + guidance on how
  // to use it. The text typically lives in a pullQuote OR a blockquote.
  // Single short affirmations in a blockquote + a "say it three times"
  // instruction count.
  if (a.pullQuoteCount >= 1 || a.blockquoteCount >= 1) {
    // Need at least *some* guidance on use (a paragraph of instruction).
    if (a.totalParagraphs >= 1) return true
  }
  // Or ≥3 "I am" / "I have" / "I allow" statements scattered in paragraphs.
  const iStatements =
    (a.bodyText.match(/\bi am\b/gi) || []).length +
    (a.bodyText.match(/\bi have\b/gi) || []).length +
    (a.bodyText.match(/\bi allow\b/gi) || []).length +
    (a.bodyText.match(/\bi welcome\b/gi) || []).length +
    (a.bodyText.match(/\bi receive\b/gi) || []).length
  if (iStatements >= 3) return true
  return false
}

function deliversSpellOrVisualisation(a: BodyAnalysis): boolean {
  // Spell + visualisation use ritual-ish or meditation-ish shapes; reuse the
  // checks already in this file.
  return deliversRitualSteps(a) || deliversMeditationScript(a) || deliversActivity(a)
}

function deliversAnyPractice(a: BodyAnalysis): boolean {
  if (deliversTapping(a)) return true
  if (deliversEnergyStatements(a)) return true
  if (deliversJournalPrompts(a)) return true
  if (deliversRitualSteps(a)) return true
  if (deliversMeditationScript(a)) return true
  if (deliversActivity(a)) return true
  if (deliversAffirmationSet(a)) return true
  if (deliversSpellOrVisualisation(a)) return true
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Technique-mention detectors. Used by Failure Mode B: intro mentions a
// technique that isn't delivered in body.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VIOLATES_B detectors. The signal we care about is "the intro PROMISES the
 * body will deliver technique X" — not "the intro mentions technique X in
 * passing as a related practice".
 *
 * Promise shape: "A tapping practice / script / round for ..." in subtitle,
 * or "[N]-minute tapping practice ..." in excerpt, or "A tapping round on
 * ..." in body intro. NOT "Use after a tapping session" (that's a
 * compatibility note, not a delivery promise).
 */
function promisesTapping(text: string): boolean {
  // Phrase like "A tapping practice / script / round / set / sequence for X".
  if (/\b(a|short|five[ -]minute|brief|quick) (?:short )?tapping (?:practice|script|round|set|sequence)\b/i.test(text)) return true
  if (/\btapping (?:practice|script|round|set|sequence) for\b/i.test(text)) return true
  if (/\btapping (?:practice|script|round|set|sequence)[.,;]/i.test(text)) return true
  if (/\beft (?:practice|script|round|set|sequence|tapping)\b/i.test(text)) return true
  if (/\btap (?:through|along to|on|the points)\b/i.test(text)) return true
  return false
}
function promisesJournal(text: string): boolean {
  if (/\b(a|short|six[ -]prompt|five[ -]prompt|four[ -]prompt|three[ -]prompt) (?:short )?journal (?:prompt|practice|set|reflection)\b/i.test(text)) return true
  if (/\bjournal prompt (?:set|practice|for|on)\b/i.test(text)) return true
  if (/\bjournal prompts\b.{0,40}\b(?:for|on|about)\b/i.test(text)) return true
  if (/\bfree[- ]?write (?:practice|prompt|on|for|about|session)\b/i.test(text)) return true
  if (/\b(a|short|brief) (?:fifteen|ten|twenty|thirty|forty|five)[ -](?:minute|min) journal\b/i.test(text)) return true
  return false
}
function promisesEnergyStatements(text: string): boolean {
  if (/\b(a|pair of|set of) (?:short )?energy statement(?:s)?\b/i.test(text)) return true
  if (/\benergy statement (?:for|on|practice|pair)\b/i.test(text)) return true
  if (/\brelease[ -]and[ -]allow (?:pair|practice|method|statement|sequence)\b/i.test(text)) return true
  if (/\brelease[ /]allow (?:pair|practice|method|statement|sequence)\b/i.test(text)) return true
  return false
}
function promisesRitual(text: string): boolean {
  if (/\b(a|short|five[ -]part|quick|brief|simple) (?:short )?ritual\b/i.test(text)) return true
  if (/\b(a|short|five[ -]part|quick|brief|simple) (?:short )?ceremony\b/i.test(text)) return true
  if (/\b(a|short|quick|brief|simple) (?:short )?rite\b/i.test(text)) return true
  if (/\bevening ritual\b|\bmorning ritual\b|\bweekly ritual\b|\bdaily ritual\b/i.test(text)) return true
  if (/\bcandle ritual\b|\bfolk[- ]?magic ritual\b/i.test(text)) return true
  if (/\bspell (?:for|on)\b|\b(?:folk[- ]?magic )?spell\b/i.test(text)) return true
  return false
}
function promisesMeditation(text: string): boolean {
  if (/\b(a|short|guided|five[ -]minute|ten[ -]minute|brief) (?:short )?meditation\b/i.test(text)) return true
  if (/\bmeditation (?:for|on|script|practice|sit)\b/i.test(text)) return true
  if (/\bbody scan (?:for|on|practice|script|meditation)\b/i.test(text)) return true
  if (/\b(?:4-7-8|box) breath(?:ing)?\b/i.test(text)) return true
  return false
}
function promisesAffirmation(text: string): boolean {
  if (/\b(a|short|present[- ]tense|brief|simple) (?:short )?affirmation\b/i.test(text)) return true
  if (/\baffirmation (?:for|on|practice|set)\b/i.test(text)) return true
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Failure-mode detectors.
// ─────────────────────────────────────────────────────────────────────────────

interface VerdictReason {
  failedA: boolean
  failedB: boolean
  failedC: boolean
  details: string[]
}

function detectViolations(
  title: string,
  subtitle: string | null,
  excerpt: string | null,
  practiceType: string | null,
  analysis: BodyAnalysis,
): VerdictReason {
  const details: string[] = []

  // Failure Mode A — no actionable practice in body at all.
  const delivers = deliversAnyPractice(analysis)
  const failedA = !delivers

  // Failure Mode B — intro promises a technique the body doesn't deliver.
  // Only flag when the subtitle / excerpt / first body paragraph contains
  // promise-shape language ("a tapping practice for X", "a ritual to Y").
  //
  // If the body delivers ANY practice (even one different from the
  // promise), don't flag VIOLATES_B — incidental mentions of related
  // techniques are reasonable framing, not broken promises. The only
  // genuine VIOLATES_B is "intro says X, body delivers nothing".
  const introHaystack = [subtitle ?? '', excerpt ?? '', analysis.introText].join('\n')
  let failedB = false
  if (failedA) {
    if (promisesTapping(introHaystack) && !deliversTapping(analysis)) {
      failedB = true
      details.push('intro promises a tapping practice, body has no tapping rounds')
    }
    if (promisesJournal(introHaystack) && !deliversJournalPrompts(analysis)) {
      failedB = true
      details.push('intro promises a journal practice, body has no journal prompts')
    }
    if (promisesEnergyStatements(introHaystack) && !deliversEnergyStatements(analysis)) {
      failedB = true
      details.push('intro promises energy statements, body has no release/allow pair')
    }
    if (promisesRitual(introHaystack) && !deliversRitualSteps(analysis)) {
      failedB = true
      details.push('intro promises a ritual, body has no ritual steps')
    }
    if (promisesMeditation(introHaystack) && !deliversMeditationScript(analysis)) {
      failedB = true
      details.push('intro promises a meditation, body has no meditation script')
    }
    if (promisesAffirmation(introHaystack) && !deliversAffirmationSet(analysis)) {
      failedB = true
      details.push('intro promises an affirmation, body has no affirmation set')
    }
  }

  // Failure Mode C — action stub with no follow-through. Genuine stub
  // pattern: body has a single instruction-shape paragraph or two (e.g.
  // "write the number down") AND no further practice content. The
  // reference negative case in feedback_mindset_voice.md is "write the
  // number you want to ask for" → and then nothing.
  //
  // Affirmations and short energy statements are exempt from the
  // body-thinness test — a 30-second affirmation IS a complete practice
  // when delivered as quote + use-instruction. Same for one-shot
  // visualisations that walk a single image.
  let failedC = false
  const isShortPracticeType = practiceType === 'AFFIRMATION' || practiceType === 'ENERGY_STATEMENT'
  const totalBodyNodes = analysis.totalParagraphs + analysis.totalListItems +
    analysis.pullQuoteCount + analysis.blockquoteCount
  // Only run the stub check when no specific practice delivery was matched
  // by the strict short-practice signature; if the body delivers a quote
  // + use-instruction OR a release/allow pair, that already counts.
  const hasShortPracticeContent =
    (analysis.pullQuoteCount + analysis.blockquoteCount) >= 1 && analysis.totalParagraphs >= 1
  if (!failedA && !isShortPracticeType && !hasShortPracticeContent &&
      totalBodyNodes <= 4 && analysis.headingTexts.length <= 2) {
    const tail = analysis.bodyText.slice(Math.floor(analysis.bodyText.length * 0.5))
    const hasForwardAction = /\b(send (?:the |this |your |it )|do (?:this|the practice)|come back to|return to|sit with|repeat (?:tomorrow|next|in the|three|once|daily|weekly)|use (?:this|again|each|daily)|tomorrow morning|this (?:week|month|weekend)|do (?:this )?(?:once|daily|weekly|each)|again next|next time|each (?:morning|evening|day|night)|say (?:it|this) (?:three|aloud|once|each|out loud|in the)|three times (?:a |in |daily|each|each morning|each night)|every (?:morning|evening|day|night|time)|when (?:the |this |you |it )|use (?:it|this) when)\b/i.test(tail)
    if (!hasForwardAction) {
      failedC = true
      details.push('thin body with no follow-through and no forward-action close')
    }
  }

  if (failedA) details.push('no actionable practice in body')
  return { failedA, failedB, failedC, details }
}

type Verdict =
  | 'PASS'
  | 'PASS_READING'
  | 'VIOLATES_A'
  | 'VIOLATES_B'
  | 'VIOLATES_C'
  | 'VIOLATES_MULTIPLE'
  | 'VIOLATES_READING_SITUATIONAL'

interface Row {
  slug: string
  title: string
  subCategorySlug: string | null
  practiceType: string | null
  type: string
  status: string
  verdict: Verdict
  reason: string
}

/**
 * A READING entry is methodological by design: it explains *how* tapping /
 * rituals / breath work, so the practice scripts can stay tight. Rebecca's
 * three flagged examples ("When the Money Flow Reverses", "When Two Money
 * Histories Share a Bank Account") were authored as READING but actually
 * describe *situations* — they should be PRACTICEs that deliver a practice
 * for the named situation.
 *
 * Heuristic: situational-shape titles start with "When ...", "The [emotion]
 * of ...", "The [pattern] in ...", or describe a relational scenario
 * ("Supporting ...", "Caring for ..."). Methodological titles start with
 * "How ...", "Why ...", "What ...", "The [method-name] method", or name a
 * named method ("Body-based meditation", "Activities as practice").
 */
function isMethodologicalReadingTitle(title: string): boolean {
  const t = title.trim().toLowerCase()
  if (/^how\b/.test(t)) return true
  if (/^why\b/.test(t)) return true
  if (/^what\b/.test(t)) return true
  if (/^where\b/.test(t)) return true // "Where to start with money work" — methodological scaffolding
  if (/\bmethod\b/.test(t)) return true
  if (/\bas practice\b/.test(t)) return true
  if (/\bmeditation\b/.test(t) && !/^when\b/.test(t)) return true
  if (/\bscience of\b/.test(t)) return true
  if (/^the (\d+|eight|five|four|three)[ -](?:point|step|part|day-arc|stage|round)/.test(t)) return true
  if (/^the [a-z'\- ]+ method\b/.test(t)) return true
  // Money-Zone-style named-method readings.
  if (/^the (?:zone|sway|allowing|releasing)\b/.test(t)) return true
  if (/^money and the\b/.test(t)) return true // "Money and the Nervous System" — explanation
  if (/^money work\b/.test(t)) return true
  if (/^the 84-day arc\b/.test(t)) return true
  if (/^the reading list\b/.test(t)) return true
  if (/^the (cultural|investing|i don't|if i had|lottery|complicated|grief|investing-isn|'i don't)\b/i.test(t)) return true
  return false
}

function classify(
  reason: VerdictReason,
  type: string,
  practiceType: string | null,
  title: string,
): Verdict {
  if (type === 'READING' || practiceType === 'READING') {
    // Methodological readings get a free pass — they're allowed not to
    // deliver a practice. Situational readings (title starts with "When..."
    // and similar) are misclassified and need rewriting into a PRACTICE
    // tutorial with a delivered practice.
    if (isMethodologicalReadingTitle(title)) return 'PASS_READING'
    if (reason.failedA) return 'VIOLATES_READING_SITUATIONAL'
    return 'PASS_READING'
  }
  const failures = [reason.failedA, reason.failedB, reason.failedC].filter(Boolean).length
  if (failures === 0) return 'PASS'
  if (failures >= 2) return 'VIOLATES_MULTIPLE'
  if (reason.failedA) return 'VIOLATES_A'
  if (reason.failedB) return 'VIOLATES_B'
  return 'VIOLATES_C'
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2))
  const { prisma, TutorialStatus } = await import('../src/index.js')

  const statusFilter = flags.includeDrafts
    ? { in: [TutorialStatus.PUBLISHED, TutorialStatus.DRAFT] }
    : TutorialStatus.PUBLISHED

  const where: Record<string, unknown> = {
    category: { slug: 'mindset' },
    status: statusFilter,
  }
  if (flags.filterSlug) where.slug = flags.filterSlug

  const tutorials = await prisma.tutorial.findMany({
    where,
    select: {
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      body: true,
      type: true,
      status: true,
      practiceType: true,
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })

  console.log(`Auditing ${tutorials.length} mindset tutorials (includeDrafts=${flags.includeDrafts})`)

  const rows: Row[] = []
  for (const t of tutorials) {
    const analysis = analyseBody(t.body)
    const reason = detectViolations(t.title, t.subtitle, t.excerpt, t.practiceType, analysis)
    const verdict = classify(reason, t.type, t.practiceType, t.title)
    rows.push({
      slug: t.slug,
      title: t.title,
      subCategorySlug: t.subCategory?.slug ?? null,
      practiceType: t.practiceType,
      type: t.type,
      status: t.status,
      verdict,
      reason: reason.details.length > 0 ? reason.details.join('; ') : (verdict === 'PASS' || verdict === 'PASS_READING' ? '—' : 'unspecified'),
    })
  }

  const counts: Record<Verdict, number> = {
    PASS: 0,
    PASS_READING: 0,
    VIOLATES_A: 0,
    VIOLATES_B: 0,
    VIOLATES_C: 0,
    VIOLATES_MULTIPLE: 0,
    VIOLATES_READING_SITUATIONAL: 0,
  }
  for (const r of rows) counts[r.verdict]++

  const totalViolators = counts.VIOLATES_A + counts.VIOLATES_B + counts.VIOLATES_C +
    counts.VIOLATES_MULTIPLE + counts.VIOLATES_READING_SITUATIONAL
  const violatorRatio = tutorials.length === 0 ? 0 : totalViolators / tutorials.length

  console.log('\nVERDICT COUNTS')
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(20)} ${String(v).padStart(5)}`)
  console.log(`  ${'TOTAL'.padEnd(20)} ${String(tutorials.length).padStart(5)}`)
  console.log(`  ${'VIOLATORS'.padEnd(20)} ${String(totalViolators).padStart(5)}  (${(violatorRatio * 100).toFixed(1)}%)`)

  // Write markdown report.
  const today = new Date().toISOString().slice(0, 10)
  const outFile = flags.outFile ?? `mindset-completeness-audit-${today}.md`
  const outPath = resolve(flags.outDir, outFile)
  mkdirSync(dirname(outPath), { recursive: true })

  const md: string[] = []
  md.push(`# Mindset completeness audit — ${today}`)
  md.push('')
  md.push(`Audit scope: mindset tutorials with status ${flags.includeDrafts ? 'PUBLISHED + DRAFT' : 'PUBLISHED'}.`)
  md.push('')
  md.push('Rule: every mindset tutorial DELIVERS a practice (tapping rounds,')
  md.push('energy statements, journal prompts, ritual steps, meditation script,')
  md.push('or embodied activity). Reading entries are exempt — they\'re reference')
  md.push('articles by design.')
  md.push('')
  md.push('## Verdict counts')
  md.push('')
  md.push('| Verdict | Count |')
  md.push('| --- | ---: |')
  md.push(`| PASS | ${counts.PASS} |`)
  md.push(`| PASS_READING | ${counts.PASS_READING} |`)
  md.push(`| VIOLATES_A (no practice) | ${counts.VIOLATES_A} |`)
  md.push(`| VIOLATES_B (technique mentioned, not delivered) | ${counts.VIOLATES_B} |`)
  md.push(`| VIOLATES_C (action stub, no follow-through) | ${counts.VIOLATES_C} |`)
  md.push(`| VIOLATES_MULTIPLE | ${counts.VIOLATES_MULTIPLE} |`)
  md.push(`| VIOLATES_READING_SITUATIONAL (mis-classified as READING) | ${counts.VIOLATES_READING_SITUATIONAL} |`)
  md.push(`| **TOTAL** | **${tutorials.length}** |`)
  md.push(`| **VIOLATORS** | **${totalViolators}** (${(violatorRatio * 100).toFixed(1)}%) |`)
  md.push('')
  md.push('## Per-tutorial verdicts')
  md.push('')
  md.push('| Slug | Title | Sub-category | Type | Verdict | Reason |')
  md.push('| --- | --- | --- | --- | --- | --- |')
  for (const r of rows) {
    const safeTitle = r.title.replace(/\|/g, '\\|')
    const safeReason = r.reason.replace(/\|/g, '\\|')
    md.push(`| ${r.slug} | ${safeTitle} | ${r.subCategorySlug ?? '—'} | ${r.practiceType ?? r.type} | ${r.verdict} | ${safeReason} |`)
  }
  md.push('')
  writeFileSync(outPath, md.join('\n'), 'utf8')
  console.log(`\nReport written: ${outPath} (${md.length} lines)`)

  // Emit machine-readable JSON next to the markdown for downstream scripts.
  const jsonPath = outPath.replace(/\.md$/, '.json')
  writeFileSync(jsonPath, JSON.stringify({ runDate: today, counts, totalViolators, violatorRatio, rows }, null, 2), 'utf8')
  console.log(`JSON written: ${jsonPath}`)

  if (violatorRatio > 0.5) {
    console.log('\n⚠️  >50% of audited tutorials VIOLATE. STOP — return to Rebecca.')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
