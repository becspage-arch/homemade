/**
 * Dump calendula salve's revisedFrom (original body) sections that were
 * pruned by the rewrite: Dosing + Patch test (was within original) + When
 * NOT to use this salve + Important safety notes infoPanel. Plus its
 * current body for inspection. Output to docs/voice-pilot-2026-05-25/.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
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
import { prisma } from '../src'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug: 'calendula-salve-for-skin' },
    select: { body: true, revisedFrom: true },
  })
  if (!t) throw new Error('not found')

  writeFileSync(
    resolve(worktreeRoot, 'docs/voice-pilot-2026-05-25/_calendula-revisedFrom.json'),
    JSON.stringify(t.revisedFrom, null, 2),
    'utf8',
  )
  console.log('Wrote revisedFrom snapshot to _calendula-revisedFrom.json')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
