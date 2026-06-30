/** Download every PUBLIC cross-stitch thumbnail to a local cache for contact sheets.
 *  Run from MAIN checkout. Writes a manifest (slug -> local file + meta) to scratchpad. */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch { /* env from shell */ }
}
loadEnvFile('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import { prisma } from '@homemade/db'

const SCRATCH = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-jolly-visvesvaraya-564eb8/a77e9b9e-ee18-4618-899c-bbd75803d8b3/scratchpad'
const CACHE = resolve(SCRATCH, 'xs-thumbs')
const BASE = process.env.R2_PUBLIC_BASE_URL ?? 'https://media.homemade.education'

async function main(): Promise<void> {
  mkdirSync(CACHE, { recursive: true })
  const pats = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH', visibility: 'PUBLIC' },
    select: {
      slug: true, name: true, colourCount: true, widthCells: true, heightCells: true, difficulty: true,
      description: true, publishedAt: true,
      subCategory: { select: { slug: true } }, designer: { select: { slug: true } },
      thumbnail: { select: { r2Key: true } }, hero: { select: { r2Key: true } },
    },
    orderBy: [{ subCategory: { slug: 'asc' } }, { slug: 'asc' }],
  })
  const manifest: Record<string, unknown>[] = []
  let dl = 0, miss = 0, cached = 0
  for (const p of pats) {
    const key = p.hero?.r2Key ?? p.thumbnail?.r2Key
    const file = resolve(CACHE, `${p.slug}.png`)
    const rec = {
      slug: p.slug, name: p.name, colourCount: p.colourCount, w: p.widthCells, h: p.heightCells,
      difficulty: p.difficulty, sub: p.subCategory?.slug ?? null, designer: p.designer?.slug ?? null,
      description: p.description, publishedAt: p.publishedAt, hasHero: !!p.hero?.r2Key, file: existsSync(file) ? file : null,
    }
    manifest.push(rec)
    if (!key) { miss++; continue }
    if (existsSync(file)) { cached++; rec.file = file; continue }
    try {
      const res = await fetch(`${BASE}/${key}`)
      if (!res.ok) { miss++; continue }
      const buf = Buffer.from(await res.arrayBuffer())
      writeFileSync(file, buf)
      rec.file = file
      dl++
      if (dl % 100 === 0) console.log(`  downloaded ${dl}...`)
    } catch { miss++ }
  }
  writeFileSync(resolve(SCRATCH, 'xs-manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`total ${pats.length} · downloaded ${dl} · cached ${cached} · missing-image ${miss}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
