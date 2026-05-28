import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const file = process.argv[2]!
const data = JSON.parse(
  readFileSync(resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch11', file), 'utf8'),
)
console.log('sourceNotes:')
console.log(data.sourceNotes)
console.log('\n--- body content count:', data.body.content.length)
console.log('\n--- last 5 nodes ---')
const arr = data.body.content as any[]
for (let i = Math.max(0, arr.length - 5); i < arr.length; i++) {
  console.log(i, arr[i].type)
  if (arr[i].type === 'paragraph') {
    const text = (arr[i].content || []).map((c: any) => c.text).join('')
    console.log(`   "${text}"`)
  } else if (arr[i].type === 'heading') {
    const text = (arr[i].content || []).map((c: any) => c.text).join('')
    console.log(`   level ${arr[i].attrs?.level} "${text}"`)
  }
}
