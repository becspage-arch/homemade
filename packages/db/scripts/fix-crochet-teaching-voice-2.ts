/**
 * Targeted voice fixes for the 11 crochet teaching rows that still failed the
 * voice gate after the mechanical em-dash pass: 9 grade-level paragraphs
 * rewritten to plain register, 2 stray banned words removed, and one craft
 * caution panel re-toned from "warning" to "tip" (it is a craft note, not
 * safety advice). Snapshots a TutorialVersion before each write.
 *
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/fix-crochet-teaching-voice-2.ts [--apply]
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 8; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

// Exact-string replacements applied to any string leaf (text nodes + attr
// strings such as troubleshooter cause/fix) anywhere in the body.
const REPLACEMENTS: Record<string, Array<[string, string]>> = {
  'how-to-hold-a-crochet-hook': [
    [
      'Once the grip and tension feel comfortable on a slip knot and a row of chains, the first proper stitch to learn is ',
      'Once the grip and the yarn tension feel easy on a slip knot and a row of chains, learn ',
    ],
    [
      ' (UK: treble, US: double crochet). From there the rest of the basic stitch family (double crochet, half treble, double treble) follows from the same hook motions, just with different numbers of yarn-overs.',
      ' next (UK treble, US double crochet). The rest of the basic family follows the same hand motions. Double crochet, half treble, and double treble just use a different number of yarn-overs.',
    ],
  ],
  'crochet-rows-and-rounds': [[
    'Circles and ovals: basket bases, amigurumi bodies, flat medallion motifs.',
    'Circles and ovals: basket bases, soft-toy bodies, and flat round motifs.',
  ]],
  'crochet-uk-us-terminology-guide': [
    [
      'British publications (Pauline Turner. Stylecraft pattern leaflets, most UK magazines, anything from the British Library archive) write UK convention by default.',
      'British publications write UK terms by default. Most UK magazines and pattern leaflets do too.',
    ],
    [
      "American publications (Annie's, Leisure Arts, most US magazines, US Ravelry self-published patterns) write US convention by default.",
      'American publications write US terms by default. So do most US magazines and self-published patterns.',
    ],
    [
      'International publications usually use UK convention in the written instructions and the international symbol set in the charts.',
      'International patterns are mixed. Many use UK terms in the rows, with the shared symbols in the charts.',
    ],
  ],
  'crochet-surface-slip-stitch-technique': [[
    'Inserting into different row positions rather than consistently along one row or column',
    'Working into uneven spots instead of along one steady row or column',
  ]],
  'crochet-dropped-stitch-fix': [[
    'After recovery, use the hook tip to redistribute the excess yarn into the surrounding stitches, nudge the strand sideways into the neighbouring stitches until the tension matches.',
    'Once the stitch is back, use the hook tip to spread the spare yarn into the stitches around it. Nudge the loose strand sideways until the tension looks even.',
  ]],
  'crochet-joining-squares-method': [[
    'A 4-square sampler assembled by both methods shows the difference immediately. Try both: join-as-you-go directly into the last round of the square produces the flattest corner junctions of all the joining methods and is worth learning for any project where the joins need to be nearly invisible.',
    'A small four-square sampler, joined both ways, shows the difference at once. Try both. Join-as-you-go works into the last round of each square. It gives the flattest corners, and the joins barely show.',
  ]],
  'crochet-tunisian-extended-stitch': [[
    'Tunisian honeycomb applies a chequerboard of TKS and TPS to create a grid-texture fabric that combines two Tunisian stitch types in one piece. Broomstick lace is an entirely different large-loop technique that produces an open lace effect similar in drape to TES.',
    'Tunisian honeycomb mixes two stitches, TKS and TPS, in a chequerboard for a grid texture. Broomstick lace is a different, large-loop method. It makes an open lace with a drape close to TES.',
  ]],
  'crochet-tension-troubleshooting': [[
    'Watching every stitch carefully, close attention often produces tight tension.',
    'Watching every stitch too closely. Tense focus often pulls the tension tight.',
  ]],
  'crochet-blocking-acrylic-and-synthetics': [[
    'Acrylic and synthetic yarns are essentially plastic fibres. Cold water passes through them without softening the structure, so wet blocking and spray blocking produce little change. To permanently relax and open acrylic fabric you need ',
    'Acrylic and synthetic yarns are plastic fibres. Cold water passes through them without softening the structure, so wet blocking and spray blocking produce little change. To permanently relax and open acrylic fabric you need ',
  ]],
  'crochet-tapestry-technique': [[
    'Release the tension on the carried strand before each stitch and let the working yarn fall naturally.',
    'Release the tension on the carried strand before each stitch and let the working yarn drop naturally.',
  ]],
  'crochet-whipstitch-join-tutorial': [[
    'Block both pieces before joining. Match stitch-for-stitch along the join; if the counts genuinely differ by one or two, distribute the difference evenly along the seam rather than concentrating it at the end.',
    'Block both pieces before joining. Match stitch for stitch along the join. If the counts differ by one or two, spread the difference evenly along the seam instead of bunching it at the end.',
  ]],
}

interface Node { type?: string; text?: string; content?: Node[]; attrs?: Record<string, unknown> }

function deepReplaceStrings(value: unknown, pairs: Array<[string, string]>): { value: unknown; changed: boolean } {
  let changed = false
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') {
      for (const [find, rep] of pairs) {
        if (v === find) { changed = true; return rep }
      }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = walk(val)
      return out
    }
    return v
  }
  return { value: walk(value), changed }
}

// Re-tone the acrylic caution infoPanel from warning -> tip (craft note, not
// safety advice).
function retoneAcrylicPanel(body: Node): { body: Node; changed: boolean } {
  let changed = false
  const walk = (n: Node): Node => {
    let node = n
    if (node.type === 'infoPanel' && node.attrs && node.attrs.tone === 'warning' &&
        typeof node.attrs.title === 'string' && /test a swatch first/i.test(node.attrs.title)) {
      node = { ...node, attrs: { ...node.attrs, tone: 'tip' } }
      changed = true
    }
    if (Array.isArray(node.content)) node = { ...node, content: node.content.map(walk) }
    return node
  }
  return { body: walk(body), changed }
}

// Replace the first paragraph of choosing-yarn-fibre (multi-node bold text,
// missing spaces, grade 13) with a single plain paragraph.
function fixYarnFibreIntro(body: Node): { body: Node; changed: boolean } {
  if (!Array.isArray(body.content)) return { body, changed: false }
  const idx = body.content.findIndex((n) => n.type === 'paragraph')
  if (idx < 0) return { body, changed: false }
  const newContent = body.content.map((n, i) =>
    i === idx
      ? { type: 'paragraph', content: [{ type: 'text', text: 'Yarn fibres split into three groups. Protein fibres come from animals, like wool and silk. Plant fibres include cotton and linen. Synthetics include acrylic and nylon. Each group behaves its own way on the hook, in blocking, and in wear.' }] }
      : n,
  )
  return { body: { ...body, content: newContent }, changed: true }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const { prisma, Prisma } = await import('../src/index.js')
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })

  const slugs = [...new Set([...Object.keys(REPLACEMENTS), 'crochet-blocking-acrylic-and-synthetics', 'crochet-choosing-yarn-fibre'])]

  for (const slug of slugs) {
    const r = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, title: true, subtitle: true, excerpt: true, body: true, status: true },
    })
    if (!r) { console.log(`SKIP ${slug}: not found`); continue }
    let body = r.body as Node
    let changed = false

    const pairs = REPLACEMENTS[slug]
    if (pairs) {
      const res = deepReplaceStrings(body, pairs)
      body = res.value as Node
      changed = changed || res.changed
      // Report any find that did not match (guards against drift).
      for (const [find] of pairs) {
        const stillThere = JSON.stringify(r.body).includes(find)
        if (!stillThere) console.log(`  ! ${slug}: find string not present (already changed?)`)
      }
    }
    if (slug === 'crochet-blocking-acrylic-and-synthetics') {
      const res = retoneAcrylicPanel(body); body = res.body; changed = changed || res.changed
    }
    if (slug === 'crochet-choosing-yarn-fibre') {
      const res = fixYarnFibreIntro(body); body = res.body; changed = changed || res.changed
    }

    if (!changed) { console.log(`no change ${slug}`); continue }
    console.log(`${apply ? 'FIX' : 'WOULD FIX'} ${slug}`)
    if (apply) {
      if (author) {
        await prisma.tutorialVersion.create({
          data: { tutorialId: r.id, title: r.title, subtitle: r.subtitle, excerpt: r.excerpt, body: r.body as Prisma.InputJsonValue, status: r.status, authorId: author.id, changeNote: 'Voice pass: grade-level + banned-word + panel-tone fixes' },
        })
      }
      await prisma.tutorial.update({ where: { id: r.id }, data: { body: body as Prisma.InputJsonValue } })
    }
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
