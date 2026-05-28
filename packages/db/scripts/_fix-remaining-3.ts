import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch11')

const fixes: { file: string; find: string; replace: string }[] = [
  {
    file: 'tapping-for-abundance-through-the-family-line.json',
    find: 'Even though I carry old family worry about money, I deeply and completely accept myself.',
    replace: 'Even though money worry runs in my family line, I deeply and completely accept myself.',
  },
  {
    file: 'tapping-for-inherited-religion.json',
    find: 'Even though questioning the religion I was raised in feels like a betrayal of the people who taught it, I deeply and completely accept myself.',
    replace: 'Even though doubting the faith I was raised in feels like a betrayal of those who taught it, I deeply and completely accept myself.',
  },
  {
    file: 'tapping-for-money-sex-power-taboo.json',
    find: "Even though I've soaked up a rule that money, desire, and power can't all belong to me at once, I honour what it has been protecting, and I am ready to let it go.",
    replace: 'Even though an old rule says money, desire, and power cannot all be mine, I honour what it guards, and I let it go.',
  },
]

function replaceTextInTree(node: any, find: string, replace: string): boolean {
  let changed = false
  if (!node || typeof node !== 'object') return changed
  if (typeof node.text === 'string' && node.text === find) {
    node.text = replace
    changed = true
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) if (replaceTextInTree(c, find, replace)) changed = true
  }
  return changed
}

for (const { file, find, replace } of fixes) {
  const path = resolve(dir, file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const ok = replaceTextInTree(data.body, find, replace)
  if (!ok) {
    console.error(`MISS: ${file}`)
    continue
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`OK: ${file}`)
}
