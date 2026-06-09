import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

const needed = ['S-hook','apron','bamboo-rolling-mat','blocking-board','boat-shuttle','bobbin','bowl-or-basin','bubble-wrap','card-weaving-cards','cotton-tea-towel','dressmaker-scissors','drum-carder','dye-pot-stainless','dye-thermometer','felting-needle-36-gauge','felting-needle-38-gauge','felting-needle-42-gauge','fine-mist-spray-bottle','finger-guard-felting','flicker-brush','floor-loom','foam-pad-felting','frame-embroidery-large','frame-loom','glass-jar','hand-cards','hand-combs','hessian-backing','kitchen-scale','lazy-kate','macrame-board','macrame-cord-3mm','macrame-cord-5mm','macrame-cord-8mm','macrame-mount-bar','macrame-t-pins','marker-pen','mason-jar','metal-ring-15cm','monks-cloth','mordant-alum','mordant-iron','muslin-straining-bag','niddy-noddy','pH-strips','pickup-stick','raddle','reed-hook','rigid-heddle-loom','rubber-gloves-long','rug-binding-tape','scissors','sharp-scissors','shed-stick','spinning-wheel','stainless-steel-bowl','stainless-steel-spoon','staple-gun-manual','stick-shuttle','swift','tape-measure-soft','tapestry-beater','tapestry-bobbins','tapestry-comb','tapestry-loom','tensioned-lazy-kate','warping-board','wide-mouth-jar','wooden-dowel-30cm']

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const found = await prisma.tool.findMany({
      where: { slug: { in: needed } },
      select: { slug: true, name: true },
    })
    const foundSet = new Set(found.map(t => t.slug))
    const missing = needed.filter(s => !foundSet.has(s))
    console.log(`Found: ${found.length} / ${needed.length}`)
    if (missing.length > 0) {
      console.log(`MISSING (${missing.length}):`, JSON.stringify(missing))
    } else {
      console.log('All tool slugs present in DB.')
    }
  } catch (e: any) {
    console.error('ERR:', e.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}
main()
