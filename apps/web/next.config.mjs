import path from 'node:path'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Trace files from the monorepo root, not just apps/web — needed for pnpm workspaces.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
}

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

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackOptions)
  : nextConfig
