import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  console.log('TOOLS related to fibre arts:')
  const tools = await prisma.tool.findMany({
    where: { OR: [
      { slug: { contains: 'needle' } }, { slug: { contains: 'hook' } },
      { slug: { contains: 'hoop' } }, { slug: { contains: 'yarn' } },
      { slug: { contains: 'scissor' } }, { slug: { contains: 'aida' } },
      { slug: { contains: 'embroidery' } }, { slug: { contains: 'tapestry' } },
      { slug: { contains: 'thread' } }, { slug: { contains: 'cotton' } },
      { slug: { contains: 'thimble' } }, { slug: { contains: 'pin' } },
    ] },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  for (const t of tools) console.log(`  ${t.slug.padEnd(40)} ${t.name}`)

  console.log('\nSTITCH slugs (knitting+crochet):')
  const stitches = await prisma.stitch.findMany({
    select: { slug: true, canonicalName: true, craft: true, category: true },
    orderBy: [{ craft: 'asc' }, { slug: 'asc' }],
  })
  for (const s of stitches) console.log(`  [${s.craft}/${s.category}] ${s.slug.padEnd(35)} ${s.canonicalName}`)

  console.log('\nCrochetHook slugs:')
  const hooks = await prisma.crochetHook.findMany({ select: { slug: true, canonicalName: true } })
  for (const h of hooks) console.log(`  ${h.slug.padEnd(25)} ${h.canonicalName}`)

  console.log('\nKnittingNeedle slugs:')
  const needles = await prisma.knittingNeedle.findMany({ select: { slug: true, canonicalName: true } })
  for (const n of needles) console.log(`  ${n.slug.padEnd(25)} ${n.canonicalName}`)

  console.log('\nYarnWeight slugs:')
  const yws = await prisma.yarnWeight.findMany({ select: { slug: true, canonicalName: true } })
  for (const y of yws) console.log(`  ${y.slug.padEnd(25)} ${y.canonicalName}`)

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
