import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
const slugsToCheck = [
  "spaghetti-alle-cozze", "spaghetti-al-limone", "spaghetti-al-tonno",
  "linguine-al-pesto", "bucatini-allamatriciana", "fettuccine-alfredo",
  "pici-cacio-e-pepe", "orecchiette-con-cime-di-rapa",
  "singin-hinnies", "pikelets", "fat-rascals", "bakewell-pudding",
  "maids-of-honour", "soda-farls", "cottage-pie-jacket-potato",
  "brown-soda-bread", "clootie-dumpling", "rumbledethumps"
]
async function main() {
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugsToCheck } },
    select: { slug: true, status: true }
  })
  const existingSlugs = new Set(existing.map((t: any) => t.slug))
  const available = slugsToCheck.filter((s: string) => !existingSlugs.has(s))
  console.log('AVAILABLE:', JSON.stringify(available))
  await prisma.$disconnect()
}
main().catch((e: Error) => { console.error(e.message); process.exit(1) })
