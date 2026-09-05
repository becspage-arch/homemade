/**
 * xs-dedupe-scan — find every duplicate and near-duplicate in the PUBLIC
 * cross-stitch catalogue, work out what produced each one, and propose a cull.
 *
 * READ-ONLY: it never writes to the database. It reads Pattern rows, downloads the
 * published thumbnails from R2 into a local cache, fingerprints both the render and
 * the stitched chart (see `src/lib/studio/generation/bulk/similarity.ts`), compares
 * every pair, and writes its findings as files.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-dedupe-scan.ts --out <dir> [--phase P]
 *
 * Phases (default `all`), each cached on disk so a re-run is cheap:
 *   fetch    Pattern metadata + chart fingerprints (paged; caches chart/<id>.json)
 *   thumbs   download thumbnails to thumbs/<id>.png (concurrency 8)
 *   hash     sha256 + dHash-64 + dHash-256 of every thumbnail  -> fingerprints.json
 *   cluster  all-pairs verdict -> clusters.json, distances.csv, cull-plan.json
 *   sheets   per-cluster contact sheets -> pairs/NNN.png, overview-closest-24.png
 *   calib    boundary contact sheets for threshold calibration -> calib/*.png
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { prisma, Visibility, type PatternData } from '@homemade/db'
import {
  chartDistance,
  chartFingerprint,
  hammingHex,
  imageHash,
  nearDuplicateVerdict,
  paletteJaccard,
  sha256Hex,
  T1_DHASH64,
  T2_DHASH256,
  T3_CHART,
  T4_PALETTE,
  type ChartFingerprint,
  type PatternFingerprint,
} from '@/lib/studio/generation/bulk/similarity'

// ───────────────────────────────── types + CLI ─────────────────────────────────

interface PatternRow {
  id: string
  slug: string
  name: string
  shelf: string
  colourCount: number
  widthCells: number
  heightCells: number
  totalStitches: number
  publishedAt: string
  createdAt: string
  r2Key: string
}

interface ChartRecord {
  chart: ChartFingerprint
  /** sha256 of the serialised Pattern.data — the "same chart data" test. */
  dataSha256: string
}

interface Fingerprint extends PatternRow, PatternFingerprint {
  dataSha256: string
}

interface PairMetrics {
  a: string
  b: string
  dhash64: number
  dhash256: number
  chart: number
  palette: number
  sameFile: boolean
  sameData: boolean
  reason: string
}

type MechanismClass =
  | 'identical-file'
  | 'same-data-rerendered'
  | 'same-source-reconverted'
  | 'same-brief-rerolled'
  | 'same-subject-different-design'

interface ClusterMember {
  id: string
  slug: string
  name: string
  shelf: string
  colours: number
  size: string
  widthCells: number
  heightCells: number
  totalStitches: number
  publishedAt: string
  createdAt: string
}

interface Cluster {
  index: number
  size: number
  /** How the group was found: matching artwork, or a repeated published name/brief. */
  joinedBy: 'image' | 'name'
  mechanism: MechanismClass
  /** Which generator minted these slugs — the code path the repeat came from. */
  origins: SlugOrigin[]
  shelves: string[]
  sameName: boolean
  sameSlugBase: boolean
  sameMinute: boolean
  closest: number
  members: ClusterMember[]
  pairs: PairMetrics[]
}

const args = process.argv.slice(2)
function flag(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1]! : fallback
}
const OUT = resolve(flag('out', resolve(process.cwd(), '../../.xs-dedupe')))
const PHASE = flag('phase', 'all')
const MAX_SHEETS = Number(flag('max-sheets', '80'))
const dir = (...p: string[]): string => resolve(OUT, ...p)
const ensure = (p: string): string => (mkdirSync(p, { recursive: true }), p)
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T
const writeJson = (p: string, v: unknown): void => writeFileSync(p, JSON.stringify(v, null, 2))
const run = (phase: string): boolean => PHASE === 'all' || PHASE === phase

// ─────────────────────────────── phase: fetch ───────────────────────────────

/** Page through the shelf, fingerprinting each chart as it lands so `data` is never all in memory. */
async function phaseFetch(): Promise<PatternRow[]> {
  ensure(dir('chart'))
  const rows = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH', visibility: Visibility.PUBLIC },
    orderBy: { id: 'asc' },
    select: {
      id: true, slug: true, name: true, colourCount: true, widthCells: true, heightCells: true,
      totalStitches: true, publishedAt: true, createdAt: true,
      subCategory: { select: { slug: true } },
      thumbnail: { select: { r2Key: true } },
    },
  })
  const meta: PatternRow[] = rows
    .filter((r) => r.thumbnail?.r2Key)
    .map((r) => ({
      id: r.id,
      slug: r.slug ?? r.id,
      name: r.name,
      shelf: r.subCategory?.slug ?? '(none)',
      colourCount: r.colourCount,
      widthCells: r.widthCells,
      heightCells: r.heightCells,
      totalStitches: r.totalStitches,
      publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
      createdAt: r.createdAt.toISOString(),
      r2Key: r.thumbnail!.r2Key!,
    }))
  writeJson(dir('meta.json'), meta)
  console.log(`[fetch] ${meta.length} public cross-stitch patterns (${rows.length - meta.length} without a thumbnail)`)

  const todo = meta.filter((m) => !existsSync(dir('chart', `${m.id}.json`)))
  console.log(`[fetch] chart fingerprints needed: ${todo.length}`)
  const PAGE = 12
  for (let i = 0; i < todo.length; i += PAGE) {
    const ids = todo.slice(i, i + PAGE).map((m) => m.id)
    const page = await prisma.pattern.findMany({ where: { id: { in: ids } }, select: { id: true, data: true } })
    for (const p of page) {
      const data = p.data as unknown as PatternData
      const rec: ChartRecord = {
        chart: chartFingerprint(data),
        dataSha256: sha256Hex(Buffer.from(JSON.stringify(data))),
      }
      writeJson(dir('chart', `${p.id}.json`), rec)
    }
    if (i % (PAGE * 10) === 0) console.log(`[fetch] charts ${Math.min(i + PAGE, todo.length)}/${todo.length}`)
  }
  return meta
}

// ─────────────────────────────── phase: thumbs ───────────────────────────────

async function phaseThumbs(meta: PatternRow[]): Promise<void> {
  ensure(dir('thumbs'))
  const base = process.env.R2_PUBLIC_BASE_URL
  if (!base) throw new Error('R2_PUBLIC_BASE_URL not set')
  const todo = meta.filter((m) => !existsSync(dir('thumbs', `${m.id}.png`)))
  console.log(`[thumbs] downloading ${todo.length} (cached ${meta.length - todo.length})`)
  let done = 0
  const CONCURRENCY = 8
  const workers = Array.from({ length: CONCURRENCY }, async (_unused, w) => {
    for (let i = w; i < todo.length; i += CONCURRENCY) {
      const m = todo[i]!
      const url = `${base.replace(/\/$/, '')}/${m.r2Key}`
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          writeFileSync(dir('thumbs', `${m.id}.png`), Buffer.from(await res.arrayBuffer()))
          break
        } catch (e) {
          if (attempt === 2) console.log(`[thumbs] FAILED ${m.slug}: ${e instanceof Error ? e.message : String(e)}`)
          else await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        }
      }
      if (++done % 100 === 0) console.log(`[thumbs] ${done}/${todo.length}`)
    }
  })
  await Promise.all(workers)
}

// ──────────────────────────────── phase: hash ────────────────────────────────

async function phaseHash(meta: PatternRow[]): Promise<Fingerprint[]> {
  const out: Fingerprint[] = []
  for (const [i, m] of meta.entries()) {
    const png = dir('thumbs', `${m.id}.png`)
    const chartFile = dir('chart', `${m.id}.json`)
    if (!existsSync(png) || !existsSync(chartFile)) {
      console.log(`[hash] skipping ${m.slug} — missing ${existsSync(png) ? 'chart' : 'thumbnail'}`)
      continue
    }
    const buf = readFileSync(png)
    const rec = readJson<ChartRecord>(chartFile)
    out.push({ ...m, sha256: sha256Hex(buf), ...(await imageHash(buf)), chart: rec.chart, dataSha256: rec.dataSha256 })
    if ((i + 1) % 200 === 0) console.log(`[hash] ${i + 1}/${meta.length}`)
  }
  writeJson(dir('fingerprints.json'), out)
  console.log(`[hash] ${out.length} fingerprints -> fingerprints.json`)
  return out
}

// ─────────────────────────────── phase: cluster ───────────────────────────────

const slugBase = (slug: string): string => slug.replace(/-[a-z0-9]{4}$/, '')
const minuteOf = (iso: string): string => iso.slice(0, 16)

/** Decode every chart grid once so the all-pairs loop is a flat typed-array compare. */
function decodeGrids(fps: Fingerprint[]): { grids: Uint8Array; stride: number } {
  const stride = Buffer.from(fps[0]!.chart.grid, 'hex').length
  const grids = new Uint8Array(fps.length * stride)
  fps.forEach((f, i) => grids.set(Buffer.from(f.chart.grid, 'hex'), i * stride))
  return { grids, stride }
}

/** Palettes as bitsets over the catalogue-wide floss code index, for fast Jaccard. */
function encodePalettes(fps: Fingerprint[]): { bits: Uint32Array; words: number; sizes: Uint16Array } {
  const index = new Map<string, number>()
  for (const f of fps) for (const c of f.chart.palette) if (!index.has(c)) index.set(c, index.size)
  const words = Math.ceil(index.size / 32)
  const bits = new Uint32Array(fps.length * words)
  const sizes = new Uint16Array(fps.length)
  fps.forEach((f, i) => {
    const codes = new Set(f.chart.palette)
    sizes[i] = codes.size
    for (const c of codes) {
      const b = index.get(c)!
      bits[i * words + (b >> 5)]! |= 1 << (b & 31)
    }
  })
  return { bits, words, sizes }
}

function popcount(n: number): number {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24
}

interface ScanResult {
  duplicates: PairMetrics[]
  /** Closest pairs on each metric, for the distribution CSV. */
  closest: Record<'dhash64' | 'dhash256' | 'chart', PairMetrics[]>
}

function scanAllPairs(fps: Fingerprint[], keep = 400): ScanResult {
  const { grids, stride } = decodeGrids(fps)
  const { bits, words } = encodePalettes(fps)
  const duplicates: PairMetrics[] = []
  const byD64: PairMetrics[] = []
  const byD256: PairMetrics[] = []
  const byChart: PairMetrics[] = []
  const n = fps.length

  for (let i = 0; i < n; i++) {
    const A = fps[i]!
    for (let j = i + 1; j < n; j++) {
      const B = fps[j]!
      const d64 = hammingHex(A.dhash64, B.dhash64)
      const d256 = hammingHex(A.dhash256, B.dhash256)
      let chart = 0
      const oa = i * stride
      const ob = j * stride
      for (let k = 0; k < stride; k++) chart += Math.abs(grids[oa + k]! - grids[ob + k]!)
      chart /= stride * 255
      let inter = 0
      let union = 0
      for (let w = 0; w < words; w++) {
        const x = bits[i * words + w]!
        const y = bits[j * words + w]!
        inter += popcount(x & y)
        union += popcount(x | y)
      }
      const palette = union === 0 ? 1 : inter / union
      const sameFile = A.sha256 === B.sha256
      const verdict = nearDuplicateVerdict(A, B)
      const pm: PairMetrics = {
        a: A.slug, b: B.slug, dhash64: d64, dhash256: d256, chart, palette,
        sameFile, sameData: A.dataSha256 === B.dataSha256, reason: verdict.reason,
      }
      if (verdict.duplicate) duplicates.push(pm)
      // Cheap bounded top-K: only consider pairs already inside a wide net.
      if (d64 <= 20) byD64.push(pm)
      if (d256 <= 84) byD256.push(pm)
      if (chart <= 0.14) byChart.push(pm)
    }
    if ((i + 1) % 200 === 0) console.log(`[cluster] rows ${i + 1}/${n}`)
  }
  const trim = (arr: PairMetrics[], key: (p: PairMetrics) => number): PairMetrics[] =>
    arr.sort((x, y) => key(x) - key(y)).slice(0, keep)
  return {
    duplicates,
    closest: {
      dhash64: trim(byD64, (p) => p.dhash64),
      dhash256: trim(byD256, (p) => p.dhash256),
      chart: trim(byChart, (p) => p.chart),
    },
  }
}

/**
 * Which generator minted a slug — the two publish paths leave different shapes.
 *  · `local-batch`   the retired PC routine (xs-volume-gen/publish): hand-written
 *    stems, prefixed with the batch (`b07051722-`, `apk-`, `p-`).
 *  · `server-planner` the Inngest bulk job: `<themeId>-<subject words>-<4 random chars>`.
 */
type SlugOrigin = 'local-batch' | 'server-planner'
function slugOrigin(slug: string): SlugOrigin {
  if (/^(b\d{8}|ap[a-z]|[a-z])-/.test(slug)) return 'local-batch'
  return /-[a-z0-9]{4}$/.test(slug) ? 'server-planner' : 'local-batch'
}

/** Normalised published name — the brief-level repeat key. */
const normName = (n: string): string => n.trim().toLowerCase().replace(/\s+/g, ' ')

/** Every metric for one pair, for groups not found by the all-pairs verdict. */
function metricsFor(a: Fingerprint, b: Fingerprint): PairMetrics {
  const verdict = nearDuplicateVerdict(a, b)
  return {
    a: a.slug, b: b.slug,
    dhash64: hammingHex(a.dhash64, b.dhash64),
    dhash256: hammingHex(a.dhash256, b.dhash256),
    chart: chartDistance(a.chart, b.chart),
    palette: paletteJaccard(a.chart, b.chart),
    sameFile: a.sha256 === b.sha256,
    sameData: a.dataSha256 === b.dataSha256,
    reason: verdict.reason,
  }
}

function classify(members: Fingerprint[], pairs: PairMetrics[]): MechanismClass {
  if (pairs.some((p) => p.sameFile)) return 'identical-file'
  if (pairs.some((p) => p.sameData)) return 'same-data-rerendered'
  // The same source art re-converted: the picture matches at the coarse hash, or the
  // charts match on an essentially IDENTICAL floss palette — which two independent
  // stochastic rolls never produce. One conversion, published twice.
  if (pairs.some((p) => p.dhash64 <= T1_DHASH64 || (p.chart <= T3_CHART && p.palette >= 0.9))) {
    return 'same-source-reconverted'
  }
  // No shared source: the repeat is at the BRIEF level. A slug minted by the server
  // planner means the planner re-emitted a curated pool subject; the retired local
  // routine re-composing its own brief stem is the same brief rolled again.
  const names = new Set(members.map((m) => normName(m.name)))
  const bases = new Set(members.map((m) => slugBase(m.slug)))
  if (members.some((m) => slugOrigin(m.slug) === 'server-planner')) return 'same-subject-different-design'
  if (names.size === 1 || bases.size === 1) return 'same-brief-rerolled'
  return 'same-subject-different-design'
}

function buildClusters(fps: Fingerprint[], dupes: PairMetrics[]): Cluster[] {
  const bySlug = new Map(fps.map((f) => [f.slug, f]))
  const parent = new Map<string, string>(fps.map((f) => [f.slug, f.slug]))
  const find = (x: string): string => {
    let r = x
    while (parent.get(r) !== r) r = parent.get(r)!
    while (parent.get(x) !== r) { const nx = parent.get(x)!; parent.set(x, r); x = nx }
    return r
  }
  for (const p of dupes) {
    const ra = find(p.a)
    const rb = find(p.b)
    if (ra !== rb) parent.set(ra, rb)
  }
  const groups = new Map<string, string[]>()
  for (const f of fps) {
    const r = find(f.slug)
    if (!groups.has(r)) groups.set(r, [])
    groups.get(r)!.push(f.slug)
  }
  const clusters: Cluster[] = []
  for (const slugs of groups.values()) {
    if (slugs.length < 2) continue
    const set = new Set(slugs)
    const members = slugs.map((s) => bySlug.get(s)!).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
    const pairs = dupes.filter((p) => set.has(p.a) && set.has(p.b))
    clusters.push({
      index: 0,
      size: members.length,
      joinedBy: 'image',
      mechanism: classify(members, pairs),
      origins: [...new Set(members.map((m) => slugOrigin(m.slug)))].sort(),
      shelves: [...new Set(members.map((m) => m.shelf))].sort(),
      sameName: new Set(members.map((m) => m.name.toLowerCase())).size === 1,
      sameSlugBase: new Set(members.map((m) => slugBase(m.slug))).size === 1,
      sameMinute: new Set(members.map((m) => minuteOf(m.publishedAt))).size === 1,
      closest: Math.min(...pairs.map((p) => p.chart)),
      members: members.map((m) => ({
        id: m.id, slug: m.slug, name: m.name, shelf: m.shelf, colours: m.colourCount,
        size: `${m.widthCells}x${m.heightCells}`, widthCells: m.widthCells, heightCells: m.heightCells,
        totalStitches: m.totalStitches, publishedAt: m.publishedAt, createdAt: m.createdAt,
      })),
      pairs,
    })
  }
  clusters.sort((a, b) => b.size - a.size || a.closest - b.closest)
  clusters.forEach((c, i) => { c.index = i + 1 })
  return clusters
}

/**
 * Brief-level repeats: rows that shipped under the SAME published name. The artwork
 * differs (a fresh stochastic roll every time) so the pixel metrics never join them,
 * but the shelf reads as a duplicate — five "Japanese Garden" scenes in a row. Groups
 * already covered by an image cluster are skipped.
 */
function buildNameClusters(fps: Fingerprint[], imageClusters: Cluster[], startIndex: number): Cluster[] {
  const covered = new Set(imageClusters.flatMap((c) => c.members.map((m) => m.slug)))
  const groups = new Map<string, Fingerprint[]>()
  for (const f of fps) {
    const k = normName(f.name)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(f)
  }
  const out: Cluster[] = []
  for (const members of groups.values()) {
    if (members.length < 2) continue
    if (members.every((m) => covered.has(m.slug))) continue
    members.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
    const pairs: PairMetrics[] = []
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) pairs.push(metricsFor(members[i]!, members[j]!))
    }
    out.push({
      index: 0,
      size: members.length,
      joinedBy: 'name',
      mechanism: classify(members, pairs),
      origins: [...new Set(members.map((m) => slugOrigin(m.slug)))].sort(),
      shelves: [...new Set(members.map((m) => m.shelf))].sort(),
      sameName: true,
      sameSlugBase: new Set(members.map((m) => slugBase(m.slug))).size === 1,
      sameMinute: new Set(members.map((m) => minuteOf(m.publishedAt))).size === 1,
      closest: Math.min(...pairs.map((p) => p.chart)),
      members: members.map((m) => ({
        id: m.id, slug: m.slug, name: m.name, shelf: m.shelf, colours: m.colourCount,
        size: `${m.widthCells}x${m.heightCells}`, widthCells: m.widthCells, heightCells: m.heightCells,
        totalStitches: m.totalStitches, publishedAt: m.publishedAt, createdAt: m.createdAt,
      })),
      pairs,
    })
  }
  out.sort((a, b) => b.size - a.size || a.closest - b.closest)
  out.forEach((c, i) => { c.index = startIndex + i })
  return out
}

interface CullEntry {
  cluster: number
  joinedBy: 'image' | 'name'
  mechanism: MechanismClass
  keep: string
  cull: string[]
  reason: string
}

function buildCullPlan(clusters: Cluster[]): CullEntry[] {
  return clusters.map((c) => {
    // Prefer the richer chart: more floss colours, then more stitched area, then the
    // one published first (the original of the pair rather than the repeat).
    const ranked = [...c.members].sort(
      (a, b) =>
        b.colours - a.colours ||
        b.widthCells * b.heightCells - a.widthCells * a.heightCells ||
        b.totalStitches - a.totalStitches ||
        a.publishedAt.localeCompare(b.publishedAt),
    )
    const keep = ranked[0]!
    const rest = ranked.slice(1)
    const sameSpec = rest.every((m) => m.colours === keep.colours && m.widthCells === keep.widthCells && m.heightCells === keep.heightCells)
    const reason = sameSpec
      ? `identical spec (${keep.colours} colours, ${keep.size}) — keeping the first published, ${c.mechanism}`
      : `richest chart: ${keep.colours} colours at ${keep.size} vs ${rest.map((m) => `${m.colours}@${m.size}`).join(', ')} — ${c.mechanism}`
    return { cluster: c.index, joinedBy: c.joinedBy, mechanism: c.mechanism, keep: keep.slug, cull: rest.map((m) => m.slug), reason }
  })
}

async function phaseCluster(fps: Fingerprint[]): Promise<Cluster[]> {
  console.log(`[cluster] all-pairs over ${fps.length} patterns (${((fps.length * (fps.length - 1)) / 2).toLocaleString('en-GB')} pairs)`)
  const t0 = Date.now()
  const { duplicates, closest } = scanAllPairs(fps)
  console.log(`[cluster] ${duplicates.length} duplicate pairs in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  const imageClusters = buildClusters(fps, duplicates)
  const nameClusters = buildNameClusters(fps, imageClusters, imageClusters.length + 1)
  const clusters = [...imageClusters, ...nameClusters]
  console.log(`[cluster] ${imageClusters.length} image clusters, ${nameClusters.length} repeated-name clusters`)
  writeJson(dir('clusters.json'), {
    generatedAt: new Date().toISOString(),
    thresholds: { T1_DHASH64, T2_DHASH256, T3_CHART, T4_PALETTE },
    patterns: fps.length,
    duplicatePairs: duplicates.length,
    clusters: clusters.length,
    imageClusters: imageClusters.length,
    nameClusters: nameClusters.length,
    patternsInClusters: clusters.reduce((n, c) => n + c.size, 0),
    byMechanism: countBy(clusters.map((c) => c.mechanism)),
    byOrigin: countBy(clusters.flatMap((c) => c.members.map((m) => slugOrigin(m.slug)))),
    byShelf: countBy(clusters.flatMap((c) => c.members.map((m) => m.shelf))),
    list: clusters,
  })
  writeJson(dir('cull-plan.json'), {
    generatedAt: new Date().toISOString(),
    note: 'Proposal only — this scan performs no database writes.',
    keep: clusters.length,
    cull: clusters.reduce((n, c) => n + c.size - 1, 0),
    entries: buildCullPlan(clusters),
  })
  const csv = ['metric,a,b,dhash64,dhash256,chart,palette,sameFile,sameData']
  for (const [metric, list] of Object.entries(closest)) {
    for (const p of list) {
      csv.push(`${metric},${p.a},${p.b},${p.dhash64},${p.dhash256},${p.chart.toFixed(5)},${p.palette.toFixed(3)},${p.sameFile},${p.sameData}`)
    }
  }
  writeFileSync(dir('distances.csv'), csv.join('\n'))
  console.log(`[cluster] ${clusters.length} clusters covering ${clusters.reduce((n, c) => n + c.size, 0)} patterns -> clusters.json`)
  return clusters
}

function countBy(values: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of values) out[v] = (out[v] ?? 0) + 1
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]))
}

// ─────────────────────────────── phase: sheets ───────────────────────────────

const TILE = 460
const BAND = 46

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function labelBand(text: string, width: number, height = BAND, fontSize = 12): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#1c1c1c"/>
    <text x="8" y="${Math.round(height * 0.65)}" font-family="DejaVu Sans, sans-serif" font-size="${fontSize}" fill="#f2f2f2">${escapeXml(text)}</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

interface SheetItem {
  id: string
  label: string
}

/** One row of thumbnails with a caption band under each. */
async function contactSheet(items: SheetItem[], header: string, outPath: string, tile = TILE): Promise<void> {
  const cells = await Promise.all(
    items.map(async (it) => {
      const png = dir('thumbs', `${it.id}.png`)
      const img = existsSync(png)
        ? await sharp(readFileSync(png)).resize(tile, tile, { fit: 'contain', background: '#ffffff' }).png().toBuffer()
        : await sharp({ create: { width: tile, height: tile, channels: 3, background: '#dddddd' } }).png().toBuffer()
      const band = await labelBand(it.label, tile)
      return sharp({ create: { width: tile, height: tile + BAND, channels: 3, background: '#ffffff' } })
        .composite([{ input: img, top: 0, left: 0 }, { input: band, top: tile, left: 0 }])
        .png()
        .toBuffer()
    }),
  )
  const headerH = 34
  const width = tile * cells.length
  const canvas = sharp({ create: { width, height: headerH + tile + BAND, channels: 3, background: '#ffffff' } })
  const head = await labelBand(header, width, headerH, 17)
  await canvas
    .composite([
      { input: head, top: 0, left: 0 },
      ...cells.map((c, i) => ({ input: c, top: headerH, left: i * tile })),
    ])
    .png()
    .toFile(outPath)
}

function memberLabel(m: ClusterMember): string {
  return `${m.slug} | ${m.shelf} | ${m.colours} col | ${m.size} | ${m.publishedAt.slice(0, 10)} ${m.publishedAt.slice(11, 16)}`
}

async function phaseSheets(clusters: Cluster[]): Promise<void> {
  ensure(dir('pairs'))
  const shown = clusters.slice(0, MAX_SHEETS)
  for (const c of shown) {
    const header = `#${String(c.index).padStart(3, '0')} · joined by ${c.joinedBy} · ${c.mechanism} · ${c.size} patterns · closest chart ${c.closest.toFixed(4)} · shelves ${c.shelves.join('/')}`
    await contactSheet(
      c.members.slice(0, 6).map((m) => ({ id: m.id, label: memberLabel(m) })),
      header,
      dir('pairs', `${String(c.index).padStart(3, '0')}.png`),
    )
  }
  console.log(`[sheets] ${shown.length} cluster sheets -> pairs/`)

  // Overview: the 24 closest clusters as small side-by-side tiles, 4 across.
  const tile = 210
  const top = clusters.slice().sort((a, b) => a.closest - b.closest).slice(0, 24)
  const rowsOf: Buffer[] = []
  for (const c of top) {
    const pair = c.members.slice(0, 2)
    const imgs = await Promise.all(
      pair.map(async (m) => {
        const p = dir('thumbs', `${m.id}.png`)
        return existsSync(p)
          ? sharp(readFileSync(p)).resize(tile, tile, { fit: 'contain', background: '#ffffff' }).png().toBuffer()
          : sharp({ create: { width: tile, height: tile, channels: 3, background: '#dddddd' } }).png().toBuffer()
      }),
    )
    const band = await labelBand(`#${c.index} ${c.mechanism} ${c.closest.toFixed(3)} · ${pair.map((m) => m.slug).join(' / ')}`.slice(0, 74), tile * 2, 30, 12)
    rowsOf.push(
      await sharp({ create: { width: tile * 2, height: tile + 30, channels: 3, background: '#ffffff' } })
        .composite([...imgs.map((b, i) => ({ input: b, top: 0, left: i * tile })), { input: band, top: tile, left: 0 }])
        .png()
        .toBuffer(),
    )
  }
  const cols = 4
  const cellW = tile * 2
  const cellH = tile + 30
  const rows = Math.ceil(rowsOf.length / cols)
  await sharp({ create: { width: cols * cellW, height: rows * cellH, channels: 3, background: '#ffffff' } })
    .composite(rowsOf.map((b, i) => ({ input: b, top: Math.floor(i / cols) * cellH, left: (i % cols) * cellW })))
    .png()
    .toFile(dir('overview-closest-24.png'))
  console.log('[sheets] overview-closest-24.png')
}

// ─────────────────────────────── phase: calib ───────────────────────────────

/**
 * Contact sheets of the pairs sitting either side of each threshold, so the numbers
 * can be set by LOOKING rather than by taste. Reads distances.csv.
 */
async function phaseCalib(fps: Fingerprint[]): Promise<void> {
  ensure(dir('calib'))
  const bySlug = new Map(fps.map((f) => [f.slug, f]))
  const lines = readFileSync(dir('distances.csv'), 'utf8').trim().split('\n').slice(1)
  const rows = lines.map((l) => {
    const [metric, a, b, d64, d256, chart, palette] = l.split(',')
    return { metric: metric!, a: a!, b: b!, d64: Number(d64), d256: Number(d256), chart: Number(chart), palette: Number(palette) }
  })
  const metrics: { key: string; of: (r: (typeof rows)[number]) => number; fmt: (r: (typeof rows)[number]) => string }[] = [
    { key: 'dhash64', of: (r) => r.d64, fmt: (r) => `d64 ${r.d64}` },
    { key: 'dhash256', of: (r) => r.d256, fmt: (r) => `d256 ${r.d256}` },
    { key: 'chart', of: (r) => r.chart, fmt: (r) => `chart ${r.chart.toFixed(4)} pal ${r.palette.toFixed(2)}` },
  ]
  for (const m of metrics) {
    const set = rows.filter((r) => r.metric === m.key).sort((x, y) => m.of(x) - m.of(y))
    // ~20 evenly spread across the whole range so both sides of any candidate
    // boundary are visible in one pass.
    const step = Math.max(1, Math.floor(set.length / 20))
    const picks = set.filter((_r, i) => i % step === 0).slice(0, 20)
    for (const [i, r] of picks.entries()) {
      const A = bySlug.get(r.a)
      const B = bySlug.get(r.b)
      if (!A || !B) continue
      await contactSheet(
        [A, B].map((f) => ({ id: f.id, label: `${f.slug} | ${f.shelf} | ${f.colourCount} col | ${f.widthCells}x${f.heightCells}` })),
        `${m.key} rank ${i + 1}/20 · ${m.fmt(r)}`,
        dir('calib', `${m.key}-${String(i).padStart(2, '0')}-${String(Math.round(m.of(r) * (m.key === 'chart' ? 10000 : 1))).padStart(5, '0')}.png`),
        360,
      )
    }
    console.log(`[calib] ${picks.length} sheets for ${m.key}`)
  }
}

// ──────────────────────────────────── main ────────────────────────────────────

async function main(): Promise<void> {
  ensure(OUT)
  console.log(`[xs-dedupe] out=${OUT} phase=${PHASE}`)
  let meta: PatternRow[] = existsSync(dir('meta.json')) ? readJson<PatternRow[]>(dir('meta.json')) : []
  if (run('fetch') || meta.length === 0) meta = await phaseFetch()
  if (run('thumbs')) await phaseThumbs(meta)

  let fps: Fingerprint[] = existsSync(dir('fingerprints.json')) ? readJson<Fingerprint[]>(dir('fingerprints.json')) : []
  const needsFps = run('cluster') || run('sheets') || PHASE === 'calib'
  if (run('hash') || (needsFps && fps.length === 0)) fps = await phaseHash(meta)

  let clusters: Cluster[] = []
  if (run('cluster')) clusters = await phaseCluster(fps)
  else if (existsSync(dir('clusters.json'))) clusters = readJson<{ list: Cluster[] }>(dir('clusters.json')).list

  if (run('sheets')) await phaseSheets(clusters)
  if (PHASE === 'calib') await phaseCalib(fps)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('[xs-dedupe] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
