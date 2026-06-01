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

const ingSlugs = ['activated-charcoal','aloe-vera-gel','apple-cider-vinegar-raw','arrowroot-powder','bayberry-wax','beef-tallow','beeswax-pellets','bicarbonate-of-soda','candle-wick-pretabbed','candle-wick-square4','castor-oil','cedar-shavings','chamomile-hydrosol','citric-acid','coconut-oil','cornflour','cosmetic-liquid-colourant','dead-sea-mud','dipropylene-glycol','distilled-water','dried-chamomile-flowers','dried-lavender-flowers','dried-rosemary','elderflower-hydrosol','emulsifying-wax-nf','essential-oil-bergamot','essential-oil-cedarwood','essential-oil-citronella','essential-oil-clary-sage','essential-oil-eucalyptus','essential-oil-frankincense','essential-oil-lavender','essential-oil-lemon','essential-oil-neroli','essential-oil-peppermint','essential-oil-pine','essential-oil-roman-chamomile','essential-oil-rose-geranium','essential-oil-rosemary','essential-oil-sandalwood','essential-oil-sweet-orange','essential-oil-tea-tree','fine-cornmeal','fragrance-oil-apple-cinnamon','fragrance-oil-bayberry','fragrance-oil-black-pepper-amber','fragrance-oil-lemon-verbena','fragrance-oil-magnolia-peony','fragrance-oil-neroli-ylang','fragrance-oil-oud','fragrance-oil-rose','fragrance-oil-sea-salt-driftwood','fragrance-oil-tobacco-vanilla','french-green-clay','hyaluronic-acid-powder','hydrogen-peroxide-3-percent','isopropyl-alcohol','jojoba-oil','kaolin-clay','kelp-powder','lavender-flower-powder','lemon-oil-mineral','liquid-castile-soap','oat-flour','olive-oil','optiphen-preservative','orange-zest-dried','rose-kaolin-clay','rosehip-oil','sea-salt','sea-salt-fine','sea-salt-flakes','shea-butter','sodium-hydroxide','sodium-percarbonate','soy-wax-container','squalane','sweet-almond-oil','turmeric-infused-oil','unflavoured-gelatin','urea-cosmetic-grade','vegetable-glycerine','vegetable-oil','vetiver-root-pieces','vitamin-e-oil','washing-soda','washing-up-liquid','wheatgerm-oil','witch-hazel-alcohol-free']

const toolSlugs = ['candle-pouring-pitcher','cream-pot-100ml','digital-scale-precision','dropper-bottle-50ml','dropper-bottle-amber','glass-beaker-100ml','glass-beaker-150ml','glass-beaker-250ml','glass-beaker-500ml','glass-beaker-50ml','glass-jar-200ml','glass-jar-250ml-sealed','glass-jar-300ml','glass-jar-30ml','glass-jar-60ml','glass-stirring-rod','ice-cube-tray-silicone','lye-pitcher-hdpe','measuring-jug','metal-tin-150ml','metal-tin-15ml','mixing-bowl-medium','mixing-bowl-small','muslin-bags-drawstring','nitrile-gloves','old-toothbrush','pillar-candle-mould-aluminium','pump-bottle-100ml','rattan-diffuser-reeds','reed-diffuser-bottle','safety-goggles','scrubbing-brush','silicone-loaf-mould','silicone-moulds-round','soap-cutter-wire','spray-bottle-100ml','spray-bottle-amber-250ml','stick-blender','thermometer-probe','wick-centring-bar','wick-rod']

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const existingIng = await prisma.ingredient.findMany({ where: { slug: { in: ingSlugs } }, select: { slug: true } })
  const existingIngSet = new Set(existingIng.map((r) => r.slug))
  const missingIng = ingSlugs.filter((s) => !existingIngSet.has(s))
  console.log('MISSING_ING:', JSON.stringify(missingIng))

  const existingTools = await prisma.tool.findMany({ where: { slug: { in: toolSlugs } }, select: { slug: true } })
  const existingToolSet = new Set(existingTools.map((r) => r.slug))
  const missingTools = toolSlugs.filter((s) => !existingToolSet.has(s))
  console.log('MISSING_TOOLS:', JSON.stringify(missingTools))

  await prisma.$disconnect()
}

main().catch((e: unknown) => { console.error(e); process.exit(1) })
