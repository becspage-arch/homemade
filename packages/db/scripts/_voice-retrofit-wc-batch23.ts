/**
 * Word-count check for batch23. Compares the rewritten body word count
 * against the snapshot in Tutorial.revisedFrom for each batch23 slug.
 * Flags anything with >20% drop.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

function flatten(n: any): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text + ' '
  if (Array.isArray(n.content)) return n.content.map(flatten).join('')
  // Walk attrs for blocks (troubleshooter, infoPanel, etc.)
  if (n.attrs) {
    const parts: string[] = []
    if (typeof n.attrs.body === 'string') parts.push(n.attrs.body)
    if (typeof n.attrs.title === 'string') parts.push(n.attrs.title)
    if (typeof n.attrs.intro === 'string') parts.push(n.attrs.intro)
    if (typeof n.attrs.heading === 'string') parts.push(n.attrs.heading)
    if (Array.isArray(n.attrs.items)) {
      for (const it of n.attrs.items) {
        for (const k of ['name', 'symptom', 'cause', 'fix', 'description', 'prepNote']) {
          if (typeof it?.[k] === 'string') parts.push(it[k])
        }
      }
    }
    return parts.join(' ') + ' '
  }
  return ''
}

function countWords(s: string): number {
  return s.split(/\s+/).filter(Boolean).length
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const worktreeRoot = resolve(__dirname, '../../..')
  const slugsRaw = readFileSync(
    resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch23/_slugs.json'),
    'utf8',
  )
  const { slugs } = JSON.parse(slugsRaw)

  const results: { slug: string; before: number; after: number; drop: number }[] = []
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { body: true, revisedFrom: true },
    })
    if (!t || !t.revisedFrom || !t.body) continue
    const before = countWords(flatten(t.revisedFrom))
    const after = countWords(flatten(t.body))
    const drop = before > 0 ? ((before - after) / before) * 100 : 0
    results.push({ slug, before, after, drop })
  }

  results.sort((a, b) => b.drop - a.drop)
  console.log('slug'.padEnd(60), 'before'.padStart(6), 'after'.padStart(6), 'drop%'.padStart(8))
  for (const r of results) {
    const flag = r.drop > 20 ? ' <<<' : ''
    console.log(r.slug.padEnd(60), String(r.before).padStart(6), String(r.after).padStart(6), r.drop.toFixed(1).padStart(8), flag)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
