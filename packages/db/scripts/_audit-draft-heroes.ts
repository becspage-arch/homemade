/**
 * Inspect the 16 specific DRAFT tutorial IDs from the scope extension
 * to understand their current hero state.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'

const TARGET_IDS = [
  // garden
  'cmp9rk5oq0002scv4b053cpr4', 'cmp9rk2o800020wv465npcay4',
  'cmp9rkan50003l4v44fogons3', 'cmp9rk86g0002qov49tz8bgf6',
  // crochet
  'cmpe20to60000t4v49zc5newh', 'cmpb8oj7v0000m4v4byd4k9wl',
  'cmpe20qyi0000d8v4ktp46ywo', 'cmpb8or9t0004zsv4x8bpb0iu',
  // knitting
  'cmpb8p8ik00056wv4jo2nm08c', 'cmpb8p0my00042gv4rbeux1cs',
  'cmpe20wcy0002lkv44wxrau53',
  // needlework
  'cmpb7qmbs0004g4v4p61hi1pw', 'cmpb7qzxj0002rov4gr7lkf8j',
  'cmpe1wxit000278v4n637h6z8',
  // sewing
  'cmpb7qrf30004cwv4yqywly9s', 'cmpb7r4iv0002s8v4tsgc7iri',
]

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { id: { in: TARGET_IDS } },
    select: {
      id: true,
      slug: true,
      status: true,
      heroMediaId: true,
      heroImageStrategy: true,
      category: { select: { slug: true } },
      hero: {
        select: {
          id: true,
          r2Key: true,
          cloudflareId: true,
          sourceUrl: true,
          source: true,
          status: true,
          licenceCode: true,
          width: true,
          height: true,
        },
      },
    },
    orderBy: { category: { slug: 'asc' } },
  })

  const found = new Set(tutorials.map(t => t.id))
  const missing = TARGET_IDS.filter(id => !found.has(id))
  if (missing.length) console.log(`\nNOT FOUND: ${missing.join(', ')}`)

  console.log(`\nAuditing ${tutorials.length} DRAFT tutorials:\n`)
  for (const t of tutorials) {
    const m = t.hero
    let heroState = 'heroMediaId=null (no hero at all)'
    if (m) {
      if (m.r2Key) heroState = `READY via r2Key=${m.r2Key.slice(0, 40)}...`
      else if (m.cloudflareId) heroState = `cloudflareId=${m.cloudflareId} (legacy, no r2Key)`
      else if (m.sourceUrl) heroState = `sourceUrl set but r2Key=null status=${m.status}`
      else heroState = `Media exists but no r2Key/cloudflareId/sourceUrl — status=${m.status}`
    }
    console.log(`[${t.category.slug}] ${t.slug}`)
    console.log(`  Status: ${t.status}  heroStrategy: ${t.heroImageStrategy}`)
    console.log(`  Hero: ${heroState}`)
    if (m) console.log(`  Media id: ${m.id}  source: ${m.source ?? '(null)'}  licence: ${m.licenceCode ?? '(null)'}`)
  }

  // Summary counts
  const withHero = tutorials.filter(t => t.heroMediaId && t.hero?.r2Key)
  const noHero = tutorials.filter(t => !t.heroMediaId)
  const broken = tutorials.filter(t => t.heroMediaId && !t.hero?.r2Key)
  console.log(`\nSummary: ${withHero.length} ready, ${noHero.length} no hero, ${broken.length} broken Media`)
}
main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
