/**
 * Tiny .env.credentials loader for the Stripe dev/ops scripts.
 *
 * `.env.credentials` lives at the repo root and is gitignored. From a git
 * worktree (nested inside the repo) it sits a few directories up, so we walk
 * parent directories from cwd until we find it. No dotenv dependency — a
 * minimal KEY=VALUE parser that only sets vars not already in the environment.
 *
 * Returns the resolved path (or null if it couldn't be found).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export function loadEnvCredentials(): string | null {
  let dir = process.cwd()
  // Walk up to the filesystem root looking for .env.credentials.
  for (let i = 0; i < 12; i++) {
    const candidate = join(dir, '.env.credentials')
    if (existsSync(candidate)) {
      applyEnvFile(candidate)
      return candidate
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function applyEnvFile(path: string): void {
  const text = readFileSync(path, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    // Strip matching surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

/**
 * Upsert one or more KEY=VALUE pairs into the .env.credentials file in place,
 * preserving the rest of the file. Existing keys are replaced; new keys are
 * appended under a labelled section. Used by the sandbox-price script to persist
 * the generated STRIPE_PRICE_*_TEST ids.
 */
export function upsertEnvCredentials(
  path: string,
  updates: Record<string, string>,
  sectionLabel = '# Added by stripe scripts',
): void {
  let text = readFileSync(path, 'utf8')
  const remaining = { ...updates }

  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    if (ln === undefined) continue
    const eq = ln.indexOf('=')
    if (eq === -1) continue
    const key = ln.slice(0, eq).trim()
    if (key in remaining) {
      lines[i] = `${key}=${remaining[key]}`
      delete remaining[key]
    }
  }
  text = lines.join('\n')

  const toAppend = Object.entries(remaining)
  if (toAppend.length > 0) {
    if (!text.endsWith('\n')) text += '\n'
    text += `\n${sectionLabel}\n`
    for (const [k, v] of toAppend) text += `${k}=${v}\n`
  }

  writeFileSync(path, text, 'utf8')
}
