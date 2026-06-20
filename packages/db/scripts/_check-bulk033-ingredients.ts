import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const toCheck = ['food-colouring-gel','flavour-extract','edible-lace-mix','edible-lustre-dust','petal-dust','gum-paste','fondant-block','fondant-rolled','dried-edible-rose-petals','condensed-milk-sweetened','apricot-fresh','armagnac','blueberry-jam','chestnuts-fresh','chilli-flakes-dried','cloves-ground','coconut-extract','coconut-flakes-toasted','cranberries-fresh','cream-cheese-full-fat','eggs','flaxseed-ground','mini-marshmallows','peanut-butter-smooth','pistachios-raw','prunes-agen','pumpkin-puree-tinned','semolina-coarse','sesame-seeds-white','sourdough-discard','walnut-halves']
  const found = await prisma.ingredient.findMany({where:{slug:{in:toCheck}},select:{slug:true}})
  const foundSlugs = new Set(found.map(i => i.slug))
  for (const s of toCheck) {
    if (foundSlugs.has(s)) process.stdout.write('FOUND:' + s + '\n')
    else process.stdout.write('MISS:' + s + '\n')
  }
  await prisma.$disconnect()
}

main().catch(console.error)
