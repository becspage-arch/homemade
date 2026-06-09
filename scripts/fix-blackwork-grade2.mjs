import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()
let fixedCount = 0

for (const fname of files) {
  const num = parseInt(fname.slice(0, 3))
  const path = `${dir}/${fname}`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  let changed = false

  // Fills (010-023): body.content[7].content[2] = "Complete diagonal elements last, again with the Holbein double-running two-pass method."
  if (num >= 10 && num <= 23) {
    const list = data.body.content[7]
    if (list?.type === 'orderedList' && list.content[2]) {
      const para = list.content[2].content[0]
      if (para?.content?.[0]?.text?.includes('double-running two-pass')) {
        para.content[0].text = 'Add any diagonal lines last.'
        changed = true
      }
    }
  }

  // Borders (024-035): body.content[7].content[2] = nodes about "horizontal and vertical elements"
  if (num >= 24 && num <= 35) {
    const list = data.body.content[7]
    if (list?.type === 'orderedList' && list.content[2]) {
      const para = list.content[2].content[0]
      if (para?.content) {
        const allText = para.content.map(n => n.text || '').join('')
        if (allText.includes('horizontal and vertical') || allText.includes('Work horizontal')) {
          para.content = [{ type: 'text', text: 'Work the straight lines first, then add any diagonal lines.' }]
          changed = true
        }
      }
    }
  }

  // All-overs (036-045): body.content[7].content[3] = "Work diagonal and vertical elements after the horizontal runs are complete."
  if (num >= 36 && num <= 45) {
    const list = data.body.content[7]
    if (list?.type === 'orderedList' && list.content[3]) {
      const para = list.content[3].content[0]
      if (para?.content?.[0]?.text?.includes('diagonal and vertical')) {
        para.content[0].text = 'Add diagonal lines once the main runs are done.'
        changed = true
      }
    }
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2))
    fixedCount++
    console.log(`Fixed: ${fname}`)
  }
}

// Fix entry 005 - need to see what body.content[2].content looks like
{
  const path = `${dir}/005-reversible-vs-single-sided-blackwork.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  data.body.content.forEach((n, i) => {
    if (n.type === 'paragraph') {
      const text = n.content?.map(c => c.text || '').join('') || ''
      if (text.length > 0) console.log(`005 body[${i}] para: ${text.slice(0, 100)}`)
    }
  })
}

// Fix entry 006 - show orderedList[4] listItem[2]
{
  const path = `${dir}/006-shading-by-stitch-density.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const list = data.body.content[4]
  if (list?.type === 'orderedList' && list.content[1]) {
    const text = list.content[1].content[0]?.content?.map(n => n.text || '').join('') || ''
    console.log(`006 orderedList[4] listItem[1] text: ${text.slice(0, 150)}`)
  }
}

// Fix entry 008 - show paragraph[6]
{
  const path = `${dir}/008-finishing-a-blackwork-piece.json`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const item = data.body.content[6]
  if (item?.type === 'paragraph') {
    const text = item.content?.map(c => c.text || '').join('') || ''
    console.log(`008 body[6] para: ${text.slice(0, 150)}`)
  }
}

console.log(`\nFixed ${fixedCount} files.`)
