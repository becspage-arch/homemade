import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()
let fixedCount = 0

for (const fname of files) {
  const path = `${dir}/${fname}`
  const raw = readFileSync(path, 'utf8')
  let data = JSON.parse(raw)
  let changed = false

  // Fix 1: "genuinely" banned phrase in entry 004
  const bodyStr = JSON.stringify(data.body)
  if (bodyStr.includes('genuinely')) {
    data.body = JSON.parse(JSON.stringify(data.body, null, 0).replace(/genuinely/g, 'truly'))
    changed = true
  }

  // Fix 2: em dashes in excerpt (entry 043)
  if (data.excerpt && (data.excerpt.includes('–') || data.excerpt.includes('—'))) {
    data.excerpt = data.excerpt.replace(/—/g, ',').replace(/–/g, ' to ')
    changed = true
  }

  // Fix 3: Glossary coverage - ensure holbein-stitch and reading-a-counted-chart are wrapped inline
  // We need to check which glossary terms are registered and make sure at least one occurrence is wrapped
  const glossarySlugs = (data.glossaryTerms || []).map(t => t.slug)

  // Find all termSlugs already used in body
  const usedTermSlugs = new Set()
  const findUsedTerms = (node) => {
    if (!node) return
    if (node.marks) {
      for (const m of node.marks) {
        if (m.type === 'glossaryTooltip' && m.attrs && m.attrs.termSlug) {
          usedTermSlugs.add(m.attrs.termSlug)
        }
      }
    }
    if (node.content) node.content.forEach(findUsedTerms)
  }
  findUsedTerms(data.body)

  const missingTerms = glossarySlugs.filter(s => !usedTermSlugs.has(s))

  // Strategy: for missing terms, find the first text node that contains the term name and wrap it
  if (missingTerms.length > 0) {
    const termMap = {}
    for (const t of data.glossaryTerms) {
      if (missingTerms.includes(t.slug)) {
        termMap[t.slug] = t.term
      }
    }

    // Walk body and wrap first occurrence of each missing term
    const wrapTerms = (node, remaining) => {
      if (!remaining.size) return node
      if (node.type === 'text' && !node.marks?.some(m => m.type === 'glossaryTooltip')) {
        for (const [slug, term] of remaining) {
          // Case-insensitive check for the term in text
          const idx = node.text.toLowerCase().indexOf(term.toLowerCase())
          if (idx >= 0) {
            remaining.delete(slug)
            const before = node.text.slice(0, idx)
            const match = node.text.slice(idx, idx + term.length)
            const after = node.text.slice(idx + term.length)
            const nodes = []
            if (before) nodes.push({ type: 'text', text: before, ...(node.marks ? { marks: node.marks } : {}) })
            nodes.push({ type: 'text', marks: [...(node.marks || []), { type: 'glossaryTooltip', attrs: { termSlug: slug } }], text: match })
            if (after) nodes.push({ type: 'text', text: after, ...(node.marks ? { marks: node.marks } : {}) })
            return nodes
          }
        }
      }
      if (node.content) {
        const newContent = []
        for (const child of node.content) {
          if (!remaining.size) { newContent.push(child); continue }
          const result = wrapTerms(child, remaining)
          if (Array.isArray(result)) {
            newContent.push(...result)
          } else {
            newContent.push(result)
          }
        }
        return { ...node, content: newContent }
      }
      return node
    }

    const remainingSet = new Set(Object.keys(termMap).map(slug => [slug, termMap[slug]]).reduce((m, [k, v]) => { m.set(k, v); return m }, new Map()))
    data.body = wrapTerms(data.body, remainingSet)
    if (remainingSet.size < missingTerms.length) changed = true
  }

  // Fix 4: Grade level fixes for systematic list items
  // Fill patterns (009-023): orderedList[7] listItem[2] (index 1) - "Thread two strands of DMC 310. Work all horizontal and vertical runs first using Holbein stitch."
  // Border patterns (024-035): orderedList[7] listItem[2] (index 1) - "Thread two strands of DMC 310. Start at the centre and work outward to one end, then return to centre and work the other half."
  // All-over patterns (036-045): orderedList[7] listItem[3] (index 2) - "Complete the Holbein return pass before moving to the next row of tiles."

  const num = parseInt(fname.slice(0, 3))

  if (num >= 9 && num <= 23) {
    // Fill pattern: fix listItem[2] (index 1) in last orderedList
    const lists = data.body.content.filter(n => n.type === 'orderedList')
    const targetList = lists[lists.length - 1]
    if (targetList && targetList.content[1]) {
      const item = targetList.content[1]
      const para = item.content[0]
      if (para && para.content[0] && para.content[0].text && para.content[0].text.includes('horizontal and vertical')) {
        para.content[0].text = 'Thread two strands of DMC 310. Work the horizontal runs first, then the vertical runs, using Holbein stitch.'
        changed = true
      }
    }
  }

  if (num >= 24 && num <= 35) {
    // Border pattern: fix listItem[2] (index 1) in last orderedList
    const lists = data.body.content.filter(n => n.type === 'orderedList')
    const targetList = lists[lists.length - 1]
    if (targetList && targetList.content[1]) {
      const item = targetList.content[1]
      const para = item.content[0]
      if (para && para.content[0] && para.content[0].text && para.content[0].text.includes('Start at the centre')) {
        para.content[0].text = 'Thread two strands of DMC 310. Start at the centre. Work to one end, then return to the centre and work the other half.'
        changed = true
      }
    }
  }

  if (num >= 36 && num <= 45) {
    // All-over pattern: fix listItem[3] (index 2) in last orderedList
    const lists = data.body.content.filter(n => n.type === 'orderedList')
    const targetList = lists[lists.length - 1]
    if (targetList && targetList.content[2]) {
      const item = targetList.content[2]
      const para = item.content[0]
      if (para && para.content[0] && para.content[0].text && para.content[0].text.includes('return pass')) {
        para.content[0].text = 'Finish the Holbein return pass before moving to the next row of tiles.'
        changed = true
      }
    }
  }

  // Fix 5: Entry 001 - glossary term "reading-a-counted-chart" not used inline
  // Fix 6: Entry 003 - glossary term "tying-off-cleanly" not used inline
  // Fix 7: Entries 005, 006, 008 - grade level issues (need to read those)
  // Fix 8: Entry 050 - grade level in paragraph[0]

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2))
    fixedCount++
    console.log(`Fixed: ${fname}`)
  }
}

console.log(`\nFixed ${fixedCount} files.`)
