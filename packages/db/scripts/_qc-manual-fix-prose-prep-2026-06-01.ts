/**
 * One-shot manual fix: convert prose-prep-step paragraphs to orderedList nodes.
 * Run: pnpm --filter @homemade/db exec tsx scripts/_qc-manual-fix-prose-prep-2026-06-01.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
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

// Split text into steps on ". " boundaries, preserving trailing period on each step.
function splitSteps(text: string): string[] {
  const raw = text.split('. ')
  return raw.map((s, i) => {
    const trimmed = s.trim()
    if (i < raw.length - 1) {
      return trimmed.endsWith('.') ? trimmed : trimmed + '.'
    }
    // Last fragment may already end with '.'
    return trimmed.endsWith('.') ? trimmed : trimmed + '.'
  }).filter(s => s.length > 1)
}

function makeListItem(text: string): any {
  return {
    type: 'listItem',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function makeOrderedList(steps: string[]): any {
  return { type: 'orderedList', content: steps.map(makeListItem) }
}

// Get plain text from a paragraph node
function paraText(para: any): string {
  return (para?.content || []).map((n: any) => n.text || '').join('')
}

// ─── CASES ──────────────────────────────────────────────────────────────────

// Case A: Replace body.content[idx] (a paragraph) with an orderedList
type CaseA = { kind: 'replace-para'; slug: string; bodyIdx: number }

// Case B: Split body.content[listBodyIdx].content[listItemIdx] into multiple listItems
type CaseB = { kind: 'split-listitem'; slug: string; listBodyIdx: number; listItemIdx: number }

type Fix = CaseA | CaseB

const FIXES: Fix[] = [
  // Top-level paragraph → orderedList
  { kind: 'replace-para', slug: 'folio-wallet-construction',               bodyIdx: 10 },
  { kind: 'replace-para', slug: 'kibbeh',                                  bodyIdx: 6  },
  { kind: 'replace-para', slug: 'mercimek-corbasi',                        bodyIdx: 9  },
  { kind: 'replace-para', slug: 'pasta-aglio-e-olio',                      bodyIdx: 9  },
  { kind: 'replace-para', slug: 'polymer-clay-gradient-blend-earrings',    bodyIdx: 6  },
  { kind: 'replace-para', slug: 'wet-felted-pebble-soap-dish',             bodyIdx: 8  },
  // Inside orderedList: split listItem into multiple listItems
  // cottage-pie-jacket-potato: body.content[7] = orderedList, listItem[1]
  { kind: 'split-listitem', slug: 'cottage-pie-jacket-potato',   listBodyIdx: 7, listItemIdx: 1 },
  // green-oak-tool-tote: body.content[5] = orderedList, listItem[0]
  { kind: 'split-listitem', slug: 'green-oak-tool-tote',         listBodyIdx: 5, listItemIdx: 0 },
]

async function main(): Promise<void> {
  for (const fix of FIXES) {
    const t = await prisma.tutorial.findUnique({ where: { slug: fix.slug }, select: { id: true, body: true } })
    if (!t) { console.log(fix.slug + ': NOT FOUND'); continue }
    const body = JSON.parse(JSON.stringify(t.body)) as any
    const content: any[] = body.content || []

    if (fix.kind === 'replace-para') {
      const node = content[fix.bodyIdx]
      if (!node) { console.log(fix.slug + ': body.content[' + fix.bodyIdx + '] not found'); continue }
      if (node.type !== 'paragraph') {
        console.log(fix.slug + ': body.content[' + fix.bodyIdx + '] is ' + node.type + ', expected paragraph')
        continue
      }
      const text = paraText(node)
      const steps = splitSteps(text)
      content[fix.bodyIdx] = makeOrderedList(steps)
      console.log(fix.slug + ': replaced para[' + fix.bodyIdx + '] with orderedList(' + steps.length + ' steps)')

    } else {
      // split-listitem
      const listNode = content[fix.listBodyIdx]
      if (!listNode || listNode.type !== 'orderedList') {
        console.log(fix.slug + ': body.content[' + fix.listBodyIdx + '] is not orderedList')
        continue
      }
      const listItems: any[] = listNode.content || []
      const item = listItems[fix.listItemIdx]
      if (!item || item.type !== 'listItem') {
        console.log(fix.slug + ': listItem[' + fix.listItemIdx + '] not found')
        continue
      }
      const para = (item.content || [])[0]
      if (!para || para.type !== 'paragraph') {
        console.log(fix.slug + ': listItem content is not a paragraph')
        continue
      }
      const text = paraText(para)
      const steps = splitSteps(text)
      const newItems = steps.map(makeListItem)
      // Replace the single listItem with multiple
      listItems.splice(fix.listItemIdx, 1, ...newItems)
      console.log(fix.slug + ': split listItem[' + fix.listItemIdx + '] into ' + steps.length + ' items')
    }

    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body, voiceRetrofittedAt: new Date() },
    })
  }

  await prisma.$disconnect()
  console.log('done')
}

main().catch((err) => {
  console.error('prose-prep-fix failed:', err)
  process.exit(1)
})
