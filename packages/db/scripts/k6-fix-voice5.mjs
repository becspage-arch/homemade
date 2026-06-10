/**
 * Fix remaining failures from third batch run.
 * Run: node packages/db/scripts/k6-fix-voice5.mjs
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

// ── UNUSED GLOSSARY TERMS ─────────────────────────────────────────────────────

fix('k6-scarf-cowl/cable-rib-scarf.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'cable-4-front')
})

fix('k6-scarf-cowl/fair-isle-scarf.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'float')
  // Also fix invalid craftStitchSlug
  d.knitting.craftStitchSlugs = d.knitting.craftStitchSlugs.map(s =>
    s === 'knitting-stranded-colourwork' ? 'knitting-fair-isle' : s
  )
})

fix('k6-scarf-cowl/hooded-cowl.json', d => {
  const DROP = ['three-needle-bind-off', 'pick-up-stitches']
  d.glossaryTerms = d.glossaryTerms.filter(g => !DROP.includes(g.slug))
})

fix('k6-scarf-cowl/lace-eyelet-scarf.json', d => {
  const DROP = ['yarn-over', 'k2tog']
  d.glossaryTerms = d.glossaryTerms.filter(g => !DROP.includes(g.slug))
})

fix('k6-scarf-cowl/ribbed-cowl.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'stretchy-bind-off')
})

fix('k6-scarf-cowl/ribbed-scarf-1x1.json', d => {
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'rib-1x1')
})

// ── INVALID CRAFT STITCH SLUGS ────────────────────────────────────────────────

fix('k6-scarf-cowl/bohus-mini-scarf.json', d => {
  d.knitting.craftStitchSlugs = d.knitting.craftStitchSlugs.filter(
    s => s !== 'knitting-stranded-colourwork'
  )
})

fix('k6-scarf-cowl/mosaic-colourwork-scarf.json', d => {
  d.knitting.craftStitchSlugs = d.knitting.craftStitchSlugs.map(s =>
    s === 'knitting-mosaic-colourwork' ? 'knitting-slip-stitch' : s
  )
})

// ── INVALID TOOL SLUG ─────────────────────────────────────────────────────────

fix('k6-scarf-cowl/intarsia-stripe-scarf.json', d => {
  d.recipeTools = d.recipeTools.filter(t => t.slug !== 'yarn-bobbins')
})

console.log('\nDone:', fixed, 'files fixed.')
