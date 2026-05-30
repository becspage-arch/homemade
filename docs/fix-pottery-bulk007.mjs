// fix-pottery-bulk007.mjs — fixes all 30 blocked voice-check errors in pottery-ceramics bulk-007
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, 'pottery-ceramics-bulk-007-briefs');

function load(name) { return JSON.parse(readFileSync(join(dir, name), 'utf8')); }
function save(name, data) { writeFileSync(join(dir, name), JSON.stringify(data, null, 2) + '\n', 'utf8'); }

// Recursively walk all text nodes in body; visitor receives the node and can mutate .text
function walkTextNodes(node, visitor) {
  if (node.type === 'text' && typeof node.text === 'string') visitor(node);
  if (Array.isArray(node.content)) node.content.forEach(c => walkTextNodes(c, visitor));
  // troubleshooter items/rows are plain objects with string fields
  if (node.type === 'troubleshooter' && node.attrs) {
    const list = node.attrs.items || node.attrs.rows || [];
    list.forEach(item => ['problem', 'cause', 'fix'].forEach(f => {
      if (typeof item[f] === 'string') visitor({ get text() { return item[f]; }, set text(v) { item[f] = v; } });
    }));
  }
}

// Replace first occurrence of search in any text node
function replaceText(body, search, replacement) {
  let done = false;
  walkTextNodes(body, node => {
    if (!done && node.text.includes(search)) {
      node.text = node.text.replace(search, replacement);
      done = true;
    }
  });
  if (!done) console.warn(`  WARN: could not find "${search.slice(0, 60)}"`);
}

// Fix glossaryTerms: rename termSlug→slug and optionally label→term
function fixGlossaryKeys(data, renameLabel) {
  if (!Array.isArray(data.glossaryTerms)) return;
  data.glossaryTerms.forEach(entry => {
    if ('termSlug' in entry && !('slug' in entry)) { entry.slug = entry.termSlug; delete entry.termSlug; }
    if (renameLabel && 'label' in entry && !('term' in entry)) { entry.term = entry.label; delete entry.label; }
  });
}

// Inject a glossaryTooltip mark into a text node — splits node text at `matchStr` and inserts
// a tooltip on `tooltipText` immediately before `matchStr`. Returns true on success.
function injectTooltipBefore(contentArray, matchStr, tooltipText, termSlug) {
  for (let i = 0; i < contentArray.length; i++) {
    const node = contentArray[i];
    if (node.type === 'text' && node.text.includes(matchStr)) {
      const idx = node.text.indexOf(matchStr);
      const before = node.text.slice(0, idx);
      const after = node.text.slice(idx + matchStr.length);
      const newNodes = [];
      if (before) newNodes.push({ type: 'text', text: before });
      newNodes.push({ type: 'text', text: tooltipText, marks: [{ type: 'glossaryTooltip', attrs: { termSlug, label: tooltipText } }] });
      if (after) newNodes.push({ type: 'text', text: after });
      contentArray.splice(i, 1, ...newNodes);
      return true;
    }
  }
  return false;
}

// ── FILE 01 ──────────────────────────────────────────────────────────────────
console.log('Fixing 01...');
{
  const d = load('01-air-dry-clay-spoon-rest.tutorial.json');
  replaceText(d.body, 'while it dries — a rounded jar', 'while it dries: a rounded jar');
  replaceText(d.body, 'at the centre — enough to cradle', 'at the centre, enough to cradle');
  replaceText(d.body, ' — at least 24 hours', ': at least 24 hours');
  replaceText(d.body, 'than an oval — simple silhouette', 'than an oval. Simple silhouette');
  save('01-air-dry-clay-spoon-rest.tutorial.json', d);
}

// ── FILE 02 ──────────────────────────────────────────────────────────────────
console.log('Fixing 02...');
{
  const d = load('02-slab-built-keepsake-box-air-dry.tutorial.json');
  // Fix em-dashes
  replaceText(d.body, 'The finished box — roughly 12 cm long, 9 cm wide, 6 cm tall — is sealed', 'The finished box (roughly 12 cm long, 9 cm wide, 6 cm tall) is sealed');
  replaceText(d.body, 'the others — mismatched moisture', 'the others, as mismatched moisture');
  replaceText(d.body, 'smooth stroke — this seals', 'smooth stroke; this seals');
  replaceText(d.body, 'bone-dry — this may take', 'bone-dry; this may take');
  replaceText(d.body, 'walls — the extra tensile', 'walls; the extra tensile');
  // Add slab tooltip: find the intro paragraph content and inject tooltip on "slab"
  const introPara = d.body.content[0];
  if (introPara && introPara.type === 'paragraph') {
    injectTooltipBefore(introPara.content, 'slab box teaches', 'slab', 'slab');
  }
  save('02-slab-built-keepsake-box-air-dry.tutorial.json', d);
}

// ── FILE 03 ──────────────────────────────────────────────────────────────────
console.log('Fixing 03...');
{
  const d = load('03-coil-built-garden-lantern-air-dry.tutorial.json');
  // Fix em-dashes
  replaceText(d.body, 'from 6 mm clay — 10 cm diameter', 'from 6 mm clay; a 10 cm diameter');
  replaceText(d.body, 'the needle tool — simple shapes', 'the needle tool; simple shapes');
  replaceText(d.body, 'bone-dry — at least 2 days', 'bone-dry: at least 2 days');
  replaceText(d.body, 'only — a real flame', 'only. A real flame');
  replaceText(d.body, 'leather-hard — the clay should', 'leather-hard. The clay should');
  // Add score-and-slip tooltip: replace text in the first building step
  const buildingList = d.body.content.find(n => n.type === 'orderedList' && n.content?.[0]?.content?.[0]?.content?.[0]?.text?.startsWith('Score and apply slip'));
  if (buildingList) {
    const firstItem = buildingList.content[0].content[0]; // paragraph
    firstItem.content = [
      { type: 'text', text: 'Use ' },
      { type: 'text', text: 'score-and-slip', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'score-and-slip', label: 'score-and-slip' } }] },
      { type: 'text', text: ' to attach the first coil: scratch the base slab where the coil will sit and apply slip, then wind the first coil around the tube and press the end firmly down. Blend the bottom of the coil into the base with your finger.' }
    ];
  }
  save('03-coil-built-garden-lantern-air-dry.tutorial.json', d);
}

// ── FILE 05 ──────────────────────────────────────────────────────────────────
console.log('Fixing 05...');
{
  const d = load('05-slab-built-wall-letter-sign-air-dry.tutorial.json');
  replaceText(d.body,
    'If your letter has enclosed counters (such as the hole inside O, D, or A), cut those out now using the needle tool tip to pierce in, then the fettling knife to complete the cut.',
    'For letters with an enclosed hole (such as O, D, or A), pierce the inside area with the needle tool tip, then cut around it with the fettling knife.'
  );
  save('05-slab-built-wall-letter-sign-air-dry.tutorial.json', d);
}

// ── FILE 10 ──────────────────────────────────────────────────────────────────
console.log('Fixing 10...');
{
  const d = load('10-impressing-found-objects-technique.tutorial.json');
  replaceText(d.body,
    'For a three-dimensional object such as a shell or key: press it in with your thumb, then rock it very slightly from side to side before lifting to free it from the clay without distorting the impression.',
    'For a shaped object such as a shell or key: press it in with your thumb, then rock it gently from side to side before lifting straight out.'
  );
  replaceText(d.body,
    'Build up a pattern by repeating the same object in a grid, alternating two objects, or scattering impressions at different angles for a more organic effect.',
    'Build a pattern by pressing the same object in a grid, mixing two objects, or scattering impressions at different angles for a natural effect.'
  );
  save('10-impressing-found-objects-technique.tutorial.json', d);
}

// ── FILE 11 ──────────────────────────────────────────────────────────────────
console.log('Fixing 11...');
{
  const d = load('11-sgraffito-landscape-tile-air-dry.tutorial.json');
  replaceText(d.body,
    'You can also scrape away larger areas of slip entirely (for a white sky, for example) by holding the needle tool at a very low angle and pushing it sideways like a scraper. This reveals broad areas of the underlying clay for a dramatic tonal contrast with the ',
    'To remove large areas of slip (for a white sky, for example), hold the needle tool nearly flat and push it sideways across the surface. This uncovers broad areas of clay for strong contrast with the '
  );
  save('11-sgraffito-landscape-tile-air-dry.tutorial.json', d);
}

// ── FILES 14-23 (sub-agent B): fix glossaryTerms keys termSlug→slug and label→term ──
const filesB = [
  '14-carving-geometric-pattern-leather-hard.tutorial.json',
  '15-understanding-clay-shrinkage-and-measuring.tutorial.json',
  '16-making-a-simple-press-mould-bisque.tutorial.json',
  '17-reclaiming-clay-from-dry-scraps.tutorial.json',
  '18-preventing-cracks-during-drying.tutorial.json',
  '19-polymer-clay-faux-tortoiseshell-pendant.tutorial.json',
  '20-polymer-clay-flower-brooch-set.tutorial.json',
  '21-polymer-clay-textured-ring-set.tutorial.json',
  '22-polymer-clay-translucent-panel-pendant.tutorial.json',
  '23-polymer-clay-sculpted-snail-shell-pendant.tutorial.json',
];
for (const fn of filesB) {
  const d = load(fn);
  fixGlossaryKeys(d, true); // rename both termSlug→slug and label→term
  save(fn, d);
}
console.log('Fixed glossaryTerms keys for files 14-23');

// ── FILE 14: also fix "genuinely" ────────────────────────────────────────────
console.log('Fixing 14 (genuinely)...');
{
  const d = load('14-carving-geometric-pattern-leather-hard.tutorial.json');
  replaceText(d.body, 'the surface is genuinely firm', 'the surface is firm');
  save('14-carving-geometric-pattern-leather-hard.tutorial.json', d);
}

// ── FILE 15: grade-level ──────────────────────────────────────────────────────
console.log('Fixing 15 (grade-level)...');
{
  const d = load('15-understanding-clay-shrinkage-and-measuring.tutorial.json');
  replaceText(d.body,
    'Measuring the bar before it is fully dry: even a small amount of residual moisture will make the bar appear longer than its final dried length and give you an underestimate.',
    'Measuring the bar before it is fully dry: any moisture left in the clay makes the bar appear longer than its final dry length, giving you a smaller shrinkage figure.'
  );
  save('15-understanding-clay-shrinkage-and-measuring.tutorial.json', d);
}

// ── FILE 16: "72 hours" fix ───────────────────────────────────────────────────
console.log('Fixing 16 (72 hours)...');
{
  const d = load('16-making-a-simple-press-mould-bisque.tutorial.json');
  replaceText(d.body, '72 hours', '3 days');
  save('16-making-a-simple-press-mould-bisque.tutorial.json', d);
}

// ── FILE 18: grade-level ──────────────────────────────────────────────────────
console.log('Fixing 18 (grade-level)...');
{
  const d = load('18-preventing-cracks-during-drying.tutorial.json');
  replaceText(d.body,
    'Varying wall thickness significantly within the same build: thin sections crack first, often pulling a crack across adjacent thicker areas.',
    'Uneven wall thickness: thin sections crack first, and the crack can run into thicker areas nearby.'
  );
  save('18-preventing-cracks-during-drying.tutorial.json', d);
}

// ── FILE 20: grade-level in troubleshooter ─────────────────────────────────
console.log('Fixing 20 (grade-level troubleshooter)...');
{
  const d = load('20-polymer-clay-flower-brooch-set.tutorial.json');
  replaceText(d.body,
    'Re-bond with a tiny amount of liquid polymer clay or strong jewellery adhesive, then rebake if using liquid clay, or leave to cure if using adhesive.',
    'Apply a small dot of liquid polymer clay or jewellery adhesive to the joint. Rebake if using liquid clay; leave to cure if using adhesive.'
  );
  save('20-polymer-clay-flower-brooch-set.tutorial.json', d);
}

// ── FILE 22: grade-level ──────────────────────────────────────────────────────
console.log('Fixing 22 (grade-level)...');
{
  const d = load('22-polymer-clay-translucent-panel-pendant.tutorial.json');
  replaceText(d.body,
    'Using fresh flower petals that have not been fully dried: moisture inside the petal creates steam during baking which produces bubbles around the inclusion.',
    'Using fresh petals that are not fully dried: moisture trapped inside creates steam during baking and leaves bubbles around the inclusion.'
  );
  save('22-polymer-clay-translucent-panel-pendant.tutorial.json', d);
}

// ── FILE 24: "genuinely" + grade-level ───────────────────────────────────────
console.log('Fixing 24 (genuinely + grade-level)...');
{
  const d = load('24-polymer-clay-braided-bangle.tutorial.json');
  replaceText(d.body,
    'A braided bangle is one of the most satisfying polymer clay projects at the intermediate level: it demands even rope thickness, a tidy braid, and a clean join, but it requires no equipment beyond a work surface and a domestic oven. The three-rope braid brings in colour contrast and makes the final form feel genuinely jewellery-quality rather than craft-table output. ',
    'A braided bangle is a satisfying polymer clay project: it asks for even rope thickness, a neat braid, and a clean join, with no equipment beyond a work surface and a domestic oven. The three-rope braid gives strong colour contrast and a finished piece that looks jewellery-quality. '
  );
  replaceText(d.body,
    ' the clay properly is the single most important step: under-conditioned clay will crack when bent around the mandrel. ',
    ' the clay well is the key step: under-conditioned clay will crack when bent around the mandrel. '
  );
  replaceText(d.body,
    ' at a steady 120 degrees C for 30 minutes produces a durable, flexible bangle.',
    ' at 120 degrees C for 30 minutes gives a durable, flexible bangle.'
  );
  save('24-polymer-clay-braided-bangle.tutorial.json', d);
}

// ── FILE 27: grade-level (2 paragraphs) ──────────────────────────────────────
console.log('Fixing 27 (grade-level)...');
{
  const d = load('27-throwing-a-stoneware-colander.tutorial.json');
  replaceText(d.body,
    'Mark rows of holes on the lower half of the bowl wall with light pencil or a pointed tool before piercing. Space rows approximately 18 mm apart vertically, with holes approximately 15 mm apart horizontally within each row. Offset alternate rows by half the horizontal spacing to produce a staggered pattern that maximises drainage area while maintaining structural integrity.',
    'Mark rows of holes on the lower half of the wall before piercing. Space rows about 18 mm apart vertically and holes about 15 mm apart horizontally. Offset alternate rows by half a spacing to create a staggered grid that drains well without weakening the wall.'
  );
  replaceText(d.body,
    'Decorative piercing: replace a section of the drainage holes with a geometric pattern such as a diamond or arrow grid for a colander that also works as a serving bowl.',
    'Decorative piercing: replace some drainage holes with a diamond or arrow grid to make a piece that works as a serving bowl too.'
  );
  save('27-throwing-a-stoneware-colander.tutorial.json', d);
}

// ── FILE 29: grade-level (2 paragraphs) ──────────────────────────────────────
console.log('Fixing 29 (grade-level)...');
{
  const d = load('29-throwing-a-teapot-lid-stoneware.tutorial.json');
  // Simplify the intro paragraph text nodes (paragraph[1] in body, which is body.content[1])
  replaceText(d.body,
    'A flanged teapot lid is thrown upside-down on the wheel: the dome of the lid is formed at the base of the thrown piece, and the flange that seats in the ',
    'A flanged teapot lid is thrown upside-down: the dome forms at the bottom of the piece, and the flange that drops into the '
  );
  replaceText(d.body,
    ' is the outermost rim ring. This upside-down throwing method gives much greater control over the flange diameter because the caliper measurement from the teapot body is applied directly to the outermost edge of the thrown piece while it is still plastic. The lid is inverted onto the banding wheel at ',
    ' sits at the outer rim. Throwing upside-down gives better control over the flange diameter because the caliper measurement applies directly to the outer edge while the clay is still soft. The lid is inverted onto the banding wheel at '
  );
  replaceText(d.body,
    ' stage to add the knob. The technique produces a lid that will maintain its fit through the firing shrinkage of ',
    ' stage to add the knob. The fit holds through firing shrinkage of '
  );
  replaceText(d.body,
    ' 6 (1220 degrees C), provided the caliper measurements are taken and applied accurately.',
    ' 6 (1220 degrees C) if measurements are taken and applied accurately.'
  );
  // Simplify bulletList variation
  replaceText(d.body,
    'The knob is added at leather-hard rather than thrown in one session with the lid dome because adding it while the dome is still wet distorts the dome and makes caliper checks unreliable.',
    'The knob is added at leather-hard, not thrown with the dome while wet, because wet clay distorts under pressure and makes caliper checks unreliable.'
  );
  save('29-throwing-a-teapot-lid-stoneware.tutorial.json', d);
}

// ── FILE 30: grade-level ──────────────────────────────────────────────────────
console.log('Fixing 30 (grade-level)...');
{
  const d = load('30-dry-brush-glaze-technique.tutorial.json');
  replaceText(d.body,
    'If you want the dry-brush layer concentrated on the upper part of the form (where light falls) and absent from recesses and the lower section, tilt the piece on the banding wheel and apply the passes from the top edge downward.',
    'To keep the dry-brush layer on the upper part of the form and away from recesses, tilt the piece on the banding wheel and brush from the top edge downward.'
  );
  save('30-dry-brush-glaze-technique.tutorial.json', d);
}

// ── FILE 31: grade-level (4 paragraphs) ──────────────────────────────────────
console.log('Fixing 31 (grade-level)...');
{
  const d = load('31-stoneware-iron-oxide-brushwork.tutorial.json');
  replaceText(d.body,
    'Iron oxide is one of the oldest ceramic colourants: it fires from warm amber at light concentrations through deep red-brown to near-black where it is applied thickly. Brushed in bold strokes onto ',
    'Iron oxide is one of the oldest ceramic colourants: at low concentration it fires warm amber; applied thickly it reaches dark brown to near-black. Brushed in bold strokes onto '
  );
  replaceText(d.body,
    'ware and covered with a transparent or semi-matte overglaze, the iron wash becomes a permanent tonal painting sealed inside the glaze layer. The result after the ',
    'ware and covered with a transparent or semi-matte overglaze, the iron becomes a tonal drawing sealed inside the glaze. After the '
  );
  replaceText(d.body,
    ' 6 (1220 degrees C) has a warm, painterly quality with brush marks reading as dark-on-light through the glaze surface. The tonal range from a single iron oxide wash depends on application thickness: one thin coat gives amber-honey; three coats in the same area builds toward dark brown.',
    ' 6 (1220 degrees C), brush marks read as dark-on-light through the glaze surface. One thin coat gives amber-honey; three coats in the same area builds toward dark brown.'
  );
  replaceText(d.body,
    'Do not scrub the mop brush over the iron oxide wash during the first overglaze coat: the first brushstroke over each area should be applied quickly and without back-and-forth motion, or it will lift the oxide from the bisque surface.',
    'Do not scrub the brush over the wash on the first overglaze coat: one quick stroke per area, no back-and-forth. The first stroke locks the oxide in place; later coats can be worked more freely.'
  );
  replaceText(d.body,
    'Under a semi-matte glaze: the semi-matte glaze surface shows the tonal range of the iron wash more subtly than a full transparent glaze, giving a more muted, earthy result.',
    'Under a semi-matte glaze: the iron tones read more softly than under a full transparent glaze, giving a muted, earthy finish.'
  );
  replaceText(d.body,
    'Layered with cobalt: combine a light iron oxide wash in areas with a cobalt blue underglaze in others, seal under a common transparent glaze, and fire together for a two-colour tonal range.',
    'Layered with cobalt: paint iron oxide in some areas and cobalt blue in others, seal both under a transparent glaze, and fire for a two-colour surface.'
  );
  save('31-stoneware-iron-oxide-brushwork.tutorial.json', d);
}

// ── FILE 32: grade-level (3 paragraphs) ──────────────────────────────────────
console.log('Fixing 32 (grade-level)...');
{
  const d = load('32-crater-glaze-surface-texture.tutorial.json');
  replaceText(d.body,
    'For the silicon carbide alternative or combination: weigh 2 g of 60-mesh silicon carbide grit and add to the glaze alongside or instead of the lithium carbonate. Silicon carbide releases carbon monoxide and carbon dioxide gas at high temperature and produces a more irregular, coarse crater surface. Mix thoroughly; silicon carbide is denser than the glaze and settles quickly, so stir before each brush load.',
    'Silicon carbide alternative: weigh 2 g of 60-mesh grit and add it instead of, or alongside, the lithium carbonate. Silicon carbide releases gas at high temperature and gives a coarser, more uneven crater surface. Stir before each brush load as the grit sinks quickly.'
  );
  replaceText(d.body,
    'Colour over craters: once fired, the crater surface can be dry-brushed with a contrasting glaze or iron oxide wash and re-fired to fill the pits with a second colour.',
    'Colour over craters: dry-brush a contrasting glaze or iron oxide wash over the fired surface and re-fire to add colour inside the pits.'
  );
  replaceText(d.body,
    'Partial crater coverage: apply the crater glaze in a band across the middle of a piece and a standard glaze above and below to show the contrast between the two surface types.',
    'Partial coverage: apply crater glaze in a band across the middle and standard glaze above and below to show both surface types side by side.'
  );
  save('32-crater-glaze-surface-texture.tutorial.json', d);
}

// ── FILE 33: grade-level ──────────────────────────────────────────────────────
console.log('Fixing 33 (grade-level)...');
{
  const d = load('33-layering-matte-and-glossy-glazes.tutorial.json');
  replaceText(d.body,
    'Multiple passes with varying dip depths: dip a second time in the glossy glaze slightly shallower than the first dip, creating two defined glaze bands with two overlap zones.',
    'Multiple dips: dip a second time in the glossy glaze slightly shallower than the first, creating two glaze bands with two distinct overlap zones.'
  );
  save('33-layering-matte-and-glossy-glazes.tutorial.json', d);
}

// ── FILES 34-40 (sub-agent D): fix glossaryTerms keys termSlug→slug only ──
const filesD = [
  '34-pit-firing-outdoor-basics.tutorial.json',
  '35-bisque-firing-common-problems.tutorial.json',
  '36-firing-test-tiles-systematic-approach.tutorial.json',
  '37-sprig-moulding-air-dry-clay.tutorial.json',
  '38-building-a-clay-armature-figurine.tutorial.json',
  '39-slab-built-kitchen-herb-pot-tray.tutorial.json',
  '40-throwing-matched-pair-of-sauce-bowls.tutorial.json',
];
for (const fn of filesD) {
  const d = load(fn);
  fixGlossaryKeys(d, false); // rename termSlug→slug, keep term as-is
  save(fn, d);
}
console.log('Fixed glossaryTerms keys for files 34-40');

// ── FILE 36: grade-level (paragraph[0] and troubleshooter item[3].fix) ─────
console.log('Fixing 36 (grade-level)...');
{
  const d = load('36-firing-test-tiles-systematic-approach.tutorial.json');
  // paragraph[0]: text nodes around the two tooltips
  replaceText(d.body,
    ' is the fastest way to build a reliable glaze reference for your studio. Instead of guessing how two glazes will interact, or repeating the same mistakes on pots, you fire a ',
    ' is the fastest way to build a reliable glaze reference. Instead of guessing how glazes interact, fire a '
  );
  replaceText(d.body,
    ': a grid of small, numbered tiles with every combination you want to know. Fire them all in one cone 6 (1220 degrees C) load alongside your regular work, record the outcomes in a firing log, and you have a physical reference that never lies. This tutorial covers making the tiles, setting up a simple two-variable matrix, applying glazes, loading, and logging results.',
    ': a grid of numbered tiles covering every combination you want to know. Fire them in one cone 6 (1220 degrees C) load, record outcomes in a firing log, and you have a reference that never lies. This tutorial covers making the tiles, planning a matrix, applying glazes, and logging results.'
  );
  // troubleshooter item[3].fix
  replaceText(d.body,
    'Apply the overglaze more thickly, or switch to testing opaque-over-clear rather than opaque-over-opaque.',
    'Apply a thicker coat of overglaze, or test clear glaze over opaque rather than opaque over opaque.'
  );
  save('36-firing-test-tiles-systematic-approach.tutorial.json', d);
}

// ── FILE 38: "72 hours" ───────────────────────────────────────────────────────
console.log('Fixing 38 (72 hours)...');
{
  const d = load('38-building-a-clay-armature-figurine.tutorial.json');
  replaceText(d.body, '72 hours', '3 days');
  save('38-building-a-clay-armature-figurine.tutorial.json', d);
}

// ── FILE 39: "72 hours" ───────────────────────────────────────────────────────
console.log('Fixing 39 (72 hours)...');
{
  const d = load('39-slab-built-kitchen-herb-pot-tray.tutorial.json');
  replaceText(d.body, '72 hours', '3 days');
  save('39-slab-built-kitchen-herb-pot-tray.tutorial.json', d);
}

console.log('All fixes applied.');
