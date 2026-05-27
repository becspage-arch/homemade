/**
 * One-shot patcher: apply rewrites to the batch23 files that failed
 * grade-level voice-check. Idempotent on re-run via direct paragraph rewrites.
 *
 * Run from repo root: node docs/voice-retrofit-2026-05-27-batch23/_apply-rewrites.cjs
 */
const fs = require('fs')
const path = require('path')

const DIR = path.resolve(__dirname)

function load(slug) {
  return JSON.parse(fs.readFileSync(path.join(DIR, slug + '.json'), 'utf8'))
}
function save(slug, data) {
  fs.writeFileSync(path.join(DIR, slug + '.json'), JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function textNode(s) {
  return { text: s, type: 'text' }
}

function replaceParagraphText(node, newText) {
  node.content = [textNode(newText)]
}

// 1) beef-chili
{
  const d = load('beef-chili')
  d.body.content[9].attrs.items[0].fix =
    "Continue simmering uncovered. The liquid reduces a lot over 60 to 75 minutes. Stir now and then and check the level."
  replaceParagraphText(
    d.body.content[11],
    "Chilli began on the Texas to Mexico border, in the Tex-Mex kitchen tradition. Dried chillies cooked with beef were already known in San Antonio in the 1840s. By the 1880s the 'chilli queens' of San Antonio's Military Plaza sold bowls from their outdoor stalls. The dish spread across the country in the late 1800s and early 1900s. It became one of the most cooked dishes in the American home kitchen. Regional pride still runs strong. Texas purists leave the beans out. Kansas City keeps them in. Every household has its own version."
  )
  save('beef-chili', d)
}

// 2) beef-madras
{
  const d = load('beef-madras')
  replaceParagraphText(
    d.body.content[1],
    "Cook the tomato base down to a thick paste before you add the water. This is the same key step as in lamb madras. It matters even more here. The braise runs longer, and a concentrated base keeps the flavour through the extended cook."
  )
  replaceParagraphText(
    d.body.content[11],
    "Beef madras is less common in British curry-houses than lamb or chicken madras. Beef is less used in South Asian restaurant cooking in general. The long braise also makes it harder to cook to order. Cooked properly, the meat softens and the sauce has time to develop. The dish has a depth and richness the quicker lamb version cannot match. Plan ahead and the wait pays off."
  )
  save('beef-madras', d)
}

// 3) caramel-layer-cake
{
  const d = load('caramel-layer-cake')
  replaceParagraphText(
    d.body.content[0],
    "The Swiss meringue buttercream is flavoured with a dry-method caramel. Cook the caramel separately and let it cool before beating it into the finished buttercream. The caramel stage takes care. If hot syrup touches skin, run cold water over it and seek medical care if needed."
  )
  save('caramel-layer-cake', d)
}

// 4) cardamom-buns-swedish
{
  const d = load('cardamom-buns-swedish')
  replaceParagraphText(
    d.body.content[9],
    "Beat the {{unsalted-butter}} for the filling with the {{caster-sugar}} and the {{cardamom-green}}. Keep beating until you have a smooth, spreadable paste."
  )
  save('cardamom-buns-swedish', d)
}

// 5) i-am-older-i-am-wiser-both-are-gifts
{
  const d = load('i-am-older-i-am-wiser-both-are-gifts')
  replaceParagraphText(
    d.body.content[8],
    "Written for homemade.education. The piece draws on positive-ageing writing and the life-stage tradition. That tradition names the second half of life as its own season, with its own gifts. The three-statement form is adapted from affirmation practice in the energy-statement lineage."
  )
  save('i-am-older-i-am-wiser-both-are-gifts', d)
}

// 6) photo-corner-mounting
{
  const d = load('photo-corner-mounting')
  replaceParagraphText(
    d.body.content[0],
    "Photo corners are the standard way to mount a photograph you may want to remove or move later. Unlike glue or tape, they touch only the corners of the photograph. The image surface and the back stay untouched. Acid-free photo corners will not discolour the edges over decades. Standard sticky corners with acidic adhesive will."
  )
  save('photo-corner-mounting', d)
}

// 7) polish-wycinanki-layered-cut
{
  const d = load('polish-wycinanki-layered-cut')
  replaceParagraphText(
    d.body.content[0],
    "Traditional Łowicz wycinanki are built from four to six circles of coloured paper. Each circle is cut with a lacy edge. The circles stack from largest to smallest. The layers give depth and colour contrast. This tutorial builds a five-layer rosette. Each circle is cut with fold-cut symmetry."
  )
  save('polish-wycinanki-layered-cut', d)
}

// 8) preparing-a-dip-nib
{
  const d = load('preparing-a-dip-nib')
  replaceParagraphText(
    d.body.content[10],
    "A broad-edge nib needs replacing when the square writing edge shows a notch or a rounded tip that catches the paper rather than gliding. Also when ink no longer flows well even after re-loading, or when the reservoir clips out of place again and again. A pointed nib needs replacing when the tines spring apart at the base rather than staying parallel. Or when the writing point scratches rather than slides. Both signs usually appear after heavy use over weeks or months of regular practice."
  )
  save('preparing-a-dip-nib', d)
}

// 9) pressing-and-drying-handmade-sheets
{
  const d = load('pressing-and-drying-handmade-sheets')
  const liPara = d.body.content[5].content[0].content[0]
  replaceParagraphText(
    liPara,
    "Once the sheet has formed on the mould and most of the free water has drained, tilt the mould to 45 degrees. Press the papermaking sponge gently against the back (mesh side) of the mould. This draws away any surface water pooled at the deckle edge."
  )
  save('pressing-and-drying-handmade-sheets', d)
}

// 10) pyrography-starter-kit
{
  const d = load('pyrography-starter-kit')
  replaceParagraphText(
    d.body.content[8],
    "On a scrap of birch, practise three things before you start a finished piece. First, a straight continuous line at a slow pace. Second, the same line at a faster pace (note the difference in tone). Third, a series of short tapered strokes lifted at the end of each movement. These three stroke types cover ninety per cent of all pyrography work. A cooling stand on the bench is not optional. Return the burner to the stand between every stroke. That habit must be automatic before you start any project."
  )
  save('pyrography-starter-kit', d)
}

// 11) pyrography-sycamore-name-plaque
{
  const d = load('pyrography-sycamore-name-plaque')
  replaceParagraphText(
    d.body.content[0],
    "Sycamore is the favourite wood for lettering with a pyrography burner. It is pale, even-grained, and fine in texture. The grain does not compete with the letter outlines. A name plaque on seasoned sycamore needs only a solid-tip burner with a writing tip. The optional ball stylus adds a stippled texture to border areas and small decorative motifs. The result is a useful household piece and a full introduction to pyrography."
  )
  save('pyrography-sycamore-name-plaque', d)
}

// 12) reducing-packaging-waste
{
  const d = load('reducing-packaging-waste')
  replaceParagraphText(
    d.body.content[0],
    "The packaging waste hierarchy: avoid first, then reduce, then choose recyclable materials, then recycle. Most packaging talk begins at recycling and skips the higher rungs. Around 44% of UK kerbside-collected plastic is actually recycled into new products. The rest is either sent abroad or disposed of. Knowing what your local council really recycles changes how you shop."
  )
  d.body.content[7].attrs.body =
    "Packaging labelled 'compostable' or 'biodegradable' needs industrial composting conditions (55 to 70 °C for several weeks) to break down. Most UK councils do not take it in food waste or garden waste collections. It should not go in a home compost bin or wormery. Without industrial processing, 'compostable' packaging behaves like standard plastic in the environment. Check your council's food waste processing method before you assume this packaging is environmentally neutral."
  replaceParagraphText(
    d.body.content[8],
    "Apply the circular economy idea to packaging. Choose glass or metal where recycling actually works. Avoid flexible plastic where an alternative exists. Reduce the overall amount by buying in bulk. The embodied carbon of packaging varies a lot by material. The biggest single change is reducing how much enters the home in the first place."
  )
  save('reducing-packaging-waste', d)
}

// 13) repair-rather-than-replace-decision-guide
{
  const d = load('repair-rather-than-replace-decision-guide')
  replaceParagraphText(
    d.body.content[0],
    "Making a new washing machine produces around 200 to 300 kg of CO₂e in embodied carbon. The UK grid runs at roughly 200 g CO₂e per kWh. That is the same as running the machine for 6 to 9 weeks before the operating carbon from the new one overtakes the old one. Keeping an existing appliance going for five more years saves that manufacturing carbon entirely."
  )
  replaceParagraphText(
    d.body.content[2],
    "A common rule of thumb: if the repair cost is more than 50% of the replacement cost, replacing is usually the better choice. Adjust for the remaining life. A 10-year-old appliance at the end of its usual lifespan should clear a lower bar than a 2-year-old still in peak life. The rule breaks down when a new appliance is much more energy efficient than the old one. It also breaks down when parts are no longer available."
  )
  // bulletList[4] > listItem[2] > paragraph[0]
  replaceParagraphText(
    d.body.content[4].content[2].content[0],
    "Repair cafes and community repair events. The Restart Project (therestartproject.org) runs a directory of free repair events in the UK."
  )
  replaceParagraphText(
    d.body.content[6],
    "EU Directive 2024/1799 gives EU consumers a right to request repair from manufacturers for common goods. The list covers washing machines, dishwashers, televisions, bicycles, clothing, and smartphones. Repairs must be at a reasonable cost. Parts must be available for a set number of years after manufacture. The UK government is consulting on its own version. Check gov.uk for the current status."
  )
  // bulletList[8] > listItem[0] > paragraph[0]
  replaceParagraphText(
    d.body.content[8].content[0].content[0],
    "Safety. An appliance with electrical faults, gas leaks, or structural failures that cannot be fixed should be replaced."
  )
  // bulletList[8] > listItem[2] > paragraph[0]
  replaceParagraphText(
    d.body.content[8].content[2].content[0],
    "Efficiency. A new A-rated appliance using half the electricity of an old E-rated one may be worth replacing. The energy saved over 5 years should cover the embodied carbon of the new unit."
  )
  save('repair-rather-than-replace-decision-guide', d)
}

// 14) right-to-repair-electronics
{
  const d = load('right-to-repair-electronics')
  replaceParagraphText(
    d.body.content[0],
    "The electronics repairs that prevent the most waste are battery replacements in smartphones and laptops, screen replacements in phones, and heating element or pump replacements in washing machines and dishwashers. Battery failure is the single most common reason a phone or laptop is thrown out. All of these have a steady repair market. Parts are available. Step-by-step guides are on iFixit."
  )
  replaceParagraphText(
    d.body.content[6].content[0].content[0],
    "Repair Cafes. Volunteer-run events in libraries and community centres. Skilled volunteers help repair electronics, clothing, and household items. Repair Cafe International's website lists events by location."
  )
  replaceParagraphText(
    d.body.content[6].content[1].content[0],
    "The Restart Project. London-based, with a national network. It focuses on consumer electronics and runs Restart Parties where fixers help with repairs."
  )
  replaceParagraphText(
    d.body.content[6].content[2].content[0],
    "Independent mobile phone repair shops. Often offer screen and battery replacement at lower cost than manufacturer service centres. Often done while you wait."
  )
  save('right-to-repair-electronics', d)
}

// 15) rocket-stove-principles
{
  const d = load('rocket-stove-principles')
  replaceParagraphText(
    d.body.content[0],
    "A rocket stove's efficiency comes from three design ideas working together. First, the L-shape creates a strong natural draft. Second, insulation at the burn zone keeps the temperature high without constant stoking. Third, the top-feeding fuel design means only the tip of each piece of wood burns at any time. That cuts the surface area in contact with the fire."
  )
  save('rocket-stove-principles', d)
}

// 16) sanding-wooden-floors-by-machine
{
  const d = load('sanding-wooden-floors-by-machine')
  replaceParagraphText(
    d.body.content[0],
    "A solid hardwood floor can be sanded and re-finished many times in its life. The floor is usually thick enough for four to six full sand-and-finish cycles. Engineered floors can usually be sanded once or twice. The exact number depends on the thickness of the hardwood wear layer. The sanding work divides into three areas. The field is the main area, covered by the drum belt sander. The perimeter is covered by a rotary edge sander. The corners and doorways are covered by hand with a sanding block."
  )
  save('sanding-wooden-floors-by-machine', d)
}

// 17) setting-up-a-rainwater-harvesting-system-for-stock
{
  const d = load('setting-up-a-rainwater-harvesting-system-for-stock')
  replaceParagraphText(
    d.body.content[0],
    "A standard livestock building with a 100 sq m corrugated metal roof can yield around 60,000 litres of rainwater per year in a typical UK rainfall area. The system has three parts: a downpipe diversion, a storage tank, and a gravity or pumped distribution line to the drinkers."
  )
  replaceParagraphText(
    d.body.content[2],
    "The minimum system needs a downpipe leaf filter to keep coarse debris out. It also needs a first flush diverter on each downpipe entering the tank. A covered storage tank (a 1,000 to 5,000 litre IBC or purpose-made tank) holds the water. An overflow pipe directs surplus to a soakaway or drainage channel. An outlet tap or automatic ball valve supplies the drinkers."
  )
  save('setting-up-a-rainwater-harvesting-system-for-stock', d)
}

// 18) spreading-manure-and-timing-the-spread
{
  const d = load('spreading-manure-and-timing-the-spread')
  replaceParagraphText(
    d.body.content[0],
    "Farmyard manure (FYM) from stock bedding is ready to spread once the straw has composted. The heap should have heated and then cooled over six to eight weeks. Fresh manure spread directly on pasture damages the grass and creates a strong odour. Well-composted manure breaks down faster on the soil. It also reduces the loss of nitrogen as ammonia."
  )
  save('spreading-manure-and-timing-the-spread', d)
}

// 19) stripping-a-painted-pine-table
{
  const d = load('stripping-a-painted-pine-table')
  replaceParagraphText(
    d.body.content[0],
    "Pine stripped back to bare wood takes stain and oil finishes well. The work only pays off if every trace of paint is removed and the grain is clean. Water-based chemical stripper is the standard choice for furniture indoors. It lifts several layers of paint at once. It does not raise the grain as much as solvent stripper. And it does not need the heavy ventilation solvent products demand."
  )
  save('stripping-a-painted-pine-table', d)
}

// 20) wet-felted-pebble-set
{
  const d = load('wet-felted-pebble-set')
  replaceParagraphText(
    d.body.content[13],
    "For a pebble with a contrasting core colour, wrap a small inner ball of one colour with an outer layer of roving in a contrasting colour before the first wetting. The inner colour will show slightly at any surface wear points over time. That gives a natural weathered effect. For a striped pebble, lay thin wisps of contrasting roving around the dry ball before the first wetting. Press them in gently during the first rolling phase before they have a chance to slide."
  )
  d.body.content[14].attrs.items[1].cause =
    "The roving was a coarser breed (Romney or similar) rather than fine Merino or Corriedale. Or the ball was not rolled long enough. Either way, surface fibres did not bed into a smooth finish."
  save('wet-felted-pebble-set', d)
}

console.log('Done applying rewrites.')
