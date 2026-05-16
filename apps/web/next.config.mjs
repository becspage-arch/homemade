import path from 'node:path'
import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Trace files from the monorepo root, not just apps/web — needed for pnpm workspaces.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  async headers() {
    return [
      {
        // Static-shaped pages: legal copy + the splash page. Safe to cache at
        // the edge for a day; revalidate every hour at the browser.
        source: '/legal/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/coming-soon',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Health endpoint — let monitors burst-cache briefly but don't let
        // Cloudflare hold a stale "ok" if the task goes away.
        source: '/healthz',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=10, must-revalidate' },
        ],
      },
    ]
  },
}

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === '1' })

// Sentry source-map upload is enabled only when SENTRY_AUTH_TOKEN is provided
// (i.e. on the CI build). Local dev builds skip the upload step.
const sentryWebpackOptions = {
  org: process.env.SENTRY_ORG_SLUG,
  project: process.env.SENTRY_PROJECT_SLUG,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  tunnelRoute: '/monitoring/sentry',
}

const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackOptions)
  : nextConfig

export default withBundleAnalyzer(finalConfig)
