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

function p(text: string) {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}
function h(level: number, text: string) {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] }
}
function bold(text: string) {
  return { type: 'text', marks: [{ type: 'bold' }], text }
}
function plain(text: string) {
  return { type: 'text', text }
}

async function main() {
  const { prisma } = await import('../src/index.js')

  // Look up glossary IDs for inline tooltips
  const wanted = [
    'chain-stitch',
    'slip-stitch',
    'treble-crochet',
    'magic-ring',
    'yarn-over',
    'working-loop',
    'turning-chain',
  ]
  const gRows = await prisma.glossaryTerm.findMany({
    where: { slug: { in: wanted } },
    select: { id: true, slug: true },
  })
  const g: Record<string, string> = {}
  gRows.forEach((r: any) => (g[r.slug] = r.id))
  const tt = (slug: string, text: string) => {
    if (!g[slug]) return plain(text)
    return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termId: g[slug] } }], text }
  }

  // === MAGIC RING ===
  const magicRing = await prisma.tutorial.findUnique({ where: { slug: 'crochet-magic-ring' }, select: { id: true } })
  if (magicRing) {
    const newTitle = 'Magic ring: the adjustable starting loop'
    const newBody = {
      type: 'doc',
      content: [
        p(`The magic ring (also called an adjustable ring) is the standard way to begin a piece of crochet worked in the round — a granny square, a hexagon, a doily, the crown of a hat. You wrap the yarn into a loop, work your first round of stitches into the loop, then pull the loop closed with the tail. No hole in the centre, no fiddling.`),
        p(`This tutorial walks you through forming the ring, working the first round into it, and closing the centre. Allow ten minutes the first time; once you've done it twice it's faster than a chain-four-join-with-slip-stitch start.`),
        {
          type: 'paragraph',
          content: [
            bold('New to crochet?'),
            plain(' Read '),
            {
              type: 'text',
              marks: [{ type: 'techniqueLink', attrs: { techniqueSlug: 'how-to-hold-a-crochet-hook', label: 'How to hold a crochet hook' } }],
              text: 'How to hold a crochet hook',
            },
            plain(' first — it covers the pencil and knife grips, yarn tension, and pulling a working loop.'),
          ],
        },

        h(2, 'What you need'),
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Worsted-weight yarn'), plain(' (DK or aran). Light colours show the loop formation more clearly when you\'re learning.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('A crochet hook to match'), plain(' — 4 mm or 4.5 mm for DK, 5 mm for aran. Check the yarn label.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Scissors and a yarn needle'), plain(' to weave in the tail at the end.')] }] },
          ],
        },

        h(2, 'Working the ring'),
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [
              bold('Form the loop. '), plain('Hold the yarn tail (about 15 cm long) in your left hand. Lay the working yarn over the tail to make a loop, with the working yarn crossing the tail. Pinch the crossing point between your left thumb and middle finger.'),
            ] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [
              bold('Pull a working loop through. '), plain('Insert the hook under the working yarn from front to back, catch the working yarn with the hook, and pull a loop through. You now have one loop on the hook with the tail-loop sitting underneath.'),
            ] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [
              bold('Lock the ring with a chain. '), plain('Yarn over and pull through the loop on the hook. This single chain locks the ring in place. It does NOT count as a stitch — your first real stitch comes next.'),
            ] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [
              bold('Work the first round into the ring. '), plain('Insert the hook into the centre of the ring (under BOTH the tail-yarn and the working-yarn). Work your starting chains (typically chain three for trebles) and then your first round\'s stitches into the ring centre, not into the chain you made in step 3. A starter granny square round is twelve trebles.'),
            ] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [
              bold('Close the ring. '), plain('When the first round is finished, pull on the yarn tail. The ring tightens and pulls the stitches together. Stop pulling when the centre hole is closed but the stitches still sit flat. Don\'t over-tighten.'),
            ] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [
              bold('Join the round. '), plain('Use a slip stitch into the top of the starting chain (or work onwards in continuous rounds, depending on the pattern). Weave the tail in along the back of the stitches with the yarn needle.'),
            ] }] },
          ],
        },

        h(2, 'How to tell it\'s right'),
        p(`The centre should be a small, closed dot — no visible hole, no loose loop poking out. The stitches should sit evenly around the ring, not bunched on one side. If the centre won\'t close completely, the tail wasn\'t threaded under both yarns in step 4 — undo and try again.`),

        h(2, 'Common mistakes'),
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [plain('Working the first round into the chain made in step 3 instead of into the ring centre. The chain doesn\'t count; ignore it and stitch into the loop.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [plain('Pulling the tail before joining the round. The ring needs all its stitches anchored before you close it; close at the end.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [plain('Over-tightening the ring so the stitches buckle. Pull just until the centre hole closes; stop.')] }] },
          ],
        },

        h(2, 'Where this goes next'),
        p(`The magic ring is the standard start for any in-the-round project. From here: granny squares, hexagons, doilies, amigurumi, the crown of a beanie, the top of a stuffed animal. The full pattern then builds round by round outwards from this first locked circle.`),
      ],
    }
    await prisma.tutorial.update({ where: { id: magicRing.id }, data: { title: newTitle, body: newBody } })
    console.log(`Magic ring updated. id: ${magicRing.id}`)
    console.log(`  preview: /admin/tutorials/${magicRing.id}`)
  }

  // === GRANNY SQUARE ===
  const granny = await prisma.tutorial.findUnique({ where: { slug: 'granny-square-basic-three-round' }, select: { id: true } })
  if (granny) {
    const newTitle = 'Granny square: basic three rounds'
    const newBody = {
      type: 'doc',
      content: [
        p(`A granny square is the foundational motif of crochet. Trebles worked in clusters of three, with chain spaces between them, build outwards from a central ring. Once you can work one square you can join hundreds into a blanket, a cushion cover, a jumper. This tutorial walks the first three rounds — enough to fix the structure of the square in your hands.`),
        p(`The square is worked in three colours so each round is clearly visible. Each finished square is about 10 cm across in DK yarn with a 4 mm hook.`),
        {
          type: 'paragraph',
          content: [
            bold('First time?'),
            plain(' Read '),
            {
              type: 'text',
              marks: [{ type: 'techniqueLink', attrs: { techniqueSlug: 'crochet-magic-ring', label: 'Magic ring' } }],
              text: 'Magic ring',
            },
            plain(' for the starting loop and '),
            {
              type: 'text',
              marks: [{ type: 'techniqueLink', attrs: { techniqueSlug: 'treble-crochet', label: 'How to work a treble' } }],
              text: 'How to work a treble',
            },
            plain(' for the stitch itself.'),
          ],
        },

        h(2, 'What you need'),
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('DK yarn in three colours'), plain(' — about 5 m of each. Stash leftovers are ideal. Light, plain colours show the structure best when learning.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('4 mm crochet hook'), plain('.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Scissors and a yarn needle'), plain(' for weaving in tails.')] }] },
          ],
        },

        h(2, 'Stitches used'),
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Magic ring'), plain(' — the adjustable starting loop.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Chain (ch)'), plain(' — yarn over, pull through the loop on the hook.')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Treble (tr) [UK]'), plain(' — yarn over, insert hook, yarn over and pull through, [yarn over and pull through two loops] twice. US terminology calls this a double crochet (dc).')] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [bold('Slip stitch (sl st)'), plain(' — insert hook, yarn over, pull through both loops.')] }] },
          ],
        },

        h(2, 'Pattern'),
        p(`Round 1 (first colour): Start with a magic ring. Ch 3 (counts as your first treble). Work 2 trebles into the ring. Ch 2. Work [3 trebles into the ring, ch 2] three more times. Slip stitch to the top of the starting ch-3 to close. You should have four 3-treble clusters separated by four ch-2 corner spaces. Pull the tail to close the centre. Fasten off.`),
        p(`Round 2 (second colour): Join the new colour in any ch-2 corner space with a slip stitch. Ch 3 (counts as first tr), 2 tr, ch 2, 3 tr — all into the same corner space. *Ch 1. In the next corner space work (3 tr, ch 2, 3 tr).* Repeat from * to * twice more. Ch 1. Slip stitch to the top of the starting ch-3 to close. Fasten off. Each corner now has two 3-treble clusters with a ch-2 between them; each side has a ch-1 connecting the corners.`),
        p(`Round 3 (third colour): Join in any ch-2 corner space. Ch 3, 2 tr, ch 2, 3 tr in the same corner. Ch 1. 3 tr in the next ch-1 side space. Ch 1. *(3 tr, ch 2, 3 tr) in the next corner. Ch 1. 3 tr in the side space. Ch 1.* Repeat from * to * twice. Slip stitch to close. Fasten off. The square now has three clusters per side and the corner clusters look like an L-shape.`),
        p(`Weave all six tails in along the back of the stitches with the yarn needle.`),

        h(2, 'Finishing'),
        p(`Block the square: dampen lightly with a spray bottle, lay flat on a folded towel, gently pin the corners to a 10 cm square, leave to dry. Blocking sets the trebles even and the corners square.`),

        h(2, 'Where this goes next'),
        p(`Once you've worked a few squares, you can join them: with a slip-stitch seam, a single-crochet seam, or by joining as you go. The classic granny blanket joins many squares into a single piece. Hexagonal granny motifs work the same way with six clusters per round instead of four.`),
      ],
    }
    await prisma.tutorial.update({ where: { id: granny.id }, data: { title: newTitle, body: newBody } })
    console.log(`Granny square updated. id: ${granny.id}`)
    console.log(`  preview: /admin/tutorials/${granny.id}`)
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
