import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname; 
for (let i=0;i<8;i++){
  const c=resolve(dir,'.env.credentials');
  if(existsSync(c)){loadEnv({path:c,override:true});break}
  const p=dirname(dir);if(p===dir)break;dir=p
}
const slug = process.argv[2] ?? 'compost-tea-and-liquid-feeds'
function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.content) return (node.content as any[]).map(extractText).join(' ')
  return ''
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true, title: true } })
  console.log('TITLE:', t?.title)
  const body = t?.body as any
  if (body?.content) {
    for (const node of body.content) {
      const text = extractText(node).trim()
      if (text.length > 30) console.log(`[${node.type}]`, text.substring(0,400))
    }
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
