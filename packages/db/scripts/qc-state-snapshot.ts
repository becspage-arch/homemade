/**
 * One-shot snapshot of QC-relevant counts: missing heroes, voice-null,
 * em-dash in body, placeholder pattern, missing ingredient amounts. Useful
 * for before/after evidence in the hand-off.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
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
  const allPublished = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const heroMissing = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', heroMediaId: null },
  })
  const voiceNull = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  // SQL JSONB scan for {{...}} placeholder pattern in body text.
  const placeholderRows = (await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count
       FROM "Tutorial"
      WHERE status = 'PUBLISHED'
        AND body::text ~ '\\{\\{[^}]{1,80}\\}\\}'`,
  ))
  const emDashRows = (await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count
       FROM "Tutorial"
      WHERE status = 'PUBLISHED'
        AND (body::text ~ '[–—]' OR title ~ '[–—]' OR coalesce(subtitle, '') ~ '[–—]' OR coalesce(excerpt, '') ~ '[–—]')`,
  ))
  const ingNullAmount = await prisma.recipeIngredient.count({ where: { amount: null } })
  const ingNullUnit = await prisma.recipeIngredient.count({ where: { unit: null } })
  console.log(JSON.stringify({
    capturedAt: new Date().toISOString(),
    allPublished,
    heroMissing,
    voiceNull,
    placeholderTutorials: Number(placeholderRows[0]?.count ?? 0n),
    emDashTutorials: Number(emDashRows[0]?.count ?? 0n),
    ingredientRowsNullAmount: ingNullAmount,
    ingredientRowsNullUnit: ingNullUnit,
  }, null, 2))
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
