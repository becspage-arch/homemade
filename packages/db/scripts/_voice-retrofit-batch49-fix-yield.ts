/**
 * One-off: rewrite treacle-tart-classic.yieldDescription in the live DB so
 * it carries no en-dash. The voice-retrofit apply path doesn't touch the
 * yieldDescription field; this script does it directly.
 *
 * Same pattern as the batch3 sourdough-discard-crumpets fix and the batch4
 * knedliky-bread fix.
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
  const before = await prisma.tutorial.findUnique({
    where: { slug: 'treacle-tart-classic' },
    select: { yieldDescription: true },
  })
  console.log(`before: ${before?.yieldDescription}`)
  await prisma.tutorial.update({
    where: { slug: 'treacle-tart-classic' },
    data: { yieldDescription: '1 tart (23 cm tin, serves 6 to 8)' },
  })
  const after = await prisma.tutorial.findUnique({
    where: { slug: 'treacle-tart-classic' },
    select: { yieldDescription: true },
  })
  console.log(`after:  ${after?.yieldDescription}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
