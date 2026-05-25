/**
 * Shared helper for scripts that call Flux at bulk volume. When the Flux
 * client throws FluxBillingError, this helper:
 *   1. Writes a halt-signal file at docs/_flux-billing-halt.md so the
 *      filesystem state is human-discoverable.
 *   2. Creates a SYSTEM Notification row for Rebecca with a cost
 *      estimate for the remaining backlog. Push notifications fire
 *      automatically per the existing notify() pipeline so she gets
 *      pinged on phone + admin UI without checking files.
 *   3. Returns — does NOT exit. Callers decide whether to continue
 *      processing (e.g. fixup-hero-fill keeps going for tutorials that
 *      don't need Flux) or to stop (e.g. rescue-procedural-via-flux
 *      where every entry needs Flux).
 *
 * Idempotent within a single run via the `notifiedThisRun` argument —
 * callers pass a shared boolean ref so we only ping Rebecca once per
 * script invocation regardless of how many tutorials hit billing failures.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { FluxBillingError } from './flux-schnell'

export interface HaltContext {
  script: string
  processed: number
  total: number
  extra?: Record<string, string | number>
  /** Optional Prisma client for creating the SYSTEM notification row.
   *  Pass `null` when calling from a context that doesn't have Prisma
   *  available (e.g. unit tests). When present, this helper queries the
   *  outstanding UNSET tutorial count and bakes a cost estimate into
   *  the notification body. */
  prisma?: PrismaLike | null
}

/** Minimal Prisma surface the helper needs. Typed loose so the apps/web
 *  package doesn't need to import the full @prisma/client type. */
export interface PrismaLike {
  user: { findUnique: (args: { where: { email: string }; select: { id: true } }) => Promise<{ id: string } | null> }
  tutorial: { count: (args: { where: Record<string, unknown> }) => Promise<number> }
  notification: { create: (args: { data: { userId: string; type: 'SYSTEM'; body: string; href?: string | null } }) => Promise<{ id: string }> }
}

const COST_PER_IMAGE_GBP = 0.0024
const REBECCA_EMAIL = 'rebecca@homemade.education'

function resolveHaltPath(): string {
  // Find the repo root by walking up from cwd looking for a marker. Falls
  // back to cwd/docs/. This is necessary because scripts launched via
  // `pnpm --filter @homemade/db exec` have cwd = packages/db, not repo root.
  const { existsSync } = require('node:fs') as typeof import('node:fs')
  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml')) || existsSync(resolve(dir, '.git'))) {
      return resolve(dir, 'docs', '_flux-billing-halt.md')
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return resolve(process.cwd(), 'docs', '_flux-billing-halt.md')
}

/**
 * Estimate cost (£) to fill the remaining UNSET tutorials. The 30 %
 * Flux-gap is the rate observed in the 2026-05-25 audit: of all hero
 * fills after Pixabay was dropped, ~30 % fell through the free-source
 * chain to Flux. The other 70 % were satisfied by Pexels / Unsplash /
 * Wikimedia at no API cost.
 */
function estimateTopUpGBP(remainingUnset: number): number {
  const fluxCallsExpected = Math.ceil(remainingUnset * 0.30)
  return Math.max(0.10, Math.round(fluxCallsExpected * COST_PER_IMAGE_GBP * 100) / 100)
}

export async function writeFluxBillingHalt(err: FluxBillingError, ctx: HaltContext): Promise<string> {
  const now = new Date().toISOString()
  const path = resolveHaltPath()
  mkdirSync(dirname(path), { recursive: true })

  // Query the live UNSET / billing-pending tutorial count if Prisma was
  // passed. Used in the notification body to tell Rebecca how much credit
  // is needed to clear the backlog.
  let remainingUnset = ctx.total - ctx.processed
  let topUpEstimateGBP = estimateTopUpGBP(remainingUnset)
  if (ctx.prisma) {
    try {
      const liveUnset = await ctx.prisma.tutorial.count({
        where: { status: 'PUBLISHED', heroMediaId: null },
      })
      remainingUnset = liveUnset
      topUpEstimateGBP = estimateTopUpGBP(liveUnset)
    } catch {
      // Notification will fall back to the run-local estimate. Not fatal.
    }
  }
  const remaining = ctx.total - ctx.processed
  const lines: string[] = []
  lines.push('# fal.ai billing halt')
  lines.push('')
  lines.push(`**Stopped at:** ${now}`)
  lines.push(`**Script:** \`${ctx.script}\``)
  lines.push(`**Progress:** ${ctx.processed} / ${ctx.total} processed; **${remaining} remaining this run**`)
  lines.push(`**Backlog (PUBLISHED with no hero):** ${remainingUnset}`)
  lines.push(`**Estimated top-up to finish:** £${topUpEstimateGBP.toFixed(2)} (£${COST_PER_IMAGE_GBP} per image, assumes 30 % Flux gap)`)
  lines.push('')
  lines.push('## What happened')
  lines.push('')
  lines.push('fal.ai returned HTTP 403 with a billing-related response:')
  lines.push('')
  lines.push('```')
  lines.push(err.body.slice(0, 600))
  lines.push('```')
  lines.push('')
  lines.push('## What to do')
  lines.push('')
  lines.push(`1. Top up at https://fal.ai/dashboard/billing (£${topUpEstimateGBP.toFixed(2)} suggested)`)
  lines.push('2. Tutorials that still need a hero stay with `heroMediaId = null`. The next autopilot batch picks them up automatically when Flux is healthy.')
  lines.push(`3. (Optional) Re-run \`${ctx.script}\` immediately — the script is idempotent`)
  lines.push('4. Delete this file once recovered')
  lines.push('')
  if (ctx.extra && Object.keys(ctx.extra).length > 0) {
    lines.push('## Context')
    lines.push('')
    for (const [k, v] of Object.entries(ctx.extra)) {
      lines.push(`- **${k}:** ${v}`)
    }
    lines.push('')
  }
  writeFileSync(path, lines.join('\n') + '\n', 'utf8')
  console.error('\n*** FAL.AI BILLING HALT ***')
  console.error(`Wrote ${path}`)
  console.error(`Backlog: ${remainingUnset} tutorials. Estimated top-up: £${topUpEstimateGBP.toFixed(2)}.`)

  // Create the SYSTEM notification so Rebecca gets push + in-admin alert
  // without having to check a filesystem path. One-per-run.
  if (ctx.prisma) {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { email: REBECCA_EMAIL },
        select: { id: true },
      })
      if (user) {
        const body =
          `fal.ai (Flux Schnell) balance exhausted. ` +
          `${remainingUnset} tutorials are waiting for a hero image. ` +
          `Estimated top-up to finish: £${topUpEstimateGBP.toFixed(2)}. ` +
          `Top up at fal.ai/dashboard/billing — the autopilot retries on the next batch.`
        await ctx.prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM',
            body,
            href: '/admin/system',
          },
        })
        console.error(`Notification sent to ${REBECCA_EMAIL}.`)
      } else {
        console.error(`Could not find user ${REBECCA_EMAIL} — notification skipped.`)
      }
    } catch (notifyErr) {
      const msg = notifyErr instanceof Error ? notifyErr.message : String(notifyErr)
      console.error(`Notification write failed: ${msg}`)
    }
  }

  return path
}
