import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
const slugsToCheck = [
  "beef-and-ale-casserole", "brown-stew", "chicken-casserole-with-cider-and-tarragon",
  "chicken-chasseur", "hunters-chicken", "sausage-casserole", "lamb-hotpot-with-kidneys",
  "pork-and-apple-casserole", "brown-windsor-soup", "mulligatawny-soup",
  "beef-and-barley-stew", "pearl-barley-risotto-with-mushroom",
  "chicken-tikka-masala", "chicken-korma", "chicken-jalfrezi", "lamb-rogan-josh",
  "lamb-bhuna", "lamb-dhansak", "lamb-madras", "chicken-biryani", "lamb-biryani",
  "king-prawn-balti", "chicken-tikka", "tandoori-chicken",
  "onion-bhaji", "vegetable-samosa", "bombay-potato", "saag-aloo",
  "saag-paneer", "tarka-dhal", "chana-masala", "aloo-gobi",
  "pilau-rice", "garlic-naan", "plain-naan", "raita",
  "spaghetti-bolognese", "macaroni-cheese", "tuna-pasta-bake", "cheesy-pasta-bake",
  "lamb-vindaloo", "chicken-dopiaza", "peshwari-naan"
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
