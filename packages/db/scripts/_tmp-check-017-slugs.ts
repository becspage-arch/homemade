import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

const slugs = ['adas-polo','arroz-caldoso-marisco','ash-e-reshteh','baghali-polo','baklava','bamia','bifteki','boeuf-en-daube','cacio-e-pepe','canard-aux-cerises','carbonnade-flamande','choucroute-garnie','coquilles-saint-jacques','cordero-al-chilindron','espinacas-con-garbanzos','falafel','fatayer-spinach','fattoush','fesenjan','ful-medames','ghormeh-sabzi','green-shakshuka','grilled-octopus-greek','gyros-pork','harira','huevos-a-la-flamenca','hummus','joojeh-kabab','kabab-koobideh','kafta-bil-sanieh','kakavia','khoresh-bademjan','kibbeh','koshari','kuku-sabzi','labneh','lahmacun','lamb-fricassee-greek','lapin-a-la-moutarde','magret-de-canard','manakish-zaatar','maqluba','mast-o-khiar','merluza-en-salsa-verde','migas-extremenas','mirza-ghasemi','moules-a-la-creme','muhammara','mujadara','musakhan','mutabal','ossobuco-alla-milanese','pasta-e-fagioli','pinchitos-morunos','pollo-alla-cacciatore','pollo-en-pepitoria','poule-au-pot','poulet-a-la-creme','poulet-a-lestragon','poulet-chasseur','ribollita','risotto-ai-funghi','salad-shirazi','saltimbocca-alla-romana','shakshuka','shawarma-chicken','shish-taouk','shorbat-adas','sopa-de-ajo','souvlaki-chicken','souvlaki-lamb','souvlaki-pork','steak-tartare','stuffed-vine-leaves','tabbouleh','tahdig','tiropita','truite-aux-amandes','whole-grilled-bream-greek','zereshk-polo']

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const existing = await prisma.tutorial.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, status: true },
    })
    console.log('EXISTING_COUNT:' + existing.length)
    console.log('EXISTING:' + JSON.stringify(existing.map(t => ({ slug: t.slug, status: t.status }))))
    const existingSlugs = new Set(existing.map(t => t.slug))
    const missing = slugs.filter(s => !existingSlugs.has(s))
    console.log('MISSING_COUNT:' + missing.length)
    console.log('MISSING:' + JSON.stringify(missing))
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.log('ERROR:' + e); process.exit(1) })
