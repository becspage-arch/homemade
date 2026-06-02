/**
 * Manual rewrite pass for tutorials still BLOCKing after qc-fix.ts mechanical sweep.
 * Targets: opening-pattern-missing-hook + content-type-opening-mismatch for RECIPE type.
 * Fix: append "Serves N." / "Makes N [unit]." / "About N minutes." to first paragraph.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

interface TipTapNode {
  type: string
  text?: string
  marks?: any[]
  attrs?: any
  content?: TipTapNode[]
}

function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

// Build a hook suffix from tutorial metadata
function buildHookSuffix(servings: number | null, yieldDescription: string | null, timeMinutes: number | null): string {
  // prefer yield description if it contains a count
  if (yieldDescription) {
    const barMatch = yieldDescription.match(/(\d+)\s*(?:x\s*\d+\s*g\s*)?bars?/i)
    if (barMatch) return ` Makes ${barMatch[1]} bars.`
    const bottleMatch = yieldDescription.match(/(\d+)\s*x\s*(\d+)\s*ml\s*bottle/i)
    if (bottleMatch) return ` Makes one bottle (${bottleMatch[2]} ml).`
    const gramsMatch = yieldDescription.match(/~?(\d+)\s*g\)/i)
    if (gramsMatch) return ` Makes about ${gramsMatch[1]} g.`
    const biscuitMatch = yieldDescription.match(/(\d+)\s*biscuits?/i)
    if (biscuitMatch) return ` Makes ${biscuitMatch[1]} biscuits.`
    const cookieMatch = yieldDescription.match(/(\d+)\s*cookies?/i)
    if (cookieMatch) return ` Makes ${cookieMatch[1]} cookies.`
    // generic: use the yieldDescription as-is but trim to reasonable length
    const clean = yieldDescription.replace(/\s*\([^)]*\)\s*/g, '').trim()
    if (clean.length < 40) return ` Makes ${clean.toLowerCase()}.`
  }
  // use servings if available
  const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve']
  if (servings !== null && servings !== undefined && servings >= 1 && servings <= 12) {
    return ` Serves ${WORDS[servings]!}.`
  }
  if (servings !== null && servings !== undefined && servings > 0) {
    return ` Serves ${servings}.`
  }
  // fall back to time
  if (timeMinutes && timeMinutes <= 600) {
    if (timeMinutes < 60) return ` About ${timeMinutes} minutes in the kitchen.`
    const hours = Math.round(timeMinutes / 60)
    return ` About ${hours === 1 ? 'an hour' : `${hours} hours`} in total.`
  }
  return ''
}

// Check if first paragraph already has yield/time signal
function hasYieldOrTimeSignal(text: string): boolean {
  return (
    /\b(?:about|roughly)\s+\d{1,3}\s+(?:minutes?|hours?|days?)\b/i.test(text) ||
    /\bmakes?\s+(?:about\s+)?(?:\d{1,4}|one|two|three|four|five|six|eight|ten|twelve|a\s+dozen)\b/i.test(text) ||
    /\bserves?\s+(?:about\s+)?(?:\d{1,3}|one|two|three|four|five|six|eight|ten|twelve)\b/i.test(text) ||
    /\byields?\s+(?:about\s+)?\d{1,4}\b/i.test(text) ||
    /\b\d{1,3}\s*(?:minutes?|hours?)['']?\s+work\b/i.test(text) ||
    /\bactive\s+work\b/i.test(text) ||
    /\bcook(?:ing)?\s+time\b/i.test(text) ||
    /\bworking\s+(?:time|in)\b/i.test(text) ||
    /\bcure\s+time\b/i.test(text)
  )
}

// Check if first paragraph already has hook signal
function hasHookSignal(text: string): boolean {
  const HOOK_SIGNAL_PATTERNS: RegExp[] = [
    /\bthe\s+secret\s+(?:to|of|is)\b/i,
    /\bwhat\s+makes\s+(?:it|this|that)\s+work(?:s)?\b/i,
    /\b(?:about|roughly)\s+\d{1,3}\s+(?:minutes?|hours?|days?)\b/i,
    /\bmakes?\s+(?:about\s+)?\d{1,4}\s+(?:bars?|tins?|jars?|bottles?|cups?|loaves?|loaf|servings?|pieces?|portions?|biscuits?|cookies?|scones?|rolls?|slices?|grams?|g|kg|ml|litres?|l|doses?|sessions?|wash|baths?|compress(?:es)?|gargles?|brews?|batches?)\b/i,
    /\bmakes?\s+(?:about\s+)?(?:one|two|three|four|five|six|eight|ten|twelve|a\s+dozen|two\s+dozen|thirty|several|a\s+few|dozens?\s+of)\s+(?:bars?|tins?|jars?|bottles?|cups?|loaves?|loaf|servings?|pieces?|portions?|biscuits?|cookies?|scones?|brews?|sessions?|baths?|compress(?:es)?|gargles?)\b/i,
    /\bserves?\s+(?:about\s+)?(?:\d{1,3}|one|two|three|four|five|six|eight|ten|twelve)\b/i,
    /\byields?\s+(?:about\s+)?\d{1,4}\b/i,
    /\benough\s+for\s+(?:about\s+)?(?:\d{1,3}|one|two|three|four|five|six|several|a\s+few)\b/i,
    /\b(?:soothes?|eases?|calms?|settles?|relieves?|loosens?|softens?|coats?|cools?|warms?)\s+(?:a|an|the)\b/i,
    /\bfor\s+(?:a|an)\s+(?:sore|dry|tickly|raw|inflamed|irritated|upset|tight|cracked|tired|tense|cold|hot|flushed|achy|unsettled|moment|cup|cramping|period)\b/i,
    /\bfor\s+(?:a|an|the)\s+(?:tension|tired|stressful|first|early|cold|warm|busy|racing|restless|wound[- ]up|cramping|gas[sy]?|heavy|period|aching|sore|stiff)\b/i,
    /\b(?:long\s+made|long\s+used|long\s+taken|long\s+kept|made|kept|brewed|baked|cooked|served|kitchen\s+tradition)\s+for\s+(?:a|an|the)\b/i,
    /\b(?:tradition|kitchen\s+tradition)\s+(?:for|long\s+made|long\s+kept)\b/i,
    /\b(?:long\s+taken|long\s+used|long\s+made)\s+(?:as|by|in|by\s+the|for|to)\b/i,
    /\b(?:keeps?|good)\s+(?:for|in)\s+(?:a|an|the|\d+|several|two|three|four|five|six|ten|twelve|a\s+few|months?|years?)\b/i,
    /\bworking\s+(?:time|in)\b/i,
    /\bcure\s+time\b/i,
    /\b\d{1,3}\s*(?:minutes?|hours?|days?|weeks?|months?)['']?\s+work\b/i,
    /\bactive\s+work\b/i,
    /\b(?:a|one)\s+(?:cup|jar|bottle|tin|bath|bowl|session|pot|batch)\b/i,
    /\b(?:daily|every\s+day|once\s+a\s+day|twice\s+a\s+day)\b/i,
    /\bnine\s+(?:minutes?|hours?)\b/i,
    /\b(?:overnight|covered)\b/i,
  ]
  return HOOK_SIGNAL_PATTERNS.some((re) => re.test(text))
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const slugs = [
    'acqua-pazza', 'activated-charcoal-cold-process-soap', 'activated-charcoal-melt-pour-soap',
    'adana-kebabi', 'adas-polo', 'affogato', 'afghan-cookies', 'afghans-biscuits',
    'after-sun-aloe-lotion', 'aftershave-balm', 'aile-de-raie-au-beurre-noir',
    'air-fryer-asparagus', 'air-fryer-baby-potatoes', 'air-fryer-bacon',
    'air-fryer-bbq-wings', 'air-fryer-beef-burgers', 'air-fryer-buffalo-wings',
    'air-fryer-cauliflower-wings-buffalo', 'air-fryer-chicken-breasts',
    'air-fryer-chicken-drumsticks', 'air-fryer-chicken-nuggets',
    'air-fryer-chicken-shawarma', 'air-fryer-chicken-tenders',
  ]

  const tutorials = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, title: true, type: true, servings: true, yieldDescription: true, timeMinutes: true, prepMinutes: true, body: true, revisedFrom: true },
  })

  let fixed = 0
  let skipped = 0

  for (const t of tutorials) {
    const body = t.body as TipTapNode | null
    if (!body || !Array.isArray(body.content)) { skipped++; console.log(`SKIP ${t.slug}: no body`); continue }

    const content = [...body.content]
    const firstParaIdx = content.findIndex((n) => n.type === 'paragraph')
    if (firstParaIdx < 0) { skipped++; console.log(`SKIP ${t.slug}: no first para`); continue }

    const firstPara = content[firstParaIdx]!
    let firstParaText = extractText(firstPara)

    // Special case: afghan-cookies has garbled mechanical-fix output
    // Rewrite it entirely.
    if (t.slug === 'afghan-cookies') {
      const newText = 'Afghan cookies: crisp, lightly chocolatey biscuits with crushed cornflakes mixed into the dough, finished with a chocolate icing and walnut half. Straightforward to make, worth weighing rather than scooping. About 35 minutes in the kitchen.'
      const newPara: TipTapNode = { type: 'paragraph', content: [{ type: 'text', text: newText, marks: [] }] }
      content[firstParaIdx] = newPara
      const newBody = { ...body, content }
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: newBody as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.id },
      })
      console.log(`FIXED ${t.slug}: full rewrite (garbled mechanical output)`)
      fixed++
      continue
    }

    // For all others: check if first paragraph already has what we need
    const alreadyHasYield = hasYieldOrTimeSignal(firstParaText)
    const alreadyHasHook = hasHookSignal(firstParaText)
    if (alreadyHasYield && alreadyHasHook) {
      console.log(`SKIP ${t.slug}: already has both signals`)
      skipped++
      continue
    }

    // Build the suffix to append
    const suffix = buildHookSuffix(t.servings, t.yieldDescription, t.timeMinutes)
    if (!suffix) {
      console.log(`SKIP ${t.slug}: no yield/servings/time data to build suffix`)
      skipped++
      continue
    }

    // Append the suffix to the first paragraph's last text node
    // The paragraph might be a single text node (mechanical fix output) or the original excerpt node
    const paraContent = firstPara.content ? [...firstPara.content] : []
    let appended = false
    for (let i = paraContent.length - 1; i >= 0; i--) {
      const node = paraContent[i]!
      if (node.type === 'text' && typeof node.text === 'string') {
        // Append to this text node
        let text = node.text.trimEnd()
        if (!text.match(/[.!?]$/)) text += '.'
        paraContent[i] = { ...node, text: text + suffix }
        appended = true
        break
      }
    }
    if (!appended) {
      // No text node found — add a new one
      paraContent.push({ type: 'text', text: suffix.trim(), marks: [] })
    }

    const newPara: TipTapNode = { ...firstPara, content: paraContent }
    content[firstParaIdx] = newPara
    const newBody = { ...body, content }

    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body: newBody as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.id },
    })
    console.log(`FIXED ${t.slug}: appended "${suffix.trim()}"`)
    fixed++
  }

  console.log(`\nDone: fixed=${fixed} skipped=${skipped}`)
  await prisma.$disconnect()
}
main()
