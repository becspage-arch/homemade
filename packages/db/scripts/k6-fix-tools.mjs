/**
 * Fix two classes of issues in all k6-* JSON files:
 * 1. Invalid recipeTools slugs — replace with valid master-table slugs or drop.
 * 2. Americanism "fall" → "autumn" in body text nodes.
 *
 * Run: node packages/db/scripts/k6-fix-tools.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DIRS = [
  join(__dirname, 'k6-techniques'),
  join(__dirname, 'k6-scarf-cowl'),
  join(__dirname, 'k6-hat'),
]

// Map of invalid slug → valid replacement (or null to drop the tool entry)
const SLUG_MAP = {
  'knitting-needles': null,          // Handled by knitting.primaryNeedleSlug — remove from tools
  'needle-5-mm': null,
  'needle-4-5-mm': null,
  'needle-4-mm': null,
  'needle-3-75-mm': null,
  'needle-6-mm': null,
  'knitting-needle': null,
  'darning-needle': 'tapestry-needle',
  'yarn-needle': 'tapestry-needle',
  'wool-needle': 'tapestry-needle',
  'stitch-markers': 'stitch-marker',
  'scissors': 'craft-scissors',
  'craft-scissor': 'craft-scissors',
  'measuring-tape': 'measuring-tape-soft',
  'tape-measure': 'measuring-tape-soft',
  'cable-needle': null,              // No cable-needle in master table — not critical for upload
  'row-counter': null,
  'notebook': null,
  'ruler': null,
}

function fixToolSlugs(tools) {
  if (!Array.isArray(tools)) return []
  const seen = new Set()
  const result = []
  for (const tool of tools) {
    const slug = tool.slug
    if (slug in SLUG_MAP) {
      const mapped = SLUG_MAP[slug]
      if (mapped && !seen.has(mapped)) {
        seen.add(mapped)
        result.push({ ...tool, slug: mapped })
      }
      // null = drop
    } else {
      if (!seen.has(slug)) {
        seen.add(slug)
        result.push(tool)
      }
    }
  }
  return result
}

function fixFallInNode(node) {
  if (!node) return node
  if (node.type === 'text' && typeof node.text === 'string') {
    // Replace standalone "fall" (as a season) with "autumn"
    node.text = node.text.replace(/\bfall\b/g, 'autumn')
  }
  if (Array.isArray(node.content)) {
    node.content = node.content.map(fixFallInNode)
  }
  if (Array.isArray(node.items)) {
    node.items = node.items.map(fixFallInNode)
  }
  return node
}

let total = 0
let fixed = 0

for (const dir of DIRS) {
  let files
  try { files = readdirSync(dir) } catch { continue }

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const path = join(dir, file)
    const raw = readFileSync(path, 'utf8')
    let data
    try { data = JSON.parse(raw) } catch (e) {
      console.error(`SKIP (invalid JSON): ${file} — ${e.message}`)
      continue
    }
    total++

    const originalTools = JSON.stringify(data.recipeTools)
    data.recipeTools = fixToolSlugs(data.recipeTools)
    const fixedTools = JSON.stringify(data.recipeTools)

    // Fix "fall" in body
    const originalBody = JSON.stringify(data.body)
    if (data.body) data.body = fixFallInNode(data.body)
    const fixedBody = JSON.stringify(data.body)

    const changed = originalTools !== fixedTools || originalBody !== fixedBody
    if (changed) {
      writeFileSync(path, JSON.stringify(data, null, 2))
      fixed++
      const reasons = []
      if (originalTools !== fixedTools) reasons.push('recipeTools')
      if (originalBody !== fixedBody) reasons.push('"fall"→"autumn"')
      console.log(`FIXED [${reasons.join(', ')}]: ${file}`)
    }
  }
}

console.log(`\nDone: ${fixed} of ${total} files fixed.`)
