/**
 * One-shot script: apply the hand-crafted rewrites for batch31 violators.
 * Each entry names a file, a TipTap path, and the new prose text (single
 * paragraph; replaces the existing paragraph's content[]).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BATCH_DIR = resolve(__dirname, '../../..', 'docs/voice-retrofit-2026-05-27-batch31')

interface Rewrite {
  file: string
  path: string
  newText: string
}

const REWRITES: Rewrite[] = [
  {
    file: 'cacio-e-pepe.json',
    path: 'body > paragraph[11]',
    newText:
      "Cacio e pepe belongs to Rome, like carbonara. Both are Roman pasta dishes that the rest of Italy makes badly or differently. Romans guard them fiercely. Cacio e pepe is older than carbonara by at least two hundred years. It was here before guanciale came into Roman pasta cooking, and it is much simpler. Three things, one skill. The skill is learned, not natural. The first few tries often fail. The cheese clumps, or the sauce goes watery, before you find the right balance.",
  },
  {
    file: 'callaloo-soup-trinidad.json',
    path: 'body > paragraph[0]',
    newText:
      "Callaloo leaves are the right ingredient for this recipe. Spinach is the usual swap if you cannot find dasheen bush. The flavour is quite different though. Dasheen leaves are more mineral and slightly bitter, which is why the coconut milk and crab balance them so well. Spinach callaloo is milder and less complex.",
  },
  {
    file: 'callaloo-soup-trinidad.json',
    path: 'body > paragraph[9]',
    newText:
      "Callaloo is one of the two national dishes of Trinidad and Tobago. The other is crab and callaloo, the stuffed version. It sits on the Sunday table as a needed side. No Sunday lunch is complete without it. The texture and flavour are unlike any other green dish: thick, smooth, rich from the coconut milk, with okra and dasheen leaves layered on top. In Britain the Trinidadian diaspora still makes callaloo as a Sunday staple. They buy dasheen leaves from Caribbean food shops or swap in spinach when they can't find them.",
  },
  {
    file: 'callaloo-stew.json',
    path: 'body > paragraph[13]',
    newText:
      "Callaloo is one of the most widely eaten dishes across the Caribbean. It shows up in some form in nearly every island's cooking. In Jamaica it most often appears at breakfast next to ackee and saltfish, as the green side of the meal. In Trinidad, callaloo with coconut milk and crab is a big part of Sunday cooking, served with pelau and macaroni pie. The UK version using spinach is close, but it misses the earthy note that true dasheen or amaranth leaves bring.",
  },
  {
    file: 'canard-aux-cerises.json',
    path: 'body > paragraph[13]',
    newText:
      "Canard aux cerises is part of a wider French tradition: braising duck with fruit. Cherries, oranges, olives, prunes. The fruit adds sourness and sweetness to cut through the rich, rendered duck fat. The cherry version belongs to early summer, when Morello cherries are briefly in season in France and the UK. In the French kitchen, duck with cherries shows up both in simple bistros and in fancy cooking. The same flavour logic in two different forms. The home version, as here, is the bistro form: brown the duck, braise it in wine, add cherries, reduce, serve.",
  },
  {
    file: 'caponata.json',
    path: 'body > paragraph[13]',
    newText:
      "Caponata is Sicilian rather than Italian in the mainland sense. The Arab period of Sicilian history left a mark on the island's cooking that nothing on the peninsula matches. You see it in the sweet-and-sour mix in a savoury dish, the pine nuts and raisins, the layering of preserved flavours with fresh ones. Caponata comes in dozens of versions across the island. Each town insists its version is the right one. The constants are aubergine, vinegar, sugar, and the patience to let the dish settle before eating it.",
  },
  {
    file: 'caprese.json',
    path: 'body > paragraph[10]',
    newText:
      "Caprese is the clearest example of a rule that runs through Italian cooking. The best dish from the ingredients you have is the one that puts them on a plate and gets out of the way. Tomato, mozzarella, and basil match the colours of the Italian flag. That has been said so often it is a cliché. More useful: those three are also the main flavours of Campanian summer cooking. The dish asks nothing of the cook except good judgement about quality.",
  },
  {
    file: 'caribbean-black-cake.json',
    path: 'body > paragraph[11]',
    newText:
      "Caribbean black cake is the celebration cake of the Caribbean diaspora. It is cut at Christmas, at weddings (as the wedding cake, often tiered and iced white over the black inside), and at christenings. Making black cake is a yearly event in Caribbean homes. The fruit is put to soak in November for the Christmas cake. In Britain the making and gifting of black cake is one of the strongest food links of the Caribbean diaspora. It connects each generation to the islands, to the families who made it before them, and to the smell of rum-soaked fruit that says Christmas.",
  },
  {
    file: 'carrot-and-coriander-soup.json',
    path: 'body > paragraph[14]',
    newText:
      "Carrot and coriander became one of the defining soups of British vegetarian cooking in the 1980s. By the 1990s it was on every wholefood café menu and every homemade soup list in the country. The appeal is simple. Carrots are cheap, plentiful, and sweet. Coriander is the spice that makes an ordinary vegetable feel thought-through. The soup is now so woven into British home cooking that it barely reads as a recipe any more.",
  },
  {
    file: 'cassoulet.json',
    path: 'body > paragraph[16]',
    newText:
      "The fight between Carcassonne, Castelnaudary and Toulouse over the right cassoulet recipe has run for at least a century. They argue about it like a treaty dispute. Castelnaudary claims the first version. Toulouse adds confit duck and mutton. This recipe sides with Castelnaudary's focus on the crust. Whichever town is right, cassoulet is the great winter dish of the Languedoc. Best made on a Saturday when you have nothing to do until Sunday.",
  },
  {
    file: 'croissants-laminated.json',
    path: 'body > paragraph[0]',
    newText:
      "Croissants are a laminated yeasted dough. You roll out a soft yeasted dough. Lay a flat slab of cold butter on top. Fold and roll the dough three times over a day, with rests in the fridge between each fold. The folding builds layers of butter and dough. The proof and bake then puff those layers apart into the airy crisp-flaked shape that defines the croissant.",
  },
  {
    file: 'damper-australian.json',
    path: 'body > paragraph[0]',
    newText:
      "Damper is not quite a soda bread. Traditional damper used no leavener at all. It rose from the air mixed in by hand and the steam from the water in the dough. Modern versions use self-raising flour (which has baking powder in it) to get a more open crumb from a home oven. The key character of damper is how simple it is: few ingredients, light handling of the dough, straight to the heat.",
  },
  {
    file: 'i-rest-because-i-am-valuable-energy-statement.json',
    path: 'body > paragraph[0]',
    newText:
      "A three-minute energy statement from Day 26 of a 30-day sleep intensive. The statement targets one belief: that rest is a reward for being productive. It releases the guilt and the sense that you need to justify stopping. And it lets you treat rest as something you already have permission to take.",
  },
  {
    file: 'i-say-yes-to-wealth-in-every-layer-of-me.json',
    path: 'body > paragraph[0]',
    newText:
      "A single-sentence affirmation from Day 20 of the MONEY program. It addresses the gap between wanting wealth on the surface and pushing it away further down. This is the pattern that creates self-sabotage with no clear cause.",
  },
  {
    file: 'water-hardness-and-scale.json',
    path: 'body > bulletList[2] > listItem[0] > paragraph[0]',
    newText:
      "Boiler heat exchanger: scale cuts heat transfer, raising running carbon by 5-15% depending on scale thickness. A scale inhibitor dosing pot on the boiler filling loop is the standard UK fix.",
  },
  {
    file: 'water-hardness-and-scale.json',
    path: 'body > bulletList[2] > listItem[1] > paragraph[0]',
    newText:
      "Immersion heater element: 1 mm of scale takes about 10% more energy to heat the same water. Descale once a year with a citric acid solution. Drain the cylinder, fill with dilute citric acid, drain, refill.",
  },
  {
    file: 'water-hardness-and-scale.json',
    path: 'body > paragraph[4]',
    newText:
      "An ion-exchange water softener swaps calcium and magnesium ions for sodium. This stops scale forming anywhere downstream. It needs a salt supply (block or tablet salt, refilled every 4-8 weeks). It uses 40-50 litres of water per regeneration cycle. And a qualified plumber has to install it. The standard UK setup also includes a separate hard water tap for drinking. This is because softened water has higher sodium.",
  },
  {
    file: 'water-hardness-and-scale.json',
    path: 'body > paragraph[5]',
    newText:
      "Magnetic conditioners and electronic scale inhibitors are devices that clamp onto pipework. They are sold widely but no consistent independent evidence supports them. They do not remove hardness ions. The claim is that they change crystal shape so scale does not stick. Lab studies have not consistently shown this to be true.",
  },
  {
    file: 'water-hardness-and-scale.json',
    path: 'body > paragraph[7]',
    newText:
      "A phosphate threshold inhibitor dosing pot fits onto the boiler cold-water fill. It uses a tiny amount of polyphosphate to keep calcium in solution and prevent scale on the boiler heat exchanger. A plumber installs it. It is low-maintenance, with no ongoing salt supply and no full softener. It is the most common scale protection for combi boilers in hard-water areas.",
  },
  {
    file: 'whittled-ash-marking-gauge.json',
    path: 'body > bulletList[21] > listItem[1] > paragraph[0]',
    newText:
      "The stock can be shaped with chamfers along its long edges. Make two push cuts at forty-five degrees on each long corner. This gives a more traditional look and feels more comfortable in the hand.",
  },
]

function navigate(body: any, pathSpec: string): { parent: any[]; index: number; node: any } | null {
  const segments = pathSpec.split(' > ').slice(1)
  let cur: any = body
  let parent: any[] | null = null
  let index = -1
  for (const seg of segments) {
    const m = seg.match(/^(\w+)\[(\d+)\]$/)
    if (!m) return null
    const idx = parseInt(m[2]!, 10)
    if (!cur || !Array.isArray(cur.content)) return null
    parent = cur.content
    index = idx
    cur = cur.content[idx]
  }
  if (!parent || index < 0) return null
  return { parent, index, node: cur }
}

async function main() {
  let applied = 0
  let failed = 0
  const filesTouched = new Set<string>()

  // Group by file to load once and write once.
  const byFile = new Map<string, Rewrite[]>()
  for (const r of REWRITES) {
    if (!byFile.has(r.file)) byFile.set(r.file, [])
    byFile.get(r.file)!.push(r)
  }

  for (const [file, rewrites] of byFile.entries()) {
    const fullPath = resolve(BATCH_DIR, file)
    const data = JSON.parse(readFileSync(fullPath, 'utf8'))

    // Sort rewrites in reverse order of paragraph index within parent, so
    // earlier inserts don't shift later index targets. Since each rewrite is
    // a 1-for-1 replacement of an existing paragraph (not a multi-paragraph
    // insert), order doesn't actually matter. But still apply most-nested
    // last just in case.
    for (const r of rewrites) {
      const loc = navigate(data.body, r.path)
      if (!loc) {
        console.error(`[FAIL] ${file} :: ${r.path} :: navigate failed`)
        failed++
        continue
      }
      const targetType = loc.node?.type ?? 'paragraph'
      loc.parent[loc.index] = {
        type: targetType,
        content: [{ type: 'text', text: r.newText }],
      }
      console.log(`[OK]   ${file} :: ${r.path}`)
      applied++
    }

    writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    filesTouched.add(file)
  }

  console.log(`\n[done] ${applied} rewrites applied, ${failed} failed, ${filesTouched.size} files written`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
