/**
 * One-shot patcher: apply rewrites to the 15 batch22 files that failed
 * grade-level voice-check. Idempotent on re-run via marker check.
 *
 * Run from repo root: node docs/voice-retrofit-2026-05-27-batch22/_apply-rewrites.cjs
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
function paragraph(s) {
  return { type: 'paragraph', content: [textNode(s)] }
}

function replaceParagraphText(node, newText) {
  node.content = [textNode(newText)]
}

// 1) beef-and-guinness-stew paragraph[12]
{
  const d = load('beef-and-guinness-stew')
  replaceParagraphText(
    d.body.content[12],
    "Beef braised in Guinness is a pub dish from Ireland and Britain. It is a pot made to be kept warm and served over several days. It gets better with each reheat. The dish is not a hard one. The quality of the braise depends almost entirely on patience: low heat, long time, and not lifting the lid."
  )
  save('beef-and-guinness-stew', d)
}

// 2) beef-bourguignon orderedList[5] > listItem[10] > paragraph[0]
//    + paragraph[12]
{
  const d = load('beef-bourguignon')
  const liPara = d.body.content[5].content[10].content[0]
  replaceParagraphText(
    liPara,
    "Cover and cook in the oven for about 2 hours, or until the beef is tender. I cook mine for 5 to 8 hours. Add water as needed to keep the meat and vegetables covered."
  )
  replaceParagraphText(
    d.body.content[12],
    "Classical French cooking rests on this kind of dish. Slow pull of flavour. Careful seasoning. Restraint at the end. The method was set down by Escoffier and the Larousse Gastronomique. Cooks like Elizabeth David and Julia Child later brought it into the English-language kitchen."
  )
  save('beef-bourguignon', d)
}

// 3) caramel-fudge paragraph[1]
{
  const d = load('caramel-fudge')
  replaceParagraphText(
    d.body.content[1],
    "Fudge has two moments that matter. First, reach the correct temperature (the soft-ball stage). Then beat the fudge at the right temperature after it has cooled. A sugar thermometer is not optional. Guessing the heat gives you a different fudge each time."
  )
  save('caramel-fudge', d)
}

// 4) i-am-enough-as-i-am-today paragraph[12]
{
  const d = load('i-am-enough-as-i-am-today')
  replaceParagraphText(
    d.body.content[12],
    "Affirmation craft is public-domain practice. It has roots in the New Thought movement of the late nineteenth century. The modern form was popularised by writers like Louise Hay in You Can Heal Your Life. The present-tense, positive shape used here follows the received craft. The specific sentence and its use as a daily practice are original to homemade.education."
  )
  save('i-am-enough-as-i-am-today', d)
}

// 5) paste-paper-comb-patterns paragraph[0] + paragraph[8] + sourceNotes
{
  const d = load('paste-paper-comb-patterns')
  replaceParagraphText(
    d.body.content[0],
    "Combed paste paper is a sheet brushed with thick coloured paste, then combed in patterns while the paste is still wet. The German name for it is Kleisterpapier. The patterns are some of the most varied in the decorated-paper tradition: the comb teeth carve through the paste and leave a crisp ridge along every line."
  )
  replaceParagraphText(
    d.body.content[8],
    "For a two-colour paste paper, apply and comb the first colour. Let it dry partially for 10 minutes, until the surface is matt but still slightly flexible. Apply the second colour over the top. Comb at 90° or on a diagonal. The first colour shows through the second wherever the comb teeth remove paste from the ridges."
  )
  d.sourceNotes =
    "Combed paste paper appears as bookbinding endpaper from at least the seventeenth century in Nuremberg and Augsburg binderies, where the German name Kleisterpapier was coined. Esther K. Smith, How to Make Books (Potter Craft, 2007), paste-paper chapter. Gabriele Mazzotta, Paste Papers (Gremese, 1994), historical paste paper styles from German and Italian binding workshops."
  save('paste-paper-comb-patterns', d)
}

// 6) pyrography-mandala-panel paragraph[1]
{
  const d = load('pyrography-mandala-panel')
  replaceParagraphText(
    d.body.content[1],
    "A mandala design suits pyrography. The repeating geometry lets you finish one section fully before burning the next. Each completed segment teaches you the heat shade range of the burner. The round birch disc is also a forgiving surface. The pale even grain of birch ply burns to a uniform tone, without the busy figure of solid timber."
  )
  save('pyrography-mandala-panel', d)
}

// 7) pyrography-nature-panel paragraph[0]
{
  const d = load('pyrography-nature-panel')
  replaceParagraphText(
    d.body.content[0],
    "A nature panel uses fine line work and graded shading to draw a botanical subject on pale hardwood. A fern frond is an ideal first subject. It is built from the same shape (the pinnule) repeated at smaller sizes from the base to the tip. Pale sycamore is the best surface for this. The grain reads as soft texture under the fronds. The pale background carries the full tonal range, from light shading to dark line."
  )
  save('pyrography-nature-panel', d)
}

// 8) pyrography-shading-technique paragraph[0]
{
  const d = load('pyrography-shading-technique')
  replaceParagraphText(
    d.body.content[0],
    "Shading is the technique that moves pyrography from outline work into tonal drawing. With a shading tip on a wire-nib burner set to a medium heat, you can get a full tonal range from near-white to near-black. The shade depends on how slowly or quickly the nib moves across the surface. A wire-nib burner is much better for shading than a solid-tip burner. The wire nib lets you set the heat finely. A solid-tip burner runs at one fixed heat and cannot give the graded tones that make shading work."
  )
  save('pyrography-shading-technique', d)
}

// 9) reading-an-in-home-display paragraph[10]
{
  const d = load('reading-an-in-home-display')
  replaceParagraphText(
    d.body.content[10],
    "The IHD does not show which device is drawing power, only the total load. For more detail, use a plug-in energy monitor (one socket at a time) or a whole-house clamp meter that breaks the load down per circuit. The IHD also does not usually show solar export or import if a solar system is fitted. For that, use the solar inverter's own monitor."
  )
  save('reading-an-in-home-display', d)
}

// 10) reading-and-understanding-your-epc paragraph[6]
{
  const d = load('reading-and-understanding-your-epc')
  replaceParagraphText(
    d.body.content[6],
    "Recommendations are ranked by cost band and yearly saving. The saving figures are not precise. They come from the SAP model at standard occupancy assumptions, not from your actual energy use. Use them to rank the measures by order of magnitude. A higher saving estimate is more meaningful than a lower one, but do not take the absolute figures literally."
  )
  save('reading-and-understanding-your-epc', d)
}

// 11) reading-your-water-meter bulletList[2] > listItem[1] > paragraph[0]
{
  const d = load('reading-your-water-meter')
  const liPara = d.body.content[2].content[1].content[0]
  replaceParagraphText(
    liPara,
    "Internal: flats, homes on internal risers, and some older homes have the meter inside. Common spots are under the kitchen sink, in the basement, or in a shared meter cupboard."
  )
  save('reading-your-water-meter', d)
}

// 12) scouring-a-raw-fleece troubleshooter[12] > item[1] > cause
{
  const d = load('scouring-a-raw-fleece')
  d.body.content[12].attrs.items[1].cause =
    "Water was too cool to melt the lanolin, or too little detergent was used"
  save('scouring-a-raw-fleece', d)
}

// 13) setting-up-a-piped-water-supply-for-livestock paragraph[6] + sourceNotes
{
  const d = load('setting-up-a-piped-water-supply-for-livestock')
  replaceParagraphText(
    d.body.content[6],
    "UK water regulations require backflow prevention wherever a mains supply ends in a vessel that an animal can dirty. The simplest fix is to end the inlet pipe at least 25 mm above the overflow point of the trough. This air gap means the pipe can never sit under water, no matter what the animals do to the trough."
  )
  // Move the 1999 Regulations citation into sourceNotes (was inline in body).
  d.sourceNotes =
    "Water Supply (Water Fittings) Regulations 1999, requirement for backflow prevention on livestock water supplies. DEFRA, Code of Recommendations for the Welfare of Livestock: Cattle (2003). https://www.gov.uk\nWater Regulations Advisory Scheme (WRAS), backflow prevention guidance. https://www.wras.co.uk"
  save('setting-up-a-piped-water-supply-for-livestock', d)
}

// 14) setting-up-electric-fencing-on-a-smallholding paragraph[2]
{
  const d = load('setting-up-electric-fencing-on-a-smallholding')
  replaceParagraphText(
    d.body.content[2],
    "Pick an energiser rated for at least twice the fence length you are running. Maker ratings assume an ideal fence with no plant contact. Stored energy is the useful number to compare, not output voltage. A mains energiser gives steady output and needs no upkeep. A battery energiser gives you flexibility but needs regular charge checks."
  )
  save('setting-up-electric-fencing-on-a-smallholding', d)
}

// 15) shook-swarm-method-for-bees paragraph[0]
{
  const d = load('shook-swarm-method-for-bees')
  replaceParagraphText(
    d.body.content[0],
    "The shook swarm is the standard UK fix for European foulbrood and for breaking a heavy Varroa cycle. It moves all the adult bees onto clean foundation and destroys all old comb. That breaks the disease cycle. It also cuts the mite count, because Varroa breeds in the sealed brood that is now gone. Do it in spring, once the colony is large enough to draw fresh comb quickly. Usually that is when the trees are coming into blossom."
  )
  save('shook-swarm-method-for-bees', d)
}

console.log('Applied rewrites to 15 files.')
