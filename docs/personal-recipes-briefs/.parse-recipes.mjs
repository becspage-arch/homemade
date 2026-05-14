// Parse Rebecca's personal recipe docx text exports into structured records.
//
// Improvements over the first ingest's parser:
// - Broader INGREDIENTS_HEADER regex (handles "Ingredients:", "Ingredients (serves 4)",
//   trailing whitespace). The first ingest missed Spaghetti Carbonara because its
//   header was "Ingredients:" with a colon.
// - Two-pass: find all Ingredients markers first, walk back through blanks /
//   servings / descriptions / quotes to find each recipe's title, then derive
//   method boundaries from titles (not from raw Ingredient walk-back). This
//   fixes the case where Spinach Quiche had a description quote between the
//   title and Ingredients — the old walk-back stopped at the quote and pulled
//   the title into the previous recipe.
// - Writes intermediate .md files per recipe so the authoring pass has a
//   human-checkable source-of-truth.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = __dirname
const REPO_ROOT = resolve(__dirname, '..', '..')
const EXTRACTED_DIR = join(REPO_ROOT, 'docs', 'personal-recipes-extracted')

const FILES = [
  { label: 'master', path: `${SRC_DIR}/_source-master.txt`, hasToc: true },
  { label: 'print', path: `${SRC_DIR}/_source-print.txt`, hasToc: false },
]

const INGREDIENTS_HEADER = /^\s*Ingredients\s*(\(\s*serves?\s+[\d\-–]+[^)]*\))?[:]?\s*$/i
const METHOD_HEADERS = /^\s*(Directions|Method|Instructions|Preparation|Method:|Directions:|Method\.|Directions\.)\s*[:]?\s*$/i
const SERVINGS_LINE = /^\s*(\(?\s*[Ss]erves\s+[\d\-–]+|[Mm]akes\s+[\d\-–]+|[Ss]ervings?:?\s*[\d\-–]+|[Yy]ield:?\s*[\d\-–]+|[Pp]rep\s+time|[Cc]ook\s+time|[Tt]otal\s+time)/

const SUB_HEADER = /^(For (the )?|To (serve|garnish)|Sauce|Dressing|Topping|Filling|Glaze|Marinade|Coating|Garnish)/i
const SUB_HEADER_KEYWORD = /(Ingredients|Sauce|Dressing|Marinade|Topping|Glaze|Filling|Coating|Garnish)\s*[:]?\s*$/i

const KNOWN_SECTIONS = new Set([
  'BREAKFASTS', 'SMOOTHIES', 'LUNCHES', 'DINNERS', 'SIDES',
  'DESSERTS', 'BAKING + TREATS', 'DRINKS', 'BREAD',
])

const ALL_CAPS_HEADING = /^[A-Z][A-Z &/\-+]{3,}$/

const NON_TITLE_PATTERNS = [
  /^Made (in|with)/i,
  /^Bake (time|temperature|temp)/i,
  /^Cook (time|temp|temperature)/i,
  /^Prep (time)/i,
  /^Serves /i,
  /^Servings/i,
  /^Yield/i,
  /^Note[s]?:/i,
  /^Tip[s]?:/i,
  /^Total time/i,
  /^For the /i,
  /^For my /i,
  /^For your /i,
  /^Makes\b/i,
  /^pinch /i,
  /^Pinch /,
  /^To (make|cook|serve|garnish|finish)/i,
  /^Recipe$/i,
  /^Ingredients/i,
  /^Method/i,
  /^Directions/i,
  /^Instructions/i,
  /^Preparation/i,
  /^Storage/i,
  /^Storing/i,
  /^Make[\s-]Ahead/i,
  /^Making[\s-]Ahead/i,
  /^Freezer instructions/i,
  /^Substitute /i,
]

function slugify(title) {
  // Strip parenthetical clauses (e.g. "(Not Dairy-Free)", "(Vegan)") before
  // slugifying so the URL stays short. The full title keeps the qualifier.
  const stripped = title.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  return stripped
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

// Imperative verbs that mark a method step rather than a title.
const IMPERATIVE_VERBS = new Set([
  'add', 'bake', 'beat', 'blend', 'boil', 'brown', 'brush', 'cake', 'check',
  'chill', 'chop', 'combine', 'cool', 'cover', 'cream', 'crumble', 'crush',
  'cut', 'dip', 'discard', 'divide', 'drain', 'drizzle', 'drop', 'dust', 'fill',
  'finish', 'flatten', 'flip', 'fold', 'freeze', 'fry', 'gather', 'glaze',
  'grate', 'grease', 'grill', 'heat', 'knead', 'lay', 'leave', 'let', 'line',
  'lower', 'mash', 'measure', 'melt', 'mix', 'open', 'peel', 'pick', 'pinch',
  'place', 'pop', 'pour', 'preheat', 'press', 'prick', 'pulse', 'put',
  'reduce', 'refrigerate', 'remove', 'repeat', 'rest', 'return', 'rinse',
  'roast', 'roll', 'rub', 'scatter', 'scoop', 'scrape', 'season', 'serve',
  'set', 'shake', 'shape', 'shred', 'sieve', 'sift', 'simmer', 'skim',
  'slice', 'slip', 'soak', 'spoon', 'spread', 'sprinkle', 'squeeze', 'stir',
  'store', 'strain', 'taste', 'top', 'toss', 'transfer', 'turn', 'use',
  'wait', 'warm', 'wash', 'whip', 'whisk', 'wrap', 'zest',
])

function startsWithImperative(line) {
  const m = line.match(/^([A-Z][a-z]+)/)
  if (!m) return false
  if (!IMPERATIVE_VERBS.has(m[1].toLowerCase())) return false
  // Only treat as a method step if the line looks sentence-case rather than
  // title-case. Title-case lines capitalise subsequent significant words
  // ("Warm Pear Salad"); sentence-case lines don't ("Combine and serve").
  const words = line.split(/\s+/)
  if (words.length === 1) return false // single-word imperatives are too generic to reject
  let capitalisedAfterFirst = 0
  for (const w of words.slice(1)) {
    if (/^[A-Z]/.test(w) && w.length > 2) capitalisedAfterFirst++
  }
  if (capitalisedAfterFirst >= Math.max(1, Math.floor((words.length - 1) / 2))) {
    return false // looks title-case; allow as title
  }
  return true
}

function looksLikeTitle(line) {
  if (!line) return false
  if (line.length > 95) return false
  if (line.length < 3) return false
  if (METHOD_HEADERS.test(line)) return false
  if (INGREDIENTS_HEADER.test(line)) return false
  if (SERVINGS_LINE.test(line)) return false
  if (/^\s*\d+\.\s/.test(line)) return false
  if (/^[•\-*]/.test(line)) return false
  if (ALL_CAPS_HEADING.test(line)) return false
  for (const re of NON_TITLE_PATTERNS) if (re.test(line)) return false
  // Reject lines starting with imperative verbs ("Spread goats cheese", "Combine and serve")
  if (startsWithImperative(line)) return false
  // Reject lines ending in terminal punctuation (these are usually method/description sentences)
  if (/[.!?]\s*$/.test(line)) {
    // Allow titles with single trailing ! ("Whatever Floats Your Boat" Brownies!)
    if (!line.endsWith('!')) return false
  }
  // Quote-starting lines are allowed only if they look like recipe titles
  // (e.g. '"Whatever Floats Your Boat" Brownies!' — the only one in this corpus).
  // The convention: short, ends with an exclamation or has a closing quote followed by a noun.
  if (/^["']/.test(line)) {
    if (line.length < 80 && (line.endsWith('!') || /["'].*\s+[A-Z]/.test(line))) {
      // accept
    } else {
      return false
    }
  }
  // Reject lines that look like ingredients (lead with a number).
  // Allow numeric-prefix titles only if explicitly hyphenated like "10-minute breakfast".
  if (/^\d/.test(line)) {
    if (!/^\d+[-\s]?(minute|min|hour|day|step|ingredient)/i.test(line)) return false
  }
  // Reject lines that are a single common food word with no context
  if (/^[A-Z][a-z]+$/.test(line) && line.length < 12) {
    const lower = line.toLowerCase()
    const tooGeneric = new Set([
      'berries', 'croissants', 'salad', 'quesadillas', 'frosting', 'icing',
      'baguette', 'baguettes', 'bagels', 'storage', 'storing', 'notes', 'tips',
      'method', 'ingredients', 'directions', 'serves', 'makes', 'yield',
      'preheat', 'optional',
    ])
    if (tooGeneric.has(lower)) return false
  }
  return true
}

function parseFile(file) {
  const text = readFileSync(file.path, 'utf8')
  const lines = text.split(/\r?\n/).map((l) => l.replace(/ /g, ' ').trimEnd())

  const sectionHeadings = []
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim()
    if (l && KNOWN_SECTIONS.has(l)) sectionHeadings.push({ line: i, label: l })
  }
  function sectionFor(line) {
    let last = null
    for (const s of sectionHeadings) {
      if (s.line <= line) last = s.label
      else break
    }
    return last
  }

  // Pass 1: find all Ingredients markers, and for each, walk back to find a title.
  // The walk-back goes through blanks, servings lines, descriptions, quotes, and
  // anything else, capped at the previous Ingredients marker (to avoid pulling
  // titles from earlier recipes).
  const ingMarkers = []
  for (let i = 0; i < lines.length; i++) {
    if (INGREDIENTS_HEADER.test(lines[i])) ingMarkers.push(i)
  }

  const TOC_LINE = /\d+\s*$/

  const titles = []
  for (let m = 0; m < ingMarkers.length; m++) {
    const ingIdx = ingMarkers[m]
    const lowerBound = m > 0 ? ingMarkers[m - 1] : 0

    // Walk back from ingIdx-1 looking for a title-like line.
    let t = ingIdx - 1
    let firstNonBlankAfterIng = null
    while (t > lowerBound) {
      const line = lines[t].trim()
      if (line === '') {
        t--
        continue
      }
      if (firstNonBlankAfterIng === null) firstNonBlankAfterIng = t
      if (looksLikeTitle(line)) {
        // Found candidate. Verify by checking the line before is blank or a section heading
        // (titles are typically preceded by whitespace, not a continuation of prose).
        if (t === 0 || lines[t - 1].trim() === '' || KNOWN_SECTIONS.has(lines[t - 1].trim())) {
          break
        }
        // If not preceded by blank, it could still be a title (e.g. squished against a previous
        // section heading like "BREAKFASTS\nApple and Cinnamon Porridge"). Accept it.
        break
      }
      t--
    }

    // TOC reject: master file has table-of-contents lines like "Beef Bourguignon\t48"
    let titleLine = t > lowerBound && t >= 0 ? lines[t].trim() : ''
    if (file.hasToc && TOC_LINE.test(titleLine) && /\t|  /.test(titleLine)) {
      continue
    }
    if (!titleLine) continue
    if (!looksLikeTitle(titleLine)) continue

    titles.push({ titleIdx: t, ingIdx, title: titleLine })
  }

  // Pass 2: build recipe records using title boundaries.
  const recipes = []
  for (let i = 0; i < titles.length; i++) {
    const { titleIdx, ingIdx, title } = titles[i]
    const nextTitleIdx = i + 1 < titles.length ? titles[i + 1].titleIdx : lines.length

    // Find servings line between title and ingredients
    let servingsLine = null
    for (let k = titleIdx + 1; k < ingIdx; k++) {
      const ll = lines[k].trim()
      if (!ll) continue
      if (SERVINGS_LINE.test(ll)) {
        servingsLine = ll
        break
      }
    }

    // Find method header between ingIdx and nextTitleIdx
    let methodStart = -1
    for (let k = ingIdx + 1; k < nextTitleIdx; k++) {
      if (METHOD_HEADERS.test(lines[k])) {
        methodStart = k
        break
      }
    }
    if (methodStart === -1) continue

    // Method ends at the next title (exclusive)
    const methodEnd = nextTitleIdx

    // Extract ingredient lines (between ingIdx+1 and methodStart-1)
    const ingredientGroups = []
    let curGroup = { groupLabel: null, lines: [] }
    ingredientGroups.push(curGroup)
    for (let k = ingIdx + 1; k < methodStart; k++) {
      const trimmed = lines[k].trim()
      if (!trimmed) continue
      if (
        trimmed.length < 60 &&
        !/\d/.test(trimmed) &&
        (SUB_HEADER_KEYWORD.test(trimmed) || SUB_HEADER.test(trimmed))
      ) {
        curGroup = { groupLabel: trimmed.replace(/[:]\s*$/, ''), lines: [] }
        ingredientGroups.push(curGroup)
        continue
      }
      curGroup.lines.push(trimmed)
    }

    // Extract method lines (between methodStart+1 and methodEnd). Strip orphan title stubs
    // (lines that look like titles but have no recipe content — e.g. "Passionfruit Pavlova"
    // appearing in the docx as a title with no body, before the next real recipe).
    // An orphan title is preceded by blank lines and followed by blank/section/another-orphan-title.
    const methodLines = []
    for (let k = methodStart + 1; k < methodEnd; k++) {
      const trimmed = lines[k].trim()
      if (!trimmed) continue
      if (KNOWN_SECTIONS.has(trimmed)) continue
      // Detect orphan title stubs: title-like, preceded by blank, followed by blank
      if (looksLikeTitle(trimmed)) {
        const prevBlank = k === 0 || lines[k - 1].trim() === ''
        // Lookahead: is everything to methodEnd blank-or-title-stubs?
        let lookahead = k + 1
        let nonBlankAfter = ''
        while (lookahead < methodEnd) {
          const t = lines[lookahead].trim()
          if (t !== '') {
            nonBlankAfter = t
            break
          }
          lookahead++
        }
        const tailBlank = lookahead >= methodEnd
        const tailIsAnotherTitle = nonBlankAfter && looksLikeTitle(nonBlankAfter)
        const tailIsSection = KNOWN_SECTIONS.has(nonBlankAfter)
        if (prevBlank && (tailBlank || tailIsAnotherTitle || tailIsSection)) {
          // Orphan title — skip
          continue
        }
      }
      methodLines.push(trimmed)
    }

    const slug = slugify(title)
    if (!slug) continue

    recipes.push({
      source: file.label,
      sectionContext: sectionFor(titleIdx),
      titleLine: title,
      slug,
      servingsLine,
      ingredientGroups: ingredientGroups.filter((g) => g.lines.length > 0),
      methodLines,
      _titleLineIdx: titleIdx,
      _ingIdx: ingIdx,
      _methodStart: methodStart,
      _methodEnd: methodEnd,
    })
  }

  return recipes
}

const allRecipes = []
for (const f of FILES) {
  const parsed = parseFile(f)
  console.log(`${f.label}: ${parsed.length} recipes`)
  allRecipes.push(...parsed)
}

// Dedupe by slug, preferring 'master' source over 'print' (master is canonical).
const bySlug = new Map()
for (const r of allRecipes) {
  const existing = bySlug.get(r.slug)
  if (!existing) bySlug.set(r.slug, r)
  else if (existing.source === 'print' && r.source === 'master') bySlug.set(r.slug, r)
}

const unique = Array.from(bySlug.values()).sort((a, b) => a.slug.localeCompare(b.slug))

// Sanity checks
const sanity = []
for (const r of unique) {
  if (r.ingredientGroups.length === 0) {
    sanity.push(`${r.slug}: no ingredient groups`)
    continue
  }
  if (r.methodLines.length === 0) {
    sanity.push(`${r.slug}: no method lines`)
    continue
  }
  // Title-coherence: slug should partially match expected words from the title
  // Boundary: last method line shouldn't look like a stray title.
  const lastLine = r.methodLines[r.methodLines.length - 1]
  if (lastLine && lastLine.length < 60 && /^[A-Z][a-zA-Z' ]+$/.test(lastLine) && !/[.,!?]/.test(lastLine) && lastLine.split(' ').length <= 6) {
    sanity.push(`${r.slug}: suspicious tail line — "${lastLine}"`)
  }
}

writeFileSync(`${SRC_DIR}/_parsed-recipes.json`, JSON.stringify(unique, null, 2))
console.log(`\nTotal parsed: ${allRecipes.length} (pre-dedupe).`)
console.log(`Unique by slug: ${unique.length}.`)
console.log(`Sanity flags: ${sanity.length}.`)

// Write intermediate .md files
if (existsSync(EXTRACTED_DIR)) rmSync(EXTRACTED_DIR, { recursive: true, force: true })
mkdirSync(EXTRACTED_DIR, { recursive: true })

for (const r of unique) {
  const lines = []
  lines.push(`# ${r.titleLine}`)
  lines.push('')
  lines.push(
    `> source: ${r.source}.docx${r.sectionContext ? ` · section: ${r.sectionContext}` : ''}${r.servingsLine ? ` · ${r.servingsLine}` : ''}`,
  )
  lines.push('')
  lines.push('## Ingredients')
  lines.push('')
  for (const group of r.ingredientGroups) {
    if (group.groupLabel) {
      lines.push(`### ${group.groupLabel}`)
      lines.push('')
    }
    for (const il of group.lines) {
      lines.push(`- ${il}`)
    }
    lines.push('')
  }
  lines.push('## Method')
  lines.push('')
  for (const ml of r.methodLines) {
    lines.push(`${ml}`)
    lines.push('')
  }
  writeFileSync(join(EXTRACTED_DIR, `${r.slug}.md`), lines.join('\n'))
}

const reportLines = []
reportLines.push(`Personal recipe parse report — ${new Date().toISOString()}`)
reportLines.push(`===================================`)
reportLines.push(``)
for (const f of FILES) reportLines.push(`Files parsed: ${f.label}: ${f.path}`)
reportLines.push(``)
reportLines.push(`Total parsed (pre-dedupe): ${allRecipes.length}`)
reportLines.push(`Unique by slug: ${unique.length}`)
reportLines.push(``)
reportLines.push(`Sanity flags (${sanity.length}):`)
for (const s of sanity) reportLines.push(`  - ${s}`)
reportLines.push(``)
reportLines.push(`Recipes by section:`)
const bySection = new Map()
for (const r of unique) {
  const k = r.sectionContext ?? '(no section)'
  bySection.set(k, (bySection.get(k) ?? 0) + 1)
}
for (const [k, v] of bySection) reportLines.push(`  ${k}: ${v}`)
writeFileSync(`${SRC_DIR}/_parse-report.txt`, reportLines.join('\n'))

console.log(`Wrote ${unique.length} intermediate .md files to ${EXTRACTED_DIR}.`)
console.log(`Wrote _parsed-recipes.json and _parse-report.txt.`)
