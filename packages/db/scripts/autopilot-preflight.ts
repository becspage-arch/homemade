import { config as loadEnv } from 'dotenv';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
{
  let dir = __dirname;
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials');
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break; }
    const p = dirname(dir); if (p === dir) break; dir = p;
  }
}

const COUNTED_NEEDLEWORK = new Set(['blackwork', 'needlepoint', 'hardanger', 'sashiko']);
const QUEUE_PATH = resolve(__dirname, '..', 'docs', 'pattern-chart-backfill-queue.json');
const BLOCKED_QUEUE_PATH = resolve(__dirname, '..', 'docs', 'completeness-blocked-queue.json');

/**
 * Completeness-gate backlog scan. The publish path (`uploadTutorial`) blocks
 * any row that fails its per-category completeness check and holds it at DRAFT
 * with a structured `qcBlockReason`. This scan refreshes the worklist of those
 * blocked rows each preflight cycle so the qc-fix pass + the rebuild workers
 * have a current per-category list to drain. Cheap: it reads only the
 * qcBlockReason column (no body walking). Non-blocking — never publishes or
 * unpublishes. See packages/db/scripts/qc-completeness-rules/.
 */
async function blockedContentScan(): Promise<void> {
  const rows = await (prisma as any).tutorial.findMany({
    where: { status: 'DRAFT', qcBlockReason: { not: Prisma.DbNull } },
    select: {
      slug: true, type: true, qcBlockReason: true,
      category: { select: { slug: true } },
    },
  });
  const perCat: Record<string, number> = {};
  const items = rows.map((r: any) => {
    const cat = r.category?.slug ?? 'unknown';
    perCat[cat] = (perCat[cat] ?? 0) + 1;
    const reason = r.qcBlockReason as { reasons?: string[] } | null;
    return { slug: r.slug, category: cat, type: r.type, reasons: reason?.reasons ?? [] };
  });
  writeFileSync(BLOCKED_QUEUE_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    total: items.length, perCategory: perCat,
    items: items.sort((a: any, b: any) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug)),
  }, null, 2));
  console.log('COMPLETENESS_BLOCKED:', JSON.stringify({ total: items.length, perCategory: perCat }));
}

/**
 * Chart-gap QC (folded into the autopilot preflight so it self-heals every
 * cycle instead of needing a separate scheduled job — realises master-todo
 * §6.5 "PATTERN must have a chart"). Non-blocking: it never unpublishes or
 * halts; it just refreshes the chartless-PATTERN worklist the chart-backfill
 * worker drains.
 *
 *   crochet / knitting PATTERN  -> needs `chartDefinition`.
 *   needlework COUNTED PATTERN  -> needs `chartDefinition` OR a linked
 *     NeedleworkPattern with chartData (surface disciplines exempt).
 */
async function chartGapScan(): Promise<void> {
  const cats = await (prisma as any).category.findMany({
    where: { slug: { in: ['crochet', 'knitting', 'needlework'] } },
    select: { id: true, slug: true },
  });
  const queue: any[] = [];
  const perCat: Record<string, { patterns: number; missing: number }> = {};
  for (const cat of cats) {
    const rows = await (prisma as any).tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED', type: 'PATTERN' },
      select: {
        slug: true, title: true, projectShape: true, chartDefinition: true,
        subCategory: { select: { slug: true } },
        crochetPattern: { select: { chartData: true } },
        needleworkPattern: { select: { chartData: true } },
      },
    });
    perCat[cat.slug] = { patterns: rows.length, missing: 0 };
    for (const r of rows) {
      const sub = r.subCategory?.slug ?? null;
      const hasChart = r.chartDefinition != null
        || r.crochetPattern?.chartData != null
        || r.needleworkPattern?.chartData != null;
      if (cat.slug === 'needlework' && (!sub || !COUNTED_NEEDLEWORK.has(sub))) continue;
      if (hasChart) continue;
      queue.push({
        slug: r.slug ?? r.title, title: r.title, category: cat.slug,
        subCategory: sub, projectShape: r.projectShape,
        reason: cat.slug === 'needlework' ? 'no-counted-chart' : 'no-chartDefinition',
      });
      perCat[cat.slug]!.missing++;
    }
  }
  writeFileSync(QUEUE_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    total: queue.length, perCategory: perCat,
    items: queue.sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug)),
  }, null, 2));
  console.log('CHART_GAP:', JSON.stringify({ total: queue.length, perCategory: perCat }));
}

async function main() {
  try {
    // Check pause state
    let paused: any[] = [];
    try {
      paused = await (prisma as any).autopilotPauseState.findMany({
        where: { streamName: { in: ['queue', 'global'] }, pausedAt: { not: null } },
      });
    } catch (_e) {
      // Table may not exist yet
    }
    console.log('PAUSED_ROWS:', JSON.stringify(paused));

    // Round-robin pick
    const picked = await (prisma as any).category.findFirst({
      where: { pipelineStatus: 'READY' },
      orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
      include: {
        _count: {
          select: { tutorials: { where: { status: 'PUBLISHED' } } },
        },
      },
    });
    console.log('PICKED:', JSON.stringify(picked));

    // Count per pipelineStatus
    const statusCounts = await (prisma as any).category.groupBy({
      by: ['pipelineStatus'],
      _count: { id: true },
    });
    console.log('STATUS_COUNTS:', JSON.stringify(statusCounts));

    // Chart-gap QC — non-blocking; refreshes the chart-backfill worklist.
    try {
      await chartGapScan();
    } catch (e: any) {
      console.error('CHART_GAP_ERROR:', e?.message);
    }

    // Completeness-gate backlog — non-blocking; refreshes the worklist of
    // DRAFT rows held back by the completeness gate for the rebuild pass.
    try {
      await blockedContentScan();
    } catch (e: any) {
      console.error('COMPLETENESS_BLOCKED_ERROR:', e?.message);
    }
  } catch (e: any) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
