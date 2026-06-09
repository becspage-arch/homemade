import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

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

function getAllTextNodes(body) {
  const nodes = []
  const walk = (node, path) => {
    if (!node) return
    if (node.type === 'text') nodes.push({ node, path })
    if (node.content) node.content.forEach((c, i) => walk(c, [...path, i]))
  }
  walk(body, [])
  return nodes
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

  if (missing.length === 0) continue

  for (const term of missing) {
    // Strategy: remove the unresolvable glossary term from registered list
    // (simpler and cleaner than injecting text into the body)
    console.log(`  ${fname}: removing unresolvable glossary term "${term.term}" (${term.slug})`)
    data.glossaryTerms = data.glossaryTerms.filter(t => t.slug !== term.slug)
    changed = true
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2))
    fixedCount++
  }
}

console.log(`\nFixed ${fixedCount} files.`)
