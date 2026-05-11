import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Trace files from the monorepo root, not just apps/web — needed for pnpm workspaces.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
}

export default nextConfig
