/**
 * Session A addendum — "Did you make this?" prompt smoke test.
 *
 * Picks Rebecca's User row, picks any published tutorial she has no
 * UserProject for, simulates 3 visits via direct TutorialVisit upserts
 * (matching what recordTutorialVisit does server-side), then asserts the
 * prompt would render. Cleans up the TutorialVisit row at the end.
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

const VISIT_THRESHOLD = 3
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const rebecca = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
  })
  if (!rebecca) {
    console.error('Rebecca not found.')
    process.exit(1)
  }

  // Pick a published tutorial Rebecca has no UserProject for.
  const tutorial = await prisma.tutorial.findFirst({
    where: {
      status: 'PUBLISHED',
      projects: { none: { userId: rebecca.id } },
    },
    select: { id: true, slug: true, title: true },
  })
  if (!tutorial) {
    console.error('No fresh tutorial available for fixture.')
    process.exit(1)
  }
  console.log(`Tutorial: ${tutorial.title} (${tutorial.id})`)

  let visitCount = 0
  try {
    // Reset visit row so the count starts at 0.
    await prisma.tutorialVisit.deleteMany({
      where: { userId: rebecca.id, tutorialId: tutorial.id },
    })

    // Simulate 3 visits.
    for (let i = 1; i <= 3; i++) {
      const updated = await prisma.tutorialVisit.upsert({
        where: {
          userId_tutorialId: {
            userId: rebecca.id,
            tutorialId: tutorial.id,
          },
        },
        update: { count: { increment: 1 }, lastVisitedAt: new Date() },
        create: {
          userId: rebecca.id,
          tutorialId: tutorial.id,
          count: 1,
          lastVisitedAt: new Date(),
        },
        select: { count: true },
      })
      visitCount = updated.count
      console.log(`Visit ${i}: count is now ${visitCount}`)
    }

    // Apply the same logic as shouldShowDidYouMakeThisPrompt.
    const dismissed =
      rebecca.dismissedDidYouMakeThis &&
      typeof rebecca.dismissedDidYouMakeThis === 'object' &&
      !Array.isArray(rebecca.dismissedDidYouMakeThis)
        ? (rebecca.dismissedDidYouMakeThis as Record<string, string>)
        : {}
    const dismissedAt = dismissed[tutorial.id]
    let dismissedRecently = false
    if (dismissedAt) {
      const d = new Date(dismissedAt)
      if (!Number.isNaN(d.getTime())) {
        dismissedRecently = Date.now() - d.getTime() < DISMISS_TTL_MS
      }
    }
    const existingProject = await prisma.userProject.findUnique({
      where: {
        userId_tutorialId: {
          userId: rebecca.id,
          tutorialId: tutorial.id,
        },
      },
      select: { id: true },
    })

    const shouldShow =
      visitCount >= VISIT_THRESHOLD &&
      !dismissedRecently &&
      !existingProject

    console.log('\nPrompt eligibility:')
    console.log(`  visitCount >= ${VISIT_THRESHOLD}: ${visitCount >= VISIT_THRESHOLD}`)
    console.log(`  not dismissed recently     : ${!dismissedRecently}`)
    console.log(`  no existing UserProject    : ${!existingProject}`)
    console.log(`  → prompt would render      : ${shouldShow}`)

    if (!shouldShow) {
      process.exit(1)
    }
  } finally {
    // Clean up the test visit row.
    await prisma.tutorialVisit.deleteMany({
      where: { userId: rebecca.id, tutorialId: tutorial.id },
    })
    console.log('\nCleaned up TutorialVisit row.')
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
