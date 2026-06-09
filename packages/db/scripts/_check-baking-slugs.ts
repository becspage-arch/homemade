import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

const slugsToCheck = [
  'cornbread-american', 'milk-loaf-japanese-shokupan', 'brioche-a-tete',
  'bagels-plain', 'english-muffins', 'rye-crispbread-swedish',
  'potato-farls-irish', 'spelt-sourdough-loaf', 'tiger-bread-roll',
  'pumpernickel', 'madeira-cake', 'lemon-drizzle-traybake',
  'simnel-cake', 'seed-cake', 'parkin', 'dundee-cake', 'swiss-roll',
  'cannoli-siciliani', 'churros-traditional', 'pain-au-chocolat',
  'kourambiedes', 'rugelach-cream-cheese', 'borek-cheese-spinach',
  'choux-buns', 'cream-horns', 'anzac-biscuits', 'tuiles-almond',
  'viennese-whirls', 'biscotti-almond-cranberry', 'amaretti-morbidi',
  'lace-biscuits-oat', 'banoffee-pie', 'pork-pie-traditional',
  'egg-custard-tart', 'blueberry-pie-american', 'frangipane-pear-tart',
  'cheese-and-chive-scones', 'cream-scones-devonshire',
  'nougat-italian-soft', 'praline-almond-french',
  'butter-toffee-pulled', 'barley-sugar-boiled'
]

async function main() {
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugsToCheck }, categoryId: 'cmp6k8pfp0000rgv4kpfgse4e' },
    select: { slug: true, status: true }
  })
  const existingSlugs = new Set(existing.map(t => t.slug))
  const available = slugsToCheck.filter(s => !existingSlugs.has(s))
  console.log('EXISTING:', JSON.stringify(existing.map(t => t.slug)))
  console.log('AVAILABLE_COUNT:', available.length)
  console.log('AVAILABLE:', JSON.stringify(available))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
