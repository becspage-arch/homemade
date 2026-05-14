/**
 * Upload all personal-recipe briefs as DRAFT.
 *
 * Iterates docs/personal-recipes-briefs/*.json, calls upload-tutorial.ts on each
 * with default flags (DRAFT, voice-check on). Captures the outcome per brief
 * into _upload-report.json so the markdown report can include voice-check
 * results, skips, and any failures.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BRIEFS_DIR = __dirname
const REPO_ROOT = resolve(__dirname, '..', '..')
const UPLOAD_SCRIPT = join(REPO_ROOT, 'packages', 'db', 'scripts', 'upload-tutorial.ts')

interface UploadOutcome {
  slug: string
  brief: string
  status: 'created' | 'updated' | 'failed' | 'skipped-voice-check'
  voiceCheckResult: 'clean' | 'warnings' | 'errors' | 'unknown'
  voiceWarnings: string[]
  voiceErrors: string[]
  message: string
  tutorialId?: string
  retried?: boolean
}

const briefFiles = readdirSync(BRIEFS_DIR)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .sort()

console.log(`Uploading ${briefFiles.length} briefs...\n`)

const results: UploadOutcome[] = []

function parseVoiceLines(stdout: string): { warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []
  for (const line of stdout.split(/\r?\n/)) {
    const w = line.match(/WARN\s+([\w-]+):\s+(.+)$/)
    if (w) warnings.push(`${w[1]}: ${w[2]}`)
    const e = line.match(/ERROR\s+([\w-]+):\s+(.+)$/)
    if (e) errors.push(`${e[1]}: ${e[2]}`)
  }
  return { warnings, errors }
}

let createdCount = 0
let updatedCount = 0
let failedCount = 0
let skippedCount = 0

for (const f of briefFiles) {
  const path = join(BRIEFS_DIR, f)
  const slug = JSON.parse(readFileSync(path, 'utf8')).slug

  // First attempt with voice-check on
  const result = spawnSync(
    'pnpm',
    ['--filter', '@homemade/db', 'exec', 'tsx', UPLOAD_SCRIPT, path],
    {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      encoding: 'utf8',
      shell: true,
      timeout: 90_000,
    },
  )

  const stdout = result.stdout || ''
  const stderr = result.stderr || ''
  const combined = stdout + '\n' + stderr
  const { warnings, errors } = parseVoiceLines(combined)

  if (result.status === 0) {
    const tutorialMatch = stdout.match(/Tutorial id:\s+(\S+)/)
    const modeMatch = stdout.match(/\[upload-tutorial\] (CREATED|UPDATED)/)
    const created = modeMatch?.[1] === 'CREATED'
    if (created) createdCount++; else updatedCount++
    const outcome: UploadOutcome = {
      slug,
      brief: f,
      status: created ? 'created' : 'updated',
      voiceCheckResult: warnings.length > 0 ? 'warnings' : 'clean',
      voiceWarnings: warnings,
      voiceErrors: [],
      message: `${modeMatch?.[1] ?? 'OK'}`,
      tutorialId: tutorialMatch?.[1],
    }
    results.push(outcome)
    console.log(`  [${results.length}/${briefFiles.length}] ${created ? 'CREATED' : 'UPDATED'}  ${slug}${warnings.length > 0 ? ` (${warnings.length} warns)` : ''}`)
  } else if (result.status === 2) {
    // Voice-check error. Per the prompt: log it, retry with --skip-voice-check.
    console.log(`  [${results.length + 1}/${briefFiles.length}] VOICE-CHECK BLOCKED  ${slug} — retrying with --skip-voice-check`)
    const retry = spawnSync(
      'pnpm',
      ['--filter', '@homemade/db', 'exec', 'tsx', UPLOAD_SCRIPT, path, '--skip-voice-check'],
      {
        cwd: REPO_ROOT,
        stdio: 'pipe',
        encoding: 'utf8',
        shell: true,
        timeout: 90_000,
      },
    )
    const rstdout = retry.stdout || ''
    if (retry.status === 0) {
      const tutorialMatch = rstdout.match(/Tutorial id:\s+(\S+)/)
      const modeMatch = rstdout.match(/\[upload-tutorial\] (CREATED|UPDATED)/)
      const created = modeMatch?.[1] === 'CREATED'
      if (created) createdCount++; else updatedCount++
      skippedCount++
      results.push({
        slug,
        brief: f,
        status: created ? 'created' : 'updated',
        voiceCheckResult: 'errors',
        voiceWarnings: warnings,
        voiceErrors: errors,
        message: `landed with --skip-voice-check (voice rules tripped on Rebecca's prose; flagged for her review, not rewritten)`,
        tutorialId: tutorialMatch?.[1],
        retried: true,
      })
      console.log(`     RETRY OK  ${slug}  (${errors.length} voice errors logged)`)
    } else {
      failedCount++
      results.push({
        slug,
        brief: f,
        status: 'failed',
        voiceCheckResult: 'errors',
        voiceWarnings: warnings,
        voiceErrors: errors,
        message: `upload still failed after --skip-voice-check: ${retry.stderr?.slice(0, 200)}`,
      })
      console.log(`     RETRY FAILED  ${slug}`)
    }
  } else {
    failedCount++
    results.push({
      slug,
      brief: f,
      status: 'failed',
      voiceCheckResult: 'unknown',
      voiceWarnings: warnings,
      voiceErrors: errors,
      message: stderr.slice(0, 300) || 'unknown error',
    })
    console.log(`  [${results.length}/${briefFiles.length}] FAILED  ${slug} — ${stderr.slice(0, 80)}`)
  }
}

console.log(`\nDone.`)
console.log(`  Created: ${createdCount}`)
console.log(`  Updated: ${updatedCount}`)
console.log(`  Failed:  ${failedCount}`)
console.log(`  --skip-voice-check used on: ${skippedCount}`)

writeFileSync(join(BRIEFS_DIR, '_upload-report.json'), JSON.stringify(results, null, 2))
console.log(`\nWrote _upload-report.json`)
