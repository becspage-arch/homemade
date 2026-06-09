/**
 * Wire Crochet Foundations tutorial JSONs to the Dillmont 1886 PD image set.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/wire-crochet-foundations-diagrams.ts
 *
 * What it does:
 *   - Reads the manifest at
 *     apps/web/public/tutorial-diagrams/crochet/foundations/_sources/dillmont-1886/manifest.json
 *   - Walks every JSON file in packages/db/scripts/phase-1-content/crochet/
 *   - For each tutorial whose slug appears in any figure's suggestedTopics list,
 *     inserts an image node referencing the matching figure (idempotent — skips
 *     if the image is already present).
 *   - Updates sourceNotes to credit Dillmont once.
 *   - Leaves tutorials with no manifest match untouched. No "coming soon" notes.
 *
 * Insertion rule (so the image lands in a sensible spot for each tutorial shape):
 *   - If the body has at least one orderedList, insert immediately after the
 *     first orderedList (steps-then-illustration).
 *   - Else if the body has at least one heading, insert immediately before
 *     the first heading (intro-then-illustration).
 *   - Else append to the end of body.content.
 *
 * Safe to re-run as Worker A drops more Foundations tutorials.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(__dirname, '..', '..', '..')
const TUTORIALS_DIR = join(
  REPO_ROOT,
  'packages',
  'db',
  'scripts',
  'phase-1-content',
  'crochet',
)
const MANIFEST_PATH = join(
  REPO_ROOT,
  'apps',
  'web',
  'public',
  'tutorial-diagrams',
  'crochet',
  'foundations',
  '_sources',
  'dillmont-1886',
  'manifest.json',
)
const IMAGE_URL_PREFIX = '/tutorial-diagrams/crochet/foundations/_sources/dillmont-1886'

interface ManifestFigure {
  caption: string
  suggestedTopics: string[]
}
interface Manifest {
  source: string
  publicDomainStatus: string
  retrievedFrom: string
  creditPattern: string
  figures: Record<string, ManifestFigure>
  gaps: Record<string, string>
}

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: unknown[]
}

interface Tutorial {
  slug: string
  sourceNotes?: string
  body: { type: 'doc'; content: TipTapNode[] }
  [k: string]: unknown
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')) as Manifest

const slugToFigures = new Map<
  string,
  Array<{ file: string; caption: string; figNum: string }>
>()
for (const [file, fig] of Object.entries(manifest.figures)) {
  const figNum = file.match(/fig-(\d+)/)?.[1] ?? '?'
  for (const topic of fig.suggestedTopics) {
    if (!slugToFigures.has(topic)) slugToFigures.set(topic, [])
    slugToFigures.get(topic)!.push({ file, caption: fig.caption, figNum })
  }
}

const tutorialFiles = readdirSync(TUTORIALS_DIR).filter((f) => f.endsWith('.json'))

let wired = 0
let alreadyWired = 0
let textOnly = 0
const wiredSlugs: string[] = []
const textOnlySlugs: string[] = []

for (const fileName of tutorialFiles) {
  const path = join(TUTORIALS_DIR, fileName)
  let tutorial: Tutorial
  try {
    tutorial = JSON.parse(readFileSync(path, 'utf-8')) as Tutorial
  } catch (err) {
    console.error(`skip ${fileName}: invalid JSON (${(err as Error).message})`)
    continue
  }

  const figs = slugToFigures.get(tutorial.slug) ?? []
  if (figs.length === 0) {
    textOnly++
    textOnlySlugs.push(tutorial.slug)
    continue
  }

  let changed = false
  for (const fig of figs) {
    const src = `${IMAGE_URL_PREFIX}/${fig.file}`
    const alreadyPresent = tutorial.body.content.some(
      (n) => n.type === 'image' && (n.attrs?.src as string) === src,
    )
    if (alreadyPresent) continue

    const imageNode: TipTapNode = {
      type: 'image',
      attrs: {
        src,
        alt: fig.caption,
        title: `Fig. ${fig.figNum}, Encyclopaedia of Needlework (Thérèse de Dillmont, 1886). Public domain.`,
      },
    }

    const olIdx = tutorial.body.content.findIndex((n) => n.type === 'orderedList')
    if (olIdx !== -1) {
      tutorial.body.content.splice(olIdx + 1, 0, imageNode)
    } else {
      const hIdx = tutorial.body.content.findIndex((n) => n.type === 'heading')
      if (hIdx !== -1) {
        tutorial.body.content.splice(hIdx, 0, imageNode)
      } else {
        tutorial.body.content.push(imageNode)
      }
    }

    if (
      typeof tutorial.sourceNotes === 'string' &&
      !tutorial.sourceNotes.includes('Dillmont')
    ) {
      tutorial.sourceNotes +=
        `\n• Thérèse de Dillmont, Encyclopaedia of Needlework (1886), ` +
        `Chapter 9, Fig. ${fig.figNum}. Project Gutenberg.`
    }
    changed = true
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(tutorial, null, 2) + '\n', 'utf-8')
    wired++
    wiredSlugs.push(tutorial.slug)
  } else {
    alreadyWired++
  }
}

console.log(`wired ${wired} tutorial(s):`)
for (const s of wiredSlugs) console.log(`  + ${s}`)
console.log(`already wired (skipped): ${alreadyWired}`)
console.log(`no manifest match (text-only): ${textOnly}`)
for (const s of textOnlySlugs) console.log(`  - ${s}`)
