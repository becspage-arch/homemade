/**
 * Prepend a mandatory pre-read block referencing
 * docs/voice-spec-quick-reference.md to every per-category author prompt
 * and every autopilot SKILL file. Idempotent — re-running on a file that
 * already has the block is a no-op.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const MARK = '<!-- voice-spec-quick-reference-injected -->'

const AUTHOR_PROMPT_BLOCK = `${MARK}

## Voice — MANDATORY pre-read

Before drafting any tutorial brief in this category, read
\`docs/voice-spec-quick-reference.md\` end-to-end. The worked
bad → good rewrites and the 10-point self-critique in §5 are not
suggestions — they are the bar every opening paragraph is measured
against. If any answer in §5 self-critique is "no", rewrite before
running voice-check.

The autopilot batch tail also runs the qc-fix routine on
\`--recently-published\` tutorials. New rules: no subjective
"twelve minutes of work" claims (the schema carries timeMinutes,
yieldDescription, servings — that's where time lives), no botanical
lecture in the orientation, no clinical / Latin vocabulary in body
prose, no academic citations in body prose. See §4 of the quick
reference for the full "don't" list.

---

`

const AUTOPILOT_SKILL_BLOCK = `${MARK}

## Voice — MANDATORY self-critique gate (before voice-check)

After Sonnet has drafted each tutorial brief, BEFORE invoking the
voice-check CLI, force a self-critique pass:

1. Read the opening paragraph aloud.
2. Walk the 10-point self-critique in \`docs/voice-spec-quick-reference.md\` §5.
3. If any answer is "no" — rewrite the paragraph and re-read.
4. Compare the opening shape to the type's worked rewrite in §3 of the
   quick reference. If the draft doesn't read like the "Good" column,
   rewrite.
5. Only then run \`tutorial:voice-check\`.

Skipping this gate is the failure mode that ships drafts that PASS
voice-check (binary rules) but FAIL the Mary Berry test (register,
templated feel). The gate exists because voice-check can't tell the
difference between "passes rules" and "in voice".

---

`

function injectInto(path: string, block: string): boolean {
  if (!existsSync(path)) return false
  const content = readFileSync(path, 'utf8')
  if (content.includes(MARK)) {
    console.log(`  skip (already injected): ${path}`)
    return false
  }
  // Insert AFTER the H1 + the first blank line, so the doc starts with
  // the existing title then the mandatory block.
  const lines = content.split('\n')
  let insertIdx = 0
  // Find the first non-frontmatter, non-empty H1 line and place the block
  // after the next blank line.
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.startsWith('# ')) {
      // Skip to next blank line
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j]!.trim() === '') {
          insertIdx = j + 1
          break
        }
      }
      break
    }
    // For frontmatter docs, skip the --- block
    if (i === 0 && lines[0] === '---') {
      let endFm = -1
      for (let j = 1; j < lines.length; j++) {
        if (lines[j] === '---') { endFm = j; break }
      }
      if (endFm > 0) i = endFm
      continue
    }
  }
  if (insertIdx === 0) insertIdx = 0
  const newLines = [...lines.slice(0, insertIdx), block, ...lines.slice(insertIdx)]
  writeFileSync(path, newLines.join('\n'), 'utf8')
  console.log(`  injected: ${path}`)
  return true
}

function main() {
  const REPO_ROOT = resolve(__dirname, '..')

  // Author prompts (docs/*-author.md + tutorial-author.md)
  const docsDir = resolve(REPO_ROOT, 'docs')
  const authorPrompts = readdirSync(docsDir).filter((f) => f.endsWith('-author.md') || f === 'tutorial-author.md')
  console.log(`Injecting author-prompt block into ${authorPrompts.length} files:`)
  let authorChanged = 0
  for (const fn of authorPrompts) {
    if (injectInto(resolve(docsDir, fn), AUTHOR_PROMPT_BLOCK)) authorChanged++
  }
  console.log(`Author prompts updated: ${authorChanged}/${authorPrompts.length}`)

  // Autopilot SKILL files (~/.claude/scheduled-tasks/autopilot-*/SKILL.md)
  const SCHEDULED_TASKS = resolve(process.env.HOME ?? process.env.USERPROFILE ?? '', '.claude/scheduled-tasks')
  const altScheduled = 'C:\\Users\\Rebecca\\.claude\\scheduled-tasks'
  const scheduledDir = existsSync(SCHEDULED_TASKS) ? SCHEDULED_TASKS : altScheduled
  if (!existsSync(scheduledDir)) {
    console.log(`(no scheduled-tasks dir found at ${scheduledDir}; skipping autopilot SKILLs)`)
  } else {
    const autopilotDirs = readdirSync(scheduledDir).filter((d) =>
      d.startsWith('autopilot-')
    )
    console.log(`\nInjecting autopilot SKILL block into ${autopilotDirs.length} routines:`)
    let pilotChanged = 0
    for (const d of autopilotDirs) {
      const skillPath = resolve(scheduledDir, d, 'SKILL.md')
      if (injectInto(skillPath, AUTOPILOT_SKILL_BLOCK)) pilotChanged++
    }
    console.log(`Autopilot SKILLs updated: ${pilotChanged}/${autopilotDirs.length}`)
  }
}

main()
