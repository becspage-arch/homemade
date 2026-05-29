/**
 * Find full string values containing a snippet in a tutorial body.
 * Usage: tsx _qc-find-text.ts slug "snippet-start" [slug2 "snippet2" ...]
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
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

function findStrings(v: unknown, search: string, results: string[]) {
  if (typeof v === 'string') {
    if (v.includes(search)) results.push(v)
    return
  }
  if (Array.isArray(v)) { v.forEach(x => findStrings(x, search, results)); return }
  if (v && typeof v === 'object') {
    Object.values(v as Record<string, unknown>).forEach(x => findStrings(x, search, results))
  }
}

async function main() {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 2) {
    const slug = args[i]!
    const search = args[i + 1]!
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }
    const results: string[] = []
    findStrings(t.body, search, results)
    console.log('=== ' + slug + ' | search: ' + search.slice(0, 40) + ' ===')
    if (results.length === 0) console.log('  NOT FOUND IN BODY')
    results.forEach((r, i) => console.log('  [' + i + ']: ' + r))
    console.log('')
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
