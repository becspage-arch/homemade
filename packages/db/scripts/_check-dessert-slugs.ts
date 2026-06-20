import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

const slugsToCheck = [
  'double-cream', 'caster-sugar', 'golden-syrup', 'black-treacle',
  'vanilla-extract', 'vanilla-pod', 'dark-chocolate', 'milk-chocolate',
  'white-chocolate', 'cocoa-powder', 'sherry', 'cream-sherry',
  'sponge-fingers', 'ladyfingers', 'gelatine', 'gelatine-sheets',
  'agar-agar', 'raspberry-jam', 'raspberry-conserve',
  'rum', 'dark-rum', 'raisins', 'pistachio-nuts', 'pistachios',
  'whole-milk', 'full-fat-milk', 'semi-skimmed-milk',
  'eggs', 'egg-yolks', 'egg-yolk', 'egg-whites', 'egg-white',
  'suet', 'beef-suet', 'vegetable-suet',
  'currants', 'sultanas', 'mixed-peel',
  'breadcrumbs', 'white-breadcrumbs',
  'marmalade', 'orange-marmalade',
  'self-raising-flour', 'plain-flour', 'butter',
  'baking-powder', 'bicarbonate-of-soda',
  'icing-sugar', 'muscovado-sugar',
  'mascarpone', 'cream-cheese', 'ricotta',
  'espresso', 'instant-coffee', 'coffee-liqueur',
  'milk', 'oat-milk', 'coconut-milk', 'coconut-cream',
  'mango', 'raspberries', 'strawberries', 'blackberries',
  'pears', 'peaches',
  'elderflower-cordial',
  'red-wine', 'white-wine',
  'stem-ginger', 'ground-ginger',
  'mint-extract', 'peppermint-extract',
  'dark-chocolate-chips', 'chocolate-chips',
  'orange-juice', 'lemon-juice',
  'cornflour', 'arrowroot',
  'white-bread', 'brioche',
  'tapioca', 'semolina',
  'hazelnuts', 'almonds',
]

async function main() {
  for (const slug of slugsToCheck) {
    const found = await prisma.ingredient.findFirst({ where: { slug } })
    console.log(found ? `✓ ${slug}` : `✗ ${slug}`)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
