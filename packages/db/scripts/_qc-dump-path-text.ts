/**
 * Dump the full text at specific body paths for given slugs.
 * Input: JSON array of {slug, path} on stdin or as args
 * Usage: tsx _qc-dump-path-text.ts slug1 "path1" slug2 "path2" ...
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

interface TipTapNode { type?: string; content?: TipTapNode[]; text?: string }

function getNodeAtPath(root: TipTapNode, path: string): TipTapNode | null {
  const parts = path.replace(/^body\s*>\s*/, '').split(/\s*>\s*/)
  let current: TipTapNode = root
  for (const part of parts) {
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (!m) return null
    const [, nodeType, idxStr] = m
    const idx = parseInt(idxStr!)
    const children = current.content ?? []
    const matches = children.filter(n => n.type === nodeType)
    if (idx >= matches.length) return null
    current = matches[idx]!
  }
  return current
}

function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

async function main() {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 2) {
    const slug = args[i]!
    const path = args[i + 1]!
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }
    const node = getNodeAtPath(t.body as TipTapNode, path)
    const text = extractText(node)
    console.log('=== ' + slug + ' @ ' + path + ' ===')
    console.log(text)
    console.log('')
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
