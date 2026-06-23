/** Remove hero (text-only) for the failed-dish tail. Reads tail-dishes.json,
 *  sets heroMediaId=null + heroImageStrategy=UNSET, keeps PUBLISHED, snapshots a version.
 *  Old Media row left intact. Per-item retry on transient DB drops. */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
import { prisma } from '../src'
import type { Prisma } from '@prisma/client'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
async function main() {
  const dishes: any[] = JSON.parse(readFileSync(resolve(RUN, 'tail-dishes.json'), 'utf8'))
  const author = await prisma.user.findUnique({ where: { email: 'rebecca@homemade.education' }, select: { id: true } })
  if (!author) throw new Error('author not found')
  let done = 0, skipped = 0, failed = 0
  for (const r of dishes) {
    const t = await prisma.tutorial.findUnique({ where: { id: r.id }, select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true, heroMediaId: true } })
    if (!t) { skipped++; continue }
    if (t.heroMediaId === null) { skipped++; continue }
    let ok = false
    for (let a = 1; a <= 4 && !ok; a++) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.tutorialVersion.create({ data: { tutorialId: t.id, title: t.title, subtitle: t.subtitle, excerpt: t.excerpt, body: t.body as Prisma.InputJsonValue, status: t.status, authorId: author.id, changeNote: 'photo-accuracy: removed inaccurate hero, text-only (Flux could not render this dish)' } })
          await tx.tutorial.update({ where: { id: t.id }, data: { heroMediaId: null, heroImageStrategy: 'UNSET' } })
        })
        ok = true; done++
      } catch (e: any) {
        const msg = String(e?.message || e)
        if (/terminated|ECONNRESET|Closed|timeout|connection|pool/i.test(msg) && a < 4) { await prisma.$connect().catch(() => {}); await new Promise((res) => setTimeout(res, 1200 * a)); continue }
        failed++; console.log(`ERR ${t.slug}: ${msg}`); ok = true
      }
    }
  }
  console.log(`tail-null: removed=${done} skipped=${skipped} error=${failed} (of ${dishes.length})`)
  process.exit(0)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
