/**
 * One-off: re-run the real publish gates (makeability + voice) against every
 * PUBLISHED crochet STITCH / TECHNIQUE / READING tutorial, to confirm the
 * existing teaching library is genuinely at the locked bar before we rely on it
 * in place of the held anchor entries.
 *
 * Glossary coverage is intentionally not re-checked (live marks use termId, not
 * termSlug — see feedback note), so glossaryTerms is passed empty, which makes
 * runVoiceCheck skip the coverage rule and avoids false positives.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d = 0; d < 8; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

import { MAKEABILITY_SELECT, buildContexts } from './qc-makeability-rules/loader.js'
import { auditMakeability } from './qc-makeability-rules/index.js'
import { runVoiceCheck } from './voice-check-lib.js'

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const cat = await prisma.category.findUnique({ where: { slug: 'crochet' } })
  if (!cat) { console.log('no crochet category'); return }

  const rows = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, type: { in: ['STITCH', 'TECHNIQUE', 'READING'] }, status: 'PUBLISHED' },
    select: { ...MAKEABILITY_SELECT, subtitle: true, excerpt: true },
  })
  console.log(`Auditing ${rows.length} published crochet STITCH/TECHNIQUE/READING rows.\n`)

  const contexts = await buildContexts(prisma, rows as never)

  let mkFail = 0, voiceErr = 0, voiceWarn = 0, clean = 0
  const mkFails: string[] = []
  const voiceErrs: string[] = []
  const voiceWarns: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as { slug: string; subtitle?: string | null; excerpt?: string | null; title: string; sourceNotes: string | null; body: unknown }
    const ctx = contexts[i]!
    const mk = auditMakeability(ctx)
    const voice = runVoiceCheck({
      title: row.title, subtitle: row.subtitle ?? null, excerpt: row.excerpt ?? null,
      sourceNotes: row.sourceNotes ?? null, body: row.body, glossaryTerms: [],
    })
    const errs = voice.errors
    const warns = voice.warnings

    let rowClean = true
    if (!mk.ok) { mkFail++; rowClean = false; mkFails.push(`  ${row.slug}: ${mk.reasons.join('; ')}`) }
    if (errs.length > 0) { voiceErr++; rowClean = false; voiceErrs.push(`  ${row.slug}: ${errs.map((e) => `${e.kind}(${e.snippet ?? ''})`).join(', ')}`) }
    if (warns.length > 0) { voiceWarn++; voiceWarns.push(`  ${row.slug}: ${warns.map((w) => w.kind).join(', ')}`) }
    if (rowClean) clean++
  }

  console.log(`MAKEABILITY fails: ${mkFail}`)
  for (const l of mkFails) console.log(l)
  console.log(`\nVOICE errors (excl. glossary): ${voiceErr}`)
  for (const l of voiceErrs) console.log(l)
  console.log(`\nVOICE warnings only: ${voiceWarn}`)
  for (const l of voiceWarns.slice(0, 40)) console.log(l)
  console.log(`\nSUMMARY: ${clean}/${rows.length} clean on makeability + voice-errors; ${mkFail} makeability fails; ${voiceErr} voice-error rows; ${voiceWarn} rows with warnings only.`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
