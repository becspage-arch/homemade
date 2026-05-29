const fs = require('fs');
const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/pottery-ceramics-bulk-004-briefs';

function load(f) { return JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
function save(f, d) { fs.writeFileSync(dir + '/' + f, JSON.stringify(d, null, 2), 'utf8'); }
function txt(text) { return { type: 'text', text }; }
function h2(text) { return { type: 'heading', attrs: { level: 2 }, content: [txt(text)] }; }
function li(text) { return { type: 'listItem', content: [{ type: 'paragraph', content: [txt(text)] }] }; }
function ol(items) { return { type: 'orderedList', content: items.map(li) }; }

// Insert orderedList after the suppliesCard (or after index idx if no suppliesCard)
function insertStepsAfterSupplies(body, steps) {
  const idx = body.content.findIndex(n => n.type === 'suppliesCard');
  const insertAt = idx !== -1 ? idx + 1 : 2; // after suppliesCard, or after infoPanel
  const newItems = [h2('Steps'), ol(steps)];
  body.content.splice(insertAt, 0, ...newItems);
}

// =========================================================
// BRAND-TRADEMARK FIXES
// =========================================================

// File 34: orderedList[4].listItem[3] - "flake off" → "peel off"
{
  const d = load('34-painting-underglaze-on-leather-hard-stoneware.json');
  // Find orderedList[4] (index 4 in body) - but this could be different after edits. Search for the node.
  let fixed = JSON.stringify(d);
  fixed = fixed.replace('flake off at the dry-greenware stage', 'peel off at the dry-greenware stage');
  fixed = fixed.replace('Underglaze flakes off in dry-greenware stage', 'Underglaze peels off in dry-greenware stage');
  fs.writeFileSync(dir + '/34-painting-underglaze-on-leather-hard-stoneware.json', fixed, 'utf8');
  console.log('34: fixed brand-trademark (flake→peel)');
}

// File 40: paragraph[7] - "flake off" → "lift off"
{
  const d = load('40-sgraffito-on-thrown-stoneware-greenware.json');
  let fixed = JSON.stringify(d);
  fixed = fixed.replace('they will dry and flake off cleanly', 'they will dry and lift off cleanly');
  fs.writeFileSync(dir + '/40-sgraffito-on-thrown-stoneware-greenware.json', fixed, 'utf8');
  console.log('40: fixed brand-trademark (flake→lift)');
}

// =========================================================
// TRICOLON FIX
// =========================================================

// File 09: paragraph[9] - "terracotta, green, and yellow" tricolon
{
  const d = load('09-majolica-style-painted-tile.json');
  let fixed = JSON.stringify(d);
  // Simplify the 4-item acrylic list to 2 items
  fixed = fixed.replace(
    'use blue, terracotta, green, and yellow ochre acrylics',
    'use blue and terracotta as the two key acrylics, with green as accent'
  );
  fs.writeFileSync(dir + '/09-majolica-style-painted-tile.json', fixed, 'utf8');
  console.log('09: fixed tricolon');
}

// =========================================================
// GRADE-LEVEL FIXES
// =========================================================

// File 32: bulletList[8].listItem[0] - grade 11.7
{
  const d = load('32-celadon-glaze-on-carved-stoneware.json');
  const li = d.body.content[8].content[0].content[0].content[0];
  li.text = 'Apply an iron oxide wash to the bisqueware before dipping. This adds a brown accent in the deepest recesses.';
  save('32-celadon-glaze-on-carved-stoneware.json', d);
  console.log('32: fixed grade bulletList[8].li[0]');
}

// File 38: bulletList[10].listItem[1] - grade 12.0
{
  const d = load('38-kiln-wash-preparation-and-shelf-care.json');
  const li = d.body.content[10].content[1].content[0].content[0];
  li.text = 'For repeated high-temperature firings, add a small amount of silica to the mix. This helps the wash hold against flux-rich glazes.';
  save('38-kiln-wash-preparation-and-shelf-care.json', d);
  console.log('38: fixed grade bulletList[10].li[1]');
}

// File 18: orderedList[4].listItem[1] - grade 11.2
{
  const d = load('18-polymer-clay-skinner-blend-technique.json');
  const li = d.body.content[4].content[1].content[0].content[0];
  li.text = 'Place the two triangles long edge to long edge on the board so they form a rectangle: colour A on the left, colour B on the right.';
  save('18-polymer-clay-skinner-blend-technique.json', d);
  console.log('18: fixed grade orderedList[4].li[1]');
}

// File 37: paragraph[4] - grade 12.0
{
  const d = load('37-raku-firing-outdoor-process.json');
  const n = d.body.content[4].content[0];
  n.text = 'Apply raku glaze to bisqued pieces by brushing or dipping, to a thicker coat than standard glazing, approximately 2 mm. Leave the foot ring and lower 15 mm of the base unglazed; these areas will turn carbon-black. Common raku glazes include copper-metallic glazes that produce a shiny coloured surface in reduction, and crackle white glazes that develop fine cracks filled with carbon.';
  save('37-raku-firing-outdoor-process.json', d);
  console.log('37: fixed grade paragraph[4]');
}

// File 17: paragraph[6] - grade 11.1
{
  const d = load('17-repairing-cracks-in-air-dry-greenware.json');
  const n = d.body.content[6].content[0];
  n.text = 'At bone-dry, fresh clay will not bond to the dry clay because there is no moisture left for the slurry to grip. Use a few drops of water to dampen the area before patching with slurry and fresh clay. Alternatively, fill the crack with a small amount of PVA glue and press together; this holds the crack but does not restore the original strength.';
  save('17-repairing-cracks-in-air-dry-greenware.json', d);
  console.log('17: fixed grade paragraph[6]');
}

// File 13: bulletList[10].listItem[2] - grade 11.3
{
  const d = load('13-resist-decoration-wax-emulsion-on-clay.json');
  const li = d.body.content[10].content[2].content[0].content[0];
  li.text = 'Scrubbing the wash over waxed areas. Apply in one gentle pass to keep the resist clean.';
  save('13-resist-decoration-wax-emulsion-on-clay.json', d);
  console.log('13: fixed grade bulletList[10].li[2]');
}

// File 12: bulletList[13].listItem[1] - grade 11.8
{
  const d = load('12-sgraffito-line-work-tile.json');
  const li = d.body.content[13].content[1].content[0].content[0];
  li.text = 'Scratch a repeating diamond pattern instead of botanical lines, for a geometric tile.';
  save('12-sgraffito-line-work-tile.json', d);
  console.log('12: fixed grade bulletList[13].li[1]');
}

// File 07: bulletList[17].listItem[0] - grade 11.2
{
  const d = load('07-slab-angled-wall-vase.json');
  const li = d.body.content[17].content[0].content[0].content[0];
  li.text = 'Carve a simple pattern into the front panel before assembling the vase.';
  save('07-slab-angled-wall-vase.json', d);
  console.log('07: fixed grade bulletList[17].li[0]');
}

// File 14: paragraph[0] - grade 11.5 (multi-node paragraph)
{
  const d = load('14-colouring-clay-body-with-dry-pigment.json');
  // Check structure of paragraph[0]
  const p0 = d.body.content[0];
  const allText = p0.content.map(n => n.text || '').join('');
  if (p0.content.length === 1) {
    p0.content[0].text = 'Colouring a clay body before forming means the colour runs through the full thickness, not only on the surface. Knead the pigment into the clay by wedging: this spreads the colour evenly, just as wedging spreads moisture. Use red or yellow iron oxide powder for earthy tones, or artist\'s acrylic paint for a wider colour range.';
  } else {
    // Find the long text node and replace it
    for (const n of p0.content) {
      if (n.text && n.text.includes('homogenise')) {
        n.text = n.text.replace(
          'the same technique used to homogenise moisture also distributes colour evenly. The technique works with red or yellow iron oxide powder (earthy tones) or artist\'s acrylic paint (broader colour range).',
          'this spreads the colour evenly, just as wedging spreads moisture. Use red or yellow iron oxide powder for earthy tones, or artist\'s acrylic paint for a wider range of colours.'
        );
        break;
      }
    }
  }
  save('14-colouring-clay-body-with-dry-pigment.json', d);
  console.log('14: fixed grade paragraph[0]');
}

// File 23: paragraph[0] - grade 11.5 (multi-node paragraph)
{
  const d = load('23-polymer-clay-ring-with-embedded-petals.json');
  const p0 = d.body.content[0];
  for (const n of p0.content) {
    if (n.text && n.text.includes('mandrel')) {
      n.text = n.text.replace(
        'built from a thin strip of polymer clay wrapped around a cylindrical mandrel to size, with pressed dried flower petals embedded flush into the outer surface. A thick marker pen, a short section of wooden dowel, or any round object close to the desired ring diameter serves as the forming tool.',
        'made from a thin strip of polymer clay wrapped around a round form, with pressed dried flower petals set into the outer surface. A thick marker pen, a short section of wooden dowel, or any round object close to the ring size works as the forming tool.'
      );
      break;
    }
  }
  save('23-polymer-clay-ring-with-embedded-petals.json', d);
  console.log('23: fixed grade paragraph[0]');
}

// =========================================================
// BODY-MISSING-METHOD FIXES (add Steps h2 + orderedList)
// =========================================================

// File 04: air-dry-clay-herb-markers
{
  const d = load('04-air-dry-clay-herb-markers.json');
  insertStepsAfterSupplies(d.body, [
    'Roll the clay to 6 mm thick and cut oval or teardrop tag shapes.',
    'Press letter stamps into the soft clay to mark each herb name.',
    'Score and slip a wire stake to the base of each tag.',
    'Dry flat on a board to bone-dry, then sand and seal with varnish.',
  ]);
  save('04-air-dry-clay-herb-markers.json', d);
  console.log('04: added Steps orderedList');
}

// File 05: paper-clay-wearable-brooch
{
  const d = load('05-paper-clay-wearable-brooch.json');
  insertStepsAfterSupplies(d.body, [
    'Form 30 g of paper clay into an oval roughly 40 mm across and 6 mm thick.',
    'Carve texture and detail into the surface with a needle tool.',
    'Trim the outer edge clean with a fettling knife and round it slightly.',
    'Dry flat to bone-dry over 24 hours, then sand smooth and seal with varnish.',
    'Glue a brooch back to the reverse with strong adhesive.',
  ]);
  save('05-paper-clay-wearable-brooch.json', d);
  console.log('05: added Steps orderedList');
}

// File 08: coil-built-square-vessel
{
  const d = load('08-coil-built-square-vessel.json');
  insertStepsAfterSupplies(d.body, [
    'Press a flat square base approximately 80 mm x 80 mm and 8 mm thick.',
    'Roll coils of even thickness and build up the walls in courses, joining each one firmly inside.',
    'Smooth the interior joins with a metal rib; leave the exterior showing the coil texture.',
    'Allow to reach leather-hard, then refine the top edge and any rough spots.',
    'Dry slowly under loose plastic over two to three days to avoid cracking.',
  ]);
  save('08-coil-built-square-vessel.json', d);
  console.log('08: added Steps orderedList');
}

// File 20: polymer-clay-sculpted-snail
{
  const d = load('20-polymer-clay-sculpted-snail.json');
  insertStepsAfterSupplies(d.body, [
    'Roll a tapered brown clay coil and wind it into a spiral to form the shell.',
    'Shape the body from pale clay as a teardrop with a curved tail.',
    'Press the shell onto the back of the body and add eye and antenna details.',
    'Cure on a dedicated tray at 130°C for 20 minutes and cool before handling.',
  ]);
  save('20-polymer-clay-sculpted-snail.json', d);
  console.log('20: added Steps orderedList');
}

// File 25: throwing-a-vase-with-narrow-neck
{
  const d = load('25-throwing-a-vase-with-narrow-neck.json');
  insertStepsAfterSupplies(d.body, [
    'Centre 800 g of clay and open to the belly width, roughly two-thirds of the target height.',
    'Raise the walls in three or four pulling passes, leaving extra thickness near the top.',
    'Collar the neck inward with both hands in repeated passes to reach 30-40 mm diameter.',
    'Refine the neck with a throwing stick inside and compress the rim.',
    'Cut off with a wire and trim a foot ring when leather-hard.',
  ]);
  save('25-throwing-a-vase-with-narrow-neck.json', d);
  console.log('25: added Steps orderedList');
}

// File 26: throwing-a-shallow-open-bowl
{
  const d = load('26-throwing-a-shallow-open-bowl.json');
  insertStepsAfterSupplies(d.body, [
    'Centre 500 g of clay and open outward along the floor to the desired bowl width.',
    'Raise the wall in one or two passes and use a rib to shape the curve.',
    'Level the rim with the needle tool and compress it gently.',
    'Run a wire under the bat and move the whole bat to a drying board.',
    'Trim a shallow foot ring when leather-hard.',
  ]);
  save('26-throwing-a-shallow-open-bowl.json', d);
  console.log('26: added Steps orderedList');
}

// File 27: throwing-a-tea-bowl
{
  const d = load('27-throwing-a-tea-bowl.json');
  insertStepsAfterSupplies(d.body, [
    'Centre 300 g of clay, open to 50 mm diameter, and leave an 8 mm floor.',
    'Pull the walls in two passes to a consistent 6-8 mm thickness throughout.',
    'Allow the upper wall to flare outward and compress the rim.',
    'Cut off with a wire and allow to dry to leather-hard on a bat.',
    'Trim a 35-40 mm foot ring with a loop tool.',
  ]);
  save('27-throwing-a-tea-bowl.json', d);
  console.log('27: added Steps orderedList');
}

// File 30: throwing-a-lidded-honey-pot
{
  const d = load('30-throwing-a-lidded-honey-pot.json');
  insertStepsAfterSupplies(d.body, [
    'Throw the pot body and form a gallery ledge inside the rim with the index finger.',
    'Measure the gallery inner diameter with calipers and record it.',
    'Throw the lid upside-down and pull the flange to match the caliper measurement.',
    'Trim both pieces when leather-hard and check the lid fits the gallery.',
  ]);
  save('30-throwing-a-lidded-honey-pot.json', d);
  console.log('30: added Steps orderedList');
}

// File 36: loading-an-electric-kiln-for-bisque
{
  const d = load('36-loading-an-electric-kiln-for-bisque.json');
  insertStepsAfterSupplies(d.body, [
    'Check that all work is completely bone-dry before loading.',
    'Set up kiln shelves on posts at evenly spaced heights.',
    'Load the work; pieces may touch and stack in bisque firing.',
    'Place a witness cone pack on the middle shelf where it is visible through the peephole.',
    'Fire at 100°C per hour for the first 2-3 hours, then increase to the target cone.',
  ]);
  save('36-loading-an-electric-kiln-for-bisque.json', d);
  console.log('36: added Steps orderedList');
}

// File 39: understanding-reduction-atmosphere-in-kilns
{
  const d = load('39-understanding-reduction-atmosphere-in-kilns.json');
  // No suppliesCard; insert after the infoPanel (index 1)
  const newItems = [
    h2('How to access reduction effects'),
    ol([
      'Choose glazes with significant iron or copper content for visible reduction effects.',
      'Use a community gas kiln, saggar firing in an electric kiln, or raku for reduction at home.',
      'Load your pieces and request a reduction atmosphere from the firing schedule.',
      'Open the kiln only after it has cooled below 200°C and inspect the results.',
    ])
  ];
  d.body.content.splice(2, 0, ...newItems);
  save('39-understanding-reduction-atmosphere-in-kilns.json', d);
  console.log('39: added Steps orderedList');
}

// =========================================================
// VALIDATE ALL CHANGED FILES
// =========================================================
const changedFiles = [
  '34-painting-underglaze-on-leather-hard-stoneware.json',
  '40-sgraffito-on-thrown-stoneware-greenware.json',
  '09-majolica-style-painted-tile.json',
  '32-celadon-glaze-on-carved-stoneware.json',
  '38-kiln-wash-preparation-and-shelf-care.json',
  '18-polymer-clay-skinner-blend-technique.json',
  '37-raku-firing-outdoor-process.json',
  '17-repairing-cracks-in-air-dry-greenware.json',
  '13-resist-decoration-wax-emulsion-on-clay.json',
  '12-sgraffito-line-work-tile.json',
  '07-slab-angled-wall-vase.json',
  '14-colouring-clay-body-with-dry-pigment.json',
  '23-polymer-clay-ring-with-embedded-petals.json',
  '04-air-dry-clay-herb-markers.json',
  '05-paper-clay-wearable-brooch.json',
  '08-coil-built-square-vessel.json',
  '20-polymer-clay-sculpted-snail.json',
  '25-throwing-a-vase-with-narrow-neck.json',
  '26-throwing-a-shallow-open-bowl.json',
  '27-throwing-a-tea-bowl.json',
  '30-throwing-a-lidded-honey-pot.json',
  '36-loading-an-electric-kiln-for-bisque.json',
  '39-understanding-reduction-atmosphere-in-kilns.json',
];

let valid = true;
for (const f of changedFiles) {
  try { JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
  catch(e) { console.log('INVALID JSON: ' + f + ' ' + e.message); valid = false; }
}
if (valid) console.log('\nAll ' + changedFiles.length + ' changed files are valid JSON.');
