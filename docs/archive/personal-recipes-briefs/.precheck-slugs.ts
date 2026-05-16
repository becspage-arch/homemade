/**
 * Pre-check Rebecca's personal-recipe briefs for slug collisions with the live DB.
 * For each colliding slug, suffix with `-rebecca` and update the brief file.
 *
 * Logs the renames to _slug-renames.json so the report can include them.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main(): Promise<void> {
  // Load .env.credentials (walk up from this file)
  let dir = __dirname
  for (let depth = 0; depth < 10; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  const { prisma } = await import('../../packages/db/src/index.js')

  const BRIEFS_DIR = resolve(__dirname)
  const briefFiles = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'))

  const existing = await prisma.tutorial.findMany({ select: { slug: true } })
  const existingSlugs = new Set(existing.map((t: { slug: string }) => t.slug))
  console.log(`DB has ${existingSlugs.size} existing Tutorial rows.`)

  const renames: Array<{ original: string; renamed: string }> = []

  for (const f of briefFiles) {
    const path = join(BRIEFS_DIR, f)
    const brief = JSON.parse(readFileSync(path, 'utf8'))
    const origSlug: string = brief.slug
    if (existingSlugs.has(origSlug)) {
      let finalSlug = `${origSlug}-rebecca`
      let n = 2
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${origSlug}-rebecca-${n++}`
      }
      brief.slug = finalSlug
      const newPath = join(BRIEFS_DIR, `${finalSlug}.json`)
      writeFileSync(newPath, JSON.stringify(brief, null, 2))
      if (newPath !== path) {
        unlinkSync(path)
      }
      existingSlugs.add(finalSlug)
      renames.push({ original: origSlug, renamed: finalSlug })
      console.log(`  RENAMED  ${origSlug}  →  ${finalSlug}`)
    } else {
      existingSlugs.add(origSlug)
    }
  }

  console.log(`\nTotal renames: ${renames.length}`)
  writeFileSync(join(BRIEFS_DIR, '_slug-renames.json'), JSON.stringify(renames, null, 2))

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('precheck-slugs failed:', err)
  process.exit(1)
})
