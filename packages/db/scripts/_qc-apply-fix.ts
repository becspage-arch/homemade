/**
 * Apply a targeted string replacement to a specific tutorial body.
 * Usage: tsx _qc-apply-fix.ts <slug> "<fromText>" "<toText>"
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

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) {
        count++
        return v.replaceAll(fromText, toText)
      }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        out[k] = walk(val)
      }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

async function main() {
  const [slug, fromText, toText] = process.argv.slice(2)
  if (!slug || !fromText || toText === undefined) {
    console.log('usage: tsx _qc-apply-fix.ts <slug> <fromText> <toText>')
    process.exit(1)
  }

  const t = await prisma.tutorial.findUnique({
    where: { slug },
    select: { id: true, body: true, revisedFrom: true }
  })
  if (!t) { console.log('NOT FOUND: ' + slug); process.exit(1) }

  const { body: newBody, count } = applyStringReplace(t.body, fromText, toText)
  if (count === 0) {
    console.log('Text not found in body of ' + slug)
    process.exit(1)
  }

  await prisma.tutorial.update({
    where: { id: t.id },
    data: {
      body: newBody as any,
      voiceRetrofittedAt: new Date(),
      revisedFrom: t.revisedFrom ?? t.body,
    }
  })
  console.log('Fixed ' + slug + ' (' + count + ' replacement(s))')
  await prisma.$disconnect()
}

main()
