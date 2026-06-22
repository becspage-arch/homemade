/**
 * Fix remaining batch-2 issues:
 * 1. Em-dashes in troubleshooter attrs
 * 2. Grade-level paragraph rewrites
 * 3. Glossary-coverage misses
 */

import fs from 'fs'
import path from 'path'

const DIR = path.join(__dirname, 'docs', 'cooking-sprint-worker-0', 'batch2')

type Mark = { type: string; attrs?: Record<string, unknown> }
type DocNode = { type: string; text?: string; marks?: Mark[]; attrs?: Record<string, unknown>; content?: DocNode[] }

function fixStr(s: string): string {
  return s.replace(/[—–]/g, '.').replace(/\.\./g, '.').trim()
}

function walkAndFixDashes(node: DocNode): DocNode {
  if (node.type === 'troubleshooter' && node.attrs?.items) {
    const items = (node.attrs.items as Array<{symptom: string, cause: string, fix: string}>).map(item => ({
      symptom: fixStr(item.symptom),
      cause: fixStr(item.cause),
      fix: fixStr(item.fix),
    }))
    return { ...node, attrs: { ...node.attrs, items } }
  }
  if (node.type === 'text' && node.text) {
    return { ...node, text: fixStr(node.text) }
  }
  if (node.content) {
    return { ...node, content: node.content.map(walkAndFixDashes) }
  }
  return node
}

function wrapFirst(nodes: DocNode[], searchText: string, termSlug: string): DocNode[] {
  const found = { done: false }
  function walk(ns: DocNode[]): DocNode[] {
    if (found.done) return ns
    const out: DocNode[] = []
    for (const n of ns) {
      if (found.done) { out.push(n); continue }
      if (n.type === 'text' && n.text && !n.marks?.some(m => m.type === 'glossaryTooltip')) {
        const idx = n.text.toLowerCase().indexOf(searchText.toLowerCase())
        if (idx !== -1) {
          found.done = true
          const before = n.text.slice(0, idx)
          const matched = n.text.slice(idx, idx + searchText.length)
          const after = n.text.slice(idx + searchText.length)
          if (before) out.push({ ...n, text: before })
          out.push({ ...n, text: matched, marks: [...(n.marks ?? []), { type: 'glossaryTooltip', attrs: { termSlug } }] })
          if (after) out.push({ ...n, text: after })
          continue
        }
      }
      if (n.content) { out.push({ ...n, content: walk(n.content) }); continue }
      out.push(n)
    }
    return out
  }
  return walk(nodes)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(name: string): { data: any; filepath: string } {
  const filepath = path.join(DIR, name)
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  return { data, filepath }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function save(filepath: string, data: any): void {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Saved: ${path.basename(filepath)}`)
}

function para(text: string): DocNode {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

// === 1. Fix em-dashes in troubleshooter across ALL files ===
{
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
  for (const file of files) {
    const filepath = path.join(DIR, file)
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
    data.body = walkAndFixDashes(data.body as DocNode)
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  }
  console.log('Fixed troubleshooter em-dashes.')
}

// === 2. Grade-level rewrites ===

// 04-char-siu: orderedList first step is grade 14.4 — rewrite step 1
{
  const { data, filepath } = load('04-char-siu.json')
  const body = data.body as DocNode
  const olIdx = body.content!.findIndex(n => n.type === 'orderedList')
  if (olIdx >= 0) {
    const ol = body.content![olIdx]
    if (ol.content && ol.content[0] && ol.content[0].content) {
      ol.content[0].content[0] = para('Mix the hoisin sauce, honey, soy sauce, Shaoxing wine, five-spice powder, and red fermented tofu together in a bowl. Add the pork and turn to coat. Cover and refrigerate for at least 4 hours or overnight.')
    }
  }
  save(filepath, data)
}

// 07-dan-dan-noodles: paragraph[8]
{
  const { data, filepath } = load('07-dan-dan-noodles.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Dan dan noodles come from the street food stalls of Chengdu. Vendors carried the noodles and sauce in two baskets hung from a shoulder pole (dan). The dish is now eaten at home across China. Outside Sichuan it is usually milder, with less numbing heat and less vinegar.')
  }
  save(filepath, data)
}

// 09-sweet-and-sour-pork: paragraph[8] + glossary velveting wrap
{
  const { data, filepath } = load('09-sweet-and-sour-pork.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Sweet and sour pork is a Cantonese dish that spread globally through Hong Kong restaurants. The bright red colour and sharp-sweet sauce made it recognisable abroad. The pork must stay crisp. If it sits in sauce it softens quickly, so dress the dish just before serving.')
  }
  data.body = { ...body, content: wrapFirst(body.content!, 'velvet', 'velveting') }
  save(filepath, data)
}

// 10-beef-and-broccoli-stir-fry: paragraph[8]
{
  const { data, filepath } = load('10-beef-and-broccoli-stir-fry.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Beef and broccoli is made at home across China and in Chinese-American restaurants, where the sauce is often sweeter. The key is the beef. Velveted sirloin or rump stays tender at high heat. Cheaper cuts toughen quickly in a wok. Do not overcook the broccoli; it should still have bite.')
  }
  save(filepath, data)
}

// 13-lion-head-meatballs: paragraph[8] + wrap shaoxing-wine
{
  const { data, filepath } = load('13-lion-head-meatballs.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Lion head meatballs are a classic dish of Jiangsu province, one of the Eight Great Cuisines of China. The braised version is a winter dish. A steamed summer version also exists. The large meatball surrounded by cabbage leaves is said to look like a lion with its mane, which gives the dish its name.')
  }
  data.body = { ...body, content: wrapFirst(body.content!, 'Shaoxing wine', 'shaoxing-wine') }
  save(filepath, data)
}

// 17-yu-xiang-aubergine: remove cornflour from glossaryTerms (unused and unnecessary)
{
  const { data, filepath } = load('17-yu-xiang-aubergine.json')
  data.glossaryTerms = (data.glossaryTerms as Array<{slug: string}>).filter((t) => t.slug !== 'cornflour')
  save(filepath, data)
}

// 20-stir-fried-water-spinach: paragraph[8]
{
  const { data, filepath } = load('20-stir-fried-water-spinach.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Stir-fried water spinach is found across southern China and Southeast Asia. It is fast to cook and appears at hawker stalls and family tables. The hollow stems stay crunchy; the leaves wilt quickly. Do not cover the wok or the colour dulls. Serve immediately.')
  }
  save(filepath, data)
}

// 23-pork-and-cabbage-jiaozi: paragraph[8]
{
  const { data, filepath } = load('23-pork-and-cabbage-jiaozi.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Jiaozi are eaten across northern China, above all at Chinese New Year and the winter solstice. Families fold dumplings together at the table. The same filling can be boiled, steamed, or pan-fried. Pan-fried jiaozi are called guotie or potstickers. The pleat shape varies by region and by habit. Imperfect crimping still tastes the same.')
  }
  save(filepath, data)
}

// 26-spring-rolls: paragraph[8]
{
  const { data, filepath } = load('26-spring-rolls.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Fried spring rolls are eaten at Chinese New Year in eastern China to mark the start of spring. Fillings vary by region across China and Southeast Asia. The key is draining the filling well before rolling. Excess moisture makes the wrapper soggy and risks splitting during frying.')
  }
  save(filepath, data)
}

// 32-char-siu-bao-steamed: paragraph[8]
{
  const { data, filepath } = load('32-char-siu-bao-steamed.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Steamed char siu bao is a staple of Cantonese dim sum. The steamed version is softer and paler than the baked one, which has a glossy, golden crust. Bamboo steamers give the best result. A metal steamer works but condensation can drip onto the buns and wet the surface.')
  }
  save(filepath, data)
}

// 33-chinese-braised-mushrooms: paragraph[8]
{
  const { data, filepath } = load('33-chinese-braised-mushrooms.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Braised shiitake mushrooms are a vegetarian staple in Chinese Buddhist cooking. They appear at New Year banquets as a symbol of longevity. The soaking liquid is full of flavour; use it in the braising sauce. Do not throw it away.')
  }
  save(filepath, data)
}

// 35-chinese-lamb-with-cumin: paragraph[0] and paragraph[8]
{
  const { data, filepath } = load('35-chinese-lamb-with-cumin.json')
  const body = data.body as DocNode
  if (body.content && body.content[0]) {
    body.content[0] = para('Xinjiang cumin lamb is ready in 20 minutes and serves four. The lamb is sliced thin, velveted, and stir-fried at high heat with whole cumin seeds, dried chillies, and garlic. The cumin goes in twice: early to bloom in oil, and again at the end for raw fragrance.')
  }
  if (body.content && body.content[8]) {
    body.content[8] = para('This dish comes from Xinjiang in northwest China, a region with Central Asian and Muslim culinary traditions. Lamb and cumin are central to Uyghur cooking. The stir-fried version is popular at Xinjiang restaurants across China. It goes well with flatbread or rice.')
  }
  save(filepath, data)
}

// 36-hong-kong-milk-tea: paragraph[8]
{
  const { data, filepath } = load('36-hong-kong-milk-tea.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Hong Kong milk tea developed in cha chaan teng tea restaurants from the 1940s onwards. It blends British colonial tea habits with local taste. The silk stocking strainer gives the tea its Cantonese name. It is a drink specific to Hong Kong, different from British tea and from Taiwanese bubble tea.')
  }
  save(filepath, data)
}

// 37-mapo-tofu-vegetarian: paragraph[8]
{
  const { data, filepath } = load('37-mapo-tofu-vegetarian.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Vegetarian mapo tofu is common in Chinese Buddhist cooking, where pork is replaced with mushrooms. The Sichuan flavour profile stays the same. This version is lighter than the meat original. Use vegetable stock and plant-based oyster sauce to make it fully vegan.')
  }
  save(filepath, data)
}

// 38-red-oil-wontons: paragraph[8]
{
  const { data, filepath } = load('38-red-oil-wontons.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Red oil wontons are a Sichuan snack and starter. They are sold at street stalls and served at dim sum. The sauce is the point: a balance of chilli oil heat, sesame depth, vinegar brightness, and soy salinity. Make extra sauce and keep it in the fridge for up to a week.')
  }
  save(filepath, data)
}

// 39-chinese-peanut-sauce-noodles: paragraph[8]
{
  const { data, filepath } = load('39-chinese-peanut-sauce-noodles.json')
  const body = data.body as DocNode
  if (body.content && body.content[8]) {
    body.content[8] = para('Cold peanut noodles are a summer dish eaten across China. Cook the noodles ahead and keep them chilled. The sauce can be made a few days in advance and kept in the fridge. Thin it with water if it thickens. Add shredded chicken, cucumber, or blanched green beans on top.')
  }
  save(filepath, data)
}

console.log('All done.')
