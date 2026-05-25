/**
 * Shared helper for scripts that call Flux at bulk volume. When the Flux
 * client throws FluxBillingError, write a clear halt-signal file at
 * docs/_flux-billing-halt.md and exit the process. Rebecca tops up at
 * fal.ai/dashboard/billing and re-runs the script — it'll pick up where
 * it left off.
 *
 * Use:
 *   try {
 *     await generateWithFluxSchnell(input)
 *   } catch (err) {
 *     if (err instanceof FluxBillingError) {
 *       writeFluxBillingHalt(err, { script: 'rescue-procedural-via-flux', processed: i, total })
 *       process.exit(2)
 *     }
 *     throw err
 *   }
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { FluxBillingError } from './flux-schnell'

export interface HaltContext {
  script: string
  processed: number
  total: number
  extra?: Record<string, string | number>
}

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

export function writeFluxBillingHalt(err: FluxBillingError, ctx: HaltContext): string {
  const now = new Date().toISOString()
  const path = resolveHaltPath()
  mkdirSync(dirname(path), { recursive: true })
  const remaining = ctx.total - ctx.processed
  const lines: string[] = []
  lines.push('# fal.ai billing halt')
  lines.push('')
  lines.push(`**Stopped at:** ${now}`)
  lines.push(`**Script:** \`${ctx.script}\``)
  lines.push(`**Progress:** ${ctx.processed} / ${ctx.total} processed; **${remaining} remaining**`)
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
  lines.push('1. Top up at https://fal.ai/dashboard/billing')
  lines.push(`2. Re-run \`${ctx.script}\` — the script is idempotent and resumes from where it left off`)
  lines.push('3. Delete this file once recovered')
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
  console.error(`Top up at fal.ai/dashboard/billing, then re-run.`)
  return path
}
