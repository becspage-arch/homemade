// Build docs/image-verification-verdicts.json from a slug->verdict map.
// Reads the current queue manifest and matches each entry by tutorialSlug.
import { readFileSync, writeFileSync } from 'node:fs'

const queuePath = process.argv[2] || 'docs/image-verification-queue.json'
const mapPath = process.argv[3]
if (!mapPath) {
  console.error('usage: node scripts/build-verdicts.mjs <queue.json> <map.json>')
  process.exit(1)
}

const queue = JSON.parse(readFileSync(queuePath, 'utf8'))
const slugMap = JSON.parse(readFileSync(mapPath, 'utf8'))

const verdicts = []
for (const entry of queue.entries) {
  const v = slugMap[entry.tutorialSlug]
  if (!v) throw new Error(`Missing verdict for ${entry.tutorialSlug}`)
  verdicts.push({ mediaId: entry.mediaId, verdict: v[0], reason: v[1] })
}

writeFileSync('docs/image-verification-verdicts.json', JSON.stringify({ verdicts }, null, 2), 'utf8')

const verified = verdicts.filter((v) => v.verdict === 'verified').length
const rejected = verdicts.filter((v) => v.verdict === 'rejected').length
console.log(`wrote ${verdicts.length} verdicts: ${verified} verified, ${rejected} rejected`)
