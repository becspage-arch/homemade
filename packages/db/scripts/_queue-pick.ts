import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const CANDIDATE_SLUGS = [
  // Remaining British roasts
  'roast-beef-rib-on-the-bone','topside-roast','roast-crown-of-lamb',
  'roast-shoulder-of-pork','roast-leg-of-pork','roast-chicken',
  'roast-poussin','roast-goose-at-christmas','brined-roast-turkey',
  'crown-of-turkey','roast-pheasant','roast-partridge','roast-grouse',
  'roast-venison-haunch','goose-fat-roast-potatoes',
  // Pies and pastry
  'steak-and-ale-pie','steak-and-kidney-pie','steak-and-kidney-pudding',
  'steak-and-mushroom-pie','chicken-and-mushroom-pie','chicken-and-leek-pie',
  'chicken-and-ham-pie','cottage-pie','shepherds-pie','fish-pie',
  'smoked-haddock-and-leek-pie','salmon-and-dill-pie','pork-pie',
  'cornish-pasty','sausage-roll','beef-wellington','salmon-en-croute',
  // Pub classics, soups, stews
  'fish-and-chips','beer-battered-haddock','bangers-and-mash',
  'welsh-rarebit','kedgeree','cullen-skink','scotch-broth','welsh-cawl',
  'lancashire-hotpot','irish-stew','beef-and-guinness-stew','oxtail-stew',
  'mulligatawny','black-pudding-hash','devilled-kidneys','liver-and-onions',
  'prawn-cocktail','corned-beef-hash','faggots','beef-and-barley-stew',
  // More British mains and casseroles
  'bubble-and-squeak','sausage-casserole','chicken-chasseur',
  'pork-chops-with-cider-and-apples','pork-and-apple-casserole',
  'coronation-chicken','smoked-haddock-chowder','scampi',
  'potted-shrimp','cock-a-leekie','gammon-with-parsley-sauce',
  'beef-and-ale-casserole','hunters-chicken','brown-windsor-soup',
  'game-pie','gala-pie','vegetarian-wellington','vegan-wellington',
  'boiled-bacon-and-cabbage','gammon-with-pineapple',
  'coronation-chicken','smoked-haddock-chowder','lamb-hotpot-with-kidneys',
  'beef-stew-with-herb-dumplings','stovies','rumbledethumps',
  'pork-chops-with-cider-and-apples','dressed-crab',
  'forfar-bridie','scotch-pie','vegetarian-sausage-roll',
  'cheese-and-onion-pasty','rabbit-pie','mutton-pie',
]

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const existing = await prisma.tutorial.findMany({
      where: { slug: { in: CANDIDATE_SLUGS } },
      select: { slug: true, status: true },
    })
    const existingSlugs = new Set(existing.map(r => r.slug))
    const newSlugs = CANDIDATE_SLUGS.filter(s => !existingSlugs.has(s))
    console.log('EXISTING (' + existing.length + '):')
    for (const r of existing) console.log('  ' + r.status + ' ' + r.slug)
    console.log('NEW (' + newSlugs.length + '):')
    for (const s of newSlugs) console.log('  ' + s)
  } catch (e: any) {
    console.error('ERR:' + e.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}
main()
