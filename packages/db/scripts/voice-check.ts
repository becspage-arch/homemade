/**
 * voice-check CLI.
 *
 * Reads a draft (a JSON file matching `TutorialUploadInput`, or the bare body
 * JSON, or anything with a `body` field) and runs the deterministic
 * Section 6b voice rules over the prose-bearing strings.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check.ts <path-to-draft.json>
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check.ts --stdin
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check.ts --stdin --json
 *
 * Exit codes:
 *   0 — clean
 *   1 — warnings only
 *   2 — errors (upload pipeline blocks on this)
 */

import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

import { exitCodeFor, formatReport, runVoiceCheck } from './voice-check-lib.js'

interface CliFlags {
  json: boolean
  stdin: boolean
  path: string | null
}

function parseArgs(argv: string[]): CliFlags {
  let json = false
  let stdin = false
  let path: string | null = null

  for (const arg of argv) {
    if (arg === '--json') json = true
    else if (arg === '--stdin') stdin = true
    else if (arg.startsWith('--')) {
      // Unknown flag — ignored.
    } else if (!path) {
      path = arg
    }
  }

  return { json, stdin, path }
}

async function readStdin(): Promise<string> {
  return new Promise((resolveFn, rejectFn) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      data += chunk
    })
    process.stdin.on('end', () => resolveFn(data))
    process.stdin.on('error', rejectFn)
  })
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))

  if (!flags.stdin && !flags.path) {
    console.error(
      'Usage: voice-check.ts <path-to-draft.json> [--json]\n' +
        '       voice-check.ts --stdin [--json]',
    )
    process.exit(2)
  }

  let raw: string
  if (flags.stdin) {
    raw = await readStdin()
  } else {
    const p = isAbsolute(flags.path!) ? flags.path! : resolve(process.cwd(), flags.path!)
    if (!existsSync(p)) {
      console.error(`voice-check: input file not found: ${p}`)
      process.exit(2)
    }
    raw = readFileSync(p, 'utf8')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error(
      `voice-check: input is not valid JSON: ${err instanceof Error ? err.message : err}`,
    )
    process.exit(2)
  }

  const report = runVoiceCheck(parsed)

  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  } else {
    process.stdout.write(formatReport(report) + '\n')
  }

  process.exit(exitCodeFor(report))
}

main().catch((err) => {
  console.error(`voice-check: unexpected error: ${err instanceof Error ? err.message : err}`)
  process.exit(2)
})
