/**
 * One-shot manual fix: replace clinical/Latin vocab terms that qc-fix didn't catch.
 * Run: pnpm --filter @homemade/db exec tsx scripts/_qc-manual-fix-clinical-vocab-2026-06-01.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

const FIXES: Array<{ slug: string; find: RegExp; replace: string }> = [
  { slug: 'diagnosing-coccidiosis-in-chicks', find: /efficacy/gi, replace: 'how well it works' },
  { slug: 'drenching-sheep-with-an-oral-wormer', find: /efficacy/gi, replace: 'how well it works' },
  { slug: 'identifying-and-treating-pigs-for-mange', find: /efficacy/gi, replace: 'how well it works' },
  { slug: 'varroa-oxalic-acid-winter-treatment', find: /efficacy/gi, replace: 'how well it works' },
  { slug: 'neri-formation-aid-preparation', find: /mucilage/gi, replace: 'slippery, soothing liquid' },
]

async function main(): Promise<void> {
  for (const fix of FIXES) {
    const t = await prisma.tutorial.findUnique({ where: { slug: fix.slug }, select: { id: true, body: true } })
    if (!t) { console.log(fix.slug + ': NOT FOUND'); continue }
    const before = JSON.stringify(t.body)
    const after = before.replace(fix.find, fix.replace)
    if (before === after) { console.log(fix.slug + ': no change (term not found in body)'); continue }
    const count = (before.match(fix.find) || []).length
    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body: JSON.parse(after), voiceRetrofittedAt: new Date() },
    })
    console.log(fix.slug + ': fixed ' + count + ' occurrence(s)')
  }
  await prisma.$disconnect()
  console.log('done')
}

main().catch((err) => {
  console.error('clinical-vocab-fix failed:', err)
  process.exit(1)
})
