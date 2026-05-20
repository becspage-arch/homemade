import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'cross-stitch-alphabet-sampler-border' },
    select: {
      id: true, slug: true, title: true, status: true,
      versions: { orderBy: { createdAt: 'desc' }, take: 1, select: { body: true } },
    },
  })
  if (!t) { console.log('not found'); return }
  console.log(`id=${t.id} status=${t.status}`)
  const body = t.versions[0]?.body as any
  writeFileSync(resolve(__dirname, '_alphabet-body.json'), JSON.stringify(body, null, 2))
  console.log('body written to _alphabet-body.json')
  // Find chart node
  function walk(node: any, path: string[] = []): any {
    if (!node) return null
    if (node.type === 'crossStitchChart') return { path, node }
    if (Array.isArray(node.content)) {
      for (let i = 0; i < node.content.length; i++) {
        const r: any = walk(node.content[i], [...path, String(i)])
        if (r) return r
      }
    }
    return null
  }
  const found: any = walk(body)
  if (found) {
    console.log('chart node path:', found.path.join('/'))
    const def = found.node.attrs?.definition
    console.log('chart definition keys:', Object.keys(def ?? {}))
    if (def?.cells) {
      console.log('cells count:', def.cells.length)
      if (def.cells.length > 0) console.log('first cell:', def.cells[0])
    }
    if (def?.palette) console.log('palette:', def.palette)
    if (def?.rows) console.log('rows:', def.rows)
    if (def?.columns) console.log('columns:', def.columns)
  } else {
    console.log('no crossStitchChart node found')
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
