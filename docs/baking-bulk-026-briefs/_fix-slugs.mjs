// Bulk-fix ingredient slugs in baking-bulk-026-briefs
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

const REPLACEMENTS = {
  '"fast-action-dried-yeast"': '"yeast-fast-action"',
  '"salt-fine"': '"sea-salt-fine"',
  '"strong-white-bread-flour"': '"strong-bread-flour"',
  '"strong-plain-flour"': '"plain-flour"',
  '"wholemeal-plain-flour"': '"wholemeal-flour"',
  '"whole-rye-flour"': '"rye-flour"',
  '"fondant-icing-sugar"': '"fondant-icing"',
  '"gelatine-leaf"': '"gelatine-leaves"',
  '"pork-stock"': '"chicken-stock"',
  '"tinned-pineapple-rings"': '"pineapple"',
  '"sweetened-condensed-milk"': '"condensed-milk"',
  '"beef-skirt"': '"beef-chuck"',
  '"chicken-thighs"': '"chicken-thighs-boneless"',
  '"fresh-sage"': '"sage"',
  '"fresh-thyme"': '"thyme-fresh"',
  '"ground-mace"': '"mace-ground"',
  '"potatoes"': '"potato"',
  '"apples"': '"apple-eating"',
  '"flaked-almonds"': '"almonds-flaked"',
  '"fresh-rosemary"': '"rosemary"',
  '"light-brown-soft-sugar"': '"light-brown-sugar"',
}

const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))
let totalFiles = 0

for (const file of files) {
  const filePath = join(dir, file)
  let content = readFileSync(filePath, 'utf-8')
  const original = content

  for (const [from, to] of Object.entries(REPLACEMENTS)) {
    content = content.split(from).join(to)
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8')
    totalFiles++
    console.log(`Fixed: ${file}`)
  }
}

console.log(`\nFixed ${totalFiles} files`)
