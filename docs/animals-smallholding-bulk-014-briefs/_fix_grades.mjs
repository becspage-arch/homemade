import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function load(fname) {
  return JSON.parse(readFileSync(join(__dirname, fname), 'utf-8'))
}

function save(fname, data) {
  writeFileSync(join(__dirname, fname), JSON.stringify(data, null, 2), 'utf-8')
  console.log(`Saved: ${fname}`)
}

function replaceTextInNode(node, oldText, newNodes) {
  if (!node) return node
  if (node.type === 'text' && node.text === oldText) {
    return newNodes.length === 1 ? { ...node, text: newNodes[0].text } : null
  }
  if (node.content) {
    node.content = node.content.map(n => replaceTextInNode(n, oldText, newNodes)).filter(Boolean)
  }
  return node
}

function setNodeAtPath(data, pathStr, newNode) {
  const parts = pathStr.split('.')
  let parent = data
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (part.includes('[')) {
      const [key, idxStr] = part.split('[')
      parent = parent[key][parseInt(idxStr)]
    } else {
      parent = parent[part]
    }
  }
  const last = parts[parts.length - 1]
  if (last.includes('[')) {
    const [key, idxStr] = last.split('[')
    parent[key][parseInt(idxStr)] = newNode
  } else {
    parent[last] = newNode
  }
}

// --- Fix 03: paragraph[14] ---
{
  const d = load('03-moving-bees-under-three-miles.json')
  d.body.content[14] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Put something unfamiliar in front of the entrance for the first twenty-four hours after arrival. A leafy branch propped against the hive works well, or a piece of sacking hung over the front. When bees look closely at their entrance on the way out, they take a fresh orientation flight rather than flying back to the old position.' }]
  }
  save('03-moving-bees-under-three-miles.json', d)
}

// --- Fix 04: paragraph[1] ---
{
  const d = load('04-queen-cage-introduction-method.json')
  d.body.content[1] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'The cage method works when introducing a bought mated queen, a queen from another colony, or a newly mated queen into a colony that already knows a different queen\'s scent. Colonies that have been queenless for less than twenty-four hours can sometimes accept a new queen directly. The cage is the safer route in any case.' }
    ]
  }
  save('04-queen-cage-introduction-method.json', d)
}

// --- Fix 10: bulletList[7].content[2].content[0] ---
{
  const d = load('10-egg-production-records-and-laying-tallies.json')
  d.body.content[7].content[2].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Steady low production through spring and summer: check the calcium supply (an oyster shell grit feeder must always be full), rule out a heavy worm burden, and check the quality of the layer feed.' }]
  }
  save('10-egg-production-records-and-laying-tallies.json', d)
}

// --- Fix 11: bulletList[2].content[5].content[0] ---
{
  const d = load('11-chicken-first-aid-kit-and-use.json')
  d.body.content[2].content[5].content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'A broody coop or ventilated cardboard box to use as a short-term ' },
      { type: 'text', text: 'isolation pen', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'isolation-pen' } }] },
      { type: 'text', text: '.' }
    ]
  }
  save('11-chicken-first-aid-kit-and-use.json', d)
}

// --- Fix 12: paragraph[2] ---
{
  const d = load('12-cold-hardy-breeds-for-a-uk-winter.json')
  d.body.content[2] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'The following breeds were developed in northern Europe and cope well with British autumn and winter.' }]
  }
  save('12-cold-hardy-breeds-for-a-uk-winter.json', d)
}

// --- Fix 16: paragraph[9] ---
{
  const d = load('16-goat-bloat-recognition-and-first-response.json')
  d.body.content[9] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Most frothy bloat cases happen when goats reach lush pasture on an empty stomach. Legume-rich pasture (clover, sainfoin, lucerne) is highest risk, especially in the early morning when the plants are wet with dew. Give hay before turning out. Limit access to legume-heavy pasture in the first few hours after dawn. Avoid sudden pasture changes.' }]
  }
  save('16-goat-bloat-recognition-and-first-response.json', d)
}

// --- Fix 17: paragraph[3] ---
{
  const d = load('17-goat-kid-weaning-and-growth-checks.json')
  d.body.content[3] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'A kid weaned before these thresholds will lose weight. It will also show digestive upset for several days. The rumen is not yet developed enough to replace the nutrition that milk provided.' }]
  }
  save('17-goat-kid-weaning-and-growth-checks.json', d)
}

// --- Fix 20: paragraph[12] ---
{
  const d = load('20-sheep-transport-and-loading-for-the-small-flock.json')
  d.body.content[12] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Record the movement in your holding register within the required time, typically within 36 hours of arrival. Scotland and Wales have different movement-recording rules from England. Check local rules before moving animals across a national border.' }]
  }
  save('20-sheep-transport-and-loading-for-the-small-flock.json', d)
}

// --- Fix 21: glossary-coverage — wrap "replacement ewe" in a glossaryTooltip ---
{
  const d = load('21-ewe-selection-for-replacement-breeding.json')
  // Find the paragraph with "replacement ewe" and wrap it
  // Add glossaryTooltip to the first text in paragraph[0]
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'A ' },
      {
        type: 'text',
        text: 'replacement ewe',
        marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'replacement-ewe' } }]
      },
      { type: 'text', text: ' retained from within the flock reduces biosecurity risk and builds a closed flock that works on your land, in your conditions. Buying in replacements carries disease risk.' }
    ]
  }
  save('21-ewe-selection-for-replacement-breeding.json', d)
}

// --- Fix 23: paragraph[4] ---
{
  const d = load('23-managing-rabbit-aggression-in-a-colony.json')
  d.body.content[4] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Separate the rabbits right away if any of these happen: a rabbit has a bleeding wound; bites are aimed at the face or genitals; a rabbit is cornered with no way out; or one animal is under attack for more than thirty minutes.' }]
  }
  save('23-managing-rabbit-aggression-in-a-colony.json', d)
}

// --- Fix 24: paragraph[11] ---
{
  const d = load('24-rabbit-manure-as-garden-compost.json')
  d.body.content[11] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Four meat rabbits produce around 50 kg of manure a year. That is enough to fertilise a vegetable plot of 20 to 25 square metres.' }]
  }
  save('24-rabbit-manure-as-garden-compost.json', d)
}

// --- Fix 25: paragraph[0] ---
{
  const d = load('25-rabbit-vaccination-schedule-uk.json')
  // The paragraph has glossaryTooltip marks on Myxomatosis and RHD
  // Keep the marks but simplify the last sentence
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: '' },
      { type: 'text', text: 'Myxomatosis', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'myxomatosis' } }] },
      { type: 'text', text: ' and ' },
      { type: 'text', text: 'RHD', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'rhd' } }] },
      { type: 'text', text: ' are both present in wild rabbit populations across most of the UK. An unvaccinated domestic rabbit near a wild population is at continuous risk. Rabbits must be vaccinated by a vet. Owners cannot give these vaccines themselves because the products are prescription-only.' }
    ]
  }
  save('25-rabbit-vaccination-schedule-uk.json', d)
}

// --- Fix 26: paragraph[0] ---
{
  const d = load('26-rabbit-buck-management-and-conditioning.json')
  // Keep glossaryTooltip marks
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'A ' },
      { type: 'text', text: 'breeding buck', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'breeding-buck' } }] },
      { type: 'text', text: ' works best when kept separate from does between matings, in lean but healthy body condition, and used at a steady rate. Overuse and underuse are both problems. An overused buck loses fertility within weeks. A buck left unused for more than twelve weeks may produce poor sperm because the body slows ' },
      { type: 'text', text: 'spermatogenesis', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'spermatogenesis' } }] },
      { type: 'text', text: ' during the rest period.' }
    ]
  }
  save('26-rabbit-buck-management-and-conditioning.json', d)
}

// --- Fix 27: paragraph[0] ---
{
  const d = load('27-deep-cleaning-a-rabbit-colony-pen.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Routine spot-cleaning keeps a pen habitable but does not break the disease cycle. Parasite eggs and gut bacteria build up in bedding and soil that daily cleaning leaves behind. A deep clean, done twice yearly and after any disease outbreak, strips the pen back to bare surfaces and lets it dry out before restocking. ' },
      { type: 'text', text: 'Coccidial oocysts', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'coccidial-oocyst' } }] },
      { type: 'text', text: ' are the hardest to remove; drying and sunlight help more than disinfectant alone.' }
    ]
  }
  save('27-deep-cleaning-a-rabbit-colony-pen.json', d)
}

// --- Fix 28: paragraph[0] ---
{
  const d = load('28-understanding-pig-notifiable-diseases-uk.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'If you suspect a ' },
      { type: 'text', text: 'notifiable disease', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'notifiable-disease' } }] },
      { type: 'text', text: ' in your pigs, call ' },
      { type: 'text', text: 'APHA', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'apha' } }] },
      { type: 'text', text: ' on 03000 200 301 right away. You must call even if the diagnosis is not confirmed. Suspicion alone is enough to trigger the duty. Moving animals, giving treatment, or changing anything on the premises without APHA permission can harm an outbreak investigation.' }
    ]
  }
  save('28-understanding-pig-notifiable-diseases-uk.json', d)
}

// --- Fix 29: paragraph[0] ---
{
  const d = load('29-pig-stress-recognition-and-welfare-checks.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Pigs are intelligent social animals. They show discomfort through behaviour before physical signs appear. Ten minutes of daily watching is enough to spot problems while they are still fixable.' }]
  }
  save('29-pig-stress-recognition-and-welfare-checks.json', d)
}

// --- Fix 30: paragraph[0] ---
{
  const d = load('30-sow-body-condition-scoring.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'The fat cover a sow carries at mating, through pregnancy, and going into farrowing has a direct effect on litter size, piglet birth weight, and first-week survival. The ' },
      { type: 'text', text: 'body condition score', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'sow-bcs' } }] },
      { type: 'text', text: ' takes five minutes. It tells you whether to adjust feed before the next key point in her cycle.' }
    ]
  }
  save('30-sow-body-condition-scoring.json', d)
}

// --- Fix 33: paragraph[5] ---
{
  const d = load('33-recording-pig-weights-through-the-finish.json')
  d.body.content[5] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'A healthy, well-fed growing pig gains 600 to 900 g per day. If the gain falls below 500 g per day and stays there over two recording periods, something is wrong. Check ration quality, health, worm burden, whether pen-mates are competing at the feeder, and whether cold or overcrowding is a factor.' }]
  }
  save('33-recording-pig-weights-through-the-finish.json', d)
}

// --- Fix 34: paragraph[2] ---
{
  const d = load('34-working-with-your-vet-flock-health-planning.json')
  d.body.content[2] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'From November 2022, UK rules require all keepers of food-producing animals to have a written health plan before they can obtain prescription-only ' },
      { type: 'text', text: 'veterinary medicines', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'veterinary-medicines-directive' } }] },
      { type: 'text', text: ', including worming treatments. If you sell meat, milk, or eggs, or are registered with a farm assurance scheme, a health plan is a practical requirement.' }
    ]
  }
  save('34-working-with-your-vet-flock-health-planning.json', d)
}

// --- Fix 35: paragraph[0] ---
{
  const d = load('35-livestock-insurance-basics-for-smallholders.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Livestock insurance is a simple product once you know what it covers and what it doesn\'t. The decision for a small holding comes down to three questions. What is the replacement value of the animals? What vet fees could you face if a high-value animal falls ill? How likely are the insured events in your situation?' }]
  }
  save('35-livestock-insurance-basics-for-smallholders.json', d)
}

// --- Fix 36: paragraph[0] ---
{
  const d = load('36-legal-predator-control-on-a-smallholding.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Protecting livestock from predators is legal. The method matters. UK law sets specific routes for predator control. Anything outside them is a wildlife crime.' }]
  }
  save('36-legal-predator-control-on-a-smallholding.json', d)
}

// --- Fix 37: paragraph[2] ---
{
  const d = load('37-fallen-stock-and-disposal-options-uk.json')
  d.body.content[2] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'An animal that dies must be collected or disposed of by an approved route without delay. In practice that means within forty-eight hours in warm weather, and longer in winter. You may not move a dead animal off your holding to dispose of it yourself, unless you are taking it directly to an approved facility.' }]
  }
  save('37-fallen-stock-and-disposal-options-uk.json', d)
}

// --- Fix 38: paragraph[7] --- remove price mentions
{
  const d = load('38-getting-a-soil-test-for-pasture.json')
  d.body.content[7] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Commercial soil testing laboratories include NRM Laboratories, ADAS, and Yara (UK). Agricultural merchants and agronomists often offer sampling services. A standard panel costs less than a bag of fertiliser; a full interpretation service with written advice costs more.' }]
  }
  save('38-getting-a-soil-test-for-pasture.json', d)
}

// --- Fix 39: paragraph[0] ---
{
  const d = load('39-making-silage-on-a-small-scale.json')
  d.body.content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: '' },
      { type: 'text', text: 'Silage', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'silage' } }] },
      { type: 'text', text: ' stores summer grass for winter without the quality losses that wet hay-making weather causes. If you have one or two paddocks and can use the feed, small-scale silage production is worth considering.' }
    ]
  }
  save('39-making-silage-on-a-small-scale.json', d)
}

// --- Fix 40: paragraph[11] ---
{
  const d = load('40-smallholding-fencing-seasonal-maintenance.json')
  d.body.content[11] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Electric fence maintenance is covered in the ' },
      { type: 'text', text: 'setting up electric fencing', marks: [{ type: 'techniqueLink', attrs: { techniqueSlug: 'setting-up-electric-fencing-on-a-smallholding', label: 'setting up electric fencing' } }] },
      { type: 'text', text: ' and ' },
      { type: 'text', text: 'electric fence troubleshooting', marks: [{ type: 'techniqueLink', attrs: { techniqueSlug: 'electric-fence-troubleshooting', label: 'electric fence troubleshooting' } }] },
      { type: 'text', text: ' tutorials. At each walk, check that the earth stake is fully driven, connections are clean, and any plants touching the wire are cleared.' }
    ]
  }
  save('40-smallholding-fencing-seasonal-maintenance.json', d)
}

console.log('\nAll grade-level and other fixes applied.')
