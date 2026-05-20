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

// Walk TipTap JSON looking for "Take care" / "Safety" sections
function extractTakeCare(body: any): string[] {
  if (!body || typeof body !== 'object') return []
  const results: string[] = []
  const walk = (node: any, parentHeading: string | null = null) => {
    if (!node) return
    if (Array.isArray(node)) {
      let currentHeading: string | null = parentHeading
      const captured: string[] = []
      for (const child of node) {
        if (child?.type === 'heading' || child?.type === 'h2' || child?.type === 'h3') {
          const text = (child.content || [])
            .map((c: any) => c.text || '')
            .join('')
            .trim()
          if (/^(take care|safety|important|warning|before you (start|begin)|caution|note)$/i.test(text)) {
            currentHeading = text
            captured.length = 0
            captured.push(`# ${text}`)
          } else if (currentHeading) {
            // New heading ends the take-care capture
            if (captured.length > 1) {
              results.push(captured.join('\n').trim())
            }
            currentHeading = null
            captured.length = 0
          }
        } else if (currentHeading) {
          // Capture any node under the take-care heading
          const text = JSON.stringify(child)
          if (text.length < 5000) captured.push(text.slice(0, 1000))
        } else {
          walk(child)
        }
      }
      if (captured.length > 1 && currentHeading) {
        results.push(captured.join('\n').trim())
      }
    } else if (node && typeof node === 'object') {
      if (node.content) walk(node.content)
    }
  }
  walk(body.content || body)
  // Also look for InfoPanel blocks with tone warning
  const infoPanels = findInfoPanels(body)
  results.push(...infoPanels)
  return results
}

function findInfoPanels(body: any): string[] {
  const found: string[] = []
  const walk = (node: any) => {
    if (!node) return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (typeof node === 'object') {
      const isWarningPanel =
        node.type === 'infoPanel' &&
        (node.attrs?.tone === 'warning' || node.attrs?.tone === 'caution' || node.attrs?.title?.match?.(/take care|safety|important/i))
      if (isWarningPanel) {
        const text = JSON.stringify(node).slice(0, 2000)
        found.push(`[InfoPanel tone=${node.attrs?.tone} title=${node.attrs?.title}]\n${text}`)
      }
      if (node.content) walk(node.content)
    }
  }
  walk(body.content || body)
  return found
}

async function main() {
  const { prisma } = await import('../src/index.js')

  // Sample 3 published tutorials per category
  const cats = ['cooking', 'baking', 'mindset', 'natural-home', 'sustainability', 'home-repair', 'animals-smallholding', 'fibre-arts', 'wood-natural-craft', 'paper-word', 'pottery-ceramics', 'herbal-medicine']
  for (const slug of cats) {
    const samples = await prisma.tutorial.findMany({
      where: { category: { slug }, status: 'PUBLISHED' },
      select: { slug: true, title: true, body: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    })
    let any = false
    for (const t of samples) {
      const tc = extractTakeCare(t.body as any)
      if (tc.length > 0) {
        if (!any) console.log(`\n=== ${slug.toUpperCase()} ===`)
        any = true
        console.log(`\n--- ${t.title} (${t.slug}) ---`)
        for (const block of tc) {
          const preview = block.slice(0, 800).replace(/\\n/g, '\n')
          console.log(preview)
          console.log('---')
        }
      }
    }
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
