import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function load(fname) { return JSON.parse(readFileSync(join(__dirname, fname), 'utf-8')) }
function save(fname, data) { writeFileSync(join(__dirname, fname), JSON.stringify(data, null, 2), 'utf-8'); console.log(`Saved: ${fname}`) }

// 25: paragraph[8]
{
  const d = load('25-rabbit-vaccination-schedule-uk.json')
  d.body.content[8] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'In a large meat rabbit colony, annual vaccination of every animal is a significant cost. Many smallholders vaccinate breeding does and bucks only. Grow-out kits go to slaughter before the next booster is due, so the risk window is short.' }]
  }
  // paragraph[9]
  d.body.content[9] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'This works well for indoor or fly-proofed systems. Outdoor meat rabbits in areas with known outbreaks carry more risk. Talk to your vet about a plan that fits your setup.' }]
  }
  save('25-rabbit-vaccination-schedule-uk.json', d)
}

// 28: paragraph[7]
{
  const d = load('28-understanding-pig-notifiable-diseases-uk.json')
  d.body.content[7] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'A small closed herd has a low risk if basic biosecurity is in place. No kitchen scraps or catering waste. No contact with feral pigs or wild boar. New stock in quarantine for fourteen days before mixing. Visitors disinfect boots. Most notifiable diseases arrive via animals or feed, not through the air.' }]
  }
  save('28-understanding-pig-notifiable-diseases-uk.json', d)
}

// 35: bulletList[4].content[2].content[0] and [3].content[0]
{
  const d = load('35-livestock-insurance-basics-for-smallholders.json')
  d.body.content[4].content[2].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'APHA compulsory slaughter: this is covered by state compensation, not your policy.' }]
  }
  d.body.content[4].content[3].content[0] = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Normal production losses: deaths from difficult births, ordinary illness, or typical output decline are usually excluded.' }]
  }
  save('35-livestock-insurance-basics-for-smallholders.json', d)
}

console.log('\nFourth-pass fixes applied.')
