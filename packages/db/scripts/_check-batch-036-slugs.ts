import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const slugs = [
  'veau-marengo','entrecote-a-la-bordelaise','cote-de-boeuf','tournedos-rossini',
  'steak-au-roquefort','estouffade-de-boeuf','daube-de-boeuf-provencale',
  'andouillette-a-la-lyonnaise','navarin-d-agneau','gigot-d-agneau-a-la-cuillere',
  'carre-d-agneau','navarin-printanier','civet-de-lievre','civet-de-chevreuil',
  'poulet-roti-aux-40-gousses-d-ail','coq-au-riesling','poulet-vallee-d-auge',
  'canard-a-l-orange','canard-aux-navets','cuisse-de-canard-confit-aux-lentilles',
  'pintade-aux-choux','escargots-de-bourgogne','cuisses-de-grenouille',
  'oeufs-en-meurette','boudin-noir-aux-pommes','boudin-blanc','fondue-savoyarde',
  'raclette','endives-au-jambon','brandade-de-morue','aile-de-raie-au-beurre-noir',
  'sole-bonne-femme','soupe-de-poisson','salade-lyonnaise','omelette-aux-fines-herbes',
  'rillettes-de-porc','pate-de-campagne','pommes-anna','gratin-de-poireaux',
  'quiche-aux-poireaux'
]

async function main() {
  const { prisma } = await import('../src/index.js')
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true },
  })
  console.log('EXISTING:', JSON.stringify(existing))
  console.log('COUNT:', existing.length)
  await prisma.$disconnect()
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
