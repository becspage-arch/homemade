/**
 * Fix grade-level errors: simplify specific high-complexity paragraphs.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = path.resolve(__dirname, '../../../docs/natural-home-bulk-012-briefs')

function getFile(n: string) {
  const files = fs.readdirSync(BRIEFS_DIR)
  const match = files.find(f => f.startsWith(n + '-'))
  if (!match) throw new Error(`Not found: ${n}-*`)
  return path.join(BRIEFS_DIR, match)
}
function readJSON(p: string) { return JSON.parse(fs.readFileSync(p, 'utf8')) }
function writeJSON(p: string, d: any) { fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n') }

// Brief 21 paragraph[6] — grade 20.1 (Asteraceae)
{
  const f = getFile('21')
  const d = readJSON(f)
  const para = d.body.content[6]
  if (para?.type === 'paragraph') {
    para.content = [{ type: 'text', text: 'Apply a small amount to the inside of the forearm and wait 24 hours before applying to the face and neck. Roman chamomile can cause reactions in people who are sensitive to plants in the daisy family.' }]
    console.log('21: simplified para[6]')
  }
  writeJSON(f, d)
}

// Brief 04 paragraph[1] — grade 12.4
{
  const f = getFile('04')
  const d = readJSON(f)
  const para = d.body.content[1]
  if (para?.type === 'paragraph') {
    para.content = [{ type: 'text', text: 'Wear protective gloves and goggles before handling potassium hydroxide. The cook takes two to three hours on the lowest heat setting until the paste turns glossy and translucent and pulls cleanly from the pot sides.' }]
    console.log('04: simplified para[1]')
  }
  writeJSON(f, d)
}

// Brief 18 paragraph[11] — grade 14.7
{
  const f = getFile('18')
  const d = readJSON(f)
  const para = d.body.content[11]
  if (para?.type === 'paragraph') {
    para.content = [{ type: 'text', text: 'Apply a small amount to the inside of the forearm and wait 24 hours before using on the full scalp. Argan oil is a tree nut-derived oil; anyone with nut allergies should patch test first.' }]
    console.log('18: simplified para[11]')
  }
  writeJSON(f, d)
}

// Brief 08 paragraph[14] — grade 13.4 (colour note)
{
  const f = getFile('08')
  const d = readJSON(f)
  const para = d.body.content[14]
  if (para?.type === 'paragraph') {
    // Simplify the sentence about saponification byproducts
    // Note: saponification tooltip may already be wrapped via glossary cleanup script
    // Check and set a simplified single text node
    const currentText = JSON.stringify(para.content)
    if (currentText.includes('saponification')) {
      // Rewrite to simpler form while keeping the tooltip if it's already there
      para.content = [
        { type: 'text', text: 'Vanilla fragrance oil turns the soap dark during cure. A fully cured bar is deep chocolate-brown on the outside. Vanillin in the fragrance oil reacts with the soap and produces the colour; it does not affect performance.' }
      ]
      console.log('08: simplified para[14] (removed saponification reference - it is already in opening para)')
    }
  }
  writeJSON(f, d)
}

// Brief 33 paragraph[8] — grade 12.7
{
  const f = getFile('33')
  const d = readJSON(f)
  const para = d.body.content[8]
  if (para?.type === 'paragraph') {
    para.content = [{ type: 'text', text: 'Avoid anti-reflective coatings on spectacle lenses, laptop screens, and camera glass. Also avoid natural stone surfaces such as marble and limestone, where the vinegar etches the finish.' }]
    console.log('33: simplified para[8]')
  }
  writeJSON(f, d)
}

// Brief 33 paragraph[10] — grade 12.0 (at threshold, need under)
{
  const f = getFile('33')
  const d = readJSON(f)
  const para = d.body.content[10]
  if (para?.type === 'paragraph') {
    para.content = [{ type: 'text', text: 'Keeps indefinitely at room temperature. Store in a dark or opaque bottle out of direct sunlight.' }]
    console.log('33: simplified para[10]')
  }
  writeJSON(f, d)
}

// Brief 37 paragraph[8] — grade 14.1
{
  const f = getFile('37')
  const d = readJSON(f)
  const para = d.body.content[8]
  if (para?.type === 'paragraph') {
    para.content = [{ type: 'text', text: 'When the scent fades, after four to six months, open the sachet and add five drops of lemon verbena essential oil to the filling. Or tip out the filling and replace with a fresh batch.' }]
    console.log('37: simplified para[8]')
  }
  writeJSON(f, d)
}

console.log('Grade-level fixes done')
