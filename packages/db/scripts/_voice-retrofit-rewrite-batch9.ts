/**
 * Targeted text rewrites for batch9 violations. For each (file, oldText, newText)
 * tuple we walk the body JSON and replace the first matching text leaf whose
 * text exactly equals oldText. Preserves the parent paragraph/node structure
 * and the "type": "text" field.
 *
 * If a match is not found, the entry is logged and the script continues.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Rewrite {
  file: string
  oldText: string
  newText: string
}

const BATCH_ID = '2026-05-28-batch9'

const REWRITES: Rewrite[] = [
  // melitzanosalata troubleshooter fix
  {
    file: 'melitzanosalata.json',
    oldText:
      'Continue charring until the aubergine feels completely soft and collapsed when pressed, a partially firm aubergine is undercooked',
    newText:
      'Char until the aubergine feels soft and collapsed when pressed. A firm aubergine is undercooked.',
  },
  // melitzanosalata paragraph[13]
  {
    file: 'melitzanosalata.json',
    oldText:
      'Melitzanosalata is the summer companion to tzatziki and taramasalata, always on the same mezze table, always eaten with the same pitta. The dish is closely related to the Middle Eastern baba ganoush and the Romanian zacuscă, and all three use the same core technique of open-fire charring. Greek versions tend to be simpler than the Levantine ones, avoiding tahini or cumin, letting the smoke and olive oil carry the flavour.',
    newText:
      'Melitzanosalata is the summer companion to tzatziki and taramasalata. It sits on the same mezze table and is eaten with the same pitta. The dish is a close cousin of the Middle Eastern baba ganoush and the Romanian zacuscă. All three char the aubergine over an open flame. Greek versions are simpler than the Levantine ones. No tahini, no cumin. The smoke and olive oil carry the flavour.',
  },

  // menemen paragraph[13]
  {
    file: 'menemen.json',
    oldText:
      'Menemen is the default Turkish breakfast dish, eaten in homes, cafes, and lokanta restaurants from Istanbul to the Aegean coast. It is named after the town of Menemen near Izmir, where the combination of tomatoes, peppers, and eggs is thought to have been codified. The dish arrived in Britain through Turkish restaurants and the broader spread of Middle Eastern cooking, and is now made in home kitchens as a quick weekday breakfast. The pul biber finish is optional but traditional, the mild, fruity heat of Turkish chilli flakes lifts the egg and tomato without overpowering them.',
    newText:
      'Menemen is the default Turkish breakfast dish. People eat it in homes, cafes, and lokanta restaurants from Istanbul to the Aegean coast. It takes its name from the town of Menemen near Izmir. The town is where the mix of tomatoes, peppers, and eggs was first written down. The dish came to Britain through Turkish restaurants and the wider spread of Middle Eastern cooking. It is now made at home as a quick weekday breakfast. The pul biber finish is optional but traditional. The mild, fruity heat of Turkish chilli flakes lifts the egg and tomato without overpowering them.',
  },

  // merluza paragraph[11]
  {
    file: 'merluza-en-salsa-verde.json',
    oldText:
      'Merluza en salsa verde is the flagship dish of Basque cooking, simple in ingredients, demanding in technique, and entirely distinctive. The Basque Country has the highest density of Michelin-starred restaurants in the world and a culinary culture that prizes technique over complexity, and this dish illustrates both: six ingredients, one pan, and the swirling of the pan as the cooking technique. Hake (merluza) was the common fish of the Basque fishing fleets that worked the waters of the Bay of Biscay and the Atlantic; the clams came from the estuaries of the Basque rivers. The dish is what you cook when the fish is very fresh and you want nothing to get in the way of it.',
    newText:
      'Merluza en salsa verde is the flagship dish of Basque cooking. The ingredients are simple. The technique is demanding. The dish is fully its own thing. The Basque Country has the highest count of Michelin-starred restaurants in the world. Its food culture prizes technique over fuss. This dish shows both. Six ingredients, one pan, and the swirl of the pan as the cooking move. Hake was the common fish of the Basque fishing fleets in the Bay of Biscay and the Atlantic. The clams came from the river estuaries. You cook this dish when the fish is very fresh and you want nothing to get in the way.',
  },

  // migas paragraph[11]
  {
    file: 'migas-extremenas.json',
    oldText:
      'Migas is the winter food of Extremadura, the large and relatively poor western region of Spain bordering Portugal, and a dish that has crossed over from peasant sustenance to regional pride. Extremadura produces pimentón de la Vera (the smoked paprika made from peppers dried over oak fires in the La Vera valley) which is the spice that gives the dish its character, and jamón ibérico from the black Iberian pigs that graze on acorns in the dehesa. Migas extremeñas uses both: a dish made entirely from the products of one landscape. It is still cooked by shepherds and farmworkers in the campo for lunch, and is now served in restaurants in Cáceres and Badajoz as a statement of regional identity.',
    newText:
      'Migas is the winter food of Extremadura. Extremadura is the large western region of Spain on the Portuguese border. The region is relatively poor. The dish has crossed over from peasant food to regional pride. Extremadura makes pimentón de la Vera. This is the smoked paprika made from peppers dried over oak fires in the La Vera valley. It is the spice that gives the dish its flavour. The region also makes jamón ibérico, from the black Iberian pigs that graze on acorns in the dehesa. Migas extremeñas uses both. A dish made from the food of one landscape. Shepherds and farmworkers still cook it for lunch in the campo. It is also served in restaurants in Cáceres and Badajoz as a marker of regional pride.',
  },

  // mini-chocolate-mud-cakes step
  {
    file: 'mini-chocolate-mud-cakes-with-salted-caramel-chocolate-icing.json',
    oldText:
      'Bake on the middle shelf of your preheated oven for about 15 minutes until well risen and a wooden skewer inserted into the middle of the cakes comes out clean.',
    newText:
      'Bake on the middle shelf of the hot oven for about 15 minutes. The cakes should be well risen. Test with a wooden skewer in the middle of one cake. It should come out clean.',
  },

  // mini-coffee-walnut-cakes step
  {
    file: 'mini-coffee-walnut-cakes.json',
    oldText:
      'Bake on the middle shelf of your preheated oven for about 15 minutes until golden, well risen and a wooden skewer inserted into the middle of the cakes comes out clean.',
    newText:
      'Bake on the middle shelf of the hot oven for about 15 minutes. The cakes should be golden and well risen. Test with a wooden skewer in the middle of one cake. It should come out clean.',
  },

  // mini-victoria-sponge-cakes step
  {
    file: 'mini-victoria-sponge-cakes.json',
    oldText:
      'Bake on the middle shelf of your preheated oven for about 15 minutes until golden, well risen and a wooden skewer inserted into the middle of the cakes comes out clean.',
    newText:
      'Bake on the middle shelf of the hot oven for about 15 minutes. The cakes should be golden and well risen. Test with a wooden skewer in the middle of one cake. It should come out clean.',
  },

  // the-mid-life-spiritual-reset paragraph[5]
  {
    file: 'the-mid-life-spiritual-reset.json',
    oldText:
      'The religious educator James Fowler described adult faith development as moving through stages, from received belief (faith held because it was given) toward examined faith (belief held because it has survived your own scrutiny). The transition between these stages is often experienced as loss rather than growth, because what is being lost is familiar, and what comes next has no guaranteed form.',
    newText:
      "The religious educator James Fowler wrote about adult faith in stages. The move is from received belief, which is faith you hold because it was given to you, toward examined faith, which is belief that has survived your own questions. The shift often feels like loss rather than growth. What is going is familiar. What comes next has no fixed shape yet.",
  },
  // the-mid-life-spiritual-reset paragraph[14] (also has year-in-body)
  {
    file: 'the-mid-life-spiritual-reset.json',
    oldText:
      "Written for homemade.education, drawing on Carl Jung's work on individuation and the second half of life, James Hollis's Finding Meaning in the Second Half of Life (2005), and James Fowler's stages of faith development.",
    newText:
      "Written for homemade.education. Draws on Carl Jung's work on individuation and the second half of life. Also draws on James Hollis's Finding Meaning in the Second Half of Life, and on James Fowler's stages of faith development.",
  },

  // the-mistake-letter-ritual paragraph[20]
  {
    file: 'the-mistake-letter-ritual.json',
    oldText:
      'Adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), where releasing shame around past financial decisions is the focus. Compassionate letter-writing as a self-inquiry tool is documented across cognitive-behavioural and narrative therapy traditions; the ceremonial release element is a public-domain ritual form. The five-part ritual structure is from The Money Journal (Rebecca J Page, 2025).',
    newText:
      'Adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The focus of the day is releasing shame around past money choices. Compassionate letter-writing as a tool of self-inquiry runs across cognitive-behavioural and narrative therapy traditions. The ceremonial release element is a public-domain ritual form. The five-part ritual structure is from The Money Journal (Rebecca J Page, 2025).',
  },

  // the-money-flowing-through-me-for-good-visualisation paragraph[8]
  {
    file: 'the-money-flowing-through-me-for-good-visualisation.json',
    oldText:
      'Original to homemade.education. Flow-based visualisation appears across therapeutic and coaching traditions, no single lineage is claimed.',
    newText:
      'Original to homemade.education. Flow-based work shows up in many therapy and coaching traditions. No single source is claimed.',
  },

  // the-money-zone-method paragraph[11]
  {
    file: 'the-money-zone-method-what-it-is-and-how-it-works.json',
    oldText:
      'The energy statements, rituals, and release exercises throughout this library are built on this two-step shape. The specific wording matters, especially the repetition in threes and the present-tense construction.',
    newText:
      'The energy statements, rituals, and release exercises in this library are built on this two-step shape. The wording matters. Repetition in threes matters. So does the present-tense form.',
  },
  // the-money-zone-method paragraph[15]
  {
    file: 'the-money-zone-method-what-it-is-and-how-it-works.json',
    oldText:
      'Drawn from The Money Zone (Rebecca Page, 2024). Summarised for homemade.education as an orientation to the release-and-allow framework.',
    newText:
      'Drawn from The Money Zone (Rebecca Page, 2024). Summarised for homemade.education as a basic guide to the release-and-allow shape.',
  },

  // the-next-size-up-journal heading[13]
  {
    file: 'the-next-size-up-journal.json',
    oldText: 'What ongoing community or opportunity am I grateful to grow within?',
    newText: 'Which community or chance am I grateful to grow in?',
  },

  // the-opportunity-i-almost-said-no-to-journal paragraph[5]
  {
    file: 'the-opportunity-i-almost-said-no-to-journal.json',
    oldText:
      'Write the specific opportunity and the specific hesitation, not a general pattern but that one occasion.',
    newText:
      'Write the specific opportunity and the specific hesitation. Name that one occasion, not a pattern.',
  },
]

function replaceTextLeaf(node: any, oldText: string, newText: string): { replaced: boolean } {
  if (!node || typeof node !== 'object') return { replaced: false }
  if (typeof node.text === 'string' && node.text === oldText) {
    node.text = newText
    return { replaced: true }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const r = replaceTextLeaf(child, oldText, newText)
      if (r.replaced) return r
    }
  }
  // Also handle troubleshooter items where text lives on attrs.items[i].fix/cause/symptom
  if (Array.isArray(node.attrs?.items)) {
    for (const item of node.attrs.items) {
      for (const field of ['fix', 'cause', 'symptom', 'description']) {
        if (item && typeof item[field] === 'string' && item[field] === oldText) {
          item[field] = newText
          return { replaced: true }
        }
      }
    }
  }
  // varietiesPanel intro / infoPanel body / suppliesCard heading etc., handled if needed
  for (const field of ['intro', 'body', 'heading', 'description']) {
    if (node.attrs && typeof node.attrs[field] === 'string' && node.attrs[field] === oldText) {
      node.attrs[field] = newText
      return { replaced: true }
    }
  }
  return { replaced: false }
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)

  const byFile = new Map<string, Rewrite[]>()
  for (const r of REWRITES) {
    if (!byFile.has(r.file)) byFile.set(r.file, [])
    byFile.get(r.file)!.push(r)
  }

  let appliedTotal = 0
  let missedTotal = 0
  for (const [file, rewrites] of byFile) {
    const path = resolve(batchDir, file)
    const data = JSON.parse(readFileSync(path, 'utf8'))
    let dirty = false
    for (const r of rewrites) {
      const result = replaceTextLeaf(data.body, r.oldText, r.newText)
      if (result.replaced) {
        appliedTotal++
        dirty = true
        console.log(`[OK]   ${file} — replaced "${r.oldText.slice(0, 60)}..."`)
      } else {
        missedTotal++
        console.warn(`[MISS] ${file} — could not find "${r.oldText.slice(0, 60)}..."`)
      }
    }
    if (dirty) {
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
    }
  }

  console.log(`\nDone: ${appliedTotal} rewrites applied, ${missedTotal} missed`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
