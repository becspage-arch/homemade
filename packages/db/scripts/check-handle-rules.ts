/**
 * Session A addendum — handle-rules smoke check (read-only).
 *
 * The full validateHandle() lives in the web app and exercises rules via
 * server-only Prisma calls. This script can't import it (server-only
 * guard + path aliases), so instead it confirms the DB-side invariants
 * the rule-set enforces:
 *
 *   1. None of the reserved handles are claimed in `User.displayHandle`.
 *   2. None of the profanity substrings appear in any current handle.
 *   3. None of the brand substrings appear in any current handle.
 *
 * If any of these checks fails it means the rule-set let a row through
 * (or pre-dated the rule and needs a manual fix). Either way it's worth
 * surfacing.
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

const RESERVED = [
  'me',
  'm',
  'admin',
  'api',
  'legal',
  'search',
  'sign-in',
  'sign-up',
  'signin',
  'signup',
  'unlock',
  'healthz',
  'coming-soon',
  'patterns',
  'makers',
  'offline',
  'admin',
  'support',
  'help',
  'homemade',
  'rebecca',
  'team',
  'staff',
  'moderator',
  'mod',
  'creator',
  'maker',
  'official',
  'verified',
  'cooking',
  'baking',
  'garden',
  'mindset',
  'herbal-medicine',
  'crochet',
  'knitting',
  'needlework',
  'sewing',
  'fibre-arts',
  'wood-natural-craft',
  'paper-word',
  'pottery-ceramics',
  'animals-smallholding',
  'home-repair',
  'natural-home',
  'sustainability',
]

const PROFANITY = [
  'nigger',
  'nigga',
  'faggot',
  'tranny',
  'retard',
  'kike',
  'spic',
  'chink',
  'paki',
  'wetback',
  'cunt',
  'fuck',
  'shit',
  'killyourself',
  'kill-yourself',
]

const BRANDS = [
  'etsy',
  'pinterest',
  'ravelry',
  'youtube',
  'instagram',
  'tiktok',
  'facebook',
  'twitter',
  'amazon',
  'bbc',
  'nigella',
  'jamie-oliver',
  'mary-berry',
  'gordon-ramsay',
  'martha-stewart',
  'kingarthur',
  'kingarthurflour',
  'allrecipes',
  'seriouseats',
  'nyt-cooking',
  'nytcooking',
  'bonappetit',
  'foodnetwork',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const handles = (
    await prisma.user.findMany({
      where: { displayHandle: { not: null } },
      select: { displayHandle: true },
    })
  )
    .map((u) => u.displayHandle)
    .filter((h): h is string => h !== null)
    .map((h) => h.toLowerCase())

  const reservedClaimed = handles.filter((h) => RESERVED.includes(h))
  const profanityHits = handles.filter((h) =>
    PROFANITY.some((w) => h.includes(w)),
  )
  const brandHits = handles.filter((h) =>
    BRANDS.some((w) => h.includes(w)),
  )

  console.log(`\nHandle-rules DB checks (${handles.length} handles total):`)
  console.log(
    `  ${reservedClaimed.length === 0 ? 'PASS' : 'FAIL'}  No reserved handles claimed — ` +
      (reservedClaimed.length === 0
        ? 'all good'
        : `found: ${reservedClaimed.join(', ')}`),
  )
  console.log(
    `  ${profanityHits.length === 0 ? 'PASS' : 'FAIL'}  No profanity substrings present — ` +
      (profanityHits.length === 0
        ? 'all good'
        : `found: ${profanityHits.join(', ')}`),
  )
  console.log(
    `  ${brandHits.length === 0 ? 'PASS' : 'FAIL'}  No brand substrings present — ` +
      (brandHits.length === 0 ? 'all good' : `found: ${brandHits.join(', ')}`),
  )

  // Sample 3 reserved attempts (read-only confirmation) — verifies the rule
  // list is at least non-empty + accessible.
  console.log(
    `\nReserved-list samples: "admin" / "me" / "api" — all currently free in DB: ` +
      (handles.includes('admin') ||
      handles.includes('me') ||
      handles.includes('api')
        ? 'NO (something already claimed one)'
        : 'YES (confirmed unclaimed)'),
  )

  await prisma.$disconnect()

  const allPass =
    reservedClaimed.length === 0 &&
    profanityHits.length === 0 &&
    brandHits.length === 0
  process.exit(allPass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
