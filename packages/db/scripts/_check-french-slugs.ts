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
  'boeuf-bourguignon','pot-au-feu','blanquette-de-veau','veau-marengo',
  'steak-frites','steak-au-poivre','entrecote-a-la-bordelaise','cote-de-boeuf',
  'navarin-d-agneau','gigot-d-agneau','gigot-d-agneau-a-la-cuillere','carre-d-agneau',
  'cassoulet','coq-au-vin','coq-au-riesling','poulet-roti',
  'poulet-basquaise','poulet-a-la-moutarde','poulet-vallee-d-auge','poulet-roti-aux-40-gousses-d-ail',
  'confit-de-canard','canard-a-l-orange','canard-aux-navets','cuisse-de-canard-confit-aux-lentilles',
  'civet-de-lievre','civet-de-chevreuil','pintade-aux-choux','tournedos-rossini',
  'escargots-de-bourgogne','cuisses-de-grenouille','boudin-noir-aux-pommes','andouillette-a-la-lyonnaise',
  'tartiflette','fondue-savoyarde','raclette','croque-monsieur',
  'croque-madame','steak-au-roquefort','estouffade-de-boeuf','boudin-blanc',
]

async function main() {
  const { prisma } = await import('../src/index.js')
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: SLUGS }, status: 'PUBLISHED' },
    select: { slug: true }
  })
  const existingSlugs = existing.map(e => e.slug)
  const missing = SLUGS.filter(s => !existingSlugs.includes(s))
  console.log('ALREADY_PUBLISHED:', existingSlugs.join(', ') || 'none')
  console.log('NOT_PUBLISHED:', missing.length, 'slugs available')
  missing.forEach(s => console.log(' -', s))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
