const fs = require('fs');
const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/pottery-ceramics-bulk-004-briefs';

function load(f) { return JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
function save(f, d) { fs.writeFileSync(dir + '/' + f, JSON.stringify(d, null, 2), 'utf8'); }

// File 32: celadon — bulletList[8].listItem[1] grade 11.1
{
  const d = load('32-celadon-glaze-on-carved-stoneware.json');
  d.body.content[8].content[1].content[0].content[0].text =
    'Brush a second thin coat of celadon over the carved areas only. This deepens the contrast.';
  save('32-celadon-glaze-on-carved-stoneware.json', d);
  console.log('32: fixed bulletList[8].listItem[1]');
}

// File 36: loading-an-electric-kiln — grade + brand "target" (lowercase false-positive)
{
  const d = load('36-loading-an-electric-kiln-for-bisque.json');
  // Grade fix: bulletList[14].listItem[1]
  d.body.content[14].content[1].content[0].content[0].text =
    'Bisque firing burns out paper clay, newsprint, and wax resist. Do this step before glaze firing.';
  // Brand fix 1: orderedList[4].listItem[4] — "the target cone"
  d.body.content[4].content[4].content[0].content[0].text =
    'Fire at 100°C per hour for the first 2-3 hours, then ramp up to reach the correct cone.';
  // Brand fix 2: paragraph[12] — "Target temperature" and "the target cone"
  d.body.content[12].content[0].text = d.body.content[12].content[0].text
    .replace('Target temperature is cone 06', 'The firing temperature is cone 06')
    .replace('Once the target cone bends', 'Once the cone bends');
  // Brand fix 3: troubleshooter[15].items[1].fix — "is the target"
  d.body.content[15].attrs.items[1].fix = d.body.content[15].attrs.items[1].fix
    .replace('is the target, regardless', 'is the goal, regardless');
  save('36-loading-an-electric-kiln-for-bisque.json', d);
  console.log('36: fixed bulletList[14].listItem[1] grade + 3x brand "target"');
}

// File 09: majolica — paragraph[0] node[2] grade 11.6
{
  const d = load('09-majolica-style-painted-tile.json');
  d.body.content[0].content[2].text =
    ' style uses an opaque white background with bright painted motifs, often floral or geometric. This tutorial makes one decorative tile using air-dry clay and acrylic paint. The tile is not food-safe or waterproof, but works well as wall art.';
  save('09-majolica-style-painted-tile.json', d);
  console.log('09: fixed paragraph[0].node[2]');
}

// File 34: painting-underglaze — bulletList[8].listItem[0] and listItem[1]
{
  const d = load('34-painting-underglaze-on-leather-hard-stoneware.json');
  d.body.content[8].content[0].content[0].content[0].text =
    'Apply underglaze to bisqueware instead of greenware. You get more working time and can fix mistakes more easily.';
  d.body.content[8].content[1].content[0].content[0].text =
    'Sketch the design onto the leather-hard surface first. A pencil or sgraffito tool works well. Then apply the underglaze over the sketch.';
  save('34-painting-underglaze-on-leather-hard-stoneware.json', d);
  console.log('34: fixed bulletList[8] listItem[0] and listItem[1]');
}

// File 23: polymer-clay-ring — paragraph[0].node[0] grade 11.5
{
  const d = load('23-polymer-clay-ring-with-embedded-petals.json');
  d.body.content[0].content[0].text =
    'This ring is made from a thin strip of polymer clay wrapped around a round form. Pressed dried flower petals sit flush into the outer surface. A thick marker pen or a short dowel makes a good forming tool. Pick one close to the ring size you want.';
  save('23-polymer-clay-ring-with-embedded-petals.json', d);
  console.log('23: fixed paragraph[0].node[0]');
}

// File 37: raku — bulletList[10].listItem[0] and listItem[1]
{
  const d = load('37-raku-firing-outdoor-process.json');
  d.body.content[10].content[0].content[0].content[0].text =
    'Leave the piece in the reduction container for longer. This drives more carbon into the unglazed clay.';
  d.body.content[10].content[1].content[0].content[0].text =
    'Try horse-hair instead of newspaper. Lay strands on the hot piece right after it comes out of the kiln. The hair burns on contact and leaves dark linear marks on the surface.';
  save('37-raku-firing-outdoor-process.json', d);
  console.log('37: fixed bulletList[10] listItem[0] and listItem[1]');
}

// File 17: repairing-cracks — paragraph[6] grade 11.8
// node[0] contains full duplicate paragraph text; node[1] is bone-dry tooltip; node[2] is main text
{
  const d = load('17-repairing-cracks-in-air-dry-greenware.json');
  d.body.content[6].content[0].text = 'At ';
  d.body.content[6].content[2].text =
    ', fresh clay will not bond. There is no moisture left for slurry to grip. Add a few drops of water to dampen the area first. Then patch with slurry and fresh clay. You can also fill the crack with PVA glue; this holds the crack but does not restore the full strength.';
  save('17-repairing-cracks-in-air-dry-greenware.json', d);
  console.log('17: fixed paragraph[6] node[0] and node[2]');
}

// File 12: sgraffito-line-work — bulletList[13].listItem[1] grade 11.3
{
  const d = load('12-sgraffito-line-work-tile.json');
  d.body.content[13].content[1].content[0].content[0].text =
    'Try a simple diamond grid instead of plant shapes, for a more geometric look.';
  save('12-sgraffito-line-work-tile.json', d);
  console.log('12: fixed bulletList[13].listItem[1]');
}

// File 40: sgraffito-on-thrown — bulletList[11].listItem[1] grade 11.8
{
  const d = load('40-sgraffito-on-thrown-stoneware-greenware.json');
  d.body.content[11].content[1].content[0].content[0].text =
    'Mix sgraffito and underglaze: scratch through the slip to show the clay, then brush underglaze into the grooves before bisque firing.';
  save('40-sgraffito-on-thrown-stoneware-greenware.json', d);
  console.log('40: fixed bulletList[11].listItem[1]');
}

// File 26: throwing-shallow-bowl — paragraph[0] grade 11.8
{
  const d = load('26-throwing-a-shallow-open-bowl.json');
  d.body.content[0].content[0].text =
    'A shallow open bowl needs even wall thickness from base to rim. The walls lean outward at 45 degrees or more, so any thick patch stands out in the finished piece. Open wide and low early, then use the wooden rib to shape the curve and compress the clay.';
  save('26-throwing-a-shallow-open-bowl.json', d);
  console.log('26: fixed paragraph[0]');
}

// File 39: understanding-reduction — multiple grade + tricolon
{
  const d = load('39-understanding-reduction-atmosphere-in-kilns.json');
  // orderedList[3].listItem[0] grade 11.7
  d.body.content[3].content[0].content[0].content[0].text =
    'Use glazes with iron or copper in them. These give the strongest colour changes under reduction.';
  // paragraph[5] grade 11.8 + tricolon ("grey-green celadon, blue-grey, and dark warm tones")
  d.body.content[5].content[0].text =
    'Iron oxide in oxidation gives amber and rust tones. In reduction, the same iron gives grey-green celadon and blue-grey tones. Copper oxide in oxidation gives greens. In reduction, copper gives the deep ox-blood red known as copper red. This happens because the kiln atmosphere draws oxygen from the metal oxides, changing their colour.';
  // bulletList[10].listItem[0] grade 11.1
  d.body.content[10].content[0].content[0].content[0].text =
    'Community studios: many let members book space in a gas kiln for reduction firing, charged per shelf.';
  // bulletList[10].listItem[1].node[2] (text after Saggar tooltip) grade 11.2
  d.body.content[10].content[1].content[0].content[2].text =
    ' firing in an electric kiln: pack the bisqued piece in a saggar with combustibles such as sawdust, salt, or steel wool. The saggar creates a local reduction zone. Results are more subtle than a gas reduction, but you get carbon flash and surface variation.';
  save('39-understanding-reduction-atmosphere-in-kilns.json', d);
  console.log('39: fixed orderedList[3].listItem[0], paragraph[5], bulletList[10].listItem[0], bulletList[10].listItem[1].node[2]');
}

// Validate all fixed files
const fixed = [
  '32-celadon-glaze-on-carved-stoneware.json',
  '36-loading-an-electric-kiln-for-bisque.json',
  '09-majolica-style-painted-tile.json',
  '34-painting-underglaze-on-leather-hard-stoneware.json',
  '23-polymer-clay-ring-with-embedded-petals.json',
  '37-raku-firing-outdoor-process.json',
  '17-repairing-cracks-in-air-dry-greenware.json',
  '12-sgraffito-line-work-tile.json',
  '40-sgraffito-on-thrown-stoneware-greenware.json',
  '26-throwing-a-shallow-open-bowl.json',
  '39-understanding-reduction-atmosphere-in-kilns.json'
];
let valid = true;
for (const f of fixed) {
  try { JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
  catch(e) { console.log('INVALID JSON: ' + f + ' ' + e.message); valid = false; }
}
if (valid) console.log('All 11 files valid JSON.');
