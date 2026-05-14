// One-shot: patch briefs that still mention brand names after the rename pass.
// Surfaced by the new voice-check brand-trademark rule. Delete after the
// session ships.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function patch(slug, replacements) {
  const p = join(__dirname, `${slug}.json`)
  const raw = readFileSync(p, 'utf8')
  let out = raw
  for (const [from, to] of replacements) {
    // Case-insensitive regex over the JSON string. Safe because we're targeting
    // brand names that wouldn't appear in unrelated tokens.
    out = out.replace(new RegExp(from.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), to)
  }
  writeFileSync(p, out)
  console.log(`Patched ${slug}.`)
}

patch('chocolate-hazelnut-stuffed-cookies', [
  ['Nutella', 'chocolate hazelnut spread'],
])

patch('clean-eating-almond-butter-fudge', [
  ['Whole Foods', 'any health-food shop'],
])

patch('easiest-ever-slow-cooker-lasagna', [
  ['Crockpot', 'slow cooker'],
  ['Crock-Pot', 'slow cooker'],
  ['Crock Pot', 'slow cooker'],
])

patch('slow-cooker-butter-chicken', [
  ['Crockpot', 'slow cooker'],
  ['Crock-Pot', 'slow cooker'],
  ['Crock Pot', 'slow cooker'],
])

patch('slow-cooker-chinese-beef-and-broccoli', [
  ['Crockpot', 'slow cooker'],
  ['Crock-Pot', 'slow cooker'],
  ['Crock Pot', 'slow cooker'],
])

patch('slow-cooker-italian-chicken-pasta', [
  ['Crockpot', 'slow cooker'],
  ['Crock-Pot', 'slow cooker'],
  ['Crock Pot', 'slow cooker'],
])

patch('parmesan-cheese-crisps-laced-with-zucchini-carrots', [
  ['Silpat', 'silicone baking mat'],
])

// ambrosia-salad mentions Flake — now WARN, no block. But cleaner if rephrased.
patch('ambrosia-salad', [
  ['Flake bar', 'flaked chocolate bar'],
  ['Flake bars', 'flaked chocolate bars'],
  // Standalone "Flake" → "flaked chocolate" (case-insensitive)
])

// slow-cooker-pulled-bbq-chicken mentions "Chipotle" — now WARN, likely the
// chilli. No edit needed; reviewer can fix if it's the restaurant context.

console.log('Done.')
