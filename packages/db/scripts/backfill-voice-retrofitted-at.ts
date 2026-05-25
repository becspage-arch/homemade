/**
 * Backfill `Tutorial.voiceRetrofittedAt` for tutorials already voice-retrofitted
 * before the new field was added. Source of truth: slugs in any
 * `docs/voice-pilot-*` or `docs/voice-retrofit-*` directory.
 *
 * Idempotent: only updates rows where voiceRetrofittedAt IS NULL.
 *
 * Run once after the migration deploys.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
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

const REPO_ROOT = resolve(__dirname, '../../..')
const DOCS = resolve(REPO_ROOT, 'docs')

function collectSlugsFromDir(dirPath: string): { slug: string; mtime: Date }[] {
  if (!existsSync(dirPath)) return []
  const entries = readdirSync(dirPath)
  const slugs: { slug: string; mtime: Date }[] = []
  // Tutorial JSON files (not _slugs.json, not _handoff.md, not other underscore-prefixed)
  for (const e of entries) {
    if (e.startsWith('_')) continue
    if (!e.endsWith('.json')) continue
    const slug = e.replace(/\.json$/, '')
    const fullPath = resolve(dirPath, e)
    const mtime = statSync(fullPath).mtime
    slugs.push({ slug, mtime })
  }
  // _slugs.json — supplement with any slugs not represented as standalone files
  const slugsPath = resolve(dirPath, '_slugs.json')
  if (existsSync(slugsPath)) {
    try {
      const slugList = JSON.parse(readFileSync(slugsPath, 'utf-8'))
      const slugsListArr: string[] = Array.isArray(slugList) ? slugList : []
      const knownSlugs = new Set(slugs.map((s) => s.slug))
      const slugsListMtime = statSync(slugsPath).mtime
      for (const s of slugsListArr) {
        if (!knownSlugs.has(s)) {
          slugs.push({ slug: s, mtime: slugsListMtime })
        }
      }
    } catch (e) {
      console.warn(`Could not parse ${slugsPath}: ${(e as Error).message}`)
    }
  }
  return slugs
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const docsEntries = readdirSync(DOCS)
  const voiceDirs = docsEntries.filter(
    (e) => e.startsWith('voice-pilot-') || e.startsWith('voice-retrofit-'),
  )
  const allSlugs: Map<string, Date> = new Map()
  for (const d of voiceDirs) {
    const fullPath = resolve(DOCS, d)
    const stat = statSync(fullPath)
    if (!stat.isDirectory()) continue
    const slugs = collectSlugsFromDir(fullPath)
    for (const { slug, mtime } of slugs) {
      // Use the earliest mtime if a slug appears in multiple batches
      const existing = allSlugs.get(slug)
      if (!existing || mtime < existing) {
        allSlugs.set(slug, mtime)
      }
    }
    console.log(`  ${d}: ${slugs.length} slugs`)
  }
  console.log(`\nTotal unique slugs found across all voice batches: ${allSlugs.size}`)

  let updated = 0
  let alreadySet = 0
  let notFound = 0
  for (const [slug, mtime] of allSlugs.entries()) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, voiceRetrofittedAt: true },
    })
    if (!tutorial) {
      notFound++
      console.warn(`  ! ${slug} — not found in DB`)
      continue
    }
    if (tutorial.voiceRetrofittedAt) {
      alreadySet++
      continue
    }
    await prisma.tutorial.update({
      where: { id: tutorial.id },
      data: { voiceRetrofittedAt: mtime },
    })
    updated++
  }
  console.log(`\nBackfill complete:`)
  console.log(`  updated:     ${updated}`)
  console.log(`  already set: ${alreadySet}`)
  console.log(`  not found:   ${notFound}`)

  // Confirm count of voice-retrofitted PUBLISHED
  const retrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: { not: null } },
  })
  const unretrofitted = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
  })
  console.log(`\nPUBLISHED state:`)
  console.log(`  voice-retrofitted:    ${retrofitted}`)
  console.log(`  not yet retrofitted:  ${unretrofitted}`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
