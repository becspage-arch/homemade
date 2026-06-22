/**
 * Final targeted fix for 4 remaining glossary-coverage failures.
 * Run: npx tsx fix-final.ts
 */

import fs from 'fs'
import path from 'path'

const DIR = path.join(__dirname, 'docs', 'cooking-sprint-worker-0')

type Mark = { type: string; attrs?: Record<string, unknown> }
type DocNode = { type: string; text?: string; marks?: Mark[]; attrs?: Record<string, unknown>; content?: DocNode[] }

function tooltip(termSlug: string): Mark { return { type: 'glossaryTooltip', attrs: { termSlug } } }

function wrapFirst(nodes: DocNode[], search: string, termSlug: string): DocNode[] {
  const found = { done: false }
  function walk(ns: DocNode[]): DocNode[] {
    if (found.done) return ns
    const out: DocNode[] = []
    for (const n of ns) {
      if (found.done) { out.push(n); continue }
      if (n.type === 'text' && n.text && !n.marks?.some(m => m.type === 'glossaryTooltip')) {
        const idx = n.text.toLowerCase().indexOf(search.toLowerCase())
        if (idx !== -1) {
          found.done = true
          const before = n.text.slice(0, idx)
          const matched = n.text.slice(idx, idx + search.length)
          const after = n.text.slice(idx + search.length)
          if (before) out.push({ ...n, text: before })
          out.push({ ...n, text: matched, marks: [...(n.marks ?? []), tooltip(termSlug)] })
          if (after) out.push({ ...n, text: after })
          continue
        }
      }
      if (n.content) { out.push({ ...n, content: walk(n.content) }); continue }
      out.push(n)
    }
    return out
  }
  return walk(nodes)
}

function load(name: string) {
  const filepath = path.join(DIR, name)
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  return { data, filepath }
}
function save(filepath: string, data: unknown) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Saved: ${path.basename(filepath)}`)
}

// 21: wrap "Pappardelle" for pappardelle slug, "funghi misti" for funghi-misti slug
{
  const { data, filepath } = load('21-pappardelle-ai-funghi-misti.json')
  const body = data.body as DocNode
  let content = body.content!
  content = wrapFirst(content, 'Pappardelle', 'pappardelle')
  content = wrapFirst(content, 'funghi misti', 'funghi-misti')
  ;(data as Record<string, unknown>).body = { ...body, content }
  save(filepath, data)
}

// 32: wrap "Gorgonzola dolce" for gorgonzola-dolce slug
{
  const { data, filepath } = load('32-polenta-con-gorgonzola.json')
  const body = data.body as DocNode
  const content = wrapFirst(body.content!, 'Gorgonzola dolce', 'gorgonzola-dolce')
  ;(data as Record<string, unknown>).body = { ...body, content }
  save(filepath, data)
}

// 34: wrap "nutritional yeast" for nutritional-yeast; wrap "vegan" for mantecatura-vegan
{
  const { data, filepath } = load('34-vegan-mushroom-risotto.json')
  const body = data.body as DocNode
  let content = body.content!
  content = wrapFirst(content, 'nutritional yeast', 'nutritional-yeast')
  content = wrapFirst(content, 'vegan', 'mantecatura-vegan')
  ;(data as Record<string, unknown>).body = { ...body, content }
  save(filepath, data)
}

// 37: wrap "butterflied" for butterflied-sardines slug
{
  const { data, filepath } = load('37-sarde-a-beccafico.json')
  const body = data.body as DocNode
  const content = wrapFirst(body.content!, 'butterflied', 'butterflied-sardines')
  ;(data as Record<string, unknown>).body = { ...body, content }
  save(filepath, data)
}

console.log('Done.')
