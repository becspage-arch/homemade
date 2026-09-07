/**
 * xs-tiers-proof — generate proof candidates for the two new size tiers.
 *
 * The heirloom `showpiece` tier (400–600 cells, 200–300 flosses, Flux 1.1 Pro)
 * and the `quick` one-evening tier (40–60 cells, 6–14 flosses, Flux schnell)
 * are both new, and neither is switched on for the cron until somebody has
 * looked at real output from them. This script is how that looking happens: it
 * plans briefs for ONE lane straight from the subject pool's own tags, runs
 * them through the SAME pipeline the autopilot runs — `generateCrossStitchCandidate`,
 * the pale guard, the quick-win clarity guard, the duplicate guard — and parks
 * the survivors as UNLISTED candidates exactly as a cron firing would.
 *
 * Nothing here is a shortcut around the pipeline. The one thing it does that the
 * dispatcher does not is choose the lane, which is the whole point.
 *
 * It then pulls each parked candidate's persisted thumbnail back down and lays
 * the set out as a contact sheet, because the thumbnail IS the artifact a
 * customer sees and judging anything else is judging the wrong thing.
 *
 * Run from apps/web:
 *
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx --conditions=react-server \
 *     scripts/xs-tiers-proof.ts --lane showpiece --count 3 --out ../../scratchpad/showpiece
 *   HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx --conditions=react-server \
 *     scripts/xs-tiers-proof.ts --lane quick --count 6 --out ../../scratchpad/quick
 *
 * `--conditions=react-server` is load-bearing: the bulk modules carry Next's
 * `server-only` marker, which throws outside a server component unless that
 * export condition resolves it to the empty module. It is the same code the
 * ECS job runs either way.
 *
 * `--plan-only` prints the briefs and spends nothing, which is the right first
 * run: a showpiece generation is a Flux 1.1 Pro call.
 *
 * Parked candidates are judged and published by the ordinary path —
 * `scripts/xs-candidates.ts keep <slug…>` — so nothing here writes a PUBLIC row.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

// Dependency-free env loader — apps/web does not depend on dotenv, and importing
// it breaks the production type-check.
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    /* env from the shell */
  }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? '.env.credentials')

import { prisma } from '@homemade/db'
import {
  CROSS_STITCH_THEMES,
  LANES_ALL,
  SIZE_LANE_BY_NAME,
  type CrossStitchTheme,
  type LaneName,
} from '@/lib/studio/generation/bulk/subject-pool'
import { lanesForSubject } from '@/lib/studio/generation/bulk/brief-filter'
import { isTextRiskSubject } from '@/lib/studio/generation/bulk/subject-pool'
import { subjectKey } from '@/lib/studio/generation/bulk/subject-key'
import { publicSubjectKeys } from '@/lib/studio/generation/bulk/dedupe-guard'
import { crossStitchCandidateAttempt, MAX_XS_CANDIDATE_ATTEMPTS, tweakFor } from '@/lib/studio/generation/bulk/run'
import type { CrossStitchBrief } from '@/lib/studio/generation/bulk/planner'
import type { CandidateTweak } from '@/lib/studio/generation/bulk/cross-stitch'
import { PRO_UNIT_COST, SCHNELL_UNIT_COST } from '@/lib/studio/generation/bulk/spend-guard'

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null
}
const has = (flag: string): boolean => process.argv.includes(flag)

/** Wide subjects want a wide canvas; tall ones a tall one. Same test the
 *  planner's own sampler uses, so a proof brief is shaped like a real one. */
const WIDE = /field|valley|landscape|harbour|town|glen|vineyard|row|band|garden|marsh|grove|terrace|village/i
const TALL = /spire|stem|tall|lighthouse|staircase|foxglove|hollyhock/i

interface ProofBrief extends CrossStitchBrief {
  themeTitle: string
}

/** Every pool subject tagged for this lane, with the theme it belongs to. */
function subjectsForLane(lane: LaneName): Array<{ theme: CrossStitchTheme; subject: string }> {
  const out: Array<{ theme: CrossStitchTheme; subject: string }> = []
  for (const theme of CROSS_STITCH_THEMES) {
    const tags = {
      examples: theme.examples,
      lanes: theme.lanes ?? LANES_ALL,
      ...(theme.laneOverrides ? { overrides: theme.laneOverrides } : {}),
    }
    for (const subject of theme.examples) {
      // A lettering-risk subject is legal in the two big lanes, but it is not
      // what a proof should be judged on: the fault it risks is Flux writing
      // gibberish on a signboard, which says nothing about whether the tier
      // works. The pipeline still allows them; this script does not pick them.
      if (isTextRiskSubject(subject)) continue
      if (lanesForSubject(subject, tags)?.includes(lane)) out.push({ theme, subject })
    }
  }
  return out
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44)
}

function buildBrief(lane: LaneName, theme: CrossStitchTheme, subject: string, stamp: string): ProofBrief {
  const spec = SIZE_LANE_BY_NAME[lane]!
  const [loC, hiC] = spec.colours.split('–').map((s) => parseInt(s, 10))
  const [loCells, hiCells] = spec.cells.split('–').map((s) => parseInt(s, 10))
  const mid = Math.round((loCells! + hiCells!) / 2)
  const wide = WIDE.test(subject)
  const tall = TALL.test(subject)
  const w = wide ? hiCells! : tall ? Math.round(mid * 0.78) : mid
  const h = wide ? Math.round(hiCells! * 0.68) : tall ? Math.round(mid * 1.25) : mid
  // The heirloom tier asks the converter for the top of its band: the whole
  // point of it is the floss count, and the converter only ever returns fewer
  // than it was asked for.
  const colours = lane === 'showpiece' ? hiC! : Math.round((loC! + hiC!) / 2)
  // The heirloom tier has one look — a richly detailed full-coverage painted
  // scene — so it takes the showpiece style whatever the theme's own list says.
  // (Flux 1.1 Pro appends its own showpiece style on top either way; this is
  // the base prompt and the source saturation.) Everything else takes the
  // theme's first style, which is the one the pool leads with.
  const style = lane === 'showpiece' ? 'showpiece' : theme.styles[0]!
  return {
    slug: `xs-${lane}-${slugify(subject)}-${stamp}`,
    subject,
    subjectKey: subjectKey(subject),
    style,
    w,
    h,
    colours,
    lane,
    source: 'sampler',
    plannerMode: 'constrained',
    dressed: false,
    shelf: theme.shelf,
    shelfName: theme.shelfName,
    themeId: theme.id,
    themeTitle: theme.title,
  }
}

const CELL = 620
const BAND = 46
const COLS = 3

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function labelledTile(png: Buffer, label: string): Promise<Buffer> {
  const img = await sharp(png).resize(CELL, CELL, { fit: 'inside', background: '#ffffff' }).toBuffer()
  const meta = await sharp(img).metadata()
  const band = Buffer.from(
    `<svg width="${CELL}" height="${BAND}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="30" font-family="DejaVu Sans, sans-serif" font-size="16" fill="#fff">${esc(label)}</text></svg>`,
  )
  return sharp({ create: { width: CELL, height: CELL + BAND, channels: 3, background: '#ffffff' } })
    .composite([
      { input: img, left: Math.floor((CELL - (meta.width ?? CELL)) / 2), top: Math.floor((CELL - (meta.height ?? CELL)) / 2) },
      { input: band, left: 0, top: CELL },
    ])
    .png()
    .toBuffer()
}

async function contactSheet(tiles: Buffer[], title: string): Promise<Buffer> {
  const rows = Math.max(1, Math.ceil(tiles.length / COLS))
  const width = COLS * (CELL + 10) + 10
  const height = 52 + rows * (CELL + BAND + 10)
  const header = Buffer.from(
    `<svg width="${width}" height="52"><text x="10" y="34" font-family="DejaVu Sans, sans-serif" font-size="22" fill="#111">${esc(title)}</text></svg>`,
  )
  return sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite([
      { input: header, left: 0, top: 0 },
      ...tiles.map((t, i) => ({
        input: t,
        left: 10 + (i % COLS) * (CELL + 10),
        top: 52 + Math.floor(i / COLS) * (CELL + BAND + 10),
      })),
    ])
    .png()
    .toBuffer()
}

/** Pull a parked candidate's persisted thumbnail back down — the artifact a
 *  customer would see, not a re-render of it. */
async function fetchThumbnail(slug: string): Promise<Buffer | null> {
  const base = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
  if (!base) throw new Error('R2_PUBLIC_BASE_URL not set')
  const row = await prisma.pattern.findUnique({
    where: { slug },
    select: { thumbnail: { select: { r2Key: true } } },
  })
  const key = row?.thumbnail?.r2Key
  if (!key) return null
  const res = await fetch(`${base}/${key}`)
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

async function main(): Promise<void> {
  const lane = (arg('--lane') ?? '') as LaneName
  if (lane !== 'showpiece' && lane !== 'quick') {
    throw new Error('usage: xs-tiers-proof.ts --lane showpiece|quick [--count N] [--out DIR] [--plan-only] [--subject "..."]')
  }
  const count = Number(arg('--count') ?? (lane === 'showpiece' ? 3 : 6))
  const outDir = arg('--out') ?? `../../scratchpad/xs-${lane}`
  const only = arg('--subject')
  const stamp = Date.now().toString(36).slice(-5)

  const avoid = new Set(await publicSubjectKeys(900))
  const pool = subjectsForLane(lane).filter(({ subject }) => (only ? subject === only : !avoid.has(subjectKey(subject))))
  if (!pool.length) throw new Error(`no pool subject is tagged for the ${lane} lane and still unused`)

  // Spread the picks across shelves, so the proof set is a set rather than
  // three versions of one shelf.
  const byShelf = new Map<string, Array<{ theme: CrossStitchTheme; subject: string }>>()
  for (const p of pool) byShelf.set(p.theme.shelf, [...(byShelf.get(p.theme.shelf) ?? []), p])
  const picks: Array<{ theme: CrossStitchTheme; subject: string }> = []
  const shelves = [...byShelf.keys()]
  for (let round = 0; picks.length < count && round < 12; round++) {
    for (const shelf of shelves) {
      const list = byShelf.get(shelf)!
      const p = list[round]
      if (p) picks.push(p)
      if (picks.length >= count) break
    }
  }

  const briefs = picks.map((p) => buildBrief(lane, p.theme, p.subject, stamp))
  console.log(`\n${lane} proof — ${briefs.length} idea${briefs.length === 1 ? '' : 's'}\n`)
  for (const b of briefs) {
    console.log(`  ${b.slug}`)
    console.log(`    ${b.subject}`)
    console.log(`    ${b.shelf} · ${b.style} · ${b.w}×${b.h} cells · ${b.colours} colours asked`)
  }
  if (has('--plan-only')) {
    console.log('\n--plan-only: nothing generated, nothing spent.')
    return
  }

  mkdirSync(outDir, { recursive: true })
  const parked: string[] = []
  let schnell = 0
  let pro = 0
  const started = Date.now()

  for (const brief of briefs) {
    let tweak: CandidateTweak = {}
    for (let attempt = 1; attempt <= MAX_XS_CANDIDATE_ATTEMPTS; attempt++) {
      const t0 = Date.now()
      const result = await crossStitchCandidateAttempt(brief, tweak, { attempt })
      const secs = ((Date.now() - t0) / 1000).toFixed(1)
      if (result.pro) pro++
      else schnell++
      if (result.parked) {
        parked.push(brief.slug)
        console.log(`\n  PARKED  ${brief.slug}  (attempt ${attempt}, ${secs}s)`)
        break
      }
      console.log(`\n  ${result.verdict.toUpperCase()}  ${brief.slug}  (attempt ${attempt}, ${secs}s)`)
      for (const r of result.reasons) console.log(`      ${r}`)
      if (result.verdict === 'repair' && attempt < MAX_XS_CANDIDATE_ATTEMPTS) {
        tweak = tweakFor(result.repairAction)
        continue
      }
      break
    }
  }

  const spend = schnell * SCHNELL_UNIT_COST + pro * PRO_UNIT_COST
  console.log(
    `\n${parked.length}/${briefs.length} parked · ${schnell} schnell + ${pro} Pro generation${pro === 1 ? '' : 's'} · about $${spend.toFixed(3)} · ${((Date.now() - started) / 1000).toFixed(0)}s`,
  )

  // ── the contact sheet ────────────────────────────────────────────────────
  const tiles: Buffer[] = []
  for (const slug of parked) {
    const png = await fetchThumbnail(slug)
    if (!png) {
      console.log(`  ${slug}: no thumbnail persisted`)
      continue
    }
    writeFileSync(`${outDir}/${slug}.png`, png)
    const row = await prisma.pattern.findUnique({
      where: { slug },
      select: { colourCount: true, widthCells: true, heightCells: true, totalStitches: true, stitchability: true },
    })
    tiles.push(
      await labelledTile(
        png,
        `${slug} | ${row?.widthCells}x${row?.heightCells} | ${row?.colourCount} col | ${(row?.totalStitches ?? 0).toLocaleString()} st | ${row?.stitchability ?? '—'}`,
      ),
    )
  }
  if (tiles.length) {
    const file = `${outDir}/sheet-${lane}.png`
    writeFileSync(file, await contactSheet(tiles, `${lane} proof · ${tiles.length} parked`))
    console.log(`\ncontact sheet ${file}`)
    console.log('Full-size thumbnails are beside it, one per slug.')
  }
  console.log(`\nkeep them with:  pnpm exec tsx scripts/xs-candidates.ts keep ${parked.join(' ')}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
    await prisma.$disconnect()
    process.exit(1)
  })
