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
  push('subtitle', input.subtitle)
  push('excerpt', input.excerpt, true)
  push('sourceNotes', input.sourceNotes, true)
  return out
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
  }

  return report
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

  // Em-dash count — paragraph-level.
  if (paragraph) {
    const total = (text.match(/—/g) ?? []).length
    if (total > 1) {
      report.errors.push({
        severity: 'error',
        kind: 'em-dash-paragraph',
        message: `${total} em dashes in one paragraph (max 1)`,
        path,
      })
    }
    // Two em dashes in the same sentence — the strongest AI tell.
    const sentences = splitSentences(text)
    for (const sentence of sentences) {
      const count = (sentence.match(/—/g) ?? []).length
      if (count >= 2) {
        report.errors.push({
          severity: 'error',
          kind: 'em-dash-sentence',
          message: `${count} em dashes in one sentence`,
          path,
          snippet: sentence.trim(),
        })
        break
      }
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

  // Tricolons — warn.
  if (paragraph && containsTricolon(text)) {
    report.warnings.push({
      severity: 'warn',
      kind: 'tricolon',
      message: 'tricolon (three parallel items) — two adjectives almost always beats three',
      path,
    })
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

function containsTricolon(text: string): boolean {
  // Heuristic: a parallel list of three short items separated by commas, with
  // "and" before the last. Catches "warm, considered, and beautiful" style.
  // Limit each item to <= 4 words to avoid flagging genuine prose lists.
  const pattern = /\b([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+and\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3})\b/iu
  return pattern.test(text)
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
