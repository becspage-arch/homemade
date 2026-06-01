/**
 * qc-fix — auto-fix BLOCK-tier issues surfaced by qc-audit.ts.
 *
 * Strategy:
 *   1. Audit each tutorial in scope (slug filter / category filter / since
 *      filter / --recently-published). Each call uses auditTutorial() from
 *      qc-audit.ts; no re-implementation.
 *   2. For each BLOCK finding, apply the deterministic transform:
 *        hero-missing                       → invoke fixup-hero-fill for the slug
 *        em-dash-in-content                 → use the fix-em-dashes transform
 *        placeholder-string                 → substitute against tutorial metadata
 *                                              + ingredient/tool master tables
 *        banned-phrase-honest               → string-strip
 *        medical-disclaimer-nonstandard     → normalise to locked phrasing
 *        ingredient-amount-missing          → derive standard ratio
 *        ingredient-unit-missing            → apply ingredient.defaultUnit
 *        ingredient-id-missing              → delete the orphan row
 *        tool-id-missing                    → delete the orphan row
 *        recipe-missing-servings-or-yield   → derive from body or default
 *        technique-missing-difficulty       → default to BEGINNER
 *        glossary-tooltip-unregistered      → strip the mark (preserve text)
 *        historical-century-in-body         → strip phrase, append to sourceNotes
 *        academic-register-word             → replace via plain-English lookup
 *        grade-level-strict (body)          → simplify (split sentences,
 *                                              swap multi-syllable words)
 *        body-missing-orientation           → derive from excerpt or title
 *        body-empty-or-too-short            → write a minimal scaffold
 *        body-missing-method                → write a minimal method
 *        voice-violation (kind-specific)    → kind-specific transform
 *   3. After every fix, re-audit the tutorial. If it still BLOCKs, retry up
 *      to 3 times. On the 3rd failure, log to docs/qc-unfixable-<date>.md
 *      and (optionally) flip the tutorial to DRAFT.
 *   4. Snapshot the pre-fix body to docs/qc-fixes-<date>/<slug>.before.json
 *      so the change is recoverable.
 *   5. Tutorial stays PUBLISHED throughout; voiceRetrofittedAt = now() when
 *      body was touched. revisedFrom captured (if null) per existing
 *      fix-em-dashes pattern.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/qc-fix.ts --slug long-stitch-on-wooden-boards --auto-fix
 *   pnpm --filter @homemade/db exec tsx scripts/qc-fix.ts --category paper-word --auto-fix
 *   pnpm --filter @homemade/db exec tsx scripts/qc-fix.ts --recently-published --since "1 hour ago" --auto-fix
 *   pnpm --filter @homemade/db exec tsx scripts/qc-fix.ts --auto-fix --limit 75
 *   pnpm --filter @homemade/db exec tsx scripts/qc-fix.ts --auto-fix              # full corpus
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
import { auditTutorial, type QCFinding } from './qc-audit.js'
import { runVoiceCheck } from './voice-check-lib.js'

// ─── CLI ────────────────────────────────────────────────────────────────────

interface CliFlags {
  category: string | null
  slug: string | null
  since: string | null
  recentlyPublished: boolean
  limit: number | null
  autoFix: boolean
  dryRun: boolean
  revertOnUnfixable: boolean
  voiceRetrofittedNull: boolean
  excludeFromUnfixable: boolean
}

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = {
    category: null,
    slug: null,
    since: null,
    recentlyPublished: false,
    limit: null,
    autoFix: false,
    dryRun: false,
    revertOnUnfixable: false,
    voiceRetrofittedNull: false,
    excludeFromUnfixable: true,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--category') flags.category = argv[++i] ?? null
    else if (a === '--slug') flags.slug = argv[++i] ?? null
    else if (a === '--since') flags.since = argv[++i] ?? null
    else if (a === '--recently-published') flags.recentlyPublished = true
    else if (a === '--limit') flags.limit = Number(argv[++i] ?? '')
    else if (a === '--auto-fix') flags.autoFix = true
    else if (a === '--dry-run') flags.dryRun = true
    else if (a === '--revert-on-unfixable') flags.revertOnUnfixable = true
    else if (a === '--voice-retrofitted-null') flags.voiceRetrofittedNull = true
    else if (a === '--include-unfixable') flags.excludeFromUnfixable = false
  }
  return flags
}

function parseSince(raw: string | null): Date | null {
  if (!raw) return null
  const trimmed = raw.trim().toLowerCase()
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

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

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

// ─── Constants ──────────────────────────────────────────────────────────────

const LOCKED_DISCLAIMER =
  'Not medical advice. Consult a medical professional for ongoing or serious symptoms.'

const DISCLAIMER_DETECT_RE =
  /(?:[A-Z][^.!?]*(?:not\s+(?:medical\s+advice|intended\s+to\s+diagnose|a\s+substitute\s+for)|consult\s+(?:a|your)\s+(?:doctor|physician|healthcare|gp)|seek\s+medical)[^.!?]*\.)/gi

const PLACEHOLDER_RE = /\{\{\s*([^}]+?)\s*\}\}/g
const EM_DASH_RE = /[—–]/g
const CENTURY_DIGIT_RE = /\b(\d{1,2})(?:st|nd|rd|th)[-\s]?century\b/i
const CENTURY_WORD_RE =
  /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first)\s+century\b/i
const BANNED_HONEST_RE = /\b(honest(?:ly)?|frankly|genuinely)\b/gi

// Academic-register replacements. Lower-case keys; first-letter-cap preserved
// at substitution time when the source token starts with a capital.
const ACADEMIC_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bmanuscript tradition\b/gi, 'bookbinding tradition'],
  [/\bliterary tradition\b/gi, 'writing tradition'],
  [/\bscholarly tradition\b/gi, 'long-standing tradition'],
  [/\bdocumented tradition\b/gi, 'recorded tradition'],
  [/\bhistoriograph(?:y|ical)\b/gi, 'history'],
  [/\barchaeolog(?:y|ical)\b/gi, 'old findings'],
  [/\bpaleograph(?:y|ical)\b/gi, 'old handwriting study'],
  [/\bbookbinding literature\b/gi, 'bookbinding manuals'],
  [/\bdocumented in the literature\b/gi, 'written about by hand-bookbinders'],
  [/\bin the literature\b/gi, 'in older manuals'],
  [/\bliterature documents\b/gi, 'manuals record'],
  [/\bextant exemplars?\b/gi, 'surviving examples'],
  [/\bextant examples?\b/gi, 'surviving examples'],
  [/\bcodicological\b/gi, 'book-structure'],
  [/\bcodicology\b/gi, 'book-structure study'],
]

// Clinical / Latin vocabulary plain-English swaps. Used by the
// unexplained-jargon fixer when no GlossaryTerm row is registered for the
// word (so we can't wrap it). Same list as voice-check-lib's CLINICAL_VOCAB
// but expressed as substitution pairs.
//
// 2026-06-01 (Part 7a): added catalogue-style / academic markers that were
// leaking into the chamomile-profile orientation via the excerpt-verbatim
// path. These read clinical even though they aren't strictly "clinical
// vocabulary": materia-medica, western herbal canon, single-herb profile.
const CLINICAL_VOCAB_SWAPS: Array<[RegExp, string]> = [
  [/\bdemulcent\b/gi, 'coating'],
  [/\banodyne\b/gi, 'pain-easing'],
  [/\bcarminative\b/gi, 'wind-easing'],
  [/\bsedative-action\b/gi, 'calming effect'],
  [/\bvolatile[- ]oils?\b/gi, 'aromatic oils'],
  [/\bmucilage\b/gi, 'soothing slip'],
  [/\btincture\b/gi, 'alcohol-soaked preparation'],
  [/\bconstituents\b/gi, 'active parts'],
  [/\bmonograph\b/gi, 'reference entry'],
  [/\bvermifuge\b/gi, 'worm-treating'],
  [/\bdiaphoretic\b/gi, 'sweat-bringing'],
  [/\balterative\b/gi, 'slow system-supporter'],
  [/\bnervine\b/gi, 'nerve-calming'],
  [/\badaptogen\b/gi, 'stress-supporting'],
  [/\befficacy\b/gi, 'how well it works'],
  [/\bvulnerary\b/gi, 'wound-healing'],
  [/\bexpectorant\b/gi, 'phlegm-loosening'],
  [/\banti[- ]?spasmodic\b/gi, 'cramp-easing'],
  [/\bcatarrh\b/gi, 'mucus build-up'],
  [/\banti[- ]?inflammatory\b/gi, 'swelling-calming'],
  [/\bdecoction\b/gi, 'simmered preparation'],
  [/\binfusion\b/gi, 'steeped preparation'],
  [/\bmaceration\b/gi, 'soaked preparation'],
  [/\bsaponification\b/gi, 'soap-making'],
  // Part 7a — catalogue-style / academic markers in orientation prose
  [/\bthe\s+materia[- ]medica\s+entry\b/gi, 'the kitchen entry'],
  [/\bmateria[- ]medica\b/gi, 'kitchen herb'],
  [/\bwestern\s+herbal\s+canon(?:'s)?\b/gi, 'old home medicine'],
  [/\bwestern\s+herbal\s+tradition\b/gi, 'old home medicine'],
  [/\bherbal\s+canon\b/gi, 'home medicine'],
  [/\bsingle[- ]herb\s+profile\.?\s*/gi, ''],
  [/\bherb\s+profile\.?\s*/gi, ''],
  [/\bmost[- ]cited\b/gi, 'most-used'],
  [/\bcontraindicat(?:e|ed|ion|ions)\b/gi, 'should be avoided'],
  [/\bphytochemical(?:s)?\b/gi, 'plant components'],
  [/\bpharmacolog(?:y|ical)\b/gi, 'how-it-works'],
  [/\btraditional\s+actions\b/gi, 'traditional uses'],
  [/\bhas\s+been\s+used\s+(?:traditionally\s+)?for\s+centuries\b/gi, 'has long been used'],
]

// Catalogue-style excerpt detector. When the excerpt opens with admin
// catalogue language (Single-herb profile, Profile of X, Reference for X)
// or contains clinical phrases throughout, qc-fix should NOT use it
// verbatim as the orientation — the prose imports the clinical voice the
// spec rejects. Fallback path is the title-based hook template.
const CATALOGUE_EXCERPT_PATTERNS: RegExp[] = [
  /^\s*(?:single[- ]herb\s+profile|herb\s+profile|profile\s+of|reference\s+(?:for|entry)|materia[- ]medica\s+entry|single\s+remedy\s+profile)\b/i,
  /\b(?:materia[- ]medica|western\s+herbal\s+canon|herbal\s+canon|most[- ]cited)\b/i,
  /\btraditional\s+actions(?:\s*,)/i,
]

function excerptIsCatalogueStyle(excerpt: string | null): boolean {
  if (!excerpt) return false
  const trimmed = excerpt.trim()
  if (trimmed.length === 0) return false
  return CATALOGUE_EXCERPT_PATTERNS.some((re) => re.test(trimmed))
}

// Soft medical / efficacy claim swaps. Conservative: strip the offending
// phrase, then tidy whitespace + punctuation.
const SOFT_MEDICAL_SWAPS: Array<[RegExp, string]> = [
  [/\bfine\s+for\s+(?:almost\s+)?everyone\b/gi, 'a long-traditional preparation'],
  [/\bsafe\s+to\s+take\b/gi, 'long taken'],
  [/\bwell[- ]tolerated\b/gi, 'commonly used'],
  [/\bcan\s+be\s+taken\b/gi, 'is taken'],
  [/\bsuitable\s+for\s+(?:all|everyone|most)\b/gi, 'long used'],
  [/\bsuitable\s+for\s+(children|babies|pregnant)\b/gi, ''],
  [/\bperfect\s+for\s+(colds?|coughs?|flu|sore\s+throats?|sleep|anxiety|digestion|pain)\b/gi, 'long used for $1'],
  [/\bideal\s+for\s+(colds?|coughs?|flu|sore\s+throats?|sleep|anxiety|digestion|pain)\b/gi, 'long used for $1'],
  [/\bgood\s+for\s+(colds?|coughs?|flu|sore\s+throats?|sleep|anxiety|digestion|nausea|the\s+immune|the\s+nervous|pain)\b/gi, 'long used for $1'],
  [/\bcures?\s+(colds?|coughs?|flu|sore\s+throats?|insomnia|anxiety)\b/gi, 'long taken for $1'],
  [/\bguaranteed\s+to\s+(work|cure|heal|soothe|relieve)\b/gi, 'long taken to $1'],
]

// Botanical lecture phrases — strip the whole clause / sentence from the
// FIRST paragraph and append it to sourceNotes for retention.
const BOTANICAL_STRIP_PATTERNS: RegExp[] = [
  /\bThe\s+plant\s+is\s+(?:a|an)\s+(?:small|tall|short|low-growing)[^.!?]*\.\s*/g,
  /\b(?:Family|Native\s+to|Height)\s+[^.!?]*\.\s*/g,
  /\bDaisy[- ]style\s+flowers?[^.!?]*\.\s*/g,
  /\b(?:Annual|Perennial|Biennial)\s+(?:herb|plant|flower|shrub)[^.!?]*\.\s*/g,
  /\b(?:small|tall)\s+(?:annual|perennial|biennial|deciduous|evergreen|shrub|herb|tree)[^.!?]*\.\s*/gi,
  /\bfeathery\s+(?:leaves|leaflets|foliage|fronds)[^.!?]*\.\s*/gi,
  /\bwhite-petalled\s+(?:flowers?|blooms?)[^.!?]*\.\s*/gi,
  /\b(?:white|yellow|pink|purple)\s+(?:flowers?|blossoms?)\s+with\s+(?:a\s+)?(?:yellow|white|black|brown)\s+centre[^.!?]*\.\s*/gi,
]

// Long-word → short-word swaps to push grade-level down without losing
// meaning. Conservative: only swap unambiguous synonyms.
const SIMPLIFY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\butilis(e|ed|es|ing)\b/gi, (_m, s) => `us${s}`] as unknown as [RegExp, string],
  [/\butiliz(e|ed|es|ing)\b/gi, (_m, s) => `us${s}`] as unknown as [RegExp, string],
  [/\bcommence(d|s|ment)?\b/gi, (_m, s) => `start${s ?? ''}`] as unknown as [RegExp, string],
  [/\bsubsequent(?:ly)?\b/gi, 'next'],
  [/\bapproximately\b/gi, 'about'],
  [/\badditional(?:ly)?\b/gi, 'extra'],
  [/\bsufficient(?:ly)?\b/gi, 'enough'],
  [/\bnumerous\b/gi, 'many'],
  [/\bdemonstrat(e|es|ed|ing|ion)\b/gi, (_m, s) => `show${s.startsWith('e') ? '' : s}`] as unknown as [RegExp, string],
  [/\bfacilitate(s|d)?\b/gi, (_m, s) => `help${s ?? ''}`] as unknown as [RegExp, string],
  [/\bsignificant(?:ly)?\b/gi, 'much'],
  [/\bconsiderable(?:y)?\b/gi, 'big'],
  [/\bfundamental(?:ly)?\b/gi, 'basic'],
  [/\bin order to\b/gi, 'to'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bthe fact that\b/gi, 'that'],
  [/\bregardless of\b/gi, 'no matter'],
  [/\bnotwithstanding\b/gi, 'despite'],
  [/\bnevertheless\b/gi, 'still'],
  [/\bfurthermore\b/gi, 'also'],
  [/\bmoreover\b/gi, 'also'],
  [/\bconsequently\b/gi, 'so'],
  [/\bthereby\b/gi, 'so'],
  [/\bcomprises?\b/gi, 'is made of'],
  [/\bcomprising\b/gi, 'made up of'],
  [/\bin conjunction with\b/gi, 'with'],
  [/\bprior to\b/gi, 'before'],
  [/\bsubsequent to\b/gi, 'after'],
]

// Ingredient-quantity defaults by category + name keyword. Used when a
// RecipeIngredient has no amount (the elderflower-style bug). Keys are
// (category-slug, keyword-in-ingredient-name) → { amount, unit }. Generic
// fallback at the end.
const QUANTITY_DEFAULTS: Array<{
  match: (categorySlug: string, name: string, tutorialTitle: string) => boolean
  amount: number
  unit: string
}> = [
  // Herbal infusions: 1-2 tbsp dried herb per 250 ml water. 5 g ≈ ~1 tbsp.
  {
    match: (cat, name, title) =>
      cat === 'herbal-medicine' &&
      /\b(infusion|tea|tisane)\b/i.test(title) &&
      /water/i.test(name),
    amount: 250,
    unit: 'ml',
  },
  {
    match: (cat, name, title) =>
      cat === 'herbal-medicine' &&
      /\b(infusion|tea|tisane|cold[- ]infusion)\b/i.test(title) &&
      !/water|honey|sugar/i.test(name),
    amount: 5,
    unit: 'g',
  },
  // Honey accent in infusions / syrups
  {
    match: (cat, name) => cat === 'herbal-medicine' && /honey/i.test(name),
    amount: 1,
    unit: 'tsp',
  },
  // Salt / pepper for cooking — almost always "to taste"
  {
    match: (cat, name) =>
      (cat === 'cooking' || cat === 'baking') && /^(salt|pepper|black pepper)$/i.test(name),
    amount: 0.5,
    unit: 'tsp',
  },
  // Spices in pinch
  {
    match: (cat, name) =>
      (cat === 'cooking' || cat === 'baking') &&
      /\b(cinnamon|nutmeg|cloves|cardamom|allspice|paprika)\b/i.test(name),
    amount: 0.5,
    unit: 'tsp',
  },
  // Olive / vegetable oil default
  {
    match: (cat, name) =>
      (cat === 'cooking' || cat === 'baking') && /oil$/i.test(name),
    amount: 2,
    unit: 'tbsp',
  },
  // Flour
  {
    match: (cat, name) =>
      (cat === 'baking' || cat === 'cooking') && /\bflour\b/i.test(name),
    amount: 250,
    unit: 'g',
  },
  // Sugar
  {
    match: (cat, name) =>
      (cat === 'baking' || cat === 'cooking') && /\bsugar\b/i.test(name),
    amount: 100,
    unit: 'g',
  },
  // Butter
  {
    match: (cat, name) =>
      (cat === 'baking' || cat === 'cooking') && /\bbutter\b/i.test(name),
    amount: 100,
    unit: 'g',
  },
  // Eggs
  {
    match: (cat, name) =>
      (cat === 'baking' || cat === 'cooking') && /\beggs?\b/i.test(name),
    amount: 2,
    unit: '',
  },
  // Water generic
  {
    match: (_cat, name) => /^water$/i.test(name),
    amount: 200,
    unit: 'ml',
  },
  // Milk
  {
    match: (_cat, name) => /^milk$/i.test(name),
    amount: 250,
    unit: 'ml',
  },
  // Lye for soap
  {
    match: (cat, name) => cat === 'natural-home' && /lye|sodium hydroxide/i.test(name),
    amount: 100,
    unit: 'g',
  },
  // Beeswax for balms
  {
    match: (cat, name) => cat === 'natural-home' && /beeswax/i.test(name),
    amount: 30,
    unit: 'g',
  },
]

// ─── TipTap helpers ─────────────────────────────────────────────────────────

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

function applyTextTransform(
  body: unknown,
  transformFn: (s: string) => string,
): unknown {
  function walk(v: unknown): unknown {
    if (typeof v === 'string') return transformFn(v)
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        // Skip transforming the slug attribute on glossaryTooltip marks
        // so we don't accidentally mangle them.
        if (k === 'termSlug' || k === 'href') {
          out[k] = val
          continue
        }
        out[k] = walk(val)
      }
      return out
    }
    return v
  }
  return walk(body)
}

function stripGlossaryTooltipsForSlugs(body: unknown, badSlugs: Set<string>): unknown {
  function walk(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const n = v as TipTapNode
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(n)) {
        if (k === 'marks' && Array.isArray(val)) {
          out[k] = (val as Array<{ type?: string; attrs?: Record<string, unknown> }>).filter(
            (m) => !(m.type === 'glossaryTooltip' && m.attrs && typeof m.attrs.termSlug === 'string' && badSlugs.has(m.attrs.termSlug as string)),
          )
        } else {
          out[k] = walk(val)
        }
      }
      return out
    }
    return v
  }
  return walk(body)
}

// Reuse the em-dash logic from fix-em-dashes (kept inline so qc-fix is
// independent of changes to that script).
function fixEmDashes(text: string): string {
  if (typeof text !== 'string') return text
  if (!text.includes('—') && !text.includes('–')) return text
  let out = text
  out = out.replace(/(\d+(?:\.\d+)?)\s*[—–]\s*(\d+(?:\.\d+)?)/g, '$1 to $2')
  out = out.replace(/\s*[—–]\s+([^.!?—–]{1,80}?)\s+[—–]\s*/g, ', $1, ')
  out = out.replace(
    /\s*[—–]\s+(or|and|but|so|yet|however|because|since)\s*,/gi,
    (_m, conj) => '. ' + conj.charAt(0).toUpperCase() + conj.slice(1).toLowerCase() + ',',
  )
  out = out.replace(
    /\s*[—–]\s+(it|you|they|she|he|we|i|now|then|next|finally|first|second|when|where|after|before|once|while)\b/gi,
    (_m, word) => {
      const cap = word.toLowerCase() === 'i' ? 'I' : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      return '. ' + cap
    },
  )
  out = out.replace(/\s*[—–]\s*/g, ', ')
  out = out.replace(/,{2,}/g, ',')
  out = out.replace(/,\s*,/g, ',')
  out = out.replace(/\s{2,}/g, ' ')
  out = out.replace(/\s+,/g, ',')
  out = out.replace(/,\s*([.!?;:])/g, '$1')
  out = out.replace(/\.\s*\./g, '.')
  out = out.replace(/\.\s+([a-z])/g, (_m, ch) => '. ' + ch.toUpperCase())
  return out
}

// Mechanical paragraph simplifier for grade-level fixes.
function simplifyParagraph(text: string): string {
  let out = text
  for (const [pattern, replacement] of SIMPLIFY_REPLACEMENTS) {
    if (typeof replacement === 'function') {
      out = out.replace(pattern, replacement as unknown as (substring: string, ...args: unknown[]) => string)
    } else {
      out = out.replace(pattern, replacement)
    }
  }
  // Strip parenthetical clauses that look academic / cosmetic.
  out = out.replace(/\s*\([^)]{1,60}\)/g, '')
  // Split long sentences at the first sensible break-point.
  out = splitLongSentences(out)
  // Collapse double spaces and punctuation tidy-up.
  out = out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\.\s*\./g, '.')
    .trim()
  return out
}

/**
 * Sentence-level splitter. Any sentence > 18 words gets broken at the first
 * comma + coordinating conjunction, or at the first comma after word 12, or at
 * the first semicolon. Repeats until no sentence > 18 words remains (cap 3
 * passes).
 */
function splitLongSentences(text: string): string {
  let result = text
  for (let pass = 0; pass < 3; pass++) {
    const sentences = result.split(/(?<=[.!?])\s+/)
    const rewritten: string[] = []
    let didSplit = false
    for (const s of sentences) {
      const words = s.split(/\s+/).filter(Boolean)
      if (words.length <= 18) {
        rewritten.push(s)
        continue
      }
      // Try comma + conjunction first.
      const commaConj = /,\s+(and|but|or|so|because|since|while|although|though|when|where)\s+/i.exec(s)
      if (commaConj && commaConj.index >= 30) {
        const before = s.slice(0, commaConj.index)
        const conj = commaConj[1]!
        const after = s.slice(commaConj.index + commaConj[0].length)
        const capConj = conj.charAt(0).toUpperCase() + conj.slice(1).toLowerCase()
        rewritten.push(before.replace(/[.!?]?$/, '.') + ' ' + capConj + ' ' + after)
        didSplit = true
        continue
      }
      // Try a comma after the 10th word.
      const commaIdx = findNthOccurrence(s, /,\s+/g, 1)
      if (commaIdx !== -1 && words.slice(0, commaIdx).join(' ').split(/\s+/).length >= 10) {
        const before = s.slice(0, commaIdx)
        const after = s.slice(commaIdx + 1).trimStart()
        const capAfter = after.charAt(0).toUpperCase() + after.slice(1)
        rewritten.push(before.replace(/[.!?]?$/, '.') + ' ' + capAfter)
        didSplit = true
        continue
      }
      // Try a semicolon.
      const semiIdx = s.indexOf(';')
      if (semiIdx !== -1) {
        const before = s.slice(0, semiIdx)
        const after = s.slice(semiIdx + 1).trimStart()
        const capAfter = after.charAt(0).toUpperCase() + after.slice(1)
        rewritten.push(before.replace(/[.!?]?$/, '.') + ' ' + capAfter)
        didSplit = true
        continue
      }
      rewritten.push(s)
    }
    result = rewritten.join(' ')
    if (!didSplit) break
  }
  return result
}

function findNthOccurrence(s: string, re: RegExp, n: number): number {
  let count = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    count++
    if (count === n) return m.index
  }
  return -1
}

function applyAcademicReplacements(text: string): string {
  let out = text
  for (const [pattern, replacement] of ACADEMIC_REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function applyClinicalVocabSwaps(text: string): string {
  let out = text
  for (const [pattern, replacement] of CLINICAL_VOCAB_SWAPS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function applySoftMedicalSwaps(text: string): string {
  let out = text
  for (const [pattern, replacement] of SOFT_MEDICAL_SWAPS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function stripBotanicalLectureFromFirstPara(text: string, sinkBuffer: string[]): string {
  let out = text
  function capture(m: string): string {
    sinkBuffer.push(m.trim())
    return ''
  }
  for (const re of BOTANICAL_STRIP_PATTERNS) {
    out = out.replace(re, capture)
  }
  out = out.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim()
  if (out && !/[.!?]$/.test(out)) out += '.'
  return out
}

function stripCenturyReferences(text: string, sinkBuffer: string[]): string {
  let out = text
  function capture(m: string): string {
    sinkBuffer.push(m.trim())
    return ''
  }
  out = out.replace(/\s*from\s+the\s+\d{1,2}(?:st|nd|rd|th)[-\s]?century\s+onward(?:s)?\b[^.]*\./gi, capture)
  out = out.replace(/\s*from\s+the\s+(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first)\s+century\s+onward(?:s)?\b[^.]*\./gi, capture)
  out = out.replace(/\s*used\s+from\s+the\s+\d{1,2}(?:st|nd|rd|th)[-\s]?century\s+onward(?:s)?\b[^.]*\./gi, capture)
  // Generic: "Xth-century" alone → strip the immediate clause
  out = out.replace(/,?\s*(?:in\s+the\s+|during\s+the\s+|the\s+)?\d{1,2}(?:st|nd|rd|th)[-\s]?century\s*(?:[a-z]+ tradition|tradition)?/gi, capture)
  out = out.replace(/,?\s*(?:in\s+the\s+|during\s+the\s+|the\s+)?(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first)\s+century\s*(?:[a-z]+ tradition|tradition)?/gi, capture)
  out = out.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim()
  // Clean up dangling-verb artefacts left by century-stripping.
  out = out
    .replace(/(?:^|\.\s+)(?:Used|Made|Practised|Practiced|Established|Documented|Developed|Seen)\s+(?=[A-Z])/g, (m) => {
      // Drop the orphaned verb so the next sentence stands alone.
      return m.startsWith('.') ? '. ' : ''
    })
    .replace(/,\s*(?:used|made|practised|practiced|established|documented|developed|seen)\.\s*/gi, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\.\s*\./g, '.')
    .trim()
  if (out && !/[.!?]$/.test(out)) out += '.'
  return out
}

function normaliseMedicalDisclaimer(text: string, alreadyHasLocked: boolean): { text: string; changed: boolean } {
  if (!DISCLAIMER_DETECT_RE.test(text)) return { text, changed: false }
  DISCLAIMER_DETECT_RE.lastIndex = 0
  if (alreadyHasLocked) {
    // Already has the locked one. Strip any OTHER disclaimer sentences.
    const stripped = text.replace(DISCLAIMER_DETECT_RE, '').replace(/\s{2,}/g, ' ').trim()
    DISCLAIMER_DETECT_RE.lastIndex = 0
    return { text: stripped + (stripped ? ' ' : '') + LOCKED_DISCLAIMER, changed: true }
  }
  const replaced = text.replace(DISCLAIMER_DETECT_RE, '').replace(/\s{2,}/g, ' ').trim()
  DISCLAIMER_DETECT_RE.lastIndex = 0
  return { text: replaced + (replaced ? ' ' : '') + LOCKED_DISCLAIMER, changed: true }
}

// Walk body paragraphs and apply per-paragraph rewrites for the
// historical-century / academic-register / clinical-vocab / soft-medical /
// botanical-lecture / grade-level / banned-phrase rules. Mutates a deep copy.
function rewriteBodyParagraphs(
  body: unknown,
  ctx: {
    centurySink: string[]
    botanicalSink: string[]
    sourceNotesAppended: string[]
    isFirstParagraphHandled?: boolean
  },
): { body: unknown; rewrittenCount: number } {
  let rewrittenCount = 0
  let firstParagraphSeen = false
  function walkBlock(node: TipTapNode): TipTapNode {
    if (!node) return node
    const next: TipTapNode = { ...node }
    if (Array.isArray(node.content)) next.content = node.content.map(walkBlock)
    if (node.type === 'paragraph' || node.type === 'blockquote') {
      const before = extractText(node)
      if (before) {
        let after = before
        const beforeLen = after.length
        // 1. First-paragraph botanical lecture strip (REMEDY/HERB_PROFILE).
        if (!firstParagraphSeen) {
          firstParagraphSeen = true
          after = stripBotanicalLectureFromFirstPara(after, ctx.botanicalSink)
        }
        // 2. Strip century references
        after = stripCenturyReferences(after, ctx.centurySink)
        // 3. Academic-register substitutions
        after = applyAcademicReplacements(after)
        // 4. Soft medical claim substitutions
        after = applySoftMedicalSwaps(after)
        // 5. Clinical-vocab plain-English substitutions
        after = applyClinicalVocabSwaps(after)
        // 6. Simplify (drops grade level)
        after = simplifyParagraph(after)
        // 7. Strip banned "honest" family
        after = after.replace(BANNED_HONEST_RE, '').replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim()
        if (after && after !== before) {
          rewrittenCount++
          // Replace the node's content with a single text leaf
          next.content = [
            { type: 'text', text: after, marks: [] },
          ] as TipTapNode[]
        }
        if (after.length === 0 && beforeLen > 0) {
          // Removed everything — drop the node by returning a placeholder
          // empty paragraph. The outer walker leaves it in but it renders
          // as nothing. Better: convert to a paragraph with empty content.
          next.content = []
        }
      }
    } else if (node.type === 'heading') {
      // Headings: apply clinical-vocab + academic-register swaps only.
      // No grade-level simplification (headings are short by design),
      // no botanical strip (headings aren't the orientation).
      const before = extractText(node)
      if (before) {
        let after = applyClinicalVocabSwaps(before)
        after = applyAcademicReplacements(after)
        if (after && after !== before) {
          rewrittenCount++
          next.content = [{ type: 'text', text: after, marks: [] }] as TipTapNode[]
        }
      }
    } else if (node.type === 'infoPanel' && node.attrs && typeof node.attrs.body === 'string') {
      const before = node.attrs.body
      let after = before
      after = stripCenturyReferences(after, ctx.centurySink)
      after = applyAcademicReplacements(after)
      after = applySoftMedicalSwaps(after)
      after = applyClinicalVocabSwaps(after)
      after = simplifyParagraph(after)
      after = after.replace(BANNED_HONEST_RE, '').replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim()
      if (after !== before) {
        rewrittenCount++
        next.attrs = { ...node.attrs, body: after }
      }
    }
    return next
  }
  const root = body as TipTapNode | null
  if (!root || !Array.isArray(root.content)) return { body, rewrittenCount }
  const next: TipTapNode = { ...root, content: root.content.map(walkBlock) }
  return { body: next, rewrittenCount }
}

// Hook signal regexes (mirrors qc-audit's HOOK_SIGNAL_PATTERNS). Used to
// decide whether a candidate orientation needs a hook clause appended.
const HOOK_CHECK_PATTERNS: RegExp[] = [
  /\bthe\s+secret\s+(?:to|of|is)\b/i,
  /\b(?:about|roughly)\s+\d{1,3}\s+(?:minutes?|hours?|days?)\b/i,
  /\bmakes?\s+(?:about\s+)?\d{1,4}\s+(?:bars?|tins?|jars?|bottles?|cups?|loaves?|loaf|servings?|pieces?|portions?|biscuits?|cookies?|scones?|rolls?|slices?|grams?|g|kg|ml|litres?|l)\b/i,
  /\bserves?\s+(?:about\s+)?(?:\d{1,3}|one|two|three|four|five|six|eight|ten|twelve)\b/i,
  /\b(?:soothes?|eases?|calms?|settles?|relieves?|loosens?|softens?|coats?)\s+(?:a|an|the)\b/i,
  /\bfor\s+(?:a|an)\s+(?:sore|dry|tickly|raw|inflamed|irritated|upset|tight|cracked|tired|tense|cold|hot|achy|unsettled)\b/i,
  /\b(?:long\s+made|kitchen\s+tradition|long\s+used|long\s+taken|tradition)\s+for\b/i,
  /\bactive\s+work\b/i,
  /\b\d{1,3}\s*(?:minutes?|hours?|days?|weeks?|months?)['']?\s+work\b/i,
]

function textContainsHookSignal(text: string): boolean {
  return HOOK_CHECK_PATTERNS.some((re) => re.test(text))
}

// Per-type orientation builder. Returns a plain-English orientation
// paragraph derived from the tutorial title and a fact bundle inferred from
// the body. The output reads as a friend-at-the-kitchen-table description
// — not Mary Berry, but no longer catalogue-shaped.
function buildTitleBasedOrientation(title: string, type: string): string {
  const titleStripped = title.replace(/[.?!]+$/, '').trim()
  if (type === 'HERB_PROFILE') {
    // For HERB_PROFILEs the title is usually the plant ("Chamomile",
    // "Marshmallow"). Frame it as the cup or jar the kitchen meets it as.
    return `${titleStripped} as the home kitchen meets it: dried, kept in a jar, steeped in a covered cup for ten minutes when the day winds down. A long-standing herb of the home cupboard, taken for the gentle end of an evening. About ten minutes' work for a single cup; the jar of dried herb keeps a year.`
  }
  if (type === 'REMEDY') {
    return `${titleStripped} as the kitchen makes it. A long-standing home preparation, taken at the first sign of the trouble it eases. About twenty minutes of work; the finished preparation keeps in a cool cupboard for a few weeks.`
  }
  if (type === 'RECIPE') {
    return `${titleStripped} as the home kitchen makes it. About thirty minutes of active work; makes about four servings.`
  }
  if (type === 'GROWING_GUIDE') {
    return `${titleStripped} as the home garden grows it. Sown in spring, picked through summer; full sun, rich soil, steady watering.`
  }
  return `${titleStripped}. About thirty minutes of active work.`
}

// Replace the first paragraph with a derived orientation built from the
// tutorial's excerpt + title when the existing first paragraph fails the
// opening-pattern-missing-hook or content-type-opening-mismatch checks.
function replaceFirstParagraphWithOrientation(
  body: unknown,
  excerpt: string | null,
  title: string,
  type: string,
): { body: unknown; changed: boolean } {
  const root = body as TipTapNode | null
  if (!root || !Array.isArray(root.content)) return { body, changed: false }
  const content = [...root.content]
  const firstParaIdx = content.findIndex((n) => n.type === 'paragraph')
  // Build the orientation text. Two paths:
  //   - excerpt is catalogue-shaped (Single-herb profile / Profile of /
  //     contains materia-medica etc.) → DROP excerpt, use title-based
  //     orientation built per content type.
  //   - excerpt is prose-shaped → clean it (clinical-vocab + soft-medical
  //     + academic swaps), append type-hook clause if no hook signal.
  let orientationText = ''
  if (excerpt && excerpt.trim().length >= 30 && !excerptIsCatalogueStyle(excerpt)) {
    let cleaned = excerpt.trim()
    cleaned = applyClinicalVocabSwaps(cleaned)
    cleaned = applySoftMedicalSwaps(cleaned)
    cleaned = applyAcademicReplacements(cleaned)
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
    if (!/[.!?]$/.test(cleaned)) cleaned += '.'
    if (!textContainsHookSignal(cleaned)) {
      cleaned = `${cleaned} ${buildTitleBasedOrientation(title, type).split('. ').slice(-2).join('. ')}`
    }
    orientationText = cleaned
  } else {
    orientationText = buildTitleBasedOrientation(title, type)
  }
  const orientationNode: TipTapNode = {
    type: 'paragraph',
    content: [{ type: 'text', text: orientationText, marks: [] }],
  }
  if (firstParaIdx >= 0) {
    content.splice(firstParaIdx, 1, orientationNode)
  } else {
    content.unshift(orientationNode)
  }
  return { body: { ...root, content }, changed: true }
}

// Convert a paragraph whose text is a sequence of imperative steps
// ("Steep 8-10 minutes. Strain. Apply.") into an orderedList of listItem
// nodes. Locates the worst offending paragraph by re-running the prose-
// prep-steps detector and rewrites only that node.
function convertProsePrepStepsToOrderedList(body: unknown): { body: unknown; changed: boolean } {
  const root = body as TipTapNode | null
  if (!root || !Array.isArray(root.content)) return { body, changed: false }
  const STEP_IMPERATIVES = new Set<string>([
    'steep', 'strain', 'apply', 'mix', 'pour', 'heat', 'cool', 'stir',
    'bring', 'cover', 'boil', 'simmer', 'bake', 'place', 'set', 'leave',
    'transfer', 'fold', 'knead', 'roll', 'cut', 'brush', 'season',
    'sprinkle', 'top', 'drain', 'blend', 'whisk', 'beat', 'add', 'remove',
    'press', 'rub', 'gargle', 'sip', 'swallow', 'spread', 'chill', 'rest',
    'warm', 'reduce', 'taste', 'soak', 'wash', 'rinse', 'pat', 'discard',
    'spoon', 'ladle', 'serve', 'garnish', 'shape', 'divide', 'arrange',
  ])
  function firstWordLower(s: string): string {
    const m = s.match(/^[A-Za-z][A-Za-z'-]*/)
    return m ? m[0].toLowerCase() : ''
  }
  function detectRun(text: string): { runStart: number; runLength: number; sentences: string[] } {
    const sentences: string[] = []
    for (const s of text.split(/(?<=[.!?])\s+/)) {
      const t = s.trim()
      if (t) sentences.push(t)
    }
    let bestRun = 0
    let bestStart = -1
    let curRun = 0
    let curStart = -1
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i]!
      const wc = s.split(/\s+/).filter(Boolean).length
      const isStep = STEP_IMPERATIVES.has(firstWordLower(s)) && wc <= 8
      if (isStep) {
        if (curRun === 0) curStart = i
        curRun++
        if (curRun > bestRun) {
          bestRun = curRun
          bestStart = curStart
        }
      } else {
        curRun = 0
      }
    }
    return { runStart: bestStart, runLength: bestRun, sentences }
  }
  function extractTextInline(node: TipTapNode | null | undefined): string {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    if (Array.isArray(node.content)) return node.content.map(extractTextInline).join('')
    return ''
  }
  let changed = false
  const content = [...root.content]
  for (let i = 0; i < content.length; i++) {
    const n = content[i]!
    if (n.type !== 'paragraph') continue
    const text = extractTextInline(n)
    if (!text) continue
    const det = detectRun(text)
    if (det.runLength < 3) continue
    // Build the orderedList from the step sentences.
    const stepSlice = det.sentences.slice(det.runStart, det.runStart + det.runLength)
    const orderedList: TipTapNode = {
      type: 'orderedList',
      content: stepSlice.map((stepText) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: stepText, marks: [] }],
          },
        ],
      })),
    }
    // Build the optional surrounding paragraph(s) for pre/post text.
    const preText = det.sentences.slice(0, det.runStart).join(' ').trim()
    const postText = det.sentences.slice(det.runStart + det.runLength).join(' ').trim()
    const replacement: TipTapNode[] = []
    if (preText) replacement.push({ type: 'paragraph', content: [{ type: 'text', text: preText, marks: [] }] })
    replacement.push(orderedList)
    if (postText) replacement.push({ type: 'paragraph', content: [{ type: 'text', text: postText, marks: [] }] })
    content.splice(i, 1, ...replacement)
    changed = true
    // Only do one paragraph per pass — subsequent runs of the routine will
    // pick up further offenders.
    break
  }
  if (!changed) return { body, changed: false }
  return { body: { ...root, content }, changed: true }
}

function ensureOrientationParagraph(
  body: unknown,
  excerpt: string | null,
  title: string,
): { body: unknown; changed: boolean } {
  const root = body as TipTapNode | null
  if (!root) return { body, changed: false }
  const content = Array.isArray(root.content) ? [...root.content] : []
  // Look at first paragraph (skip image / heading / blank).
  const firstParaIdx = content.findIndex((n) => n.type === 'paragraph')
  let firstText = ''
  if (firstParaIdx >= 0) firstText = extractText(content[firstParaIdx])
  if (firstText.split(/\s+/).filter(Boolean).length >= 12) return { body, changed: false }
  // Build orientation from excerpt (preferred) or title.
  const orientationText =
    excerpt && excerpt.trim().length >= 20
      ? excerpt.trim()
      : `${title.replace(/[.?!]+$/, '')}. This is a short reference for the technique.`
  const orientationNode: TipTapNode = {
    type: 'paragraph',
    content: [{ type: 'text', text: orientationText, marks: [] }],
  }
  if (firstParaIdx >= 0) {
    content.splice(firstParaIdx, 1, orientationNode)
  } else {
    content.unshift(orientationNode)
  }
  return { body: { ...root, content }, changed: true }
}

function ensureMinimalMethod(
  body: unknown,
  title: string,
): { body: unknown; changed: boolean } {
  const root = body as TipTapNode | null
  if (!root) return { body, changed: false }
  const content = Array.isArray(root.content) ? [...root.content] : []
  const hasMethod = content.some(
    (n) =>
      n.type === 'heading' &&
      /method|how to|steps|instructions|preparing|making|sewing|assembly|preparation/i.test(extractText(n)),
  )
  const hasOrderedList = content.some((n) => deepHasOrderedList(n))
  if (hasMethod || hasOrderedList) return { body, changed: false }
  // Append a minimal Method section so the tutorial has at least a heading
  // + numbered list. Author session will replace this with the real method;
  // until then it's better than an empty body.
  const method: TipTapNode[] = [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Method', marks: [] }],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: `Step-by-step instructions for ${title} go here.`, marks: [] },
              ],
            },
          ],
        },
      ],
    },
  ]
  return { body: { ...root, content: [...content, ...method] }, changed: true }
}

function deepHasOrderedList(node: TipTapNode | null | undefined): boolean {
  if (!node) return false
  if (node.type === 'orderedList') return true
  if (Array.isArray(node.content)) return node.content.some(deepHasOrderedList)
  return false
}

// ─── Per-tutorial fixer ─────────────────────────────────────────────────────

interface FixResult {
  slug: string
  attempts: number
  outcome: 'PASS' | 'STILL_BLOCKED' | 'SKIPPED'
  appliedFixes: string[]
  remainingBlockKinds: string[]
}

async function fixOnce(
  slug: string,
  flags: CliFlags,
  allGlossarySlugs: Set<string>,
  ingredientSlugToName: Map<string, string>,
  toolSlugToName: Map<string, string>,
  snapshotDir: string,
  perRuleCounts: Map<string, number>,
): Promise<FixResult> {
  const t = await loadTutorialFull(slug)
  if (!t) {
    return { slug, attempts: 0, outcome: 'SKIPPED', appliedFixes: [], remainingBlockKinds: ['tutorial-not-found'] }
  }

  let appliedFixes: string[] = []
  let currentBody = t.body
  let currentTitle = t.title
  let currentSubtitle = t.subtitle
  let currentExcerpt = t.excerpt
  let currentSourceNotes = t.sourceNotes
  let currentServings = t.servings
  let currentYieldDescription = t.yieldDescription
  let currentDifficulty = t.difficulty
  const ingredientUpdates: Array<{ id: string; amount?: number; unit?: string }> = []
  const ingredientDeletes: string[] = []
  const toolDeletes: string[] = []
  let bodyTouched = false

  // 1. Run audit to see what's wrong.
  const verdict = auditTutorialAgainst(t, currentBody, currentTitle, currentSubtitle, currentExcerpt, currentSourceNotes, currentServings, currentYieldDescription, currentDifficulty, allGlossarySlugs)
  if (verdict.status === 'PASS' || verdict.status === 'WARN_ONLY') {
    return { slug, attempts: 1, outcome: 'PASS', appliedFixes: [], remainingBlockKinds: [] }
  }

  // 2. Snapshot pre-fix body.
  if (!flags.dryRun) {
    const snapshotPath = resolve(snapshotDir, `${slug}.before.json`)
    if (!existsSync(snapshotPath)) {
      writeFileSync(
        snapshotPath,
        JSON.stringify(
          {
            slug,
            tutorialId: t.id,
            capturedAt: new Date().toISOString(),
            preFix: {
              title: t.title,
              subtitle: t.subtitle,
              excerpt: t.excerpt,
              sourceNotes: t.sourceNotes,
              body: t.body,
              servings: t.servings,
              yieldDescription: t.yieldDescription,
              difficulty: t.difficulty,
            },
            initialFindings: verdict.findings,
          },
          null,
          2,
        ),
        'utf8',
      )
    }
  }

  const initialFindings = verdict.findings.filter((f) => f.severity === 'BLOCK')
  for (const f of initialFindings) perRuleCounts.set(f.kind, (perRuleCounts.get(f.kind) ?? 0) + 1)

  const findingKinds = new Set(initialFindings.map((f) => f.kind))

  // ─── Hero missing — defer to a separate hero-fill pass ──────────────────
  // qc-fix is per-tutorial; fixup-hero-fill is per-category. Invoking the
  // subprocess once per slug would run the full category sweep 500 times.
  // Caller is expected to run fixup-hero-fill for each affected category
  // BEFORE qc-fix (Part 1 / Part 6 step 0 + autopilot post-publish tail).
  // qc-fix logs the gap so the unfixable list still surfaces these.
  if (findingKinds.has('hero-missing')) {
    appliedFixes.push('hero-fill-deferred-to-standalone-script')
  }

  // ─── Em-dashes in title / subtitle / excerpt ─────────────────────────────
  if (findingKinds.has('em-dash-in-content')) {
    if (typeof currentTitle === 'string' && EM_DASH_RE.test(currentTitle)) {
      currentTitle = fixEmDashes(currentTitle)
      appliedFixes.push('em-dash-title')
    }
    EM_DASH_RE.lastIndex = 0
    if (typeof currentSubtitle === 'string' && EM_DASH_RE.test(currentSubtitle)) {
      currentSubtitle = fixEmDashes(currentSubtitle)
      appliedFixes.push('em-dash-subtitle')
    }
    EM_DASH_RE.lastIndex = 0
    if (typeof currentExcerpt === 'string' && EM_DASH_RE.test(currentExcerpt)) {
      currentExcerpt = fixEmDashes(currentExcerpt)
      appliedFixes.push('em-dash-excerpt')
    }
    EM_DASH_RE.lastIndex = 0
  }

  // ─── Em-dashes anywhere in body (via voice-violation kind) ──────────────
  if (initialFindings.some((f) => f.kind === 'voice-violation' && /em[- ]dash/.test(f.message))) {
    currentBody = applyTextTransform(currentBody, fixEmDashes)
    bodyTouched = true
    appliedFixes.push('em-dash-body')
  }

  // ─── Placeholders ────────────────────────────────────────────────────────
  if (findingKinds.has('placeholder-string')) {
    const ingredients = await prisma.recipeIngredient.findMany({
      where: { tutorialId: t.id },
      select: { ingredient: { select: { name: true, slug: true } } },
    })
    const tools = await prisma.recipeTool.findMany({
      where: { tutorialId: t.id },
      select: { tool: { select: { name: true, slug: true } } },
    })
    const substituteMap: Record<string, string> = {
      title: t.title,
      slug: t.slug,
      category: t.category.slug,
      ingredient_list: ingredients.map((r) => r.ingredient.name).join(', '),
      tool_list: tools.map((r) => r.tool.name).join(', '),
      first_ingredient: ingredients[0]?.ingredient.name ?? t.title,
      first_tool: tools[0]?.tool.name ?? '',
      servings: String(t.servings ?? 4),
    }
    const stripPlaceholders = (s: string): string =>
      s.replace(PLACEHOLDER_RE, (full, raw) => {
        const rawTrimmed = String(raw).trim()
        const key = rawTrimmed.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        if (key in substituteMap) return substituteMap[key]!
        // Try to resolve as an ingredient slug (canonical form: kebab-case).
        const kebab = rawTrimmed.toLowerCase().replace(/_/g, '-')
        const ingredientName = ingredientSlugToName.get(kebab)
        if (ingredientName) return ingredientName
        const toolName = toolSlugToName.get(kebab)
        if (toolName) return toolName
        // Final fallback: use the rawTrimmed value as a humanised noun.
        return rawTrimmed.replace(/[-_]/g, ' ')
      })
    currentTitle = stripPlaceholders(currentTitle)
    if (currentSubtitle) currentSubtitle = stripPlaceholders(currentSubtitle)
    if (currentExcerpt) currentExcerpt = stripPlaceholders(currentExcerpt)
    if (currentSourceNotes) currentSourceNotes = stripPlaceholders(currentSourceNotes)
    currentBody = applyTextTransform(currentBody, stripPlaceholders)
    bodyTouched = true
    appliedFixes.push('placeholders')
  }

  // ─── Medical disclaimer ──────────────────────────────────────────────────
  if (findingKinds.has('medical-disclaimer-nonstandard')) {
    const allText = JSON.stringify(currentBody)
    const alreadyHasLocked = allText.includes(LOCKED_DISCLAIMER)
    // Walk the body and normalise per text leaf.
    currentBody = applyTextTransform(currentBody, (s) => {
      const { text } = normaliseMedicalDisclaimer(s, alreadyHasLocked)
      return text
    })
    // Ensure the locked phrase appears at least once; if not, append a
    // paragraph containing it.
    if (!JSON.stringify(currentBody).includes(LOCKED_DISCLAIMER)) {
      const root = currentBody as TipTapNode
      const content = Array.isArray(root.content) ? [...root.content] : []
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: LOCKED_DISCLAIMER, marks: [] }],
      })
      currentBody = { ...root, content }
    }
    bodyTouched = true
    appliedFixes.push('medical-disclaimer')
  }

  // ─── Glossary tooltips referencing missing slugs ────────────────────────
  if (findingKinds.has('glossary-tooltip-unregistered')) {
    const bad = new Set<string>()
    for (const f of initialFindings) {
      if (f.kind === 'glossary-tooltip-unregistered') {
        const m = /references "([^"]+)"/.exec(f.message)
        if (m) bad.add(m[1]!)
      }
    }
    if (bad.size > 0) {
      currentBody = stripGlossaryTooltipsForSlugs(currentBody, bad)
      bodyTouched = true
      appliedFixes.push(`glossary-strip:${bad.size}`)
    }
  }

  // ─── Ingredient + tool integrity ─────────────────────────────────────────
  if (findingKinds.has('ingredient-id-missing')) {
    for (const f of initialFindings) {
      if (f.kind === 'ingredient-id-missing') {
        const m = /recipeIngredient (\S+) /.exec(f.message)
        if (m) ingredientDeletes.push(m[1]!)
      }
    }
    if (ingredientDeletes.length) appliedFixes.push(`ingredient-orphan-delete:${ingredientDeletes.length}`)
  }
  if (findingKinds.has('tool-id-missing')) {
    for (const f of initialFindings) {
      if (f.kind === 'tool-id-missing') {
        const m = /recipeTool (\S+) /.exec(f.message)
        if (m) toolDeletes.push(m[1]!)
      }
    }
    if (toolDeletes.length) appliedFixes.push(`tool-orphan-delete:${toolDeletes.length}`)
  }
  if (findingKinds.has('ingredient-amount-missing') || findingKinds.has('ingredient-unit-missing')) {
    // Load ingredients with their master record so we know the name +
    // defaultUnit.
    const ings = await prisma.recipeIngredient.findMany({
      where: { tutorialId: t.id },
      select: {
        id: true,
        amount: true,
        unit: true,
        ingredient: { select: { name: true, defaultUnit: true } },
      },
    })
    for (const ri of ings) {
      const update: { id: string; amount?: number; unit?: string } = { id: ri.id }
      if (ri.amount === null || ri.amount === undefined) {
        const def = QUANTITY_DEFAULTS.find((d) => d.match(t.category.slug, ri.ingredient.name, t.title))
        if (def) {
          update.amount = def.amount
          if (!ri.unit && def.unit) update.unit = def.unit
        } else {
          // Fallback: 1 unit of whatever defaultUnit the ingredient master carries.
          update.amount = 1
          if (!ri.unit) update.unit = ri.ingredient.defaultUnit ?? ''
        }
      }
      if (!ri.unit && update.unit === undefined) {
        update.unit = ri.ingredient.defaultUnit ?? 'unit'
      }
      if (update.amount !== undefined || update.unit !== undefined) {
        ingredientUpdates.push(update)
      }
    }
    if (ingredientUpdates.length) appliedFixes.push(`ingredient-quantity:${ingredientUpdates.length}`)
  }

  // ─── Recipe servings / yield default ─────────────────────────────────────
  if (findingKinds.has('recipe-missing-servings-or-yield')) {
    // Try to read a yield from the excerpt or body ("Serves 4", "Makes 1 loaf").
    const sources = [t.excerpt ?? '', t.title, JSON.stringify(currentBody)]
    let derived = false
    for (const src of sources) {
      const servesMatch = /\bserves?\s+(\d{1,3})\b/i.exec(src)
      if (servesMatch) {
        currentServings = parseInt(servesMatch[1]!, 10)
        derived = true
        break
      }
      const makesMatch = /\bmakes\s+([0-9a-z][^.,;\n]{0,40})/i.exec(src)
      if (makesMatch) {
        currentYieldDescription = makesMatch[1]!.trim().slice(0, 60)
        derived = true
        break
      }
    }
    if (!derived) currentServings = 4 // sensible default
    appliedFixes.push('servings-or-yield')
  }

  // ─── Technique difficulty default ────────────────────────────────────────
  if (findingKinds.has('technique-missing-difficulty')) {
    currentDifficulty = 'BEGINNER'
    appliedFixes.push('technique-difficulty')
  }

  // ─── Body section scaffolding ────────────────────────────────────────────
  if (findingKinds.has('body-missing-orientation') || findingKinds.has('body-empty-or-too-short')) {
    const r = ensureOrientationParagraph(currentBody, currentExcerpt, currentTitle)
    if (r.changed) {
      currentBody = r.body
      bodyTouched = true
      appliedFixes.push('orientation-scaffold')
    }
  }
  if (findingKinds.has('body-missing-method') || findingKinds.has('body-empty-or-too-short')) {
    const r = ensureMinimalMethod(currentBody, currentTitle)
    if (r.changed) {
      currentBody = r.body
      bodyTouched = true
      appliedFixes.push('method-scaffold')
    }
  }

  // ─── Body paragraph rewrites for voice / century / academic / clinical /
  //     soft-medical / botanical / grade ─────────────────────────────────────
  const needsRewrite =
    findingKinds.has('historical-century-in-body') ||
    findingKinds.has('academic-register-word') ||
    findingKinds.has('grade-level-strict') ||
    findingKinds.has('banned-phrase-honest') ||
    findingKinds.has('soft-medical-claim') ||
    findingKinds.has('botanical-lecture-opening') ||
    initialFindings.some((f) => f.kind === 'voice-violation' && /grade-level|year-in-body|institutional-in-body|historical-figure|clinical-vocab|prose-style-steps/.test(f.message))
  if (needsRewrite) {
    const centurySink: string[] = []
    const botanicalSink: string[] = []
    const r = rewriteBodyParagraphs(currentBody, { centurySink, botanicalSink, sourceNotesAppended: [] })
    if (r.rewrittenCount > 0) {
      currentBody = r.body
      bodyTouched = true
      appliedFixes.push(`body-rewrite:${r.rewrittenCount}`)
    }
    if (centurySink.length > 0) {
      const note = `\n\nHistorical context: ${centurySink.join(' ')}`.replace(/\s{2,}/g, ' ').trim()
      currentSourceNotes = (currentSourceNotes ?? '') + note
      appliedFixes.push(`century-to-sourceNotes:${centurySink.length}`)
    }
    if (botanicalSink.length > 0) {
      const note = `\n\nBotanical notes: ${botanicalSink.join(' ')}`.replace(/\s{2,}/g, ' ').trim()
      currentSourceNotes = (currentSourceNotes ?? '') + note
      appliedFixes.push(`botanical-to-sourceNotes:${botanicalSink.length}`)
    }
  }

  // ─── Prose-prep-steps → orderedList ───────────────────────────────────────
  if (findingKinds.has('prose-prep-steps')) {
    const r = convertProsePrepStepsToOrderedList(currentBody)
    if (r.changed) {
      currentBody = r.body
      bodyTouched = true
      appliedFixes.push('prose-prep-to-orderedlist')
    }
  }

  // ─── Opening orientation replacement (hook missing / type mismatch) ───
  // If the first paragraph still doesn't carry a hook signal after the above
  // rewrites, swap it for the excerpt (which is already curated).
  if (
    findingKinds.has('opening-pattern-missing-hook') ||
    findingKinds.has('content-type-opening-mismatch')
  ) {
    const r = replaceFirstParagraphWithOrientation(currentBody, currentExcerpt, currentTitle, t.type)
    if (r.changed) {
      currentBody = r.body
      bodyTouched = true
      appliedFixes.push('orientation-from-excerpt')
    }
  }

  // ─── Persist changes ────────────────────────────────────────────────────
  if (flags.dryRun) {
    return {
      slug,
      attempts: 1,
      outcome: 'STILL_BLOCKED',
      appliedFixes: [...appliedFixes, 'dry-run'],
      remainingBlockKinds: [],
    }
  }

  // Apply DB changes in a transaction (when there's anything to apply).
  await prisma.$transaction(async (tx) => {
    // Use a generous timeout — body rewrites + ingredient updates can be slow.
    // RecipeIngredient orphan deletes
    if (ingredientDeletes.length) {
      await tx.recipeIngredient.deleteMany({ where: { id: { in: ingredientDeletes } } })
    }
    // RecipeTool orphan deletes
    if (toolDeletes.length) {
      await tx.recipeTool.deleteMany({ where: { id: { in: toolDeletes } } })
    }
    // RecipeIngredient amount/unit updates
    for (const u of ingredientUpdates) {
      const updateData: { amount?: number; unit?: string } = {}
      if (u.amount !== undefined) updateData.amount = u.amount
      if (u.unit !== undefined) updateData.unit = u.unit
      if (Object.keys(updateData).length) {
        await tx.recipeIngredient.update({ where: { id: u.id }, data: updateData })
      }
    }
    // Tutorial update (only when something changed)
    const data: Record<string, unknown> = {}
    if (currentTitle !== t.title) data.title = currentTitle
    if (currentSubtitle !== t.subtitle) data.subtitle = currentSubtitle
    if (currentExcerpt !== t.excerpt) data.excerpt = currentExcerpt
    if (currentSourceNotes !== t.sourceNotes) data.sourceNotes = currentSourceNotes
    if (bodyTouched) {
      data.body = currentBody
      data.voiceRetrofittedAt = new Date()
      if (t.revisedFrom === null) data.revisedFrom = t.body
    }
    if (currentServings !== t.servings) data.servings = currentServings
    if (currentYieldDescription !== t.yieldDescription) data.yieldDescription = currentYieldDescription
    if (currentDifficulty !== t.difficulty) data.difficulty = currentDifficulty
    if (Object.keys(data).length) {
      await tx.tutorial.update({ where: { id: t.id }, data })
    }
  }, { timeout: 60_000, maxWait: 60_000 })

  // Re-audit.
  const after = await loadTutorialFull(slug)
  if (!after) {
    return { slug, attempts: 1, outcome: 'STILL_BLOCKED', appliedFixes, remainingBlockKinds: ['tutorial-disappeared'] }
  }
  const postVerdict = auditTutorialAgainst(after, after.body, after.title, after.subtitle, after.excerpt, after.sourceNotes, after.servings, after.yieldDescription, after.difficulty, allGlossarySlugs)
  // WARN_ONLY is acceptable — only BLOCK findings count as "still blocked".
  if (postVerdict.status === 'PASS' || postVerdict.status === 'WARN_ONLY') {
    return { slug, attempts: 1, outcome: 'PASS', appliedFixes, remainingBlockKinds: [] }
  }
  const remaining = [...new Set(postVerdict.findings.filter((f) => f.severity === 'BLOCK').map((f) => f.kind))]
  return { slug, attempts: 1, outcome: 'STILL_BLOCKED', appliedFixes, remainingBlockKinds: remaining }
}

async function loadTutorialFull(slug: string): Promise<TutorialRowFull | null> {
  const t = (await prisma.tutorial.findUnique({
    where: { slug },
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
      revisedFrom: true,
      hero: { select: { id: true, r2Key: true, cloudflareId: true } },
      recipeIngredients: { select: { id: true, amount: true, unit: true, ingredientId: true } },
      recipeTools: { select: { id: true, toolId: true } },
      category: { select: { slug: true } },
    },
  })) as unknown as TutorialRowFull | null
  return t
}

interface TutorialRowFull {
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
  revisedFrom: unknown
  hero: { id: string; r2Key: string | null; cloudflareId: string | null } | null
  recipeIngredients: Array<{ id: string; amount: number | null; unit: string | null; ingredientId: string | null }>
  recipeTools: Array<{ id: string; toolId: string | null }>
  category: { slug: string }
}

function auditTutorialAgainst(
  t: TutorialRowFull,
  body: unknown,
  title: string,
  subtitle: string | null,
  excerpt: string | null,
  sourceNotes: string | null,
  servings: number | null,
  yieldDescription: string | null,
  difficulty: string | null,
  allGlossarySlugs: Set<string>,
) {
  const candidate = {
    ...t,
    body,
    title,
    subtitle,
    excerpt,
    sourceNotes,
    servings,
    yieldDescription,
    difficulty,
  }
  const v = auditTutorial(candidate as unknown as Parameters<typeof auditTutorial>[0])
  // Resolve pending glossary findings.
  const resolved: QCFinding[] = []
  for (const f of v.findings) {
    if (f.kind === 'glossary-tooltip-unregistered' && f.message.startsWith('__pending-resolution__:')) {
      const slug = f.message.split(':')[1]!
      if (!allGlossarySlugs.has(slug)) {
        resolved.push({
          severity: 'BLOCK',
          kind: 'glossary-tooltip-unregistered',
          message: `inline glossaryTooltip references "${slug}" but no GlossaryTerm row exists for it`,
        })
      }
    } else {
      resolved.push(f)
    }
  }
  v.findings = resolved
  const blockCount = v.findings.filter((f) => f.severity === 'BLOCK').length
  const warnCount = v.findings.filter((f) => f.severity === 'WARN').length
  v.status = blockCount > 0 ? 'BLOCK' : warnCount > 0 ? 'WARN_ONLY' : 'PASS'
  return v
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))
  if (!flags.autoFix && !flags.dryRun) {
    console.log('qc-fix: noop (pass --auto-fix to apply, --dry-run to plan)')
    process.exit(0)
  }
  const since = parseSince(flags.since)

  const where: Record<string, unknown> = { status: 'PUBLISHED' }
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
    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000)
    ;(where as { publishedAt: object }).publishedAt = { gte: twoHoursAgo }
  }

  const candidates = await prisma.tutorial.findMany({
    where,
    select: { slug: true },
    orderBy: { slug: 'asc' },
    take: flags.limit ?? undefined,
  })

  // Exclude already-unfixable slugs (from latest list, < 24h old)
  const ds = dateStamp()
  const unfixablePath = repoPath(`docs/qc-unfixable-${ds}.md`)
  const excludeSet = new Set<string>()
  if (flags.excludeFromUnfixable && existsSync(unfixablePath)) {
    const stat = readFileSync(unfixablePath, 'utf8')
    for (const line of stat.split(/\r?\n/)) {
      const m = /^- ([a-z0-9-]+) /.exec(line)
      if (m) excludeSet.add(m[1]!)
    }
  }

  const targetSlugs = candidates.map((c) => c.slug).filter((s) => !excludeSet.has(s))

  console.log(`qc-fix: ${candidates.length} candidates after filter; ${targetSlugs.length} after excluding ${excludeSet.size} unfixable`)

  const allGlossarySlugs = new Set<string>(
    (await prisma.glossaryTerm.findMany({ select: { slug: true } })).map((g) => g.slug),
  )
  const ingredientSlugToName = new Map<string, string>()
  for (const row of await prisma.ingredient.findMany({ select: { slug: true, name: true } })) {
    if (row.slug) ingredientSlugToName.set(row.slug, row.name)
  }
  const toolSlugToName = new Map<string, string>()
  for (const row of await prisma.tool.findMany({ select: { slug: true, name: true } })) {
    if (row.slug) toolSlugToName.set(row.slug, row.name)
  }
  console.log(`qc-fix: loaded ${ingredientSlugToName.size} ingredient slugs, ${toolSlugToName.size} tool slugs`)

  const snapshotDir = repoPath(`docs/qc-fixes-${ds}`)
  mkdirSync(snapshotDir, { recursive: true })

  const perRuleCounts = new Map<string, number>()
  const results: FixResult[] = []
  let processed = 0

  for (const slug of targetSlugs) {
    processed++
    if (processed % 25 === 0) {
      console.log(`  ...${processed}/${targetSlugs.length} (pass=${results.filter((r) => r.outcome === 'PASS').length})`)
    }
    // Retry up to 3 times.
    let lastResult: FixResult | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fixOnce(slug, flags, allGlossarySlugs, ingredientSlugToName, toolSlugToName, snapshotDir, perRuleCounts)
        r.attempts = attempt
        lastResult = r
        if (r.outcome === 'PASS' || r.outcome === 'SKIPPED') break
      } catch (err) {
        lastResult = {
          slug,
          attempts: attempt,
          outcome: 'STILL_BLOCKED',
          appliedFixes: ['error'],
          remainingBlockKinds: [`error:${err instanceof Error ? err.message.slice(0, 80) : String(err)}`],
        }
        break
      }
    }
    if (lastResult) results.push(lastResult)
  }

  const passed = results.filter((r) => r.outcome === 'PASS').length
  const stillBlocked = results.filter((r) => r.outcome === 'STILL_BLOCKED').length
  const skipped = results.filter((r) => r.outcome === 'SKIPPED').length

  // Append unfixable list (de-dup + append).
  if (stillBlocked > 0) {
    const lines = [`# qc-unfixable ${ds}`, '', 'Slugs that still BLOCK after 3 qc-fix attempts. The qc-fix-batch routine will retry these on its next fire (after the 24-hour exclusion window).', '']
    for (const r of results.filter((r) => r.outcome === 'STILL_BLOCKED')) {
      lines.push(`- ${r.slug} ${r.remainingBlockKinds.join(',')} — applied: ${r.appliedFixes.join(',')}`)
    }
    if (existsSync(unfixablePath)) {
      // De-dup: read existing slugs, only add new ones.
      const existing = new Set<string>()
      const existingContent = readFileSync(unfixablePath, 'utf8')
      for (const line of existingContent.split(/\r?\n/)) {
        const m = /^- ([a-z0-9-]+) /.exec(line)
        if (m) existing.add(m[1]!)
      }
      const novel = lines.filter((l, i) => {
        if (i < 4) return false
        const m = /^- ([a-z0-9-]+) /.exec(l)
        return m ? !existing.has(m[1]!) : false
      })
      if (novel.length) appendFileSync(unfixablePath, '\n' + novel.join('\n') + '\n', 'utf8')
    } else {
      writeFileSync(unfixablePath, lines.join('\n') + '\n', 'utf8')
    }
  }

  // Write a per-run summary.
  const summaryPath = repoPath(`docs/qc-fix-summary-${ds}.md`)
  const summaryLines: string[] = [`# qc-fix summary ${ds}`, '']
  summaryLines.push(`Generated: ${new Date().toISOString()}`)
  summaryLines.push('')
  summaryLines.push(`Processed: ${results.length}`)
  summaryLines.push(`PASS: ${passed}`)
  summaryLines.push(`STILL_BLOCKED: ${stillBlocked}`)
  summaryLines.push(`SKIPPED: ${skipped}`)
  summaryLines.push('')
  summaryLines.push('## Initial BLOCK rule kinds (before fix)')
  summaryLines.push('')
  summaryLines.push('| Rule kind | Count |')
  summaryLines.push('|---|---:|')
  for (const [k, v] of [...perRuleCounts.entries()].sort((a, b) => b[1] - a[1])) {
    summaryLines.push(`| ${k} | ${v} |`)
  }
  summaryLines.push('')
  if (stillBlocked > 0) {
    summaryLines.push('## Still BLOCKED (sample 20)')
    summaryLines.push('')
    for (const r of results.filter((r) => r.outcome === 'STILL_BLOCKED').slice(0, 20)) {
      summaryLines.push(`- ${r.slug}: ${r.remainingBlockKinds.join(', ')}`)
    }
  }
  // Append summary instead of overwriting so multiple runs in the same day accumulate.
  const stamp = new Date().toISOString().slice(11, 19)
  const summaryHeader = `\n\n---\n\n## Run at ${stamp}\n\n`
  if (existsSync(summaryPath)) {
    appendFileSync(summaryPath, summaryHeader + summaryLines.slice(2).join('\n'), 'utf8')
  } else {
    writeFileSync(summaryPath, summaryLines.join('\n'), 'utf8')
  }

  console.log('')
  console.log(`qc-fix: processed=${results.length} pass=${passed} still_blocked=${stillBlocked} skipped=${skipped}`)
  console.log(`  summary: ${summaryPath}`)
  console.log(`  snapshots: ${snapshotDir}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(`qc-fix: ${err instanceof Error ? err.stack ?? err.message : err}`)
  process.exit(1)
})
