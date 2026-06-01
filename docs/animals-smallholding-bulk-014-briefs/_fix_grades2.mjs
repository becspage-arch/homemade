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

// 04: fix paragraph[1] to re-include pheromone-acceptance glossaryTooltip (lost in previous rewrite)
{
  const d = load('04-queen-cage-introduction-method.json')
  d.body.content[1] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'The cage method works when introducing a bought mated queen, a queen from another colony, or a newly mated queen into a colony that has developed ' },
      { type: 'text', text: 'pheromone acceptance', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'pheromone-acceptance' } }] },
      { type: 'text', text: ' of a different individual. Colonies queenless for less than twenty-four hours can sometimes accept a new queen directly. The cage is the safer route in any case.' }
    ]
  }
  save('04-queen-cage-introduction-method.json', d)
}

// 10: bulletList[7].content[2].content[0]
{
  const d = load('10-egg-production-records-and-laying-tallies.json')
  d.body.content[7].content[2].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Steady low production through spring and summer: check the calcium supply, keep the oyster shell grit feeder always full, and rule out a heavy worm burden. Also check the feed quality.' }]
  }
  save('10-egg-production-records-and-laying-tallies.json', d)
}

// 12: bulletList[3].content[1].content[0] - institutional-in-body "English heritage"
{
  const d = load('12-cold-hardy-breeds-for-a-uk-winter.json')
  d.body.content[3].content[1].content[0] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Dorking. An old English breed, compact and five-toed. A good ' },
      { type: 'text', text: 'dual-purpose breed', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'dual-purpose-breed' } }] },
      { type: 'text', text: ' that handles wet ground better than lighter southern breeds. Single comb, so watch for frostbite in hard frosts.' }
    ]
  }
  save('12-cold-hardy-breeds-for-a-uk-winter.json', d)
}

// 20: paragraph[12]
{
  const d = load('20-sheep-transport-and-loading-for-the-small-flock.json')
  d.body.content[12] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Record the movement in your holding register within 36 hours of arrival. Scotland and Wales have their own rules, which differ from England. Check before moving animals across a national border.' }]
  }
  save('20-sheep-transport-and-loading-for-the-small-flock.json', d)
}

// 23: paragraph[4]
{
  const d = load('23-managing-rabbit-aggression-in-a-colony.json')
  d.body.content[4] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Separate the rabbits straight away in these cases. A rabbit has a bleeding wound. Bites are aimed at the face or genitals. A rabbit is cornered with no escape. One animal has been under attack for more than thirty minutes.' }]
  }
  save('23-managing-rabbit-aggression-in-a-colony.json', d)
}

// 25: paragraph[2]
{
  const d = load('25-rabbit-vaccination-schedule-uk.json')
  d.body.content[2] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'As of 2024, most domestic rabbits in the UK are vaccinated with Nobivac Myxo-RHD Plus. A single annual injection covers myxomatosis, RHD1, and RHD2.' }]
  }
  save('25-rabbit-vaccination-schedule-uk.json', d)
}

// 27: orderedList[4].content[3].content[0]
{
  const d = load('27-deep-cleaning-a-rabbit-colony-pen.json')
  d.body.content[4].content[3].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Apply a disinfectant designed for rabbit housing. Products with quaternary ammonium compounds work against bacteria and many viruses. Follow the dilution and contact time on the label.' }]
  }
  save('27-deep-cleaning-a-rabbit-colony-pen.json', d)
}

// 28: bulletList[2].content[3].content[0]
{
  const d = load('28-understanding-pig-notifiable-diseases-uk.json')
  d.body.content[2].content[3].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Swine Vesicular Disease. Blisters on feet and snout, clinically the same as FMD. Lab testing is needed to tell them apart.' }]
  }
  save('28-understanding-pig-notifiable-diseases-uk.json', d)
}

// 29: paragraph[4]
{
  const d = load('29-pig-stress-recognition-and-welfare-checks.json')
  d.body.content[4] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: '' },
      { type: 'text', text: 'Tail biting', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'tail-biting' } }] },
      { type: 'text', text: ' is a group welfare failure, not a character flaw in one pig. The biting pig is usually a symptom of a wider problem. Common causes: overcrowding, too little feeding space, high temperatures, poor enrichment, or low salt in the diet.' }
    ]
  }
  save('29-pig-stress-recognition-and-welfare-checks.json', d)
}

// 34: paragraph[2]
{
  const d = load('34-working-with-your-vet-flock-health-planning.json')
  d.body.content[2] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'UK rules from November 2022 require all keepers of food-producing animals to have a written health plan. Without one, you cannot get prescription-only ' },
      { type: 'text', text: 'veterinary medicines', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'veterinary-medicines-directive' } }] },
      { type: 'text', text: ', including worming treatments. If you sell meat, milk, or eggs, or belong to a farm assurance scheme, this applies to you.' }
    ]
  }
  save('34-working-with-your-vet-flock-health-planning.json', d)
}

// 35: bulletList[4].content[1].content[0]
{
  const d = load('35-livestock-insurance-basics-for-smallholders.json')
  d.body.content[4].content[1].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Negligence: deaths caused by poor fencing, water failure, or poisonous plants left in the field.' }]
  }
  save('35-livestock-insurance-basics-for-smallholders.json', d)
}

// 36: paragraph[6]
{
  const d = load('36-legal-predator-control-on-a-smallholding.json')
  d.body.content[6] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'General licence terms change. Always read the current version at naturengland.org.uk before taking any action. The 2019 revocation of general licences led to prosecutions. Not knowing the current rules is not a defence.' }]
  }
  save('36-legal-predator-control-on-a-smallholding.json', d)
}

// 37: paragraph[7]
{
  const d = load('37-fallen-stock-and-disposal-options-uk.json')
  d.body.content[7] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Poultry and pet rabbits under 5 kg are exempt from the collection requirement. They may be buried on the holding or incinerated in a suitable incinerator. Deep burial means at least 1 metre below the surface, away from watercourses, and not in a wet area.' }]
  }
  save('37-fallen-stock-and-disposal-options-uk.json', d)
}

// 38: paragraph[7]
{
  const d = load('38-getting-a-soil-test-for-pasture.json')
  d.body.content[7] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Testing labs include NRM Laboratories, ADAS, and Yara (UK). Merchants and agronomists often offer this service too. A standard panel is cheap; a full written report costs more but includes advice.' }]
  }
  save('38-getting-a-soil-test-for-pasture.json', d)
}

console.log('\nAll second-pass fixes applied.')
