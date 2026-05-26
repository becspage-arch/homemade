/**
 * Compare body word counts before / after for batch 17.
 * Reads the pre-rewrite body from DB (revisedFrom is only populated
 * after apply, so we use the live DB body, which is still the
 * pre-rewrite state until apply runs).
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

function walkText(node: any): string[] {
  if (!node) return []
  const out: string[] = []
  if (typeof node.text === 'string') out.push(node.text)
  if (Array.isArray(node.content)) for (const c of node.content) out.push(...walkText(c))
  if (node.attrs) {
    for (const v of Object.values(node.attrs)) {
      if (typeof v === 'string') out.push(v)
      if (Array.isArray(v)) {
        for (const item of v) {
          if (item && typeof item === 'object') {
            for (const iv of Object.values(item)) if (typeof iv === 'string') out.push(iv)
          }
        }
      }
    }
  }
  return out
}

function wordCount(body: any): number {
  return walkText(body).join(' ').split(/\s+/).filter(Boolean).length
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-26-batch17')
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  const results: { slug: string; before: number; after: number; deltaPct: number }[] = []
  for (const f of files) {
    const raw = JSON.parse(readFileSync(resolve(batchDir, f), 'utf8'))
    const slug = raw.slug
    const t: any = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    const before = wordCount(t?.body)
    const after = wordCount(raw.body)
    const delta = before === 0 ? 0 : ((after - before) / before) * 100
    results.push({ slug, before, after, deltaPct: delta })
  }

  results.sort((a, b) => a.deltaPct - b.deltaPct)
  for (const r of results) {
    const flag = r.deltaPct < -20 ? '  <-- DROP > 20%' : ''
    console.log(`${r.slug}: ${r.before} -> ${r.after} (${r.deltaPct.toFixed(1)}%)${flag}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
