/**
 * Print the raw paragraph node at body.content[idx] for diagnostic.
 * Usage: tsx scripts/_inspect-paragraphs.ts <file-relative-to-worktree> <idx>
 *   (idx is the path index, e.g. 0 for paragraph[0])
 *
 * Or with --all to dump every paragraph with the fragments.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')

const file = process.argv[2]
const idx = parseInt(process.argv[3] ?? '-1', 10)

const fullPath = resolve(worktreeRoot, file)
const data = JSON.parse(readFileSync(fullPath, 'utf8'))
const body = data.body

if (idx >= 0) {
  console.log(JSON.stringify(body.content[idx], null, 2))
} else {
  body.content.forEach((node: any, i: number) => {
    if (node.type === 'paragraph') {
      const text = (node.content ?? []).map((c: any) => c.text ?? '[MARK]').join('|')
      console.log(`[${i}] paragraph: ${text}`)
    }
  })
}
