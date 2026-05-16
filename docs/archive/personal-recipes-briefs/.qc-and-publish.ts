/**
 * .qc-and-publish.ts
 *
 * Full QC pass + publish for every personal recipe brief JSON.
 *
 * Run from packages/db/:
 *   tsx ../../docs/personal-recipes-briefs/.qc-and-publish.ts [--dry-run]
 *
 * What it does per brief:
 *   1. Parses the JSON.
 *   2. Applies deterministic auto-fixes (servings, temperatureCelsius,
 *      makeAheadNotes, freezable + freezeNotes, batchable + batchNotes,
 *      totalMinutes, cuisine corrections for obvious mismatches).
 *   3. Validates the full rubric (troubleshooter, variations, sources,
 *      ingredientsList, timing, scalable, cuisine/mealType/mood).
 *   4. Runs voice-check. Attempts auto-repair on blocking errors (em-dash pairs,
 *      banned phrases). If errors remain, flags for review.
 *   5. Writes the fixed JSON back to the brief file.
 *   6. Uploads with --status PUBLISHED.
 *   7. Logs every issue, fix, and outcome to a per-recipe record.
 *
 * Outputs:
 *   - Fixed JSON files (in-place updates on the brief files)
 *   - _qc-report.json  (machine-readable, per-recipe)
 *   - stdout summary
 */

import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BRIEFS_DIR = __dirname
const REPO_ROOT = resolve(__dirname, '..', '..')
const UPLOAD_SCRIPT = join(REPO_ROOT, 'packages', 'db', 'scripts', 'upload-tutorial.ts')
const VOICE_CHECK_SCRIPT = join(REPO_ROOT, 'packages', 'db', 'scripts', 'voice-check.ts')
const DB_DIR = join(REPO_ROOT, 'packages', 'db')
const TSX = join(DB_DIR, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.CMD' : 'tsx')

const DRY_RUN = process.argv.includes('--dry-run')

// ─── Types ───────────────────────────────────────────────────────────────────

interface IngredientItem {
  ingredientSlug: string
  amount?: number | null
  unit?: string | null
  prepNote?: string | null
  isOptional?: boolean
  groupLabel?: string | null
}

interface TutorialNode {
  type: string
  attrs?: Record<string, unknown>
  marks?: unknown[]
  content?: TutorialNode[]
  text?: string
}

interface TutorialDoc {
  type: 'doc'
  content: TutorialNode[]
}

interface RecipeMetadata {
  servings?: number | null
  yieldDescription?: string | null
  prepMinutes?: number | null
  cookMinutes?: number | null
  restingMinutes?: number | null
  chillingMinutes?: number | null
  totalMinutes?: number | null
  scalable?: boolean
  freezable?: boolean
  freezeNotes?: string | null
  batchable?: boolean
  batchNotes?: string | null
  makeAheadNotes?: string | null
  dietaryFlags?: string[]
  cuisine?: string | null
  mealType?: string | null
  mood?: string[]
  temperatureCelsius?: number | null
  temperatureNote?: string | null
  foundational?: boolean
}

interface Brief {
  slug: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  type?: string
  categorySlug: string
  subCategorySlug?: string | null
  difficulty?: string
  season?: string | null
  sourceType?: string
  sourceNotes?: string | null
  recipe?: RecipeMetadata | null
  recipeTools?: { slug: string; isOptional?: boolean; notes?: string | null }[]
  glossaryTerms?: { slug: string; term: string; definition: string }[]
  body: TutorialDoc
}

interface RubricIssue {
  category: 'schema' | 'metadata' | 'body' | 'voice' | 'coherence' | 'ingredients'
  severity: 'error' | 'warn' | 'info'
  field: string
  message: string
}

interface Fix {
  field: string
  oldValue: unknown
  newValue: unknown
  note: string
}

interface RecipeOutcome {
  slug: string
  title: string
  briefFile: string
  issues: RubricIssue[]
  fixes: Fix[]
  voiceCheckResult: 'clean' | 'warnings' | 'errors' | 'unknown'
  voiceWarnings: string[]
  voiceErrors: string[]
  uploadStatus: 'published' | 'failed' | 'flagged-for-review' | 'skipped-dry-run'
  uploadMessage: string
  tutorialId?: string
}

// ─── Body traversal helpers ───────────────────────────────────────────────────

function* walkNodes(node: TutorialNode): Generator<TutorialNode> {
  yield node
  for (const child of node.content ?? []) {
    yield* walkNodes(child)
  }
}

function extractAllTexts(doc: TutorialDoc): string[] {
  const texts: string[] = []
  for (const node of walkNodes({ type: 'doc', content: doc.content })) {
    if (node.type === 'text' && node.text) texts.push(node.text)
  }
  return texts
}

function getHeadingText(node: TutorialNode): string {
  return (node.content ?? []).map((n) => n.text ?? '').join('')
}

/** Returns all top-level nodes that follow an H2 with the given text until the
 *  next H2 (or end of doc). */
function getSectionContent(doc: TutorialDoc, headingText: string): TutorialNode[] {
  const result: TutorialNode[] = []
  let inSection = false
  for (const node of doc.content) {
    if (node.type === 'heading' && (node.attrs?.level as number) === 2) {
      const h = getHeadingText(node).toLowerCase()
      if (h.includes(headingText.toLowerCase())) {
        inSection = true
        continue
      }
      if (inSection) break
    }
    if (inSection) result.push(node)
  }
  return result
}

function nodeToPlainText(node: TutorialNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(nodeToPlainText).join('')
}

// ─── Temperature extraction ───────────────────────────────────────────────────

/** Scans body text for oven-temperature patterns and returns the first C value found. */
function extractTemperatureCelsius(doc: TutorialDoc): number | null {
  // Patterns to find temperatures like:
  //   "180C / 350F / Gas 4"
  //   "200°C"
  //   "Preheat to 180C"
  //   "oven to 180 degrees C"
  //   "180 C"
  const TEMP_RX = /\b(1[4-9]\d|2[0-9]\d)\s*(?:°\s*[Cc]|[Cc](?:\s|\/|,|\.|\b))/g
  for (const text of extractAllTexts(doc)) {
    const m = TEMP_RX.exec(text)
    if (m) return parseInt(m[1], 10)
  }
  return null
}

// ─── Make-ahead / freeze extraction ──────────────────────────────────────────

/** Extracts first sentence of the "Make ahead" section as makeAheadNotes. */
function extractMakeAheadNotes(doc: TutorialDoc): string | null {
  const section = getSectionContent(doc, 'Make ahead')
  for (const node of section) {
    const text = nodeToPlainText(node).trim()
    if (text.length > 5) {
      // Take first sentence only
      const firstSentence = text.split(/(?<=[.!?])\s+/)[0]
      return firstSentence
    }
  }
  return null
}

/** Returns freeze info if the make-ahead section explicitly says it freezes. */
function extractFreezeInfo(doc: TutorialDoc): { freezable: boolean; freezeNotes: string | null } {
  const section = getSectionContent(doc, 'Make ahead')
  const text = section.map(nodeToPlainText).join(' ').toLowerCase()

  // Positive signals: explicitly says it can be frozen
  const FREEZE_POSITIVE = [
    /freezes well/,
    /can be frozen/,
    /freeze well/,
    /freeze\s+for\s+up\s+to/,
    /suitable for freezing/,
    /freezer-friendly/,
  ]

  for (const rx of FREEZE_POSITIVE) {
    if (rx.test(text)) {
      // Extract the freeze-related sentence
      const fullText = section.map(nodeToPlainText).join(' ')
      const sentences = fullText.split(/(?<=[.!?])\s+/)
      const freezeSentence = sentences.find((s) =>
        /freeze|freezer|frozen/i.test(s)
      )
      return {
        freezable: true,
        freezeNotes: freezeSentence ? freezeSentence.trim() : 'Freezes well. Cool completely, then freeze in airtight containers.',
      }
    }
  }

  return { freezable: false, freezeNotes: null }
}

// ─── Servings extraction ──────────────────────────────────────────────────────

function extractDefaultServings(doc: TutorialDoc): number | null {
  for (const node of walkNodes({ type: 'doc', content: doc.content })) {
    if (node.type === 'ingredientsList' && node.attrs?.defaultServings) {
      const v = node.attrs.defaultServings
      if (typeof v === 'number' && v > 0) return v
    }
  }
  return null
}

// ─── Rubric checks ────────────────────────────────────────────────────────────

function checkRubric(brief: Brief): RubricIssue[] {
  const issues: RubricIssue[] = []
  const r = brief.recipe

  // ── type ──────────────────────────────────────────────────────────────────
  if (brief.type !== 'RECIPE') {
    issues.push({
      category: 'schema',
      severity: 'error',
      field: 'type',
      message: `type is "${brief.type}" but should be "RECIPE"`,
    })
  }

  // ── servings / yieldDescription ───────────────────────────────────────────
  if (r && r.servings == null && r.yieldDescription == null) {
    issues.push({
      category: 'metadata',
      severity: 'warn',
      field: 'servings',
      message: 'Neither servings nor yieldDescription is set; scale selector will have no default.',
    })
  }
  if (r && r.servings != null && r.yieldDescription != null) {
    issues.push({
      category: 'metadata',
      severity: 'error',
      field: 'servings',
      message: 'Both servings and yieldDescription are set; only one should be set.',
    })
  }

  // ── times ─────────────────────────────────────────────────────────────────
  if (r) {
    const prep = r.prepMinutes ?? 0
    const cook = r.cookMinutes ?? 0
    const rest = r.restingMinutes ?? 0
    const chill = r.chillingMinutes ?? 0
    const computed = prep + cook + rest + chill
    if (r.totalMinutes != null && computed > 0 && Math.abs((r.totalMinutes ?? 0) - computed) > 2) {
      issues.push({
        category: 'metadata',
        severity: 'warn',
        field: 'totalMinutes',
        message: `totalMinutes (${r.totalMinutes}) differs from prep+cook+rest+chill (${computed}).`,
      })
    }
  }

  // ── cuisine / mealType / mood ─────────────────────────────────────────────
  if (r && !r.cuisine) {
    issues.push({ category: 'metadata', severity: 'warn', field: 'cuisine', message: 'cuisine is not set.' })
  }
  if (r && !r.mealType) {
    issues.push({ category: 'metadata', severity: 'warn', field: 'mealType', message: 'mealType is not set.' })
  }
  if (r && (!r.mood || r.mood.length === 0)) {
    issues.push({ category: 'metadata', severity: 'warn', field: 'mood', message: 'mood is empty.' })
  }

  // ── scalable ──────────────────────────────────────────────────────────────
  if (r && r.scalable === false) {
    issues.push({
      category: 'metadata',
      severity: 'warn',
      field: 'scalable',
      message: 'scalable=false on a cooking recipe — only correct if the recipe is percentage-tuned.',
    })
  }

  // ── freezable notes consistency ───────────────────────────────────────────
  if (r && r.freezable === true && !r.freezeNotes) {
    issues.push({
      category: 'metadata',
      severity: 'warn',
      field: 'freezeNotes',
      message: 'freezable=true but freezeNotes is not set.',
    })
  }
  if (r && r.batchable === true && !r.batchNotes) {
    issues.push({
      category: 'metadata',
      severity: 'warn',
      field: 'batchNotes',
      message: 'batchable=true but batchNotes is not set.',
    })
  }

  // ── temperatureCelsius ────────────────────────────────────────────────────
  if (r && r.temperatureCelsius == null) {
    // Check if there's an oven in the tools
    const usesOven = (brief.recipeTools ?? []).some((t) => t.slug === 'oven')
    if (usesOven) {
      issues.push({
        category: 'metadata',
        severity: 'warn',
        field: 'temperatureCelsius',
        message: 'oven is in recipeTools but temperatureCelsius is not set.',
      })
    }
  }

  // ── body structure ────────────────────────────────────────────────────────
  const bodyContent = brief.body.content

  // ingredientsList
  const hasIngredientsList = bodyContent.some((n) => n.type === 'ingredientsList')
  if (!hasIngredientsList) {
    issues.push({
      category: 'body',
      severity: 'error',
      field: 'body.ingredientsList',
      message: 'No ingredientsList block found in body.',
    })
  }

  // troubleshooter
  const hasTroubleshooter = bodyContent.some((n) => n.type === 'troubleshooter')
  if (!hasTroubleshooter) {
    issues.push({
      category: 'body',
      severity: 'warn',
      field: 'body.troubleshooter',
      message: 'No troubleshooter block found.',
    })
  }

  // variations section
  const hasVariations = bodyContent.some(
    (n) =>
      n.type === 'heading' &&
      getHeadingText(n).toLowerCase().includes('variation'),
  )
  if (!hasVariations) {
    issues.push({
      category: 'body',
      severity: 'warn',
      field: 'body.variations',
      message: 'No "Variations" heading found in body.',
    })
  }

  // make-ahead section
  const hasMakeAhead = bodyContent.some(
    (n) =>
      n.type === 'heading' &&
      getHeadingText(n).toLowerCase().includes('make ahead'),
  )
  if (!hasMakeAhead) {
    issues.push({
      category: 'body',
      severity: 'warn',
      field: 'body.makeAhead',
      message: 'No "Make ahead" heading found in body.',
    })
  }

  // where-this-dish-lives section
  const hasWhere = bodyContent.some(
    (n) =>
      n.type === 'heading' &&
      getHeadingText(n).toLowerCase().includes('where this dish'),
  )
  if (!hasWhere) {
    issues.push({
      category: 'body',
      severity: 'info',
      field: 'body.whereThisDishLives',
      message: 'No "Where this dish lives" section.',
    })
  }

  // sources / provenance: either sourceNotes or a sources section in body
  if (!brief.sourceNotes && !brief.sourceType) {
    issues.push({
      category: 'body',
      severity: 'warn',
      field: 'sourceNotes',
      message: 'No sourceNotes and no sourceType set.',
    })
  }

  // glossary coverage: if glossaryTerms exist, check each slug appears as a glossaryTooltip mark
  const terms = brief.glossaryTerms ?? []
  if (terms.length > 0) {
    const usedSlugs = new Set<string>()
    for (const node of walkNodes({ type: 'doc', content: brief.body.content })) {
      for (const mark of node.marks ?? []) {
        const m = mark as { type: string; attrs?: { termSlug?: string } }
        if (m.type === 'glossaryTooltip' && m.attrs?.termSlug) {
          usedSlugs.add(m.attrs.termSlug)
        }
      }
    }
    for (const term of terms) {
      if (!usedSlugs.has(term.slug)) {
        issues.push({
          category: 'body',
          severity: 'error',
          field: `glossaryTerms[${term.slug}]`,
          message: `Glossary term "${term.slug}" registered but not used inline as a glossaryTooltip mark.`,
        })
      }
    }
    for (const slug of usedSlugs) {
      if (!terms.find((t) => t.slug === slug)) {
        issues.push({
          category: 'body',
          severity: 'error',
          field: `body.glossaryTooltip[${slug}]`,
          message: `Inline glossaryTooltip "${slug}" not registered in glossaryTerms[].`,
        })
      }
    }
  }

  // coherence: title should appear meaningfully in excerpt or body
  if (brief.title && brief.excerpt) {
    const titleWords = brief.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const excerptLower = brief.excerpt.toLowerCase()
    const bodyFirstPara = nodeToPlainText(bodyContent[0] ?? { type: 'paragraph' }).toLowerCase()
    const matchedWords = titleWords.filter(
      (w) => excerptLower.includes(w) || bodyFirstPara.includes(w),
    )
    if (titleWords.length > 1 && matchedWords.length === 0) {
      issues.push({
        category: 'coherence',
        severity: 'warn',
        field: 'title',
        message: `Title words not found in excerpt or first paragraph — possible coherence issue.`,
      })
    }
  }

  return issues
}

// ─── Cuisine corrections ──────────────────────────────────────────────────────

/** Known cuisine misclassifications: slug → correct cuisine. */
const CUISINE_CORRECTIONS: Record<string, string> = {
  'chicken-katsu-curry': 'japanese',
  'chicken-gyoza': 'japanese',
  'beef-stir-fry': 'chinese',
  'crispy-beef-with-broccoli': 'chinese',
  'chicken-korma': 'indian',
}

/** Title-keyword to cuisine mapping (checked when cuisine looks wrong). */
const TITLE_CUISINE_HINTS: { keywords: string[]; cuisine: string }[] = [
  { keywords: ['katsu', 'gyoza', 'yakitori', 'ramen', 'miso', 'teriyaki', 'sushi', 'tempura'], cuisine: 'japanese' },
  { keywords: ['korma', 'tikka', 'masala', 'biryani', 'daal', 'dhal', 'dal', 'samosa', 'naan', 'chapati', 'raita'], cuisine: 'indian' },
  { keywords: ['tagine', 'harissa', 'chermoula'], cuisine: 'mediterranean' },
  { keywords: ['quesadilla', 'enchilada', 'burrito', 'taco', 'salsa verde', 'guacamole', 'fajita'], cuisine: 'mexican' },
  { keywords: ['paella', 'gazpacho', 'patatas'], cuisine: 'mediterranean' },
  { keywords: ['pho', 'banh mi', 'bun bo'], cuisine: 'japanese' }, // simplified
  { keywords: ['dim sum', 'char siu', 'fried rice', 'chow mein', 'kung pao', 'spring roll', 'wonton'], cuisine: 'chinese' },
]

function detectCuisineMismatch(brief: Brief): string | null {
  const r = brief.recipe
  if (!r?.cuisine) return null

  const titleLower = brief.title.toLowerCase()
  const slugLower = brief.slug.toLowerCase()

  // Explicit slug-level override
  if (CUISINE_CORRECTIONS[brief.slug]) {
    if (r.cuisine !== CUISINE_CORRECTIONS[brief.slug]) {
      return CUISINE_CORRECTIONS[brief.slug]
    }
    return null
  }

  // Title keyword detection
  for (const { keywords, cuisine } of TITLE_CUISINE_HINTS) {
    if (keywords.some((k) => titleLower.includes(k) || slugLower.includes(k))) {
      if (r.cuisine !== cuisine) {
        return cuisine
      }
    }
  }

  return null
}

// ─── Voice-check auto-repair ──────────────────────────────────────────────────

/** Attempts to auto-repair common blocking voice-check errors in a JSON string. */
function autoRepairVoice(jsonStr: string): string {
  let repaired = jsonStr

  // Remove banned phrases (replace with neutral equivalents)
  const PHRASE_REPLACEMENTS: [RegExp, string][] = [
    [/\bhonestly\b/gi, 'in practice'],
    [/\bto be honest\b/gi, 'in practice'],
    [/\bi'll be honest\b/gi, ''],
    [/\bhonest\b/gi, 'reliable'],
    [/\bfrankly\b/gi, 'in practice'],
    [/\btruthfully\b/gi, ''],
    [/\bgenuinely\b/gi, ''],
    [/\bdelving into\b/gi, 'covering'],
    [/\bdelve into\b/gi, 'cover'],
    [/\bat its core\b/gi, 'at heart'],
    [/\bin the realm of\b/gi, 'in'],
    [/\bin the world of\b/gi, 'in'],
    [/\ba testament to\b/gi, 'evidence of'],
    [/\ba beacon of\b/gi, 'an example of'],
    [/\bit's worth noting that\b/gi, ''],
    [/\bit's important to note\b/gi, ''],
    [/\bit's important to remember\b/gi, ''],
    [/\bat the end of the day\b/gi, 'in practice'],
    [/\bgame-changer\b/gi, 'a real improvement'],
    [/\bgame-changing\b/gi, 'significant'],
    [/\btreasure trove\b/gi, 'collection'],
    [/\bcrucial role\b/gi, 'important role'],
    [/\bplays a crucial role\b/gi, 'matters significantly'],
    [/\bvibes?\b/gi, 'feel'],
    [/\bessentially\b/gi, ''],
    [/\bfundamentally\b/gi, ''],
    [/\bultimately\b/gi, ''],
    // Banned openers (at sentence start)
    [/(?<=^|[.!?]\s+)in conclusion[,:\s]/gi, ''],
    [/(?<=^|[.!?]\s+)furthermore[,:\s]/gi, 'Also,'],
    [/(?<=^|[.!?]\s+)moreover[,:\s]/gi, 'Also,'],
    [/(?<=^|[.!?]\s+)additionally[,:\s]/gi, 'Also,'],
    [/(?<=^|[.!?]\s+)with that said[,:\s]/gi, ''],
    [/(?<=^|[.!?]\s+)let's dive in[.!]?/gi, ''],
    [/(?<=^|[.!?]\s+)let's explore[,\s]/gi, ''],
    // Wrap-up phrases
    [/happy baking[!.]?/gi, ''],
    [/happy cooking[!.]?/gi, ''],
    [/happy growing[!.]?/gi, ''],
    [/enjoy your journey[!.]?/gi, ''],
  ]

  for (const [rx, replacement] of PHRASE_REPLACEMENTS) {
    repaired = repaired.replace(rx, replacement)
  }

  // Fix appositive em-dash pairs: "text — clause — text" → "text (clause) text"
  // This regex matches " — text — " in a way that won't hit single em-dashes.
  repaired = repaired.replace(
    /([^—\n]{5,}) — ([^—\n]{3,50}) — /g,
    (_, before, middle) => `${before} (${middle.trim()}) `,
  )

  return repaired
}

// ─── Voice-check runner ───────────────────────────────────────────────────────

function runVoiceCheck(filePath: string): { exitCode: number; warnings: string[]; errors: string[] } {
  const result = spawnSync(
    TSX,
    [VOICE_CHECK_SCRIPT, filePath],
    { cwd: DB_DIR, encoding: 'utf8', shell: process.platform === 'win32', timeout: 60_000 },
  )
  const combined = (result.stdout ?? '') + (result.stderr ?? '')
  const warnings: string[] = []
  const errors: string[] = []
  for (const line of combined.split(/\r?\n/)) {
    const w = line.match(/WARN\s+([\w-]+):\s+(.+)$/)
    if (w) warnings.push(`${w[1]}: ${w[2]}`)
    const e = line.match(/ERROR\s+([\w-]+):\s+(.+)$/)
    if (e) errors.push(`${e[1]}: ${e[2]}`)
  }
  return { exitCode: result.status ?? -1, warnings, errors }
}

// ─── Upload runner ────────────────────────────────────────────────────────────

function uploadBrief(filePath: string, dryRun: boolean): { success: boolean; message: string; tutorialId?: string } {
  if (dryRun) return { success: true, message: 'DRY-RUN (not uploaded)' }

  const args = [UPLOAD_SCRIPT, filePath, '--status', 'PUBLISHED']
  const result = spawnSync(
    TSX,
    args,
    { cwd: DB_DIR, encoding: 'utf8', shell: process.platform === 'win32', timeout: 180_000 },
  )
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  const combined = stdout + stderr
  const success = result.status === 0
  const tutorialMatch = stdout.match(/Tutorial id:\s+(\S+)/)
  const message = success
    ? (stdout.match(/\[upload-tutorial\] (CREATED|UPDATED)/)?.[1] ?? 'OK')
    : (stderr || stdout).slice(0, 500)
  return { success, message, tutorialId: tutorialMatch?.[1] }
}

// ─── Main loop ────────────────────────────────────────────────────────────────

const briefFiles = readdirSync(BRIEFS_DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.'))
  .sort()

console.log(`${DRY_RUN ? '[DRY-RUN] ' : ''}Processing ${briefFiles.length} briefs...\n`)

const outcomes: RecipeOutcome[] = []
let publishedCount = 0
let flaggedCount = 0
let failedCount = 0
const masterListAdditions: string[] = [] // track if we needed any new slugs

const startMs = Date.now()

for (const f of briefFiles) {
  const filePath = join(BRIEFS_DIR, f)
  let raw = readFileSync(filePath, 'utf8')
  let brief: Brief

  try {
    brief = JSON.parse(raw) as Brief
  } catch (err) {
    outcomes.push({
      slug: f.replace('.json', ''),
      title: '(parse error)',
      briefFile: f,
      issues: [{ category: 'schema', severity: 'error', field: 'json', message: `JSON parse failed: ${err}` }],
      fixes: [],
      voiceCheckResult: 'unknown',
      voiceWarnings: [],
      voiceErrors: [],
      uploadStatus: 'flagged-for-review',
      uploadMessage: 'JSON parse failed',
    })
    failedCount++
    console.log(`  PARSE-ERROR  ${f}`)
    continue
  }

  const issues: RubricIssue[] = []
  const fixes: Fix[] = []

  // ── Auto-fix: servings ────────────────────────────────────────────────────
  const r = brief.recipe
  if (r && r.servings == null && r.yieldDescription == null) {
    const defaultServings = extractDefaultServings(brief.body)
    if (defaultServings != null) {
      fixes.push({
        field: 'recipe.servings',
        oldValue: null,
        newValue: defaultServings,
        note: `Extracted from ingredientsList.defaultServings (${defaultServings})`,
      })
      r.servings = defaultServings
    }
  }

  // ── Auto-fix: totalMinutes ────────────────────────────────────────────────
  if (r) {
    const prep = r.prepMinutes ?? 0
    const cook = r.cookMinutes ?? 0
    const rest = r.restingMinutes ?? 0
    const chill = r.chillingMinutes ?? 0
    const computed = prep + cook + rest + chill
    if (computed > 0 && (r.totalMinutes == null || Math.abs((r.totalMinutes ?? 0) - computed) > 2)) {
      fixes.push({
        field: 'recipe.totalMinutes',
        oldValue: r.totalMinutes,
        newValue: computed,
        note: `Computed from prep(${prep})+cook(${cook})+rest(${rest})+chill(${chill})`,
      })
      r.totalMinutes = computed
    }
  }

  // ── Auto-fix: temperatureCelsius ──────────────────────────────────────────
  if (r && r.temperatureCelsius == null) {
    const usesOven = (brief.recipeTools ?? []).some((t) => t.slug === 'oven')
    if (usesOven) {
      const temp = extractTemperatureCelsius(brief.body)
      if (temp != null) {
        fixes.push({
          field: 'recipe.temperatureCelsius',
          oldValue: null,
          newValue: temp,
          note: `Extracted from method text`,
        })
        r.temperatureCelsius = temp
      }
    }
  }

  // ── Auto-fix: makeAheadNotes ──────────────────────────────────────────────
  if (r && r.makeAheadNotes == null) {
    const notes = extractMakeAheadNotes(brief.body)
    if (notes) {
      fixes.push({
        field: 'recipe.makeAheadNotes',
        oldValue: null,
        newValue: notes,
        note: 'Extracted from "Make ahead" section in body',
      })
      r.makeAheadNotes = notes
    }
  }

  // ── Auto-fix: freezable + freezeNotes ────────────────────────────────────
  if (r && !r.freezable) {
    const { freezable, freezeNotes } = extractFreezeInfo(brief.body)
    if (freezable) {
      fixes.push({
        field: 'recipe.freezable',
        oldValue: false,
        newValue: true,
        note: 'Body "Make ahead" section explicitly states freezable',
      })
      fixes.push({
        field: 'recipe.freezeNotes',
        oldValue: null,
        newValue: freezeNotes,
        note: 'Extracted from "Make ahead" section',
      })
      r.freezable = true
      r.freezeNotes = freezeNotes
    }
  }

  // ── Auto-fix: cuisine misclassification ───────────────────────────────────
  const correctCuisine = detectCuisineMismatch(brief)
  if (correctCuisine && r) {
    fixes.push({
      field: 'recipe.cuisine',
      oldValue: r.cuisine,
      newValue: correctCuisine,
      note: 'Detected cuisine mismatch from title keywords',
    })
    r.cuisine = correctCuisine
  }

  // ── Run rubric checks ─────────────────────────────────────────────────────
  issues.push(...checkRubric(brief))

  // ── Write fixed JSON back ─────────────────────────────────────────────────
  if (fixes.length > 0 || true) { // always write back (normalises formatting)
    raw = JSON.stringify(brief, null, 2)
    if (!DRY_RUN) {
      writeFileSync(filePath, raw)
    }
  }

  // ── Voice-check ───────────────────────────────────────────────────────────
  let vc = runVoiceCheck(filePath)
  let vcResult: RecipeOutcome['voiceCheckResult'] = 'unknown'
  let repairAttempted = false

  if (vc.exitCode === 0) {
    vcResult = vc.warnings.length > 0 ? 'warnings' : 'clean'
  } else if (vc.exitCode === 1) {
    vcResult = 'warnings'
  } else if (vc.exitCode === 2) {
    // Try auto-repair
    const repairedRaw = autoRepairVoice(raw)
    if (repairedRaw !== raw && !DRY_RUN) {
      writeFileSync(filePath, repairedRaw)
    }
    // Re-run voice-check
    vc = runVoiceCheck(filePath)
    repairAttempted = true
    if (vc.exitCode === 0 || vc.exitCode === 1) {
      vcResult = vc.warnings.length > 0 ? 'warnings' : 'clean'
      fixes.push({
        field: 'body (voice)',
        oldValue: 'had voice errors',
        newValue: 'auto-repaired',
        note: `Voice errors auto-repaired. Errors were: ${vc.errors.slice(0, 3).join('; ')}`,
      })
    } else {
      vcResult = 'errors'
    }
  }

  // ── Decide publish vs flag ────────────────────────────────────────────────
  const hasBlockingRubricErrors = issues.some((i) => i.severity === 'error')
  const shouldFlag = vcResult === 'errors' || hasBlockingRubricErrors

  let uploadStatus: RecipeOutcome['uploadStatus']
  let uploadMessage = ''
  let tutorialId: string | undefined

  if (shouldFlag) {
    uploadStatus = 'flagged-for-review'
    uploadMessage = vcResult === 'errors'
      ? `Voice check errors remain after auto-repair: ${vc.errors.join('; ')}`
      : `Blocking rubric errors: ${issues.filter((i) => i.severity === 'error').map((i) => i.message).join('; ')}`
    flaggedCount++
  } else {
    const upload = uploadBrief(filePath, DRY_RUN)
    if (upload.success) {
      uploadStatus = DRY_RUN ? 'skipped-dry-run' : 'published'
      uploadMessage = upload.message
      tutorialId = upload.tutorialId
      publishedCount++
    } else {
      uploadStatus = 'failed'
      uploadMessage = upload.message
      failedCount++
    }
  }

  const outcome: RecipeOutcome = {
    slug: brief.slug,
    title: brief.title,
    briefFile: f,
    issues,
    fixes,
    voiceCheckResult: vcResult,
    voiceWarnings: vc.warnings,
    voiceErrors: vc.errors,
    uploadStatus,
    uploadMessage,
    tutorialId,
  }
  outcomes.push(outcome)

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(0)
  const statusMark = uploadStatus === 'published' ? 'PUB' : uploadStatus === 'flagged-for-review' ? 'FLAG' : uploadStatus === 'failed' ? 'FAIL' : 'DRY'
  const fixStr = fixes.length > 0 ? ` (${fixes.length} fix${fixes.length > 1 ? 'es' : ''})` : ''
  const warnStr = vc.warnings.length > 0 ? ` [${vc.warnings.length} vc-warn]` : ''
  console.log(`  [${outcomes.length}/${briefFiles.length}] (${elapsed}s) ${statusMark}  ${brief.slug}${fixStr}${warnStr}`)
}

// ─── Write machine-readable report ───────────────────────────────────────────

const reportPath = join(BRIEFS_DIR, '_qc-report.json')
writeFileSync(reportPath, JSON.stringify(outcomes, null, 2))

// ─── Summary ─────────────────────────────────────────────────────────────────

const totalTime = ((Date.now() - startMs) / 1000).toFixed(0)
const totalFixes = outcomes.reduce((sum, o) => sum + o.fixes.length, 0)
const vcWarningRecipes = outcomes.filter((o) => o.voiceWarnings.length > 0).length
const cuisineFixes = outcomes.filter((o) => o.fixes.some((f) => f.field === 'recipe.cuisine')).length
const servingsFixes = outcomes.filter((o) => o.fixes.some((f) => f.field === 'recipe.servings')).length
const tempFixes = outcomes.filter((o) => o.fixes.some((f) => f.field === 'recipe.temperatureCelsius')).length
const makeAheadFixes = outcomes.filter((o) => o.fixes.some((f) => f.field === 'recipe.makeAheadNotes')).length
const freezeFixes = outcomes.filter((o) => o.fixes.some((f) => f.field === 'recipe.freezable')).length

console.log(`\n${'─'.repeat(60)}`)
console.log(`Done in ${totalTime}s`)
console.log(`  Processed:   ${briefFiles.length}`)
console.log(`  Published:   ${publishedCount}`)
console.log(`  Flagged:     ${flaggedCount}`)
console.log(`  Failed:      ${failedCount}`)
console.log(`  Total fixes: ${totalFixes}`)
console.log(`    servings:           ${servingsFixes}`)
console.log(`    temperatureCelsius: ${tempFixes}`)
console.log(`    makeAheadNotes:     ${makeAheadFixes}`)
console.log(`    freezable:          ${freezeFixes}`)
console.log(`    cuisine:            ${cuisineFixes}`)
console.log(`  VC warnings on:  ${vcWarningRecipes} recipes`)
if (flaggedCount > 0) {
  console.log(`\nFlagged for review:`)
  for (const o of outcomes.filter((x) => x.uploadStatus === 'flagged-for-review')) {
    console.log(`  ${o.slug}: ${o.uploadMessage.slice(0, 120)}`)
  }
}
if (failedCount > 0) {
  console.log(`\nFailed uploads:`)
  for (const o of outcomes.filter((x) => x.uploadStatus === 'failed')) {
    console.log(`  ${o.slug}: ${o.uploadMessage.slice(0, 120)}`)
  }
}
console.log(`\nWrote _qc-report.json`)
