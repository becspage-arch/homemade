/**
 * Fix remaining voice-check + upload errors:
 * - 4 technique files with grade-level failures
 * - "blocking-mats" slug → "blocking-mat" in 5 scarf-cowl files
 * Run: node packages/db/scripts/k6-fix-voice3.mjs
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
function t(text) { return [{ type: 'text', text }] }

let fixed = 0
function fix(rel, fn) {
  const { path, data } = load(rel)
  fn(data)
  save(path, data)
  fixed++
  console.log('FIXED:', rel)
}

// ── TECHNIQUE GRADE-LEVEL FIXES ───────────────────────────────────────────────

// centred-double-decrease: body.content[7] grade 13.2, plus unused "double-decrease" glossary term
fix('k6-techniques/centred-double-decrease.json', d => {
  const bc = d.body.content
  // body.content[7] = "Where you will use it" paragraph
  bc[7].content = t(
    'CDD appears at the centre of symmetrical shaping. Use it at the apex of a V-neckline where decreases on both sides meet. Use it at the top of a lace diamond or triangle motif. It also sits at the centre of a mitre-square corner. In lace, CDD pairs with yarn overs to hold the stitch count steady while shaping the motif outline.'
  )
  // Remove unused "double-decrease" glossary term
  d.glossaryTerms = d.glossaryTerms.filter(g => g.slug !== 'double-decrease')
})

// italian-tubular-cast-on: troubleshooter[7] item[2] fix grade 12.3
// items[2].fix = "Keep a spare needle alongside while unzipping and slide each released stitch onto it immediately before it can autumn."
fix('k6-techniques/italian-tubular-cast-on.json', d => {
  const ts = d.body.content[7]
  ts.attrs.items[2].fix =
    'Keep a spare needle alongside while unzipping. Slide each released stitch onto it immediately before it can drop off.'
})

// slip-stitch-colourwork: body.content[7] grade 14.3
fix('k6-techniques/slip-stitch-colourwork.json', d => {
  const bc = d.body.content
  // body.content[7] = "Where you will use it" paragraph
  bc[7].content = t(
    'Slip-stitch colourwork appears in hats, cowls, cushions, and small accessories. Use it when you want a two-colour geometric pattern without the complexity of stranded knitting. It produces a thicker, denser fabric than plain stocking stitch because each stitch spans two rows. That firmness suits bags and anything that benefits from a stiffer hand.'
  )
})

// twisted-yarn-over: body.content[7] grade 15.3
fix('k6-techniques/twisted-yarn-over.json', d => {
  const bc = d.body.content
  // body.content[7] = "Where you will use it" paragraph
  bc[7].content = t(
    'The twisted yarn over appears in patterns that increase on right-side rows without a decorative hole. Common examples are gusset increases in traditional sock patterns and side increases in top-down raglan yokes. Use it in any textured panel where an increase is required but a lace hole would be out of place. Some patterns write "yo, k1tbl" or "yo tbl" as a standard increase abbreviation.'
  )
})

// ── BLOCKING-MATS SLUG FIX (5 scarf-cowl files) ──────────────────────────────

const BLOCKING_MATS_FILES = [
  'k6-scarf-cowl/bohus-mini-scarf.json',
  'k6-scarf-cowl/contrast-tip-scarf.json',
  'k6-scarf-cowl/fair-isle-scarf.json',
  'k6-scarf-cowl/intarsia-stripe-scarf.json',
  'k6-scarf-cowl/mosaic-colourwork-scarf.json',
]

for (const rel of BLOCKING_MATS_FILES) {
  fix(rel, d => {
    if (Array.isArray(d.recipeTools)) {
      d.recipeTools = d.recipeTools.map(t =>
        t.slug === 'blocking-mats' ? { ...t, slug: 'blocking-mat' } : t
      )
    }
  })
}

console.log('\nDone:', fixed, 'files fixed.')
