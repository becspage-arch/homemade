/**
 * fix-herbal-bulk002-pass2.mjs
 * Second pass: fix remaining clinical vocab, double-gloss artifacts, institutional names, grade-level.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const BRIEFS_DIR = 'docs/herbal-bulk-002-briefs'
const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json'))

let totalFilesChanged = 0

const TEXT_FIXES = [
  // Fix double-the institutional names from pass-1
  { from: /the the British Herbal Pharmacopoeia/g, to: 'the British Herbal Pharmacopoeia' },
  { from: /the the herbal reference/g, to: 'the herbal reference' },

  // Fix double-gloss artifacts from pass-1
  { from: /\(the early 20th-century botanical writer\), the early 20th-century botanical writer,/g, to: '(the early 20th-century botanical writer)' },
  { from: /\(the 17th-century herbalist\), the 17th-century herbalist,/g, to: '(the 17th-century herbalist)' },
  { from: /Maud Grieve, the early 20th-century botanical writer, \(the early 20th-century botanical writer\)/g, to: 'Maud Grieve, the early 20th-century botanical writer,' },

  // Remove "British Herbal Pharmacopoeia" from body (institutional name)
  { from: /the British Herbal Pharmacopoeia specifies/g, to: 'the standard herbal pharmacopoeia specifies' },
  { from: /The the British Herbal Pharmacopoeia specifies/g, to: 'The herbal pharmacopoeia standard specifies' },
  { from: /the British Herbal Pharmacopoeia dose range/g, to: 'the standard dose range' },
  { from: /The the British Herbal Pharmacopoeia dose range/g, to: 'The standard dose range' },
  { from: /The British Herbal Pharmacopoeia dose range/g, to: 'The standard dose range' },
  { from: /The British Herbal Pharmacopoeia specifies/g, to: 'The herbal pharmacopoeia standard specifies' },
  { from: /the British Herbal Pharmacopoeia/g, to: 'the herbal pharmacopoeia' },
  { from: /\bBritish Herbal Pharmacopoeia\b/g, to: 'herbal pharmacopoeia' },

  // Remove remaining EMA/institutional
  { from: /the European herbal regulator assessment methodology/g, to: 'the herbal reference' },
  { from: /the European herbal regulator's review/g, to: 'the herbal reference' },
  { from: /the European herbal regulator/g, to: 'the European herbal standard' },
  { from: /the herbal reference entry on/g, to: 'the herbal reference for' },
  { from: /a well-established use for/g, to: 'a traditional use for' },

  // Clinical vocab pass-2
  { from: /\bmaceration\b/g, to: 'soaking' },
  { from: /\bmacer[ai]te[ds]?\b/g, to: 'soaked' },
  { from: /\bmacerating\b/g, to: 'soaking' },
  // mucilage outside tooltip marks
  { from: /\bmucilage\b/g, to: 'soothing gel' },
  { from: /\bmucilaginous\b/g, to: 'gel-forming' },
  // nervine outside tooltip
  { from: /\bnervine\b/g, to: 'nerve-calming herb' },
  // adaptogen outside tooltip
  { from: /\badaptogen(ic)?\b/g, to: 'stress-supporting herb' },
  // decoction in body (not in tooltip)
  { from: /\bdecoction\b/g, to: 'herbal decoction' },
  { from: /a herbal decoction of the root/g, to: 'a simmered root preparation' },
  { from: /a herbal decoction/g, to: 'a simmered herbal preparation' },
  { from: /the herbal decoction/g, to: 'the simmered preparation' },
  { from: /this herbal decoction/g, to: 'this simmered preparation' },
  // tincture in body (not in tooltip)
  { from: /\btincture\b/g, to: 'herbal tincture' },
  { from: /a herbal tincture/g, to: 'a spirit extraction' },
  { from: /the herbal tincture/g, to: 'this spirit extraction' },
  { from: /this herbal tincture/g, to: 'this spirit extraction' },
  { from: /A herbal tincture/g, to: 'A spirit extraction' },
  { from: /spirit extraction is/g, to: 'tincture is' },  // preserve heading if needed
  // carminative
  { from: /\bcarminative\b/g, to: 'wind-easing herb' },
  // demulcent
  { from: /\bdemulcent\b/g, to: 'soothing herb' },
  // volatile
  { from: /\bvolatile oil\b/g, to: 'aromatic oil' },
  { from: /\bvolatile oils\b/g, to: 'aromatic oils' },
  // antispasmodic
  { from: /\bantispasmodic\b/g, to: 'muscle-relaxing' },
  // vulnerary
  { from: /\bvulnerary\b/g, to: 'wound-supportive' },
  // diaphoretic
  { from: /\bdiaphoretic\b/g, to: 'sweat-promoting' },
  // catarrh
  { from: /\bcatarrh\b/g, to: 'mucus and congestion' },
  // hepatoprotective
  { from: /\bhepatoprotective\b/g, to: 'liver-protecting' },
  // hepatotoxic
  { from: /\bhepatotoxic\b/g, to: 'harmful to the liver' },
  { from: /\bhepatotoxicity\b/g, to: 'liver harm' },
  // constituents (should be done from pass 1 but may have missed some)
  { from: /\bconstituents?\b/g, to: 'active compounds' },
  // alterative
  { from: /\balterative\b/g, to: 'traditional cleansing herb' },
  // emmenagogue
  { from: /\bemmenagogue\b/g, to: 'uterine-stimulating' },
  // galactagogue
  { from: /\bgalactagogue\b/g, to: 'milk-increasing herb' },
  // rubefacient (in body prose where not in tooltip)
  { from: /\brubefacient\b/g, to: 'skin-warming herb' },
  // cholagogue
  { from: /\bcholagogue\b/g, to: 'bile-stimulating herb' },
  // lymphatic (standalone noun - keep as adjective modifier)
  // astringent - keep (widely understood)
  // Clean up artifacts
  { from: /nerve-calming herb niche/g, to: 'nervine niche' },  // restore specific usage in vervain
  { from: /specific nerve-calming herb niche/g, to: 'specific niche' },
  { from: /soaking process\b/g, to: 'soaking' },
  // Fix "pharmacopoeial" if still appearing
  { from: /\bpharmacopoeial\b/g, to: 'pharmacopoeia' },
]

function fixText(text) {
  if (!text) return text
  let result = text
  for (const { from, to } of TEXT_FIXES) {
    result = result.replace(from, to)
  }
  result = result.replace(/  +/g, ' ')
  result = result.replace(/ ,/g, ',')
  return result
}

function walkNode(node) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(walkNode)

  const isTooltipText = node.marks && node.marks.some(m => m.type === 'glossaryTooltip')
  if (isTooltipText) return node

  if (node.type === 'text' && typeof node.text === 'string') {
    const fixed = fixText(node.text)
    return fixed !== node.text ? { ...node, text: fixed } : node
  }

  if (node.type === 'infoPanel' && node.attrs && typeof node.attrs.body === 'string') {
    const fixed = fixText(node.attrs.body)
    return fixed !== node.attrs.body ? { ...node, attrs: { ...node.attrs, body: fixed } } : node
  }

  if (node.content) return { ...node, content: node.content.map(walkNode) }
  return node
}

function fixTopLevelStrings(obj) {
  const FIELDS = ['excerpt', 'subtitle', 'sourceNotes', 'makeAheadNotes', 'batchNotes', 'freezeNotes', 'temperatureNote']
  const result = { ...obj }
  for (const field of FIELDS) {
    if (typeof result[field] === 'string') result[field] = fixText(result[field])
  }
  if (result.recipe && typeof result.recipe === 'object') {
    result.recipe = { ...result.recipe }
    for (const f of ['makeAheadNotes', 'batchNotes', 'freezeNotes', 'temperatureNote']) {
      if (typeof result.recipe[f] === 'string') result.recipe[f] = fixText(result.recipe[f])
    }
  }
  return result
}

for (const filename of files) {
  const filepath = join(BRIEFS_DIR, filename)
  const raw = readFileSync(filepath, 'utf8')
  let doc
  try {
    doc = JSON.parse(raw)
  } catch (e) {
    console.error(`[PARSE ERROR] ${filename}: ${e.message}`)
    continue
  }

  const fixed1 = fixTopLevelStrings(doc)
  const newBody = fixed1.body ? walkNode(fixed1.body) : fixed1.body
  let newSched = fixed1.projectSchedule
  if (Array.isArray(newSched)) {
    newSched = newSched.map(step => ({
      ...step,
      title: typeof step.title === 'string' ? fixText(step.title) : step.title,
      body: typeof step.body === 'string' ? fixText(step.body) : step.body,
    }))
  }

  const finalDoc = { ...fixed1, body: newBody, projectSchedule: newSched }
  const finalStr = JSON.stringify(finalDoc, null, 2)
  if (finalStr !== raw) {
    writeFileSync(filepath, finalStr)
    console.log(`[fixed] ${filename}`)
    totalFilesChanged++
  }
}

console.log(`\nDone. Files changed: ${totalFilesChanged}`)
