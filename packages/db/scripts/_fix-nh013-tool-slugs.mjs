/**
 * Fix wrong recipeTools slugs in 27 natural-home-bulk-013 brief files.
 * Maps old/incorrect slugs to the correct canonical slug from tools.ts.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = resolve(__dirname, '../../../docs/natural-home-bulk-013-briefs')

// Slug remapping: wrong → correct
const SLUG_MAP = {
  'candle-wick': 'pre-tabbed-wick',
  'pillar-candle-mould': 'pillar-candle-mould-aluminium',
  'votive-candle-moulds': 'votive-candle-moulds',   // now exists (just seeded)
  'glass-spray-bottle-100ml': 'spray-bottle-100ml',
  'mixing-bowl': 'mixing-bowl-small',
  'wide-mouth-glass-jar-200ml': 'glass-jar-200ml',
  'spoon': 'stainless-steel-spoon',
  'face-mask-brush': 'face-mask-brush',              // now exists (just seeded)
  'muslin-organza-bags': 'muslin-bags-drawstring',
  'microwave-safe-jug': 'microwave-safe-jug',        // now exists (just seeded)
  'soft-lint-free-cloth': 'lint-free-cloth',
  'amber-glass-bottle-30ml': 'amber-glass-bottle-30ml', // now exists (just seeded)
  'amber-glass-bottle-50ml': 'dropper-bottle-50ml',
  'pipette-or-dropper': 'eyedropper',
  'hand-held-electric-whisk': 'stick-blender',
  'glass-pump-bottle-200ml': 'pump-bottle-200ml',    // now exists (just seeded)
  'silicone-ice-cube-tray': 'ice-cube-tray-silicone',
  'spray-bottle-small': 'spray-bottle-100ml',
  'spray-bottle-250ml': 'spray-bottle-amber-250ml',
  'clean-cloth-white': 'lint-free-cloth',
  'silicone-wax-melt-mould': 'silicone-wax-melt-mould', // now exists (just seeded)
  'mop-bucket': 'bucket-10l',
  'microfibre-flat-mop': 'microfibre-flat-mop',      // now exists (just seeded)
  'lip-balm-tubes': 'lip-balm-tubes',                // now exists (just seeded)
  'small-bowl': 'mixing-bowl-small',
}

import { readdirSync } from 'fs'

const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json'))
let fixed = 0; let unchanged = 0

for (const filename of files) {
  const filepath = `${BRIEFS_DIR}/${filename}`
  const data = JSON.parse(readFileSync(filepath, 'utf8'))

  if (!data.recipeTools || data.recipeTools.length === 0) {
    unchanged++
    continue
  }

  let changed = false
  const newTools = data.recipeTools.map(tool => {
    if (SLUG_MAP[tool.slug]) {
      const newSlug = SLUG_MAP[tool.slug]
      if (newSlug !== tool.slug) {
        console.log(`  ${filename}: ${tool.slug} → ${newSlug}`)
        changed = true
        return { ...tool, slug: newSlug }
      }
    }
    return tool
  })

  if (changed) {
    data.recipeTools = newTools
    writeFileSync(filepath, JSON.stringify(data, null, 2))
    fixed++
  } else {
    unchanged++
  }
}

console.log(`\nDone: ${fixed} files updated, ${unchanged} unchanged`)
