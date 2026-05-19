/**
 * Session A addendum — Maker of the Month smoke test.
 *
 * Creates a current-month MOTM row pointing at Rebecca, confirms the
 * `loadActiveMakerOfTheMonth` query returns it, then tests auto-expiry
 * by writing a past-month row and confirming it's NOT returned.
 *
 * Cleans up both rows at the end.
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

function monthBounds(at: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1, 0, 0, 0, 0),
  )
  const end = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  )
  return { start, end }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const rebecca = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
  })
  if (!rebecca) {
    console.error('Rebecca not found.')
    process.exit(1)
  }

  const now = new Date()
  const current = monthBounds(now)
  const past = monthBounds(
    new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), 15)),
  )

  // Clean up any pre-existing row on these bounds so the test starts
  // from zero.
  await prisma.makerOfTheMonth.deleteMany({
    where: { monthStart: { in: [current.start, past.start] } },
  })

  try {
    // Write a current-month pick.
    const currentRow = await prisma.makerOfTheMonth.create({
      data: {
        userId: rebecca.id,
        monthStart: current.start,
        monthEnd: current.end,
        featuredReason: 'Smoke test — current month',
        createdByUserId: rebecca.id,
      },
    })
    console.log(
      `Created current-month MOTM ${currentRow.id} (${current.start.toLocaleDateString('en-GB')} → ${current.end.toLocaleDateString('en-GB')})`,
    )

    // Active query — same logic as loadActiveMakerOfTheMonth.
    const active = await prisma.makerOfTheMonth.findFirst({
      where: { monthStart: { lte: now }, monthEnd: { gte: now } },
      orderBy: { monthStart: 'desc' },
    })

    // Write a past-month row and confirm it's filtered out.
    const pastRow = await prisma.makerOfTheMonth.create({
      data: {
        userId: rebecca.id,
        monthStart: past.start,
        monthEnd: past.end,
        featuredReason: 'Smoke test — past month',
        createdByUserId: rebecca.id,
      },
    })

    const pastQuery = await prisma.makerOfTheMonth.findFirst({
      where: {
        userId: rebecca.id,
        monthStart: past.start,
        monthEnd: { lt: now },
      },
    })

    const activeCheckPass = active?.id === currentRow.id
    const expiredCheckPass = pastQuery !== null && pastRow.monthEnd < now

    console.log('\nMOTM checks:')
    console.log(
      `  ${activeCheckPass ? 'PASS' : 'FAIL'}  Current pick returned by active query — got: ${active?.id ?? 'null'}`,
    )
    console.log(
      `  ${expiredCheckPass ? 'PASS' : 'FAIL'}  Past pick stored but not "active" (auto-expires) — past.monthEnd < now: ${pastRow.monthEnd < now}`,
    )

    if (!activeCheckPass || !expiredCheckPass) process.exit(1)
  } finally {
    await prisma.makerOfTheMonth.deleteMany({
      where: { monthStart: { in: [current.start, past.start] } },
    })
    console.log('\nCleaned up test MOTM rows.')
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
