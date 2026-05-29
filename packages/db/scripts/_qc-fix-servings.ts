/**
 * Fix tutorials where both servings and yieldDescription are set.
 * For discrete items (fingers, biscuits, etc.) clear servings; keep yieldDescription.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) { console.log('usage: tsx _qc-fix-servings.ts slug1 slug2 ...'); process.exit(1) }

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, servings: true, yieldDescription: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }
    console.log(slug + ': servings=' + t.servings + ' yieldDescription=' + t.yieldDescription)
    if (t.servings !== null && t.yieldDescription) {
      await prisma.tutorial.update({ where: { id: t.id }, data: { servings: null } })
      console.log('  → cleared servings')
    } else {
      console.log('  → no change needed')
    }
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
