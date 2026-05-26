/**
 * Replace paragraph nodes structurally (preserving glossaryTooltip + techniqueLink marks)
 * for batch 2026-05-26-batch16.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-26-batch16')

type Seg = { text: string; marks?: any[] }

function makeParagraph(segments: Seg[]): any {
  return {
    type: 'paragraph',
    content: segments.map((s) => {
      const node: any = { text: s.text, type: 'text' }
      if (s.marks) node.marks = s.marks
      return node
    }),
  }
}

const GT = (termId: string) => [{ type: 'glossaryTooltip', attrs: { termId } }]
const GTwithTerm = (termId: string, term: string) => [{ type: 'glossaryTooltip', attrs: { term, termId } }]
const TL = (slug: string, label: string) => [{ type: 'techniqueLink', attrs: { label, techniqueSlug: slug } }]

type Replacement = { file: string; paragraphIdx: number; newContent: any[] }

const replacements: Replacement[] = [
  {
    file: 'biscotti-chocolate-hazelnut.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'The ' },
      { text: 'twice-baking', marks: GTwithTerm('cmpbaogi80000osv46rbgctyx', 'twice-baking') },
      { text: ' method dries biscotti to a snap. They stay crisp for weeks in a tin and hold up to a dunk in coffee. Roast the hazelnuts before they go in. Raw hazelnuts in biscotti taste flat next to roasted ones.' },
    ]).content,
  },
  {
    file: 'green-wood-vs-seasoned-wood.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'Every wood-craft project starts with a choice: ' },
      { text: 'green wood', marks: GT('cmpa0noeq0000a8v4wmmv7zn8') },
      { text: ' or ' },
      { text: 'seasoned wood', marks: GT('cmpa0m6z60000t8v4p44jvy81') },
      { text: '. The choice sets your tools, the feel of the work, and whether the finished piece will hold its shape. The two terms get used loosely in chat. In practice they describe two quite different materials. The working feel, the sourcing, and the finishing rules all differ.' },
    ]).content,
  },
  {
    file: 'insulating-below-rafters-warm-roof.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'A 100 mm rafter filled with mineral wool gives a U-value of about 0.45 W/m2K. Every rafter is left as a ' },
      { text: 'thermal bridge', marks: GT('cmpba3ao9000e4ov4b7vfde1b') },
      { text: ' from the warm room to the cold roof. The right method is two layers: as much wool as will fit between the rafters, then a second layer of ' },
      { text: 'PIR board', marks: GT('cmpba3b4800114ov45b5w7al5') },
      { text: ' below them. The second layer breaks the rafter bridge. It adds more heat resistance without being limited by rafter depth.' },
    ]).content,
  },
  {
    file: 'insulation-and-ventilation-together.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'An unimproved pre-war UK house leaks about 15 to 20 air changes per hour at a 50 Pa pressure test. Standard draught-proofing (chimney sealing, floor-edge mastic, window draught strips) cuts that to 8 to 12 ACH. Below about 5 ACH, the random leaks no longer let in enough fresh air on their own. Basic draught-proofing rarely gets you that low. It does matter once you add taped ' },
      { text: 'vapour control layers', marks: GT('cmpba3b4y00124ov4yn5ezkiu') },
      { text: ', or fit tightly sealed window frames.' },
    ]).content,
  },
  {
    file: 'insulation-and-ventilation-together.json',
    paragraphIdx: 10,
    newContent: makeParagraph([
      { text: 'Solid-wall houses with breathable build-up (' },
      { text: 'mineral wool', marks: GT('cmpba3b2t000z4ov4vo8fyyxc') },
      { text: ', lime plaster finish, no VCL) rely on vapour-open walls plus controlled ventilation. The two have to work together. If extract fans are weak in this type of house, moisture the wall once dried out slowly now builds up indoors. Check extract fan performance before and after any change to the wall build-up.' },
    ]).content,
  },
  {
    file: 'internal-wall-insulation-dry-lining.json',
    paragraphIdx: 9,
    newContent: makeParagraph([
      { text: 'The ' },
      { text: 'thermal bridge', marks: GT('cmpba3ao9000e4ov4b7vfde1b') },
      { text: ' where the insulated wall meets the floor, ceiling, and party wall is the biggest weak spot. Where you can, return the insulation board 300 mm along the party wall face. Carry it across the ceiling and floor at the wall base too. In practice, party wall returns are often the hardest. The skirting at the party wall is not usually reachable.' },
    ]).content,
  },
  {
    file: 'japanese-stab-binding-asanoha.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'Asanoha toji', marks: GT('cmpdaufb600001wv4zwjl472h') },
      { text: ' builds on the ' },
      { text: 'yotsume four-hole stitch', marks: TL('japanese-stab-binding-yotsume', 'japanese-stab-binding-yotsume') },
      { text: '. A second thread pass laces diagonals between the base holes. The diagonals form a six-pointed star at each hole cluster. The base holes are the same four as yotsume. The hemp-leaf pattern uses six holes per cluster: two at each base position plus extra holes between them. For a clean A5 ' },
      { text: 'stab binding', marks: GT('cmpdaufbx00011wv47sfavfam') },
      { text: ', work two clusters (head and tail), with the diagonal wraps linking them.' },
    ]).content,
  },
  {
    file: 'japanese-tissue-paper-mending.json',
    paragraphIdx: 11,
    newContent: makeParagraph([
      { text: 'The same method strengthens fragile paper before rebinding. Brush a thin tissue ' },
      { text: 'consolidant', marks: GT('cmpesfzw50001g8v4nm70pjmo') },
      { text: ' layer across the spine of a crumbling text block. The tissue holds the paper steady enough for resewing. Heat-set tissue (tissue with a paste that wakes up under a warm iron) is faster. Book-conservation centres use it. The cold-paste method here is the reversible hand version.' },
    ]).content,
  },
  {
    file: 'managing-a-sow-with-litter.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'Most sows farrow without help if the pen is set up well and the sow is in good shape. The vital work starts within an hour of farrowing. Make sure every piglet reaches a teat and takes ' },
      { text: 'colostrum', marks: GT('cmpba2pb0001agkv4oxugiass') },
      { text: ' in the first six hours. That single point matters more than any other for early piglet survival.' },
    ]).content,
  },
  {
    file: 'mishima-inlay-on-air-dry-clay.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'Mishima', marks: GT('cmpez4k080000gwv47zi3yrs1') },
      { text: ' line inlay works well on air-dry clay. Cut the lines when the clay is ' },
      { text: 'leather-hard', marks: GT('cmpb7rmoo00008gv4xfq393tk') },
      { text: '. Fill with coloured ' },
      { text: 'slip', marks: GT('cmpe36xb60001hgv4m4ty9qoe') },
      { text: '. Let it firm. Scrape back to reveal the lines. The name comes from a Korean tradition of white slip set into grey celadon. This tutorial uses the same cut-and-fill idea in acrylic-tinted slip on air-dry clay. Same idea, same look, with adapted materials.' },
    ]).content,
  },
  {
    file: 'tea-tree-spot-treatment.json',
    paragraphIdx: 0,
    newContent: makeParagraph([
      { text: 'Tea tree oil (Melaleuca alternifolia) has a long folk reputation as a spot treatment for blemishes. This recipe dilutes it to a 5% ' },
      { text: 'dilution ratio', marks: GT('cmpevelxi0000q4v48dmv9wvs') },
      { text: ' in jojoba oil. That is right for spot use only. Dab onto the blemish with a clean fingertip or cotton bud. Do not spread it across the whole face.' },
    ]).content,
  },
]

let okCount = 0
let failCount = 0

for (const r of replacements) {
  const path = resolve(batchDir, r.file)
  const raw = readFileSync(path, 'utf8')
  const data = JSON.parse(raw)
  const target = data.body.content[r.paragraphIdx]
  if (!target || target.type !== 'paragraph') {
    console.error(`[FAIL] ${r.file} @${r.paragraphIdx} — not a paragraph (got ${target?.type})`)
    failCount++
    continue
  }
  target.content = r.newContent
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[OK]   ${r.file} @${r.paragraphIdx}`)
  okCount++
}

console.log(`\nDone: ${okCount} ok, ${failCount} failed`)
process.exit(failCount > 0 ? 1 : 0)
