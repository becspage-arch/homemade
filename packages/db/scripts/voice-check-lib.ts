/**
 * Deterministic voice-rule scanner.
 *
 * Walks a TipTap document, pulls every prose-bearing string, and runs the
 * Section 6b rules against it. Returns a structured report so the CLI can
 * print it, the upload script can gate on it, and the periodic `:all` script
 * can aggregate across the DB.
 *
 * Source of rules: `feedback_homemade_voice.md` and Section 6b of the brand
 * direction doc. Keep this list in sync with `packages/ai/src/prompts/voice-rules.ts`.
 */

import { BANNED_BRANDS, WARN_BRANDS } from './data/banned-brands.js'

export type Severity = 'error' | 'warn'

export type FindingKind =
  | 'banned-phrase'
  | 'banned-opener'
  | 'em-dash-paragraph'
  | 'em-dash-sentence'
  | 'negation-pattern'
  | 'medical-claim'
  | 'price-mention'
  | 'wrap-up'
  | 'americanism'
  | 'tricolon'
  | 'brand-trademark'
  | 'glossary-coverage'
  | 'temperature-canonical'
  | 'servings-yield'
  | 'safety-block'
  | 'raw-hours'
  | 'unflagged-jargon'
  | 'empty-glossary-def'
  // Added 2026-05-25 (voice-spec-2026-05-21 retrofit).
  | 'year-in-body'
  | 'institutional-in-body'
  | 'historical-figure-in-body'
  | 'prose-style-steps'
  | 'clinical-vocab'
  | 'grade-level'
  | 'missing-node-type'

export interface Finding {
  severity: Severity
  kind: FindingKind
  message: string
  /** A human-readable locator like "body > paragraph[4] > text". */
  path: string
  /** The offending snippet, if a single phrase. */
  snippet?: string
}

export interface VoiceCheckReport {
  errors: Finding[]
  warnings: Finding[]
}

/**
 * Safety-adjacent keywords used to detect multi-line safety-advice blocks.
 * If a paragraph-level chunk contains 3+ of these the checker warns.
 */
const SAFETY_KEYWORDS = [
  'eye protection',
  'goggles',
  'gloves',
  'ppe',
  'first aid',
  'first-aid',
  'ventilat',
  'fire watch',
  'fire-watch',
  'a&e',
  'accident and emergency',
  'seek medical',
  'consult a',
  'consult your',
  'dust mask',
  'respirator',
  'fire extinguisher',
  'safety glasses',
  'face shield',
  'protective clothing',
  'hazard',
  'risk assessment',
  'before you start',
]

/**
 * Jargon words that are either false-specific (a brand/material when generic
 * would do) or domain jargon that must be explained via a glossaryTooltip.
 * These fire on plain body text even when the slug is not in glossaryTerms[].
 */
const JARGON_WATCHLIST: { word: string; note: string }[] = [
  { word: 'nitrile', note: 'use "protective gloves" unless the specific material is critical to the outcome' },
  { word: 'dacron', note: 'use "upholstery wadding" unless the specific brand/material is critical' },
  { word: 'pullet', note: 'domain jargon — register in glossaryTerms[] with a definition, or write "young hen" in plain English' },
  { word: 'supersedure', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'propolis', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'varroa', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'weaner', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'fenbendazole', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'colostrum', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'drenching', note: 'domain jargon — register in glossaryTerms[] with a definition' },
  { word: 'standstill', note: 'domain jargon in animal husbandry context — register in glossaryTerms[]' },
  { word: 'tare', note: 'domain jargon — register in glossaryTerms[] or write "the empty container weight" in plain English' },
]

/**
 * Voice-spec 2026-05-21 rules — apply ONLY to body prose, never to
 * `sourceNotes` (chunks whose path starts with `body >` rather than
 * `sourceNotes`). These rules formalise the grade-6-8 register.
 */

/** Years in parentheses ((1652), (1898), (1931), (2008), …). */
const YEAR_IN_BODY_PATTERN = /\((1[6-9]\d{2}|20\d{2})\)/

/**
 * Institutional / regulatory names that may appear in sourceNotes but not
 * in body prose. Case-insensitive whole-phrase match. The "Project
 * Gutenberg" entry is included because the citation belongs in the
 * Sources block, not the body.
 */
const INSTITUTIONAL_NAMES = [
  'German Commission E',
  'Commission E',
  'British Herbal Pharmacopoeia',
  'BHP',
  'FDA',
  'MHRA',
  'NHS',
  'RHS',
  'USDA',
  'NCCIH',
  'ESCOP',
  'EMA HMPC',
  'EMA',
  'AHDB',
  'DEFRA',
  'AECB',
  'Passivhaus Trust',
  'Energy Saving Trust',
  'National Trust',
  'English Heritage',
  'Project Gutenberg',
  'Botanical.com',
]

/**
 * Historical author surnames. When they appear in body prose without a
 * plain-English gloss in the same sentence, fire. Gloss tokens include
 * "century", "herbalist", "Victorian", "manual", "cookery", etc. The
 * heuristic is intentionally loose — false positives are fine because
 * the rule flags lines for human / Sonnet rewrite.
 */
const HISTORICAL_FIGURES = [
  'Culpeper',
  'Gerard',
  'Grieve',
  'Quincy',
  'Beeton',
  'Mrs Beeton',
  'de Dillmont',
  'Caulfeild',
  'Saward',
  'Glasse',
  'Acton',
  'Jekyll',
  'Sackville-West',
  'Pellaprat',
  'Carême',
  'Careme',
  'Gladstar',
  'Tisserand',
  'Felter',
]

/** Gloss tokens that, if present in the same sentence as a historical
 *  figure, suppress the finding. Case-insensitive. */
const HISTORICAL_GLOSS_TOKENS = [
  'century',
  '17th-century',
  '18th-century',
  '19th-century',
  '20th-century',
  'herbalist',
  'manual',
  'cookery',
  'cookbook',
  'victorian',
  'edwardian',
  'wrote',
  'documented',
  'recorded',
  'sister',
  'author of',
]

/**
 * Prose-style sequential step openers. A body-context paragraph that
 * STARTS with one of these AND has a sibling paragraph that also starts
 * with one is a numbered list written badly — fire.
 */
const STEP_OPENERS = ['First,', 'Then,', 'Next,', 'Finally,', 'After that,', 'Lastly,']

/** Clinical / Latin vocabulary that must appear via glossaryTooltip or be
 *  replaced with plain English. Body-only. */
const CLINICAL_VOCAB: { word: string; plain: string }[] = [
  { word: 'catarrh', plain: 'chest congestion / mucus build-up' },
  { word: 'expectorant', plain: 'loosens phlegm' },
  { word: 'antispasmodic', plain: 'eases muscle spasm' },
  { word: 'emmenagogue', plain: 'do not use in body; sources block only' },
  { word: 'anti-inflammatory', plain: 'calms swelling' },
  { word: 'decoction', plain: '"simmered in water" or use a tooltip' },
  { word: 'maceration', plain: '"soaked in liquid" or use a tooltip' },
  { word: 'saponification', plain: 'soap-making chemistry; technical notes only' },
  { word: 'vulnerary', plain: '"wound-healing" or use a tooltip' },
  { word: 'anhydrous', plain: '"water-free" or use a tooltip' },
  { word: 'determinate', plain: '"bush variety"' },
  { word: 'indeterminate', plain: '"cordon variety"' },
]

/** Banned phrases — block. Case-insensitive, whole-word. */
const BANNED_PHRASES: { phrase: string; whole?: boolean }[] = [
  { phrase: 'honest' },
  { phrase: 'honestly' },
  { phrase: 'to be honest', whole: false },
  { phrase: "i'll be honest", whole: false },
  { phrase: 'frankly' },
  { phrase: 'truthfully' },
  { phrase: 'genuinely' },
  { phrase: 'delve into', whole: false },
  { phrase: 'delving into', whole: false },
  { phrase: 'at its core', whole: false },
  { phrase: 'in the realm of', whole: false },
  { phrase: 'in the world of', whole: false },
  { phrase: "in today's fast-paced world", whole: false },
  { phrase: 'in our modern world', whole: false },
  { phrase: 'tapestry of', whole: false },
  { phrase: 'a tapestry', whole: false },
  { phrase: 'a testament to', whole: false },
  { phrase: 'a beacon of', whole: false },
  { phrase: 'in the ever-evolving landscape', whole: false },
  { phrase: 'navigate the complexities', whole: false },
  { phrase: 'navigating the world of', whole: false },
  { phrase: "it's worth noting that", whole: false },
  { phrase: "it's important to note", whole: false },
  { phrase: "it's important to remember", whole: false },
  { phrase: 'at the end of the day', whole: false },
  { phrase: 'embark on a journey', whole: false },
  { phrase: 'unlock the secrets of', whole: false },
  { phrase: 'unlock your potential', whole: false },
  { phrase: 'in the heart of', whole: false },
  { phrase: 'game-changer' },
  { phrase: 'game-changing' },
  { phrase: 'treasure trove', whole: false },
  { phrase: 'crucial role', whole: false },
  { phrase: 'plays a crucial role', whole: false },
  { phrase: 'stands as a', whole: false },
  { phrase: 'stands testament to', whole: false },
  { phrase: 'speaks volumes', whole: false },
  { phrase: 'resonates with', whole: false },
  { phrase: 'vibes' },
  { phrase: 'vibe' },
  { phrase: 'essentially' },
  { phrase: 'fundamentally' },
  { phrase: 'ultimately' },
]

/** Banned sentence-initial openers — block. Case-insensitive, must be at the start of a sentence. */
const BANNED_OPENERS = [
  'in conclusion',
  'furthermore',
  'moreover',
  'additionally',
  'with that said',
  'having explored',
  "as we've seen",
  'it goes without saying',
  'picture this',
  "let's dive in",
  "let's explore",
  "let's take a look",
]

/** Wrap-up sign-offs — block. Detected only at the tail of a tutorial body. */
const WRAP_UP_PHRASES = [
  'happy baking',
  'happy cooking',
  'happy growing',
  'enjoy your journey',
  "and that's it",
  'enjoy!',
]

/** Medical-claim watchwords — block. */
const MEDICAL_CLAIM_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bcures\b/i, label: '"cures"' },
  { pattern: /\btreats\b/i, label: '"treats"' },
  { pattern: /\bis a remedy for\b/i, label: '"is a remedy for"' },
  { pattern: /\bprevents (cancer|diabetes|heart disease|alzheimer|dementia|covid)/i, label: 'prevents <named disease>' },
  { pattern: /\bboosts immunity\b/i, label: '"boosts immunity"' },
  { pattern: /\bdetoxifies\b/i, label: '"detoxifies"' },
  { pattern: /\bconsult your (gp|doctor|physician)\b/i, label: 'medical referral with prescriptive verb' },
]

/** Americanisms — warn (preferred British equivalent in parens). */
const AMERICANISMS: { word: string; british: string }[] = [
  { word: 'zucchini', british: 'courgette' },
  { word: 'zucchinis', british: 'courgettes' },
  { word: 'eggplant', british: 'aubergine' },
  { word: 'eggplants', british: 'aubergines' },
  { word: 'cilantro', british: 'coriander' },
  { word: 'shrimp', british: 'prawn' },
  { word: 'shrimps', british: 'prawns' },
  { word: 'broiler', british: 'grill' },
  { word: 'broil', british: 'grill' },
  { word: 'broiling', british: 'grilling' },
  { word: 'stove', british: 'hob' },
  { word: 'molasses', british: 'treacle' },
  { word: 'color', british: 'colour' },
  { word: 'colors', british: 'colours' },
  { word: 'flavor', british: 'flavour' },
  { word: 'flavors', british: 'flavours' },
  { word: 'flavored', british: 'flavoured' },
  { word: 'favorite', british: 'favourite' },
  { word: 'favorites', british: 'favourites' },
  { word: 'fall', british: 'autumn' },
  { word: 'gotten', british: 'got' },
]

/** Negation patterns — block. Detected per paragraph. */
const NEGATION_PATTERNS: RegExp[] = [
  /\bnot just\b[^.!?]*\bbut\b/i,
  /\bit['’]s not about\b[^.!?]*\bit['’]s about\b/i,
  /\bthis isn['’]t (a|just)[^.!?]*\bit['’]s\b/i,
]

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

/** Each prose chunk we extract from the document. */
interface Chunk {
  text: string
  path: string
  /** Whether this chunk is one "paragraph" worth — used for em-dash counting. */
  paragraph: boolean
  /** Whether this chunk is the final body-level block (for wrap-up detection). */
  trailing?: boolean
}

/**
 * Walk a TipTap document and pull out every prose-bearing string, paired
 * with a human-readable path.
 */
export function extractProseChunks(doc: unknown): Chunk[] {
  const chunks: Chunk[] = []
  if (!doc || typeof doc !== 'object') return chunks
  const root = doc as TipTapNode
  if (!Array.isArray(root.content)) return chunks

  const lastIndex = root.content.length - 1

  root.content.forEach((node, idx) => {
    const trailing = idx === lastIndex
    walkBlock(node, `body > ${nodeLabel(node, idx)}`, chunks, trailing)
  })

  return chunks
}

function walkBlock(node: TipTapNode, path: string, chunks: Chunk[], trailing: boolean): void {
  const type = node.type ?? ''
  switch (type) {
    case 'paragraph':
    case 'heading':
    case 'blockquote': {
      const text = flattenInline(node)
      if (text) chunks.push({ text, path: `${path} > text`, paragraph: true, trailing })
      return
    }
    case 'bulletList':
    case 'orderedList': {
      const items = node.content ?? []
      items.forEach((li, idx) => {
        const liPath = `${path} > listItem[${idx}]`
        if (Array.isArray(li.content)) {
          li.content.forEach((child, j) => {
            walkBlock(child, `${liPath} > ${nodeLabel(child, j)}`, chunks, false)
          })
        }
      })
      return
    }
    case 'infoPanel': {
      const a = node.attrs ?? {}
      const title = typeof a.title === 'string' ? a.title : ''
      const body = typeof a.body === 'string' ? a.body : ''
      if (title) chunks.push({ text: title, path: `${path} > title`, paragraph: false })
      if (body) chunks.push({ text: body, path: `${path} > body`, paragraph: true, trailing })
      return
    }
    case 'suppliesCard': {
      const a = node.attrs ?? {}
      const heading = typeof a.heading === 'string' ? a.heading : ''
      if (heading) chunks.push({ text: heading, path: `${path} > heading`, paragraph: false })
      const items = Array.isArray(a.items) ? a.items : []
      items.forEach((raw, idx) => {
        if (!raw || typeof raw !== 'object') return
        const it = raw as Record<string, unknown>
        const name = typeof it.name === 'string' ? it.name : ''
        const subs = typeof it.substitutions === 'string' ? it.substitutions : ''
        if (name) chunks.push({ text: name, path: `${path} > item[${idx}] > name`, paragraph: false })
        if (subs)
          chunks.push({
            text: subs,
            path: `${path} > item[${idx}] > substitutions`,
            paragraph: false,
          })
      })
      return
    }
    case 'pullQuote': {
      const a = node.attrs ?? {}
      const quote = typeof a.quote === 'string' ? a.quote : ''
      const attribution = typeof a.attribution === 'string' ? a.attribution : ''
      if (quote) chunks.push({ text: quote, path: `${path} > quote`, paragraph: true })
      if (attribution)
        chunks.push({ text: attribution, path: `${path} > attribution`, paragraph: false })
      return
    }
    case 'productCard': {
      const a = node.attrs ?? {}
      const title = typeof a.title === 'string' ? a.title : ''
      const description = typeof a.description === 'string' ? a.description : ''
      if (title) chunks.push({ text: title, path: `${path} > title`, paragraph: false })
      if (description)
        chunks.push({ text: description, path: `${path} > description`, paragraph: true })
      return
    }
    case 'varietiesPanel': {
      const a = node.attrs ?? {}
      const heading = typeof a.heading === 'string' ? a.heading : ''
      const intro = typeof a.intro === 'string' ? a.intro : ''
      if (heading) chunks.push({ text: heading, path: `${path} > heading`, paragraph: false })
      if (intro) chunks.push({ text: intro, path: `${path} > intro`, paragraph: true })
      const items = Array.isArray(a.items) ? a.items : []
      items.forEach((raw, idx) => {
        if (!raw || typeof raw !== 'object') return
        const it = raw as Record<string, unknown>
        const description = typeof it.description === 'string' ? it.description : ''
        if (description)
          chunks.push({
            text: description,
            path: `${path} > item[${idx}] > description`,
            paragraph: true,
          })
      })
      return
    }
    case 'troubleshooter': {
      const a = node.attrs ?? {}
      const heading = typeof a.heading === 'string' ? a.heading : ''
      const intro = typeof a.intro === 'string' ? a.intro : ''
      if (heading) chunks.push({ text: heading, path: `${path} > heading`, paragraph: false })
      if (intro) chunks.push({ text: intro, path: `${path} > intro`, paragraph: true })
      const items = Array.isArray(a.items) ? a.items : []
      items.forEach((raw, idx) => {
        if (!raw || typeof raw !== 'object') return
        const it = raw as Record<string, unknown>
        const symptom = typeof it.symptom === 'string' ? it.symptom : ''
        const cause = typeof it.cause === 'string' ? it.cause : ''
        const fix = typeof it.fix === 'string' ? it.fix : ''
        if (symptom)
          chunks.push({ text: symptom, path: `${path} > item[${idx}] > symptom`, paragraph: false })
        if (cause)
          chunks.push({ text: cause, path: `${path} > item[${idx}] > cause`, paragraph: true })
        if (fix)
          chunks.push({ text: fix, path: `${path} > item[${idx}] > fix`, paragraph: true })
      })
      return
    }
    case 'ingredientsList': {
      // Recipe schema (Session B). We still walk prepNote fields where present.
      const a = node.attrs ?? {}
      const items = Array.isArray(a.items) ? a.items : []
      items.forEach((raw, idx) => {
        if (!raw || typeof raw !== 'object') return
        const it = raw as Record<string, unknown>
        const prepNote = typeof it.prepNote === 'string' ? it.prepNote : ''
        if (prepNote)
          chunks.push({
            text: prepNote,
            path: `${path} > item[${idx}] > prepNote`,
            paragraph: false,
          })
      })
      return
    }
    case 'subTutorialCard':
    case 'horizontalRule':
    case 'image':
    case 'codeBlock':
    case 'hardBreak':
      return
    default: {
      // Unknown block — if it has prose-bearing children, recurse cautiously.
      if (Array.isArray(node.content)) {
        node.content.forEach((child, j) => {
          walkBlock(child, `${path} > ${nodeLabel(child, j)}`, chunks, false)
        })
      }
      return
    }
  }
}

function flattenInline(node: TipTapNode): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.content)) return ''
  return node.content.map(flattenInline).join('')
}

function nodeLabel(node: TipTapNode, idx: number): string {
  const t = node.type ?? 'unknown'
  return `${t}[${idx}]`
}

/**
 * Pull subtitle / excerpt / sourceNotes etc. from the top-level upload input
 * so the CLI can scan them too. The argument is loose — callers may pass the
 * raw upload JSON or just the body.
 */
export function extractMetadataChunks(input: Record<string, unknown>): Chunk[] {
  const out: Chunk[] = []
  const push = (path: string, value: unknown, paragraph = false): void => {
    if (typeof value === 'string' && value.trim()) {
      out.push({ text: value, path, paragraph })
    }
  }
  push('title', input.title)
  push('subtitle', input.subtitle)
  push('excerpt', input.excerpt, true)
  push('sourceNotes', input.sourceNotes, true)
  return out
}

// ─── Safety infoPanel structural rule ───────────────────────────────────────

/**
 * Keywords that identify a heading or infoPanel title as a safety-advice block.
 * Checked case-insensitively via substring match.
 */
const SAFETY_HEADING_KEYWORDS = [
  'before you start',
  'safety warnings',
  'safety notes',
  'important safety',
  'eye protection',
  'personal protective equipment',
  ' ppe',
  'first aid',
]

/**
 * Structural check: infoPanel nodes with tone "warning" that contain more than
 * 25 words, or whose title contains a safety keyword, are errors. A warning-
 * tone infoPanel with substantial content is a safety-advice block — the rule
 * allows at most one compressed sentence. Also flags any heading whose text
 * contains a safety keyword.
 */
function checkSafetyInfoPanels(body: unknown, report: VoiceCheckReport): void {
  if (!body || typeof body !== 'object') return
  const doc = body as TipTapNode
  if (!Array.isArray(doc.content)) return

  function walk(nodes: TipTapNode[], parentPath: string): void {
    nodes.forEach((node, idx) => {
      const nodePath = `${parentPath} > ${nodeLabel(node, idx)}`

      if (node.type === 'infoPanel') {
        const a = node.attrs ?? {}
        const tone = typeof a.tone === 'string' ? a.tone : ''
        const title = typeof a.title === 'string' ? a.title : ''
        const body = typeof a.body === 'string' ? a.body : ''
        const titleLower = title.toLowerCase()
        const hasSafetyTitle = SAFETY_HEADING_KEYWORDS.some((kw) => titleLower.includes(kw))
        const wordCount = body.trim().split(/\s+/).filter(Boolean).length

        if (tone === 'warning' && (hasSafetyTitle || wordCount > 25)) {
          const reason = hasSafetyTitle
            ? `title "${title}" is a safety-advice heading`
            : `body is ${wordCount} words`
          report.errors.push({
            severity: 'error',
            kind: 'safety-block',
            message: `infoPanel with tone "warning" and ${reason} — replace with at most one plain-English craft note (or remove); safety advice belongs inline as a numbered step, not in a dedicated block`,
            path: nodePath,
          })
        }
      }

      if (node.type === 'heading') {
        const headingText = flattenInline(node).toLowerCase()
        const hasSafetyTitle = SAFETY_HEADING_KEYWORDS.some((kw) => headingText.includes(kw))
        if (hasSafetyTitle) {
          report.errors.push({
            severity: 'error',
            kind: 'safety-block',
            message: `heading "${flattenInline(node)}" is a safety-advice section heading — remove the dedicated section; safety advice belongs inline as a numbered step or one compressed line`,
            path: nodePath,
          })
        }
      }

      if (Array.isArray(node.content)) {
        walk(node.content, nodePath)
      }
    })
  }

  walk(doc.content, 'body')
}

// ─── Rule application ───────────────────────────────────────────────────────

export function runVoiceCheck(input: unknown): VoiceCheckReport {
  const report: VoiceCheckReport = { errors: [], warnings: [] }

  const root = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const body = root.body ?? input

  const chunks: Chunk[] = []
  chunks.push(...extractMetadataChunks(root))
  chunks.push(...extractProseChunks(body))

  // Apply rules.
  for (const chunk of chunks) {
    scanChunk(chunk, report)
    scanChunkBodyOnly(chunk, report)
  }

  // Cross-chunk: prose-style sequential steps across consecutive paragraphs.
  checkProseStyleSteps(chunks, report)

  // Structural rules — run over the upload-input level when available.
  if (root.body !== undefined) {
    checkGlossaryCoverage(root, report)
    checkTemperatureCanonical(root, report)
    checkServingsAndYield(root, report)
    checkSafetyInfoPanels(root.body, report)
    checkTipTapTextNodeType(root.body, report)
    checkInlineClinicalVocab(root.body, report)
  } else {
    checkSafetyInfoPanels(body, report)
    checkTipTapTextNodeType(body, report)
    checkInlineClinicalVocab(body, report)
  }

  return report
}

// ─── 2026-05-21 voice-spec rules (body-only) ────────────────────────────────

/**
 * Body-only scans. Run alongside the existing scanChunk; gated on
 * `chunk.path.startsWith('body')`. sourceNotes (the Sources block) is
 * exempt — citations, institutional names, years, and historical figures
 * all live there legitimately.
 */
function scanChunkBodyOnly(chunk: Chunk, report: VoiceCheckReport): void {
  if (!chunk.path.startsWith('body')) return
  const { text, path } = chunk

  // Year in parentheses — block.
  const yearMatch = YEAR_IN_BODY_PATTERN.exec(text)
  if (yearMatch) {
    report.errors.push({
      severity: 'error',
      kind: 'year-in-body',
      message: `year-only reference "${yearMatch[0]}" in body prose — move historical context to sourceNotes`,
      path,
      snippet: yearMatch[0],
    })
  }

  // Institutional / regulatory names — block.
  for (const name of INSTITUTIONAL_NAMES) {
    const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i')
    if (re.test(text)) {
      report.errors.push({
        severity: 'error',
        kind: 'institutional-in-body',
        message: `institutional name "${name}" in body prose — move to sourceNotes (Sources block on the public page)`,
        path,
        snippet: name,
      })
    }
  }

  // Historical figure surnames without an inline gloss in the same sentence.
  for (const figure of HISTORICAL_FIGURES) {
    const re = new RegExp(`\\b${figure.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`)
    if (!re.test(text)) continue
    // Find the sentence containing the surname.
    const sentences = text.split(/(?<=[.!?])\s+/)
    for (const s of sentences) {
      if (!re.test(s)) continue
      const lower = s.toLowerCase()
      const hasGloss = HISTORICAL_GLOSS_TOKENS.some((t) => lower.includes(t.toLowerCase()))
      if (!hasGloss) {
        report.errors.push({
          severity: 'error',
          kind: 'historical-figure-in-body',
          message: `historical figure "${figure}" in body prose without plain-English gloss — move to sourceNotes or introduce as e.g. "the 17th-century herbalist ${figure}"`,
          path,
          snippet: figure,
        })
        break
      }
    }
  }

  // Grade-level (Flesch-Kincaid) per paragraph chunk only.
  if (chunk.paragraph) {
    const grade = fleschKincaidGrade(text)
    if (grade !== null && grade > GRADE_LEVEL_BLOCK_THRESHOLD) {
      report.errors.push({
        severity: 'error',
        kind: 'grade-level',
        message: `paragraph reads at grade ${grade.toFixed(1)} (threshold: ${GRADE_LEVEL_BLOCK_THRESHOLD.toFixed(1)}) — simplify vocabulary or shorten sentences (grade 6-8 register)`,
        path,
      })
    }
  }
}

/**
 * Grade-level threshold. Calibrated 2026-05-25 against the 10 approved
 * voice-pilot bodies (all paragraphs below grade ~11) and the
 * pre-rewrite calendula-salve / thyme-cough-syrup (paragraphs at grade
 * 13-15). Set to 12 so genuine academic register blocks; ordinary
 * recipe prose passes. Tighten over time once the library catches up.
 */
const GRADE_LEVEL_BLOCK_THRESHOLD = 12

/**
 * Flesch-Kincaid Grade Level. Returns null on too-short input
 * (<10 words) where the score is meaningless.
 *   FKGL = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
 */
export function fleschKincaidGrade(text: string): number | null {
  const cleaned = text.trim()
  if (!cleaned) return null
  const sentences = cleaned.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0)
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length < 10) return null
  const sentenceCount = Math.max(sentences.length, 1)
  let syllables = 0
  for (const w of words) syllables += countSyllables(w)
  return (
    0.39 * (words.length / sentenceCount) +
    11.8 * (syllables / words.length) -
    15.59
  )
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  // Count vowel groups.
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .match(/[aeiouy]+/g)
  return Math.max(groups?.length ?? 1, 1)
}

/**
 * Cross-chunk check: two or more consecutive body paragraphs that start
 * with a step-opener (First, / Then, / Next, / Finally, …) are a numbered
 * list written badly. Fire on each one after the first match.
 */
function checkProseStyleSteps(chunks: Chunk[], report: VoiceCheckReport): void {
  const bodyParas = chunks.filter((c) => c.paragraph && c.path.startsWith('body'))
  let runStartIdx = -1
  for (let i = 0; i < bodyParas.length; i++) {
    const para = bodyParas[i]
    if (!para) continue
    const opensWith = STEP_OPENERS.find((opener) =>
      para.text.trimStart().toLowerCase().startsWith(opener.toLowerCase()),
    )
    if (opensWith) {
      if (runStartIdx < 0) runStartIdx = i
      // If the previous paragraph also opened with a step-opener, we have a run.
      const prev = bodyParas[i - 1]
      if (
        prev &&
        STEP_OPENERS.some((o) => prev.text.trimStart().toLowerCase().startsWith(o.toLowerCase()))
      ) {
        report.errors.push({
          severity: 'error',
          kind: 'prose-style-steps',
          message: `prose-style sequential step ("${opensWith} …") — sequential instructions belong in an orderedList block, not prose`,
          path: para.path,
          snippet: opensWith,
        })
      }
    } else {
      runStartIdx = -1
    }
  }
}

/**
 * Structural validator: every text-bearing leaf in the body MUST have
 * `type: "text"`. Missing the type field makes the public renderer's
 * switch on node.type drop the node silently via its default case.
 * Caught during the voice-pilot when orderedList step contents were
 * authored without the type field. Blocking error from now on.
 */
function checkTipTapTextNodeType(body: unknown, report: VoiceCheckReport): void {
  if (!body || typeof body !== 'object') return
  let missing = 0
  function walk(node: any, path: string): void {
    if (!node || typeof node !== 'object') return
    // Leaf with text but no type field.
    if (typeof node.text === 'string' && !node.type) {
      missing++
      if (missing <= 5) {
        report.errors.push({
          severity: 'error',
          kind: 'missing-node-type',
          message: `TipTap text node missing "type": "text" — would render as empty on the public page; add the type field`,
          path,
          snippet: node.text.slice(0, 60),
        })
      }
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((c: any, i: number) => walk(c, `${path} > [${i}]`))
    }
  }
  walk(body, 'body')
  if (missing > 5) {
    report.errors.push({
      severity: 'error',
      kind: 'missing-node-type',
      message: `${missing - 5} additional text nodes missing "type": "text" (only first 5 listed)`,
      path: 'body',
    })
  }
}

/**
 * Clinical / Latin vocab check. Fires when a watchlist word appears in
 * body prose AND the text node is NOT wrapped in a glossaryTooltip mark.
 * Walks the body directly (not chunks) so we can read mark context.
 */
function checkInlineClinicalVocab(body: unknown, report: VoiceCheckReport): void {
  if (!body || typeof body !== 'object') return
  function walk(node: any, path: string, parentTone: string | null): void {
    if (!node || typeof node !== 'object') return
    // Skip nodes inside info / source blocks where the term may be allowed.
    if (node.type === 'text' && typeof node.text === 'string') {
      const marks: any[] = Array.isArray(node.marks) ? node.marks : []
      const tooltipped = marks.some((m) => m?.type === 'glossaryTooltip')
      if (!tooltipped) {
        for (const entry of CLINICAL_VOCAB) {
          const re = new RegExp(`\\b${entry.word}\\b`, 'i')
          if (re.test(node.text)) {
            report.errors.push({
              severity: 'error',
              kind: 'clinical-vocab',
              message: `clinical/Latin vocabulary "${entry.word}" in body prose without glossary tooltip — use ${entry.plain}`,
              path,
              snippet: entry.word,
            })
          }
        }
      }
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((c: any, i: number) => walk(c, `${path} > [${i}]`, parentTone))
    }
  }
  walk(body, 'body', null)
}

// ─── Structural rules (phase_8_content_integration_001) ─────────────────────

interface GlossaryTermEntry {
  slug: string
  term?: string
  definition?: string
}

/**
 * Inline glossary coverage. Every entry in `glossaryTerms[]` must appear at
 * least once in body prose wrapped in a `glossaryTooltip` mark, and every
 * `glossaryTooltip` mark must reference a registered slug. Fail both ways.
 */
function checkGlossaryCoverage(root: Record<string, unknown>, report: VoiceCheckReport): void {
  const registered = Array.isArray(root.glossaryTerms) ? (root.glossaryTerms as GlossaryTermEntry[]) : []
  if (registered.length === 0) return

  // Check each entry has a non-empty, explanatory definition (>= 20 chars / ~5 words).
  for (const entry of registered) {
    if (!entry?.slug) continue
    const def = (entry.definition ?? '').trim()
    if (def.length < 20) {
      report.errors.push({
        severity: 'error',
        kind: 'empty-glossary-def',
        message: `glossary term "${entry.slug}" has an empty or stub definition ("${def.slice(0, 30)}") — must be at least one explanatory clause`,
        path: `glossaryTerms[${entry.slug}]`,
      })
    }
  }

  const registeredSlugs = new Set(registered.map((g) => g?.slug).filter((s): s is string => typeof s === 'string'))
  const usedSlugs = new Set<string>()

  function walkMarks(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const n = node as TipTapNode
    if (Array.isArray(n.marks)) {
      for (const mark of n.marks) {
        if (mark.type === 'glossaryTooltip' && mark.attrs) {
          const slug = typeof mark.attrs.termSlug === 'string' ? (mark.attrs.termSlug as string) : null
          if (slug) usedSlugs.add(slug)
        }
      }
    }
    if (Array.isArray(n.content)) for (const c of n.content) walkMarks(c)
  }
  walkMarks(root.body)

  for (const slug of registeredSlugs) {
    if (!usedSlugs.has(slug)) {
      report.errors.push({
        severity: 'error',
        kind: 'glossary-coverage',
        message: `glossary term "${slug}" registered but never used inline (wrap at least one occurrence in a glossaryTooltip mark)`,
        path: `glossaryTerms[${slug}]`,
      })
    }
  }
  for (const slug of usedSlugs) {
    if (!registeredSlugs.has(slug)) {
      report.errors.push({
        severity: 'error',
        kind: 'glossary-coverage',
        message: `inline glossaryTooltip references "${slug}" but it is not declared in glossaryTerms[]`,
        path: `body > glossaryTooltip[${slug}]`,
      })
    }
  }
}

/**
 * Temperature canonical °C. The drafter writes conventional oven temperatures
 * into `recipe.temperatureCelsius`; the public renderer derives fan / °F /
 * gas mark at render time.
 *
 * Hard fail: body prose mentions a fan temperature that's *lower* than the
 * temperatureCelsius value — that's authentic conventional + fan-conversion
 * note. Soft warn: prose mentions "fan" or "convection" near a temperature
 * and the stored value looks like a fan value (suspicious: e.g. 160 stored
 * but prose says "180 fan").
 */
function checkTemperatureCanonical(root: Record<string, unknown>, report: VoiceCheckReport): void {
  const recipe = (root.recipe ?? {}) as Record<string, unknown>
  const tempC = typeof recipe.temperatureCelsius === 'number' ? recipe.temperatureCelsius : null
  if (tempC === null) return

  // Collect prose strings from the body.
  const proseChunks = extractProseChunks(root.body)
  for (const c of proseChunks) {
    const text = c.text
    // Look for "180 fan", "fan 180", or "180°C fan" patterns near the stored value.
    const fanMatch = /\b(?:fan|convection)\s*(?:oven\s*)?(?:at\s*)?(\d{2,3})\s*(?:°c)?\b|\b(\d{2,3})\s*(?:°c)?\s*(?:fan|convection)\b/i.exec(text)
    if (fanMatch) {
      const fanValue = Number(fanMatch[1] ?? fanMatch[2])
      // Fan should be ~20° lower than conventional. If the stored temperature
      // is LOWER than the fan number in the prose, the author likely stored
      // a fan number as conventional. Warn.
      if (Number.isFinite(fanValue) && fanValue > tempC) {
        report.warnings.push({
          severity: 'warn',
          kind: 'temperature-canonical',
          message: `body mentions fan oven at ${fanValue}°C but recipe.temperatureCelsius is ${tempC}°C — verify the stored value is conventional, not fan`,
          path: c.path,
        })
        return
      }
    }
  }
}

/**
 * Servings / yieldDescription exclusivity. Recipes set EXACTLY ONE of:
 * - `servings` (portion-count yields, "Serves 4")
 * - `yieldDescription` (discrete-item yields, "1 loaf" / "12 muffins")
 * - or neither (ingredient-yielding recipes, e.g. shortcrust pastry).
 *
 * If both are set, fail. The ingredient-yielding case is detected loosely
 * via the title — pastries / bases / sauces that don't list servings.
 */
function checkServingsAndYield(root: Record<string, unknown>, report: VoiceCheckReport): void {
  const type = typeof root.type === 'string' ? root.type : 'RECIPE'
  if (type !== 'RECIPE') return
  const recipe = (root.recipe ?? {}) as Record<string, unknown>
  const servings = recipe.servings
  const yieldDesc = recipe.yieldDescription

  const hasServings = typeof servings === 'number' && servings > 0
  const hasYield = typeof yieldDesc === 'string' && yieldDesc.trim().length > 0

  if (hasServings && hasYield) {
    report.errors.push({
      severity: 'error',
      kind: 'servings-yield',
      message: 'both recipe.servings and recipe.yieldDescription are set — choose one (servings for portion-count yields, yieldDescription for discrete-item yields)',
      path: 'recipe',
    })
  }
}

function scanChunk(chunk: Chunk, report: VoiceCheckReport): void {
  const { text, path, paragraph, trailing } = chunk
  const lower = text.toLowerCase()

  // Banned phrases.
  for (const entry of BANNED_PHRASES) {
    const re = wordRegex(entry.phrase)
    if (re.test(text)) {
      report.errors.push({
        severity: 'error',
        kind: 'banned-phrase',
        message: `banned phrase "${entry.phrase}"`,
        path,
        snippet: entry.phrase,
      })
    }
  }

  // Banned sentence openers — sentence-initial only.
  for (const opener of BANNED_OPENERS) {
    if (matchOpener(text, opener)) {
      report.errors.push({
        severity: 'error',
        kind: 'banned-opener',
        message: `banned opener "${opener}"`,
        path,
        snippet: opener,
      })
    }
  }

  // Em/en dash — paragraph-level. Rule (2026-05-19): ZERO in body content.
  if (paragraph) {
    const dashTotal = (text.match(/[—–]/g) ?? []).length
    if (dashTotal > 0) {
      report.errors.push({
        severity: 'error',
        kind: 'em-dash-paragraph',
        message: `${dashTotal} em/en dash${dashTotal > 1 ? 'es' : ''} in body content (must be zero — use brackets, commas, full stops, or rewording instead)`,
        path,
        snippet: text.slice(0, 140).replace(/\n/g, ' '),
      })
    }
  }

  // Negation patterns.
  for (const pattern of NEGATION_PATTERNS) {
    if (pattern.test(text)) {
      report.errors.push({
        severity: 'error',
        kind: 'negation-pattern',
        message: 'negation pattern ("not just X, but Y" / "it\'s not about X, it\'s about Y")',
        path,
      })
      break
    }
  }

  // Medical claims.
  for (const m of MEDICAL_CLAIM_PATTERNS) {
    if (m.pattern.test(text)) {
      report.errors.push({
        severity: 'error',
        kind: 'medical-claim',
        message: `medical claim watchword: ${m.label}`,
        path,
      })
    }
  }

  // Price mentions in body text.
  if (containsPriceMention(text)) {
    report.errors.push({
      severity: 'error',
      kind: 'price-mention',
      message: 'literal currency value in body text (prices live on master records, not in copy)',
      path,
    })
  }

  // Wrap-up sign-offs — only on the trailing block.
  if (trailing) {
    for (const phrase of WRAP_UP_PHRASES) {
      if (lower.includes(phrase)) {
        report.errors.push({
          severity: 'error',
          kind: 'wrap-up',
          message: `wrap-up sign-off "${phrase}"`,
          path,
          snippet: phrase,
        })
      }
    }
  }

  // Americanisms — warn.
  for (const a of AMERICANISMS) {
    if (wordRegex(a.word).test(text)) {
      report.warnings.push({
        severity: 'warn',
        kind: 'americanism',
        message: `Americanism "${a.word}" — prefer "${a.british}"`,
        path,
        snippet: a.word,
      })
    }
  }

  // Brand trademarks — error (blocks). Use the generic equivalent instead.
  for (const b of BANNED_BRANDS) {
    if (wordRegex(b.brand).test(text)) {
      report.errors.push({
        severity: 'error',
        kind: 'brand-trademark',
        message: `brand-trademark "${b.brand}" — use "${b.generic}" instead`,
        path,
        snippet: b.brand,
      })
    }
  }
  // Brand names that pass — warn only. Reviewer decides per-recipe whether
  // to rephrase. Sometimes the brand reads naturally as the noun.
  for (const b of WARN_BRANDS) {
    if (wordRegex(b.brand).test(text)) {
      report.warnings.push({
        severity: 'warn',
        kind: 'brand-trademark',
        message: `brand name "${b.brand}" — generic equivalent is "${b.generic}"`,
        path,
        snippet: b.brand,
      })
    }
  }

  // Tricolons — warn.
  if (paragraph && containsTricolon(text)) {
    report.warnings.push({
      severity: 'warn',
      kind: 'tricolon',
      message: 'tricolon (three parallel items) — two adjectives almost always beats three',
      path,
    })
  }

  // Safety-block detection — warn when a paragraph reads like a safety-advice
  // block rather than a craft step. Flag if 3+ safety keywords appear.
  if (paragraph) {
    const lower = text.toLowerCase()
    const hits = SAFETY_KEYWORDS.filter((kw) => lower.includes(kw))
    if (hits.length >= 3) {
      report.warnings.push({
        severity: 'warn',
        kind: 'safety-block',
        message: `possible safety-advice block (${hits.length} safety keywords: ${hits.slice(0, 4).join(', ')}). Body content is craft steps — move safety actions inline as numbered steps or compress to one line`,
        path,
      })
    }
  }

  // Raw-hours detection — error when a duration > 48 h is expressed as raw
  // hours. Rule (2026-05-19): over 48 h must be expressed in days or weeks.
  {
    const rawHoursRe = /\b(\d+)\s*(?:hours?|hrs?)\b/gi
    let match: RegExpExecArray | null
    while ((match = rawHoursRe.exec(text)) !== null) {
      const hours = parseInt(match[1], 10)
      if (hours > 48) {
        const approxWeeks = Math.floor(hours / 168)
        const approxDays = Math.floor((hours % 168) / 24)
        const suggestion =
          approxWeeks > 0
            ? `${approxWeeks} week${approxWeeks > 1 ? 's' : ''}${approxDays > 0 ? `, ${approxDays} day${approxDays > 1 ? 's' : ''}` : ''}`
            : `${Math.round(hours / 24)} days`
        report.errors.push({
          severity: 'error',
          kind: 'raw-hours',
          message: `"${match[0]}" — durations over 48 h must be expressed in days or weeks (try "${suggestion}")`,
          path,
          snippet: match[0],
        })
      }
    }
  }

  // Jargon watchlist — warn when a false-specific or domain-jargon word
  // appears in plain body text without being wrapped in a glossaryTooltip.
  for (const entry of JARGON_WATCHLIST) {
    if (wordRegex(entry.word).test(text)) {
      report.warnings.push({
        severity: 'warn',
        kind: 'unflagged-jargon',
        message: `"${entry.word}" — ${entry.note}`,
        path,
        snippet: entry.word,
      })
    }
  }
}

function wordRegex(phrase: string): RegExp {
  // Escape regex metachars, then bracket with word boundaries on the outside
  // and allow internal punctuation / spaces to match literally.
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Allow either a real word boundary or sentence-edge punctuation around it.
  return new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{N}])`, 'iu')
}

function matchOpener(text: string, opener: string): boolean {
  const trimmed = text.trimStart()
  const lower = trimmed.toLowerCase()
  if (lower.startsWith(opener)) {
    const next = trimmed[opener.length]
    if (next === undefined || /[\s,.!?:;]/.test(next)) return true
  }
  // Also check after the first sentence-ending punctuation.
  const sentences = splitSentences(text)
  for (let i = 1; i < sentences.length; i++) {
    const s = sentences[i]?.trimStart().toLowerCase()
    if (s && s.startsWith(opener)) {
      const next = sentences[i]!.trimStart()[opener.length]
      if (next === undefined || /[\s,.!?:;]/.test(next)) return true
    }
  }
  return false
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function containsPriceMention(text: string): boolean {
  // £12, £ 12, $5.99, € 4 — but allow "%" and "g" / "ml" alongside the digit.
  return /(£|\$|€|¥)\s?\d/.test(text)
}

/**
 * Structural words that signal a content list (ingredients, instructions,
 * preposition phrases) rather than a voice-tell adjective tricolon.
 * If any token in any of the three items appears here, the match is skipped.
 */
const TRICOLON_BANNED_TOKENS = new Set([
  'a', 'an', 'the',
  'of', 'with', 'in', 'on', 'for', 'to', 'from', 'by', 'as', 'than',
  'into', 'onto', 'at', 'over', 'under', 'across', 'around',
  'no', 'not',
  'and', 'or', 'but', 'so', 'yet',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
])

/** Common food-ingredient words that indicate a content list, not a style tell. */
const TRICOLON_INGREDIENT_STOP = new Set([
  'salt', 'pepper', 'sugar', 'flour', 'butter', 'oil', 'milk', 'cream',
  'water', 'wine', 'vinegar', 'honey', 'syrup', 'yeast', 'soda',
  'lemon', 'lime', 'orange', 'apple', 'pear', 'plum', 'cherry',
  'onion', 'garlic', 'shallot', 'leek', 'carrot', 'celery', 'potato',
  'tomato', 'chilli', 'chili', 'ginger', 'nutmeg', 'cinnamon',
  'cardamom', 'cumin', 'coriander', 'allspice', 'cloves', 'paprika',
  'thyme', 'rosemary', 'parsley', 'basil', 'mint', 'sage', 'oregano',
  'tarragon', 'dill', 'bay', 'fennel', 'fenugreek',
  'egg', 'eggs', 'yolk', 'yolks',
  'beef', 'pork', 'lamb', 'chicken', 'duck', 'goose', 'turkey', 'fish',
  'cheese', 'parmesan', 'cheddar', 'mozzarella', 'ricotta',
  'bread', 'rice', 'pasta', 'noodles', 'oats', 'beans', 'lentils',
  'nuts', 'almonds', 'walnuts', 'pecans', 'hazelnuts', 'pistachios',
  'cocoa', 'chocolate', 'coffee', 'tea', 'vanilla',
  'stock', 'broth', 'sauce', 'paste',
  'mustard', 'sultanas', 'raisins', 'currants',
  'cucumber', 'aubergine', 'courgette', 'spinach', 'kale', 'cabbage',
])

function tricolonLooksStylistic(item: string): boolean {
  const tokens = item.match(/[\p{L}-]+/gu) ?? []
  if (tokens.length === 0) return false
  for (const tok of tokens) {
    const lower = tok.toLowerCase()
    if (TRICOLON_BANNED_TOKENS.has(lower)) return false
    if (TRICOLON_INGREDIENT_STOP.has(lower)) return false
  }
  return true
}

function containsTricolon(text: string): boolean {
  // Heuristic: a parallel list of three short items separated by commas, with
  // "and" before the last. Only flags when all three items look like
  // stylistic descriptors — excludes ingredient lists, recipe instructions,
  // preposition phrases, and proper-noun sequences.
  const pattern = /\b([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+and\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3})\b/giu
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const x = match[1]
    const y = match[2]
    const z = match[3]
    if (!x || !y || !z) continue
    if (!tricolonLooksStylistic(x) || !tricolonLooksStylistic(y) || !tricolonLooksStylistic(z)) continue
    if (/\d/.test(x) || /\d/.test(y) || /\d/.test(z)) continue
    // At most one item may start with uppercase (filters proper-noun lists like
    // "Syria, Jordan, and Palestine")
    const uppercaseCount = [x, y, z].filter((it) => /^[A-Z]/.test(it)).length
    if (uppercaseCount > 1) continue
    return true
  }
  return false
}

// ─── Formatting ─────────────────────────────────────────────────────────────

export function formatReport(report: VoiceCheckReport): string {
  const lines: string[] = []
  const errCount = report.errors.length
  const warnCount = report.warnings.length
  lines.push(`voice-check: ${errCount} ${errCount === 1 ? 'error' : 'errors'}, ${warnCount} ${warnCount === 1 ? 'warning' : 'warnings'}`)
  for (const f of report.errors) {
    lines.push(`ERROR  ${f.kind}: ${f.message} at ${f.path}`)
  }
  for (const f of report.warnings) {
    lines.push(`WARN   ${f.kind}: ${f.message} at ${f.path}`)
  }
  if (errCount > 0) {
    lines.push('')
    lines.push('Failed. Fix errors before uploading.')
  } else if (warnCount > 0) {
    lines.push('')
    lines.push('Passed with warnings.')
  } else {
    lines.push('')
    lines.push('Clean.')
  }
  return lines.join('\n')
}

export function exitCodeFor(report: VoiceCheckReport): 0 | 1 | 2 {
  if (report.errors.length > 0) return 2
  if (report.warnings.length > 0) return 1
  return 0
}
