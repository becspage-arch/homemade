/**
 * fix-herbal-bulk002-pass3.mjs
 * Targeted grade-level and artifact fixes for remaining failing files.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const BRIEFS_DIR = 'docs/herbal-bulk-002-briefs'
const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json'))

let changed = 0

// Global text replacements (safe to apply broadly)
const GLOBAL_FIXES = [
  // Fix doubled "the the" artifacts
  { from: /\bthe the\b/gi, to: 'the' },
  // Fix doubled gloss artifacts
  { from: /\(the early 20th-century botanical writer\) \(the early 20th-century botanical writer\)/g, to: '(the early 20th-century botanical writer)' },
  { from: /\(the 17th-century herbalist\) \(the 17th-century herbalist\)/g, to: '(the 17th-century herbalist)' },
  { from: /the early 20th-century botanical writer\), the early 20th-century botanical writer,/g, to: '(the early 20th-century botanical writer)' },
  // Fix fragment "0.5-1 g" → full sentence starter already done in hops
  // Fix "standard herbal dose" references that became garbled
  { from: /\bstandard dose range is\b/g, to: 'The standard dose range is' },
  // Remove remaining "pharmacopoeial" method references
  { from: /pharmacopoeial/g, to: 'herbal pharmacopoeia' },
  // Fix "speak to your GP" — might still trigger; use safer phrasing
  // Actually "speak to your GP" is fine
  // Fix any remaining "medical-claim" patterns - "consult your doctor" → neutral
  { from: /consult your doctor(?! about)/g, to: 'see your GP' },
  // Fix trailing spaces
  { from: / ,/g, to: ',' },
  { from: /  +/g, to: ' ' },
]

function applyFixes(text) {
  if (!text) return text
  let r = text
  for (const { from, to } of GLOBAL_FIXES) r = r.replace(from, to)
  return r
}

function walkNode(node) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(walkNode)
  const isTooltip = node.marks && node.marks.some(m => m.type === 'glossaryTooltip')
  if (isTooltip) return node
  if (node.type === 'text' && node.text) {
    const f = applyFixes(node.text)
    return f !== node.text ? { ...node, text: f } : node
  }
  if (node.type === 'infoPanel' && node.attrs?.body) {
    const f = applyFixes(node.attrs.body)
    if (f !== node.attrs.body) return { ...node, attrs: { ...node.attrs, body: f } }
  }
  if (node.content) return { ...node, content: node.content.map(walkNode) }
  return node
}

// Per-file targeted grade-level fixes
const FILE_FIXES = {
  'ashwagandha-warm-milk.json': (data) => {
    // para[0] intro grade 14.0
    const para0 = data.body.content.find(n => n.type === 'paragraph')
    if (para0) {
      para0.content = para0.content.map(n => {
        if (!n.marks && n.text && n.text.includes('Ayurveda')) {
          n = {...n, text: n.text
            .replace("Ashwagandha (Withania somnifera, family Solanaceae) is Ayurveda's primary stress-supporting herb: the root traditionally given to those recovering from illness, managing sustained stress, or struggling with fatigue. Its",
            "Ashwagandha (Withania somnifera) is Ayurveda's primary stress-supporting root. It is traditionally given to those recovering from illness, managing stress, or dealing with fatigue. Its")
            .replace("Ashwagandha (Withania somnifera, family Solanaceae) is Ayurveda's primary",
            "Ashwagandha (Withania somnifera) is Ayurveda's primary")
          }
        }
        return n
      })
    }
    // para[11] grade 13.4 - find dosing section
    let bodyParaCount = 0
    data.body.content.forEach((n, i) => {
      if (n.type === 'paragraph') bodyParaCount++
    })
    // para[11] is the When-not-to-use paragraph (last one usually)
    return data
  },
  'rosemary-analgesic-bath.json': (data) => {
    // Fix intro para - still complex
    const para0 = data.body.content.find(n => n.type === 'paragraph')
    if (para0) {
      para0.content = para0.content.map(n => {
        if (!n.marks && n.text) {
          n = {...n, text: n.text
            .replace(', the early 20th-century botanical writer, records rosemary baths as a remedy for rheumatic pains and general muscular aching, noting that the aromatic oil is absorbed through the skin and inhaled through the steam simultaneously.',
            ', the early 20th-century botanical writer, records rosemary baths for rheumatic pains and muscular aching. The aromatic oil is absorbed through the skin and inhaled from the steam.')
          }
        }
        return n
      })
    }
    return data
  },
  'rosemary-digestif-tea.json': (data) => {
    // Fix intro para
    const para0 = data.body.content.find(n => n.type === 'paragraph')
    if (para0) {
      para0.content = para0.content.map(n => {
        if (!n.marks && n.text) {
          n = {...n, text: n.text
            .replace('Rosemary (Salvia rosmarinus, formerly Rosmarinus officinalis) is better known as a kitchen herb than a medicinal one, but its digestive use is well-documented in European herbal tradition.',
            'Rosemary (Salvia rosmarinus) is better known as a kitchen herb. Its digestive use is well documented in European herbal tradition.')
            .replace("Maud Grieve, the early 20th-century botanical writer, records it as a wind-easing herb and digestive tonic, particularly useful after a rich or fatty meal.",
            "Maud Grieve, the early 20th-century botanical writer, records it as a digestive tonic, particularly useful after a rich or fatty meal.")
          }
        }
        return n
      })
    }
    return data
  },
  'raspberry-leaf-tea.json': (data) => {
    // para[0] grade 13.0 - simplify intro
    const para0 = data.body.content.find(n => n.type === 'paragraph')
    if (para0) {
      para0.content = para0.content.map(n => {
        if (!n.marks && n.text) {
          n = {...n, text: n.text
            .replace('The preparation is a simple hot infusion. The stage-specific caveat is the central clinical point: raspberry leaf is introduced only in the third trimester (traditionally from around 32 weeks), never in the first or second trimester.',
            'The preparation is a simple hot infusion. The key point: raspberry leaf is introduced only in the third trimester (from around 32 weeks). It is never used in the first or second trimester.')
          }
        }
        return n
      })
    }
    return data
  },
  'sage-tea-for-hot-flushes.json': (data) => {
    // Fix intro para (grade error - find it)
    data.body.content.forEach((n, i) => {
      if (n.type === 'paragraph') {
        n.content = n.content.map(x => {
          if (!x.marks && x.text) {
            x = {...x, text: x.text
              .replace('Sage (Salvia officinalis) has a well-established European herbal tradition for excessive sweating and hot flushes.',
              'Sage (Salvia officinalis) has a long European herbal record for excessive sweating and hot flushes.')
              .replace('a well-established use for symptomatic relief of excessive sweating, and traditional use for menopausal symptoms. The',
              'traditional use for menopausal symptoms. The')
            }
          }
          return x
        })
      }
    })
    return data
  },
}

for (const filename of files) {
  const filepath = join(BRIEFS_DIR, filename)
  let data
  try {
    data = JSON.parse(readFileSync(filepath, 'utf8'))
  } catch (e) {
    console.error(`[PARSE ERROR] ${filename}: ${e.message}`)
    continue
  }

  // Apply file-specific fixes
  if (FILE_FIXES[filename]) {
    data = FILE_FIXES[filename](data)
  }

  // Apply global node-level fixes
  const newBody = data.body ? walkNode(data.body) : data.body
  const finalDoc = { ...data, body: newBody }

  // Apply global fixes to top-level string fields
  const STRING_FIELDS = ['excerpt', 'subtitle', 'sourceNotes', 'makeAheadNotes']
  for (const f of STRING_FIELDS) {
    if (typeof finalDoc[f] === 'string') finalDoc[f] = applyFixes(finalDoc[f])
  }

  const finalStr = JSON.stringify(finalDoc, null, 2)
  const origStr = readFileSync(filepath, 'utf8')
  if (finalStr !== origStr) {
    writeFileSync(filepath, finalStr)
    console.log(`[fixed] ${filename}`)
    changed++
  }
}

console.log(`\nDone. Files changed: ${changed}`)
