// Fix glossaryTerms entries that use "termSlug" instead of "slug" as property key
// Affects files 21-30 authored by a different agent
// Run: node docs/fix-glossary-termslug-batch006.js

const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'pottery-ceramics-bulk-006-briefs')

const files = [
  '21-paper-clay-fairy-door-miniature.tutorial.json',
  '22-polymer-clay-faux-labradorite-pendant.tutorial.json',
  '23-polymer-clay-feather-shaped-earrings.tutorial.json',
  '24-polymer-clay-miniature-fairy-garden-house.tutorial.json',
  '25-polymer-clay-faux-opal-cabochon.tutorial.json',
  '26-polymer-clay-cloisonne-style-enamel-pendant.tutorial.json',
  '27-polymer-clay-faux-druzy-crystal-pendant.tutorial.json',
  '28-polymer-clay-sculpted-fox.tutorial.json',
  '29-throwing-a-small-teapot-stoneware.tutorial.json',
  '30-throwing-a-butter-dish-with-lid.tutorial.json',
]

let totalFixed = 0

for (const file of files) {
  const fpath = path.join(dir, file)
  if (!fs.existsSync(fpath)) {
    console.log(`SKIP (not found): ${file}`)
    continue
  }

  const data = JSON.parse(fs.readFileSync(fpath, 'utf8'))

  if (!Array.isArray(data.glossaryTerms)) {
    console.log(`SKIP (no glossaryTerms): ${file}`)
    continue
  }

  let changed = false
  const seen = new Set()
  const normalized = []

  for (const entry of data.glossaryTerms) {
    // Normalize: if entry uses termSlug instead of slug, fix it
    let slug = entry.slug
    if (!slug && entry.termSlug) {
      slug = entry.termSlug
      changed = true
    }
    if (!slug) {
      // Skip entries with no slug at all
      console.log(`  WARNING: entry with no slug in ${file}: ${JSON.stringify(entry)}`)
      continue
    }
    // Deduplicate by slug
    if (seen.has(slug)) continue
    seen.add(slug)
    normalized.push({
      slug,
      term: entry.term,
      definition: entry.definition,
    })
  }

  if (changed || normalized.length !== data.glossaryTerms.length) {
    data.glossaryTerms = normalized
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2), 'utf8')
    console.log(`FIXED ${file}: ${normalized.length} terms (was ${data.glossaryTerms.length} before normalization)`)
    totalFixed++
  } else {
    console.log(`OK    ${file}: ${normalized.length} terms, no change needed`)
  }
}

console.log(`\nDone: fixed ${totalFixed}/${files.length} files`)
