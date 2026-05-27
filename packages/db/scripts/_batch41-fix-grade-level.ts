/**
 * Apply targeted text replacements to lower grade-level violations on
 * batch41 recipe bodies. Splits long enumeration sentences into shorter
 * ones, removes a safety-block infoPanel (nougat).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Fix {
  slug: string
  // For text replacement in a specific paragraph text leaf:
  textOld?: string
  textNew?: string
  // For dropping a block by index (used for safety panel):
  dropBlockIndex?: number
}

const FIXES: Fix[] = [
  // fried-chicken orderedList[8][0] grade 16.4 → split into 3 short sentences.
  {
    slug: 'fried-chicken',
    textOld:
      'Combine the {{plain-flour}}, {{cornflour}}, {{paprika-smoked}}, coating {{garlic-powder}}, {{onion-powder}}, coating {{cayenne}}, coating {{black-pepper}}, and coating {{sea-salt-fine}} in a wide shallow bowl.',
    textNew:
      'Set up a wide shallow bowl. Tip in the {{plain-flour}}, {{cornflour}}, {{paprika-smoked}}, coating {{garlic-powder}}, {{onion-powder}}, coating {{cayenne}}, coating {{black-pepper}}, and coating {{sea-salt-fine}}. Whisk to mix.',
  },
  // fried-chicken para[13] grade 13.5 → split + shorten.
  {
    slug: 'fried-chicken',
    textOld:
      'Fried chicken is one of the defining dishes of the American South, with origins in the cooking traditions of both Scottish and West African settlers in the colonial period. A tradition of frying in fat met a tradition of seasoning with chilli and spice, and the dish that emerged was carried into wider American cooking from the 19th century onwards.',
    textNew:
      'Fried chicken is one of the defining dishes of the American South. It draws on two cooking traditions that met in the colonial period: Scottish frying in fat, and West African seasoning with chilli and spice. The dish moved into wider American cooking from the 19th century onwards.',
  },
  // fried-green-tomatoes orderedList[6][0] grade 21.0 → split into 4 short sentences.
  {
    slug: 'fried-green-tomatoes',
    textOld:
      'Set up three bowls: one with the {{plain-flour}} of plain flour seasoned with salt and pepper; one with the {{buttermilk}} beaten with the {{eggs}} egg; and one with the {{polenta}} of fine polenta mixed with the {{paprika-smoked}} of smoked paprika, a pinch of {{cayenne}}, {{sea-salt-fine}} of salt, and {{black-pepper}} of black pepper.',
    textNew:
      'Set up three bowls. Put the {{plain-flour}} of plain flour in the first; season with salt and pepper. Beat the {{buttermilk}} with the {{eggs}} egg in the second. In the third, mix the {{polenta}} of fine polenta with the {{paprika-smoked}} of smoked paprika, a pinch of {{cayenne}}, {{sea-salt-fine}} of salt, and {{black-pepper}} of black pepper.',
  },
  // fried-green-tomatoes trouble[11][0] fix grade 12.8 → split.
  {
    slug: 'fried-green-tomatoes',
    textOld:
      'Press the polenta coating firmly onto the tomato after the buttermilk dip; the oil should sizzle immediately when a slice goes in',
    textNew:
      'Press the polenta coating firmly onto the tomato after the buttermilk dip. The oil should sizzle straight away when a slice goes in.',
  },
  // no-bake-vanilla-cheesecake orderedList[5][0] grade 17.0 → split into 3.
  {
    slug: 'no-bake-vanilla-cheesecake',
    textOld:
      'Mix the {{rolled-oats}}, melted {{unsalted-butter}}, {{golden-syrup}}, and {{demerara-sugar}} together until the oats are evenly coated.',
    textNew:
      'Tip the {{rolled-oats}} into a bowl. Add the melted {{unsalted-butter}}, the {{golden-syrup}}, and the {{demerara-sugar}}. Stir until the oats are evenly coated.',
  },
  // nougat-soft-honey orderedList[10][0] grade 13.4 → split.
  {
    slug: 'nougat-soft-honey',
    textOld:
      'Combine the remaining 300 g of {{caster-sugar}}, {{glucose-syrup}}, and {{water}} in a medium saucepan and cook to 145°C without stirring once boiling.',
    textNew:
      'Tip the remaining 300 g of {{caster-sugar}}, {{glucose-syrup}}, and {{water}} into a medium saucepan. Cook to 145°C. Do not stir once it boils.',
  },
  // french-toast orderedList[6][0] grade 12.5 → split.
  {
    slug: 'french-toast',
    textOld:
      'Whisk together the {{eggs}}, {{whole-milk}} of milk, {{cinnamon-ground}} of ground cinnamon, {{caster-sugar}} of sugar, and a pinch of salt in a wide, shallow bowl.',
    textNew:
      'Crack the {{eggs}} into a wide, shallow bowl and whisk. Add the {{whole-milk}} of milk, {{cinnamon-ground}} of ground cinnamon, {{caster-sugar}} of sugar, and a pinch of salt. Whisk again to combine.',
  },
  // french-toast trouble[9][3] fix grade 12.2 → split.
  {
    slug: 'french-toast',
    textOld:
      'Taste the custard before soaking; it should taste perceptibly of cinnamon, adjust accordingly',
    textNew:
      'Taste the custard before soaking. It should taste clearly of cinnamon. Add more if it does not.',
  },
  // oat-flapjacks orderedList[5][1] grade 12.4 → split.
  {
    slug: 'oat-flapjacks',
    textOld:
      'Melt the {{unsalted-butter}}, {{light-muscovado-sugar}}, {{golden-syrup}}, and {{sea-salt-fine}} together in a medium saucepan over low heat, stirring until the butter is melted and the sugar has dissolved. Do not boil.',
    textNew:
      'Put the {{unsalted-butter}}, {{light-muscovado-sugar}}, {{golden-syrup}}, and {{sea-salt-fine}} in a medium saucepan. Melt over low heat, stirring until the butter has melted and the sugar has dissolved. Do not boil.',
  },
  // olive-oil-cake-italian orderedList[5][2] grade 12.7 → split.
  {
    slug: 'olive-oil-cake-italian',
    textOld:
      'Whisk in the {{extra-virgin-olive-oil}}, {{whole-milk}}, {{vanilla-extract}}, and the zest from both {{orange}}s.',
    textNew:
      'Pour in the {{extra-virgin-olive-oil}} and whisk to combine. Add the {{whole-milk}}, the {{vanilla-extract}}, and the zest from both {{orange}}s. Whisk again.',
  },
  // panforte-siena orderedList[7][0] grade 12.4 → split.
  {
    slug: 'panforte-siena',
    textOld:
      'Melt the {{honey}} and {{caster-sugar}} together in a small saucepan over medium heat, stirring until the sugar dissolves.',
    textNew:
      'Put the {{honey}} and {{caster-sugar}} in a small saucepan. Melt over medium heat. Stir until the sugar dissolves.',
  },
  // foul-medames trouble[14][2] fix grade 14.4 → split.
  {
    slug: 'foul-medames',
    textOld:
      'If the cumin tastes raw, toast it for thirty seconds in a dry pan before grinding fresh, or warm it in a tablespoon of the oil over a low flame for a minute before adding to the beans.',
    textNew:
      'If the cumin tastes raw, toast it for thirty seconds in a dry pan before grinding fresh. Or warm it in a tablespoon of the oil over a low flame for a minute before adding to the beans.',
  },
  // french-lentil-soup para[13] grade 12.7 → split + simplify.
  {
    slug: 'french-lentil-soup',
    textOld:
      'Potage de lentilles is a workhorse of French home cooking, particularly in the Auvergne where Puy lentils are grown. The lentils are earthy and peppery with a naturally firm texture that holds up to long cooking. The French preparation tends to be plainer than other European lentil soups, leaning on the natural flavour of the lentil and a hit of vinegar at the end.',
    textNew:
      'Potage de lentilles is a workhorse of French home cooking, especially in the Auvergne where Puy lentils grow. The lentils are earthy and peppery. Their firm texture holds up to long cooking. The French version is plainer than other European lentil soups. It leans on the lentil itself and a hit of vinegar at the end.',
  },
  // french-toast-casserole para[15] grade 12.8 → split.
  {
    slug: 'french-toast-casserole',
    textOld:
      'French toast casserole is a North American brunch dish, popular for holidays and family gatherings where you want something impressive that does not require standing at the stove in the morning. It takes the logic of pain perdu (using up stale bread in an egg custard) and scales it to feed a table.',
    textNew:
      'French toast casserole is a North American brunch dish. It is popular for holidays and family gatherings, where you want something good without standing at the stove all morning. It takes the idea of pain perdu (using stale bread in an egg custard) and scales it up to feed a table.',
  },
  // nougat-soft-honey infoPanel[1] safety block — 57 words → drop the block entirely.
  // The cooking-temperature note already lives inside the relevant step.
  { slug: 'nougat-soft-honey', dropBlockIndex: 1 },
]

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch41')

  // Group fixes by slug.
  const bySlug: Record<string, Fix[]> = {}
  for (const f of FIXES) {
    bySlug[f.slug] = bySlug[f.slug] ?? []
    bySlug[f.slug].push(f)
  }

  for (const [slug, fixes] of Object.entries(bySlug)) {
    const path = resolve(batchDir, `${slug}.json`)
    let raw = readFileSync(path, 'utf8')
    let parsed: any = JSON.parse(raw)

    // First apply any block drops (indexes shift after drop, so handle in
    // reverse-index order).
    const drops = fixes.filter(f => typeof f.dropBlockIndex === 'number').sort((a, b) => b.dropBlockIndex! - a.dropBlockIndex!)
    for (const d of drops) {
      const removed = parsed.body.content.splice(d.dropBlockIndex!, 1)[0]
      console.log(`[OK]   ${slug} — dropped block[${d.dropBlockIndex}] (${removed?.type})`)
    }
    raw = JSON.stringify(parsed, null, 2) + '\n'

    // Then apply text replacements. Walk the JSON string with simple
    // JSON-escaped replacement (text fields are within JSON strings).
    for (const f of fixes) {
      if (typeof f.textOld !== 'string' || typeof f.textNew !== 'string') continue
      const escOld = JSON.stringify(f.textOld).slice(1, -1)
      const escNew = JSON.stringify(f.textNew).slice(1, -1)
      if (!raw.includes(escOld)) {
        console.log(`[MISS] ${slug} — text not found: "${f.textOld.slice(0, 50)}…"`)
        continue
      }
      raw = raw.replace(escOld, escNew)
      console.log(`[OK]   ${slug} — replaced "${f.textOld.slice(0, 60)}…"`)
    }
    writeFileSync(path, raw, 'utf8')
  }
}

main()
