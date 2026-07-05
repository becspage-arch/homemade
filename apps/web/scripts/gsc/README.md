# Google Search Console helper

Read-only Search Console access via the `homemade-seo` service account.

- **Key:** a service-account JSON at `.secrets/gsc-homemade.json` (repo root, GITIGNORED — never
  committed). Override the path with `GSC_KEY_PATH`.
- **Property:** domain property, `siteUrl = sc-domain:homemade.education`.
- **Scope:** `webmasters.readonly`.

## CLI (from apps/web)
```
npx tsx scripts/gsc/gsc.ts queries [days]   # top search queries
npx tsx scripts/gsc/gsc.ts pages   [days]   # top pages by clicks
npx tsx scripts/gsc/gsc.ts inspect <url>    # a URL's index status (indexed? 404? blocked?)
npx tsx scripts/gsc/gsc.ts sitemaps         # submitted sitemaps
```

## As a module
`import { searchAnalytics, inspectUrl, listSitemaps, GSC_SITE } from './gsc/gsc'`

Note: the aggregate "why pages aren't indexed" coverage report (the bulk 404 list) is UI-export
only — the API can't dump it. Use `inspect <url>` to check specific URLs.
