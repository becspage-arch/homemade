/**
 * upload-batch — iterate a directory of TutorialUploadInput JSON files and
 * call upload-tutorial.ts for each one. Used by Phase 8 Step 12 bulk batches.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/upload-batch.ts \
 *     docs/bulk-batch-001-briefs \
 *     --status PUBLISHED \
 *     --report docs/bulk-batch-001-upload-report.json
 *
 * Iteration:
 *   - Reads all *.json files in the directory (skips _-prefixed and dot-prefixed).
 *   - For each, spawns the upload-tutorial child process inheriting the same
 *     CLI flags after --report.
 *   - Captures stdout / exit code, writes an aggregated report to --report.
 *   - Continues on individual failures so a bad draft doesn't kill the run.
 *
 * Skip rules:
 *   - File starts with `_` or `.` (metadata + scratch files).
 *   - Filename in the optional --skip-slugs comma list.
 */

import { spawn } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

interface BatchFlags {
  dir: string
  status: 'DRAFT' | 'PUBLISHED'
  reportPath: string | null
  skipSlugs: Set<string>
  limit: number | null
  /** Category slug(s) to pass to fixup-hero-fill after a PUBLISHED batch. */
  heroCategory: string | null
  /** Skip the automatic post-batch hero fill (e.g. for testing). */
  skipHeroFill: boolean
  /** Pass --no-ai-fallback through to fixup-hero-fill. */
  heroNoAi: boolean
}

function parseArgs(argv: string[]): BatchFlags | null {
  let dir: string | null = null
  let status: 'DRAFT' | 'PUBLISHED' = 'DRAFT'
  let reportPath: string | null = null
  const skipSlugs = new Set<string>()
  let limit: number | null = null
  let heroCategory: string | null = null
  let skipHeroFill = false
  let heroNoAi = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--status') {
      const raw = argv[++i]
      if (raw !== 'DRAFT' && raw !== 'PUBLISHED') {
        console.error(`--status must be DRAFT or PUBLISHED, got "${raw}"`)
        return null
      }
      status = raw
      continue
    }
    if (arg === '--report') {
      reportPath = argv[++i] ?? null
      continue
    }
    if (arg === '--skip-slugs') {
      const raw = argv[++i] ?? ''
      raw.split(',').map(s => s.trim()).filter(Boolean).forEach(s => skipSlugs.add(s))
      continue
    }
    if (arg === '--skip-file') {
      const path = argv[++i]
      if (path && existsSync(path)) {
        readFileSync(path, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean).forEach(s => skipSlugs.add(s))
      }
      continue
    }
    if (arg === '--limit') {
      const n = Number(argv[++i])
      if (Number.isFinite(n) && n > 0) limit = Math.floor(n)
      continue
    }
    if (arg === '--hero-category') {
      heroCategory = argv[++i] ?? null
      continue
    }
    if (arg === '--skip-hero-fill') {
      skipHeroFill = true
      continue
    }
    if (arg === '--hero-no-ai') {
      heroNoAi = true
      continue
    }
    if (!dir) {
      dir = arg
      continue
    }
  }
  if (!dir) {
    console.error(
      'Usage: upload-batch.ts <dir> [--status DRAFT|PUBLISHED] [--report path] ' +
      '[--skip-slugs a,b,c] [--limit N] [--hero-category slug] [--skip-hero-fill] [--hero-no-ai]',
    )
    return null
  }
  return { dir, status, reportPath, skipSlugs, limit, heroCategory, skipHeroFill, heroNoAi }
}

interface UploadEntry {
  slug: string
  brief: string
  status: 'created' | 'updated' | 'skipped' | 'failed'
  exitCode: number
  voice: 'clean' | 'warnings' | 'errors' | 'unknown'
  message: string
}

function classifyVoice(output: string): UploadEntry['voice'] {
  if (output.includes('voice-check: ERRORS')) return 'errors'
  if (output.includes('voice-check: WARNINGS')) return 'warnings'
  if (output.includes('voice-check: clean')) return 'clean'
  return 'unknown'
}

async function runUpload(briefPath: string, status: 'DRAFT' | 'PUBLISHED'): Promise<{ code: number; out: string }> {
  return new Promise(resolveProm => {
    const args = [
      '--filter',
      '@homemade/db',
      'exec',
      'tsx',
      'scripts/upload-tutorial.ts',
      briefPath,
      '--status',
      status,
    ]
    const child = spawn('pnpm', args, { shell: process.platform === 'win32', cwd: process.cwd() })
    let out = ''
    child.stdout.on('data', d => { out += d.toString() })
    child.stderr.on('data', d => { out += d.toString() })
    child.on('close', code => resolveProm({ code: code ?? 1, out }))
  })
}

async function runHeroFill(opts: {
  category: string | null
  noAi: boolean
  limit: number | null
}): Promise<void> {
  return new Promise(resolveProm => {
    const args = ['--filter', '@homemade/db', 'exec', 'tsx', 'scripts/fixup-hero-fill.ts']
    if (opts.category) args.push('--category', opts.category)
    if (opts.noAi) args.push('--no-ai-fallback')
    if (opts.limit) args.push('--limit', String(opts.limit))
    const child = spawn('pnpm', args, {
      shell: process.platform === 'win32',
      cwd: process.cwd(),
      stdio: 'inherit',
    })
    child.on('close', () => resolveProm())
  })
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))
  if (!flags) process.exit(1)

  const absDir = resolve(process.cwd(), flags.dir)
  if (!existsSync(absDir)) {
    console.error(`Directory not found: ${absDir}`)
    process.exit(1)
  }

  const files = readdirSync(absDir)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.startsWith('_') && !f.startsWith('.'))
    .filter(f => !flags.skipSlugs.has(f.replace(/\.json$/, '')))
    .sort()

  const limited = flags.limit ? files.slice(0, flags.limit) : files
  const entries: UploadEntry[] = []

  console.log(`Batch upload: ${limited.length} file(s) from ${absDir}, status=${flags.status}`)
  for (let i = 0; i < limited.length; i++) {
    const file = limited[i]!
    const slug = file.replace(/\.json$/, '')
    const briefPath = join(absDir, file)
    process.stdout.write(`[${i + 1}/${limited.length}] ${slug} ... `)

    const { code, out } = await runUpload(briefPath, flags.status)
    const voice = classifyVoice(out)
    let status: UploadEntry['status'] = 'failed'
    let message = `exit ${code}`
    if (code === 0) {
      if (/\[upload-tutorial\]\s+UPDATED/.test(out)) {
        status = 'updated'
        message = 'UPDATED'
      } else if (/\[upload-tutorial\]\s+CREATED/.test(out)) {
        status = 'created'
        message = 'CREATED'
      } else {
        status = 'created'
        message = `exit 0 (mode unknown)`
      }
    } else {
      const errMatch = out.match(/(voice-check: ERRORS[\s\S]*?)(?:\n\n|$)/)
      if (errMatch) message = `voice errors: ${errMatch[0]?.split('\n')[0]?.trim() ?? ''}`
      else {
        const tail = out.trim().split('\n').slice(-3).join(' | ')
        message = tail.slice(0, 240)
      }
    }
    entries.push({ slug, brief: file, status, exitCode: code, voice, message })
    console.log(`${status} (voice: ${voice})`)
  }

  if (flags.reportPath) {
    const abs = resolve(process.cwd(), flags.reportPath)
    writeFileSync(abs, JSON.stringify(entries, null, 2))
    console.log(`Report written: ${abs}`)
  }

  const failed = entries.filter(e => e.status === 'failed')
  const created = entries.filter(e => e.status === 'created')
  const updated = entries.filter(e => e.status === 'updated')
  console.log(`\nSummary: ${created.length} created, ${updated.length} updated, ${failed.length} failed`)

  // Auto-source heroes for any just-published tutorials that landed without one.
  // Root cause fix: the upload path never calls sourceHeroImage, so without this
  // step every batch would publish with heroMediaId = null.
  const published = created.length + updated.length
  if (flags.status === 'PUBLISHED' && published > 0 && !flags.skipHeroFill) {
    console.log(`\nAuto hero-fill: sourcing heroes for ${published} newly published tutorial(s)...`)
    await runHeroFill({
      category: flags.heroCategory,
      noAi: flags.heroNoAi,
      limit: published,
    })
  }

  if (failed.length > 0) process.exit(0) // don't fail the batch; per-recipe failures captured in report
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
