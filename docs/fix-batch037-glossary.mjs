import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'docs/bulk-batch-037-briefs'
const files = readdirSync(dir).filter(f => f.endsWith('.json'))

let fixed = 0
for (const file of files) {
  const path = join(dir, file)
  const raw = readFileSync(path, 'utf8')
  const data = JSON.parse(raw)

  if (!data.glossaryTerms || data.glossaryTerms.length === 0) continue

  let changed = false
  data.glossaryTerms = data.glossaryTerms.map(item => {
    if ('termSlug' in item && !('slug' in item)) {
      const { termSlug, ...rest } = item
      changed = true
      return { slug: termSlug, ...rest }
    }
    return item
  })

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
    console.log(`Fixed: ${file}`)
    fixed++
  }
}
console.log(`Total fixed: ${fixed}`)
