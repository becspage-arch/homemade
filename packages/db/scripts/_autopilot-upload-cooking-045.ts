import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { uploadTutorial } from './upload-tutorial'

const BRIEF_DIR = join(process.cwd(), '../../docs/bulk-batch-045-briefs')
const SKIP = new Set<string>()

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

  console.log(`\n=== cooking-bulk-045 upload complete ===`)
  console.log(`Published: ${published}`)
  console.log(`Failed:    ${failed}`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log('  ' + f)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
