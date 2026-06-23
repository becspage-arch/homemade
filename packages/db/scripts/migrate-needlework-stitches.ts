/**
 * Migrate the pre-existing surface-embroidery STITCH tutorials onto the
 * controlled 91-stitch embroidery dictionary.
 *
 * The earlier needlework effort wrote 45 STITCH tutorials directly to the DB
 * under the `surface-embroidery` shelf with empty `craftStitchSlugs` (no link
 * to the master Stitch dictionary) and no committed source files. This script
 * reconstructs a reproducible TutorialUploadInput source JSON for each mapped
 * tutorial, onto the `stitch-library` teaching shelf, linked to its dictionary
 * stitch via the new `needlework` metadata block.
 *
 * DB -> source JSON only. It does NOT upload and does NOT delete the old rows;
 * the standard `tutorial:upload` runs the source through the voice + gate, and
 * a separate retire step archives the superseded surface-embroidery rows.
 *
 * Run (from the main checkout):
 *   pnpm --filter "@homemade/db" exec tsx scripts/migrate-needlework-stitches.ts [onlyDictSlug]
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

/**
 * existing surface-embroidery slug (without the `surface-embroidery-` prefix)
 * -> dictionary stitch slug (without the `embroidery-` prefix).
 *
 * The 32 clean 1:1 matches. Duplicates + extras are handled separately and are
 * NOT in this table.
 */
const CLEAN_MAP: Record<string, string> = {
  'back-stitch': 'back',
  'basic-couching': 'couching',
  'basket-weave-fill': 'basket-filling',
  'brick-stitch': 'brick',
  'bricked-couching': 'burden',
  'pekinese-stitch': 'pekinese',
  'blanket-stitch': 'blanket',
  'bullion-knot': 'bullion-knot',
  'chain-stitch': 'chain',
  'colonial-knot': 'colonial-knot',
  'cretan-stitch': 'cretan',
  'detached-chain': 'detached-chain',
  'double-feather-stitch': 'double-feather',
  'encroaching-satin-stitch': 'encroaching-satin',
  'feather-stitch': 'feather',
  'flat-satin-stitch': 'satin',
  'fly-stitch': 'fly',
  'french-knot': 'french-knot',
  'heavy-chain': 'heavy-chain',
  'herringbone-stitch': 'herringbone',
  'holbein-stitch': 'holbein',
  'laid-work-background': 'laid-work',
  'long-and-short-stitch': 'long-and-short',
  'padded-satin-stitch': 'padded-satin',
  'palestrina-knot': 'palestrina',
  'raised-stem-band': 'raised-stem-band',
  'roumanian-couching': 'romanian-couching',
  'spiders-web-variation': 'ribbed-spider-web',
  'split-stitch': 'split',
  'stem-stitch': 'stem',
  'threaded-back-stitch': 'threaded-back',
  'trellis-couching': 'trellis-couching',
  'twisted-chain': 'twisted-chain',
  'whipped-back-stitch': 'whipped-back',
  'woven-picot': 'woven-picot',
  'woven-wheel': 'woven-wheel',
}

interface Node { type?: string; attrs?: Record<string, unknown>; marks?: Mark[]; content?: Node[]; text?: string }
interface Mark { type: string; attrs?: Record<string, unknown> }

async function main(): Promise<void> {
  const only = process.argv[2] ?? null
  const { prisma } = await import('../src/index.js')
  const { EMBROIDERY_STITCHES } = await import('./data/embroidery-stitches.js')
  const dict = new Map(EMBROIDERY_STITCHES.map((s) => [s.slug, s]))

  const cat = await prisma.category.findFirst({ where: { slug: 'needlework' }, select: { id: true } })
  const terms = await prisma.glossaryTerm.findMany({
    where: { categoryId: cat?.id },
    select: { id: true, slug: true, term: true, definition: true },
  })
  const byId = new Map(terms.map((t) => [t.id, t]))

  const outDir = resolve(__dirname, 'needlework-stitches')
  mkdirSync(outDir, { recursive: true })

  let written = 0
  const report: string[] = []
  for (const [existingSuffix, dictSlug] of Object.entries(CLEAN_MAP)) {
    if (only && only !== dictSlug) continue
    const d = dict.get(dictSlug)
    if (!d) { report.push(`MISSING DICT: ${dictSlug}`); continue }

    const row = await prisma.tutorial.findFirst({
      where: { slug: `surface-embroidery-${existingSuffix}` },
      select: {
        slug: true, subtitle: true, excerpt: true, sourceNotes: true,
        difficulty: true, techniqueSlugs: true, body: true,
      },
    })
    if (!row) { report.push(`NO SOURCE ROW: surface-embroidery-${existingSuffix}`); continue }

    // Convert glossaryTooltip termId -> termSlug; collect declared terms.
    const used = new Map<string, { slug: string; term: string; definition: string }>()
    const walk = (n: Node): void => {
      if (!n || typeof n !== 'object') return
      if (Array.isArray(n.marks)) {
        for (const m of n.marks) {
          if (m.type === 'glossaryTooltip' && m.attrs && typeof m.attrs.termId === 'string') {
            const t = byId.get(m.attrs.termId)
            if (t) {
              m.attrs = { termSlug: t.slug }
              used.set(t.slug, { slug: t.slug, term: t.term, definition: t.definition })
            }
          }
        }
      }
      if (Array.isArray(n.content)) n.content.forEach(walk)
    }
    const body = row.body as unknown as Node
    walk(body)

    const out = {
      slug: `embroidery-${dictSlug}-stitch`,
      title: d.canonicalName,
      subtitle: row.subtitle ?? undefined,
      excerpt: row.excerpt ?? undefined,
      type: 'STITCH' as const,
      categorySlug: 'needlework',
      subCategorySlug: 'stitch-library',
      difficulty: d.difficulty,
      sourceType: 'PUBLIC_DOMAIN' as const,
      sourceNotes: row.sourceNotes ?? undefined,
      needlework: { craftStitchSlugs: [`embroidery-${dictSlug}`] },
      techniqueSlugs: row.techniqueSlugs ?? [],
      glossaryTerms: Array.from(used.values()),
      body,
    }

    writeFileSync(resolve(outDir, `${dictSlug}.json`), JSON.stringify(out, null, 2))
    written++
    report.push(`OK  surface-embroidery-${existingSuffix}  ->  embroidery-${dictSlug}-stitch  (glossary: ${used.size})`)
  }

  console.log(report.join('\n'))
  console.log(`\nwrote ${written} source files to ${outDir}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
