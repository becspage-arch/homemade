/** Throwaway inventory of the cross-stitch catalogue. Run from MAIN checkout. */
import { readFileSync, writeFileSync } from 'node:fs'
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

async function main(): Promise<void> {
  const pats = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH' },
    select: {
      slug: true, name: true, visibility: true, colourCount: true, widthCells: true, heightCells: true,
      difficulty: true, thumbnailMediaId: true, heroMediaId: true, description: true, publishedAt: true,
      subCategory: { select: { slug: true, name: true } },
      designer: { select: { slug: true, displayName: true } },
    },
    orderBy: { slug: 'asc' },
  })

  // status counts
  const byStatus: Record<string, number> = {}
  for (const p of pats) byStatus[p.visibility] = (byStatus[p.visibility] ?? 0) + 1

  const pub = pats.filter((p) => p.visibility === 'PUBLIC')

  const bySub: Record<string, number> = {}
  for (const p of pub) { const k = p.subCategory?.slug ?? '<<NULL>>'; bySub[k] = (bySub[k] ?? 0) + 1 }

  const byDesigner: Record<string, number> = {}
  for (const p of pub) { const k = p.designer?.slug ?? '<<none>>'; byDesigner[k] = (byDesigner[k] ?? 0) + 1 }

  const byColourBand: Record<string, number> = {}
  for (const p of pub) {
    const c = p.colourCount ?? 0
    const band = c <= 3 ? '0-3' : c <= 6 ? '4-6' : c <= 12 ? '7-12' : c <= 24 ? '13-24' : '25+'
    byColourBand[band] = (byColourBand[band] ?? 0) + 1
  }

  console.log('=== STATUS ==='); console.log(JSON.stringify(byStatus, null, 2))
  console.log('=== PUBLIC by sub-category ==='); console.log(JSON.stringify(bySub, null, 2))
  console.log('=== PUBLIC by designer ==='); console.log(JSON.stringify(byDesigner, null, 2))
  console.log('=== PUBLIC by colour band ==='); console.log(JSON.stringify(byColourBand, null, 2))
  console.log(`=== TOTAL patterns: ${pats.length}, PUBLIC: ${pub.length} ===`)

  writeFileSync(
    'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-jolly-visvesvaraya-564eb8/a77e9b9e-ee18-4618-899c-bbd75803d8b3/scratchpad/xs-all.json',
    JSON.stringify(pats, null, 2),
  )
  console.log('wrote xs-all.json')
  await prisma.$disconnect()
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
