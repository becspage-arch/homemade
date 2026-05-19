/**
 * Session A verification — confirms the migration + backfill landed cleanly.
 *
 * Checks:
 *   1. Every User row has a non-null displayHandle.
 *   2. The displayHandle uniqueness constraint is enforced (no duplicates).
 *   3. Every existing UserProject has isPublic = false (no accidental publish).
 *   4. Every existing Bookmark has isPublic = false.
 *
 * Prints a pass/fail line per check and exits non-zero if any fail.
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

  // 1. Every User has a handle
  const totalUsers = await prisma.user.count()
  const withHandle = await prisma.user.count({ where: { displayHandle: { not: null } } })
  results.push({
    name: 'Every User has displayHandle',
    pass: totalUsers === withHandle,
    detail: `${withHandle} / ${totalUsers} have handles`,
  })

  // 2. Uniqueness — duplicates would show in a GROUP BY > 1.
  const dupes = await prisma.$queryRaw<Array<{ displayHandle: string; count: bigint }>>`
    SELECT "displayHandle", COUNT(*) as count
    FROM "User"
    WHERE "displayHandle" IS NOT NULL
    GROUP BY "displayHandle"
    HAVING COUNT(*) > 1
  `
  results.push({
    name: 'displayHandle is unique',
    pass: dupes.length === 0,
    detail: dupes.length === 0 ? 'no duplicates' : `${dupes.length} duplicate handles`,
  })

  // 3. All existing UserProjects default to isPublic = false
  const projectsTotal = await prisma.userProject.count()
  const projectsPublic = await prisma.userProject.count({ where: { isPublic: true } })
  results.push({
    name: 'UserProject.isPublic defaults to false',
    pass: projectsPublic === 0,
    detail: `${projectsPublic} of ${projectsTotal} projects are public (expected 0)`,
  })

  // 4. All existing Bookmarks default to isPublic = false
  const bookmarksTotal = await prisma.bookmark.count()
  const bookmarksPublic = await prisma.bookmark.count({ where: { isPublic: true } })
  results.push({
    name: 'Bookmark.isPublic defaults to false',
    pass: bookmarksPublic === 0,
    detail: `${bookmarksPublic} of ${bookmarksTotal} bookmarks are public (expected 0)`,
  })

  console.log('\nMaker state checks:')
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
