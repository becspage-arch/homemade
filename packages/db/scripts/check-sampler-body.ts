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
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'cross-stitch-alphabet-sampler-border' },
    select: { id: true, slug: true, title: true, body: true, heroMediaId: true },
  })
  if (!t) {
    console.log('not found')
    return
  }
  console.log(`id: ${t.id}`)
  console.log(`heroMediaId: ${t.heroMediaId}`)
  const body = t.body as any
  console.log(`body.type: ${body?.type}`)
  console.log(`body.content count: ${body?.content?.length}`)
  const nodeTypes = (body?.content || []).map((n: any, i: number) => {
    let extra = ''
    if (n.type === 'crossStitchChart') {
      extra = ` (palette: ${n.attrs?.definition?.palette?.length}, cells: ${n.attrs?.definition?.cells?.length})`
    }
    if (n.type === 'heading') {
      const text = (n.content || []).map((c: any) => c.text).join('')
      extra = ` "${text}"`
    }
    if (n.type === 'infoPanel') {
      extra = ` tone=${n.attrs?.tone} title="${n.attrs?.title}"`
    }
    return `${String(i).padStart(3)}: ${n.type}${extra}`
  })
  console.log('NODES:')
  nodeTypes.forEach((s: string) => console.log(s))
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
