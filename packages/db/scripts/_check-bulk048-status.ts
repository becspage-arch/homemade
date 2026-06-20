import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const slugs = [
    'slow-cooker-beef-cheeks-red-wine','slow-cooker-beef-goulash','slow-cooker-beef-and-barley-stew',
    'slow-cooker-pork-ribs-bbq','slow-cooker-char-siu-pork','slow-cooker-lamb-hotpot',
    'slow-cooker-chicken-korma','slow-cooker-chicken-jalfrezi','slow-cooker-three-bean-chilli',
    'slow-cooker-turkey-chilli','slow-cooker-ham-in-cider','slow-cooker-lamb-kleftiko',
    'slow-cooker-chicken-thighs-tomato','slow-cooker-creamy-garlic-chicken','slow-cooker-lemon-chicken',
    'slow-cooker-chicken-fajitas','slow-cooker-chicken-tacos','slow-cooker-chicken-noodle-soup',
    'slow-cooker-chicken-stew-dumplings','slow-cooker-mushroom-bourguignon',
    'slow-cooker-split-pea-soup','slow-cooker-lentil-bacon-soup','slow-cooker-baked-beans',
    'slow-cooker-boston-baked-beans','slow-cooker-overnight-porridge','slow-cooker-chicken-cassoulet',
    'slow-cooker-white-chicken-chilli','slow-cooker-mashed-potatoes','slow-cooker-shredded-beef-tacos',
    'slow-cooker-smoky-sausage-stew','slow-cooker-ragu-bianco','slow-cooker-pork-and-bean-stew',
    'slow-cooker-french-onion-soup','slow-cooker-beef-and-onion-casserole',
    'slow-cooker-meatballs-tomato','slow-cooker-swedish-meatballs','slow-cooker-pork-loin-apple-cider',
    'slow-cooker-turkey-meatballs','slow-cooker-chicken-italian-peppers','slow-cooker-harissa-chickpeas'
  ]
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true, qcBlockReason: true },
    orderBy: { slug: 'asc' }
  })
  const byStatus: Record<string, string[]> = {}
  for (const r of rows) {
    if (!byStatus[r.status]) byStatus[r.status] = []
    byStatus[r.status].push(r.slug)
  }
  console.log('STATUS_COUNTS:' + JSON.stringify(Object.fromEntries(
    Object.entries(byStatus).map(([k, v]) => [k, v.length])
  )))
  const notPublished = rows.filter(r => r.status !== 'PUBLISHED')
  if (notPublished.length > 0) {
    console.log('NOT_PUBLISHED:' + JSON.stringify(notPublished.map(r => ({ slug: r.slug, status: r.status, reason: r.qcBlockReason?.slice(0, 80) }))))
  }
  console.log('PUBLISHED_COUNT:' + rows.filter(r => r.status === 'PUBLISHED').length)
  console.log('TOTAL_IN_DB:' + rows.length)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
