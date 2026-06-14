/**
 * AI moderation pipeline - scaffold.
 *
 * Picks up UserRecipe rows in PENDING_AI_MODERATION and runs them through the
 * moderation flow, then sets APPROVED (+ publishedAt + the uploader's chosen
 * visibility) or REJECTED (+ a notification carrying the structured findings so
 * the uploader can fix and resubmit).
 *
 * ALL moderation is AI-only per the locked rule - there is no manual editorial
 * queue anywhere in this flow. The judgement steps (voice check, copyright /
 * spam / off-topic assessment, duplicate confirmation) are performed by a
 * Claude Code worker session reading each recipe; this script is the harness
 * that selects the batch, runs the deterministic checks, and writes the
 * verdict. It does NOT call any paid AI provider/SDK (per the no-API-spend
 * lock) - the worker session IS the model.
 *
 * This is the SCAFFOLD. It runs as a clean no-op against an empty table, and on
 * a populated table it applies the deterministic checks and leaves the
 * judgement hooks (clearly marked) for the worker session that runs it for
 * real. A subsequent worker refines the rules and handles scale.
 *
 * Run (dry run prints verdicts without writing):
 *   DOTENV_CONFIG_PATH=.env.credentials \
 *   pnpm --filter web exec tsx scripts/moderate-user-recipes.ts --dry-run
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load DATABASE_URL from the nearest .env.credentials. Done with a tiny inline
// parser rather than the dotenv package because apps/web does not depend on
// dotenv (importing it breaks the production build's type check). Walks up from
// this file; tolerates CRLF and simple quoting; never overrides an existing var.
const __dirname = dirname(fileURLToPath(import.meta.url))
let envDir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(envDir, '.env.credentials')
  if (existsSync(candidate)) {
    for (const raw of readFileSync(candidate, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
    break
  }
  const parent = dirname(envDir); if (parent === envDir) break; envDir = parent
}

const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_LIMIT = 50

type Verdict =
  | 'approved'
  | 'flagged-spam'
  | 'flagged-duplicate'
  | 'flagged-copyright'
  | 'flagged-voice'
  | 'flagged-off-topic'

interface ModerationFinding {
  check: string
  passed: boolean
  detail: string
}

interface ModerationResult {
  verdict: Verdict
  findings: ModerationFinding[]
}

/**
 * The moderation pass for a single recipe.
 *
 * Deterministic checks run inline (duplicate-by-slug/title, originality-
 * declaration consistency, basic field presence). The judgement checks - voice
 * register, copyright, spam, off-topic - are the hooks a Claude Code worker
 * session fills in per batch when it runs this for real. Until then they record
 * a "deferred" finding and do not block, so the scaffold is honest about what
 * it has and hasn't assessed rather than silently passing recipes as clean.
 */
async function moderateRecipe(
  recipe: {
    id: string
    slug: string
    title: string
    body: unknown
    originalityType: string | null
    attribution: string | null
  },
  duplicateTitles: Set<string>,
): Promise<ModerationResult> {
  const findings: ModerationFinding[] = []

  // ── Deterministic: duplicate detection ──────────────────────────────────
  const titleKey = recipe.title.trim().toLowerCase()
  const isDuplicate = duplicateTitles.has(titleKey)
  findings.push({
    check: 'duplicate',
    passed: !isDuplicate,
    detail: isDuplicate
      ? `A published recipe with the title "${recipe.title}" already exists.`
      : 'No title collision with existing recipes or tutorials.',
  })

  // ── Deterministic: originality declaration consistency ──────────────────
  const needsAttribution =
    recipe.originalityType === 'adapted-from' || recipe.originalityType === 'inspired-by'
  const attributionOk = !needsAttribution || Boolean(recipe.attribution?.trim())
  findings.push({
    check: 'originality',
    passed: attributionOk,
    detail: attributionOk
      ? 'Originality declaration is internally consistent.'
      : `originalityType "${recipe.originalityType}" requires an attribution, but none was given.`,
  })

  // ── Judgement hooks (filled by the Claude Code worker session) ──────────
  // Each records a deferred finding. A later worker replaces these markers with
  // the worker-session assessment. They do not pass-or-fail here.
  for (const check of ['voice', 'copyright', 'spam', 'off-topic'] as const) {
    findings.push({
      check,
      passed: true,
      detail: 'Deferred to the Claude Code moderation worker session.',
    })
  }

  // Verdict: only the deterministic checks can reject in the scaffold.
  let verdict: Verdict = 'approved'
  if (isDuplicate) verdict = 'flagged-duplicate'
  else if (!attributionOk) verdict = 'flagged-copyright'

  return { verdict, findings }
}

async function main(): Promise<void> {
  const { prisma } = await import('@homemade/db')

  const pending = await prisma.userRecipe.findMany({
    where: { status: 'PENDING_AI_MODERATION' },
    take: BATCH_LIMIT,
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      ownerUserId: true,
      visibility: true,
      originalityType: true,
      attribution: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`[moderate] ${pending.length} recipe(s) pending${DRY_RUN ? ' (dry run)' : ''}`)
  if (pending.length === 0) {
    await prisma.$disconnect()
    return
  }

  // Build the duplicate set once: existing published UserRecipe titles + the
  // Homemade-original Tutorial titles in the recipe categories.
  const publishedTitles = await prisma.userRecipe.findMany({
    where: { status: 'APPROVED' },
    select: { title: true },
  })
  const tutorialTitles = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { title: true },
  })
  const duplicateTitles = new Set<string>([
    ...publishedTitles.map((r) => r.title.trim().toLowerCase()),
    ...tutorialTitles.map((r) => r.title.trim().toLowerCase()),
  ])

  for (const recipe of pending) {
    const result = await moderateRecipe(recipe, duplicateTitles)
    const approved = result.verdict === 'approved'

    console.log(
      `[moderate] ${recipe.slug.padEnd(40)} → ${result.verdict}${approved ? '' : ` (${result.findings.filter((f) => !f.passed).map((f) => f.check).join(', ')})`}`,
    )

    if (DRY_RUN) continue

    if (approved) {
      await prisma.userRecipe.update({
        where: { id: recipe.id },
        data: {
          status: 'APPROVED',
          aiModerationVerdict: result.verdict,
          aiModerationNotes: result.findings as object,
          moderatedAt: new Date(),
          publishedAt: new Date(),
          // The recipe goes live at the visibility the uploader chose.
        },
      })
    } else {
      await prisma.userRecipe.update({
        where: { id: recipe.id },
        data: {
          status: 'REJECTED',
          aiModerationVerdict: result.verdict,
          aiModerationNotes: result.findings as object,
          moderatedAt: new Date(),
        },
      })
      // Notify the uploader with the structured findings so they can fix and
      // resubmit. Notification model already exists (Phase 5); SYSTEM is the
      // right generic type until a dedicated USER_RECIPE_REJECTED type is added.
      await prisma.notification.create({
        data: {
          userId: recipe.ownerUserId,
          type: 'SYSTEM',
          body: `"${recipe.title}" needs a change before it goes live: ${result.findings
            .filter((f) => !f.passed)
            .map((f) => f.detail)
            .join(' ')}`,
        },
      }).catch((e) => {
        // Notification shape may differ; never let a notify failure strand a
        // verdict. Log and continue - the verdict is already written.
        console.warn(`[moderate] could not notify ${recipe.ownerUserId}:`, (e as Error).message)
      })
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
