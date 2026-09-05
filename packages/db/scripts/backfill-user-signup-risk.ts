/**
 * backfill-user-signup-risk — fills `emailDomain` / `signupRiskScore` /
 * `signupRiskReasons` for every existing account that predates the
 * 2026100500000_user_signup_risk migration. New signups get these fields at
 * creation time (Clerk webhook + JIT provisioning in
 * apps/web/src/lib/get-current-user.ts); this is a one-off catch-up for
 * everyone who signed up before that shipped.
 *
 * Idempotent — skips any row whose `emailDomain` is already set, so a re-run
 * only touches rows the earlier run didn't reach. Never sets `signupIp` /
 * `signupUserAgent`: nobody's original signup IP is recoverable after the
 * fact, so those stay null for backfilled rows (same as any account created
 * by the Clerk webhook rather than the JIT path — see get-current-user.ts).
 *
 *   pnpm --filter @homemade/db exec tsx scripts/backfill-user-signup-risk.ts
 *
 * Runs against whichever database DATABASE_URL points at.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'
// Pure, Next-free modules — safe to import across the package boundary.
// Keep this backfill in sync with apps/web/src/lib/signup-risk.ts if the
// risk rules there ever change.
import { computeSignupRisk } from '../../../apps/web/src/lib/signup-risk'

const BATCH_SIZE = 200

async function main() {
  let scanned = 0
  let updated = 0
  const riskyEmails: string[] = []

  // Every processed row leaves the `emailDomain: null` set, so re-querying
  // the same filter each pass naturally advances — no cursor bookkeeping
  // needed, and a re-run of the whole script is a safe no-op once done.
  for (;;) {
    const users = await prisma.user.findMany({
      where: { emailDomain: null },
      take: BATCH_SIZE,
      orderBy: { id: 'asc' },
      select: { id: true, email: true, name: true },
    })
    if (users.length === 0) break

    for (const user of users) {
      scanned++
      const risk = computeSignupRisk({ email: user.email, name: user.name })
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // A malformed email with no "@" would leave emailDomain null and
          // loop forever against the `emailDomain: null` filter above —
          // fall back to "" so every row always leaves the unprocessed set.
          emailDomain: risk.emailDomain ?? '',
          signupRiskScore: risk.riskScore,
          signupRiskReasons: risk.riskReasons,
        },
      })
      updated++
      if (risk.riskScore >= 2) riskyEmails.push(user.email)
    }
  }

  console.log(`Scanned ${scanned} accounts with no emailDomain on file.`)
  console.log(`Updated ${updated}.`)
  console.log(`${riskyEmails.length} score >= 2 (Likely spam candidates):`)
  for (const email of riskyEmails) console.log(`  - ${email}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
