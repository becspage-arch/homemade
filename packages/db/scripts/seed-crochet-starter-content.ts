/**
 * Crochet starter content — idempotent publish of the four foundation
 * tutorials that anchor the crochet category.
 *
 *   - phase-1-content/crochet/how-to-hold-a-crochet-hook.json (TECHNIQUE)
 *   - phase-1-content/crochet/how-to-work-a-treble.json (STITCH)
 *   - drafts/crochet-magic-ring.json (STITCH)
 *   - drafts/granny-square-basic-three-round.json (PATTERN, with chart)
 *
 * Runs every deploy. Idempotent on slug — the underlying upload-tutorial
 * routine upserts the row and re-syncs glossary / techniques / chart
 * definition / tool join rows. PUBLISHED status is stamped on every run
 * (so a future "unpublish then re-publish" via this seed is a no-op for
 * publishedAt and a refresh for the body).
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-starter-content.ts
 *
 * Wired into .github/workflows/deploy.yml after the migrate step. Failure
 * to publish a single file is logged but does not block the rest, the
 * deploy keeps going and the row stays as-is until the next run.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Walk up looking for .env.credentials, same shape as upload-tutorial.ts.
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import type { TutorialUploadInput } from './upload-tutorial-types.js'
import { uploadTutorial } from './upload-tutorial.js'

interface CrochetStarterFile {
  relativePath: string
  expectedType: 'TECHNIQUE' | 'STITCH' | 'PATTERN' | 'READING'
}

const STARTER_FILES: CrochetStarterFile[] = [
  { relativePath: 'phase-1-content/crochet/how-to-hold-a-crochet-hook.json', expectedType: 'TECHNIQUE' },
  { relativePath: 'phase-1-content/crochet/how-to-work-a-treble.json', expectedType: 'STITCH' },
  { relativePath: 'drafts/crochet-magic-ring.json', expectedType: 'STITCH' },
  { relativePath: 'drafts/granny-square-basic-three-round.json', expectedType: 'PATTERN' },
]

async function main(): Promise<void> {
  console.log('[seed] Crochet starter content, publishing four foundation tutorials.')

  let successCount = 0
  let failureCount = 0

  for (const file of STARTER_FILES) {
    const absolutePath = resolve(__dirname, file.relativePath)
    if (!existsSync(absolutePath)) {
      console.warn(`[seed] SKIP ${file.relativePath}, file not found at ${absolutePath}`)
      failureCount += 1
      continue
    }

    let input: TutorialUploadInput
    try {
      const raw = readFileSync(absolutePath, 'utf8')
      input = JSON.parse(raw) as TutorialUploadInput
    } catch (err) {
      console.error(`[seed] FAIL ${file.relativePath}, JSON parse error:`, err)
      failureCount += 1
      continue
    }

    if (input.type !== file.expectedType) {
      console.error(
        `[seed] FAIL ${file.relativePath}, expected type=${file.expectedType} but got type=${input.type}`,
      )
      failureCount += 1
      continue
    }

    try {
      const result = await uploadTutorial(input, absolutePath, 'PUBLISHED')
      console.log(
        `[seed] ${result.mode === 'created' ? 'CREATED' : 'UPDATED'} ${result.slug}, status=${result.status}${
          result.publishedAt ? `, publishedAt=${result.publishedAt}` : ''
        }`,
      )
      successCount += 1
    } catch (err) {
      console.error(`[seed] FAIL ${file.relativePath}, upload error:`, err)
      failureCount += 1
    }
  }

  console.log(
    `[seed] Crochet starter content done, ${successCount} succeeded, ${failureCount} failed.`,
  )

  // Do not exit non-zero on individual file failure, the deploy log surfaces
  // the FAIL line and the next deploy will retry. Hard fail only on total
  // failure (all four files broken).
  if (successCount === 0) {
    console.error('[seed] All starter files failed, exiting non-zero.')
    process.exit(2)
  }
}

main()
  .catch((err) => {
    console.error('[seed] Unhandled error:', err)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/index.js')
    await prisma.$disconnect()
  })
