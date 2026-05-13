/**
 * bot-edit CLI — Claude second-pass editor for tutorial drafts.
 *
 * Reads a draft (TutorialUploadInput JSON), sends the body + title + subtitle
 * + excerpt to Claude with the Section 6b voice rules as a cached system
 * prompt, and emits a revised draft on stdout with a change log on stderr.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/bot-edit.ts <path-to-draft.json>
 *   pnpm --filter @homemade/db exec tsx scripts/bot-edit.ts <path-to-draft.json> --diff
 *
 * Requires ANTHROPIC_API_KEY in the environment (loaded from
 * .env.credentials at the repo root, same pattern as upload-tutorial.ts).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Walk up from this file looking for .env.credentials. Covers the main-repo
// layout (packages/db/scripts → 3 levels up to repo root) and the worktree
// layout (.claude/worktrees/<name>/packages/db/scripts → 6 levels up).
// `override: true` because some shells (e.g. Claude Code's sandbox) pre-set
// ANTHROPIC_API_KEY to an empty string and dotenv won't replace it otherwise.
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

import { botEdit } from '@homemade/ai'

interface CliFlags {
  diff: boolean
  path: string | null
}

function parseArgs(argv: string[]): CliFlags {
  let diff = false
  let path: string | null = null
  for (const arg of argv) {
    if (arg === '--diff') diff = true
    else if (arg.startsWith('--')) {
      // Unknown flag — ignored.
    } else if (!path) {
      path = arg
    }
  }
  return { diff, path }
}

interface DraftFile {
  slug: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  body: unknown
  [key: string]: unknown
}

function unifiedDiff(before: string, after: string): string {
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  // Cheap line-by-line diff — enough for eyeballing changes locally.
  const out: string[] = []
  const max = Math.max(beforeLines.length, afterLines.length)
  for (let i = 0; i < max; i++) {
    const a = beforeLines[i]
    const b = afterLines[i]
    if (a === b) continue
    if (a !== undefined) out.push(`- ${a}`)
    if (b !== undefined) out.push(`+ ${b}`)
  }
  return out.join('\n')
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))
  if (!flags.path) {
    console.error('Usage: bot-edit.ts <path-to-draft.json> [--diff]')
    process.exit(2)
  }

  const inputPath = isAbsolute(flags.path) ? flags.path : resolve(process.cwd(), flags.path)
  if (!existsSync(inputPath)) {
    console.error(`bot-edit: input file not found: ${inputPath}`)
    process.exit(2)
  }

  const raw = readFileSync(inputPath, 'utf8')
  let input: DraftFile
  try {
    input = JSON.parse(raw) as DraftFile
  } catch (err) {
    console.error(`bot-edit: input is not valid JSON: ${err instanceof Error ? err.message : err}`)
    process.exit(2)
  }

  if (!input.body) {
    console.error('bot-edit: input has no "body" field.')
    process.exit(2)
  }

  console.error(`bot-edit: editing "${input.slug ?? '(no slug)'}"`)
  const result = await botEdit({
    slug: input.slug ?? '',
    title: input.title ?? '',
    subtitle: input.subtitle ?? null,
    excerpt: input.excerpt ?? null,
    body: input.body,
  })

  console.error(`bot-edit: ${result.changes.length} changes`)
  result.changes.forEach((c, i) => {
    console.error(`  ${i + 1}. ${c.path}: ${c.note}`)
  })
  if (typeof result.usage.cacheReadInputTokens === 'number' && result.usage.cacheReadInputTokens > 0) {
    console.error(
      `bot-edit: tokens — input ${result.usage.inputTokens}, output ${result.usage.outputTokens}, cache hit ${result.usage.cacheReadInputTokens}`,
    )
  } else {
    console.error(
      `bot-edit: tokens — input ${result.usage.inputTokens}, output ${result.usage.outputTokens}` +
        (result.usage.cacheCreationInputTokens
          ? `, cache write ${result.usage.cacheCreationInputTokens}`
          : ''),
    )
  }

  const revisedInput: DraftFile = { ...input, body: result.revised }
  const output = JSON.stringify(revisedInput, null, 2)

  if (flags.diff) {
    const before = JSON.stringify(input, null, 2)
    process.stdout.write(unifiedDiff(before, output) + '\n')
  } else {
    process.stdout.write(output + '\n')
  }
}

main().catch((err) => {
  console.error(`bot-edit: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
