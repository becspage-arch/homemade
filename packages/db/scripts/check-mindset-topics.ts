import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')

  // Topic keywords for rough categorisation
  const buckets: { name: string; keywords: string[] }[] = [
    { name: 'Money / wealth / abundance', keywords: ['money', 'wealth', 'abundance', 'price', 'pricing', 'income', 'earning', 'rich', 'budget', 'debt', 'cash', 'invoice', 'financial', 'spending', 'scarcity', 'feast', 'famine'] },
    { name: 'Business / entrepreneur / work', keywords: ['business', 'entrepreneur', 'client', 'work', 'career', 'launch', 'company', 'venture', 'sell', 'sale', 'pitch', 'visibility', 'audience', 'meeting'] },
    { name: 'Relationships / partnership', keywords: ['partner', 'relationship', 'marriage', 'dating', 'love', 'romantic'] },
    { name: 'Family / parenting / children', keywords: ['parent', 'children', 'child', 'mother', 'father', 'family', 'mum', 'dad'] },
    { name: 'Health / body / illness', keywords: ['health', 'body', 'illness', 'sick', 'recovery', 'pain', 'chronic', 'menopause', 'period'] },
    { name: 'Stress / anxiety / overwhelm', keywords: ['stress', 'anxiety', 'overwhelm', 'panic', 'worry', 'fear', 'exhausted'] },
    { name: 'Sleep / rest / energy', keywords: ['sleep', 'rest', 'tired', 'exhaustion', 'energy', 'fatigue'] },
    { name: 'Grief / loss', keywords: ['grief', 'loss', 'death', 'dying', 'mourning', 'bereaved'] },
    { name: 'Self-worth / identity', keywords: ['worth', 'deserve', 'self-doubt', 'identity', 'imposter', 'enough', 'belong'] },
    { name: 'Boundaries / saying no', keywords: ['boundary', 'boundaries', 'saying no', 'people-pleasing'] },
    { name: 'Creativity / craft / making', keywords: ['creative', 'creativity', 'craft', 'making', 'artist', 'art'] },
  ]

  // Tapping + energy statement tutorials specifically
  for (const subSlug of ['tapping', 'energy-statement', 'affirmation', 'journal-prompt']) {
    const tutorials = await prisma.tutorial.findMany({
      where: {
        category: { slug: 'mindset' },
        subCategory: { slug: subSlug },
        status: 'PUBLISHED',
      },
      select: { title: true, slug: true },
    })
    console.log(`\n=== ${subSlug.toUpperCase()} (${tutorials.length} PUBLISHED) ===`)
    const counts: Record<string, number> = {}
    const uncategorised: string[] = []
    for (const t of tutorials) {
      const lower = `${t.title} ${t.slug}`.toLowerCase()
      let matched = false
      for (const b of buckets) {
        if (b.keywords.some((k) => lower.includes(k))) {
          counts[b.name] = (counts[b.name] || 0) + 1
          matched = true
          break
        }
      }
      if (!matched) uncategorised.push(t.title)
    }
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([n, c]) => console.log(`  ${String(c).padStart(3)} | ${n}`))
    console.log(`  ${String(uncategorised.length).padStart(3)} | (uncategorised — first 10:)`)
    uncategorised.slice(0, 10).forEach((t) => console.log(`        - ${t}`))
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
