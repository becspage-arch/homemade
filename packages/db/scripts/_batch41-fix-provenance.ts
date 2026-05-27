/**
 * Remove the duplicate "Where this practice comes from" heading + paragraph
 * from the 6 mindset bodies in batch41 whose body[11] or [13] paragraph just
 * repeats sourceNotes. The public renderer surfaces sourceNotes as a Sources
 * block at the bottom of the page, so the in-body duplicate is redundant.
 *
 * Pure file-system; no DB.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const targets = [
  'tapping-for-debt-obsession',
  'tapping-for-daily-wealth-habits',
  'tapping-for-i-cant-afford-to-decorate',
  'tapping-for-i-feel-guilty-asking-for-more',
  'tapping-for-health-anxiety',
  'tapping-for-fear-of-repeating-family-patterns',
]

const HEADING_PATTERN = /where this (practice )?comes from/i

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch41')

  for (const slug of targets) {
    const path = resolve(batchDir, `${slug}.json`)
    const data: any = JSON.parse(readFileSync(path, 'utf8'))
    const blocks: any[] = data.body?.content ?? []
    let headingIdx = -1
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      if (b.type !== 'heading') continue
      const text = (b.content ?? []).map((c: any) => c.text ?? '').join('')
      if (HEADING_PATTERN.test(text)) {
        headingIdx = i
        break
      }
    }
    if (headingIdx < 0) {
      console.log(`[SKIP] ${slug} — no provenance heading found`)
      continue
    }
    const next = blocks[headingIdx + 1]
    if (!next || next.type !== 'paragraph') {
      console.log(`[SKIP] ${slug} — block after heading is not a paragraph (${next?.type})`)
      continue
    }
    // Remove heading + paragraph.
    blocks.splice(headingIdx, 2)
    data.body.content = blocks
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${slug} — removed heading[${headingIdx}] + paragraph[${headingIdx + 1}]`)
  }
}

main()
