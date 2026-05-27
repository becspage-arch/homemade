/**
 * Strip the trailing "Where this practice comes from" H2 + paragraph from
 * batch40 mindset bodies. The paragraph text contains academic citations
 * (Project Gutenberg, Bandura, EFT history) that fail the grade-level /
 * historical-figure rules. Move the substance to sourceNotes (or merge if
 * it's already there) and drop the H2 + paragraph from body.
 *
 * Run once after the rewriter agents.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const FILES = [
  'stillness-is-safe-i-am-safe',
  'surrender-breath-exhale-longer-than-inhale',
  'tapping-during-the-panic',
  'tapping-for-bills-always-win',
  'tapping-for-body-level-wired',
]

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch40')

  for (const slug of FILES) {
    const filePath = resolve(batchDir, `${slug}.json`)
    const raw = readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)

    if (!data.body || !Array.isArray(data.body.content)) {
      console.log(`[skip] ${slug} — no body content`)
      continue
    }

    const content: any[] = data.body.content
    // Find the last H2 heading whose text matches the "where this practice
    // comes from" pattern, and remove it + any following paragraph.
    let foundIdx = -1
    for (let i = content.length - 1; i >= 0; i--) {
      const n = content[i]
      if (
        n?.type === 'heading' &&
        n?.attrs?.level === 2 &&
        Array.isArray(n?.content) &&
        typeof n.content[0]?.text === 'string'
      ) {
        const headingText = n.content[0].text.toLowerCase()
        if (
          headingText.includes('where this practice comes from') ||
          headingText.includes('about this practice') ||
          headingText.includes('the source') ||
          headingText.includes('sources') ||
          headingText.includes('lineage')
        ) {
          foundIdx = i
          break
        }
      }
    }

    if (foundIdx === -1) {
      // Maybe the failing paragraph isn't under a heading. Find the last
      // paragraph and check it.
      const last = content[content.length - 1]
      if (last?.type === 'paragraph') {
        const text = (last.content?.[0]?.text ?? '').toLowerCase()
        if (
          text.includes('adapted from') ||
          text.includes('original to homemade.education') ||
          text.includes('emotional freedom technique') ||
          text.includes('public-domain') ||
          text.includes('public domain') ||
          text.includes('pranayama')
        ) {
          foundIdx = content.length - 1
        }
      }
    }

    if (foundIdx === -1) {
      console.log(`[skip] ${slug} — no matching heading or trailing source paragraph`)
      continue
    }

    // Extract the migrated text from the paragraph(s) we're removing.
    const removed = content.slice(foundIdx)
    const migratedText: string[] = []
    for (const n of removed) {
      if (n.type === 'paragraph' && Array.isArray(n.content)) {
        const text = n.content
          .map((c: any) => (typeof c?.text === 'string' ? c.text : ''))
          .join('')
        if (text) migratedText.push(text)
      }
    }

    // Append to sourceNotes if not already present.
    const existing = (data.sourceNotes ?? '').toString()
    let appended = existing
    for (const t of migratedText) {
      if (!existing.includes(t.slice(0, 40))) {
        appended = appended ? `${appended} ${t}` : t
      }
    }
    data.sourceNotes = appended

    // Trim body.
    data.body.content = content.slice(0, foundIdx)

    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${slug} — removed ${removed.length} block(s) from body`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
