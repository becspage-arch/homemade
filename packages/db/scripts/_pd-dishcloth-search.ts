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
  const { searchWikimedia } = await import('../../../apps/web/src/lib/image-sourcing/wikimedia.js')
  for (const q of [
    'knitted dishcloth',
    'knitted washcloth',
    'knitted cotton cloth',
    'knitting needles work',
    'knitting in progress',
    'cotton knitted square',
    'knitting stocking stitch swatch',
    'hand knitting',
    'knit and purl',
  ]) {
    const hits = await searchWikimedia(q, { limit: 8 })
    console.log(`q="${q}" (${hits.length} hits)`)
    for (const h of hits) {
      console.log(`  ${(h.upstreamId ?? '').padEnd(60)} ${h.width}x${h.height}  ${h.licenceCode}`)
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
