import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function load(fname) { return JSON.parse(readFileSync(join(__dirname, fname), 'utf-8')) }
function save(fname, data) { writeFileSync(join(__dirname, fname), JSON.stringify(data, null, 2), 'utf-8'); console.log(`Saved: ${fname}`) }

// 10: paragraph[9]
{
  const d = load('10-egg-production-records-and-laying-tallies.json')
  d.body.content[9] = {
    type: 'paragraph',
    content: [{ type: 'text', text: "After a year's records you'll have a clear picture of your flock's cycle. Spring brings a surge, summer holds it, autumn drops it, and winter lowers it further. This tells you when to bring in new birds, whether to run a heat lamp, and whether your flock is producing what the breed should." }]
  }
  save('10-egg-production-records-and-laying-tallies.json', d)
}

// 25: paragraph[3]
{
  const d = load('25-rabbit-vaccination-schedule-uk.json')
  d.body.content[3] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Before Nobivac Plus, two separate vaccines were needed, given at least two weeks apart. Ask your vet which products are current for your area.' }]
  }
  save('25-rabbit-vaccination-schedule-uk.json', d)
}

// 27: orderedList[4].content[4].content[0]
{
  const d = load('27-deep-cleaning-a-rabbit-colony-pen.json')
  d.body.content[4].content[4].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Rinse well. Disinfectant left on surfaces irritates the eyes, nose, and lungs of the rabbits.' }]
  }
  save('27-deep-cleaning-a-rabbit-colony-pen.json', d)
}

// 28: paragraph[4]
{
  const d = load('28-understanding-pig-notifiable-diseases-uk.json')
  d.body.content[4] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Call APHA right away if you see any of these signs. Blisters or sores on the snout, mouth, or feet. High fever and the pig cannot stand. Several animals dying in a short period. Any pig that is circling, falling over, or unable to stand when it was healthy before.' }]
  }
  save('28-understanding-pig-notifiable-diseases-uk.json', d)
}

// 29: paragraph[7]
{
  const d = load('29-pig-stress-recognition-and-welfare-checks.json')
  d.body.content[7] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'A pig that chews the gate bars, shakes its head for no reason, or paces the same route is showing a stereotypy. This is a sign of long-term frustration or boredom. It develops when pigs lack room to root, enough space, or company.' }]
  }
  save('29-pig-stress-recognition-and-welfare-checks.json', d)
}

// 35: bulletList[4].content[2].content[0]
{
  const d = load('35-livestock-insurance-basics-for-smallholders.json')
  d.body.content[4].content[2].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Compulsory slaughter ordered by APHA: this is usually covered by government compensation, not your policy.' }]
  }
  save('35-livestock-insurance-basics-for-smallholders.json', d)
}

// 38: paragraph[9] — remove AHDB institutional name; also update glossaryTooltip to not include AHDB definition
{
  const d = load('38-getting-a-soil-test-for-pasture.json')
  // Update the glossaryTerm definition to not mention AHDB
  const idx = d.glossaryTerms.findIndex(t => t.slug === 'index-system')
  if (idx >= 0) {
    d.glossaryTerms[idx].definition = 'A system for reporting soil nutrient levels from 0 (very deficient) to 4+ (very high). Index 2 is the target for productive pasture.'
  }
  d.body.content[9] = {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Results are shown on a standard ' },
      { type: 'text', text: 'index system', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'index-system' } }] },
      { type: 'text', text: '. For productive pasture, aim for pH 6.0 to 6.5, phosphorus index 2, potassium index 2, and magnesium index 2. A low pH is fixed with ground limestone. Nutrient shortfalls are corrected with specific fertiliser or slurry.' }
    ]
  }
  save('38-getting-a-soil-test-for-pasture.json', d)
}

console.log('\nAll third-pass fixes applied.')
