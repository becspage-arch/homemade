// Converts ingredientsList nodes from old content[] format to new attrs.items[] format
// Old: { type: "ingredientsList", content: [{ type: "ingredientItem", attrs: { slug, amount, unit, prepNote } }] }
// New: { type: "ingredientsList", attrs: { defaultServings: null, items: [{ ingredientSlug, amount, unit, prepNote, isOptional, groupLabel }] } }

const fs = require('fs')
const path = require('path')

const dir = path.dirname(__filename)

function convertIngredientsListNode(node, groupLabel) {
  if (node.type !== 'ingredientsList') return node

  // Already in new format
  if (node.attrs && Array.isArray(node.attrs.items)) return node

  const content = node.content || []
  const items = content
    .filter(c => c.type === 'ingredientItem')
    .map(c => ({
      ingredientSlug: c.attrs.slug,
      amount: c.attrs.amount,
      unit: c.attrs.unit,
      prepNote: c.attrs.prepNote || null,
      isOptional: false,
      groupLabel: groupLabel || null
    }))

  return {
    type: 'ingredientsList',
    attrs: {
      defaultServings: null,
      items
    }
  }
}

function processBody(body) {
  if (!body || !body.content) return body

  const newContent = []
  let pendingGroupLabel = null

  for (let i = 0; i < body.content.length; i++) {
    const node = body.content[i]

    if (node.type === 'heading' && node.attrs && node.attrs.level === 3) {
      // Check if next sibling is an ingredientsList
      const nextNode = body.content[i + 1]
      if (nextNode && nextNode.type === 'ingredientsList') {
        // Extract the heading text as the groupLabel
        const headingText = (node.content || []).map(c => c.text || '').join('')
        pendingGroupLabel = headingText || null
        newContent.push(node)
        continue
      }
    }

    if (node.type === 'ingredientsList') {
      newContent.push(convertIngredientsListNode(node, pendingGroupLabel))
      pendingGroupLabel = null
      continue
    }

    pendingGroupLabel = null
    newContent.push(node)
  }

  return { ...body, content: newContent }
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

let converted = 0
let skipped = 0

for (const file of files) {
  const filepath = path.join(dir, file)
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))

  if (!data.body) { skipped++; continue }

  const newBody = processBody(data.body)
  const newData = { ...data, body: newBody }

  fs.writeFileSync(filepath, JSON.stringify(newData, null, 2) + '\n')
  converted++
  console.log(`  converted: ${file}`)
}

console.log(`\nDone: ${converted} converted, ${skipped} skipped`)
