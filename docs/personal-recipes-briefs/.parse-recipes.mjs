// Parse Rebecca's personal recipe docx text exports into structured records.
// Walks each .txt file, finds "Ingredients" markers, and extracts:
//   - title (the non-empty line before the Ingredients header, skipping serving notes)
//   - servings note (e.g. "(serves 4)" or "Serves 4")
//   - ingredient lines (possibly with section sub-headers)
//   - method lines (after "Directions" / "Method" / "Method:")
//
// Output: a single JSON file with [{ source, sectionContext, title, slug, servingsLine,
//   ingredientGroups: [{ groupLabel, lines }], methodLines }, ...]
//
// `sectionContext` is the most recent ALL-CAPS section heading we saw (e.g.
// BREAKFASTS / DINNERS / SIDES) — useful for deriving mealType.

import { readFileSync, writeFileSync } from 'node:fs'

const SRC_DIR = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/keen-kare-ac9dea/docs/personal-recipes-briefs'

const FILES = [
  { label: 'master', path: `${SRC_DIR}/_source-master.txt`, hasToc: true },
  { label: 'print', path: `${SRC_DIR}/_source-print.txt`, hasToc: false },
]

const METHOD_HEADERS = /^\s*(Directions|Method|Instructions|Method:|Directions:|Method.|Directions.)\s*$/i
const INGREDIENTS_HEADER = /^\s*Ingredients\s*$/i
const SERVINGS_LINE = /^\s*(\(?\s*[Ss]erves\s+[\d\-–]+|[Mm]akes\s+[\d\-–]+|[Ss]ervings?:?\s*[\d\-–]+|[Yy]ield:?\s*[\d\-–]+)/

// Heuristic for sub-section headers within an ingredient list, e.g.:
//   "Salad Ingredients", "Dressing", "For the Sauce", "Chicken", "Sauce Ingredients"
const SUB_HEADER = /^(For (the )?|To (serve|garnish)|Sauce|Dressing|Topping|Filling|Glaze|Marinade|Coating|Garnish)/i
const SUB_HEADER_KEYWORD = /(Ingredients|Sauce|Dressing|Marinade|Topping|Glaze|Filling|Coating|Garnish)\s*[:]?\s*$/i

// Known section headings in the master file. Restrict to these so stray ALL-CAPS
// lines inside method bodies don't get mistaken for section headers.
const KNOWN_SECTIONS = new Set([
  'BREAKFASTS', 'SMOOTHIES', 'LUNCHES', 'DINNERS', 'SIDES',
  'DESSERTS', 'BAKING + TREATS', 'DRINKS', 'BREAD',
])

const ALL_CAPS_HEADING = /^[A-Z][A-Z &/\-+]{3,}$/  // e.g. "BREAKFASTS", "BAKING + TREATS"

// Title candidates to reject because they're recipe-body fragments masquerading
// as titles (notes about tin size, bake time, servings, etc.)
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
  /^To (make|cook|serve|garnish|finish)/i,
  /^Recipe$/i,
]

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

function looksLikeTitle(line) {
  if (!line) return false
  if (line.length > 90) return false
  if (line.length < 3) return false
  if (METHOD_HEADERS.test(line)) return false
  if (INGREDIENTS_HEADER.test(line)) return false
  if (SERVINGS_LINE.test(line)) return false
  if (/^\s*\d+\.\s/.test(line)) return false // numbered list
  if (/^[•\-*]/.test(line)) return false // bullet
  // Reject ALL-CAPS section headings as titles
  if (ALL_CAPS_HEADING.test(line)) return false
  for (const re of NON_TITLE_PATTERNS) if (re.test(line)) return false
  return true
}

function parseFile(file) {
  const text = readFileSync(file.path, 'utf8')
  const lines = text.split(/\r?\n/).map(l => l.replace(/ /g, ' ').trimEnd())

  // For master file, skip the TOC. The TOC ends around the first "CONVERSIONS" body
  // (the conversion table). Find a sensible start: the first time we see a recipe
  // ingredient block after the table.
  // Simpler: parse based on "Ingredients" markers but reject titles that are TOC
  // lines (contain a trailing page number digit).
  const TOC_LINE = /\d+\s*$/

  // Build a list of section headings (ALL CAPS) and their line positions for
  // mealType derivation.
  const sectionHeadings = []
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim()
    if (l && KNOWN_SECTIONS.has(l)) {
      sectionHeadings.push({ line: i, label: l })
    }
  }
  function sectionFor(line) {
    let last = null
    for (const s of sectionHeadings) {
      if (s.line <= line) last = s.label
      else break
    }
    return last
  }

  // Find Ingredients markers.
  const ingMarkers = []
  for (let i = 0; i < lines.length; i++) {
    if (INGREDIENTS_HEADER.test(lines[i])) ingMarkers.push(i)
  }

  const recipes = []
  for (let m = 0; m < ingMarkers.length; m++) {
    const ingIdx = ingMarkers[m]

    // Find title: walk back through blanks / "(serves N)" / sub-header noise
    let t = ingIdx - 1
    while (t >= 0 && lines[t].trim() === '') t--
    // Skip "(serves N)" or similar
    while (t >= 0 && SERVINGS_LINE.test(lines[t])) {
      t--
      while (t >= 0 && lines[t].trim() === '') t--
    }
    // If this line looks like a sub-section ("Chicken" / "For the Sauce"), keep going
    // — but careful, "Chicken" could also be a title.
    if (t < 0) continue

    let titleLine = lines[t].trim()
    let servingsLine = null
    // Look for servings line immediately after title
    for (let k = t + 1; k < ingIdx; k++) {
      const ll = lines[k].trim()
      if (!ll) continue
      if (SERVINGS_LINE.test(ll)) { servingsLine = ll; break }
      if (k > t + 3) break  // stop searching after a few lines
    }

    if (!looksLikeTitle(titleLine)) continue
    // Skip TOC entries (have trailing page number like "Beef Bourguignon	48")
    if (file.hasToc && TOC_LINE.test(titleLine) && /\t|  /.test(titleLine)) continue
    // Some lines like "Substitute milk & butter for a vegan alternative." sneak in
    if (/^Substitute /i.test(titleLine)) continue
    // Servings line as title — skip
    if (/^Servings:/i.test(titleLine)) continue

    // Find method header
    let methodStart = -1
    for (let k = ingIdx + 1; k < lines.length; k++) {
      if (METHOD_HEADERS.test(lines[k])) { methodStart = k; break }
      // Bail if we hit the next recipe's Ingredients
      if (INGREDIENTS_HEADER.test(lines[k]) && k !== ingIdx) break
    }
    if (methodStart === -1) continue

    // Find method end: next Ingredients marker OR next title-like line followed by Ingredients
    let methodEnd = lines.length
    const nextIng = (m + 1 < ingMarkers.length) ? ingMarkers[m + 1] : lines.length
    // The title of the next recipe is somewhere between methodStart+1 and nextIng.
    // Conservative: methodEnd = walk back from nextIng past blanks + servings + title.
    if (nextIng < lines.length) {
      let e = nextIng - 1
      while (e >= 0 && lines[e].trim() === '') e--
      while (e >= 0 && SERVINGS_LINE.test(lines[e])) {
        e--
        while (e >= 0 && lines[e].trim() === '') e--
      }
      // e is now the next recipe's title line; the line before it ends method
      methodEnd = Math.max(methodStart + 1, e)
    }

    // Extract ingredient lines (between ingIdx+1 and methodStart-1)
    const ingredientGroups = []
    let curGroup = { groupLabel: null, lines: [] }
    ingredientGroups.push(curGroup)
    for (let k = ingIdx + 1; k < methodStart; k++) {
      const raw = lines[k]
      const trimmed = raw.trim()
      if (!trimmed) continue
      // Sub-header detection: short line that doesn't contain numbers and matches keywords
      if (
        trimmed.length < 60 &&
        !/\d/.test(trimmed) &&
        (SUB_HEADER_KEYWORD.test(trimmed) || SUB_HEADER.test(trimmed))
      ) {
        // Start new group
        curGroup = { groupLabel: trimmed.replace(/[:]\s*$/, ''), lines: [] }
        ingredientGroups.push(curGroup)
        continue
      }
      curGroup.lines.push(trimmed)
    }

    // Extract method lines
    const methodLines = []
    for (let k = methodStart + 1; k < methodEnd; k++) {
      const raw = lines[k]
      const trimmed = raw.trim()
      if (!trimmed) continue
      // Skip stray section labels (rare)
      methodLines.push(trimmed)
    }

    const slug = slugify(titleLine)
    if (!slug) continue

    recipes.push({
      source: file.label,
      sectionContext: sectionFor(t),
      titleLine,
      slug,
      servingsLine,
      ingredientGroups: ingredientGroups.filter(g => g.lines.length > 0),
      methodLines,
    })
  }

  return recipes
}

const all = []
for (const f of FILES) {
  const parsed = parseFile(f)
  console.log(`${f.label}: ${parsed.length} recipes`)
  all.push(...parsed)
}

writeFileSync(`${SRC_DIR}/_parsed-recipes.json`, JSON.stringify(all, null, 2))
console.log(`Total parsed: ${all.length} recipes (pre-dedupe). Saved to _parsed-recipes.json.`)
