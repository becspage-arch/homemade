import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')

  const drafts = await prisma.tutorial.findMany({
    where: { status: 'DRAFT' },
    select: {
      id: true,
      slug: true,
      title: true,
      heroMediaId: true,
      category: { select: { slug: true } },
    },
    orderBy: [{ category: { order: 'asc' } }, { updatedAt: 'desc' }],
  })

  let lastCat = ''
  for (const d of drafts) {
    if (d.category.slug !== lastCat) {
      console.log(`\n=== ${d.category.slug} ===`)
      lastCat = d.category.slug
    }
    const m = d.heroMediaId
      ? await prisma.media.findUnique({
          where: { id: d.heroMediaId },
          select: {
            id: true,
            cloudflareId: true,
            sourceUrl: true,
            source: true,
            type: true,
            status: true,
            verificationStatus: true,
            verificationReason: true,
            alt: true,
            licenceCode: true,
            creatorName: true,
            attribution: true,
          },
        })
      : null
    console.log(`\n  ${d.title}`)
    console.log(`    /admin/tutorials/${d.id}`)
    if (!m) {
      console.log(`    NO MEDIA ROW (heroMediaId: ${d.heroMediaId})`)
    } else {
      const usable = !!(m.cloudflareId || m.sourceUrl)
      console.log(`    MEDIA: ${m.id}`)
      console.log(`      source: ${m.source}  type: ${m.type}  status: ${m.status}  verif: ${m.verificationStatus}`)
      console.log(`      cloudflareId: ${m.cloudflareId || '(none)'}`)
      console.log(`      sourceUrl:    ${m.sourceUrl ? m.sourceUrl.slice(0, 100) : '(none)'}`)
      console.log(`      alt:          ${m.alt ? m.alt.slice(0, 80) : '(none)'}`)
      console.log(`      licenceCode:  ${m.licenceCode || '(none)'}  creator: ${m.creatorName || '(none)'}`)
      console.log(`      RENDER-READY: ${usable ? 'YES' : 'NO. image will not display'}`)
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
