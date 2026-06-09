import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

// Wrap the first occurrence of a term name in a body with a glossaryTooltip mark
function wrapFirstOccurrence(body, termSlug, termName) {
  let wrapped = false

  function walkNode(node) {
    if (wrapped) return node
    if (node.type === 'text' && node.text) {
      // Only wrap if not already wrapped with this tooltip
      const alreadyWrapped = node.marks && node.marks.some(m => m.type === 'glossaryTooltip' && m.attrs && m.attrs.termSlug === termSlug)
      if (!alreadyWrapped) {
        const lowerText = node.text.toLowerCase()
        const lowerTerm = termName.toLowerCase()
        const idx = lowerText.indexOf(lowerTerm)
        if (idx >= 0) {
          wrapped = true
          const before = node.text.slice(0, idx)
          const match = node.text.slice(idx, idx + termName.length)
          const after = node.text.slice(idx + termName.length)
          const existingMarks = node.marks ? node.marks.filter(m => m.type !== 'glossaryTooltip') : []
          const nodes = []
          if (before) nodes.push({ type: 'text', text: before, ...(existingMarks.length ? { marks: existingMarks } : {}) })
          nodes.push({ type: 'text', marks: [...existingMarks, { type: 'glossaryTooltip', attrs: { termSlug } }], text: match })
          if (after) nodes.push({ type: 'text', text: after, ...(existingMarks.length ? { marks: existingMarks } : {}) })
          return nodes
        }
      }
    }
    if (node.content) {
      const newContent = []
      for (const child of node.content) {
        if (wrapped) { newContent.push(child); continue }
        const result = walkNode(child)
        if (Array.isArray(result)) newContent.push(...result)
        else newContent.push(result)
      }
      return { ...node, content: newContent }
    }
    return node
  }

  return walkNode(body)
}

function getUsedTermSlugs(body) {
  const used = new Set()
  const walk = (node) => {
    if (!node) return
    if (node.marks) node.marks.forEach(m => { if (m.type === 'glossaryTooltip' && m.attrs?.termSlug) used.add(m.attrs.termSlug) })
    if (node.content) node.content.forEach(walk)
  }
  walk(body)
  return used
}

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()
let fixedCount = 0

for (const fname of files) {
  const path = `${dir}/${fname}`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  let changed = false

  const glossaryTerms = data.glossaryTerms || []
  const usedTermSlugs = getUsedTermSlugs(data.body)
  const missing = glossaryTerms.filter(t => !usedTermSlugs.has(t.slug))

  if (missing.length > 0) {
    for (const term of missing) {
      const newBody = wrapFirstOccurrence(data.body, term.slug, term.term)
      const nowUsed = getUsedTermSlugs(newBody)
      if (nowUsed.has(term.slug)) {
        data.body = newBody
        changed = true
        console.log(`  ${fname}: wrapped "${term.term}" (${term.slug})`)
      } else {
        console.log(`  ${fname}: COULD NOT WRAP "${term.term}" — term text not found in body`)
      }
    }
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2))
    fixedCount++
  }
}

console.log(`\nFixed ${fixedCount} files.`)
