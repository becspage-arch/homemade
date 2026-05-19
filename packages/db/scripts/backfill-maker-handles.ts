/**
 * Backfill `User.displayHandle` for every row that doesn't already have one.
 *
 * Run once after the Session A migration applies. Idempotent — rows that
 * already have a handle are skipped, so re-running is safe.
 *
 * Slug source preference, in order:
 *   1. User.name (slugified)
 *   2. email local-part (slugified)
 *   3. literal "maker"  ← only if both above are blank, e.g. clerk-anon shadows
 *
 * Collisions are resolved by appending `-2`, `-3`, … until a free handle is
 * found. The HANDLE_RE check in user-state-actions.ts is the same shape as
 * the slug we generate (lowercase alphanumeric with `_-`, 2–32 chars,
 * starts + ends with alphanumeric).
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9_-]{0,30}[a-z0-9])?$/

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

function baseHandleFor(user: {
  name: string | null
  email: string
}): string {
  if (user.name) {
    const s = slugify(user.name)
    if (s.length >= 2) return s
  }
  const local = user.email.split('@')[0] ?? ''
  if (local) {
    const s = slugify(local)
    if (s.length >= 2) return s
  }
  return 'maker'
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const totalUsers = await prisma.user.count()
  const before = await prisma.user.count({ where: { displayHandle: { not: null } } })

  const needHandle = await prisma.user.findMany({
    where: { displayHandle: null },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Total users: ${totalUsers}`)
  console.log(`Already have handle: ${before}`)
  console.log(`Need handle: ${needHandle.length}`)

  // Cache of handles assigned during this run so the in-memory uniqueness
  // check doesn't need a round-trip per candidate suffix.
  const used = new Set<string>(
    (
      await prisma.user.findMany({
        where: { displayHandle: { not: null } },
        select: { displayHandle: true },
      })
    )
      .map((u) => u.displayHandle)
      .filter((h): h is string => h != null),
  )

  let assigned = 0
  let skippedInvalid = 0

  for (const u of needHandle) {
    const base = baseHandleFor(u)
    if (!HANDLE_RE.test(base)) {
      // Fall back to "maker" + creation order if the slugified base would
      // not pass validation (e.g. a base that is purely numeric).
      const safe = `maker-${u.id.slice(-6)}`
      const candidate = safe
      if (used.has(candidate)) {
        skippedInvalid += 1
        continue
      }
      await prisma.user.update({
        where: { id: u.id },
        data: { displayHandle: candidate },
      })
      used.add(candidate)
      assigned += 1
      continue
    }

    let candidate = base
    let n = 2
    while (used.has(candidate)) {
      candidate = `${base}-${n}`
      if (candidate.length > 32) {
        // truncate base to keep total <= 32
        const room = 32 - `-${n}`.length
        candidate = `${base.slice(0, room)}-${n}`
      }
      n += 1
      if (n > 9999) {
        candidate = `maker-${u.id.slice(-6)}`
        break
      }
    }

    await prisma.user.update({
      where: { id: u.id },
      data: { displayHandle: candidate },
    })
    used.add(candidate)
    assigned += 1
  }

  const after = await prisma.user.count({ where: { displayHandle: { not: null } } })
  console.log(`\nAssigned this run: ${assigned}`)
  console.log(`Skipped (invalid + clash): ${skippedInvalid}`)
  console.log(`Total users with handle now: ${after} / ${totalUsers}`)
  if (after !== totalUsers) {
    console.error(`!! Some users still lack a handle (${totalUsers - after} missing)`)
    process.exit(1)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
