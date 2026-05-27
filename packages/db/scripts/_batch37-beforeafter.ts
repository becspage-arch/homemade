/**
 * Pull before/after first-paragraph excerpts for 3 slugs from batch37.
 * Before = Tutorial.revisedFrom (snapshot of pre-rewrite body)
 * After  = Tutorial.body (live)
 */
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
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src'

const SAMPLES = [
  { slug: 'cornish-pasty', label: 'cornish-pasty (cooking, RECIPE)' },
  { slug: 'kanelbullar-cardamom-cinnamon', label: 'kanelbullar-cardamom-cinnamon (baking, RECIPE)' },
  { slug: 'organised-money-is-who-i-am-now', label: 'organised-money-is-who-i-am-now (mindset, PRACTICE)' },
]

function firstParaText(body: any): string {
  if (!body?.content) return '[empty]'
  const p = body.content.find((n: any) => n.type === 'paragraph')
  if (!p) return '[no paragraph]'
  return (p.content ?? [])
    .map((c: any) => (typeof c.text === 'string' ? c.text : ''))
    .join('')
}

async function main() {
  for (const s of SAMPLES) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug: s.slug },
      select: { revisedFrom: true, body: true },
    })
    if (!t) { console.log(`${s.label} -- not found`); continue }
    console.log(`\n### ${s.label}\n`)
    console.log('BEFORE:')
    console.log(`> ${firstParaText(t.revisedFrom)}`)
    console.log('\nAFTER:')
    console.log(`> ${firstParaText(t.body)}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
