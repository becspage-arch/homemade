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

const SLUGS = [
  'moussaka','spanakopita','pastitsio','stifado','kleftiko','tzatziki','taramasalata',
  'tirokafteri','saganaki','avgolemono-soup','greek-salad','gigantes-plaki','briam',
  'souvlaki-pork','gyros-chicken','greek-roast-lamb','lemon-potatoes','keftedes',
  'soutzoukakia','octopus-red-wine','tortilla-espanola','gazpacho-andaluz','salmorejo',
  'patatas-bravas','pan-con-tomate','gambas-al-ajillo','chorizo-al-vino-tinto',
  'chorizo-butter-bean-stew','pisto-manchego','albondigas-en-salsa','pollo-al-ajillo',
  'paella-valenciana','paella-de-marisco','paella-vegetariana','croquetas-de-jamon',
  'calamares-a-la-romana','pulpo-a-la-gallega','romesco-sauce','fabada-asturiana',
  'pimientos-de-padron'
]

async function main() {
  const { prisma } = await import('../src/index.js')
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: SLUGS } },
    select: { slug: true, status: true }
  })
  console.log(`Found: ${rows.length} / 40`)
  console.log(`PUBLISHED: ${rows.filter(r => r.status === 'PUBLISHED').length}`)
  const missing = SLUGS.filter(s => !rows.some(r => r.slug === s))
  if (missing.length > 0) console.log('Missing:', missing.join(', '))
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
