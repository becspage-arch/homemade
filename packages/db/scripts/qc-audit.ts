/**
 * qc-audit — full-spec quality-control audit for PUBLISHED tutorials.
 *
 * Wraps the existing voice-check rules with additional structural,
 * completeness, hero, ingredient, glossary, and grade-level checks the
 * autopilot publish gate must enforce. Severity is binary:
 *
 *   BLOCK — auto-fixable by qc-fix.ts; tutorial is non-compliant
 *   WARN  — cosmetic / informational; no auto-fix needed
 *
 * Writes two artefacts under docs/:
 *   qc-audit-<date>.md   — per-category summary, top violator counts
 *   qc-audit-<date>.json — machine-readable per-tutorial verdicts + fix queue
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts --category paper-word
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts --slug long-stitch-on-wooden-boards
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts --since 2026-05-25
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts --recently-published --since "1 hour ago"
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts --block-only
 *   pnpm --filter @homemade/db exec tsx scripts/qc-audit.ts --limit 50
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'
import { fleschKincaidGrade, runVoiceCheck } from './voice-check-lib.js'

// ─── Types ──────────────────────────────────────────────────────────────────

export type QCSeverity = 'BLOCK' | 'WARN'

export type QCRuleKind =
  // Voice + body content
  | 'voice-violation'
  | 'em-dash-in-content'
  | 'placeholder-string'
  | 'banned-phrase-honest'
  | 'medical-disclaimer-nonstandard'
  | 'historical-century-in-body'
  | 'grade-level-strict'
  | 'academic-register-word'
  // Structural body sections
  | 'body-missing-orientation'
  | 'body-missing-method'
  | 'body-empty-or-too-short'
  // Hero
  | 'hero-missing'
  | 'hero-broken-media'
  // Recipe data
  | 'ingredient-amount-missing'
  | 'ingredient-unit-missing'
  | 'ingredient-id-missing'
  | 'tool-id-missing'
  // Metadata
  | 'recipe-missing-servings-or-yield'
  | 'technique-missing-difficulty'
  // Glossary
  | 'glossary-tooltip-unregistered'
  | 'glossary-term-unused-inline'

export interface QCFinding {
  severity: QCSeverity
  kind: QCRuleKind
  message: string
  path?: string
  snippet?: string
}

export interface QCVerdict {
  slug: string
  tutorialId: string
  type: string
  categorySlug: string
  status: 'PASS' | 'BLOCK' | 'WARN_ONLY'
  voiceRetrofittedAt: string | null
  publishedAt: string | null
  heroMediaId: string | null
  findings: QCFinding[]
}

export interface QCAuditReport {
  generatedAt: string
  totalScanned: number
  passCount: number
  blockCount: number
  warnOnlyCount: number
  perCategory: Record<
    string,
    { total: number; pass: number; block: number; warnOnly: number }
  >
  perRuleKind: Record<string, number>
  verdicts: QCVerdict[]
}

// ─── CLI ────────────────────────────────────────────────────────────────────

interface CliFlags {
  category: string | null
  slug: string | null
  since: string | null
  recentlyPublished: boolean
  blockOnly: boolean
  limit: number | null
  jsonOnly: boolean
  outputDir: string
  dryRun: boolean
  voiceRetrofittedNull: boolean
  includeDrafts: boolean
}

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = {
    category: null,
    slug: null,
    since: null,
    recentlyPublished: false,
    blockOnly: false,
    limit: null,
    jsonOnly: false,
    outputDir: 'docs',
    dryRun: false,
    voiceRetrofittedNull: false,
    includeDrafts: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--category') flags.category = argv[++i] ?? null
    else if (a === '--slug') flags.slug = argv[++i] ?? null
    else if (a === '--since') flags.since = argv[++i] ?? null
    else if (a === '--recently-published') flags.recentlyPublished = true
    else if (a === '--block-only') flags.blockOnly = true
    else if (a === '--limit') flags.limit = Number(argv[++i] ?? '')
    else if (a === '--json-only') flags.jsonOnly = true
    else if (a === '--output-dir') flags.outputDir = argv[++i] ?? 'docs'
    else if (a === '--dry-run') flags.dryRun = true
    else if (a === '--voice-retrofitted-null') flags.voiceRetrofittedNull = true
    else if (a === '--include-drafts') flags.includeDrafts = true
  }
  return flags
}

function parseSince(raw: string | null): Date | null {
  if (!raw) return null
  const trimmed = raw.trim().toLowerCase()
  // Support "N hour(s)/day(s) ago" + ISO date.
  const rel = /^(\d+)\s+(minute|hour|day|week)s?\s+ago$/.exec(trimmed)
  if (rel) {
    const n = Number(rel[1])
    const unit = rel[2]
    const ms =
      unit === 'minute' ? n * 60_000
      : unit === 'hour' ? n * 3_600_000
      : unit === 'day' ? n * 86_400_000
      : unit === 'week' ? n * 7 * 86_400_000
      : 0
    return new Date(Date.now() - ms)
  }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d
}

// ─── Detection helpers ──────────────────────────────────────────────────────

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

const PLACEHOLDER_PATTERN = /\{\{[^}]{1,80}\}\}/g
const EM_DASH_RE = /[—–]/

// Locked medical disclaimer phrasing per the prompt.
const LOCKED_DISCLAIMER =
  'Not medical advice. Consult a medical professional for ongoing or serious symptoms.'

const DISCLAIMER_NEAR_KEYWORDS = [
  'medical advice',
  'not medical',
  'consult a doctor',
  'consult your doctor',
  'consult a physician',
  'consult a healthcare',
  'seek medical',
  'not intended to diagnose',
]

// Century-in-body — long-stitch's "second century onward" needs to fail.
// Match Xth/Xst/Xnd/Xrd-century AND word-form ("first century", ...,
// "twentieth century"). Body-only.
const CENTURY_DIGIT_RE =
  /\b(\d{1,2})(?:st|nd|rd|th)[-\s]?century\b/i
const CENTURY_WORD_RE =
  /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first)\s+century\b/i

// Stricter grade-level threshold for qc-audit (voice-check uses 12; we use 11
// here so academic-register paragraphs that slip past voice-check still BLOCK
// at the publish gate).
const QC_GRADE_LEVEL_BLOCK = 11

// Academic-register words that signal non-craft prose. Body-only. Calibrated
// so long-stitch's "manuscript tradition" + "European case binding" fail.
const ACADEMIC_REGISTER_WORDS = [
  'manuscript tradition',
  'literary tradition',
  'scholarly tradition',
  'documented tradition',
  'historiograph',
  'archaeolog',
  'paleograph',
  'bookbinding literature',
  'documented in the literature',
  'in the literature',
  'literature documents',
  'extant exemplars',
  'extant examples',
  'codicological',
  'codicology',
]

// Sentence-level "honest / honestly / frankly / genuinely" — these are global
// banned by the project memory. voice-check already catches them; qc-audit
// re-flags so they appear in the JSON queue too.
const BANNED_HONEST_RE = /\b(honest(?:ly)?|frankly|genuinely)\b/i

function isRecipeType(type: string): boolean {
  return type === 'RECIPE' || type === 'REMEDY'
}

function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

function bodyTextFor(body: unknown): { totalWords: number; firstParaText: string; headings: string[]; hasOrderedList: boolean; topLevelBlocks: number } {
  const out = { totalWords: 0, firstParaText: '', headings: [] as string[], hasOrderedList: false, topLevelBlocks: 0 }
  const root = body as TipTapNode | null
  if (!root || !Array.isArray(root.content)) return out
  out.topLevelBlocks = root.content.length
  for (let i = 0; i < root.content.length; i++) {
    const n = root.content[i]!
    if (!out.firstParaText && n.type === 'paragraph') {
      out.firstParaText = extractText(n)
    }
    if (n.type === 'heading') {
      const text = extractText(n)
      if (text) out.headings.push(text)
    }
    if (n.type === 'orderedList') out.hasOrderedList = true
    const t = extractText(n)
    out.totalWords += t.split(/\s+/).filter(Boolean).length
  }
  // Also detect orderedList nested deeper than 1 level.
  function deepWalkForOrderedList(node: TipTapNode): boolean {
    if (node.type === 'orderedList') return true
    if (Array.isArray(node.content))
      return node.content.some(deepWalkForOrderedList)
    return false
  }
  if (!out.hasOrderedList && Array.isArray(root.content))
    out.hasOrderedList = root.content.some(deepWalkForOrderedList)
  return out
}

/**
 * Block types whose descendant text is "verbatim" — quoted directly from
 * Rebecca's books (affirmations, energy statements, tapping scripts).
 * Verbatim text is exempt from voice-style rules (grade-level, em-dash,
 * banned-phrase, century-in-body, academic-register). Structural rules
 * (hero present, sections required, ingredient completeness) still apply.
 *
 * Rationale: per feedback_verbatim_energy_statements.md, verbatim text
 * from Rebecca's books MUST NOT be re-registered. The QC voice rules
 * exist to catch authored prose that needs rewriting; running them on
 * verbatim content produces false-positive BLOCKs that no fix routine
 * can resolve (the text is, by policy, sacred).
 *
 * `pullQuote` is the universal signal — verbatim text should always be
 * wrapped in pullQuote per the mindset author prompt.
 *
 * For mindset PRACTICE tutorials, `bulletList` content is ALSO verbatim
 * (tapping scripts are authored as bulletList of listItem statements,
 * each a verbatim setup statement or tapping-point line).
 */
function isVerbatimAncestor(type: string, tutorialType: string, categorySlug: string): boolean {
  if (type === 'pullQuote') return true
  if (categorySlug === 'mindset' && tutorialType === 'PRACTICE' && type === 'bulletList') return true
  return false
}

function walkProseParagraphs(
  body: unknown,
  tutorialType: string,
  categorySlug: string,
): Array<{ text: string; path: string; isBody: boolean; isVerbatim: boolean }> {
  const out: Array<{ text: string; path: string; isBody: boolean; isVerbatim: boolean }> = []
  const root = body as TipTapNode | null
  if (!root || !Array.isArray(root.content)) return out
  for (let i = 0; i < root.content.length; i++) {
    const n = root.content[i]!
    const topVerbatim = isVerbatimAncestor(n.type ?? '', tutorialType, categorySlug)
    if (n.type === 'paragraph' || n.type === 'blockquote') {
      const text = extractText(n)
      if (text) out.push({ text, path: `body > ${n.type}[${i}]`, isBody: true, isVerbatim: false })
    } else if (n.type === 'infoPanel' && n.attrs && typeof n.attrs.body === 'string') {
      out.push({ text: n.attrs.body, path: `body > infoPanel[${i}] > body`, isBody: true, isVerbatim: false })
    } else if (Array.isArray(n.content)) {
      // Walk into lists, pullQuotes, etc. Track whether any ancestor is a
      // verbatim block so the per-paragraph rules can skip them.
      function deep(node: TipTapNode, p: string, verbatim: boolean): void {
        if (!node) return
        const here = verbatim || isVerbatimAncestor(node.type ?? '', tutorialType, categorySlug)
        if (node.type === 'paragraph' || node.type === 'blockquote') {
          const t = extractText(node)
          if (t) out.push({ text: t, path: p, isBody: true, isVerbatim: here })
        }
        if (Array.isArray(node.content)) {
          node.content.forEach((c, j) => deep(c, `${p} > ${c.type ?? 'node'}[${j}]`, here))
        }
      }
      n.content.forEach((c, j) =>
        deep(c, `body > ${n.type ?? 'node'}[${i}] > ${c.type ?? 'node'}[${j}]`, topVerbatim),
      )
    }
  }
  return out
}

function walkTextLeaves(body: unknown): string[] {
  const out: string[] = []
  function walk(n: TipTapNode | null | undefined): void {
    if (!n) return
    if (typeof n.text === 'string') out.push(n.text)
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(body as TipTapNode)
  return out
}

function walkGlossaryTooltipSlugs(body: unknown): string[] {
  const out = new Set<string>()
  function walk(n: TipTapNode | null | undefined): void {
    if (!n) return
    if (Array.isArray(n.marks)) {
      for (const m of n.marks) {
        if (m.type === 'glossaryTooltip' && m.attrs && typeof m.attrs.termSlug === 'string') {
          out.add(m.attrs.termSlug)
        }
      }
    }
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(body as TipTapNode)
  return [...out]
}

// ─── Per-tutorial QC ────────────────────────────────────────────────────────

interface TutorialRow {
  id: string
  slug: string
  type: string
  status: string
  title: string
  subtitle: string | null
  excerpt: string | null
  sourceNotes: string | null
  body: unknown
  heroMediaId: string | null
  difficulty: string | null
  servings: number | null
  yieldDescription: string | null
  voiceRetrofittedAt: Date | null
  publishedAt: Date | null
  hero: { id: string; r2Key: string | null; cloudflareId: string | null } | null
  recipeIngredients: Array<{
    id: string
    amount: number | null
    unit: string | null
    ingredientId: string | null
  }>
  recipeTools: Array<{ id: string; toolId: string | null }>
  category: { slug: string }
}

export function auditTutorial(t: TutorialRow): QCVerdict {
  const findings: QCFinding[] = []

  // ─── Hero presence (BLOCK) ────────────────────────────────────────────────
  if (!t.heroMediaId) {
    findings.push({
      severity: 'BLOCK',
      kind: 'hero-missing',
      message: 'Tutorial PUBLISHED with heroMediaId IS NULL — hero-fill must be run',
    })
  } else if (t.hero && !t.hero.r2Key && !t.hero.cloudflareId) {
    findings.push({
      severity: 'BLOCK',
      kind: 'hero-broken-media',
      message: `Tutorial heroMediaId=${t.heroMediaId} but Media row has no r2Key or cloudflareId — image will 404`,
    })
  }

  // ─── Body presence + structural (BLOCK) ───────────────────────────────────
  const bodySummary = bodyTextFor(t.body)
  if (bodySummary.totalWords < 60 || bodySummary.topLevelBlocks < 2) {
    findings.push({
      severity: 'BLOCK',
      kind: 'body-empty-or-too-short',
      message: `Body is empty or too short (words=${bodySummary.totalWords}, top-level blocks=${bodySummary.topLevelBlocks}) — author orientation + method`,
    })
  } else {
    if (!bodySummary.firstParaText || bodySummary.firstParaText.split(/\s+/).filter(Boolean).length < 12) {
      findings.push({
        severity: 'BLOCK',
        kind: 'body-missing-orientation',
        message: 'No orientation paragraph (first paragraph empty or under 12 words)',
      })
    }
    if (t.type === 'TECHNIQUE' || t.type === 'PATTERN' || t.type === 'REMEDY' || t.type === 'RECIPE' || t.type === 'GROWING_GUIDE') {
      // Need a "method"-style heading OR an orderedList block at minimum.
      const hasMethodHeading = bodySummary.headings.some((h) =>
        /method|how to|steps|instructions|preparing|making|sewing|assembly|preparation/i.test(h),
      )
      if (!hasMethodHeading && !bodySummary.hasOrderedList) {
        findings.push({
          severity: 'BLOCK',
          kind: 'body-missing-method',
          message: `${t.type} tutorial has no Method/Steps section and no orderedList — sequential instructions missing`,
        })
      }
    }
  }

  // ─── Voice-check (BLOCK on errors, WARN on warnings) ──────────────────────
  const voiceReport = runVoiceCheck({
    title: t.title,
    subtitle: t.subtitle,
    excerpt: t.excerpt,
    sourceNotes: t.sourceNotes,
    body: t.body,
    type: t.type,
    recipe:
      isRecipeType(t.type)
        ? { servings: t.servings ?? undefined, yieldDescription: t.yieldDescription ?? undefined }
        : undefined,
  })
  // Verbatim text (pullQuote always; bulletList in mindset PRACTICE tapping
  // scripts) is exempt from voice-style rules. We drop voice-check findings
  // whose path indicates a verbatim ancestor — structural findings (missing
  // node type, servings-yield, glossary coverage, etc.) keep firing because
  // their paths target structure, not verbatim text content.
  const isVerbatimPath = (path: string | undefined): boolean => {
    if (!path) return false
    if (path.includes('pullQuote')) return true
    if (
      t.category.slug === 'mindset' &&
      t.type === 'PRACTICE' &&
      path.includes('bulletList')
    )
      return true
    return false
  }
  for (const err of voiceReport.errors) {
    if (isVerbatimPath(err.path)) continue
    findings.push({
      severity: 'BLOCK',
      kind: 'voice-violation',
      message: `${err.kind}: ${err.message}`,
      path: err.path,
      snippet: err.snippet,
    })
  }
  // We surface voice WARN as QC-WARN (no auto-fix needed).
  for (const warn of voiceReport.warnings) {
    if (isVerbatimPath(warn.path)) continue
    findings.push({
      severity: 'WARN',
      kind: 'voice-violation',
      message: `${warn.kind}: ${warn.message}`,
      path: warn.path,
      snippet: warn.snippet,
    })
  }

  // ─── Em-dashes anywhere in title / subtitle / excerpt (BLOCK) ────────────
  for (const [field, val] of [
    ['title', t.title],
    ['subtitle', t.subtitle],
    ['excerpt', t.excerpt],
  ] as const) {
    if (typeof val === 'string' && EM_DASH_RE.test(val)) {
      findings.push({
        severity: 'BLOCK',
        kind: 'em-dash-in-content',
        message: `${field} contains em or en dash — must be zero anywhere in user-facing copy`,
        path: field,
        snippet: val.slice(0, 100),
      })
    }
  }

  // ─── Placeholder strings (BLOCK) ──────────────────────────────────────────
  const textLeaves = walkTextLeaves(t.body)
  for (const text of textLeaves) {
    const m = PLACEHOLDER_PATTERN.exec(text)
    if (m) {
      findings.push({
        severity: 'BLOCK',
        kind: 'placeholder-string',
        message: `body contains unresolved placeholder ${m[0]} — must be substituted before publish`,
        snippet: text.slice(0, 100),
      })
      break
    }
    PLACEHOLDER_PATTERN.lastIndex = 0
  }
  for (const field of ['title', 'subtitle', 'excerpt', 'sourceNotes'] as const) {
    const v = t[field]
    if (typeof v === 'string') {
      PLACEHOLDER_PATTERN.lastIndex = 0
      const m = PLACEHOLDER_PATTERN.exec(v)
      if (m) {
        findings.push({
          severity: 'BLOCK',
          kind: 'placeholder-string',
          message: `${field} contains unresolved placeholder ${m[0]}`,
          path: field,
          snippet: v.slice(0, 100),
        })
      }
    }
  }

  // ─── Banned "honest" family (BLOCK; redundant with voice-check but always
  // checked so the QC fix queue sees them consistently) ────────────────────
  const bodyParas = walkProseParagraphs(t.body, t.type, t.category.slug)
  for (const p of bodyParas) {
    if (p.isVerbatim) continue
    if (BANNED_HONEST_RE.test(p.text)) {
      findings.push({
        severity: 'BLOCK',
        kind: 'banned-phrase-honest',
        message: 'banned phrase ("honest"/"honestly"/"frankly"/"genuinely") in body — must be stripped',
        path: p.path,
        snippet: p.text.slice(0, 140),
      })
      break
    }
  }

  // ─── Medical disclaimer non-standard (BLOCK) ──────────────────────────────
  // Detect ANY text that looks like a medical disclaimer; if it's not the
  // locked phrase, BLOCK. Body-and-infoPanel only.
  const allBodyText = bodyParas.map((p) => p.text).join('\n')
  if (DISCLAIMER_NEAR_KEYWORDS.some((kw) => allBodyText.toLowerCase().includes(kw))) {
    if (!allBodyText.includes(LOCKED_DISCLAIMER)) {
      findings.push({
        severity: 'BLOCK',
        kind: 'medical-disclaimer-nonstandard',
        message: `body contains medical-disclaimer-style text but does NOT include the locked phrase "${LOCKED_DISCLAIMER}" — normalise`,
      })
    }
  }

  // ─── Stricter QC rules on body prose (BLOCK) ──────────────────────────────
  // Verbatim paragraphs (pullQuote content + mindset PRACTICE bullet-list
  // tapping scripts) are exempt — see isVerbatimAncestor / walkProseParagraphs.
  for (const p of bodyParas) {
    if (p.isVerbatim) continue
    // Century-in-body.
    if (CENTURY_DIGIT_RE.test(p.text) || CENTURY_WORD_RE.test(p.text)) {
      const m = CENTURY_DIGIT_RE.exec(p.text) ?? CENTURY_WORD_RE.exec(p.text)
      findings.push({
        severity: 'BLOCK',
        kind: 'historical-century-in-body',
        message: `historical century reference "${m?.[0]}" in body — move to sourceNotes or introduce with a person (e.g. "the 17th-century herbalist X")`,
        path: p.path,
        snippet: m?.[0],
      })
    }
    // Academic register words.
    for (const w of ACADEMIC_REGISTER_WORDS) {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(p.text)) {
        findings.push({
          severity: 'BLOCK',
          kind: 'academic-register-word',
          message: `academic-register phrase "${w}" in body — rewrite plainly (grade 6-8 register)`,
          path: p.path,
          snippet: w,
        })
        break
      }
    }
    // Stricter grade-level.
    const grade = fleschKincaidGrade(p.text)
    if (grade !== null && grade > QC_GRADE_LEVEL_BLOCK) {
      findings.push({
        severity: 'BLOCK',
        kind: 'grade-level-strict',
        message: `paragraph reads at grade ${grade.toFixed(1)} (qc threshold: ${QC_GRADE_LEVEL_BLOCK}) — simplify (target grade 6-8)`,
        path: p.path,
        snippet: p.text.slice(0, 140),
      })
    }
  }

  // ─── Recipe / Remedy ingredient + tool integrity (BLOCK) ──────────────────
  if (isRecipeType(t.type)) {
    for (const ri of t.recipeIngredients) {
      if (!ri.ingredientId) {
        findings.push({
          severity: 'BLOCK',
          kind: 'ingredient-id-missing',
          message: `recipeIngredient ${ri.id} has no ingredientId — orphan row`,
        })
      }
      if (ri.amount === null || ri.amount === undefined) {
        findings.push({
          severity: 'BLOCK',
          kind: 'ingredient-amount-missing',
          message: `recipeIngredient ${ri.id} (ingredientId=${ri.ingredientId}) has null amount — list renders empty`,
        })
      }
      if (!ri.unit) {
        findings.push({
          severity: 'BLOCK',
          kind: 'ingredient-unit-missing',
          message: `recipeIngredient ${ri.id} (ingredientId=${ri.ingredientId}) has null unit — defaultUnit must be applied`,
        })
      }
    }
    // Recipe metadata: must have servings OR yieldDescription (the
    // ingredient-yielding case — pastry / sauce — is an exception; loose
    // heuristic: title contains "pastry", "sauce", "stock", "dough",
    // "batter", "frosting", "icing", "filling", "glaze").
    const titleLower = t.title.toLowerCase()
    const ingredientYielding =
      /pastry|sauce|stock|dough|batter|frosting|icing|filling|glaze|jam|chutney|infusion|tincture|syrup|oil$|vinegar|salt$|sugar$|powder/.test(
        titleLower,
      )
    if (
      !ingredientYielding &&
      t.type === 'RECIPE' &&
      (t.servings === null || t.servings === undefined) &&
      (t.yieldDescription === null || t.yieldDescription === undefined || t.yieldDescription === '')
    ) {
      findings.push({
        severity: 'BLOCK',
        kind: 'recipe-missing-servings-or-yield',
        message: 'RECIPE missing servings AND yieldDescription — info bar will read empty',
      })
    }
  }
  for (const rt of t.recipeTools) {
    if (!rt.toolId) {
      findings.push({
        severity: 'BLOCK',
        kind: 'tool-id-missing',
        message: `recipeTool ${rt.id} has no toolId — orphan row`,
      })
    }
  }

  if (t.type === 'TECHNIQUE' && !t.difficulty) {
    findings.push({
      severity: 'BLOCK',
      kind: 'technique-missing-difficulty',
      message: 'TECHNIQUE has no difficulty — required for filter / sort',
    })
  }

  // ─── Glossary integrity (BLOCK) ───────────────────────────────────────────
  // GlossaryTerm is a global table in this schema (not per-tutorial). The QC
  // rule is "every inline glossaryTooltip mark must resolve to a real
  // GlossaryTerm row". Unresolved slugs are noted here; resolution against
  // the master table happens in the main loop where prisma is available.
  // We surface the slug list via findings; the main loop fills in
  // resolution status before writing the report.
  const usedSlugs = walkGlossaryTooltipSlugs(t.body)
  for (const s of usedSlugs) {
    findings.push({
      severity: 'WARN',
      kind: 'glossary-tooltip-unregistered',
      message: `__pending-resolution__:${s}`,
    })
  }

  const blockCount = findings.filter((f) => f.severity === 'BLOCK').length
  const warnCount = findings.filter((f) => f.severity === 'WARN').length
  const status: QCVerdict['status'] =
    blockCount > 0 ? 'BLOCK' : warnCount > 0 ? 'WARN_ONLY' : 'PASS'

  return {
    slug: t.slug,
    tutorialId: t.id,
    type: t.type,
    categorySlug: t.category.slug,
    status,
    voiceRetrofittedAt: t.voiceRetrofittedAt?.toISOString() ?? null,
    publishedAt: t.publishedAt?.toISOString() ?? null,
    heroMediaId: t.heroMediaId,
    findings,
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

function repoPath(rel: string): string {
  // Walk up until we find pnpm-workspace.yaml (the repo root marker).
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) {
      return resolve(dir, rel)
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return resolve(process.cwd(), rel)
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))
  const since = parseSince(flags.since)

  const where: Record<string, unknown> = flags.includeDrafts
    ? {}
    : { status: 'PUBLISHED' }
  if (flags.slug) (where as { slug: string }).slug = flags.slug
  if (flags.category) (where as { category: object }).category = { slug: flags.category }
  if (flags.voiceRetrofittedNull) (where as { voiceRetrofittedAt: null }).voiceRetrofittedAt = null
  if (since) {
    if (flags.recentlyPublished) {
      ;(where as { publishedAt: object }).publishedAt = { gte: since }
    } else {
      ;(where as { OR: object[] }).OR = [
        { publishedAt: { gte: since } },
        { updatedAt: { gte: since } },
      ]
    }
  } else if (flags.recentlyPublished) {
    // Default for --recently-published with no --since: last 2 hours.
    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000)
    ;(where as { publishedAt: object }).publishedAt = { gte: twoHoursAgo }
  }

  const tutorials = (await prisma.tutorial.findMany({
    where,
    select: {
      id: true,
      slug: true,
      type: true,
      status: true,
      title: true,
      subtitle: true,
      excerpt: true,
      sourceNotes: true,
      body: true,
      heroMediaId: true,
      difficulty: true,
      servings: true,
      yieldDescription: true,
      voiceRetrofittedAt: true,
      publishedAt: true,
      hero: { select: { id: true, r2Key: true, cloudflareId: true } },
      recipeIngredients: { select: { id: true, amount: true, unit: true, ingredientId: true } },
      recipeTools: { select: { id: true, toolId: true } },
      category: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
    take: flags.limit ?? undefined,
  })) as unknown as TutorialRow[]

  // Load the master glossary slug set once so we can resolve inline tooltips.
  const allGlossarySlugs = new Set<string>(
    (await prisma.glossaryTerm.findMany({ select: { slug: true } })).map((g) => g.slug),
  )

  console.log(`qc-audit: scanning ${tutorials.length} tutorial(s)`)

  const verdicts: QCVerdict[] = []
  let scanned = 0
  for (const t of tutorials) {
    scanned++
    if (scanned % 250 === 0) console.log(`  ...${scanned}/${tutorials.length}`)
    const v = auditTutorial(t)
    // Resolve glossary tooltips against the master table. Replace the
    // __pending-resolution__ WARN entries with real BLOCK findings for
    // unregistered slugs; drop the resolved ones.
    const resolved: QCFinding[] = []
    for (const f of v.findings) {
      if (f.kind === 'glossary-tooltip-unregistered' && f.message.startsWith('__pending-resolution__:')) {
        const slug = f.message.split(':')[1]!
        if (!allGlossarySlugs.has(slug)) {
          resolved.push({
            severity: 'BLOCK',
            kind: 'glossary-tooltip-unregistered',
            message: `inline glossaryTooltip references "${slug}" but no GlossaryTerm row exists for it — orphan tooltip`,
          })
        }
      } else {
        resolved.push(f)
      }
    }
    v.findings = resolved
    // Recompute status after resolution.
    const blockCount = v.findings.filter((f) => f.severity === 'BLOCK').length
    const warnCount = v.findings.filter((f) => f.severity === 'WARN').length
    v.status = blockCount > 0 ? 'BLOCK' : warnCount > 0 ? 'WARN_ONLY' : 'PASS'
    if (!flags.blockOnly || v.status === 'BLOCK') verdicts.push(v)
  }

  // Aggregate.
  const perCategory: QCAuditReport['perCategory'] = {}
  const perRuleKind: QCAuditReport['perRuleKind'] = {}
  let passCount = 0
  let blockCount = 0
  let warnOnlyCount = 0
  for (const v of verdicts) {
    const cat = (perCategory[v.categorySlug] ??= { total: 0, pass: 0, block: 0, warnOnly: 0 })
    cat.total++
    if (v.status === 'PASS') {
      passCount++
      cat.pass++
    } else if (v.status === 'BLOCK') {
      blockCount++
      cat.block++
    } else {
      warnOnlyCount++
      cat.warnOnly++
    }
    for (const f of v.findings) {
      perRuleKind[f.kind] = (perRuleKind[f.kind] ?? 0) + 1
    }
  }

  const report: QCAuditReport = {
    generatedAt: new Date().toISOString(),
    totalScanned: tutorials.length,
    passCount,
    blockCount,
    warnOnlyCount,
    perCategory,
    perRuleKind,
    verdicts,
  }

  // Output files
  const ds = dateStamp()
  const outDir = repoPath(flags.outputDir)
  mkdirSync(outDir, { recursive: true })
  const jsonPath = resolve(outDir, `qc-audit-${ds}.json`)
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8')
  const mdPath = resolve(outDir, `qc-audit-${ds}.md`)
  writeFileSync(mdPath, renderMd(report, flags), 'utf8')

  console.log('')
  console.log(`qc-audit: scanned=${tutorials.length} pass=${passCount} block=${blockCount} warnOnly=${warnOnlyCount}`)
  console.log(`  audit doc: ${mdPath}`)
  console.log(`  audit json: ${jsonPath}`)
  if (flags.slug) {
    // Single-slug debug mode — print findings inline so calibration is readable.
    for (const v of verdicts) {
      console.log('')
      console.log(`${v.slug}  status=${v.status}  findings=${v.findings.length}`)
      for (const f of v.findings) {
        console.log(`  ${f.severity}  ${f.kind}  ${f.message}${f.path ? ` @ ${f.path}` : ''}`)
      }
    }
  }

  await prisma.$disconnect()
}

function renderMd(report: QCAuditReport, flags: CliFlags): string {
  const lines: string[] = []
  lines.push(`# QC audit ${report.generatedAt.slice(0, 10)}`)
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push(`Filters: category=${flags.category ?? 'all'} slug=${flags.slug ?? 'all'} since=${flags.since ?? 'all'} block-only=${flags.blockOnly}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Scanned: ${report.totalScanned}`)
  lines.push(`- PASS: ${report.passCount}`)
  lines.push(`- BLOCK: ${report.blockCount}`)
  lines.push(`- WARN_ONLY: ${report.warnOnlyCount}`)
  lines.push('')
  lines.push('## Per category')
  lines.push('')
  lines.push('| Category | Total | PASS | BLOCK | WARN_ONLY |')
  lines.push('|---|---:|---:|---:|---:|')
  for (const cat of Object.keys(report.perCategory).sort()) {
    const c = report.perCategory[cat]!
    lines.push(`| ${cat} | ${c.total} | ${c.pass} | ${c.block} | ${c.warnOnly} |`)
  }
  lines.push('')
  lines.push('## Per rule kind')
  lines.push('')
  lines.push('| Rule kind | Count |')
  lines.push('|---|---:|')
  for (const kind of Object.keys(report.perRuleKind).sort()) {
    lines.push(`| ${kind} | ${report.perRuleKind[kind]} |`)
  }
  lines.push('')
  if (report.blockCount > 0) {
    lines.push('## Top 50 BLOCK violators')
    lines.push('')
    const violators = report.verdicts
      .filter((v) => v.status === 'BLOCK')
      .sort((a, b) => b.findings.length - a.findings.length)
      .slice(0, 50)
    for (const v of violators) {
      lines.push(`### ${v.slug} (${v.categorySlug}, ${v.type})`)
      lines.push('')
      const blocks = v.findings.filter((f) => f.severity === 'BLOCK')
      for (const f of blocks.slice(0, 10)) {
        lines.push(`- BLOCK ${f.kind}: ${f.message}${f.path ? ` @ ${f.path}` : ''}`)
      }
      if (blocks.length > 10) lines.push(`- (and ${blocks.length - 10} more)`)
      lines.push('')
    }
  }
  return lines.join('\n')
}

// Only run main() when invoked as a CLI script (not when imported by qc-fix).
const invokedAsScript =
  process.argv[1] &&
  (process.argv[1].endsWith('qc-audit.ts') || process.argv[1].endsWith('qc-audit.js'))
if (invokedAsScript) {
  main().catch((err) => {
    console.error(`qc-audit: ${err instanceof Error ? err.stack ?? err.message : err}`)
    process.exit(1)
  })
}
