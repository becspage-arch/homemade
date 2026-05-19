/**
 * One-shot smoke-test helper for Session A.
 *
 * 1. Picks Rebecca's User row (email match).
 * 2. Flips her isPublicMakerProfile=true.
 * 3. Reports her displayHandle so the caller can curl /m/{handle}.
 * 4. Picks her most-recent UserProject (any status) and marks it isPublic=true
 *    with publishedAt=now so we can verify the public flag round-trips.
 *
 * Belt-and-braces: prints the IDs touched + the resulting URLs.
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

  const user = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
  })
  if (!user) {
    console.error('No user found for rebecca@homemade.education')
    process.exit(1)
  }
  console.log(`User: ${user.id} (handle: ${user.displayHandle})`)

  await prisma.user.update({
    where: { id: user.id },
    data: { isPublicMakerProfile: true },
  })
  console.log('Set isPublicMakerProfile = true')

  // Pick the most recent project. If none exist, skip — the profile alone is
  // still smoke-testable.
  const project = await prisma.userProject.findFirst({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
  })
  if (project) {
    await prisma.userProject.update({
      where: { id: project.id },
      data: {
        isPublic: true,
        publishedAt: project.publishedAt ?? new Date(),
      },
    })
    console.log(`Set project ${project.id} isPublic = true`)
  } else {
    console.log('No projects yet — profile page renders with empty Made it.')
  }

  console.log('\nSmoke test URLs:')
  console.log(`  https://homemade.education/m/${user.displayHandle}`)
  if (project) {
    console.log(
      `  https://homemade.education/m/${user.displayHandle}/made/${project.id}`,
    )
  }
  console.log('  https://homemade.education/m/no-such-handle  (must 404)')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
