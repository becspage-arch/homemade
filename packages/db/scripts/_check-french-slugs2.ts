import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const SLUGS = [
  'bouillabaisse','moules-marinieres','sole-meuniere','quiche-lorraine',
  'ratatouille','pommes-dauphinoise','pommes-anna','salade-nicoise',
  'salade-lyonnaise','oeufs-en-meurette','omelette-aux-fines-herbes',
  'galette-de-sarrasin','pissaladiere','brandade-de-morue','aile-de-raie-au-beurre-noir',
  'rillettes-de-porc','pate-de-campagne','navarin-printanier','daube-de-boeuf-provencale',
  'gratin-de-poireaux','endives-au-jambon','soupe-de-poisson','quiche-aux-poireaux',
  'tarte-flambee','oeufs-en-cocotte','croque-provencal','celeri-remoulade',
  'fondue-bourguignonne','sole-bonne-femme','lobster-thermidor',
]

async function main() {
  const { prisma } = await import('../src/index.js')
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: SLUGS }, status: 'PUBLISHED' },
    select: { slug: true }
  })
  const existingSlugs = existing.map(e => e.slug)
  const available = SLUGS.filter(s => !existingSlugs.includes(s))
  console.log('PUBLISHED:', existingSlugs.join(', ') || 'none')
  console.log('AVAILABLE:', available.length)
  available.forEach(s => console.log(' -', s))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
