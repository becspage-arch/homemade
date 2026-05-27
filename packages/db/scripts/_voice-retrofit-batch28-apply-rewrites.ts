/**
 * Apply targeted paragraph rewrites for batch28 grade-level failures.
 *
 * Each entry specifies a file and a path; the existing paragraph (or attr)
 * content is replaced with a simpler version that brings grade level <= 12.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch28')

interface ParagraphRewrite {
  /** "body > paragraph[N]" or "body > paragraph[N] > text" (path inside body) */
  paragraphIndex: number
  newText: string
}

interface NestedParagraphRewrite {
  /** e.g. ["body", "orderedList[4]", "listItem[3]", "paragraph[0]"] */
  pathSegments: string[]
  newText: string
}

interface AttrRewrite {
  /** Path to the block (e.g. "infoPanel[9]" or "troubleshooter[16]") */
  blockIndex: number
  blockType: 'infoPanel' | 'troubleshooter' | 'suppliesCard' | 'varietiesPanel'
  /** For infoPanel: "body" or "title". For troubleshooter: itemIndex + "fix" | "cause" | "symptom". */
  field: string
  itemIndex?: number
  newText: string
}

interface FileRewrites {
  file: string
  paragraphs?: ParagraphRewrite[]
  nestedParagraphs?: NestedParagraphRewrite[]
  attrs?: AttrRewrite[]
}

const REWRITES: FileRewrites[] = [
  {
    file: 'braised-red-cabbage.json',
    paragraphs: [
      {
        paragraphIndex: 13,
        newText:
          "Braised red cabbage came to the British kitchen from German and Alsatian cooking. Both use the same apple, vinegar, and spice braise. The Germans call it Rotkohl, the French chou rouge braise. It was a fixed British winter side by the Victorian period, served with game and pork roasts. It belongs especially at Christmas, where the make-ahead reliability is as useful as the flavour.",
      },
    ],
  },
  {
    file: 'slicing-cut-technique.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "The slicing cut works like a sharp kitchen knife on bread. Push the blade straight down and it crushes the loaf. Draw it at an angle and it slices cleanly. The same idea applies in wood. Use the slicing cut on end grain, hard cross-grain sections, the chamfer at the tip of a spoon handle, and anywhere a straight push cut would need too much force.",
      },
    ],
  },
  {
    file: 'spencerian-oval-and-shade.json',
    nestedParagraphs: [
      {
        pathSegments: ['body', 'orderedList[4]', 'listItem[3]', 'paragraph[0]'],
        newText:
          "The shaded downstroke (for letter stems). Start at the x-height with light pressure. Press harder on the way down. Ease off at the baseline and continue as a hairline. In Spencerian the shade lives only on the downstroke, never on the curve at the foot of the letter.",
      },
    ],
  },
  {
    file: 'spokeshave-shaping-technique.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "The spokeshave sits between the drawknife and the sandpaper in the workflow. The drawknife brings a stool leg or chair rung close to its final size. The spokeshave then smooths the surface to a steady taper without taking off much wood. In the right hands a well-tuned spokeshave is the fastest way to turn a rough-axed or drawknife-shaped blank into a clean round surface.",
      },
    ],
  },
  {
    file: 'spoon-blank-drying-guide.json',
    nestedParagraphs: [
      {
        pathSegments: ['body', 'bulletList[5]', 'listItem[3]', 'paragraph[0]'],
        newText:
          "A thin coat of raw linseed oil straight after carving slows the surface drying without stopping it. This helps with fast-drying woods like hazel, birch, and ash. It does not replace the full curing at the finishing stage.",
      },
    ],
  },
  {
    file: 'standalone-home-battery-decision-guide.json',
    paragraphs: [
      {
        paragraphIndex: 6,
        newText:
          "Charging at night when wind power is high can cut your carbon use, but this is not guaranteed. Cold high-demand nights pull in gas power, which raises the grid carbon intensity. A battery charged overnight is not reliably low-carbon unless you pair it with a carbon-aware charging controller.",
      },
    ],
    nestedParagraphs: [
      {
        pathSegments: ['body', 'bulletList[8]', 'listItem[0]', 'paragraph[0]'],
        newText:
          "EV charger combined use. If the battery can also hold power for overnight EV charging, you may not need to upgrade the main electrical supply. That saving can pay for the battery on its own.",
      },
      {
        pathSegments: ['body', 'bulletList[8]', 'listItem[1]', 'paragraph[0]'],
        newText:
          "Future-proofing for solar. Size and wire the battery for solar PV now, even if the panels come later. That saves a second install cost later.",
      },
      {
        pathSegments: ['body', 'bulletList[8]', 'listItem[2]', 'paragraph[0]'],
        newText:
          "Grid resilience. Some battery systems keep working through power cuts. If you run medical equipment or live somewhere remote, that reliability can be worth more than the money the battery saves.",
      },
    ],
    attrs: [
      {
        blockIndex: 9,
        blockType: 'infoPanel',
        field: 'body',
        newText:
          "Home batteries must have a MCS product certificate or its equal (IEC 62619) for fire and electrical safety. LFP (lithium iron phosphate) chemistry is much safer than NMC (nickel manganese cobalt). It just stores a bit less energy per kilo. The install must follow BS 7671 and the grid connection standard G99 or G98. The battery management system (BMS) guards against over-current, over-voltage, and over-heating.",
      },
    ],
  },
  {
    file: 'stop-cut-technique.json',
    paragraphs: [
      {
        paragraphIndex: 2,
        newText:
          "Use the stop cut whenever a carving cut must end at a clear edge and the grain might carry the blade past that edge. Three common uses. In chip carving, each triangle is set up by three stop cuts before any wood is taken out. In relief carving, an outline cut sets the panel boundary before the ground is lowered around it. And in any woodwork where two surfaces meet at a corner, the stop cut makes the shoulder.",
      },
    ],
    attrs: [
      {
        blockIndex: 16,
        blockType: 'troubleshooter',
        field: 'fix',
        itemIndex: 1,
        newText:
          "Slow down the shaping cuts. Hold the same blade angle through each cut. Check that all three meet at about the same depth.",
      },
    ],
  },
  {
    file: 'suminagashi-ink-on-water.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "Suminagashi means 'ink floating on water'. It is the oldest recorded marbling tradition, practised at the Heian court in Japan. European marbling that came later uses a thickened bath of carrageenan. The suminagashi method uses plain water. The ink sits on the water's surface tension, not on a thick 'size'. The patterns come out softer, with translucent edges and the concentric rings that are the signature of the craft.",
      },
    ],
  },
  {
    file: 'suspended-timber-floor-insulation-from-below.json',
    paragraphs: [
      {
        paragraphIndex: 8,
        newText:
          "Step 5. Hold the batts in place. There are three options. (a) Nail timber laths across the bottom of the joists every 500 mm. (b) Staple polypropylene netting to the bottom of the joists. This is the fastest for large areas. (c) Cut timber noggins to wedge between joists every 600 mm. Option (b) needs a staple gun and is the quickest from below.",
      },
    ],
  },
  {
    file: 'swale-and-rain-garden-design.json',
    paragraphs: [
      {
        paragraphIndex: 6,
        newText:
          "Plants must put up with both wet periods and dry ones between storms. A rain garden has zones. The lowest, wettest zone suits moisture-loving plants like Iris sibirica, Juncus effusus, Persicaria, and Lobelia cardinalis. The higher edges suit plants that like free drainage but can take the odd flooding, such as Geranium, Achillea, Salvia, and ornamental grasses. Do not plant lawn grass in the lowest zone. It dies in long wet spells.",
      },
    ],
  },
  {
    file: 'testing-whether-compost-is-ready-to-use.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "Compost that has not fully matured still holds active break-down products like organic acids and ammonia, plus bits of material that have not finished breaking down. Put on the soil too early, it can stop seeds from germinating and tie up nitrogen as the bacteria keep working. The tests below tell ready compost from compost that needs more time.",
      },
      {
        paragraphIndex: 8,
        newText:
          "For a hot compost heap, temperature is the clearest sign. A heap that has settled below 40°C after the final turn, and does not heat up again when turned, has finished the hot phase. It is not yet fully mature. The heap still needs 2 to 4 weeks of curing (left undisturbed) before the bag test confirms it is stable.",
      },
    ],
  },
  {
    file: 'textile-waste-and-repair.json',
    nestedParagraphs: [
      {
        pathSegments: ['body', 'bulletList[6]', 'listItem[2]', 'paragraph[0]'],
        newText:
          "Hook and eye, poppers, and Velcro. You can get push-through replacements at a haberdashers. None of them need sewing.",
      },
    ],
  },
  {
    file: 'thermal-bridging-explained.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "A thermal bridge forms wherever a material with a higher lambda value than the insulation runs from the warm inside to the cold outside. In a timber-framed wall, the studs carry about three times more heat per square metre than the mineral wool between them. In a steel-framed wall, the steel carries about 1000 times more heat than the insulation. Even a small steel fraction sets the total heat loss.",
      },
      {
        paragraphIndex: 7,
        newText:
          "On a cold day with at least 10°C between inside and outside, a thermal imaging camera shows bridges as warmer patches on the outside face or cooler patches on the inside face. The most common bridges in retrofitted UK houses are at floor junctions, window heads, and column positions.",
      },
      {
        paragraphIndex: 8,
        newText:
          "No camera? Feel the inside walls on a cold morning. Pay attention to floor-to-wall joins and window reveals. A clearly colder patch points to a bridge. Persistent mould in a corner that appears after you insulate is another reliable sign.",
      },
      {
        paragraphIndex: 10,
        newText:
          "External wall insulation (EWI) wraps the whole outside in one unbroken layer. It runs across floor joins, ceiling joins, and any structural element. The insulation is never interrupted at joist ends or columns. Internal wall insulation (IWI) has to be broken at each floor and ceiling where the structure passes through. That leaves a repeating bridge at every joist end. It is the main thermal advantage of EWI over IWI on solid-wall houses.",
      },
    ],
    attrs: [
      {
        blockIndex: 11,
        blockType: 'infoPanel',
        field: 'body',
        newText:
          "A standard U-value gives the heat loss through the bulk wall only. The corrected U-value adds in repeating bridges by area-weighting the insulation and the structural parts. For a typical timber-framed wall at 15% frame fraction, the corrected U-value is 10 to 15% higher than the insulation-only figure. SAP calculations need the corrected value.",
      },
    ],
  },
  {
    file: 'traditional-paper-crane.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "The orizuru is the standard first model for learning origami. It teaches the preliminary base and the bird base, which sit underneath dozens of other classic models. The fold sequence uses only valley folds, mountain folds, and one inside-reverse fold. A 15 cm square of standard origami paper is the right size for a first try. Thinner paper makes a lighter finished crane, but it is harder to fold cleanly.",
      },
    ],
    attrs: [
      {
        blockIndex: 9,
        blockType: 'troubleshooter',
        field: 'cause',
        itemIndex: 0,
        newText:
          "The straight folds should be valley folds and the diagonal folds should be mountain folds during the collapse (or the other way round). If the directions are mixed up, the collapse fights the paper instead of working with it.",
      },
    ],
  },
  {
    file: 'wedging-clay-spiral-method.json',
    paragraphs: [
      {
        paragraphIndex: 1,
        newText:
          "This guide covers the spiral method, also called ram's-head wedging. It is the default in studios in Britain and Japan. The alternative cut-and-slap method splits the clay in half with a wire and slams the halves back together. It is faster, but in a hurry it traps more air than it gets out. Spiral wedging is the safe default for beginners. It remains the standard for studio work. Both finish at the same consistency.",
      },
      {
        paragraphIndex: 23,
        newText:
          "The rhythm is the experienced potter's tell. Push, rock, rotate in a steady pulse like a slow heartbeat. Your hands feel the clay change as you wedge. A stiff fresh block softens a little under repeated compression. A too-wet block tightens a little as moisture spreads out. A well-wedged block feels evenly firm to the push, with no soft spots.",
      },
    ],
  },
  {
    file: 'wet-felted-nuno-scarf-on-silk.json',
    attrs: [
      {
        blockIndex: 15,
        blockType: 'troubleshooter',
        field: 'fix',
        itemIndex: 1,
        newText:
          "Lay the roving in uneven wisps, not solid bands. Uneven coverage gives a random bubble texture. Banded coverage gives ridges that look corrugated.",
      },
    ],
  },
  {
    file: 'wet-felting-a-soap-covering.json',
    paragraphs: [
      {
        paragraphIndex: 19,
        newText:
          "The motion you learn on a soap covering is the same motion that makes flat panels, felted bowls, wet-felted hats, and wet-felted slippers. The resist changes. A bowl uses a wedge of bubble wrap. A hat uses a head-shaped plastic or sponge form. The pattern always starts the same way. Cross-hatched layers, hot soapy water, ten minutes of careful rubbing, a pinch test, then fulling. The soap covering is the kitchen-sink scale. Everything else is the same craft, just bigger.",
      },
    ],
  },
  {
    file: 'worm-egg-count-and-wormer-resistance.json',
    paragraphs: [
      {
        paragraphIndex: 0,
        newText:
          "Current best practice is targeted selective treatment. You worm only the animals that need it, at the time they need it. The trigger is either a clinical sign (weight loss, scouring, bottle jaw) or a faecal egg count. Leaving untreated animals as refugia slows the build-up of anthelmintic resistance in the flock.",
      },
    ],
  },
  {
    file: 'worming-chickens.json',
    paragraphs: [
      {
        paragraphIndex: 4,
        newText:
          "Two licensed wormers are sold over the counter for backyard poultry in the UK at the time of writing. Flubenvet (flubendazole) is mixed into feed at the rate on the packet for seven days. The egg withdrawal is zero days when used as directed. Panacur (fenbendazole) is a water-soluble powder. Follow the label for the dose, and watch the egg withdrawal period set on that product. Do not use wormers licensed for sheep or pigs on poultry. The dose rates and formulations differ.",
      },
    ],
  },
]

/**
 * Preserve glossaryTooltip marks from the original paragraph by re-applying
 * them to matching substrings in the new text. Any term whose surface text
 * doesn't appear verbatim in the new text is dropped (we don't try to
 * synthesise new wrap points — the rewriter writes glossary terms verbatim
 * where the tooltip should land).
 */
function collectTooltipMarks(
  node: any,
): { text: string; mark: any }[] {
  const out: { text: string; mark: any }[] = []
  function walk(n: any): void {
    if (!n) return
    if (Array.isArray(n.marks)) {
      const gt = n.marks.find((m: any) => m?.type === 'glossaryTooltip')
      if (gt && typeof n.text === 'string') out.push({ text: n.text, mark: gt })
    }
    if (Array.isArray(n.content)) n.content.forEach(walk)
  }
  walk(node)
  return out
}

function buildContentWithTooltips(
  newText: string,
  tooltips: { text: string; mark: any }[],
): any[] {
  // Sort tooltips by length descending so longer phrases are matched first.
  const sorted = [...tooltips].sort((a, b) => b.text.length - a.text.length)
  type Segment = { start: number; end: number; mark?: any }
  const segments: Segment[] = []

  for (const tt of sorted) {
    let searchFrom = 0
    while (searchFrom < newText.length) {
      const idx = newText.indexOf(tt.text, searchFrom)
      if (idx === -1) break
      // Check overlap with already-claimed segments.
      const end = idx + tt.text.length
      const overlap = segments.some((s) => s.mark && !(end <= s.start || idx >= s.end))
      if (!overlap) {
        segments.push({ start: idx, end, mark: tt.mark })
        break // Only wrap first occurrence of each term.
      }
      searchFrom = idx + 1
    }
  }

  segments.sort((a, b) => a.start - b.start)
  if (segments.length === 0) {
    return [{ type: 'text', text: newText }]
  }

  const out: any[] = []
  let cursor = 0
  for (const seg of segments) {
    if (seg.start > cursor) {
      out.push({ type: 'text', text: newText.slice(cursor, seg.start) })
    }
    out.push({
      type: 'text',
      text: newText.slice(seg.start, seg.end),
      marks: [seg.mark],
    })
    cursor = seg.end
  }
  if (cursor < newText.length) {
    out.push({ type: 'text', text: newText.slice(cursor) })
  }
  return out
}

function replaceParagraphText(node: any, newText: string): void {
  const tooltips = collectTooltipMarks(node)
  node.content = buildContentWithTooltips(newText, tooltips)
}

function getChildByLabel(parent: any, label: string): any {
  // Label like "paragraph[0]" / "orderedList[4]" / "listItem[3]".
  const m = /^([a-zA-Z]+)\[(\d+)\]$/.exec(label)
  if (!m) throw new Error(`bad label: ${label}`)
  const t = m[1]
  const idx = Number(m[2])
  if (!Array.isArray(parent.content)) throw new Error('parent has no content')
  // Find the idx-th child whose type matches t.
  let counter = 0
  for (const child of parent.content) {
    if (child.type === t) {
      if (counter === idx) return child
      counter++
    }
  }
  throw new Error(`child ${label} not found`)
}

// Some files use absolute indices: body > paragraph[0] in voice-check terms
// means content[0] when the FIRST node is a paragraph; but extractProseChunks
// counts globally (every node in body.content), not per-type. Look at the
// labelling function: nodeLabel(node, idx) uses the actual index in the
// content array. So paragraph[13] means body.content[13] AND that node must
// be a paragraph. We mirror that here.
function getChildByGlobalIndex(parent: any, label: string): any {
  const m = /^([a-zA-Z]+)\[(\d+)\]$/.exec(label)
  if (!m) throw new Error(`bad label: ${label}`)
  const t = m[1]
  const idx = Number(m[2])
  if (!Array.isArray(parent.content)) throw new Error('parent has no content')
  const node = parent.content[idx]
  if (!node) throw new Error(`no node at index ${idx}`)
  if (node.type !== t) {
    throw new Error(`node at index ${idx} is type "${node.type}", expected "${t}"`)
  }
  return node
}

let totalRewrites = 0
let totalFiles = 0

for (const fr of REWRITES) {
  const fp = resolve(dir, fr.file)
  const data: any = JSON.parse(readFileSync(fp, 'utf8'))
  let changed = 0

  // Top-level paragraphs by global index in body.content
  for (const p of fr.paragraphs ?? []) {
    const node = data.body.content[p.paragraphIndex]
    if (!node || node.type !== 'paragraph') {
      throw new Error(`${fr.file}: body.content[${p.paragraphIndex}] is not a paragraph`)
    }
    replaceParagraphText(node, p.newText)
    changed++
  }

  // Nested paragraphs by full path.
  for (const np of fr.nestedParagraphs ?? []) {
    let cur: any = data
    for (const seg of np.pathSegments) {
      if (seg === 'body') cur = cur.body
      else cur = getChildByGlobalIndex(cur, seg)
    }
    if (cur.type !== 'paragraph') {
      throw new Error(`${fr.file}: path ${np.pathSegments.join(' > ')} is type ${cur.type}, expected paragraph`)
    }
    replaceParagraphText(cur, np.newText)
    changed++
  }

  // Attr-bearing blocks.
  for (const a of fr.attrs ?? []) {
    const block = data.body.content[a.blockIndex]
    if (!block || block.type !== a.blockType) {
      throw new Error(`${fr.file}: body.content[${a.blockIndex}] is not ${a.blockType}`)
    }
    if (a.blockType === 'infoPanel') {
      block.attrs ??= {}
      block.attrs[a.field] = a.newText
    } else if (a.blockType === 'troubleshooter') {
      if (a.itemIndex === undefined) throw new Error('troubleshooter requires itemIndex')
      const items = block.attrs?.items
      if (!Array.isArray(items) || !items[a.itemIndex]) {
        throw new Error(`${fr.file}: troubleshooter item ${a.itemIndex} not found`)
      }
      items[a.itemIndex][a.field] = a.newText
    } else {
      throw new Error(`unsupported blockType ${a.blockType}`)
    }
    changed++
  }

  writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[OK] ${fr.file} — ${changed} rewrites`)
  totalRewrites += changed
  totalFiles++
}

console.log(`\nDone: ${totalFiles} files, ${totalRewrites} rewrites`)
