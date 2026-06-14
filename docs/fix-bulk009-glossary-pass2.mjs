/**
 * Second pass glossary-coverage and grade-level fix for bulk-009.
 * Removes terms that agents dropped during grade-level rewrites (now unused).
 * Also fixes 2 troubleshooter grade-level items.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefDir = join(__dirname, 'pottery-ceramics-bulk-009-briefs')

function fix(filename, fn) {
  const path = join(briefDir, filename)
  const json = JSON.parse(readFileSync(path, 'utf8'))
  const changed = fn(json)
  if (changed) {
    writeFileSync(path, JSON.stringify(json, null, 2))
    console.log(`Fixed: ${filename}`)
  }
}

function removeGlossaryTerms(json, ...slugs) {
  const before = json.glossaryTerms.length
  json.glossaryTerms = json.glossaryTerms.filter(t => !slugs.includes(t.slug))
  return json.glossaryTerms.length !== before
}

// Remove unused glossary terms (dropped when agents rewrote grade-level paragraphs)
fix('08-pinch-pot-cactus-planter.json', json => removeGlossaryTerms(json, 'pinch-pot'))
fix('10-air-dry-clay-mosaic-picture-frame.json', json => removeGlossaryTerms(json, 'leather-hard'))
fix('11-mishima-inlay-on-leather-hard-clay.json', json => removeGlossaryTerms(json, 'mishima'))
fix('15-polymer-clay-sculpted-cat-brooch.json', json => removeGlossaryTerms(json, 'blending'))
fix('20-air-dry-clay-succulent-pot-with-drainage.json', json => removeGlossaryTerms(json, 'leather-hard'))
fix('20-clay-reclaim-from-trimmings.json', json => removeGlossaryTerms(json, 'wedging'))
fix('28-centring-and-opening-porcelain-clay.json', json => removeGlossaryTerms(json, 'centering', 'plasticity'))
fix('29-texture-stamping-systematic-approach.json', json => removeGlossaryTerms(json, 'impressed-decoration'))
fix('34-layering-two-commercial-glazes-for-effect.json', json => removeGlossaryTerms(json, 'specific-gravity'))
fix('39-saggar-firing-technique.json', json => removeGlossaryTerms(json, 'flashing'))

// Fix grade-level in troubleshooter items
fix('15-polymer-clay-sculpted-cat-brooch.json', json => {
  // body.content[22] = troubleshooter, items[0].fix
  const ts = json.body.content[22]
  if (ts && ts.type === 'troubleshooter') {
    const old = ts.attrs.items[0].fix
    ts.attrs.items[0].fix = 'After baking, reattach the piece with liquid polymer clay. Brush it onto both surfaces. Press the pieces together firmly. Re-bake for 15 minutes at the same temperature.'
    return ts.attrs.items[0].fix !== old
  }
  return false
})

fix('25-polymer-clay-millefiori-ring.json', json => {
  // body.content[15] = troubleshooter, items[2].cause
  const ts = json.body.content[15]
  if (ts && ts.type === 'troubleshooter') {
    const old = ts.attrs.items[2].cause
    ts.attrs.items[2].cause = 'The mandrel size did not match the finger measurement.'
    return ts.attrs.items[2].cause !== old
  }
  return false
})

console.log('Done.')
