import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '../docs/needlework-blackwork-bulk-001-briefs')

function fix(fname, fn) {
  const path = `${dir}/${fname}`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  fn(data)
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`Fixed: ${fname}`)
}

// Entry 005: paragraph[2] - simplify "reversibility"
fix('005-reversible-vs-single-sided-blackwork.json', (data) => {
  const paras = data.body.content.filter(n => n.type === 'paragraph')
  paras[2].content[0].text = 'Framed work, cushions, and lined items do not need a tidy back. Single-sided back stitch is faster and fills the area more quickly.'
})

// Entry 006: orderedList listItem[1] paragraph
fix('006-shading-by-stitch-density.json', (data) => {
  const lists = data.body.content.filter(n => n.type === 'orderedList')
  const list = lists[0]
  if (list && list.content[1]) {
    list.content[1].content[0].content[0].text = 'Hold the samples at arm\'s length. Rank them from lightest to darkest. Label each one so you can refer to the ranking later.'
  }
})

// Entry 008: paragraph[0] - simplify complex sentence
fix('008-finishing-a-blackwork-piece.json', (data) => {
  const paras = data.body.content.filter(n => n.type === 'paragraph')
  paras[0].content[0].text = 'Once the last stitch is in place and all threads are tied off, the finishing steps take about thirty minutes. They make a clear difference to the final result.'
})

// Entry 050: paragraph[0] - simplify complex sentence
fix('050-blackwork-historical-band-sampler.json', (data) => {
  const paras = data.body.content.filter(n => n.type === 'paragraph')
  // Find the first paragraph text node
  const firstPara = paras[0]
  // Text is split across multiple nodes (glossaryTooltip wrapped)
  // Find the last text node which likely has the complex sentence
  // We need to look at all text nodes in the paragraph
  const lastNode = firstPara.content[firstPara.content.length - 1]
  if (lastNode && lastNode.text && lastNode.text.includes('On 28-count')) {
    lastNode.text = '. On 28-count evenweave it measures about 20 by 30 cm.'
  } else {
    // rebuild para to simplify
    firstPara.content = [
      { type: 'text', text: 'The historical-style band ' },
      { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'sampler' } }], text: 'sampler' },
      { type: 'text', text: ' brings all the blackwork elements together: an outer border, fill bands, and a central motif. On 28-count ' },
      { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'evenweave' } }], text: 'evenweave' },
      { type: 'text', text: ' the finished piece is about 20 by 30 cm.' }
    ]
  }
})

console.log('Done.')
