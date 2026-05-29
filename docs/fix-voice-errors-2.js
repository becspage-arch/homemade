const fs = require('fs');
const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/pottery-ceramics-bulk-004-briefs';

function load(f) { return JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
function save(f, d) { fs.writeFileSync(dir + '/' + f, JSON.stringify(d, null, 2), 'utf8'); }

// File 09: paragraph[0] text node[2] - grade 13.3
{
  const d = load('09-majolica-style-painted-tile.json');
  const n = d.body.content[0].content[2];
  n.text = ' tradition is a style of decorated European ceramic with an opaque white ground and strong-coloured painted motifs, often botanical or geometric. This tutorial makes one decorative tile using air-dry clay and acrylic paints instead of tin glaze. The tile is not food-safe or waterproof, but works well as wall art.';
  save('09-majolica-style-painted-tile.json', d);
  console.log('09: fixed paragraph[0] text[2]');
}

// File 11: paragraph[0] text node[2] - grade 12.3
{
  const d = load('11-iron-oxide-wash-on-air-dry-clay.json');
  const n = d.body.content[0].content[2];
  n.text = ' wash is a mix of iron oxide powder and water brushed over dry clay. In kiln-fired ceramics, the colour changes as it fuses into the clay during firing. In this no-kiln version, the oxide keeps its natural reddish-brown colour and is sealed under PVA varnish. The effect works well over textured surfaces: the wash pools in the recesses and wipes off the high points, giving a two-tone finish.';
  save('11-iron-oxide-wash-on-air-dry-clay.json', d);
  console.log('11: fixed paragraph[0] text[2]');
}

// File 21: paragraph[0] text node[2] - em-dash + grade 12.9
{
  const d = load('21-polymer-clay-translucent-leaf-pendants.json');
  const n = d.body.content[0].content[2];
  n.text = ' does not become fully clear when cured. It stays slightly milky. Small botanical materials pressed into a thin sheet and sandwiched between two layers show clearly through the clay. Use pressed and dried botanicals only; fresh plant material contains moisture that creates bubbles during curing.';
  save('21-polymer-clay-translucent-leaf-pendants.json', d);
  console.log('21: fixed paragraph[0] text[2]');
}

// File 22: paragraph[0] text node[4] - grade 12.4
{
  const d = load('22-polymer-clay-millefiori-bead-bracelet.json');
  const n = d.body.content[0].content[4];
  n.text = ' made from contrasting colour layers. Every slice cut from the cylinder shows the same cross-section pattern. In this tutorial, a simple five-petal flower cane is built and sliced onto round bead bases to make a bracelet.';
  save('22-polymer-clay-millefiori-bead-bracelet.json', d);
  console.log('22: fixed paragraph[0] text[4]');
}

// File 36: paragraph[0] text node[2] em-dash, paragraph[10] text node[0] en-dash
{
  const d = load('36-loading-an-electric-kiln-for-bisque.json');
  // paragraph[0] node[2] — em-dash
  const n0 = d.body.content[0].content[2];
  n0.text = n0.text.replace(' — any residual moisture turns to steam in the kiln and can crack or explode the piece.', '. Any residual moisture turns to steam in the kiln and can crack or explode the piece.');
  // paragraph[10] node[0] — en-dash in "2–3 hours"
  const n10 = d.body.content[10].content[0];
  n10.text = n10.text.replace('2–3', '2-3');
  save('36-loading-an-electric-kiln-for-bisque.json', d);
  console.log('36: fixed paragraph[0] text[2] + paragraph[10] text[0]');
}

// File 37: paragraph[0] text nodes [2,4,6] - grade 12.0; paragraph[6] en-dash
{
  const d = load('37-raku-firing-outdoor-process.json');
  // paragraph[0]: node[2]
  d.body.content[0].content[2].text = ' is an outdoor process. You need protective clothing, a clear working area, and a fire extinguisher within reach. The pieces must use a high-grog raku clay body to handle the extreme ';
  // paragraph[0]: node[4]
  d.body.content[0].content[4].text = ' of removal from a hot kiln. The ';
  // paragraph[0]: node[6]
  d.body.content[0].content[6].text = ' atmosphere in the post-firing container produces the characteristic effects: metallic lustre in glazed areas and carbon black in the unglazed clay.';
  // paragraph[6]: en-dash in "900–950°C"
  const n6 = d.body.content[6].content[0];
  n6.text = n6.text.replace('900–950°C', '900-950°C');
  save('37-raku-firing-outdoor-process.json', d);
  console.log('37: fixed paragraph[0] nodes + paragraph[6] en-dash');
}

// File 40: paragraph[0] text nodes [4,6] - em-dash + grade; orderedList[4] listItem[2] en-dash
{
  const d = load('40-sgraffito-on-thrown-stoneware-greenware.json');
  // paragraph[0]: node[4] - update to remove "coating" and simplify
  d.body.content[0].content[4].text = ' and the clay body as decoration. Apply the slip when the pot is soft ';
  // paragraph[0]: node[6] - fix em-dash and simplify
  d.body.content[0].content[6].text = '. Scratch the design once the slip has firmed to a firmer leather-hard state: at that point the slip should not smear when touched, but the tool still cuts cleanly without powdering.';
  // orderedList[4] listItem[2] paragraph text - en-dash "30–60"
  const liText = d.body.content[4].content[2].content[0].content[0];
  liText.text = liText.text.replace('30–60', '30-60');
  save('40-sgraffito-on-thrown-stoneware-greenware.json', d);
  console.log('40: fixed paragraph[0] nodes + orderedList listItem en-dash');
}

// Validate
let valid = true;
const files = ['09-majolica-style-painted-tile.json', '11-iron-oxide-wash-on-air-dry-clay.json',
  '21-polymer-clay-translucent-leaf-pendants.json', '22-polymer-clay-millefiori-bead-bracelet.json',
  '36-loading-an-electric-kiln-for-bisque.json', '37-raku-firing-outdoor-process.json',
  '40-sgraffito-on-thrown-stoneware-greenware.json'];
for (const f of files) {
  try { JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
  catch(e) { console.log('INVALID JSON: ' + f + ' ' + e.message); valid = false; }
}
if (valid) console.log('All files valid JSON.');
