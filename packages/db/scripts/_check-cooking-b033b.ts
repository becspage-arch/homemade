import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
const slugsToCheck = [
  "brown-stew", "chicken-casserole-with-cider-and-tarragon",
  "cullen-skink", "cock-a-leekie", "welsh-cawl", "oxtail-stew",
  "boiled-bacon-and-cabbage", "gammon-with-parsley-sauce", "gammon-with-pineapple",
  "potted-crab", "dressed-crab",
  "yorkshire-parkin", "eccles-cakes", "bakewell-tart", "welsh-cakes",
  "bara-brith", "glamorgan-sausages", "cranachan", "drop-scones",
  "stovies", "colcannon", "champ", "boxty", "scottish-tablet",
  "spaghetti-bolognese", "cheesy-pasta-bake", "tuna-pasta-bake",
  "jacket-potato-with-cheese-and-beans", "jacket-potato-with-tuna-mayo-and-sweetcorn",
  "jacket-potato-with-chilli-con-carne", "jacket-potato-with-prawn-and-marie-rose",
  "cauliflower-mac-and-cheese", "beans-on-toast", "beans-on-toast-with-cheese",
  "egg-and-chips", "sausage-sandwich", "bacon-sandwich", "bacon-and-egg-sandwich",
  "fish-finger-sandwich", "chip-butty", "crisp-sandwich",
  "sausage-and-chips", "pie-and-chips", "pie-and-mash-with-liquor",
  "chip-shop-curry-sauce", "battered-sausage",
  "cucumber-sandwich", "egg-mayo-and-cress-sandwich",
  "smoked-salmon-sandwich", "devilled-ham-sandwich",
  "spaghetti-alle-vongole", "spaghetti-carbonara", "spaghetti-cacio-e-pepe",
  "spaghetti-aglio-olio-e-peperoncino", "spaghetti-alla-puttanesca",
  "spaghetti-alla-norma", "spaghetti-al-pomodoro",
  "penne-allarrabbiata", "tagliatelle-al-ragu-bolognese",
  "risotto-alla-milanese", "risotto-ai-funghi", "risotto-nero"
]
async function main() {
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugsToCheck } },
    select: { slug: true, status: true }
  })
  const existingSlugs = new Set(existing.map((t: any) => t.slug))
  const available = slugsToCheck.filter((s: string) => !existingSlugs.has(s))
  console.log('EXISTING_COUNT:', existing.length)
  console.log('EXISTING:', JSON.stringify([...existingSlugs].sort()))
  console.log('AVAILABLE_COUNT:', available.length)
  console.log('AVAILABLE:', JSON.stringify(available))
  await prisma.$disconnect()
}
main().catch((e: Error) => { console.error(e.message); process.exit(1) })
