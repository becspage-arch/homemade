/**
 * Second-pass fixes for batch33: two paragraphs still failing voice-check.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

type TextLeaf = { type: 'text'; text: string }

interface Rewrite {
  file: string
  path: string
  newContent: TextLeaf[]
}

const REWRITES: Rewrite[] = [
  {
    file: 'matrescence-the-identity-rewrite.json',
    path: 'body > paragraph[11]',
    newContent: [{ type: 'text', text: "Having a word for matrescence changes the experience. A framework that takes it as a transition, not a crisis or a failure, gives the feeling somewhere to land. Women who understand what is happening to them during the change report being better able to tolerate it. They are more patient with the confusion. They are less likely to take their own normal responses as signs of breakdown." }],
  },
  {
    file: 'money-arriving-while-you-nap.json',
    path: 'body > paragraph[9]',
    newContent: [{ type: 'text', text: "Original to homemade.education. The visualisation is used here in a specific setting. The wider practice has roots in several lineages." }],
  },
]

function navigatePath(body: any, path: string): { parent: any } | null {
  const parts = path.split(' > ').slice(1)
  let node: any = body
  for (let i = 0; i < parts.length; i++) {
    const m = parts[i]!.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (!m) return null
    const idx = parseInt(m[2]!, 10)
    if (i === parts.length - 1) {
      const child = node?.content?.[idx]
      if (!child) return null
      return { parent: child }
    }
    node = node?.content?.[idx]
  }
  return null
}

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch33')
  for (const r of REWRITES) {
    const fullPath = resolve(batchDir, r.file)
    const data = JSON.parse(readFileSync(fullPath, 'utf8'))
    const target = navigatePath(data.body, r.path)
    if (!target || target.parent.type !== 'paragraph') {
      console.error(`[FAIL] ${r.file} ${r.path}`)
      continue
    }
    target.parent.content = r.newContent
    writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${r.file} ${r.path}`)
  }
}

main()
