import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

function extractText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map((n: any) => extractText(n)).join('')
  return ''
}

// Navigate using raw array indices (qc-audit paths use position in content[], not type-filtered index)
function getByRawPath(root: any, pathStr: string): any {
  const parts = pathStr.replace(/^body > /, '').split(' > ')
  let current: any = root
  for (const part of parts) {
    if (!current) return null
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (!m) return null
    const [, , idxStr] = m
    const idx = parseInt(idxStr!, 10)
    const children = Array.isArray(current.content) ? current.content : []
    current = children[idx] ?? null
  }
  return current
}

async function dumpSlug(slug: string, pathStr: string, extra?: string) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = t.body as any
  const node = getByRawPath(body, pathStr)
  const text = extractText(node)
  console.log(`=== ${slug} ===`)
  console.log(`PATH: ${pathStr}`)
  console.log(`NODE TYPE: ${node?.type ?? 'null'}`)
  console.log(`TEXT: ${text}`)
  if (extra) console.log(`EXTRA: ${extra}`)
  console.log()
}

async function dumpInfoPanel(slug: string, rawIdx: number, paraRawIdx: number) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = t.body as any
  const children = body.content ?? []
  const panel = children[rawIdx]
  console.log(`=== ${slug} ===`)
  if (!panel || panel.type !== 'infoPanel') {
    console.log(`body.content[${rawIdx}] is ${panel?.type ?? 'undefined'}, not infoPanel`)
    console.log(`Total body.content length: ${children.length}`)
    // show a range
    for (let i = Math.max(0, rawIdx-2); i <= Math.min(children.length-1, rawIdx+2); i++) {
      console.log(`  [${i}]: type=${children[i]?.type}`)
    }
    console.log()
    return
  }
  if (typeof panel.attrs?.body === 'string') {
    console.log(`PATH: body > infoPanel[${rawIdx}] > body (string)`)
    console.log(`TEXT: ${panel.attrs.body}`)
  } else {
    const paraNode = (panel.content ?? [])[paraRawIdx]
    console.log(`PATH: body > infoPanel[${rawIdx}] > paragraph[${paraRawIdx}]`)
    console.log(`NODE TYPE: ${paraNode?.type ?? 'null'}`)
    console.log(`TEXT: ${extractText(paraNode)}`)
    // Also show other paragraphs for context
    for (let i = 0; i < Math.min((panel.content ?? []).length, 6); i++) {
      const n = panel.content[i]
      console.log(`  content[${i}] type=${n?.type}: ${extractText(n).slice(0, 100)}`)
    }
  }
  console.log()
}

async function main() {
  await dumpSlug('creamed-honey-making', 'body > troubleshooter[17] > troubleshooterItem[0] > paragraph[1]')
  await dumpSlug('decontaminating-equipment-after-foulbrood', 'body > orderedList[3] > listItem[0] > paragraph[0]')
  await dumpSlug('goat-mastitis-recognition-and-response', 'body > orderedList[13] > listItem[0] > paragraph[0]')
  await dumpSlug('internal-laying-and-egg-peritonitis-in-hens', 'body > bulletList[2] > listItem[0] > paragraph[0]')
  await dumpSlug('introducing-new-rabbits-to-a-colony', 'body > orderedList[10] > listItem[0] > paragraph[0]')
  await dumpInfoPanel('managing-mareks-disease-in-a-backyard-flock', 11, 0)
  await dumpSlug('preparing-for-the-shearing-contractor', 'body > paragraph[0]', 'also: Americanism "fall" in body > paragraph[9] text')
  await dumpInfoPanel('recognising-swine-dysentery', 4, 3)
  await dumpSlug('stocking-a-livestock-medicine-cabinet', 'body > paragraph[0]')
  await dumpSlug('training-pigs-to-an-electric-fence', 'body > paragraph[0]')
  await dumpSlug('treating-encephalitozoon-cuniculi-in-rabbits', 'body > paragraph[0]')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
