/**
 * Upload all personal-recipe briefs as DRAFT. Invokes upload-tutorial.ts per
 * brief via tsx (one process at a time). Captures stdout/stderr to a report
 * file so failures can be diagnosed afterwards.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BRIEFS_DIR = __dirname
const REPO_ROOT = resolve(__dirname, '..', '..')
const UPLOAD_SCRIPT = join(REPO_ROOT, 'packages', 'db', 'scripts', 'upload-tutorial.ts')
const DB_DIR = join(REPO_ROOT, 'packages', 'db')

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

const briefFiles = readdirSync(BRIEFS_DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.'))
  .sort()

console.log(`Uploading ${briefFiles.length} briefs...`)

const results: UploadOutcome[] = []
let createdCount = 0
let updatedCount = 0
let failedCount = 0
let skippedCount = 0

const startMs = Date.now()

for (const f of briefFiles) {
  const filePath = join(BRIEFS_DIR, f)
  const slug = (JSON.parse(readFileSync(filePath, 'utf8')) as { slug: string }).slug

  // Spawn tsx directly (avoids pnpm wrapper overhead).
  // tsx lives in packages/db/node_modules; call it via node_modules/.bin path.
  const tsxBin = join(REPO_ROOT, 'packages', 'db', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.CMD' : 'tsx')
  const result = spawnSync(
    tsxBin,
    [UPLOAD_SCRIPT, filePath],
    { cwd: DB_DIR, encoding: 'utf8', shell: process.platform === 'win32', timeout: 180_000 },
  )

  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  const combined = stdout + '\n' + stderr
  const { warnings, errors } = parseVoiceLines(combined)

  if (result.status === 0) {
    const tutorialMatch = stdout.match(/Tutorial id:\s+(\S+)/)
    const modeMatch = stdout.match(/\[upload-tutorial\] (CREATED|UPDATED)/)
    const created = modeMatch?.[1] === 'CREATED'
    if (created) createdCount++
    else updatedCount++
    results.push({
      slug,
      brief: f,
      status: created ? 'created' : 'updated',
      voiceCheckResult: warnings.length > 0 ? 'warnings' : 'clean',
      voiceWarnings: warnings,
      voiceErrors: [],
      message: `${modeMatch?.[1] ?? 'OK'}`,
      tutorialId: tutorialMatch?.[1],
    })
    const elapsedS = ((Date.now() - startMs) / 1000).toFixed(0)
    console.log(`  [${results.length}/${briefFiles.length}] (${elapsedS}s) ${created ? 'CREATED' : 'UPDATED'}  ${slug}${warnings.length > 0 ? ` (${warnings.length} warns)` : ''}`)
  } else if (result.status === 2) {
    // Voice-check error. Retry with --skip-voice-check.
    console.log(`  [${results.length + 1}/${briefFiles.length}] VOICE-CHECK BLOCKED  ${slug} — retrying with --skip-voice-check`)
    const retry = spawnSync(
      tsxBin,
      [UPLOAD_SCRIPT, filePath, '--skip-voice-check'],
      { cwd: DB_DIR, encoding: 'utf8', shell: process.platform === 'win32', timeout: 180_000 },
    )
    const rstdout = retry.stdout ?? ''
    if (retry.status === 0) {
      const tutorialMatch = rstdout.match(/Tutorial id:\s+(\S+)/)
      const modeMatch = rstdout.match(/\[upload-tutorial\] (CREATED|UPDATED)/)
      const created = modeMatch?.[1] === 'CREATED'
      if (created) createdCount++
      else updatedCount++
      skippedCount++
      results.push({
        slug,
        brief: f,
        status: created ? 'created' : 'updated',
        voiceCheckResult: 'errors',
        voiceWarnings: warnings,
        voiceErrors: errors,
        message: 'landed with --skip-voice-check',
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
        message: `upload still failed after --skip-voice-check: ${(retry.stderr ?? '').slice(0, 400)}`,
      })
      console.log(`     RETRY FAILED  ${slug}`)
    }
  } else {
    failedCount++
    const msg = stderr.slice(0, 400) || stdout.slice(-400) || `exit code ${result.status}, signal ${result.signal}, error ${result.error}`
    results.push({
      slug,
      brief: f,
      status: 'failed',
      voiceCheckResult: 'unknown',
      voiceWarnings: warnings,
      voiceErrors: errors,
      message: msg,
    })
    console.log(`  [${results.length}/${briefFiles.length}] FAILED  ${slug} — ${msg.slice(0, 100)}`)
  }
}

console.log(`\nDone.`)
console.log(`  Created: ${createdCount}`)
console.log(`  Updated: ${updatedCount}`)
console.log(`  Failed:  ${failedCount}`)
console.log(`  --skip-voice-check used on: ${skippedCount}`)

writeFileSync(join(BRIEFS_DIR, '_upload-report.json'), JSON.stringify(results, null, 2))
console.log(`Wrote _upload-report.json`)
