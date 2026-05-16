# Perf snapshot — 2026-05-16

Follow-up to `perf-audit-001.md`. Captures the current bundle picture
after the homepage rebuild, admin overhaul, analytics rebuild, and
mobile rebuild landed, so future regressions have a baseline.

## What changed since the audit

- ECS service moved from `desiredCount: 1` to `2` (audit issue #8 —
  cold-start downtime on single-task crash).
- Cache-Control headers are firing on static-shaped pages
  (`x-nextjs-cache: HIT` on `/legal/*`, `/coming-soon`); `cf-cache-status`
  is `DYNAMIC` because no Cloudflare cache rule yet for HTML — that
  belongs to the deferred edge-caching workstream.
- Tutorial-page server crash on every RECIPE (extractor cross-boundary
  bug) fixed.

## Bundle picture

Build mode: Next 16 Turbopack production build. Turbopack doesn't print
the per-route "First Load JS" table the way the webpack builder did, so
sizes below are measured from the on-disk `.next/` output. Roughly
comparable to "Server bundle including dependencies" — useful for spotting
drift over time, not directly comparable to the old webpack First Load
column.

### Static client chunks

| Size | Chunk contents |
| ---: | --- |
| 381 K | unidentified — likely framework + Clerk bundles |
| 348 K × 2 | Recharts (admin analytics only) |
| 209 K | Sentry runtime |
| 205 K | unidentified |
| 186 K | — |
| 154 K | — |
| Total | 3.1 MB |

### Server bundles per route

Public routes:

| Size | Route |
| ---: | --- |
| 16 K | `/` (homepage) |
| 173 K | `/offline` |
| 177 K | `/search` |
| 350 K | `/makers` |
| 354 K | `/patterns` |
| 390 K | `/[categorySlug]` (category + tutorial pages) |
| 1.3 M | `/legal` (multi-route group) |
| 4.5 M | `/me` (signed-in account area, ~20 routes) |

Admin routes:

| Size | Route |
| ---: | --- |
| 173 K | `/admin/community` |
| 503 K | `/admin/creators`, `/admin/media` |
| 511 K | `/admin/glossary`, `/admin/sub-categories` |
| 515 K | `/admin/categories` |
| 676 K | `/admin/system` |
| 881 K | `/admin/tutorials` |
| 1.2 M | `/admin/users` |
| 1.4 M | `/admin/analytics` (Recharts) |

## Reading the picture

- **No public-route bloat.** Recharts is only imported by
  `apps/web/src/components/admin/analytics/{bar-rank,line-trend}.tsx`;
  it never reaches a public bundle. Sentry sits in shared chunks but
  hydrates lazily.
- **The two 348 K Recharts chunks** look like turbopack splitting
  server-side and client-side instances rather than a duplicate import.
  Worth a closer look if admin/analytics ever feels slow, but not a
  regression today.
- **`/me` totalling 4.5 M** is across 20-ish sub-routes (creator + tester
  + projects + photos + reviews); per-route weight is modest.

## What was rejected

- No code-split changes shipped. The brief said to fix anything that grew
  the public First Load > 200 K in the last week; nothing in the public
  surface tree is over that ceiling in a way that's traceable to the
  recent ships.
- No webpack-mode fallback build run to get the legacy size table — kept
  the build matrix simple.

## Watch list for next time

- If `/[categorySlug]` server bundle creeps past 600 K, look at whether
  the cooking-mode shell or any TipTap utility is being pulled in
  eagerly (it should be a dynamic import inside a `'use client'` leaf).
- If a second copy of recharts shows up in the public-route output, the
  analytics chunks have leaked.
- Cloudflare cache rules for `/legal/*` and `/coming-soon` would shift
  the cache-hit accounting from `x-nextjs-cache` to `cf-cache-status`
  and drop the ALB round-trip for cold readers — pick this up with the
  edge-caching workstream.
