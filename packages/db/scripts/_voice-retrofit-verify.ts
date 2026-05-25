/**
 * Verify the apply step: count how many of a batch's slugs now have
 * non-null revisedFrom, and spot-check one slug's snapshot.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('usage: tsx _voice-retrofit-verify.ts <batch-id>')
    process.exit(1)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const slugsFile = resolve(batchDir, '_slugs.json')
  if (!existsSync(slugsFile)) {
    console.error(`slugs file not found: ${slugsFile}`)
    process.exit(1)
  }
  const slugsData = JSON.parse(readFileSync(slugsFile, 'utf8'))
  const slugs: string[] = slugsData.slugs

  const { prisma } = await import('../src/index.js')

  let withSnapshot = 0
  let withoutSnapshot = 0
  const missing: string[] = []
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, revisedFrom: true },
    })
    if (!t) {
      missing.push(slug)
      continue
    }
    if (t.revisedFrom == null) withoutSnapshot++
    else withSnapshot++
  }
  console.log(`batch slugs: ${slugs.length}`)
  console.log(`with revisedFrom snapshot:    ${withSnapshot}`)
  console.log(`without revisedFrom snapshot: ${withoutSnapshot}`)
  if (missing.length > 0) console.log(`missing tutorials: ${missing.join(', ')}`)

  // Spot-check first slug
  const sample = slugs[0]
  const s: any = await prisma.tutorial.findUnique({
    where: { slug: sample },
    select: { slug: true, revisedFrom: true },
  })
  console.log(`\nspot-check: ${sample}`)
  console.log(`  revisedFrom IS NOT NULL: ${s?.revisedFrom != null}`)
  if (s?.revisedFrom) {
    const snippet = JSON.stringify(s.revisedFrom).slice(0, 200)
    console.log(`  revisedFrom first 200 chars: ${snippet}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
