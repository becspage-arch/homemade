/**
 * Fix final voice-check + upload errors discovered in second batch run.
 * Run: node packages/db/scripts/k6-fix-voice4.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function load(rel) {
  const path = join(__dirname, rel)
  return { path, data: JSON.parse(readFileSync(path, 'utf8')) }
}
function save(path, data) { writeFileSync(path, JSON.stringify(data, null, 2)) }

let fixed = 0
function fix(rel, fn) {
  const { path, data } = load(rel)
  fn(data)
  save(path, data)
  fixed++
  console.log('FIXED:', rel)
}

// Unused glossary terms — all fix: remove from glossaryTerms[]
fix('k6-scarf-cowl/stockinette-scarf.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'stocking-stitch')
})

fix('k6-scarf-cowl/traveling-vine-scarf.json', d => {
  const DROP = ['yarn-over', 'k2tog', 'traveling-stitch']
  d.glossaryTerms = d.glossaryTerms.filter(g => !DROP.includes(g.slug))
})

fix('k6-hat/double-cable-hat.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'c6f')
})

fix('k6-hat/single-cable-hat.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'c6f')
})

// Invalid tool slug: dinner-plate not in Tool master table
fix('k6-hat/beret.json', d => {
  d.recipeTools = d.recipeTools.filter(t => t.slug !== 'dinner-plate')
})

fix('k6-hat/lace-beret.json', d => {
  d.recipeTools = d.recipeTools.filter(t => t.slug !== 'dinner-plate')
})

// Invalid craftStitchSlug: knitting-mattress-stitch not in Stitch master table
fix('k6-hat/lace-headband.json', d => {
  d.knitting.craftStitchSlugs = d.knitting.craftStitchSlugs.filter(
    s => s !== 'knitting-mattress-stitch'
  )
})

console.log('\nDone:', fixed, 'files fixed.')
