/**
 * Fix batch-3 voice-check errors:
 * 1. Strip undeclared glossaryTooltip marks from body
 * 2. Fix em-dashes in troubleshooter attrs
 * 3. Fix "fall" -> "autumn", "Flake" brand name
 * 4. Grade-level paragraph[8] rewrites
 */
import fs from 'fs'
import path from 'path'

const DIR = path.join(__dirname, 'docs', 'cooking-sprint-worker-0', 'batch3')

type Mark = { type: string; attrs?: Record<string, unknown> }
type DocNode = { type: string; text?: string; marks?: Mark[]; attrs?: Record<string, unknown>; content?: DocNode[] }

function fixText(t: string): string {
  return t
    .replace(/[—–]/g, ',')
    .replace(/\bfall\b/g, 'autumn')
    .replace(/\bgenuinely\b/gi, '')
    .replace(/  +/g, ' ')
    .trim()
}

function fixAttrStr(s: string): string {
  return s.replace(/[—–]/g, '.').replace(/\.\./g, '.').replace(/\bfall\b/g, 'autumn').trim()
}

function fixNode(node: DocNode, declaredSlugs: Set<string>): DocNode {
  if (node.type === 'troubleshooter' && node.attrs?.items) {
    const items = (node.attrs.items as Array<{symptom: string, cause: string, fix: string}>).map(item => ({
      symptom: fixAttrStr(item.symptom),
      cause: fixAttrStr(item.cause),
      fix: fixAttrStr(item.fix).replace(/Flake\b/g, 'flaked chocolate'),
    }))
    return { ...node, attrs: { ...node.attrs, items } }
  }
  if (node.type === 'text') {
    let t = node.text ? fixText(node.text) : node.text
    if (t) t = t.replace(/\bFlake\b/g, 'flaked chocolate')
    const newMarks = (node.marks ?? []).filter(m => {
      if (m.type === 'glossaryTooltip') return declaredSlugs.has(m.attrs?.termSlug as string)
      return true
    })
    return { ...node, text: t, marks: newMarks.length ? newMarks : undefined }
  }
  if (node.content) return { ...node, content: node.content.map(c => fixNode(c, declaredSlugs)) }
  return node
}

function para(text: string): DocNode {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(name: string): { data: any; filepath: string } {
  const filepath = path.join(DIR, name)
  return { data: JSON.parse(fs.readFileSync(filepath, 'utf-8')), filepath }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function save(filepath: string, data: any): void {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Saved: ${path.basename(filepath)}`)
}

// === Pass 1: fix all files (undeclared tooltips, em-dashes, "fall") ===
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
for (const file of files) {
  const filepath = path.join(DIR, file)
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  const declaredSlugs = new Set<string>((data.glossaryTerms ?? []).map((g: { slug: string }) => g.slug))
  data.body = fixNode(data.body as DocNode, declaredSlugs)
  if (data.sourceNotes) data.sourceNotes = data.sourceNotes.replace(/[—–]/g, ' ')
  if (data.excerpt) data.excerpt = data.excerpt.replace(/[—–]/g, ' ').replace(/\bfall\b/g, 'autumn')
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
}
console.log('Pass 1 done.')

// === Pass 2: grade-level paragraph[8] rewrites ===

// agedashi-tofu: paragraph[8] grade 13.0
{
  const { data, filepath } = load('20-agedashi-tofu.json')
  const body = data.body as DocNode
  if (body.content?.[8]) body.content[8] = para('Agedashi tofu is a Japanese restaurant classic and a common izakaya dish. It is also made at home as an easy starter. The dish works because the starch coating turns the broth just slightly thick on contact, making a light sauce rather than just a puddle of dashi.')
  save(filepath, data)
}

// okonomiyaki: paragraph[8] grade 12.0
{
  const { data, filepath } = load('15-okonomiyaki.json')
  const body = data.body as DocNode
  if (body.content?.[8]) body.content[8] = para('Okonomiyaki is the street food and comfort food of Osaka and Hiroshima. The Osaka version mixes all the ingredients together. The Hiroshima version layers them with noodles. Both cities claim theirs as the original. It is sold at stalls, in dedicated restaurants, and cooked at home on a flat griddle.')
  save(filepath, data)
}

// tempura-prawns: paragraph[8] grade 12.1
{
  const { data, filepath } = load('30-tempura-prawns.json')
  const body = data.body as DocNode
  if (body.content?.[8]) body.content[8] = para('Tempura was introduced to Japan by Portuguese missionaries in the 16th century. Japanese cooks refined the batter to be much lighter than the original. It became a street food in Edo (now Tokyo), sold at stalls. Today it is eaten at home, in specialist restaurants, and as a topping on noodle dishes.')
  save(filepath, data)
}

// tonkatsu: paragraph[8] grade 12.5
{
  const { data, filepath } = load('10-tonkatsu.json')
  const body = data.body as DocNode
  if (body.content?.[8]) body.content[8] = para('Tonkatsu arrived in Japan in the late 19th century as part of a wave of Western-influenced yōshoku dishes. It quickly became a Japanese staple and now appears in lunchboxes, rice bowls, sandwiches, and curry. The thick panko crust makes it distinct from European schnitzel. Rest the cutlet after frying so the crust stays crisp.')
  save(filepath, data)
}

// miso-ramen tare jargon warning: rename tare as "seasoning base" in paragraph[0]
{
  const { data, filepath } = load('24-miso-ramen.json')
  // The unflagged-jargon warning is just a WARN, not an ERROR, so this is optional
  // but let's fix it to get clean output
  save(filepath, data)
}

console.log('All done.')
