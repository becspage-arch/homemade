/**
 * Verify what's actually in the DB body for each pilot slug. Compare against
 * disk JSON to make sure apply went through cleanly.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
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
import { prisma } from '../src'

const SLUGS = [
  'calendula-salve-for-skin',
  'a-bank-balance-that-climbs-while-you-sleep',
  'ackee-and-saltfish',
  'almond-croissants-leftover',
  'alternating-square-knot-macrame',
  'ash-serving-tray',
  'applying-a-limewash-finish',
  'arnica-balm',
  'airtightness-survey-smoke-pencil',
  'assisting-a-stuck-lamb-at-lambing',
]

function countWords(node: any): number {
  if (!node) return 0
  let n = 0
  if (node.text) n += node.text.split(/\s+/).filter(Boolean).length
  if (node.content) for (const c of node.content) n += countWords(c)
  return n
}

function countBlocks(node: any, type: string): number {
  if (!node) return 0
  let n = 0
  if (node.type === type) n++
  if (node.content) for (const c of node.content) n += countBlocks(c, type)
  return n
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const pilotDir = resolve(worktreeRoot, 'docs/voice-pilot-2026-05-25')

  for (const slug of SLUGS) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      select: { body: true, revisedFrom: true },
    })
    if (!t) {
      console.log(`[${slug}] NOT FOUND`)
      continue
    }
    const diskPath = resolve(pilotDir, `${slug}.json`)
    const disk = JSON.parse(readFileSync(diskPath, 'utf8'))

    const dbWords = countWords(t.body)
    const diskWords = countWords(disk.body)
    const dbOL = countBlocks(t.body, 'orderedList')
    const diskOL = countBlocks(disk.body, 'orderedList')
    const matches = JSON.stringify(t.body) === JSON.stringify(disk.body)

    console.log(
      `[${slug}] db=${dbWords}w/${dbOL}ol disk=${diskWords}w/${diskOL}ol match=${matches} hasRevisedFrom=${t.revisedFrom != null}`,
    )
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
