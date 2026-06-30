/**
 * READ-ONLY scan for two content-quality faults across published recipes:
 *   A) implausible ingredient amounts (≤1 g/ml, or 0) — placeholder fills
 *   B) junk method steps: review/testimonial quotes, section-label-only steps
 *      ("Notes.", "Salad Ingredients."), and bare embedded ingredient-amount
 *      lines with no instruction ("1/4 cup mayonnaise, 1/4 cup sour cream.")
 *
 * Output: JSON artefact + console summary. Nothing written.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'

interface N { type?: string; attrs?: Record<string, unknown>; content?: N[]; text?: string }
function txt(n: N): string {
  const out: string[] = []
  const w = (x?: N) => { if (!x || typeof x !== 'object') return; if (typeof x.text === 'string') out.push(x.text); if (Array.isArray(x.content)) for (const c of x.content) w(c) }
  w(n); return out.join(' ')
}
function methodSteps(body: N): string[] {
  // longest orderedList = the method
  let best: N | null = null
  const w = (n?: N) => { if (!n) return; if (n.type === 'orderedList' && (!best || (n.content?.length ?? 0) > (best!.content?.length ?? 0))) best = n; if (Array.isArray(n.content)) for (const c of n.content) w(c) }
  w(body)
  if (!best) return []
  return ((best as N).content ?? []).map((li) => txt(li).trim()).filter(Boolean)
}
function items(body: N): Array<Record<string, unknown>> {
  let out: Array<Record<string, unknown>> = []
  const w = (n?: N) => { if (!n) return; if (n.type === 'ingredientsList' && Array.isArray(n.attrs?.items)) out = n.attrs!.items as Array<Record<string, unknown>>; if (Array.isArray(n.content)) for (const c of n.content) w(c) }
  w(body); return out
}

// ── Detectors ──
function implausibleRows(its: Array<Record<string, unknown>>): string[] {
  const bad: string[] = []
  for (const it of its) {
    const a = typeof it.amount === 'number' ? it.amount : null
    const u = typeof it.unit === 'string' ? it.unit.toLowerCase() : ''
    const name = typeof it.name === 'string' ? it.name : '(unnamed)'
    if (a === 0) bad.push(`${name}: 0 ${u}`)
    else if (a != null && a <= 1 && (u === 'g' || u === 'ml')) bad.push(`${name}: ${a} ${u}`)
  }
  return bad
}

const REVIEW_RE = /\b(i made|i used|my (first|second|favourite) batch|turned out|these (are|turned out)|so (good|delicious|yummy)|amazing|absolutely loved|family loved|will (definitely )?(make|be making)|highly recommend|five stars|hubby|my kids)\b/i
const SECTION_STEP_RE = /^(notes?|directions?|instructions?|ingredients?|method|salad ingredients|dressing ingredients|gravy ingredients?|for the .{0,30}|on the day|finishing|tips?)\.?\s*$/i
const UNIT_TOK = /\d+\s*(?:\/\s*\d+\s*)?(?:cup|cups|tbsp|tablespoons?|tsp|teaspoons?|g|kg|ml|l|oz|lb|ears?|cloves?|sheets?|sprigs?|rashers?|cans?|tins?|punnets?|slices?)\b/gi
const IMPERATIVE_START = /^(preheat|heat|add|stir|mix|combine|pour|place|put|bring|cook|simmer|boil|bake|fry|grill|roast|whisk|beat|fold|knead|roll|slice|cut|chop|peel|drain|season|sprinkle|spoon|brush|spread|cover|leave|set|remove|transfer|return|reduce|melt|warm|chill|serve|grate|squeeze|toss|scatter|arrange|line|grease|prepare|make|divide|shape|dust|dip|coat|tip|fill|seal|wrap|rub|dissolve|soak|rinse|wash|lift|using|once|meanwhile|while|when|in a|in the|to make|next|finally|then|repeat)\b/i

function junkSteps(steps: string[]): { kind: string; text: string }[] {
  const out: { kind: string; text: string }[] = []
  for (const s of steps) {
    if (SECTION_STEP_RE.test(s)) { out.push({ kind: 'section-label', text: s }); continue }
    if (REVIEW_RE.test(s) || s.startsWith('“') || s.startsWith('"')) { out.push({ kind: 'review-quote', text: s.slice(0, 90) }); continue }
    const units = (s.match(UNIT_TOK) ?? []).length
    if (units >= 2 && !IMPERATIVE_START.test(s) && s.length < 220) { out.push({ kind: 'bare-ingredient-line', text: s.slice(0, 90) }); continue }
  }
  return out
}

async function main() {
  const recipes = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', type: 'RECIPE' },
    select: { id: true, slug: true, body: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  const reports: Array<{ slug: string; cat: string; impl: string[]; junk: { kind: string; text: string }[] }> = []
  for (const r of recipes) {
    const body = r.body as unknown as N
    const impl = implausibleRows(items(body))
    const junk = junkSteps(methodSteps(body))
    if (impl.length || junk.length) reports.push({ slug: r.slug, cat: r.category?.slug ?? '', impl, junk })
  }
  const outPath = resolve(__dirname, 'scan-recipe-quality.out.json')
  writeFileSync(outPath, JSON.stringify(reports, null, 2))

  const withImpl = reports.filter((r) => r.impl.length)
  const withJunk = reports.filter((r) => r.junk.length)
  const junkByKind: Record<string, number> = {}
  for (const r of reports) for (const j of r.junk) junkByKind[j.kind] = (junkByKind[j.kind] ?? 0) + 1
  console.log(`Scanned ${recipes.length} published recipes.\n`)
  console.log(`A) Implausible amounts: ${withImpl.length} recipes, ${reports.reduce((n, r) => n + r.impl.length, 0)} rows`)
  console.log(`B) Junk method steps:   ${withJunk.length} recipes, ${reports.reduce((n, r) => n + r.junk.length, 0)} steps`)
  console.log(`   by kind: ${JSON.stringify(junkByKind)}`)
  console.log(`   both A & B: ${reports.filter((r) => r.impl.length && r.junk.length).length} recipes`)
  console.log(`Artefact: ${outPath}`)
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
