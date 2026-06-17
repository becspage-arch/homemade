/**
 * Cross-cutting voice sweep across ALL text fields of every PUBLISHED Tutorial
 * plus the Homemade-authored craft Pattern models. Closes the field-coverage
 * gap: Worker 2's voice pass + the crochet teaching fix only ever touched
 * `body` (+ sourceNotes for crochet). Every other prose-bearing scalar field
 * (whenToUse, makeAheadNotes, bakeTemperatureNote, freezeNotes, ...) and the
 * Pattern.name / .description / notes fields were never swept.
 *
 * What it fixes (mechanical, safe, idempotent):
 *   - em / en dashes  -> comma (or "to" inside a numeric range), per the proven
 *     fix-crochet-teaching-voice transform, with a numeric-range guard so
 *     gauges / dimensions / temperature ranges don't get mangled.
 *   - banned phrases with a deterministic substitution:
 *       "perfect for" / "ideal for"     -> "good for"
 *       "honestly" / "frankly" / "genuinely" / "to be honest" / "I'll be honest"
 *                                        -> removed (filler), punctuation tidied
 *   - banned phrases WITHOUT a safe mechanical fix ("honest" as a bare
 *     adjective, "fine for almost everyone") are NOT auto-edited — they are
 *     counted and surfaced for a rewrite. Deleting them risks mangling meaning
 *     (feedback_voice_rewrite_dont_over_prune).
 *
 * Snapshots a TutorialVersion before each Tutorial write. Pattern-model rows
 * are Homemade / designer authored (ownerUserId null where the column exists)
 * and are updated in place; user-owned UGC pattern rows are never touched.
 *
 * Run:
 *   tsx scripts/voice-field-sweep.ts            # DRY RUN — counts only, no writes
 *   tsx scripts/voice-field-sweep.ts --apply    # apply fixes
 *   tsx scripts/voice-field-sweep.ts --json     # machine-readable dry-run report
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 10; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true, quiet: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

const DASH_RE = /[—–]/

/** Numeric-range-aware em/en dash removal + punctuation tidy. */
export function fixDashes(input: string): string {
  let s = input
  // Numeric range ("4–6", "180–200°C", "1880–1884") -> "4 to 6".
  s = s.replace(/(\d)\s*[—–]\s*(\d)/g, '$1 to $2')
  // Any remaining em/en dash (spaced or not) -> comma.
  s = s.replace(/\s*[—–]\s*/g, ', ')
  // Tidy.
  s = s
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s+\./g, '.')
    .trim()
  return s
}

interface BannedSub { re: RegExp; replace: ((m: string) => string) | null; label: string }

const matchCase = (template: string, replacement: string): string =>
  /^[A-Z]/.test(template) ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement

/** Banned phrases. `replace: null` = count + flag only (no safe auto-fix). */
const BANNED: BannedSub[] = [
  { re: /\bperfect for\b/gi, replace: (m) => matchCase(m, 'good for'), label: 'perfect for' },
  { re: /\bideal for\b/gi, replace: (m) => matchCase(m, 'good for'), label: 'ideal for' },
  { re: /\bfine for almost everyone\b/gi, replace: null, label: 'fine for almost everyone' },
  // Filler adverbs / hedges — strip the word, tidy surrounding punctuation.
  { re: /\bto be honest\b/gi, replace: () => '', label: 'to be honest' },
  { re: /\bi['’]ll be honest\b/gi, replace: () => '', label: "i'll be honest" },
  { re: /\bhonestly\b/gi, replace: () => '', label: 'honestly' },
  { re: /\bfrankly\b/gi, replace: () => '', label: 'frankly' },
  { re: /\bgenuinely\b/gi, replace: () => '', label: 'genuinely' },
  // Bare "honest" adjective — count only; deleting risks mangling meaning.
  { re: /\bhonest\b/gi, replace: null, label: 'honest (bare)' },
]

/** Apply safe banned substitutions; return fixed text + which labels were auto-fixed. */
function fixBanned(input: string): { text: string; fixed: string[] } {
  let s = input
  const fixed: string[] = []
  for (const b of BANNED) {
    if (!b.replace) continue
    if (b.re.test(s)) {
      b.re.lastIndex = 0
      s = s.replace(b.re, (m) => b.replace!(m))
      fixed.push(b.label)
    }
  }
  if (fixed.length) {
    // Tidy punctuation left by removed words.
    s = s
      .replace(/\s{2,}/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+,/g, ',')
      .replace(/,\s*,/g, ',')
      .replace(/,\s+\./g, '.')
      .replace(/\s+\./g, '.')
      .replace(/\s+;/g, ';')
      .replace(/^[\s,;.]+/, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return { text: s, fixed }
}

/** Count banned-phrase occurrences in a string (for the report). */
function countBanned(s: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const b of BANNED) {
    b.re.lastIndex = 0
    const n = (s.match(b.re) ?? []).length
    if (n) out[b.label] = n
  }
  return out
}

const emCount = (s: string): number => (s.match(/[—–]/g) ?? []).length

/** Fix every text leaf in a TipTap doc. Returns new doc + per-issue counts. */
function fixBody(body: unknown): { body: unknown; em: number; banned: Record<string, number>; changed: boolean } {
  let em = 0
  const banned: Record<string, number> = {}
  let changed = false
  const walk = (n: any): any => {
    let node = n
    if (typeof node?.text === 'string') {
      const t: string = node.text
      em += emCount(t)
      for (const [k, v] of Object.entries(countBanned(t))) banned[k] = (banned[k] ?? 0) + v
      let nt = t
      if (DASH_RE.test(nt)) nt = fixDashes(nt)
      const fb = fixBanned(nt)
      nt = fb.text
      if (nt !== t) { node = { ...node, text: nt }; changed = true }
    }
    if (Array.isArray(node?.content)) node = { ...node, content: node.content.map(walk) }
    return node
  }
  const out = body && typeof body === 'object' ? walk(body) : body
  return { body: out, em, banned, changed }
}

/** Fix a scalar string. Returns new value (or original) + counts. */
function fixScalar(v: string): { value: string; em: number; banned: Record<string, number>; changed: boolean } {
  const em = emCount(v)
  const banned = countBanned(v)
  let nv = v
  if (DASH_RE.test(nv)) nv = fixDashes(nv)
  nv = fixBanned(nv).text
  return { value: nv, em, banned, changed: nv !== v }
}

// Tutorial scalar prose fields (free text a reader sees). Excludes enum/slug
// arrays (dietaryFlags, mood, ...), ids, and image/hero fields.
const TUTORIAL_FIELDS = [
  'title', 'subtitle', 'excerpt', 'sourceNotes', 'yieldDescription',
  'freezeNotes', 'batchNotes', 'makeAheadNotes', 'temperatureNote',
  'bakeTemperatureNote', 'steamMethod', 'decoratingTechnique',
  'whenToUse', 'whenNotToUse', 'gaugeText', 'finishedSizeText', 'shelfLifeNotes',
] as const

// Pattern-model prose fields. heroProductShotPrompt deliberately excluded
// (hero prompt — out of scope).
const PATTERN_MODELS: { model: string; fields: string[]; ownerGuard: boolean }[] = [
  { model: 'pattern', fields: ['name', 'description'], ownerGuard: true },
  { model: 'crochetPattern', fields: ['name', 'description', 'gradingNotes', 'gaugeText', 'finishedSizeText'], ownerGuard: true },
  { model: 'knittingPattern', fields: ['name', 'description', 'gaugeText', 'finishedSizeText'], ownerGuard: true },
  { model: 'needleworkPattern', fields: ['name', 'description', 'culturalAttribution'], ownerGuard: true },
  { model: 'sewingPattern', fields: ['name', 'description', 'sizingNotes', 'attributionText'], ownerGuard: false },
  { model: 'stitch', fields: ['canonicalName', 'notes'], ownerGuard: false },
]

type FieldStat = { em: number; banned: Record<string, number>; rowsChanged: number }
const addBanned = (into: Record<string, number>, from: Record<string, number>) => {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] ?? 0) + v
}

async function main() {
  const apply = process.argv.includes('--apply')
  const asJson = process.argv.includes('--json')
  const { prisma } = await import('../src/index.js')

  const author = await prisma.user.findFirst({
    where: { email: { in: ['rebecca@homemade.education', 'becspage@gmail.com'] } },
    select: { id: true },
  })

  // ── Tutorials ────────────────────────────────────────────────────────────
  // category slug per row (for per-category counts).
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } })
  const catSlug = new Map(cats.map((c) => [c.id, c.slug]))

  const ids = await prisma.tutorial.findMany({ where: { status: 'PUBLISHED' }, select: { id: true } })
  // per category -> per field -> stat
  const tutStats = new Map<string, Map<string, FieldStat>>()
  const bump = (cat: string, field: string): FieldStat => {
    let m = tutStats.get(cat); if (!m) { m = new Map(); tutStats.set(cat, m) }
    let s = m.get(field); if (!s) { s = { em: 0, banned: {}, rowsChanged: 0 }; m.set(field, s) }
    return s
  }

  let tutRowsChanged = 0
  const CHUNK = 300
  const sel: Record<string, boolean> = { id: true, categoryId: true, status: true, body: true }
  for (const f of TUTORIAL_FIELDS) sel[f] = true

  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK).map((r) => r.id)
    const rows = await prisma.tutorial.findMany({ where: { id: { in: slice } }, select: sel as never })
    for (const row of rows as any[]) {
      const cat = catSlug.get(row.categoryId) ?? 'unknown'
      const update: Record<string, unknown> = {}
      let rowChanged = false

      for (const f of TUTORIAL_FIELDS) {
        const v = row[f]
        if (typeof v !== 'string' || !v) continue
        const r = fixScalar(v)
        const st = bump(cat, f)
        st.em += r.em; addBanned(st.banned, r.banned)
        if (r.changed) { st.rowsChanged++; update[f] = r.value; rowChanged = true }
      }
      // body
      const fb = fixBody(row.body)
      const stBody = bump(cat, 'body')
      stBody.em += fb.em; addBanned(stBody.banned, fb.banned)
      if (fb.changed) { stBody.rowsChanged++; update.body = fb.body; rowChanged = true }

      if (rowChanged) {
        tutRowsChanged++
        if (apply) {
          if (author) {
            await prisma.tutorialVersion.create({
              data: {
                tutorialId: row.id, title: row.title ?? '', subtitle: row.subtitle ?? null,
                excerpt: row.excerpt ?? null, body: row.body as never, status: row.status,
                authorId: author.id, changeNote: 'Voice field-sweep: em/en dash + banned-phrase fix across all text fields',
              },
            })
          }
          await prisma.tutorial.update({ where: { id: row.id }, data: update as never })
        }
      }
    }
    process.stdout.write(`\r  tutorials ${Math.min(i + CHUNK, ids.length)}/${ids.length}`)
  }
  process.stdout.write('\n')

  // ── Pattern models ───────────────────────────────────────────────────────
  const patStats = new Map<string, FieldStat>()
  let patRowsChanged = 0
  for (const { model, fields, ownerGuard } of PATTERN_MODELS) {
    const where = ownerGuard ? { ownerUserId: null } : {}
    const select: Record<string, boolean> = { id: true }
    for (const f of fields) select[f] = true
    const rows = await (prisma as any)[model].findMany({ where, select })
    for (const row of rows) {
      const update: Record<string, unknown> = {}
      let rowChanged = false
      for (const f of fields) {
        const v = row[f]
        if (typeof v !== 'string' || !v) continue
        const r = fixScalar(v)
        const key = `${model}.${f}`
        let st = patStats.get(key); if (!st) { st = { em: 0, banned: {}, rowsChanged: 0 }; patStats.set(key, st) }
        st.em += r.em; addBanned(st.banned, r.banned)
        if (r.changed) { st.rowsChanged++; update[f] = r.value; rowChanged = true }
      }
      if (rowChanged) {
        patRowsChanged++
        if (apply) await (prisma as any)[model].update({ where: { id: row.id }, data: update })
      }
    }
  }

  // ── Report ─────────────────────────────────────────────────────────────
  const flagOnly = (banned: Record<string, number>) =>
    Object.entries(banned).filter(([k]) => k === 'honest (bare)' || k === 'fine for almost everyone')

  if (asJson) {
    const out: any = { mode: apply ? 'apply' : 'dry', tutorialsScanned: ids.length, tutRowsChanged, patRowsChanged, tutorials: {}, patterns: {} }
    for (const [cat, m] of tutStats) {
      out.tutorials[cat] = {}
      for (const [f, s] of m) if (s.em || Object.keys(s.banned).length) out.tutorials[cat][f] = s
    }
    for (const [k, s] of patStats) if (s.em || Object.keys(s.banned).length) out.patterns[k] = s
    console.log(JSON.stringify(out, null, 2))
  } else {
    console.log(`\n=== Tutorial fields (${apply ? 'APPLIED' : 'DRY RUN'}) — em/en dash + banned per category/field ===`)
    const catNames = [...tutStats.keys()].sort()
    let totalEm = 0; const totalBanned: Record<string, number> = {}
    for (const cat of catNames) {
      const m = tutStats.get(cat)!
      const lines: string[] = []
      for (const [f, s] of [...m.entries()].sort()) {
        if (!s.em && !Object.keys(s.banned).length) continue
        totalEm += s.em; addBanned(totalBanned, s.banned)
        const bstr = Object.keys(s.banned).length ? ` banned=${JSON.stringify(s.banned)}` : ''
        lines.push(`    ${f.padEnd(20)} em=${s.em} rowsChanged=${s.rowsChanged}${bstr}`)
      }
      if (lines.length) { console.log(`  [${cat}]`); console.log(lines.join('\n')) }
    }
    console.log(`\n  TOTAL em/en dashes: ${totalEm}  banned: ${JSON.stringify(totalBanned)}`)
    console.log(`  Tutorial rows changed: ${tutRowsChanged}`)
    console.log(`\n=== Pattern-model fields ===`)
    for (const [k, s] of [...patStats.entries()].sort()) {
      if (!s.em && !Object.keys(s.banned).length) continue
      const bstr = Object.keys(s.banned).length ? ` banned=${JSON.stringify(s.banned)}` : ''
      console.log(`  ${k.padEnd(34)} em=${s.em} rowsChanged=${s.rowsChanged}${bstr}`)
    }
    console.log(`  Pattern rows changed: ${patRowsChanged}`)

    // Flag-only residuals (no safe auto-fix).
    const flags: string[] = []
    for (const [cat, m] of tutStats) for (const [f, s] of m) for (const [k, v] of flagOnly(s.banned)) flags.push(`tutorial.${f} [${cat}]: "${k}" x${v}`)
    for (const [k, s] of patStats) for (const [b, v] of flagOnly(s.banned)) flags.push(`${k}: "${b}" x${v}`)
    console.log(`\n=== Flag-only residuals (NOT auto-fixed — need rewrite) ===`)
    console.log(flags.length ? flags.join('\n') : '  none')
    console.log(apply ? '\nAPPLIED.' : '\n(dry run — re-run with --apply to write)')
  }

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
