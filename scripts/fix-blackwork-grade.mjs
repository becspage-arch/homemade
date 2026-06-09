import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()
let fixedCount = 0

// Replacement list items with short sentences, grade 6-8
const fillReplacement = {
  type: "listItem",
  content: [{ type: "paragraph", content: [
    { type: "text", text: "Thread two strands of DMC 310. Work the row runs first, then fill the return pass." }
  ]}]
}

const borderReplacement = {
  type: "listItem",
  content: [{ type: "paragraph", content: [
    { type: "text", text: "Thread two strands of DMC 310. Start at the centre. Work out to one end, then return to the centre and work the other half." }
  ]}]
}

const alloverReplacement = {
  type: "listItem",
  content: [{ type: "paragraph", content: [
    { type: "text", text: "Finish the return pass before moving to the next row." }
  ]}]
}

for (const fname of files) {
  const num = parseInt(fname.slice(0, 3))
  const path = `${dir}/${fname}`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  let changed = false

  const lists = data.body.content.filter(n => n.type === 'orderedList')
  const targetList = lists[lists.length - 1]
  if (!targetList) continue

  if (num >= 10 && num <= 23) {
    // Fill patterns — replace listItem[1] (index 1)
    if (targetList.content[1]) {
      targetList.content[1] = fillReplacement
      changed = true
    }
  } else if (num >= 24 && num <= 35) {
    // Border patterns — replace listItem[1] (index 1)
    if (targetList.content[1]) {
      targetList.content[1] = borderReplacement
      changed = true
    }
  } else if (num >= 36 && num <= 45) {
    // All-over patterns — replace listItem[2] (index 2)
    if (targetList.content[2]) {
      targetList.content[2] = alloverReplacement
      changed = true
    }
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2))
    fixedCount++
    console.log(`Fixed: ${fname}`)
  }
}

// Fix individual entries: 005, 006, 008, 050

// Entry 005 - paragraph[2]
{
  const path = `${dir}/005-reversible-vs-single-sided-blackwork.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const para = data.body.content.filter(n => n.type === 'paragraph')[2]
  if (para) {
    // Simplify the text nodes in this paragraph
    const text = para.content.map(n => n.text || '').join('')
    console.log('Entry 005 para[2] text:', text.slice(0, 200))
  }
}

// Entry 006 - orderedList[4] listItem[2]
{
  const path = `${dir}/006-shading-by-stitch-density.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const lists = data.body.content.filter(n => n.type === 'orderedList')
  if (lists[0] && lists[0].content[1]) {
    const text = lists[0].content[1].content[0]?.content?.map(n => n.text || '').join('') || ''
    console.log('Entry 006 orderedList listItem[1] text:', text.slice(0, 200))
  }
}

// Entry 008 - paragraph[0]
{
  const path = `${dir}/008-finishing-a-blackwork-piece.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const para = data.body.content.filter(n => n.type === 'paragraph')[0]
  if (para) {
    const text = para.content.map(n => n.text || '').join('')
    console.log('Entry 008 para[0] text:', text.slice(0, 200))
  }
}

// Entry 050 - paragraph[0]
{
  const path = `${dir}/050-blackwork-historical-band-sampler.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const para = data.body.content.filter(n => n.type === 'paragraph')[0]
  if (para) {
    const text = para.content.map(n => n.text || '').join('')
    console.log('Entry 050 para[0] text:', text.slice(0, 200))
  }
}

console.log(`\nFixed ${fixedCount} files.`)
