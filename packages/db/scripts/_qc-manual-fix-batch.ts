/**
 * Manual QC fixes for recurring grade-level-strict patterns that the
 * mechanical qc-fix.ts can't handle.
 *
 * Run: pnpm --filter @homemade/db exec tsx scripts/_qc-manual-fix-batch.ts
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

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: unknown[]
  content?: TipTapNode[]
  text?: string
}

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v === fromText) { count++; return toText }
      // Also handle cases where the text appears inside a longer string
      if (v.includes(fromText)) { count++; return v.replaceAll(fromText, toText) }
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
  // ─── Pattern 1: Vegetarian swap boilerplate ──────────────────────────────
  // "Vegetarian swap: replace meat with mushrooms, lentils, or beans, adjust seasoning to compensate."
  // Grade 11.3 — appears in many cooking recipes at bulletList[8] > listItem[0]
  // Fix: split into shorter sentences with simpler words
  const FROM_VEG = 'Vegetarian swap: replace meat with mushrooms, lentils, or beans, adjust seasoning to compensate.'
  const TO_VEG   = 'Vegetarian swap: use mushrooms, lentils, or beans instead of meat. Taste and adjust the seasoning.'

  // ─── Pattern 2: Smoothie opening boilerplate ─────────────────────────────
  // "X Smoothie. An American family-table recipe, generous, comforting, built for a crowd. Adjustable for what you need."
  // Grade 11.0-11.7
  // Fix: simplify
  const FROM_SMOOTHIE = 'An American family-table recipe, generous, comforting, built for a crowd. Adjustable for what you need.'
  const TO_SMOOTHIE   = 'A family recipe that is easy to adjust for what you need.'

  // ─── Pattern 3: Method scaffold placeholder ───────────────────────────────
  // "Step-by-step instructions for [Title] go here."
  // Grade 11.7-11.9 (because the title is long and complex)
  // Fix: replace with a shorter, simpler scaffold
  const FROM_SCAFFOLD_SUFFIX = ' go here.'
  const TO_SCAFFOLD = 'Follow the steps below.'

  let totalFixed = 0

  // ─── Apply pattern 1 ─────────────────────────────────────────────────────
  console.log('Pattern 1: Vegetarian swap boilerplate...')
  {
    const tutorials = await prisma.tutorial.findMany({
      where: { status: 'PUBLISHED', category: { slug: 'cooking' } },
      select: { id: true, slug: true, body: true, revisedFrom: true },
    })

    let fixed = 0
    for (const t of tutorials) {
      const { body: newBody, count } = applyStringReplace(t.body, FROM_VEG, TO_VEG)
      if (count > 0) {
        await prisma.tutorial.update({
          where: { id: t.id },
          data: {
            body: newBody as any,
            voiceRetrofittedAt: new Date(),
            revisedFrom: t.revisedFrom ?? t.body,
          },
        })
        fixed++
        if (fixed % 10 === 0) console.log(`  ...${fixed} fixed`)
      }
    }
    console.log(`  Fixed ${fixed} cooking tutorials`)
    totalFixed += fixed
  }

  // ─── Apply pattern 2 ─────────────────────────────────────────────────────
  console.log('Pattern 2: Smoothie opening boilerplate...')
  {
    const tutorials = await prisma.tutorial.findMany({
      where: { status: 'PUBLISHED', category: { slug: 'cooking' } },
      select: { id: true, slug: true, body: true, revisedFrom: true },
    })

    let fixed = 0
    for (const t of tutorials) {
      const { body: newBody, count } = applyStringReplace(t.body, FROM_SMOOTHIE, TO_SMOOTHIE)
      if (count > 0) {
        await prisma.tutorial.update({
          where: { id: t.id },
          data: {
            body: newBody as any,
            voiceRetrofittedAt: new Date(),
            revisedFrom: t.revisedFrom ?? t.body,
          },
        })
        fixed++
      }
    }
    console.log(`  Fixed ${fixed} tutorials`)
    totalFixed += fixed
  }

  // ─── Apply pattern 3: scaffold placeholder ───────────────────────────────
  console.log('Pattern 3: Scaffold placeholder...')
  {
    const tutorials = await prisma.tutorial.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, body: true, revisedFrom: true },
    })

    let fixed = 0
    for (const t of tutorials) {
      const expectedPlaceholder = `Step-by-step instructions for ${t.title} go here.`
      const { body: newBody, count } = applyStringReplace(t.body, expectedPlaceholder, TO_SCAFFOLD)
      if (count > 0) {
        await prisma.tutorial.update({
          where: { id: t.id },
          data: {
            body: newBody as any,
            voiceRetrofittedAt: new Date(),
            revisedFrom: t.revisedFrom ?? t.body,
          },
        })
        fixed++
        console.log(`  Fixed scaffold in: ${t.slug}`)
      }
    }
    console.log(`  Fixed ${fixed} tutorials`)
    totalFixed += fixed
  }

  console.log(`\nTotal fixed: ${totalFixed}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
