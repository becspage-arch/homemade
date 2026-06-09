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

const missing = ['S-hook','blocking-board','bobbin','bowl-or-basin','bubble-wrap','card-weaving-cards','cotton-tea-towel','dressmaker-scissors','felting-needle-36-gauge','felting-needle-38-gauge','felting-needle-42-gauge','fine-mist-spray-bottle','finger-guard-felting','flicker-brush','floor-loom','foam-pad-felting','frame-embroidery-large','glass-jar','hand-combs','hessian-backing','kitchen-scale','lazy-kate','macrame-cord-3mm','macrame-cord-5mm','macrame-cord-8mm','macrame-mount-bar','marker-pen','mason-jar','metal-ring-15cm','muslin-straining-bag','pH-strips','pickup-stick','rubber-gloves-long','scissors','sharp-scissors','shed-stick','spinning-wheel','stainless-steel-bowl','stainless-steel-spoon','tape-measure-soft','tapestry-beater','tapestry-loom','tensioned-lazy-kate','wide-mouth-jar','wooden-dowel-30cm']

async function main() {
  const { prisma } = await import('../src/index.js')
  const all = await prisma.tool.findMany({ select: { slug: true, name: true } })
  const slugs = new Set(all.map((t: any) => t.slug))
  
  for (const m of missing) {
    if (slugs.has(m)) { console.log(`FOUND: ${m}`); continue }
    const parts = m.split('-').filter((p: string) => p.length > 3)
    const candidates = all.filter((t: any) => 
      parts.some((p: string) => t.slug.includes(p) || t.name.toLowerCase().includes(p))
    ).map((t: any) => t.slug).slice(0, 3)
    console.log(`MISSING: ${m}${candidates.length ? ' ~ ' + candidates.join(', ') : ''}`)
  }
  await prisma.$disconnect()
}
main()
