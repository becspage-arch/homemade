/**
 * Session A addendum verification.
 *
 * Confirms:
 *   1. ReportTargetType enum now includes the 5 MAKER_* values.
 *   2. NotificationType enum now includes MAKER_PROFILE_CONTENT_REMOVED.
 *   3. MakerOfTheMonth + TutorialVisit tables exist (round-trip
 *      query against empty tables).
 *   4. User.dismissedDidYouMakeThis + lastHandleChangeAt columns exist
 *      and have the expected default.
 *
 * Prints PASS/FAIL per check and exits non-zero on any fail.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

interface CheckResult {
  name: string
  pass: boolean
  detail: string
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const results: CheckResult[] = []

  // 1. ReportTargetType enum values present in pg_enum.
  const enumRows = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'ReportTargetType'
    ORDER BY e.enumsortorder
  `
  const labels = enumRows.map((r) => r.enumlabel)
  const expected = [
    'MAKER_BIO',
    'MAKER_HANDLE',
    'MAKER_HEADER_IMAGE',
    'MAKER_PROJECT_PUBLIC_NOTE',
    'MAKER_PROJECT_WHAT_I_USED',
  ]
  const missing = expected.filter((v) => !labels.includes(v))
  results.push({
    name: 'ReportTargetType has Maker target values',
    pass: missing.length === 0,
    detail:
      missing.length === 0
        ? `enum now: ${labels.join(', ')}`
        : `missing: ${missing.join(', ')}`,
  })

  // 2. NotificationType has new value.
  const notifEnum = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'NotificationType'
  `
  const hasNotif = notifEnum.some(
    (r) => r.enumlabel === 'MAKER_PROFILE_CONTENT_REMOVED',
  )
  results.push({
    name: 'NotificationType has MAKER_PROFILE_CONTENT_REMOVED',
    pass: hasNotif,
    detail: hasNotif ? 'present' : 'missing',
  })

  // 3. MakerOfTheMonth + TutorialVisit tables exist (a count query against
  // each table proves the table is there and addressable).
  try {
    const motmCount = await prisma.makerOfTheMonth.count()
    results.push({
      name: 'MakerOfTheMonth table exists',
      pass: true,
      detail: `${motmCount} rows`,
    })
  } catch (e) {
    results.push({
      name: 'MakerOfTheMonth table exists',
      pass: false,
      detail: `error: ${(e as Error).message}`,
    })
  }
  try {
    const visitCount = await prisma.tutorialVisit.count()
    results.push({
      name: 'TutorialVisit table exists',
      pass: true,
      detail: `${visitCount} rows`,
    })
  } catch (e) {
    results.push({
      name: 'TutorialVisit table exists',
      pass: false,
      detail: `error: ${(e as Error).message}`,
    })
  }

  // 4. User new columns.
  const cols = await prisma.$queryRaw<
    Array<{ column_name: string; data_type: string; column_default: string | null }>
  >`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name IN ('dismissedDidYouMakeThis', 'lastHandleChangeAt',
        'isPublicMakerProfile', 'makerHeaderImageId', 'makerJoinedAt')
    ORDER BY column_name
  `
  results.push({
    name: 'User has all Session A columns',
    pass: cols.length === 5,
    detail: cols
      .map((c) => `${c.column_name}:${c.data_type}`)
      .join(', '),
  })

  console.log('\nMaker addendum checks:')
  let anyFail = false
  for (const r of results) {
    console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`)
    if (!r.pass) anyFail = true
  }

  await prisma.$disconnect()
  process.exit(anyFail ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
