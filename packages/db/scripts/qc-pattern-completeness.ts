/**
 * QC — pattern COMPLETENESS gate. A pattern is only publishable if it is a
 * real, makeable pattern: no leaked `NaN`/`undefined`, no "instructions go
 * here" placeholder, and actual row/round instructions present. ~75% of the
 * live catalogue currently fails this (the autopilot shipped skeletons).
 *
 * This is the foundation. Charts and images are built FROM the pattern, so a
 * broken pattern can never produce an accurate chart or image.
 *
 * Usage:
 *   scan (default) — write a report of every incomplete published PATTERN.
 *   --slug X       — check one pattern, print PASS/FAIL + reasons.
 *
 * The exported `patternCompleteness(body)` is what the autopilot publish path
 * + preflight import to BLOCK a broken pattern before it goes live.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

const REPORT_PATH = resolve(__dirname, '..', 'docs', 'pattern-completeness-report.json')

function bodyText(body: unknown): string {
  const out: string[] = []
  const walk = (n: { text?: string; content?: unknown[] } | null) => {
    if (!n) return
    if (n.text) out.push(n.text)
    for (const c of n.content ?? []) walk(c as typeof n)
  }
  walk(body as { text?: string; content?: unknown[] })
  return out.join(' ')
}

export interface CompletenessResult {
  ok: boolean
  reasons: string[]
}

/** Decide whether a pattern body is a real, makeable pattern. */
export function patternCompleteness(body: unknown, opts?: { counted?: boolean }): CompletenessResult {
  const t = bodyText(body)
  const reasons: string[] = []
  if (/\bNaN\b/.test(t)) reasons.push('contains NaN (a number failed to compute)')
  if (/\bundefined\b/.test(t)) reasons.push('contains "undefined"')
  if (/go here|instructions? (?:go|will be)|placeholder|lorem ipsum|\bTODO\b|\bTBD\b/i.test(t)) {
    reasons.push('contains an unfilled placeholder')
  }
  // Counted needlework charts express steps differently; skip the row check there.
  if (!opts?.counted && !/\b(Row|Round|Rnd)\s*\d+/i.test(t)) {
    reasons.push('no row/round instructions found')
  }
  if (/\bch(?:ain)?\s*(?:NaN|undefined|0)\b/i.test(t)) reasons.push('foundation chain count is broken')
  return { ok: reasons.length === 0, reasons }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const arg = process.argv.slice(2)
  const slugIdx = arg.indexOf('--slug')
  const onlySlug = slugIdx >= 0 ? arg[slugIdx + 1] : null

  if (onlySlug) {
    const t = await prisma.tutorial.findFirst({ where: { slug: onlySlug }, select: { title: true, body: true, subCategory: { select: { slug: true } } } })
    if (!t) { console.log('not found'); await prisma.$disconnect(); return }
    const counted = ['blackwork', 'needlepoint', 'hardanger', 'sashiko'].includes(t.subCategory?.slug ?? '')
    const r = patternCompleteness(t.body, { counted })
    console.log(`${onlySlug}: ${r.ok ? 'PASS' : 'FAIL'}`)
    for (const x of r.reasons) console.log('  - ' + x)
    await prisma.$disconnect(); return
  }

  const cats = await prisma.category.findMany({ where: { slug: { in: ['crochet', 'knitting', 'needlework'] } }, select: { id: true, slug: true } })
  const broken: { slug: string; category: string; reasons: string[] }[] = []
  const perCat: Record<string, { patterns: number; broken: number }> = {}
  for (const cat of cats) {
    const rows = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED', type: 'PATTERN' },
      select: { slug: true, body: true, subCategory: { select: { slug: true } } },
    })
    perCat[cat.slug] = { patterns: rows.length, broken: 0 }
    for (const r of rows) {
      const counted = ['blackwork', 'needlepoint', 'hardanger', 'sashiko'].includes(r.subCategory?.slug ?? '')
      const res = patternCompleteness(r.body, { counted })
      if (!res.ok) { broken.push({ slug: r.slug ?? '?', category: cat.slug, reasons: res.reasons }); perCat[cat.slug]!.broken++ }
    }
  }
  writeFileSync(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), perCategory: perCat, total: broken.length, items: broken }, null, 2))
  console.log('Pattern completeness scan:')
  for (const [k, v] of Object.entries(perCat)) console.log(`  ${k}: ${v.broken}/${v.patterns} incomplete`)
  console.log(`Report (${broken.length} broken slugs + reasons) -> ${REPORT_PATH}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
