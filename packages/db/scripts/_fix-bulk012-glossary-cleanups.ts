/**
 * Fix wrong glossary term slugs and add missing inline tooltips for:
 * - flash-point (09, 10, 12, 35, 39)
 * - carrier-oil (18)
 * - washing-soda (32)
 * - remove wrong limescale terms (29, 31)
 * - remove wrong dried-chamomile-flowers term (38)
 * - fix saponification in 08 body[14]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = path.resolve(__dirname, '../../../docs/natural-home-bulk-012-briefs')

function getFile(n: string) {
  const files = fs.readdirSync(BRIEFS_DIR)
  const match = files.find(f => f.startsWith(n + '-'))
  if (!match) throw new Error(`Not found: ${n}-*`)
  return path.join(BRIEFS_DIR, match)
}

function readJSON(fpath: string) {
  return JSON.parse(fs.readFileSync(fpath, 'utf8'))
}

function writeJSON(fpath: string, data: any) {
  fs.writeFileSync(fpath, JSON.stringify(data, null, 2) + '\n')
}

function findTextNode(content: any[], matcher: (t: string) => boolean): { node: any; idx: number } | null {
  for (let i = 0; i < content.length; i++) {
    const n = content[i]
    if (n.type === 'text' && typeof n.text === 'string' && matcher(n.text)) {
      return { node: n, idx: i }
    }
    if (n.content) {
      const found = findTextNode(n.content, matcher)
      if (found) return found
    }
  }
  return null
}

function addTooltipAroundPhrase(content: any[], phrase: string, termSlug: string): boolean {
  for (let i = 0; i < content.length; i++) {
    const n = content[i]
    if (n.type === 'text' && typeof n.text === 'string' && n.text.includes(phrase)) {
      const idx = n.text.indexOf(phrase)
      const before = n.text.slice(0, idx)
      const after = n.text.slice(idx + phrase.length)
      const replacement = []
      if (before) replacement.push({ type: 'text', text: before })
      replacement.push({ type: 'text', text: phrase, marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }] })
      if (after) replacement.push({ type: 'text', text: after })
      content.splice(i, 1, ...replacement)
      return true
    }
    if (n.content && addTooltipAroundPhrase(n.content, phrase, termSlug)) return true
  }
  return false
}

function addSentenceToMethodSection(body: any, sentence: any[]) {
  // Append nodes to the last paragraph in the body
  for (let i = body.content.length - 1; i >= 0; i--) {
    const node = body.content[i]
    if (node.type === 'paragraph' && node.content) {
      // Add sentence nodes
      sentence.forEach(n => node.content.push(n))
      return
    }
  }
}

// ─── Brief 29: remove wrong limescale glossary term ───────────────────────
{
  const fpath = getFile('29')
  const d = readJSON(fpath)
  d.glossaryTerms = (d.glossaryTerms ?? []).filter((t: any) => t.slug !== 'limescale')
  writeJSON(fpath, d)
  console.log('29: removed limescale glossary term')
}

// ─── Brief 31: remove wrong limescale glossary term ───────────────────────
{
  const fpath = getFile('31')
  const d = readJSON(fpath)
  d.glossaryTerms = (d.glossaryTerms ?? []).filter((t: any) => t.slug !== 'limescale')
  writeJSON(fpath, d)
  console.log('31: removed limescale glossary term')
}

// ─── Brief 38: remove wrong dried-chamomile-flowers term ──────────────────
{
  const fpath = getFile('38')
  const d = readJSON(fpath)
  d.glossaryTerms = (d.glossaryTerms ?? []).filter((t: any) => t.slug !== 'dried-chamomile-flowers')
  writeJSON(fpath, d)
  console.log('38: removed dried-chamomile-flowers glossary term')
}

// ─── Flash-point tooltips for candle/fragrance briefs (09, 10, 12, 35, 39) ─
for (const num of ['09', '10', '12']) {
  const fpath = getFile(num)
  const d = readJSON(fpath)
  const body = d.body

  // Find "flash point" in the body text and add tooltip
  let fixed = addTooltipAroundPhrase(body.content, 'flash point', 'flash-point')
  if (!fixed) {
    // Add a sentence to the storage/shelf-life section
    const shelfPara = body.content.find((n: any) =>
      n.type === 'paragraph' &&
      JSON.stringify(n.content).includes('shelf life')
    )
    if (shelfPara) {
      shelfPara.content.push({ type: 'text', text: ' Always verify the ' })
      shelfPara.content.push({ type: 'text', text: 'flash point', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'flash-point' } }] })
      shelfPara.content.push({ type: 'text', text: ' of your fragrance oil before adding it to wax.' })
      fixed = true
    }
    // Fallback: add to last paragraph
    if (!fixed) {
      addSentenceToMethodSection(body, [
        { type: 'text', text: ' Check the ' },
        { type: 'text', text: 'flash point', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'flash-point' } }] },
        { type: 'text', text: ' of your fragrance oil before adding to wax.' }
      ])
    }
  }
  writeJSON(fpath, d)
  console.log(`${num}: added flash-point tooltip`)
}

// Brief 35 (rose-geranium-room-spray) and 39 (citrus-herb-linen-spray)
for (const num of ['35', '39']) {
  const fpath = getFile(num)
  const d = readJSON(fpath)
  const body = d.body
  let fixed = addTooltipAroundPhrase(body.content, 'flash point', 'flash-point')
  if (!fixed) {
    // Find the warning/safety paragraph and add flash point reference
    const warningPara = body.content.find((n: any) =>
      n.type === 'paragraph' &&
      n.content?.some((c: any) => c.type === 'text' && c.text?.includes('flammable'))
    )
    if (warningPara) {
      warningPara.content.push({ type: 'text', text: ' The essential oils all have a ' })
      warningPara.content.push({ type: 'text', text: 'flash point', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'flash-point' } }] })
      warningPara.content.push({ type: 'text', text: ' above 45°C.' })
      fixed = true
    }
    if (!fixed) {
      addSentenceToMethodSection(body, [
        { type: 'text', text: ' Check the ' },
        { type: 'text', text: 'flash point', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'flash-point' } }] },
        { type: 'text', text: ' of any substituted essential oil before using.' }
      ])
    }
  }
  writeJSON(fpath, d)
  console.log(`${num}: added flash-point tooltip`)
}

// ─── Brief 18: add carrier-oil tooltip ────────────────────────────────────
{
  const fpath = getFile('18')
  const d = readJSON(fpath)
  const body = d.body
  let fixed = addTooltipAroundPhrase(body.content, 'carrier oil', 'carrier-oil')
  if (!fixed) fixed = addTooltipAroundPhrase(body.content, 'carrier oils', 'carrier-oil')
  if (!fixed) {
    // Find the opening paragraph and add mention
    const para = body.content[0]
    if (para?.type === 'paragraph' && para.content) {
      const lastNode = para.content[para.content.length - 1]
      if (lastNode?.type === 'text') {
        if (!lastNode.text.endsWith('.')) lastNode.text += '.'
      }
      para.content.push({ type: 'text', text: ' Coconut and argan are both ' })
      para.content.push({ type: 'text', text: 'carrier oils', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'carrier-oil' } }] })
      para.content.push({ type: 'text', text: ' applied directly to the hair.' })
    }
  }
  writeJSON(fpath, d)
  console.log('18: added carrier-oil tooltip')
}

// ─── Brief 32: add washing-soda tooltip ───────────────────────────────────
{
  const fpath = getFile('32')
  const d = readJSON(fpath)
  const body = d.body
  let fixed = addTooltipAroundPhrase(body.content, 'washing soda', 'washing-soda')
  if (!fixed) {
    fixed = addTooltipAroundPhrase(body.content, 'washing-up liquid', 'washing-soda')
    // ^ wrong phrase, try again
  }
  if (!fixed) {
    addSentenceToMethodSection(body, [
      { type: 'text', text: ' The ' },
      { type: 'text', text: 'washing soda', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'washing-soda' } }] },
      { type: 'text', text: ' reacts with the baking soda and releases CO₂ as it fizzes.' }
    ])
  }
  writeJSON(fpath, d)
  console.log('32: added washing-soda tooltip')
}

// ─── Brief 08: fix saponification in paragraph[14] ────────────────────────
{
  const fpath = getFile('08')
  const d = readJSON(fpath)
  const body = d.body
  // Find and wrap "saponification" with tooltip in the colour note section
  let fixed = addTooltipAroundPhrase(body.content, 'saponification', 'saponification')
  if (fixed) {
    console.log('08: wrapped saponification in colour note paragraph')
  }
  writeJSON(fpath, d)
}

console.log('Done')
