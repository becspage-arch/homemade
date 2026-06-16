/**
 * Mechanical voice-pass fix for PUBLISHED rows with em/en dashes and banned phrases.
 *
 * Reads the 105-slug worklist from packages/db/docs/voice-pass-worklist-2026-06-16.json,
 * fetches each Tutorial from the DB, applies mechanical substitutions in-place on
 * TipTap text nodes, re-runs a targeted voice check, and writes back.
 *
 * Substitutions:
 *   — (em dash) and – (en dash):
 *     - If the character after the dash (trimmed) is uppercase -> replace with ". "
 *     - Otherwise -> replace with ", "
 *   "perfect for" -> "good for"
 *   "ideal for"   -> "well-suited to"
 *   "fine for almost everyone" -> "" (delete, trim surrounding whitespace)
 *   "honest" / "honestly" / "frankly" / "genuinely" -> "" (delete word, tidy)
 *
 * After each fix the script re-scans for the same violations; rows that still
 * have violations after the mechanical pass are logged but NOT written back.
 *
 * Usage: tsx scripts/_voice-pass-mechanical-fix.ts
 * Dry-run: tsx scripts/_voice-pass-mechanical-fix.ts --dry-run
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

const DRY_RUN = process.argv.includes('--dry-run')

// ────────────────────────────────────────────────────────
// Slug worklist (105 slugs with em/en dash or banned phrase violations)
// ────────────────────────────────────────────────────────
const SLUGS = [
  "rose-oud-solid-perfume","soy-candle-lemon-verbena","inspecting-sealed-brood-for-chalkbrood",
  "horse-manure-hot-composting","gingerbread-men","how-to-choose-wool-for-felting",
  "cherry-bakewell-traybake","chelsea-buns","mishima-inlay-on-air-dry-clay",
  "ham-and-cheese-omelette","chocolate-cream-pie","seasoned-wood-primer",
  "rectangular-lace-shawl-crochet","heat-pump-controls-and-scheduling","macrame-hammock",
  "macrame-window-valance","polymer-clay-lentil-bead-set","infinity-cowl",
  "irish-whiskey-truffles","how-herbal-infusions-work","2x2-rib-fingerless-mitts-aran",
  "cabled-fingerless-mitts-dk","childs-cable-mittens","convertible-mitten-dk",
  "babka-cinnamon","pinch-pot-ring-dish","puff-stitch-cushion-cover",
  "needlepoint-continental-tent-stitch","polymer-clay-bead-set","push-cut-technique",
  "12v-shed-battery-bank","rabbit-breed-selection-for-meat","nuno-felting-on-cotton-muslin",
  "setting-up-a-hotbed","deckle-edge-and-waterleaf","apple-galette-rough-puff",
  "bourbon-biscuits","buttermilk-pie-southern","whittled-hazel-pot-stirrer",
  "harvesting-fibre-from-angora-and-cashmere-goats","needlepoint-algerian-eye-stitch",
  "needlepoint-brick-stitch","spinning-cashmere-fibre","spinning-merino-for-lace",
  "spinning-from-combed-top","hooked-rug-portrait-panel","proddy-rug-basics",
  "macrame-bottle-holder","macrame-wreath-frame-hanger","needlepoint-straight-gobelin-stitch",
  "ylang-ylang-jasmine-room-spray","origami-tulip-and-stem","album-cover-decoration",
  "decorated-paste-paper-endpapers","tabloid-broadsheet-fold-zine","window-cut-page-design",
  "folio-wallet-construction","fukuro-toji-pouch-binding","rocket-mass-heater-construction",
  "old-leather-binding-conservation","donauwellen","palets-bretons","lavender-lemon-wax-melts",
  "pintade-aux-choux","soy-driftwood-sea-salt-candle","soy-tobacco-vanilla-candle",
  "soy-candle-magnolia-peony","soy-candle-neroli-ylang","tallow-rose-soap",
  "coda-alla-vaccinara","soy-candle-apple-cinnamon","soy-candle-tobacco-vanilla",
  "soy-candle-sea-salt-driftwood","mercimek-corbasi","lard-cold-process-soap",
  "mostaccioli","chocolate-and-beetroot-cake","bakewell-tart","bayberry-soy-blend-candle",
  "black-pepper-amber-reed-diffuser","chocolate-fudge-cake","crochet-choosing-yarn-fibre",
  "rigatoni-alla-genovese","whittled-pine-butter-spreader","spinning-with-dog-hair",
  "lemon-verbena-sachets","danish-oil-finishing-technique","coconut-wax-jar-candle-coconut-lime",
  "cocoa-butter-vanilla-cold-process-soap","soy-candle-amber-oud","heirloom-cobweb-stole",
  "layered-soy-candle-lavender-vanilla","soy-candle-fig-cassis",
  "testing-honey-moisture-before-bottling","installing-an-open-mesh-floor",
  "patchwork-garter-squares","troubleshooting-farrowing-problems",
  "building-a-hay-rack-from-timber","managing-coccidiosis-in-lambs",
  "kraft-paper-journal-cover","front-loop-only-baby-blanket","slouchy-cowl",
  "lace-bottom-up-triangle","side-to-side-lace-shawl","cotton-garter-receiving-blanket",
]

// ────────────────────────────────────────────────────────
// Text-node substitution
// ────────────────────────────────────────────────────────

/**
 * Replace em/en dashes in a string.
 * Decision rule:
 *   - character immediately after the dash (after trimming) is uppercase -> ". "
 *   - otherwise -> ", "
 *
 * Pattern: optional spaces, dash, optional spaces
 */
function replaceDashes(text: string): string {
  return text.replace(/\s*[—–]\s*/g, (match, offset) => {
    const after = text.slice(offset + match.length)
    // If what follows starts with an uppercase letter, treat as sentence break.
    if (/^[A-Z]/.test(after.trimStart())) {
      return '. '
    }
    return ', '
  })
}

/** Delete a phrase and tidy up any double spaces left behind. */
function deletePhrase(text: string, phrase: string): string {
  // Case-insensitive. Surround with optional whitespace so we don't double-space.
  const re = new RegExp(`\\s*${escapeRegex(phrase)}\\s*`, 'gi')
  return text.replace(re, ' ').replace(/  +/g, ' ').trim()
}

/** Delete a word token and tidy up. */
function deleteWord(text: string, word: string): string {
  // Word boundary match, case-insensitive.
  const re = new RegExp(`\\b${escapeRegex(word)}\\b\\s*`, 'gi')
  return text.replace(re, '').replace(/  +/g, ' ').trim()
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function applySubstitutions(text: string): string {
  let t = text

  // 1. Dashes
  t = replaceDashes(t)

  // 2. Banned multi-word phrases (order matters: longest first to avoid partial hits)
  t = t.replace(/fine\s+for\s+almost\s+everyone/gi, '').replace(/  +/g, ' ').trim()
  t = t.replace(/perfect\s+for\b/gi, 'good for')
  t = t.replace(/ideal\s+for\b/gi, 'well-suited to')

  // 3. Single-word filler tokens
  t = deleteWord(t, 'honestly')
  t = deleteWord(t, 'honest')
  t = deleteWord(t, 'frankly')
  t = deleteWord(t, 'genuinely')

  return t
}

// ────────────────────────────────────────────────────────
// TipTap walker: mutate text nodes in place
// ────────────────────────────────────────────────────────

type TipTapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: unknown[]
  content?: TipTapNode[]
}

function walkAndFix(node: TipTapNode): boolean {
  let changed = false
  if (typeof node.text === 'string') {
    const fixed = applySubstitutions(node.text)
    if (fixed !== node.text) {
      node.text = fixed
      changed = true
    }
  }
  // Walk into attrs fields that carry prose strings
  if (node.attrs && typeof node.attrs === 'object') {
    for (const key of Object.keys(node.attrs)) {
      const val = node.attrs[key]
      if (typeof val === 'string') {
        const fixed = applySubstitutions(val)
        if (fixed !== val) {
          node.attrs[key] = fixed
          changed = true
        }
      }
      // suppliesCard / troubleshooter: items array with string fields
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object') {
            for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
              if (typeof v === 'string') {
                const fixed = applySubstitutions(v)
                if (fixed !== v) {
                  ;(item as Record<string, unknown>)[k] = fixed
                  changed = true
                }
              }
            }
          }
        }
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      if (walkAndFix(child)) changed = true
    }
  }
  return changed
}

// ────────────────────────────────────────────────────────
// Voice-violation re-check (targeted, not full voice check)
// ────────────────────────────────────────────────────────

const EM_DASH_RE = /[—–]/
const BANNED_PHRASE_RES = [
  /\bperfect\s+for\b/i,
  /\bideal\s+for\b/i,
  /fine\s+for\s+almost\s+everyone/i,
  /\bhonest\b/i,
  /\bhonestly\b/i,
  /\bfrankly\b/i,
  /\bgenuinely\b/i,
]

function collectAllText(node: TipTapNode): string[] {
  const out: string[] = []
  if (typeof node.text === 'string') out.push(node.text)
  if (node.attrs && typeof node.attrs === 'object') {
    for (const val of Object.values(node.attrs)) {
      if (typeof val === 'string') out.push(val)
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object') {
            for (const v of Object.values(item as Record<string, unknown>)) {
              if (typeof v === 'string') out.push(v)
            }
          }
        }
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) out.push(...collectAllText(c))
  }
  return out
}

function hasRemainingViolations(body: TipTapNode): string[] {
  const texts = collectAllText(body)
  const violations: string[] = []
  for (const t of texts) {
    if (EM_DASH_RE.test(t)) violations.push(`em/en dash in: "${t.slice(0, 80)}"`)
    for (const re of BANNED_PHRASE_RES) {
      const m = re.exec(t)
      if (m) violations.push(`banned phrase "${m[0]}" in: "${t.slice(0, 80)}"`)
    }
  }
  return violations
}

// ────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────

async function main() {
  console.log(`Voice-pass mechanical fix (${DRY_RUN ? 'DRY RUN' : 'LIVE'})`)
  console.log(`Processing ${SLUGS.length} slugs\n`)

  const results: {
    slug: string
    changed: boolean
    violations: string[]
    error?: string
  }[] = []

  let written = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i]!
    try {
      const row = await prisma.tutorial.findUnique({
        where: { slug },
        select: { id: true, body: true, status: true, revisedFrom: true },
      })

      if (!row) {
        console.log(`[SKIP] ${slug} - not found in DB`)
        results.push({ slug, changed: false, violations: [], error: 'not found' })
        skipped++
        continue
      }

      if ((row.status as string) !== 'PUBLISHED') {
        console.log(`[SKIP] ${slug} - status is ${row.status}, not PUBLISHED`)
        results.push({ slug, changed: false, violations: [], error: `status ${row.status}` })
        skipped++
        continue
      }

      // Deep clone to avoid mutating the original
      const body = JSON.parse(JSON.stringify(row.body)) as TipTapNode

      const changed = walkAndFix(body)

      if (!changed) {
        console.log(`[CLEAN] ${slug} - no changes needed`)
        results.push({ slug, changed: false, violations: [] })
        skipped++
        continue
      }

      // Re-check for remaining violations
      const violations = hasRemainingViolations(body)

      if (violations.length > 0) {
        console.log(`[UNFIXED] ${slug} - ${violations.length} violations remain after pass:`)
        for (const v of violations) console.log(`    ${v}`)
        results.push({ slug, changed: true, violations })
        failed++
        continue
      }

      // Write back
      if (!DRY_RUN) {
        await prisma.tutorial.update({
          where: { slug },
          data: {
            body: body as any,
            voiceRetrofittedAt: new Date(),
            ...(row.revisedFrom == null ? { revisedFrom: row.body } : {}),
          },
        })
      }

      console.log(`[OK] ${slug}${DRY_RUN ? ' (dry run)' : ''}`)
      results.push({ slug, changed: true, violations: [] })
      written++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[ERROR] ${slug}: ${msg}`)
      results.push({ slug, changed: false, violations: [], error: msg })
      failed++
    }

    // Log progress every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n--- progress: ${i + 1}/${SLUGS.length} ---\n`)
    }
  }

  // Save worklist
  const worktreeRoot = resolve(__dirname, '../../..')
  const worklist = resolve(worktreeRoot, 'packages/db/docs/voice-pass-worklist-2026-06-16.json')
  writeFileSync(worklist, JSON.stringify({ date: '2026-06-16', total: SLUGS.length, results }, null, 2))
  console.log(`\nWorklist saved to ${worklist}`)

  console.log(`\n=== Summary ===`)
  console.log(`Written:  ${written}`)
  console.log(`Skipped (clean / not-found / wrong status): ${skipped}`)
  console.log(`Could not auto-fix (need rewrite): ${failed}`)

  const unfixed = results.filter(r => r.violations.length > 0).map(r => r.slug)
  if (unfixed.length > 0) {
    console.log(`\nSlugs needing targeted rewrite (${unfixed.length}):`)
    for (const s of unfixed) console.log(`  - ${s}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
