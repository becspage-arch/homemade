/**
 * Targeted manual rewrites for grade-level-strict blocks that the mechanical
 * fixer couldn't handle. Each entry specifies:
 *   slug      - tutorial slug
 *   path      - positional TipTap path (matching qc-audit.ts path format)
 *   rewrite   - function that takes the paragraph node and returns a rewritten node
 *
 * Preserves glossaryTooltip marks by only updating plain-text sibling nodes.
 * Run with: pnpm --filter @homemade/db exec tsx scripts/_qc-manual-rewrites-batch.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

type TipTapNode = {
  type: string
  content?: TipTapNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  attrs?: Record<string, unknown>
}

function loadEnvFile() {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); return }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

function repoPath(rel: string): string {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return resolve(dir, rel)
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return resolve(process.cwd(), rel)
}

// Navigate using positional indices (matching qc-audit.ts path generation).
function navigateToParent(body: TipTapNode, path: string): { parent: TipTapNode; idx: number } | null {
  const parts = path.replace(/^body\s*>\s*/, '').split(/\s*>\s*/)
  let node: TipTapNode = body
  for (let i = 0; i < parts.length - 1; i++) {
    const m = /^\w+\[(\d+)\]$/.exec(parts[i]!)
    if (!m) return null
    const idx = parseInt(m[1]!)
    if (!node.content || idx >= node.content.length) return null
    node = node.content[idx]!
  }
  const lastPart = parts[parts.length - 1]!
  const lastM = /^\w+\[(\d+)\]$/.exec(lastPart)
  if (!lastM) return null
  return { parent: node, idx: parseInt(lastM[1]!) }
}

// Build a simple paragraph with a single plain text node.
function plainParagraph(text: string): TipTapNode {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

// Build a paragraph with: prefix (plain), marked term (glossaryTooltip), suffix (plain).
function markedParagraph(
  prefix: string,
  markedText: string,
  termId: string,
  suffix: string,
): TipTapNode {
  const nodes: TipTapNode[] = []
  if (prefix) nodes.push({ type: 'text', text: prefix })
  nodes.push({
    type: 'text',
    text: markedText,
    marks: [{ type: 'glossaryTooltip', attrs: { termId } }],
  })
  if (suffix) nodes.push({ type: 'text', text: suffix })
  return { type: 'paragraph', content: nodes }
}

interface Rewrite {
  slug: string
  path: string
  newNode: TipTapNode
}

const REWRITES: Rewrite[] = [
  // ── citronella-bug-repellent-balm paragraph[0] ──────────────────────────────
  // termId for "citronella essential oil": cmps3tsux00001wv4c5bghl94
  {
    slug: 'citronella-bug-repellent-balm',
    path: 'body > paragraph[0]',
    newNode: markedParagraph(
      'This balm uses ',
      'citronella essential oil',
      'cmps3tsux00001wv4c5bghl94',
      ' and eucalyptus. Both oils repel mosquitoes. The beeswax and coconut-oil base makes a solid balm that melts on skin and stays put longer than a spray. Apply before going outdoors and reapply every two to three hours.',
    ),
  },

  // ── natural-deodorant-spray paragraph[0] ────────────────────────────────────
  // termId for "witch hazel distillate": cmps3tvcy00006sv4jaqpb476
  {
    slug: 'natural-deodorant-spray',
    path: 'body > paragraph[0]',
    newNode: markedParagraph(
      'This spray uses ',
      'witch hazel distillate',
      'cmps3tvcy00006sv4jaqpb476',
      ' as the base. Its alcohol helps preserve it and the tannins reduce surface bacteria. Arrowroot soaks up sweat. Tea tree and lavender fight the bacteria that cause underarm smell. Shake well before each use as the arrowroot settles.',
    ),
  },

  // ── re-webbing-a-sagging-sofa-base paragraph[0] ─────────────────────────────
  // termId for "interlaced webbing": cmpf48o7l0000dgv4m0smhi7n
  {
    slug: 're-webbing-a-sagging-sofa-base',
    path: 'body > paragraph[0]',
    newNode: markedParagraph(
      'A sagging sofa seat is often caused by broken webbing, not a worn spring or foam. Replacing the ',
      'interlaced webbing',
      'cmpf48o7l0000dgv4m0smhi7n',
      ' on the underside of the seat frame takes about half a day and brings back the original support without reupholstering the seat.',
    ),
  },

  // ── avocado-conditioning-hair-mask paragraph[0] ─────────────────────────────
  // termId for "Avocado oil (cosmetic)": cmps3th1q0000qcv41izqcxy9
  {
    slug: 'avocado-conditioning-hair-mask',
    path: 'body > paragraph[0]',
    newNode: markedParagraph(
      'This mask is for dry, brittle, or colour-treated hair. ',
      'Avocado oil (cosmetic)',
      'cmps3th1q0000qcv41izqcxy9',
      ' is one of the few oils that soaks into the hair shaft rather than just coating it. This makes it good for deep dryness. Honey holds moisture at the surface and rosemary oil helps scalp blood flow.',
    ),
  },

  // ── laying-luxury-vinyl-tile-click-flooring paragraph[0] ───────────────────
  {
    slug: 'laying-luxury-vinyl-tile-click-flooring',
    path: 'body > paragraph[0]',
    newNode: plainParagraph(
      'Click LVT is a floating floor that locks together without glue and can go over most flat, dry floors. It is more forgiving than laminate: LVT flexes slightly and handles small dips in the sub-floor better than a rigid plank. It can be lifted and relaid without harming the sub-floor, which suits rented homes.',
    ),
  },

  // ── reclaiming-homemaker-as-feminist-identity paragraph[0] ─────────────────
  {
    slug: 'reclaiming-homemaker-as-feminist-identity',
    path: 'body > paragraph[0]',
    newNode: plainParagraph(
      'A reading on what happens when we treat running a home as a lesser choice. The idea that homemaking is not real work is so common that many women who love their domestic lives still feel the need to excuse them. This reading asks where that need comes from and whether it belongs.',
    ),
  },

  // ── tapping-for-always-behind paragraph[11] ─────────────────────────────────
  // Attribution/source note — not a verbatim tapping script
  {
    slug: 'tapping-for-always-behind',
    path: 'body > paragraph[11]',
    newNode: plainParagraph('Gary Craig created EFT in the 1990s. Script by homemade.education.'),
  },

  // ── five-senses-scan-three-minutes paragraph[10] ────────────────────────────
  // Attribution/source note
  {
    slug: 'five-senses-scan-three-minutes',
    path: 'body > paragraph[10]',
    newNode: plainParagraph('This is a mindfulness practice. Script by homemade.education.'),
  },

  // ── my-anxiety-is-information-not-identity paragraph[1] ─────────────────────
  // Editorial explanation paragraph (not the affirmation itself)
  {
    slug: 'my-anxiety-is-information-not-identity',
    path: 'body > paragraph[1]',
    newNode: plainParagraph('This affirmation helps you notice the gap between what you feel and who you are.'),
  },

  // ── long-exhale-breath-for-perimenopause-anxiety paragraph[9] ───────────────
  // Source attribution paragraph
  {
    slug: 'long-exhale-breath-for-perimenopause-anxiety',
    path: 'body > paragraph[9]',
    newNode: plainParagraph(
      'Slow exhale breathing uses the body\'s calming reflex. A long, slow exhale tells the nervous system to slow down. This is public-domain science used in many breathwork traditions. The perimenopause framing is by homemade.education.',
    ),
  },
]

async function main() {
  loadEnvFile()
  const { prisma } = await import('../src/index.js')
  const snapshotDir = repoPath('docs/qc-fixes-2026-05-30')

  let fixed = 0
  let failed = 0

  for (const { slug, path, newNode } of REWRITES) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
    if (!t) { console.log(`SKIP ${slug}: not found`); failed++; continue }

    const body = JSON.parse(JSON.stringify(t.body)) as TipTapNode
    const nav = navigateToParent(body, path)
    if (!nav) { console.log(`SKIP ${slug}: path not found: ${path}`); failed++; continue }

    const { parent, idx } = nav
    if (!parent.content || idx >= parent.content.length) {
      console.log(`SKIP ${slug}: index ${idx} out of bounds`)
      failed++
      continue
    }

    // Snapshot before
    const snapPath = resolve(snapshotDir, `${slug}.before.json`)
    if (!existsSync(snapPath)) {
      writeFileSync(snapPath, JSON.stringify({ slug, capturedAt: new Date().toISOString(), preFix: t.body }, null, 2), 'utf8')
    }

    parent.content[idx] = newNode

    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body: body as object, voiceRetrofittedAt: new Date() },
    })

    console.log(`FIXED ${slug} @ ${path}`)
    fixed++
  }

  await prisma.$disconnect()
  console.log(`\nDone: fixed=${fixed} failed=${failed}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
