/**
 * Extract the current text content for each grade-level error location.
 * Path notation: paragraph[N] means Nth element in body.content with type === "paragraph"
 * Similarly for bulletList[N], orderedList[N], troubleshooter[N]
 * listItem[M] means M-th element in the parent's content with type === "listItem"
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefDir = join(__dirname, 'pottery-ceramics-bulk-009-briefs')

const ERRORS = [
  // file, path-segments, grade
  ['02-pinch-pot-textured-salt-cellar.json', 'paragraph[1]', 15.6],
  ['02-pinch-pot-textured-salt-cellar.json', 'bulletList[14].listItem[0].paragraph[0]', 12.5],
  ['02-pinch-pot-textured-salt-cellar.json', 'bulletList[14].listItem[2].paragraph[0]', 12.4],
  ['02-slab-built-rectangular-serving-board.json', 'orderedList[7].listItem[5].paragraph[0]', 13.4],
  ['02-slab-built-rectangular-serving-board.json', 'paragraph[15]', 13.6],
  ['03-coil-built-sculptural-abstract-vase.json', 'bulletList[14].listItem[2].paragraph[0]', 12.7],
  ['03-coil-built-tall-storage-canister.json', 'paragraph[20]', 12.9],
  ['05-paper-clay-angel-wing-wall-hanging.json', 'bulletList[12].listItem[0].paragraph[0]', 12.1],
  ['06-polymer-clay-planet-mobile-set.json', 'paragraph[17]', 13.5],
  ['06-slab-built-rectangular-soap-dish.json', 'bulletList[13].listItem[0].paragraph[0]', 14.5],
  ['07-slab-built-geometric-picture-frame.json', 'orderedList[5].listItem[2].paragraph[0]', 13.7],
  ['07-slab-built-geometric-picture-frame.json', 'orderedList[7].listItem[1].paragraph[0]', 12.8],
  ['08-coil-built-vase-with-flared-rim.json', 'paragraph[20]', 12.7],
  ['08-pinch-pot-cactus-planter.json', 'paragraph[0]', 16.5],
  ['09-polymer-clay-galaxy-swirl-pendant.json', 'orderedList[7].listItem[0].paragraph[0]', 16.1],
  ['10-air-dry-clay-mosaic-picture-frame.json', 'orderedList[5].listItem[3].paragraph[0]', 14.8],
  ['10-pinch-pot-whale-sea-life-figurine.json', 'orderedList[11].listItem[0].paragraph[0]', 15.8],
  ['10-pinch-pot-whale-sea-life-figurine.json', 'paragraph[21]', 12.6],
  ['11-mishima-inlay-on-leather-hard-clay.json', 'paragraph[1]', 12.6],
  ['12-engobe-layer-brushwork-on-air-dry.json', 'paragraph[0]', 15.1],
  ['12-engobe-layer-brushwork-on-air-dry.json', 'paragraph[1]', 12.5],
  ['12-slab-built-hanging-crescent-planter.json', 'orderedList[5].listItem[1].paragraph[0]', 12.3],
  ['13-marbling-two-underglazes-on-bisqueware.json', 'orderedList[5].listItem[2].paragraph[0]', 13.6],
  ['13-paper-clay-sculpted-lighthouse.json', 'paragraph[18]', 13.0],
  ['14-crackle-paste-texture-on-air-dry-clay.json', 'paragraph[0]', 12.2],
  ['15-feather-impressing-into-clay.json', 'orderedList[4].listItem[5].paragraph[0]', 14.2],
  ['15-polymer-clay-sculpted-cat-brooch.json', 'orderedList[7].listItem[2].paragraph[0]', 12.2],
  ['15-polymer-clay-sculpted-cat-brooch.json', 'troubleshooter[22].item[0].fix', 13.4],
  ['16-stencil-acrylic-paint-on-air-dry-clay.json', 'paragraph[0]', 12.9],
  ['17-wood-stamp-decoration-on-clay.json', 'paragraph[0]', 15.3],
  ['17-wood-stamp-decoration-on-clay.json', 'orderedList[6].listItem[4].paragraph[0]', 12.8],
  ['18-trailing-coloured-slip-on-wet-clay.json', 'paragraph[0]', 12.3],
  ['20-air-dry-clay-succulent-pot-with-drainage.json', 'orderedList[11].listItem[0].paragraph[0]', 17.2],
  ['20-air-dry-clay-succulent-pot-with-drainage.json', 'orderedList[11].listItem[1].paragraph[0]', 15.2],
  ['20-clay-reclaim-from-trimmings.json', 'orderedList[2].listItem[4].paragraph[0]', 17.1],
  ['21-choosing-clay-body-for-project-type.json', 'bulletList[8].listItem[4].paragraph[0]', 14.7],
  ['23-coil-built-nesting-bowls-set.json', 'paragraph[15]', 16.6],
  ['24-making-and-using-texture-rollers.json', 'paragraph[0]', 14.3],
  ['25-polymer-clay-millefiori-ring.json', 'troubleshooter[15].item[2].cause', 13.1],
  ['25-understanding-grog-and-its-uses.json', 'paragraph[0]', 14.3],
  ['25-understanding-grog-and-its-uses.json', 'orderedList[5].listItem[1].paragraph[0]', 13.4],
  ['25-understanding-grog-and-its-uses.json', 'bulletList[7].listItem[2].paragraph[0]', 13.5],
  ['25-understanding-grog-and-its-uses.json', 'paragraph[9]', 13.8],
  ['26-air-dry-clay-botanical-impression-tiles-set.json', 'paragraph[13]', 12.6],
  ['27-pinch-pot-trio-ring-dish-set.json', 'orderedList[6].listItem[8].paragraph[0]', 17.2],
  ['28-centring-and-opening-porcelain-clay.json', 'paragraph[1]', 12.3],
  ['28-centring-and-opening-porcelain-clay.json', 'orderedList[7].listItem[0].paragraph[0]', 12.6],
  ['28-polymer-clay-terrarium-animals-set.json', 'paragraph[15]', 12.5],
  ['29-texture-stamping-systematic-approach.json', 'paragraph[0]', 12.2],
  ['29-texture-stamping-systematic-approach.json', 'paragraph[4]', 12.8],
  ['29-texture-stamping-systematic-approach.json', 'orderedList[7].listItem[6].paragraph[0]', 13.2],
  ['29-texture-stamping-systematic-approach.json', 'paragraph[15]', 13.0],
  ['31-throwing-a-stoneware-batter-bowl-with-spout.json', 'paragraph[24]', 12.5],
  ['31-throwing-a-wide-pouring-lip-jug.json', 'paragraph[1]', 14.4],
  ['34-layering-two-commercial-glazes-for-effect.json', 'orderedList[8].listItem[0].paragraph[0]', 13.9],
  ['34-throwing-a-soap-dish-with-drainage-ribs.json', 'paragraph[1]', 12.3],
  ['34-throwing-a-soap-dish-with-drainage-ribs.json', 'paragraph[23]', 13.2],
  ['35-glaze-pen-decoration-on-bisqueware.json', 'paragraph[0]', 12.1],
  ['35-glaze-pen-decoration-on-bisqueware.json', 'paragraph[2]', 12.1],
  ['35-throwing-a-porcelain-wall-pocket-vase.json', 'orderedList[8].listItem[3].paragraph[0]', 17.6],
  ['36-applying-coloured-slips-to-greenware.json', 'paragraph[4]', 12.9],
  ['37-reactive-shino-glaze-application.json', 'paragraph[1]', 13.0],
  ['37-sodium-silicate-crackle-technique.json', 'paragraph[1]', 12.5],
  ['37-sodium-silicate-crackle-technique.json', 'orderedList[8].listItem[2].paragraph[0]', 12.2],
  ['37-sodium-silicate-crackle-technique.json', 'paragraph[10]', 13.3],
  ['38-throwing-a-stoneware-baking-dish.json', 'paragraph[1]', 12.6],
  ['39-saggar-firing-technique.json', 'paragraph[1]', 14.0],
  ['40-anagama-kiln-introduction.json', 'orderedList[5].listItem[2].paragraph[0]', 16.1],
  ['40-anagama-kiln-introduction.json', 'orderedList[7].listItem[1].paragraph[0]', 13.8],
  ['40-anagama-kiln-introduction.json', 'bulletList[11].listItem[3].paragraph[0]', 12.3],
  ['40-mixing-a-cone-6-clear-liner-glaze.json', 'paragraph[0]', 12.3],
  ['40-mixing-a-cone-6-clear-liner-glaze.json', 'paragraph[1]', 14.3],
  ['40-mixing-a-cone-6-clear-liner-glaze.json', 'paragraph[4]', 16.4],
]

// Navigate body.content using the path string
// path: "paragraph[1]" or "orderedList[7].listItem[5].paragraph[0]" etc.
function navigate(body, path) {
  const segments = path.split('.')
  let current = body.content
  let parent = null
  let parentKey = null

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const m = seg.match(/^(\w+)\[(\d+)\]$/)
    if (!m) throw new Error(`Bad segment: ${seg}`)
    const [, type, idxStr] = m
    const idx = parseInt(idxStr, 10)

    if (type === 'item') {
      // troubleshooter item: current is attrs.items
      parent = current
      parentKey = idx
      current = current[idx]
    } else if (i === segments.length - 1 && (type === 'paragraph' || type === 'bulletList' || type === 'orderedList')) {
      // Last segment: find Nth node of this type
      let count = 0
      for (const node of current) {
        if (node.type === type) {
          if (count === idx) { parent = current; parentKey = current.indexOf(node); current = node; break }
          count++
        }
      }
    } else if (type === 'listItem') {
      // listItem: find Nth listItem in current.content
      let count = 0
      const arr = Array.isArray(current) ? current : current.content
      for (const node of arr) {
        if (node.type === 'listItem') {
          if (count === idx) { parent = arr; parentKey = arr.indexOf(node); current = node; break }
          count++
        }
      }
    } else if (type === 'troubleshooter') {
      // Find Nth troubleshooter
      let count = 0
      for (const node of current) {
        if (node.type === 'troubleshooter') {
          if (count === idx) { parent = current; parentKey = current.indexOf(node); current = node; break }
          count++
        }
      }
    } else {
      // Generic: find Nth node of this type
      let count = 0
      const arr = Array.isArray(current) ? current : current.content
      for (const node of arr) {
        if (node.type === type) {
          if (count === idx) { parent = arr; parentKey = arr.indexOf(node); current = node; break }
          count++
        }
      }
    }
  }
  return current
}

function getText(node, path) {
  // Special case: troubleshooter item field
  if (path.includes('.item[')) {
    const m = path.match(/\.item\[(\d+)\]\.(cause|fix|problem)$/)
    if (m) {
      return node[m[2]] || ''
    }
  }
  // For paragraph/listItem nodes: collect all text
  if (!node || !node.content) return String(node || '')
  return node.content.map(n => n.text || '').join('')
}

function navigateTroubleshooterItem(json, path) {
  // e.g. "troubleshooter[22].item[0].fix"
  const m = path.match(/^troubleshooter\[(\d+)\]\.item\[(\d+)\]\.(cause|fix|problem)$/)
  if (!m) return null
  const [, tsIdx, itemIdx, field] = m
  let count = 0
  for (const node of json.body.content) {
    if (node.type === 'troubleshooter') {
      if (count === parseInt(tsIdx)) {
        return { node, itemIdx: parseInt(itemIdx), field, text: node.attrs.items[parseInt(itemIdx)][field] }
      }
      count++
    }
  }
  return null
}

for (const [file, path, grade] of ERRORS) {
  const json = JSON.parse(readFileSync(join(briefDir, file), 'utf8'))
  let text
  try {
    if (path.startsWith('troubleshooter[')) {
      const result = navigateTroubleshooterItem(json, path)
      text = result ? result.text : '(not found)'
    } else {
      const node = navigate(json.body, path)
      text = getText(node, path)
    }
    console.log(`FILE: ${file}`)
    console.log(`PATH: ${path}`)
    console.log(`GRADE: ${grade}`)
    console.log(`TEXT: ${text}`)
    console.log('---')
  } catch(e) {
    console.log(`FILE: ${file} PATH: ${path} ERROR: ${e.message}`)
    console.log('---')
  }
}
