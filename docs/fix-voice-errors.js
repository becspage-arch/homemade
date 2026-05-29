const fs = require('fs');
const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/pottery-ceramics-bulk-004-briefs';

function replace(content, from, to) {
  if (!content.includes(from)) {
    console.log('  WARN: string not found: ' + from.substring(0, 60));
    return content;
  }
  return content.split(from).join(to);
}

const fixes = {
  '01-slab-built-rectangular-box-with-lid.json': [
    ['— four walls and a base — fitted', '(four walls and a base) fitted'],
    ['Five flat panels — four walls and a base — are', 'Five flat panels (four walls and a base) are'],
  ],
  '05-paper-clay-wearable-brooch.json': [
    ['The surface does not need to be perfectly flat — slight undulation is part of the handmade character.', 'The surface does not need to be perfectly flat; slight undulation is part of the handmade character.'],
  ],
  '06-polymer-clay-sculpted-hedgehog.json': [
    ['Cures at 130°C for 25 minutes.', 'Hardens at 130°C for 25 minutes.'],
    ['the piece cures in a standard domestic oven.', 'the piece hardens in a standard domestic oven.'],
    ['Knead polymer clay thoroughly until it is uniformly pliable before sculpting', 'Knead the polymer clay until it feels soft and even throughout before sculpting'],
  ],
  '07-slab-angled-wall-vase.json': [
    ['(rectangle — shorter than the back so the front leans forward)', '(rectangle; shorter than the back so the front leans forward)'],
    ['cut as trapezoids — 180 mm tall at the back edge and 160 mm tall at the front edge', 'cut as trapezoids: 180 mm tall at the back edge, 160 mm tall at the front edge'],
  ],
  '08-coil-built-square-vessel.json': [
    ['Leave the outside walls showing the coil texture — smooth only the inside — for a tactile exterior surface.', 'Leave the outside walls showing the coil texture (smooth only the inside) for a tactile exterior surface.'],
  ],
  '09-majolica-style-painted-tile.json': [
    ['The majolica tradition is one of the most recognised decorative systems in European ceramics: an opaque white ground with strong-coloured painted motifs, typically botanical or geometric. This tutorial makes one decorative tile using air-dry clay and acrylic paints rather than tin glaze. The result is not food-safe or waterproof, but as wall art it is visually convincing.',
     'Majolica is a style of decorated European ceramic with an opaque white ground and strong-coloured painted motifs, often botanical or geometric. This tutorial makes one decorative tile using air-dry clay and acrylic paints instead of tin glaze. The tile is not food-safe or waterproof, but works well as wall art.'],
    ['A majolica line is confident — it does not hedge or feather.', 'A majolica line is confident. It does not hedge or feather.'],
    ['Make four tiles with complementary quarter-motifs so they combine into one large design when hung together.',
     'Make four tiles, each with a quarter of the motif, so they fit together as one large design when hung as a group.'],
    ['Cut the tile into a hexagon for a more traditional Italian majolica floor-tile shape.',
     'Cut the tile into a hexagon for a classic Italian floor-tile shape.'],
    ['Use earthenware-red clay instead of plain white air-dry for an Iznik-palette tile — the warm clay body shows through deliberately at the edges and provides a period-appropriate base under the white ground.',
     'Use earthenware-red clay instead of plain white air-dry clay for an Iznik-inspired tile. The warm clay body shows at the edges and gives a period-appropriate base under the white ground.'],
  ],
  '10-lace-texture-pressing-into-clay.json': [
    ['Using lace with very fine threads — the pattern becomes too shallow to read. Open-weave cotton lace gives the cleanest results.', 'Using lace with very fine threads makes the pattern too shallow to read. Open-weave cotton lace gives the cleanest results.'],
  ],
  '11-iron-oxide-wash-on-air-dry-clay.json': [
    ['An iron oxide wash is a water-diluted mixture of iron oxide powder and water brushed over the surface of dry clay. In kiln-fired ceramics, the wash colour changes as it fuses to the clay in the firing; in this no-kiln version, the oxide stays its natural earthy reddish-brown and is fixed under a layer of PVA varnish. The effect is particularly good over textured surfaces, where the wash pools in recesses and is wiped off high points to give a two-tone result.',
     'An iron oxide wash is a mix of iron oxide powder and water brushed over dry clay. In kiln-fired ceramics, the colour changes as it fuses into the clay during firing. In this no-kiln version, the oxide keeps its natural reddish-brown colour and is sealed under PVA varnish. The effect works well over textured surfaces: the wash pools in the recesses and wipes off the high points, giving a two-tone finish.'],
  ],
  '12-sgraffito-line-work-tile.json': [
    ['slip until it is smooth and creamy — it should coat a brush and flow off without dripping.', 'slip until it is smooth and creamy. It should coat a brush and flow off without dripping.'],
    ['Scratch a geometric pattern of repeated diamond shapes instead of a botanical motif for a medieval-tile aesthetic.',
     'Scratch a repeating pattern of diamond shapes instead of a botanical design, for a medieval-tile look.'],
    ['Apply two layers of different coloured slip to achieve a three-tone tile: body colour, first slip, second slip, all revealed by scratching to different depths.',
     'Apply two different coloured slips in layers for a three-tone tile. Scratch to different depths to reveal the body colour, first slip, and second slip.'],
  ],
  '13-resist-decoration-wax-emulsion-on-clay.json': [
    ['The edges between waxed and unwaxed areas are sharp — the sharper the brush edge when applying wax, the sharper the resist line.',
     'The edges between waxed and unwaxed areas are sharp. A clean brush edge when applying wax gives a sharper resist line.'],
  ],
  '16-making-sprig-moulds-from-found-objects.json': [
    ['A technique for making small press moulds from found objects — coins, buttons, shells, carved erasers — and using them to cast repeating clay sprigs for decoration.',
     'A technique for making small press moulds from found objects (coins, buttons, shells, carved erasers) and using them to cast repeating clay sprigs for decoration.'],
    ['Press a small ball of air-dry clay — about 30 g — over the object face',
     'Press a small ball of air-dry clay (about 30 g) over the object face'],
  ],
  '17-repairing-cracks-in-air-dry-greenware.json': [
    ['those that do appear are fixable if caught early enough — at ',
     'those that do appear are fixable if caught early enough, at '],
  ],
  '18-polymer-clay-skinner-blend-technique.json': [
    ['Keep the rolling direction consistent — always lengthwise.', 'Keep the rolling direction consistent; always roll lengthwise.'],
  ],
  '19-polymer-clay-mokume-gane-pendant.json': [
    ['Place the fettling knife or craft knife blade flat and horizontal at the level of the dome tops — roughly 2-3 mm into the top surface.',
     'Place the fettling knife or craft knife blade flat and horizontal at the level of the dome tops, roughly 2-3 mm into the top surface.'],
    ['Cut the pendant into an irregular organic shape after slicing, to emphasise the flowing patterns.',
     'Cut the pendant into a free organic shape after slicing, to show off the flowing patterns.'],
  ],
  '21-polymer-clay-translucent-leaf-pendants.json': [
    ['Translucent polymer clay does not become fully clear when cured — it remains slightly milky — but small botanical materials pressed into a thin sheet and sandwiched between two layers show clearly through the translucent clay. Use pressed and dried botanicals only; fresh plant material contains moisture that creates bubbles during curing.',
     'Translucent polymer clay does not become fully clear when cured. It stays slightly milky. Small botanical materials pressed into a thin sheet and sandwiched between two layers show clearly through the clay. Use pressed and dried botanicals only; fresh plant material contains moisture that creates bubbles during curing.'],
  ],
  '22-polymer-clay-millefiori-bead-bracelet.json': [
    ['A millefiori cane is a cylinder of polymer clay built up from contrasting colour layers so that every slice cut from the cylinder shows the same cross-section pattern. In this tutorial, a simple five-petal flower cane is built and its slices are applied to round bead bases to make a bracelet.',
     'A millefiori cane is a cylinder of polymer clay made from contrasting colour layers. Every slice cut from the cylinder shows the same cross-section pattern. In this tutorial, a simple five-petal flower cane is built and sliced onto round bead bases to make a bracelet.'],
  ],
  '24-polymer-clay-resist-texture-technique.json': [
    ['Both sheets should be roughly the same area — approximately 80 mm x 80 mm.',
     'Both sheets should be roughly the same area, approximately 80 mm x 80 mm.'],
    ['Cure on a dedicated tray at 130°C for 20–25 minutes depending on thickness. The technique can be applied before cutting the panel to shape, or the cut shape can be made first and the resist applied to the shaped blank.',
     'Cure on a dedicated tray at 130°C for 20-25 minutes depending on thickness. Apply the technique before cutting to shape, or cut the shape first and apply the resist to the blank.'],
  ],
  '25-throwing-a-vase-with-narrow-neck.json': [
    ['Draw the opening outward to the desired belly width — roughly two-thirds of the total height for a tall vase.',
     'Draw the opening outward to the desired belly width, roughly two-thirds of the total height for a tall vase.'],
    ['Leave the walls slightly thicker at the top than you would for a cylinder — the neck narrowing will use that extra clay.',
     'Leave the walls slightly thicker at the top than you would for a cylinder. The neck narrowing will use that extra clay.'],
    [' — typically 12–24 hours depending on ambient conditions — invert it on the wheel head',
     '. Once leather-hard (typically 12-24 hours depending on conditions), invert it on the wheel head'],
    ['Leave extra thickness in the upper walls during the pulling phase. Collar more gradually — two passes at each height rather than one aggressive push',
     'Leave extra thickness in the upper walls during the pulling phase. Collar more gradually, using two passes at each height rather than one aggressive push'],
    ['Keep the throwing stick vertical and use it as a passive support only — the outer hand does the shaping, the stick simply prevents collapse',
     'Keep the throwing stick vertical and use it as passive support only. The outer hand does the shaping; the stick simply prevents collapse'],
  ],
  '26-throwing-a-shallow-open-bowl.json': [
    ['Open to within 20 mm of the intended final rim diameter — leave room for the wall to thin as it is drawn upward.',
     'Open to within 20 mm of the intended final rim diameter, leaving room for the wall to thin as it is drawn upward.'],
    ['Finish by compressing the rim gently between thumb and forefinger, or fold the pottery chamois over the rim and run it around once.',
     'Finish by compressing the rim gently between thumb and forefinger. Alternatively, fold the chamois over the rim and run it around once.'],
    ['Do not attempt to move a fresh shallow bowl off the bat — the form is too wide and flexible.',
     'Do not attempt to move a fresh shallow bowl off the bat. The form is too wide and flexible.'],
  ],
  '27-throwing-a-tea-bowl.json': [
    ['At 250–350 ml capacity and 80–90 mm in diameter, it is small enough to hold in both hands and requires the same skills as larger forms but with less room for error. The aim is a wall of consistent thickness throughout — roughly 6–8 mm — with a base that tapers slightly toward the foot ring.',
     'At 250-350 ml capacity and 80-90 mm in diameter, it is small enough to hold in both hands. It needs the same skills as larger forms but with less room for error. The aim is a wall of consistent thickness throughout (roughly 6-8 mm), with a base that tapers slightly toward the foot ring.'],
    ['For a tea bowl, the opening is relatively small — the walls will fan outward during pulling rather than being opened wide at the base.',
     'For a tea bowl, the opening is relatively small. The walls fan outward during pulling rather than being opened wide at the base.'],
    ['Keep the rim consistent in thickness — it will be the most-handled surface.',
     'Keep the rim consistent in thickness; it will be the most-handled surface.'],
    ['The foot ring should be 35–40 mm in diameter and 5–6 mm tall. Wear the N95 mask throughout trimming.',
     'The foot ring should be 35-40 mm in diameter and 5-6 mm tall. Wear the N95 mask throughout trimming.'],
  ],
  '28-throwing-a-set-of-matching-espresso-cups.json': [
    ['Variation across a hand-made set of four is acceptable at 3–5 mm; more than that will be visible on the table.',
     'Variation across a hand-made set of four is acceptable at 3-5 mm; more than that will be visible on the table.'],
    ['Uniform clay weight is the first step toward a uniform set; without it, every throwing decision cascades into variation.',
     'Uniform clay weight is the first step toward a uniform set. Without it, every throwing decision leads to more variation.'],
    ['Check floor depth by pressing the needle tool down through the inside base until it just stops — each cup should show the same depth mark',
     'Check floor depth by pressing the needle tool through the inside base until it just stops. Each cup should show the same depth mark'],
    ['Always check the caliper measurement after the wheel stops, not while spinning — the clay relaxes slightly as it slows',
     'Always check the caliper measurement after the wheel stops, not while spinning. The clay relaxes slightly as it slows'],
  ],
  '29-pulling-and-attaching-a-thrown-spout.json': [
    ['Continue until the rope is 100–120 mm long and tapers from 30 mm at the base to 15 mm at the tip.',
     'Continue until the rope is 100-120 mm long and tapers from 30 mm at the base to 15 mm at the tip.'],
    ['cut the base end at the angle it will meet the jug body — usually 30–45 degrees to the spout axis.',
     'cut the base end at the angle it will meet the jug body, usually 30-45 degrees to the spout axis.'],
    ['Use the same pulling technique to make a handle before spout attachment — both pulled in the same clay weight and session.',
     'Use the same pulling technique to make a handle before spout attachment; both pulled in the same clay weight and session.'],
  ],
  '30-throwing-a-lidded-honey-pot.json': [
    ['The pot body has a gallery — a small recessed ledge inside the rim — that the lid sits into.',
     'The pot body has a gallery (a small recessed ledge inside the rim) that the lid sits into.'],
    ['A lidded pot requires that two separately thrown pieces — pot and lid — be made to fit each other.',
     'A lidded pot requires that two separately thrown pieces (pot and lid) be made to fit each other.'],
    ['Check the flange diameter against the calipers — it should match the gallery inner diameter. This is the critical measurement: too loose and the lid rattles; too tight and it will not seat properly after glazing.',
     'Check the flange diameter against the calipers. It should match the gallery inner diameter. This is the critical measurement: too loose and the lid rattles; too tight and it will not seat after glazing.'],
    ['Wear the N95 mask. Invert the lid on the wheel — the knob sits in a soft clay pad or in a purpose-made chuck — and trim the top surface of the lid flat.',
     'Wear the N95 mask. Invert the lid on the wheel (the knob sits in a soft clay pad or in a chuck) and trim the top surface flat.'],
    ['Use the same gallery technique for a storage jar or a teapot — any lidded form uses the same caliper method.',
     'Use the same gallery technique for a storage jar or a teapot. Any lidded form uses the same caliper method.'],
    ['Throw the lid flange 1–2 mm smaller than the gallery measurement to allow for glaze thickness on both surfaces',
     'Throw the lid flange 1-2 mm smaller than the gallery measurement to allow for glaze thickness on both surfaces'],
  ],
  '31-iron-oxide-wash-on-bisqueware.json': [
    ['Mix iron oxide with water in a dedicated container to a thin, milky consistency — roughly one part oxide to eight parts water for a medium tone.',
     'Mix iron oxide with water in a dedicated container to a thin, milky consistency, roughly one part oxide to eight parts water for a medium tone.'],
    ['Allow the wash to absorb for 2–3 minutes until the surface appears dry.',
     'Allow the wash to absorb for 2-3 minutes until the surface appears dry.'],
    ['An opaque glaze will obscure the oxide effect.',
     'An opaque glaze will cover the oxide effect.'],
  ],
  '32-celadon-glaze-on-carved-stoneware.json': [
    ['Stir the glaze bucket thoroughly — celadon settles fast.',
     'Stir the glaze bucket thoroughly; celadon settles fast.'],
    ['Lower it into the glaze bucket and submerge the piece fully for 3–4 seconds.',
     'Lower it into the glaze bucket and submerge fully for 3-4 seconds.'],
    ['Carved recesses will hold slightly more glaze — this is the desired effect.',
     'Carved recesses hold slightly more glaze, which is the desired effect.'],
    ['glaze solids may have settled to a hard layer at the bottom — stir up from the base',
     'glaze solids may have settled to a hard layer at the bottom; stir up from the base'],
  ],
  '33-double-dip-glaze-two-colour-bowl.json': [
    ['Choose two mid-fire glazes that are known to be compatible — from the same manufacturer\'s range is safest.',
     'Choose two mid-fire glazes that are compatible. Glazes from the same manufacturer\'s range are safest.'],
    ['Allow to dry fully — 20–30 minutes.',
     'Allow to dry fully, about 20-30 minutes.'],
    ['This creates an overlap zone of 30–40 mm in the mid-section where both glazes are present.',
     'This creates an overlap zone of 30-40 mm in the mid-section where both glazes are present.'],
    ['Choose glazes with different surface qualities — a shiny and a matt, or a dark and a pale, for readable overlap effects',
     'Choose glazes with different surface qualities: a shiny and a matt, or a dark and a pale, for readable overlap effects'],
  ],
  '34-painting-underglaze-on-leather-hard-stoneware.json': [
    ['Stir the underglaze to an even consistency — it should brush smoothly without being watery.',
     'Stir the underglaze to an even consistency. It should brush smoothly without being watery.'],
    ['Underglaze behaves similarly to thick watercolour — it dries quickly on the porous greenware surface, so work confidently and avoid scrubbing over dried areas.',
     'Underglaze behaves like thick watercolour. It dries quickly on the porous greenware surface, so work confidently and avoid scrubbing over dried areas.'],
  ],
  '35-glaze-trailing-on-a-flat-stoneware-plate.json': [
    ['For trailing, the glaze should be slightly thicker than dipping consistency — about the texture of double cream.',
     'For trailing, the glaze should be slightly thicker than dipping consistency, about the texture of double cream.'],
    ['The line should be 2–3 mm wide and 1–2 mm proud of the surface.',
     'The line should be 2-3 mm wide and 1-2 mm proud of the surface.'],
    ['Simple flowing curves, leaf shapes, and loose botanical outlines work best — complex fine detail tends to lose definition during firing.',
     'Simple flowing curves, leaf shapes, and loose botanical outlines work best. Complex fine detail tends to lose definition during firing.'],
    ['Use a trailer with a 3–4 mm nozzle diameter.',
     'Use a trailer with a 3-4 mm nozzle diameter.'],
  ],
  '36-loading-an-electric-kiln-for-bisque.json': [
    ['Bone-dry greenware pieces are loaded into an electric kiln on kiln shelves supported by kiln posts. For bisque firing, unlike glaze firing, pieces can touch and stack. A loaded kiln is fired slowly to bisque temperature, typically cone 06–04, to harden the work without melting any glaze.',
     'Bone-dry greenware is loaded into an electric kiln on shelves supported by kiln posts. Pieces can touch and stack in bisque firing, unlike glaze firing. The kiln is fired slowly to bisque temperature, typically cone 06 to 04, to harden the work without melting any glaze.'],
    ['Greenware must be bone-dry before loading — any residual moisture turns to steam in the kiln and can crack or explode the piece.',
     'Greenware must be bone-dry before loading. Any residual moisture turns to steam in the kiln and can crack or explode the piece.'],
    ['Pack efficiently — a densely loaded bisque firing is more economical than a sparse one.',
     'Pack efficiently; a densely loaded bisque firing is more economical than a sparse one.'],
    ['Once the target cone bends, switch the kiln off and allow it to cool with the lid closed and the peephole plugged.',
     'Once the target cone bends, switch the kiln off and allow it to cool with the lid closed.'],
    ['Fire to cone 04 for a harder bisque that absorbs glaze slightly more slowly — useful for intricate pieces that are hard to glaze evenly.',
     'Fire to cone 04 for a harder bisque that absorbs glaze slightly more slowly. This is useful for intricate pieces that are hard to glaze evenly.'],
    ['Check dryness carefully before loading. Fire the first phase at 50–80°C per hour to drive off moisture very slowly',
     'Check dryness carefully before loading. Fire the first phase at 50-80°C per hour to drive off moisture gently'],
    ['Kiln thermocouple reading not matching actual temperature; common in older kilns',
     'The kiln thermocouple was not reading the actual temperature accurately. This is common in older kilns.'],
  ],
  '37-raku-firing-outdoor-process.json': [
    ['Raku is an outdoor process that requires protective clothing, a clear working area, and a fire extinguisher within reach. The pieces must be made from a high-grog raku clay body to withstand the extreme thermal shock of being removed from a hot kiln. The reduction atmosphere in the post-firing container produces the characteristic raku effects: metallic lustre in the glazed areas and deep carbon black in the unglazed clay.',
     'Raku is an outdoor process. You need protective clothing, a clear working area, and a fire extinguisher within reach. The pieces must use a high-grog raku clay body to handle the thermal shock of removal from a hot kiln. Reduction in the post-firing container produces the characteristic effects: metallic lustre in glazed areas and carbon black in the unglazed clay.'],
    ['Apply raku glaze to bisqued pieces by brushing or dipping to a thicker coat than standard glazing — approximately 2 mm.',
     'Apply raku glaze to bisqued pieces by brushing or dipping to a thicker coat than standard glazing, approximately 2 mm.'],
    ['Raku firing is much faster than bisque or glaze firing — a small raku kiln typically reaches temperature in 20–40 minutes.',
     'Raku firing is much faster than bisque or glaze firing. A small raku kiln typically reaches temperature in 20-40 minutes.'],
    ['Allow the reduction process to run for 10–15 minutes with the lid sealed.',
     'Allow the reduction process to run for 10-15 minutes with the lid sealed.'],
    ['Clay body not a raku-formulated body with sufficient grog; standard stoneware cannot withstand the thermal shock',
     'The clay was not a raku-formulated body with enough grog. Standard stoneware cannot handle the thermal shock.'],
    ['Insufficient combustible material in the bin; reduction atmosphere not dense enough',
     'Not enough combustible material was in the bin. The reduction atmosphere was not dense enough.'],
  ],
  '38-kiln-wash-preparation-and-shelf-care.json': [
    ['until the consistency is similar to single cream — thin enough to brush easily but thick enough to opaque on the shelf surface in a single coat.',
     'until the consistency is similar to single cream: thin enough to brush easily but thick enough to coat the shelf surface in a single coat.'],
    ['Allow to dry completely — typically 30–60 minutes.',
     'Allow to dry completely, typically 30-60 minutes.'],
    ['Do not simply paint over a glaze drip — the raised area will transfer to the next piece placed over it.',
     'Do not simply paint over a glaze drip. The raised area will transfer to the next piece placed over it.'],
    ['Use a dedicated kiln wash brush and keep it only for this purpose — kiln wash residues on a glaze brush will contaminate the glaze.',
     'Use a dedicated kiln wash brush and keep it only for this purpose. Kiln wash residues on a glaze brush will contaminate the glaze.'],
  ],
  '39-understanding-reduction-atmosphere-in-kilns.json': [
    ['and copper oxide in glazes — effects that cannot be reproduced in an electric kiln without special techniques.',
     'and copper oxide in glazes. These effects cannot be reproduced in an electric kiln without special techniques.'],
    ['The clay body is also affected by the firing atmosphere. Iron in the clay body (especially in red earthenware or iron-bearing stoneware) changes from rusty red in oxidation to warm grey-brown or near-black in reduction. Flash marks — areas where the flame path contacts the clay directly — produce dark patches on otherwise pale stoneware and give wood-fired and gas-fired pots their characteristic irregular surfaces.',
     'The clay body is also affected by the kiln atmosphere. Iron in the clay (especially in red earthenware or iron-bearing stoneware) shifts from rusty red in oxidation to grey-brown or near-black in reduction. Flash marks are dark patches where the flame path contacts the clay directly. They give wood-fired and gas-fired pots their characteristic irregular look.'],
    ['Community ceramics studios: many offer gas-kiln firings where members can load individual pieces for reduction firing, charged per shelf space.',
     'Community studios: many offer gas-kiln sessions where members can load pieces for reduction firing, paying per shelf space.'],
    ['Electric kilns fire in oxidation; the dramatic colour transformations of reduction are not available',
     'Electric kilns fire in oxidation. The colour changes that come from reduction are not possible in an electric kiln'],
    ['Too little combustible material in the saggar; reduction atmosphere not sustained',
     'Not enough combustible material was in the saggar. The reduction atmosphere was not strong enough to hold'],
  ],
  '40-sgraffito-on-thrown-stoneware-greenware.json': [
    ['Sgraffito on a thrown pot uses the contrast between the slip coating and the clay body as the visual element. Apply slip when the pot is soft leather-hard, then scratch the design when the slip has dried to a firmer leather-hard state — firm enough that the slip does not smear when touched but soft enough that the tool cuts cleanly without powdering.',
     'Sgraffito on a thrown pot uses the contrast between the slip and the clay body as decoration. Apply the slip when the pot is soft leather-hard. Scratch the design once the slip has firmed to a firmer leather-hard state: at that point the slip should not smear when touched, but the tool still cuts cleanly without powdering.'],
    ['The surface should feel dry to the touch but the pot should still feel cool and slightly yielding — not bone-dry.',
     'The surface should feel dry to the touch but the pot should still feel cool and slightly yielding, not bone-dry.'],
    ['Clear the slip shavings by tapping the piece over a bin — they will dry and flake off cleanly at this moisture level.',
     'Clear the slip shavings by tapping the piece over a bin; they will dry and flake off cleanly at this moisture level.'],
    ['Apply slip when the pot is soft leather-hard — cool to the touch but not stiff.',
     'Apply slip when the pot is soft leather-hard: cool to the touch but not stiff.'],
  ],
};

let totalFixed = 0;
for (const [filename, replacements] of Object.entries(fixes)) {
  const filepath = dir + '/' + filename;
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = 0;
  for (const [from, to] of replacements) {
    const before = content;
    content = replace(content, from, to);
    if (content !== before) changed++;
  }
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(filename + ': ' + changed + ' replacement(s)');
  totalFixed += changed;
}
console.log('\nTotal replacements: ' + totalFixed);

// Validate all changed files are still valid JSON
let valid = true;
for (const filename of Object.keys(fixes)) {
  try {
    JSON.parse(fs.readFileSync(dir + '/' + filename, 'utf8'));
  } catch(e) {
    console.log('INVALID JSON after fix: ' + filename + ' - ' + e.message);
    valid = false;
  }
}
if (valid) console.log('All fixed files are valid JSON.');
