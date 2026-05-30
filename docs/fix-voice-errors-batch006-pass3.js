// Fix pass 3 — 5 remaining voice-check failures
// node docs/fix-voice-errors-batch006-pass3.js

const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, 'pottery-ceramics-bulk-006-briefs')

function readFile(name) {
  return JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
}
function saveFile(name, data) {
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2), 'utf8')
  console.log(`SAVED ${name}`)
}

// ── FILE 28: grade 12.1 at orderedList[6] > listItem[2] > paragraph[0] > text ──
{
  const d = readFile('28-polymer-clay-sculpted-fox.tutorial.json')
  // Simplify the text node
  const node = d.body.content[6].content[2].content[0].content[0]
  node.text = 'Add the white belly area. Roll a thin sheet of white clay and press it onto the front of the body, from the base to about the midpoint. Stroke along the join line with a fingertip to blend the edge into the orange. This gives a soft colour change, not a hard line.'
  saveFile('28-polymer-clay-sculpted-fox.tutorial.json', d)
}

// ── FILE 30: gallery registered but not used inline ──
{
  const d = readFile('30-throwing-a-butter-dish-with-lid.tutorial.json')
  // Remove 'gallery' from glossaryTerms — it's declared but voice-check says it's not used inline
  // Better fix: search body for "gallery" and wrap one occurrence, OR just remove the declaration
  // Check if "gallery" text appears in body (without tooltip)
  const bodyStr = JSON.stringify(d.body)
  if (!bodyStr.includes('"termSlug":"gallery"') && !bodyStr.includes('"termSlug": "gallery"')) {
    // Not used inline — remove from glossaryTerms
    d.glossaryTerms = d.glossaryTerms.filter(t => t.slug !== 'gallery')
    console.log('FILE 30: removed unused "gallery" from glossaryTerms')
    saveFile('30-throwing-a-butter-dish-with-lid.tutorial.json', d)
  } else {
    console.log('FILE 30: gallery is used inline, no change needed')
  }
}

// ── FILE 33: banned phrase "essentially" at paragraph[1] ──
{
  const d = readFile('33-throwing-matched-nested-bowl-set.tutorial.json')
  const node = d.body.content[1]
  // Replace "essentially" in all text nodes
  function replaceEssentially(n) {
    if (n.type === 'text' && n.text && n.text.includes('essentially')) {
      n.text = n.text.replaceAll('essentially', 'above all')
    }
    if (Array.isArray(n.content)) n.content.forEach(replaceEssentially)
  }
  replaceEssentially(d.body)
  console.log('FILE 33: replaced "essentially" → "above all"')
  saveFile('33-throwing-matched-nested-bowl-set.tutorial.json', d)
}

// ── FILE 36: grade 14.2 at paragraph[1] ──
// The paragraph has a duplicated structure (agent prepended simplified text but left original)
// Rebuild paragraph[1] cleanly with short sentences + retained glossaryTooltip marks
{
  const d = readFile('36-terra-sigillata-burnishing-stoneware.tutorial.json')
  // Replace paragraph[1] content with a clean, simple structure
  d.body.content[1] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Terra sigillata is a very fine clay slip. It is made by deflocculating clay in water and letting the coarse particles settle out. Only the finest particles remain. These fine particles give the slip its burnishing quality.' },
      { type: 'text', text: ' Apply it to ' },
      { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'leather-hard', label: 'Leather-hard' } }], text: 'leather-hard' },
      { type: 'text', text: ' or near-' },
      { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'bone-dry', label: 'Bone-dry' } }], text: 'bone-dry' },
      { type: 'text', text: ' stoneware, then burnish with a smooth stone or the back of a spoon. The particles compact to give a low satin sheen. This sheen survives earthenware temperatures (cone 06 to cone 04, about 1000 to 1060 degrees C). At stoneware temperatures (cone 6, about 1220 degrees C), the body vitrifies and the sheen partly fades.' },
      { type: 'text', text: ' ' },
      { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'terra-sigillata', label: 'Terra sigillata' } }], text: 'Terra sigillata' },
      { type: 'text', text: ' works best as a single-fire earthenware surface, or on stoneware where a soft sheen is the aim.' },
    ],
  }
  console.log('FILE 36: rebuilt paragraph[1] with clean short sentences')
  saveFile('36-terra-sigillata-burnishing-stoneware.tutorial.json', d)
}

// ── FILE 40: grade 12.6 at paragraph[1] and 12.4 at paragraph[3] ──
{
  const d = readFile('40-electric-kiln-slow-cool-cycle.tutorial.json')

  // paragraph[1] — grade 12.6
  const p1node = d.body.content[1]
  // Replace text node(s) in this paragraph
  p1node.content = [
    { type: 'text', text: 'A slow cool cycle is a set descent rate added to a kiln firing schedule. It controls how fast the kiln cools after reaching peak temperature. The main reason to use one is to stop ' },
    { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'dunting', label: 'Dunting' } }], text: 'dunting' },
    { type: 'text', text: '. Dunting is cracking caused by passing too fast through 573 degrees C. At that point, silica in the clay shifts crystal form with a 2 percent volume change. A slow descent gives the clay time to adjust without cracking. A slow cool is also used for special-effect glazes. These glazes need the kiln held at a set temperature during the descent. Crystalline glazes, for example, form visible crystals during this hold.' },
  ]
  console.log('FILE 40: simplified paragraph[1]')

  // paragraph[3] — grade 12.4
  const p3node = d.body.content[3]
  p3node.content = [
    { type: 'text', text: 'Use a slow cool on any cone 6 glaze firing where the kiln would otherwise free-fall from peak temperature. Free-fall is faster than a controlled descent. It raises the risk of dunting, especially in thick-walled pieces and forms with abrupt thin-to-thick joins. A descent of 60 to 80 degrees C per hour from peak to 200 degrees C is a safe standard for smooth stoneware. A slow cool is less critical for ' },
    { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'bisque', label: 'Bisque' } }], text: 'bisque' },
    { type: 'text', text: ' firings. Bisque ware has not yet built up the silica structures that cause dunting at cone 6. It is still good practice for thick-walled greenware.' },
  ]
  console.log('FILE 40: simplified paragraph[3]')

  saveFile('40-electric-kiln-slow-cool-cycle.tutorial.json', d)
}

console.log('\nPass 3 done.')
