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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const needed = ["apron","bamboo-rolling-mat","blocking-mat","boat-shuttle","bobbin","bubble-wrap","craft-scissors","digital-scales","drum-carder","dye-pot-stainless","dye-thermometer","dyeing-gloves-long","felting-mat","felting-needles-36","felting-needles-38","felting-needles-40","finger-guard-felting","flicker-brush","floor-loom-4-shaft","frame-loom","hand-cards","kilner-jar","lazy-kate","macrame-board","macrame-ring","macrame-t-pins","measuring-tape-soft","metal-bowl","mixing-bowl-large","monks-cloth","mordant-alum","mordant-iron","muslin-cloth","niddy-noddy","ph-strips","raddle","reed-hook","rigid-heddle-loom","rug-binding-tape","shed-stick","spinning-wheel-castle","spray-bottle","stainless-steel-spoon","staple-gun-manual","stick-shuttle","swift","tablet-weaving-cards","tapestry-bobbins","tapestry-comb","tapestry-loom-upright","tea-towel","tensioned-lazy-kate","warping-board","weaving-pick-up-stick","wool-combs"]

async function main() {
  const { prisma } = await import('../src/index.js')
  const found = await prisma.tool.findMany({
    where: { slug: { in: needed } },
    select: { slug: true },
  })
  const foundSet = new Set(found.map((t: any) => t.slug))
  const missing = needed.filter(s => !foundSet.has(s))
  console.log(`Found: ${found.length} / ${needed.length}`)
  if (missing.length > 0) console.log(`MISSING (${missing.length}):`, JSON.stringify(missing))
  else console.log('All slugs present in DB.')
  await prisma.$disconnect()
}
main()
