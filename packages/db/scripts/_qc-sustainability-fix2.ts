/**
 * Second-pass fixes for 4 remaining sustainability BLOCKs.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) { count++; return (v as string).replaceAll(fromText, toText) }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) { out[k] = walk(val) }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

const BODY_FIXES: [string, string, string][] = [
  // internal-wall-insulation-how-to-choose: replace "target" (false positive brand-trademark)
  ['internal-wall-insulation-how-to-choose',
    'Part L target of 0.30 W/m²·K',
    'Part L value of 0.30 W/m²·K'],
  ['internal-wall-insulation-how-to-choose',
    'achieves the target U-value',
    'achieves the required U-value'],
  // grade-level fix
  ['internal-wall-insulation-how-to-choose',
    'Planning: external insulation needs consent on listed buildings and in conservation areas. Internal insulation does not need consent.',
    'Planning: external work needs consent for listed buildings and conservation areas. Internal work does not.'],

  // off-grid-power-monitoring: grade-level 11.6
  ['off-grid-power-monitoring',
    'Track charge over a season: a battery that never hits 100 percent after a full sunny day is either ageing or the panels are too small for the load.',
    'Track charge over a season: if a battery never hits full after a sunny day, the battery is old or the panels are too small.'],

  // rainwater-for-toilet-flushing: grade-level 11.1
  ['rainwater-for-toilet-flushing',
    'A mains backup float valve tops up the tank automatically if the rainwater level drops below the pump minimum.',
    'A mains backup float valve fills the tank if the rainwater level drops below the pump minimum.'],

  // solar-panel-cleaning-and-maintenance: grade-level 11.3
  ['solar-panel-cleaning-and-maintenance',
    'When monitoring shows output is consistently below the expected level for the season.',
    'When the monitor shows output is consistently low for the season.'],
]

// Excerpt fixes (plain string replace on the excerpt field)
const EXCERPT_FIXES: [string, string, string][] = [
  ['internal-wall-insulation-how-to-choose',
    'in cost, depth loss, and thermal bridging risk',
    'in cost and depth loss; bridging risk differs too'],
]

async function main() {
  // Body fixes
  for (const [slug, from, to] of BODY_FIXES) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }
    const { body: newBody, count } = applyStringReplace(t.body, from, to)
    if (count > 0) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: newBody as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
      })
      console.log('Body fixed: ' + slug + ' → ' + from.slice(0, 40) + '...')
    } else {
      console.log('Body MISS: ' + slug + ' | ' + from.slice(0, 60))
    }
  }

  // Excerpt fixes
  for (const [slug, from, to] of EXCERPT_FIXES) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, excerpt: true, revisedFrom: true, body: true } })
    if (!t || !t.excerpt) { console.log('Excerpt NOT FOUND: ' + slug); continue }
    if (!t.excerpt.includes(from)) { console.log('Excerpt MISS: ' + slug + ' | ' + from); continue }
    const newExcerpt = t.excerpt.replaceAll(from, to)
    await prisma.tutorial.update({
      where: { id: t.id },
      data: { excerpt: newExcerpt, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
    })
    console.log('Excerpt fixed: ' + slug + ' → ' + from.slice(0, 40) + '...')
  }

  console.log('\nDone.')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
