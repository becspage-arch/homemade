/**
 * One-off DB fix: welsh-cakes-griddle has an en-dash in
 * recipe.yieldDescription ("12-14 welsh cakes" rendered with U+2013).
 * The voice-retrofit apply path does not touch recipe metadata, so this
 * standalone script updates the live row to match the QC-cleaned JSON
 * ("12 to 14 welsh cakes").
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
    where: { slug: 'welsh-cakes-griddle' },
    select: { yieldDescription: true },
  })
  console.log('[before]', JSON.stringify(before))

  await prisma.tutorial.update({
    where: { slug: 'welsh-cakes-griddle' },
    data: { yieldDescription: '12 to 14 welsh cakes' },
  })

  const after = await prisma.tutorial.findUnique({
    where: { slug: 'welsh-cakes-griddle' },
    select: { yieldDescription: true },
  })
  console.log('[after] ', JSON.stringify(after))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
