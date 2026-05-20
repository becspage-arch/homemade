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
    'rosemary bush growing',
    'rosemary in pot',
    'rosemary garden plant',
    'Rosmarinus officinalis flowering',
    'rosemary flowers blue',
    'rosemary leaves close',
    'fresh rosemary sprigs',
    'herb garden rosemary',
  ]) {
    const hits = await searchWikimedia(q, { limit: 6 })
    console.log(`\nq="${q}" (${hits.length} hits)`)
    for (const h of hits) {
      const ratio = h.width / h.height
      const landscape = ratio >= 1.5 ? 'LANDSCAPE' : ratio >= 1.3 ? '4:3' : 'PORTRAIT'
      console.log(`  ${(h.upstreamId ?? '').padEnd(60)} ${h.width}x${h.height}  ${h.licenceCode}  ${landscape}`)
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
