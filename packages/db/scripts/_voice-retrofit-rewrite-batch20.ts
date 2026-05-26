/**
 * Apply voice-retrofit rewrites for batch20.
 *
 * Each entry below specifies a slug, a paragraph path (dot-separated indices
 * into the body.content tree), and the replacement plain-text segments. The
 * script walks to the paragraph, preserves any glossaryTooltip text nodes by
 * keeping their text + marks intact, and rewrites the surrounding plain
 * text leaves with the new content.
 *
 * The simplest case: a paragraph with one plain text leaf and no marks. We
 * replace `node.content[0].text` with the new sentence.
 *
 * The mark-preserving case: replace each "plain" text leaf with the matching
 * segment from the rewrite spec, keeping marked leaves untouched (only adjust
 * spacing around them by ensuring leading/trailing spaces in the plain leaves).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-26-batch20')

interface PlainReplace {
  kind: 'plain'
  path: number[] // indices through body.content
  text: string
}

interface MarkPreserveReplace {
  kind: 'mark-preserve'
  path: number[]
  /** Plain text segments interleaved with marks. The script overwrites the
   *  plain-text leaves with these strings in order; marked leaves keep their
   *  text. The number of strings here must equal the count of plain leaves. */
  segments: string[]
}

interface SourceNotesReplace {
  kind: 'sourceNotes'
  text: string
}

interface Job {
  slug: string
  ops: (PlainReplace | MarkPreserveReplace | SourceNotesReplace)[]
}

const JOBS: Job[] = [
  {
    slug: 'bangers-and-mash',
    ops: [
      {
        kind: 'plain',
        path: [10],
        text:
          "Bangers and mash is a classic British pub supper, and one of the fastest weeknight meals you can put on the table. The sausage decides the dish. A good butcher's sausage with a high meat content is a different product from a cheap supermarket pack.",
      },
    ],
  },
  {
    slug: 'brownies-cream-cheese-swirl',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'A fudgy brownie base, rich in butter and dark chocolate, light on flour, dense enough to hold the cream cheese layer without the two mixing into each other. The swirl should look meant. Five or six firm strokes of a skewer through the top give clear contrast. More than that and the pattern muddies.',
      },
    ],
  },
  {
    slug: 'i-am-allowed-in-the-room-where-the-investments-are-decided',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          "A short energy statement for the belief that investment choices belong to someone else. Someone richer, older, more sure, more practised with money. The release names being shut out of the room. The allow gives permission to sit at the table.",
      },
    ],
  },
  {
    slug: 'i-am-allowed-to-receive-what-i-did-not-earn',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'A short energy statement for the belief that money only counts if you worked for it in the usual sense. Gifts, inheritances, windfalls, and settlements all break that rule. The rule makes receiving feel wrong, even when the money is real and yours.',
      },
    ],
  },
  {
    slug: 'making-leaf-mould-from-autumn-leaves',
    ops: [
      {
        kind: 'mark-preserve',
        path: [0],
        // Three text leaves: ['', 'Leaf mould' (marked), 'rest']
        segments: [
          '',
          ' is broken down by fungi, not bacteria. That is why the process is slower and cooler than composting, and why leaves should be kept apart from the main compost heap. The result after 12 months is a part-broken-down material good for mulching. After 24 months it is fine-textured enough to use in a seed-sowing mix.',
        ],
      },
      {
        kind: 'plain',
        path: [7, 3, 0],
        text:
          'Leaves swept from pavements and roads are fine to use. There is no clear evidence that street lighting or vehicle pollution affects the final product in a meaningful way.',
      },
    ],
  },
  {
    slug: 'managing-compost-through-winter',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'A cold compost heap below 5°C is paused, not ruined. The part-broken-down material holds in place and starts up again as soon as temperatures rise in March or April. The winter job is simple: keep adding kitchen waste so the bin keeps taking material, stop the heap from waterlogging, and stretch out active rot as long as you can with the right additions.',
      },
    ],
  },
  {
    slug: 'measuring-household-carbon-footprint',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'Home energy is the part of a household carbon footprint you can read straight off your bills. Take your annual gas use in kWh and multiply by 0.182 to get gas kg CO2e. Take your annual electricity use in kWh and multiply by 0.207 to get electricity kg CO2e. Both factors are the 2024 UK figures. Add the two for total home-energy carbon.',
      },
      {
        kind: 'plain',
        path: [8],
        text:
          'Rank improvements by lifetime saving and by carbon payback. Carbon payback is the upfront carbon of the measure divided by the yearly saving. Insulation and draught-proofing usually pay back in under two years. Heating-system replacements take longer to pay back, but cut a bigger total amount.',
      },
      {
        kind: 'plain',
        path: [10],
        text:
          'The carbon built into what you buy (goods, food, services) is usually bigger than the carbon of running your home for UK households. Both matter. This home-energy figure is the slice you can change directly with technical upgrades.',
      },
      {
        kind: 'sourceNotes',
        text:
          "DESNZ (UK Department for Energy Security and Net Zero), 2024 carbon factors for UK natural gas and grid electricity. Used for the 0.182 kgCO2e/kWh gas factor and the 0.207 kgCO2e/kWh grid-average electricity factor in the calculation steps.",
      },
    ],
  },
  {
    slug: 'off-grid-electrical-basics',
    ops: [
      {
        kind: 'mark-preserve',
        path: [0],
        // Three leaves: ['An off-grid', 'solar PV' (marked), 'system...']
        segments: [
          'An off-grid ',
          ' system runs on its own, with no link to the wider grid. Extra power cannot be sold out, and shortfalls cannot be drawn in. The battery has to cover every gap. That makes sizing the key choice. Too small a battery means power cuts. Too large a battery means money spent and wasted.',
        ],
      },
      {
        kind: 'mark-preserve',
        path: [2, 1, 0],
        // Three leaves: ['Solar panels: ... Rated in', 'kWp' (marked), 'actual...']
        segments: [
          'Solar panels: generate DC electricity during daylight. Rated in ',
          '. Real daily output varies with weather and season.',
        ],
      },
    ],
  },
  {
    slug: 'plain-weave-on-a-cardboard-loom',
    ops: [
      {
        kind: 'plain',
        path: [24],
        text:
          'Plain weave on a cardboard loom is the easiest way into weaving. The same over-under move works on a frame loom, a rigid heddle loom, and a four-shaft floor loom. A frame loom is a wooden frame with notched cross-bars. A rigid heddle has a heddle that lifts alternate warps for you. Four-shaft looms can lift any mix of warps for twill, tabby, overshot, and the rest. The same move also works for tapestry weaving, where the weft builds shapes section by section instead of going all the way across. Once the over-under feel is in the hands, the rest of weaving is variation on the same idea.',
      },
    ],
  },
  {
    slug: 'pull-cut-technique',
    ops: [
      {
        kind: 'plain',
        path: [4],
        text:
          'Use the pull cut when the push cut and the thumb-pivot cut cannot reach the surface. Three common cases. One, inside a curved handle, where a push cut from either end would run against the grain. Two, cleaning up the joint between spoon neck and handle base. Three, taking a thin shaving from a hollow area, where a push-cut blade would sit too flat to bite into the wood.',
      },
    ],
  },
  {
    slug: 'push-cut-technique',
    ops: [
      {
        kind: 'plain',
        path: [2],
        text:
          'The push cut is the default for most shaping work: taking off bulk to rough out a blank, refining a spoon handle along its length, flattening facets on a whittled piece, and making light finishing passes along the grain. Use it whenever the cut can travel away from the body in a straight or gently curved line and end in open air. The push cut does not suit tight hollowing (use a hook knife for that), or very short, precise chips (use a thumb-pivot or stop cut for those).',
      },
    ],
  },
  {
    slug: 'pyrography-celtic-border-panel',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'A Celtic knotwork border in pyrography works through one simple rule. At every crossing, the shading on the upper ribbon is lighter than the shading on the ribbon below. That single tonal rule is what creates the over-under feel. The pattern itself sits on a regular diagonal grid. Once you can draw the grid, you can draw and burn any knotwork pattern. Sycamore is the best wood for this project. Its pale, even grain gives the most contrast with the burned lines, and its fine texture gives clean edges on the writing-tip outlines.',
      },
    ],
  },
  {
    slug: 'pyrography-colour-technique',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'Work in a well-aired room; burning wood gives off light smoke. Colour over pyrography is not the same as painting on wood. The burned marks are already the drawing. The colour is a clear wash that adds warmth and depth without hiding the structure underneath. Burned carbon on wood pushes water-based colour back a little. That natural resist keeps the darkest burned marks visible above the wash.',
      },
      {
        kind: 'plain',
        path: [6, 4, 0],
        text:
          'Let the final wash dry fully, then look at the wood and check the burned lines are still clear. If the darkest marks have lost contrast under the colour, a final pass with the writing tip at high temperature will bring them back without harming the dried colour.',
      },
    ],
  },
  {
    slug: 'reading-the-brood-frame',
    ops: [
      {
        kind: 'plain',
        path: [10],
        text:
          'Sunken or pinholed caps: a worker brood cap that sits below the cell rim, or has a small hole pecked in it, can point to American Foulbrood or European Foulbrood. Both are statutory notifiable diseases. Any suspicion of either means you must contact the National Bee Unit straight away.',
      },
    ],
  },
  {
    slug: 'replacing-a-light-switch',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'Swapping a switch faceplate follows the same safe-isolation steps as swapping a socket faceplate. Isolate the circuit, lock it off, prove it dead with a live-dead-live test, photograph the connections, transfer them, refit, restore the supply, and test the switch. The extra step is at a two-way switch. A two-way switch has three terminals and a three-core-and-earth cable, not a simple twin-and-earth.',
      },
    ],
  },
  {
    slug: 'replacing-a-shower-cartridge',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'A worn thermostatic cartridge is the most common cause of a shower that no longer holds temperature, or that drips when the valve is shut. Before ordering a replacement, find the valve maker and model. The maker and model are usually stamped on the valve body inside the wall. Order the exact-match cartridge for that valve. There is no universal cartridge that fits every valve.',
      },
    ],
  },
  {
    slug: 'replacing-a-single-socket-faceplate',
    ops: [
      {
        kind: 'plain',
        path: [0],
        text:
          'Swapping a socket faceplate is one of the few electrical jobs a competent non-electrician can do legally in the UK. It is not notifiable work under Part P because it sits on an existing circuit, not a new one. The job is the faceplate only. The back box and the wiring inside the wall stay untouched. The safety rule is absolute. The circuit must be proved dead with the full live-dead-live procedure before any wire is touched.',
      },
    ],
  },
]

function getNodeAtPath(body: any, path: number[]): any {
  let n = body
  for (const idx of path) {
    n = n.content[idx]
  }
  return n
}

function applyPlain(body: any, path: number[], text: string): void {
  const para = getNodeAtPath(body, path)
  if (!para || para.type !== 'paragraph') {
    throw new Error(`expected paragraph at path ${path.join('.')}; got ${para?.type}`)
  }
  para.content = [{ type: 'text', text }]
}

function applyMarkPreserve(body: any, path: number[], segments: string[]): void {
  const para = getNodeAtPath(body, path)
  if (!para || para.type !== 'paragraph') {
    throw new Error(`expected paragraph at path ${path.join('.')}; got ${para?.type}`)
  }
  if (!Array.isArray(para.content)) throw new Error('no content array')
  // Walk leaves; replace plain leaves' text with the next segment from `segments`.
  // Marked leaves keep their text. The number of plain leaves must equal segments.length.
  const plainLeafIndices: number[] = []
  para.content.forEach((leaf: any, i: number) => {
    const marked = Array.isArray(leaf.marks) && leaf.marks.length > 0
    if (!marked) plainLeafIndices.push(i)
  })
  if (plainLeafIndices.length !== segments.length) {
    throw new Error(
      `path ${path.join('.')}: ${plainLeafIndices.length} plain leaves but ${segments.length} segments`,
    )
  }
  plainLeafIndices.forEach((leafIdx, segIdx) => {
    para.content[leafIdx].text = segments[segIdx]
    para.content[leafIdx].type = 'text'
  })
}

for (const job of JOBS) {
  const file = resolve(dir, job.slug + '.json')
  const raw = readFileSync(file, 'utf8')
  const data = JSON.parse(raw)
  for (const op of job.ops) {
    if (op.kind === 'plain') {
      applyPlain(data.body, op.path, op.text)
    } else if (op.kind === 'mark-preserve') {
      applyMarkPreserve(data.body, op.path, op.segments)
    } else if (op.kind === 'sourceNotes') {
      data.sourceNotes = op.text
    }
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('[OK]', job.slug, '(' + job.ops.length + ' ops)')
}
console.log('Done.')
