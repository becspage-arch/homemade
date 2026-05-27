/**
 * Dump the offending paragraphs from batch40 voice-check failures so we can
 * see them and decide whether to rewrite.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const FAILS: { slug: string; paths: string[] }[] = [
  { slug: 'espinacas-con-garbanzos', paths: ['body > paragraph[11]'] },
  { slug: 'eton-mess', paths: ['body > paragraph[14]'] },
  { slug: 'extra-crispy-chicken-wraps', paths: ['body > orderedList[5] > listItem[5] > paragraph[0]'] },
  { slug: 'fasolada', paths: ['body > paragraph[0]', 'body > troubleshooter[11] > item[2] > fix'] },
  { slug: 'fattoush', paths: ['body > paragraph[11]'] },
  { slug: 'fettuccine-ai-funghi-porcini', paths: ['body > paragraph[0]', 'body > paragraph[13]'] },
  { slug: 'fettuccine-al-burro-e-salvia', paths: ['body > paragraph[13]'] },
  { slug: 'mille-feuille-napoleon', paths: ['body > paragraph[0]'] },
  { slug: 'mixed-berry-pie', paths: ['body > orderedList[5] > listItem[0] > paragraph[0]', 'body > orderedList[9] > listItem[1] > paragraph[0]'] },
  { slug: 'multiseed-loaf', paths: ['body > orderedList[8] > listItem[0] > paragraph[0]'] },
  { slug: 'stepping-into-calm-sleeper-identity', paths: ['body > paragraph[8]'] },
  { slug: 'stepping-over-the-line-they-couldnt-cross', paths: ['body > paragraph[10]'] },
  { slug: 'stillness-is-safe-i-am-safe', paths: ['body > paragraph[5]'] },
  { slug: 'surrender-breath-exhale-longer-than-inhale', paths: ['body > paragraph[13]'] },
  { slug: 'tapping-during-the-panic', paths: ['body > paragraph[11]'] },
  { slug: 'tapping-for-abundance-through-the-family-line', paths: ['body > bulletList[4] > listItem[2] > paragraph[0]'] },
  { slug: 'tapping-for-am-i-spoiling-them', paths: ['body > bulletList[4] > listItem[1] > paragraph[0]', 'body > bulletList[4] > listItem[2] > paragraph[0]'] },
  { slug: 'tapping-for-being-the-older-generation', paths: ['body > paragraph[0]'] },
  { slug: 'tapping-for-bills-always-win', paths: ['body > paragraph[11]'] },
  { slug: 'tapping-for-body-level-wired', paths: ['body > paragraph[11]'] },
]

function flattenInline(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(flattenInline).join('')
  return ''
}

function resolvePath(body: any, pathStr: string): any {
  const parts = pathStr.split(' > ').slice(1) // drop 'body'
  let cur = body
  for (const part of parts) {
    const m = part.match(/^(\w+)\[(\d+)\](.*)$/)
    if (m) {
      const [, name, idxStr, _rest] = m
      const idx = Number(idxStr)
      if (name === 'troubleshooter') {
        // find Nth troubleshooter node in body.content
        if (Array.isArray(cur?.content)) {
          let count = -1
          for (const n of cur.content) {
            if (n?.type === 'troubleshooter') {
              count++
              if (count === idx) {
                cur = n
                break
              }
            }
            if (n?.type !== 'troubleshooter') count++ // path uses overall block index, not type-specific
          }
        }
      } else if (name === 'item') {
        cur = cur?.attrs?.items?.[idx]
      } else if (name === 'fix') {
        // fix is a field on troubleshooter item
        return cur?.fix ?? '(no fix)'
      } else if (Array.isArray(cur?.content)) {
        cur = cur.content[idx]
      }
    } else if (part === 'text') {
      // leave cur as-is, we'll flatten
    }
  }
  return cur
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch40')
  for (const { slug, paths } of FAILS) {
    const raw = readFileSync(resolve(batchDir, `${slug}.json`), 'utf8')
    const data = JSON.parse(raw)
    for (const path of paths) {
      const node = resolvePath(data.body, path)
      const text = typeof node === 'string' ? node : flattenInline(node)
      console.log(`\n=== ${slug} | ${path} ===`)
      console.log(text)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
