/**
 * Apply voice rewrites to the batch46 (2026-05-28-batch3) files.
 *
 * For each failing file, locate the offending paragraph by its voice-check
 * path and replace its text content. The TipTap text node "type":"text"
 * field is preserved on every leaf.
 *
 * Two tapping files contain verbatim EFT setup statements ("Even though X,
 * I deeply and completely accept myself.") that exceed the grade-level
 * threshold. Per the verbatim-energy-statements memory rule, these stay
 * verbatim — they cannot be rewritten. Drop them from the batch and add
 * to the known-blocked list for the next fire.
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch3')

interface Rewrite {
  file: string
  path: string
  // Either a single string of replacement text (for simple paragraph nodes),
  // or a fn that mutates the located node directly.
  text?: string
  mutate?: (node: any) => void
}

// Helper: build a paragraph content array preserving any tokens.
function textLeaf(s: string): any {
  return { type: 'text', text: s }
}

const REWRITES: Rewrite[] = [
  {
    file: 'iskender-kebab.json',
    path: 'body.content[11]', // troubleshooter
    mutate: (node: any) => {
      // item[3].fix
      node.attrs.items[3].fix =
        'Assemble just before serving. The sauce should soak the top of the bread, not turn it to mush.'
    },
  },
  {
    file: 'iskender-kebab.json',
    path: 'body.content[13]',
    text:
      'İskender is one of the few Turkish dishes with a known creator and date. A kebab-maker named İskender Efendi in Bursa, in the mid-1800s, served döner lamb over flatbread with tomato sauce for the first time. The family that carries his name still runs restaurants in Bursa. Outside Turkey the dish is well known in Turkish neighbourhoods across Europe. The home version with minced lamb keeps the key parts: the sauced bread, the hot meat, the cold yoghurt, and the sizzling butter.',
  },
  {
    file: 'jam-roly-poly.json',
    path: 'body.content[16]',
    text:
      'Jam roly-poly has been on the British pudding map since at least the early 1800s. It appears in Mrs Beeton\'s Victorian household management manual and in cookery books aimed at thrifty cooks. It belongs to the family of suet-pastry puddings, alongside Sussex pond pudding and spotted dick. These dishes made substantial, cheap puddings from pantry staples. The pudding fell out of fashion in the late 1900s as home cooking moved towards lighter desserts. But it has outlasted the fashion.',
  },
  {
    file: 'jamaican-beef-patties.json',
    path: 'body.content[0]',
    text:
      'A good Jamaican beef patty has three things right. The pastry is short and flaky with a clear turmeric yellow. The filling is deeply spiced and slightly moist but not wet. The two come together in a thin, neatly crimped crescent that holds its shape when you bite. The patty is not a pasty and not an empanada. The pastry is thinner, the filling more assertively seasoned, and the whole thing smaller than it looks.',
  },
  {
    file: 'jamaican-chicken-soup.json',
    path: 'body.content[11]',
    text:
      'Chicken soup with spinners is Saturday soup in Jamaica. The tradition of a thick, slow-cooked soup every Saturday is rooted in Jamaican food culture. Every household has its version. The smell of chicken soup on a Saturday morning is a specific memory for anyone raised in Jamaica or in the Caribbean diaspora. In Britain the tradition continues in Jamaican families, made on Saturday morning and eaten at midday, a ritual that lasts across generations.',
  },
  {
    file: 'jamaican-cornmeal-porridge.json',
    path: 'body.content[9]',
    text:
      'Cornmeal porridge is the Caribbean breakfast at its best: comforting, cheap, and filling. In Jamaica it is the school-morning breakfast, the sick-day comfort, and the Sunday treat made with extra condensed milk. The mix of coconut milk, cinnamon, and condensed milk is specific to Jamaica and the Eastern Caribbean. The Barbadian version uses more water and less coconut milk. In the Caribbean diaspora in Britain it remains a home-cooking staple, made for children as a substantial breakfast before a long day.',
  },
  {
    file: 'jamaican-pumpkin-soup.json',
    path: 'body.content[9]',
    text:
      'Pumpkin soup is Saturday soup alongside chicken soup and pepperpot in the Jamaican soup tradition. The three soups show the different moods of Jamaican Saturday cooking. Chicken soup is restorative and simple. Pepperpot is dark and meaty. Pumpkin soup is smooth and comforting. All three are made in the morning and served at midday. All three are thick and robust, not the delicate consommé-style soups of European tradition. The coconut milk sets the Jamaican version apart from the plainer Eastern Caribbean pumpkin soups.',
  },
  {
    file: 'jambalaya.json',
    path: 'body.content[11]',
    text:
      'Jambalaya is one of the great dishes of Louisiana cooking. Louisiana cooking is itself one of the most layered regional cuisines in America. It pulls from French colonial rule, Spanish rule, West African food traditions brought by enslaved people, and the Acadian settlers who became the Cajun people. The dish is both a practical one-pot meal and a cultural document. The tomato-based Creole version comes from New Orleans. The non-tomato Cajun version comes from the rural parishes. The two are distinct lineages. Jambalaya is served at festivals, family gatherings, and community events across Louisiana as a sign of regional identity as much as a recipe.',
  },
  {
    file: 'jerk-pork-shoulder.json',
    path: 'body.content[11]',
    text:
      'Jerk pork comes from the cooking of the Maroons. The Maroons were communities of formerly enslaved people who lived in the mountains of Jamaica. They worked out how to pit-roast whole pigs over pimento wood. The pairing of allspice and scotch bonnet is what gives jerk its identity. Both are native to Jamaica. The pimento tree, which gives allspice, is central to the original method. Its green wood and leaves are used as fuel and as a smoking bed. The home oven version is a fair approximation. The Blue Mountain pit version is a different experience.',
  },
  {
    file: 'joojeh-kabab.json',
    path: 'body.content[11]',
    text:
      'Joojeh kabab is the most popular chicken dish in Iranian restaurant culture. It is served alongside rice or bread with grilled tomatoes and raw onion. It plays the same role in Iranian grilled food that shish taouk plays in the Levantine version: the standard, the baseline, the thing everyone orders. The saffron and lemon pairing is distinctly Persian, as opposed to the yoghurt and tomato paste of the Lebanese shish taouk. In Iran, joojeh kabab is often cooked over charcoal, and the smoke from the coals adds another layer that a griddle pan cannot fully replicate. At high heat the result is close.',
  },
  {
    file: 'joojeh-kebab.json',
    path: 'body.content[2]',
    text:
      'Serve with steamed basmati rice and charred flatbread. Add a small bowl of fresh herbs, radishes, spring onions, and flat-leaf parsley as the traditional sides.',
  },
  {
    file: 'kabab-koobideh.json',
    path: 'body.content[11]',
    text:
      'Kabab koobideh is the defining dish of Iranian street and restaurant culture. It is the kebab that appears at every Persian celebration, eaten with flatbread and rice. The image of wide flat skewers arranged over a charcoal grill, the fat dripping and flaming, is central to Iranian food memory. In Tehran, kebab shops that specialise only in koobideh and barg are an institution. The dish has spread through the Iranian diaspora worldwide. The flat skewer version stays the standard in Iranian restaurants even outside Iran. The skill of kneading meat until sticky is passed from one generation to the next.',
  },
  {
    file: 'kafta-bil-sanieh.json',
    path: 'body.content[11]',
    text:
      'Kafta bil sanieh is Lebanese family cooking at its most practical. It is a single tray that feeds four, needs no watching, and comes to the table in the dish it was cooked in. It belongs to the broad tradition of Levantine tray bakes: meat and vegetables layered in a deep tin and cooked in a tomato-based sauce. The kafta seasoning is recognisably Lebanese. Allspice and cinnamon are the spices of the region\'s minced meat dishes. They set the Lebanese version apart from Turkish or Iranian equivalents.',
  },
  {
    file: 'kakavia.json',
    path: 'body.content[11]',
    text:
      'Kakavia is the dish that ties modern Greek cuisine to its ancient roots. Same pot, same logic of whatever was caught that day, cooked quickly in water with oil and aromatics. Greek colonists brought their cooking habits along the Mediterranean coast. Versions of the simple fish pot became the precursor to French bouillabaisse, Italian cacciucco, and Spanish sopa de pescado. The Greek original stays simpler than its descendants. No rouille, no saffron, no toasted croutons. Just fish, vegetables, olive oil, and lemon.',
  },
  {
    file: 'shortcrust-pastry-blind-baked-case.json',
    path: 'body.content[24]',
    text:
      'Half-fat-to-flour shortcrust is the foundation of British pie- and tart-making. The Victorian household manual by Mrs Beeton, from 1861, lists the same proportion as the household standard. The earlier 19th-century cookery books by Eliza Acton use it for both sweet and savoury cases. The blind-baking sequence with weighted paper is the 20th-century refinement that Florence White documented in 1932. The recipe here is the household case unchanged in its proportions for nearly two centuries.',
  },
  {
    file: 'snickerdoodles-cinnamon.json',
    path: 'body.content[0]',
    text:
      'Snickerdoodles are an American household biscuit from the late 1800s. A soft creamed-butter dough leavened with cream of tartar and bicarbonate of soda. Rolled into balls, tossed in cinnamon sugar, and baked just until the edges set. The tang of the cream of tartar against the cinnamon is what makes them snickerdoodles, not plain cinnamon cookies.',
  },
  {
    file: 'soda-bread-irish.json',
    path: 'body.content[10]',
    // Paragraph with scaling tokens — preserve tokens verbatim.
    text:
      'Weigh {{wholemeal-flour}} wholemeal flour, {{plain-flour}} plain flour, {{bicarbonate-of-soda}} bicarbonate of soda (also called baking soda in American recipes), and {{sea-salt-fine}} fine sea salt into the large bowl. Run your fingers through the bowl to mix the soda evenly. Pockets of undissolved soda cause green streaks in the crumb.',
  },
  {
    file: 'soda-bread-irish.json',
    path: 'body.content[22]',
    text:
      'Soda bread became practical in Ireland and Britain after the 1840s, when bicarbonate of soda became widely sold in shops. Before that, bread leavening meant yeast or the slow sour of a sourdough culture. The soda loaf was a household staple wherever buttermilk or sour milk was the natural by-product of butter-making. Florence White\'s 1932 recording of regional British baking includes several variants. The Victorian household manual by Mrs Beeton, from 1861, covers the plain soda method that the recipe here follows.',
  },
  {
    file: 'tapping-to-enjoy-tracking-money.json',
    path: 'body.content[11]',
    text:
      'The tapping framework is Emotional Freedom Technique, or EFT. It comes from Gary Craig in the mid-1990s, building on Roger Callahan\'s Thought Field Therapy. The script is adapted from Day 51 of MONEY: A 12-Week Tapping Program to Attract Cash, Overflow & Abundance Without Hustle or Burnout (Rebecca J Page, 2025).',
  },
  {
    file: 'tapping-to-forgive-the-women-before-me.json',
    path: 'body.content[11]',
    text:
      'Adapted from Day 12 of MONEY: A 12-Week Tapping Program by Rebecca J Page, 2025, "Forgive ancestors\' financial pain." The tapping method is Emotional Freedom Technique, or EFT. It comes from Gary Craig in the mid-1990s, building on Roger Callahan\'s Thought Field Therapy.',
  },
]

// Two tapping files contain verbatim EFT setup statements that cannot be
// rewritten. Drop from the batch and surface in the hand-off.
const VERBATIM_BLOCKED = [
  'tapping-to-celebrate-luxury-and-simplicity-together',
  'tapping-to-give-freely-without-fear',
]

function setParagraphText(node: any, text: string): void {
  if (node.type !== 'paragraph' && node.type !== 'heading') {
    throw new Error(`Cannot set text on non-paragraph node: ${node.type}`)
  }
  node.content = [textLeaf(text)]
}

function applyToFile(filename: string, rewrites: Rewrite[]): void {
  const filePath = resolve(batchDir, filename)
  const data = JSON.parse(readFileSync(filePath, 'utf8'))
  for (const r of rewrites) {
    const m = r.path.match(/^body\.content\[(\d+)\]$/)
    if (!m) throw new Error(`Unsupported path: ${r.path}`)
    const idx = parseInt(m[1], 10)
    const node = data.body.content[idx]
    if (!node) throw new Error(`Node missing at index ${idx} in ${filename}`)
    if (r.mutate) {
      r.mutate(node)
    } else if (r.text !== undefined) {
      setParagraphText(node, r.text)
    }
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[rewrote] ${filename} (${rewrites.length} edits)`)
}

// Group rewrites by file.
const byFile = new Map<string, Rewrite[]>()
for (const r of REWRITES) {
  const list = byFile.get(r.file) ?? []
  list.push(r)
  byFile.set(r.file, list)
}
for (const [file, rs] of byFile) {
  applyToFile(file, rs)
}

// Drop verbatim-blocked files.
for (const slug of VERBATIM_BLOCKED) {
  const filePath = resolve(batchDir, `${slug}.json`)
  if (existsSync(filePath)) {
    unlinkSync(filePath)
    console.log(`[dropped] ${slug}.json (verbatim EFT setup statement)`)
  }
}

// Update _slugs.json to reflect the drops.
const slugsPath = resolve(batchDir, '_slugs.json')
const slugsData = JSON.parse(readFileSync(slugsPath, 'utf8'))
const allSlugs: string[] = slugsData.slugs
const blocked = new Set(VERBATIM_BLOCKED)
slugsData.slugs = allSlugs.filter((s) => !blocked.has(s))
slugsData.count = slugsData.slugs.length
if (Array.isArray(slugsData.details)) {
  slugsData.details = slugsData.details.filter((d: any) => !blocked.has(d.slug))
}
slugsData.droppedVerbatimEFT = VERBATIM_BLOCKED
writeFileSync(slugsPath, JSON.stringify(slugsData, null, 2) + '\n', 'utf8')
console.log(`[updated] _slugs.json — count now ${slugsData.count}`)
