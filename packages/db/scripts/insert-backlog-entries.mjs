#!/usr/bin/env node
/**
 * One-off: insert the generated Row[]/Theme[] literals (from
 * generate-backlog-entries.ts's stdout, saved to a file) into
 * crochet-idea-backlog.ts, appending each shelf's new entries to the end of
 * its existing array so no existing id/index shifts.
 *
 * Usage: node scripts/insert-backlog-entries.mjs <entries-file>
 *
 * <entries-file> is expected in the exact format generate-backlog-entries.ts
 * prints: a "// ============ BUILDABLE (Row[]) ============" section with
 * "// --- <shelf> (<n>) ---" sub-headers followed by row lines, then a
 * "// ============ THEMES (Theme[]) ============" section shaped the same way.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const entriesPath = process.argv[2]
if (!entriesPath) throw new Error('usage: insert-backlog-entries.mjs <entries-file>')

const BACKLOG_PATH = '../../../apps/web/src/lib/studio/generation/bulk/crochet-idea-backlog.ts'

// shelf -> const array name, for the buildable (Row[]) arrays
const BUILDABLE_ARRAY_NAME = {
  amigurumi: 'AMIGURUMI',
  'animal-toy': 'ANIMAL_TOY',
  doll: 'DOLL',
  'baby-toy-lovey': 'BABY_TOY_LOVEY',
  coaster: 'COASTER',
  dishcloth: 'DISHCLOTH',
  potholder: 'POTHOLDER',
  'motif-granny-square': 'MOTIF',
  ornament: 'ORNAMENT',
  pincushion: 'PINCUSHION',
  bookmark: 'BOOKMARK',
  headband: 'HEADBAND',
  'wall-hanging': 'WALL_HANGING',
}

// shelf -> which THEMES_* object it lives in (object key == shelf slug)
const THEME_GROUP = {
  blanket: 'THEMES_HOME', cushion: 'THEMES_HOME', basket: 'THEMES_HOME', rug: 'THEMES_HOME',
  'plant-hanger': 'THEMES_HOME', bunting: 'THEMES_HOME', 'pet-bed': 'THEMES_HOME', pouffe: 'THEMES_HOME',
  hat: 'THEMES_WEAR', scarf: 'THEMES_WEAR', cowl: 'THEMES_WEAR', shawl: 'THEMES_WEAR',
  beret: 'THEMES_WEAR', wrap: 'THEMES_WEAR', poncho: 'THEMES_WEAR',
  slippers: 'THEMES_EXTREMITIES', 'fingerless-mitts': 'THEMES_EXTREMITIES', socks: 'THEMES_EXTREMITIES',
  booties: 'THEMES_EXTREMITIES', mittens: 'THEMES_EXTREMITIES', gloves: 'THEMES_EXTREMITIES',
  legwarmers: 'THEMES_EXTREMITIES',
  bag: 'THEMES_CARRY', purse: 'THEMES_CARRY', 'hair-accessory': 'THEMES_CARRY', jewellery: 'THEMES_CARRY',
  backpack: 'THEMES_CARRY', belt: 'THEMES_CARRY', 'tea-cosy': 'THEMES_CARRY', towel: 'THEMES_CARRY',
  cardigan: 'THEMES_GARMENT', 'jumper-pullover': 'THEMES_GARMENT', 'tee-top': 'THEMES_GARMENT',
  vest: 'THEMES_GARMENT', dress: 'THEMES_GARMENT', tunic: 'THEMES_GARMENT', skirt: 'THEMES_GARMENT',
  'jacket-coat': 'THEMES_GARMENT', trousers: 'THEMES_GARMENT', shorts: 'THEMES_GARMENT',
  'jumpsuit-romper': 'THEMES_GARMENT',
  doily: 'THEMES_LACE', edging: 'THEMES_LACE', 'applique-flower': 'THEMES_LACE',
}

const raw = readFileSync(entriesPath, 'utf8')
const lines = raw.split('\n')

// Parse into { buildable: {shelf: [rowLine, ...]}, theme: {shelf: [rowLine, ...]} }
const sections = { buildable: {}, theme: {} }
let mode = null
let currentShelf = null
for (const line of lines) {
  if (line.includes('BUILDABLE (Row[])')) { mode = 'buildable'; continue }
  if (line.includes('THEMES (Theme[])')) { mode = 'theme'; continue }
  const header = line.match(/^\/\/ --- (\S+) \(\d+\) ---/)
  if (header) { currentShelf = header[1]; if (mode) sections[mode][currentShelf] ??= []; continue }
  if (mode && currentShelf && /^\s*\[/.test(line)) {
    // Keep the trailing comma as printed — a trailing comma before the
    // array's closing `]` is valid TS, and every line but conceptually the
    // last already needs one anyway.
    sections[mode][currentShelf].push(line.trim())
  }
}

let src = readFileSync(new URL(BACKLOG_PATH, import.meta.url), 'utf8')

/** Find `const NAME: T[] = [ ... ]` and return [startIdx, endIdx] (endIdx = index of the closing `]`). */
function findArrayBounds(src, constName) {
  const startMarker = `const ${constName}: `
  const startIdx = src.indexOf(startMarker)
  if (startIdx === -1) throw new Error(`array not found: ${constName}`)
  // Skip past the type annotation (e.g. "Row[]") to the `=` sign, THEN find
  // the array literal's own opening `[` — not the `[` inside "Row[]" itself.
  const eqIdx = src.indexOf('=', startIdx)
  if (eqIdx === -1) throw new Error(`no '=' found for ${constName}`)
  const openBracket = src.indexOf('[', eqIdx)
  let depth = 0
  for (let i = openBracket; i < src.length; i++) {
    if (src[i] === '[') depth++
    else if (src[i] === ']') {
      depth--
      if (depth === 0) return [openBracket, i]
    }
  }
  throw new Error(`unbalanced brackets for ${constName}`)
}

function insertRows(constName, rowLines) {
  if (rowLines.length === 0) return
  const [, closeIdx] = findArrayBounds(src, constName)
  const insertion = '\n  ' + rowLines.join('\n  ') + '\n'
  src = src.slice(0, closeIdx) + insertion + src.slice(closeIdx)
  console.log(`  inserted ${rowLines.length} rows into ${constName}`)
}

/** Find `<key>: [ ... ]` inside the named THEMES_* object and return the
 *  index of its closing `]` (the one belonging to that shelf's own array,
 *  not the outer object). */
function findThemeArrayCloseIdx(src, groupName, shelfKey) {
  const groupStart = src.indexOf(`const ${groupName}: `)
  if (groupStart === -1) throw new Error(`theme group not found: ${groupName}`)
  // shelf keys are written either bare (blanket:) or quoted ('plant-hanger':)
  const bare = new RegExp(`\\n  ${shelfKey}: \\[`)
  const quoted = new RegExp(`\\n  '${shelfKey}': \\[`)
  const rest = src.slice(groupStart)
  let m = bare.exec(rest) ?? quoted.exec(rest)
  if (!m) throw new Error(`shelf key not found in ${groupName}: ${shelfKey}`)
  const openBracket = groupStart + m.index + m[0].length - 1
  let depth = 0
  for (let i = openBracket; i < src.length; i++) {
    if (src[i] === '[') depth++
    else if (src[i] === ']') {
      depth--
      if (depth === 0) return i
    }
  }
  throw new Error(`unbalanced brackets for ${groupName}.${shelfKey}`)
}

function insertThemeRows(groupName, shelfKey, rowLines) {
  if (rowLines.length === 0) return
  const closeIdx = findThemeArrayCloseIdx(src, groupName, shelfKey)
  const insertion = '\n    ' + rowLines.join('\n    ') + '\n  '
  src = src.slice(0, closeIdx) + insertion + src.slice(closeIdx)
  console.log(`  inserted ${rowLines.length} themes into ${groupName}.${shelfKey}`)
}

console.log('Buildable inserts:')
for (const [shelf, rowLines] of Object.entries(sections.buildable)) {
  const constName = BUILDABLE_ARRAY_NAME[shelf]
  if (!constName) throw new Error(`no buildable array mapped for shelf: ${shelf}`)
  insertRows(constName, rowLines)
}

console.log('Theme inserts:')
for (const [shelf, rowLines] of Object.entries(sections.theme)) {
  const group = THEME_GROUP[shelf]
  if (!group) throw new Error(`no theme group mapped for shelf: ${shelf}`)
  insertThemeRows(group, shelf, rowLines)
}

writeFileSync(new URL(BACKLOG_PATH, import.meta.url), src)
console.log('\nWrote', BACKLOG_PATH)
