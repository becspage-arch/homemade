/**
 * One-off: replace the en-dash in tea-loaf's recipe.yieldDescription
 * ("10–12 slices" -> "10 to 12 slices") so the public renderer never
 * emits the long-dash character. The voice-check body scan does not
 * reach yieldDescription; this is the same fix the batch3 hand-off
 * applied for sourdough-discard-crumpets and the batch4 hand-off for
 * knedliky-bread.
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
  const slug = 'tea-loaf'
  const before = await prisma.tutorial.findUnique({
    where: { slug },
    select: { yieldDescription: true },
  })
  console.log(`[before] ${slug}.yieldDescription = ${JSON.stringify(before?.yieldDescription)}`)

  await prisma.tutorial.update({
    where: { slug },
    data: { yieldDescription: '1 loaf (10 to 12 slices)' },
  })

  const after = await prisma.tutorial.findUnique({
    where: { slug },
    select: { yieldDescription: true },
  })
  console.log(`[after]  ${slug}.yieldDescription = ${JSON.stringify(after?.yieldDescription)}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
