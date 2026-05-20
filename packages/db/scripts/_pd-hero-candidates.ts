/**
 * Search Wikimedia Commons for PD/CC-licensed image candidates for specific
 * weak hero matches. Outputs candidate titles + URLs for review (does NOT
 * attach to tutorials — that's a separate manual pick step).
 *
 * Rebecca's standard: "if it's not actually a magic ring, we don't accept
 * it". This script surfaces options; the human picks (or "no hero" if
 * nothing's a real match).
 */
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

const QUERIES: Array<{ slug: string; queries: string[] }> = [
  { slug: 'crochet-magic-ring', queries: [
    'crochet magic ring',
    'crochet magic loop',
    'amigurumi starting ring',
    'crochet adjustable ring',
  ] },
  { slug: 'cross-stitch-alphabet-sampler-border', queries: [
    'cross stitch sampler alphabet',
    'embroidery sampler 19th century',
    'cross stitch sampler Victorian',
    'antique needlework sampler',
  ] },
  { slug: 'long-tail-cast-on', queries: [
    'long-tail cast on knitting',
    'knitting cast on',
    'casting on knitting',
  ] },
  { slug: 'how-to-cross-stitch', queries: [
    'cross stitch embroidery',
    'cross stitch fabric',
    'counted cross stitch',
  ] },
  { slug: 'how-to-work-a-treble', queries: [
    'treble crochet stitch',
    'crochet treble',
    'double crochet stitch',
  ] },
  { slug: 'how-to-hold-a-crochet-hook', queries: [
    'crochet hook hand',
    'crochet hook grip',
    'crocheting',
  ] },
  { slug: 'how-to-work-a-knit-stitch', queries: [
    'knit stitch',
    'knitting plain',
    'knitting fabric stocking stitch',
  ] },
  { slug: 'stocking-stitch-dishcloth', queries: [
    'cotton dishcloth knitted',
    'knitted washcloth',
    'stocking stitch fabric',
  ] },
  { slug: 'simple-drawstring-bag', queries: [
    'drawstring bag cotton',
    'cotton pouch drawstring',
    'fabric drawstring sack',
  ] },
  { slug: 'running-and-backstitch-by-hand', queries: [
    'hand sewing backstitch',
    'running stitch hand',
    'hand embroidery stitch',
  ] },
  { slug: 'growing-strawberries', queries: [
    'strawberry plant Fragaria',
    'strawberries growing garden',
    'strawberry fruit',
  ] },
  { slug: 'growing-tomatoes-from-seed', queries: [
    'tomato seedling',
    'tomato plant',
    'tomato Solanum lycopersicum',
  ] },
]

async function main() {
  const { searchWikimedia } = await import('../../../apps/web/src/lib/image-sourcing/wikimedia.js')
  for (const { slug, queries } of QUERIES) {
    console.log(`\n=== ${slug} ===`)
    for (const q of queries) {
      const hits = await searchWikimedia(q, { limit: 6 })
      if (hits.length === 0) { console.log(`  q="${q}" (no results)`); continue }
      console.log(`  q="${q}" (${hits.length} hits)`)
      for (const h of hits) {
        console.log(`    ${(h.upstreamId ?? '').padEnd(80)} ${h.width}x${h.height}  ${h.licenceCode}`)
        console.log(`      ${h.pageUrl}`)
      }
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
