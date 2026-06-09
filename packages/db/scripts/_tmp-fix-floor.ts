import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const SLUG = 'floor-insulation-below-service-runs'
const OLD = 'Fit rodent mesh or treated timber barriers at the perimeter sleeper walls and around any pipe or cable penetrations to keep pests out of the void.'
const NEW = 'Fit rodent mesh at the base of each sleeper wall. Use treated timber or mesh around any pipe or cable holes to keep pests out of the void.'

function replace(node: any): any {
  if (node.type === 'text' && node.text === OLD) return { ...node, text: NEW }
  if (node.content) return { ...node, content: node.content.map(replace) }
  return node
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findUnique({ where: { slug: SLUG }, select: { id: true, body: true } })
  if (!t) { console.log('NOT FOUND'); process.exit(1) }
  const newBody = replace(t.body as any)
  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body: newBody, voiceRetrofittedAt: new Date() }
  })
  console.log('UPDATED ' + SLUG)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
