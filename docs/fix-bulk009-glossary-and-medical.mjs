/**
 * Fix script for pottery-ceramics bulk-009 pass 2.
 *
 * Fixes:
 * 1. glossary-coverage: remove terms registered but never used inline
 * 2. medical-claim: subtitle "treats" -> "explores" in abstract vase file
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

// Glossary-coverage: remove unused registered terms
fix('13-paper-clay-sculpted-lighthouse.json', json => removeGlossaryTerms(json, 'coil-building'))
fix('27-throwing-and-altering-a-square-form.json', json => removeGlossaryTerms(json, 'pulling'))
fix('28-centring-and-opening-porcelain-clay.json', json => removeGlossaryTerms(json, 'opening'))
fix('31-throwing-a-stoneware-batter-bowl-with-spout.json', json => removeGlossaryTerms(json, 'foot-ring', 'pulled-handle'))
fix('31-throwing-a-wide-pouring-lip-jug.json', json => removeGlossaryTerms(json, 'pulling'))
fix('33-ash-glaze-preparation-and-application.json', json => removeGlossaryTerms(json, 'limit-formula'))
fix('40-anagama-kiln-introduction.json', json => removeGlossaryTerms(json, 'flashing'))

// Medical-claim: subtitle "treats" -> "explores" in abstract vase
fix('03-coil-built-sculptural-abstract-vase.json', json => {
  if (json.subtitle && json.subtitle.includes('treats')) {
    json.subtitle = json.subtitle.replace(/\btreats\b/g, 'explores')
    return true
  }
  return false
})

console.log('Done.')
