import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

// Helper to find glossary term ID by slug for the embedded marks
async function getGlossaryIds(prisma: any): Promise<Record<string, string>> {
  const wanted = ['samp-letter', 'stranded-cotton', 'loop-start', 'away-knot']
  const rows = await prisma.glossaryTerm.findMany({
    where: { slug: { in: wanted } },
    select: { id: true, slug: true },
  })
  const map: Record<string, string> = {}
  rows.forEach((r: any) => { map[r.slug] = r.id })
  return map
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const t = await prisma.tutorial.findUnique({
    where: { slug: 'cross-stitch-alphabet-sampler-border' },
    select: { id: true, body: true },
  })
  if (!t) { console.error('Tutorial not found'); process.exit(1) }

  const body = t.body as any
  const g = await getGlossaryIds(prisma)

  // Keep the chart, troubleshooter, and category headings.
  // Replace the early prose, drop the InfoPanel, and tighten supplies.

  const existingChart = body.content.find((n: any) => n.type === 'crossStitchChart')
  const existingTroubleshooter = body.content.find((n: any) => n.type === 'troubleshooter')

  // Build the new body
  const newBody = {
    type: 'doc',
    content: [
      // Orientation paragraph
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'A cross-stitch alphabet sampler is the standard first finished piece in counted-thread embroidery. Each letter is made of small X-shaped stitches on a grid-woven cloth called Aida. The chart below shows where each X goes; you count squares from your starting point and work across.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This sampler is a 26-letter alphabet border in three colours, 88 stitches wide and 28 stitches tall — about 16 by 5 cm of stitched area on 14-count Aida. The letter shapes are taken unchanged from the ' },
          { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termId: g['samp-letter'] } }], text: 'samp-letter' },
          { type: 'text', text: ' alphabets in Therese de Dillmont\'s Encyclopedia of Needlework (1886).' },
        ],
      },
      // Beginner pointer paragraph — uses techniqueLink mark (plain text fallback if not yet authored)
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'New to cross-stitch?' },
          { type: 'text', text: ' Read ' },
          { type: 'text', marks: [{ type: 'techniqueLink', attrs: { techniqueSlug: 'how-to-cross-stitch', label: 'How to cross-stitch' } }], text: 'How to cross-stitch' },
          { type: 'text', text: ' first — it covers holding the hoop, working a single X, and starting and ending a thread.' },
        ],
      },

      // What you need
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'What you need' }] },
      {
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '14-count Aida cloth' },
            { type: 'text', text: ', a 30 by 13 cm piece in white or cream.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Stranded cotton in three colours' },
            { type: 'text', text: ', one skein each. The pattern uses DMC 815 (deep red), DMC 522 (sage), DMC 832 (muted gold). Any three contrasting shades work.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Size 24 tapestry needle' },
            { type: 'text', text: ' — blunt-tipped, large eye.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '15 cm embroidery hoop' },
            { type: 'text', text: '.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Embroidery scissors' },
            { type: 'text', text: '.' },
          ] }] },
        ],
      },

      // Chart
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The chart' }] },
      existingChart || { type: 'paragraph', content: [{ type: 'text', text: '(Chart missing from source.)' }] },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Each square on the chart is one stitch. Each symbol tells you which colour. Empty squares stay unworked.' },
        ],
      },

      // Instructions
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Working the chart' }] },
      {
        type: 'orderedList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Find your centre. ' },
            { type: 'text', text: 'Fold the cloth in half lengthwise and again widthwise, and crease the centre lightly. Match this point to the centre of the chart, marked with a small arrow on each edge.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Mount in the hoop. ' },
            { type: 'text', text: 'Stretch the cloth taut — the weave should bounce slightly when you tap it. Loosen the screw, lay the inner ring under, drop the outer ring over, work the cloth flat, then tighten the screw.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Start a thread. ' },
            { type: 'text', text: 'Cut a 50 cm length of ' },
            { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termId: g['stranded-cotton'] } }], text: 'stranded cotton' },
            { type: 'text', text: ', separate two strands, and thread the needle. Use a ' },
            { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termId: g['loop-start'] } }], text: 'loop start' },
            { type: 'text', text: ' — bring the needle up from the back with the loop tail still beneath the cloth, then on the first stitch pass the needle through the loop to anchor it.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Work each X. ' },
            { type: 'text', text: 'From the back, bring the needle up at the bottom-left of a square. Take it down at the top-right of the same square. Bring it up again at the bottom-right and down at the top-left. That\'s one cross-stitch.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Work in rows. ' },
            { type: 'text', text: 'Stitch each row of half-crosses from left to right (the /// legs), then come back right to left completing the X (the \\\\\\ legs). Working in passes keeps the top legs all leaning the same way, which is what gives finished cross-stitch its even look.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'End a thread. ' },
            { type: 'text', text: 'When about 8 cm of thread remains, pass the needle under the last four or five stitches on the back of the cloth and snip close. No knots.' },
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Move to the next colour. ' },
            { type: 'text', text: 'Rest the working needle in a margin of the cloth and start the next colour from a fresh thread. Don\'t carry thread more than three squares behind the work — it shows through pale cloth.' },
          ] }] },
        ],
      },

      // Finishing
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Finishing' }] },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'When all the letters are worked, press the back of the cloth with a warm iron over a folded towel. Mount in a frame or stitch into a small cushion front.' },
        ],
      },

      // Troubleshooter (preserved)
      ...(existingTroubleshooter
        ? [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'If the stitching goes sideways' }] },
            existingTroubleshooter,
          ]
        : []),
    ],
  }

  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body: newBody },
  })
  console.log(`Updated tutorial ${t.id} body. Node count: ${newBody.content.length}`)
  console.log('Preview URL: /admin/tutorials/' + t.id)
}
main().catch((e) => { console.error(e); process.exit(1) })
