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
    where: { category: { slug: 'crochet' } },
    select: { id: true, slug: true, title: true, body: true, heroMediaId: true },
  })
  for (const t of drafts) {
    console.log(`\n=== ${t.title} ===`)
    console.log(`slug: ${t.slug}`)
    console.log(`id: ${t.id}`)
    console.log(`heroMediaId: ${t.heroMediaId}`)
    const body = t.body as any
    console.log(`body.content count: ${body?.content?.length}`)
    const types = (body?.content || []).map((n: any, i: number) => {
      let extra = ''
      if (n.type === 'heading') extra = ` "${(n.content || []).map((c: any) => c.text).join('')}"`
      if (n.type === 'infoPanel') extra = ` tone=${n.attrs?.tone} title="${n.attrs?.title}"`
      if (n.type === 'craftChart' || n.type === 'chart') extra = ` (chart present)`
      return `  ${String(i).padStart(3)}: ${n.type}${extra}`
    })
    console.log(types.join('\n'))
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
