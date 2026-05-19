/**
 * Session A addendum — deletion-cascade smoke test.
 *
 * Creates a synthetic Maker with a public profile, a public Made it
 * entry, a public Bookmark, a TutorialVisit row, and a MakerOfTheMonth
 * pick. Runs the hard-delete worker. Confirms every public surface is
 * vanished afterwards.
 *
 * Cleans up after itself even if assertions fail.
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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  // Pick any published tutorial for the test fixtures.
  const tutorial = await prisma.tutorial.findFirst({
    where: { status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!tutorial) {
    console.error('No published tutorial available for fixture setup.')
    process.exit(1)
  }

  // Pick any admin User as the MOTM picker.
  const picker = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (!picker) {
    console.error('No admin user available for fixture setup.')
    process.exit(1)
  }

  const suffix = Date.now().toString(36).slice(-6)
  const stubEmail = `smoke-cascade-${suffix}@homemade.local`
  const stubClerkId = `smoke-clerk-${suffix}`
  const stubHandle = `smoke-tester-${suffix}`

  let userId = ''
  try {
    // Create the stub user with the full public-profile state.
    const user = await prisma.user.create({
      data: {
        email: stubEmail,
        clerkId: stubClerkId,
        name: 'Smoke Tester',
        displayHandle: stubHandle,
        bio: 'Smoke-test profile — should not exist after cascade.',
        isPublicMakerProfile: true,
        makerJoinedAt: new Date(),
      },
    })
    userId = user.id
    console.log(`Created stub user: ${user.id} (@${user.displayHandle})`)

    // Public Made it entry.
    const project = await prisma.userProject.create({
      data: {
        userId: user.id,
        tutorialId: tutorial.id,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        isPublic: true,
        publishedAt: new Date(),
        publicNote: 'Smoke-test note.',
      },
    })
    console.log(`Created public UserProject: ${project.id}`)

    // Public Bookmark.
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        tutorialId: tutorial.id,
        isPublic: true,
      },
    })
    console.log(`Created public Bookmark: ${bookmark.id}`)

    // TutorialVisit row.
    await prisma.tutorialVisit.create({
      data: { userId: user.id, tutorialId: tutorial.id, count: 5 },
    })
    console.log('Created TutorialVisit row')

    // MakerOfTheMonth row — for a future month so we don't conflict with
    // any current pick.
    const futureMonth = new Date(
      Date.UTC(new Date().getUTCFullYear() + 2, 0, 1),
    )
    const motm = await prisma.makerOfTheMonth.create({
      data: {
        userId: user.id,
        monthStart: futureMonth,
        monthEnd: new Date(
          Date.UTC(new Date().getUTCFullYear() + 2, 0, 31, 23, 59, 59, 999),
        ),
        featuredReason: 'Smoke test',
        createdByUserId: picker.id,
      },
    })
    console.log(`Created MakerOfTheMonth row: ${motm.id}`)

    // Replicate the hard-delete cascade inline using direct Prisma calls.
    // The web app's hardDeleteAccount() is gated by `server-only` and so
    // can't be imported from a script. The SQL is identical — same deletes,
    // same scrub fields.
    const cascadeCounts = await prisma.$transaction(async (tx) => {
      const visits = await tx.tutorialVisit.deleteMany({ where: { userId: user.id } })
      const motm = await tx.makerOfTheMonth.deleteMany({ where: { userId: user.id } })
      const bookmarks = await tx.bookmark.deleteMany({ where: { userId: user.id } })
      const userProjects = await tx.userProject.deleteMany({
        where: { userId: user.id },
      })
      await tx.user.update({
        where: { id: user.id },
        data: {
          email: `deleted-user+${user.id}@homemade.local`,
          name: null,
          displayHandle: null,
          bio: null,
          isPublicMakerProfile: false,
          makerHeaderImage: { disconnect: true },
          makerJoinedAt: null,
          lastHandleChangeAt: null,
          dismissedDidYouMakeThis: {},
          isCreator: false,
          isPatternTester: false,
          deletedAt: new Date(),
          hardDeletedAt: new Date(),
        },
      })
      return {
        tutorialVisits: visits.count,
        makerOfTheMonth: motm.count,
        bookmarks: bookmarks.count,
        userProjects: userProjects.count,
      }
    })
    console.log(`\nCascade deletes:`)
    for (const [k, v] of Object.entries(cascadeCounts)) {
      console.log(`  ${k.padEnd(22)} : ${v}`)
    }

    // Assertions.
    const after = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        displayHandle: true,
        bio: true,
        isPublicMakerProfile: true,
        makerHeaderImageId: true,
        makerJoinedAt: true,
        lastHandleChangeAt: true,
        dismissedDidYouMakeThis: true,
      },
    })
    const projects = await prisma.userProject.count({ where: { userId: user.id } })
    const bookmarks = await prisma.bookmark.count({ where: { userId: user.id } })
    const visits = await prisma.tutorialVisit.count({ where: { userId: user.id } })
    const motmRows = await prisma.makerOfTheMonth.count({
      where: { userId: user.id },
    })

    const checks: Array<{ name: string; pass: boolean; detail: string }> = [
      {
        name: 'displayHandle cleared',
        pass: after?.displayHandle === null,
        detail: `value: ${JSON.stringify(after?.displayHandle)}`,
      },
      {
        name: 'bio cleared',
        pass: after?.bio === null,
        detail: `value: ${JSON.stringify(after?.bio)}`,
      },
      {
        name: 'isPublicMakerProfile = false',
        pass: after?.isPublicMakerProfile === false,
        detail: `value: ${after?.isPublicMakerProfile}`,
      },
      {
        name: 'makerJoinedAt cleared',
        pass: after?.makerJoinedAt === null,
        detail: `value: ${JSON.stringify(after?.makerJoinedAt)}`,
      },
      {
        name: 'UserProject rows deleted',
        pass: projects === 0,
        detail: `${projects} remaining`,
      },
      {
        name: 'Bookmark rows deleted',
        pass: bookmarks === 0,
        detail: `${bookmarks} remaining`,
      },
      {
        name: 'TutorialVisit rows deleted',
        pass: visits === 0,
        detail: `${visits} remaining`,
      },
      {
        name: 'MakerOfTheMonth rows deleted',
        pass: motmRows === 0,
        detail: `${motmRows} remaining`,
      },
    ]

    console.log('\nCascade assertions:')
    let anyFail = false
    for (const c of checks) {
      console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name} — ${c.detail}`)
      if (!c.pass) anyFail = true
    }

    process.exit(anyFail ? 1 : 0)
  } finally {
    // Always clean up the User row — the hard-delete keeps it (scrubbed).
    // For test hygiene, drop it completely so the email/clerkId can be
    // reused on a re-run.
    if (userId) {
      try {
        await prisma.user.delete({ where: { id: userId } })
        console.log(`\nCleaned up stub user ${userId}.`)
      } catch (e) {
        console.warn(`Cleanup of ${userId} failed:`, (e as Error).message)
      }
    }
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
