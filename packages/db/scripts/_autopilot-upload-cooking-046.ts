import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { uploadTutorial } from './upload-tutorial'

const BRIEF_DIR = join(process.cwd(), '../../docs/bulk-batch-046-briefs')
const SKIP = new Set<string>([
  // Round 1 — published at start of session
  'boeuf-bourguignon',
  'coq-au-vin',
  'pot-au-feu',
  'poulet-roti',
  'poulet-basquaise',
  'poulet-a-la-moutarde',
  'poulet-a-l-estragon',
  'poulet-chasseur',
  'confit-de-canard',
  'gigot-d-agneau',
  'brandade-de-morue',
  'oeufs-en-cocotte',
  'ratatouille',
  // 'creme-caramel',  // re-upload: fixed prose-prep-steps
  // Round 2 — published
  'cassoulet',
  'daube-de-boeuf-provencale',
  'blanquette-de-veau',
  'navarin-d-agneau',
  'veau-marengo',
  'moules-marinieres',
  'bouillabaisse',
  // 'coquilles-saint-jacques',  // re-upload: fixed prose-prep-steps (done)
  // 'soupe-au-pistou',  // re-upload: fixed prose-prep-steps
  'gratin-dauphinois',
  'petits-pois-a-la-francaise',
  'carottes-vichy',
  'tian-de-legumes',
  'salade-nicoise',
  'steak-au-poivre',
  'pot-de-creme-au-chocolat',
  'crepes-suzette',
  'tarte-tatin',
  'mousse-au-chocolat',
  'clafoutis',
  // Round 3 — published after tool slug fixes
  'sole-meuniere',
  // 'soupe-a-l-oignon',   // re-upload: fixed prose-prep-steps
  // 'vichyssoise',        // re-upload: fixed prose-prep-steps
  // 'quiche-lorraine',    // re-upload: fixed prose-prep-steps
  'pate-de-campagne',
  'iles-flottantes',
  // 'creme-caramel' is already in round-1 SKIP above, re-upload needed for prose fix
])

async function main() {
  const files = readdirSync(BRIEF_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()

  let published = 0
  let failed = 0
  const failures: string[] = []

  for (const file of files) {
    const briefPath = join(BRIEF_DIR, file)
    const brief = JSON.parse(readFileSync(briefPath, 'utf8'))
    const slug = brief.slug ?? file.replace('.json', '')

    if (SKIP.has(slug)) {
      console.log(`[skip] ${slug}`)
      continue
    }

    let lastErr: unknown
    let ok = false
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await uploadTutorial(brief, briefPath, 'PUBLISHED')
        console.log(`[ok] ${slug}`)
        ok = true
        break
      } catch (e: unknown) {
        lastErr = e
        const msg = e instanceof Error ? e.message : String(e)
        console.warn(`[attempt ${attempt} fail] ${slug}: ${msg}`)
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000))
      }
    }

    if (ok) {
      published++
    } else {
      failed++
      failures.push(`${slug}: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`)
    }
  }

  console.log(`\n=== cooking-bulk-046 upload complete ===`)
  console.log(`Published: ${published}`)
  console.log(`Failed:    ${failed}`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log('  ' + f)
  }
}

main().catch(console.error)
